import crypto from 'node:crypto';
import fs from 'node:fs';

const list=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'&&value.trim().length>0;
const isoWeek=value=>{
 const date=new Date(value);
 if(!Number.isFinite(date.getTime()))return null;
 const day=(date.getUTCDay()+6)%7;
 const monday=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()-day));
 const thursday=new Date(monday);thursday.setUTCDate(monday.getUTCDate()+3);
 const year=thursday.getUTCFullYear();
 const first=new Date(Date.UTC(year,0,4));
 const firstDay=(first.getUTCDay()+6)%7;
 const week=1+Math.round((monday.getTime()-Date.UTC(year,0,4-firstDay))/604800000);
 return {key:`${year}-W${String(week).padStart(2,'0')}`,start:monday.toISOString().slice(0,10),end:new Date(Date.UTC(monday.getUTCFullYear(),monday.getUTCMonth(),monday.getUTCDate()+6)).toISOString().slice(0,10)};
};
const stanceSignature=event=>list(event?.ticker_stances).map(item=>`${String(item?.ticker||'').toUpperCase()}:${item?.stance||'none'}`).sort().join('|');
const actionSignature=event=>event?.action?.kind&&event.action.kind!=='none'?`${event.action.kind}:${event.action.basis||'none'}`:'none';
const hash=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,12);
const eventText=event=>[event?.what,event?.why,event?.increment].filter(text).join(' ').toLowerCase();
const tokenOverlap=(left,right)=>{const a=new Set((left.match(/[a-z0-9]+/g)||[]).filter(x=>x.length>3)),b=new Set((right.match(/[a-z0-9]+/g)||[]).filter(x=>x.length>3));if(!a.size||!b.size)return 0;return [...a].filter(x=>b.has(x)).length/Math.min(a.size,b.size);};

export function buildWeeklyGrouping(packet,{includeSingletons=true}={}){
 const records=list(packet?.records).filter(record=>!record?.superseded_by&&record?.review?.status==='approved'&&record?.type!=='context');
 const groups=new Map(),excluded=[];let eligibleEvents=0;
 for(const record of records){
  const reviews=new Map(list(record.timeline_review).map(row=>[row?.event_id,row]));
  for(const event of list(record.events)){
   const review=reviews.get(event.id),isPrimary=event.id===record.primary_event_id;
   const publicEvent=isPrimary||review?.disposition==='update';
   if(!publicEvent){excluded.push({event_id:event.id,record_id:record.id,reason:review?.reason||'not_public'});continue;}
   const week=isoWeek(event.at);if(!week){excluded.push({event_id:event.id,record_id:record.id,reason:'missing_or_invalid_date'});continue;}
   eligibleEvents++;
   const tickerKey=stanceSignature(event),actionKey=actionSignature(event);
   const key=[record.id,week.key,tickerKey,actionKey].join('::');
   if(!groups.has(key))groups.set(key,{record_id:record.id,author_id:record.author_id,object_key:record.object_key,week,member_events:[],ticker_stances:list(event.ticker_stances),action_signature:actionKey});
   groups.get(key).member_events.push(event);
  }
 }
 const output=[];
 for(const group of groups.values()){
  group.member_events.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||String(a.id).localeCompare(String(b.id)));
  if(!includeSingletons&&group.member_events.length===1)continue;
  const texts=group.member_events.map(eventText),overlaps=[];
  for(let i=1;i<texts.length;i++)overlaps.push(tokenOverlap(texts[0],texts[i]));
  const anchor=group.member_events.at(-1),member_event_ids=group.member_events.map(event=>event.id);
  output.push({
   id:`weekly:${group.record_id}:${group.week.key}:${hash(member_event_ids.join('|'))}`,
   record_id:group.record_id,author_id:group.author_id,object_key:group.object_key,
   week_start:group.week.start,week_end:group.week.end,anchor_event_id:anchor.id,
   member_event_ids,source_ids:[...new Set(group.member_events.flatMap(event=>list(event.source_ids)))],
   ticker_stances:group.ticker_stances,action_signature:group.action_signature,
   needs_semantic_review:overlaps.some(score=>score<0.18),
   member_increments:group.member_events.map(event=>({event_id:event.id,at:event.at,increment_kind:event.increment_kind||null,increment:event.increment||null}))
  });
 }
 output.sort((a,b)=>Date.parse(b.week_start)-Date.parse(a.week_start)||a.id.localeCompare(b.id));
 const groupedEvents=output.filter(group=>group.member_event_ids.length>1).reduce((sum,group)=>sum+group.member_event_ids.length,0);
 return {contract:'weekly-thesis-grouping/1.0',mode:'presentation_and_language_compression',week_timezone:'UTC',groups:output,excluded_events:excluded,coverage:{approved_records:records.length,eligible_events:eligibleEvents,display_groups:output.length,multi_event_groups:output.filter(group=>group.member_event_ids.length>1).length,events_in_multi_event_groups:groupedEvents,raw_events_preserved:eligibleEvents,reduction_ratio:eligibleEvents?1-output.length/eligibleEvents:0}};
}

if(process.argv[1]&&process.argv[1].endsWith('/weekly-group.mjs')){
 try{const [packetFile,outputFile]=process.argv.slice(2);if(!packetFile||!outputFile)throw Error('Usage: weekly-group.mjs PACKET OUTPUT');const result=buildWeeklyGrouping(JSON.parse(fs.readFileSync(packetFile,'utf8')));fs.writeFileSync(outputFile,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.coverage));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
