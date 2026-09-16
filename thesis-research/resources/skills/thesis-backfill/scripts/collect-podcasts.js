(async()=>{
 const http=require('net/http'),args=require('env').args||{},secret=require('secret-manager');
 if(!args.speaker&&!args.podcast_show_id&&!args.podcast_show_name)throw Error('Provide a speaker name or verified show');
 const integer=(value,fallback,min,max)=>{const n=value===undefined?fallback:value;if(!Number.isSafeInteger(n)||n<min||n>max)throw Error('Invalid pagination argument');return n;};
 const limit=integer(args.limit,2,1,5),pages=integer(args.max_pages,3,1,20);
 let offset=integer(args.offset,0,0,Number.MAX_SAFE_INTEGER),stop='page_budget',previousDate=null;const episodes=[],seen=new Set(),requests=[],failures=[];
 const validDay=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 for(const key of ['start_date','end_date','date'])if(args[key]!==undefined&&!validDay(args[key]))throw Error('Invalid '+key);
 if(args.start_date&&args.end_date&&args.start_date>args.end_date)throw Error('Inverted date window');
 const token=secret.loadPlaintext('ARRAYS_JWT');
 for(let page=0;page<pages;page++){
  const params={limit,offset};for(const k of ['speaker','podcast_show_id','podcast_show_name','date'])if(args[k]!==undefined)params[k]=args[k];
  const url='https://data-tools.prd.space.id/api/v1/other/podcast/transcripts?'+Object.entries(params).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&');
  let body;
  try{
   const response=await http.fetch(url,{headers:{Authorization:'Bearer '+token}});body=await response.json();
   if(!response.ok||!body.success||!Array.isArray(body.data))throw Error('Transcript request failed: '+JSON.stringify(body.error));
   let date=previousDate;const ids=new Set();
   for(const episode of body.data){
    if(episode.id===undefined||!episode.episode_id||!validDay(episode.date))throw Error('Malformed episode identity/date');
    if(date!==null&&episode.date>date)throw Error('Transcript order changed; cannot prove window closure');date=episode.date;
    const id=String(episode.id);if(seen.has(id)||ids.has(id))throw Error('Repeated episode across pages; archive changed or pagination stalled');ids.add(id);
   }
  }catch(error){failures.push({offset,message:error.message});stop='request_failed';break;}
  requests.push({offset,returned:body.data.length});
  for(const episode of body.data){
   previousDate=episode.date;seen.add(String(episode.id));
   if((!args.start_date||episode.date>=args.start_date)&&(!args.end_date||episode.date<=args.end_date))episodes.push(episode);
  }
  offset+=body.data.length;
  if(body.data.length<limit){stop='index_exhausted';break;}
  if(args.start_date&&body.data.every(e=>e.date<args.start_date)){stop='past_window';break;}
 }
 const shows=[];
 for(const id of [...new Set(episodes.map(e=>e.podcast_show_id))]){
  try{const r=await http.fetch('https://data-tools.prd.space.id/api/v1/other/podcast/shows?podcast_show_id='+encodeURIComponent(id)+'&limit=1',{headers:{Authorization:'Bearer '+token}}),j=await r.json();
   shows.push({podcast_show_id:id,success:r.ok&&j.success,data:j.data||[],error:j.error||null});
  }catch(error){shows.push({podcast_show_id:id,success:false,data:[],error:error.message});}
 }
 return {schema_version:'podcast-collection/1.0',query:{speaker:args.speaker||null,podcast_show_id:args.podcast_show_id||null,podcast_show_name:args.podcast_show_name||null,start_date:args.start_date||null,end_date:args.end_date||null},
  episodes,shows,requests,failures,continuation:{next_offset:offset,stop_reason:stop,complete_in_index_window:['index_exhausted','past_window'].includes(stop)},
  limitations:['Indexed transcripts only; not all public appearances.','Speaker matches still require identity, presence and attribution review.','Publication day is not the recording date; playback URLs require publisher metadata.']};
})();
