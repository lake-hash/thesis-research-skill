import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {test} from 'node:test';
import {CANDIDATE_ACCOUNTING_CONTRACT,triageCandidateHash,validateCandidateAccounting} from './candidate-accounting-contract.mjs';

const text='$NQ can adapt to stable high yields through strong earnings, but bond volatility can still drive violent short-term moves.';
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const triage=()=>({version:'fresh-triage/1.0',counts:{candidate:1},decisions:[{source_id:'nq',authorship:'author_owned',disposition:'candidate',investable_object:'resolved',object_level:'asset',object_hints:['Nasdaq futures'],ticker_hints:['NQ'],what_present:true,why_present:true,possible_increment:'new_reason',content_domain:'mixed',reason:'Complete earnings-versus-bond-volatility judgment.'}]});
const packet=()=>({sources:[{id:'nq',text,text_sha256:sha(text),published_at:'2026-09-05T16:59:57Z'}],decisions:[{source_id:'nq',disposition:'no_judgment',reason:'Event-watch framing dominates.'}],records:[],pending:[]});
const review=(t,basis='investment_landing_missing')=>({version:CANDIDATE_ACCOUNTING_CONTRACT,triage_sha256:triageCandidateHash(t),reviewer:'Independent source-first reviewer',reviewed_at:'2026-09-19T08:00:00Z',decisions:[{source_id:'nq',decision:'exclude',basis,reason:'The original contains no source-owned investment landing after direct review.',evidence:[{quote:text,explanation:'Reviewed the complete expression against the admission contract.'}]}]});

test('Complete triage candidates cannot silently disappear as event-watch commentary',()=>{
 const result=validateCandidateAccounting(triage(),packet());
 assert.equal(result.ok,false);
 assert(result.errors.some(error=>error.includes('disappeared from public output')));
});

test('A semantically complete no_judgment triage row receives the same conservation gate',()=>{
 const t=triage();t.decisions[0].disposition='no_judgment';t.counts={candidate:0};
 const result=validateCandidateAccounting(t,packet());
 assert.equal(result.ok,false);
 assert(result.errors.some(error=>error.includes('disappeared from public output')));
});

test('Event-watch is not an allowed hard exclusion basis',()=>{
 const t=triage(),result=validateCandidateAccounting(t,packet(),review(t,'event_watch'));
 assert.equal(result.ok,false);
 assert(result.errors.some(error=>error.includes('invalid exclusion basis')));
});

test('A complete candidate passes when it becomes a public thesis expression',()=>{
 const t=triage(),p=packet();
 p.decisions[0]={source_id:'nq',disposition:'used',reason:'Retained in a public asset thesis.'};
 p.records=[{id:'nq-thesis',primary_event_id:'nq-event',timeline_review:[{event_id:'nq-event',disposition:'update'}],events:[{id:'nq-event',at:'2026-09-05T16:59:57Z',source_ids:['nq']}]}];
 const result=validateCandidateAccounting(t,p);
 assert.equal(result.ok,true,result.errors.join('\n'));
 assert.equal(result.counts.public,1);
 assert.equal(result.counts.complete_candidates,1);
});

test('A source-first hard exclusion remains possible with exact evidence',()=>{
 const t=triage(),result=validateCandidateAccounting(t,packet(),review(t));
 assert.equal(result.ok,true,result.errors.join('\n'));
 assert.equal(result.counts.reassessed,1);
});
