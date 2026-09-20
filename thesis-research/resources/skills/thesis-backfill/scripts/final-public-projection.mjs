import crypto from 'node:crypto';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {mediaSourceLink} from './media-contract.mjs';
import {composeVisibleProse,proseLength} from './prose-limit.mjs';
import {
 FINAL_PUBLIC_REVIEW_SCHEMA,allowedMechanismTypes,matchedPatterns,
 portfolioOperationPatterns,processLanguagePatterns,proseQualityIssues,
 tickerRoleIssues,whyQualityIssues
} from './public-content-gates.mjs';
import {sourceFidelityIssues} from './source-fidelity-contract.mjs';
import {openingChainIssues,openingDiversityReview,timelineDiversityReview,timelineOpeningIssues,STANCE_OPENING_CONTRACT,TIMELINE_DIVERSITY_CONTRACT,TIMELINE_OPENING_CONTRACT} from './stance-opening-contract.mjs';
import {publicTickerStances,tickerStanceIssues,TICKER_STANCE_CONTRACT} from './ticker-stance-contract.mjs';

export const FINAL_PUBLIC_REVIEW=FINAL_PUBLIC_REVIEW_SCHEMA;

const list=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'&&value.trim().length>0;
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'
 ? Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const sha=value=>crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const sorted=value=>[...value].sort((a,b)=>String(a).localeCompare(String(b)));
const abstractWhyLanguage=/\b(?:differentiated market behavior|sources? of future value|good positioning|strong management|attractive opportunity)\b/i;
const normalized=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const naturalStanceSentence=value=>text(value)&&!/^\s*Stance\s*:/i.test(value)&&/^[A-Z0-9]/.test(value.trim())&&/[.!?]$/.test(value.trim())&&value.trim().split(/\s+/).length>=3&&value.trim().split(/\s+/).length<=30&&!value.includes('\n');

export function presentationHash(presentation){
 return sha(presentation);
}

export function publicExpressions(presentation){
 const rows=[];
 for(const card of list(presentation?.cards)){
 rows.push({id:'card:'+card.id,kind:'card',record_id:card.id,description:card.description,
   source_id:card.primary_source_id,source_url:card.source_url,published_at:card.at,
   tickers:list(card.assets).map(asset=>asset.symbol),ticker_stances:publicTickerStances(card.ticker_stances),media_dependency:card.media_dependency||'none',media:list(card.media),media_gaps:list(card.media_gaps),media_sha256:sha({media:list(card.media),media_gaps:list(card.media_gaps),dependency:card.media_dependency||'none'}),stance_sentence:card.stance_sentence,opening_plan:card.opening_plan});
  for(const item of list(card.timeline)){
   const detail=list(presentation.details).find(row=>row.id===item.detail_id);
   rows.push({id:'timeline:'+item.detail_id,kind:'timeline',record_id:card.id,event_id:item.id,
    description:detail?.description,source_id:detail?.source_id,source_url:item.source_url||detail?.source_url,
    published_at:item.at,tickers:list(item.assets).map(asset=>asset.symbol),ticker_stances:publicTickerStances(item.ticker_stances),
    media_dependency:detail?.media_dependency||'none',media:list(detail?.media),media_gaps:list(detail?.media_gaps),media_sha256:sha({media:list(detail?.media),media_gaps:list(detail?.media_gaps),dependency:detail?.media_dependency||'none'})});
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

 check(presentation?.generation_version==='3.2','Final presentation must use generation contract 3.2');
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
  check(Array.isArray(card.media)&&Array.isArray(card.media_gaps),label+' needs deterministic media and media_gaps arrays');
  if(card.media_dependency==='required')check(list(card.media).length>0,label+' required media is missing from the presentation');
  if(card.media_dependency==='helpful')check(list(card.media).length>0||list(card.media_gaps).length>0,label+' helpful media is missing without a retrieval gap');
  if((card.media_dependency||'none')==='none')check(list(card.media).length===0&&list(card.media_gaps).length===0,label+' media appears despite visual_dependency none');
  for(const issue of tickerStanceIssues({tickerStances:card.ticker_stances,tickers:list(card.assets).map(asset=>asset.symbol),requireEvidence:false}))errors.push(label+' '+issue);
  check(naturalStanceSentence(card.stance_sentence),label+' needs a natural directional conclusion rather than a stance label');
  for(const issue of openingChainIssues({stanceSentence:card.stance_sentence,body:card.description,subject:card.opening_plan?.subject,openingPlan:card.opening_plan,tickerStances:card.ticker_stances}))errors.push(label+' '+issue);
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
   check(list(item.assets).length>0,context+' needs its own ticker set');
   check(Array.isArray(item.media)&&Array.isArray(item.media_gaps)&&Array.isArray(detail?.media)&&Array.isArray(detail?.media_gaps),context+' needs deterministic media projection');
   check(JSON.stringify(canonical(item.media))===JSON.stringify(canonical(detail?.media))&&JSON.stringify(canonical(item.media_gaps))===JSON.stringify(canonical(detail?.media_gaps)),context+' preview/detail media differ');
   if(detail?.media_dependency==='required')check(list(detail?.media).length>0,context+' required media is missing from the presentation');
   if(detail?.media_dependency==='helpful')check(list(detail?.media).length>0||list(detail?.media_gaps).length>0,context+' helpful media is missing without a retrieval gap');
   if((detail?.media_dependency||'none')==='none')check(list(detail?.media).length===0&&list(detail?.media_gaps).length===0,context+' media appears despite visual_dependency none');
   for(const issue of tickerStanceIssues({tickerStances:item.ticker_stances,tickers:list(item.assets).map(asset=>asset.symbol),requireEvidence:false}))errors.push(context+' '+issue);
   const expected=item.preview===undefined?null:(detail.description.trim().split(/\s+/).length>40);
   if(expected!==null)check(item.show_more===expected,context+' Show more does not match the 40-word rule');
  }
 }
 const diversity=openingDiversityReview(list(presentation?.cards).map(card=>card.stance_sentence));
 for(const issue of diversity.errors)errors.push('Opening diversity: '+issue);
 for(const issue of diversity.warnings)warnings.push('Opening diversity: '+issue);
 if(diversity.warnings.length)check(review?.opening_distribution_review?.contract===STANCE_OPENING_CONTRACT&&review?.opening_distribution_review?.decision==='approved'&&review?.opening_distribution_review?.warning_count===diversity.warnings.length&&text(review?.opening_distribution_review?.reason),'Opening diversity warnings require a corpus-level editorial decision');
 const timelineGroups=list(presentation?.cards).filter(card=>list(card.timeline).length>0).map(card=>({record_id:card.id,subject:card.opening_plan?.subject,values:list(card.timeline).map(item=>detailMap.get(item.detail_id)?.description||'')}));
 const timelineDiversity=timelineDiversityReview(timelineGroups);
 for(const issue of timelineDiversity.errors)errors.push('Timeline diversity: '+issue);
 for(const issue of timelineDiversity.warnings)warnings.push('Timeline diversity: '+issue);
 if(timelineDiversity.warnings.length){
  const expectedIds=timelineGroups.map(group=>group.record_id).sort();
  const reviewedIds=sorted(list(review?.timeline_distribution_review?.reviewed_record_ids));
  check(review?.timeline_distribution_review?.contract===TIMELINE_DIVERSITY_CONTRACT&&review?.timeline_distribution_review?.decision==='approved'&&review?.timeline_distribution_review?.warning_count===timelineDiversity.warnings.length&&JSON.stringify(reviewedIds)===JSON.stringify(expectedIds)&&text(review?.timeline_distribution_review?.reason),'Timeline diversity warnings require a sequence-level editorial decision');
 }
 for(const row of expressions){
 check(text(row.description),row.id+' has no public prose');
  const visibleText=row.kind==='card'?composeVisibleProse(row.stance_sentence,row.description):row.description;
  check(proseLength(visibleText)<=500,row.id+' exceeds 500 visible prose characters');
  for(const issue of sourceFidelityIssues({prose:visibleText,sources:sourceMap,allowedSourceIds:[row.source_id]}))errors.push(row.id+' '+issue);
  check(matchedPatterns(visibleText,processLanguagePatterns).length===0,row.id+' exposes source/reviewer narration');
  check(matchedPatterns(visibleText,portfolioOperationPatterns).length===0,row.id+' exposes portfolio/trade operation language');
  for(const issue of proseQualityIssues(row.description,{prefixes:row.kind==='card'?[row.stance_sentence]:[]}))errors.push(row.id+' '+issue);
  check(!abstractWhyLanguage.test(row.description||''),row.id+' uses an abstract why without a concrete mechanism');
 }

 check(review?.schema_version===FINAL_PUBLIC_REVIEW,'Missing '+FINAL_PUBLIC_REVIEW+' review');
 check(text(review?.reviewer)&&text(review?.reviewed_at),'Final public review needs reviewer and timestamp');
 check(text(review?.release_version)&&!/-candidate$/i.test(review.release_version),'Final public review needs one non-candidate release version');
 check(review?.presentation_sha256===presentationHash(presentation),'Final public review is stale or bound to another presentation');
 check(review?.review_scope==='all_visible_expressions','Final public review must cover all visible expressions');
 check(review?.total_visible_expressions===expressions.length&&review?.completed_expressions===expressions.length,'Final public review counts must equal all visible expressions');
 const reviewRows=new Map(list(review?.expressions).map(row=>[row.id,row]));
 check(reviewRows.size===expressions.length,'Final public review must cover every visible card and Timeline expression once');
 for(const expression of expressions){
  const row=reviewRows.get(expression.id),label='Final review '+expression.id;
  check(!!row,label+' is missing');if(!row)continue;
  check(row.decision==='approved'&&text(row.reason),label+' is not approved with a concrete reason');
  const visibleText=expression.kind==='card'?composeVisibleProse(expression.stance_sentence,expression.description):expression.description;
  const directionWords=[...visibleText.matchAll(/\b(bullish|bearish|neutral)\b/gi)].map(match=>match[1].toLowerCase());
  if(directionWords.length){
   const original=sourceMap.get(expression.source_id)?.text||'';
   check(row.source_explicit_direction===true,label+' uses Bullish/Bearish/Neutral without a source-explicit review decision');
   if(expression.kind==='card')check(expression.opening_plan?.source_explicit_direction===true,label+' direct direction wording is missing from the reviewed opening plan');
   for(const word of new Set(directionWords)){
    check(new RegExp(`\\b${word}\\b`,'i').test(original),label+' uses '+word+' although the expression source does not');
    const stance=word==='neutral'?'none':word;
    check(expression.ticker_stances.some(item=>item.stance===stance),label+' uses '+word+' without a matching expression-level ticker stance');
   }
  }
  check(row.source_id===expression.source_id&&row.source_url===expression.source_url&&row.published_at===expression.published_at,
   label+' source/date no longer matches the rendered expression');
  check(JSON.stringify(sorted(list(row.tickers)))===JSON.stringify(sorted(expression.tickers)),label+' ticker review differs from rendered tags');
  check(row.ticker_stance_contract===TICKER_STANCE_CONTRACT&&row.ticker_stance_supported===true,label+' needs source-backed per-ticker direction review');
  check(JSON.stringify(publicTickerStances(row.ticker_stances))===JSON.stringify(expression.ticker_stances),label+' ticker stance review differs from the rendered expression');
  for(const issue of tickerStanceIssues({tickerStances:row.ticker_stances,tickers:expression.tickers,requireEvidence:false}))errors.push(label+' '+issue);
  check(text(row.what)&&text(row.why),label+' needs explicit what and why');
  check(row.conclusion_first===true&&text(row.opening_conclusion)&&text(row.opening_reason),label+' needs a conclusion-first opening review');
  check(['fundamental','mixed'].includes(row.content_domain),label+' technical-only content cannot enter the public projection');
  if(expression.kind==='timeline'){
   check(['reason','evidence','condition','correction'].includes(row.increment_kind),label+' needs a material increment kind');
   check(text(row.increment),label+' needs the actual thesis increment');
   check(['fundamental','mixed'].includes(row.increment_domain),label+' Timeline needs a non-technical thesis increment');
   if(row.content_domain==='mixed'||row.increment_domain==='mixed')check(text(row.fundamental_increment),label+' mixed Timeline content needs an independently qualifying non-technical increment');
   check(row.timeline_opening_contract===TIMELINE_OPENING_CONTRACT&&row.direction_visible_immediately===true&&row.mechanism_visible_immediately===true&&row.relationship_complete===true&&row.continuation_advances===true&&row.metadata_hidden_direction_clear===true,label+' lacks the dated Timeline opening/progression review');
   for(const issue of timelineOpeningIssues({body:expression.description,openingConclusion:row.opening_conclusion,openingReason:row.opening_reason,stanceClause:row.stance_clause,mechanismClause:row.mechanism_clause,stanceRealizations:row.stance_realizations,tickerStances:row.ticker_stances,sourceExplicitDirection:row.source_explicit_direction}))errors.push(label+' '+issue);
  }
  if(expression.kind==='card')check(row.increment_kind===null||row.increment_kind===undefined,label+' card must not masquerade as a Timeline increment');
  check(row.direct_voice===true&&row.no_inference===true&&row.source_fidelity===true,
   label+' must pass direct-voice, no-inference and source-fidelity review');
  check(row.ticker_complete===true&&row.media_complete===true,label+' ticker/media completeness is unresolved');
  check(row.media_sha256===expression.media_sha256&&row.media_count===expression.media.length&&row.media_gap_count===expression.media_gaps.length,label+' media review is stale or not bound to the rendered expression');
  for(const media of expression.media)check(text(media?.cover_url)&&/^https:\/\//.test(media.cover_url)&&text(media?.source_id)&&text(media?.attachment_id),label+' contains untraceable rendered media');
  for(const issue of tickerRoleIssues(row,expression.tickers,{allowRecordResolution:expression.kind==='timeline'}))errors.push(label+' '+issue);
  for(const issue of whyQualityIssues(row.why))errors.push(label+' '+issue);
  check(row.why_complete_sentence===true,label+' why has not been reviewed as a complete sentence');
  check(row.objective_fact_only===false,label+' why is still only an objective fact or result');
  check(allowedMechanismTypes.has(row.why_mechanism_type),label+' needs a concrete why_mechanism_type');
  check(row.specific_directional_state===true&&row.mechanism_visible_early===true&&row.professional_voice===true&&row.natural_collocation===true&&row.non_tautological===true&&row.non_template===true&&row.relationship_complete===true&&row.continuation_advances===true&&row.metadata_hidden_direction_clear===true,label+' lacks the professional opening and passage-progression review');
  if(expression.kind==='card'){
   check(row.stance_sentence===expression.stance_sentence,label+' stance-first sentence is missing or stale');
   check(row.opening_contract===STANCE_OPENING_CONTRACT&&JSON.stringify(canonical(row.opening_plan))===JSON.stringify(canonical(expression.opening_plan)),label+' opening plan is missing, stale or bound to another expression');
   check(row.stance_clause===expression.opening_plan?.stance_clause&&row.mechanism_clause===expression.opening_plan?.mechanism_clause&&JSON.stringify(canonical(row.stance_realizations))===JSON.stringify(canonical(expression.opening_plan?.stance_realizations)),label+' stance-first spans are missing or stale');
   check(row.specific_directional_state===true&&row.mechanism_visible_early===true&&row.professional_voice===true&&row.natural_collocation===true&&row.non_tautological===true&&row.non_template===true&&row.relationship_complete===true&&row.continuation_advances===true,label+' lacks the professional stance-opening and passage-progression review');
   for(const issue of openingChainIssues({stanceSentence:expression.stance_sentence,body:expression.description,subject:expression.opening_plan?.subject,openingPlan:expression.opening_plan,tickerStances:expression.ticker_stances}))errors.push(label+' '+issue);
   check(row.direction_expressed_naturally===true&&row.direction_visible_immediately===true&&row.investment_landing_clear===true&&row.mechanism_follows===true,label+' lacks a reviewed immediate-direction-to-conclusion-to-mechanism chain');
   check(normalized(row.opening_reason)===normalized(row.why),label+' body opening is not the reviewed mechanism');
  }
  check(row.company_specific_increment===true,label+' lacks a company-specific increment decision');
  check(row.portfolio_operation_free===true,label+' still contains portfolio/trade operation content');
  check(row.process_language_free===true,label+' still contains source/reviewer process narration');
  check(row.prose_coherent===true,label+' still contains fragments or incoherent prose');
  check(row.repetition_free===true,label+' still contains repeated reasoning');
  check(row.related_context_excluded===true,label+' has not excluded adjacent theme, peer, ETF, policy or financing context');
  check(row.why_specific===true,label+' why remains abstract or mechanism-free');
  check(expression.tickers.length>0,label+' every card and Timeline expression needs at least one ticker');
 }
 for(const id of reviewRows.keys())check(expressions.some(row=>row.id===id),'Final public review contains a non-visible expression '+id);
 return {ok:errors.length===0,errors,warnings,counts:{cards:list(presentation?.cards).length,timeline:expressions.filter(row=>row.kind==='timeline').length,expressions:expressions.length}};
}

if(process.argv[1]&&fs.existsSync(process.argv[1])&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){
 try{
  const [packetFile,presentationFile,reviewFile]=process.argv.slice(2);
  if(!reviewFile)throw Error('Usage: final-public-projection.mjs packet.json presentation.json final-review.json');
  const packet=JSON.parse(fs.readFileSync(packetFile,'utf8')),presentation=JSON.parse(fs.readFileSync(presentationFile,'utf8')),review=JSON.parse(fs.readFileSync(reviewFile,'utf8'));
  const result=validateFinalProjection(packet,presentation,review);
  if(process.argv.includes('--published')){
   const versions=[packet.release_version,presentation.release_version,review.release_version];
   if(new Set(versions).size!==1||versions.some(value=>!value||/-candidate$/i.test(value)))result.errors.push('Published packet, presentation and review must share one non-candidate release version');
   if(packet.release_status!=='released'||presentation.release_status!=='released'||review.release_status!=='released')result.errors.push('Published readback requires release_status: released across all artifacts');
   result.ok=result.errors.length===0;
  }
  console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
