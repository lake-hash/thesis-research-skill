# Final Public Projection Gate

Run this gate after grouping, source selection, Timeline filtering, prose edits,
ticker binding and media selection. It reviews what the user will actually see,
not the generator draft or stored event bodies.

## Required Artifacts

1. The validated source-first packet.
2. The deterministic presentation from `build-presentation.mjs`.
3. A separately authored `final-public/1.0` review sidecar bound to the exact
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
company identity is unambiguous and `object_resolution: record` is explicit.

## Fail-Closed Rules

Block delivery when any visible expression:

- lacks a reviewed what and why;
- does not state the conclusion and decisive reason in its first sentence;
- contains technical-analysis or trade-setup content;
- is a Timeline row without a reason/evidence/condition/correction increment;
- is bound to a different source or date than the reviewed expression;
- repeats the current-card source in Timeline;
- contains source-process, third-person-author or reviewer/audit narration;
- adds unsupported meaning, has incomplete ticker coverage, or unresolved media;
- exceeds 500 prose characters or contains a generated title;
- is not covered by the exact final-presentation review hash.

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
published destination. Local validation is not release proof.
