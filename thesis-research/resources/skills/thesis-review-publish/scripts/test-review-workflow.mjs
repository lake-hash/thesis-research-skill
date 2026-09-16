import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {newReviewStore,upsertReviewItem,reviewState,applyUserDecision,applyAgentReview,agentChecks,approvalReceipts,markPublished,mutateReviewFile,beginAgentReview,intakeMedia} from './review-workflow.mjs';
const candidate=()=>({id:'candidate:author:company',kind:'candidate',author:'Fixture author',body:'Synthetic reviewed text.',operation:'new_thesis',tickers:[{symbol:'TEST'}],sources:[{url:'https://example.invalid/source',text:'Synthetic source',text_sha256:'fixture'}],source_review:'passed',content_review:'passed',review_proof:{method:'Synthetic fixture only'},blockers:[]});
const ready=()=>upsertReviewItem(newReviewStore(),candidate());
const request=s=>({id:s.items[0].id,content_hash:s.items[0].content_hash,expected_revision:s.revision,decision:'approve'});
test('Only a complete candidate enters agent acceptance; legacy manual decisions remain available',()=>{
 const s=ready();assert.equal(reviewState(s.items[0]),'ready_for_agent_review');
 for(const change of [{kind:'recording'},{source_review:'pending'},{content_review:'pending'},{sources:[]},{tickers:[]},{review_proof:null},{blockers:[{reason:'Missing evidence'}]}]){
  const q=upsertReviewItem(newReviewStore(),{...candidate(),...change});assert.throws(()=>applyUserDecision(q,request(q)),/cannot|Only|Source work/);
 }
});
test('Approval is version-bound, durable and never implies publication',()=>{
 const s=applyUserDecision(ready(),request(ready()));assert.equal(reviewState(s.items[0]),'approved');assert.equal(s.items[0].publication,null);
 assert.equal(approvalReceipts(s)[0].publication_authorized,false);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'thesis-review-')),file=path.join(dir,'state.json');fs.writeFileSync(file,JSON.stringify(ready()));
 mutateReviewFile(file,x=>applyUserDecision(x,request(x)));assert.equal(reviewState(JSON.parse(fs.readFileSync(file)).items[0]),'approved');
});
test('Stale requests and source changes cannot reuse an approval',()=>{
 const original=ready(),approved=applyUserDecision(original,request(original));
 assert.throws(()=>applyUserDecision(approved,request(original)),/queue changed/);
 const changed=upsertReviewItem(approved,{...candidate(),body:'Revised text.'});assert.equal(reviewState(changed.items[0]),'ready_for_agent_review');assert.equal(changed.items[0].version,2);assert.equal(approvalReceipts(changed).length,0);assert(changed.history.some(h=>h.type==='superseded'&&h.item.approval));
 assert.throws(()=>applyUserDecision(changed,{...request(changed),content_hash:original.items[0].content_hash}),/content changed/);
});
test('Direct file changes cannot retain the old approval fingerprint',()=>{
 const s=ready();s.items[0].body='Changed without re-import';assert.throws(()=>applyUserDecision(s,request(s)),/Stored content changed/);
});
test('Revisions and rejection require an actionable note',()=>{
 const s=ready();assert.throws(()=>applyUserDecision(s,{...request(s),decision:'request_changes'}),/Explain/);
 const q=applyUserDecision(s,{...request(s),decision:'request_changes',note:'Explain the investment reason.'});assert.equal(reviewState(q.items[0]),'changes_requested');assert.equal(approvalReceipts(q).length,0);
});
test('Publication needs a receipt matching the current approved content',()=>{
 const s=ready();assert.throws(()=>markPublished(s,{id:s.items[0].id}),/approval/);
 const a=applyUserDecision(s,request(s));assert.throws(()=>markPublished(a,{id:a.items[0].id,content_hash:'old',url:'https://example.invalid/live',release_version:'v1'}),/match/);
 assert.equal(reviewState(markPublished(a,{id:a.items[0].id,content_hash:a.items[0].content_hash,url:'https://example.invalid/live',release_version:'v1'}).items[0]),'published');
});
test('Processing requires an active worker lease, not a pending label',()=>{
 const s=upsertReviewItem(newReviewStore(),{id:'source',kind:'recording',blockers:[],source_review:'pending'});assert.equal(reviewState(s.items[0]),'queued');
 const at='2026-09-15T12:00:00Z',running=beginAgentReview(s,'source','worker',at);assert.equal(reviewState(running.items[0],Date.parse(at)),'processing');assert.equal(reviewState(running.items[0],Date.parse(at)+11*60*1000),'queued');
});
test('Finishing an unchanged source attempt restores its blocker instead of leaving a phantom worker',()=>{
 const item={id:'source',kind:'recording',blockers:[{reason:'Needs audio'}],source_review:'pending'},s=upsertReviewItem(newReviewStore(),item);
 const running=beginAgentReview(s,'source','worker'),done=upsertReviewItem(running,item);assert.equal(reviewState(done.items[0]),'needs_evidence');assert.equal(done.items[0].worker,undefined);
});
test('Unavailable audio review records evidence needed and never asks the user to approve raw text',()=>{
 const bundle={sources:[{id:'asr',media:{transcript_origin:'asr',review:{status:'pending'}}}]};
 const item=intakeMedia(bundle,{recording:{id:'r',url:'https://example.invalid/episode'},capability_check:{audio_review_executor:'unavailable',checked_at:'2026-09-15'},attempts:[{action:'metadata checked',result:'done'}]});
 assert.equal(reviewState(item),'needs_evidence');assert.equal(item.blockers[0].owner,'agent');assert.equal(item.blockers[0].attempts.length,2);
});
test('Agent review enables authorized publication without fabricating a user decision',()=>{
 const s=ready(),review={...request(s),reviewer:'fixture-agent',method:'Source-first review',checks:Object.fromEntries(agentChecks.map(k=>[k,'pass'])),evidence_note:'Fixture source and candidate inspected.'};
 const a=applyAgentReview(s,review);assert.equal(reviewState(a.items[0]),'ready_to_publish');assert.equal(a.history.at(-1).type,'agent_review');assert.equal(a.items[0].approval.actor_type,'agent');
 assert.throws(()=>applyAgentReview(s,{...review,checks:{...review.checks,attribution:'fail'}}),/Every/);
 const receipt={id:a.items[0].id,content_hash:a.items[0].content_hash,url:'https://example.invalid/live',release_version:'v1'};
 assert.throws(()=>markPublished(a,receipt),/batch authorization/);
 assert.equal(reviewState(markPublished(a,{...receipt,authorization:{reference:'User request fixture',scope:'This batch'}}).items[0]),'published');
 const tampered=structuredClone(a);tampered.items[0].body='tampered';assert.equal(approvalReceipts(tampered).length,0);assert.throws(()=>markPublished(tampered,{...receipt,authorization:{reference:'request',scope:'batch'}}),/Stored content changed/);
 const changed=upsertReviewItem(a,{...candidate(),body:'New revision'});assert.equal(reviewState(changed.items[0]),'ready_for_agent_review');assert.equal(changed.items[0].approval,null);
});
test('Exhausted transcript fallback skips privately instead of waiting for manual approval',()=>{
 const bundle={sources:[{id:'asr',media:{transcript_origin:'asr',review:{status:'pending'}}}]};
 const config={recording:{id:'r',url:'https://example.invalid/episode'},fallback:{exhausted:true,reason:'Transcript speaker attribution remains unresolved'},attempts:[{action:'transcript_search',result:'Publisher and transcript provider searched'},{action:'transcript_review',result:'Only unattributed ASR available'}]};
 const item=intakeMedia(bundle,config);assert.equal(reviewState(item),'skipped');assert.deepEqual(item.blockers,[]);assert(item.skip_reason);assert.equal(approvalReceipts(upsertReviewItem(newReviewStore(),item)).length,0);
 assert.throws(()=>intakeMedia(bundle,{...config,attempts:[]}),/recorded transcript/);
});
