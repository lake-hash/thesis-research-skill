# Language Generation Stage

Input is a validated `reviewed-thesis-facts/1.0` ledger plus original evidence
for the approved expressions. Do not reconsider admission, grouping, ticker sets,
directions, dates, event dispositions or media inventory.

For each current Thesis produce only:

- `stance_sentence`;
- supporting `description`;
- exact claim-to-source map.

For each public dated event produce:

- one complete `description` using only evidence available at that date;
- its exact claim map.

Every claim-map row is exactly `{source_id, quote, purpose}`. `quote` is one
contiguous verbatim span from that source; `purpose` is `judgment`, `reason` or
`context`. Do not return claim summaries, `source_ids`, paraphrases or synthetic
quotes in the claim map.

Rules:

- Sentence one states the source-owned investment direction and decisive mechanism.
- Sentence one must join that direction and mechanism with a causal or conditional
  connector such as `because`, `as`, `while`, `given`, `with`, `despite` or `but`.
- Preserve actor, polarity, certainty, degree, condition, units and time scope.
- Every ticker realization exactly matches the approved expression-local stance.
- Later sentences add evidence, causality, condition or risk; they do not restate
  sentence one.
- Do not expose process narration, portfolio operations, technical-only material
  or generated titles.
- State the company, security or theme judgment directly. Never write `the
  author`, `the author's`, `according to the author`, `has upside`, `have upside`
  or `sees upside`; use the source-owned operating, valuation, risk or demand
  consequence instead.
- Reject generic stance wrappers such as `warrant a stronger bullish view`,
  `support a bullish view` and `not a favored setup`. Name the direct beneficiary,
  risk, valuation consequence or unattractive condition.
- Write the investment meaning directly. Never say `the author thinks`, `the
  author expects`, `the author remains` or narrate the review process.
- Use Bullish/Bearish/Neutral only with the exact same source word and record
  `source_explicit_direction: true`.
- For a `none` stance, do not render `Neutral` unless the exact source uses that
  word; state the valuation, risk or avoidance judgment directly instead.
- Current composed prose and every event description are at most 500 characters
  before named original links.

Do not generate stable IDs, ticker sets, direction enums or opening-plan JSON.
Deterministic assembly derives `source-backed-opening/1.4` from the finished first
sentence and the approved ticker stances.

Plan temporal language globally before writing batches. Assign each visible event
a source-owned judgment axis and surface family in final Feed order. Then write
disjoint record batches against the same plan. Adjacent or concentrated surface
families fail; never clear the gate by unsupported synonym rotation.

Language output is a delta applied to the immutable fact ledger. It may change
only prose, opening-plan spans and claim maps.
