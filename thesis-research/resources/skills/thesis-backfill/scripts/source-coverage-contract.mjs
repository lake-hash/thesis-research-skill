export function sourceCoverageIssues(archive,{toleranceMs=24*60*60*1000}={}){
 const issues=[],end=Date.parse(archive?.requested_scope?.end),collected=Date.parse(archive?.coverage?.collected_at),latest=Date.parse(archive?.coverage?.latest),expected=Math.min(end,collected);
 if(Number.isFinite(expected)&&Number.isFinite(latest)&&expected-latest>toleranceMs&&!archive?.coverage?.gaps?.some(gap=>/upper bound|freshness|sync lag|not yet indexed/i.test(gap)))issues.push('Pagination exhausted without reaching the requested upper bound or recording an explicit freshness gap');
 return issues;
}
