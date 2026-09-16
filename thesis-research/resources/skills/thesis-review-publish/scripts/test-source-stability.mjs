import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {exportCards,validateCard} from './export-thesis-cards.mjs';
import {sealSourceCoverage,validateDelivery} from './source-coverage-contract.mjs';
import {validateDocumentEvidence} from '../../thesis-backfill/scripts/document-evidence-contract.mjs';
import {validateCardSources} from '../../thesis-backfill/scripts/card-source-contract.mjs';
import links from '../../thesis-backfill/scripts/source-links.cjs';
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
test('Direct export and public-card validation enforce 500 characters independently of packet flags',()=>{
 const p=fixture();p.items[0].description='a'.repeat(501);
 p.items[0].sourceCoverage=sealSourceCoverage(p.items[0],new Map(p.sources.map(s=>[s.id,s])));
 const blocked=exportCards(p);assert.equal(blocked.cards.length,0);assert(blocked.holds.some(h=>h.reason.includes('500')));
 p.items[0].description='a'.repeat(500);p.items[0].sourceCoverage=sealSourceCoverage(p.items[0],new Map(p.sources.map(s=>[s.id,s])));
 const good=exportCards(p);assert.equal(good.cards.length,1);assert(good.cards[0].body.length>500);
 assert(validateCard(good.cards[0]).ok);assert(!validateCard({...good.cards[0],body:'a'.repeat(501)}).ok);
});
test('Final delivery also rejects an oversized body after downstream formatting',()=>{
 const out=exportCards(fixture());out.cards[0].body='a'.repeat(501);
 assert(validateDelivery(out.cards,out.manifest).errors.some(e=>e.includes('500')));
});
function fixture(){
 const p=JSON.parse(fs.readFileSync(new URL('../examples/export-input.fixture.json',import.meta.url)));
 p.schemaVersion='thesis-export-input/1.1';p.items=[{...p.items[2],mode:'current_snapshot',sourceIds:['source-2','source-0'],description:'Demand remains strong.\n\nThe earlier production plan still matters.'}];
 p.items[0].sourceCoverage=sealSourceCoverage(p.items[0],new Map(p.sources.map(s=>[s.id,s])),['source-0']);return p;
}
test('An older supporting statement survives current-card export and final delivery checks',()=>{
 const p=fixture(),before=JSON.stringify(p),o=exportCards(p);assert.equal(o.holds.length,0);assert.equal(o.cards.length,1);assert.equal(links.split(o.cards[0].body).links.length,2);assert.equal(validateDelivery(o.cards,o.manifest).ok,true);assert.equal(JSON.stringify(p),before);
});
for(const [name,edit]of [
 ['drop old evidence',p=>p.items[0].sourceIds=['source-2']],
 ['add unreviewed evidence',p=>p.items[0].sourceIds.push('source-1')],
 ['change prose',p=>p.items[0].description+=' A new unsupported claim.'],
 ['change selected source',p=>{p.items[0].primarySourceId='source-0';p.items[0].at=p.sources[0].at;}],
 ['change date',p=>p.items[0].at='2026-09-04T12:00:00Z'],
 ['change source URL',p=>p.sources[0].url='https://example.invalid/unrelated'],
 ['change source text',p=>p.sources[0].text='Another original'],
 ['change speaker',p=>p.sources[0].authorIds=['another-author']],
 ['change reviewer',p=>p.items[0].review.reviewer='unreviewed-replacement'],
 ['change media attribution',p=>p.sources[0].mediaProvenance={review:{status:'pending'}}],
 ['remove prepared evidence',p=>delete p.items[0].sourceCoverage]
])test('Sealed export rejects '+name,()=>{const p=fixture();edit(p);const o=exportCards(p);assert.equal(o.cards.length,0);assert(o.holds.some(h=>/review|prepare|sourceCoverage/.test(h.reason)));});
test('Preparation cannot silently omit a claim source before sealing',()=>{
 const p=fixture();p.items[0].sourceIds=['source-2'];assert.throws(()=>sealSourceCoverage(p.items[0],new Map(p.sources.map(s=>[s.id,s])),['source-0']),/Claim evidence was omitted/);
});
test('Final delivery rejects footer loss even when a downstream formatter recomputes its card hash',()=>{
 const o=exportCards(fixture()),e=o.manifest.items[0];o.cards[0].body=links.append(links.split(o.cards[0].body).prose,[{url:e.sourceRevisions[0].url,label:e.sourceRevisions[0].linkLabel}]);
 e.contentHash=sha({card:o.cards[0],mode:e.mode,sourceVersions:e.sourceRevisions.map(s=>[s.id,s.revision])});
 assert(validateDelivery(o.cards,o.manifest).errors.some(e=>e.includes('footer')));
});
test('Final delivery rejects date drift, body drift and removed cards',()=>{
 for(const mutate of [o=>o.cards[0].createdAtMs+=86400000,o=>o.cards[0].body='Another view.',o=>o.cards=[]]){const o=exportCards(fixture());mutate(o);assert.equal(validateDelivery(o.cards,o.manifest).ok,false);}
});
test('Final delivery verifies actual attribution metadata, not only its stored fingerprint',()=>{
 const o=exportCards(fixture());o.manifest.items[0].sourceRevisions[0].media={review:{status:'pending'}};
 assert(validateDelivery(o.cards,o.manifest).errors.some(e=>e.includes('metadata changed')));
});
test('URL deduplication does not erase evidence revisions',()=>{
 const p=fixture();p.sources[0].url=p.sources[2].url;p.items[0].sourceCoverage=sealSourceCoverage(p.items[0],new Map(p.sources.map(s=>[s.id,s])));const o=exportCards(p);
 assert.equal(o.manifest.items[0].sourceRevisions.length,2);assert.equal(links.split(o.cards[0].body).links.length,1);assert(validateDelivery(o.cards,o.manifest).ok);
});
test('Legacy compatibility is explicit, not a claim of current evidence completeness',()=>{
 const p=fixture();p.schemaVersion='thesis-export-input/1.0';delete p.items[0].sourceCoverage;const o=exportCards(p);
 assert.equal(o.manifest.evidenceContract,'legacy_compatibility');assert(!validateDelivery(o.cards,o.manifest).ok);assert(validateDelivery(o.cards,o.manifest,{allowLegacy:true}).ok);
});
function documentFixture(){const text='Introduction\nCompany investment argument.\nClosing';const start=text.indexOf('Company'),end=text.indexOf('\nClosing');return {documents:[{id:'letter-v1',url:'https://example.invalid/letter.pdf',text,text_sha256:sha(text),hash_scope:'document_text',extraction_version:'fixture-extractor-v1',archive_path:'evidence/letter.txt'}],sources:[{id:'page-1',text:text.slice(start,end),text_sha256:sha(text.slice(start,end)),text_scope:'excerpt',document_ref:{document_id:'letter-v1',start_char:start,end_char:end,locator:'Page 1'}}]};}
const docErrors=(p,b)=>{const errors=[];validateDocumentEvidence(p,(ok,msg)=>{if(!ok)errors.push(msg);},b);return errors;};
test('Full-document and excerpt hashes remain separate and independently verifiable',()=>{
 const p=documentFixture();assert.deepEqual(docErrors(p),[]);assert.notEqual(p.sources[0].text_sha256,p.documents[0].text_sha256);p.sources[0].text_sha256=p.documents[0].text_sha256;assert(docErrors(p).some(s=>s.includes('parent document')));
});
test('Wrong document offsets, mislabeled full-text scope and archived revision replacement fail',()=>{
 for(const mutate of [p=>p.sources[0].document_ref.start_char++,p=>p.sources[0].text_scope='document',p=>p.documents[0].hash_scope='pdf_bytes']){const p=documentFixture();mutate(p);assert(docErrors(p).length);}
 const p=documentFixture(),old=structuredClone(p);p.documents[0].extraction_version='rewritten';assert(docErrors(p,old).some(s=>s.includes('Prior document revision')));
});
function sourceCandidates(){
 const s=id=>({id,text:'Demand supports growth.',source_level:'primary',author_ids:['a']});const sources=new Map(['old','new','reaction'].map(id=>[id,s(id)]));
 const events=['old','new','reaction'].map((id,i)=>({id,at:`2026-09-0${i+1}T12:00:00Z`,source_ids:[id]}));
 const record={id:'a-company',author_id:'a',description:'Demand supports growth.',primary_event_id:'old',primary_source_id:'old',card_claims:[{id:'core',text:'Demand supports growth.',roles:['core_judgment','core_reason'],evidence:['old','new'].map(id=>({source_id:id,quote:'Demand supports growth.',supports_roles:['core_judgment','core_reason']}))}],primary_source_review:{candidates:['old','new','reaction'].map(id=>({event_id:id,source_id:id,kind:id==='reaction'?'reaction':'analysis',reason:'Fixture source review',covered_claim_ids:id==='reaction'?[]:['core']})),eligible_event_ids:['old','new']},review:{checks:{reader_clarity:'pass',source_coverage:'pass',primary_anchor:'pass'}}};return {record,events,sources};
}
test('Choose the newest qualified analysis, not the newest activity',()=>{
 const {record,events,sources}=sourceCandidates(),errors=[];validateCardSources(record,events,sources,(ok,msg)=>{if(!ok)errors.push(msg);});assert(errors.some(e=>e.includes('newest reviewed')));
 record.primary_event_id=record.primary_source_id='new';const clean=[];validateCardSources(record,events,sources,(ok,msg)=>{if(!ok)clean.push(msg);});assert.deepEqual(clean,[]);
});
