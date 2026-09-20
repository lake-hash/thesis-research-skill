import crypto from 'node:crypto';

export const CANDIDATE_ACCOUNTING_CONTRACT='triage-candidate-accounting/1.0';

const list=value=>Array.isArray(value)?value:[];
const filled=value=>typeof value==='string'&&value.trim().length>0;
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'
 ?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
export const HARD_EXCLUSION_BASES=new Set([
 'authorship_not_owned',
 'object_unresolved',
 'ticker_unverified',
 'what_missing',
 'why_missing',
 'investment_landing_missing',
 'technical_only',
 'duplicate_or_repeat',
 'position_or_performance_only',
 'context_incomplete'
]);

export function triageCandidateHash(triage){
 return digest({version:triage?.version||null,decisions:list(triage?.decisions)});
}

export function isCompleteTriageCandidate(decision){
 return decision?.authorship==='author_owned'
  &&['resolved','inherited'].includes(decision.investable_object)
  &&decision.what_present===true
  &&decision.why_present===true
  &&['new_reason','new_evidence','changed_condition'].includes(decision.possible_increment)
  &&['fundamental','mixed'].includes(decision.content_domain)
  &&list(decision.ticker_hints).some(filled);
}

function publicEventIndex(packet){
 const events=new Map(),sourceIds=new Set();
 for(const record of list(packet?.records)){
  const reviewByEvent=new Map(list(record?.timeline_review).map(row=>[row?.event_id,row]));
  for(const event of list(record?.events)){
   if(!event?.id)continue;
   events.set(event.id,event);
   const publicExpression=event.id===record.primary_event_id||reviewByEvent.get(event.id)?.disposition==='update';
   if(publicExpression)for(const id of list(event.source_ids))sourceIds.add(id);
  }
 }
 return{events,sourceIds};
}

export function validateCandidateAccounting(triage,packet,review){
 const errors=[],warnings=[],check=(condition,message)=>{if(!condition)errors.push(message);};
 check(triage&&typeof triage==='object'&&!Array.isArray(triage),'Triage artifact must be an object');
 check(packet&&typeof packet==='object'&&!Array.isArray(packet),'Packet must be an object');
 if(errors.length)return{ok:false,errors,warnings,counts:{triage_candidates:0,complete_candidates:0,public:0,pending:0,reassessed:0}};

 const triageRows=list(triage.decisions),triageBySource=new Map();
 for(const row of triageRows){
  check(filled(row?.source_id),'Triage decision needs source_id');
  if(!filled(row?.source_id))continue;
  check(!triageBySource.has(row.source_id),'Duplicate triage decision '+row.source_id);
  triageBySource.set(row.source_id,row);
 }
 const candidates=triageRows.filter(row=>row?.disposition==='candidate');
 const auditedRows=triageRows.filter(row=>row?.disposition==='candidate'||isCompleteTriageCandidate(row));
 if(Number.isInteger(triage?.counts?.candidate))check(triage.counts.candidate===candidates.length,'Triage candidate count does not match decisions');

 const sources=new Map(list(packet.sources).map(source=>[source?.id,source]));
 const packetDecisions=new Map(list(packet.decisions).map(decision=>[decision?.source_id,decision]));
 const pendingSources=new Set(list(packet.pending).flatMap(item=>list(item?.source_ids)));
 const retainedSources=new Set(list(packet.records).flatMap(record=>list(record?.events).flatMap(event=>list(event?.source_ids))));
 const {events,sourceIds:publicSources}=publicEventIndex(packet);

 const reassessments=list(review?.decisions),reviewBySource=new Map();
 if(review!==undefined){
  check(review?.version===CANDIDATE_ACCOUNTING_CONTRACT,'Candidate review must use '+CANDIDATE_ACCOUNTING_CONTRACT);
  check(review?.triage_sha256===triageCandidateHash(triage),'Candidate review is stale for the supplied triage artifact');
  check(filled(review?.reviewer)&&filled(review?.reviewed_at)&&Number.isFinite(Date.parse(review.reviewed_at)),'Candidate review needs reviewer and reviewed_at');
 }
 for(const row of reassessments){
  check(filled(row?.source_id),'Candidate reassessment needs source_id');
  if(!filled(row?.source_id))continue;
  check(!reviewBySource.has(row.source_id),'Duplicate candidate reassessment '+row.source_id);
  reviewBySource.set(row.source_id,row);
  check(auditedRows.some(item=>item.source_id===row.source_id),'Candidate reassessment references a source outside candidate conservation '+row.source_id);
 }

 let complete=0,publicCount=0,pendingCount=0,reassessedCount=0;
 for(const candidate of auditedRows){
  const id=candidate.source_id,label='Triage source '+id,source=sources.get(id),packetDecision=packetDecisions.get(id);
  check(!!source,label+' is missing from the packet source archive');
  check(!!packetDecision&&filled(packetDecision.reason),label+' is missing a packet disposition and reason');
  const completeCandidate=isCompleteTriageCandidate(candidate);
  if(completeCandidate)complete++;
  if(publicSources.has(id)){publicCount++;continue;}
  if(pendingSources.has(id)){pendingCount++;continue;}
  if(!completeCandidate){
   if(!retainedSources.has(id)&&!['context','no_judgment','duplicate','hold'].includes(packetDecision?.disposition))warnings.push(label+' is not retained and needs a clearer non-public disposition');
   continue;
  }
  const reassessment=reviewBySource.get(id);
  check(!!reassessment,label+' has object, ticker, what, why and a material increment but disappeared from public output without evidence-bound reassessment');
  if(!reassessment)continue;
  reassessedCount++;
  check(reassessment.decision==='exclude','Complete candidate reassessment must explicitly exclude the source or retain it as pending: '+id);
  check(HARD_EXCLUSION_BASES.has(reassessment.basis),label+' uses an invalid exclusion basis; event-watch, macro framing or volatility language are not exclusion rules');
  check(filled(reassessment.reason),label+' reassessment needs a concrete reason');
  const evidence=list(reassessment.evidence);
  check(evidence.length>0,label+' reassessment needs exact source evidence');
  for(const item of evidence)check(filled(item?.quote)&&source?.text?.includes(item.quote)&&filled(item?.explanation),label+' reassessment evidence must quote the original source and explain the hard failure');
  if(reassessment.basis==='duplicate_or_repeat'){
   const covered=list(reassessment.covered_by_event_ids);
   check(covered.length>0&&covered.every(eventId=>events.has(eventId)),label+' duplicate exclusion needs public covered_by_event_ids');
   const candidateAt=Date.parse(source?.spoken_at||source?.published_at);
   check(covered.every(eventId=>{const eventAt=Date.parse(events.get(eventId)?.at);return Number.isFinite(eventAt)&&Number.isFinite(candidateAt)&&eventAt<=candidateAt;}),label+' duplicate exclusion cannot point to later events');
  }
 }

 for(const id of reviewBySource.keys())if(publicSources.has(id))warnings.push('Public candidate has an unnecessary exclusion reassessment '+id);
 return{ok:errors.length===0,errors,warnings,counts:{triage_candidates:candidates.length,audited_sources:auditedRows.length,complete_candidates:complete,public:publicCount,pending:pendingCount,reassessed:reassessedCount}};
}
