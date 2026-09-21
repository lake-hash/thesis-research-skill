import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validatePacket} from './validate-packet.mjs';
import {validateObjectGrouping} from './run-review-contract.mjs';
import {canonicalCompanyConflicts} from './canonical-company-history.mjs';

const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export function sharedBatchSourceIdentity(source){
 const {locator,window_source,context_for_source_ids,...shared}=source||{};
 return canonical(shared);
}
export function sameBatchSourceIdentity(left,right){return JSON.stringify(sharedBatchSourceIdentity(left))===JSON.stringify(sharedBatchSourceIdentity(right));}

export function validateBatch(packets, catalog, overlapReviews = []) {
  const errors = [];
  const check = (ok, message) => { if (!ok) errors.push(message); };
  if (!Array.isArray(packets) || !packets.length || !packets.every(p => p && typeof p === 'object') || !catalog || !Array.isArray(catalog.records)
    || !Array.isArray(catalog.pending) || typeof catalog.revision !== 'string' || !catalog.revision.trim()) {
    return {ok:false,errors:['Batch needs packets and a versioned catalog with records and pending arrays']};
  }
  if (![...catalog.records,...catalog.pending].every(r => r && typeof r.id === 'string' && typeof r.author_id === 'string'))
    return {ok:false,errors:['Malformed active/pending catalog entry']};
  const byId = new Map(), sources = new Map(),canonicalAliases=[];
  canonicalAliases.push(...(catalog.canonical_company_aliases||catalog.canonical_object_aliases||[]));
  for (const source of [...(catalog.sources || []), ...packets.flatMap(p => p?.sources || [])]) {
    const previous = sources.get(source.id);
    check(!previous || sameBatchSourceIdentity(previous,source), 'Conflicting source identity across batch/catalog: ' + source.id);
    sources.set(source.id, source);
  }
  for (const record of [...catalog.records, ...catalog.pending]) {
    check(!byId.has(record.id), 'Duplicate catalog record identity: ' + record.id);
    // Resolved pending objects also participate in matching; this does not approve their content.
    if (!record.superseded_by && record.object_key) byId.set(record.id, {...record,review:{status:'approved'}});
  }
  const newIds = new Set();
  for (const packet of packets) {
    canonicalAliases.push(...(packet.canonical_company_aliases||packet.canonical_object_aliases||[]));
    const validation = validatePacket(packet, {requireHistoryCoverage:true,requireGenerationContract:true,
      requireProseLimit:true,requireRunReview:true});
    errors.push(...validation.errors.map(e => packet.subject_id + ': ' + e));
    check(packet.catalog_review?.revision === catalog.revision, 'Catalog revision differs from reviewed batch: ' + packet.subject_id);
    for (const [kind, field] of [['records','record_ids'],['pending','pending_ids']]) {
      for (const record of catalog[kind].filter(r => r.author_id === packet.subject_id && !r.superseded_by))
        check(packet.catalog_review?.[field]?.includes(record.id), 'Catalog match review omitted ' + record.id);
    }
    for (const record of packet.records || []) {
      if (record.superseded_by || record.review?.status !== 'approved' || record.type === 'context') continue;
      check(!newIds.has(record.id), 'Same active record delivered in multiple packets: ' + record.id);
      newIds.add(record.id);
      const prior = byId.get(record.id);
      check(!prior || (prior.author_id === record.author_id && prior.object_key === record.object_key),
        'Existing record identity changed without reconciliation: ' + record.id);
      if (packets.length > 1) check(record.signals_review?.searches?.some(s => s.scope === 'current_batch' && s.query?.trim() && s.result?.trim()),
        'Signals search must also cover the current batch: ' + record.id);
      byId.set(record.id, record);
    }
  }
  // Scope checks to pairs affected by this batch; pre-existing unrelated defects do not block a new author.
  const all = [...byId.values()];
  for(const issue of canonicalCompanyConflicts(all,canonicalAliases).issues)check(false,issue);
  const reviews = [...overlapReviews, ...packets.flatMap(p => p.object_overlap_reviews || [])];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    if (newIds.has(all[i].id) || newIds.has(all[j].id)) validateObjectGrouping([all[i], all[j]], reviews, sources, check,canonicalAliases);
  }
  return {ok:errors.length === 0,errors,counts:{packets:packets.length,active_records:newIds.size},
    limitations:['The catalog index must faithfully reflect active and pending storage. Structural checks do not verify source meaning or search completeness.']};
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  try {
    const file = process.argv[2];
    if (!file) throw Error('Usage: validate-batch.mjs batch.json');
    const spec = JSON.parse(fs.readFileSync(file)), base = path.dirname(path.resolve(file));
    const read = file => JSON.parse(fs.readFileSync(path.resolve(base, file)));
    const result = validateBatch(spec.packets.map(read), read(spec.catalog), spec.object_overlap_reviews || []);
    console.log(JSON.stringify(result,null,2)); process.exitCode = result.ok ? 0 : 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
