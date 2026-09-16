import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {buildPresentation} from '../../thesis-backfill/scripts/build-presentation.mjs';
import {validateMediaSource,mediaTextVerified} from '../../thesis-backfill/scripts/media-contract.mjs';

const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const fingerprint=v=>crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const need=(condition,message)=>{if(!condition)throw Error(message);};
const itemContent=item=>{const {approval,publication,worker,version,content_hash,updated_at,...content}=item;return content;};
const completeCandidate=i=>i.kind==='candidate'&&i.body?.trim()&&i.author?.trim()&&['new_thesis','thesis_update'].includes(i.operation)&&
 Array.isArray(i.tickers)&&i.tickers.length>0&&i.tickers.every(t=>t.symbol?.trim())&&Array.isArray(i.sources)&&i.sources.length>0&&
 i.sources.every(s=>s.url?.startsWith('https://')&&s.text?.trim())&&i.review_proof?.method?.trim();
export const newReviewStore=()=>({schema_version:'thesis-review-workspace/1.0',revision:0,items:[],history:[]});
export function reviewState(item,now=Date.now()){
 if(item.publication?.content_hash===item.content_hash&&item.publication?.url)return 'published';
 if(item.disposition==='skipped')return 'skipped';
 if(item.blockers?.length)return 'needs_evidence';
 if(item.approval?.content_hash===item.content_hash){
  if(item.approval.decision==='approve')return item.approval.actor_type==='agent'?'ready_to_publish':'approved';
  if(item.approval.decision==='request_changes')return 'changes_requested';
  if(item.approval.decision==='reject')return 'rejected';
 }
 if(completeCandidate(item)&&item.source_review==='passed'&&item.content_review==='passed')return 'ready_for_agent_review';
 if(item.worker?.status==='running'&&Date.parse(item.worker.lease_until)>now)return 'processing';
 return 'queued';
}
export function upsertReviewItem(store,item,at=new Date().toISOString()){
 need(item?.id&&['recording','candidate'].includes(item.kind),'Invalid review item');
 const next=structuredClone(store),index=next.items.findIndex(x=>x.id===item.id);
 const {approval,publication,worker,...content}=item;const hash=fingerprint(content),previous=next.items[index];
 if(previous?.content_hash===hash&&!previous.worker)return next;
 if(previous?.content_hash===hash&&previous.worker){
  next.history.push({type:'source_review_finished',item_id:item.id,at,worker:previous.worker});
  next.items[index]={...content,version:previous.version,content_hash:hash,approval:previous.approval,publication:previous.publication,updated_at:at};next.revision++;return next;
 }
 const version=(previous?.version||0)+1;
 const value={...content,version,content_hash:hash,approval:null,publication:null,updated_at:at};
 if(previous)next.history.push({type:'superseded',at,item:previous});
 if(index<0)next.items.push(value);else next.items[index]=value;
 next.revision++;return next;
}
export function applyUserDecision(store,{id,content_hash,expected_revision,decision,note=''},actor='local-user'){
 need(store.revision===expected_revision,'The queue changed. Reload before deciding.');
 need(['approve','request_changes','reject'].includes(decision),'Unknown decision');
 const next=structuredClone(store),item=next.items.find(x=>x.id===id);need(item,'Unknown candidate');
 need(item.kind==='candidate','Source work cannot be approved as a thesis');
 need(fingerprint(itemContent(item))===item.content_hash,'Stored content changed. Re-import and review the current version.');
 need(item.content_hash===content_hash,'The content changed. Review the current version.');
 need(reviewState(item)==='ready_for_agent_review','Only source-checked, reviewed candidates can be decided');
 if(decision!=='approve')need(note.trim(),'Explain the requested change or rejection');
 const receipt={id:crypto.randomUUID(),actor,decision,note:note.trim(),content_hash,version:item.version,at:new Date().toISOString()};
 item.approval=receipt;next.history.push({type:'user_decision',item_id:id,...receipt});next.revision++;return next;
}
export const agentChecks=['attribution','source_fidelity','context','chronology','company_grouping','ticker_binding','increment','plain_english'];
export function applyAgentReview(store,{id,content_hash,expected_revision,reviewer,method,checks,evidence_note}){
 need(reviewer?.trim()&&method?.trim()&&evidence_note?.trim(),'Agent review needs identity, method and evidence');
 need(agentChecks.every(k=>checks?.[k]==='pass'),'Every source and editorial check must pass');
 const next=applyUserDecision(store,{id,content_hash,expected_revision,decision:'approve',note:evidence_note},reviewer);
 const item=next.items.find(i=>i.id===id);
 Object.assign(item.approval,{actor_type:'agent',method,checks});
 Object.assign(next.history.at(-1),{type:'agent_review',actor_type:'agent',method,checks});
 return next;
}
export function markPublished(store,{id,content_hash,url,release_version,authorization}){
 const next=structuredClone(store),item=next.items.find(x=>x.id===id);need(item&&['approved','ready_to_publish'].includes(reviewState(item)),'Publication needs a current approval');
 if(reviewState(item)==='ready_to_publish')need(authorization?.scope?.trim()&&authorization?.reference?.trim(),'Agent-approved publication needs explicit batch authorization');
 need(fingerprint(itemContent(item))===item.content_hash,'Stored content changed after approval');
 need(item.content_hash===content_hash&&url?.startsWith('https://')&&release_version,'Publication receipt must match the approved version');
 item.publication={content_hash,url,release_version,...authorization?{authorization}:{},at:new Date().toISOString()};next.history.push({type:'publication',item_id:id,...item.publication});next.revision++;return next;
}
export function approvalReceipts(store){return store.items.filter(i=>['approved','ready_to_publish'].includes(reviewState(i))&&fingerprint(itemContent(i))===i.content_hash).map(i=>({candidate_id:i.id,content_hash:i.content_hash,version:i.version,approval:i.approval,publication_authorized:false}));}

export function intakeMedia(bundle,{recording,capability_check,attempts=[],fallback}){
 const sources=bundle.sources||[],pending=sources.filter(s=>{
  const errors=[];validateMediaSource(s,(ok,msg)=>{if(!ok)errors.push(msg);});
  return errors.length||s.media?.review?.status!=='verified'||!s.context_complete||(s.media?.transcript_origin==='asr'&&!mediaTextVerified(s));
 });
 const asr=pending.some(s=>s.media.transcript_origin==='asr');
 const blockers=[];
 if(asr&&capability_check?.audio_review_executor==='unavailable')blockers.push({code:'audio_review_capability',owner:'agent',
  reason:'The transcript has not been checked against audio, and no audio-review executor is configured for this run.',
  evidence_needed:'Audio-backed speaker identification and checks of numbers, names, negation and trade conditions.',
  next_action:'Agent: seek and verify a full corresponding transcript. Skip the interview if this fails.',
  attempts:[...attempts,{action:'audio_review_executor_check',result:'unavailable',at:capability_check.checked_at}]});
 const skipped=(pending.length>0||sources.length===0)&&fallback?.exhausted===true;
 if(skipped)need(fallback.reason?.trim()&&attempts.some(a=>a.action==='transcript_search'&&a.result?.trim())&&attempts.some(a=>a.action==='transcript_review'&&a.result?.trim()),'Skip needs recorded transcript search and review attempts');
 return {id:'recording:'+recording.id,kind:'recording',recording_id:recording.id,author:recording.author,display_name:recording.display_name,
  sources:[{url:recording.url,at:recording.published_at,label:recording.display_name}],source_review:pending.length?'pending':'passed',content_review:'pending',
  blockers:skipped?[]:blockers,disposition:skipped?'skipped':'reviewing',...(skipped?{skip_reason:fallback.reason}:{}),progress:{total_segments:sources.length,verified_segments:sources.length-pending.length},
  next_action:skipped?'No user action. Excluded from this publication; retain the private evidence log.':pending.length?'Agent: verify the source segments, then extract and review company candidates.':'Agent: extract and review company candidates.',
  evidence_fingerprint:fingerprint(sources.map(s=>({id:s.id,hash:s.text_sha256,media:s.media}))),attempts};
}

export function candidatesFromPacket(packet,{baseline}={}){
 const view=buildPresentation(packet,{baseline}),old=new Map((baseline?.records||[]).map(r=>[r.id,r]));
 return view.cards.flatMap(card=>{
  const record=packet.records.find(r=>r.id===card.id),prior=old.get(record.id),priorIds=new Set((prior?.events||[]).map(e=>e.id));
  const updates=view.details.filter(d=>d.record_id===record.id&&d.event_ids.some(id=>!priorIds.has(id)));
  if(prior&&prior.description===record.description&&!updates.length)return [];
  const sourceIds=new Set([...record.card_claims.flatMap(c=>c.evidence.map(e=>e.source_id)),...updates.flatMap(d=>[...d.source_ids,...d.context_source_ids])]);
  return [{id:'candidate:'+record.author_id+':'+record.id,kind:'candidate',author:packet.authors.find(a=>a.id===record.author_id).name,
   internal_author_id:record.author_id,thesis_id:record.id,operation:prior?'thesis_update':'new_thesis',body:record.description,
   previous_body:prior?.description||null,tickers:card.assets.map(a=>({symbol:a.symbol,logo_url:a.image_url})),
   updates:updates.map(d=>({id:d.id,at:d.at,body:d.description,event_ids:d.event_ids})),
   sources:packet.sources.filter(s=>sourceIds.has(s.id)).map(s=>({id:s.id,url:s.url,label:s.display_name||s.locator,at:s.spoken_at||s.published_at,locator:s.locator,text:s.text,text_sha256:s.text_sha256})),
   source_review:'passed',content_review:'passed',review_proof:record.review,packet_fingerprint:fingerprint(packet),baseline_fingerprint:baseline?fingerprint(baseline):null,
   blockers:[],next_action:'Agent: complete version-bound source and content checks, then publish within the authorized batch.'}];
 });
}

export function beginAgentReview(store,id,workerId,at=new Date().toISOString()){
 const next=structuredClone(store),item=next.items.find(i=>i.id===id);need(item?.kind==='recording'&&workerId,'A source-review worker must identify its recording');
 if(item.worker?.status==='running'&&Date.parse(item.worker.lease_until)>Date.parse(at))throw Error('Another review attempt is still active');
 next.history.push({type:'source_review_started',item_id:id,at,worker_id:workerId,previous_blockers:item.blockers||[]});
 item.blockers=[];item.worker={id:workerId,status:'running',lease_until:new Date(Date.parse(at)+10*60*1000).toISOString()};next.revision++;return next;
}

export function mutateReviewFile(file,mutate){
 const lock=file+'.lock';let fd;
 try{
  fd=fs.openSync(lock,'wx');const current=JSON.parse(fs.readFileSync(file,'utf8'));need(current.schema_version==='thesis-review-workspace/1.0','Unsupported review store');
  const next=mutate(current),temporary=file+'.tmp-'+process.pid;
  fs.writeFileSync(temporary,JSON.stringify(next,null,2)+'\n',{mode:0o600});fs.renameSync(temporary,file);return next;
 }finally{if(fd!==undefined){fs.closeSync(fd);fs.unlinkSync(lock);}}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [, ,command,file,...args]=process.argv;need(file,'Usage: review-workflow.mjs init|intake-media|ingest-packet|receipts STORE [INPUT] [CONFIG]');
 if(command==='init'){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(newReviewStore(),null,2)+'\n',{flag:'wx',mode:0o600});}
 else if(command==='intake-media'){
  const bundle=JSON.parse(fs.readFileSync(args[0])),config=JSON.parse(fs.readFileSync(args[1]));
  mutateReviewFile(file,s=>upsertReviewItem(s,intakeMedia(bundle,config)));
 }else if(command==='start-source')mutateReviewFile(file,s=>beginAgentReview(s,args[0],args[1]));
 else if(command==='mark-published')mutateReviewFile(file,s=>markPublished(s,JSON.parse(fs.readFileSync(args[0]))));
 else if(command==='decide')mutateReviewFile(file,s=>applyUserDecision(s,JSON.parse(fs.readFileSync(args[0])),'user-via-agent'));
 else if(command==='review-agent')mutateReviewFile(file,s=>applyAgentReview(s,JSON.parse(fs.readFileSync(args[0]))));
 else if(command==='ingest-packet'){
  const packet=JSON.parse(fs.readFileSync(args[0])),baseline=args[1]?JSON.parse(fs.readFileSync(args[1])):undefined;
  const items=candidatesFromPacket(packet,{baseline});mutateReviewFile(file,s=>items.reduce((state,item)=>upsertReviewItem(state,item),s));
 }else if(command==='receipts')console.log(JSON.stringify(approvalReceipts(JSON.parse(fs.readFileSync(file))),null,2));
 else throw Error('Unsupported command');
}
