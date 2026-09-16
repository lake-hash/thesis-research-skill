import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const hash=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const text=value=>typeof value==='string'?value:'';
const numberArg=(args,name,fallback)=>{const at=args.indexOf(name);if(at<0)return fallback;const value=Number(args[at+1]);if(!Number.isSafeInteger(value)||value<1)throw Error(name+' needs a positive integer');return value;};

export function planFastExtraction(packet,{policyVersion='what-why-increment/1.0',maxChars=30000,maxItems=100,cacheKeys=[]}={}){
 if(!packet||!Array.isArray(packet.sources))throw Error('Packet sources array required');
 const cached=new Set(cacheKeys),duplicates=[],technicalGaps=[],units=[],seen=new Map();
 for(const source of packet.sources){
  if(!source?.id)throw Error('Every source needs an id');
  const body=text(source.text),revision=source.text_sha256||hash(body),canonical=source.canonical_event_id||source.id,key=canonical+'|'+revision;
  const cacheKey=hash({source_id:source.id,text_sha256:revision,policy_version:policyVersion});
  if(cached.has(cacheKey)){duplicates.push({source_id:source.id,disposition:'cache_hit',cache_key:cacheKey});continue;}
  if(!body.trim()){technicalGaps.push({source_id:source.id,reason:'empty_or_unparsed_text'});continue;}
  if(seen.has(key)){duplicates.push({source_id:source.id,disposition:'exact_event_copy',duplicate_of:seen.get(key)});continue;}
  seen.set(key,source.id);units.push({source_id:source.id,canonical_event_id:canonical,text_sha256:revision,char_count:[...body].length,published_at:source.spoken_at||source.published_at||null,has_attachments:(source.attachments||[]).length>0||source.attachment_status==='unavailable',context_source_ids:source.context_source_ids||[]});
 }
 units.sort((a,b)=>String(a.published_at||'').localeCompare(String(b.published_at||''))||a.source_id.localeCompare(b.source_id));
 const batches=[];let current=[];let chars=0;
 const flush=()=>{if(!current.length)return;batches.push({id:'triage-'+String(batches.length+1).padStart(4,'0'),source_ids:current.map(x=>x.source_id),char_count:chars,item_count:current.length});current=[];chars=0;};
 for(const unit of units){if(current.length&&(current.length>=maxItems||chars+unit.char_count>maxChars))flush();current.push(unit);chars+=unit.char_count;}flush();
 return {schema_version:'fast-extraction-plan/1.0',policy_version:policyVersion,source_count:packet.sources.length,unique_triage_count:units.length,cache_hits:duplicates.filter(d=>d.disposition==='cache_hit').length,exact_duplicates:duplicates.filter(d=>d.disposition==='exact_event_copy').length,technical_gap_count:technicalGaps.length,limits:{max_chars:maxChars,max_items:maxItems},units,batches,duplicates,technical_gaps:technicalGaps};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{
  const args=process.argv.slice(2),input=args[0],output=args[1];if(!input||!output)throw Error('Usage: plan-fast-extraction.mjs packet.json output.json [--max-chars N] [--max-items N] [--cache cache.json] [--policy VERSION]');
  const cacheAt=args.indexOf('--cache'),policyAt=args.indexOf('--policy'),cache=cacheAt>=0?JSON.parse(fs.readFileSync(args[cacheAt+1],'utf8')).keys||[]:[];
  const result=planFastExtraction(JSON.parse(fs.readFileSync(input,'utf8')),{maxChars:numberArg(args,'--max-chars',30000),maxItems:numberArg(args,'--max-items',100),cacheKeys:cache,policyVersion:policyAt>=0?args[policyAt+1]:'what-why-increment/1.0'});
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({output,batches:result.batches.length,triage:result.unique_triage_count,cacheHits:result.cache_hits,duplicates:result.exact_duplicates,gaps:result.technical_gap_count}));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
