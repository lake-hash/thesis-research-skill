---
name: thesis-review-publish
description: Perform agent-owned source and content review of thesis candidates, resolve attribution and grouping, and publish eligible changes within user-authorized scope with version and history safeguards. Use after backfill or incremental processing.
---

# thesis-review-publish

Before generating, revising or delivering candidates, apply the
[current-run review and batch gates](../thesis-backfill/references/run-review.md). New runs require
`review_contract: source-first/1.0`, version-bound claim/event review, a recorded
Signals search, and asset/basket matching against active and pending records.
Run the strict packet, presentation and batch checks; generic pass flags alone
are not source-first review. Old packets remain archives until reviewed for delivery.

Check the final rendered catalog, not just approval flags: reject a held or
source-only primary source, missing supporting hyperlinks, future historical
context and duplicate author/asset histories hidden by multi-ticker labels.
Preserve separate trade episodes and freeze each reviewed outside Signal's
source, body and date. Apply the shared generation contract to legacy adapters too.

New or rewritten thesis/update prose must pass the
[500-character limit](../thesis-backfill/references/generation-contract.md).
Require `generation_policy.prose_max_chars: 500` and `--require-prose-limit` on
the research packet; exclude the trailing original-link footer from the count.
Check that compression preserved source meaning and historical transaction
periods. Return over-limit drafts for rewriting, not truncation. Do not rewrite
unchanged published history solely to satisfy this new generation rule.

Apply [source stability](../thesis-backfill/references/source-stability.md). Current
preparation uses input 1.1 with sourceCoverage. Run `scripts/validate-delivery.mjs`
on actual final cards and the untouched manifest before publication. A passed
format/quote check cannot replace semantic source review or event reconciliation.

Use [review-workflow.md](references/review-workflow.md) for executable local queue
intake and version-bound agent review. Do not require manual candidate approval.
Agent acceptance, batch authorization and verified publication are separate facts.
Unverifiable interviews are skipped after transcript fallback, not sent to the
user for approval. Preserve existing legacy decisions without fabricating new ones.

Read [thesis-review-publish.md](thesis-review-publish.md) for the workflow.
Use [increment review](../thesis-backfill/references/update-increment-review.md)
to distinguish meaningful updates, source-only repetition, same-document pages
and unresolved context. A review recommendation is not itself source evidence.
Use [selection and source media](../thesis-backfill/references/selection-and-source-media.md)
to reject theses without what plus why, updates without a material thesis
increment, inferred/subjective prose, and mismatches between reviewed visual
relevance and final card media.
Before product-field handoff, read [ThesisCard export contract](references/thesis-card-contract.md).

Use current author/company grouping and immutable dated events. Generate body
prose with named Markdown original links at the end of body; no public sources or
source field. Keep original evidence in the private packet/manifest. Export
with persisted feed IDs, never model-assigned production numbers. Hold gaps
and preserve existing user authorization for publishing and notifications.

Use `scripts/prepare-card-export.mjs` for validated generation packets. Review
`gaps.json` and both manifests before handoff. Current snapshots and immutable
history use separate routes; `local_preview` allocations are not publishable.
Reconcile reviewed keeps against exported event IDs, including merged aliases.
An old `REAFFIRM` label cannot veto an explicit source-backed increment; missing
export prerequisites must preserve content approval and surface a separate blocker.

For podcast/interview candidates, read
[multimedia.md](../thesis-backfill/references/multimedia.md). Verify speaker and
ASR evidence before approval. Seek links belong in source URLs; audio/video
provenance belongs in the manifest, not extra ThesisCard fields.
