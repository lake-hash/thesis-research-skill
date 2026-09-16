import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import links from '../../thesis-backfill/scripts/source-links.cjs';
import {proseLength} from '../../thesis-backfill/scripts/prose-limit.mjs';
import {validateSourceCoverage,validateDelivery,provenanceHash} from './source-coverage-contract.mjs';
const hash = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const obj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = v => typeof v === 'string' && v.trim().length > 0;
const tuple = (...v) => JSON.stringify(v);
const url = v => { try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
const need = (condition, message) => { if (!condition) throw Error(message); };
function sourceMedia(item,sources){
  need(Array.isArray(item.expressionSourceIds)&&item.expressionSourceIds.length>0,'Expression source IDs required for source image delivery');
  const imageSourceIds=Array.isArray(item.imageSourceIds)?item.imageSourceIds:item.expressionSourceIds;
  need(imageSourceIds.length>0&&item.expressionSourceIds.every(id=>imageSourceIds.includes(id)),'Image source IDs must include every expression source');
  need(Array.isArray(item.sourceImageBindings),'Source image bindings required');
  need(['required','helpful','none'].includes(item.visualDependency)&&text(item.visualDependencyReason),'Reviewed visual dependency required');
  const bindings=new Map();for(const b of item.sourceImageBindings){need(obj(b)&&text(b.sourceId)&&text(b.attachmentId)&&['include','omit','unrelated'].includes(b.disposition),'Malformed source image binding');const key=tuple(b.sourceId,b.attachmentId);need(!bindings.has(key),'Duplicate source image binding');if(['omit','unrelated'].includes(b.disposition))need(text(b.reason),'Omitted image needs a reason');bindings.set(key,b);}
  const media=[],seen=new Set();
  for(const sourceId of imageSourceIds){const source=sources.get(sourceId);need(source&&item.sourceIds.includes(sourceId),'Unknown image source');need(['none','complete','unavailable'].includes(source.attachmentStatus),'Image source attachments are undeclared');if(source.attachmentStatus==='unavailable')need(item.visualDependency==='none','Unavailable source images cannot satisfy helpful/required visual context');
    const attachments=Array.isArray(source.attachments)?source.attachments:[];if(source.attachmentStatus==='none')need(attachments.length===0,'No-image source contains attachments');if(source.attachmentStatus==='complete')need(attachments.length>0,'Complete image source is empty');
    for(const attachment of attachments){const binding=bindings.get(tuple(sourceId,attachment.id));need(binding,'Accepted event omits source image '+sourceId+'/'+attachment.id);if(binding.disposition!=='include')continue;const image={type:'image',coverUrl:attachment.coverUrl,...(attachment.url?{url:attachment.url}:{})};const key=JSON.stringify(image);if(!seen.has(key)){seen.add(key);media.push(image);}}
  }
  for(const b of bindings.values())need(imageSourceIds.includes(b.sourceId),'Image binding points outside reviewed expression/context sources');
  if(['required','helpful'].includes(item.visualDependency))need(media.length>0,'Helpful/required visual context must be included in card media');
  if(item.visualDependency==='none')need(media.length===0,'No-context visual decision cannot include card media');
  return media;
}
function instant(value) {
  need(text(value) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value), 'Exact source timestamp with timezone required');
  const ms = Date.parse(value), [y,m,d] = value.slice(0,10).split('-').map(Number);
  need(m>=1 && m<=12 && d>=1 && d<=new Date(Date.UTC(y,m,0)).getUTCDate() && Number.isSafeInteger(ms) && ms>0, 'Invalid timestamp');
  return ms;
}
function exactKeys(o, required, optional=[]) {
  need(obj(o), 'Expected object');
  need(required.every(k=>Object.hasOwn(o,k)), 'Missing required field');
  need(Object.keys(o).every(k=>required.includes(k)||optional.includes(k)), 'Unexpected public field');
}
export function validateCard(card) {
  const errors=[];
  try {
    exactKeys(card,['thesisId','type','createdAtMs','author','body','tickers','media']);
    need(Number.isSafeInteger(card.thesisId)&&card.thesisId>0,'Invalid thesisId');
    need(['new_thesis','thesis_update'].includes(card.type),'Invalid type');
    need(Number.isSafeInteger(card.createdAtMs)&&card.createdAtMs>0&&Number.isFinite(new Date(card.createdAtMs).getTime()),'Invalid createdAtMs');
    exactKeys(card.author,['id']); need(text(card.author.id),'Missing author.id'); need(text(card.body),'Empty body');
    need(Array.isArray(card.tickers)&&card.tickers.length>0,'At least one ticker required');
    const symbols=new Set();
    for(const t of card.tickers){exactKeys(t,['symbol'],['logoUrl']); need(text(t.symbol)&&t.symbol===t.symbol.trim(),'Invalid symbol'); need(!symbols.has(t.symbol.toUpperCase()),'Duplicate symbol');symbols.add(t.symbol.toUpperCase());if(Object.hasOwn(t,'logoUrl'))need(url(t.logoUrl),'Invalid logoUrl');}
    need(Array.isArray(card.media),'media must be array');
    for(const m of card.media){exactKeys(m,['type','coverUrl'],['url']);need(['image','priceChart'].includes(m.type)&&url(m.coverUrl),'Invalid media');if(Object.hasOwn(m,'url'))need(url(m.url),'Invalid media URL');}
    need(!/<\/?[a-z][^>]*>/i.test(card.body),'HTML is not allowed in body');
    const footer=links.split(card.body);need(text(footer.prose),'Body needs prose');
    need(proseLength(card.body)<=500,'Body exceeds 500 prose characters; rewrite and review before export');
    const seen=new Set();for(const s of footer.links){need(url(s.url)&&links.validLabel(s.label),'Invalid named source link');need(!seen.has(s.url),'Duplicate source URL');seen.add(s.url);}
  }catch(e){errors.push(e.message);}
  return {ok:errors.length===0,errors};
}
export function exportCards(input) {
  need(obj(input)&&['thesis-export-input/1.0','thesis-export-input/1.1'].includes(input.schemaVersion),'Unsupported export input');
  need(text(input.runId)&&input.timePolicy==='expression_time','runId and explicit expression_time policy required');
  need(Array.isArray(input.authorMap)&&Array.isArray(input.sources)&&Array.isArray(input.items),'Required arrays missing');
  need(obj(input.assignments)&&['feed','fixture','local_preview'].includes(input.assignments.authority)&&text(input.assignments.revision)&&Array.isArray(input.assignments.entries),'Persisted feed assignment map required');
  const authors=new Map(), backendAuthors=new Set(), assignments=new Map(), numbers=new Set(), sources=new Map();
  for(const a of input.authorMap){need(obj(a)&&text(a.internalAuthorId)&&text(a.authorId),'Invalid author map');need(!authors.has(a.internalAuthorId)&&!backendAuthors.has(a.authorId),'Ambiguous author map; resolve aliases first');authors.set(a.internalAuthorId,a.authorId);backendAuthors.add(a.authorId);}
  for(const a of input.assignments.entries){need(obj(a)&&text(a.authorId)&&text(a.internalThesisKey)&&Number.isSafeInteger(a.thesisId)&&a.thesisId>0,'Invalid assignment');const k=tuple(a.authorId,a.internalThesisKey),n=tuple(a.authorId,a.thesisId);need(!assignments.has(k)&&!numbers.has(n),'Assignment collision');assignments.set(k,a.thesisId);numbers.add(n);}
  for(const s of input.sources){need(obj(s)&&text(s.id)&&text(s.revision)&&!sources.has(s.id),'Invalid/duplicate source identity');need(Array.isArray(s.authorIds)&&s.authorIds.every(text)&&text(s.text),'Invalid source authors/text');if(s.textSha256!==undefined)need(s.textSha256===hash(s.text),'Source hash mismatch');sources.set(s.id,s);}
  const groups=new Map();
  for(const item of input.items){
    if(!obj(item)||item.review?.status!=='approved')continue;
    const key=tuple(item.internalAuthorId,item.internalThesisKey);
    if(!groups.has(key))groups.set(key,{modes:new Set(),firstEvents:new Set(),firstAt:null});
    const g=groups.get(key);g.modes.add(item.mode);
    if(item.mode==='history_event'&&item.type==='new_thesis'){g.firstEvents.add(item.eventId);g.firstAt=item.at;}
  }
  const cards=[],entries=[],holds=[],duplicates=[],identities=new Map(), conflicts=new Set();
  for(const [inputIndex,item] of input.items.entries()) {
    try {
      need(obj(item),'Malformed item');need(!Object.hasOwn(item,'title'),'Generated thesis/update title is forbidden');
      need(text(item.internalAuthorId)&&text(item.internalThesisKey)&&text(item.eventId),'Missing stable item identity');
      need(obj(item.review)&&item.review.status==='approved'&&['id','reviewer','method'].every(k=>text(item.review[k])),'Source-first approval record required');
      need(item.eventDisposition===undefined||item.eventDisposition==='update','Source-only, held or unresolved events cannot be product cards');
      need(!item.preparationError,item.preparationError||'Unresolved preparation error');
      need(item.datePrecision!=='day','Day-only source requires an explicit product time policy; midnight is not a verified timestamp');
      need(['new_thesis','thesis_update'].includes(item.type),'Non-card disposition');
      need(['history_event','current_snapshot'].includes(item.mode),'Explicit card mode required');
      const group=groups.get(tuple(item.internalAuthorId,item.internalThesisKey));
      need(group?.modes.size===1,'Snapshot and history routes cannot be mixed for one thesis');
      need(group.firstEvents.size<=1,'Multiple first archive events for one thesis');
      if(item.type==='thesis_update'&&group.firstAt)need(instant(item.at)>=instant(group.firstAt),'Update precedes first archive card; historical reconciliation required');
      need(item.originStatus && ['new','existing','unknown'].includes(item.originStatus),'Origin metadata required');
      need(['FIRST_OBSERVED','EVIDENCE','REVISE','POSITION','CLOSED','WITHDRAW','REAFFIRM'].includes(item.eventType),'Unknown event type');
      if(input.schemaVersion==='thesis-export-input/1.1')need(item.eventDisposition==='update'&&item.incrementReview?.decision==='update'&&['reason','evidence','condition','correction'].includes(item.incrementReview?.incrementKind)&&text(item.incrementReview?.increment)&&text(item.incrementReview?.reviewId),'Current export needs a reviewed material thesis increment');
      if(item.eventType==='REAFFIRM')need(item.eventDisposition==='update'&&item.incrementReview?.decision==='update'&&text(item.incrementReview.increment)&&text(item.incrementReview.reviewId),'Legacy REAFFIRM needs an explicit reviewed increment');
      need(item.type!=='new_thesis'||item.eventType==='FIRST_OBSERVED','New archive card must be FIRST_OBSERVED');
      need(item.type!=='thesis_update'||item.eventType!=='FIRST_OBSERVED','Update cannot restart archive history');
      need(item.type!=='thesis_update'||text(item.baselineVersion),'Update baseline version required');
      const authorId=authors.get(item.internalAuthorId);need(authorId,'Unknown backend author mapping');
      const thesisId=assignments.get(tuple(authorId,item.internalThesisKey));need(thesisId,'Missing persisted thesis assignment');
      const at=instant(item.at);need(text(item.description),'Empty description');
      if(input.schemaVersion==='thesis-export-input/1.1'||item.sourceCoverage)validateSourceCoverage(item,sources);
      need(Array.isArray(item.sourceIds)&&item.sourceIds.length>0&&new Set(item.sourceIds).size===item.sourceIds.length&&item.sourceIds.includes(item.primarySourceId),'Primary/source references required');
      const ordered=[item.primarySourceId,...item.sourceIds.filter(id=>id!==item.primarySourceId)];
      const originals=ordered.map(id=>{const s=sources.get(id);need(s,'Unknown source '+id);need(s.datePrecision!=='day','Day-only source timestamp cannot be exported');need(s.linkAllowed!==false,'Original source link not cleared');return s;});
      need(originals[0].authorIds.includes(item.internalAuthorId),'Primary source is not the thesis author');
      need(originals[0].at===item.at,'Card date must match selected original source');
      for(const s of originals){const sourceAt=instant(s.at);if(item.mode==='history_event')need(sourceAt<=at,'Future source in dated expression');}
      need(Array.isArray(item.assetBindings),'Missing reviewed bindings');
      const tickers=[],symbolSet=new Set();
      for(const b of item.assetBindings){need(obj(b),'Malformed binding');if(b.role==='related')continue;need(['primary','vehicle'].includes(b.role)&&b.verified===true&&text(b.symbol),'Unresolved investment binding');if(b.basis==='alva_proxy')need(text(b.displayNote)&&item.description.includes(b.displayNote),'Alva proxy needs visible disclosure');const key=b.symbol.trim().toUpperCase();need(!symbolSet.has(key),'Duplicate displayed binding');symbolSet.add(key);const t={symbol:b.symbol};if(b.logoUrl!==undefined&&b.logoUrl!==null)t.logoUrl=b.logoUrl;tickers.push(t);}
      need(Array.isArray(item.media),'Explicit media array required');
      const media=item.media.map(m=>{need(obj(m),'Malformed media');return {type:m.type,coverUrl:m.coverUrl,...(m.url===undefined?{}:{url:m.url})};});
      if(input.schemaVersion==='thesis-export-input/1.1')need(JSON.stringify(media)===JSON.stringify(sourceMedia(item,sources)),'Card media does not match accepted expression source images');
      const body=links.append(item.description,originals);
      const card={thesisId,type:item.type,createdAtMs:at,author:{id:authorId},body,tickers,media};
      const validation=validateCard(card);need(validation.ok,validation.errors.join('; '));
      const key=hash([authorId,item.internalThesisKey,item.eventId]);
      const contentHash=hash({card,mode:item.mode,sourceVersions:originals.map(s=>[s.id,s.revision])});
      if(identities.has(key)){if(identities.get(key)!==contentHash)conflicts.add(key);need(identities.get(key)===contentHash,'Conflicting versions for same event; separate correction required');duplicates.push({inputIndex,eventId:item.eventId,idempotencyKey:key});continue;}
      identities.set(key,contentHash);
      entries.push({...item.sourceCoverage?{sourceCoverage:structuredClone(item.sourceCoverage)}:{},cardIndex:cards.length,inputIndex,authorId,internalThesisKey:item.internalThesisKey,thesisId,eventId:item.eventId,originalEventIds:item.originalEventIds||[item.eventId],mode:item.mode,eventType:item.eventType,originStatus:item.originStatus,baselineVersion:item.baselineVersion??null,reviewRecordId:item.review.id,reviewer:item.review.reviewer,reviewMethod:item.review.method,idempotencyKey:key,contentHash,
        sourceRevisions:originals.map(s=>({id:s.id,originalId:s.originalId||s.id,revision:s.revision,authorIds:[...s.authorIds],textSha256:hash(s.text),provenanceSha256:provenanceHash(s),url:s.url,linkLabel:s.linkLabel||s.displayName,at:s.at,attachmentStatus:s.attachmentStatus,attachments:s.attachments||[],...(s.documentProvenance?{document:s.documentProvenance}:{}),...(s.mediaProvenance?{media:s.mediaProvenance}:{})})),incrementReview:item.incrementReview||null,bindingRepair:item.bindingRepair||null,
        dateBasis:item.dateBasis||'published',episodeId:item.episodeId??null,accountId:item.accountId??null,operation:item.mode==='history_event'?'append_event':'current_snapshot',ingestionStatus:'not_sent'});
      cards.push(card);
    }catch(e){holds.push({inputIndex,internalThesisKey:obj(item)?item.internalThesisKey??null:null,eventId:obj(item)?item.eventId??null:null,
      contentReviewStatus:obj(item)?item.review?.status??'unreviewed':'unreviewed',exportStatus:'blocked',reason:e.message});}
  }
  for(let i=entries.length-1;i>=0;i--)if(conflicts.has(entries[i].idempotencyKey)){holds.push({inputIndex:entries[i].inputIndex,eventId:entries[i].eventId,reason:'Conflicting event removed from export'});cards.splice(i,1);entries.splice(i,1);}
  entries.forEach((e,i)=>e.cardIndex=i);
  const result={cards,manifest:{schemaVersion:'thesis-ingestion/1.1',evidenceContract:input.schemaVersion==='thesis-export-input/1.1'?'source-coverage/1.0':'legacy_compatibility',runId:input.runId,timePolicy:input.timePolicy,assignmentAuthority:input.assignments.authority,assignmentRevision:input.assignments.revision,status:holds.length?'partial_export':'exported',productionIds:input.assignments.authority==='feed',previewOnly:input.assignments.authority==='local_preview',backendStatus:'not_connected',items:entries,duplicates,holds},holds};
  const delivered=validateDelivery(result.cards,result.manifest,{allowLegacy:input.schemaVersion==='thesis-export-input/1.0'});need(delivered.ok,delivered.errors.join('; '));return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{const [, ,file,out]=process.argv;need(file&&out,'Usage: export-thesis-cards.mjs input.json NEW-output-directory');const result=exportCards(JSON.parse(fs.readFileSync(file,'utf8')));fs.mkdirSync(out,{recursive:false});fs.writeFileSync(path.join(out,'cards.json'),JSON.stringify(result.cards,null,2)+'\n');fs.writeFileSync(path.join(out,'ingestion-manifest.json'),JSON.stringify(result.manifest,null,2)+'\n');fs.writeFileSync(path.join(out,'holds.json'),JSON.stringify(result.holds,null,2)+'\n');console.log(JSON.stringify({cards:result.cards.length,holds:result.holds.length,duplicates:result.manifest.duplicates.length,out,backendStatus:'not_connected'}));process.exitCode=result.holds.length?2:0;}catch(e){console.error(e.message);process.exitCode=1;}
}
