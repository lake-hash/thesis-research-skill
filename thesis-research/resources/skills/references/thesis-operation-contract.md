# Thesis Operation Contract 2.1

New preparation uses thesis-export-input/1.1 with sourceCoverage integrity metadata.
Validate actual delivered cards against the untouched manifest after formatting.
Old input 1.0 is explicit compatibility, not proof of current source completeness.
Evidence scope and review rules are in thesis-backfill/references/source-stability.md.

The 2026-09-15 product revision removes public sources. ThesisCard has seven
fields; body ends with short named original Markdown hyperlinks, URL-deduplicated.
The private packet and manifest retain provenance, original text hashes, dates
and review evidence. This is not permission to remove source validation.

Updated 2026-09-14 for the product ThesisCard contract. This is an interchange
contract, not a deployed queue or API. Read the [product export specification](../thesis-review-publish/references/thesis-card-contract.md)
for exact fields, commands and the normalized adapter input.

A separate [local review workflow](../thesis-review-publish/references/review-workflow.md)
implements durable candidate queues and version-bound agent review. It does not
deploy a cloud worker or grant publication authorization. No manual candidate
approval is required; publish passing content within the user's authorized batch.
Unverifiable interviews are skipped after recorded transcript fallback. Private
skip logs are not public pending-review content. Legacy user decisions are retained.

## Identity and evidence

Use stable internal author, company/asset/basket, event and source revision IDs.
One author plus one resolved company is one active thesis under generation 3.1.
Keep accounts and trading episodes inside that history; do not split companies
by mechanism or recreate failed trades under unrelated thesis IDs. Retain aliases
for migrated records. Do not confuse source IDs, author IDs and product thesisId.

Research packets retain schema 1.0 plus their generation policy. The backfill
[packet contract](../thesis-backfill/references/output-contract.md) defines raw
sources, claims, immutable history and source dispositions. Each source has used,
context, duplicate, no_judgment or hold; failures belong in processing metadata,
with affected stored sources held. A missing source is a channel gap, not a fake
empty source record. Partial model output never means no judgment.

## Run, candidates and review

Each run saves run_id, automation_id (or one-off backfill identity), author_id,
rule/model versions, as_of, requested/actual scope, parent_run_id and status.
Retries have distinct run attempts but reuse stable event/candidate identities.

Candidates retain candidate_id/version, source references and evidence, stable
internalThesisKey, eventId, author ID, company binding, operation, internal event
subtype, description, origin status, baseline version and review provenance.
No generated title field. Product type new_thesis/thesis_update is distinct from
internal EVIDENCE/REVISE/POSITION/CLOSED/WITHDRAW/REAFFIRM. A Pass is not a card.

Review retains reviewer identity/method, original evidence, draft version, actual
checks, decision and required repairs. Semantic approval, export validation,
publication authorization and backend receipt are separate facts.

Track separate stages rather than a single enum:
- collection: not_started, complete_in_scope, partial, failed;
- processing: pending, processing, classified, technical_failure;
- resolution: model_resolving, human_review, blocked, resolved;
- review: pending, approved, revise, hold, rejected;
- export: pending, exported, held;
- ingestion: not_sent, sent, accepted, conflict, failed;
- publication and delivery: each has its own independent receipt/status.
Only approved content is export eligible. Revised content returns to review;
held/rejected content cannot advance directly to publication.

## Feed allocation and export

Feed atomically assigns positive author-scoped numeric thesisId values and
persists the high-water mark and tombstones. Updates reuse the same number;
retries do not increment it. The adapter consumes a versioned feed allocation
map and backend author map. It never allocates production IDs itself.

Export `cards.json` and `ingestion-manifest.json`, plus explicit `holds.json`.
The card contains only the product fields; the manifest carries event identity,
review provenance, source revisions, content hash, mode and baseline version.
The event key includes author and thesis identity, not just the numeric thesisId.
On a repeated key, identical content is a no-op; different content is a conflict
or authorized correction. A current snapshot must use a snapshot route, never
masquerade as an additional immutable new-thesis event.

## Health reconciliation

Reconcile source dispositions, reviewed events, exported card indices, feed
assignments and backend receipts. Track omitted items and hold reasons explicitly.
Exported is not ingested; HTTP success without item receipts is insufficient.
No image is a fallback condition; no eligible object, exact time or permitted
original source is an export hold. Unchanged output hashes demonstrate stable
serialization, not semantic correctness, recall, actual delivery or history completeness.
