---
name: thesis-update
description: Process new investor statements into company-grouped thesis events and reviewed ThesisCard export candidates. Use for incremental updates, source repairs and pending-item resolution after an author baseline exists.
---

# Thesis Update

Process new sources against an existing author/company history. The unit is an
investment judgment, not a post.

## Required Contract

Read the shared [Thesis core contract](../references/thesis-core-contract.md) and
the [incremental workflow](thesis-update.md). The core contract owns admission,
language, grouping, ticker/media and delivery rules. Do not restate or weaken them
inside an update run.

## Update Workflow

1. Load the last successful checkpoint, overlap window, current records, pending
   candidates, aliases and immutable event history.
2. Collect and normalize only new/overlap sources. Preserve original revisions and
   deduplicate representations of the same statement event.
3. Match each source to the canonical author/company history before considering a
   new record.
4. Apply the core subtraction test. Portfolio actions, technical-only changes and
   repeated conviction remain private unless an independent company-specific what,
   why and material increment survive.
5. Draft changed candidates using the backfill generation contract and prompts.
   Each dated update derives its own ticker set, direction, stance-first opening,
   source date and media.
6. Re-review changed content. Unchanged content may reuse review only when source,
   prose, opening plan, ticker, media and policy hashes are identical.
7. Validate against the baseline and batch catalog; then prepare Feed output when
   requested.

## Conditional Modules

- Increment decisions: `../thesis-backfill/references/update-increment-review.md`
- Large batches: `../thesis-backfill/references/fast-extraction.md`
- Audio/video: `../thesis-backfill/references/multimedia.md`
- Feed export: `../thesis-review-publish/references/thesis-card-contract.md`

## Commands

```bash
node ../thesis-backfill/scripts/thesis-pipeline.mjs validate packet.json --baseline previous.json
node ../thesis-backfill/scripts/thesis-pipeline.mjs batch batch.json
node ../thesis-backfill/scripts/thesis-pipeline.mjs prepare-feed packet.json export-config.json NEW-output-dir
```

Review approval, export readiness, publication and notification remain separate
facts. Preserve the user's current authorization boundary.
