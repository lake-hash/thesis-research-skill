import {validateCardSources} from './card-source-contract.mjs';
import {validateTimelineReview} from './timeline-review-contract.mjs';
import {openingChainIssues,STANCE_OPENING_CONTRACT} from './stance-opening-contract.mjs';
import {publicTickersFromBindings,tickerStanceIssues,TICKER_STANCE_CONTRACT} from './ticker-stance-contract.mjs';
import {SOURCE_FIDELITY_CONTRACT,sourceFidelityIssues,sourceFidelityClaimIssues} from './source-fidelity-contract.mjs';
const filled=v=>typeof v==='string'&&v.trim().length>0;
const list=v=>Array.isArray(v)?v:[];
const secure=v=>{try{return new URL(v).protocol==='https:';}catch{return false;}};
const handle=v=>String(v||'').replace(/^@/,'').toLowerCase();
const time=v=>Date.parse(v);
const dayEnd=v=>time(v)+(/^\d{4}-\d{2}-\d{2}$/.test(v||'')?86399999:0);
const naturalStanceSentence=value=>filled(value)&&!/^\s*Stance\s*:/i.test(value)&&/^[A-Z0-9]/.test(value.trim())&&/[.!?]$/.test(value.trim())&&value.trim().split(/\s+/).length>=3&&value.trim().split(/\s+/).length<=30&&!value.includes('\n');
const historySourceIds=record=>[...new Set(list(record.events).flatMap(event=>[...list(event.source_ids),...list(event.context_source_ids)]))];
export const imageKey=b=>`${b.market}:${b.symbol}`;
export function rootId(record,records){const map=new Map(records.map(r=>[r.id,r])),seen=new Set();let t=record;while(t?.superseded_by&&!seen.has(t.id)){seen.add(t.id);t=map.get(t.superseded_by);}return t?.id;}
export const companyMembers=(record,records)=>records.filter(t=>rootId(t,records)===record.id);
export function sameValue(a,b){
 const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
 return JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
}
export function validateGenerationContract(packet,{baseline,check,warnings,requireLatest=false}){
 const policy=packet.generation_policy;
 const currentScope=policy?.public_scope==='source_grounded_company_analysis/1.0';
 check(['3.0','3.1','3.2'].includes(policy?.version)&&policy.grouping==='author_company'&&policy.history==='append_only'&&policy.timeline_preview_words===40&&(policy.version==='3.2'?currentScope:policy.public_scope==='fundamental_company_only/1.0'),'Generation policy 3.2 with source_grounded_company_analysis/1.0 scope is required for new runs');
 if(requireLatest||baseline?.generation_policy?.version==='3.2')check(policy?.version==='3.2','Generation policy 3.2 is required for new runs and cannot be downgraded');
 if(requireLatest||baseline?.generation_policy?.opening_contract)check(policy?.opening_contract===STANCE_OPENING_CONTRACT,'Current generation requires opening_contract: '+STANCE_OPENING_CONTRACT);
 if(policy?.version==='3.2')check(policy?.ticker_stance_contract===TICKER_STANCE_CONTRACT,'Current generation requires ticker_stance_contract: '+TICKER_STANCE_CONTRACT);
 if(policy?.version==='3.2')check(policy?.source_fidelity_contract===SOURCE_FIDELITY_CONTRACT,'Current generation requires source_fidelity_contract: '+SOURCE_FIDELITY_CONTRACT);
 const records=list(packet.records).filter(Boolean),sources=new Map(list(packet.sources).filter(Boolean).map(s=>[s.id,s]));
 const authors=new Map(list(packet.authors).filter(Boolean).map(a=>[a.id,a]));
 const priorEvents=new Set(list(baseline?.records).flatMap(t=>list(t.events).map(e=>e.id)));
 const companies=new Map(),securities=new Map(),neededImages=new Map(),neededPeople=new Set();
 for(const t of records){
  const approved=t.review?.status==='approved'&&!t.superseded_by,label='Record '+t.id;
  if(approved){check(['company','theme','asset','basket','macro'].includes(t.object_type)&&filled(t.object_key),label+' needs a resolved object_type/object_key');
   if(t.type!=='context')check(t.type==='thesis'&&t.kind!=='technical',label+' technical/setup records are outside the current public scope');
   if(t.type!=='context'){
    check(naturalStanceSentence(t.stance_sentence),label+' needs a natural directional conclusion rather than a stance label');
   for(const issue of openingChainIssues({stanceSentence:t.stance_sentence,body:t.description,subject:t.opening_plan?.subject,openingPlan:t.opening_plan,tickerStances:t.ticker_stances}))check(false,label+' '+issue);
   for(const issue of sourceFidelityIssues({prose:`${t.stance_sentence}\n${t.description}`,sources,allowedSourceIds:historySourceIds(t)}))check(false,label+' '+issue);
   for(const claim of list(t.card_claims))for(const issue of sourceFidelityClaimIssues(claim,sources))check(false,label+' '+issue);
   }
   if(t.object_type==='company'){
    check(t.type==='thesis'||t.type==='context',label+' company trades belong inside a company thesis, not a standalone setup');
    const key=t.author_id+'|'+t.object_key;check(!companies.has(key),label+' duplicates author-company '+companies.get(key));companies.set(key,t.id);
    for(const b of list(t.asset_bindings).filter(b=>b?.role==='primary')){
     check(b.entity_key===t.object_key,label+' primary binding entity_key differs from company identity');
     const key=t.author_id+'|'+imageKey(b);check(!securities.has(key)||securities.get(key)===t.id,label+' duplicates the same company security under another object_key');securities.set(key,t.id);
    }
   }
  }
  const events=list(t.events).filter(Boolean),closed=new Set();
  for(const e of events){
   const el=label+' event '+e.id;
   if(!priorEvents.has(e.id))check(Array.isArray(e.asset_bindings),el+' needs frozen asset_bindings');
   else if(!Array.isArray(e.asset_bindings))warnings.push(el+' retains a legacy snapshot without ticker bindings');
   if(e.action?.kind!=='none'&&e.action?.kind){
    if(!priorEvents.has(e.id))check(filled(e.episode_id)&&filled(e.account_id),el+' action needs episode_id and account_id (not_disclosed if unknown)');
    const episode=e.account_id+'|'+e.episode_id;
    if(e.account_id&&e.episode_id&&e.account_id!=='not_disclosed'&&e.episode_id!=='not_disclosed'){
     if(['open','increase'].includes(e.action.kind)&&e.action.basis==='reported_execution')check(!closed.has(episode),el+' reopens a closed trading episode');
     if(e.action.kind==='close'&&e.action.basis==='reported_execution')closed.add(episode);
    }
   }
   for(const id of list(e.context_source_ids)){
    const s=sources.get(id),at=s?.spoken_at||s?.published_at;
    if(e.at&&at)check(time(at)<=dayEnd(e.at),el+' uses future context');
   }
   for(const b of list(e.asset_bindings).filter(Boolean)){
    check(filled(b.entity_name)&&filled(b.symbol)&&filled(b.market)&&['primary','vehicle','related'].includes(b.role),el+' invalid historical binding');
    check(list(b.source_ids).length>0,el+' historical binding needs source evidence');
    for(const id of list(b.source_ids)){const s=sources.get(id);check(!!s,el+' historical binding has unknown source');const at=s?.spoken_at||s?.published_at;if(e.at&&at)check(time(at)<=dayEnd(e.at),el+' binding imports a later source');}
   }
  }
  if(approved&&t.type!=='context'){
   neededPeople.add(t.author_id);
   const members=companyMembers(t,records),history=members.flatMap(m=>list(m.events)),lookup=new Map(history.map(e=>[e.id,e]));
   if(['3.1','3.2'].includes(policy?.version))validateTimelineReview(t,history,sources,check,{fundamentalOnly:policy.version==='3.1',allowMixed:policy.version==='3.2'});
   if(['3.1','3.2'].includes(policy?.version))validateCardSources(t,history,sources,check);
   if(policy?.version==='3.2')for(const issue of tickerStanceIssues({tickerStances:t.ticker_stances,tickers:publicTickersFromBindings(t.asset_bindings),sources,allowedSourceIds:history.flatMap(event=>[...list(event.source_ids),...list(event.context_source_ids)])}))check(false,label+' '+issue);
   const review=t.primary_source_review,eligible=list(review?.eligible_event_ids);
   check(filled(review?.reason)&&eligible.length>0&&eligible.every(id=>lookup.has(id)),label+' needs reviewed eligible primary events');
   const selected=lookup.get(t.primary_event_id),source=sources.get(t.primary_source_id);
   check(!!selected&&eligible.includes(t.primary_event_id),label+' primary event is not reviewed eligible');
   check(!!source&&list(selected?.source_ids).includes(t.primary_source_id)&&list(source.author_ids).includes(t.author_id),label+' primary source/event mismatch');
   const field=selected?.date_basis==='spoken'?'spoken_at':'published_at';
   check(!!selected?.at&&source?.[field]===selected.at,label+' primary date must match its selected original source');
   if(selected?.at)check(eligible.every(id=>!lookup.get(id)?.at||time(lookup.get(id).at)<=time(selected.at)),label+' primary event is not the latest eligible statement');
   for(const m of members){
    for(const b of [...list(m.asset_bindings),...list(m.events).flatMap(e=>list(e.asset_bindings))].filter(b=>b&&['primary','vehicle'].includes(b.role))){
     const key=imageKey(b),existing=neededImages.get(key);
     if(existing?.listing_region&&b.listing_region)check(existing.listing_region===b.listing_region,'Conflicting listing regions for picture '+key);
     if(!existing)neededImages.set(key,b);
    }
    for(const s of list(m.signals))neededPeople.add(s.author_id);
   }
  }
 }
 check(Array.isArray(packet.images),'Generation requires an image lookup catalog');
 const images=new Map();
 for(const image of list(packet.images).filter(Boolean)){
  const key=image.kind+':'+image.key;check(filled(image.key),'Picture lookup needs an identity key');check(!images.has(key),'Duplicate picture lookup '+key);images.set(key,image);
  check(['person','security'].includes(image.kind),'Invalid image kind '+key);
  check(['matched','image_not_provided','not_found','identity_mismatch','request_failed','not_applicable'].includes(image.status),'Invalid image status '+key);
  if(image.status!=='matched'){check(image.url===null&&filled(image.reason),'Missing image needs null URL and reason '+key);continue;}
  check(secure(image.url),'Matched image needs an HTTPS URL '+key);
  if(image.kind==='person'){
   check(/^\/api\/v1\/persons(?:\/[^?]+)?$/.test(image.endpoint||''),'Person image must use persons endpoint '+key);
   check(filled(image.person_id),'Person image needs a resolved person ID '+key);
   if(image.identity_basis==='social_handle'){check(filled(image.requested_handle)&&handle(image.requested_handle)===handle(image.resolved_handle),'Person picture handle mismatch '+key);if(authors.get(image.key)?.handle)check(handle(authors.get(image.key).handle)===handle(image.requested_handle),'Person picture belongs to another author '+key);}
   else check(image.identity_basis==='verified_identity'&&image.verified_author_id===image.key&&secure(image.identity_evidence_url),'Person picture lacks verified identity '+key);
  }else{
   check(['/api/v1/stocks/company/detail','/api/v1/stocks/non-us/company/detail'].includes(image.endpoint),'Security picture endpoint mismatch '+key);
   const b=neededImages.get(image.key);
   if(b)check(image.requested_symbol===b.symbol,'Picture requested symbol differs from binding '+key);
   if(b?.listing_region==='US')check(image.endpoint==='/api/v1/stocks/company/detail','US picture uses wrong endpoint '+key);
   if(b?.listing_region==='non-US')check(image.endpoint==='/api/v1/stocks/non-us/company/detail','Non-US picture uses wrong endpoint '+key);
   if(image.identity_basis==='exact_symbol')check(image.requested_symbol===image.resolved_symbol,'Security picture symbol mismatch '+key);
   else check(image.identity_basis==='same_issuer'&&b&&['equity','adr','preferred_equity'].includes(b.instrument_type)&&filled(b.entity_key)&&image.verified_entity_key===b.entity_key&&secure(image.identity_evidence_url),'Invalid same-issuer picture match '+key);
  }
 }
 for(const id of neededPeople)check(images.has('person:'+id),'Missing person picture lookup '+id);
 for(const key of neededImages.keys())check(images.has('security:'+key),'Missing security picture lookup '+key);
}
