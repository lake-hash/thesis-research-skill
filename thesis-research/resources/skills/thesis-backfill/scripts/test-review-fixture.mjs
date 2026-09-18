// Synthetic test data only. Never import this helper from a production workflow.
import {REVIEW_CONTRACT,reviewInputHash} from './run-review-contract.mjs';
import {STANCE_OPENING_CONTRACT} from './stance-opening-contract.mjs';
import {publicTickerStances} from './ticker-stance-contract.mjs';

export function reviewedFixture(input) {
  const packet = structuredClone(input);
  packet.generation_policy.prose_max_chars = 500;
  packet.generation_policy.review_contract = REVIEW_CONTRACT;
  packet.catalog_review = {revision:'synthetic-catalog-v1',checked_at:'2026-09-11T12:00:00Z',
    scope:'active_and_pending',record_ids:[],pending_ids:[],reason:'Synthetic empty external catalog.'};
  const sources = new Map(packet.sources.map(s => [s.id,s]));
  const evidence = ids => ids.map(id => ({source_id:id,quote:sources.get(id).text,
    explanation:'Synthetic passage used to exercise review integrity, not semantic accuracy.'}));
  for (const record of packet.records.filter(r => !r.superseded_by && r.type !== 'context')) {
    record.signals_review = {status:'complete',searched_at:'2026-09-11T12:00:00Z',
      catalog_revision:packet.catalog_review.revision,reason:'No outside view in this synthetic fixture.',
      searches:[{scope:'existing_catalog',query:record.object_key,result:'No other-author candidates.'}],candidates:[]};
    const events = packet.records.filter(r => r.id === record.id || r.superseded_by === record.id).flatMap(r => r.events);
    record.source_first_review = {version:REVIEW_CONTRACT,reviewer:'Synthetic fixture reviewer',
      method:'source_first',reviewed_at:'2026-09-11T12:00:00Z',
      reader:{decision:'clear',reason:'Synthetic reader assessment.',conclusion_first:true,
        opening_conclusion:'Synthetic company conclusion.',opening_reason:'Synthetic decisive reason.',
        ...packet.generation_policy.opening_contract===STANCE_OPENING_CONTRACT?{opening:{contract:STANCE_OPENING_CONTRACT,opening_family:record.opening_plan.opening_family,judgment_axis:record.opening_plan.judgment_axis,stance_clause:record.opening_plan.stance_clause,mechanism_clause:record.opening_plan.mechanism_clause,stance_realizations:record.opening_plan.stance_realizations,specific_directional_state:true,mechanism_visible_early:true,professional_voice:true,natural_collocation:true,non_tautological:true,non_template:true,relationship_complete:true,continuation_advances:true,metadata_hidden_direction_clear:true}}:{}},
      ticker_stances:publicTickerStances(record.ticker_stances),
      claim_reviews:(record.card_claims||[]).map(c => ({claim_id:c.id,decision:'supported',
        reconstructed_meaning:'Synthetic reconstruction for this fixture claim.',
        evidence:c.evidence.map(e => ({source_id:e.source_id,quote:e.quote,explanation:'Synthetic support assessment.'}))})),
      event_reviews:events.map(e => {const timeline=record.timeline_review?.find(r => r.event_id === e.id);return {event_id:e.id,
        decision:timeline?.disposition,
        reconstructed_meaning:'Synthetic contemporaneous statement.',reason:'Synthetic increment/disposition review.',content_domain:'fundamental',what:timeline?.what||'Synthetic company direction.',why:timeline?.why||'Synthetic source-backed mechanism.',
        what_evidence:evidence(e.source_ids),why_evidence:evidence(e.source_ids),ticker_stances:publicTickerStances(e.ticker_stances),
        ...(timeline?.disposition==='update'?{timeline_opening_contract:timeline.timeline_opening_contract,stance_clause:timeline.stance_clause,mechanism_clause:timeline.mechanism_clause,stance_realizations:timeline.stance_realizations,metadata_hidden_direction_clear:true}:{}),
        evidence:evidence(e.source_ids)}})};
  }
  for (const record of packet.records.filter(r => r.source_first_review)) record.source_first_review.input_sha256 = reviewInputHash(packet,record);
  return packet;
}
