# Concrete Language And Source Support

Apply this before drafting, then review the finished prose without looking at the
source. The reader should not need the source thread to decode the explanation.

## Explain The Referent And The Action

For each important statement, establish who does what, what the named thing is,
why it affects the investment, its actual stage, and when it was known. These are
working notes, not a five-part template to display.

- Name companies before calling them providers, operators or developers. Explain
  their business once: IREN, Nebius and CoreWeave rent access to AI computing.
  `Developers` may mean software programmers; say companies building data centers
  when that is the intended meaning.
- Expand compressed financial or operational language into the actual arrangement.
  `Secured power` may mean signed power agreements or grid connection rights. It
  does not automatically mean all proposed capacity is energized and ready to use.
  Preserve the documented distinction between planned, contracted, approved,
  connected and operating capacity.
- Introduce projects through their role and relevant parties. With the documented
  context, `Microsoft accepted Horizon 1, the first of four data-center phases IREN
  is building for it in Childress, Texas` explains more than `the first Horizon
  phase has been delivered`. Acceptance does not by itself prove recognized revenue
  or profitability. Include the location only if it helps and is supported.
- Replace `execution` with the task: finish construction, get a permit, pass a
  customer test, ship equipment, begin serving customers or collect payments.
  Replace `monetization` with who pays for what. Explain revenue, margin, borrowing
  or competitive effects only as far as the author's evidence supports them.
- Pronouns and phrases such as `that gives`, `those assets` and `this opportunity`
  require one clear nearby antecedent. A new card or historical detail cannot rely
  on a previous screen to supply it.

Do not turn these examples into word bans or replacement templates. `Provider`
is useful after the company and service have been established. An accurate passive
sentence is preferable to inventing an actor. Do not replace a term with a simpler
but false claim, such as turning a power agreement into usable electricity.

## Write Only What The Content Needs

Open with the investment judgment and apply the shared
[stance opening contract](stance-opening-contract.md). Make the direction clear
in the first clause. Put the decisive reason in the same first sentence and name
the counterparty, product, transaction or constraint needed to understand it.
Use later sentences only to add distinct evidence, causality, conditions or risk.
Short transactions or holding
updates can be one or two sentences; they do not need an invented rationale.
Longer theses can use a short opening followed by connected supporting paragraphs.
Do not force paragraph counts, a fixed sentence sequence or a minimum word count.

Every sentence should add a fact, explain a cause or preserve a material condition.
Remove generic closing lines such as `success depends on execution` when they say
nothing beyond the preceding explanation. Avoid slogans, formulaic contrasts,
repeated could/can/benefit openings, narrator commentary and audit boilerplate.
Professional means accurate and clear, not formal, distant or acronym-heavy.
Bare attractive/unattractive labels, circular case language and passive support
language are not professional substitutes for a specific mechanism. A
mechanism-specific attractive/unattractive sentence remains valid when it is not
overused across the feed.

Keep source-backed uncertainty in the relevant clause. Do not strengthen `may`
into `will` or infer revenue from a delivery milestone. Context that is missing
must be recovered from evidence or omitted, not filled with a plausible story.

The opening must be understandable as a standalone conclusion. `An agent chooses
stores and products` is background; `Shopify could lose influence because shopping
agents may control product discovery and merchant choice` is a conclusion.
`ChatGPT uses PitchBook` is a fact; `Morningstar's data-licensing outlook improves
because AI financial assistants may license PitchBook rather than rebuild it`
states the investment implication. Preserve source certainty and state the
professional judgment axis rather than falling back to `could benefit`.

## Primary Source Is Not Latest Activity

There are three separate questions:

1. Does the post contain something worth keeping in Timeline?
2. Which current-card claims does it support?
3. Does it support the card's central judgment **and its decisive reason** well
   enough to serve as the primary Source?

A buy, sell or hold confirmation can pass the first two and fail the third.
`Investor since 2024. Plan to hold through 2027` supports those holding facts. It
cannot anchor a card about power scarcity, financing or completed data centers.
Keep it as an update; do not discard it merely because it is not the main source.

A longer post also does not automatically qualify. A September 12 financing
analysis can support GPU prepayments and contract returns while providing no
direct support for `power is the biggest bottleneck`. Never attach a long or recent
post simply because it concerns the same company.

Select the newest source among candidates that actually support the core claims.
If no source covers the current central argument, do one of the following:

- Use an older source that supports it, with that source's actual date.
- With the user's editorial scope, revise the card's argument to match the evidence;
  do not silently replace a user-approved core thesis just to obtain a newer date.
- Hold the card for missing evidence. Do not fabricate support or claim the primary
  link proves every detail in a synthesis.

If the thesis is supported collectively but no single source can anchor its core,
retain the thesis and its complete claim map for review of source presentation.
That is a presentation gap, not a no-thesis decision or permission to discard it.

Keep `last_update_at` separate from the primary-source date. The one displayed date
uses the primary source for its label and ordering. The body footer still includes
all originals needed by the synthesis, not just that primary link. Follow
[source stability](source-stability.md) through final delivery; do not add another
visible date or replace the qualified analytical source with newer chatter.

## Map Claims Before Approval

For each sentence or independently meaningful clause in the current card, retain:
its exact display text, its role (core judgment, core reason, supporting fact or
position), and exact source spans with the roles each span supports. A source must explain the claim,
not just share a ticker or a few words. The claim map is internal evidence metadata,
not prose to append to the card.

Examples of separate support needs:

- Undervaluation because of power scarcity: the author's valuation and power argument.
- Customers prepaying part of GPU costs: the relevant financing statement.
- Microsoft accepting Horizon 1: the dated acceptance statement and project context.
- Holding through 2027: the author's holding-plan update.

All supporting facts must link to their own evidence in the retained history. The
single primary link anchors the central argument; it does not replace the others.
Preserve claim-to-source/detail mappings in exported presentation data. A historical
update uses only its own statement and context available at its date, never the
newest card's combined explanation.

## Two Required Reviews

Compile the `generate` stage prompt and then the `review` stage prompt with
`scripts/thesis-pipeline.mjs prompt`. Default to two distinct passes in the current
task; do not start other agents without authorization.

First, read the draft as a reader who has not seen the sources. Flag an unclear
actor, undefined project, compressed operation, missing cause, repeated filler or
needlessly complex explanation. Then open the original evidence and check each
claim, its certainty and the primary link. Review the first sentence and the primary
source together: each side constrains the other.

Reject source mismatch even if the language reads well. Recheck claim mappings
after every prose edit, because a changed opening can invalidate a previously
reasonable primary source. Formatting tests and quote matching enforce traceability;
they do not prove semantic entailment. Report measured review results and gaps,
not a promise that any prompt alone guarantees perfect prose or attribution.
