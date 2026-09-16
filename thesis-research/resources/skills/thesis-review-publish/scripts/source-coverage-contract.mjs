import crypto from 'node:crypto';
import links from '../../thesis-backfill/scripts/source-links.cjs';
import {proseLength} from '../../thesis-backfill/scripts/prose-limit.mjs';
const hash=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const need=(ok,message)=>{if(!ok)throw Error(message);};
const identity=i=>({author:i.internalAuthorId,thesis:i.internalThesisKey,event:i.eventId,mode:i.mode,at:i.at,primarySourceId:i.primarySourceId,reviewId:i.review?.id,reviewer:i.review?.reviewer,reviewMethod:i.review?.method,baselineVersion:i.baselineVersion??null});
export const provenanceHash=s=>hash({authorIds:s.authorIds,media:s.mediaProvenance||null,document:s.documentProvenance||null,attachmentStatus:s.attachmentStatus??null,attachments:s.attachments||[]});
const ref=s=>({id:s.id,revision:s.revision,url:s.url,at:s.at,textSha256:hash(s.text),provenanceSha256:provenanceHash(s)});

// Bind validated evidence before downstream formatting. This is not semantic approval.
export function sealSourceCoverage(item,sourceMap,claimSourceIds=[]){
 need(Array.isArray(item.sourceIds)&&item.sourceIds.includes(item.primarySourceId),'Coverage needs a primary source');
 need(claimSourceIds.every(id=>item.sourceIds.includes(id)),'Claim evidence was omitted before export preparation');
 const ids=[item.primarySourceId,...item.sourceIds.filter(id=>id!==item.primarySourceId)];
 need(new Set(ids).size===ids.length,'Duplicate coverage source');
 return {version:'source-coverage/1.0',identity:identity(item),bodySha256:hash(links.split(item.description).prose),
  sources:ids.map(id=>{const s=sourceMap.get(id);need(s,'Unknown coverage source '+id);return ref(s);})};
}
export function validateSourceCoverage(item,sourceMap){
 const proof=item.sourceCoverage;need(proof?.version==='source-coverage/1.0','Current export needs sourceCoverage from the preparation adapter');
 const expected=sealSourceCoverage(item,sourceMap);
 need(JSON.stringify(proof)===JSON.stringify(expected),'Prepared body, source, date or review changed; re-review and re-prepare');
}
export function validateDelivery(cards,manifest,{allowLegacy=false}={}){
 const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);};
 if(!Array.isArray(cards)||!Array.isArray(manifest?.items))return {ok:false,errors:['Cards and manifest items are required']};
 check(cards.length===manifest.items.length,'Card/manifest count mismatch');
 const seen=new Set();
 for(const e of manifest.items){
  if(!e||!Array.isArray(e.sourceRevisions)||e.sourceRevisions.some(s=>!s)){check(false,'Malformed delivery entry');continue;}
  const card=cards[e.cardIndex],p=e.sourceCoverage,label='Event '+e.eventId;
  check(!seen.has(e.cardIndex),label+' duplicate card index');seen.add(e.cardIndex);
  if(!card){check(false,label+' missing card');continue;}
  check(card.author?.id===e.authorId&&card.thesisId===e.thesisId,label+' identity mismatch');
  check(proseLength(card.body)<=500,label+' delivered body exceeds 500 prose characters');
  check(hash({card,mode:e.mode,sourceVersions:(e.sourceRevisions||[]).map(s=>[s.id,s.revision])})===e.contentHash,label+' delivered card changed after export');
  if(!p){check(allowLegacy,label+' legacy unsealed evidence requires explicit compatibility mode');continue;}
  if(!p.identity||!Array.isArray(p.sources)||p.sources.some(s=>!s)){check(false,label+' malformed source coverage');continue;}
  check(p.version==='source-coverage/1.0',label+' unknown coverage version');
  const footer=links.split(card.body);
  check(hash(footer.prose)===p.bodySha256,label+' body differs from reviewed delivery prose');
  check(Date.parse(p.identity.at)===card.createdAtMs,label+' date differs from selected expression');
  check(p.identity.event===e.eventId&&p.identity.thesis===e.internalThesisKey&&p.identity.mode===e.mode&&p.identity.reviewId===e.reviewRecordId&&p.identity.reviewer===e.reviewer&&p.identity.reviewMethod===e.reviewMethod,label+' provenance differs from prepared evidence');
  check(p.sources.length>0&&p.sources[0].id===p.identity.primarySourceId,label+' primary source is not first');
  const urls=[...new Set(p.sources.map(s=>links.safe(s.url)))];
  check(urls.every(Boolean)&&JSON.stringify(footer.links.map(s=>links.safe(s.url)))===JSON.stringify(urls),label+' original footer omitted, added or reordered evidence');
  check(footer.links.every(s=>links.validLabel(s.label)),label+' invalid original link label');
  check(JSON.stringify(p.sources)===JSON.stringify(e.sourceRevisions.map(s=>({id:s.id,revision:s.revision,url:s.url,at:s.at,textSha256:s.textSha256,provenanceSha256:s.provenanceSha256}))),label+' source revision provenance changed');
  check(e.sourceRevisions.every(s=>provenanceHash({authorIds:s.authorIds,mediaProvenance:s.media,documentProvenance:s.document,attachmentStatus:s.attachmentStatus,attachments:s.attachments})===s.provenanceSha256),label+' speaker, media, attachment or document metadata changed after export');
 }
 return {ok:errors.length===0,errors};
}
