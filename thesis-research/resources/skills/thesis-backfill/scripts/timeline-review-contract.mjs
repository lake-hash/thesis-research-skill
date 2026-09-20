import {TIMELINE_OPENING_CONTRACT,timelineOpeningIssues} from './stance-opening-contract.mjs';
import {publicTickersFromBindings,tickerStanceIssues} from './ticker-stance-contract.mjs';
const list=v=>Array.isArray(v)?v:[];
const text=v=>typeof v==='string'&&v.trim().length>0;
export function validateTimelineReview(record,events,sources,check,{fundamentalOnly=false,allowMixed=false}={}){
 const reviews=list(record.timeline_review),byId=new Map(events.map(e=>[e.id,e])),seen=new Set();
 check(Array.isArray(record.timeline_review),'Record '+record.id+' needs timeline_review');
 for(const r of reviews){
  const e=byId.get(r?.event_id),label='Timeline review '+r?.event_id;
  check(!!e&&!seen.has(r?.event_id),label+' has unknown or repeated event');seen.add(r?.event_id);
  check(['update','source_only','hold'].includes(r?.disposition)&&text(r?.reason),label+' needs disposition and reason');
  if(r?.disposition==='update'){
   check(text(r.what)&&text(r.why),label+' needs explicit what and why');
   check(text(r.increment),label+' needs the actual increment, not a generic sentiment label');
   check(['reason','evidence','condition','correction'].includes(r.increment_kind),label+' needs a material reason/evidence/condition/correction increment');
   if(fundamentalOnly)check(r.increment_domain==='fundamental',label+' technical-only increments are outside the current public scope');
   if(allowMixed){
    check(['fundamental','mixed'].includes(r.content_domain),label+' technical-only content cannot enter public Timeline');
    check(['fundamental','mixed'].includes(r.increment_domain),label+' needs a non-technical thesis increment');
    if(r.content_domain==='mixed'||r.increment_domain==='mixed')check(text(r.fundamental_increment),label+' mixed content needs an independently qualifying non-technical increment');
    const purposes=new Set(list(e?.support).map(span=>span?.purpose));
    check(purposes.has('judgment')&&purposes.has('reason'),label+' needs exact source support for both what and why');
    for(const issue of tickerStanceIssues({tickerStances:e?.ticker_stances,tickers:publicTickersFromBindings(e?.asset_bindings),sources,allowedSourceIds:[...list(e?.source_ids),...list(e?.context_source_ids)]}))check(false,label+' '+issue);
   }
   if(r.timeline_opening_contract!==undefined){
    check(r.timeline_opening_contract===TIMELINE_OPENING_CONTRACT,label+' needs '+TIMELINE_OPENING_CONTRACT);
    check(r.direction_visible_immediately===true&&r.mechanism_visible_immediately===true&&r.relationship_complete===true&&r.continuation_advances===true&&r.metadata_hidden_direction_clear===true,label+' needs a complete Timeline opening/progression review');
    for(const issue of timelineOpeningIssues({body:e?.description||e?.body,openingConclusion:r.opening_conclusion||r.what,openingReason:r.opening_reason||r.why,stanceClause:r.stance_clause,mechanismClause:r.mechanism_clause,stanceRealizations:r.stance_realizations,tickerStances:e?.ticker_stances,sourceExplicitDirection:r.source_explicit_direction}))check(false,label+' '+issue);
   }
  }
  if(r?.disposition==='source_only'){
   check(['repeat','commentary','position_history','technical_out_of_scope'].includes(r.basis),label+' needs repeat/commentary/position-history/technical-out-of-scope basis');
   if(r.basis==='repeat'){
    const prior=list(r.covered_by_event_ids);check(prior.length>0,label+' needs earlier supporting events');
    for(const id of prior){const p=byId.get(id);check(!!p&&p.at&&e?.at&&Date.parse(p.at)<Date.parse(e.at),label+' coverage must be strictly earlier in the same company history');}
    if(e?.action?.kind&&e.action.kind!=='none')check(prior.some(id=>{const p=byId.get(id);return id===r.same_action_event_id&&p?.action?.kind===e.action.kind&&p.action.basis===e.action.basis&&p.account_id===e.account_id&&p.episode_id===e.episode_id;}),label+' cannot hide a new action behind an earlier business argument; identify the same execution explicitly');
   }
   if(r.basis==='commentary')check(!e?.action?.kind||e.action.kind==='none',label+' cannot label an investment action as social commentary');
   if(r.basis==='position_history')check(['POSITION','CLOSED','REAFFIRM'].includes(e?.type)||e?.action?.kind&&e.action.kind!=='none',label+' position-history basis needs an actual/planned action, holding plan or result');
   if(r.basis==='technical_out_of_scope')check(fundamentalOnly||allowMixed,label+' technical-out-of-scope is valid only when technical-only content is excluded');
  }
  if(r?.disposition==='hold')check(text(r.missing_context),label+' needs the unresolved context');
  if(r?.disposition!=='update')check(r?.event_id!==record.primary_event_id,label+' cannot anchor the current card');
 }
 for(const e of events)check(seen.has(e.id),'Event '+e.id+' needs a timeline review outcome');
 const used=new Set(),groupIds=new Set();
 for(const g of list(record.disclosure_groups)){
  const ids=list(g?.event_ids);check(text(g?.id)&&text(g?.reason)&&ids.length>1,'Disclosure group needs identity, reason and multiple events');
  check(!groupIds.has(g?.id),'Repeated disclosure group ID');groupIds.add(g?.id);
  check(ids.includes(g?.anchor_event_id),'Disclosure group needs a member anchor');
  const parts=ids.map(id=>byId.get(id));let signature=null;
  for(const [i,e]of parts.entries()){
   check(!!e&&!used.has(ids[i]),'Disclosure contains missing or overlapping events');used.add(ids[i]);
   check(reviews.find(r=>r?.event_id===ids[i])?.disposition==='update','Disclosure cannot promote source-only or held material');
   for(const id of list(e?.source_ids)){
    const s=sources.get(id);
    check(text(s?.document_id)&&text(s?.document_revision),'Disclosure source needs verified document identity and revision');
    const key=JSON.stringify([s?.document_id,s?.document_revision,s?.url?.split('#')[0],e?.date_basis,e?.at]);
    if(signature===null)signature=key;else check(key===signature,'Disclosure must share document, revision and expression date');
   }
  }
 }
}
export function reviewedGroups(record,events){
 const reviews=new Map(record.timeline_review.map(r=>[r.event_id,r]));
 const documents=new Map();for(const g of record.disclosure_groups||[])for(const id of g.event_ids)documents.set(id,g);
 const groups=new Map(),excluded=[];
 for(const e of events){const review=reviews.get(e.id);if(review.disposition!=='update'){excluded.push({event_id:e.id,disposition:review.disposition,reason:review.reason,source_ids:e.source_ids});continue;}
  const doc=documents.get(e.id),key=doc?'document:'+doc.id:[e.canonical_event_id,e.date_basis,e.at,e.revision_of_event_id||''].join('|');
  if(!groups.has(key))groups.set(key,{events:[],anchor_event_id:doc?.anchor_event_id});groups.get(key).events.push(e);
 }
 return {groups:[...groups.values()],excluded};
}
