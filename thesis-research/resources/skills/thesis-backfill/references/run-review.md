# Current-Run Review And Batch Gates

Apply this contract to every new backfill or changed candidate before preparing
product output. It supplements generation 3.1 with
`generation_policy.review_contract: source-first/1.0` and
`generation_policy.prose_max_chars: 500`. Old packets remain readable through
`validate-packet.mjs`; reading an archive is not approval to export it again.
Do not remove policies or invoke older adapters to bypass a failed current gate.

## Source-First Review Is Work, Not A Default Flag

First reconstruct the actual claim from originals and contemporaneous context,
then compare the finished draft. Check every current claim and every historical
event, including events proposed for suppression. Record what the source says,
why the cited passage supports this wording, and any required correction. Check
speaker, negation, uncertainty, condition, units, transaction stage and actual
trade period. A matching quote or `pass` label does not establish entailment.
Review current state against later actions without turning those actions into
public thesis updates unless they add material reasoning/evidence/conditions. An
old analytical anchor must not leave a closed position described as held. Keep
historical wording at its date.

Use the original archive, not just the generator's selected quote. Distinguish
another author's statement, a question, sarcasm and promotion from an investment
claim. Review the full finished prose again after shortening; preserve the decisive
reason and material conditions within 500 characters. Deeply review retained and
uncertain candidates. Sample rejected/context sources across dates/channels for
omissions; exact duplicates and unchanged cached decisions do not need repeated
full prose review.

For every approved active record, store `source_first_review`:

```json
{
  "version": "source-first/1.0",
  "reviewer": "actual reviewing agent or attempt ID",
  "method": "source_first",
  "reviewed_at": "ISO timestamp of this review",
  "input_sha256": "reviewInputHash(packet, record)",
  "reader": {"decision": "clear", "reason": "Specific reader assessment", "conclusion_first": true, "opening_conclusion": "The directional investment conclusion", "opening_reason": "The decisive reason stated in the first sentence"},
  "claim_reviews": [{
    "claim_id": "ID from card_claims",
    "decision": "supported",
    "reconstructed_meaning": "Meaning reconstructed from the original",
    "evidence": [{"source_id": "original ID", "quote": "Exact original passage", "explanation": "Why it supports this claim"}]
  }],
  "event_reviews": [{
    "event_id": "historical event ID",
    "decision": "update",
    "content_domain": "fundamental | mixed | technical_only",
    "fundamental_increment": "Required when mixed content remains public",
    "reconstructed_meaning": "What was expressed at this date",
    "reason": "Actual increment, earlier repetition, or missing context",
    "evidence": [{"source_id": "original ID", "quote": "Exact original passage", "explanation": "Support for the historical wording/disposition"}]
  }]
}
```

Each `card_claims` evidence span needs a matching reviewed span and explanation.
Event decisions must match `timeline_review`: `update`, `source_only`, or `hold`.
Keep source-only and held material private. Unverifiable interviews still follow
the transcript fallback and skip rules; they do not become user approval tasks.

After completing review, use the exported `reviewInputHash` from
`scripts/run-review-contract.mjs` to bind it to the exact packet/record inputs.
The function only calculates a digest; it does not approve anything. A prose,
source, date, grouping, historical, Signals or review-context change invalidates
the previous record. Re-read affected evidence and revise findings before updating
the digest. Never generate all-pass reviews in an assembly loop, copy another
claim's explanation, or treat `test-review-fixture.mjs` as a production helper.
Program checks establish completeness and freshness of review records, not
semantic truth. Report actual source-first review separately from test results.

## Match Assets And Baskets Against The Full Catalog

Read active records, aliases, pending candidates and this batch before assigning
IDs. Use resolved issuer/asset identities and primary/vehicle bindings. A new
trading episode stays inside the same author/object history. An extra related
ticker cannot create a separate investment object. ETFs and their issuers are
different objects; two share classes of the same company are not two theses.

Record `packet.catalog_review` with `revision`, `checked_at`,
`scope: active_and_pending`, `record_ids`, `pending_ids` and a concrete `reason`.
The ID lists must cover the subject's active/pending entries actually inspected.
Read unresolved pending content too; an absent object key is not proof of no match.

Overlapping baskets are candidates for review, not automatic merges. To retain a
genuine separate strategy, provide `packet.object_overlap_reviews` entries:
`{record_ids: [idA, idB], decision: distinct_strategy, reason, evidence: [...]}`.
Each basket needs at least two distinct primary/vehicle objects and its own
author-owned strategy passage. Evidence entries contain `record_id`, `source_id`,
exact `quote`, and `explanation`. An unrelated extra ticker or a repeated single
asset trade cannot pass as a distinct strategy. Preserve accounts, episodes and
returns separately when consolidating records.

## Signals Search Must Be Accounted For

Each active record needs `signals_review`, even when `signals` is empty:

```json
{
  "status": "complete",
  "searched_at": "ISO timestamp",
  "catalog_revision": "same revision as catalog_review",
  "searches": [{"scope": "existing_catalog", "query": "Company/asset aliases and thesis topic", "result": "What was found or why none qualified"}],
  "candidates": [],
  "reason": "Concrete outcome or unresolved search limitation"
}
```

For multiple-author runs also search the finished `current_batch` and record a
search with that scope. Search original public material when it can resolve a
relevant gap within the requested coverage. `blocked` requires a concrete reason;
do not label an unperformed search complete. Never invent Signals to meet a quota.
Each found candidate stores `author_id`, `source_urls`, `decision: include|exclude`
and `reason`; included candidates also name the stored `signal_id`. Explain the
specific support, challenge or qualification, not merely shared tickers. Store
the outside author's dated wording and source as a snapshot, not a live pointer
to their current card. Adding or changing a candidate returns to review.

## Required Commands And Output Checks

```bash
node <skill-root>/scripts/validate-packet.mjs packet.json --require-history-coverage --require-generation-contract --require-prose-limit --require-run-review
node <skill-root>/scripts/build-presentation.mjs packet.json presentation.json
node <skill-root>/scripts/final-public-projection.mjs packet.json presentation.json final-review.json
node <skill-root>/scripts/validate-batch.mjs batch.json
```

Use `--baseline previous.json` for packet validation and presentation on
continuation. Historical corrections still require explicit authorization and
retained previous versions. The builder, export preparer and queue intake require
the current review and prose gates; caller options cannot disable them. Combined
same-document details also must fit 500 characters. Rewrite/review a supported
disclosure summary; do not truncate or split one disclosure to evade the limit.
Do not rewrite old published history just to unblock an export: leave its original
archive intact and resolve the migration scope separately.

`batch.json` contains relative paths:
`{"packets":["author-a.json","author-b.json"],"catalog":"catalog-index.json"}`.
The private catalog index has `revision`, `records`, `pending`, and `sources`.
Normalize active and pending objects into descriptors with stable `id`, `author_id`,
`type`, `object_type`, `object_key`, and `asset_bindings` (same resolved identity
fields as the packet). Preserve retired aliases outside active records. Retain
original source IDs/text for any basket-separation evidence. Record the original
catalog paths/hashes alongside the index so the agent can audit its completeness.
Keep source IDs globally stable; do not reuse one ID for different revisions.
Batch-level `object_overlap_reviews` use the same schema for existing-catalog pairs.

The batch gate compares new objects against other packets, existing active objects
and resolved pending objects. A catalog index is only useful if it faithfully
reflects storage; inspect it instead of manufacturing an empty index. Fix affected
conflicts without silently changing unrelated pre-existing records.

Finally use the standard ThesisCard preparation/export and delivery validator.
Both direct export and final delivery enforce 500 prose characters, excluding
the named-original-link footer. Reconcile the actual final product IDs, dates,
source links, Timeline and Signals to this reviewed packet; legacy prototype
adapters must not lose these decisions. Render the actual changed UI when requested.
Do not report a batch complete based only on per-author checks or structural tests.

Then review the assembled presentation under `final-public/1.0`. Follow
[the final projection contract](final-public-projection.md) and run
`scripts/final-public-projection.mjs` with the packet, presentation and separately
authored review sidecar. A source-first record review does not substitute for this
pass because grouping and overrides can change the actual reader-facing copy.
The sidecar must declare `review_scope: all_visible_expressions` and exact
total/completed counts equal to cards plus visible Timeline rows. Sampling,
changed-only review and known-example checks are insufficient.
