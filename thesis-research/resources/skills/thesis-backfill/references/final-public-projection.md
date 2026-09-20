# Final Public Projection Gate

This is the final-expression implementation of the shared
[Thesis core contract](../../references/thesis-core-contract.md). It adds required
review fields and commands without changing the core quality boundary.

Run this gate after grouping, source selection, Timeline filtering, prose edits,
ticker binding and media selection. It reviews what the user will actually see,
not the generator draft or stored event bodies.

## Required Artifacts

1. The validated source-first packet.
2. The deterministic presentation from `build-presentation.mjs`.
3. A separately authored `final-public/1.3` review sidecar bound to the exact
   presentation SHA-256.

The sidecar declares `review_scope: all_visible_expressions`,
`total_visible_expressions` and `completed_expressions`. Both counts must equal
the deterministic final projection. Sampling is not approval.

The sidecar contains one decision for every visible main card and Timeline row.
Do not create it with an all-pass assembly loop. The reviewing agent reads the
final prose together with its original source and contemporaneous context.

Each review row records the visible expression ID, one source and matching date,
rendered tickers, explicit `what` and `why`, and for Timeline rows the material
`increment` plus `increment_kind` and `increment_domain: fundamental`. It records
`content_domain`, `conclusion_first`, the opening conclusion and opening reason,
as well as direct-voice, no-inference,
source-fidelity, ticker-completeness and media-completeness decisions. A Timeline
row without its own ticker may resolve to the canonical record only when the
company identity is unambiguous and `object_resolution: record` is explicit in
legacy packets. Generation 3.2 requires every Timeline expression to carry its
own ticker set.
Each row also records `media_sha256`, `media_count` and `media_gap_count` from
the deterministic presentation. The hash covers included media, retrieval gaps
and visual dependency, so changing or dropping an image invalidates review even
when prose and tickers are unchanged.
It also records `company_specific_increment`, `portfolio_operation_free`,
`process_language_free`, `prose_coherent`, `repetition_free`,
`related_context_excluded` and `why_specific`. It must additionally record:

- `why_complete_sentence: true`;
- `objective_fact_only: false`;
- `why_mechanism_type` as one concrete economic, operating, valuation,
  competitive, demand, supply, risk, regulatory, financing, product, customer or
  capital-allocation mechanism;
- `ticker_roles`, with a source-specific reason for every ticker. Only `subject`
  and `vehicle` roles may appear as public ticker tags. `comparison`, `benchmark`,
  `customer`, `supplier`, `partner` and `context` stay out of rendered tags unless
  the source separately makes them investment subjects.

These are independent checks, not aliases for `content_domain: fundamental`.
The deterministic gate also scans rendered prose for fragments, objective
fact-only reasons, repeated sentences, portfolio operations and extraction/review
narration. A sidecar boolean cannot override a detected text failure.
Every expression records `specific_directional_state`,
`mechanism_visible_early`, `professional_voice`, `natural_collocation`,
`non_tautological`, `non_template`, `relationship_complete` and
`continuation_advances`. Timeline rows apply these fields to the source-date
historical snapshot without inheriting the current card stance.

Main-card rows additionally record `stance_sentence` and
`opening_contract: source-backed-opening/1.4`, exact stance/mechanism clauses,
per-ticker realization spans and `metadata_hidden_direction_clear`. Per-ticker directions, rather than
one global card enum, are part of the presentation hash. They also record the exact
`opening_plan`.
Every main card and Timeline row records
`ticker_stance_contract: per-expression-ticker-stance/1.0` and one source-backed
`bullish`, `bearish` or `none` direction per displayed ticker.
When visible prose uses Bullish, Bearish or Neutral, the row also records
`source_explicit_direction: true`; the deterministic gate verifies that the same
word appears in the exact expression source and matches an expression-level ticker
stance. A review boolean cannot authorize wording absent from the original.
Corpus concentration warnings require a reviewed
`opening_distribution_review`; they never authorize automatic synonym rotation.
Timeline sequence warnings require a reviewed `timeline_distribution_review`
with contract `timeline-opening-diversity/1.0`, the exact record IDs reviewed,
warning count and reason. Deterministic errors block delivery before that review:
adjacent rows cannot repeat one opening family, and three consecutive rows cannot
reuse a subject-first causal template. Timeline variety must come from distinct
source logic, not mechanical synonym rotation.
Timeline rows record `timeline_opening_contract:
source-backed-timeline-opening/1.3`, exact stance/mechanism clauses, per-ticker
realization spans, `metadata_hidden_direction_clear`, `direction_visible_immediately`,
`mechanism_visible_immediately`, `relationship_complete` and
`continuation_advances`. They are evaluated against their dated what/why and may
not inherit the current card's stance.

## Fail-Closed Rules

Block delivery when any visible expression:

- lacks a reviewed what and why;
- is a Timeline row whose first sentence does not contain that date's directional
  implication and decisive mechanism;
- does not state the direction, decisive reason and necessary named relationship
  in the first sentence;
- contains technical-analysis or trade-setup content;
- is a Timeline row without a reason/evidence/condition/correction increment;
- is bound to a different source or date than the reviewed expression;
- repeats the current-card source in Timeline;
- contains source-process, third-person-author or reviewer/audit narration;
- adds unsupported meaning, has incomplete ticker coverage, or unresolved media;
- drops included media between packet, presentation and final review, or carries
  media/gap counts that no longer match the reviewed expression;
- exceeds 500 prose characters or contains a generated title;
- is not covered by the exact final-presentation review hash.
- opens with or retains portfolio operation language such as position size,
  allocation, margin, entry timing, realized return or buying plans;
- uses an abstract reason that does not identify an economic, operating,
  valuation or risk mechanism;
- imports sector, ETF, financing, peer or policy context without a
  company-specific thesis increment;
- carries a release version ending in `-candidate` at delivery, or disagrees
  with the catalog version.
- lacks a ticker, lacks one `bullish`, `bearish` or `none` direction for every
  ticker, or has a direction not supported by the expression's own source;
- uses repetitive or opaque body language after the stance sentence, or a first
  body sentence that does not advance the investment logic;
- uses bare/mechanism-free attractive/unattractive or case-strong/case-weak stance
  language, circular explanation, passive support language or an unreviewed direct
  label;
- lacks the exact opening plan and professional-language review bound to the
  presentation hash;
- presents a Timeline fact first and delays the investment implication or
  mechanism to a later sentence;
- rewrites a Timeline row by copying the current card stance rather than using
  the historical event's reviewed what, why and increment;
- repeats an adjacent Timeline opening family or forms a three-row run of the
  same subject-first causal sentence shape;

Changing prose, source, date, tickers, grouping, media or Timeline visibility
invalidates the sidecar. Re-review affected expressions and regenerate the hash.

## Commands

```bash
node scripts/validate-packet.mjs packet.json \
  --require-history-coverage --require-generation-contract \
  --require-prose-limit --require-run-review
node scripts/build-presentation.mjs packet.json presentation.json
# Review presentation.json against originals and write final-review.json.
node scripts/final-public-projection.mjs \
  packet.json presentation.json final-review.json
node scripts/validate-batch.mjs batch.json
```

Run the same final projection validation against the payload read back from the
published destination with `--published`. Local validation is not release proof.
Published validation requires `release_status: released` and the same
`release_version` in the packet, presentation and review artifacts.
Run `release-consistency.mjs` on the released catalog and README as a separate
metadata gate.
