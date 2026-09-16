---
name: thesis-backfill
description: Backfill a person's public investment views from X, podcasts, interviews, speeches and written sources into source-backed company theses and dated updates. Use for author-centric backfills, multimedia transcript extraction and omitted-thesis audits with verified attribution.
---

# Thesis Backfill

Read [admission-policy.md](references/admission-policy.md) before triage,
generation or review. It is the canonical admission contract and supersedes
looser legacy examples.

The current public scope is `fundamental_company_only/1.0`: technical analysis,
trade setups and technical-only Timeline rows remain private source history.
Every public expression opens with a conclusion-first sentence
that states the directional implication and decisive reason together; background
cannot precede the investment conclusion. Final review covers every visible card
and Timeline row, never a sample.

For Thesis Playbook delivery, apply [single-source.md](references/single-source.md)
first. It supersedes multi-source display footers: one dated expression, one
summary, one original hyperlink, and a matching date. Keep internal evidence.

Before generating, revising or delivering candidates, apply the
[current-run review and batch gates](references/run-review.md). New runs require
`review_contract: source-first/1.0`, version-bound claim/event review, a recorded
Signals search, and asset/basket matching against active and pending records.
Run the strict packet, presentation and batch checks; generic pass flags alone
are not source-first review. Old packets remain archives until reviewed for delivery.

New or rewritten thesis and Timeline descriptions must contain at most 500 prose
characters, including spaces, punctuation and paragraph breaks, excluding the
trailing original-link footer. Declare `generation_policy.prose_max_chars: 500`
and run the packet validator with `--require-prose-limit`. Rewrite excess text;
never truncate it or lose the central reason, conditions or historical timing.
Preserve unchanged published history. See the generation contract for counting.

Before generating or revising content, apply
[source-stability.md](references/source-stability.md): retain earlier supporting
originals in the current footer, select the newest qualified analytical anchor,
distinguish document and excerpt hashes, and verify final delivery after formatting.

Follow [review execution](../thesis-review-publish/references/review-workflow.md):
the agent completes source and content review, then publishes within the user's
authorized scope without requiring manual candidate approval. Continue beyond
normalization. If audio cannot be checked, seek a verifiable full transcript;
if retrieval, parsing or attribution still fails, skip that interview and retain
the reason privately. Do not leave public Pending review rows or imply an
unattended worker exists.

For podcasts, audio/video interviews or speeches, read
[multimedia.md](references/multimedia.md). Use the indexed collector and transcript
normalizer, verify speaker turns and ASR evidence, then feed the same company-level
generation/review pipeline. An episode description or high-confidence speaker
label alone does not establish the target person's statement.

Thesis and update records have no `title` field, including internal or optional
titles. Generate `description` only; use stable IDs for references and grouping.

Read [thesis-backfill.md](thesis-backfill.md) for the workflow, then
[generation-contract.md](references/generation-contract.md) before producing
content. The latter defines the current author-and-company grouping, prose,
source selection, frozen history, 40-word Timeline preview and image contract.
Before classification, read
[selection-and-source-media.md](references/selection-and-source-media.md). Treat
thesis/update selection and source-image relevance as one evidence decision. A
thesis requires what plus why; an update requires a material change to reasons,
evidence or conditions. A new record also requires a specific author-named or
thread-inherited investable object that resolves to a verified ticker. Broad
market, macro, event-risk or theme commentary without such an object is omitted
at triage and logged as `no_judgment`; do not create a `context` record to retain
it. Include only images that are required or helpful context.

For large archives, apply [fast-extraction.md](references/fast-extraction.md).
Normalize/cache/deduplicate once, run compact high-recall triage in large batches,
fetch context and inspect images only for candidates, match objects before prose,
and deep-review only changed candidates plus a bounded reject sample. Use the
bundled [triage prompt](prompts/triage.md); the triage pass never drafts prose.

For drafting and review, also read
[plain-language-and-sources.md](references/plain-language-and-sources.md) and use
the bundled [generation](prompts/generate.md) and [review](prompts/review.md)
prompts. New output uses contract 3.1, including claim-level evidence and primary
Source coverage of the central judgment and reason.

Quoted/reply media is part of source completeness. Inventory the complete context
chain independently of text keywords. A media key with no usable URL creates a
retrieval gap, not an omit decision; report it and prioritize recovery when the
accepted prose relies on that context's chart, document, technical or operating
evidence. Never claim a complete image pass while such gaps remain.

The main card's selected source must not repeat as a visible Timeline update.
Keep its original event and full detail in history; filter the presentation after
company grouping and recalculate when the selected Source changes.

A merge must change the active stored catalog, not just a UI projection. Keep one
active thesis per author/company, move retired IDs to a separate alias map, and
resolve those aliases in pending updates and exports. Archive original records.

Use the bundled validator and presentation builder before delivery. Preserve
the [increment review rules](references/update-increment-review.md) when deciding
which statements become visible updates; do not shorten away new facts and then
mistake the resulting summary for a duplicate. Preserve
the user's requested scope and existing authorization; loading this skill does
not itself authorize publishing, changing schedules or writing to Notion.

After the deterministic presentation is built, apply the
[final public projection gate](references/final-public-projection.md). A separate
agent-owned review sidecar must cover every visible main card and Timeline row
and be bound to the exact presentation hash. Run
`scripts/final-public-projection.mjs`; do not deliver or publish on structural
packet checks alone. Any prose, source, date, ticker, grouping, media or Timeline
visibility change invalidates the final review.

For backend delivery, read [ThesisCard export contract](../thesis-review-publish/references/thesis-card-contract.md).
Keep the validated research packet, then prepare reviewed export input with stable
author/company/event IDs, original source text, event dates and event-specific
tickers. A feed-supplied map provides numeric thesisId. The exporter writes
cards.json plus ingestion-manifest.json; it never publishes. Product
body ends with named original hyperlinks; source evidence stays in the research packet.

After packet validation, use
[prepare-card-export.mjs](../thesis-review-publish/scripts/prepare-card-export.mjs)
with explicit author/ID mappings and source permissions. It emits separate
historical cards, current snapshots, manifests and a Playbook data bundle.
Never use a current snapshot as the first historical expression or treat local
preview IDs as production allocations. Surface export gaps before handoff.

Current product output has seven fields, no `sources` or `source` field. Append
short named Markdown original links to body, e.g. `[mon on X](URL)`, deduplicated
by URL. Labels name the author/channel/program; they do not restore a title field.
