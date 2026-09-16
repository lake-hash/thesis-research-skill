import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {test} from 'node:test';
import {validatePacket} from './validate-packet.mjs';
import {buildPresentation as buildReviewedPresentation,timelinePreview} from './build-presentation.mjs';
import {preparePacketExport as prepareReviewedPacketExport,exportBundle,allocatePreviewIds} from '../../thesis-review-publish/scripts/prepare-card-export.mjs';
import {normalizeMedia} from './normalize-media.mjs';
import {candidatesFromPacket as reviewedCandidatesFromPacket} from '../../thesis-review-publish/scripts/review-workflow.mjs';
import links from './source-links.cjs';
import {validateDelivery} from '../../thesis-review-publish/scripts/source-coverage-contract.mjs';

import {reviewedFixture} from './test-review-fixture.mjs';
import {reviewInputHash,validateObjectGrouping} from './run-review-contract.mjs';
import {validateBatch} from './validate-batch.mjs';
// Existing structural scenarios receive synthetic review records at delivery.
// New integrity tests below call the production entrypoints directly.
const buildPresentation=(p,options)=>buildReviewedPresentation(reviewedFixture(p),options);
const preparePacketExport=(p,options)=>prepareReviewedPacketExport(reviewedFixture(p),options);
const candidatesFromPacket=(p,...args)=>reviewedCandidatesFromPacket(reviewedFixture(p),...args);

const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function source(id,text,author='alex',canonical=id){return{id,channel_id:'site',url:'https://example.invalid/'+id,author_ids:[author],canonical_event_id:canonical,published_at:'2026-09-09T12:00:00Z',spoken_at:null,locator:'Original post',source_level:'primary',context_complete:true,text,text_sha256:sha(text),attachment_status:'none',attachments:[]};}
function event(s,id='e1',type='FIRST_OBSERVED'){return{id,type,canonical_event_id:s.canonical_event_id,at:s.published_at,date_basis:'published',source_ids:[s.id],description:'Demand can support more deliveries if capacity is added.',support:[{source_id:s.id,quote:s.text,purpose:'judgment'}],action:{kind:'none',basis:'none'},visual_dependency:'none',visual_dependency_reason:'No source image adds material context in this fixture.',media_bindings:[]};}
function fixture(){
 const s=source('s1','Acme can grow as customers reserve more factory capacity.');
 return{schema_version:'1.0',subject_id:'alex',as_of:'2026-09-11',requested_scope:{mode:'explicit_window',start:'2026-09-01',end:'2026-09-11',note:'Synthetic test fixture; never publish.'},authors:[{id:'alex',name:'Alex Example',identity_status:'verified',evidence_urls:['https://example.invalid/alex']},{id:'beth',name:'Beth Example',identity_status:'verified',evidence_urls:['https://example.invalid/beth']}],coverage:[{id:'site',channel:'Official website',url:'https://example.invalid',declared_scope:'Known September fixture archive',status:'covered',proof:'Two fixture archive pages inspected.',gaps:[]}],sources:[s],decisions:[{source_id:s.id,disposition:'used',reason:'A company-specific argument.'}],records:[{id:'t1',author_id:'alex',type:'thesis',question:'Can Acme turn reserved capacity into more deliveries?',description:'Acme has a path to more deliveries if its factories can meet customer reservations.',assessment_as_of:'2026-09-09',origin:{status:'unknown',source_ids:[]},view_status:'active',position_status:'not_disclosed',dedup:{decision:'new',compared_ids:[],reason:'No related fixture record.'},asset_bindings:[{entity_name:'Acme',symbol:'ACME',market:'TEST',instrument_type:'equity',role:'primary',basis:'author_named',source_ids:['s1'],verification_url:'https://example.invalid/acme'}],events:[event(s)],signals:[],review:{status:'approved',reviewer:'Fixture reviewer',method:'Synthetic source-first review',checks:Object.fromEntries(['attribution','standalone','grouping','asset_binding','fidelity','chronology','editorial'].map(k=>[k,'pass'])),reason:'This fixture tests structure, not investment truth.'}}],pending:[],completion:{collection:'complete_in_declared_scope',classification:'complete',review:'complete'}};
}
const valid=p=>{const r=validatePacket(p);assert(r.ok,r.errors.join('\n'));};
const invalid=(p,pattern,options)=>{const r=validatePacket(p,options);assert(!r.ok);assert(r.errors.some(e=>pattern.test(e)),r.errors.join('\n'));};

test('A single sourced statement qualifies without targets, stops or a follow-up',()=>valid(fixture()));
test('A short prose-only record does not require a card title',()=>{const p=fixture();delete p.records[0].title;valid(p);});
test('Legacy prose preserves paragraphs before the 500-character generation policy',()=>{const p=fixture();delete p.records[0].title;const opening=p.records[0].description;p.records[0].description=opening+'\n\n'+Array(8).fill(opening).join(' ');const before=p.records[0].description;valid(p);assert.equal(p.records[0].description,before);});
test('Titles are rejected even as empty internal metadata',()=>{for(const value of ['',null,'Old heading']){const p=fixture();p.records[0].title=value;invalid(p,/title field is not allowed/);const q=fixture();q.records[0].events[0].title=value;invalid(q,/title field is not allowed/);}});
test('Card and Timeline records use descriptions without title fields',()=>{const p=fixture();delete p.records[0].title;delete p.records[0].events[0].title;valid(p);});
test('A date-only assessment includes a timestamp later on that calendar day',()=>valid(fixture()));
test('Incomplete collection cannot be called complete',()=>{const p=fixture();p.coverage[0].status='partial';p.coverage[0].gaps=['Older archive inaccessible'];invalid(p,/Collection cannot/);p.completion.collection='partial';valid(p);});
test('Unaccounted source cannot be hidden by a complete-classification label',()=>{const p=fixture();p.decisions=[];invalid(p,/unaccounted/);});
test('Hash and quote checks catch altered or fabricated evidence',()=>{const p=fixture();p.sources[0].text+=' Changed';invalid(p,/hash mismatch/);const q=fixture();q.records[0].events[0].support[0].quote='An invented target';invalid(q,/unsupported exact quote/);});
test('Another speaker cannot be assigned to the subject as a personal update',()=>{const p=fixture();p.sources[0].author_ids=['beth'];invalid(p,/lacks the thesis author/);});
test('Reply context may have a different event identity without becoming the speaker',()=>{const p=fixture(),s=source('parent','Customers are reserving factories.','beth');p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Reply context.'});p.records[0].events[0].context_source_ids=[s.id];p.records[0].events[0].support.push({source_id:s.id,quote:s.text,purpose:'context'});valid(p);});
test('Copied representations cannot create duplicate timeline events',()=>{const p=fixture(),s=source('copy',p.sources[0].text,'alex','s1');p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Copy.'});p.records[0].events.push(event(s,'e2','EVIDENCE'));invalid(p,/duplicates a statement/);});
test('A source revision retains the old event and links the correction',()=>{const p=fixture(),s=source('s1-v2','Acme demand remains strong but capacity is delayed.','alex','s1');p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Edited original.'});p.records[0].events.push({...event(s,'e2','REVISE'),revision_of_event_id:'e1'});valid(p);});
test('Alva proxy needs a distinct vehicle role and visible attribution',()=>{const p=fixture();const b=p.records[0].asset_bindings[0];b.basis='alva_proxy';invalid(p,/proxy must/);b.role='vehicle';b.display_note='An Alva example, not an author-named holding.';valid(p);});
test('Advice to close is not a reported executed closure',()=>{const p=fixture();p.records[0].type='setup';p.records[0].episode_id='episode-1';p.records[0].position_status='closed_reported';const s=source('s2','Consider closing the trade.');p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Trade advice.'});p.records[0].events.push({...event(s,'e2','CLOSED'),action:{kind:'close',basis:'advice'}});invalid(p,/closure is not|closed position lacks/);});
test('Different setup episodes with separate statement events may repeat a question',()=>{const p=fixture();p.records[0].type='setup';p.records[0].episode_id='first-episode';const s=source('s2','A new setup forms after the earlier trade.');s.published_at='2026-09-10T12:00:00Z';p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'A separately sourced episode.'});const other=structuredClone(p.records[0]);other.id='t2';other.episode_id='second-episode';other.assessment_as_of='2026-09-10';other.events=[event(s,'t2-e1')];p.records.push(other);valid(p);});
test('Changing only episode IDs cannot duplicate the same setup origin',()=>{const p=fixture();p.records[0].type='setup';p.records[0].episode_id='one';const t=structuredClone(p.records[0]);t.id='t2';t.episode_id='two';t.events[0].id='e2';p.records.push(t);invalid(p,/duplicates a setup origin/);});
test('A valid statement by someone else cannot become the requested subject backfill',()=>{const p=fixture();p.records[0].author_id='beth';p.sources[0].author_ids=['beth'];invalid(p,/different requested subject/);});
test('Exact duplicate active questions fail, but a retained merge alias can pass',()=>{const p=fixture();const t=structuredClone(p.records[0]);t.id='t2';t.events[0].id='t2-e1';p.records.push(t);invalid(p,/duplicates question/);t.superseded_by='t1';valid(p);});
test('Signals cannot silently substitute the parent author',()=>{const p=fixture();p.records[0].signals=[{id:'sig',author_id:'alex',source_ids:['s1'],description:'Same author again',relation:'Support',support:p.records[0].events[0].support}];invalid(p,/another known author/);});
test('Novelty needs exact origin evidence',()=>{const p=fixture();p.records[0].origin={status:'new',source_ids:['s1']};invalid(p,/origin claim lacks exact/);});
test('Historical proof cannot be overwritten during a rerun',()=>{const baseline=fixture(),p=fixture();p.records[0].events[0].action={kind:'open',basis:'reported_execution'};invalid(p,/Historical evidence/,{baseline});});
test('Historical language correction retains its old copy and review reason',()=>{const baseline=fixture(),p=fixture();p.records[0].events[0].description='A clearer historical description';invalid(p,/editorial revision/,{baseline});p.editorial_revisions=[{event_id:'e1',previous_title:baseline.records[0].events[0].title,previous_description:baseline.records[0].events[0].description,reason:'Clarify wording without changing the source meaning.',reviewed_at:'2026-09-11'}];assert(validatePacket(p,{baseline}).ok);});
test('A held unresolved instrument is kept without inventing a symbol',()=>{const p=fixture();p.records[0].review.status='hold';p.records[0].asset_bindings[0].symbol=null;p.records[0].asset_bindings[0].verification_url=null;p.completion.review='partial';valid(p);});
test('A claimed complete review includes a sample of discarded decisions',()=>{const p=fixture(),s=source('s2','A personal holiday photograph.');p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'no_judgment',reason:'No investment view.'});invalid(p,/omission sample/);p.omission_review={source_ids:['s2'],reviewer:'Fixture reviewer',method:'Read discarded source',reason:'No financial judgment in the fixture.'};valid(p);});
test('Malformed root entries fail without being accepted as empty output',()=>{const p=fixture();p.records=[null];invalid(p,/non-object/);});

test('New generation validation requires a history trace; legacy packets remain readable',()=>{
 const p=fixture();valid(p);invalid(p,/history_coverage/,{requireHistoryCoverage:true});
 p.history_coverage=[];assert(validatePacket(p,{requireHistoryCoverage:true}).ok);
});
test('A recognized threshold cannot disappear behind a context disposition or group link',()=>{
 const p=fixture(),s=source('s2','Anything under $40 is a buy.');
 p.sources.push(s);p.decisions.push({source_id:'s2',disposition:'context',reason:'No new mechanism.'});
 p.history_coverage=[{id:'threshold',source_ids:['s2'],kind:'assessment',disposition:'event',record_id:'t1',reason:'First threshold for existing view.'}];
 invalid(p,/missing event target/);
 p.history_coverage[0].event_ids=['e1'];invalid(p,/event does not retain source/);
 p.records[0].events.push(event(s,'e2','REVISE'));p.history_coverage[0].event_ids=['e2'];p.decisions[1].disposition='used';valid(p);
});
test('One post containing two actions requires two resolved claim targets',()=>{
 const p=fixture();p.history_coverage=[
  {id:'claim-a',source_ids:['s1'],kind:'position',disposition:'event',event_ids:['e1'],reason:'First supported action.'},
  {id:'claim-b',source_ids:['s1'],kind:'position',disposition:'event',event_ids:[],reason:'Second supported action.'}
 ];invalid(p,/missing event target/);
});
test('A loss with unknown original rationale can be retained in pending history',()=>{
 const p=fixture(),s=source('s2','The old position was sold at a loss.');
 p.sources.push(s);p.decisions.push({source_id:'s2',disposition:'hold',reason:'Original trade rationale unknown.'});
 p.pending.push({id:'history-loss',source_ids:['s2'],reason:'Retain reported loss; recover the original episode.'});p.completion.review='partial';
 p.history_coverage=[{id:'loss',source_ids:['s2'],kind:'outcome',disposition:'pending',pending_ids:['history-loss'],reason:'No original rationale to create a thesis.'}];valid(p);
 p.pending[0].source_ids=['s1'];invalid(p,/pending target does not retain source/);
});
test('Unchanged repetition may coalesce without inventing a new statement event',()=>{
 const p=fixture(),s=source('repeat',p.sources[0].text);
 p.sources.push(s);p.decisions.push({source_id:'repeat',disposition:'used',reason:'Unchanged later statement retained through coalescing trace.'});
 p.history_coverage=[{id:'repeat-claim',source_ids:['repeat'],kind:'assessment',disposition:'coalesced',event_ids:['e1'],reason:'Same judgment with no new condition or action.'}];valid(p);
 p.history_coverage[0].event_ids=['unknown'];invalid(p,/missing event target/);
});
test('Supplement assembly cannot leave two FIRST_OBSERVED events for one question',()=>{
 const p=fixture(),s=source('s2','The same view gains additional evidence.');
 p.sources.push(s);p.decisions.push({source_id:'s2',disposition:'used',reason:'Supplementary source.'});
 p.records[0].events.push(event(s,'e2','FIRST_OBSERVED'));invalid(p,/cannot restart history/);
 p.records[0].events[1].type='EVIDENCE';valid(p);
});
test('History claims must have the subject as a primary speaker',()=>{
 const p=fixture(),s=source('outside','I added more shares.','beth');p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Referenced outside statement.'});
 p.history_coverage=[{id:'outside-claim',source_ids:[s.id],kind:'position',disposition:'coalesced',event_ids:['e1'],reason:'Purported same action.'}];invalid(p,/lacks subject statement/);
});
test('A first threshold cannot be hidden by coalescing into a later repetition',()=>{
 const p=fixture(),s=source('early',p.sources[0].text);s.published_at='2026-09-08T12:00:00Z';
 p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Earlier source.'});
 p.history_coverage=[{id:'early-claim',source_ids:[s.id],kind:'assessment',disposition:'coalesced',event_ids:['e1'],reason:'Purported unchanged statement.'}];invalid(p,/must not postdate/);
});
test('Date-only source precision does not invent an intraday ordering for coalescing',()=>{
 const p=fixture(),s=source('repeat',p.sources[0].text);s.published_at='2026-09-09';
 p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Same-day unchanged statement; time unavailable.'});
 p.history_coverage=[{id:'same-day',source_ids:[s.id],kind:'assessment',disposition:'coalesced',event_ids:['e1'],reason:'Same view; publication time within the day unknown.'}];valid(p);
});

function generationFixture(){
 const p=fixture(),t=p.records[0];p.authors[0].handle='alex';
 p.generation_policy={version:'3.1',grouping:'author_company',history:'append_only',public_scope:'fundamental_company_only/1.0',timeline_preview_words:40};
 t.object_type='company';t.object_key='company:acme';delete t.title;delete t.events[0].title;
 t.timeline_review=[{event_id:'e1',disposition:'update',increment_kind:'reason',increment_domain:'fundamental',increment:'First company judgment and its demand reason.',reason:'Source supports this observation.'}];
 t.asset_bindings[0].entity_key=t.object_key;t.asset_bindings[0].listing_region='US';t.events[0].asset_bindings=structuredClone(t.asset_bindings);
 t.primary_event_id='e1';t.primary_source_id='s1';t.primary_source_review={eligible_event_ids:['e1'],reason:'Specific author-owned company judgment.'};
 t.card_claims=[{id:'core',text:t.description,roles:['core_judgment','core_reason'],evidence:[{source_id:'s1',quote:p.sources[0].text,supports_roles:['core_judgment','core_reason']}]}];
 t.primary_source_review.candidates=[{event_id:'e1',source_id:'s1',kind:'analysis',covered_claim_ids:['core'],reason:'Source explains reserved capacity and growth.'}];
 Object.assign(t.review.checks,{reader_clarity:'pass',source_coverage:'pass',primary_anchor:'pass'});
 p.history_coverage=[{id:'claim-1',source_ids:['s1'],kind:'assessment',disposition:'event',event_ids:['e1'],reason:'Company judgment preserved.'}];
 p.images=[{kind:'person',key:'alex',endpoint:'/api/v1/persons',status:'image_not_provided',url:null,reason:'Fixture registry has no avatar.'},{kind:'security',key:'TEST:ACME',endpoint:'/api/v1/stocks/company/detail',status:'matched',url:'https://example.invalid/acme.png',requested_symbol:'ACME',resolved_symbol:'ACME',identity_basis:'exact_symbol'}];
 return p;
}
function mediaFixture(){
 const p=generationFixture(),s=p.sources[0],e=p.records[0].events[0];
 const b=normalizeMedia({subject_id:'alex',authors:p.authors,recording:{id:'recording-1',kind:'podcast',url:'https://www.youtube.com/watch?v=fixture',display_name:'Fixture podcast',published_at:s.published_at},
  transcript:{format:'segments',origin:'official',segments:[{id:'turn-1',speaker:'guest',start_seconds:42,text:s.text}]},
  speaker_bindings:{guest:{author_id:'alex',verified:true,attribution_source:'intro_selfstated',presence:'evidenced',evidence_urls:['https://example.invalid/intro']}}});
 s.url=b.sources[0].url;s.media=b.sources[0].media;s.canonical_event_id=e.canonical_event_id=b.sources[0].canonical_event_id;
 s.media.review={...s.media.review,status:'verified',reviewer:'Fixture source reviewer',method:'Synthetic fixture',speech_role:'author_statement'};
 p.media_inventory=[{...b.media_inventory[0],segments:[s.id]}];return p;
}
test('Reviewed media passes the existing generation pipeline and exports seek/source provenance',()=>{
 const p=mediaFixture();valid(p);const view=buildPresentation(p);assert(view.cards[0].source_url.endsWith('&t=42'));
 const authorMap=[{internalAuthorId:'alex',authorId:'person-alex'}];const b=exportBundle(preparePacketExport(p,{authorMap,assignments:allocatePreviewIds(authorMap,p.records),runId:'fixture',baselineVersion:'v1'}));
 assert.equal(b.gaps.length,0);assert.equal(b.manifest.items[0].sourceRevisions[0].textSha256,sha(p.sources[0].text));assert(links.split(b.cards[0].body).links[0].url.endsWith('&t=42'));assert.equal(b.manifest.items[0].sourceRevisions[0].media.segment_id,'turn-1');assert(!('mediaProvenance'in b.cards[0]));assert(!('sources'in b.cards[0]));
});
test('Agent review candidates are created only from validated reviewed packets',()=>{
 const p=mediaFixture(),items=candidatesFromPacket(p);assert.equal(items.length,1);assert.equal(items[0].body,p.records[0].description);assert.equal(items[0].source_review,'passed');assert.equal(items[0].content_review,'passed');assert.equal(items[0].sources[0].text,p.sources[0].text);
 assert.equal(candidatesFromPacket(p,{baseline:structuredClone(p)}).length,0);
 p.sources[0].media.review.status='pending';assert.throws(()=>candidatesFromPacket(p),/review/);
});
test('Media inventory and attribution failures cannot pass the packet validator',()=>{
 const p=mediaFixture();delete p.media_inventory;invalid(p,/coverage inventory/);
 const q=mediaFixture();q.sources[0].media.speaker.attribution_source='title';invalid(q,/title-only/);
 const r=mediaFixture();r.sources[0].media.transcript_origin='asr';invalid(r,/ASR/);
});
test('Changing historical media attribution in place requires a new source revision',()=>{
 const baseline=mediaFixture(),p=structuredClone(baseline);p.sources[0].media.start_seconds=55;
 invalid(p,/Prior media provenance changed/,{baseline});
});
function addUpdate(p,id,text,at='2026-09-10T12:00:00Z',action={kind:'none',basis:'none'}){
 const s=source(id,text);s.published_at=at;p.sources.push(s);p.decisions.push({source_id:id,disposition:'used',reason:'Dated update.'});
 const e={...event(s,'event-'+id,'POSITION'),asset_bindings:structuredClone(p.records[0].asset_bindings),action};delete e.title;
 if(action.kind!=='none'){e.account_id='main';e.episode_id='trade-1';}
 p.records[0].primary_source_review.candidates.push({event_id:e.id,source_id:id,kind:action.kind==='none'?'reaction':'position_update',covered_claim_ids:[],reason:'Timeline statement; no support for the central business argument.'});
 const review=action.kind==='none'?{event_id:e.id,disposition:'update',increment_kind:'evidence',increment_domain:'fundamental',increment:'Fixture material evidence.',reason:'Fixture source reviewed.'}:{event_id:e.id,disposition:'source_only',basis:'position_history',reason:'Action is retained privately without a thesis increment.'};
 p.records[0].events.push(e);p.records[0].timeline_review.push(review);p.records[0].assessment_as_of=at;p.history_coverage.push({id:'claim-'+id,source_ids:[id],kind:action.kind==='none'?'assessment':'position',disposition:'event',event_ids:[e.id],reason:'Preserve this statement.'});return e;
}
test('Approved generation requires an explicit review outcome for every event',()=>{
 const p=generationFixture();delete p.records[0].timeline_review;invalid(p,/needs timeline_review/);
 const q=generationFixture();addUpdate(q,'extra','A new factory opened.');q.records[0].timeline_review.pop();invalid(q,/needs a timeline review outcome/);
});
test('Repeat evidence must be strictly earlier and belong to the company history',()=>{
 for(const id of ['event-repeat','missing']){const p=generationFixture();addUpdate(p,'repeat','Reservations remain strong.');Object.assign(p.records[0].timeline_review.at(-1),{disposition:'source_only',basis:'repeat',covered_by_event_ids:[id]});invalid(p,/strictly earlier/);}
 const p=generationFixture();addUpdate(p,'early','Reservations remain strong.','2026-09-08T12:00:00Z');Object.assign(p.records[0].timeline_review.at(-1),{disposition:'source_only',basis:'repeat',covered_by_event_ids:['e1']});invalid(p,/strictly earlier/);
});
test('Source-only and held events retain provenance without a public row or detail',()=>{
 const p=generationFixture(),t=p.records[0];addUpdate(p,'repeat','Reservations remain strong.');Object.assign(t.timeline_review.at(-1),{disposition:'source_only',basis:'repeat',covered_by_event_ids:['e1']});
 addUpdate(p,'unclear','That transaction needs more capital.');Object.assign(t.timeline_review.at(-1),{disposition:'hold',missing_context:'Which transaction is referenced?'});
 const before=JSON.stringify(p),v=buildPresentation(p);assert.equal(v.cards[0].timeline.length,0);assert.equal(v.details.length,1);assert.deepEqual(v.excluded_events.map(e=>e.disposition),['source_only','hold']);assert.deepEqual(v.excluded_events[0].source_ids,['repeat']);assert.equal(JSON.stringify(p),before);
});
test('Holds need missing context; non-updates cannot anchor a card',()=>{
 const p=generationFixture();Object.assign(p.records[0].timeline_review[0],{disposition:'hold'});invalid(p,/unresolved context/);invalid(p,/cannot anchor/);
 const q=generationFixture();Object.assign(q.records[0].timeline_review[0],{disposition:'source_only',basis:'commentary'});invalid(q,/cannot anchor/);
});
test('Position actions stay private and cannot be mislabeled as repeats or commentary',()=>{
 const p=generationFixture(),t=p.records[0];addUpdate(p,'buy','Bought shares.','2026-09-10T10:00:00Z',{kind:'open',basis:'reported_execution'});
 valid(p);assert.equal(buildPresentation(p).cards[0].timeline.length,0);
 Object.assign(t.timeline_review.at(-1),{disposition:'source_only',basis:'repeat',covered_by_event_ids:['e1']});invalid(p,/cannot hide a new action/);
 Object.assign(t.timeline_review.at(-1),{disposition:'source_only',basis:'position_history',covered_by_event_ids:undefined});addUpdate(p,'second-buy','Bought more shares.','2026-09-10T12:00:00Z',{kind:'open',basis:'reported_execution'});
 Object.assign(t.timeline_review.at(-1),{disposition:'source_only',basis:'repeat',covered_by_event_ids:['event-buy']});invalid(p,/same execution explicitly/);
 t.timeline_review.at(-1).basis='commentary';invalid(p,/investment action as social commentary/);
});
function disclosureFixture(){
 const p=generationFixture(),t=p.records[0];
 for(const [id,description]of [['page1','Acme reserved a second factory.'],['page2','Deliveries start next quarter.']]){const e=addUpdate(p,id,description);e.description=description;Object.assign(p.sources.at(-1),{url:'https://example.invalid/letter.pdf#'+id,document_id:'letter',document_revision:'v1'});}
 t.disclosure_groups=[{id:'letter-acme',anchor_event_id:'event-page1',event_ids:['event-page1','event-page2'],reason:'Two pages of the same company disclosure.'}];return p;
}
test('Pages of one disclosure produce one complete detail and preserve every source',()=>{
 const p=disclosureFixture(),v=buildPresentation(p);assert.equal(v.cards[0].timeline.length,1);assert.equal(v.details.length,2);const detail=v.details.find(d=>d.event_ids.includes('event-page1'));assert.deepEqual(detail.event_ids,['event-page1','event-page2']);assert.equal(detail.description,'Acme reserved a second factory.\n\nDeliveries start next quarter.');assert.equal(detail.source_urls.length,2);assert.equal(v.cards[0].timeline[0].detail_id,detail.id);
});
test('Disclosure grouping rejects mismatched documents, revisions, dates and overlapping members',()=>{
 for(const mutate of [p=>p.sources.at(-1).document_revision='v2',p=>p.sources.at(-1).document_id='other',p=>p.sources.at(-1).url='https://example.invalid/other.pdf#page2',p=>p.records[0].events.at(-1).at='2026-09-10T13:00:00Z']){const p=disclosureFixture();mutate(p);invalid(p,/share document, revision and expression date/);}
 const p=disclosureFixture();p.records[0].disclosure_groups.push(structuredClone(p.records[0].disclosure_groups[0]));invalid(p,/Repeated disclosure group ID/);invalid(p,/overlapping events/);
 const q=disclosureFixture();q.records[0].disclosure_groups[0].event_ids.push('unknown');invalid(q,/missing or overlapping/);
 const r=disclosureFixture();r.records[0].disclosure_groups[0].anchor_event_id='e1';invalid(r,/member anchor/);
});
test('A disclosure containing the main source retains details but no duplicate Timeline row',()=>{
 const p=disclosureFixture(),t=p.records[0];for(const s of p.sources)Object.assign(s,{url:'https://example.invalid/letter.pdf#'+s.id,document_id:'letter',document_revision:'v1',published_at:p.sources[0].published_at});for(const e of t.events)e.at=p.sources[0].published_at;
 t.disclosure_groups[0].event_ids.unshift('e1');const v=buildPresentation(p);assert.equal(v.cards[0].timeline.length,0);assert.equal(v.details.length,1);assert.equal(v.details[0].event_ids.length,3);
});
test('Generation 3.1 produces title-free cards and full historical details',()=>{
 const p=generationFixture();valid(p);const v=buildPresentation(p);assert.equal(v.cards.length,1);assert.equal(v.details[0].description,p.records[0].events[0].description);assert(!('title' in v.cards[0]));assert.equal(v.cards[0].timeline.length,0);assert.equal(v.cards[0].last_update_at,p.records[0].events[0].at);assert.equal(v.cards[0].author_image_url,null);
});
test('Generation packet exports distinct current snapshots and material dated history',()=>{
 const p=generationFixture();addUpdate(p,'evidence','A new factory adds delivery capacity.');
 const authorMap=[{internalAuthorId:'alex',authorId:'person-alex'}];
 const prepared=preparePacketExport(p,{authorMap,assignments:allocatePreviewIds(authorMap,p.records),runId:'fixture',baselineVersion:'v1'});
 const b=exportBundle(prepared);assert.equal(b.gaps.length,0);assert.equal(b.cards.length,2);assert.equal(b.currentCards.length,1);
 assert.equal(links.split(b.cards[0].body).prose,p.records[0].events[0].description);assert.equal(links.split(b.currentCards[0].body).prose,p.records[0].description);
 assert.equal(b.manifest.items[0].sourceRevisions[0].textSha256,sha(p.sources[0].text));assert.equal(b.cards[1].thesisId,b.cards[0].thesisId);
});
test('Accepted source images are required, bound once and exported with the event',()=>{
 const p=generationFixture(),s=p.sources[0],e=p.records[0].events[0];s.attachment_status='complete';s.attachments=[{id:'image-1',type:'image',cover_url:'https://example.invalid/source-image.png'}];
 e.visual_dependency='helpful';e.visual_dependency_reason='The source chart materially clarifies the demand claim.';invalid(p,/does not account/);e.media_bindings=[{source_id:'s1',attachment_id:'image-1',disposition:'include'}];valid(p);
 const authorMap=[{internalAuthorId:'alex',authorId:'person-alex'}],prepared=preparePacketExport(p,{authorMap,assignments:allocatePreviewIds(authorMap,p.records),runId:'fixture',baselineVersion:'v1'}),b=exportBundle(prepared);
 assert.deepEqual(b.cards[0].media,[{type:'image',coverUrl:'https://example.invalid/source-image.png'}]);
 b.cards[0].media=[];assert.equal(validateDelivery(b.cards,b.manifest).ok,false);
});
test('A quoted-post image can be included only with retained context and a material-use reason',()=>{
 const p=generationFixture(),e=p.records[0].events[0],ctx=source('quoted','The earlier chart shows the support level.','beth');ctx.attachment_status='complete';ctx.attachments=[{id:'quoted-image',type:'image',cover_url:'https://example.invalid/quoted-chart.png'}];
 p.sources.push(ctx);p.decisions.push({source_id:ctx.id,disposition:'used',reason:'Quoted chart context for the author statement.'});e.context_source_ids=[ctx.id];e.support.push({source_id:ctx.id,quote:ctx.text,purpose:'context'});e.visual_dependency='helpful';e.visual_dependency_reason='The quoted chart explains the support level referenced by the author.';
 e.media_bindings=[{source_id:ctx.id,attachment_id:'quoted-image',disposition:'include'}];invalid(p,/material-use reason/);
 e.media_bindings[0].reason='The quoted chart shows the prior support level that the author says held.';valid(p);
 const authorMap=[{internalAuthorId:'alex',authorId:'person-alex'}],b=exportBundle(preparePacketExport(p,{authorMap,assignments:allocatePreviewIds(authorMap,p.records),runId:'fixture',baselineVersion:'v1'}));
 assert.deepEqual(b.cards[0].media,[{type:'image',coverUrl:'https://example.invalid/quoted-chart.png'}]);
 e.support=e.support.filter(span=>span.source_id!==ctx.id);invalid(p,/retained context support/);
});
test('Unavailable source attachment coverage blocks only image-dependent events',()=>{const p=generationFixture();p.sources[0].attachment_status='unavailable';p.sources[0].attachment_reason='Original image metadata could not be retrieved.';valid(p);p.records[0].events[0].visual_dependency='required';p.records[0].events[0].visual_dependency_reason='The chart contains the supporting evidence.';invalid(p,/unavailable source attachments|needs an included image/);});
test('Decorative or redundant images can be omitted with a reviewed reason',()=>{const p=generationFixture(),s=p.sources[0],e=p.records[0].events[0];s.attachment_status='complete';s.attachments=[{id:'image-1',type:'image',cover_url:'https://example.invalid/decorative.png'}];e.media_bindings=[{source_id:'s1',attachment_id:'image-1',disposition:'omit',reason:'Decorative image adds no thesis context.'}];valid(p);const authorMap=[{internalAuthorId:'alex',authorId:'person-alex'}],b=exportBundle(preparePacketExport(p,{authorMap,assignments:allocatePreviewIds(authorMap,p.records),runId:'fixture',baselineVersion:'v1'}));assert.deepEqual(b.cards[0].media,[]);});
test('A synthesis keeps older analysis and later evidence without leaking future evidence into history',()=>{
 const p=generationFixture(),t=p.records[0];addUpdate(p,'evidence','A new factory adds delivery capacity.');t.description+=' A new factory adds delivery capacity.';
 t.card_claims.push({id:'evidence-claim',text:'A new factory adds delivery capacity.',roles:['supporting_fact'],evidence:[{source_id:'evidence',quote:'A new factory adds delivery capacity.',supports_roles:['supporting_fact']}]});
 const view=buildPresentation(p);assert.deepEqual(view.cards[0].source_ids,['s1','evidence']);assert.equal(view.cards[0].source_urls.length,2);
 const authorMap=[{internalAuthorId:'alex',authorId:'person-alex'}];const prepared=preparePacketExport(p,{authorMap,assignments:allocatePreviewIds(authorMap,p.records),runId:'fixture',baselineVersion:'v1'});
 assert.equal(prepared.snapshots.schemaVersion,'thesis-export-input/1.1');const b=exportBundle(prepared);assert.equal(b.gaps.length,0);
 assert.equal(links.split(b.currentCards[0].body).links.length,2);assert.equal(links.split(b.cards[0].body).links.length,1);assert(validateDelivery(b.currentCards,b.currentManifest).ok);
 prepared.snapshots.items[0].sourceIds=['s1'];assert(exportBundle(prepared).gaps.some(h=>h.reason.includes('re-prepare')));
});
test('A non-material holding-plan reaffirmation remains private',()=>{
 const p=generationFixture(),e=addUpdate(p,'clarification','The planned holding period is five years.');e.type='REAFFIRM';
 Object.assign(p.records[0].timeline_review.at(-1),{disposition:'source_only',basis:'position_history',increment_kind:undefined,increment:undefined});
 const authorMap=[{internalAuthorId:'alex',authorId:'person-alex'}];
 const b=exportBundle(preparePacketExport(p,{authorMap,assignments:allocatePreviewIds(authorMap,p.records),runId:'fixture',baselineVersion:'v1'}));
 assert.equal(b.gaps.length,0);assert.equal(b.cards.length,1);assert.equal(buildPresentation(p).excluded_events.at(-1).disposition,'source_only');
});
test('New runs require the generation contract rather than accepting a legacy pass',()=>{
 invalid(fixture(),/Generation policy 3.1/,{requireGenerationContract:true});const p=generationFixture();delete p.images;invalid(p,/image lookup catalog/);
});
test('Approved context cannot retain a source without a resolved investable object',()=>{
 const p=generationFixture(),t=p.records[0];t.type='context';t.object_type='macro';t.object_key='macro:event-risk';t.asset_bindings=[];t.events[0].asset_bindings=[];
 invalid(p,/omit the source instead of creating a record/);
});
test('Different business mechanisms cannot duplicate the same author-company card',()=>{
 const p=generationFixture(),other=structuredClone(p.records[0]);other.id='solar';other.question='Can solar equipment add revenue?';other.events[0].id='solar-event';other.primary_event_id='solar-event';other.primary_source_review.eligible_event_ids=['solar-event'];p.records.push(other);
 invalid(p,/duplicates author-company/);other.object_key='company:alternate-acme';other.asset_bindings[0].entity_key=other.object_key;invalid(p,/same company security/);
});
test('Merged records form one source row with all historical paragraphs preserved',()=>{
 const p=generationFixture(),other=structuredClone(p.records[0]);other.id='solar';other.superseded_by='t1';other.events[0].id='solar-event';other.events[0].description='Solar equipment is another business opportunity.';p.records.push(other);
 p.records[0].timeline_review.push({event_id:'solar-event',disposition:'update',increment_kind:'evidence',increment_domain:'fundamental',increment:'Another company business dimension.',reason:'Both source fragments retained.'});
 valid(p);const v=buildPresentation(p);assert.equal(v.cards.length,1);assert.equal(v.cards[0].timeline.length,0);assert.equal(v.details[0].event_ids.length,2);assert(v.details[0].description.includes(other.events[0].description));assert.equal(v.aliases.solar,'t1');
});
test('Newer conversation does not replace the reviewed substantive primary source',()=>{
 const p=generationFixture();addUpdate(p,'reaction','Good point.');valid(p);const v=buildPresentation(p);assert.equal(v.cards[0].source_url,p.sources[0].url);assert.equal(v.cards[0].at,p.sources[0].published_at);
 p.records[0].primary_event_id='event-reaction';p.records[0].primary_source_id='reaction';invalid(p,/not reviewed eligible/);
});
test('A short position action stays private and cannot become the reasoned card anchor',()=>{
 const p=generationFixture(),e=addUpdate(p,'buy','Bought more.',undefined,{kind:'increase',basis:'reported_execution'}),t=p.records[0];valid(p);
 const v=buildPresentation(p);assert.equal(v.cards[0].timeline.length,0);assert.equal(v.excluded_events.at(-1).event_id,e.id);assert.equal(v.cards[0].at,p.sources[0].published_at);
 t.primary_event_id=e.id;t.primary_source_id='buy';t.primary_source_review.eligible_event_ids.push(e.id);invalid(p,/core judgment and reason|core-claim coverage/);
});
test('Source link and primary date cannot come from different posts',()=>{
 const p=generationFixture();addUpdate(p,'second','Another source.');p.records[0].primary_source_id='second';invalid(p,/primary source\/event mismatch|primary date/);
});
test('Future context and future-source ticker bindings are rejected',()=>{
 const p=generationFixture(),s=source('future','A new customer confirmed next day.','beth');s.published_at='2026-09-10T12:00:00Z';p.sources.push(s);p.decisions.push({source_id:s.id,disposition:'used',reason:'Context.'});p.records[0].events[0].context_source_ids=[s.id];invalid(p,/future context/);
 delete p.records[0].events[0].context_source_ids;p.records[0].events[0].asset_bindings[0].source_ids=[s.id];invalid(p,/binding imports a later source/);
});
test('An editorial note alone cannot authorize rewriting a frozen event',()=>{
 const baseline=generationFixture(),p=structuredClone(baseline),e=p.records[0].events[0];e.description='Clearer historical wording.';p.editorial_revisions=[{event_id:e.id,previous_description:baseline.records[0].events[0].description,reason:'A separately requested correction.',reviewed_at:'2026-09-11'}];
 invalid(p,/Append-only history changed/,{baseline});assert(validatePacket(p,{baseline,allowEditorialCorrections:true}).ok);e.asset_bindings[0].symbol='OTHER';invalid(p,/Frozen historical fields/,{baseline,allowEditorialCorrections:true});
});
test('Removing policy cannot downgrade an existing protected baseline',()=>{
 const baseline=generationFixture(),p=structuredClone(baseline);delete p.generation_policy;invalid(p,/Generation policy 3.1/,{baseline});
});
test('Trades share a company while preserving independent closed episodes',()=>{
 const p=generationFixture(),close=addUpdate(p,'close','Sold the position.','2026-09-10T12:00:00Z',{kind:'close',basis:'reported_execution'});close.type='CLOSED';
 const open=addUpdate(p,'open','Bought a new trade.','2026-09-11T12:00:00Z',{kind:'open',basis:'reported_execution'});invalid(p,/reopens a closed trading episode/);open.episode_id='trade-2';valid(p);
});
test('Timeline has an exact 40-word boundary without changing full text',()=>{
 const forty=Array(40).fill('word').join(' ');assert.equal(timelinePreview(forty).show_more,false);const longer=forty+' final';assert.equal(timelinePreview(longer).show_more,true);assert.equal(timelinePreview(longer).preview,forty+'\u2026');assert.equal(timelinePreview('First.\n\nSecond.').preview,'First. Second.');
 const p=generationFixture();const e=addUpdate(p,'second',longer);e.description=longer;const v=buildPresentation(p);const detail=v.details.find(d=>d.event_ids.includes(e.id));assert.equal(detail.description,longer);assert.equal(v.cards[0].timeline[0].detail_id,detail.id);
});
test('Wrong API securities and unrelated person names cannot supply pictures',()=>{
 const p=generationFixture();p.images[1].resolved_symbol='SVXY';invalid(p,/Security picture symbol mismatch/);
 const q=generationFixture();q.images[0]={kind:'person',key:'alex',endpoint:'/api/v1/persons',status:'matched',url:'https://example.invalid/beth.png',person_id:'person-beth',identity_basis:'social_handle',requested_handle:'beth',resolved_handle:'beth'};invalid(q,/another author/);
});
test('Non-US image routing and missing-avatar fallbacks are explicit',()=>{
 const p=generationFixture();p.records[0].asset_bindings[0].listing_region='non-US';p.records[0].events[0].asset_bindings[0].listing_region='non-US';invalid(p,/Non-US picture uses wrong endpoint/);p.images[1].endpoint='/api/v1/stocks/non-us/company/detail';p.images[0].fallback_url='https://example.invalid/verified-alex.png';valid(p);assert.equal(buildPresentation(p).cards[0].author_image_url,p.images[0].fallback_url);
});

test('A newer long same-company post cannot anchor an unrelated investment reason',()=>{
 const p=generationFixture(),e=addUpdate(p,'financing','Acme obtained financing for equipment. The facility has a three-year term. Management discussed cash balances, fees and repayment conditions.');
 const t=p.records[0],candidate=t.primary_source_review.candidates.at(-1);candidate.kind='analysis';valid(p);
 t.primary_event_id=e.id;t.primary_source_id='financing';t.primary_source_review.eligible_event_ids.push(e.id);candidate.covered_claim_ids=['core'];
 invalid(p,/overstates source coverage|core judgment and reason/);
});
test('A brief statement with the actual judgment and reason can qualify as the primary source',()=>{
 const p=generationFixture(),e=addUpdate(p,'brief','Acme can grow because customers are reserving factory capacity.'),t=p.records[0],s=p.sources.at(-1);
 t.card_claims[0].evidence.push({source_id:s.id,quote:s.text,supports_roles:['core_judgment','core_reason']});
 Object.assign(t.primary_source_review.candidates.at(-1),{kind:'brief_thesis',covered_claim_ids:['core']});t.primary_source_review.eligible_event_ids.push(e.id);t.primary_event_id=e.id;t.primary_source_id=s.id;valid(p);
 assert.equal(buildPresentation(p).cards[0].source_url,s.url);t.primary_event_id='e1';t.primary_source_id='s1';invalid(p,/not the latest eligible/);
});
test('A source proving the judgment does not automatically prove its reason',()=>{
 const p=generationFixture(),e=addUpdate(p,'reason','Customers are reserving factory capacity.'),t=p.records[0];
 t.card_claims[0].evidence[0].supports_roles=['core_judgment'];t.card_claims[0].evidence.push({source_id:'reason',quote:p.sources.at(-1).text,supports_roles:['core_reason']});
 Object.assign(t.primary_source_review.candidates.at(-1),{kind:'brief_thesis',covered_claim_ids:['core']});
 invalid(p,/overstates source coverage|core judgment and reason/);
});
test('Additional delivery facts require their own evidence and preserve the older main anchor',()=>{
 const p=generationFixture(),e=addUpdate(p,'acceptance','Microsoft accepted the first Acme data-center phase.'),t=p.records[0],text='Microsoft accepted the first Acme data-center phase.';
 t.description+='\n\n'+text;invalid(p,/unmapped claims/);
 t.card_claims.push({id:'delivery',text,roles:['supporting_fact'],evidence:[{source_id:'acceptance',quote:text,supports_roles:['supporting_fact']}]});
 t.primary_source_review.candidates.at(-1).covered_claim_ids=['delivery'];valid(p);
 const view=buildPresentation(p),card=view.cards[0],claim=card.claim_sources.find(c=>c.id==='delivery');
 assert.equal(card.source_url,p.sources[0].url);assert.equal(card.at,p.sources[0].published_at);assert.equal(card.last_update_at,e.at);assert.deepEqual(claim.source_urls,[p.sources.at(-1).url]);assert.equal(claim.detail_ids.length,1);
 assert.equal(view.details.find(d=>d.id===claim.detail_ids[0]).at,e.at);
});
test('Rewriting the opening invalidates an outdated claim map',()=>{
 const p=generationFixture();p.records[0].description='Acme looks cheap because electricity is scarce.';invalid(p,/claim text does not match|unmapped claims/);
});
test('Reader clarity and source review are required even when structural source references match',()=>{
 const p=generationFixture();p.records[0].review.checks.reader_clarity='fail';invalid(p,/missing reader_clarity review/);p.records[0].review.checks.reader_clarity='pass';p.records[0].review.checks.primary_anchor='fail';invalid(p,/missing primary_anchor review/);
});
test('Current public scope rejects technical setup records',()=>{
 const p=generationFixture();p.records[0].type='setup';p.records[0].kind='technical';p.records[0].episode_id='technical-episode';invalid(p,/technical\/setup records|company trades belong/);
});
test('Technical-only history stays private while fundamental updates remain public',()=>{
 const p=generationFixture();addUpdate(p,'technical','Price crossed its moving average.');const review=p.records[0].timeline_review.at(-1);
 Object.assign(review,{disposition:'source_only',basis:'technical_out_of_scope',increment_kind:undefined,increment_domain:undefined,increment:undefined,reason:'Technical-only material is private in this product scope.'});
 valid(p);
 const q=generationFixture();addUpdate(q,'technical','Price crossed its moving average.');q.records[0].timeline_review.at(-1).increment_domain='technical';invalid(q,/technical-only increments/);
});
test('Mixed technical context stays private in the current public scope',()=>{
 const p=generationFixture();addUpdate(p,'mixed','Demand improved while price reclaimed the moving average.');Object.assign(p.records[0].timeline_review.at(-1),{increment_domain:'mixed',fundamental_increment:'Customer demand improved.'});invalid(p,/technical-only increments|fundamental-only/);
});
test('Source-first review requires a conclusion-first opening assessment',()=>{
 const p=reviewedFixture(generationFixture());delete p.records[0].source_first_review.reader.opening_reason;assert.throws(()=>buildReviewedPresentation(p),/conclusion-first/);
});
test('Legacy 3.0 remains readable but cannot pass current-generation validation',()=>{
 const p=generationFixture();p.generation_policy.version='3.0';delete p.records[0].card_claims;delete p.records[0].primary_source_review.candidates;valid(p);invalid(p,/Generation policy 3.1/,{requireGenerationContract:true});assert.throws(()=>buildPresentation(p),/Generation policy 3.1/);
});


// Current-run regressions use production entrypoints, without auto-refreshing review records.
test('Current generation rejects old pass flags until source-first review and search records exist',()=>{
 const p=generationFixture();p.generation_policy.prose_max_chars=500;
 assert(validatePacket(p,{requireGenerationContract:true}).errors.some(e=>e.includes('review_contract')));
 assert.throws(()=>buildReviewedPresentation(p),/Source-first review|review_contract/);
 assert.equal(buildReviewedPresentation(reviewedFixture(p)).cards.length,1);
});
test('Every generation outlet requires the prose policy; caller options cannot disable it',()=>{
 const p=reviewedFixture(generationFixture());delete p.generation_policy.prose_max_chars;
 assert.throws(()=>buildReviewedPresentation(p,{requireProseLimit:false,requireRunReview:false}),/prose_max_chars/);
 assert.throws(()=>prepareReviewedPacketExport(p,{validation:{requireProseLimit:false}}),/prose_max_chars/);
 assert.throws(()=>reviewedCandidatesFromPacket(p),/prose_max_chars/);
 const q=generationFixture();q.records[0].description=Array(10).fill(q.records[0].description).join(' ');q.records[0].card_claims[0].text=q.records[0].description;
 assert.throws(()=>buildReviewedPresentation(reviewedFixture(q)),/maximum is 500/);
});
test('An altered conclusion with a valid old quote and all-pass labels cannot reuse source-first approval',()=>{
 const p=reviewedFixture(generationFixture()),t=p.records[0];
 t.description='Acme has completed an acquisition of every competitor.';t.card_claims[0].text=t.description;
 assert.throws(()=>buildReviewedPresentation(p),/stale or missing/);
});
test('Review must cover exact evidence and each historical event, not merely a matching fingerprint',()=>{
 const p=generationFixture();addUpdate(p,'second','A second factory opened.');const q=reviewedFixture(p),t=q.records[0];
 t.source_first_review.event_reviews.pop();assert.throws(()=>buildReviewedPresentation(q),/every retained|event review/);
 const r=reviewedFixture(p);r.records[0].source_first_review.claim_reviews[0].evidence[0].explanation='';
 assert.throws(()=>buildReviewedPresentation(r),/support explanation/);
 const x=reviewedFixture(p);x.records[0].source_first_review.claim_reviews[0].decision='unsupported';
 assert.throws(()=>buildReviewedPresentation(x),/supported meaning/);
});
test('Source, current-state, grouping and Signals changes invalidate finished source-first review',()=>{
 for(const mutate of [p=>p.sources[0].url+='?revision=2',p=>p.records[0].position_status='closed_reported',
 p=>p.catalog_review.revision='changed',p=>p.records[0].signals_review.reason='Changed search result']){
  const p=reviewedFixture(generationFixture());mutate(p);assert.throws(()=>buildReviewedPresentation(p),/stale or missing/);
 }
});
test('Empty Signals require a search, while recorded no-match results do not force invented content',()=>{
 const p=reviewedFixture(generationFixture());assert.equal(buildReviewedPresentation(p).cards[0].signals.length,0);
 delete p.records[0].signals_review;assert.throws(()=>buildReviewedPresentation(p),/Signals search/);
 const q=reviewedFixture(generationFixture());q.records[0].signals_review.searches=[];
 q.records[0].source_first_review.input_sha256=reviewInputHash(q,q.records[0]);
 assert.throws(()=>buildReviewedPresentation(q),/existing-catalog Signals search/);
});
test('An included Signal must match the reviewed outside author and original URL',()=>{
 const p=generationFixture(),s=source('outside','Acme may face weaker demand.','beth');p.sources.push(s);
 p.decisions.push({source_id:s.id,disposition:'used',reason:'Outside challenge.'});
 p.records[0].signals=[{id:'outside-view',author_id:'beth',source_ids:[s.id],description:'Demand may weaken.',relation:'Challenges reserved demand.',support:[{source_id:s.id,quote:s.text,purpose:'judgment'}]}];
 p.images.push({kind:'person',key:'beth',status:'image_not_provided',url:null,reason:'No fixture portrait.'});
 const q=reviewedFixture(p),r=q.records[0];
 r.signals_review.candidates=[{author_id:'beth',source_urls:[s.url],decision:'include',signal_id:'outside-view',reason:'Challenges the demand assumption.'}];
 r.source_first_review.input_sha256=reviewInputHash(q,r);assert.equal(buildReviewedPresentation(q).cards[0].signals.length,1);
 r.signals_review.candidates[0].source_urls=['https://example.invalid/another'];r.source_first_review.input_sha256=reviewInputHash(q,r);
 assert.throws(()=>buildReviewedPresentation(q),/source differs/);
});
function anotherObject(p,{kind='asset',key='company:acme'}={}){
 const t=p.records[0];t.object_type='asset';
 const n=JSON.parse(JSON.stringify(t).replaceAll('"t1"','"t2"').replaceAll('"e1"','"e2"').replaceAll('"s1"','"s2"'));
 n.question='Does another trade justify a separate asset history?';n.object_type=kind;n.object_key=key;
 p.sources.push({...p.sources[0],id:'s2',canonical_event_id:'s2',url:'https://example.invalid/s2'});
 p.decisions.push({source_id:'s2',disposition:'used',reason:'Another dated expression.'});p.records.push(n);
 p.history_coverage.push({id:'claim-2',source_ids:['s2'],kind:'assessment',disposition:'event',event_ids:['e2'],reason:'Retained expression.'});return n;
}
test('The same asset cannot create two histories or evade matching by changing object keys',()=>{
 for(const key of ['company:acme','asset:another-key']){
  const p=generationFixture();anotherObject(p,{key});
  assert.throws(()=>buildReviewedPresentation(reviewedFixture(p)),/duplicates author\/investment object|duplicates an investment identity/);
 }
});
test('An extra related ticker cannot disguise a single asset trade as a separate basket',()=>{
 const p=generationFixture(),n=anotherObject(p,{kind:'basket',key:'basket:acme-and-extra'});
 n.asset_bindings.push({...n.asset_bindings[0],symbol:'OTHER',entity_key:'asset:other',role:'related'});
 assert.throws(()=>buildReviewedPresentation(reviewedFixture(p)),/overlapping basket|multiple actual investment objects/);
});
test('A real cross-asset strategy can coexist only with explicit author-owned separation evidence',()=>{
 const a={id:'asset',author_id:'alex',type:'thesis',object_type:'asset',object_key:'asset:gold',review:{status:'approved'},asset_bindings:[{entity_key:'gold',market:'TEST',symbol:'GOLD',role:'primary'}]};
 const b={...structuredClone(a),id:'basket',object_type:'basket',object_key:'basket:gold-bonds'};
 b.asset_bindings.push({entity_key:'bonds',market:'TEST',symbol:'BONDS',role:'vehicle'});
 const s=source('strategy','Gold and bonds hedge different parts of the portfolio.');
 const errors=[];validateObjectGrouping([a,b],[{record_ids:['asset','basket'],decision:'distinct_strategy',reason:'Two-asset hedge, not a second gold trade.',evidence:[{record_id:'basket',source_id:s.id,quote:s.text,explanation:'The original describes distinct hedging roles.'}]}],new Map([[s.id,s]]),(ok,e)=>{if(!ok)errors.push(e)});
 assert.deepEqual(errors,[]);
});
test('Same-document fragments cannot combine into an over-limit historical detail',()=>{
 const p=disclosureFixture();for(const e of p.records[0].events.slice(1))e.description='a'.repeat(300);
 // Distinct paragraphs prevent deduplication from hiding the combined length.
 p.records[0].events.at(-1).description='b'.repeat(300);
 assert.throws(()=>buildReviewedPresentation(reviewedFixture(p)),/Combined historical detail exceeds 500/);
});
test('Batch matching catches existing and pending object duplicates missed by per-author delivery',()=>{
 for(const kind of ['records','pending']){
  const p=reviewedFixture(generationFixture()),r=structuredClone(p.records[0]);r.id='existing-acme';r.object_type='asset';
  const catalog={revision:p.catalog_review.revision,records:[],pending:[],sources:[]};catalog[kind].push(r);
  p.catalog_review[kind==='records'?'record_ids':'pending_ids']=[r.id];p.records[0].source_first_review.input_sha256=reviewInputHash(p,p.records[0]);
  const result=validateBatch([p],catalog);assert(!result.ok);assert(result.errors.some(e=>e.includes('duplicates author/investment object')));
 }
});
test('A batch cannot claim matching without inspecting the subjects existing catalog entries',()=>{
 const p=reviewedFixture(generationFixture()),catalog={revision:p.catalog_review.revision,records:[{id:'unread',author_id:'alex',type:'thesis',object_type:'asset',object_key:'asset:unrelated',asset_bindings:[]}],pending:[],sources:[]};
 assert(validateBatch([p],catalog).errors.some(e=>e.includes('Catalog match review omitted')));
 assert(validateBatch([p],{...catalog,records:[],revision:'new-revision'}).errors.some(e=>e.includes('Catalog revision differs')));
});
test('Separate packets cannot repeat the same object or skip reviewing this batch for Signals',()=>{
 const a=reviewedFixture(generationFixture()),p=generationFixture();p.records[0].id='second-packet-acme';const b=reviewedFixture(p);
 const catalog={revision:a.catalog_review.revision,records:[],pending:[],sources:[]};
 const result=validateBatch([a,b],catalog);assert(result.errors.some(e=>e.includes('duplicates author/investment object')));
 assert(result.errors.some(e=>e.includes('current batch')));
 const single=validateBatch([a],catalog);assert(single.ok,single.errors.join('\n'));
});

test('A reviewed multi-author batch passes without manufacturing Signals',()=>{
 const a=reviewedFixture(generationFixture());
 const raw=JSON.parse(JSON.stringify(generationFixture()).replaceAll('"alex"','"case-two"').replaceAll('"t1"','"case-two-thesis"').replaceAll('"e1"','"case-two-event"').replaceAll('"s1"','"case-two-source"'));
 const b=reviewedFixture(raw);
 for(const p of [a,b]){p.records[0].signals_review.searches.push({scope:'current_batch',query:'Acme across this batch',result:'Related author material considered; no distinct supporting or challenging evidence in the synthetic fixture.'});p.records[0].source_first_review.input_sha256=reviewInputHash(p,p.records[0]);}
 const result=validateBatch([a,b],{revision:a.catalog_review.revision,records:[],pending:[],sources:[]});assert(result.ok,result.errors.join('\n'));
});
