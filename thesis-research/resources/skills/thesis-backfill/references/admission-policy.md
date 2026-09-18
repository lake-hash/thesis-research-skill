# Thesis Admission Policy 1.4

This is the canonical selection policy for new backfills and updates. It
supersedes conflicting legacy examples or permissive classifier wording. When
another reference appears to disagree, stop and resolve the conflict rather than
choosing the looser rule.

## Current Public Scope: Source-Grounded Company Analysis

The current public scope is `source_grounded_company_analysis/1.0`. Every public
Thesis and Timeline expression must be reconstructed from its own original source
and contemporaneous context. Do not infer a missing judgment, reason, ticker or
direction from company knowledge, another date or the current main card.

Technical-only expressions remain private `technical_only` history. Do not publish
support/resistance, moving averages,
breakouts, chart patterns, momentum, relative strength, overbought/oversold
signals, option timing, stops, targets or short-term entry/exit structure as the
sole thesis or update. Mixed analysis may be public only when a separate
source-backed non-technical judgment and why independently qualify.

## Thesis Admission

A public thesis requires all three:

1. a specific investable company, security or asset resolved to a verified ticker;
2. the target author's own judgment or expectation (`what`); and
3. at least one reason, causal mechanism or fundamental condition stated by that
   author in the complete contemporaneous expression (`why`).

Buys, sells, holdings, sizing, targets, stops, returns, watchlists, objective news
and unexplained bullish/bearish language are private history, not theses. Do not
supply a missing why from another date, the author's general history, an unadopted
quoted post, nearby company knowledge or model knowledge. Prefer omission or hold
over an inferred thesis.

Every approved public thesis requires at least one ticker and one source-backed
direction for every displayed ticker: `bullish`, `bearish` or `none`. A shared
multi-ticker expression may assign different directions to different tickers.
Hold an unresolved ticker or direction rather than guessing. The visible prose is
stance-first and states the investment implication and why before background detail.

## Update Admission

A visible Timeline update must have its own ticker set, per-ticker direction and
explicit why. It must add or change a thesis reason, evidence, condition, risk,
valuation basis, forecast or stance. Technical-only changes remain private; mixed
analysis may qualify only through an independently supported non-technical
increment. Record the exact increment and compare it with strictly earlier
events in the same author/object history.

Related content, agreement, repeated conviction, price movement, another purchase,
position management, objective facts and technical-only changes are source-only.
An abbreviated reply may use the matched history to resolve the company reference,
but the final visible update must still carry its own verified ticker binding. It
must not silently inherit the current card's ticker set or direction.
Historical prose uses only evidence available at that date.

Portfolio construction is never a company-thesis increment. Diversifying among
securities, concentrating in one holding, target portfolio weights, margin use,
position size, adding on weakness, waiting for a better entry and choosing one
vehicle over another remain private position history even when the author says
one company may outperform. Require a separate company-specific change in
business evidence, valuation, risk or operating conditions.

Adjacent theme or financing context does not enter a company Timeline merely
because it names or could benefit the company. Sovereign-AI funds, supplier or
customer financing, sector demand and peer success stay source-only or in their
own verified theme/company record unless the author explicitly connects the new
fact to this record's company-level thesis.

For a mixed expression, remove the author's purchase, sale, holding size, return,
entry timing and allocation language from public prose. Retain only the
independently qualifying fundamental increment. If no material increment remains,
classify the entire expression `source_only`.

## Grouping And Tickers

One author and one resolved company have one active thesis. Business lines,
catalysts, risks, valuations and trading episodes stay inside that history.

One indivisible source judgment about several investable objects is one expression
with every explicitly used ticker. Unrelated roundup sections remain separate.
Every visible ticker needs a reviewed span in the public prose and source evidence,
plus its own `bullish`, `bearish` or `none` direction;
every security used by the prose as an investment, comparison, beneficiary or risk
needs a visible tag. Customers, suppliers, benchmarks and sector members are not
investment objects unless the author makes them part of the judgment.

## Source And Date

Each card or Timeline expression has one primary source and its true expression
date. The main-card source is not repeated in Timeline. Changing the selected
source invalidates and rebuilds prose, date, ticker bindings, media and review.
Quoted/replied-to views require explicit adoption before they can establish the
target author's judgment. Public prose ends with one short named original link;
private evidence retains the complete source map.

## Conclusion-First Public Language

There is no thesis or event `title` field. Short ideas stay short; longer ideas
start with a concise summary paragraph. Prose is professional plain English and
no more than 500 characters, excluding the named-link footer.

The first sentence states the company/asset direction or investment implication
together with the decisive reason. Do not open with a product description,
background fact or mechanism whose implication appears only later. The wording
need not follow a fixed template, but a reader should understand what may benefit,
weaken or change and why after the opening sentence.
The memo opening follows the shared
[stance opening contract](stance-opening-contract.md). State a specific directional
condition. Attractive/unattractive is allowed only with an immediate mechanism
and corpus diversity review; a bare label is invalid. The direction is visible in
the first clause and the decisive mechanism, including any necessary named
relationship, appears in the same first sentence. Bullish/Bearish/Neutral remain
tag metadata and do not appear as generated public-prose labels. Adjacent duplicate opening families fail; rolling
or catalog concentration requires corpus editorial review and never triggers
automatic synonym rotation.
The following body supplies the mechanism, evidence and conditions. `Visa, Mastercard and Ant International developed the Know-Your-Agent framework` is evidence; it is incomplete as an opening until the prose explains what that means for the investment. The opening uses regular black body text, not bold or green/red emphasis.
Standardize the stance field, not the explanatory language. Vary sentence
structure naturally and reject prose that becomes templated, vague or hard to
understand.

State the investment meaning directly. Do not publish `X thinks`, `the article
says`, `the source did not establish`, extraction narration, reviewer conclusions,
number-reconciliation notes or referral/commercial disclosures. Do not expand a
simple view into a complete investment story.

The why must name the economic or operating link. Phrases such as
`differentiated market behavior`, `future value`, `strong management`, `good
positioning` or `attractive opportunity` do not qualify unless the same
expression explains the asset, mechanism, metric, customer, capacity, cost,
margin, valuation or risk that makes the judgment true.

## Source Images

Images are not inherited automatically. Inspect attachments on the author source
and the complete quote/reply chain. Include only images that materially explain a
number, supply/demand point, valuation, product or operating evidence used in
fundamental prose. Technical charts remain private with their source.

Every candidate attachment must end as `include`, `omit` or `retrieval_gap`.
Required image-dependent claims remain held while evidence is unavailable.
Source-only, held and rejected material produces no public media. Product media is
derived from reviewed include bindings and opens inside the product experience.

## Fail-Closed Boundary

Triage is not approval. Generation is not approval. A missing review outcome is
not an implicit keep. Every visible final expression requires an evidence-bound
final review tied to the exact presentation hash. Anything missing that review is
held from delivery.
Review coverage is exhaustive: reviewed expression count must equal visible main
cards plus visible Timeline rows. No sampling or known-example-only pass can
authorize delivery.

The final review also records `company_specific_increment`,
`portfolio_operation_free`, `related_context_excluded` and `why_specific` for
every visible row. All must be true. Release metadata uses one target version
without a `-candidate` suffix; published readback must report that same version
and `release_status: released` in both the catalog and final-review sidecar.
