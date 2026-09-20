import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {validateCandidateAccounting} from './candidate-accounting-contract.mjs';
import {tickerStanceIssues} from './ticker-stance-contract.mjs';
import {temporalFeedDiversityReview} from './stance-opening-contract.mjs';
import {projectThesisAt,projectThesisFeed} from '../../thesis-review-publish/scripts/project-thesis-feed.mjs';

const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const variants=[
 {author:'author-a',ticker:'AAA',record:'record-a',start:'2026-08-01T00:00:00Z'},
 {author:'person-927',ticker:'000660.KS',record:'memory-korea',start:'2026-09-01T00:00:00Z'},
 {author:'new-person',ticker:'BTC',record:'asset-bitcoin',start:'2026-01-15T00:00:00Z'}
];

test('candidate conservation is invariant to renamed authors, tickers and record IDs',()=>{
 for(const variant of variants){const sourceText=`${variant.ticker} can improve because demand is accelerating.`;const triage={version:'fixture',counts:{candidate:1},decisions:[{source_id:'source',authorship:'author_owned',disposition:'candidate',investable_object:'resolved',object_level:'company',object_hints:['Fixture'],ticker_hints:[variant.ticker],what_present:true,why_present:true,possible_increment:'new_reason',content_domain:'fundamental',reason:'Complete judgment.'}]};const packet={sources:[{id:'source',text:sourceText,text_sha256:sha(sourceText),published_at:variant.start}],decisions:[{source_id:'source',disposition:'used',reason:'Public.'}],records:[{id:variant.record,author_id:variant.author,primary_event_id:'event',timeline_review:[{event_id:'event',disposition:'update'}],events:[{id:'event',at:variant.start,source_ids:['source']}]}],pending:[]};const result=validateCandidateAccounting(triage,packet);assert.equal(result.ok,true,result.errors.join('\n'));}
});

test('event-local ticker direction rejects inherited or renamed extra tickers generically',()=>{
 for(const variant of variants){const source={id:'s',text:`${variant.ticker} demand is improving.`,author_ids:[variant.author]},sources=new Map([['s',source]]);assert.deepEqual(tickerStanceIssues({tickerStances:[{ticker:variant.ticker,stance:'bullish',evidence:[{source_id:'s',quote:`${variant.ticker} demand is improving`,explanation:'Exact direction.'}]}],tickers:[variant.ticker],sources,allowedSourceIds:['s']}),[]);assert(tickerStanceIssues({tickerStances:[{ticker:variant.ticker,stance:'bullish',evidence:[{source_id:'s',quote:`${variant.ticker} demand is improving`,explanation:'Exact direction.'}]}],tickers:[variant.ticker,'EXTRA'],sources,allowedSourceIds:['s']}).some(issue=>issue.includes('exactly match')));}
});

test('temporal projection excludes selected and future events for arbitrary identities',()=>{
 for(const [index,variant] of variants.entries()){const base=Date.parse(variant.start),author={id:variant.author},ticker={symbol:variant.ticker,direction:'bullish'},cards=[0,1,2].map(offset=>({thesisId:index+1,type:offset?'thesis_update':'new_thesis',createdAtMs:base+offset*86400000,author,body:`Expression ${offset}. [Fixture Author on X](https://example.invalid/${index}/${offset})`,tickers:[ticker],media:[]})),items=cards.map((_,offset)=>({cardIndex:offset,eventId:`${variant.record}-event-${offset}`,thesisId:index+1,authorId:variant.author})),bundle={cards,manifest:{items},currentCards:[structuredClone(cards[2])],currentManifest:{items:[{cardIndex:0,eventId:items[2].eventId,thesisId:index+1,authorId:variant.author}]}};const projection=projectThesisFeed(bundle),selected=projectThesisAt(projection,{eventId:items[1].eventId});assert.equal(selected.current.createdAtMs,base+86400000);assert.deepEqual(selected.timeline.map(row=>row.createdAtMs),[base]);}
});

test('surface-language concentration is based on form, not company names',()=>{
 for(const prefix of ['AAA','Different Company','000660.KS']){const review=temporalFeedDiversityReview([`${prefix} remained attractive because demand rose.`,`${prefix} remains favored because supply tightened.`,`${prefix} remained unattractive because costs increased.`]);assert(review.errors.some(error=>error.includes('remain-evaluation')));}
});
