---
name: thesis-review-publish
description: Perform agent-owned source and content review of thesis candidates, resolve attribution and grouping, and publish eligible changes within user-authorized scope with version and history safeguards. Use after backfill or incremental processing.
---

# Thesis Review And Publish

Act as the evidence gate between generated candidates and public Thesis content.

## Required Contract

Read the shared [Thesis core contract](../references/thesis-core-contract.md), then
the executable [review workflow](references/review-workflow.md). For product
handoff, also read the [ThesisCard contract](references/thesis-card-contract.md).

## Review Workflow

1. Reconstruct the claim from originals and contemporaneous context before reading
   the proposed prose as an answer.
2. Check attribution, source fidelity, company grouping, chronology, event-local
   ticker/direction, media relevance, what/why and Timeline increment.
3. Review the final composed visible passage. Current Thesis body is
   `stance_sentence + description`; Timeline uses the dated description. Enforce
   natural stance-first language and the shared 500-character limit.
4. Review every visible final card and Timeline row after grouping, source
   selection and overrides. Bind the decision to the exact presentation hash.
5. Return approve, revise, hold, merge or reclassify with a specific evidence-based
   reason. Edited content requires a fresh claim map and review hash.
6. Validate the reviewed fact ledger before language generation, then validate
   packet, presentation, batch, ThesisCard delivery and Feed projection.
   The chronological Feed uses `feedItems`; a selected item must be projected as
   a point-in-time current expression with only strictly earlier Timeline rows.
7. Publish only within the user's authorized scope. Verify readback and record a
   publication receipt matching the approved content hash and release version.

Audio/video review additionally loads
`../thesis-backfill/references/multimedia.md`. Unverifiable speech is skipped after
documented fallback attempts; it is not sent to the user for raw-text approval.

## Unified Commands

```bash
node ../thesis-backfill/scripts/thesis-pipeline.mjs validate packet.json
node ../thesis-backfill/scripts/thesis-pipeline.mjs presentation packet.json presentation.json
node ../thesis-backfill/scripts/thesis-pipeline.mjs final packet.json presentation.json final-review.json
node ../thesis-backfill/scripts/thesis-pipeline.mjs prepare-feed packet.json export-config.json NEW-output-dir
node ../thesis-backfill/scripts/thesis-pipeline.mjs delivery cards.json ingestion-manifest.json
node ../thesis-backfill/scripts/thesis-pipeline.mjs project-feed playbook-data.json feed-projection.json
```

The Feed owns interaction and styling. This skill owns the reviewed seven-field
cards, source coverage, stable identities, expression-local ticker/media values,
and the temporal Feed handoff contract. It does not publish a frontend change by
itself.
