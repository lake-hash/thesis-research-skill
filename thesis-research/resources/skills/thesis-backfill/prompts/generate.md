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

For recorded speech, first follow [multimedia.md](../references/multimedia.md).
Work from reviewed speaker turns, not episode descriptions. Keep interviewer
questions as context; do not convert them into the guest's opinion. Check ASR
names, numbers and negation against audio or a verified corresponding full
transcript; skip the interview if neither is reliable. Preserve speaker, segment and playback
locators for every claim. Reconcile episode batches into the existing author/company
history; a podcast and an X clip of it are not two independent expressions.

Use with the actual source archive, verified author/company identities, current
records and merge aliases, and the requested cutoff. Do not substitute summaries
for originals. Follow generation contract 3.1 and the local packet schema.

Set `generation_policy.public_scope` to
`fundamental_company_only/1.0`. Do not generate public technical-analysis theses,
trade setups or technical-only Timeline rows. Support/resistance, moving averages,
breakouts, chart patterns, momentum, relative strength, options timing, stops and
targets remain private as `technical_out_of_scope`.

Produce source-backed company theses and dated updates in insightful, descriptive,
professional plain English for an investor who has not read the source thread.
Return no `title` field on thesis or update records. It is not optional internal
metadata. Use descriptions for prose and stable IDs for references and export.

Before classification, apply
[selection-and-source-media.md](../references/selection-and-source-media.md).
Require what plus why for a thesis and a material new reason, evidence or condition
for an update. Position actions, returns and price recaps alone remain private
history. Decide visual dependency after content triage. Inspect candidate images
only when they may be required/helpful; include only images that materially
clarify the event and omit the rest with reasons.

Treat all technical-analysis and trade-setup material as private, including
targets, support/resistance, stops, entry/exit levels, moving averages, breakouts,
chart patterns, momentum, relative strength, options timing and overbought/
oversold signals. `If price loses X, next support is Y` remains
`technical_out_of_scope`. Objective company or market facts still require an
explicit fundamental implication.

Recover attachments from the author's source and from verified quoted/reply
context. A context image may be included only when the author relies on that
context and it materially explains the accepted thesis/update. Keep the context
source ID and exact attachment binding; never attribute the quoted image or claim
to the author. Prefer a sufficient current-author image over duplicative older
context images.

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

Limit each new or rewritten thesis and Timeline description to **500 characters**
in total, including spaces, punctuation and paragraph breaks, excluding only the
trailing original-link footer. Count with `scripts/prose-limit.mjs`; declare
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
2. Write the directional conclusion and decisive reason together in the first
   sentence. Do not begin with background and delay the investment implication
   until a later paragraph. Name companies and explain
   their role before using umbrella terms. Follow with only the facts needed to
   explain the argument. Use short connected paragraphs when needed; a simple view
   can stay one paragraph. Do not produce a separate visible headline.
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

For product export, output seven fields with no sources/source/title field. Append
named original Markdown links at the end of body, e.g. [Beth Kindig on X](URL),
[Acquired Podcast](URL), or [NVIDIA Earnings Call](URL). Use short author/channel,
program or issuer names, not bare domains, generic "Source", "Click here", HTML,
arrows or long headlines. Separate links with spaces, deduplicate URLs and retain
actual original pages/timecodes. Check links against the reviewed evidence. The
link label is not a card title. Only user-original content may omit external links.
Use this update's own links, not the current card's links. Preserve exact original-language
text separately from English prose. Numeric thesisId and backend author.id come
from authoritative mappings, not model generation. Use the ThesisCard adapter
after review; do not output a hold or context as a product card.

After grouping and presentation assembly, review every visible main card and every
visible Timeline row. Do not sample, limit review to changed records, or stop after
known examples. The final sidecar counts must exactly equal the deterministic
visible-expression count and remain bound to the final presentation hash.
