---
name: thesis-update
description: Process new investor statements into company-grouped thesis events and reviewed ThesisCard export candidates. Use for incremental updates, source repairs and pending-item resolution after an author baseline exists.
---

# thesis-update

Before generating, revising or delivering candidates, apply the
[current-run review and batch gates](../thesis-backfill/references/run-review.md). New runs require
`review_contract: source-first/1.1`, version-bound claim/event review, a recorded
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
Before any public update survives, require its own verified ticker set, one
source-backed `bullish`, `bearish` or `none` direction per ticker, and explicit
what plus why from that dated source. Remove portfolio actions and run the
subtraction test: the remaining text must independently state a material,
company-specific fundamental change. Sector funds, peer success, financing
structures and allocation choices remain context/source-only unless they change
this company's thesis. Require the strengthened final-public review fields and
one non-candidate release version before delivery.
For any refreshed main card, require one source-backed `bullish`, `bearish` or
`none` direction per displayed ticker and apply the shared
[stance opening contract](../thesis-backfill/references/stance-opening-contract.md).
The first sentence makes the specific direction and decisive mechanism clear,
including any named counterparty, product or transaction needed for the claim to
stand alone. Following prose must add evidence, a causal step, a condition or a
risk rather than restating the opening. Do not use generic
attractiveness labels or rotate templates for variety. A literal Bullish/Bearish
prefix requires exact source support. Do not let a product, partnership or event
fact replace the conclusion. Mixed or unresolved material remains private.
For every visible Timeline update, apply `source-backed-timeline-opening/1.2`:
the first sentence states that date's directional implication and mechanism, and
the remaining prose adds contemporaneous evidence, conditions or risk. Technical-only
updates remain private; mixed analysis needs an independently qualifying
non-technical why. Do not apply today's main-card ticker set or direction to an
older event or require a literal stance label.
For refreshed cards, apply `source-backed-opening/1.3`: the exact stance clause
must lead sentence one, the exact mechanism clause must follow in that sentence,
and each ticker needs an exact prose realization. Direction tags do not count and
public prose cannot repeat Bullish/Bearish/Neutral metadata words.
Before product-field handoff, read [ThesisCard export contract](../thesis-review-publish/references/thesis-card-contract.md).
The Feed object is exactly seven fields: `thesisId`, `type`, `createdAtMs`,
`author`, `body`, `tickers`, `media`. Use only `new_thesis` or `thesis_update`;
use the update expression's own timestamp for `createdAtMs`; map internal
neutral to product `none`; and always emit `media: []` when no approved media
exists. Never expose title/source/review metadata in the Feed object.

Use current author/company grouping and immutable dated events. Generate body
prose with named Markdown original links at the end of body; no public sources or
source field. Use this update's original links, not the latest card's links. Export
with persisted feed IDs, never model-assigned production numbers. Hold gaps
and preserve existing user authorization for publishing and notifications.
