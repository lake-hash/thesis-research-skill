import crypto from 'node:crypto';
import {THESIS_POLICY} from '../../references/thesis-policy.mjs';
import {openingChainIssues,timelineOpeningIssues,STANCE_OPENING_CONTRACT,TIMELINE_OPENING_CONTRACT} from './stance-opening-contract.mjs';
import {publicTickersFromBindings,publicTickerStances,tickerStanceIssues} from './ticker-stance-contract.mjs';
import {canonicalCompanyConflicts,resolveCanonicalCompany,compileCanonicalCompanyAliases} from './canonical-company-history.mjs';

const list = v => Array.isArray(v) ? v : [];
const text = v => typeof v === 'string' && v.trim().length > 0;
const dated = v => text(v) && Number.isFinite(Date.parse(v));
const canonical = v => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canonical(v[k])])) : v;
const hash = v => crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
export const REVIEW_CONTRACT = THESIS_POLICY.reviewContract;

function members(packet, record) {
  const records = list(packet.records), byId = new Map(records.map(r => [r.id, r]));
  return records.filter(r => {
    const seen = new Set();
    while (r?.superseded_by && !seen.has(r.id)) { seen.add(r.id); r = byId.get(r.superseded_by); }
    return r?.id === record.id;
  });
}

// Integrity only: calculating this digest does not review or approve the content.
export function reviewInputHash(packet, record) {
  const history = members(packet, record).map(r => {
    const {source_first_review, ...content} = r;
    return content;
  });
  return hash({subject_id: packet.subject_id, as_of: packet.as_of,
    generation_policy:packet.generation_policy,
    catalog_review: packet.catalog_review, history, sources: packet.sources,
    object_overlap_reviews: packet.object_overlap_reviews || []});
}

const bindingKeys = r => new Set(list(r.asset_bindings)
  .filter(b => ['primary', 'vehicle'].includes(b.role))
  .flatMap(b => [b.entity_key && 'entity:' + b.entity_key,
    b.market && b.symbol && 'security:' + b.market + ':' + b.symbol.toUpperCase()].filter(Boolean)));

// Also used on a batch/global index. Identity resolution is still an agent duty.
export function validateObjectGrouping(records, overlapReviews, sources, check, aliasCatalog={}) {
  const active = list(records).filter(r => r && !r.superseded_by && r.type !== 'context'
    && r.review?.status === 'approved');
  const canonicalCatalog=compileCanonicalCompanyAliases(aliasCatalog);
  for(const issue of canonicalCompanyConflicts(active,canonicalCatalog).issues)check(false,issue);
  for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
    const a = active[i], b = active[j];
    if (a.author_id !== b.author_id) continue;
    const label = 'Object grouping ' + a.id + '/' + b.id;
    if (text(a.object_key) && a.object_key === b.object_key) {
      check(false, label + ' duplicates author/investment object; merge trading episodes');
      continue;
    }
    const ac=resolveCanonicalCompany(a,canonicalCatalog),bc=resolveCanonicalCompany(b,canonicalCatalog);
    if(ac.canonical_key&&ac.canonical_key===bc.canonical_key)continue;
    const ak = bindingKeys(a), bk = bindingKeys(b);
    if (![...ak].some(k => bk.has(k))) continue;
    if (![a, b].some(r => r.object_type === 'basket')) {
      check(false, label + ' duplicates an investment identity under another object key/type');
      continue;
    }
    const review = list(overlapReviews).find(r => list(r.record_ids).length === 2
      && r.record_ids.includes(a.id) && r.record_ids.includes(b.id));
    check(review?.decision === 'distinct_strategy' && text(review.reason),
      label + ' overlapping basket needs an explicit distinct-strategy review');
    for (const basket of [a, b].filter(r => r.object_type === 'basket')) {
      const bindings = list(basket.asset_bindings).filter(b => ['primary', 'vehicle'].includes(b.role));
      const identities = new Set(bindings.map(b => b.entity_key || (b.market + ':' + b.symbol)));
      check(identities.size >= 2, label + ' basket needs multiple actual investment objects, not related ticker tags');
      const evidence = list(review?.evidence).filter(e => e.record_id === basket.id);
      check(evidence.length > 0, label + ' basket needs evidence for its distinct strategy');
      for (const e of evidence) {
        const source = sources.get(e.source_id);
        check(source?.author_ids?.includes(basket.author_id) && text(e.quote)
          && source.text?.includes(e.quote) && text(e.explanation),
        label + ' strategy evidence must be an exact author-owned passage with explanation');
      }
    }
  }
}

export function validateRunReview(packet, check) {
  check(packet.generation_policy?.review_contract === REVIEW_CONTRACT,
    'Current generation requires review_contract: ' + REVIEW_CONTRACT);
  const catalog = packet.catalog_review;
  check(text(catalog?.revision) && dated(catalog?.checked_at)
    && catalog?.scope === 'active_and_pending' && Array.isArray(catalog.record_ids)
    && Array.isArray(catalog.pending_ids) && text(catalog.reason),
  'Current run needs a catalog_review covering active records and pending candidates');
  const sources = new Map(list(packet.sources).map(s => [s.id, s]));
  for (const record of list(packet.records).filter(r => r && !r.superseded_by
    && r.type !== 'context' && r.review?.status === 'approved')) {
    const label = 'Source-first review ' + record.id, review = record.source_first_review;
    check(review?.version === REVIEW_CONTRACT && text(review.reviewer)
      && review.method === 'source_first' && dated(review.reviewed_at), label + ' is missing');
    check(review?.input_sha256 === reviewInputHash(packet, record), label + ' is stale or missing; read and review changed content again');
    check(review?.reader?.decision === 'clear' && text(review?.reader?.reason), label + ' needs a reader-only assessment');
    check(review?.reader?.conclusion_first === true && text(review?.reader?.opening_conclusion)
      && text(review?.reader?.opening_reason), label + ' needs a conclusion-first opening review');
    if(packet.generation_policy?.opening_contract===STANCE_OPENING_CONTRACT){
      const opening=review?.reader?.opening;
      check(opening?.contract===STANCE_OPENING_CONTRACT&&opening?.opening_family===record.opening_plan?.opening_family
        &&opening?.judgment_axis===record.opening_plan?.judgment_axis&&opening?.specific_directional_state===true
        &&opening?.mechanism_visible_early===true&&opening?.professional_voice===true
        &&opening?.natural_collocation===true&&opening?.non_tautological===true&&opening?.non_template===true
        &&opening?.relationship_complete===true&&opening?.continuation_advances===true
        &&opening?.metadata_hidden_direction_clear===true
        &&opening?.stance_clause===record.opening_plan?.stance_clause
        &&opening?.mechanism_clause===record.opening_plan?.mechanism_clause
        &&JSON.stringify(opening?.stance_realizations)===JSON.stringify(record.opening_plan?.stance_realizations),
      label+' needs a complete professional stance-opening review');
      for(const issue of openingChainIssues({stanceSentence:record.stance_sentence,body:record.description,subject:record.opening_plan?.subject,openingPlan:record.opening_plan,tickerStances:record.ticker_stances}))check(false,label+' '+issue);
    }
    const exactEvidence = (evidence, allowed, context) => {
      check(list(evidence).length > 0, context + ' needs reviewed evidence');
      for (const e of list(evidence)) {
        const source = sources.get(e.source_id);
        check(allowed.includes(e.source_id) && text(e.quote) && source?.text?.includes(e.quote)
          && text(e.explanation), context + ' needs exact evidence and a support explanation');
      }
    };
    if(packet.generation_policy?.version==='3.2'){
      for(const issue of tickerStanceIssues({tickerStances:review?.ticker_stances,tickers:publicTickersFromBindings(record.asset_bindings),requireEvidence:false}))check(false,label+' '+issue);
      check(JSON.stringify(publicTickerStances(review?.ticker_stances))===JSON.stringify(publicTickerStances(record.ticker_stances)),label+' reviewed card ticker stances differ from the source-bound record');
    }
    const claims = list(record.card_claims), reviews = list(review?.claim_reviews);
    check(reviews.length === claims.length && new Set(reviews.map(r => r.claim_id)).size === reviews.length,
      label + ' needs one semantic review per finished claim');
    for (const claim of claims) {
      const r = reviews.find(r => r.claim_id === claim.id);
      check(r?.decision === 'supported' && text(r.reconstructed_meaning), label + ' missing supported meaning for ' + claim.id);
      exactEvidence(r?.evidence, list(claim.evidence).map(e => e.source_id), label + ' claim ' + claim.id);
      for (const e of list(claim.evidence)) check(list(r?.evidence).some(x => x.source_id === e.source_id && x.quote === e.quote),
        label + ' claim evidence was not semantically reviewed: ' + claim.id);
    }
    const events = members(packet, record).flatMap(r => list(r.events));
    const eventReviews = list(review?.event_reviews);
    check(eventReviews.length === events.length && new Set(eventReviews.map(r => r.event_id)).size === eventReviews.length,
      label + ' needs a review of every retained, suppressed and held event');
    for (const event of events) {
      const r = eventReviews.find(r => r.event_id === event.id);
      const disposition = list(record.timeline_review).find(r => r.event_id === event.id)?.disposition;
      check(r?.decision === disposition && text(r?.reconstructed_meaning) && text(r?.reason),
        label + ' missing contemporaneous event review ' + event.id);
      check(['fundamental','technical_only','mixed'].includes(r?.content_domain),label+' missing content-domain review '+event.id);
      if(packet.generation_policy?.public_scope==='fundamental_company_only/1.0'){
        if(r?.content_domain==='technical_only')check(r?.decision==='source_only',label+' technical-only event must remain private '+event.id);
        if(r?.decision==='update')check(r?.content_domain==='fundamental',label+' public update must be fundamental-only '+event.id);
      }
      if(packet.generation_policy?.version==='3.2'&&r?.decision==='update'){
        check(text(r.what)&&text(r.why),label+' event review needs explicit what and why '+event.id);
        exactEvidence(r?.what_evidence,[...list(event.source_ids),...list(event.context_source_ids)],label+' event what '+event.id);
        exactEvidence(r?.why_evidence,[...list(event.source_ids),...list(event.context_source_ids)],label+' event why '+event.id);
        check(['fundamental','mixed'].includes(r.content_domain),label+' technical-only event cannot be public '+event.id);
        if(r.content_domain==='mixed')check(text(r.non_technical_why),label+' mixed event needs an independently qualifying non-technical why '+event.id);
        for(const issue of tickerStanceIssues({tickerStances:r.ticker_stances,tickers:publicTickersFromBindings(event.asset_bindings),requireEvidence:false}))check(false,label+' event '+event.id+' '+issue);
        check(JSON.stringify(publicTickerStances(r.ticker_stances))===JSON.stringify(publicTickerStances(event.ticker_stances)),label+' event review ticker stances differ from the source-bound event '+event.id);
        check(r.timeline_opening_contract===TIMELINE_OPENING_CONTRACT&&r.metadata_hidden_direction_clear===true,label+' event needs a metadata-independent Timeline opening review '+event.id);
        for(const issue of timelineOpeningIssues({body:event.description,openingConclusion:r.what,openingReason:r.why,stanceClause:r.stance_clause,mechanismClause:r.mechanism_clause,stanceRealizations:r.stance_realizations,tickerStances:r.ticker_stances,sourceExplicitDirection:r.source_explicit_direction}))check(false,label+' event '+event.id+' '+issue);
      }
      exactEvidence(r?.evidence, [...list(event.source_ids), ...list(event.context_source_ids)], label + ' event ' + event.id);
    }
    const signals = record.signals_review;
    check(['complete', 'blocked'].includes(signals?.status) && dated(signals?.searched_at)
      && signals?.catalog_revision === catalog?.revision && text(signals?.reason),
    label + ' needs a dated Signals search result against the current catalog');
    check(list(signals?.searches).some(s => s.scope === 'existing_catalog' && text(s.query) && text(s.result)),
      label + ' must record the existing-catalog Signals search, even when none qualify');
    check(Array.isArray(signals?.candidates), label + ' needs Signals candidate decisions (empty only after search)');
    const included = new Set();
    for (const candidate of list(signals?.candidates)) {
      check(candidate.author_id !== record.author_id && text(candidate.author_id)
        && ['include', 'exclude'].includes(candidate.decision) && text(candidate.reason)
        && list(candidate.source_urls).length > 0
        && candidate.source_urls.every(u => { try { return new URL(u).protocol === 'https:'; } catch { return false; } }),
      label + ' invalid Signals candidate evidence/decision');
      if (candidate.decision === 'include') {
        const signal = list(record.signals).find(s => s.id === candidate.signal_id);
        check(!!signal && signal.author_id === candidate.author_id && !included.has(candidate.signal_id),
          label + ' included Signals candidate must resolve to one stored outside view');
        if (signal) check(list(signal.source_ids).every(id => candidate.source_urls.includes(sources.get(id)?.url)),
          label + ' included Signal source differs from the reviewed candidate');
        included.add(candidate.signal_id);
      }
    }
    check(list(record.signals).every(s => included.has(s.id)), label + ' Signal lacks a reviewed candidate decision');
  }
}
