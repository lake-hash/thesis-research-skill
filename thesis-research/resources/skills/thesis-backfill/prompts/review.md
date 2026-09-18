# Reader And Source Review Prompt

For Thesis Playbook output, [single-source.md](../references/single-source.md)
supersedes multi-source display rules below. Require exactly one named original
link and matching date per card/update, and prose supported by that expression.
Preserve contextual evidence privately, not as additional visible source links.

Apply [current-run review](../references/run-review.md). Keep claim/event
reconstructions and specific support explanations; generic pass flags are not
review. Bind completed review to the finished input, record Signals searches
(including empty results), and validate the whole batch against active/pending
objects. Do not approve repeated assets disguised as baskets. All product outputs
must pass the current review and 500-character gates.


Apply [source stability](../references/source-stability.md). Compare the finished
footer with the entire current claim map, including earlier support. Reopen quoted
and reply context before treating short text as insufficient. Distinguish source
gaps from false statements and screening candidates from confirmed defects.
After formatting, require the sourceCoverage delivery check against the untouched
manifest; do not approve a formatter that loses a link while keeping its claim.

Apply [Source Fidelity Contract 1.0](../references/source-fidelity-contract.md).
For every visible sentence, reconstruct the source tuple before approving it.
Fail any new actor, possessor, ranking, superlative, certainty upgrade, condition
or time scope. In particular, reject `the author`, `the author's`, `according to
the author`, `the source`, `the post` and similar public narration unless the
source itself explicitly makes that relationship the investment subject.

The agent owns source/content review; do not require manual candidate approval.
Publish passing candidates when the user has authorized the batch. Do not hand
raw transcripts or evidence problems to the user as approval tasks. After failed
audio and full-transcript fallback, skip the interview with private attempt logs.
Follow the version-bound
[review workflow](../../thesis-review-publish/references/review-workflow.md).

For audio/video evidence, use [multimedia.md](../references/multimedia.md).
Verify the cited speaker, speech role, contemporaneous question/answer, exact
transcript revision and timecode. Podcast metadata and a high speaker-confidence
score are not approval, especially for title-only mappings and intro montages.
Verify ASR critical terms against audio or a verified corresponding full transcript;
never mark audio_checked on a transcript-only review. Inspect visual evidence when the
statement depends on a chart or slide. Review clipped quotes against the original
recording, and preserve the original date rather than the re-upload date.

Inputs: the full original sources and dated context, verified identities, current
company/episode history, the proposed prose, and proposed claim/source mappings.
Review the evidence yourself; the writer's choice of quotes is not sufficient.
Reject thesis or update records containing a `title` field, even if hidden in the
UI or labeled internal. Verify integrations and exports do not recreate it.

Apply [selection-and-source-media.md](../references/selection-and-source-media.md).
Require thesis what+why and a material reason/evidence/condition increment for an
update. Reject action/price/performance-only updates and company/theme leakage.
Require a visual-dependency decision and include only images that materially help
explain the event. An unavailable image blocks only a required visual claim.

For every main card and Timeline update, independently verify its own ticker set
and one `bullish`, `bearish` or `none` direction per ticker against exact source
evidence. Ticker sets and directions may differ across dates. Neutral requires a
source-supported balanced view; unresolved does not become neutral. Record these
directions in the final sidecar and verify that the visible first sentence is the
matching natural stance sentence, not a tag or metadata label. Hide all ticker
tags, direction words and icons during this check: sentence one alone must still
make every ticker's direction and why clear. Then review the body for clear, varied,
non-template language. The first sentence must make the direction, final investment landing and decisive source-backed mechanism immediately visible. It must name any counterparty, product or transaction needed to understand the relationship. The first body sentence must add distinct evidence, causality, condition or risk rather than paraphrase the opening. Public prose must not copy Bullish/Bearish/Neutral enum words, and delayed direction is invalid. Reject a batch that repeats one template or an opening that stops at a product, partnership, framework, policy event or operating fact and leaves the reader asking what it means for the investment. Do not infer long/short exposure from a general bullish/bearish assessment.
Apply `source-backed-opening/1.3` and record `opening_family`, `judgment_axis`,
the exact `stance_clause`, exact `mechanism_clause`, one exact
`stance_realizations` row per ticker, `metadata_hidden_direction_clear`,
`specific_directional_state`, `mechanism_visible_early`, `professional_voice`,
`natural_collocation`, `non_tautological`, `non_template`, `relationship_complete`
and `continuation_advances`. Generic
bare or mechanism-free attractive/unattractive and `the case is strong/weak`
wording fails. Mechanism-specific attractive/unattractive remains valid but enters
the same corpus concentration review as every other family. Visible prose never
copies Bullish/Bearish/Neutral metadata words. Read the feed in order for
corpus concentration, but send concentrated families to editorial review rather
than automatically rewriting them. Do not infer long/short exposure from a
general bullish/bearish assessment.

Run two explicit adversarial checks. First, remove all buying, selling, holding,
entry, allocation, margin and return language; reject the row as source-only when
no independent fundamental increment remains. Second, substitute a peer company
for the named company; reject or reroute the row when the why remains generic,
thematic or adjacent financing/policy context. Do not approve portfolio
diversification as a company update.

Reject technical-only analysis and trade-setup expressions from the public product,
including support/resistance, targets, stops, entry/exit levels, moving averages,
breakouts, chart patterns, momentum, relative strength and option timing. Mixed
content may pass only when an independently supported non-technical what and why
would still qualify after removing the technical material.
Reject objective revenue, guidance, backlog, news and price facts when the author
does not state their investment implication or how they change the thesis.

Compare the finished prose with the complete expression rather than the proposed
summary alone. Reject prose that expands `buy`, `sold`, `try another ticker`,
`cheap`, `technical analysis`, `great analysis` or a bare pattern label into a
business or technical rationale the source never states. A switch between tickers
does not carry the abandoned ticker's reason into the replacement. If a current
card is anchored on such a short action, require re-anchoring to an earlier
why-bearing source; if the record has none, remove it from public output.

Inventory and review attachments on both expression and context sources, including
the full quote/reply chain even when the current post has no attachment or image
keyword. A quoted/reply image may be approved as helpful
`explanatory_context` without explicit author adoption when it is directly relevant
and materially clarifies a Thesis/Update whose what and why are already independently
supported. Require the context source ID, exact attachment, concrete relevance
reason and correct outside-source attribution. It cannot establish or alter what,
why, ticker or direction. `Required` still needs explicit author reliance plus a
retained `purpose: context` span. Reject automatic inheritance, duplicate charts,
old trade screenshots that do not explain the current view, and attribution flattening.
If the archive has a media key but no image URL, record a retrieval gap rather
than approving an omit. Use `helpful_retrieval_pending` when the accepted prose
relies on the context's chart, document, technical or operating evidence; otherwise
use `unresolved_retrieval_pending`. Do not pass attachment completeness until the
gap is retrieved and inspected.

Audit finished prose and ticker tags in both directions. Every verified ticker
used in the prose as an investment, position, recommendation, comparison,
explicit beneficiary or explicit risk needs an event-specific binding; every
displayed tag must be explained by the prose. Reject first-ticker-only summaries
of shared multi-ticker judgments. Do not promote incidental customers, suppliers,
benchmarks or unrelated roundup sections. Record unresolved private, future or
ambiguous symbols as gaps rather than guessed assets.

Do not reject a useful chart merely because it belongs to the quoted or replied-to
post. If it supplies context for a retained valuation, spread, technical,
operating or supply/demand claim, require an included quoted-context binding and
provenance. Omit only when it is duplicative, stale, adjacent or not needed to
understand the accepted prose.

Reject and remove any proposed record that lacks a resolved author-named or
verified thread-inherited investable object/ticker. Reclassify its source as
`no_judgment` with an omission reason; do not approve it as `context`, leave it in
`records`, or invent an ETF/proxy. Existing-company updates may inherit the object
only from verified conversational context or the matched company history.

Reject new or rewritten visible thesis/update prose above 500 characters. For a
current Thesis, count `stance_sentence + description` exactly as it will appear in
Feed body; for Timeline, count its description. Count spaces, punctuation and
paragraph breaks; exclude the trailing named-original-link footer.
Require `generation_policy.prose_max_chars: 500` and `--require-prose-limit` in
packet validation. Check that shortening retained the decisive reason, necessary
conditions, amounts/units and historical transaction periods. Do not approve
truncation or extra thesis/update records created to evade the limit. Preserve
unchanged published history and recheck exact evidence after every rewrite.

Pass 1: Read each card and update without consulting its sources. For every
problem, record the exact span and what a reader would have to guess.

- Is the actor clear? Are providers/developers/operators identified by company
  and business role before the shorthand is used?
- Does a named project, instrument or product have enough context to be understood?
  Would Horizon 1 or PSUS mean anything to a reader arriving on this screen?
- Does the text describe the specific act or arrangement behind execution, capacity,
  secured power, monetization or opportunity?
- Does the opening communicate a judgment, useful reason and necessary named
  relationship without relying on the next sentence? Does each later sentence
  add evidence, causality, condition or risk without repeating the conclusion?
- Does the first sentence lead with the directional investment conclusion and state
  the final landing, rather than stopping one step early at a background fact?
- Can the same meaning be expressed more directly? Do not add length for its own
  sake, replace necessary financial terms with inaccurate simplifications, or pad
  a simple transaction with a stock analysis.
- Reject public copy that narrates the extraction or review process: `the article
  sees`, `the post describes`, `the source did not establish`, comparisons with
  nearby source versions, verified-estimate reconciliation, reviewer uncertainty,
  or audit conclusions. Rewrite the supported investment meaning directly. Keep
  reconciliation and rejected/unsupported claims in private review metadata.
- Treat any sentence beginning from `the/this source`, `post`, `article`, `reply`,
  `thread`, `newsletter`, `interview`, `podcast` or `transcript` as a review flag.
  Either state the supported investment fact directly or remove the sentence.
  Referral disclosures and source conflicts belong in private review metadata,
  not in thesis prose, unless the conflict itself is the author's investment view.
- Run this check over the final projected main-card and Timeline copy, after all
  overrides, grouping and source-only filters are applied. A scan of stored event
  bodies or a list of known examples is insufficient because presentation
  overrides can reintroduce reviewer language.

Pass 2: Reconstruct the meaning from the sources, then compare every claim.

- Before removing an update, identify the exact earlier source covering it. Check
  full current text and contemporaneous context for new numbers, periods, trades,
  conditions or attribution corrections that a thin summary may have omitted.
  Do not use future posts to declare an earlier statement redundant. Follow
  [increment review](../references/update-increment-review.md) for source-only,
  same-document and unresolved-context outcomes.

- Check the final grouped presentation: the main card's primary source must not
  also appear as a Timeline row. Its event and historical detail must remain in
  stored history. Other dated updates must survive; do not filter everything
  newer than an older analytical anchor or deduplicate by prose similarity.
- Verify exact supporting spans, speaker, dates, units, conditions and transaction
  stage. Distinguish rights/agreements from approvals, operating assets and revenue.
- Open the proposed primary source. Does it support the central investment judgment
  and the reason in this card? A same-company link, a long post or a recent date
  is insufficient. A holding/action-only source remains private position history
  and cannot prove an infrastructure/valuation explanation.
- A financing analysis supports financing facts, not an unrelated power-scarcity
  reason. Reject claimed coverage that is not actually present in the source even
  if the exact quote string is valid.
- Supporting facts such as project acceptance or a holding horizon need their own
  evidence. Ensure they remain linked to their dated history and do not acquire the
  primary source's publication date.
- For each update, inspect only its contemporaneous evidence. Do not insert later
  facts or silently rewrite an earlier event to match today's summary.
- Confirm prose is accurate and neutral: no inferred motive, upgraded certainty,
  promotional conclusion, false validation from price movement, or reviewer note.
- Reject public records and Timeline rows containing technical analysis. For mixed
  sources, retain only the independently supported fundamental what+why and keep
  technical clauses private.

Pass 3: Review the final public projection after grouping and overrides.

- Read every visible main card and Timeline row with its exact final source, date,
  ticker tags and selected media. Record explicit what and why; for Timeline,
  record the material reason/evidence/condition/correction increment.
- Write a `final-public/1.3` sidecar bound to the exact presentation hash. Do not
  generate an all-pass sidecar in an assembly loop. Any visible change invalidates
  the sidecar and returns affected expressions to review.
- When deterministic corpus checks report concentrated opening families, add a
  top-level `opening_distribution_review` with contract, reviewer, reviewed_at,
  warning_count, decision and reason. Review the flagged cards in feed order; do
  not authorize automatic synonym rotation.
- Delivery fails when any visible expression lacks direct voice, source fidelity,
  complete ticker/media decisions or its one matching source/date pair.
- Review every visible expression. Record `review_scope: all_visible_expressions`
  and exact total/completed counts equal to final cards plus Timeline rows. A
  sample, changed-only pass or known-example pass cannot approve delivery.
- Record `company_specific_increment`, `portfolio_operation_free`,
  `process_language_free`, `prose_coherent`, `repetition_free`,
  `related_context_excluded` and `why_specific` as independent booleans. Also
  record `relationship_complete` and `continuation_advances` for every card.
  `relationship_complete` means sentence one names the relationship needed to
  understand the mechanism; `continuation_advances` means the first body sentence
  adds evidence, causality, condition or risk rather than paraphrasing the opening.
  Also
  record `why_complete_sentence`, `objective_fact_only`, `why_mechanism_type` and
  source-specific `ticker_roles`. Only subject/vehicle tickers may render as tags.
  A generic fundamental label cannot substitute for these decisions.
- For every Timeline row record `timeline_opening_contract:
  source-backed-timeline-opening/1.2`, exact `stance_clause`, exact
  `mechanism_clause`, per-ticker `stance_realizations`,
  `metadata_hidden_direction_clear`, `direction_visible_immediately`,
  `mechanism_visible_immediately`, `relationship_complete` and
  `continuation_advances`. Sentence one must contain that date's conclusion and
  mechanism. Reject delayed implications, unnamed relationships, present-day
  card language imported into history, and a follow-up sentence that merely
  paraphrases the opening.
- Require one non-candidate `release_version`. Published readback additionally
  requires `release_status: released` across packet, presentation and sidecar.

Return approve, revise or hold with specific findings. Mark `reader_clarity`,
`source_coverage` and `primary_anchor` pass only after these checks. Do not average
away a source mismatch with a high prose score. Re-review edited prose and rebuild
the claim map and candidate eligibility after revisions. Preserve unresolved
evidence gaps; passing structural validation is not semantic approval.

After classification, reconcile reviewed keep decisions with the exported event
manifest. A legacy `REAFFIRM` must not override a supported increment. Preserve
the approval when identity, source, ticker or timestamp prerequisites block export,
and report that separate blocker. For missing references, search registered raw
archives and reply caches; never substitute the review's prose for original text.

Complete `timeline_review` for every event in the canonical company's history,
including merged records. Name the actual increment for each update. For a
source-only repeat, supply strictly earlier `covered_by_event_ids`; for a repeated
trade report, identify `same_action_event_id` and verify it is the same execution,
not another buy or sale. For a hold, state `missing_context`. Check document
identity, revision and expression date before approving `disclosure_groups`.
Review the rendered exclusions as well as the retained updates. Do not approve a
current card anchored on source-only or held material.

For product export, verify the exact seven-field ThesisCard shape:
`thesisId`, `type`, `createdAtMs`, `author`, `body`, `tickers`, `media`.
Reject any card containing `title`, `source`, `sources`, review metadata, status,
confidence, run metadata or account metadata. `type` must be exactly
`new_thesis` or `thesis_update`. `createdAtMs` must belong to the card's own
accepted expression; an update must not reuse the first Thesis timestamp.
`author` must contain only the authoritative stable `id`. `tickers` must be a
non-empty display-ordered list of unique symbols. Product direction is exactly
`bullish`, `bearish` or `none`; map an internally reviewed neutral/balanced view
to `none`, and never emit `neutral` in the product object. `media` must always be
present, with ordered `image` or `priceChart` entries requiring `coverUrl` and
allowing `url`; use `[]` when no approved media exists.

Append named original Markdown links at the end of `body`, e.g. [Beth Kindig on X](URL),
[Acquired Podcast](URL), or [NVIDIA Earnings Call](URL). Use short author/channel,
program or issuer names, not bare domains, generic "Source", "Click here", HTML,
arrows or long headlines. Separate links with spaces, deduplicate URLs and retain
actual original pages/timecodes. Check links against the reviewed evidence. The
link label is not a card title. Only user-original content may omit external links.
Use this update's own links, not the current card's links. Preserve exact original-language
text separately from English prose. Numeric thesisId and backend author.id come
from authoritative mappings, not model generation. Use the ThesisCard adapter
after review; do not output a hold or context as a product card.
