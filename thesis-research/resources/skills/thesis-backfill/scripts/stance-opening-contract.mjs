import {THESIS_POLICY} from '../../references/thesis-policy.mjs';

export const STANCE_OPENING_CONTRACT=THESIS_POLICY.openingContract;
export const TIMELINE_OPENING_CONTRACT=THESIS_POLICY.timelineOpeningContract;
export const TIMELINE_DIVERSITY_CONTRACT='timeline-opening-diversity/1.0';

export const judgmentAxes=new Set([
 'fundamentals','demand','supply','valuation','risk_reward','execution',
 'capital_allocation','financing','competition','regulation','product',
 'customer_adoption'
]);

export const openingFamilies=new Set([
 'company_state','beneficiary','downside','conditional_upside','risk_reward',
 'valuation','execution_dependency','relative_preference','supported_by',
 'turnaround','direct_source_label'
]);

const filled=value=>typeof value==='string'&&value.trim().length>0;
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const tokens=value=>normalize(value).split(' ').filter(Boolean);
const progressionStopWords=new Set('a an and are as at be because been being but by can could did do does for from had has have if in into is it its may might must of on or should than that the their them they this those to was were while will with would'.split(' '));
const irregularStems={grew:'grow',grown:'grow',rose:'rise',risen:'rise',fell:'fall',fallen:'fall',better:'improve',worse:'worsen'};
const stem=token=>irregularStems[token]||token.replace(/ies$/,'y').replace(/ing$/,'').replace(/ed$/,'').replace(/s$/,'');
const contentTokens=value=>tokens(value).filter(token=>token.length>3&&!progressionStopWords.has(token)).map(stem);
const sentenceSegmenter=new Intl.Segmenter('en',{granularity:'sentence'});
const firstSentence=value=>{
 const abbreviations=[];
 const protectedText=String(value||'').trim().replace(/\b(?:[A-Z]\.){2,}/g,match=>{const token=`ABBR${abbreviations.length}TOKEN`;abbreviations.push(match);return token;});
 let sentence=[...sentenceSegmenter.segment(protectedText)][0]?.segment||'';
 for(const [index,abbreviation] of abbreviations.entries())sentence=sentence.replace(`ABBR${index}TOKEN`,abbreviation);
 return sentence.trim();
};

const genericEvaluationPatterns=[
 /\b(?:looks?|is|are|appears?|remains?)\s+(?:appealing|compelling)\b/i,
 /^\s*the (?:investment )?case for .+ is (?:strong|weak)\b/i,
 /^\s*the outlook for .+ is (?:positive|negative)\b/i,
 /\bpresents? (?:a )?(?:compelling|attractive) opportunity\b/i,
 /^\s*(?:[A-Z][\w.&-]*(?:['’]s)?\s+){1,5}has (?:further |speculative )?upside\b/i,
 /^\s*(?:[A-Z][\w.&-]*(?:['’]s)?\s+){1,5}could benefit\b/i,
 /^\s*(?:[A-Z][\w.&-]*(?:['’]s)?\s+){1,5}looks stronger\b/i,
 /^\s*(?:[A-Z][\w.&-]*(?:['’]s)?\s+){1,5}(?:is|remains) well positioned\b/i,
 /^\s*(?:[A-Z][\w.&-]*(?:['’]s)?\s+){1,5}is execution-dependent\b/i,
 /^\s*(?:[A-Z][\w.&-]*(?:['’]s)?\s+){1,5}offers? (?:a|an) opportunity\b/i
];

const awkwardPatterns=[
 {pattern:/\bthe case for (?:a |an |the )?(?:higher|lower)?\s*(?:valuation|rerating|recovery|upside) is (?:limited|strong|weak)\b/i,message:'opening explains the investment view with another abstract case label'},
 {pattern:/\boutlook\b.{0,60}\bis supported\b/i,message:'opening uses passive support language instead of naming the driver'},
 {pattern:/\bopportunity is broadening\b/i,message:'opening uses a vague broadening-opportunity claim'},
 {pattern:/\bis (?:a )?preferred .+ company\b/i,message:'opening substitutes preference language for an investment mechanism'},
 {pattern:/\bwell positioned as the case for\b/i,message:'opening combines a directional template with circular case language'}
];

const directionalState=/\b(?:bullish on|bearish on|neutral on|(?:is|are|remain(?:s|ed)?|look(?:s|ed)?) (?:bullish|bearish|neutral)|look(?:s|ed)? (?:more |less )?(?:attractive|unattractive|stronger|weaker|weak|vulnerable|undervalued|underpriced|underappreciated|overvalued|stretched|risky|riskier|fragile|expensive|productive|exposed)|still looks? expensive|(?:is|are|remain(?:s|ed)?) (?:strengthening|weakening|well positioned|better positioned|worse positioned|attractive|unattractive|vulnerable|high risk|execution-dependent|constrained|exposed|supported|balanced|undervalued|underpriced|underappreciated|overvalued|stretched|risky|fragile|favou?rable|favou?red|preferred|unsuitable|the top pick|an? (?:potential but )?unproven turnaround|a long|a short)|face(?:s|d)? .{0,35}(?:downside|risk|pressure)|(?:has|have) (?:further |speculative )?(?:upside|rerating potential)|offers? (?:better|cleaner|more targeted|speculative|more speculative) .{0,30}?(?:exposure|upside)|risk-reward (?:is improving|has worsened|is balanced|depends)|upside (?:is|remains) offset|(?:valuation )?upside looks? limited|(?:outlook|opportunity|business|investment|position|trajectory|setup|valuation|demand case|return case) (?:is|are|has|have|remains?|strengthened|weakened|improved) (?:favou?rable|unattractive|stronger|weaker|improving|expanding|improved|strengthening|weakening|supported)?|(?:carry|carries|carried|gain(?:s|ed)?|support(?:s|ed)?|present(?:s|ed)?|merit(?:s|ed)?|rank(?:s|ed)?|lead(?:s|ed)?|hold(?:s|ing)?) .{0,55}(?:favou?rable|stronger|unattractive|tactical|preferred|strongest|first|support|return case|demand case|demand outlook|company setup|interest)|(?:is|are|was|were) expected to (?:keep )?(?:appreciat|grow|improv)|(?:could|can|may|should) (?:both )?(?:benefit|keep growing|grow|deliver|recover|improve|retain|strengthen|gain|earn|sell|become more valuable|win)|retain(?:s|ed)? upside|remain(?:s|ed)? favou?red|remain(?:s|ed)? preferred|(?:is|are|was|were) preferred|(?:is|are) favou?red|has operating momentum)\b/i;
const axisDirectionalState=/\b(?:(?:carry|carries|carried) (?:a )?(?:strong |favou?rable |positive |negative )?(?:multi-?year )?(?:return|demand|operating|valuation) outlook|(?:has|have|had) (?:a )?(?:favou?rable|strong|positive|negative) .{0,35}(?:outlook|case|setup)|(?:is|are|was|were) expected to (?:keep )?(?:appreciate|appreciating|grow|growing|improve|improving)|remain(?:s|ed)? (?:a )?preferred .{0,35}(?:exposure|holding|choice)|held the strongest .{0,35}(?:position|ranking)|(?:outlook|trajectory|position) (?:strengthened|weakened|improved))\b/i;

const directLabel=/^(?:bullish|bearish|neutral) on\b/i;
const attractivenessLabel=/\b(?:looks?|is|are|appears?|remains?)\s+(?:attractive|unattractive)\b/i;
const reasonConnector=/\b(?:as|because|given|while|although|if|for|from|with)\b\s+(.+)/i;
const metadataLabel=/\b(?:bullish|bearish|neutral)\b/i;
const mechanismConnector=/^(?:because|as|if|while|although|given|from|with|despite|but)\b/i;
const directionValues=new Set(['bullish','bearish','none']);
const normalizedTicker=value=>String(value||'').trim().toUpperCase();

const overlap=(left,right)=>{
 const a=new Set(tokens(left)),b=new Set(tokens(right));
 if(!a.size||!b.size)return 0;
 return [...a].filter(word=>b.has(word)).length/Math.min(a.size,b.size);
};

const contentOverlap=(left,right)=>{
 const a=new Set(contentTokens(left)),b=new Set(contentTokens(right));
 if(!a.size||!b.size)return 0;
 return [...a].filter(word=>b.has(word)).length/Math.min(a.size,b.size);
};

const genericContinuation=[
 /^It would attract more users\.?$/i,
 /^New products?(?: and services)? could support growth\.?$/i,
 /^The .+ listing is proposed\.?$/i,
 /^Strong demand could support (?:the|these|those) .+\.?$/i,
 /^Its fundamentals remain strong and its valuation is lower\.?$/i
];
const advancementSignal=/\b(?:although|but|despite|however|unless|until|risk|condition|depends?|requires?|needs?|must|unconfirmed|not announced|not completed|not yet|not necessarily|not specifically|reported|reached|grew|rose|fell|declined|signed|ordered|shipped|approved|launched|paid|guidance|margin|backlog|revenue|profit|cash flow)\b/i;
const number=value=>String(value||'').match(/\$?\d[\d,.]*(?:%|x|MW|GW|bn|m)?/gi)||[];

export function passageProgressionIssues(stanceSentence,body){
 const opening=String(stanceSentence||'').trim(),followup=firstSentence(body),issues=[];
 if(!opening||!followup)return issues;
 if(genericContinuation.some(pattern=>pattern.test(followup)))issues.push('first body sentence is a generic echo rather than new evidence, mechanism, condition or risk');
 const overlapScore=contentOverlap(opening,followup);
 const addsNumber=number(followup).some(value=>!number(opening).includes(value));
 const advances=addsNumber||advancementSignal.test(followup);
 if(overlapScore>=0.55&&!advances)issues.push('first body sentence restates the opening instead of advancing the investment logic');
 return [...new Set(issues)];
}

export function timelineOpeningIssues({body,openingConclusion,openingReason,stanceClause,mechanismClause,stanceRealizations,tickerStances,sourceExplicitDirection=false}={}){
 const opening=firstSentence(body),issues=[];
 if(!opening)return ['Timeline opening is missing'];
 for(const issue of stanceStructureIssues({sentence:opening,stanceClause,mechanismClause,stanceRealizations,tickerStances,sourceExplicitDirection}))issues.push('Timeline '+issue);
 if(genericEvaluationPatterns.some(pattern=>pattern.test(opening)))issues.push('Timeline opening uses promotional or generic evaluation language');
 if(/\b(?:the|this) partnership\b(?!\s+(?:with|between)\s+[a-z])/i.test(opening))issues.push('Timeline opening leaves the partnership counterparty unnamed');
 if(/\bnew products?\b/i.test(opening)&&!/(?:including|such as|:).{0,80}\b[a-z]/i.test(opening))issues.push('Timeline opening refers to new products without identifying them');
 if(filled(openingConclusion)&&contentOverlap(opening,openingConclusion)<0.35)issues.push('Timeline opening does not contain the reviewed dated conclusion');
 if(filled(openingReason)&&contentOverlap(opening,openingReason)<0.35)issues.push('Timeline opening does not contain the reviewed mechanism');
 const remainder=String(body||'').trim().slice(opening.length).trim();
 if(remainder)for(const issue of passageProgressionIssues(opening,remainder))issues.push('Timeline '+issue);
 return [...new Set(issues)];
}

export function stanceStructureIssues({sentence,stanceClause,mechanismClause,stanceRealizations,tickerStances,sourceExplicitDirection=false}={}){
 const opening=firstSentence(sentence),issues=[];
 if(!filled(stanceClause))issues.push('opening needs an explicit stance_clause');
 if(!filled(mechanismClause))issues.push('opening needs an explicit mechanism_clause');
 if(filled(stanceClause)&&!opening.startsWith(stanceClause.trim()))issues.push('opening must start with the exact stance_clause before evidence or background');
 if(filled(stanceClause)&&tokens(stanceClause).length>18)issues.push('stance_clause must land the investment view within the first 18 words');
 if(filled(stanceClause)&&!directionalState.test(stanceClause)&&!axisDirectionalState.test(stanceClause))issues.push('stance_clause does not independently state an investment direction when metadata is hidden');
 if(metadataLabel.test(opening)&&sourceExplicitDirection!==true)issues.push('visible Bullish/Bearish/Neutral language requires exact source support');
 if(filled(mechanismClause)){
  const at=opening.indexOf(mechanismClause.trim());
  if(at<0)issues.push('opening does not contain the exact mechanism_clause');
  else if(filled(stanceClause)&&at<stanceClause.trim().length)issues.push('mechanism_clause appears before the stance has landed');
  if(!mechanismConnector.test(mechanismClause.trim()))issues.push('mechanism_clause must begin with a causal or conditional connector');
 }
 const rows=Array.isArray(stanceRealizations)?stanceRealizations:[];
 const supplied=Array.isArray(tickerStances)?tickerStances:[];
 const expected=new Map((supplied.length?supplied:rows).map(item=>[normalizedTicker(item?.ticker),item?.stance]));
 if(expected.size&&!rows.length)issues.push('opening needs one stance_realization per ticker');
 const seen=new Set();
 for(const row of rows){
  const ticker=normalizedTicker(row?.ticker),expectedStance=expected.get(ticker);
  if(!ticker||seen.has(ticker))issues.push('stance_realizations must contain each ticker exactly once');
  seen.add(ticker);
  if(!directionValues.has(row?.stance)||row.stance!==expectedStance)issues.push('stance realization for '+(ticker||'<missing ticker>')+' does not match ticker_stances');
  if(!filled(row?.text_span)||!opening.includes(row.text_span)||filled(stanceClause)&&!stanceClause.includes(row.text_span))issues.push('stance realization for '+(ticker||'<missing ticker>')+' needs an exact span inside stance_clause');
 }
 if(expected.size&&(seen.size!==expected.size||[...expected.keys()].some(ticker=>!seen.has(ticker))))issues.push('stance_realizations must exactly match the expression ticker set');
 return [...new Set(issues)];
}

function subjectOccurrences(sentence,subject){
 const value=normalize(subject);
 if(!value||value.split(' ').length>4)return 0;
 const escaped=value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return (normalize(sentence).match(new RegExp(`(?:^| )${escaped}(?= |$)`,'g'))||[]).length;
}

export function openingPlanIssues(plan,{stance}={}){
 const issues=[];
 if(plan?.version!==STANCE_OPENING_CONTRACT)issues.push('opening plan needs '+STANCE_OPENING_CONTRACT);
 if(!filled(plan?.subject))issues.push('opening plan needs the investable subject');
 if(!judgmentAxes.has(plan?.judgment_axis))issues.push('opening plan needs a supported judgment_axis');
 if(!openingFamilies.has(plan?.opening_family))issues.push('opening plan needs an allowed opening_family');
 if(!filled(plan?.directional_state))issues.push('opening plan needs a specific directional_state');
 if(!filled(plan?.mechanism)||tokens(plan?.mechanism).length<4)issues.push('opening plan needs a concrete mechanism');
 if(!filled(plan?.stance_clause))issues.push('opening plan needs stance_clause');
 if(!filled(plan?.mechanism_clause))issues.push('opening plan needs mechanism_clause');
 if(!Array.isArray(plan?.stance_realizations)||!plan.stance_realizations.length)issues.push('opening plan needs stance_realizations');
 if(plan?.mechanism_location!=='same_sentence')issues.push('opening plan needs the decisive mechanism in the first sentence');
 if(plan?.stance!==undefined&&!['bullish','bearish','none'].includes(plan.stance||stance))issues.push('opening plan legacy stance must be bullish, bearish or none');
 if(plan?.opening_family==='direct_source_label'&&plan?.source_explicit_direction!==true)issues.push('direct Bullish/Bearish/Neutral language requires exact source support');
 if(plan?.source_explicit_direction!==undefined&&typeof plan.source_explicit_direction!=='boolean')issues.push('source_explicit_direction must be boolean');
 return issues;
}

export function professionalOpeningIssues(sentence,{subject,openingPlan}={}){
 const value=String(sentence||'').trim(),issues=[];
 if(metadataLabel.test(value)&&openingPlan?.source_explicit_direction!==true)issues.push('visible Bullish/Bearish/Neutral language requires exact source support');
 if(genericEvaluationPatterns.some(pattern=>pattern.test(value)))issues.push('opening uses promotional or generic evaluation language');
 for(const {pattern,message} of awkwardPatterns)if(pattern.test(value))issues.push(message);
 if(/\b(?:the|this) partnership\b(?!\s+(?:with|between)\s+[a-z])/i.test(value))issues.push('opening leaves the partnership counterparty unnamed');
 if(/\bnew products?\b/i.test(value)&&!/(?:including|such as|:).{0,80}\b[a-z]/i.test(value))issues.push('opening refers to new products without identifying them');
 if(normalize(subject).includes(' ')&&subjectOccurrences(value,subject)>1)issues.push('opening repeats the subject instead of stating the mechanism directly');
 if(directLabel.test(value)&&openingPlan?.source_explicit_direction!==true)issues.push('direct Bullish/Bearish/Neutral language lacks explicit source support');
 if(attractivenessLabel.test(value)){
  const reason=value.match(reasonConnector)?.[1]||'';
  if(tokens(reason).length<4||/^(?:it|they|the (?:shares?|company|stock)) (?:is|are|looks?|remains?) (?:attractive|unattractive)\b/i.test(reason))issues.push('attractive/unattractive opening needs an immediate specific mechanism');
 }
 if(!directionalState.test(value)&&!axisDirectionalState.test(value))issues.push('opening clause does not state a specific investment direction');
 return issues;
}

// Compatibility for older callers that only passed the visible stance line.
export const stanceOpeningIssues=value=>professionalOpeningIssues(value);

export function openingChainIssues({stanceSentence,body,subject,openingPlan,tickerStances}={}){
 const issues=[...openingPlanIssues(openingPlan,{stance:openingPlan?.stance}),...professionalOpeningIssues(stanceSentence,{subject,openingPlan}),...stanceStructureIssues({sentence:stanceSentence,stanceClause:openingPlan?.stance_clause,mechanismClause:openingPlan?.mechanism_clause,stanceRealizations:openingPlan?.stance_realizations,tickerStances,sourceExplicitDirection:openingPlan?.source_explicit_direction}),...passageProgressionIssues(stanceSentence,body)];
 const reason=openingPlan?.mechanism||'',sameSentence=overlap(stanceSentence,reason)>=0.35;
 if(openingPlan?.mechanism_location==='same_sentence'&&!sameSentence)issues.push('opening does not contain the reviewed mechanism');
 return [...new Set(issues)];
}

export function openingSkeleton(value){
 const sentence=normalize(value);
 if(sentence.startsWith('bullish on '))return 'direct-bullish';
 if(sentence.startsWith('bearish on '))return 'direct-bearish';
 if(sentence.startsWith('neutral on '))return 'direct-neutral';
 if(/\b(?:is|are|remain(?:s|ed)?|look(?:s|ed)?) bullish\b/.test(sentence))return'source-bullish';
 if(/\b(?:is|are|remain(?:s|ed)?|look(?:s|ed)?) bearish\b/.test(sentence))return'source-bearish';
 if(/\b(?:is|are|remain(?:s|ed)?|look(?:s|ed)?) neutral\b/.test(sentence))return'source-neutral';
 if(/\blooks? attractive\b/.test(sentence))return 'looks-attractive';
 if(/\blooks? unattractive\b/.test(sentence))return 'looks-unattractive';
 if(/\b(?:is|are|remain(?:s|ed)?) well positioned\b/.test(sentence))return 'well-positioned';
 if(/\b(?:is|are) strengthening\b/.test(sentence))return 'strengthening';
 if(/\blook(?:s|ed)? weak\b/.test(sentence))return 'looks-weak';
 if(/\blook(?:s|ed)? vulnerable\b/.test(sentence))return 'looks-vulnerable';
 if(/\bface(?:s|d)? downside\b/.test(sentence))return 'faces-downside';
 if(/\b(?:has|have) upside\b/.test(sentence))return 'has-upside';
 if(/\brisk reward is improving\b/.test(sentence))return 'risk-reward-improving';
 if(/\brisk reward has worsened\b/.test(sentence))return 'risk-reward-worsened';
 if(/\blook(?:s|ed)? undervalued\b/.test(sentence))return 'looks-undervalued';
 if(/\blook(?:s|ed)? (?:overvalued|stretched)\b/.test(sentence))return 'looks-stretched';
 if(/\bremain(?:s|ed)? supported\b/.test(sentence))return 'remains-supported';
 if(/\b(?:could|can|may|should) benefit\b/.test(sentence))return 'beneficiary';
 if(/\bunproven turnaround\b/.test(sentence))return 'unproven-turnaround';
 return sentence.split(' ').slice(0,5).join('-');
}

export function openingDiversityReview(values,{rollingWindow=10,rollingLimit=2,familyShareLimit=0.12}={}){
 const skeletons=values.map(openingSkeleton),errors=[],warnings=[],counts={};
 for(const skeleton of skeletons)counts[skeleton]=(counts[skeleton]||0)+1;
 for(let i=1;i<skeletons.length;i++)if(skeletons[i]===skeletons[i-1])errors.push(`adjacent cards repeat opening skeleton ${skeletons[i]} at positions ${i} and ${i+1}`);
 for(let start=0;start+rollingWindow<=skeletons.length;start++){
  const window={};for(const skeleton of skeletons.slice(start,start+rollingWindow))window[skeleton]=(window[skeleton]||0)+1;
  for(const[skeleton,count]of Object.entries(window))if(count>rollingLimit)warnings.push(`opening skeleton ${skeleton} appears ${count} times in cards ${start+1}-${start+rollingWindow}`);
 }
 for(const[skeleton,count]of Object.entries(counts))if(skeletons.length>=20&&count/skeletons.length>familyShareLimit)warnings.push(`opening skeleton ${skeleton} is ${count}/${skeletons.length} cards and needs corpus-level editorial review`);
 return{errors:[...new Set(errors)],warnings:[...new Set(warnings)],skeletons,counts};
}

export function timelineOpeningSkeleton(value,{subject}={}){
 let sentence=normalize(value),subjectText=normalize(subject);
 if(subjectText&&sentence.startsWith(subjectText+' '))sentence=sentence.slice(subjectText.length+1);
 if(/^(?:should |could |may )?remain(?:s|ed)? (?:favou?red|preferred)\b/.test(sentence))return'remain-favored';
 if(/^look(?:s|ed)? vulnerable\b/.test(sentence))return'looks-vulnerable';
 if(/^look(?:s|ed)? attractive\b/.test(sentence))return'looks-attractive';
 if(/^risk reward (?:is|was) balanced\b/.test(sentence))return'risk-reward-balanced';
 if(/^risk reward (?:has )?worsened\b/.test(sentence))return'risk-reward-worsened';
 if(/^(?:is|was|remains?|remained) strengthening\b/.test(sentence))return'strengthening';
 if(/^(?:faces?|faced) (?:downside|risk|pressure)\b/.test(sentence))return'faces-risk';
 return openingSkeleton(value);
}

function timelineSurfaceShape(value,{subject}={}){
 const sentence=normalize(value),subjectText=normalize(subject);
 const subjectFirst=subjectText&&sentence.startsWith(subjectText+' ');
 const causal=/\b(?:because|as|while|although|if|when|given|after|before|unless)\b/.test(sentence);
 return`${subjectFirst?'subject-first':'driver-first'}:${causal?'causal':'simple'}`;
}

export function timelineDiversityReview(groups,{subjectFirstRunLimit=3,repeatLimit=2}={}){
 const errors=[],warnings=[],records=[];
 for(const group of Array.isArray(groups)?groups:[]){
  const values=Array.isArray(group?.values)?group.values:[],skeletons=values.map(value=>timelineOpeningSkeleton(value,{subject:group?.subject})),shapes=values.map(value=>timelineSurfaceShape(value,{subject:group?.subject}));
  const counts={};for(const skeleton of skeletons)counts[skeleton]=(counts[skeleton]||0)+1;
  for(let index=1;index<skeletons.length;index++)if(skeletons[index]===skeletons[index-1])errors.push(`Timeline ${group.record_id} repeats adjacent opening family ${skeletons[index]} at rows ${index} and ${index+1}`);
  for(let start=0;start+subjectFirstRunLimit<=shapes.length;start++)if(shapes.slice(start,start+subjectFirstRunLimit).every(shape=>shape==='subject-first:causal'))errors.push(`Timeline ${group.record_id} repeats the subject-first causal sentence shape across rows ${start+1}-${start+subjectFirstRunLimit}`);
  for(const[skeleton,count]of Object.entries(counts))if(count>repeatLimit)warnings.push(`Timeline ${group.record_id} uses opening family ${skeleton} ${count} times and needs sequence-level editorial review`);
  records.push({record_id:group?.record_id,subject:group?.subject,skeletons,shapes,counts});
 }
 return{errors:[...new Set(errors)],warnings:[...new Set(warnings)],records};
}

export const TEMPORAL_FEED_DIVERSITY_CONTRACT='temporal-feed-opening-diversity/1.0';

export function temporalFeedOpeningFamily(value){
 const sentence=normalize(value);
 if(/\bremain(?:s|ed)?\s+(?:favou?red|preferred|attractive|unattractive|vulnerable|supported|balanced|exposed|constrained)\b/.test(sentence))return'remain-evaluation';
 if(/\blook(?:s|ed)?\s+(?:favou?red|preferred|attractive|unattractive|stronger|weaker|vulnerable|undervalued|overvalued|stretched)\b/.test(sentence))return'look-evaluation';
 if(/\b(?:is|are|was|were)\s+(?:favou?red|preferred|attractive|unattractive|vulnerable|supported|balanced|exposed|constrained)\b/.test(sentence))return'be-evaluation';
 if(/\b(?:has|have)\s+(?:further\s+|speculative\s+)?upside\b/.test(sentence))return'has-upside';
 if(/\b(?:could|can|may|should)\s+(?:both\s+)?benefit\b/.test(sentence))return'could-benefit';
 return openingSkeleton(value);
}

export function temporalFeedDiversityReview(values,{rollingWindow=6,rollingLimit=2,familyShareLimit=0.25,minShareCount=3}={}){
 const families=(Array.isArray(values)?values:[]).map(temporalFeedOpeningFamily),errors=[],warnings=[],counts={};
 for(const family of families)counts[family]=(counts[family]||0)+1;
 for(let index=1;index<families.length;index++)if(families[index]===families[index-1])errors.push(`Temporal Feed repeats adjacent opening family ${families[index]} at rows ${index} and ${index+1}`);
 for(let start=0;start+rollingWindow<=families.length;start++){
  const window={};for(const family of families.slice(start,start+rollingWindow))window[family]=(window[family]||0)+1;
  for(const[family,count]of Object.entries(window))if(count>rollingLimit)errors.push(`Temporal Feed opening family ${family} appears ${count} times in rows ${start+1}-${start+rollingWindow}`);
 }
 for(const[family,count]of Object.entries(counts))if(count>=minShareCount&&count/families.length>familyShareLimit)errors.push(`Temporal Feed opening family ${family} is ${count}/${families.length} rows and exceeds the surface-language limit`);
 return{contract:TEMPORAL_FEED_DIVERSITY_CONTRACT,errors:[...new Set(errors)],warnings:[...new Set(warnings)],families,counts};
}
