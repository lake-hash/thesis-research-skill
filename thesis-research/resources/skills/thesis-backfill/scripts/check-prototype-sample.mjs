import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validatePacket} from './validate-packet.mjs';
import {buildPresentation} from './build-presentation.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const prototype=path.join(repo,'thesis-field-notes');
const read=name=>JSON.parse(fs.readFileSync(path.join(prototype,name),'utf8'));
const reviewed=read('reviewed-en.json'),raw=new Map(read('source-posts.json').map(row=>{const s=JSON.parse(row.json);return[s.platform_id,s];}));
const original=reviewed.theses.find(t=>t.id==='stewie-aehr');
if(!original){console.log(JSON.stringify({skipped:true,reason:'The optional archived AEHR sample is unavailable; this is not a generation-3.2 validation failure.'},null,2));process.exit(0);}
const author=reviewed.authors.find(a=>a.handle===original.author);
const sources=original.events.map(e=>{const s=raw.get(e.source_id);if(!s)throw Error('Missing raw source '+e.source_id);return{id:s.platform_id,channel_id:'archived-x',url:s.url,author_ids:[author.handle],canonical_event_id:s.platform_id,published_at:s.published_at,spoken_at:null,locator:'Archived original X post '+s.platform_id,source_level:'primary',context_complete:true,text:s.full_text,text_sha256:crypto.createHash('sha256').update(s.full_text).digest('hex')};});
const packet={schema_version:'1.0',subject_id:author.handle,as_of:reviewed.reviewed_at,requested_scope:{mode:'explicit_window',start:'2026-09-01',end:'2026-09-08',note:'Local structural exercise using five existing archived posts. No new retrieval or independent semantic review.'},authors:[{id:author.handle,name:author.name,identity_status:'verified',evidence_urls:['https://x.com/'+author.handle]}],coverage:[{id:'archived-x',channel:'Stored prototype X sample',url:'https://x.com/'+author.handle,declared_scope:'Five previously selected AEHR posts, not the full account.',status:'partial',proof:'Read the existing original-text packet and reviewed history locally.',gaps:['Other account posts and public channels are not part of this exercise.']}],sources,decisions:sources.map(s=>({source_id:s.id,disposition:'used',reason:'Existing archived AEHR event in the local sample.'})),records:[{id:original.id,author_id:author.handle,type:'setup',episode_id:'aehr-september-2026',question:'Could AEHR rebound from its September selloff?',description:original.body,assessment_as_of:reviewed.reviewed_at,origin:{status:'unknown',source_ids:[]},view_status:'uncertain',position_status:'closed_reported',dedup:{decision:'matched',compared_ids:[original.id],reason:'Reuse the existing setup ID; the July trade remains a separate episode.'},asset_bindings:[{entity_name:reviewed.assets.AEHR.name,symbol:'AEHR',market:'NASDAQ',instrument_type:'equity',role:'primary',basis:'author_named',source_ids:[sources[0].id],verification_url:reviewed.assets.AEHR.website}],events:original.events.map(e=>({id:e.event_id,type:e.type,canonical_event_id:e.source_id,at:e.published_at,date_basis:'published',source_ids:[e.source_id],description:e.body,support:[{source_id:e.source_id,quote:e.quote,purpose:e.type==='POSITION'||e.type==='CLOSED'?'action':'judgment'}],action:e.type==='CLOSED'?{kind:'close',basis:'reported_execution'}:e.type==='POSITION'?{kind:'reduce',basis:'reported_execution'}:{kind:'none',basis:'none'}})),signals:[],review:{status:'hold',reviewer:'Local sample adapter',method:'Import existing reviewed copy and verify structural/source relationships only; no independent review performed.',checks:{},reason:'This evaluation artifact must not be published or treated as a new approval.'}}],pending:[],completion:{collection:'partial',classification:'complete',review:'partial'}};
packet.requested_scope.note=`Local structural exercise using ${sources.length} existing archived posts. No new retrieval or independent semantic review.`;
packet.coverage[0].declared_scope=`${sources.length} previously selected AEHR posts, not the full account.`;
packet.generation_policy={version:'3.1',grouping:'author_company',history:'append_only',timeline_preview_words:40};
packet.authors[0].handle=author.handle;
const record=packet.records[0];record.type='thesis';record.object_type='company';record.object_key='company:aehr-test-systems';
record.asset_bindings[0].entity_key=record.object_key;record.asset_bindings[0].listing_region='US';
for(const e of record.events){e.asset_bindings=[{...record.asset_bindings[0],source_ids:e.source_ids}];if(e.action.kind!=='none'){e.episode_id='aehr-september-2026';e.account_id='not_disclosed';}}
packet.history_coverage=record.events.map(e=>({id:'coverage:'+e.id,source_ids:e.source_ids,kind:e.action.kind==='none'?'assessment':e.action.kind==='close'?'outcome':'position',disposition:'event',event_ids:[e.id],reason:'Retained archived source and event in a held structural sample.'}));
packet.images=[{kind:'person',key:author.handle,endpoint:'/api/v1/persons',status:'image_not_provided',url:null,fallback_url:author.avatar,reason:'The recorded registry check supplied no avatar.'},{kind:'security',key:'NASDAQ:AEHR',endpoint:'/api/v1/stocks/company/detail',status:'matched',url:reviewed.profile_images?.companies?.AEHR?.image_url||reviewed.assets.AEHR.logo,requested_symbol:'AEHR',resolved_symbol:'AEHR',identity_basis:'exact_symbol'}];
const result=validatePacket(packet,{requireGenerationContract:true,requireHistoryCoverage:true});if(!result.ok)throw Error(result.errors.join('\n'));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'thesis-skill-check-'));
const output=path.join(dir,'packet.json');fs.writeFileSync(output,JSON.stringify(packet,null,2));
const presentation=path.join(dir,'presentation.json');fs.writeFileSync(presentation,JSON.stringify(buildPresentation(packet),null,2));
console.log(JSON.stringify({output,presentation,held_sample:true,...result},null,2));
