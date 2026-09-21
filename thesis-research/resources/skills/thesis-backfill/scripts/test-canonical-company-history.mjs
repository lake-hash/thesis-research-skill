import test from 'node:test';
import assert from 'node:assert/strict';
import {
 canonicalCompanyConflicts,
 consolidateCanonicalCompanyHistory,
 consolidateCompanyExpressionRecordIds,
 resolveCanonicalCompany
} from './canonical-company-history.mjs';
import {projectThesisAt,projectThesisFeed} from '../../thesis-review-publish/scripts/project-thesis-feed.mjs';

const alias=(canonical='company:orion')=>({
 canonical_key:canonical,
 role:'company',
 aliases:['company:ORN','orion-systems','Orion','Orion Systems'],
 entity_keys:['company:orion-systems'],
 instruments:[{market:'NASDAQ',symbol:'ORN'}],
 review:{status:'approved',reviewer:'fixture-reviewer',reviewed_at:'2026-09-20T00:00:00Z',reason:'Verified issuer, listing and company-name aliases.'}
});
const binding=(entityKey='company:orion-systems')=>({entity_name:'Orion Systems',entity_key:entityKey,symbol:'ORN',market:'NASDAQ',role:'primary'});
const event=(id,at,source,stance='bullish',media=[])=>({id,at,source_ids:[source],context_source_ids:[],asset_bindings:[binding()],ticker_stances:[{ticker:'ORN',stance}],media_bindings:media});
const record=({id,key,dates,objectType='company'})=>({
 id,author_id:'author-renamed',type:'thesis',object_type:objectType,object_key:key,asset_bindings:objectType==='company'?[binding(key)]:[
  {...binding(),role:'primary'},
  {entity_name:'Second Company',entity_key:'company:second',symbol:'SEC',market:'NYSE',role:'primary'}
 ],
 events:dates.map(([eventId,at,source,stance,media])=>event(eventId,at,source,stance,media)),
 timeline_review:dates.map(([eventId])=>({event_id:eventId,disposition:'update',increment_kind:'evidence',increment:'New evidence'})),
 history_search:{version:'author-object-history/1.0',aliases:[key],scope_source_count:9,matched_source_ids:dates.map(row=>row[2]),public_event_ids:dates.map(row=>row[0]),source_only_source_ids:[],held_source_ids:[]},
 primary_event_id:dates.at(-1)[0],primary_source_id:dates.at(-1)[2],assessment_as_of:dates.at(-1)[1],dedup:{decision:'new',compared_ids:[],reason:'fixture'},review:{status:'approved'}
});

test('rename-safe company aliases fail the hard gate before consolidation',()=>{
 const records=[
  record({id:'legacy-alpha',key:'company:ORN',dates:[['evt-old','2026-01-02T00:00:00Z','src-old']]}),
  record({id:'current-beta',key:'orion-systems',dates:[['evt-new','2026-02-03T00:00:00Z','src-new']]})
 ];
 const result=canonicalCompanyConflicts(records,[alias()]);
 assert.equal(result.ok,false);
 assert.match(result.issues.join('\n'),/Canonical company conflict author-renamed\/company:orion: current-beta, legacy-alpha/);
});

test('consolidation leaves one active company record and preserves old events by redirect',()=>{
 const input={records:[
  record({id:'legacy-alpha',key:'company:ORN',dates:[['evt-apr','2026-04-04T00:00:00Z','src-apr'],['evt-may','2026-05-05T00:00:00Z','src-may']]}),
  record({id:'current-beta',key:'orion-systems',dates:[['evt-aug','2026-08-08T00:00:00Z','src-aug'],['evt-sep','2026-09-09T00:00:00Z','src-sep']]})
 ],canonical_company_aliases:[alias()]};
 const {document,report}=consolidateCanonicalCompanyHistory(input),active=document.records.filter(row=>!row.superseded_by);
 assert.equal(active.length,1);assert.equal(active[0].id,'current-beta');
 assert.equal(document.records.find(row=>row.id==='legacy-alpha').superseded_by,'current-beta');
 assert.deepEqual(active[0].timeline_review.map(row=>row.event_id),['evt-apr','evt-may','evt-aug','evt-sep']);
 assert.equal(report.merges[0].event_count,4);
 assert.deepEqual(new Set(report.merges[0].event_ids),new Set(['evt-apr','evt-may','evt-aug','evt-sep']));
 assert.equal(canonicalCompanyConflicts(document.records,document).ok,true);
});

test('theme and basket records mentioning the company remain independent',()=>{
 const company=record({id:'company-record',key:'company:ORN',dates:[['evt-company','2026-04-01T00:00:00Z','src-company']]}),theme=record({id:'theme-record',key:'space-compute-theme',objectType:'theme',dates:[['evt-theme','2026-04-02T00:00:00Z','src-theme']]}),basket=record({id:'basket-record',key:'space-compute-basket',objectType:'basket',dates:[['evt-basket','2026-04-03T00:00:00Z','src-basket']]});
 const {document,report}=consolidateCanonicalCompanyHistory({records:[company,theme,basket],canonical_company_aliases:[alias()]});
 assert.equal(report.merges.length,0);assert(document.records.every(row=>!row.superseded_by));
 assert.equal(resolveCanonicalCompany(theme,[alias()]).basis,'not_company');
 assert.equal(resolveCanonicalCompany(basket,[alias()]).basis,'not_company');
});

test('a multi-company comparison mislabeled as company stays unresolved instead of merging by one mentioned ticker',()=>{
 const mixed=record({id:'mixed-company-role',key:'orion-and-second',dates:[['evt-mixed','2026-04-03T00:00:00Z','src-mixed']]});
 mixed.events[0].asset_bindings=[binding(),{entity_name:'Second Company',entity_key:'company:second',symbol:'SEC',market:'NYSE',role:'primary'}];
 mixed.events[0].ticker_stances=[{ticker:'ORN',stance:'bullish'},{ticker:'SEC',stance:'bearish'}];
 mixed.asset_bindings=structuredClone(mixed.events[0].asset_bindings);
 const resolution=resolveCanonicalCompany(mixed,[alias()]);
 assert.equal(resolution.canonical_key,null);assert.equal(resolution.basis,'ambiguous_company_role');
 assert.deepEqual(resolution.issues,[]);
});

test('expression assembly redirects old company record IDs without changing source-local fields',()=>{
 const media=[{source_id:'src-apr',attachment_id:'image-apr',disposition:'include'}],rows=[
  {id:'evt-apr',record_id:'old-id',author_id:'author-renamed',object_type:'company',object_key:'company:ORN',subject:'Orion',at:'2026-04-01T00:00:00Z',source:'https://example.invalid/apr',ticker_stances:[{ticker:'ORN',stance:'bullish'}],direction:'bullish',media},
  {id:'evt-aug',record_id:'new-id',author_id:'author-renamed',object_type:'company',object_key:'orion-systems',subject:'Orion Systems',at:'2026-08-01T00:00:00Z',source:'https://example.invalid/aug',ticker_stances:[{ticker:'ORN',stance:'bearish'}],direction:'bearish',media:[]}
 ];
 const result=consolidateCompanyExpressionRecordIds(rows,[alias()]);
 assert.deepEqual(result.expressions.map(row=>row.record_id),['new-id','new-id']);
 assert.equal(result.expressions[0].source,'https://example.invalid/apr');
 assert.equal(result.expressions[0].direction,'bullish');
 assert.deepEqual(result.expressions[0].media,media);
});

test('Ren/NBIS regression fixture consolidates April-July and August-September company history only',()=>{
 const nbisAlias={canonical_key:'company:nebius-group',role:'company',aliases:['company:NBIS','nebius-group','Nebius','Nebius Group'],entity_keys:['company:nebius-group'],instruments:[{market:'NASDAQ',symbol:'NBIS'}],review:{status:'approved',reviewer:'source-first identity review',reviewed_at:'2026-09-20T00:00:00Z',reason:'NBIS is the verified Nasdaq listing for Nebius Group.'}};
 const companyRecord=(id,key,dates)=>{const row=record({id,key,dates});row.author_id='ren_stocks';row.asset_bindings=[{...binding('company:nebius-group'),entity_name:'Nebius Group',symbol:'NBIS'}];for(const item of row.events){item.asset_bindings=structuredClone(row.asset_bindings);item.ticker_stances=[{ticker:'NBIS',stance:'bullish'}];}return row;};
 const input={records:[
  companyRecord('ren_stocks-company:NBIS','company:NBIS',[['nbis-apr','2026-04-23T09:23:42Z','src-apr'],['nbis-may','2026-05-13T04:51:02Z','src-may'],['nbis-jun','2026-06-26T20:12:11Z','src-jun'],['nbis-jul','2026-07-15T14:31:35Z','src-jul']]),
  companyRecord('ren_stocks-nebius-group','nebius-group',[['nbis-aug','2026-08-23T04:21:01Z','src-aug'],['nbis-sep','2026-09-01T23:21:51Z','src-sep']]),
  {...record({id:'ren-ai-basket',key:'ai-infrastructure',objectType:'basket',dates:[['basket-sep','2026-09-07T19:08:00Z','src-basket']]}),author_id:'ren_stocks'}
 ],canonical_company_aliases:[nbisAlias]};
 const {document}=consolidateCanonicalCompanyHistory(input),target=document.records.find(row=>row.id==='ren_stocks-nebius-group');
 assert.equal(document.records.find(row=>row.id==='ren_stocks-company:NBIS').superseded_by,target.id);
 assert.equal(target.timeline_review.length,6);
 assert.deepEqual(target.timeline_review.map(row=>row.event_id),['nbis-apr','nbis-may','nbis-jun','nbis-jul','nbis-aug','nbis-sep']);
 assert.equal(document.records.find(row=>row.id==='ren-ai-basket').superseded_by,undefined);
});

test('cross-record temporal projection keeps event-local fields, descending history and no future leakage',()=>{
 const rows=[
  ['evt-apr','old-id','2026-04-04T00:00:00Z','Orion strengthened as contracted demand increased.','bullish','apr.jpg'],
  ['evt-may','old-id','2026-05-05T00:00:00Z','Customer prepayments supported Orion capacity funding.','bullish','may.jpg'],
  ['evt-jun','old-id','2026-06-06T00:00:00Z','New power access improved Orion delivery capacity.','bullish','jun.jpg'],
  ['evt-jul','old-id','2026-07-07T00:00:00Z','Orion valuation became less demanding after execution improved.','bullish','jul.jpg'],
  ['evt-aug','new-id','2026-08-08T00:00:00Z','Contract repricing increased Orion revenue potential.','bullish','aug.jpg'],
  ['evt-sep','new-id','2026-09-09T00:00:00Z','Near-term policy risk raised Orion downside.','bearish','sep.jpg']
 ].map(([id,record_id,at,body,stance,image])=>({id,record_id,author_id:'author-renamed',object_type:'company',object_key:record_id==='old-id'?'company:ORN':'orion-systems',subject:'Orion Systems',at,body,ticker_stances:[{ticker:'ORN',stance}],source:`https://example.invalid/${id}`,media:[{type:'image',coverUrl:`https://example.invalid/${image}`}]}));
 const consolidated=consolidateCompanyExpressionRecordIds(rows,[alias()]),recordIds=new Set(consolidated.expressions.map(row=>row.record_id));
 assert.deepEqual(recordIds,new Set(['new-id']));
 const cards=consolidated.expressions.map((row,index)=>({thesisId:41,type:index?'thesis_update':'new_thesis',createdAtMs:Date.parse(row.at),author:{id:'author-renamed'},body:`${row.body} [Author on X](${row.source})`,tickers:[{symbol:'ORN',direction:row.ticker_stances[0].stance}],media:row.media}));
 const manifest={items:cards.map((_,index)=>({cardIndex:index,eventId:consolidated.expressions[index].id,thesisId:41,authorId:'author-renamed'}))};
 const projection=projectThesisFeed({cards,manifest,currentCards:[structuredClone(cards.at(-1))],currentManifest:{items:[{cardIndex:0,eventId:'evt-sep',thesisId:41,authorId:'author-renamed'}]}});
 const latest=projectThesisAt(projection,{eventId:'evt-sep'});
 assert.deepEqual(latest.timeline.map(row=>row.createdAtMs),['2026-08-08','2026-07-07','2026-06-06','2026-05-05','2026-04-04'].map(value=>Date.parse(value+'T00:00:00Z')));
 assert.equal(latest.timeline.at(-1).media[0].coverUrl,'https://example.invalid/apr.jpg');
 assert.equal(latest.timeline.at(-1).tickers[0].direction,'bullish');
 const july=projectThesisAt(projection,{eventId:'evt-jul'});
 assert.deepEqual(july.timeline.map(row=>row.createdAtMs),['2026-06-06','2026-05-05','2026-04-04'].map(value=>Date.parse(value+'T00:00:00Z')));
 assert(july.timeline.every(row=>row.createdAtMs<Date.parse('2026-07-07T00:00:00Z')));
});
