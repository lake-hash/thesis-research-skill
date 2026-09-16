(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./vendor/marked.cjs'):root.marked);
 if(typeof module==='object'&&module.exports)module.exports=api;else root.ThesisLinks=api;
})(typeof globalThis==='object'?globalThis:this,function(marked){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=url=>{try{const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password?u.href.replace(/[()]/g,c=>c==='('?'%28':'%29'):null;}catch{return null;}};
 function validLabel(label){return typeof label==='string'&&label.trim().length>0&&label.length<=90&&label.trim().split(/\s+/).length<=12&&
  !/[<>\n\r]|https?:|(?:www\.)|[↗→]/i.test(label)&&!/^source$|^original source$|^click here$|^read more$|^点击这里$|^[\w.-]+\.(?:com|org|ai|net)$/i.test(label.trim());}
 function split(body){
  body=String(body||'').trimEnd();const blocks=marked.lexer(body),last=blocks.filter(t=>t.type!=='space').at(-1);
  if(last?.type!=='paragraph')return {prose:body,links:[]};
  const tokens=last.tokens||[];let start=tokens.length,links=[];
  for(let i=tokens.length-1;i>=0;i--){const t=tokens[i];if(t.type==='link'){links.unshift({label:t.text,url:t.href});start=i;}
   else if(t.type==='text'&&!t.text.trim()&&links.length)start=i;else break;}
  if(!links.length)return {prose:body,links:[]};
  const raw=tokens.slice(start).map(t=>t.raw).join('');
  return {prose:body.slice(0,body.length-raw.length).trimEnd(),links};
 }
 function append(body,sources){
  const existing=split(body),links=[],seen=new Set();
  for(const s of sources){const u=safe(s.url),label=s.label||s.linkLabel||s.displayName;
   if(!u||!validLabel(label))throw Error('A verified original URL and short named link label are required');
   if(!seen.has(u)){seen.add(u);links.push({label:label.trim(),url:u});}}
  if(existing.links.some(l=>!seen.has(safe(l.url))))throw Error('Body contains an unverified source link');
  if(!existing.prose.trim())throw Error('Body needs prose, not links alone');
  return existing.prose+(links.length?'\n\n'+links.map(l=>'['+l.label.replace(/[\\\[\]]/g,'\\$&')+']('+l.url.replace(/[()]/g,c=>c==='('?'%28':'%29')+')').join(' '):'');
 }
 function render(body){
  const renderer=new marked.Renderer();
  renderer.html=({text})=>esc(text);
  renderer.link=function({href,tokens}){const u=safe(href),label=this.parser.parseInline(tokens);return u?`<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label}</a>`:label;};
  renderer.image=({text})=>esc(text);
  renderer.paragraph=function({tokens}){return `<p class="thesis-paragraph">${this.parser.parseInline(tokens)}</p>`;};
  renderer.heading=function({tokens}){return `<p class="thesis-paragraph">${this.parser.parseInline(tokens)}</p>`;};
  return marked.parse(String(body||''),{renderer,gfm:true,breaks:false});
 }
 function labelFor({url,author,label,kind,publisher}){
  const host=new URL(url).hostname;
  if(/^(www\.)?(x|twitter)\.com$/.test(host))return (author||'Referenced author')+' on X';
  if(host==='moninvestor.substack.com')return 'mon on Substack';
  if(/pershingsquareinc\.com$/.test(host))return 'Pershing Square shareholder letter';
  if(/pershingsquareholdings\.com$/.test(host))return 'Pershing Square interim report';
  if(/musicbusinessworldwide\.com$/.test(host)&&/PershingSquareLetter/.test(url))return 'Bill Ackman letter to UMG';
  if(publisher)return publisher+(kind==='podcast'?' Podcast':kind==='interview'?' interview':'');
  if(validLabel(label))return label;
  if(author&&kind)return author+' '+kind;
  throw Error('Generate a short author/channel/program/issuer link label');
 }
 return {split,append,render,safe,validLabel,labelFor};
});
