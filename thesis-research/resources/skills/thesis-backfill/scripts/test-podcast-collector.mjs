import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync(new URL('collect-podcasts.js',import.meta.url),'utf8');
const episode=(id,date)=>({id,episode_id:'guid-'+id,date,podcast_show_id:1,transcript:'[spk 0 @ 0] Original.'});
async function run(args,pages){
 let i=0;return vm.runInNewContext(code,{require:name=>name==='env'?{args}:name==='secret-manager'?{loadPlaintext:()=>''}:name==='net/http'?{fetch:async url=>{
  if(url.includes('/shows?'))return {ok:true,json:async()=>({success:true,data:[]})};
  const data=pages[i++];if(data instanceof Error)throw data;
  return {ok:true,json:async()=>({success:true,data:data||[]})};
 }}:null});
}
test('A bounded page budget returns a continuation instead of claiming full coverage',async()=>{
 const r=await run({speaker:'Guest',limit:1,max_pages:1},[[episode(1,'2026-09-01')]]);assert.equal(r.episodes.length,1);assert.equal(r.continuation.next_offset,1);assert.equal(r.continuation.complete_in_index_window,false);
});
test('Past-window evidence closes indexed retrieval without including older episodes',async()=>{
 const r=await run({speaker:'Guest',limit:1,max_pages:3,start_date:'2026-08-01'},[[episode(1,'2026-09-01')],[episode(2,'2026-07-01')]]);assert.equal(r.episodes.length,1);assert.equal(r.continuation.stop_reason,'past_window');assert.equal(r.continuation.complete_in_index_window,true);
});
test('A failed second page preserves the first batch and retries from the failed offset',async()=>{
 const r=await run({speaker:'Guest',limit:1,max_pages:3},[[episode(1,'2026-09-01')],Error('network unavailable')]);assert.equal(r.episodes.length,1);assert.equal(r.failures[0].offset,1);assert.equal(r.continuation.next_offset,1);assert.equal(r.continuation.complete_in_index_window,false);
});
test('Repeated pages and invalid order cannot silently duplicate or close coverage',async()=>{
 for(const second of [episode(1,'2026-09-01'),episode(2,'2026-09-02')]){const r=await run({speaker:'Guest',limit:1,max_pages:2},[[episode(1,'2026-09-01')],[second]]);assert.equal(r.episodes.length,1);assert.equal(r.failures.length,1);assert.equal(r.continuation.next_offset,1);}
});
test('Invalid inputs fail before fetching',async()=>{
 await assert.rejects(run({speaker:'Guest',max_pages:0},[]),/pagination/);await assert.rejects(run({speaker:'Guest',start_date:'2026-02-30'},[]),/start_date/);await assert.rejects(run({},[]),/speaker name/);
});
