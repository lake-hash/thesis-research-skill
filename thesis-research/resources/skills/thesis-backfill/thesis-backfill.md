# Detailed Backfill Workflow

Use this only when executing a backfill. Shared quality rules live in the core
and runtime contracts; do not copy them into run-specific prompts.

## 1. Archive

- Resolve the person and verified source channels.
- Record exact requested start/end, actual accessible bounds and gaps.
- Preserve original text, authorship, URL, source date, thread/quote context,
  attachment inventory and revision hash.
- Paginate until the declared scope closes. Checkpoint pages and retry only failed
  portions. Empty/truncated output is a processing gap, not `no_judgment`.
- Deterministically remove exact duplicates, empty rows and uncommented reposts
  from semantic model work while retaining their source dispositions.

For large archives, use [fast-extraction.md](references/fast-extraction.md). For
recorded speech, normalize and verify speaker turns with
[multimedia.md](references/multimedia.md) before triage.

## 2. Triage

Compile `prompt triage` and process bounded source batches. Merge the model result
with deterministic ticker/thread hints. Run context recovery only for
`needs_context`. Do not draft or group records here.

Checkpoint by immutable source hash. An unchanged source reuses its triage result.

## 3. Source Review And Facts

Compile `prompt facts`. Review candidates by resolved author/object dossier,
including active, pending and same-run matches. Produce one
`reviewed-thesis-facts/1.0` ledger for the run and validate it:

```bash
node scripts/thesis-pipeline.mjs facts facts.json archive.json
```

The ledger is the semantic source of truth for grouping, primary source, events,
what/why, increments, ticker directions and evidence. Language generation cannot
change these fields.

Run candidate conservation against triage. A complete candidate absent from the
fact ledger remains pending or receives an exact evidence-bound hard exclusion.

## 4. Media

Inventory expression and quote/reply attachments after facts are approved.
Generate contact sheets when useful and batch visual inspection. Each attachment
gets an image-specific include, omit or retrieval-gap decision. Media never
supplies missing what, why, ticker or direction.

## 5. Language

Compile `prompt generate`. First plan judgment axis, syntax and surface family for
all public dated events in final Feed order. Then generate record batches in
parallel using that same plan. Apply only prose/opening/claim-map deltas to the
approved ledger.

After merge, run packet, opening, source-fidelity, prose, Timeline and temporal
Feed diversity gates. A failed expression returns to language generation; source
review is reused when its fact hash is unchanged.

## 6. Review And Delivery

Compile `prompt review` and review all visible expressions against the exact
presentation. Assemble a `run.json` manifest:

```json
{
  "triage": "triage.json",
  "candidate_review": "candidate-review.json",
  "packet": "packet.json",
  "presentation": "presentation.json",
  "final_review": "final-review.json"
}
```

Then run:

```bash
node scripts/thesis-pipeline.mjs gate-run run.json
```

Prepare/export/project Feed only after all gates pass. Verify publication
readback and UI interaction only when publication is in the user's authorized
scope. Report source counts, cache hits, candidate counts, deep reviews, holds,
media inspections, retries and elapsed time by stage.
