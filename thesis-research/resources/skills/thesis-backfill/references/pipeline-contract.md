# Thesis Pipeline 2.0

The quality-preserving fast path uses six durable artifacts:

1. `archive.json`: normalized, deduplicated originals, context and attachments.
2. `triage.json`: one compact source decision per archived source; no prose.
3. `facts.json`: `reviewed-thesis-facts/1.0`, the approved semantic ledger.
4. `packet.json`: facts plus generated language, media decisions and review maps.
5. `presentation.json`: deterministic current/detail projection.
6. `playbook-data.json` and `feed-projection.json`: seven-field cards and temporal Feed.

## Performance Rules

- Cache archive and source review by immutable source hash.
- Retry only failed batches; never restart completed source work.
- Reuse unchanged source-first and final-public reviews by their exact input hash.
- Run deep model review only on candidates, uncertain context, changed facts and
  rewritten public expressions. Deterministic duplicates/no-judgment rows stay
  accounted without expensive prose review.
- Before Language, run candidate closure against the exact triage artifact. A
  complete candidate must be public, pending or carry an exact-evidence hard
  exclusion; a plan-level `source_only` label is not sufficient.
- Generate one global temporal language plan, then write disjoint record batches
  in parallel. Merge them before the global diversity gate.
- Pack independent fact groups and language records by character/token budget,
  normally 3-4 items per model call. Validate and checkpoint each returned item
  independently; preserve valid rows and retry only failed IDs.
- Size a pack from its actual deduplicated serialized payload, including shared
  sources, rather than summing duplicated per-item estimates. On a technical
  whole-pack failure, bisect the failed IDs; do not restart accepted work.
- Use short aliases for model-facing source IDs. Canonicalize supported schema
  aliases, scalar/array variants and ticker identities before deciding a retry.
- If a model joins several cited snippets into one evidence field, recover one
  contiguous verbatim directional span from the event's allowed sources. Never
  accept a paraphrase or evidence from outside the expression-local source set.
- Models return semantic deltas only. Deterministic code owns stable IDs, record
  wrappers, history receipts, media inventory and opening-plan construction.
- Apply the final public process-language and boilerplate checks inside Language
  acceptance so invalid prose is retried by record, not repaired after assembly.
- Assembly, preview generation, export, Feed projection and release checks are
  deterministic scripts, not model tasks.
- `gate-run` preserves an existing hash-bound presentation by default. Set
  `rebuild_presentation: true` only before final review or when intentionally
  invalidating that review.

## Quality Gates

No stage may waive candidate conservation, exact evidence, grouping, expression-
local ticker/direction/media, chronology, prose length, temporal diversity,
future-leakage prevention or final rendered review.

Real authors and tickers are regression fixtures only. Validator behavior must
remain unchanged when author IDs, ticker symbols, dates and record IDs are renamed.

The normal target for a medium one-month author run is one triage call, one facts
plan/review pair, 3-4 packed facts calls, one language plan and 3-4 packed language
calls. Additional calls are item-scoped repairs, not full-stage reruns.
