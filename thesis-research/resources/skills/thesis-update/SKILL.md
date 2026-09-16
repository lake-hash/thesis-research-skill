---
name: thesis-update
description: Process new investor statements into company-grouped thesis events and reviewed ThesisCard export candidates. Use for incremental updates, source repairs and pending-item resolution after an author baseline exists.
---

# thesis-update

Before generating, revising or delivering candidates, apply the
[current-run review and batch gates](../thesis-backfill/references/run-review.md). New runs require
`review_contract: source-first/1.0`, version-bound claim/event review, a recorded
Signals search, and asset/basket matching against active and pending records.
Run the strict packet, presentation and batch checks; generic pass flags alone
are not source-first review. Old packets remain archives until reviewed for delivery.

Apply the [500-character prose limit](../thesis-backfill/references/generation-contract.md)
to every new or rewritten current thesis and Timeline update. Spaces, punctuation
and paragraph breaks count; the trailing original-link footer does not. Declare
`generation_policy.prose_max_chars: 500` and validate with `--require-prose-limit`.
Rewrite rather than truncate, recheck evidence, and preserve unchanged history.

Apply [source stability](../thesis-backfill/references/source-stability.md) to every
revision. Update the current claim map and supporting links without rewriting old
events; changed prose/source/date invalidates prepared evidence. Use export input
1.1 and validate the delivered cards against the preserved manifest.

Follow [review execution](../thesis-review-publish/references/review-workflow.md).
Complete agent-owned checks during the run and publish eligible candidates within
the user's authorized scope, without manual candidate approval. Unverifiable
interviews are skipped after transcript fallback with private attempt logs.
Keep review and publication separate; changed content invalidates prior acceptance.

New podcasts, interviews and recorded speeches follow
[multimedia.md](../thesis-backfill/references/multimedia.md). Normalize verified
speaker turns and match existing author/company histories across channels;
re-uploaded clips do not become new dated opinions.

Preserve content approval independently of export readiness. A legacy `REAFFIRM`
with a reviewed increment can be an update; pure repetition cannot. Reconcile
approved events with the export manifest and explain missing ID/source/ticker
prerequisites without converting them into negative content decisions.

Read [thesis-update.md](thesis-update.md) for the workflow.
Apply [increment review](../thesis-backfill/references/update-increment-review.md)
before shortening or suppressing a statement. Preserve new facts, conditions,
trades and attribution corrections; do not use later posts as duplicate evidence.
Apply [selection and source media](../thesis-backfill/references/selection-and-source-media.md):
require what plus why for theses and a material reason/evidence/condition change
for updates. Include original images only when they are required or helpful for
context. For large batches, apply
[fast extraction](../thesis-backfill/references/fast-extraction.md).
Before product-field handoff, read [ThesisCard export contract](../thesis-review-publish/references/thesis-card-contract.md).

Use current author/company grouping and immutable dated events. Generate body
prose with named Markdown original links at the end of body; no public sources or
source field. Use this update's original links, not the latest card's links. Export
with persisted feed IDs, never model-assigned production numbers. Hold gaps
and preserve existing user authorization for publishing and notifications.
