// Synthetic test data only. Never import this helper from a production workflow.
import {REVIEW_CONTRACT,reviewInputHash} from './run-review-contract.mjs';

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
        opening_conclusion:'Synthetic company conclusion.',opening_reason:'Synthetic decisive reason.'},
      claim_reviews:(record.card_claims||[]).map(c => ({claim_id:c.id,decision:'supported',
        reconstructed_meaning:'Synthetic reconstruction for this fixture claim.',
        evidence:c.evidence.map(e => ({source_id:e.source_id,quote:e.quote,explanation:'Synthetic support assessment.'}))})),
      event_reviews:events.map(e => ({event_id:e.id,
        decision:record.timeline_review?.find(r => r.event_id === e.id)?.disposition,
        reconstructed_meaning:'Synthetic contemporaneous statement.',reason:'Synthetic increment/disposition review.',content_domain:'fundamental',
        evidence:evidence(e.source_ids)}))};
  }
  for (const record of packet.records.filter(r => r.source_first_review)) record.source_first_review.input_sha256 = reviewInputHash(packet,record);
  return packet;
}
