import assert from 'node:assert/strict';
import test from 'node:test';
import {buildWeeklyGrouping} from './weekly-group.mjs';

const event=(id,at,ticker='ACME',stance='bullish',extra={})=>({id,at,source_ids:[`source-${id}`],ticker_stances:[{ticker,stance}],what:`${ticker} is strengthening`,why:`Demand is expanding for ${ticker}`,increment:`${ticker} added new evidence`,action:{kind:'none',basis:'none'},...extra});
const packet=()=>({records:[{id:'record-acme',author_id:'author',object_key:'company:ACME',type:'thesis',primary_event_id:'e1',timeline_review:[{event_id:'e1',disposition:'update',what:'ACME is strengthening',why:'Demand is expanding',increment:'New evidence',increment_kind:'evidence'},{event_id:'e2',disposition:'update',what:'ACME is strengthening',why:'Demand is expanding',increment:'New customer evidence',increment_kind:'reason'},{event_id:'e3',disposition:'update',what:'ACME is weakening',why:'Costs are rising',increment:'New risk',increment_kind:'risk'}],events:[event('e1','2026-09-07T10:00:00Z'),event('e2','2026-09-09T10:00:00Z'),event('e3','2026-09-10T10:00:00Z','ACME','bearish')],review:{status:'approved'}}]});

test('groups same-week events with the same expression-local direction',()=>{
 const result=buildWeeklyGrouping(packet());
 assert.equal(result.groups.length,2);
 const grouped=result.groups.find(row=>row.member_event_ids.length===2);
 assert.deepEqual(grouped.member_event_ids,['e1','e2']);
 assert.equal(grouped.anchor_event_id,'e2');
 assert.equal(result.coverage.raw_events_preserved,3);
});

test('keeps stance reversals in separate weekly groups',()=>{
 const result=buildWeeklyGrouping(packet());
 assert.equal(result.groups.filter(row=>row.member_event_ids.includes('e3')).length,1);
 assert.equal(result.groups.find(row=>row.member_event_ids.includes('e3')).member_event_ids.length,1);
});

test('does not group events across weeks',()=>{
 const value=packet();value.records[0].events[1].at='2026-09-14T10:00:00Z';
 const result=buildWeeklyGrouping(value);assert.equal(result.groups.length,3);
});
