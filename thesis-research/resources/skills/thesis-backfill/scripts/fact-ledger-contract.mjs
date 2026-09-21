import {THESIS_POLICY} from '../../references/thesis-policy.mjs';
import {canonicalCompanyConflicts} from './canonical-company-history.mjs';

export const FACT_LEDGER_CONTRACT=THESIS_POLICY.factLedgerContract;
const list=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'&&value.trim().length>0;
const time=value=>Date.parse(value);
const sourceRows=archive=>list(Array.isArray(archive)?archive:archive?.sources||archive?.posts).map(source=>({
 id:String(source?.id??source?.platform_id??''),
 text:String(source?.text??source?.full_text??''),
 at:source?.spoken_at||source?.published_at||null,
 author_ids:list(source?.author_ids).length?source.author_ids:[source?.twitter_handle].filter(Boolean)
}));
const evidenceValid=(row,sources,allowed)=>{const source=sources.get(String(row?.source_id||''));return!!source&&allowed.has(source.id)&&text(row?.quote)&&source.text.includes(row.quote)&&text(row?.explanation);};

export function validateFactLedger(facts,archive){
 const errors=[],warnings=[],check=(condition,message)=>{if(!condition)errors.push(message);};
 check(facts&&typeof facts==='object'&&!Array.isArray(facts),'Fact ledger must be an object');
 const rows=sourceRows(archive),sources=new Map(rows.map(source=>[source.id,source]));
 check(facts?.contract===FACT_LEDGER_CONTRACT,'Fact ledger must use '+FACT_LEDGER_CONTRACT);
 check(text(facts?.subject_id),'Fact ledger needs subject_id');
 check(sources.size>0,'Fact ledger validation needs a nonempty source archive');
 const decisions=list(facts?.decisions),decisionIds=decisions.map(row=>String(row?.source_id||''));
 check(decisions.length===sources.size,'Fact ledger must decide every archived source exactly once');
 check(new Set(decisionIds).size===decisionIds.length,'Fact ledger repeats a source decision');
 for(const id of sources.keys())check(decisionIds.includes(id),'Fact ledger omits source '+id);
 for(const decision of decisions){check(sources.has(String(decision?.source_id||'')),'Fact ledger decision references unknown source');check(['public','source_only','hold','context','duplicate'].includes(decision?.disposition),'Fact ledger has invalid source disposition '+decision?.source_id);check(text(decision?.reason),'Fact ledger decision needs a reason '+decision?.source_id);}

 const objectKeys=new Set(),publicSourceIds=new Set();
 for(const record of list(facts?.records)){
  const label='Fact record '+(record?.id||'<missing>');
  check(text(record?.id)&&text(record?.author_id)&&text(record?.object_key),label+' needs stable identity');
  check(['company','asset','basket','theme','macro'].includes(record?.object_type),label+' has invalid object_type');
  const unique=record?.author_id+'|'+record?.object_key;check(!objectKeys.has(unique),label+' duplicates author/object identity');objectKeys.add(unique);
  check(!Object.hasOwn(record||{},'title')&&!Object.hasOwn(record||{},'description')&&!Object.hasOwn(record||{},'stance_sentence')&&!Object.hasOwn(record||{},'opening_plan'),label+' contains generated prose before language stage');
  const events=list(record?.events),eventIds=new Set(events.map(event=>event?.id));
  check(events.length>0,label+' needs at least one reviewed event');
  check(text(record?.primary_source_id)&&events.some(event=>list(event?.source_ids).includes(record.primary_source_id)),label+' primary source is absent from events');
  let prior=-Infinity;
  for(const event of events){
   const eventLabel=label+' event '+(event?.id||'<missing>'),sourceIds=new Set([...list(event?.source_ids),...list(event?.context_source_ids)]);
   check(text(event?.id)&&text(event?.at)&&Number.isFinite(time(event.at)),eventLabel+' needs ID and date');
   check(time(event?.at)>=prior,eventLabel+' is not chronological');prior=time(event?.at);
   check(list(event?.source_ids).length>0&&list(event?.source_ids).every(id=>sources.has(String(id))),eventLabel+' has unknown or empty source IDs');
   for(const id of list(event?.context_source_ids)){const source=sources.get(String(id));check(!!source,eventLabel+' has unknown context source');if(source?.at)check(time(source.at)<=time(event.at),eventLabel+' uses future context');}
   check(['public','source_only','hold'].includes(event?.disposition),eventLabel+' has invalid disposition');
   if(event?.disposition==='public'){
    for(const id of list(event.source_ids))publicSourceIds.add(String(id));
    check(text(event?.what)&&text(event?.why)&&text(event?.increment),eventLabel+' needs what, why and material increment');
    check(['reason','evidence','condition','correction'].includes(event?.increment_kind),eventLabel+' has invalid increment_kind');
    const stances=list(event?.ticker_stances);check(stances.length>0,eventLabel+' needs event-local ticker stances');
    const tickers=stances.map(row=>row?.ticker);check(new Set(tickers).size===tickers.length,eventLabel+' repeats a ticker');
    for(const stance of stances){check(text(stance?.ticker)&&['bullish','bearish','none'].includes(stance?.stance),eventLabel+' has invalid ticker direction');check(list(stance?.evidence).length>0,eventLabel+' ticker direction lacks evidence');for(const evidence of list(stance?.evidence))check(evidenceValid(evidence,sources,sourceIds),eventLabel+' ticker evidence is not exact or expression-local');}
    for(const field of ['title','description','opening_plan'])check(!Object.hasOwn(event||{},field),eventLabel+' contains generated '+field+' before language stage');
   }
  }
  const history=record?.history_search,matched=list(history?.matched_source_ids),accounted=new Set([...events.flatMap(event=>list(event?.source_ids).map(String)),...list(history?.source_only_source_ids).map(String),...list(history?.held_source_ids).map(String)]);
  check(history?.version==='author-object-history/1.0'&&list(history?.aliases).some(text),label+' needs history search receipt');
  check(matched.every(id=>sources.has(String(id))&&accounted.has(String(id))),label+' leaves matched history unaccounted');
  check(list(history?.public_event_ids).every(id=>eventIds.has(id)),label+' history references unknown public event');
 }
 for(const issue of canonicalCompanyConflicts(list(facts?.records),facts).issues)check(false,issue);
 for(const id of publicSourceIds){const decision=decisions.find(row=>String(row.source_id)===id);check(decision?.disposition==='public','Public event source lacks public ledger disposition '+id);}
 return{ok:errors.length===0,errors,warnings,counts:{sources:sources.size,decisions:decisions.length,records:list(facts?.records).length,public_sources:publicSourceIds.size}};
}
