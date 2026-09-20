# Stance Opening Contract 1.4

Use this contract for every new or rewritten public main card and Timeline
update. It is a shared generation, update and final-review rule. It adds no
separate model call.

## Structured Plan Before Prose

The writer first returns an internal `opening_plan`:

```json
{
  "version": "source-backed-opening/1.4",
  "subject": "Zoetis",
  "stance": "bearish",
  "judgment_axis": "capital_allocation",
  "directional_state": "weakening",
  "mechanism": "Poor capital allocation compounds a deteriorating outlook.",
  "stance_clause": "Zoetis looks weak",
  "mechanism_clause": "as poor capital allocation compounds a deteriorating outlook",
  "stance_realizations": [
    {"ticker": "ZTS", "stance": "bearish", "text_span": "Zoetis looks weak"}
  ],
  "mechanism_location": "same_sentence",
  "opening_family": "company_state"
}
```

The plan is working metadata, not visible UI. It must be source-backed and is
part of the review-input hash. A policy or plan change invalidates the previous
review.

`stance_clause` is the exact opening prefix and independently communicates the
investment landing when all ticker tags, direction words and icons are hidden.
`mechanism_clause` is an exact later span in the same sentence and begins with a
causal or conditional connector. `stance_realizations` exactly matches the
displayed ticker set and binds each ticker's reviewed direction to an exact span
inside `stance_clause`. Tags never count as reader-facing stance.

## Reader-Facing Rule

State the subject, specific investment direction and decisive mechanism in the
first sentence. Later sentences may add evidence, conditions or risk, but they
must not be needed to identify the main causal relationship. Do not compress
prose into one `because` template merely to pass the gate.

Prefer a natural source-owned judgment axis. Bullish, Bearish or Neutral may be
used when the tracked author explicitly used the same word in that expression,
the opening plan records `source_explicit_direction: true`, and the same sentence
states a concrete mechanism. Never copy the word from ticker metadata or use it
as a standalone label. Lead with the source-owned judgment axis and its
investment consequence, such as `the earnings outlook is improving`, `valuation
is stretched`, `competitive pressure is increasing` or `risk/reward is balanced`.
Generic company-first templates such as `X has upside`, `X could benefit`, `X
looks stronger`, `X is well positioned`, `X is execution-dependent` and `X offers
an opportunity` fail even when the following clause contains a real mechanism.
A factual statement such as `pricing rose 125%` or `the advertising franchise
remained intact` is evidence-first and fails unless a directional investment
clause precedes it.

The opening must stand on its own: name any counterparty, product or event whose
identity is needed to understand the mechanism. An unnamed "the partnership"
followed by a sentence identifying the partner fails even if the two sentences
together are factually correct. Do not replace the missing identity with an
invented one; hold the claim for source review if it cannot be resolved.

Review the rendered opening plus body as a single passage. Each subsequent
sentence should add distinct source-backed evidence, a causal step, a material
condition or risk. Integrate or remove an echo of the opening, but first move
any unique fact it contains into the retained prose. A short source may warrant
short copy rather than a filler sentence. Natural transitions matter more than
maintaining a fixed number of sentences or paragraphs.

## Timeline Historical Snapshot

A Timeline row uses `source-backed-timeline-opening/1.3` and follows the same reader-facing order, but its per-ticker direction
is independently parsed from that dated source and never inherited from the
current card. Its first sentence states the
source-date investment implication and decisive mechanism using that event's
reviewed `what`, `why` and material increment. It should read as a historical
research update, not as a fact dump followed by an interpretation.

Name the company or investment object in the opening whenever the record is not
already unambiguous from the sentence. Name a counterparty, product or event when
the causal relationship depends on it. Preserve source-date tense and certainty;
do not make an old conditional view sound like a current conclusion.

After the opening, retain only distinct source-backed evidence, numbers,
conditions, corrections or risks. Remove portfolio operations and any sentence
that merely restates the opening. A source with one concise increment may remain
one sentence rather than receiving filler prose.

Prefer a specific operating, valuation, execution, demand, supply, financing,
competitive, regulatory, product, customer-adoption or capital-allocation state.
`Looks attractive/unattractive` is allowed when the same sentence gives a
specific source-backed mechanism. Reject a bare or circular attractiveness label,
`the case for X is strong/weak`, and promotional synonyms such as appealing and
compelling. Control attractive/unattractive through the same corpus-frequency
review as every other opening family rather than banning it.

Direct `Bullish on`, `Bearish on` and `Neutral on` language is valid only with
exact same-expression support and an immediate mechanism. Use opening family
`direct_source_label`, retain the supporting quote and set
`source_explicit_direction: true`. Without those fields it remains metadata
leakage and fails.

## Corpus Review

Adjacent cards may not use the same normalized opening family. More than two uses
of one family in a rolling ten-card window, or more than 12% of the complete feed,
requires an explicit corpus-level editorial decision. The check creates a review
queue; it must not automatically rotate synonyms or rewrite source-faithful prose.

## Timeline Sequence Diversity

`source-backed-timeline-opening/1.3` governs each row; sequence review governs the
rows together. A valid row can still make the Timeline read like generated copy
when neighboring rows repeat `Company remains favored because ...`.

- Reject adjacent rows with the same normalized opening family.
- Reject three consecutive subject-first causal rows, even when their adjectives
  or connectors differ.
- Condition-first, driver-first and consequence-first forms are valid when they
  preserve the exact dated judgment and reason.
- Never rotate synonyms automatically. If the underlying increment is repeated,
  coalesce or keep it source-only. If the increment is distinct, redraft from its
  own mechanism.

## Performance

Opening planning is part of the existing generation call. Professional-language
and source checks are part of the existing independent review call. Deterministic
sentence, skeleton and release-consistency checks run locally. Unchanged records
reuse source-bound review only when source, history, prose, plan and policy hashes
are unchanged.
