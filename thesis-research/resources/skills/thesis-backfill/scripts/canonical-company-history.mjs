import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const CANONICAL_COMPANY_HISTORY_CONTRACT='canonical-company-history/1.0';

const list=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'&&value.trim().length>0;
const token=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,'');
const symbol=value=>String(value||'').normalize('NFKC').trim().toUpperCase();
const market=value=>String(value||'').normalize('NFKC').trim().toUpperCase();
const distinct=values=>[...new Set(values.filter(Boolean))];
const eventTime=event=>Number.isFinite(Date.parse(event?.at))?Date.parse(event.at):-Infinity;
const recordTime=record=>Math.max(Number.isFinite(Date.parse(record?.assessment_as_of))?Date.parse(record.assessment_as_of):-Infinity,...list(record?.events).map(eventTime));
const companyRole=record=>record?.object_type==='company'&&record?.type!=='context';
const activeRecord=record=>companyRole(record)&&!record?.superseded_by&&(!record?.review||record.review.status==='approved');

function aliasRows(input){
 if(Array.isArray(input))return input;
 return list(input?.canonical_company_aliases||input?.canonical_object_aliases);
}

export function compileCanonicalCompanyAliases(input){
 if(input?.byAlias instanceof Map&&input?.byEntity instanceof Map&&input?.byInstrument instanceof Map)return input;
 const errors=[],byAlias=new Map(),byEntity=new Map(),byInstrument=new Map(),rows=[];
 for(const row of aliasRows(input)){
  const label='Canonical company alias '+(row?.canonical_key||'<missing>');
  if(row?.role!=='company'||!text(row?.canonical_key)||row?.review?.status!=='approved'||!text(row?.review?.reviewer)||!text(row?.review?.reviewed_at)||!text(row?.review?.reason)){
   errors.push(label+' needs role company, a canonical key and an approved dated review');
   continue;
  }
  const normalized={...row,canonical_key:String(row.canonical_key).trim()};rows.push(normalized);
  const add=(map,key,kind)=>{
   if(!key)return;
   const prior=map.get(key);
   if(prior&&prior!==normalized.canonical_key)errors.push(`Canonical company ${kind} collision ${key}: ${prior}, ${normalized.canonical_key}`);
   else map.set(key,normalized.canonical_key);
  };
  for(const value of [normalized.canonical_key,...list(normalized.aliases)])add(byAlias,token(value),'alias');
  for(const value of list(normalized.entity_keys))add(byEntity,token(value),'entity');
  for(const item of list(normalized.instruments)){
   if(!text(item?.symbol)){errors.push(label+' has an instrument without a symbol');continue;}
   add(byInstrument,`${market(item.market)||'*'}:${symbol(item.symbol)}`,'instrument');
   add(byInstrument,`*:${symbol(item.symbol)}`,'instrument');
  }
 }
 return{contract:CANONICAL_COMPANY_HISTORY_CONTRACT,rows,byAlias,byEntity,byInstrument,errors};
}

function instrumentIdentities(record){
 const bindings=list(record?.asset_bindings).length?list(record.asset_bindings):list(record?.events).flatMap(event=>list(event?.asset_bindings));
 const preferred=bindings.filter(binding=>binding&&binding.role==='primary');
 const relevant=preferred.length?preferred:bindings.filter(binding=>binding&&binding.role==='vehicle');
 const exact=distinct(relevant.filter(binding=>text(binding.symbol)&&text(binding.market)).map(binding=>`${market(binding.market)}:${symbol(binding.symbol)}`));
 if(exact.length)return exact;
 const eventTickers=distinct(list(record?.events).flatMap(event=>list(event?.ticker_stances).map(row=>symbol(row?.ticker))));
 const recordTickers=distinct(list(record?.ticker_stances).map(row=>symbol(row?.ticker)));
 const tickers=eventTickers.length?eventTickers:recordTickers;
 return tickers.map(value=>`*:${value}`);
}

function entityIdentities(record){
 const bindings=[...list(record?.asset_bindings),...list(record?.events).flatMap(event=>list(event?.asset_bindings))]
  .filter(binding=>binding&&['primary','vehicle'].includes(binding.role)&&text(binding.entity_key));
 return distinct(bindings.map(binding=>token(binding.entity_key)));
}

function aliasIdentities(record){
 return distinct([
  record?.canonical_object_key,
  record?.object_key,
  record?.subject,
  record?.opening_plan?.subject,
  ...list(record?.history_search?.aliases),
  ...list(record?.asset_bindings).map(binding=>binding?.entity_name)
 ].map(token));
}

export function resolveCanonicalCompany(record,input){
 if(!companyRole(record))return{role:record?.object_type||record?.type||'unknown',canonical_key:null,basis:'not_company',issues:[]};
 const catalog=input?.byAlias instanceof Map?input:compileCanonicalCompanyAliases(input),issues=[...catalog.errors],resolved=[];
 const instruments=instrumentIdentities(record),entities=entityIdentities(record);
 const entityCatalogKeys=distinct(entities.map(key=>catalog.byEntity.get(key)||catalog.byAlias.get(key))),allEntitiesResolved=entities.length>0&&entities.every(key=>catalog.byEntity.has(key)||catalog.byAlias.has(key));
 if(instruments.length>1&&!(allEntitiesResolved&&entityCatalogKeys.length===1)){
  return{role:'company',canonical_key:null,basis:'ambiguous_company_role',issues,matched:[]};
 }
 for(const key of instruments){
  const [m,s]=key.split(':');
  const value=catalog.byInstrument.get(key)||catalog.byInstrument.get(`*:${s}`);
  if(value)resolved.push({key:value,basis:'reviewed_instrument',source:key});
 }
 for(const key of entities){const value=catalog.byEntity.get(key)||catalog.byAlias.get(key);if(value)resolved.push({key:value,basis:'reviewed_entity',source:key});}
 for(const key of aliasIdentities(record)){const value=catalog.byAlias.get(key);if(value)resolved.push({key:value,basis:'reviewed_alias',source:key});}
 const catalogKeys=distinct(resolved.map(row=>row.key));
 if(catalogKeys.length>1)issues.push(`Record ${record.id} resolves to conflicting canonical companies: ${catalogKeys.join(', ')}`);
 if(catalogKeys.length===1)return{role:'company',canonical_key:catalogKeys[0],basis:resolved[0].basis,issues,matched:resolved};
 if(instruments.length===1)return{role:'company',canonical_key:'instrument:'+instruments[0],basis:instruments[0].startsWith('*:')?'verified_ticker':'verified_instrument',issues,matched:[]};
 if(entities.length===1)return{role:'company',canonical_key:'entity:'+entities[0],basis:'verified_entity',issues,matched:[]};
 const aliases=aliasIdentities(record);
 if(aliases.length)return{role:'company',canonical_key:'object:'+aliases[0],basis:'object_fallback',issues,matched:[]};
 issues.push('Record '+record.id+' has no resolvable canonical company identity');
 return{role:'company',canonical_key:null,basis:'unresolved',issues,matched:[]};
}

export function canonicalCompanyConflicts(records,input){
 const catalog=compileCanonicalCompanyAliases(input),issues=[...catalog.errors],groups=new Map();
 for(const record of list(records).filter(activeRecord)){
  const resolution=resolveCanonicalCompany(record,catalog);issues.push(...resolution.issues);
  if(!resolution.canonical_key)continue;
  const key=`${record.author_id}/${resolution.canonical_key}`;
  if(!groups.has(key))groups.set(key,{author_id:record.author_id,canonical_key:resolution.canonical_key,records:[]});
  groups.get(key).records.push(record);
 }
 const conflicts=[];
 for(const group of groups.values())if(group.records.length>1){
  const record_ids=group.records.map(record=>record.id).sort();
  conflicts.push({...group,record_ids});
  issues.push(`Canonical company conflict ${group.author_id}/${group.canonical_key}: ${record_ids.join(', ')}`);
 }
 return{contract:CANONICAL_COMPANY_HISTORY_CONTRACT,ok:issues.length===0,issues,conflicts,groups:[...groups.values()]};
}

function mergeUnique(rows,key){
 const output=[],seen=new Set();
 for(const row of rows){const id=key(row);if(!id||seen.has(id))continue;seen.add(id);output.push(row);}
 return output;
}

function mergeTargetHistory(target,members,canonicalKey){
 const events=members.flatMap(record=>list(record.events));
 const dateByEvent=new Map(events.map(event=>[event.id,eventTime(event)]));
 target.canonical_object_key=canonicalKey;
 target.timeline_review=mergeUnique(members.flatMap(record=>list(record.timeline_review)),row=>row?.event_id)
  .sort((a,b)=>(dateByEvent.get(a.event_id)??-Infinity)-(dateByEvent.get(b.event_id)??-Infinity)||String(a.event_id).localeCompare(String(b.event_id)));
 const histories=members.map(record=>record.history_search).filter(Boolean);
 if(histories.length){
  target.history_search={
   ...target.history_search,
   version:'author-object-history/1.0',
   aliases:distinct(members.flatMap(record=>[record.object_key,record.canonical_object_key,record.opening_plan?.subject,...list(record.history_search?.aliases)]).filter(text)),
   scope_source_count:Math.max(...histories.map(row=>Number(row.scope_source_count)||0)),
   matched_source_ids:distinct(histories.flatMap(row=>list(row.matched_source_ids))),
   public_event_ids:distinct(histories.flatMap(row=>list(row.public_event_ids))),
   source_only_source_ids:distinct(histories.flatMap(row=>list(row.source_only_source_ids))),
   held_source_ids:distinct(histories.flatMap(row=>list(row.held_source_ids)))
  };
  if(target.timeline_review?.some(row=>row?.disposition==='update'&&row.event_id!==target.primary_event_id))delete target.history_search.no_timeline_reason;
 }
 target.dedup={...(target.dedup||{}),decision:'merged',compared_ids:distinct([...list(target.dedup?.compared_ids),...members.filter(record=>record.id!==target.id).map(record=>record.id)]),reason:`Canonical ${canonicalKey} company history consolidated before Feed and Timeline assembly.`};
 if(target.source_first_review)delete target.source_first_review;
}

export function consolidateCanonicalCompanyHistory(document,{aliases,chooseTarget}={}){
 const output=structuredClone(document),records=list(output.records),catalog=compileCanonicalCompanyAliases(aliases||output),before=canonicalCompanyConflicts(records,catalog),merges=[];
 if(catalog.errors.length)throw Error(catalog.errors.join('\n'));
 for(const conflict of before.conflicts){
  const members=conflict.records.map(record=>records.find(row=>row.id===record.id));
  const target=chooseTarget?chooseTarget(members,conflict):[...members].sort((a,b)=>recordTime(b)-recordTime(a)||String(a.id).localeCompare(String(b.id)))[0];
  if(!target||!members.includes(target))throw Error('Canonical company consolidation selected an invalid target for '+conflict.canonical_key);
  mergeTargetHistory(target,members,conflict.canonical_key);
  for(const record of members){record.canonical_object_key=conflict.canonical_key;if(record.id===target.id)continue;record.superseded_by=target.id;record.dedup={...(record.dedup||{}),decision:'merged',compared_ids:distinct([...list(record.dedup?.compared_ids),target.id]),reason:`Canonical ${conflict.canonical_key} company history is active under ${target.id}.`};}
  merges.push({author_id:conflict.author_id,canonical_key:conflict.canonical_key,target_record_id:target.id,superseded_record_ids:members.filter(record=>record.id!==target.id).map(record=>record.id),event_ids:members.flatMap(record=>list(record.events).map(event=>event.id)),event_count:members.reduce((sum,record)=>sum+list(record.events).length,0)});
 }
 const after=canonicalCompanyConflicts(records,catalog);
 if(after.conflicts.length)throw Error(after.issues.join('\n'));
 output.canonical_company_aliases=catalog.rows;
 output.canonical_company_history={contract:CANONICAL_COMPANY_HISTORY_CONTRACT,merges,checked_at:new Date().toISOString()};
 return{document:output,report:{contract:CANONICAL_COMPANY_HISTORY_CONTRACT,merges,before_conflicts:before.conflicts.length,after_conflicts:after.conflicts.length}};
}

export function consolidateCompanyExpressionRecordIds(expressions,input,{authorId}={}){
 const rows=structuredClone(list(expressions)),byRecord=new Map();
 for(const row of rows){if(!text(row?.record_id)||row?.object_type!=='company')continue;const author=row.author_id||authorId||String(row.id||'').split(':')[0],key=`${author}|${row.record_id}`;if(!byRecord.has(key))byRecord.set(key,{id:row.record_id,author_id:author,object_type:'company',object_key:row.object_key,subject:row.subject,events:[],history_search:{aliases:[]}});const record=byRecord.get(key);record.events.push({id:row.id,at:row.at,ticker_stances:row.ticker_stances,asset_bindings:row.asset_bindings});record.history_search.aliases.push(row.subject,row.object_key);}
 const document={records:[...byRecord.values()],canonical_company_aliases:aliasRows(input)},result=consolidateCanonicalCompanyHistory(document),redirects=new Map();
 for(const record of result.document.records)if(record.superseded_by)redirects.set(`${record.author_id}|${record.id}`,record.superseded_by);
 const canonicalByRecord=new Map(result.document.records.map(record=>[`${record.author_id}|${record.id}`,record.canonical_object_key]));
 for(const row of rows){const author=row.author_id||authorId||String(row.id||'').split(':')[0],key=`${author}|${row.record_id}`;if(redirects.has(key))row.record_id=redirects.get(key);const canonicalKey=canonicalByRecord.get(key);if(canonicalKey)row.canonical_object_key=canonicalKey;}
 return{expressions:rows,report:result.report};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const [inputFile,outputFile,aliasFile]=process.argv.slice(2);
 if(!inputFile||!outputFile)throw Error('Usage: canonical-company-history.mjs INPUT OUTPUT [ALIASES]');
 const input=JSON.parse(fs.readFileSync(inputFile,'utf8')),aliases=aliasFile?JSON.parse(fs.readFileSync(aliasFile,'utf8')):undefined;
 const result=consolidateCanonicalCompanyHistory(input,{aliases});
 fs.writeFileSync(outputFile,JSON.stringify(result.document,null,2)+'\n');
 console.log(JSON.stringify({output:outputFile,...result.report}));
}
