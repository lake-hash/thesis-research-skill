import test from 'node:test';
import assert from 'node:assert/strict';
import links from '../../thesis-backfill/scripts/source-links.cjs';
import {fixture} from './test-export-thesis-cards.mjs';
import {exportCards,validateCard} from './export-thesis-cards.mjs';

test('Named links are appended in evidence order, deduplicated and idempotent',()=>{
 const refs=[{url:'https://x.com/alex/status/123',label:'Alex on X'},{url:'https://example.invalid/doc#page=2',label:'Acme earnings call'},{url:'https://x.com/alex/status/123',label:'Alex on X'}];
 const body=links.append('Acme is growing.\n\nDemand is rising.',refs);
 assert.equal(body,'Acme is growing.\n\nDemand is rising.\n\n[Alex on X](https://x.com/alex/status/123) [Acme earnings call](https://example.invalid/doc#page=2)');
 assert.equal(links.append(body,refs),body);assert.equal(links.split(body).prose,'Acme is growing.\n\nDemand is rising.');
});
test('Parentheses, escaped labels, PDF pages and timecodes survive rendering',()=>{
 const refs=[{url:'https://example.invalid/a(b).pdf#page=2',label:'Acme [Q2] call'},{url:'https://www.youtube.com/watch?v=test&t=60',label:'Acme interview'}];
 const body=links.append('Demand is rising.',refs);assert.equal(links.append(body,refs),body);
 const html=links.render(body);assert(html.includes('a%28b%29.pdf#page=2'));assert(html.includes('Acme [Q2] call'));assert(html.includes('&amp;t=60'));
});
test('Unsafe HTML and URLs do not execute; invalid source labels cannot export',()=>{
 assert(!links.render('<script>alert(1)</script>').includes('<script>'));
 assert(!links.render('[A](javascript:alert(1))').includes('href='));
 assert(!links.render('![A](https://example.invalid/tracker.png)').includes('<img'));
 for(const label of ['Click here','Source','example.com','https://example.com','A '.repeat(30)])assert.throws(()=>links.append('View.',[{url:'https://example.invalid/post',label}]));
 assert.throws(()=>links.append('View. [Other on X](https://x.com/other/status/1)',[{url:'https://x.com/alex/status/2',label:'Alex on X'}]),/unverified/);
});
test('All internal source revisions survive URL deduplication without public original text',()=>{
 const p=fixture();p.sources[1].url=p.sources[0].url;p.sources[1].at=p.sources[0].at;p.items=p.items.slice(0,1);p.items[0].sourceIds.push('source-1');
 const out=exportCards(p);assert.equal(out.cards.length,1);assert.equal(links.split(out.cards[0].body).links.length,1);assert.equal(out.manifest.items[0].sourceRevisions.length,2);assert(!('sources' in out.cards[0]));
});
test('Only user-original cards may omit external links; extraction always supplies them',()=>{
 const p=fixture(),out=exportCards(p),card={...out.cards[0],body:'My own view.'};assert(validateCard(card).ok);
 p.items[0].sourceIds=[];assert(exportCards(p).holds.some(h=>h.inputIndex===0));
 p.items[0].sourceIds=['source-0'];p.sources[0].exportAllowed=false;assert.equal(exportCards(p).cards.length,3);
});
