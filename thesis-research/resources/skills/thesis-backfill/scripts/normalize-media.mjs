import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateMediaSource} from './media-contract.mjs';
const sha=text=>crypto.createHash('sha256').update(text).digest('hex');

export function parseArraysTranscript(text,hasTimestamps=true){
 if(typeof text!=='string')throw Error('Transcript must be text');
 return text.split(/\r?\n/).flatMap((line,index)=>{
  if(!line.trim())return [];
  const match=line.match(/^\[(spk \d+)(?: @ (\d+(?:\.\d+)?))?\] ?(.*)$/);
  return [{id:'line-'+(index+1),speaker:match?.[1]||'unresolved',start_seconds:hasTimestamps&&match?.[2]!==undefined?Number(match[2]):null,end_seconds:null,
   text:match?match[3]:line,parse_status:match?'parsed':'unparsed',line:index+1}];
 });
}

export function arraysEpisodeInput(episode,config){
 if(!config.recording?.url)throw Error('Resolve the episode GUID against publisher/RSS metadata before normalizing');
 if(config.recording.episode_id!==episode.episode_id)throw Error('Publisher episode GUID does not match the transcript');
 if(config.recording.published_at?.slice(0,10)!==episode.date)throw Error('Publisher/transcript publication day mismatch');
 return {...config,recording:{...config.recording,id:'arrays:'+episode.id,kind:config.recording.kind||'podcast'},
  transcript:{format:'arrays',origin:episode.transcript_source,type:episode.transcript_type,text:episode.transcript,has_timestamps:episode.has_timestamps,source_url:episode.transcript_url||null},
  speaker_candidates:episode.resolved_speakers||{}};
}

export function diarizedInput(result,config){
 if(!Array.isArray(result.segments))throw Error('Diarized transcript needs segments');
 return {...config,transcript:{format:'segments',origin:'asr',segments:result.segments.map((s,i)=>({id:s.id==null?'segment-'+i:String(s.id),speaker:s.speaker==null?'unresolved':String(s.speaker),text:s.text,start_seconds:s.start??null,end_seconds:s.end??null}))}};
}

export function normalizeMedia(input){
 const r=input.recording,tr=input.transcript;
 if(!r?.id||!r.url||new URL(r.url).protocol!=='https:'||!r.display_name)throw Error('Recording needs a stable ID, HTTPS original URL and display name');
 if(!['podcast','interview','speech','video','audio'].includes(r.kind))throw Error('Unsupported recording kind');
 if(!['official','asr','human'].includes(tr?.origin))throw Error('Transcript origin must be declared');
 if(!r.published_at||!Number.isFinite(Date.parse(r.published_at)))throw Error('Publication date required; collection time is not a substitute');
 const authors=structuredClone(input.authors||[]),known=new Map(authors.map(a=>[a.id,a]));
 if(!known.has(input.subject_id))throw Error('The subject needs a verified identity entry');
 const segments=tr.format==='arrays'?parseArraysTranscript(tr.text,tr.has_timestamps):tr.format==='segments'?tr.segments:null;
 if(!Array.isArray(segments)||!segments.length)throw Error('Provide an Arrays transcript or timestamped speaker segments, not a show description');
 const revision=sha(tr.format==='arrays'?tr.text:JSON.stringify(tr.segments));
 const canonical=r.canonical_recording_id||r.id;
 if(canonical!==r.id&&(!r.lineage?.verified||!r.lineage.evidence_urls?.length))throw Error('Cross-platform deduplication requires verified original-recording lineage');
 const channel='media:'+r.id,sources=[],reviewQueue=[],seen=new Set();
 for(const [index,segment]of segments.entries()){
  if(typeof segment.text!=='string'||!segment.text.trim())throw Error('Empty segment '+index);
  const id=segment.id||'segment-'+index;if(seen.has(id))throw Error('Duplicate transcript segment '+id);seen.add(id);
  const label=segment.speaker==null?'unresolved':String(segment.speaker),candidate=input.speaker_candidates?.[label]||{},binding=input.speaker_bindings?.[label];
  const mapped=binding?.author_id||input.person_aliases?.[candidate.person_id]||null;
  if(mapped&&!known.has(mapped))throw Error('Speaker binding refers to an unknown author');
  const author=mapped||'unresolved:'+r.id+':'+label;
  if(!known.has(author)){const entry={id:author,name:candidate.name||label,identity_status:'ambiguous',evidence_urls:[r.url]};known.set(author,entry);authors.push(entry);}
  const verified=!!binding?.verified&&binding.evidence_urls?.length>0&&known.get(author).identity_status==='verified';
  const start=segment.start_seconds??null,end=segment.end_seconds??null;
  if(start!==null&&(!Number.isFinite(start)||start<0))throw Error('Invalid segment start');
  if(end!==null&&(start===null||!Number.isFinite(end)||end<start))throw Error('Invalid segment end');
  if(r.duration_seconds!=null&&((start!=null&&start>r.duration_seconds)||(end!=null&&end>r.duration_seconds)))throw Error('Segment exceeds media duration');
  const textHash=sha(segment.text),sourceId='media:'+r.id+':'+id+':'+revision.slice(0,16);
  const source={id:sourceId,channel_id:channel,url:r.url,display_name:r.display_name,author_ids:[author],canonical_event_id:'recording:'+canonical,
   published_at:r.original_published_at||r.published_at,spoken_at:r.spoken_at||null,locator:r.display_name+' / '+label+' / '+(start===null?'segment '+id:start+' seconds'),
   text:segment.text,text_sha256:textHash,source_level:'secondary',context_complete:false,
   media:{kind:r.kind,display_name:r.display_name,recording_id:r.id,canonical_recording_id:canonical,segment_id:id,transcript_revision:revision,transcript_origin:tr.origin,transcript_url:tr.source_url||null,
    published_representation_at:r.published_at,start_seconds:start,end_seconds:end,duration_seconds:r.duration_seconds??null,link_mode:r.link_mode||'page',lineage:r.lineage||null,
    speaker:{label,author_id:author,status:verified?'verified':mapped?'candidate':'unresolved',person_id:candidate.person_id||null,
     confidence:candidate.confidence??null,attribution_source:binding?.attribution_source||candidate.attribution_source||'unresolved',presence:binding?.presence||candidate.presence||'unresolved',evidence_urls:binding?.evidence_urls||[]},
    review:{status:'pending',speech_role:'unreviewed',text_sha256:textHash,audio_checked:false,critical_terms_checked:false}}};
  const problems=[];validateMediaSource(source,(ok,message)=>{if(!ok)problems.push(message);});if(problems.length)throw Error(problems.join('\n'));
  sources.push(source);
  reviewQueue.push({source_id:sourceId,segment_id:id,subject_candidate:author===input.subject_id,parse_status:segment.parse_status||'provided',
   needs:[...(!verified?['speaker_attribution']:[]),...(tr.origin==='asr'?['verify_audio_or_full_transcript']:[]),'speech_role','context_completeness','investment_classification']});
 }
 for(const [i,row]of reviewQueue.entries())row.neighbor_source_ids=sources.slice(Math.max(0,i-2),i+2).filter(s=>s.id!==row.source_id).map(s=>s.id);
 return {schema_version:'media-sources/1.0',subject_id:input.subject_id,authors,sources,
  coverage:[{id:channel,channel:r.kind,url:r.url,declared_scope:r.display_name+' transcript',status:'partial',proof:sources.length+' nonempty transcript segments preserved; semantic review pending',gaps:['Transcript, speaker and context review not complete.',...(r.visuals_present?['Visual-only evidence has not been reviewed.']:[])]}],
  media_inventory:[{id:r.id,url:r.url,canonical_recording_id:canonical,transcript_revision:revision,segments:sources.map(s=>s.id),review_status:'pending',visual_coverage:r.visuals_present?'not_reviewed':'not_declared'}],
  review_queue:reviewQueue,completion:{collection:'partial',classification:'partial',review:'partial'},published:false};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [, ,file,out,configFile]=process.argv;if(!file||!out)throw Error('Usage: normalize-media.mjs input.json NEW-output.json [episode-config.json]');
 let input=JSON.parse(fs.readFileSync(file));if(configFile){const config=JSON.parse(fs.readFileSync(configFile));input=config.transcript_format==='diarized_json'?diarizedInput(input,config):arraysEpisodeInput(input,config);}
 const bundle=normalizeMedia(input);fs.writeFileSync(out,JSON.stringify(bundle,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({sources:bundle.sources.length,reviewQueue:bundle.review_queue.length,output:out,published:false}));
}
