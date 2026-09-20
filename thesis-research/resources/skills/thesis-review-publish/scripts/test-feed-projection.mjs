import test from 'node:test';
import assert from 'node:assert/strict';
import {projectThesisAt,projectThesisFeed} from './project-thesis-feed.mjs';

const ticker=(symbol,direction,logoUrl)=>({symbol,direction,...(logoUrl?{logoUrl}:{})});
const card=({thesisId,type,at,body,tickers,media,author='author-1'})=>({thesisId,type,createdAtMs:Date.parse(at),author:{id:author},body,tickers,media});
const item=(cardIndex,eventId,thesisId,authorId='author-1')=>({cardIndex,eventId,thesisId,authorId});

function bundle(){
  const first=card({thesisId:7,type:'new_thesis',at:'2026-09-01T00:00:00Z',body:'Gold retained upside. [Author on X](https://example.invalid/1)',tickers:[ticker('GC','bullish','https://example.invalid/gc.png')],media:[{type:'image',coverUrl:'https://example.invalid/gold-preview.jpg',url:'https://example.invalid/gold-full.jpg'}]});
  const bond=card({thesisId:7,type:'thesis_update',at:'2026-09-02T00:00:00Z',body:'Treasuries weakened. [Author on X](https://example.invalid/2)',tickers:[ticker('TLT','bearish','https://example.invalid/tlt.png')],media:[{type:'image',coverUrl:'https://example.invalid/bond.jpg'}]});
  const currentHistory=card({thesisId:7,type:'thesis_update',at:'2026-09-03T00:00:00Z',body:'Gold became balanced. [Author on X](https://example.invalid/3)',tickers:[ticker('GC','none','https://example.invalid/gc.png')],media:[]});
  const current={...structuredClone(currentHistory),body:'Gold remains balanced. [Author on X](https://example.invalid/3)'};
  return {cards:[first,bond,currentHistory],manifest:{items:[item(0,'event-1',7),item(1,'event-2',7),item(2,'event-3',7)]},currentCards:[current],currentManifest:{items:[item(0,'event-3',7)]}};
}

test('Feed projection groups one thesis and preserves expression-local ticker and media payloads',()=>{
  const result=projectThesisFeed(bundle()),group=result.groups[0];
  assert.equal(result.schemaVersion,'thesis-feed-projection/1.1');assert.equal(result.groups.length,1);
  assert.deepEqual(result.feedItems.map(item=>item.eventId),['event-3','event-2','event-1']);
  assert.equal(group.current.tickers[0].direction,'none');assert.deepEqual(group.current.media,[]);
  assert.deepEqual(group.timeline.map(row=>row.createdAtMs),[Date.parse('2026-09-02T00:00:00Z'),Date.parse('2026-09-01T00:00:00Z')]);
  assert.equal(group.timeline[0].tickers[0].symbol,'TLT');assert.equal(group.timeline[0].tickers[0].direction,'bearish');
  assert.equal(group.timeline[0].media[0].coverUrl,'https://example.invalid/bond.jpg');
  assert.equal(group.timeline[1].tickers[0].logoUrl,'https://example.invalid/gc.png');
});

test('Temporal Feed projection shows the selected date at the top and only earlier updates below',()=>{
  const result=projectThesisFeed(bundle());
  const selected=projectThesisAt(result,{eventId:'event-3'});
  assert.equal(selected.selectedEventId,'event-3');
  assert.equal(selected.current.body,'Gold became balanced. [Author on X](https://example.invalid/3)');
  assert.deepEqual(selected.timeline.map(row=>row.createdAtMs),[Date.parse('2026-09-02T00:00:00Z'),Date.parse('2026-09-01T00:00:00Z')]);
  assert(!selected.timeline.some(row=>row.createdAtMs===selected.current.createdAtMs));

  const earlier=projectThesisAt(result,{eventId:'event-2'});
  assert.equal(earlier.current.body,'Treasuries weakened. [Author on X](https://example.invalid/2)');
  assert.deepEqual(earlier.timeline.map(row=>row.createdAtMs),[Date.parse('2026-09-01T00:00:00Z')]);
  assert(!earlier.timeline.some(row=>row.createdAtMs>Date.parse('2026-09-02T00:00:00Z')));
});

test('Temporal Feed projection resolves the latest expression at a cutoff without leaking future history',()=>{
  const result=projectThesisFeed(bundle());
  const selected=projectThesisAt(result,{authorId:'author-1',thesisId:7,at:'2026-09-02T12:00:00Z'});
  assert.equal(selected.selectedEventId,'event-2');
  assert.deepEqual(selected.timeline.map(row=>row.createdAtMs),[Date.parse('2026-09-01T00:00:00Z')]);
  assert.throws(()=>projectThesisAt(result,{eventId:'missing'}),/missing or duplicated/);
  assert.throws(()=>projectThesisAt(result,{authorId:'author-1',thesisId:7,at:'2026-08-31T00:00:00Z'}),/no expression at or before/);
});

test('Feed projection scopes numeric thesis IDs by author',()=>{
  const input=bundle(),other=card({author:'author-2',thesisId:7,type:'new_thesis',at:'2026-09-04T00:00:00Z',body:'Another view. [Other on X](https://example.invalid/4)',tickers:[ticker('ACME','bullish')],media:[]});
  input.cards.push(other);input.manifest.items.push(item(3,'event-4',7,'author-2'));
  const result=projectThesisFeed(input);assert.equal(result.groups.length,2);assert.deepEqual(new Set(result.groups.map(group=>group.authorId)),new Set(['author-1','author-2']));
});

test('Feed projection rejects orphan and duplicate current snapshots',()=>{
  const orphan=bundle();orphan.currentCards[0].thesisId=99;orphan.currentManifest.items[0].thesisId=99;
  assert.throws(()=>projectThesisFeed(orphan),/no matching history/);
  const duplicate=bundle();duplicate.currentCards.push(structuredClone(duplicate.currentCards[0]));duplicate.currentManifest.items.push(item(1,'event-3-copy',7));
  assert.throws(()=>projectThesisFeed(duplicate),/multiple current snapshots/);
});

test('Temporal Feed rejects repeated remain-evaluation openings across different theses',()=>{
  const bodies=[
    'The named AI-buildout equities remained attractive because agentic AI required more compute. [Author on X](https://example.invalid/a)',
    'SNDK remains favored because inference requires more memory bandwidth. [Author on X](https://example.invalid/b)',
    'CRDO remains unattractive because CPO could displace transition products. [Author on X](https://example.invalid/c)'
  ];
  const cards=bodies.map((body,index)=>card({author:'author-'+index,thesisId:index+1,type:'new_thesis',at:`2026-09-0${index+1}T00:00:00Z`,body,tickers:[ticker('T'+index,'bullish')],media:[]}));
  const input={cards,manifest:{items:cards.map((_,index)=>item(index,'repeat-event-'+index,index+1,'author-'+index))},currentCards:cards.map(row=>structuredClone(row)),currentManifest:{items:cards.map((_,index)=>item(index,'repeat-event-'+index,index+1,'author-'+index))}};
  assert.throws(()=>projectThesisFeed(input),/Temporal Feed opening diversity failed:.*remain-evaluation/);
});
