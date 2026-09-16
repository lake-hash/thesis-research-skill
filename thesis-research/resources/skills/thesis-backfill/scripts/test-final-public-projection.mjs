import assert from 'node:assert/strict';
import test from 'node:test';
import {FINAL_PUBLIC_REVIEW,presentationHash,validateFinalProjection} from './final-public-projection.mjs';

const packet=()=>({
 sources:[
  {id:'s-main',url:'https://example.com/main',published_at:'2026-09-15T10:00:00Z'},
  {id:'s-update',url:'https://example.com/update',published_at:'2026-09-16T10:00:00Z'}
 ],
 records:[{
  id:'acme',type:'thesis',review:{status:'approved'},primary_event_id:'e-main',primary_source_id:'s-main',
  events:[
   {id:'e-main',at:'2026-09-15T10:00:00Z',source_ids:['s-main']},
   {id:'e-update',at:'2026-09-16T10:00:00Z',source_ids:['s-update']}
  ]
 }]
});
const presentation=()=>({generation_version:'3.1',cards:[{
 id:'acme',description:'Acme can grow because recurring demand supports higher utilization.',at:'2026-09-15T10:00:00Z',
 primary_source_id:'s-main',source_url:'https://example.com/main',assets:[{symbol:'ACME'}],
 timeline:[{id:'e-update',at:'2026-09-16T10:00:00Z',preview:'New contracts improve visibility.',show_more:false,assets:[{symbol:'ACME'}],source_url:'https://example.com/update',detail_id:'acme:e-update'}]
}],details:[{id:'acme:e-update',record_id:'acme',at:'2026-09-16T10:00:00Z',description:'New contracts improve visibility because customers committed for longer periods.',source_id:'s-update',source_url:'https://example.com/update',assets:[{symbol:'ACME'}]}]});
const review=view=>({schema_version:FINAL_PUBLIC_REVIEW,reviewer:'review-fixture',reviewed_at:'2026-09-16T12:00:00Z',presentation_sha256:presentationHash(view),review_scope:'all_visible_expressions',total_visible_expressions:2,completed_expressions:2,expressions:[
 {id:'card:acme',decision:'approved',reason:'Direct source-backed company judgment.',source_id:'s-main',source_url:'https://example.com/main',published_at:'2026-09-15T10:00:00Z',tickers:['ACME'],what:'Acme can grow.',why:'Recurring demand supports utilization.',content_domain:'fundamental',conclusion_first:true,opening_conclusion:'Acme can grow.',opening_reason:'Recurring demand supports utilization.',direct_voice:true,no_inference:true,source_fidelity:true,ticker_complete:true,media_complete:true},
 {id:'timeline:acme:e-update',decision:'approved',reason:'New contract duration changes visibility.',source_id:'s-update',source_url:'https://example.com/update',published_at:'2026-09-16T10:00:00Z',tickers:['ACME'],what:'Visibility improved.',why:'Customers committed for longer.',content_domain:'fundamental',conclusion_first:true,opening_conclusion:'Visibility improved.',opening_reason:'Customers committed for longer.',increment_kind:'evidence',increment_domain:'fundamental',increment:'Longer contracts improve revenue visibility.',direct_voice:true,no_inference:true,source_fidelity:true,ticker_complete:true,media_complete:true}
]});

test('complete final public review passes',()=>{const p=packet(),v=presentation(),r=review(v);assert.deepEqual(validateFinalProjection(p,v,r).errors,[]);});
test('review is bound to the exact final presentation',()=>{const p=packet(),v=presentation(),r=review(v);v.cards[0].description+=' Changed.';assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('stale')));});
test('source narration is blocked in final prose',()=>{const p=packet(),v=presentation();v.cards[0].description='The source says Acme can grow.';const r=review(v);assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('source/reviewer narration')));});
test('main source cannot repeat in Timeline',()=>{const p=packet(),v=presentation();v.cards[0].timeline[0].source_url=v.cards[0].source_url;v.details[0].source_url=v.cards[0].source_url;const r=review(v);r.expressions[1].source_url=v.cards[0].source_url;assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('repeats the main-card source')));});
test('Timeline needs an explicit material increment',()=>{const p=packet(),v=presentation(),r=review(v);delete r.expressions[1].increment;assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('actual thesis increment')));});
test('final review rejects technical-only content and delayed conclusions',()=>{const p=packet(),v=presentation(),r=review(v);r.expressions[0].content_domain='technical_only';assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('technical-only')));const q=review(v);delete q.expressions[0].opening_reason;assert(validateFinalProjection(p,v,q).errors.some(error=>error.includes('conclusion-first')));});
test('final review rejects mixed technical increments from public output',()=>{const p=packet(),v=presentation(),r=review(v);Object.assign(r.expressions[1],{content_domain:'mixed',increment_domain:'mixed',fundamental_increment:'Customers committed for longer periods.'});assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('fundamental-only')));});
test('final review must cover every visible expression, not a sample',()=>{const p=packet(),v=presentation(),r=review(v);r.completed_expressions=1;assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('counts must equal')));r.completed_expressions=2;r.review_scope='sample';assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('all visible')));});
test('tickerless update requires explicit record-level resolution',()=>{const p=packet(),v=presentation();v.cards[0].timeline[0].assets=[];v.details[0].assets=[];const r=review(v);r.expressions[1].tickers=[];assert(validateFinalProjection(p,v,r).errors.some(error=>error.includes('record-level resolution')));r.expressions[1].object_resolution='record';assert.deepEqual(validateFinalProjection(p,v,r).errors,[]);});
