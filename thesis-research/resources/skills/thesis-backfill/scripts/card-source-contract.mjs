const list=v=>Array.isArray(v)?v:[];
const filled=v=>typeof v==='string'&&v.trim().length>0;
const roles=new Set(['core_judgment','core_reason','supporting_fact','position']);
const sourceCoversClaim=(claim,sourceId)=>list(claim.roles).every(role=>list(claim.evidence).some(span=>span.source_id===sourceId&&list(span.supports_roles).includes(role)));

export function validateCardSources(record,history,sources,check){
 const label='Record '+record.id,claims=list(record.card_claims),claimMap=new Map(),description=String(record.description||'');
 const covered=new Uint8Array(description.length);
 const historySources=new Set(history.flatMap(e=>[...list(e.source_ids),...list(e.context_source_ids)]));
 check(claims.length>0,label+' needs card_claims with source evidence');
 for(const claim of claims){
  if(!claim||typeof claim!=='object'){check(false,label+' invalid card claim');continue;}
  check(filled(claim.id)&&!claimMap.has(claim.id),label+' duplicate or missing card claim ID');claimMap.set(claim.id,claim);
  check(filled(claim.text)&&description.includes(claim.text),label+' claim text does not match current prose: '+claim.id);
  check(list(claim.roles).length>0&&claim.roles.every(r=>roles.has(r)),label+' invalid claim roles: '+claim.id);
  if(filled(claim.text))for(let at=description.indexOf(claim.text);at>=0;at=description.indexOf(claim.text,at+claim.text.length))covered.fill(1,at,at+claim.text.length);
  const evidence=list(claim.evidence);check(evidence.length>0,label+' claim has no evidence: '+claim.id);
  for(const span of evidence){const s=sources.get(span?.source_id);
   check(!!s&&historySources.has(span.source_id),label+' claim source is absent from company history: '+claim.id);
   check(filled(span?.quote)&&s?.text?.includes(span.quote),label+' claim has unsupported exact evidence: '+claim.id);
   check(list(span?.supports_roles).length>0&&span.supports_roles.every(role=>list(claim.roles).includes(role)),label+' evidence needs specific supported roles: '+claim.id);
  }
  check(list(claim.roles).every(role=>evidence.some(span=>list(span?.supports_roles).includes(role))),label+' claim roles lack evidence: '+claim.id);
  if(list(claim.roles).some(r=>r==='core_judgment'||r==='core_reason'))check(evidence.some(span=>{const s=sources.get(span?.source_id);return s?.source_level==='primary'&&list(s.author_ids).includes(record.author_id);}),label+' core claim lacks author-owned primary evidence: '+claim.id);
 }
 check(description.split('').every((char,index)=>!/[\p{L}\p{N}]/u.test(char)||covered[index]),label+' prose contains unmapped claims');
 for(const role of ['core_judgment','core_reason'])check(claims.some(c=>list(c?.roles).includes(role)),label+' needs '+role+' claim coverage');
 const review=record.primary_source_review,candidates=list(review?.candidates),events=new Map(history.map(e=>[e.id,e])),eligible=new Set(),seen=new Set();
 const core=claims.filter(c=>list(c?.roles).some(r=>r==='core_judgment'||r==='core_reason'));
 check(candidates.length>0,label+' needs reviewed primary source candidates');
 for(const candidate of candidates){
  if(!candidate||typeof candidate!=='object'){check(false,label+' invalid primary candidate');continue;}
  const key=candidate.event_id+'|'+candidate.source_id,e=events.get(candidate.event_id),s=sources.get(candidate.source_id);
  check(!seen.has(key),label+' duplicate primary candidate');seen.add(key);
  check(!!e&&list(e.source_ids).includes(candidate.source_id)&&s?.source_level==='primary'&&list(s.author_ids).includes(record.author_id),label+' invalid primary candidate source');
  check(['analysis','brief_thesis','position_update','reaction'].includes(candidate.kind)&&filled(candidate.reason),label+' primary candidate needs kind and reason');
  const ids=list(candidate.covered_claim_ids);
  check(Array.isArray(candidate.covered_claim_ids)&&ids.every(id=>claimMap.has(id)),label+' primary candidate claims are unknown');
  check(ids.every(id=>claimMap.has(id)&&sourceCoversClaim(claimMap.get(id),candidate.source_id)),label+' primary candidate overstates source coverage');
  const coversCore=core.length>0&&core.every(claim=>ids.includes(claim.id)&&sourceCoversClaim(claim,candidate.source_id));
  if(['analysis','brief_thesis'].includes(candidate.kind)&&coversCore)eligible.add(candidate.event_id);
 }
 const declared=list(review?.eligible_event_ids);
 check(declared.length===eligible.size&&declared.every(id=>eligible.has(id)),label+' eligible sources do not match core-claim coverage');
 const chosen=candidates.find(c=>c?.event_id===record.primary_event_id&&c.source_id===record.primary_source_id);
 const newestEligible=Math.max(...[...eligible].map(id=>Date.parse(events.get(id)?.at)).filter(Number.isFinite));
 if(Number.isFinite(newestEligible))check(Date.parse(events.get(record.primary_event_id)?.at)===newestEligible,label+' primary source is not the newest reviewed source covering the core claims');
 check(!!chosen&&['analysis','brief_thesis'].includes(chosen.kind)&&core.length>0&&core.every(claim=>list(chosen.covered_claim_ids).includes(claim.id)&&sourceCoversClaim(claim,chosen.source_id)),label+' primary Source does not support the core judgment and reason');
 for(const gate of ['reader_clarity','source_coverage','primary_anchor'])check(record.review?.checks?.[gate]==='pass',label+' missing '+gate+' review');
}
