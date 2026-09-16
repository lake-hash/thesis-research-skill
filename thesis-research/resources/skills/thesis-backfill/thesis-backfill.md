---
name: thesis-backfill
description: Backfill an investor or trader's investment theses from a name, account, or profile URL across their accessible public statements. Resolve identity, recover source history, distinguish new theses from updates, verify ticker relationships, and produce source-backed plain-English prose. Use for author-centric thesis backfills and omitted-thesis audits, not standalone stock research or simulated investor opinions.
---

# Thesis Backfill

Turn one person's public statements into a source-backed thesis history that can
be continued without duplicating or silently rewriting earlier work.

The current generation contract is **3.1**. Read
[generation-contract.md](references/generation-contract.md) before extraction
and again before delivery. It is part of this skill, not optional product advice.

Examples:
- `Use $thesis-backfill for @ArtofSpecuycky.`
- `Use $thesis-backfill for Bill Ackman across his available public history.`
- `用 $thesis-backfill 回填段永平的公开投资观点，并匹配已有 thesis。`

## Start From The Person

Accept a name, handle, profile URL, or verified author ID. Optional inputs are a
date range, existing records, source exclusions, output location, and resource
budget. Do not require the user to design the workflow. Resolve ordinary details
through available evidence; ask only when identity or scope ambiguity would
materially change whose words are being attributed.

For an unqualified request, target **all discoverable, accessible public history
through the run's as-of date**. A recent 90-day pass may prioritize retrieval; it
is not the default stopping point. State archive bounds and inaccessible periods.
Never claim all public statements were recovered from an indexed-X export or a
successful script alone.

For the existing Thesis Field Notes playbook, use its requested rolling six-month
window unless the user gives another range. Calculate dates from the run cutoff;
do not reuse the September 2026 example dates as a permanent window.

Use the current authorized workspace. In the Thesis project, verify the root and
Git common directory are `<workspace>` and its own `.git` before edits.
Keep local outputs here; do not migrate the task or use the parent Alva checkout.
Default output: `backfills/<author-id>/`, with resumable run directories.

When available, read the project's versioned
`thesis-field-notes/classification-rules.txt` and `editorial-rules.txt`; record
their versions. This package's references provide the workflow and output
contract. A user's current instructions override older conventions.
For handoff to update, review, or operations, also read the shared [operation
contract](../references/thesis-operation-contract.md) and use its run envelope,
source dispositions, candidate fields, and state names.

## Workflow

For a large archive, first read
[fast-extraction.md](references/fast-extraction.md). The default execution path is
normalize/cache -> exact deduplication -> high-recall triage -> targeted context
recovery -> object matching -> deep extraction/review. Do not send the complete
archive and catalog through every reasoning pass.

### 1. Resolve Identity And Inventory Sources

Read [source-coverage.md](references/source-coverage.md). Establish verified
accounts and speaker identities before assigning statements. Separate the
individual, their firm, fund managers, staff analysts, and coauthors.

Inventory public social posts and replies, letters and presentations, personal
research sites/newsletters, original interviews, podcasts, speeches and Q&A.
For recorded speech, follow [multimedia.md](references/multimedia.md) and use the
bundled source collector/normalizer. Normalize and review source turns before
generating theses; do not treat a show description as the transcript.
Follow confirmed cross-links. A name match, employer, portfolio holding, quoted
article, or retweet alone does not establish personal authorship or endorsement.

Record each channel's actual window, access status and gaps. Low-frequency and
anonymous authors do not fail admission because of follower count or cadence.

### 2. Recover A Resumable Source Archive

Prefer structured first-party or authorized indexed APIs where available. For
Alva endpoints, use `alva data-skills list`, then the relevant `summary` and
`endpoint` documentation; do not reuse undocumented endpoint guesses.
Use browser/search discovery for other public channels and return to originals.

Preserve source text, source/speech timestamps, URLs, original locators and
revision hashes. Paginate full declared windows; split long texts at coherent
boundaries and join threads before deciding that short replies lack substance.
Each source or segment must have a disposition. Empty or truncated model output
is a processing gap, never a negative content decision.

Checkpoint completed batches. Retry only failed/missing portions in smaller
batches, normally up to two retries per portion. If the same failure persists,
retain the gap and continue independent channels; report partial completion.
Do not keep restarting successful work or use an enormous final model response
as the only copy of the results.

### 3. Extract Judgments, Then Match Them

Read [quality-rules.md](references/quality-rules.md) and
[selection-and-source-media.md](references/selection-and-source-media.md). First recover every supported
investment judgment; do not rank a top four or prefer preselected topics.
For a NEW thesis, require a specific object, author-owned judgment and one
meaningful reason or concrete technical condition. For an UPDATE, require a
material new reason, evidence or condition bearing on the existing thesis.
Price movement, position actions and outcomes alone remain private trade history.
No quota, minimum length, target, stop or multi-post history is required.

Before creating a record, compare **existing approved records, pending candidates,
and other batches from this run**. The company-level unit is **author plus resolved
company identity**. Search company and listing aliases, including merged record
IDs; a different business line or horizon does not create another company card.
Keep a match/merge decision and closest alternatives for review.

Distinguish thesis, trade/position history, update, context, duplicate and hold internally.
Different business mechanisms, valuations, risks and direction changes update the
same company thesis. Trading episodes and accounts remain distinct inside its
history, without combining their positions or returns. Cross-company baskets and
macro views remain separate. Different authors always retain separate theses.

Read [generation-checks.md](references/generation-checks.md) before drafting.
Read [plain-language-and-sources.md](references/plain-language-and-sources.md),
then use [prompts/generate.md](prompts/generate.md) for the drafting pass and
[prompts/review.md](prompts/review.md) for the separate reader/source review.
After grouping the full window, revisit earlier context/position/hold decisions:
a later-established thesis may give an earlier assessment or trade its proper
home. Account for each judgment in multi-claim posts, not just each post. Keep
recognized history in `history_coverage`, with an event, a justified coalescing
target or a pending item; a group link alone does not preserve a dated update.
Standalone trade history with no known thesis remains a supported pending/history
item, not a fabricated investment rationale or a discarded loss.

### 4. Resolve Investment Objects And Write The Copy

Follow Continuous Prose in [quality-rules.md](references/quality-rules.md).
Use professional, easy-to-understand plain English throughout cards, Timeline
and Signals. Explain the investment view, not how the system classified it.
Write short content as one paragraph; longer content opens with a concise
summary paragraph, then develops evidence, mechanism and risk in natural
paragraphs. Do not generate a separate visible headline or bold summary block.
Review neighboring openings for repetitive phrasing without strengthening a
forecast or altering a historical event.

Bind entities before choosing display tags. For each binding distinguish:
**primary subject**, **investment vehicle**, and **related company**; separately
mark **author-named**, **verified company-to-security resolution**, or **Alva
proxy**. Verify the issuer, exchange/share class and instrument type. Record the
specific source that makes the entity relevant. A logo is not mapping proof.

Do not turn every mentioned supplier into a recommendation, a stablecoin into
issuer equity, or a private company's business into its token's economics.
If a macro view lacks a supported investable expression, preserve it as context
and search the person's other statements for concrete company/asset judgments.
Label any proposed proxy visibly and separately from the author's own view.

Generate English `description` as the complete reader-facing prose using the rules in
[quality-rules.md](references/quality-rules.md). The main card describes the latest
source-supported assessment; dated events describe only what was known then.
Do not generate or store a `title` field on records or events, even as optional
internal metadata. Use stable IDs for references and the description for search.
Paragraphs use the same visual treatment and remain fully
visible. Timeline previews are a single paragraph of at most **40 English words**;
only longer entries show an ellipsis and Show more. Clicking opens that event's
full historical detail, including its own date, text, frozen ticker bindings and
source. Do not render event titles, event-type prefixes, origin-unknown labels or
an Original source excerpt block. Store original evidence privately. Review all
generated copy, not just main cards.
After company grouping, exclude the main card's selected source from visible
Timeline rows. Do not add a duplicate `Current source` row. Keep the event and
full historical detail stored, and retain other dated sources even if their
wording overlaps. Recalculate this display filter when the primary Source changes;
show `No other updates yet.` when no other rows remain.
A prose revision does not create a new thesis ID. Numbers and certainty
must remain supported; reported trades are not independently verified executions.
Before paraphrasing, preserve each material claim's subject, action/negation,
certainty and condition, transaction stage, numerical basis and time scope.
Map every card claim to exact source evidence. Select the latest analysis or
concise thesis statement that supports the card's core judgment and decisive
reason for its date, Source link and ordering. A newer holding update remains in
Timeline; it cannot replace the main source of a reasoned thesis. A long post about
another driver is also insufficient. Recheck the anchor after changing the prose.
Resolve entity images through the three documented APIs in the generation contract.
Match identities and retain declared fallbacks when the API supplies no picture.
For original post images, inspect only candidate sources whose text or metadata
suggests a required/helpful visual. Include a source image only when it materially
explains the accepted thesis/update; record explicit omit reasons otherwise.
Check both the preview and body against these distinctions. Run a final
reader-only edit after source review: remove internal review instructions while
keeping the actual unresolved condition. Do not invent evidence to fill a gap.

### 5. Review Independently Of The Draft

Give the review pass the original sources, necessary context, nearest existing
and pending records, proposed entity bindings, and before/after history. Have it
first reconstruct the judgment from evidence, then compare the draft. Do not feed
only the writer's summary or confidence score.

Default to a distinct source-first review in the current task. For speed, review
all changed candidates and uncertain items deeply, plus a bounded representative
sample of cheap-pass rejections; do not perform full expensive prose review on
every exact duplicate or obvious no-judgment source. Use a separate
agent only when the user has authorized that workflow; respect requests to work
directly. A same-context second pass is not independent-agent validation.

Decisions: approve, revise, reclassify/merge, hold, or reject. Approval requires
source-backed authorship, grouping, asset mapping, fidelity, chronology and clear
copy. Polished prose cannot compensate for unsupported attribution. The reviewer
checks faithful extraction, not whether the investment will ultimately win.
Changed drafts return to review; cap repeated rewrite cycles and preserve
unresolved items as holds.

Sample discarded/context decisions as well as approvals, across channels, dates,
short replies, losses and low-frequency material. Otherwise the reviewer cannot
detect first-stage omissions. Separate processing coverage, grouping quality,
editorial quality and measured semantic accuracy; do not manufacture a score.

### 6. Validate And Deliver

Assemble the [output contract](references/output-contract.md) in local files, not
one giant generated answer. Validate the packet:

```bash
node <skill-root>/scripts/validate-packet.mjs <packet.json> --require-history-coverage --require-generation-contract --require-prose-limit --require-run-review
node <skill-root>/scripts/validate-packet.mjs <packet.json> --baseline <previous-packet.json> --require-history-coverage --require-generation-contract --require-prose-limit --require-run-review
node <skill-root>/scripts/build-presentation.mjs <packet.json> <presentation.json>
```

Fix hard failures before calling any record reviewed. The validator checks
evidence references and structural invariants, not semantic truth or source
authenticity. Preserve the source-first review record separately.
Validate the final assembled packet, after supplements, merges and prose edits.
A custom source-count checker is not a substitute for the canonical validator:
each record starts with exactly one FIRST_OBSERVED. During initial assembly,
use the earliest supported observation and classify later statements as
continuations. If adding older sources would require changing protected events
in an existing baseline, retain them for an explicit history-repair review;
do not silently relabel stored events or bypass baseline validation.

With a baseline, normal generation is append-only for every historical event,
including its prose and ticker bindings. Current-card summaries may change.
Only an explicitly authorized, archived editorial correction may use
`--allow-editorial-corrections`; do not silently enable it to pass validation.
Missing context or missing primary-source eligibility remains a hold, not an
invented card. The presentation builder never invents missing content or images.

Deliver actual English cards with original-source links, author Timeline, and
separately attributed outside Signals where supported. Include author/source
coverage, new versus matched/merged counts, important changes and unresolved
gaps. Do not equate candidate count with unique approved thesis count.

Backfill approval covers research and local artifacts. Publishing a playbook,
writing to Notion, changing a cloud schedule or notifying others requires the
corresponding user authorization. Do not deploy the prototype by default.

Report performance receipts: source revisions, exact duplicates skipped, cache
hits, triage candidates, targeted context/image inspections, deep reviews, holds,
retries and elapsed time by stage. These distinguish faster processing from a
silently narrower search.

## Existing Prototype Integration

Read [prototype-integration.md](references/prototype-integration.md) before using
`thesis-field-notes/` scripts or producing its `app_en` payload. Those files include
curated seed builders and dated checkpoints; they are not a universal author
backfill command. Never replace reviewed history by blindly rerunning a seed
builder or mark newly discovered posts seen before durable processing succeeds.

For skill evaluation, use [evaluation-cases.md](references/evaluation-cases.md).
