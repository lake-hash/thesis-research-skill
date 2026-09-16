import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {validatePacket} from './validate-packet.mjs';
import {companyMembers,imageKey,rootId} from './generation-contract.mjs';
import {reviewedGroups} from './timeline-review-contract.mjs';
import {mediaSourceLink} from './media-contract.mjs';
import {proseLength} from './prose-limit.mjs';

export function timelinePreview(description){
 const words=description.trim().split(/\s+/),show_more=words.length>40;
 return {preview:words.slice(0,40).join(' ')+(show_more?'\u2026':''),show_more};
}
export function buildPresentation(packet,options={}){
 const result=validatePacket(packet,{...options,requireGenerationContract:true,requireHistoryCoverage:true,requireProseLimit:true,requireRunReview:true});
 if(!result.ok)throw Error(result.errors.join('\n'));
 const sources=new Map(packet.sources.map(s=>[s.id,s])),images=new Map(packet.images.map(p=>[p.kind+':'+p.key,p]));
 const secure=url=>{try{return new URL(url).protocol==='https:'?url:null;}catch{return null;}};
 const picture=(kind,key)=>{const p=images.get(kind+':'+key);return secure(p?.url)||secure(p?.fallback_url);};
 const tags=bindings=>(bindings||[]).filter(b=>['primary','vehicle'].includes(b.role)).map(b=>({name:b.entity_name,symbol:b.symbol,market:b.market,image_url:picture('security',imageKey(b)),...(b.display_note?{display_note:b.display_note}:{})}));
 const cards=[],details=[],excluded_events=[],aliases=Object.fromEntries(packet.records.filter(r=>r.superseded_by).map(r=>[r.id,rootId(r,packet.records)]));
 for(const record of packet.records.filter(r=>!r.superseded_by&&r.type!=='context'&&r.review?.status==='approved')){
  const members=companyMembers(record,packet.records),events=members.flatMap(m=>m.events),reviewed=reviewedGroups(record,events);
  excluded_events.push(...reviewed.excluded.map(e=>({...e,record_id:record.id})));
  const timeline=[];
  for(const group of reviewed.groups){
   const parts=group.events,anchor=parts.find(e=>e.id===record.primary_event_id)||parts.find(e=>e.id===group.anchor_event_id)||parts[0];
   const paragraphs=[...new Set(parts.flatMap(e=>e.description.split(/\n\s*\n/).filter(Boolean)))];
   const description=paragraphs.join('\n\n');
   if(proseLength(description)>500)throw Error('Combined historical detail exceeds 500 prose characters: '+record.id+'/'+anchor.id+'; review and rewrite the disclosure summary');
   const bindings=[...new Map(parts.flatMap(e=>e.asset_bindings||[]).map(b=>[imageKey(b),b])).values()];
   const source_ids=[...new Set(parts.flatMap(e=>e.source_ids))],source_urls=[...new Set(source_ids.map(id=>mediaSourceLink(sources.get(id))))];
   const source_id=anchor.source_ids[0],source_url=mediaSourceLink(sources.get(source_id));
   const context_source_ids=[...new Set(parts.flatMap(e=>e.context_source_ids||[]))],context_source_urls=context_source_ids.map(id=>sources.get(id).url);
   const id=record.id+':'+anchor.id,latest=Math.max(...events.filter(e=>e.at).map(e=>Date.parse(e.at)));
   const assets=tags(bindings);
   details.push({id,record_id:record.id,author_id:record.author_id,author_image_url:picture('person',record.author_id),at:anchor.at,date_basis:anchor.date_basis,description,assets,
    source_id,source_url,source_ids,source_urls,evidence_source_ids:source_ids,evidence_source_urls:source_urls,context_source_ids,context_source_urls,event_ids:parts.map(e=>e.id),is_latest:Date.parse(anchor.at)===latest,view_latest_record_id:record.id});
   // The card already displays this source; retain its detail without a second row.
   const primarySource=sources.get(record.primary_source_id);
   const isCardSource=source_ids.includes(record.primary_source_id)||source_urls.includes(mediaSourceLink(primarySource));
   if(!isCardSource)timeline.push({id:anchor.id,at:anchor.at,date_basis:anchor.date_basis,...timelinePreview(description),assets,source_url,detail_id:id});
  }
  timeline.sort((a,b)=>(Date.parse(b.at)||0)-(Date.parse(a.at)||0)||a.id.localeCompare(b.id));
  const primary=events.find(e=>e.id===record.primary_event_id);
  const signals=members.flatMap(m=>m.signals||[]).map(s=>({id:s.id,author_id:s.author_id,author_image_url:picture('person',s.author_id),description:s.description,relation:s.relation,source_urls:s.source_ids.map(id=>sources.get(id).url)}));
  const claim_sources=record.card_claims.map(claim=>({id:claim.id,text:claim.text,roles:claim.roles,source_urls:[...new Set(claim.evidence.map(span=>sources.get(span.source_id).url))],evidence_sources:claim.evidence.map(span=>({source_url:sources.get(span.source_id).url,supports_roles:span.supports_roles})),detail_ids:details.filter(d=>d.record_id===record.id&&claim.evidence.some(span=>d.source_ids.includes(span.source_id)||d.context_source_ids.includes(span.source_id))).map(d=>d.id)}));
  const last_update_at=events.filter(e=>e.at).map(e=>e.at).sort((a,b)=>Date.parse(b)-Date.parse(a))[0]||null;
  const cardSourceIds=[...new Set([record.primary_source_id,...record.card_claims.flatMap(c=>c.evidence.map(s=>s.source_id))])];
  cards.push({id:record.id,author_id:record.author_id,author_image_url:picture('person',record.author_id),object_key:record.object_key,description:record.description,at:primary.at,date_basis:primary.date_basis,primary_source_id:record.primary_source_id,source_url:mediaSourceLink(sources.get(record.primary_source_id)),source_ids:cardSourceIds,source_urls:cardSourceIds.map(id=>mediaSourceLink(sources.get(id))),evidence_source_ids:cardSourceIds,evidence_source_urls:cardSourceIds.map(id=>mediaSourceLink(sources.get(id))),last_update_at,claim_sources,assets:tags(record.asset_bindings),timeline,signals});
 }
 cards.sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)||a.id.localeCompare(b.id));
 return {generation_version:'3.1',as_of:packet.as_of,cards,details,excluded_events,aliases,image_gaps:packet.images.filter(i=>i.status!=='matched'),validation_warnings:result.warnings};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){
 try{const [input,output,...args]=process.argv.slice(2);if(!input||!output)throw Error('Usage: build-presentation.mjs packet.json presentation.json [--baseline previous.json] [--allow-editorial-corrections]');const i=args.indexOf('--baseline'),baseline=i>=0?JSON.parse(fs.readFileSync(args[i+1],'utf8')):undefined;
  const presentation=buildPresentation(JSON.parse(fs.readFileSync(input,'utf8')),{baseline,allowEditorialCorrections:args.includes('--allow-editorial-corrections')});
  fs.writeFileSync(output,JSON.stringify(presentation,null,2)+'\n');console.log(JSON.stringify({output,cards:presentation.cards.length,details:presentation.details.length,image_gaps:presentation.image_gaps.length}));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
