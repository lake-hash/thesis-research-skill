# ThesisCard export contract 1.1

This delivery schema implements the shared
[Thesis core contract](../../references/thesis-core-contract.md). It does not
redefine content admission or source-fidelity rules.

Preparation input is now `thesis-export-input/1.1`, with required `sourceCoverage`
integrity metadata generated from the validated claim/history evidence. Input 1.0
remains explicit legacy compatibility, not current evidence certification. Follow
[source stability](../../thesis-backfill/references/source-stability.md) and run
`scripts/validate-delivery.mjs` after any formatting before delivery/publication.
The seven public card fields below are unchanged.

Product source: https://app.notion.com/p/3d8c6bac30df8007907cccdc5d62ebb7
Checked 2026-09-18 against the updated Notion page. This is an adapter contract, not a deployed backend API.
Use alongside generation policy 3.2, not instead of its source/claim validation.

## Three separate outputs

- The research packet retains full source provenance, claim evidence, author/company
  identity, dated events, episodes, review results, holds and collection gaps.
- `cards.json` is an ordered array of exact product ThesisCard objects.
- `ingestion-manifest.json` associates each card index with stable thesis/event keys,
  source revisions, review provenance, baseline version and content hash. It is a
  proposed backend handoff format; backend acceptance still needs integration.

The product card has exactly `thesisId`, `type`, `createdAtMs`, `author`, `body`,
`tickers`, `media`. Reject `sources`, `source`, generated card/update `title`, status, confidence,
run ID, raw review reason or account metadata leaks into this object.

## Field mapping

| Product field | Input and rule |
| --- | --- |
| thesisId | Positive safe integer supplied in a persisted feed allocation map, scoped to author.id. Never an array index, model number or global counter. |
| type | Explicit `new_thesis` or `thesis_update`; not sentiment, lifecycle event type or thesis/setup classification. |
| createdAtMs | Unix-millisecond timestamp for this card's own creation/publication expression. A new Thesis uses its accepted first expression; a `thesis_update` uses the newer update expression. Never reuse the original Thesis timestamp for an update, and never substitute the batch run time. |
| author.id | Resolve local author_id through an explicit authoritative author map. Do not assume a handle equals a Persons ID or X numeric ID. |
| body | Nonempty Markdown followed by named original links. A current Thesis body begins with the reviewed `stance_sentence`, then its supporting description. An update body is that dated event's already stance-first description. The complete visible prose is at most 500 characters before links. |
| tickers | Reviewed primary/vehicle bindings relevant to this expression, in display order. No related-only mentions. At least one unique symbol. Preserve listing suffix. |
| tickers[].direction | Required per ticker. Exactly `bullish`, `bearish` or `none`; `none` means the ticker is related to the expression but has no clear positive or negative direction. |
| tickers[].logoUrl | Verified matching icon or verified fallback, otherwise omit. A missing logo does not block the thesis. |
| media | Ordered image/priceChart entries. Original post images are derived from reviewed `required` or `helpful` attachment bindings. Each needs an actual coverUrl; url is optional. Use [] when visual dependency is `none`, even if decorative/redundant source images exist. Missing/unavailable images block only required/helpful visual context; never invent or borrow media. |

## Named Original Links

Append `[Short source name](original URL)` at the end of `body`. Use a short,
specific author/channel, program or issuer label: `Beth Kindig on X`, `mon on
Substack`, `Acquired Podcast`, `NVIDIA Earnings Call`. Add a guest or reporting
period only when needed. Aim for 3-8 words; do not mechanically truncate a long
article headline. This label names evidence, not a thesis. No bare domains,
"Click here", generic "Source", HTML, arrows or separate source fields. Do not
replace the actual original with a homepage or search page.

Order links primary first, then necessary supporting originals, separated by
spaces in a final paragraph. Deduplicate identical URLs, preserving distinct PDF
pages and verified timecodes. Do not append the entire Timeline, unrelated Signals
or unverified evidence. Keep source revisions internally even when they share a
URL. A rerun replaces the existing footer from reviewed references, not duplicates it.

User-authored content without external sources needs no link. This extraction
route requires reviewed evidence and a nonempty footer. Validate each link against
its exact source reference. Original text and review evidence remain in the private
packet/normalized input; the internal manifest retains URL, linkLabel, time and
source hash. No original full text is exported inside cards. Full-text redistribution
permission is not a prerequisite for this link-only format; explicit link restrictions
still block export (`linkAllowed:false`). Source-fidelity and chronology gates remain.

## Identity, chronology and card semantics

One author plus one resolved company is one active thesis; distinct business
mechanisms and new trading episodes stay under it. Preserve episode/account IDs
internally. Assets and baskets need stable object keys; do not invent tickers for
non-investable macro or portfolio background. Legacy fragments require an explicit
alias/migration plan; do not renumber or erase earlier references during export.

The feed owns atomic author-scoped ID allocation and the high-water mark. Allocate
once for a new internalThesisKey; retain assignments/tombstones after deletion.
The exporter only consumes this map. Unknown assignments block export. Test maps
must be explicitly marked `fixture`, and manifests from them are not production
ready. Real imported allocations use `feed` plus a map revision.

Every history card needs its own stable eventId. `(author.id, thesisId)` identifies
the thesis, not each update. Publication identity is the tuple of backend author,
internalThesisKey and eventId; keep the key unchanged on retries. A content hash
change under that key is a conflict/correction, not another automatic insertion.
Source revisions are tracked separately. Reviewed corrections require a versioned
correction operation; this exporter does not mutate published history.

`new_thesis` is treated here as the first persisted archive card, not proof of
novelty. Keep originStatus `new|existing|unknown` separately. The feed field is
the card's creation/publication timestamp for the accepted expression: the first
expression for a new Thesis and the current expression for an update. Keep batch
ingestion, review and publication-run timestamps in the manifest, not in the
ThesisCard. The normalized export input must declare the selected timestamp
policy explicitly so a rerun cannot silently move a card in time.
Unknown or day-only times are held rather than fabricated as midnight. A caller
must resolve a documented product policy before exporting such records.
This includes timestamps ending in midnight when `datePrecision: day` survives
from the source. Never remove that precision flag merely to pass export.

Two modes must not be mixed:
- `history_event`: immutable dated expression; body/time/tickers/sources belong
  to this event. First accepted record is new_thesis, subsequent records are updates.
- `current_snapshot`: reviewed current company prose with the eligible primary
  source's date. Exportable for a current-state preview, but never auto-insert this
  snapshot as another new-thesis event. The primary source supports central
  judgment AND decisive reason; all supporting claims keep their own source links.
The manifest identifies the mode; the backend must choose the proper write route.
Current snapshots may cite supporting facts later than their analytical anchor;
their full source list is retained. Historical expressions may never use future
sources. Keep the snapshot out of append-only history even when the shapes match.

Pure repetition, Pass, context, unresolved and technical-failure outputs stay in the
internal ledger, not cards.json. A legacy `REAFFIRM` label is not a decision about
today's reviewed content: export it as `thesis_update` when `eventDisposition` is
`update` and `incrementReview` records `decision: update`, a concrete `increment`
and a `reviewId`. Preserve the legacy event type in the manifest; never rewrite
the old classification just to pass export. A valid company trade update can be short; do not
invent a fundamental rationale. Source selection does not delete the stored event.
Map the research `timeline_review` disposition to export input `eventDisposition`.
Only `update` is exportable. Explicit `source_only`, `hold`, or unresolved values
are blocked even if the item otherwise carries an approval. Historical omitted
values remain accepted for compatibility; new adapters must supply the outcome.
Combine a reviewed same-document disclosure once, retaining all supporting page
sources and legacy event mappings, never creating a product version per page.
The existing UI's primary-source Timeline filter is presentation-only: export full
eligible history, not the filtered 40-word previews. Signals need a separate route.

## Normalized input to the exporter

The helper validates/marshals reviewed records; it does not classify, semantically
review, allocate IDs or directly ingest legacy packets. Prepare `export-input.json`
from a current validated packet after source-first review. Keep originals intact.

The runnable normalized example is
[export-input.fixture.json](../examples/export-input.fixture.json), generated by
the same sourceCoverage preparation helper as current input 1.1. Its companion
cards and manifest demonstrate the seven-field output. Do not hand-edit the
integrity receipt or use fixture IDs in production.

Example values are fixtures, not source evidence. `assetBindings[].verified` and
review metadata record previously executed checks; the exporter cannot prove them.
For updates baselineVersion is required. Optional internal episodeId/accountId and
source body hashes pass to the manifest, never into the card. Optional confirmed
logoUrl and source iconUrl are omitted when absent. Pass/hold can be recorded with
review.status other than approved; the exporter returns them in `holds` without
rendering partial cards. A malformed item blocks that item, not healthy peers;
ambiguous author/ID maps or source IDs fail the batch before any output.

```bash
node skills/thesis-review-publish/scripts/export-thesis-cards.mjs export-input.json output-dir
node --test skills/thesis-review-publish/scripts/test-export-thesis-cards.mjs
```

Outputs also include holds.json. Existing output directories are not overwritten;
use a new run directory. Stable cards and keys across fresh output directories are
expected on retries. Exported does not mean ingested, published or notified.

## Prepared Output And Playbook Reader

For a validated generation-3.2 packet, use the preparation adapter rather than
manually rebuilding the seven product fields:

```bash
node skills/thesis-review-publish/scripts/prepare-card-export.mjs packet.json export-config.json NEW-output-dir
```

`export-config.json` supplies `runId`, `baselineVersion`, `authorMap`, persisted
`assignments`, and any `sourceLinkPermissions` keyed by original source ID. Production
assignments have authority `feed`. Link permission does not authorize full-text
redistribution. The adapter never allocates production IDs or author identities.
Use a fresh output directory; failures are recorded in `gaps.json`, not filled
with invented IDs, source text or timestamps.

The output separates `cards.json` (history) from `current-cards.json` (snapshots).
Each has its own manifest. `playbook-data.json` wraps both arrays in schema
`thesis-cards/1.1`, with a separate `presentation` object for author profiles,
group identities, aliases, assets and Signals. Metadata never becomes extra
fields inside a ThesisCard. The reader groups by `(author.id, thesisId)`, keeps
historical bodies intact and suppresses the main source's duplicate Timeline row.
If a current snapshot is held, do not silently promote a historical card to fill it.

### Feed Responsibility Boundary

The Thesis skills own the seven-field cards and their evidence-bound values. The
Feed owns visual and interaction behavior: opening a thesis and its Timeline,
source-link interaction, typography, image sizing and optional image zoom/lightbox.
Do not rebuild those behaviors in an author backfill unless the user explicitly
requests a separate UI artifact.

For the current Feed treatment:

- render one ticker item for each unique `tickers[]` entry and use at most its one
  matching `logoUrl`;
- show an upward trend icon for `bullish`, a downward trend icon for `bearish`, and
  no direction icon for `none`; do not display the enum words;
- keep each card's ordered `media[]` local to that exact expression. Use
  `coverUrl` for the preview and `url` as the optional full asset; never borrow
  media from another update or thesis;
- group cards by `(author.id, thesisId)`, sort historical updates by their own
  `createdAtMs`, and suppress only the history event identified as the current
  snapshot's event in the manifests.

For a chronological Feed, the projection additionally returns `feedItems`, one
entry per immutable history event, each carrying `eventId`, the scoped thesis
identity, its own `createdAtMs`, and the validated ThesisCard. Render these items
directly in the main Feed; do not replace them with one latest card per thesis.
When a user opens an item, resolve its detail with the temporal projection
contract (`thesis-feed-projection/1.1`): the selected event is the top-level
current content, and Timeline contains only strictly earlier events for the same
`(author.id, thesisId)`, newest first. The selected event must not appear again
in Timeline, and future events or the latest current snapshot must not leak into
that historical detail. `projectThesisAt` supports selection by `eventId` or by
thesis plus a cutoff date, choosing the latest event at or before that cutoff.

Validate the prepared bundle before Feed handoff:

```bash
node skills/thesis-review-publish/scripts/project-thesis-feed.mjs playbook-data.json feed-projection.json
node --test skills/thesis-review-publish/scripts/test-feed-projection.mjs
```

This projection validates data ownership and grouping. It does not claim that a
particular frontend rendered the intended controls; the Feed repository should
cover those components with its own UI tests.

Projection also runs `temporal-feed-opening-diversity/1.0` against the actual
chronological `feedItems` order. It fails delivery when adjacent rows reuse the
same surface family, when one family appears more than twice inside six rows, or
when a repeated family dominates the corpus. This check spans Thesis identities;
per-record Timeline review alone is not sufficient.

`allocatePreviewIds` provides **local-preview-only** persistent numeric IDs. It
retains removed allocations and cannot modify a production map. The manifest
marks `previewOnly: true`, `productionIds: false`, and authority `local_preview`.
Such bundles must never be ingested or published. Original text stays in the
private evidence packet, not the seven-field card export.
Replace preview mappings with authoritative feed mappings before production.

The existing prototype has a separately scoped migration entrypoint at
`thesis-field-notes/prepare-product-data.mjs`. It joins archived originals by
source identity/hash, retains reviewed prose, records unresolved references,
and does not reinterpret old review decisions or silently fix source mismatches.
This migration is not a replacement for source-first review of new content.

## Review And Export Are Separate Decisions

An approved update may still be blocked by missing author IDs, source/context
text, ticker bindings, export permission or date precision. Keep its content
approval and explain the export blocker separately (`contentReviewStatus`,
`exportStatus: blocked`). Never relabel a missing field as no investment judgment.
Reconcile every reviewed keep decision to an exported event, an explicit blocker,
or a documented scope exclusion, resolving both thesis and event aliases first.
The prototype emits `review-reconciliation.json` and replays the actual review
corpus in tests; structural tests alone do not prove approved content survived.

Search all registered original-source archives and recovered reply/quote caches
before declaring a source missing. Identical X status IDs may have handle and
`/i/status/` URLs; retain the selected link and verify text hash and timestamp.
Keep conflicting versions for resolution. Cache text is evidence, not the review
summary. Unknown-speaker originals can support context, with empty author IDs;
they cannot serve as an author-owned primary source. Never manufacture a handle.

Missing historical ticker bindings need a reviewed repair using exact original
spans, hashes, and contemporaneous context. Verify the listing independently.
Do not copy the current card's basket into older events or substitute a company
mentioned by someone else without a supported relationship. A broad macro view
may remain valuable research without a product ticker; keep the content and
document the schema limitation. Valid futures/index/commodity bindings must not
fail just because their UI uses an icon instead of a corporate logo.
