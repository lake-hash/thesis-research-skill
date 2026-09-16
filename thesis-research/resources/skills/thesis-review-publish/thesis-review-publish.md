# Thesis Review and Publish

Be the evidence gate between model-generated candidates and public Thesis
content. Review the original evidence before evaluating prose. This skill can
prepare a publish operation; it must not infer authorization to publish.

## Inputs

- Candidate inbox with source IDs, exact support, operation, event type, matched
  thesis, proposed copy, and baseline version.
- Original sources and necessary parent, quoted, or transcript context.
- Current approved record, relevant event history, pending candidates, and
  entity-binding evidence.
- The versioned classification and editorial rules in
  `thesis-field-notes/`.
- The shared [operation contract](../references/thesis-operation-contract.md),
  including candidate states, baseline versions, and publication keys.

Reject a packet that contains only a model summary, confidence score, ticker,
or title without inspectable source evidence.

## Review sequence

1. Confirm the source exists, is readable, belongs to the attributed person or
   team, and has the correct date and revision. Keep coauthors and institutions
   distinct.
2. Reconstruct the judgment from the original source and context. Check the
   primary object, security or proxy mapping, causal mechanism, horizon, and
   whether the author actually adopted any quoted third-party view.
3. Compare approved, pending, and same-run records. Confirm the candidate is an
   new author/company archive or an event under an existing company record.
   Distinct drivers or episodes do not create a second active company thesis. A first observation is not proof of author novelty.
   Check the stored active collection, not only the rendered UI: retired fragments
   must live in an archive with an old-to-canonical ID map. All ordinary exports
   and pending-item matches resolve that map; an old ID must not create a new card.
4. Check event type and action precision. Preserve EVIDENCE, REVISE, POSITION,
   CLOSED, WITHDRAW, and REAFFIRM meanings. Do not turn a recommendation into a
   trade, an exit into a thesis withdrawal, or a later target hit into earned
   return.
5. Check the copy against the source and date. Use continuous description/body prose without a generated title field on
   either a thesis or update. Append named original hyperlinks to body, not a
   separate sources field. Apply generation 3.1 claim coverage and primary-anchor checks. Timeline entries use only information known at that time.
   Keep Signals for other authors and facts separate from the author's view.
6. Decide one of: approve, revise, merge or reclassify, hold, or reject. Record
   the reviewer, method, checks, evidence, and reason. A language revision goes
   through review again; unresolved material stays on hold.

## Publish gate

Publishing requires explicit user authorization for the specific approved batch
or operation. Before applying it:

- Re-read the current record and compare its version with the candidate baseline.
- Stop on a conflict; do not overwrite a newer change.
- Apply only approved fields, keep the previous record and event history, and
  use an idempotent publication key so retries cannot duplicate content.
- Verify the rendered or fetched page after the write, then record published_at,
  the version, and the verification result.
- Treat notification as a separate operation with its own deduplication and
  delivery status. Publication success is not notification delivery.

For corrections or withdrawals, retain the original source, previous copy,
reason, and correction link. Deleting a source does not prove that the author
withdrew the view. Do not silently change a historical event.

## Output

Return a review ledger containing candidate ID, decision, reviewer method,
checks for attribution, standalone judgment, grouping, asset binding, fidelity,
chronology, and editorial quality, plus exact repairs or the hold reason.
For a publish run, also return the applied record IDs, version checks, page
verification, notification status, and any skipped conflicts.

Use the contract's candidate and state fields so an approved, revised, held or
rejected result can be reconciled by thesis-ops without reading prose.

Use the prototype's `publish-reviewed.js` only after inspecting its current
inputs and authorization boundary. It publishes an approved edition; it is not
a substitute for per-candidate review, local edits, or conflict recovery.

## Product field handoff

Read the [ThesisCard contract](references/thesis-card-contract.md)
for product fields, ID ownership, timestamp policy and export input. It overrides
older title/independent-mechanism wording for this export route. Read current
[company generation policy](../thesis-backfill/references/generation-contract.md)
for grouping and immutable history.

After semantic review and current packet validation, build normalized export-input
using explicit backend author and feed-assignment maps. Run:

```bash
node <skill-root>/scripts/export-thesis-cards.mjs export-input.json NEW-output-dir
node --test <skill-root>/scripts/test-export-thesis-cards.mjs
```

Deliver cards.json, ingestion-manifest.json and holds.json. cards.json contains only
the seven PRD fields; the manifest carries event IDs, versions, hashes and review
provenance. A successful export is not backend ingestion or publication. Fixture
assignments are for tests only. Reconcile backend receipts by stable event key and
content hash; reject different content under an existing immutable event. Never
auto-insert a current_snapshot as an additional new thesis. Product's original
field schema remains unchanged; timestamp/new_thesis semantics and the manifest
require backend acknowledgement before a production write.
