# Thesis, Update And Source Media Selection

Classify a complete contemporaneous expression: author text, potentially relevant
attached images, and required reply/quote context. Preserve exact attribution and
certainty. Images are evidence, not independent thesis candidates.

## Resolved Investable Object Gate

Before what-plus-why review, require a specific investable company, security or
author-named vehicle that resolves to a verified ticker. The object can be stated
as a ticker or an unambiguous company/security name. A short reply may inherit the
object only from its verified parent/thread or an already matched company history.

If the source is standalone broad-market, macro, policy-calendar, event-risk,
sector-rotation or theme commentary without that object, classify it as
`no_judgment` and stop. Do not create a thesis, update, setup, context record or
Timeline event, and do not invent a proxy ticker. Retain only the source decision
and omit reason in the run ledger so reruns can skip it. This gate precedes image
inspection and deep generation.

## Thesis Requires What Plus Why

A thesis needs a resolved investment object, the target author's own judgment or
expectation (`what`), and at least one author-expressed non-technical reason or
causal mechanism (`why`). Do not supply missing logic. A technical condition may
support mixed analysis, but it cannot be the only why.

Preference lists, holdings, buys/sells, returns, performance recaps and watchlists
alone are not theses. Keep useful actions privately as trade/position history.
Pure news, jokes, promotions, questions, unexplained ticker lists, unsupported
charts and unadopted third-party statements do not qualify.

Short source text is never a license to fill in a thesis from neighboring posts,
the author's broader history or the model's investment knowledge. `Buy X`, `I
switched to Y`, `I sold`, `it is cheap`, `technical analysis`, `great analysis`
and similar statements remain source-only unless that same complete expression
states a concrete reason or explicitly adopts preserved quote/reply context that
does. Switching away from one ticker does not transfer the old ticker's reason to
the new ticker. Chart labels, patterns, breakouts, support and targets remain
private when they are the entire analysis. They may remain dated supporting
context only when a separate source-backed non-technical what and why qualify.

## Update Requires A Material Thesis Increment

An update has its own ticker set and per-ticker direction, and adds or changes a substantive reason, evidence or condition for an
existing thesis, and explains what that new information supports, weakens or
changes using only contemporaneous evidence. A revised mechanism, forecast,
valuation rationale, catalyst, risk, invalidation condition or operating milestone
can qualify.

Related content, repeated conviction/reasoning/numbers, ordinary price changes,
buy/sell/hold decisions, sizing, realized results and victory recaps do not qualify
by themselves. Use `source_only` unless the same expression also contains a
material thesis increment. Use `hold` for unresolved identity or context.

Every qualifying update must state an explicit why. The current-card source follows the same rule. If the newest expression is only an
action, switch, exit or preference, keep it in private history and anchor the card
to the latest earlier expression that independently states what plus why. If no
such expression exists in the complete record, omit the public thesis instead of
publishing an action recap as its summary.

One author/company has one company thesis. Theme theses are separate objects.
Do not merge or copy views between company and theme records merely because a
company belongs to the theme. A theme/company event crosses that boundary only
when the author explicitly makes that thesis-level connection.

## Objective Writing

State object, judgment and sourced reason directly. Avoid `the author thinks`,
invented first person, promotional conclusions and internal review commentary.
Preserve conditions, uncertainty, negation, stage, units and timing. Price movement
is not automatically validation; a holding does not establish motive. Label
estimates and reported actions accurately.

Named links and evidence metadata carry provenance. Do not put `the article says`,
`the source did not establish`, discrepancy-resolution notes, or reviewer/audit
language in the thesis body. State supported judgments directly and leave
unsupported targets or figures out of product prose. Keep material investment
uncertainty, but express it as the actual condition or risk rather than as a report
about the reviewer.

## Complete Expression Ticker Coverage

Review ticker coverage and direction after drafting, against the complete author expression and
the finished prose. Every verified security that the prose names as an investment,
position, recommendation, comparison, explicit beneficiary or explicit risk must
have an event-specific asset binding, visible ticker tag and source-backed
`bullish`, `bearish` or `none` direction. This applies to both
the current card and dated Timeline updates. If one expression evaluates several
securities under one shared judgment, keep them on one expression and mention each
one in the prose; do not silently reduce the card to the first ticker.

The current card and a Timeline update may legitimately have different tickers or
directions. Never copy the current card's ticker set or direction into an older
event. Do not add every symbol found by a regex. A customer, supplier, benchmark, quoted
author, rejected example or unrelated section of a roundup stays context unless
the generated expression actually uses it. Resolve aliases and listings before
binding. If a named ticker is private, future, ambiguous or cannot be resolved,
record the gap and revise or hold the affected wording rather than inventing an
asset. The final review must check both directions: every visible tag is explained
by the prose, and every source ticker used by the prose has a tag.

## Conditional Source Images

Every new source declares `attachment_status`, `attachments` and any retrieval
gap as described in the output contract. Every reviewed event declares:

```json
{
  "visual_dependency": "required | helpful | none | unresolved",
  "visual_dependency_reason": "Specific content-based reason",
  "media_bindings": [{
    "source_id": "source-1",
    "attachment_id": "image-1",
    "disposition": "include | omit | retrieval_gap",
    "reason": "Required for omit or retrieval_gap"
  }]
}
```

- `required`: the thesis/update cannot be understood or supported without the
  image. Inspect and include relevant images. Unavailable evidence blocks approval.
- `helpful`: text qualifies independently, but the image materially improves
  context. Include only the useful image(s). If the exact attachment is known
  but its URL cannot be recovered, retain an explicit `retrieval_gap` binding;
  do not silently treat the missing file as an omit decision.
- `none`: images add no decision-useful context. Omit all with reasons.
- `unresolved`: relevance/content cannot be established. Hold image-based claims.

`retrieval_gap` is an attachment disposition, not a visual-dependency value. It
requires the exact source and attachment IDs plus a retrieval reason. It can
complete review for `helpful` context when the prose stands independently;
`required` visual evidence remains held until the image is retrieved and included.

For a multi-company carousel, bind each useful image only to the event it explains.
Context/quoted-post images do not automatically follow the author's event. They
may be included when they are directly relevant and materially help explain an
already source-supported thesis, update or surrounding context, even when the
author did not explicitly adopt the image's contents. Retain the context source
ID, bind the exact attachment, set `context_image_role: explanatory_context`, and
state why it is useful. This relaxed path is `helpful`, never `required`: the image
cannot supply a missing what, why, ticker or direction and cannot be attributed to
the tracked author. Explicitly adopted quote/reply context may still be retained
as `purpose: context` evidence under the existing attribution rules.
Inventory the complete reply/quote chain before making the visual decision. Reopen
the quoted or replied-to post even when the current post has no attachment and
even when no image keyword appears in the current text.
If its chart, table or figure explains a valuation, spread, technical condition,
operating result, supply/demand claim or other point retained in the prose, mark it
`helpful` and include it with quoted-context provenance. Use `required` only when
the author explicitly relies on the visual and the retained context evidence proves
that dependency. Do not treat
"image belongs to another post" as an omission reason by itself.
Prefer the author's own current image when it already explains the point; omit
duplicative, stale or merely adjacent context images with reasons. A retained
media key without a usable URL is a retrieval gap, never an `omit` decision. Use
`helpful_retrieval_pending` when accepted prose relies on chart, document,
technical or operating evidence in that context; otherwise use
`unresolved_retrieval_pending`. Do not claim attachment completeness while either
state remains. Helpful-but-unavailable context may leave a text-complete event
visible, but the run must report the gap; image-dependent claims remain held.
Product `media` is derived from reviewed `include` bindings; handwritten or
borrowed media fails delivery validation. Unselected/source-only posts produce no
product media.

Ticker logos and person portraits are separate entity images.
