import test from 'node:test';
import assert from 'node:assert/strict';
import {exportCards,validateCard} from './export-thesis-cards.mjs';
import links from '../../thesis-backfill/scripts/source-links.cjs';
export function fixture(){
 const author='local-mon',thesis='company:example';
 const sources=[0,1,2].map(n=>({id:`source-${n}`,revision:'v1',authorIds:[author],url:`https://example.invalid/post/${n}`,displayName:'mon · X',text:`原文 ${n}\nOriginal statement ${n}.`,at:`2026-09-0${n+1}T12:00:00Z`,exportAllowed:true}));
 return {schemaVersion:'thesis-export-input/1.0',runId:'fixture-run',timePolicy:'expression_time',authorMap:[{internalAuthorId:author,authorId:'backend-mon'}],assignments:{authority:'fixture',revision:'fixture-map',entries:[{authorId:'backend-mon',internalThesisKey:thesis,thesisId:1}]},sources,items:sources.map((s,n)=>({internalAuthorId:author,internalThesisKey:thesis,eventId:`event-${n}`,type:n?'thesis_update':'new_thesis',mode:'history_event',eventType:n?'EVIDENCE':'FIRST_OBSERVED',at:s.at,description:`Reviewed statement ${n}.\n\nA distinct supporting paragraph.`,sourceIds:[s.id],primarySourceId:s.id,assetBindings:[{role:'primary',symbol:'EXAMPLE',direction:'bullish',verified:true},{role:'related',symbol:'OTHER',verified:true}],media:[],originStatus:'unknown',baselineVersion:n?'v1':null,review:{status:'approved',id:`review-${n}`,reviewer:'fixture-reviewer',method:'synthetic fixture; not real approval'}}))};
}
test('Seven-field cards share the assigned ID and carry named body links, not raw source text',()=>{const p=fixture(),before=JSON.stringify(p),o=exportCards(p);assert.equal(o.cards.length,3);assert.deepEqual(o.cards.map(c=>c.thesisId),[1,1,1]);assert.equal(o.cards[1].createdAtMs,Date.parse(p.sources[1].at));assert.equal(links.split(o.cards[1].body).prose,p.items[1].description);assert.equal(links.split(o.cards[0].body).links[0].url,p.sources[0].url);assert.deepEqual(Object.keys(o.cards[0]),['thesisId','type','createdAtMs','author','body','tickers','media']);assert.equal(JSON.stringify(p),before);assert(!JSON.stringify(o.cards).includes(p.sources[0].text));assert.deepEqual(o.cards[0].tickers,[{symbol:'EXAMPLE',direction:'bullish'}]);assert.deepEqual(o.cards[0].media,[]);assert.equal(o.manifest.productionIds,false);assert.ok(o.cards.every(c=>validateCard(c).ok));});
test('rerun is byte-stable and duplicate delivery emits only one card per event',()=>{const p=fixture(),a=exportCards(p);assert.deepEqual(a,exportCards(p));p.items.push(structuredClone(p.items[1]));const b=exportCards(p);assert.equal(b.cards.length,3);assert.equal(b.manifest.duplicates.length,1);assert.equal(new Set(b.manifest.items.map(x=>x.idempotencyKey)).size,3);});
test('conflicting event content cannot slip through as the first version',()=>{const p=fixture();const x=structuredClone(p.items[1]);x.description='A changed assertion';p.items.push(x);const o=exportCards(p);assert.equal(o.cards.length,2);assert.equal(o.holds.length,2);});
test('same numbers for different authors allowed, collision for same author rejected',()=>{const p=fixture();p.assignments.entries.push({authorId:'another',internalThesisKey:'another-company',thesisId:1});assert.equal(exportCards(p).cards.length,3);p.assignments.entries.push({authorId:'backend-mon',internalThesisKey:'different-company',thesisId:1});assert.throws(()=>exportCards(p),/collision/);});
for(const [name,mutate] of [
 ['no assignment',p=>p.assignments.entries=[]],
 ['unknown author',p=>p.authorMap=[]],
 ['hold cannot export',p=>p.items[0].review.status='hold'],
 ['source-only cannot export even with approval',p=>p.items[1].eventDisposition='source_only'],
 ['held event cannot export even with approval',p=>p.items[1].eventDisposition='hold'],
 ['unresolved event disposition cannot export',p=>p.items[1].eventDisposition='pending'],
 ['empty body',p=>p.items[0].description=''],
 ['no target',p=>p.items[0].assetBindings=[]],
 ['duplicate symbol',p=>p.items[0].assetBindings.push({role:'vehicle',symbol:'example',direction:'bullish',verified:true})],
 ['unresolved binding',p=>p.items[0].assetBindings[0].verified=false],
 ['proxy disclosure absent',p=>p.items[0].assetBindings[0].basis='alva_proxy'],
 ['unknown source',p=>p.items[0].sourceIds=['missing']],
 ['empty sources',p=>p.items[0].sourceIds=[]],
 ['source link explicitly restricted',p=>p.sources[0].linkAllowed=false],
 ['wrong author primary',p=>p.sources[0].authorIds=['other']],
 ['source-date mismatch',p=>p.items[0].at='2026-09-02T12:00:00Z'],
 ['invalid calendar date',p=>{p.sources[0].at='2026-02-30T12:00:00Z';p.items[0].at=p.sources[0].at;}],
 ['future context',p=>p.items[0].sourceIds.push('source-2')],
 ['missing media field',p=>delete p.items[0].media],
 ['chart without preview',p=>p.items[0].media=[{type:'priceChart',url:'https://example.invalid/chart'}]],
 ['generated title forbidden',p=>p.items[0].title='headline'],
 ['unreviewed legacy reaffirmation stays internal',p=>p.items[0].eventType='REAFFIRM'],
 ['null item does not crash',p=>p.items[0]=null],
 ['null binding does not crash',p=>p.items[0].assetBindings=[null]],
 ['update needs baseline',p=>p.items[0]={...p.items[0],type:'thesis_update',eventType:'POSITION',baselineVersion:null}]
])test(name,()=>{const p=fixture();mutate(p);const o=exportCards(p);assert.ok(o.holds.length>=1);});
test('source hash and ambiguous source IDs fail batch',()=>{const p=fixture();p.sources[0].textSha256='false';assert.throws(()=>exportCards(p),/hash/);delete p.sources[0].textSha256;p.sources.push(p.sources[0]);assert.throws(()=>exportCards(p),/source identity/);});
test('card title and sources forbidden; named links are not card titles',()=>{const c=exportCards(fixture()).cards[0];assert.ok(validateCard(c).ok);c.title='bad';assert.equal(validateCard(c).ok,false);delete c.title;c.sources=[];assert.equal(validateCard(c).ok,false);delete c.sources;c.body='A view. [Click here](https://example.invalid/post)';assert.equal(validateCard(c).ok,false);});
test('image and chart URL behavior and paragraph preservation',()=>{const p=fixture();p.items[0].media=[{type:'image',coverUrl:'https://example.invalid/photo'},{type:'priceChart',coverUrl:'https://example.invalid/chart-preview',url:'https://example.invalid/chart'}];const o=exportCards(p);assert.equal(o.cards[0].media.length,2);assert.equal(links.split(o.cards[0].body).prose,p.items[0].description);});

test('same thesis cannot create a second first-card under another event ID',()=>{const p=fixture();p.items[1].type='new_thesis';p.items[1].eventType='FIRST_OBSERVED';assert.equal(exportCards(p).cards.length,0);});
test('current snapshot cannot be silently inserted alongside history cards',()=>{const p=fixture();p.items[0].mode='current_snapshot';assert.equal(exportCards(p).cards.length,0);});
test('append-only batch uses existing assignment without manufacturing first card',()=>{const p=fixture();p.items=p.items.slice(1);const o=exportCards(p);assert.equal(o.cards.length,2);assert.ok(o.cards.every(c=>c.type==='thesis_update'&&c.thesisId===1));});
