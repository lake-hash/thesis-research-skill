export const FINAL_PUBLIC_REVIEW_SCHEMA='final-public/1.3';
export {
 STANCE_OPENING_CONTRACT,TIMELINE_OPENING_CONTRACT,judgmentAxes,openingFamilies,openingPlanIssues,
 professionalOpeningIssues,stanceOpeningIssues,openingChainIssues,openingSkeleton,
 openingDiversityReview,passageProgressionIssues,timelineOpeningIssues
} from './stance-opening-contract.mjs';

const text=value=>typeof value==='string'&&value.trim().length>0;
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const words=value=>normalize(value).split(' ').filter(Boolean);
const finiteVerb=/\b(?:is|are|was|were|be|been|being|has|have|had|do|does|did|can|could|may|might|must|will|would|should|looks?|appears?|remains?|offers?|provides?|supports?|depends?|drives?|creates?|allows?|makes?|means?|limits?|reduces?|increases?|improves?|weakens?|benefits?|threatens?|faces?|needs?|requires?|generates?|supplies?|connects?|funds?|serves?|earns?|trades?|uses?|adds?|retains?|protects?|qualifies?|targets?|expects?|suggests?|shows?|reported|committed|grew|rose|fell|declined|expanded|exceeded|missed|beat|outperformed|underperformed)\b/i;
const obviousFragment=[
 /^(?:Its|Their) position in\b/i,
 /^Continued [^.]+(?:spending|expansion)\b/i,
 /^(?:Its|Their) (?:proposed|planned|expected) [^.]+\b(?:listing|outlook|expansion|growth|demand|supply|capacity)\b/i
];
const nonVerbSuffixes=new Set(['access','analysis','assets','business','chains','companies','costs','customers','earnings','glass','holdings','loss','margins','markets','operations','positions','prices','process','products','results','risks','sales','services','shares','users']);
const factMetric=/\b(?:revenue|sales|earnings|eps|profit|margin|guidance|bookings|backlog|shipments?|deliveries|users?|subscribers?|shares?|stock|price|results?)\b/i;
const factChange=/\b(?:rose|grew|fell|declined|increased|decreased|beat|missed|exceeded|reported|reached|was|were)\b/i;
const investmentMechanism=/\b(?:support|undermine|strengthen|weaken|benefit|threaten|allow|reduce|increase|depend|risk|opportunit|attractive|unattractive|overvalued|undervalued|pricing|demand|supply|cost|margin|cash flow|competition|adoption|capacity|valuation|multiple|regulation|financing|dilution|retention|distribution|monetization|utilization|backlog|switching)\b/i;

export const allowedMechanismTypes=new Set([
 'economic','operating','valuation','competitive','demand','supply','risk',
 'regulatory','capital_allocation','financing','catalyst','product','customer'
]);
export const renderedTickerRoles=new Set(['subject','vehicle']);
export const allowedTickerRoles=new Set([
 ...renderedTickerRoles,'comparison','benchmark','customer','supplier','partner','context'
]);

export {TICKER_STANCE_CONTRACT,TICKER_STANCES,tickerStanceIssues} from './ticker-stance-contract.mjs';

export const processLanguagePatterns=[
 /\b(?:the|this) (?:article|source|reply|thread|newsletter|interview|podcast|transcript|report)\b/i,
 /\b(?:the|this) post\b(?!-)/i,
 /\bthe author\b/i,
 /\bnearby X posts\b/i,
 /\bsingle verified estimate\b/i,
 /\bnot clearly establish(?:ed)?\b/i,
 /\b(?:reviewer|audit) (?:note|comment|conclusion|decision)\b/i,
 /\bAI-assisted assessment\b/i,
 /\bLinked ChatGPT research\b/i,
 /\b(?:a|the) report describes\b/i,
 /\brelayed by\b/i
];

export const portfolioOperationPatterns=[
 /\b(?:small|larger|major|core|largest|second-largest|third-largest|existing) (?:position|holding)s?\b/i,
 /\b(?:position|holding)s? (?:size|weight|was|were|remains?|remained|is|are|grew|increased|decreased)\b/i,
 /\bportfolio (?:weight|allocation|concentration)\b/i,
 /\b(?:planned|target) \d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?% (?:portfolio )?allocation\b/i,
 /\busing margin\b/i,
 /\b(?:supported|favou?red) an? entry\b/i,
 /\bwait for (?:a )?(?:price )?correction\b/i,
 /\bmore buying is planned\b/i,
 /\bmore (?:shares?|stock) (?:is|are|were) being added\b/i,
 /\b(?:shares?|position) (?:doubled|gained|was up|were up)\b/i,
 /\bdiversif(?:y|ying) across\b/i,
 /\bholding mostly\b/i,
 /\b(?:realized|unrealized) (?:gain|loss|return)\b/i,
 /\baverage cost\b/i,
 /\b(?:long|short)\b.{0,50}\b(?:expectation|target|above|below)\s+\$?\d/i,
 /\bprice target(?:s)?\s+(?:of|at|above|below|near)?\s*\$?\d/i,
 /\btarget(?:s)?\s+(?:of|at|above|below|near)?\s*\$\d/i,
 /\blimit[- ]up\b/i,
 /\b(?:adding|add) or (?:trimming|trim)\b/i,
 /\b(?:re-entry|reenter|re-enter)\b/i,
 /\b(?:worth|remain(?:ed|s)?) holding\b/i,
 /\bnot buying (?:more|further)\b/i,
 /\b(?:buy|buying|bought|sell|selling|sold|add|adding|trim|trimming|exit|exited)\b.{0,45}\b(?:shares?|stock|position|holding|portfolio|stake)\b/i,
 /\b(?:shares?|stock|position|holding|portfolio|stake)\b.{0,45}\b(?:buy|buying|bought|sell|selling|sold|add|adding|trim|trimming|exit|exited)\b/i
];

export function matchedPatterns(value,patterns){
 return patterns.filter(pattern=>pattern.test(String(value||''))).map(pattern=>pattern.source);
}

const hasFiniteVerb=value=>{
 const sentence=String(value||'').trim();
 if(obviousFragment.some(pattern=>pattern.test(sentence)))return false;
 if(finiteVerb.test(sentence))return true;
 const tokens=sentence.match(/[A-Za-z][A-Za-z'-]*/g)||[];
 return tokens.slice(1).some(token=>/(?:s|ed)$/i.test(token)&&!nonVerbSuffixes.has(token.toLowerCase()));
};

export function whyQualityIssues(why){
 const value=String(why||'').trim(),issues=[];
 if(!text(value))return ['missing why'];
 if(!/^[A-Z0-9$]/.test(value))issues.push('why must start as a complete sentence');
 if(!/[.!?]$/.test(value))issues.push('why must end with sentence punctuation');
 if(words(value).length<5)issues.push('why is too short to explain a mechanism');
 if(obviousFragment.some(pattern=>pattern.test(value))||(!hasFiniteVerb(value)&&words(value).length<=8))issues.push('why is a sentence fragment without a finite verb');
 if(factMetric.test(value)&&factChange.test(value)&&!investmentMechanism.test(value))issues.push('why is only an objective fact or result, without an investment mechanism');
 return issues;
}

const sentenceSegmenter=new Intl.Segmenter('en',{granularity:'sentence'});
const splitSentences=value=>String(value||'').split(/\n+/).flatMap(paragraph=>{
 const abbreviations=[];
 const protectedText=paragraph.trim().replace(/\b(?:[A-Z]\.){2,}/g,match=>{const token=`ABBR${abbreviations.length}TOKEN`;abbreviations.push(match);return token;});
 return [...sentenceSegmenter.segment(protectedText)].map(item=>{let sentence=item.segment;for(const[index,abbreviation]of abbreviations.entries())sentence=sentence.replace(`ABBR${index}TOKEN`,abbreviation);return sentence.trim();});
}).filter(Boolean);
const overlap=(a,b)=>{
 const left=new Set(words(a)),right=new Set(words(b));
 if(left.size<5||right.size<5)return {jaccard:0,containment:0};
 const intersection=[...left].filter(word=>right.has(word)).length;
 return {jaccard:intersection/(left.size+right.size-intersection||1),containment:intersection/Math.min(left.size,right.size)};
};

export function proseQualityIssues(value,{prefixes=[]}={}){
 const issues=[],sentences=splitSentences(value),all=[...prefixes.filter(text),...sentences];
 for(const sentence of sentences){
  if(!/^[A-Z0-9$]/.test(sentence))issues.push('sentence starts with a lowercase or incomplete fragment: '+sentence);
  if(!/[.!?]$/.test(sentence))issues.push('sentence lacks closing punctuation: '+sentence);
  if(obviousFragment.some(pattern=>pattern.test(sentence))||(!hasFiniteVerb(sentence)&&words(sentence).length<=4))issues.push('sentence fragment without a finite verb: '+sentence);
 }
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const left=normalize(all[i]),right=normalize(all[j]);
  if(!left||!right)continue;
  const score=overlap(left,right);
  if(left===right||(Math.min(words(left).length,words(right).length)>=5&&(score.jaccard>=0.82||score.containment>=0.85))){
   issues.push('repeated or near-duplicate sentences: '+all[i]+' / '+all[j]);
  }
 }
 return [...new Set(issues)];
}

export function tickerRoleIssues(reviewRow,renderedTickers,{allowRecordResolution=false}={}){
 const rendered=[...(renderedTickers||[])].sort(),roles=Array.isArray(reviewRow?.ticker_roles)?reviewRow.ticker_roles:[],issues=[];
 if(rendered.length===0&&allowRecordResolution&&reviewRow?.object_resolution==='record')return issues;
 if(roles.length===0)return ['ticker_roles review is missing'];
 const seen=new Set();
 for(const item of roles){
  if(!item||!text(item.ticker)||!allowedTickerRoles.has(item.role)){issues.push('ticker_roles contains an invalid ticker or role');continue;}
  if(seen.has(item.ticker))issues.push('ticker_roles repeats '+item.ticker);seen.add(item.ticker);
  if(!text(item.reason))issues.push('ticker role '+item.ticker+' needs a source-specific reason');
 }
 const subjects=roles.filter(item=>renderedTickerRoles.has(item.role)).map(item=>item.ticker).sort();
 if(JSON.stringify(subjects)!==JSON.stringify(rendered))issues.push('rendered ticker tags must equal subject/vehicle ticker roles');
 for(const item of roles.filter(item=>!renderedTickerRoles.has(item.role)&&rendered.includes(item.ticker)))issues.push(item.ticker+' is rendered despite role '+item.role);
 return [...new Set(issues)];
}
