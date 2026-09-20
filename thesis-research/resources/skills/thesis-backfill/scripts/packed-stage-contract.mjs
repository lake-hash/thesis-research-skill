const text=value=>typeof value==='string'?value:'';
export const asList=value=>Array.isArray(value)?value:value==null?[]:[value];

export function parseFirstJsonValue(value){
 const input=String(value||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
 for(let start=0;start<input.length;start++){
  if(input[start]!=='{'&&input[start]!=='[')continue;
  const stack=[];let inString=false,escaped=false;
  for(let index=start;index<input.length;index++){
   const char=input[index];
   if(inString){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')inString=false;continue;}
   if(char==='"'){inString=true;continue;}
   if(char==='{'||char==='[')stack.push(char);
   else if(char==='}'||char===']'){
    const open=stack.at(-1);if((open==='{'&&char!=='}')||(open==='['&&char!==']'))break;stack.pop();
    if(!stack.length){const candidate=input.slice(start,index+1);try{return JSON.parse(candidate);}catch(_){break;}}
   }
  }
 }
 throw Error('No complete JSON value in model response');
}
export const parseFirstJsonObject=parseFirstJsonValue;

export function aliasCodec(ids,{prefix='s',width=4}={}){
 const encode=new Map(),decode=new Map();
 [...new Set(ids.map(String))].forEach((id,index)=>{const alias=prefix+String(index+1).padStart(width,'0');encode.set(id,alias);decode.set(alias,id);});
 return{encode:id=>encode.get(String(id)),decode:alias=>decode.get(String(alias)),entries:()=>[...encode],restore(value,key=''){
  if(Array.isArray(value))return value.map(item=>this.restore(item,key));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([childKey,childValue])=>[childKey,this.restore(childValue,childKey)]));
  if(typeof value!=='string')return value;
  if(decode.has(value)&&(key==='source_id'||key==='source_ids'||key.endsWith('_source_id')||key.endsWith('_source_ids')))return decode.get(value);
  if(key==='attachment_ids'){const at=value.indexOf('|'),head=value.slice(0,at);if(at>0&&decode.has(head))return decode.get(head)+value.slice(at);}
  return value;
 }};
}

export function packByBudget(items,{maxItems=4,maxChars=30000,getId=item=>item.id,getText=item=>JSON.stringify(item)}={}){
 const packs=[];let current=[],chars=0;
 for(const item of items){const size=[...text(getText(item))].length;if(current.length&&(current.length>=maxItems||chars+size>maxChars)){packs.push({id:'pack-'+String(packs.length+1).padStart(3,'0'),item_ids:current.map(getId),items:current,chars});current=[];chars=0;}current.push(item);chars+=size;}
 if(current.length)packs.push({id:'pack-'+String(packs.length+1).padStart(3,'0'),item_ids:current.map(getId),items:current,chars});
 return packs;
}

const evidenceText=value=>typeof value==='string'?value:value?.quote||value?.text||'';
const foldEvidenceChar=value=>({"\u2018":"'","\u2019":"'","\u201c":"\"","\u201d":"\"","\u00a0":' '}[value]||value);
function foldedWithMap(value){
 let folded='',lastSpace=false;const starts=[],ends=[];
 for(let index=0;index<value.length;index++){
  const char=foldEvidenceChar(value[index]),space=/\s/.test(char);
  if(space&&lastSpace){ends[ends.length-1]=index+1;continue;}
  folded+=space?' ':char;starts.push(index);ends.push(index+1);lastSpace=space;
 }
 return{folded,starts,ends};
}
function exactEvidenceSlice(source,candidate){
 const direct=source.indexOf(candidate);if(direct>=0)return source.slice(direct,direct+candidate.length);
 const haystack=foldedWithMap(source),needle=foldedWithMap(candidate).folded.trim();if(!needle)return null;
 const index=haystack.folded.indexOf(needle);if(index<0)return null;
 return source.slice(haystack.starts[index],haystack.ends[index+needle.length-1]);
}
function evidenceFragments(value){
 const raw=evidenceText(value).trim();if(!raw)return[];
 const quoted=[...raw.matchAll(/["'\u2018\u2019\u201c\u201d]([^"'\u2018\u2019\u201c\u201d]{2,})["'\u2018\u2019\u201c\u201d]/g)].map(match=>match[1]);
 const split=raw.split(/\s*;\s*|\s*\|\s*/).map(part=>part.replace(/^["'\u2018\u2019\u201c\u201d]+|["'\u2018\u2019\u201c\u201d]+$/g,'').trim());
 return[...new Set([raw,...quoted,...split].filter(Boolean))];
}
function directionScore(quote,stance){
 const patterns={bullish:/\b(bullish|long|buy|upside|not selling|best positioned|benefit|higher)\b/i,bearish:/\b(bearish|short|avoid|not a buy|never a buy|downside|trend lower)\b/i,none:/.*/};
 return(patterns[stance]||patterns.none).test(quote)?10000:0;
}
export function recoverExactEvidence({rawEvidence,sourceIds,sourceMap,stance='none'}={}){
 const preferred=typeof rawEvidence==='object'&&rawEvidence?.source_id!=null?String(rawEvidence.source_id):null;
 const ids=[...new Set([preferred,...asList(sourceIds).map(String)].filter(Boolean))],matches=[];
 for(const sourceId of ids){const source=sourceMap.get(sourceId),body=text(source?.text??source?.full_text);if(!body)continue;for(const fragment of evidenceFragments(rawEvidence)){const quote=exactEvidenceSlice(body,fragment);if(quote)matches.push({source_id:sourceId,quote,score:directionScore(quote,stance)+quote.length});}}
 matches.sort((a,b)=>b.score-a.score||ids.indexOf(a.source_id)-ids.indexOf(b.source_id));
 if(!matches.length)throw Error('exact_evidence_not_recoverable');
 return{source_id:matches[0].source_id,quote:matches[0].quote};
}

const firstSentence=value=>String(value||'').trim().split(/(?<=[.!?])\s+/)[0];
const validAxes=new Set(['fundamentals','demand','supply','valuation','risk_reward','execution','capital_allocation','financing','competition','regulation','product','customer_adoption']);
const validFamilies=new Set(['company_state','beneficiary','downside','conditional_upside','risk_reward','valuation','execution_dependency','relative_preference','supported_by','turnaround','direct_source_label']);
const axisAliases={valuation_dependence:'valuation',relative_preference:'risk_reward',operating_trajectory:'fundamentals',competitive_position:'competition',demand_beneficiary:'demand',risk_classification:'risk_reward',condition:'risk_reward',forecast_revision:'fundamentals'};
export const canonicalJudgmentAxis=value=>validAxes.has(value)?value:axisAliases[value]||'fundamentals';
export function canonicalOpeningFamily(value,axis){if(validFamilies.has(value))return value;return({demand:'beneficiary',supply:'supported_by',valuation:'valuation',risk_reward:'risk_reward',execution:'execution_dependency',capital_allocation:'supported_by',financing:'supported_by',competition:'company_state',regulation:'conditional_upside',product:'beneficiary',customer_adoption:'beneficiary',fundamentals:'company_state'})[canonicalJudgmentAxis(axis)]||'company_state';}
export function normalizeOpeningPlan({opening={},prose,tickerStances,languagePlan={},subject,canonicalTicker=value=>value}={}){
 const first=firstSentence(prose),provided=opening.mechanism_clause||opening.mechanism_span;
 let mechanism=provided&&first.includes(provided)?provided:null;
 if(!mechanism){const match=first.match(/\bbecause\b.*$/i)||first.match(/\b(as|while|since|given|after|with|if|although|from|despite|but)\b.*$/i);mechanism=match?.[0]?.replace(/[.!?]$/,'')||provided;}
 const at=mechanism?first.indexOf(mechanism):-1,stanceClause=at>0?first.slice(0,at).trim():opening.stance_clause||opening.direction_span||opening.judgment_span;
 const rows=asList(tickerStances),uniform=rows.length&&rows.every(row=>row.stance===rows[0].stance)?rows[0].stance:'none';
 const axis=canonicalJudgmentAxis(languagePlan.judgment_axis||opening.judgment_axis),family=canonicalOpeningFamily(languagePlan.surface_family||opening.opening_family||opening.surface_family,axis);
 return{...opening,version:opening.version||opening.schema||'source-backed-opening/1.4',subject:opening.subject||subject,stance:opening.stance||uniform,judgment_axis:axis,directional_state:opening.directional_state||stanceClause,mechanism:opening.mechanism||mechanism,stance_clause:stanceClause,mechanism_clause:mechanism,stance_realizations:rows.map(row=>({ticker:canonicalTicker(row.ticker),stance:row.stance,text_span:stanceClause})),mechanism_location:'same_sentence',opening_family:family};
}

export function salvageById({expectedIds,rows,idOf=row=>row.id,normalize=row=>row,validate=()=>{}}){
 const expected=new Set(expectedIds.map(String)),accepted=new Map(),errors=[];
 for(const raw of asList(rows)){
  const id=String(idOf(raw)||'');if(!expected.has(id)){errors.push({id,error:'unexpected_or_missing_id'});continue;}if(accepted.has(id)){errors.push({id,error:'duplicate_id'});continue;}
  try{const value=normalize(raw,id);validate(value,id);accepted.set(id,value);}catch(error){errors.push({id,error:error.message});}
 }
 for(const id of expected)if(!accepted.has(id)&&!errors.some(row=>row.id===id))errors.push({id,error:'missing_output'});
 return{accepted:[...accepted.values()],failed_ids:[...new Set(errors.map(row=>row.id).filter(expected.has.bind(expected)))],errors};
}
