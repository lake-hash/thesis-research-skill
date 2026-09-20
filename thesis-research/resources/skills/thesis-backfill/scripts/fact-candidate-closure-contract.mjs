import {CANDIDATE_ACCOUNTING_CONTRACT,HARD_EXCLUSION_BASES,isCompleteTriageCandidate,triageCandidateHash} from './candidate-accounting-contract.mjs';

const list=value=>Array.isArray(value)?value:[];
const filled=value=>typeof value==='string'&&value.trim().length>0;

export function validateFactCandidateClosure(triage,facts,archive,review){
 const errors=[],warnings=[],check=(condition,message)=>{if(!condition)errors.push(message);};
 const sources=new Map(list(archive?.sources||archive).map(source=>[String(source?.id||''),source]));
 const publicSources=new Set(list(facts?.records).flatMap(record=>list(record?.events).filter(event=>event?.disposition==='public').flatMap(event=>list(event?.source_ids).map(String))));
 const heldSources=new Set(list(facts?.decisions).filter(row=>row?.disposition==='hold').map(row=>String(row.source_id)));
 const audited=list(triage?.decisions).filter(row=>row?.disposition==='candidate'||isCompleteTriageCandidate(row));
 const reviewRows=list(review?.decisions),reviewBySource=new Map();
 if(review!==undefined){check(review?.version===CANDIDATE_ACCOUNTING_CONTRACT,'Fact candidate review must use '+CANDIDATE_ACCOUNTING_CONTRACT);check(review?.triage_sha256===triageCandidateHash(triage),'Fact candidate review is stale for the supplied triage artifact');check(filled(review?.reviewer)&&Number.isFinite(Date.parse(review?.reviewed_at)),'Fact candidate review needs reviewer and reviewed_at');}
 for(const row of reviewRows){const id=String(row?.source_id||'');check(filled(id),'Fact candidate reassessment needs source_id');check(!reviewBySource.has(id),'Duplicate fact candidate reassessment '+id);reviewBySource.set(id,row);}
 let complete=0,publicCount=0,pendingCount=0,reassessedCount=0;
 for(const candidate of audited){if(!isCompleteTriageCandidate(candidate))continue;complete++;const id=String(candidate.source_id),label='Triage source '+id;if(publicSources.has(id)){publicCount++;continue;}if(heldSources.has(id)){pendingCount++;continue;}const row=reviewBySource.get(id);check(!!row,label+' disappeared before Language without evidence-bound reassessment');if(!row)continue;reassessedCount++;check(row.decision==='exclude','Fact candidate reassessment must explicitly exclude '+id);check(HARD_EXCLUSION_BASES.has(row.basis),label+' uses an invalid exclusion basis');check(filled(row.reason),label+' reassessment needs a concrete reason');const source=sources.get(id),evidence=list(row.evidence);check(evidence.length>0,label+' reassessment needs exact source evidence');for(const span of evidence)check(filled(span?.quote)&&source?.text?.includes(span.quote)&&filled(span?.explanation),label+' reassessment evidence must quote the source exactly');}
 for(const id of reviewBySource.keys())if(publicSources.has(id))warnings.push('Public fact candidate has an unnecessary exclusion reassessment '+id);
 return{ok:errors.length===0,errors,warnings,counts:{audited_sources:audited.length,complete_candidates:complete,public:publicCount,pending:pendingCount,reassessed:reassessedCount}};
}
