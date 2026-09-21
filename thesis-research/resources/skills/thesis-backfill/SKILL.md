---
name: thesis-backfill
description: Backfill a person's public investment views from X, podcasts, interviews, speeches and written sources into source-backed company theses and dated updates. Use for author-centric backfills, multimedia transcript extraction and omitted-thesis audits with verified attribution.
---

# Thesis Backfill

Recover an author's public investment history without duplicating records,
inventing reasons or rewriting dated evidence.

## Contracts

Read the shared [Thesis core contract](../references/thesis-core-contract.md).
Machine versions and limits are in `../references/thesis-policy.mjs`; validators
are the final gate. Read [pipeline-contract.md](references/pipeline-contract.md)
for artifacts, caching and retry behavior.

Compile model prompts instead of concatenating long references manually:

```bash
node scripts/thesis-pipeline.mjs prompt triage triage-prompt.md
node scripts/thesis-pipeline.mjs prompt facts facts-prompt.md
node scripts/thesis-pipeline.mjs prompt generate generate-prompt.md
node scripts/thesis-pipeline.mjs prompt review review-prompt.md
```

## Seven-Stage Workflow

1. **Archive:** verify identity and requested scope; normalize, deduplicate and
   checkpoint original text, dates, context, attachments and hashes.
2. **Triage:** classify every source with the triage prompt. No prose, grouping or
   publication decisions.
3. **Facts:** review originals source-first and produce
   `reviewed-thesis-facts/1.0`. Pack independent object groups, salvage valid
   group results and retry only failed IDs. Close every complete triage candidate
   as public, pending or an exact-evidence hard exclusion before writing prose.
   Resolve company identity before Language: one author plus one verified company
   has one active company Thesis even when record IDs, names or ticker-shaped
   object keys differ. Keep reviewed alias mappings with the packet; themes and
   baskets remain separate roles.
4. **Weekly grouping (optional Feed compression):** after event-level Facts
   review, group only same-author, same-company, same-UTC-week expressions with
   identical expression-local ticker directions. Keep every raw event and source
   ID; split reversals, new actions, conflicting conditions and different ticker
   directions. Use `weekly-group` before Media/Language when the product wants a
   compact weekly Feed.
5. **Media:** inspect attachments only for approved expressions or weekly groups;
   record include, omit or retrieval gap against exact attachment IDs.
6. **Language:** create one global temporal language plan, then generate packed
   record or weekly-group batches from approved facts. Models return prose and
   exact claim maps; deterministic code builds opening plans. Merge and run the
   global diversity gate. A weekly summary must cover every member increment or
   leave the event in a separate group.
7. **Delivery:** assemble packet deterministically, build presentation, complete
   hash-bound final review, export ThesisCards and project the temporal Feed.

Never replace failed facts with polished language. Candidate conservation,
expression-local ticker/direction/media, chronology, exact evidence, 500-character
limits and final rendered review remain mandatory.

## Conditional Modules

- Large archive: [fast-extraction.md](references/fast-extraction.md).
- Audio/video: [multimedia.md](references/multimedia.md).
- Source images: [selection-and-source-media.md](references/selection-and-source-media.md).
- Packet schema: [output-contract.md](references/output-contract.md).
- Product export: [ThesisCard contract](../thesis-review-publish/references/thesis-card-contract.md).
- Prototype migration only: [prototype-integration.md](references/prototype-integration.md).

Load only the relevant module.

## Commands

```bash
node scripts/thesis-pipeline.mjs facts facts.json archive.json --triage triage.json --candidate-review candidate-review.json
node scripts/thesis-pipeline.mjs canonicalize-history packet.json canonical-packet.json aliases.json
node scripts/thesis-pipeline.mjs weekly-group packet.json weekly-grouping.json
node scripts/thesis-pipeline.mjs pack packed-stage-spec.json packed-stage-plan.json
node scripts/thesis-pipeline.mjs validate-backfill packet.json --triage triage.json --candidate-review candidate-review.json
node scripts/thesis-pipeline.mjs gate-run run.json
node scripts/thesis-pipeline.mjs prepare-feed packet.json export-config.json NEW-output-dir
node scripts/thesis-pipeline.mjs project-feed playbook-data.json feed-projection.json
node scripts/thesis-pipeline.mjs test
```

`gate-run` is the default final validation path. Publication, notification and
schedule changes remain separate authorized actions.
