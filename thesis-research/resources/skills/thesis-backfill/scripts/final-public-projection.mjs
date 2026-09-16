import crypto from 'node:crypto';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {mediaSourceLink} from './media-contract.mjs';
import {proseLength} from './prose-limit.mjs';

export const FINAL_PUBLIC_REVIEW='final-public/1.0';

const list=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'&&value.trim().length>0;
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'
 ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const sorted=value=>[...value].sort((a,b)=>String(a).localeCompare(String(b)));
const processLanguage=[
 /\b(?:the|this) (?:article|source|reply|thread|newsletter|interview|podcast|transcript)\b/i,
 /\b(?:the|this) post\b(?!-)/i,
 /\bthe author\b/i,
 /\bnearby X posts\b/i,
 /\bsingle verified estimate\b/i,
 /\bnot clearly establish(?:ed)?\b/i,
 /\b(?:reviewer|audit) (?:note|comment|conclusion|decision)\b/i
];

export function presentationHash(presentation){
 return sha(presentation);
}

export function publicExpressions(presentation){
 const rows=[];
 for(const card of list(presentation?.cards)){
  rows.push({id:'card:'+card.id,kind:'card',record_id:card.id,description:card.description,
   source_id:card.primary_source_id,source_url:card.source_url,published_at:card.at,
   tickers:list(card.assets).map(asset=>asset.symbol),media_dependency:card.media_dependency||'none'});
  for(const item of list(card.timeline)){
   const detail=list(presentation.details).find(row=>row.id===item.detail_id);
   rows.push({id:'timeline:'+item.detail_id,kind:'timeline',record_id:card.id,event_id:item.id,
    description:detail?.description,source_id:detail?.source_id,source_url:item.source_url||detail?.source_url,
    published_at:item.at,tickers:list(item.assets).map(asset=>asset.symbol),
    media_dependency:detail?.media_dependency||'none'});
  }
 }
 return rows;
}

export function validateFinalProjection(packet,presentation,review){
 const errors=[],warnings=[],check=(condition,message)=>{if(!condition)errors.push(message);};
 const sourceMap=new Map(list(packet?.sources).map(source=>[source.id,source]));
 const recordMap=new Map(list(packet?.records).filter(record=>!record.superseded_by).map(record=>[record.id,record]));
 const detailMap=new Map(list(presentation?.details).map(detail=>[detail.id,detail]));
 const expressions=publicExpressions(presentation),seen=new Set();

 check(presentation?.generation_version==='3.1','Final presentation must use generation contract 3.1');
 check(list(presentation?.cards).length===list(packet?.records).filter(record=>!record.superseded_by&&record.type!=='context'&&record.review?.status==='approved').length,
  'Final presentation does not contain exactly one card per approved active record');
 for(const card of list(presentation?.cards)){
  const record=recordMap.get(card.id),label='Card '+card.id;
  check(!!record,label+' has no approved active record');
  check(!seen.has(card.id),label+' is duplicated');seen.add(card.id);
  check(!Object.hasOwn(card,'title'),label+' contains a forbidden title field');
  check(text(card.description)&&proseLength(card.description)<=500,label+' has missing or over-limit prose');
  check(text(card.source_url),label+' needs exactly one public source URL');
  check(text(card.at),label+' needs a source-bound date');
  check(list(card.assets).length>0,label+' needs a verified investable object');
  const primary=record&&list(record.events).find(event=>event.id===record.primary_event_id);
  const source=primary&&sourceMap.get(record.primary_source_id);
  check(!!primary&&!!source,label+' primary source/event is missing');
  if(primary&&source){
   check(card.at===primary.at,label+' displayed date differs from primary event');
   check(card.source_url===mediaSourceLink(source),label+' displayed source differs from primary source');
  }
  const timelineSources=new Set();
  for(const item of list(card.timeline)){
   const detail=detailMap.get(item.detail_id),context=label+' Timeline '+item.id;
   check(!!detail,context+' has no historical detail');
   check(text(item.source_url||detail?.source_url),context+' needs exactly one public source URL');
   check((item.source_url||detail?.source_url)!==card.source_url,context+' repeats the main-card source');
   check(!timelineSources.has(item.source_url||detail?.source_url),context+' repeats another visible Timeline source');
   timelineSources.add(item.source_url||detail?.source_url);
   check(item.at===detail?.at,context+' preview/detail dates differ');
   check(proseLength(detail?.description||'')<=500,context+' detail exceeds 500 characters');
   const expected=item.preview===undefined?null:(detail.description.trim().split(/\s+/).length>40);
   if(expected!==null)check(item.show_more===expected,context+' Show more does not match the 40-word rule');
  }
 }
 for(const row of expressions){
  check(text(row.description),row.id+' has no public prose');
  check(proseLength(row.description||'')<=500,row.id+' exceeds 500 prose characters');
  for(const pattern of processLanguage)check(!pattern.test(row.description||''),row.id+' exposes source/reviewer narration');
 }

 check(review?.schema_version===FINAL_PUBLIC_REVIEW,'Missing '+FINAL_PUBLIC_REVIEW+' review');
 check(text(review?.reviewer)&&text(review?.reviewed_at),'Final public review needs reviewer and timestamp');
 check(review?.presentation_sha256===presentationHash(presentation),'Final public review is stale or bound to another presentation');
 check(review?.review_scope==='all_visible_expressions','Final public review must cover all visible expressions');
 check(review?.total_visible_expressions===expressions.length&&review?.completed_expressions===expressions.length,'Final public review counts must equal all visible expressions');
 const reviewRows=new Map(list(review?.expressions).map(row=>[row.id,row]));
 check(reviewRows.size===expressions.length,'Final public review must cover every visible card and Timeline expression once');
 for(const expression of expressions){
  const row=reviewRows.get(expression.id),label='Final review '+expression.id;
  check(!!row,label+' is missing');if(!row)continue;
  check(row.decision==='approved'&&text(row.reason),label+' is not approved with a concrete reason');
  check(row.source_id===expression.source_id&&row.source_url===expression.source_url&&row.published_at===expression.published_at,
   label+' source/date no longer matches the rendered expression');
  check(JSON.stringify(sorted(list(row.tickers)))===JSON.stringify(sorted(expression.tickers)),label+' ticker review differs from rendered tags');
  check(text(row.what)&&text(row.why),label+' needs explicit what and why');
  check(row.conclusion_first===true&&text(row.opening_conclusion)&&text(row.opening_reason),label+' needs a conclusion-first opening review');
  check(['fundamental','mixed'].includes(row.content_domain),label+' technical-only content cannot enter the public projection');
  if(expression.kind==='timeline'){
   check(['reason','evidence','condition','correction'].includes(row.increment_kind),label+' needs a material increment kind');
   check(text(row.increment),label+' needs the actual thesis increment');
   check(row.increment_domain==='fundamental',label+' Timeline increment must be fundamental-only');
  }
  if(expression.kind==='card')check(row.increment_kind===null||row.increment_kind===undefined,label+' card must not masquerade as a Timeline increment');
  check(row.direct_voice===true&&row.no_inference===true&&row.source_fidelity===true,
   label+' must pass direct-voice, no-inference and source-fidelity review');
  check(row.ticker_complete===true&&row.media_complete===true,label+' ticker/media completeness is unresolved');
  if(expression.tickers.length===0)check(expression.kind==='timeline'&&row.object_resolution==='record',label+' missing event ticker needs explicit record-level resolution');
 }
 for(const id of reviewRows.keys())check(expressions.some(row=>row.id===id),'Final public review contains a non-visible expression '+id);
 return {ok:errors.length===0,errors,warnings,counts:{cards:list(presentation?.cards).length,timeline:expressions.filter(row=>row.kind==='timeline').length,expressions:expressions.length}};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){
 try{
  const [packetFile,presentationFile,reviewFile]=process.argv.slice(2);
  if(!reviewFile)throw Error('Usage: final-public-projection.mjs packet.json presentation.json final-review.json');
  const result=validateFinalProjection(JSON.parse(fs.readFileSync(packetFile,'utf8')),JSON.parse(fs.readFileSync(presentationFile,'utf8')),JSON.parse(fs.readFileSync(reviewFile,'utf8')));
  console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
