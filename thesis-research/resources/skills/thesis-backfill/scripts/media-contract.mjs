const filled=v=>typeof v==='string'&&v.trim().length>0;
const url=v=>{try{return new URL(v).protocol==='https:';}catch{return false;}};
const list=v=>Array.isArray(v)?v:[];
const sorted=v=>[...v].sort((a,b)=>String(a).localeCompare(String(b)));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export const EXPRESSION_MEDIA_REVIEW='expression-media/1.0';
export const ALL_ZERO_PUBLIC_MEDIA_AUDIT='all-zero-public-media-audit/1.0';
export const MEDIA_OMIT_CATEGORIES=new Set([
 'decorative','duplicate','technical_only','position_only','unrelated',
 'low_legibility','privacy','context_not_material'
]);

export function validateSourceAttachments(source,check,{required=false}={}){
 const status=source.attachment_status,items=source.attachments;
 if(!required&&status===undefined&&items===undefined)return;
 const label='Source '+source.id+' attachments';
 check(['none','complete','unavailable'].includes(status),label+' needs none, complete or unavailable status');
 check(Array.isArray(items),label+' must be an array');
 const seen=new Set();
 for(const item of Array.isArray(items)?items:[]){
  check(item&&typeof item==='object'&&!Array.isArray(item),label+' contains a malformed item');if(!item||typeof item!=='object')continue;
  check(filled(item.id)&&!seen.has(item.id),label+' needs unique attachment IDs');seen.add(item.id);
  check(item.type==='image'&&url(item.cover_url),label+' needs an HTTPS image cover_url');
  if(item.url!==undefined)check(url(item.url),label+' has an invalid original URL');
 }
 if(status==='none')check((items||[]).length===0,label+' none status cannot contain images');
 if(status==='complete')check((items||[]).length>0,label+' complete status needs every original image');
 if(status==='unavailable')check((items||[]).length===0&&filled(source.attachment_reason),label+' unavailable status needs a reason and no guessed images');
}

export function validateEventSourceImages(event,record,sourceMap,check,{required=false}={}){
 if(!required&&event.media_bindings===undefined)return;
 const label='Event '+event.id+' source images',bindings=Array.isArray(event.media_bindings)?event.media_bindings:[];
 check(Array.isArray(event.media_bindings),label+' needs media_bindings');
 check(['required','helpful','none','unresolved'].includes(event.visual_dependency),label+' needs visual_dependency');
 check(filled(event.visual_dependency_reason),label+' needs a visual dependency reason');
 const primaryIds=new Set(event.source_ids||[]),contextIds=new Set(event.context_source_ids||[]),expressionIds=new Set([...primaryIds,...contextIds]),seen=new Set();
 for(const binding of bindings){
 const key=binding?.source_id+'|'+binding?.attachment_id;
  check(binding&&typeof binding==='object'&&!seen.has(key),label+' has duplicate or malformed bindings');seen.add(key);
  const source=sourceMap.get(binding?.source_id),attachment=source?.attachments?.find(a=>a.id===binding?.attachment_id);
  const retrievalGap=binding?.disposition==='retrieval_gap';
  check(expressionIds.has(binding?.source_id)&&(retrievalGap?filled(binding?.attachment_id):!!attachment),label+' binding is outside the event source/context attachments');
  check(['include','omit','unrelated','retrieval_gap'].includes(binding?.disposition),label+' binding needs include, omit or retrieval_gap disposition');
  if(['omit','unrelated','retrieval_gap'].includes(binding?.disposition))check(filled(binding.reason),label+' omitted or unavailable image needs a reason');
  if(contextIds.has(binding?.source_id)&&binding?.disposition==='include'){
   check(filled(binding.reason),label+' included context image needs a material-use reason');
   const adopted=(event.support||[]).some(span=>span?.source_id===binding.source_id&&span?.purpose==='context');
   if(!adopted){
    check(binding.context_image_role==='explanatory_context',label+' non-adopted context image must be marked explanatory_context');
    check(event.visual_dependency==='helpful',label+' non-adopted context image can be helpful context but cannot be required evidence');
   }
  }
 }
 if(record.review?.status!=='approved')return;
 check(event.visual_dependency!=='unresolved',label+' unresolved visual relevance cannot be approved');
 let included=0,gaps=0;
 for(const sourceId of expressionIds){
 const source=sourceMap.get(sourceId);if(!source)continue;
  const sourceGap=bindings.some(binding=>binding?.source_id===sourceId&&binding?.disposition==='retrieval_gap');
  if(source.attachment_status==='unavailable')check(event.visual_dependency==='none'||event.visual_dependency==='helpful'&&sourceGap,label+' unavailable source attachments require visual_dependency none, a helpful retrieval gap or a hold');
  for(const attachment of source.attachments||[])check(seen.has(sourceId+'|'+attachment.id),label+' does not account for '+sourceId+'/'+attachment.id);
 }
 included=bindings.filter(b=>b?.disposition==='include').length;
 gaps=bindings.filter(b=>b?.disposition==='retrieval_gap').length;
 if(event.visual_dependency==='required')check(included>0,label+' required visual context needs an included image');
 if(event.visual_dependency==='helpful')check(included>0||gaps>0,label+' helpful visual context needs an included image or explicit retrieval gap');
 if(event.visual_dependency==='none')check(included===0,label+' visual_dependency none cannot include images');

 const publicExpression=list(record.timeline_review).find(review=>review?.event_id===event.id)?.disposition==='update';
 const attachmentKeys=sorted([...expressionIds].flatMap(sourceId=>list(sourceMap.get(sourceId)?.attachments).map(attachment=>sourceId+'|'+attachment.id))
  .concat(bindings.filter(binding=>binding?.disposition==='retrieval_gap').map(binding=>binding.source_id+'|'+binding.attachment_id)));
 if(required&&publicExpression&&attachmentKeys.length){
  const review=event.media_review,expectedDecision=included&&attachmentKeys.length>included?'mixed':included?'include':gaps?'retrieval_pending':'omit_all';
  check(review?.version===EXPRESSION_MEDIA_REVIEW,label+' needs '+EXPRESSION_MEDIA_REVIEW+' for every public expression with source images');
  check(filled(review?.reviewer)&&filled(review?.reviewed_at)&&Number.isFinite(Date.parse(review.reviewed_at)),label+' media review needs reviewer and reviewed_at');
  check(filled(review?.reason),label+' media review needs a content-based reason');
  check(Number.isInteger(review?.attachment_count)&&review.attachment_count===attachmentKeys.length,label+' media review attachment_count is stale');
  check(Number.isInteger(review?.include_count)&&review.include_count===included,label+' media review include_count is stale');
  check(review?.decision===expectedDecision,label+' media review decision does not match include/omit/retrieval outcomes');
  check(same(sorted(list(review?.attachment_ids)),attachmentKeys),label+' media review is not bound to the exact attachment set');
  for(const binding of bindings){
   if(!attachmentKeys.includes(binding?.source_id+'|'+binding?.attachment_id))continue;
   if(binding.disposition==='retrieval_gap')continue;
   check(filled(binding.content_summary),label+' binding needs an image-specific content_summary for '+binding.source_id+'/'+binding.attachment_id);
   check(filled(binding.reason),label+' binding needs an image-specific decision reason for '+binding.source_id+'/'+binding.attachment_id);
   if(['omit','unrelated'].includes(binding.disposition))check(MEDIA_OMIT_CATEGORIES.has(binding.omit_category),label+' omitted image needs a specific omit_category for '+binding.source_id+'/'+binding.attachment_id);
  }
 }
}

export function validatePacketMediaAudit(packet,sourceMap,check,{required=false}={}){
 if(!required)return;
 const publicEvents=[];
 for(const record of list(packet.records).filter(record=>record?.review?.status==='approved'&&!record.superseded_by)){
  const updates=new Set(list(record.timeline_review).filter(review=>review?.disposition==='update').map(review=>review.event_id));
  for(const event of list(record.events).filter(event=>updates.has(event.id))){
   const expressionIds=[...list(event.source_ids),...list(event.context_source_ids)];
   const attachmentIds=expressionIds.flatMap(sourceId=>list(sourceMap.get(sourceId)?.attachments).map(attachment=>sourceId+'|'+attachment.id));
   const gapIds=list(event.media_bindings).filter(binding=>binding?.disposition==='retrieval_gap').map(binding=>binding.source_id+'|'+binding.attachment_id);
   const ids=sorted(new Set([...attachmentIds,...gapIds]));
   if(ids.length)publicEvents.push({event,attachmentIds:ids});
  }
 }
 const attachmentIds=sorted(new Set(publicEvents.flatMap(row=>row.attachmentIds)));
 const included=new Set(publicEvents.flatMap(row=>list(row.event.media_bindings).filter(binding=>binding?.disposition==='include').map(binding=>binding.source_id+'|'+binding.attachment_id)));
 if(attachmentIds.length<2||included.size>0)return;
 const audit=packet.media_omission_audit,eventIds=sorted(publicEvents.map(row=>row.event.id));
 check(audit?.version===ALL_ZERO_PUBLIC_MEDIA_AUDIT&&audit?.decision==='reviewed',ALL_ZERO_PUBLIC_MEDIA_AUDIT+' is required when every reviewed public image is omitted');
 check(filled(audit?.reviewer)&&filled(audit?.reviewed_at)&&Number.isFinite(Date.parse(audit.reviewed_at)),ALL_ZERO_PUBLIC_MEDIA_AUDIT+' needs reviewer and reviewed_at');
 check(filled(audit?.reason),ALL_ZERO_PUBLIC_MEDIA_AUDIT+' needs a corpus-level reason rather than repeated per-image boilerplate');
 check(same(sorted(list(audit?.event_ids)),eventIds),ALL_ZERO_PUBLIC_MEDIA_AUDIT+' event_ids are stale or incomplete');
 check(same(sorted(list(audit?.attachment_ids)),attachmentIds),ALL_ZERO_PUBLIC_MEDIA_AUDIT+' attachment_ids are stale or incomplete');
}

// A transcript-only review never claims that the audio was checked.
export function verifiedTranscriptFallback(source){
 const f=source.media?.review?.transcript_fallback;
 return !!(f&&url(f.url)&&filled(f.archive_path)&&/^[a-f0-9]{64}$/.test(f.text_sha256||'')&&
  f.source_text_sha256===source.text_sha256&&['publisher','human_verified'].includes(f.provenance)&&
  f.full_text_parsed===true&&f.episode_matched===true&&f.speaker_verified===true&&
  f.date_verified===true&&f.context_checked===true&&f.critical_terms_checked===true&&
  filled(f.evidence_note));
}
export const mediaTextVerified=source=>source.media?.review?.critical_terms_checked===true&&
 (source.media?.review?.audio_checked===true||verifiedTranscriptFallback(source));

export function mediaSourceLink(source){
 const m=source.media;
 if(!m||!Number.isFinite(m.start_seconds)||m.start_seconds<0)return source.url;
 const target=new URL(source.url);
 if(['www.youtube.com','youtube.com','m.youtube.com','youtu.be'].includes(target.hostname)){
  target.searchParams.set('t',String(Math.floor(m.start_seconds)));return target.href;
 }
 if(m.link_mode==='media_fragment'&&/\.(mp3|m4a|mp4|webm|wav)$/i.test(target.pathname)){
  target.hash='t='+m.start_seconds+(Number.isFinite(m.end_seconds)?','+m.end_seconds:'');return target.href;
 }
 return source.url;
}

export function validateMediaSource(source,check){
 const m=source.media;if(!m)return;
 const label='Media source '+source.id;
 check(['podcast','interview','speech','video','audio'].includes(m.kind),label+' has an unknown medium');
 check(filled(m.recording_id)&&filled(m.canonical_recording_id)&&filled(m.segment_id),label+' needs recording and segment identities');
 check(filled(m.transcript_revision)&&['official','asr','human'].includes(m.transcript_origin),label+' needs transcript provenance');
 check(source.canonical_event_id==='recording:'+m.canonical_recording_id,label+' canonical event must identify the original recording');
 check(m.start_seconds===null||(Number.isFinite(m.start_seconds)&&m.start_seconds>=0),label+' invalid offset');
 check(m.end_seconds===null||(Number.isFinite(m.end_seconds)&&m.start_seconds!==null&&m.end_seconds>=m.start_seconds),label+' invalid end offset');
 if(m.duration_seconds!=null)check(Number.isFinite(m.duration_seconds)&&m.duration_seconds>=0&&(m.start_seconds==null||m.start_seconds<=m.duration_seconds)&&(m.end_seconds==null||m.end_seconds<=m.duration_seconds),label+' offset exceeds recording duration');
 check(['unresolved','candidate','verified'].includes(m.speaker?.status)&&filled(m.speaker?.label),label+' needs speaker mapping status');
 check(['pending','verified'].includes(m.review?.status),label+' needs a transcript/context review');
 if(m.recording_id!==m.canonical_recording_id)check(m.lineage?.verified===true&&m.lineage.evidence_urls?.some(url),label+' clip/repost identity needs verified lineage');
 if(m.published_representation_at&&m.published_representation_at!==source.published_at)check(m.lineage?.verified===true&&m.lineage?.original_date_verified===true,label+' original publication date needs evidence');
 if(m.review?.status==='verified'){
  check(filled(m.review.reviewer)&&filled(m.review.method)&&m.review.text_sha256===source.text_sha256,label+' approval must bind the exact transcript text');
  check(['author_statement','question','advertisement','quoted_third_party','archival_clip','unresolved'].includes(m.review.speech_role),label+' review needs an explicit speech role');
 }
 if(source.source_level==='primary'){
  check(m.speaker?.status==='verified'&&m.speaker?.evidence_urls?.some(url),label+' primary speech needs verified speaker evidence');
  check(source.author_ids?.length===1&&m.speaker?.author_id===source.author_ids[0],label+' primary speaker/author mismatch');
  check(m.review?.status==='verified'&&m.review?.speech_role==='author_statement',label+' primary speech needs a reviewed author statement');
  check(!['title','unresolved'].includes(m.speaker?.attribution_source),label+' title-only attribution cannot support primary speech');
  if(m.speaker?.presence==='archival')check(m.lineage?.verified===true&&m.lineage.original_date_verified===true,label+' archival speech needs original provenance and date');
  if(m.transcript_origin==='asr')check(mediaTextVerified(source),label+' ASR needs checked audio or a verified full-transcript fallback');
  if(['video','interview'].includes(m.kind))check(['none','verified'].includes(m.review?.visual_dependency),label+' must resolve any visual dependency before approval');
 }
}

export function validateMediaEvent(event,record,sourceMap,check,options={}){
 validateEventSourceImages(event,record,sourceMap,check,options);
 for(const span of event.support||[]){
  const s=sourceMap.get(span?.source_id);if(!s?.media)continue;
  const label='Event '+event.id+' media evidence';
  if(span.purpose!=='context'){
   check(s.author_ids?.length===1&&s.author_ids[0]===record.author_id,label+' attributes another speaker to the thesis author');
   check(s.source_level==='primary'&&s.media.review?.speech_role==='author_statement',label+' question, ad or quoted third-party material cannot establish the author view');
  }
 }
 if(record.review?.status==='approved')for(const id of [...(event.source_ids||[]),...(event.context_source_ids||[])]){
  const s=sourceMap.get(id);if(!s?.media)continue;
  check(s.media.review?.status==='verified'&&s.context_complete,'Approved media event '+event.id+' has unreviewed transcript/context');
  if(s.media.transcript_origin==='asr')check(mediaTextVerified(s),'Approved media event '+event.id+' has unchecked ASR context');
  if(['video','interview'].includes(s.media.kind))check(['none','verified'].includes(s.media.review?.visual_dependency),'Approved media event '+event.id+' has unresolved visual context');
 }
}
