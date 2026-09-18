# Generation Prompt

For Thesis Playbook output, [single-source.md](../references/single-source.md)
supersedes the multi-source footer instructions below. Summarize one selected
expression and display one named original link, with its matching date. Do not
retain cross-date synthesis after hiding extra links. Keep private evidence.

Apply [current-run review](../references/run-review.md). Keep claim/event
reconstructions and specific support explanations; generic pass flags are not
review. Bind completed review to the finished input, record Signals searches
(including empty results), and validate the whole batch against active/pending
objects. Do not approve repeated assets disguised as baskets. All product outputs
must pass the current review and 500-character gates.


Apply [source stability](../references/source-stability.md). Every current clause
that uses an earlier statement must keep that original in the final body footer,
not only in Timeline. Prepare input 1.1 from the complete claim map; do not reduce
it to the selected primary source. Preserve document/excerpt hash scope explicitly.

Apply [Source Fidelity Contract 1.0](../references/source-fidelity-contract.md).
Before writing public prose, reconstruct the source claim tuple: subject, owner,
predicate, polarity, certainty, degree, condition and time scope. Never add
`the author`, `the author's`, `according to the author`, `the source`, `the post`
or another attribution/possessive that is not in the source. Never convert
`the biggest negative catalyst for gold` into `the author's largest negative
catalyst`. Superlatives and certainty words must be directly supported by exact
source evidence. If a faithful paraphrase is not possible, hold the claim.

For recorded speech, first follow [multimedia.md](../references/multimedia.md).
Work from reviewed speaker turns, not episode descriptions. Keep interviewer
questions as context; do not convert them into the guest's opinion. Check ASR
names, numbers and negation against audio or a verified corresponding full
transcript; skip the interview if neither is reliable. Preserve speaker, segment and playback
locators for every claim. Reconcile episode batches into the existing author/company
history; a podcast and an X clip of it are not two independent expressions.

Use with the actual source archive, verified author/company identities, current
records and merge aliases, and the requested cutoff. Do not substitute summaries
for originals. Follow generation contract 3.2 and the local packet schema.

Set `generation_policy.version` to `3.2`, `public_scope` to
`source_grounded_company_analysis/1.0`, and `ticker_stance_contract` to
`per-expression-ticker-stance/1.0`. Do not generate technical-only Thesis or
Timeline rows. Mixed analysis may qualify only when the same source expression
contains an independently supported non-technical what and why.

Produce source-backed company theses and dated updates in insightful, descriptive,
professional plain English for an investor who has not read the source thread.
Return no `title` field on thesis or update records. It is not optional internal
metadata. Use descriptions for prose and stable IDs for references and export.

For every proposed public main card and every Timeline update, emit at least one
verified ticker and a `ticker_stances` entry for each displayed ticker. Each entry
is `bullish`, `bearish` or `none` and contains exact source evidence plus an
explanation. Thesis and Timeline ticker sets and directions may differ. In the same
generation response, emit `opening_plan` under
`source-backed-opening/1.3`: subject, judgment_axis, directional_state,
mechanism, `stance_clause`, `mechanism_clause`, `stance_realizations`,
mechanism_location and opening_family. `stance_clause` is the exact prefix of
`stance_sentence`; `mechanism_clause` is the exact causal or conditional clause
in that sentence; every ticker has one exact realization span inside
`stance_clause`. Then write `stance_sentence` from that plan. Ticker tags and
direction labels do not count as stance-first. `Looks attractive/unattractive` is
allowed when the same sentence gives an immediate specific mechanism; it must not
become the default family. Do not use bare attractiveness, appealing/compelling
or `the case is strong/weak` language. Do not copy Bullish, Bearish or Neutral
metadata words into public prose; express the source-backed direction naturally.
The first sentence shows the direction and decisive mechanism,
naming the counterparty, product, transaction or constraint needed to understand
the relationship. The first body sentence must advance the logic with distinct
evidence, causality, a condition or a risk; it cannot be a near-synonym restatement. Check the feed
order with deterministic corpus review; do not rotate templates or synonyms in
the model to satisfy a quota. If the complete source
has unresolved ticker identity or direction, hold it rather than guessing. Neutral
is valid only when the source supports a balanced or offsetting view.
The following body explains the source-backed mechanism and evidence. Do not let
a product, framework, partnership, policy event or operating fact replace the
directional opening clause. Keep the language varied, natural and immediately
understandable.

Before classification, apply
[selection-and-source-media.md](../references/selection-and-source-media.md).
Require what plus why for a thesis and a material new reason, evidence or condition
for an update. Position actions, returns and price recaps alone remain private
history. Decide visual dependency after content triage. Inspect candidate images
only when they may be required/helpful; include only images that materially
clarify the event and omit the rest with reasons.

Treat technical-only analysis and trade setups as private, including
targets, support/resistance, stops, entry/exit levels, moving averages, breakouts,
chart patterns, momentum, relative strength, options timing and overbought/
oversold signals. Mixed content may retain this material only as dated supporting
context after an independent non-technical why qualifies. Objective company or
market facts still require an explicit investment implication.

Recover attachments from the author's source and from verified quoted/reply
context. A quoted/reply image may be included as helpful `explanatory_context`
when it is directly relevant and materially clarifies an already source-supported
thesis/update, even without explicit author adoption. Keep the context source ID,
exact attachment binding and a concrete relevance reason. It cannot supply a
missing what, why, ticker or direction and must never be attributed to the tracked
author. Use `required` only when explicit adoption and retained context evidence
show that the author's argument depends on the visual.

After drafting, audit ticker coverage against the complete expression and the
finished prose. Every verified security named in the prose as an investment,
position, recommendation, comparison, explicit beneficiary or explicit risk must
have an event-specific asset binding. When one expression evaluates several
tickers under one shared judgment, mention and tag every one instead of keeping
only the first. Do not add incidental customers, suppliers, benchmarks or
unrelated roundup sections that the prose does not use. Private, future,
ambiguous or unresolved symbols become recorded gaps, never guessed assets.

Reopen quote/reply attachments after the prose is final. If a quoted chart or
table materially explains a retained valuation, spread, technical condition,
operating result or supply/demand claim, include it with the context source ID
and exact attachment binding even when the current post has no direct image.
Otherwise record a specific omit reason.

Do not generate any record for a triage item without a resolved author-named or
verified thread-inherited investable object and ticker. Broad market/macro/event
risk/theme commentary with no such object ends as a source-level `no_judgment`
decision plus an omission-ledger reason. `type: context` is not a fallback for a
missing ticker. Do not spend drafting, image or deep-review work on these items.

Limit each new or rewritten visible expression to **500 characters** in total,
including spaces, punctuation and paragraph breaks, excluding only the trailing
original-link footer. For a current Thesis, count the composed visible passage
`stance_sentence + description`; for Timeline, count its description. Count with
`scripts/prose-limit.mjs`; declare
`generation_policy.prose_max_chars: 500` and validate with `--require-prose-limit`.
Do not aim to fill the limit. Rewrite excess text without losing the decisive
reason, material condition, amount/unit or historical transaction period, then
rebuild its evidence map. Never truncate or split a company/event to fit. Keep
unchanged historical text frozen; unresolved compression returns to revision.

Before writing, recover the source's meaning in working notes: the actor, what
happened or is expected, what the named product/project does, why it matters to the
investment, the transaction stage and the applicable date. Recover missing context
from evidence; do not guess. Group by author and company, retaining account and
trade-episode distinctions. Preserve older event snapshots on continuation.

For each current card:

1. Identify the central judgment and the reason the author gives for it. Inspect
   candidate source passages before choosing a primary Source.
2. Write the directional conclusion, named causal relationship and final investment
   landing in the first sentence. Put distinct evidence, a causal step, condition
   or risk next. Do not begin with background and delay the investment implication
   until a later paragraph. Name companies and explain
   their role before using umbrella terms. Follow with only the facts needed to
   explain the argument. Use short connected paragraphs when needed; a simple view
   can stay one paragraph. Vary the sentence naturally: company-first, outcome-first, comparative or valuation language are all valid. Do not stop at `X developed product Y`; state what that changes for growth, value, risk, market position or the investment case. Do not produce a separate visible headline.
3. Name the concrete arrangement behind abstract terms. Who rents AI chips? Who
   builds the data center? What does the power agreement guarantee? Who accepted
   which project? Do not assume the reader knows those answers. Avoid changing
   `secured`, `approved`, `delivered` or `accepted` into `operating` or `profitable`.
4. Stop when the view is clear. Do not pad short updates with business logic,
   warnings, classification commentary or a generic sentence about execution.
   Vary sentence structure according to meaning, not a rotation of canned openings.
5. Map the exact finished prose to source spans in `card_claims`. Identify core
   judgment/reason claims separately from facts and position updates. All text must
   be accounted for; preserve the original wording and date of each evidence source.
   Use atomic claims and `supports_roles` on each evidence span. A source proving
   that the author is bullish does not necessarily prove the reason you wrote.
6. Review primary-source candidates by claim coverage. A holding update is not the
   basis for a reasoned company thesis. A longer financing post is not proof of a
   power-scarcity argument. Choose the latest analysis or concise thesis statement
   that supports all core claims; otherwise use a supporting older source or hold.
   If only a combination of sources supports the core, retain the thesis and claim
   map for source-presentation review rather than dropping a valid investment view.

For Timeline, summarize only the content of that specific dated statement and its
material thesis increment over earlier evidence. Preserve new reasons, evidence,
conditions and attribution corrections before shortening. A buy/sell/hold, return
or price recap without such an increment is not a public update. Follow
[increment review](../references/update-increment-review.md). Use source-only
attachments for confirmed repetition, one disclosure for pages of the same
document revision within one company, and holds for unresolved meaning.
Delete every portfolio-operation sentence from the proposed public row, then
re-evaluate what remains. Diversification, concentration, position size, margin,
entry timing and realized performance cannot supply the increment. Also replace
the company name with a peer as a test: if the why remains equally applicable,
the content is theme/context rather than a company-specific update.
Use only
available context. A purchase, sale or holding plan may need just one sentence.
Keep the full event history, but exclude the main card's primary source from the
visible Timeline after company grouping. Do not create another update or a
`Current source` row for it. Keep other dated sources even when they revisit the
same argument; shared wording alone is not grounds for deleting history.
Do not compare it with later events or turn a brief reply into the whole thesis.
The presentation builder creates the 40-word preview and detail link; keep the
full description intact. No titles, type prefixes or original-excerpt blocks in
the visible Timeline. Other people's related views belong in Signals.

Every visible update follows `source-backed-timeline-opening/1.2`: sentence one
combines the dated directional implication and decisive mechanism, with necessary
companies, products and counterparties named. Remaining sentences add distinct
contemporaneous evidence, conditions or risk. Do not copy today's card stance into
history, require a stance enum, or use a second sentence to repair an incomplete
opening. Emit the exact `stance_clause`, `mechanism_clause` and per-ticker
`stance_realizations`; hidden tags cannot satisfy the rule.

Use verified entity-image lookup outcomes and explicit fallbacks. For source-post
images, include only reviewed required/helpful visuals. Do not invent or borrow an
image to clear a warning.

Return a draft packet with `card_claims` and source candidates. Do not mark language
or source support approved until the separate review pass has run. Include
`timeline_review` for every canonical-history event: state the actual increment
for an update, strictly earlier covering events for repetition, or the missing
context for a hold. Group verified pages of the same document revision using
`disclosure_groups`; preserve original events. Keep unresolved
claims and missing sources in the review/pending data, not in fabricated prose.

For product export, prepare the internal reviewed packet first, then hand off only
the exact seven-field ThesisCard shape:

```json
{
  "thesisId": 1,
  "type": "new_thesis",
  "createdAtMs": 0,
  "author": {"id": "author_id"},
  "body": "Reviewed Markdown prose. [Author on X](https://x.com/...) ",
  "tickers": [{"symbol": "NVDA", "direction": "bullish"}],
  "media": []
}
```

Do not add `title`, `source`, `sources`, review fields, status, confidence, run
metadata or account metadata. `type` is only `new_thesis` or `thesis_update`.
Use the accepted expression's Unix-millisecond timestamp for `createdAtMs`; an
update uses its own expression time and never the first Thesis time. `thesisId`
and `author.id` come from authoritative feed mappings, not model generation.
Every `tickers[]` entry has a unique symbol and product direction `bullish`,
`bearish` or `none`. Internal `neutral` maps to product `none`; do not emit
`neutral` in the product object. `media` is always an array. Use only reviewed
ordered `image` or `priceChart` entries with required `coverUrl` and optional
`url`; use `[]` when no approved media exists. Append named original Markdown
links to the end of `body`, using the update's own links, not the current card's
links. Preserve exact original-language text separately from English prose. Use
the ThesisCard adapter after review; do not output a hold or context as a card.

After grouping and presentation assembly, review every visible main card and every
visible Timeline row. Do not sample, limit review to changed records, or stop after
known examples. The final sidecar counts must exactly equal the deterministic
visible-expression count and remain bound to the final presentation hash.
For cards, bind the stance and exact stance sentence into the sidecar and verify
that the selected source supports that direction. Reject a model-inferred stance.
Record `company_specific_increment`, `portfolio_operation_free`,
`related_context_excluded` and `why_specific` for every row. Use one target
`release_version` without a `-candidate` suffix; publication changes
`release_status` from `candidate` to `released` and readback verifies all artifacts.
