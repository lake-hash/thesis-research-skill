import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildPresentation} from '../../thesis-backfill/scripts/build-presentation.mjs';
import {exportCards} from './export-thesis-cards.mjs';
import {mediaSourceLink} from '../../thesis-backfill/scripts/media-contract.mjs';
import links from '../../thesis-backfill/scripts/source-links.cjs';
import {sealSourceCoverage} from './source-coverage-contract.mjs';
import {composeVisibleProse} from '../../thesis-backfill/scripts/prose-limit.mjs';

export const digest = value => crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export function sourceDisplayName(source,authors){
  const known=authors.find(a=>a.id===source.author_ids?.[0]||a.handle===source.author_ids?.[0])?.name||source.author_ids?.[0];
  const name=known&&!/^unknown[-:]|^Referenced author$/i.test(known)?known:'Referenced post';
  return links.labelFor({url:source.url,author:name,label:source.link_label||source.display_name||source.locator,kind:source.media?.kind,publisher:source.media?.publisher});
}

// Preview allocations are persistent but never accepted as production feed IDs.
export function allocatePreviewIds(authorMap, records, previous) {
  const result=structuredClone(previous||{authority:'local_preview',revision:'preview-1',entries:[]});
  if(result.authority!=='local_preview')throw Error('Refusing to allocate into a production map');
  const authors=new Map(authorMap.map(a=>[a.internalAuthorId,a.authorId]));
  const used=new Set(),keys=new Set(),high=new Map();
  for(const e of result.entries){
    const key=JSON.stringify([e.authorId,e.internalThesisKey]),number=JSON.stringify([e.authorId,e.thesisId]);
    if(!Number.isSafeInteger(e.thesisId)||e.thesisId<1||keys.has(key)||used.has(number))throw Error('Invalid preview allocation');
    keys.add(key);used.add(number);high.set(e.authorId,Math.max(high.get(e.authorId)||0,e.thesisId));
  }
  for(const r of records.slice().sort((a,b)=>a.id.localeCompare(b.id))){
    const authorId=authors.get(r.author_id);if(!authorId)continue;
    const key=JSON.stringify([authorId,r.id]);if(keys.has(key))continue;
    const thesisId=(high.get(authorId)||0)+1;high.set(authorId,thesisId);keys.add(key);
    result.entries.push({authorId,internalThesisKey:r.id,thesisId});
  }
  result.revision='preview-'+digest(result.entries).slice(0,16);
  return result;
}

export function exportBundle({history,snapshots,presentation,excluded=[]}) {
  const h=exportCards(history),s=exportCards(snapshots);
  return {schema_version:'thesis-cards/1.1',cards:h.cards,manifest:h.manifest,
    currentCards:s.cards,currentManifest:s.manifest,presentation,excluded,
    gaps:[...h.holds.map(x=>({...x,route:'history'})),...s.holds.map(x=>({...x,route:'current'}))]};
}

export function preparePacketExport(packet,config) {
  const view=buildPresentation(packet,config.validation||{});
  const byId=new Map(packet.records.map(r=>[r.id,r])),raw=new Map(packet.sources.map(s=>[s.id,s]));
  const images=new Map(packet.images.map(i=>[i.kind+':'+i.key,i.url||i.fallback_url]));
  const authors=new Map(config.authorMap.map(a=>[a.internalAuthorId,a.authorId]));
  const sources=packet.sources.filter(s=>s.text?.trim()).map(s=>({id:s.id,revision:s.text_sha256,authorIds:s.author_ids,
    url:mediaSourceLink(s),displayName:sourceDisplayName(s,packet.authors),text:s.text,textSha256:s.text_sha256,at:s.spoken_at||s.published_at,mediaProvenance:s.media||null,
    attachmentStatus:s.attachment_status,attachmentReason:s.attachment_reason,attachments:(s.attachments||[]).map(a=>({id:a.id,type:a.type,coverUrl:a.cover_url,...(a.url?{url:a.url}:{})})),
    documentProvenance:s.document_ref?{...s.document_ref,text_scope:s.text_scope,document_text_sha256:packet.documents.find(d=>d.id===s.document_ref.document_id).text_sha256}:null,
    datePrecision:s.date_precision,linkAllowed:config.sourceLinkPermissions?.[s.id]!==false,exportAllowed:config.sourcePermissions?.[s.id]===true,
    previewAllowed:config.assignments.authority==='local_preview',iconUrl:images.get('person:'+s.author_ids[0])}));
  const base={schemaVersion:'thesis-export-input/1.1',runId:config.runId,timePolicy:'expression_time',authorMap:config.authorMap,assignments:config.assignments,sources};
  const history={...base,items:[]},snapshots={...base,items:[]},groups=[];
  const events=new Map(packet.records.flatMap(t=>t.events).map(e=>[e.id,e]));
  const bindings=(assets,candidates,tickerStances)=>assets.map(a=>{
    const b=candidates.find(b=>b.symbol===a.symbol&&b.market===a.market&&['primary','vehicle'].includes(b.role));
    if(!b)throw Error('Missing reviewed asset binding '+a.symbol);
    const direction=tickerStances.find(item=>item.ticker===a.symbol)?.stance;
    if(!['bullish','bearish','none'].includes(direction))throw Error('Missing reviewed ticker direction '+a.symbol);
    return {...b,verified:true,direction,logoUrl:a.image_url||undefined,displayNote:b.display_note};
  });
  const eventMedia=eventIds=>{
    const output=[],seen=new Set(),sourceImageBindings=[];
    for(const id of eventIds){const event=events.get(id);for(const binding of event?.media_bindings||[]){
      if(!sourceImageBindings.some(b=>b.sourceId===binding.source_id&&b.attachmentId===binding.attachment_id))sourceImageBindings.push({sourceId:binding.source_id,attachmentId:binding.attachment_id,disposition:binding.disposition,...(binding.reason?{reason:binding.reason}:{})});
      if(binding.disposition!=='include')continue;const source=raw.get(binding.source_id),attachment=source?.attachments?.find(a=>a.id===binding.attachment_id);if(!attachment)throw Error('Missing bound source image '+binding.source_id+'/'+binding.attachment_id);
      const key=attachment.cover_url+'|'+(attachment.url||'');if(seen.has(key))continue;seen.add(key);output.push({type:'image',coverUrl:attachment.cover_url,...(attachment.url?{url:attachment.url}:{})});
    }}return {media:output,sourceImageBindings};
  };
  const visualReview=eventIds=>{const parts=eventIds.map(id=>events.get(id)).filter(Boolean),levels={none:0,helpful:1,required:2,unresolved:3};const dependency=parts.map(e=>e.visual_dependency||'unresolved').sort((a,b)=>(levels[b]??3)-(levels[a]??3))[0]||'none';return {dependency,reason:[...new Set(parts.map(e=>e.visual_dependency_reason).filter(Boolean))].join(' ')};};
  for(const card of view.cards){
    const r=byId.get(card.id),details=view.details.filter(d=>d.record_id===r.id).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.id.localeCompare(b.id));
    const primary=details.find(d=>d.source_ids.includes(r.primary_source_id));
    const make=(detail,index)=>{
      const e=events.get(detail.event_ids.find(id=>id===r.primary_event_id)||detail.event_ids[0]);
      const primarySourceId=detail.source_ids.includes(r.primary_source_id)?r.primary_source_id:e.source_ids[0];
      const sourceImages=eventMedia(detail.event_ids),expressionSourceIds=[...new Set(detail.event_ids.flatMap(id=>events.get(id)?.source_ids||[]))],imageSourceIds=[...new Set(detail.event_ids.flatMap(id=>[...(events.get(id)?.source_ids||[]),...(events.get(id)?.context_source_ids||[])]))];
      const visual=visualReview(detail.event_ids);
      return {internalAuthorId:r.author_id,internalThesisKey:r.id,eventId:e.id,originalEventIds:detail.event_ids,
        type:index===0?'new_thesis':'thesis_update',mode:'history_event',eventType:index===0?'FIRST_OBSERVED':e.type==='FIRST_OBSERVED'?'EVIDENCE':e.type,
        eventDisposition:'update',incrementReview:{decision:'update',incrementKind:r.timeline_review.find(x=>x.event_id===e.id)?.increment_kind,increment:r.timeline_review.find(x=>x.event_id===e.id)?.increment,reviewId:config.runId+':'+r.id},at:detail.at,dateBasis:detail.date_basis,datePrecision:e.date_precision||raw.get(primarySourceId)?.date_precision,
        description:detail.description,sourceIds:[...new Set([...detail.source_ids,...detail.context_source_ids])],primarySourceId,
        assetBindings:bindings(detail.assets,detail.event_ids.flatMap(id=>events.get(id).asset_bindings||[]),detail.ticker_stances),
        expressionSourceIds,imageSourceIds,visualDependency:visual.dependency,visualDependencyReason:visual.reason,sourceImageBindings:sourceImages.sourceImageBindings,media:sourceImages.media,originStatus:r.origin.status,baselineVersion:config.baselineVersion,
        episodeId:e.episode_id,accountId:e.account_id,
        review:{status:r.review.status,id:config.runId+':'+r.id,reviewer:r.review.reviewer,method:r.review.method}};
    };
    details.forEach((d,i)=>history.items.push(make(d,i)));
    if(!primary)throw Error('Missing primary detail '+r.id);
    const current={...make(primary,details.indexOf(primary)),mode:'current_snapshot',description:composeVisibleProse(card.stance_sentence,card.description),
      assetBindings:bindings(card.assets,r.asset_bindings,card.ticker_stances)};
    current.sourceIds=[...new Set([...current.sourceIds,...r.card_claims.flatMap(c=>c.evidence.map(e=>e.source_id))])];
    current.sourceCoverage=sealSourceCoverage(current,new Map(sources.map(s=>[s.id,s])),r.card_claims.flatMap(c=>c.evidence.map(e=>e.source_id)));
    snapshots.items.push(current);
    const signals=(r.signals||[]).map(s=>{
      const author=packet.authors.find(a=>a.id===s.author_id),original=raw.get(s.source_ids[0]);
      return {id:s.id,author_handle:author.handle||author.id,author_name:author.name,avatar:images.get('person:'+s.author_id),
        quote:'',summary:s.description,interpretation:'',role:'',relation:s.relation,published_at:original.published_at,
        source_url:original.url,source_label:sourceDisplayName(original,packet.authors)};
    });
    groups.push({internalThesisKey:r.id,authorId:authors.get(r.author_id),primaryEventId:current.eventId,signals});
  }
  const source_recordings=(packet.media_inventory||[]).map(recording=>{
    const parts=recording.segments.map(id=>raw.get(id)).filter(Boolean),first=parts[0];if(!first)return null;
    const reviewed=parts.filter(s=>s.media?.review?.status==='verified').length;
    return {id:recording.id,kind:first.media.kind,display_name:first.display_name||first.locator,url:first.url,published_at:first.media.published_representation_at||first.published_at,
      author_ids:[...new Set(parts.flatMap(s=>s.author_ids))].filter(id=>packet.authors.some(a=>a.id===id&&a.identity_status==='verified')).map(id=>packet.authors.find(a=>a.id===id).handle||id),
      status:reviewed===parts.length?'reviewed':reviewed?'partial_review':'pending_review',segment_count:parts.length};
  }).filter(Boolean);
  const sourceMap=new Map(sources.map(s=>[s.id,s]));
  for(const item of history.items)item.sourceCoverage=sealSourceCoverage(item,sourceMap);
  return {history,snapshots,excluded:view.excluded_events,presentation:{authors:packet.authors.map(a=>({id:authors.get(a.id),handle:a.handle||a.id,name:a.name,avatar:images.get('person:'+a.id),source_count:packet.sources.filter(s=>s.author_ids.includes(a.id)).length,source_count_label:'sources',coverage_note:'Sources retained in this reviewed packet.'})),groups,record_aliases:view.aliases,assets:{},source_recordings,as_of:packet.as_of,reviewed_at:packet.as_of}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [, ,packetFile,configFile,out]=process.argv;
  if(!packetFile||!configFile||!out)throw Error('Usage: prepare-card-export.mjs packet.json export-config.json NEW-output-dir');
  const packet=JSON.parse(fs.readFileSync(packetFile)),config=JSON.parse(fs.readFileSync(configFile));
  const prepared=preparePacketExport(packet,config),bundle=exportBundle(prepared);
  fs.mkdirSync(out,{recursive:false});
  for(const [name,value]of Object.entries({'cards.json':bundle.cards,'current-cards.json':bundle.currentCards,
    'ingestion-manifest.json':bundle.manifest,'current-manifest.json':bundle.currentManifest,
    'playbook-data.json':bundle,'gaps.json':bundle.gaps,'excluded.json':bundle.excluded}))fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
  console.log(JSON.stringify({history:bundle.cards.length,current:bundle.currentCards.length,holds:bundle.gaps.length,previewOnly:bundle.manifest.previewOnly,published:false}));
}
