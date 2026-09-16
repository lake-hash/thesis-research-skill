import crypto from 'node:crypto';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const filled=v=>typeof v==='string'&&v.trim();
export function validateDocumentEvidence(packet,check,baseline){
 const docs=new Map();
 if(packet.documents!==undefined)check(Array.isArray(packet.documents),'documents must be an array');
 for(const d of Array.isArray(packet.documents)?packet.documents:[]){
  if(!d||typeof d!=='object'){check(false,'Invalid source document');continue;}
  check(filled(d.id)&&!docs.has(d.id),'Duplicate or missing document ID');docs.set(d.id,d);
  check(typeof d.text==='string'&&d.text_sha256===hash(d.text),'Document text/hash mismatch '+d.id);
  check(d.hash_scope==='document_text'&&filled(d.extraction_version)&&filled(d.archive_path),'Document needs explicit hash scope, extraction version and archive path '+d.id);
  try{check(new URL(d.url).protocol==='https:','Document URL must be HTTPS '+d.id);}catch{check(false,'Invalid document URL '+d.id);}
 }
 for(const s of packet.sources||[]){
  if(!s?.document_ref)continue;
  const r=s.document_ref,d=docs.get(r.document_id),label='Source '+s.id;
  check(typeof s.text==='string'&&s.text_sha256===hash(s.text),label+' source hash must match its own text, not the parent document');
  check(!!d,label+' refers to an unknown document');
  check(['excerpt','document'].includes(s.text_scope),label+' needs explicit source text scope');
  const range=Number.isSafeInteger(r.start_char)&&Number.isSafeInteger(r.end_char)&&r.start_char>=0&&r.end_char>r.start_char&&typeof d?.text==='string'&&r.end_char<=d.text.length;
  check(range&&filled(r.locator),label+' needs an exact document span and locator');
  check(range&&d.text.slice(r.start_char,r.end_char)===s.text,label+' excerpt differs from its document span');
  if(s.text_scope==='document')check(r.start_char===0&&r.end_char===d?.text?.length,label+' full-document scope cannot refer to a partial excerpt');
 }
 for(const old of baseline?.documents||[]){const current=docs.get(old.id);check(!!current&&JSON.stringify(current)===JSON.stringify(old),'Prior document revision changed; retain it under its original ID '+old.id);}
 const currentSources=new Map((packet.sources||[]).filter(Boolean).map(s=>[s.id,s]));
 for(const old of baseline?.sources||[])if(old.document_ref){const current=currentSources.get(old.id);check(JSON.stringify(current?.document_ref)===JSON.stringify(old.document_ref)&&current?.text_scope===old.text_scope,'Prior document locator/scope changed '+old.id);}
}
