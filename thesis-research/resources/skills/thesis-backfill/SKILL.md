---
name: thesis-backfill
description: Backfill a person's public investment views from X, podcasts, interviews, speeches and written sources into source-backed company theses and dated updates. Use for author-centric backfills, multimedia transcript extraction and omitted-thesis audits with verified attribution.
---

# Thesis Backfill

Read [admission-policy.md](references/admission-policy.md) before triage,
generation or review. It is the canonical admission contract and supersedes
looser legacy examples.

The current public scope is `source_grounded_company_analysis/1.0`: technical-only
analysis remains private. Mixed analysis qualifies only with an independently
supported non-technical what and why.
Every public expression opens with a conclusion-first sentence
that states the directional implication and final investment landing; background
cannot precede the investment conclusion. Final review covers every visible card
and Timeline row, never a sample.
Every public main card and Timeline update carries its own verified ticker set and
one source-backed `bullish`, `bearish` or `none` direction per ticker. Thesis
and Timeline ticker sets may differ. Never infer or inherit an update's ticker or
direction from the current card. The first visible sentence is stance-first.
Use the shared [stance opening contract](references/stance-opening-contract.md)
for both main cards and Timeline updates. Main cards plan the subject, judgment
axis, directional state and mechanism inside the existing generation call.
Timeline updates use the reviewed historical `what`, `why` and material increment
to state the source-date investment implication and mechanism in the first
sentence. Bare or vague
`looks attractive/unattractive`, `the case is strong/weak`, appealing
and compelling labels are invalid. `Looks attractive/unattractive` remains valid
when the same sentence states a specific source-backed mechanism and the family is
not overused. Bullish/Bearish/Neutral remain structured tag metadata and never
appear as generated public-prose labels.
The decisive mechanism appears in that first sentence, including any named
counterparty, product or event needed to understand it. The remaining prose then
adds distinct evidence, a causal step, a condition or a risk; it never paraphrases
the opening merely to fill space. A Timeline row remains a historical snapshot
and does not inherit today's card stance. Render the opening in regular black body
text. Corpus diversity is a
deterministic review queue, not permission to rotate synonyms automatically.

Visible Timeline updates use the parallel `source-backed-timeline-opening/1.2`
contract. Their first sentence states that date's directional investment meaning
and mechanism; following sentences add only contemporaneous evidence, conditions
or risk. They do not need a stance enum or a Bullish/Bearish prefix, and they never
borrow later conclusions.
Ticker tags never satisfy stance-first. Under `source-backed-opening/1.3`, the
visible sentence begins with an exact `stance_clause`, continues with an exact
same-sentence `mechanism_clause`, and binds every displayed ticker to an exact
natural-language realization span. Hide all tags during review; the sentence must
still communicate direction and why. Public prose never copies the enum words
Bullish, Bearish or Neutral.

For Thesis Playbook delivery, apply [single-source.md](references/single-source.md)
first. It supersedes multi-source display footers: one dated expression, one
summary, one original hyperlink, and a matching date. Keep internal evidence.

Before generating, revising or delivering candidates, apply the
[current-run review and batch gates](references/run-review.md). New runs require
`review_contract: source-first/1.1`, version-bound claim/event review, a recorded
Signals search, and asset/basket matching against active and pending records.
Run the strict packet, presentation and batch checks; generic pass flags alone
are not source-first review. Old packets remain archives until reviewed for delivery.

New or rewritten visible Thesis and Timeline prose must contain at most 500
characters, including spaces, punctuation and paragraph breaks, excluding the
trailing original-link footer. For a current Thesis, this means the final composed
`stance_sentence + description`; Timeline uses its own description. Declare `generation_policy.prose_max_chars: 500`
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
Also apply [source-fidelity-contract.md](references/source-fidelity-contract.md):
public prose must preserve source subject, owner, predicate, certainty, degree,
condition and time scope; unsupported possessives or author narration are hard
failures.
Before classification, read
[selection-and-source-media.md](references/selection-and-source-media.md). Treat
thesis/update selection and source-image relevance as one evidence decision. A
thesis requires source-backed what plus why; an update requires its own
source-backed what plus why and a material change to reasons,
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
prompts. New output uses contract 3.2, including claim-level evidence and primary
Source coverage of the central judgment and reason.

Quoted/reply media is part of source completeness. Inventory the complete context
chain independently of text keywords. A media key with no usable URL creates a
retrieval gap, not an omit decision; report it and prioritize recovery when the
accepted prose relies on that context's chart, document, technical or operating
evidence. A directly relevant quoted/reply image may be included as helpful
`explanatory_context` without explicit author adoption, but it cannot supply or
change the author's what, why, ticker or direction and must retain outside-source
provenance. Never claim a complete image pass while such gaps remain.

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
The final review must independently attest company specificity, removal of
portfolio operations, exclusion of adjacent theme/peer/ETF/financing context and
a concrete why. Run the subtraction and company-substitution tests in
[update-increment-review.md](references/update-increment-review.md); a generic
`fundamental` label is not sufficient. Published readback must use one formal
release version with no `-candidate` suffix across catalog, presentation and
sidecar.

For backend delivery, read [ThesisCard export contract](../thesis-review-publish/references/thesis-card-contract.md).
That contract is synchronized to the Thesis Feed field definition in Notion. The
public object is exactly `{thesisId, type, createdAtMs, author, body, tickers,
media}`. Do not expose internal review fields, `title`, `source`, `sources`,
status, confidence, run metadata or account metadata in the Feed object.
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
When the destination is the shared Thesis Feed, stop at the validated data
contract. The Feed owns card navigation, Timeline interaction, typography, image
layout and lightbox behavior. Validate grouping and expression-local ticker/media
bindings with `project-thesis-feed.mjs`; do not build a bespoke Playbook UI unless
the user separately requests one.

Current product output has seven fields, no `sources` or `source` field. `type` is
only `new_thesis` or `thesis_update`; it is not a sentiment, setup, trade or
review label. `createdAtMs` belongs to that card's own expression: a new Thesis
uses its accepted first expression and an update uses the newer update expression;
never reuse the original Thesis timestamp for an update. `author` contains only
the authoritative stable `id`. `tickers` is a non-empty, display-ordered list of
unique symbols; each product direction is exactly `bullish`, `bearish` or `none`.
Internal source review may use `neutral` for a balanced view, but the exporter
maps that state to product `none`; never emit `neutral` in `ThesisCard.tickers`.
`media` is always present as an array: use reviewed ordered `{type, coverUrl,
url?}` entries where `type` is `image` or `priceChart`, and use `[]` when no
approved media exists. Append short named Markdown original links to `body`,
deduplicated by URL. Labels name the author/channel/program; they do not restore
a title field.
