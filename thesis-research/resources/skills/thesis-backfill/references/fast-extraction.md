# Fast Extraction Pipeline

Use this pipeline for large backfills and updates. It preserves high recall while
spending deep reasoning only on material candidates.

## 1. Normalize And Cache Once

- Fetch and archive sources independently by channel. Normalize text, dates,
  authorship, thread/quote links and attachment metadata deterministically.
- Hash each source revision. Cache all downstream results by source hash, policy
  version, identity-map revision and catalog revision.
- On reruns process only new/edited sources plus a small overlap window. Never
  resend unchanged full archives to a model.
- Collapse exact copies and alternate representations of the same canonical event
  before semantic work. Preserve provenance and choose one triage representation.

## 2. High-Recall Triage In Large Batches

The first semantic pass is cheap and short. It does not draft prose. For each
unique statement return only:

`source_id`, author-owned/other, candidate/no-judgment/needs-context,
resolved/inherited/unresolved investable-object status, ticker/object hints, what
present, why present, possible-update increment, visual relevance hint, and
required parent/quote IDs.

Batch compact social posts up to the current model/context limit, typically
20,000-40,000 source characters or 50-100 short posts. Use smaller batches for
long documents/transcripts. Run independent batches concurrently when the
environment permits. Never discard a source merely because the cheap pass is
uncertain; route it to `needs-context`.

Standalone broad-market, macro, policy-calendar, event-risk, sector-rotation or
theme commentary with no specific investable object is not uncertain: classify it
`no_judgment` immediately, write the omission reason to the run ledger and do not
send it to context retrieval, image review or deep generation. Only use
`needs-context` when a reply/thread may resolve the missing object.

Deterministic rules may remove exact duplicates, malformed/empty records and
known non-author copies. Do not use a narrow keyword filter as the only recall
gate. Sample triage rejects across dates/channels to detect omissions.

Use the union of two recall paths before discarding content: deterministic
object/ticker/thread hints and semantic triage. Any `no_judgment` result that
contains a resolved object plus subjective, causal, valuation or technical
language receives a second triage review. The source-disposition ledger must
account for every normalized source ID; a high-recall candidate can be rejected
later, but an unreviewed source cannot silently disappear.

## 3. Resolve Context Only Where Needed

Retrieve reply parents, quote roots, full thread sections, transcript turns or
images only for candidates and `needs-context` items. Inspect an image when text
depends on it or the image may materially improve the accepted event. Do not OCR
or vision-review every archived image.

## 4. Match Before Drafting

Build an in-memory index of active/pending objects and aliases once per run.
Resolve author + company/theme and compare candidates before generating prose.
Group candidates by canonical object, then send each group with only its relevant
history. Do not repeatedly load the whole catalog for every post.

## 5. Deep Extraction And Review Only Candidates

For candidate groups, reconstruct exact what/why or material update increment,
event-specific tickers and conditional media decisions. Draft after evidence is
mapped. Use a stronger reasoning pass for accepted/uncertain candidates and a
bounded sample of rejections; do not deep-review every obvious no-judgment item.

Run source-fidelity/editorial review only on changed records and their affected
history. A prose edit rechecks mapped claims, not the entire author archive.

## 6. Checkpoint And Measure

Persist after each stage. Report source revisions collected, exact duplicates
skipped, cache hits, triage candidates, context fetches, images inspected, deep
reviews, accepted thesis/update counts, holds, retries and elapsed time per stage.
Retry only failed batches, normally twice, then retain the gap and continue.

The speed target is fewer expensive tokens and network reads, not lower evidence
standards. Missing context is a hold, never a fast negative decision.

Create deterministic batch plans and apply the compact triage prompt:

```bash
node <skill-root>/scripts/plan-fast-extraction.mjs packet.json triage-plan.json
node --test <skill-root>/scripts/test-fast-extraction.mjs
```

Compile `node scripts/thesis-pipeline.mjs prompt triage` for each planned batch. The
planner removes exact canonical-event copies, honors revision/policy cache keys,
isolates empty extraction gaps and packs bounded batches. It makes no semantic
content decision.
