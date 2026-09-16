# Extraction, Matching And Editorial Review

Use the current project classification/editorial rules when present. The following
decisions are essential to this skill and apply without needing prior conversation.

## What Qualifies As A New Thesis

Recover a specific object, the person's own judgment, and a meaningful causal
reason or concrete technical condition. A single short statement can qualify when
its context supplies the meaning. Missing a price target, holding period, stop,
formal model or later update does not disqualify it. No author/follower quota.

A business observation can qualify when the economic implication and its reason
are expressed;
do not turn product applause into an invented earnings forecast. Positions alone,
bare ticker mentions, headlines, jokes, promotions, rhetorical questions and
reported returns alone are not theses. Hold unclear context rather than treating
it as a low-quality author. Preserve generic frameworks and non-investable macro
views as context without forcing them into the main investment feed.

An update does not need to restate the entire original why, but it must add or
change substantive reasoning, evidence or an operative condition. A threshold,
forecast, operating milestone, risk or invalidation condition can qualify when it
bears on the thesis. Position actions, returns and price recaps alone remain trade
history, not updates. Follow [generation-checks.md](generation-checks.md)
for the second matching pass, history coverage, meaning preservation and final
reader edit. A position without a thesis is still recoverable history; a clear
promotion can also contain a qualifying judgment.

Support/resistance, targets, stops, add/trim zones and conditional trade plans are
not a why by themselves. Keep them private unless the same expression explains a
material technical pattern, volume/momentum signal, positioning structure or
business mechanism that changes the investment view. The word `if` and a numeric
level do not satisfy the condition test. Reported facts also need a stated
investment implication; do not publish a card or update that merely repeats
revenue, guidance, a price move or a news item.

## Deduplicate At Three Levels

1. **Source:** identical copies/editions and cross-platform syndication.
2. **Original statement event:** a video, transcript, article and clip of the same
   interview do not create four updates. One source can contain several claims.
3. **Author and company:** compare approved, pending and same-run candidates,
   including issuer, listing and merged-record aliases. Different business lines
   or horizons stay within the same company history. Resolve identity before
   treating matching ticker strings as the same company.

Record the nearest matching record IDs and why the candidate is a new question,
an append, a correction, a duplicate or unresolved. When proposing a separate
thesis against a close match, identify a genuinely different company or a distinct
cross-company basket/macro object. Different mechanisms within one company do not
justify another card. Do not collapse every AI company into one "AI growth" thesis.
Theme theses and company theses are separate objects. Do not merge or synchronize
them merely because a company belongs to the theme. A source updates both only
when the author explicitly states both a theme-level and company-level what+why.

| Situation | Treatment |
|---|---|
| Shopify checkout, customer ownership and payment bargaining power | Usually one author thesis with subsequent evidence/revisions |
| Corning optical orders versus adoption of glass chip packaging | One company thesis with different business dimensions |
| Ren's Sivers lasers, wireless and consumer sensing | One Sivers thesis; dated updates preserve each dimension |
| Ren's LPKF glass packaging, solar equipment and quantum technology | One LPKF thesis, not three cards |
| Moving from DRAM ETF to a preferred memory supplier | May be a vehicle/position update; not automatically a new industry thesis |
| Company-specific AAOI factory ramp versus a general memory shortage | Separate if the source gives its own company driver and validation |
| Company-specific Micron earnings versus a one-week MU breakout | Keep the fundamental earnings thesis public; retain the breakout privately inside its history |
| A stopped-out MU trade followed by a new July setup | Retain both episodes privately; do not create a public technical thesis |
| Same idea from two different authors | Separate ownership, optionally related theses/Signals |

`FIRST_OBSERVED` is an archive event, not proof of author novelty. Use `existing`
or `new` origin only with explicit source evidence; otherwise `unknown`.
Retain the earliest verified available source, but do not claim it was the
person's first-ever statement merely because no older match was found.

Event types: `FIRST_OBSERVED`, `EVIDENCE`, `REVISE`, `POSITION`, `CLOSED`,
`WITHDRAW`, `REAFFIRM`. An exit does not automatically withdraw a fundamental
belief. A later target hit does not reopen an exited position or earn it returns.
Reversals retain the prior history. Source corrections are versioned and linked.

## Ticker And Entity Binding

For each tag capture entity name, symbol/market, instrument type, role, binding
basis, supporting source IDs and identity-verification source. Dates/share classes
matter: a later ADR listing must not become a purported earlier ADR purchase.

- **Author-named:** the source explicitly identifies the security or asset.
- **Entity resolution:** the author names the company; verified metadata supplies
  the appropriate listed identifier. This does not prove ownership of that class.
- **Alva proxy:** a separately labeled example vehicle for an asset/factor the
  author discusses. Never put the proxy recommendation in the author's mouth.
- **Related entity:** customer, competitor, supplier or comparison, not a primary
  investment tag without an actual investment judgment about it.

Examples: distinguish DRAM technology from the DRAM ETF using the source context;
USDC ownership is not Circle equity exposure; LayerZero's business prospects do
not automatically establish ZRO token upside. A gold argument may use GLD as an
explicitly labeled Alva example, never a disclosed Dalio holding. Normalize company
aliases and non-US listings, and verify logos separately from security identity.
If the instrument cannot be resolved, keep the entity and the gap; do not guess a
ticker or drop a non-US company just because its logo/profile API is missing.

## Six Writing Rules

1. **Determine meaning and stage first.** Require a thesis `what + why`, and a
   material reason/evidence/condition delta for an update. Separate original rationale from the
   latest captured assessment. Do not let a fluent draft determine the facts.
2. **Make the opening specific.** Identify the company/asset and the useful
   judgment, driver, condition or change in the prose itself. A ticker-swap generic
   opening needs rewriting. No separate card title or headline word-count target.
   Public views emphasize the fundamental investment mechanism; technical setup
   copy remains private in this product version.
3. **Calibrate certainty and remain objective.** Do not attach `could` to everything. State sourced
   observations/actions directly and preserve real forecast conditions. Avoid
   stacked hedges; removing hedges must not convert an opinion into verified fact.
4. **Body first gives the important information.** Explain source-specific evidence,
   cause and implication. No metadata concatenation, fixed four-sentence template,
   generic trading lesson or buried exit. Use natural English, not simplified but
   awkward phrases such as "buyers hold the pullback".
5. **Actions, numbers and dates are exact.** Advice is not an execution, a holding
   is not a disclosed motive, and a target is not a result. Source any useful
   historical level and identify its period. Do not invent missing conditions.
6. **Each entry stands alone.** No `X thinks/believes` narration or invented first
   person. Retain identity in the byline and needed action/document attribution.
   Explain unfamiliar instruments and documents (issuer, date, signatories) briefly.
   Timeline copy uses only information available then. Keep checked original
   excerpts separate from translations and paraphrases.

For the current card, lead with the latest captured assessment. A trade state
without what+why remains private history rather than replacing the thesis.
For a dated update, report only that source's contemporaneous content. The AEHR
exit belongs at its September 4 date; a subsequent target hit stays in its later
event and never becomes a gain earned by the exited position.

## Continuous Prose

The card has one reader-facing text field, not separate title and body sections.
Short content is one complete paragraph. Longer content begins with a concise
summary of the judgment and its important condition, then develops the evidence,
mechanism and risks in natural paragraphs. Use blank lines to preserve authored
paragraph boundaries; do not split by a fixed character count or force a paragraph
count. A short entry does not need padding, and a longer one has no arbitrary
word cap.

All paragraphs share font size, weight and color, with normal paragraph spacing.
No headline, Summary label, bold first paragraph or collapsed remainder. Do not
prepend the old title to the description: the opening and the detail should
complement each other, not repeat the same conclusion.

- Let meaning determine the sentence. Explain a concrete relationship such as
  customer access, cash conversion, an adoption hurdle, valuation or a documented
  outcome. Avoid generic "company could benefit" openings and topic labels.
- Review neighboring openings for repeated scaffolds, not just repeated words.
  Do not rotate templates, enforce a diversity quota or replace every could with
  may/might/can/will or "is poised to".
- Attach uncertainty to the uncertain claim. Conditions such as "if adoption
  scales" or "depends on reliable production" must survive compression. Could
  remains valid when useful; natural prose must not upgrade forecasts to facts.
- Keep plain English. No author narration, slogans, strained synonyms or generic
  trading lessons. Preserve closed/failed trade states and advice versus execution.

A short entry can stand alone as one paragraph:
"Qualcomm's data-center opportunity needs paying customers and shipped products.
Custom chips offer a route beyond phones, but the valuation case depends on
those projects producing revenue."

For a longer entry, the first paragraph establishes the judgment and condition;
the next adds non-redundant evidence or qualifications. They are parts of one
continuous text, not separately labeled summary and body. These are editorial
choices, not fixed sentence templates.

Do not generate or store `title` on active thesis or update records, including
internal compatibility titles. Use IDs for references and descriptions for
search and export. Migrate older active records through an archived schema
correction that removes only generated title fields. Preserve original source
material, dates, IDs, tickers, grouping and historical descriptions.

## Professional, Readable English

Write for an investor who has not read the source thread. Professional means
precise judgment and clear causal reasoning, not more jargon or formal wording.
Apply this standard to cards, Timeline summaries and bodies, Signals, and visible
supporting notes. Review every generated entry in the requested scope; do not
equate revising a few examples with reviewing the whole collection.

- **Make the first paragraph useful on its own.** For a longer thesis, summarize
  the investment object, central judgment and material condition or current trade
  state. Then use separate paragraphs for supporting evidence, mechanism and risk.
  A blank line alone is not a summary: the opening must capture the main point.
  Keep that summary short, usually one 8-18-word sentence. Short content stays one
  paragraph. Keep supporting prose concise and coherent; do not force extra length
  or a fixed paragraph quota. The separate 40-word Timeline preview rule never
  truncates the stored full description.
- **Explain what changes the investment outcome.** Prefer concrete subjects and
  verbs: orders become deliveries; profits turn into cash; customers pay for a
  product. Explain an unfamiliar instrument, company or document briefly where
  needed. Keep useful financial terms; replace needless abstraction and strained
  synonyms rather than oversimplifying the economics.
- **Remove process narration.** Phrases such as "the absence of a guidance
  increase is retained", "this creates a new company-level thesis" or "this
  qualifies for inclusion" belong in internal review fields, not the narrative.
  State the observation and its implication directly. Do not end every paragraph
  with an explanation of why it is not a different thesis.
- **Keep material limitations, not boilerplate.** Preserve advice versus executed
  trades, source conflicts, AI-assisted source provenance, forecast conditions,
  unconfirmed deals and exits before later price gains. Removing procedural
  language must not remove these facts. Avoid repeating generic disclaimers in
  every sentence; retain the appropriate source note and specific caveats.
- **Review prose together and against evidence.** Openings should not all use
  "X could benefit", nor should they rotate through a replacement template.
  Eliminate repetition between the opening and supporting paragraphs. Preserve
  all non-prose fields and the prior editorial version; a clearer sentence is not
  permission to change facts, certainty, ownership, timing or grouping.

Example of a longer card, with identical styling for both paragraphs:

> AI networks offer Nokia a growth opportunity beyond traditional telecom
> equipment. The immediate test is whether it can deliver enough equipment to
> turn strong orders into revenue.

> The Infinera acquisition adds optical technology and manufacturing capacity.
> Those assets could support a higher valuation, but demand alone is not enough:
> production must expand, deliveries must follow and profits must improve.

This illustrates summary-first writing, not a fixed sentence pattern or a new
investment recommendation. Use the actual source's conditions for each record.

## Timeline And Signals

Timeline shows **date + body preview + ticker logos + original source**. No title,
event-type prefix, origin-unknown label or Original source excerpt block. Keep
internal types and original evidence in the packet. Use at most 40 English words
in one preview paragraph; longer entries show an ellipsis and Show more. Clicking
opens the event's dedicated historical detail with its complete original paragraphs,
own date, source and frozen asset bindings. Back restores the Timeline position;
View latest returns to the current company card.

Write the dated statement directly, not how it reinforces the latest thesis.
Do not add later outcomes, rationale or generic audit disclaimers. Ordinary updates
cannot rewrite any historical event. Source-backed corrections require explicit
authorization and a retained previous version. See the full
[generation contract](generation-contract.md) for primary-source selection,
image APIs, fallbacks and rendering requirements.

Signals summarize another person's relevant view and then explain its specific
support, challenge or qualification. Do not repeat the source summary in the
interpretation. Keep commercial interests and uncertainty explicit, and do not
describe a related view as a direct reply without evidence.

## Review Gate

### Evidence Review

Review the original evidence before the draft; examine neighboring replies and
the full relevant passage rather than only an excerpt chosen by the writer.
For each approval record reasons and evidence for:

| Gate | What the reviewer establishes |
|---|---|
| Attribution | Correct individual/team/speaker; endorsement is supported |
| Standalone judgment | Specific object, judgment and reason/condition |
| Grouping | Existing, pending and cross-batch matches considered; no hidden reversal |
| Asset binding | Subject versus vehicle versus related company; proxy disclosure |
| Fidelity | No invented cause, certainty, figures, position or personal recommendation |
| Chronology | No later evidence inserted into an earlier event; original dates/revisions retained |
| Editorial | Professional plain English across all copy; useful summary-first longer prose; no process narration or redundant heading; material caveats and action precision retained |
| Update materiality | New reason, evidence or condition bears on the thesis; price/action/performance alone is not promoted |
| Object separation | Company and theme theses remain distinct unless the author explicitly states both views |
| Visual relevance | Included images materially clarify the event; omitted images have a reason; unresolved required visuals block approval |
| History coverage | Recognized price/forecast/action/outcome claims survive in events or explicit pending history; group membership alone is insufficient |
| Meaning preservation | Action strength, negation, transaction stage, numerical basis and time scope match both caption and prose |

Do not approve via an aggregate confidence score. Attribution, invented facts,
wrong binding, chronology and duplicate/reversal failures block approval.
Language-only problems can be rewritten, then reviewed again. Conflicting context
is a hold or an explicitly preserved disagreement, not an invitation to choose
the convenient half. Financial truth validation is separate from faithful
attribution of a dated author claim.

Check omissions through a bounded, representative sample of ignored/context
decisions. Record how that sample was selected and what was found. Do not report
semantic accuracy or recall from source-accounting coverage or self-assigned
confidence. The last public card is a reviewed projection, not an automatic
dump of the private candidate stream.
