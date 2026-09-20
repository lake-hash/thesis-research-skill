# Thesis Core Contract

This is the canonical quality kernel shared by backfill, update, review/export
and operations. Workflow files may add procedures, schemas and examples, but they
must not weaken or redefine these rules. Machine-readable versions and limits live
in `thesis-policy.mjs`.

## 1. Public Admission

A public Thesis requires all of:

- a verified investable object and ticker;
- the tracked author's own judgment or expectation (`what`);
- an author-stated non-technical reason or causal mechanism (`why`).
- a source-owned investment landing: valuation, expected outcome, risk/reward,
  preference, durable competitive view, catalyst or invalidation condition.

An earnings recap, stock-reaction explanation, objective result or generic praise
is not a Thesis unless the same expression contains that investment landing.

A visible Timeline update independently requires its own ticker set, per-ticker
direction, what, why and a material change to reason, evidence, condition, risk,
valuation, forecast or stance.

Technical-only analysis, price levels, targets, stops, entry/exit timing, position
size, returns, watchlists, objective news and unexplained sentiment remain private
history. Mixed material qualifies only when removing the technical or portfolio
language leaves an independently supported company-specific what and why.

No resolved ticker, no what, no why or no material increment means omit,
`source_only` or hold. Never invent a proxy, mechanism or conclusion to fill a
required field.

## 2. Identity, Grouping And History

- One author and one resolved company have one active Thesis. Business lines,
  catalysts, risks, valuations and trade episodes stay in that history.
- Match approved, pending and same-run records before creating anything new.
- One inseparable multi-object judgment may carry several tickers with different
  directions. Unrelated roundup sections remain separate.
- The same interview, transcript, clip and repost are one statement event with
  multiple representations, not several updates.
- History is append-only. Preserve original sources, dates, evidence, failed
  outcomes, reversals and distinct trade episodes. Corrections are explicit,
  versioned operations.
- Another author's view belongs in Signals, not the tracked author's Timeline.

## 3. Source Fidelity

Every public claim must map to exact original evidence. Preserve subject, owner,
predicate, polarity, certainty, degree, condition, transaction stage, units and
time scope. Do not:

- add `the author`, `the author's`, `the source`, `the post` or similar narration;
- turn advice or a plan into execution;
- upgrade may/could into will, or add unsupported rankings and superlatives;
- import reasons from another date, another ticker, an unadopted quote or model
  knowledge;
- use later evidence inside an earlier Timeline expression.

If faithful public prose is not possible, hold or omit the expression.

## 4. Public Language

The first visible sentence states the specific investment direction and decisive
mechanism together. It names any counterparty, product, transaction or constraint
needed to understand the relationship. Tags and icons never satisfy stance-first.

Prefer natural directional language. `Bullish`, `Bearish` or `Neutral` may appear
when the tracked author explicitly uses the same word in that expression, exact
evidence is retained, and the same first sentence states the decisive mechanism.
Never copy these words from ticker metadata or use them as a standalone label.
Bare attractiveness, `the case is strong/weak`, promotional language, fact-first
openings and generic supported/well-positioned claims fail. Later sentences add
distinct evidence, a causal step, a condition or risk; they do not paraphrase the
opening.

Timeline prose preserves the source-date stance, certainty and conditions. It
does not borrow the current card's conclusion, ticker set or direction.

Each new or rewritten visible expression is at most 500 characters before named
original links. A current Thesis counts the composed `stance_sentence +
description`; Timeline counts its dated description. Rewrite rather than truncate.
Short ideas stay short. There is no title field or separately styled headline.

Review opening-family concentration at corpus level. Repetition creates review
work; it never authorizes automatic synonym rotation or unsupported mechanisms.
Generic company-first templates such as `X has upside`, `X could benefit`, `X
looks stronger`, `X is well positioned`, `X is execution-dependent` and `X offers
an opportunity` fail. State the professional judgment axis and consequence:
valuation, earnings outlook, operating trajectory, competitive position or
risk/reward.

## 5. Tickers And Media

Every visible expression has at least one verified ticker and exactly one
source-backed `bullish`, `bearish` or `none` direction per displayed ticker.
Ticker sets and directions are expression-local and may differ across Timeline
dates. Public tags contain only subject or vehicle tickers used by the prose.

Images are also expression-local. Inventory the author source and complete
quote/reply chain. Include only reviewed required or helpful images. A relevant
quoted-context image may clarify an already qualified view without author
adoption, but it cannot supply what, why, ticker or direction and must retain
outside-source provenance. Missing media is a retrieval gap, not an automatic omit.
Every public expression with attachments needs an `expression-media/1.0` review
bound to the exact attachment IDs. Each inspected image records what it contains
and why it is included or omitted. If a run omits every image across several
image-bearing public expressions, require an exact `all-zero-public-media-audit/1.0`
instead of accepting repeated generic omit reasons. Included media must survive
the deterministic presentation and final-public hash review.

The Feed owns navigation, typography, image sizing and lightbox behavior. The
skill owns correct ThesisCard values and must prevent ticker, logo or media
leakage between expressions.

## 6. Review And Delivery

Triage and generation are not approval. Review originals and contemporaneous
context source-first. Every visible final card and Timeline row needs a review
bound to the exact final presentation hash. A changed source, date, prose, opening
plan, ticker, direction, media, grouping or Timeline visibility invalidates the
review. Exact unchanged hashes may reuse their prior source-first review.

Triage candidates are conserved across stages. A candidate already carrying an
author-owned resolved object, ticker, what, why and material increment cannot be
silently downgraded because the same post also mentions an event, policy meeting,
volatility or timing. It must become a public expression, remain pending, or have
an evidence-bound source-first reassessment naming a real admission failure.
`Event watch`, `macro framing` and `volatility commentary` are not exclusion
rules by themselves.
The same protection applies when a first-pass triage response incorrectly labels
that complete field combination `no_judgment`; deterministic validation treats it
as a protected candidate until source-first reassessment resolves the conflict.

Required delivery sequence:

1. validate the current packet and full-window history trace;
2. build the deterministic presentation;
3. complete source-first and final-public review for every visible expression;
4. validate the author/company batch against active and pending records;
5. prepare seven-field ThesisCards and validate delivery/source coverage;
6. project Feed grouping and verify published readback when publication is in scope.

For a temporal Feed, the main Feed must use the validated historical expression
projection, not only the latest current snapshot. Every exported history event
appears exactly once as a dated Feed item. Opening a Feed item selects that event
as the point-in-time current content; its Timeline contains only strictly earlier
events for the same author/company thesis, sorted newest-first. The selected event
is never duplicated in that Timeline, and later evidence or the latest current
snapshot must not leak into the historical view. The latest snapshot/group output
remains available for the current-state view.

The temporal Feed also receives a deterministic surface-language review after
all dated expressions are sorted into their actual display order. This review
groups inflected templates such as `remain/remained + favored/attractive`,
`look/looked + evaluation`, `has upside` and `could benefit`. Adjacent reuse,
rolling-window concentration or excessive corpus share is a hard failure even
when the rows belong to different Thesis records. Fix the underlying judgment
structure from source evidence; do not rotate unsupported synonyms.

The public ThesisCard contains exactly `thesisId`, `type`, `createdAtMs`,
`author`, `body`, `tickers`, `media`. IDs and author mappings come from the
destination, never model generation. Review, export, publication and notification
are separate facts. Respect the current user's authorization boundary.

## 7. Conditional Modules

Load only when needed:

- large archives: `../thesis-backfill/references/fast-extraction.md`;
- audio/video: `../thesis-backfill/references/multimedia.md`;
- detailed writing: `../thesis-backfill/references/generation-contract.md` and the
  generation/review prompts;
- product export: `../thesis-review-publish/references/thesis-card-contract.md`;
- prototype migration: `../thesis-backfill/references/prototype-integration.md`;
- behavioral testing: `../thesis-backfill/references/evaluation-cases.md`.
