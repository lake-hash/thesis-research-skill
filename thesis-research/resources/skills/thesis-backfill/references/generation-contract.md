# Generation Contract 3.2

This contract carries the approved product decisions into every new backfill.
It supersedes older mechanism-level splitting and Timeline-title conventions.
Do not hardcode author counts, ticker quotas, release IDs or dated examples into
new runs. A person input starts the workflow; collection gaps still need reporting.

New packets use `source_grounded_company_analysis/1.0` and
`per-expression-ticker-stance/1.0`. Technical-only analysis remains private.
Mixed analysis qualifies only with an independently supported non-technical
judgment and why.

## One Author, One Company

- One author plus one resolved company is one active company thesis. New business
  lines, catalysts, valuations, targets, risks, trades and reversals are updates.
  Ren's Sivers lasers, wireless and consumer sensing belong together. LPKF's glass
  packaging, solar equipment and quantum technology belong together. Different
  adoption paths alone are not grounds for splitting either company.
- Resolve company identity across names, listings and trading instruments. Do not
  merge two authors, unrelated issuers sharing a symbol, or an ETF with its bank
  issuer. Basket membership alone is not a company-specific investment judgment.
- Theme theses are separate objects from company theses. Do not merge, associate
  or synchronize them merely because a company belongs to a theme. Cross the
  boundary only when the author explicitly states the theme/company what+why.
- Preserve account and trading episode IDs. A closed swing and a retained core
  holding can coexist. A later trade starts another episode inside the company
  history; never add their returns or infer a reopened position from a target hit.
- During migration, archive original records and preserve their events under the
  canonical record. The active `theses` collection must contain only one record
  per author/company; UI grouping is not a completed merge. Old IDs belong in
  a separate retired alias map, never alongside active theses. All readers,
  pending-item matching and exports must resolve aliases to the same canonical ID.
  Coalesce fragments of the same original statement into one displayed
  update; keep the source fragments inspectable. Distinct dates remain distinct
  events. Deduplicate repeats without hiding the first threshold, loss or revision.

## Write The View Directly

Use [plain-language-and-sources.md](plain-language-and-sources.md) and the bundled
generation/review prompts. Interpret the source before drafting: name the actor,
explain the product/project, describe the specific action and connect it to the
investment. A simpler word with the same missing context is not a successful edit.

- Use professional, easy-to-understand plain English. Start with the investment
  point: company/asset plus its directional conclusion and final investment landing
  in the opening clause. Put the decisive mechanism in the same first sentence,
  naming any counterparty, product or transaction needed to understand the causal
  relationship. Avoid `X thinks`, `X believes`,
  `the September 12 post puts...`, process narration and generic slogans.
- Every approved public record carries at least one verified ticker and one
  source-backed `bullish`, `bearish` or `none` direction per displayed ticker.
  Different tickers in one expression may have different directions. The exact
  first visible sentence remains a natural `stance_sentence` under
  `source-backed-opening/1.3` and the shared
  [stance opening contract](stance-opening-contract.md). Derive it from the author's
  sourced judgment, not the model's company view. Attractive/unattractive is valid
  only when the same sentence names the specific mechanism and the family is not
  overused. Bare attractiveness, appealing/compelling and `the case is strong/weak`
  labels are invalid. Do not copy Bullish/Bearish/Neutral enum words into prose.
  Valid states include
  strengthening, weakening, constrained, exposed, undervalued, stretched,
  execution-dependent and conditional upside. Adjacent duplicate families fail;
  rolling-window or catalog concentration enters corpus editorial review rather
  than automatic synonym rotation. Neutral is valid only for a source-supported
  balanced view, not as a fallback for unresolved review.
  The opening clause makes the stance immediately visible using varied natural forms rather than one required prefix. The following body supplies distinct evidence, a causal step, condition or risk; it must remain natural and must not restate the opening with synonyms.
- Product prose states the investment meaning directly. Do not write `the article
  sees upside`, `the post describes`, `the source did not establish`, or similar
  narration about how extraction/review happened. Provenance belongs in the named
  source link and private evidence map. Source reconciliation, conflicting-number
  handling, uncertainty about an unsupported target, and reviewer decisions remain
  in review metadata; omit the unsupported claim rather than explain its rejection
  to the reader. A source limitation belongs in visible prose only when it is itself
  material to the investment judgment and can be stated as an ordinary factual
  condition.
- A why must be a complete sentence with a concrete mechanism. `Both EPS and
  revenue exceeded expectations`, `continued capital spending and foundry
  expansion`, and `its position in the supply chain` are not sufficient by
  themselves. State how the fact changes demand, supply, pricing, margins,
  valuation, competition, financing, customer adoption or risk. Objective facts
  without that connection remain private evidence.
- Classify every named ticker before rendering. `subject` and `vehicle` are the
  only public tag roles. Benchmarks, customers, suppliers, partners, peers and
  quoted-post context remain untagged unless the author gives that company its
  own investment judgment. The final review records the role and source-specific
  reason for every ticker.
- Do not make a short source look more analytical than it is. A generated body may
  clarify stated meaning, but it may not import reasons from another date, another
  ticker, an unadopted quoted post or general company knowledge. A setup switch,
  purchase, sale, pass, target or bare `cheap`/`bullish` statement without its own
  reason stays source-only. Re-anchor an existing company card to an earlier
  why-bearing expression; omit it when none exists.
- Do not publish technical analysis or trade setups. Support/resistance, moving
  averages, breakouts, chart patterns, momentum, relative strength, options
  timing, stops and targets remain private `technical_out_of_scope` history.
- There is one visible prose field, not a title followed by a body. Short content
  stays one paragraph. Longer content begins with a short summary sentence, then
  concise supporting paragraphs in the same typography. Aim for roughly 8-18 words
  in the opening; this is an editorial target, not permission to lose a condition.
  Each new or rewritten thesis and Timeline description has a hard maximum of
  **500 characters**, not 500 words, across all its paragraphs. Count Unicode
  code points after normalizing line endings to LF and trimming trailing
  whitespace; spaces, punctuation and paragraph breaks count. The trailing
  named-original-link footer and its separating whitespace do not count.
  Use `scripts/prose-limit.mjs` for the same count used by validation.
  Stay shorter when the idea is simple. Rewrite over-limit text by removing
  repetition and secondary detail, preserving the judgment, decisive reason,
  material conditions, amounts/units and historical transaction timing. Recheck
  sentence evidence after shortening. Do not truncate text, remove needed links,
  split one company into extra theses, or manufacture updates to evade the cap.
  If faithful prose still will not fit, retain the evidence privately and mark
  the draft for revision rather than approve a misleading summary. Unchanged
  published history remains frozen; this rule does not authorize a bulk rewrite.
  `stance_sentence` remains a separate internal review field, but product export
  prepends it to `description` as the first sentence of the single visible Feed
  body. The combined visible passage, including the stance sentence, must fit the
  500-character limit. It is not a title or a separately styled heading.
- Each paragraph should add something. Read the rendered stance and body as one
  passage. The first sentence must stand alone; do not defer a required identity
  through `the partnership`, `the deal`, `new products` or a dangling pronoun.
  Remove repeated conclusions and fragmented
  fact lists. Explain unfamiliar names, tickers used as concepts, instruments and
  documents on first use: identify Pershing Square USA rather than unexplained
  PSUS, and identify the shareholder letter and signatories rather than `the joint
  letter`. Do not mechanically rotate could/may/can/will or force all openings
  into `company could benefit`.
- Preserve ownership, action, negation, conditions, transaction stage, units and
  time. A proposal is not a completed acquisition; advice is not an execution;
  stock appreciation is not personal investment return. Express limitations with
  accurate verbs and necessary context instead of boilerplate such as `these
  observations do not identify personal purchase prices or realized returns`.

## Historical Updates Are Dated Statements

Summarize what that author actually said in that source, with context already
available then. Do not narrate how it strengthens or weakens the current thesis,
compare it to later events, or copy the whole current thesis into a short reply.
An author's own explicit revision or historical comparison can be retained; lead
with the operative view at that date. Do not erase a source-backed reversal just
to avoid comparative language.

Apply `source-backed-timeline-opening/1.2` to each visible update. Sentence one
states the dated directional implication and the source-backed mechanism together,
including any named company, product, counterparty or transaction needed to
understand it. The next sentence may add only contemporaneous evidence, condition
or risk. Timeline does not carry the current card's stance enum and does not need
a literal Bullish/Bearish prefix. A factual update may stay short, but it cannot
start with background and postpone what that fact meant for the investment.

Every visible Timeline update has its own verified ticker set and per-ticker
direction. These may differ from the current card and may never be copied backward
from later evidence.
Both card and Timeline sentence one expose exact `stance_clause`,
`mechanism_clause` and per-ticker `stance_realizations`. Review with tags hidden;
metadata cannot satisfy stance-first.

Backfill may use the full window to find the right company home for older posts.
That does not grant older events access to later facts. Once published, preserve
each event's ID, description, source links, date, support, account/episode and
asset bindings. A new post appends history and may refresh the current card.
An evidence correction is a separately authorized, versioned operation with the
previous version retained. It is not part of an ordinary update.

## Select Images For Context, Not Automatically

Apply [selection-and-source-media.md](selection-and-source-media.md). Read the
complete source expression before classification. A thesis needs what plus why;
an update needs a material reason/evidence/condition increment. Then decide visual
dependency separately: `required`, `helpful`, `none` or `unresolved`. Include only
images that materially improve understanding. Missing evidence blocks only a
required/unresolved image-dependent claim. Images on source-only/context/
duplicate/no-judgment posts remain private archive evidence.

## Card Date And Source

Choose the latest source that supports the current card's **central investment
judgment and decisive reason**. First map the prose to source evidence, then review
candidate coverage and choose among the candidates that pass. Length and recency
alone are insufficient. A short thesis with a clear reason or technical condition
can qualify; a long post about a different driver cannot.

Keep new target rationales and risk changes as meaningful updates. Position
confirmations, buys/sells, holding plans and results without new thesis reasoning,
evidence or conditions remain private trade/position history. `Investor since
2024. Plan to hold through 2027` cannot support power, valuation, financing or
delivery claims.

Quote/reply adoption must be explicit and object-consistent. `Agreed` or `good
analysis` can adopt retained context when the exact parent is available. `Nvm,
let's try Y instead` only records a switch; it neither establishes Y's rationale
nor turns the abandoned X setup into a current thesis.

The top-right card date, its single Source link and card ordering all use that
same selected event/source. Earlier evidence stays in Timeline. A summary may
synthesize several sources; supporting facts retain their own source and historical
detail links. The primary link must still support the core argument. A financing
post cannot stand in for a power-scarcity argument. With no qualifying source, use
an older supporting source, revise within the user's editorial scope, or hold the
card. Do not silently change a user-approved core judgment to get a newer date.
Keep latest activity distinct from the anchor date. Check original publication dates rather than collection
timestamps, quoted-parent dates, filename dates or dates inferred from prose.
Preserve day-only precision and distinguish a report's signature from publication.

## Timeline And Detail Presentation

- The main card occupies the current-source slot. Do not repeat that same source
  as a visible Timeline update or add a `Current source` duplicate. Filter by
  canonical source identity after company grouping, not by text similarity or
  the newest timestamp. Preserve the complete event and its detail in stored
  history. Other material thesis updates remain visible; position/action-only
  events remain private history. Recompute the visible
  Timeline when the primary Source changes; the previous anchor can reappear.
  An empty visible Timeline says `No other updates yet.` It does not mean the
  original source was not collected.
- Show the date, single-paragraph body preview, historical ticker tags with logos
  and the original source. No event headline, type prefix, audit tab, origin-unknown
  label or Original source excerpt block. Types may remain stored; generated
  `title` fields must not exist on active thesis or update records.
- At **40 English words or fewer**, show the complete preview. Above 40 words,
  show the first 40 words, an ellipsis and **Show more**. Collapse whitespace only
  in the preview; never truncate or rewrite the stored description. This limit
  applies to Timeline previews, not main cards or full historical details.
- Every update opens a dedicated historical detail with its author, original
  date, complete paragraphs, event-specific ticker tags and source. Older details
  show `Not the latest update · View latest`. Back restores the Timeline position;
  View latest goes to the current company thesis. Never substitute the current
  card's body or ticker list for an older event.
- Signals contain another author's relevant view and explain its specific support,
  challenge or qualification. The subject author's own updates stay in Timeline.
  Do not invent Signals to fill an empty state.
- Preserve full-width Alva hosting, the requested mobile layout, consistent
  typography and complete main-card prose. No separate card headings or main-card
  Show more. Verify previews, detail navigation and source links in the actual UI
  when a UI artifact is requested; a JSON check alone does not prove rendering.

## Company Logos And Person Pictures

Discover current Alva docs with `data-skills list -> summary -> endpoint` before
calling APIs. The documented Arrays routes include the `/api` prefix:

| Kind | Endpoint | Image field | Identity check |
|---|---|---|---|
| US security | `/api/v1/stocks/company/detail?symbol=...` | `logo` | Requested instrument/issuer matches returned symbol and name |
| Non-US security | `/api/v1/stocks/non-us/company/detail?symbol=...` | `image` | Preserve exchange suffix and verify the listing |
| Person | `/api/v1/persons` | `avatar_url` | Verify the social handle or another authoritative identity, not name alone |

Person name searches can return multiple people. Use the verified account to select
the record; use documented name/query/person-ID lookup when needed. Check actual
responses. In the September 14 check, 13 matched person records supplied no avatar;
that is a dated limitation to recheck, not a permanent assumption that images never
exist. Accept a provided, matched URL; otherwise retain a verified existing image
or initials and record the missing field outside the product prose.

Wrong API output must not overwrite a correct fallback. UCO returning SVXY and
GDXU returning BMO are mismatches. A verified same-company share-class logo may be
shared, as with Berkshire A/B, without changing the displayed security; a bank
issuing an ETN is not the same investment object. Missing non-US coverage is not
grounds to guess a US ticker. Crypto, indices, commodities and futures keep their
appropriate images/icons rather than being routed into unrelated stock profiles.

Use one mutable image catalog across cards, ticker tags, author profiles, search
and Signals. Historical entity bindings are frozen; a picture can refresh for the
same verified identity. Never put API credentials in the public artifact. State
which pictures came from APIs, which use fallbacks and which are missing.

## Required Delivery

Before publication, validate the actual rendered catalog as well as the research
packet. A primary source cannot have a held or source-only review disposition.
Changing a source must update the displayed date and source-dependent evidence.
Every explicitly used supporting original must survive in the body footer.
Check author/asset identity even on multi-ticker rows: adding an unrelated ticker
must not let successive trades evade consolidation. Keep distinct trading
episodes and their separate returns inside the canonical history. A genuine
cross-asset portfolio strategy can remain separate with its own stated rationale.
Signals need reviewed relevance and a frozen source/body/date snapshot; a later
change to the other author's current card must not silently rewrite the Signal.

New packets declare generation policy 3.2 and the fields specified in
[output-contract.md](output-contract.md). Run the validator with history coverage
and generation-contract checks plus `--require-prose-limit`, and with a baseline
on continuation. Declare `generation_policy.prose_max_chars: 500`. Older archived
packets without that field remain readable; all new generation must use the gate.
Then run `build-presentation.mjs` to derive previews, dates, links and history
details deterministically. Keep source-first review and omission sampling separate:
structural tests cannot guarantee recall, correct interpretation or lifetime
public-source coverage. Report gaps instead of claiming a universal quality guarantee.

After building the presentation, complete and validate the
[final public projection review](final-public-projection.md). Every visible card
and Timeline row needs a source-bound, hash-bound review of what, why, ticker,
media and direct voice; every Timeline row also needs the actual material
increment. This is a release requirement, not an optional review report.
The review covers all visible expressions, not a sample or only changed/flagged
examples. Its declared total and completed counts must equal final card plus
Timeline counts.
