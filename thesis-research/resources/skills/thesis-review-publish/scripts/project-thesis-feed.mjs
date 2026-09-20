import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateCard} from './export-thesis-cards.mjs';
import {temporalFeedDiversityReview} from '../../thesis-backfill/scripts/stance-opening-contract.mjs';

const obj=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const text=value=>typeof value==='string'&&value.trim().length>0;
const need=(condition,message)=>{if(!condition)throw Error(message);};
const key=card=>JSON.stringify([card.author.id,card.thesisId]);
const timestamp=card=>Number.isFinite(card?.createdAtMs)?card.createdAtMs:NaN;
const compareHistory=(a,b)=>timestamp(a.card)-timestamp(b.card)||String(a.eventId).localeCompare(String(b.eventId));
const compareDescending=(a,b)=>compareHistory(b,a);

function rows(cards,manifest,route){
  need(Array.isArray(cards)&&obj(manifest)&&Array.isArray(manifest.items),route+' cards and manifest are required');
  need(cards.length===manifest.items.length,route+' card/manifest count mismatch');
  const seenIndexes=new Set(),seenEvents=new Set(),output=[];
  for(const item of manifest.items){
    need(obj(item)&&Number.isInteger(item.cardIndex)&&item.cardIndex>=0&&item.cardIndex<cards.length,route+' manifest has an invalid card index');
    need(!seenIndexes.has(item.cardIndex),route+' manifest repeats a card index');seenIndexes.add(item.cardIndex);
    need(text(item.eventId)&&!seenEvents.has(item.eventId),route+' manifest repeats or omits an event ID');seenEvents.add(item.eventId);
    const card=cards[item.cardIndex],validation=validateCard(card);need(validation.ok,route+' card is invalid: '+validation.errors.join('; '));
    need(card.author.id===item.authorId&&card.thesisId===item.thesisId,route+' manifest identity differs from its card');
    output.push({card,item});
  }
  return output;
}

export function projectThesisFeed(bundle){
  need(obj(bundle),'Feed bundle is required');
  const history=rows(bundle.cards,bundle.manifest,'History');
  const snapshots=rows(bundle.currentCards,bundle.currentManifest,'Current');
  const groups=new Map();
  for(const row of history){
    const id=key(row.card);
    if(!groups.has(id))groups.set(id,{authorId:row.card.author.id,thesisId:row.card.thesisId,current:null,timeline:[],historyByEvent:new Map()});
    const group=groups.get(id);need(!group.historyByEvent.has(row.item.eventId),'History repeats an event inside one thesis');
    group.historyByEvent.set(row.item.eventId,row.card);group.timeline.push(row.card);
  }
  for(const row of snapshots){
    const id=key(row.card),group=groups.get(id);need(group,'Current snapshot has no matching history thesis');
    need(group.current===null,'Feed bundle has multiple current snapshots for one thesis');
    need(group.historyByEvent.has(row.item.eventId),'Current snapshot event is absent from immutable history');
    group.current=row.card;const duplicate=group.historyByEvent.get(row.item.eventId);
    group.timeline=group.timeline.filter(card=>card!==duplicate);
  }
  const projected=[...groups.values()].map(group=>{
    const {historyByEvent,...publicGroup}=group;
    publicGroup.timeline.sort((a,b)=>b.createdAtMs-a.createdAtMs||a.type.localeCompare(b.type));
    return publicGroup;
  });
  projected.sort((a,b)=>(b.current?.createdAtMs||b.timeline[0]?.createdAtMs||0)-(a.current?.createdAtMs||a.timeline[0]?.createdAtMs||0)||a.authorId.localeCompare(b.authorId)||a.thesisId-b.thesisId);
  const feedItems=history.map(({card,item})=>({
    eventId:item.eventId,
    authorId:card.author.id,
    thesisId:card.thesisId,
    createdAtMs:card.createdAtMs,
    card
  })).sort(compareDescending);
  const temporalDiversity=temporalFeedDiversityReview(feedItems.map(item=>item.card.body));
  need(temporalDiversity.errors.length===0,'Temporal Feed opening diversity failed: '+temporalDiversity.errors.join('; '));
  return {schemaVersion:'thesis-feed-projection/1.1',groups:projected,feedItems,temporalDiversity};
}

function selectedHistoryRows(projection,selection){
  need(obj(projection)&&projection.schemaVersion==='thesis-feed-projection/1.1','Temporal Feed projection 1.1 is required');
  const items=Array.isArray(projection.feedItems)?projection.feedItems:[];
  need(items.length>0,'Temporal Feed projection has no historical expressions');
  if(text(selection?.eventId)){
    const matches=items.filter(item=>item.eventId===selection.eventId);
    need(matches.length===1,'Selected Feed event is missing or duplicated: '+selection.eventId);
    return matches;
  }
  need(text(selection?.authorId)&&Number.isSafeInteger(selection?.thesisId),'Temporal Feed selection needs authorId and thesisId when eventId is omitted');
  const groupItems=items.filter(item=>item.authorId===selection.authorId&&item.thesisId===selection.thesisId);
  need(groupItems.length>0,'Selected Feed thesis has no historical expressions');
  need(selection.at!==undefined&&selection.at!==null,'Temporal Feed selection needs an eventId or cutoff at');
  const cutoff=typeof selection.at==='number'?selection.at:Date.parse(selection.at);
  need(Number.isFinite(cutoff),'Temporal Feed cutoff at must be an ISO date or Unix milliseconds');
  const eligible=groupItems.filter(item=>item.createdAtMs<=cutoff).sort(compareDescending);
  need(eligible.length>0,'Temporal Feed cutoff has no expression at or before the requested date');
  return [eligible[0]];
}

/**
 * Build the detail projection for one dated Feed expression.
 * The selected expression is the current content at the top; only strictly
 * earlier expressions remain in Timeline. The latest current snapshot is not
 * used here because it may contain later synthesis than the selected date.
 */
export function projectThesisAt(projection,selection={}){
  const [selected]=selectedHistoryRows(projection,selection);
  const history=projection.feedItems
    .filter(item=>item.authorId===selected.authorId&&item.thesisId===selected.thesisId)
    .sort(compareHistory);
  const selectedIndex=history.findIndex(item=>item.eventId===selected.eventId);
  need(selectedIndex>=0,'Selected Feed event is not part of its thesis history');
  return {
    schemaVersion:'thesis-feed-projection/1.1',
    authorId:selected.authorId,
    thesisId:selected.thesisId,
    selectedEventId:selected.eventId,
    selectedAt:selected.createdAtMs,
    current:selected.card,
    timeline:history.slice(0,selectedIndex).reverse().map(item=>item.card)
  };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{
    const [input,output]=process.argv.slice(2);need(input&&output,'Usage: project-thesis-feed.mjs playbook-data.json feed-projection.json');
    const projection=projectThesisFeed(JSON.parse(fs.readFileSync(input,'utf8')));
    fs.writeFileSync(output,JSON.stringify(projection,null,2)+'\n');
    console.log(JSON.stringify({output,groups:projection.groups.length}));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
