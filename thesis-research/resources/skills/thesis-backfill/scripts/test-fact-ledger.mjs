import test from 'node:test';
import assert from 'node:assert/strict';
import {FACT_LEDGER_CONTRACT,validateFactLedger} from './fact-ledger-contract.mjs';

const archive=(author='author-x',ticker='ACME')=>({sources:[{id:'s1',author_ids:[author],published_at:'2026-09-01T00:00:00Z',text:`${ticker} demand is improving because customer adoption is accelerating.`}]});
const facts=(author='author-x',ticker='ACME')=>({contract:FACT_LEDGER_CONTRACT,subject_id:author,decisions:[{source_id:'s1',disposition:'public',reason:'Complete company judgment.'}],records:[{id:'record-1',author_id:author,object_type:'company',object_key:'company:fixture',primary_source_id:'s1',events:[{id:'event-1',at:'2026-09-01T00:00:00Z',source_ids:['s1'],context_source_ids:[],disposition:'public',what:`${ticker} demand is improving.`,why:'Customer adoption is accelerating.',increment_kind:'reason',increment:'Established the demand mechanism.',ticker_stances:[{ticker,stance:'bullish',evidence:[{source_id:'s1',quote:`${ticker} demand is improving`,explanation:'Exact positive direction.'}]}]}],history_search:{version:'author-object-history/1.0',aliases:[ticker],matched_source_ids:['s1'],public_event_ids:['event-1'],source_only_source_ids:[],held_source_ids:[]}}]});

test('reviewed fact ledger is invariant to author, ticker and record labels',()=>{
 for(const [author,ticker] of [['person-a','AAA'],['person-z','9999.KS'],['another-author','CRYPTO1']]){
  const result=validateFactLedger(facts(author,ticker),archive(author,ticker));assert.equal(result.ok,true,result.errors.join('\n'));
 }
});

test('fact ledger rejects prose before language generation and future context',()=>{
 const value=facts();value.records[0].description='Generated prose too early.';
 assert(validateFactLedger(value,archive()).errors.some(error=>error.includes('generated prose')));
 const future=facts();future.records[0].events[0].context_source_ids=['s2'];const sourceArchive=archive();sourceArchive.sources.push({id:'s2',author_ids:['other'],published_at:'2026-09-02T00:00:00Z',text:'Future context.'});future.decisions.push({source_id:'s2',disposition:'context',reason:'Context.'});
 assert(validateFactLedger(future,sourceArchive).errors.some(error=>error.includes('future context')));
});
