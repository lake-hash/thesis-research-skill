import fs from 'node:fs';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {validateGenerationContract,sameValue} from './generation-contract.mjs';
import {validateMediaSource,validateMediaEvent,validatePacketMediaAudit,validateSourceAttachments} from './media-contract.mjs';
import {validateDocumentEvidence} from './document-evidence-contract.mjs';
import {validateProseLimit} from './prose-limit.mjs';
import {validateRunReview,validateObjectGrouping} from './run-review-contract.mjs';
import {publicTickersFromBindings,tickerStanceIssues} from './ticker-stance-contract.mjs';
import {sourceFidelityIssues} from './source-fidelity-contract.mjs';
import {ALL_GENERATION_VERSIONS,THESIS_POLICY} from '../../references/thesis-policy.mjs';

const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const filled=v=>typeof v==='string'&&v.trim().length>0;
const https=v=>{try{return ['https:','http:'].includes(new URL(v).protocol);}catch{return false;}};
const date=v=>v===null||(filled(v)&&/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(v)&&Number.isFinite(Date.parse(v)));
const cutoff=v=>Date.parse(v)+(/^\d{4}-\d{2}-\d{2}$/.test(v)?86400000-1:0);
const gates=['attribution','standalone','grouping','asset_binding','fidelity','chronology','editorial'];
const eventTypes=['FIRST_OBSERVED','EVIDENCE','REVISE','POSITION','CLOSED','WITHDRAW','REAFFIRM'];

export function validatePacket(packet,{baseline,requireHistoryCoverage=false,requireGenerationContract=false,requireProseLimit=false,requireRunReview=false,allowEditorialCorrections=false}={}){
 // Current generation cannot silently fall back to archive-only validation.
 if(requireGenerationContract){requireHistoryCoverage=true;requireProseLimit=true;requireRunReview=true;}
 const errors=[],warnings=[];
 const check=(condition,message)=>{if(!condition)errors.push(message);};
 if(!packet||typeof packet!=='object')return {ok:false,errors:['Packet must be an object'],warnings};
 const strictGeneration=requireGenerationContract||ALL_GENERATION_VERSIONS.includes(packet.generation_policy?.version)||ALL_GENERATION_VERSIONS.includes(baseline?.generation_policy?.version);
 const arrays={};
 for(const key of ['authors','coverage','sources','decisions','records','pending']){check(Array.isArray(packet[key]),key+' must be an array');const entries=Array.isArray(packet[key])?packet[key]:[];check(entries.every(v=>v&&typeof v==='object'&&!Array.isArray(v)),key+' contains a non-object entry');arrays[key]=entries.filter(v=>v&&typeof v==='object'&&!Array.isArray(v));}
 const {authors,coverage,sources,decisions,records,pending}=arrays;
 validateProseLimit({...packet,records},{baseline,required:requireProseLimit,check});
 const index=(items,label)=>{const map=new Map();for(const item of items){if(!item||!filled(item.id)){errors.push(label+' requires an id');continue;}check(!map.has(item.id),'Duplicate '+label+' id: '+item.id);map.set(item.id,item);}return map;};
 const people=index(authors,'author'),channels=index(coverage,'channel'),sourceMap=index(sources,'source'),recordMap=index(records,'record');
 validateDocumentEvidence({...packet,sources},check,baseline);
 check(packet.schema_version==='1.0','Unsupported schema version');
 check(people.has(packet.subject_id),'Unknown subject_id');
 check(date(packet.as_of)&&packet.as_of!==null,'A dated as_of is required');
 check(['all_available_public_history','explicit_window'].includes(packet.requested_scope?.mode),'Missing requested scope');
 check(filled(packet.requested_scope?.note),'Requested scope needs a human-readable boundary');
 check(['complete_in_declared_scope','partial'].includes(packet.completion?.collection),'Invalid collection status');
 check(['complete','partial'].includes(packet.completion?.classification),'Invalid classification status');
 check(['complete','partial'].includes(packet.completion?.review),'Invalid review status');
 for(const a of authors){check(filled(a.name),'Unnamed author '+a.id);check(['verified','ambiguous'].includes(a.identity_status),'Invalid identity status '+a.id);if(a.identity_status==='verified')check(a.evidence_urls?.some(https),'Verified author needs identity evidence '+a.id);}
 for(const c of coverage){check(['covered','partial','blocked','not_found'].includes(c.status),'Invalid coverage status '+c.id);check(https(c.url)&&filled(c.channel)&&filled(c.declared_scope)&&filled(c.proof),'Coverage needs URL, scope and proof '+c.id);check(Array.isArray(c.gaps),'Coverage needs explicit gaps '+c.id);if(c.status==='covered')check(c.gaps?.length===0,'Covered channel has gaps '+c.id);}
 if(packet.completion?.collection==='complete_in_declared_scope')check(coverage.length>0&&coverage.every(c=>['covered','not_found'].includes(c.status)&&c.gaps?.length===0),'Collection cannot be complete with unresolved channels');
 for(const s of sources){
  check(channels.has(s.channel_id),'Unknown source channel '+s.id);
  check(https(s.url)&&filled(s.locator),'Source needs original URL and locator '+s.id);
  check(Array.isArray(s.author_ids)&&s.author_ids.length>0&&s.author_ids.every(id=>people.has(id)),'Unknown source author '+s.id);
  check(filled(s.canonical_event_id),'Missing canonical event identity '+s.id);
  check(date(s.published_at)&&date(s.spoken_at),'Invalid or omitted source dates '+s.id);
  check(typeof s.text==='string'&&s.text_sha256===hash(s.text),'Source text/hash mismatch '+s.id);
  check(['primary','secondary'].includes(s.source_level)&&typeof s.context_complete==='boolean','Source quality metadata missing '+s.id);
  validateMediaSource(s,check);
  validateSourceAttachments(s,check,{required:strictGeneration});
 }
 if(sources.some(s=>s.media)){
  check(Array.isArray(packet.media_inventory),'Media packets need an episode/segment coverage inventory');
  const inventory=index(Array.isArray(packet.media_inventory)?packet.media_inventory:[],'media recording');
  for(const s of sources.filter(s=>s.media))check(inventory.get(s.media.recording_id)?.segments?.includes(s.id),'Media source missing from coverage inventory '+s.id);
  for(const recording of inventory.values())check(Array.isArray(recording.segments)&&new Set(recording.segments).size===recording.segments.length&&recording.segments.every(id=>sourceMap.get(id)?.media?.recording_id===recording.id),'Invalid media segment inventory '+recording.id);
 }
 const dispositions=new Map();
 for(const d of decisions){
  check(sourceMap.has(d.source_id),'Unknown decision source '+d.source_id);check(!dispositions.has(d.source_id),'Duplicate source disposition '+d.source_id);dispositions.set(d.source_id,d);
  check(['used','context','no_judgment','duplicate','hold'].includes(d.disposition)&&filled(d.reason),'Invalid disposition '+d.source_id);
  if(d.disposition==='duplicate')check(d.duplicate_of!==d.source_id&&sourceMap.has(d.duplicate_of)&&sourceMap.get(d.source_id)?.canonical_event_id===sourceMap.get(d.duplicate_of)?.canonical_event_id,'Duplicate source lacks matching original event '+d.source_id);
 }
 const unaccounted=sources.filter(s=>!dispositions.has(s.id)).map(s=>s.id);
 if(packet.completion?.classification==='complete')check(unaccounted.length===0,'Classification has unaccounted sources: '+unaccounted.join(', '));
 if(unaccounted.length)warnings.push(unaccounted.length+' sources still need dispositions');
 const referenced=new Set(),globalEvents=new Set(),questions=new Map(),setupStarts=new Map();
 for(const t of records)if(t.superseded_by){const target=recordMap.get(t.superseded_by);check(!!target&&target.id!==t.id&&target.author_id===t.author_id,'Invalid merge target '+t.id);const visited=new Set([t.id]);let next=target;while(next?.superseded_by){check(!visited.has(next.id),'Cyclic merge '+t.id);if(visited.has(next.id))break;visited.add(next.id);next=recordMap.get(next.superseded_by);}}
 const refs=(ids,label)=>{check(Array.isArray(ids)&&ids.length>0,label+' needs source_ids');const list=Array.isArray(ids)?ids:[];check(list.every(id=>sourceMap.has(id)),label+' has unknown sources');list.forEach(id=>referenced.add(id));return list.map(id=>sourceMap.get(id)).filter(Boolean);};
 const supports=(spans,ids,label)=>{check(Array.isArray(spans)&&spans.length>0,label+' needs source support');for(const span of Array.isArray(spans)?spans:[]){if(!span){errors.push(label+' null support');continue;}check(ids.includes(span.source_id),label+' support outside its source_ids');check(filled(span.quote)&&sourceMap.get(span.source_id)?.text?.includes(span.quote),label+' unsupported exact quote');check(['judgment','reason','action','origin','context'].includes(span.purpose),label+' invalid support purpose');}};
 for(const t of records){
  const label='Record '+t.id,approved=t.review?.status==='approved';
  check(people.has(t.author_id),label+' unknown author');
  check(t.author_id===packet.subject_id,label+' belongs to a different requested subject');
  check(['thesis','setup','context'].includes(t.type),label+' invalid type');
  for(const field of ['question','description'])check(filled(t[field]),label+' missing '+field);
  check(!Object.hasOwn(t,'title'),label+' title field is not allowed; use description');
  check(!/[\u3400-\u9fff]/.test(t.description||''),label+' prose must be English');
  check(date(t.assessment_as_of),label+' invalid assessment date');
  if(t.type==='setup')check(filled(t.episode_id),label+' setup needs a stable episode_id');
  const question=t.author_id+'|'+t.type+'|'+(t.type==='setup'?t.episode_id:'')+'|'+String(t.question).normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
  if(!t.superseded_by){check(!questions.has(question),label+' duplicates question in '+questions.get(question));questions.set(question,t.id);}
  if(t.type==='setup'&&!t.superseded_by){const start=t.author_id+'|'+String(t.question).trim().toLowerCase()+'|'+t.events?.[0]?.canonical_event_id;check(!setupStarts.has(start),label+' duplicates a setup origin under a different episode id');setupStarts.set(start,t.id);}
  check(['active','withdrawn','uncertain'].includes(t.view_status),label+' invalid view status');
  check(['not_disclosed','open_reported','closed_reported','planned'].includes(t.position_status),label+' invalid position status');
  check(['new','existing','unknown'].includes(t.origin?.status),label+' missing origin status');
  check(['new','matched','merged','unresolved'].includes(t.dedup?.decision)&&Array.isArray(t.dedup?.compared_ids)&&filled(t.dedup?.reason),label+' missing dedup review');
  check(['approved','hold','revise'].includes(t.review?.status)&&filled(t.review?.reviewer)&&filled(t.review?.method)&&filled(t.review?.reason),label+' missing review provenance');
  if(approved){check(people.get(t.author_id)?.identity_status==='verified',label+' ambiguous identity cannot be approved');check(gates.every(g=>t.review.checks?.[g]==='pass'),label+' review gates not all passed');check(t.dedup?.decision!=='unresolved',label+' unresolved duplicate cannot be approved');}
  if(strictGeneration&&approved){
   const allowedSourceIds=[...new Set((t.events||[]).flatMap(event=>[...(event.source_ids||[]),...(event.context_source_ids||[])]))];
   for(const issue of sourceFidelityIssues({prose:`${t.stance_sentence||''}\n${t.description||''}`,sources:sourceMap,allowedSourceIds}))check(false,label+' '+issue);
  }
  const bindings=Array.isArray(t.asset_bindings)?t.asset_bindings:[];
  if(approved&&(strictGeneration||t.type!=='context'))check(bindings.some(b=>['primary','vehicle'].includes(b.role)),label+' needs a resolved primary investment object or vehicle; omit the source instead of creating a record');
  for(const b of bindings){
   check(filled(b.entity_name),label+' unnamed entity');
   if(approved)check(filled(b.symbol)&&filled(b.market)&&filled(b.instrument_type)&&https(b.verification_url),label+' unresolved security binding');
   check(['primary','vehicle','related'].includes(b.role)&&['author_named','entity_resolution','alva_proxy'].includes(b.basis),label+' invalid binding role/basis');
   refs(b.source_ids,label+' binding');
   if(b.basis==='alva_proxy')check(b.role==='vehicle'&&filled(b.display_note)&&/Alva/i.test(b.display_note),label+' proxy must be visibly separate from author-named assets');
  }
  check(Array.isArray(t.events)&&t.events.length>0,label+' needs events');
  const originals=new Map();let previousDate=null,setupClosed=false,reportedClose=false;
  for(const [i,e] of (Array.isArray(t.events)?t.events:[]).entries()){
   const el=label+' event '+e.id;check(filled(e.id)&&!globalEvents.has(e.id),'Duplicate/missing event id '+e.id);globalEvents.add(e.id);
   check(eventTypes.includes(e.type),el+' invalid event type');if(i===0)check(e.type==='FIRST_OBSERVED',el+' must begin with FIRST_OBSERVED');else check(e.type!=='FIRST_OBSERVED',el+' cannot restart history');
   check(filled(e.description),el+' missing prose');
   check(!Object.hasOwn(e,'title'),el+' title field is not allowed; use description');
   const ss=refs(e.source_ids,el),context=e.context_source_ids?.length?refs(e.context_source_ids,el+' context'):[];supports(e.support,[...(e.source_ids||[]),...(e.context_source_ids||[])],el);
   validateMediaEvent(e,t,sourceMap,check,{required:strictGeneration});
   check(ss.some(s=>s.author_ids?.includes(t.author_id)&&s.source_level==='primary'),el+' lacks the thesis author as a primary speaker/signatory');
   if(approved)check([...ss,...context].every(s=>s.context_complete),el+' incomplete context cannot support approval');
   check(filled(e.canonical_event_id)&&ss.every(s=>s.canonical_event_id===e.canonical_event_id),el+' mixes distinct statement events');
   if(originals.has(e.canonical_event_id))check(e.type==='REVISE'&&e.revision_of_event_id===originals.get(e.canonical_event_id).id&&e.source_ids.some(id=>!originals.get(e.canonical_event_id).source_ids.includes(id)),el+' duplicates a statement without a new source revision');
   originals.set(e.canonical_event_id,e);
   check(date(e.at)&&['spoken','published','unknown'].includes(e.date_basis),el+' invalid event date');
   if(e.date_basis==='unknown'){check(e.at===null,el+' invents an unknown date');warnings.push(el+' has an undated source');}
   else {const field=e.date_basis==='spoken'?'spoken_at':'published_at';check(e.at!==null&&ss.some(s=>s[field]===e.at),el+' date must match an original source with its precision');}
   if(e.at){const now=Date.parse(e.at);check(previousDate===null||now>=previousDate,el+' not chronological');previousDate=now;if(t.assessment_as_of)check(now<=cutoff(t.assessment_as_of),el+' occurs after the claimed assessment cutoff');}
   const action=e.action||{};check(['none','open','increase','reduce','close'].includes(action.kind)&&['none','advice','planned','reported_execution'].includes(action.basis),el+' missing action precision');
   if(action.kind==='none')check(action.basis==='none',el+' no action has a nonempty basis');else check(action.basis!=='none',el+' action lacks a basis');
   if(e.type==='CLOSED')check(action.kind==='close'&&action.basis==='reported_execution',el+' closure is not a reported exit');
   if(t.type==='setup'&&setupClosed)check(!(['open','increase'].includes(action.kind)&&action.basis==='reported_execution'),el+' reopens a closed setup instead of linking a new episode');
   if(action.kind==='close'&&action.basis==='reported_execution'){reportedClose=true;if(t.type==='setup')setupClosed=true;}
  }
  if(t.position_status==='closed_reported')check(reportedClose,label+' closed position lacks a reported close');
  if(approved&&packet.generation_policy?.version===THESIS_POLICY.generationVersion&&t.type!=='context'){
   const tickerSources=[...new Set((t.events||[]).flatMap(event=>[...(event.source_ids||[]),...(event.context_source_ids||[])]))];
   for(const issue of tickerStanceIssues({tickerStances:t.ticker_stances,tickers:publicTickersFromBindings(t.asset_bindings),sources:sourceMap,allowedSourceIds:tickerSources}))check(false,label+' '+issue);
  }
  if(t.origin?.status!=='unknown'){const ids=t.origin?.source_ids||[];check(ids.length>0&&ids.every(id=>sourceMap.has(id)),label+' origin claim lacks sources');check(t.events?.some(e=>e.support?.some(s=>s.purpose==='origin'&&ids.includes(s.source_id))),label+' origin claim lacks exact support');}
  for(const s of t.signals||[]){check(s.author_id!==t.author_id&&people.has(s.author_id),label+' signal must have another known author');const ss=refs(s.source_ids,label+' signal');supports(s.support,s.source_ids||[],label+' signal');check(ss.some(p=>p.author_ids?.includes(s.author_id)),label+' signal speaker mismatch');check(filled(s.description)&&filled(s.relation),label+' signal lacks relevance');}
 }
 for(const item of pending){refs(item.source_ids,'Pending '+item.id);check(filled(item.id)&&filled(item.reason),'Pending item lacks identity/reason');}
 if(requireHistoryCoverage||strictGeneration||packet.history_coverage!==undefined){
  check(Array.isArray(packet.history_coverage),'history_coverage must be an array for generation review');
  const items=Array.isArray(packet.history_coverage)?packet.history_coverage:[];
  const seen=new Set();
  const events=new Map(records.flatMap(t=>(t.events||[]).map(e=>[e.id,{event:e,author_id:t.author_id}])));
  const pendingMap=new Map(pending.map(p=>[p.id,p]));
  for(const item of items){
   if(!item||typeof item!=='object'||Array.isArray(item)){check(false,'Invalid history coverage item');continue;}
   const label='History coverage '+item.id;
   check(filled(item.id)&&!seen.has(item.id),label+' missing or duplicate id');seen.add(item.id);
   check(['assessment','position','outcome'].includes(item.kind),label+' invalid kind');
   check(['event','coalesced','pending'].includes(item.disposition),label+' invalid disposition');
   check(filled(item.reason),label+' needs a content-based reason');
   const claimSources=refs(item.source_ids,label);
   check(claimSources.some(s=>s.author_ids?.includes(packet.subject_id)&&s.source_level==='primary'),label+' lacks subject statement');
   const sourceIds=Array.isArray(item.source_ids)?item.source_ids:[];
   if(item.disposition==='pending'){
    const ids=Array.isArray(item.pending_ids)?item.pending_ids:[];
    check(ids.length>0&&ids.every(id=>pendingMap.has(id)),label+' missing pending history target');
    check(sourceIds.every(id=>ids.some(pid=>pendingMap.get(pid)?.source_ids?.includes(id))),label+' pending target does not retain source');
   }else if(['event','coalesced'].includes(item.disposition)){
    const ids=Array.isArray(item.event_ids)?item.event_ids:[];
    check(ids.length>0&&ids.every(id=>events.has(id)),label+' missing event target');
    check(ids.every(id=>events.get(id)?.author_id===packet.subject_id),label+' wrong event owner');
    if(item.disposition==='event')check(sourceIds.every(id=>ids.some(eid=>events.get(eid)?.event.source_ids?.includes(id))),label+' event does not retain source');
    if(item.disposition==='coalesced'){
     const dates=claimSources.filter(s=>s.author_ids?.includes(packet.subject_id)).map(s=>s.spoken_at||s.published_at).filter(Boolean);
     if(dates.length)check(ids.every(id=>events.get(id)?.event.at&&Date.parse(events.get(id).event.at)<=Math.min(...dates.map(cutoff))),label+' coalescing target must not postdate the statement');
    }
   }
  }
 }
 for(const d of decisions)if(d.disposition==='used')check(referenced.has(d.source_id),'Used source has no record or pending reference '+d.source_id);
 if(packet.completion?.review==='complete')check(pending.length===0&&records.every(t=>t.review?.status==='approved')&&!decisions.some(d=>d.disposition==='hold'),'Review cannot be complete with holds or unreviewed candidates');
 if(packet.completion?.review==='complete'&&decisions.some(d=>['context','no_judgment'].includes(d.disposition))){const o=packet.omission_review;check(filled(o?.reviewer)&&filled(o?.method)&&filled(o?.reason)&&Array.isArray(o?.source_ids)&&o.source_ids.length>0&&o.source_ids.every(id=>sourceMap.has(id)&&['context','no_judgment'].includes(dispositions.get(id)?.disposition)),'Complete review needs a recorded omission sample');}
 validatePacketMediaAudit({...packet,records},sourceMap,check,{required:strictGeneration});
 if(strictGeneration)validateGenerationContract(packet,{baseline,check,warnings,requireLatest:requireGenerationContract});
 if(strictGeneration)validateObjectGrouping(records,packet.object_overlap_reviews,sourceMap,check,packet);
 if(requireRunReview||packet.generation_policy?.review_contract||baseline?.generation_policy?.review_contract)validateRunReview(packet,check);
 if(baseline){
  for(const s of baseline.sources||[]){check(sourceMap.has(s.id)&&sourceMap.get(s.id).text_sha256===s.text_sha256,'Prior source revision removed/overwritten '+s.id);
   if(s.media)check(sameValue(sourceMap.get(s.id),s),'Prior media provenance changed; retain the source and create a new revision '+s.id);
  }
  for(const old of baseline.records||[]){const current=recordMap.get(old.id);check(!!current,'Prior record removed '+old.id);if(!current)continue;for(const e of old.events||[]){const next=current.events?.find(n=>n.id===e.id);const protectedFields=['id','type','canonical_event_id','at','date_basis','source_ids','context_source_ids','support','action','revision_of_event_id'];check(!!next&&protectedFields.every(k=>JSON.stringify(next[k])===JSON.stringify(e[k])),'Historical evidence removed/rewritten '+e.id);if(next&&(next.title!==e.title||next.description!==e.description))check(packet.editorial_revisions?.some(r=>r.event_id===e.id&&r.previous_title===e.title&&r.previous_description===e.description&&filled(r.reason)&&date(r.reviewed_at)&&r.reviewed_at!==null),'Historical copy changed without a retained editorial revision '+e.id);}}
  if(strictGeneration)for(const old of baseline.records||[])for(const event of old.events||[]){
   const next=recordMap.get(old.id)?.events?.find(e=>e.id===event.id);if(!next)continue;
   if(allowEditorialCorrections){const {title,description,...rest}=next,{title:oldTitle,description:oldDescription,...prior}=event;check(sameValue(rest,prior),'Frozen historical fields changed '+event.id);}
   else check(sameValue(next,event),'Append-only history changed '+event.id+'; explicit correction authorization is required');
  }
 }
 return {ok:errors.length===0,errors,warnings,counts:{sources:sources.length,accounted:sources.length-unaccounted.length,approved:records.filter(t=>t.review?.status==='approved'&&!t.superseded_by).length,pending:pending.length},limitations:['Structural/source-reference checks do not prove semantic correctness, source authenticity or exhaustive coverage.']};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){
 try{const args=process.argv.slice(2),file=args[0],at=args.indexOf('--baseline');if(!file)throw Error('Usage: validate-packet.mjs packet.json [--baseline previous.json] [--require-history-coverage] [--require-generation-contract] [--require-prose-limit] [--require-run-review] [--allow-editorial-corrections]');const packet=JSON.parse(fs.readFileSync(file,'utf8'));const baseline=at>=0?JSON.parse(fs.readFileSync(args[at+1],'utf8')):undefined;const result=validatePacket(packet,{baseline,requireHistoryCoverage:args.includes('--require-history-coverage'),requireGenerationContract:args.includes('--require-generation-contract'),requireProseLimit:args.includes('--require-prose-limit'),requireRunReview:args.includes('--require-run-review'),allowEditorialCorrections:args.includes('--allow-editorial-corrections')});console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;}catch(error){console.error(error.message);process.exitCode=1;}
}
