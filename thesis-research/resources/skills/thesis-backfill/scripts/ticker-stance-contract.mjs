export const TICKER_STANCE_CONTRACT='per-expression-ticker-stance/1.0';
export const TICKER_STANCES=new Set(['bullish','bearish','none']);

const list=value=>Array.isArray(value)?value:[];
const text=value=>typeof value==='string'&&value.trim().length>0;
const normalizedTicker=value=>String(value||'').trim().toUpperCase();
const sorted=value=>[...value].sort((a,b)=>a.localeCompare(b));

export const publicTickersFromBindings=bindings=>[...new Set(list(bindings)
 .filter(binding=>binding&&['primary','vehicle'].includes(binding.role)&&text(binding.symbol))
 .map(binding=>normalizedTicker(binding.symbol)))];

export const publicTickerStances=tickerStances=>list(tickerStances).map(item=>({
 ticker:normalizedTicker(item?.ticker),stance:item?.stance
}));

export function tickerStanceIssues({tickerStances,tickers,sources,allowedSourceIds,requireEvidence=true}={}){
 const issues=[],expected=sorted(new Set(list(tickers).map(normalizedTicker).filter(Boolean))),seen=new Set(),actual=[];
 if(expected.length===0)issues.push('expression needs at least one ticker');
 if(!Array.isArray(tickerStances)||tickerStances.length===0)return [...issues,'expression needs one source-backed stance per ticker'];
 const allowed=new Set(list(allowedSourceIds));
 for(const item of tickerStances){
  const ticker=normalizedTicker(item?.ticker),label=ticker||'<missing ticker>';
  if(!ticker)issues.push('ticker stance is missing its ticker');
  if(seen.has(ticker))issues.push('ticker stance repeats '+label);seen.add(ticker);if(ticker)actual.push(ticker);
  if(!TICKER_STANCES.has(item?.stance))issues.push('ticker stance for '+label+' must be bullish, bearish or none');
  if(!requireEvidence)continue;
  if(!Array.isArray(item?.evidence)||item.evidence.length===0){issues.push('ticker stance for '+label+' needs exact source evidence');continue;}
  for(const evidence of item.evidence){
   const source=sources?.get?.(evidence?.source_id);
   if(allowed.size&&!allowed.has(evidence?.source_id))issues.push('ticker stance for '+label+' uses evidence outside the expression sources');
   if(!source)issues.push('ticker stance for '+label+' has unknown source evidence');
   if(!text(evidence?.quote)||!source?.text?.includes(evidence.quote))issues.push('ticker stance for '+label+' needs an exact source quote');
   if(!text(evidence?.explanation))issues.push('ticker stance for '+label+' needs a support explanation');
  }
 }
 if(JSON.stringify(sorted(new Set(actual)))!==JSON.stringify(expected))issues.push('ticker stances must exactly match the expression ticker set');
 return [...new Set(issues)];
}
