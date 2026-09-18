import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMedia,parseArraysTranscript,arraysEpisodeInput} from './normalize-media.mjs';
import {validateMediaSource,validateMediaEvent,mediaSourceLink} from './media-contract.mjs';

function input(){return {subject_id:'guest',authors:[{id:'guest',name:'Guest Investor',identity_status:'verified',evidence_urls:['https://example.invalid/guest']},{id:'host',name:'Host',identity_status:'verified',evidence_urls:['https://example.invalid/host']}],
 recording:{id:'episode-1',kind:'podcast',url:'https://www.youtube.com/watch?v=fixture',display_name:'Fixture interview',published_at:'2026-09-01T12:00:00Z',spoken_at:null,duration_seconds:600},
 transcript:{format:'arrays',origin:'official',has_timestamps:true,text:'[spk 1 @ 0] Would you buy Acme?\n[spk 0 @ 12.5] I would not buy Acme above $40.\nUnparsed closing text.'},
 person_aliases:{'person-guest':'guest'},speaker_candidates:{'spk 0':{person_id:'person-guest',confidence:.99,attribution_source:'title',presence:'evidenced'}},
 speaker_bindings:{'spk 1':{author_id:'host',verified:true,attribution_source:'intro_selfstated',presence:'evidenced',evidence_urls:['https://example.invalid/intro']}}};}
function errors(s){const out=[];validateMediaSource(s,(ok,msg)=>{if(!ok)out.push(msg);});return out;}
function approved(){const s=normalizeMedia(input()).sources[1];s.source_level='primary';s.context_complete=true;s.media.speaker={...s.media.speaker,status:'verified',attribution_source:'intro_selfstated',evidence_urls:['https://example.invalid/intro']};s.media.review={...s.media.review,status:'verified',reviewer:'Fixture',method:'Checked source passage',speech_role:'author_statement'};return s;}
test('All transcript turns, zero offsets and unparsed content remain reviewable',()=>{
 const b=normalizeMedia(input());assert.equal(b.sources.length,3);assert.equal(b.sources[0].media.start_seconds,0);assert.equal(b.sources[1].text,'I would not buy Acme above $40.');assert.equal(b.sources[2].text,'Unparsed closing text.');assert.equal(b.review_queue[2].parse_status,'unparsed');assert.equal(b.review_queue.length,b.media_inventory[0].segments.length);assert.equal(b.sources.filter(s=>s.source_level==='primary').length,0);
 assert.equal(b.sources[1].media.speaker.status,'candidate');assert.equal(b.sources[2].media.speaker.status,'unresolved');
});
test('No timestamp support never invents offsets or a wall-clock time',()=>{
 const p=input();p.transcript.has_timestamps=false;const s=normalizeMedia(p).sources[1];assert.equal(s.media.start_seconds,null);assert.equal(s.spoken_at,null);assert.equal(s.published_at,p.recording.published_at);assert.equal(mediaSourceLink(s),p.recording.url);
});
test('A high-confidence title-only attribution cannot become primary speech',()=>{
 const s=approved();s.media.speaker.attribution_source='title';assert(errors(s).some(e=>e.includes('title-only')));
});
test('ASR cannot be approved without audio and critical-term checks',()=>{
 const s=approved();s.media.transcript_origin='asr';assert(errors(s).some(e=>e.includes('ASR')));s.media.review.audio_checked=true;s.media.review.critical_terms_checked=true;assert.deepEqual(errors(s),[]);
 s.media.review.text_sha256='different';assert(errors(s).some(e=>e.includes('exact transcript')));
});
test('Transcript fallback binds the exact source and checks provenance without pretending to hear audio',()=>{
 const s=approved();s.media.transcript_origin='asr';s.media.review.audio_checked=false;s.media.review.critical_terms_checked=true;
 s.media.review.transcript_fallback={url:'https://example.invalid/publisher/transcript',archive_path:'evidence/transcript.txt',text_sha256:'a'.repeat(64),source_text_sha256:s.text_sha256,provenance:'publisher',full_text_parsed:true,episode_matched:true,speaker_verified:true,date_verified:true,context_checked:true,critical_terms_checked:true,evidence_note:'Fixture transcript and Q&A checked.'};
 assert.deepEqual(errors(s),[]);assert.equal(s.media.review.audio_checked,false);
 for(const field of ['episode_matched','speaker_verified','date_verified','full_text_parsed','context_checked','critical_terms_checked']){
  const bad=structuredClone(s);bad.media.review.transcript_fallback[field]=false;assert(errors(bad).some(e=>e.includes('ASR')));
 }
 for(const change of [{source_text_sha256:'different'},{provenance:'asr_mirror'},{archive_path:''},{text_sha256:''}]){
  const bad=structuredClone(s);Object.assign(bad.media.review.transcript_fallback,change);assert(errors(bad).some(e=>e.includes('ASR')));
 }
});
test('ASR host context needs audio checks even when it is not primary evidence',()=>{
 const s=approved();s.source_level='secondary';s.media.transcript_origin='asr';s.media.review.speech_role='question';
 const out=[];validateMediaEvent({id:'e',source_ids:[],context_source_ids:[s.id],support:[{source_id:s.id,purpose:'context'}]}, {author_id:'guest',review:{status:'approved'}},new Map([[s.id,s]]),(ok,msg)=>{if(!ok)out.push(msg);});
 assert(out.some(e=>e.includes('unchecked ASR context')));
});
test('Host questions and third-party quotations do not become a guest belief',()=>{
 const s=approved();s.media.review.speech_role='question';assert(errors(s).some(e=>e.includes('author statement')));
 s.media.review.speech_role='author_statement';s.author_ids=['host'];const out=[];validateMediaEvent({id:'e',support:[{source_id:s.id,purpose:'judgment'}],source_ids:[s.id]}, {author_id:'guest',review:{status:'approved'}},new Map([[s.id,s]]),(ok,msg)=>{if(!ok)out.push(msg);});assert(out.some(e=>e.includes('another speaker')));
});
test('Archival clips require original-date evidence and do not reset event identity',()=>{
 const s=approved();s.media.speaker.presence='archival';assert(errors(s).some(e=>e.includes('archival')));
 const p=input();p.recording.id='clip-2';p.recording.canonical_recording_id='episode-1';assert.throws(()=>normalizeMedia(p),/lineage/);
 p.recording.lineage={verified:true,original_date_verified:true,evidence_urls:['https://example.invalid/original']};const b=normalizeMedia(p),original=normalizeMedia(input());assert.equal(b.sources[1].canonical_event_id,original.sources[1].canonical_event_id);assert.notEqual(b.sources[1].id,original.sources[1].id);
 p.recording.canonical_recording_id='another-appearance';const other=normalizeMedia(p);assert.notEqual(other.sources[1].canonical_event_id,original.sources[1].canonical_event_id);
});
test('Seek links preserve media offsets without adding them to source dates',()=>{
 const s=approved();assert.equal(mediaSourceLink(s),'https://www.youtube.com/watch?v=fixture&t=12');assert.equal(s.published_at,'2026-09-01T12:00:00Z');s.url='https://example.invalid/episode';assert.equal(mediaSourceLink(s),s.url);
 s.url='https://example.invalid/audio.mp3';s.media.link_mode='media_fragment';s.media.end_seconds=30;assert.equal(mediaSourceLink(s),'https://example.invalid/audio.mp3#t=12.5,30');
});
test('Invalid offsets, empty segments and mismatched RSS episodes fail closed',()=>{
 const p=input();p.transcript={format:'segments',origin:'human',segments:[{speaker:'spk 0',text:'Example',start_seconds:700}]};assert.throws(()=>normalizeMedia(p),/duration/);
 p.transcript.segments[0].start_seconds=0;p.transcript.segments[0].text='';assert.throws(()=>normalizeMedia(p),/Empty/);
 assert.throws(()=>arraysEpisodeInput({episode_id:'a',date:'2026-09-01'},{recording:{url:'https://example.invalid/b',episode_id:'b',published_at:'2026-09-01'}}),/GUID/);
});
test('Video-dependent claims require visual review rather than transcript-only approval',()=>{
 const s=approved();s.media.kind='interview';assert(errors(s).some(e=>e.includes('visual dependency')));s.media.review.visual_dependency='none';assert.deepEqual(errors(s),[]);
});
test('Helpful missing images require explicit retrieval gaps while required images still fail closed',()=>{
 const source={id:'source-1',attachment_status:'unavailable',attachments:[],attachment_reason:'Archived image URL was not recovered.'};
 const record={author_id:'guest',review:{status:'approved'}};
 const event={id:'event-1',source_ids:['source-1'],context_source_ids:[],support:[],visual_dependency:'helpful',visual_dependency_reason:'The chart would improve context.',media_bindings:[{source_id:'source-1',attachment_id:'image-1',disposition:'retrieval_gap',reason:'The archived attachment ID is known but its URL is unavailable.'}]};
 const helpful=[];validateMediaEvent(event,record,new Map([[source.id,source]]),(ok,msg)=>{if(!ok)helpful.push(msg);});assert.deepEqual(helpful,[]);
 event.visual_dependency='required';const required=[];validateMediaEvent(event,record,new Map([[source.id,source]]),(ok,msg)=>{if(!ok)required.push(msg);});assert(required.some(msg=>msg.includes('required visual context')));
});
test('Generic diarized segments retain full speaker boundaries and original language',()=>{
 const p=input();p.transcript={format:'segments',origin:'asr',segments:[{speaker:'A',start_seconds:0,end_seconds:3,text:'主持人的问题'},{speaker:'B',start_seconds:4,end_seconds:9,text:'I sold half, not all.'}]};const b=normalizeMedia(p);assert.equal(b.sources[0].text,'主持人的问题');assert.equal(b.sources[1].text,'I sold half, not all.');assert.equal(b.sources[1].media.end_seconds,9);assert.notEqual(b.sources[0].author_ids[0],b.sources[1].author_ids[0]);
});
