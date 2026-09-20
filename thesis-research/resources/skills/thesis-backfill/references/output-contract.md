# Local Review Packet, Schema 1.0

This schema implements the shared
[Thesis core contract](../../references/thesis-core-contract.md). Policy versions
and limits come from `skills/references/thesis-policy.mjs`.

This is an auditable interchange format, not the prototype's `app_en` schema and
not a promise of a fully automated collector. Assemble it programmatically from
checkpointed source/candidate files. Do not ask a model to reproduce the entire
archive in one output. Keep full source text private; public cards use checked
short excerpts or paraphrases and original links.

For new runs, source review first produces `reviewed-thesis-facts/1.0`. That
ledger owns admission, grouping, events, evidence, tickers, directions and source
dispositions, and explicitly contains no public prose. Validate it with
`thesis-pipeline.mjs facts` before language generation. `packet.json` is assembled
from the approved facts plus generated prose, media decisions and review maps;
language generation cannot change the approved semantic fields.

`packet.json` has these required arrays: `authors`, `coverage`, `sources`,
`decisions`, `records`, `pending`. It also has `schema_version: "1.0"`,
`subject_id`, `as_of`, `requested_scope`, and `completion`.

## Manifest And Coverage

- `authors`: `{id, name, identity_status, evidence_urls}`. Status is `verified` or
  `ambiguous`. Verified identities need an inspectable identity-evidence URL.
  Include actual coauthors and outside speakers used in the packet.
- `subject_id`: the requested person's canonical ID, present in `authors`.
- `requested_scope`: `{mode, start, end, note}`. Mode is
  `all_available_public_history` or `explicit_window`; dates can be null when
  unknown. Do not silently shrink an all-history request to 90 days.
- `as_of`: collection/review cutoff, an ISO date or datetime.
- `coverage`: `{id, channel, url, declared_scope, status, proof, gaps}`. Status is
  `covered`, `partial`, `blocked`, or `not_found`. `proof` describes archive/page/
  cursor/window closure or discovery attempts; `gaps` is an array of strings.
  `covered` requires an actual declared scope and closure proof, not just a
  successful HTTP request. Add cursors, observed dates and counts as needed.
- `completion`: `{collection, classification, review}`. Collection is
  `complete_in_declared_scope` or `partial`; other fields are `complete` or
  `partial`. Never use "all public speech complete". Zero classified omissions
  measures accounting, not semantic accuracy.

## Sources And Dispositions

Recorded speech additionally uses the multimedia extension described below and
the review workflow in [multimedia.md](multimedia.md).

Each source:

```json
{
  "id": "account:post-123:revision-1",
  "channel_id": "author-x",
  "url": "https://example.invalid/original",
  "author_ids": ["author-1"],
  "canonical_event_id": "original-statement-123",
  "published_at": "2026-09-09T08:21:56Z",
  "spoken_at": null,
  "locator": "Original post; complete reply context retained",
  "source_level": "primary",
  "context_complete": true,
  "text": "Original source text, not a model summary.",
  "text_sha256": "SHA-256 of the exact UTF-8 text field"
}
```

New generation sources also declare `attachment_status`, `attachments` and, for
`unavailable`, `attachment_reason` as defined in
[selection-and-source-media.md](selection-and-source-media.md). This is the
original post's still-image inventory, not the ticker-logo/person-picture catalog.
The inventory includes quoted/replied-to context sources used by the expression,
not only the target author's top-level post. A known media key without a usable URL
is retained as a retrieval gap. It is never rewritten as an omitted attachment.

`example.invalid` is a synthetic fixture domain, not live source evidence.
Use actual URLs and dates for real work. A source is a verified speaker's turn,
post, signed document passage or original statement, not an undifferentiated
transcript with all participants listed as authors. Put host questions and guest
answers in separate source records. Jointly signed passages may have coauthors.

Alternate representations of the same statement share `canonical_event_id`.
Different claims/utterances in one interview may have different statement IDs
and timecodes. Edited text gets a new versioned source ID; do not overwrite the
old text/hash. Preserve original binary files and extraction details separately.
Dates may be null with an explicit uncertainty note; do not invent precision.

Every source has exactly one top-level `decisions` entry:
`{source_id, disposition, reason, duplicate_of?}`. Dispositions:
`used`, `context`, `no_judgment`, `duplicate`, `hold`.
Multiple claims from one source live in record events, not duplicate dispositions.
A duplicate points to a known equivalent source with the same original-event ID.
Hold unresolved contexts and failures; do not classify them as no judgment.

## Records

Each reviewed or held record:

```json
{
  "id": "stable-thesis-id",
  "author_id": "author-1",
  "type": "thesis",
  "question": "The stable investment question, not the display headline",
  "stance_sentence": "Acme is strengthening as recurring demand raises utilization.",
  "ticker_stances": [{
    "ticker": "ACME",
    "stance": "bullish",
    "evidence": [{"source_id": "source-1", "quote": "Exact source text", "explanation": "Why this supports the direction"}]
  }],
  "opening_plan": {
    "version": "source-backed-opening/1.4",
    "subject": "Acme",
    "stance": "bullish",
    "judgment_axis": "demand",
    "directional_state": "strengthening",
    "mechanism": "Recurring customer demand raises utilization.",
    "stance_clause": "Acme is strengthening",
    "mechanism_clause": "as recurring demand raises utilization",
    "stance_realizations": [{"ticker": "ACME", "stance": "bullish", "text_span": "Acme is strengthening"}],
    "mechanism_location": "same_sentence",
    "opening_family": "company_state"
  },
  "source_judgment": {
    "version": "source-investment-landing/1.0",
    "axis": "demand",
    "landing": "Recurring demand supports a stronger earnings outlook.",
    "explicitness": "explicit",
    "evidence": [{"source_id":"source-1","quote":"Exact source text","explanation":"Why this supports the landing"}]
  },
  "history_search": {
    "version": "author-object-history/1.0",
    "aliases": ["ACME", "Acme Corp"],
    "scope_source_count": 100,
    "matched_source_ids": ["source-1"],
    "public_event_ids": ["event-1"],
    "source_only_source_ids": [],
    "held_source_ids": [],
    "no_timeline_reason": "Only one source contained a qualifying company judgment and why."
  },
  "description": "The latest source-supported assessment and its reason, written as continuous prose.",
  "assessment_as_of": "2026-09-09",
  "origin": {"status": "unknown", "source_ids": []},
  "view_status": "active",
  "position_status": "not_disclosed",
  "dedup": {"decision": "new", "compared_ids": [], "reason": "Why distinct or matched"},
  "asset_bindings": [],
  "events": [],
  "signals": [],
  "review": {
    "status": "approved",
    "reviewer": "Actual reviewer identity/context",
    "method": "Source-first comparison; state any independence limitation",
    "checks": {
      "attribution": "pass", "standalone": "pass", "grouping": "pass",
      "asset_binding": "pass", "fidelity": "pass", "chronology": "pass",
      "editorial": "pass"
    },
    "reason": "Evidence-based approval or specific unresolved issue"
  }
}
```

`description` is the complete reader-facing content. Short entries use one
paragraph; longer entries use a summary-first paragraph followed by supporting
paragraphs separated by blank lines (`\n\n`). There is no separate visible title,
Summary label or bold lead; all paragraphs share typography. Do not impose a
fixed word cap or pad short content to create multiple paragraphs.
For approved public thesis records, `ticker_stances` exactly matches the displayed
ticker set. Every ticker has one `bullish`, `bearish` or `none` value with exact
source evidence and an explanation. `stance_sentence` is the internal stance-first
memo line. Product export prepends it to `description` to form one visible body,
and the combined passage must fit 500 characters. Neutral means the source supports a balanced view;
an unresolved direction is held rather than assigned a synthetic value.

The presentation manifest exposes only `{ticker, stance}`. This research contract
does not own Feed layout, navigation, typography, image sizing or lightbox behavior.
For Thesis Feed handoff, map each unique ticker to one product ticker entry and use
the product direction `bullish`, `bearish` or `none`; see the
[ThesisCard contract](../../thesis-review-publish/references/thesis-card-contract.md).
The current Feed rendering agreement shows a rising trend icon for `bullish`, a
falling trend icon for `bearish`, and no direction icon for `none`. It does not
render enum words merely because they exist in ticker metadata. The visible body
may retain Bullish/Bearish/Neutral when the source explicitly uses the same word,
the mechanism is present and review records `source_explicit_direction: true`.

The `title` field is forbidden on thesis and event records, including empty,
null, optional and internal compatibility values. Older packets with titles
must be explicitly migrated before current validation; archive the original
packet and remove generated titles without changing descriptions or evidence.
For longer prose, the first paragraph must summarize the judgment and important
condition or captured trade state, not merely introduce the topic. Short entries
remain one paragraph. No fixed word threshold or paragraph-count quota applies.
Apply the professional-English and process-narration rules in `quality-rules.md`.

Types: `thesis`, `setup`, `context`. Review: `approved`, `hold`, `revise`.
`setup` remains readable for legacy/private history, but new public packets using
`source_grounded_company_analysis/1.0` cannot approve or export technical-only content.
Main records belong to `subject_id`. Preserve joint signatories in source
attribution and outward bylines; other speakers belong in Signals/context sources.
Legacy standalone setups have a stable `episode_id`. Under generation policy 3.2,
new company records use `type: thesis`, including technical views, and trade events
carry their own `episode_id` and `account_id`. Never fabricate a business rationale
for a technical view or collapse distinct episodes into one continuous position.
View: `active`, `withdrawn`, `uncertain`. Position: `not_disclosed`,
`open_reported`, `closed_reported`, `planned`. Do not infer view from position.
An initial record can capture an already closed trade; make that explicit in its
first event and description. Horizon, stop, target and numerical invalidation
are optional. Keep price reference dates and units when provided.

`dedup.decision`: `new`, `matched`, `merged`, or `unresolved`.
`compared_ids` can reference current packet records or supplied baseline/catalog
IDs. Include the closest company matches and the resolved identity. Exact duplicate
questions and multiple active company records for the same author are structural
errors under generation policy 3.2. Different business mechanisms do not justify
different company records. Aliases and issuer resolution still need source review.
When merging old records, retain their IDs and events with `superseded_by`
pointing to the active record. Resolve that relationship when displaying combined
history; do not duplicate original event IDs in another record. A merge must stay
within the same author and cannot create a redirect cycle.

Bindings: `{entity_name, symbol, market, instrument_type, role, basis,
source_ids, verification_url, display_note?}`. Roles: `primary`, `vehicle`,
`related`; bases: `author_named`, `entity_resolution`, `alva_proxy`.
Every approved current-generation record, including `context`, needs a resolved primary/vehicle
binding. A source without one stays out of `records` and is retained only as a
`no_judgment` decision with its omission reason. A proxy
requires a visible note saying it was selected by Alva and is not author-named.
Use context/hold when the identity is unresolved. Do not fake a ticker to pass.

Events: `{id, type, canonical_event_id, at, date_basis, source_ids,
description, support, asset_bindings, ticker_stances, action, visual_dependency, visual_dependency_reason,
media_bindings, revision_of_event_id?}`.
- No `title` field is accepted, even as internal metadata.
- `description`: full continuous prose about the view at the event's date.
  Expanded presentation does not repeat `title` as a heading. Keep source material
  accessible and hide origin-unknown labels without deleting origin metadata.
- Every visible event has at least one event-specific ticker and one source-backed
  `bullish`, `bearish` or `none` direction per ticker. Do not inherit either
  list from the current record.
- `date_basis`: `spoken`, `published`, or `unknown`; `at` matches the selected
  original source date, including its precision. Unknown dates are null.
- `support`: `[{source_id, quote, purpose}]`, with exact contiguous source text.
  Purpose is `judgment`, `reason`, `action`, `origin`, or `context`. It can be
  in the original language; keep displayed English translations separately.
- `action`: `{kind, basis}`. Kind: `none`, `open`, `increase`, `reduce`, `close`.
  Basis: `none`, `advice`, `planned`, `reported_execution`.
- Event types follow `quality-rules.md`. `CLOSED` needs a reported close, not
  advice. Same-statement reprints share an event's multiple source IDs. An edited
  source may append a `REVISE` event linked through `revision_of_event_id`;
  explain the correction and retain the prior event/source revision.
- `visual_dependency` is `required`, `helpful`, `none` or `unresolved` with a
  concrete `visual_dependency_reason`. Approved events cannot remain unresolved.
- `media_bindings` covers every attachment on the event's expression and reviewed
  context sources.
  Each entry is `{source_id, attachment_id, disposition, reason?, context_image_role?}` with
  `disposition: include|omit` (`unrelated` is legacy-compatible). `omit` needs a
  reason. Required/helpful events include at least one useful image; none includes
  none. Unavailable attachments block required visual claims. A helpful context
  image may leave a text-complete event approved only when the prose is independently
  supported, but it must remain in a `helpful_retrieval_pending` gap and the run
  cannot claim attachment completeness. Other unknown images use
  `unresolved_retrieval_pending`. Neither status is an omit decision. Product media
  is derived from included bindings; it is not handwritten separately.
  Use `context_image_role: explanatory_context` for a relevant quoted/reply image
  that helps explain context without being adopted as the author's evidence.
- New public expressions with attachments require `media_review` version
  `expression-media/1.0`, bound to the exact `source_id|attachment_id` set with
  reviewer/date, counts, decision and reason. Available bindings carry an
  image-specific `content_summary`; omissions also carry a controlled
  `omit_category`. Two or more distinct public attachments with zero includes
  require a packet-level `all-zero-public-media-audit/1.0` receipt.

An included binding from `context_source_ids` must carry a specific reason.
When the author explicitly adopts that context, retain a `support` span with
`purpose: context`. Without explicit adoption, the binding may still be included
as helpful media with `context_image_role: explanatory_context`, provided the
author's own source independently supports what, why, ticker and direction. This
image explains context; it is not evidence of the tracked author's view and cannot
be marked `required`. A context image is omitted when the current author
image already explains the point, the image only documents an old trade, or it is
merely topically related.

Use optional `context_source_ids` for reply parents or other contextual statements.
They need not share the main event's identity, and do not substitute for direct
evidence from the actual author. Support spans can reference either set; the
primary event's `source_ids` identify representations of the same statement.

For an explicitly authorized source-faithful historical copy correction, retain an `editorial_revisions`
entry with `event_id`, `previous_title`, `previous_description`, `reason` and
`reviewed_at`. The baseline validator allows such reviewed language changes but
rejects changes to historical source IDs, support, action, date or event identity.
Generation policy 3.2 additionally requires `--allow-editorial-corrections` for
that operation. Ordinary continuation rejects historical copy changes even if a
revision note is supplied. Do not turn on the flag without user authorization.

Signals: `{id, author_id, source_ids, description, relation, support}`. They must
come from someone other than the parent author; same-author posts go to Timeline.
`relation` explains the specific support, challenge or relevant issue, not just a
shared ticker. Do not invent a signal to fill an empty panel.

`pending`: `[{id, source_ids, reason, proposed_operation?}]`. Keep unresolved
identity, source, grouping, mapping and reviewer disagreements inspectable.
No approved record may rely on incomplete context or secondary-only attribution.
Unresolved bindings may keep null symbol/market/verification fields only on held
records; keep the named entity and its source rather than inventing an identifier.
When declaring review complete after excluding/contextualizing sources, include
`omission_review: {source_ids, reviewer, method, reason}` describing the actual
sample of those decisions and its source-first review. This is not a recall score.

## History Coverage For New Runs

New generation runs include `history_coverage`, a local content-review trace;
this does not change the shared backend operation contract. Existing schema-1.0
packets remain readable without it; use `--require-history-coverage` for new runs.
Record each recognized meaningful assessment, position action or outcome after
the whole-window matching pass:

```json
{
  "id": "source-123:entry-threshold",
  "source_ids": ["source-123"],
  "kind": "assessment",
  "disposition": "event",
  "event_ids": ["thesis-a:event-123"],
  "reason": "First stated entry threshold for the existing company question."
}
```

`kind`: `assessment`, `position`, `outcome`. `disposition`:
- `event`: known event IDs whose source references include these source IDs.
- `coalesced`: known event IDs plus a reason the later statement adds no material
  change. Targets must not postdate the source statement. Preserve the later
  source even if it is not a separate visible row; an earlier first threshold
  cannot be hidden behind its later repetition.
- `pending`: known `pending_ids` retaining these sources and the unresolved
  history, including reported trades without a known original rationale.

Use separate items for different claims in one post. A `context` source
disposition or membership in a group does not replace the event/pending link.
No item is required for pure chat or a source with no recognized historical
claim. Reviewers must still check original sources for unrecognized omissions;
the trace and validator do not establish semantic recall or fidelity.

## Validation Boundary

The bundled script checks IDs, ownership references, dates, exact support text,
hashes, source accounting, explicit ticker/proxy metadata, lifecycle constraints,
review decisions and preservation against a baseline. It cannot verify that a
URL is authentic, a quoted statement means what the summary claims, a security
mapping is economically appropriate, or every duplicate was found. Those are
required source-first review tasks. Passing the script is not auto-publication.

## Generation Policy 3.2 Extension

New runs keep `schema_version: "1.0"` for interchange compatibility and declare:

```json
"generation_policy": {
  "version": "3.2",
  "grouping": "author_company",
  "history": "append_only",
  "public_scope": "source_grounded_company_analysis/1.0",
  "timeline_preview_words": 40,
  "prose_max_chars": 500,
  "opening_contract": "source-backed-opening/1.4",
  "ticker_stance_contract": "per-expression-ticker-stance/1.0",
  "source_fidelity_contract": "source-fidelity/1.0",
  "review_contract": "source-first/1.1"
}
```

Active approved records add:

- `object_type`: `company`, `theme`, `asset`, `basket` or `macro`.
- `ticker_stances` and `stance_sentence` as defined above. Every ticker direction
  must be supported by exact evidence from the expression's source set.
- `opening_plan` under `source-backed-opening/1.4`. It records the subject,
  judgment axis, directional state, mechanism, exact `stance_clause`, exact
  `mechanism_clause`, per-ticker `stance_realizations`, mechanism location and
  opening family and optional boolean `source_explicit_direction`. Public prose
  uses Bullish/Bearish/Neutral only with exact same-expression support; metadata
  alone never supplies the word.
  The plan is supported by the selected primary expression. Final review also
  records `relationship_complete` and `continuation_advances` after reading the
  rendered stance and body as one passage.
- `card_claims` also carry a `semantic_claim` tuple under
  `source-fidelity/1.0`, preserving source subject, owner, predicate, polarity,
  certainty, degree, condition and time scope. Unsupported author narration,
  possessives and upgraded quantifiers are hard failures.
- `object_key`: stable resolved identity, such as `company:sivers-semiconductors`.
  This is an internal key, not an invented registry ID. Resolve issuer/listing
  aliases before assigning it. Company primary bindings also carry the same
  `entity_key`; different accounts or horizons do not change the company key.
  Set binding `listing_region` to `US` or `non-US` when applicable so image routing
  can be checked against the correct endpoint.
- `primary_event_id` and `primary_source_id`: the event/source supporting the
  central judgment and decisive reason, not latest activity. A position-only update
  cannot anchor a reasoned company card. Its date must match the selected source's
  published/spoken date according to `date_basis`.
- `primary_source_review`: `{eligible_event_ids, candidates, reason}`. IDs refer to
  combined company history, including retained merge members. Each candidate has
  `{event_id, source_id, kind, covered_claim_ids, reason}`. Kinds are `analysis`,
  `brief_thesis`, `position_update` or `reaction`, based on actual source content,
  not the historical event-type label. Only analysis/brief_thesis candidates with
  evidence for every core claim are eligible. Keep ineligible updates in history.
- Visible Timeline review rows add `timeline_opening_contract`, set to
  `source-backed-timeline-opening/1.3`, plus exact `stance_clause`, exact
  `mechanism_clause`, per-ticker `stance_realizations`,
  `metadata_hidden_direction_clear`, `direction_visible_immediately`,
  `mechanism_visible_immediately`, `relationship_complete` and
  `continuation_advances`. These fields apply to the dated event prose, not to
  the current-card stance enum.
- `card_claims`: exact spans of finished reader prose with source support. Every
  sentence/clause must be covered; changing prose requires rebuilding the map.
  Items have `{id, text, roles, evidence}`. Roles are `core_judgment`, `core_reason`,
  `supporting_fact` and `position`; a sentence can have multiple roles. At least one
  core judgment and core reason must be supported. Price thresholds and technical
  conditions remain private; do not invent business logic to publish them.
  Evidence is `[{source_id, quote, supports_roles}]` with exact original spans and
  the specific claim roles they support. Sources must remain linked to company
  history or dated context. Covering the judgment with one source and its reason
  with another does not make either source a sufficient standalone anchor. Split
  independently meaningful claims rather than labeling a whole paragraph supported
  by one sentence from a source.
- `review.checks` additionally requires `reader_clarity`, `source_coverage` and
  `primary_anchor` to pass. Use the review prompt; quote existence alone does not
  establish that the quote actually supports the claim.

A sentence about Microsoft accepting a data-center phase needs the acceptance
source. A holding-through-2027 sentence needs the holding source. Neither
automatically supports a reason about power scarcity. The presentation manifest
preserves `claim_sources` with source URLs and historical `detail_ids`, and keeps
`last_update_at` separate from primary `at`. The existing single-date UI uses the
primary date, not the newest activity date.

The presentation manifest's `timeline` excludes the main card's primary source
after company grouping. The corresponding event, `details` entry and claim-source
links remain intact. This is a display filter, not deletion or a new classification.
Compute `last_update_at` from the complete history, including hidden entries.
Rebuild the visible Timeline after selecting a different primary Source. An empty
array is valid when the main card is the only source; render `No other updates yet.`

Approved generation-3.2 records also require `timeline_review`, with one outcome
for every event in the canonical company history (including legacy member events):

```json
{"event_id":"event-id","disposition":"update","what":"The dated judgment.","why":"The dated source-backed reason.","content_domain":"fundamental|mixed","fundamental_increment":"Required for mixed content","increment_kind":"reason|evidence|condition|correction","increment_domain":"fundamental|mixed","increment":"The material thesis increment.","reason":"What the original supports."}
```

An action classified as repetition also requires `same_action_event_id` pointing
to the earlier event for the same execution. Matching buy/sell direction, account
or date alone does not prove that two statements report the same trade.

Use `source_only` plus `basis: repeat` and `covered_by_event_ids` for confirmed
repetition. Covering events must be strictly earlier within the same company.
Use `basis: commentary` for jokes or non-investment interaction, not for a real
action. Use `basis: position_history` for buys, sells, holding plans, sizing and
results that add no thesis reason/evidence/condition. Use
`basis: technical_out_of_scope` for technical analysis excluded from the current
public product. Use `hold` plus
`missing_context` for unresolved meaning or instruments.
The original event remains in the research packet. The presentation builder puts
source-only/held metadata in `excluded_events` without generating public details
or Timeline rows. They cannot anchor a current card. If earlier evidence is
unavailable, retain the previously published update for review instead of
inventing a duplicate link. Current validation of an older approved 3.1 packet
requires adding reviewed outcomes; absence is not an implicit approval.

Optional `disclosure_groups` have `{id, anchor_event_id, event_ids, reason}`.
Each member's sources must supply verified `document_id` and `document_revision`.
All members must share that identity, revision, base document URL, expression date
and date basis. Groups cannot overlap or mix held/source-only material. They are
combined only inside one canonical company history, retaining every unique
paragraph and source/page URL. A document revision stays a separate group.

New events add `asset_bindings: []` using the binding format above. These are the
entities relevant at that date, not a copy of today's ticker list. Any action
other than `none` also carries `episode_id` and `account_id`; use the explicit
value `not_disclosed` when scope cannot be established, never infer it. An episode
with a reported close cannot silently reopen: use another episode for a new trade.
For legacy baseline events lacking these fields, retain them unchanged and record
the migration gap; do not add fields silently to frozen events.

The mutable top-level `images` array is separate from historical bindings:

```json
{
  "kind": "security",
  "key": "NASDAQ:ACME",
  "endpoint": "/api/v1/stocks/company/detail",
  "status": "matched",
  "url": "https://example.invalid/acme.png",
  "requested_symbol": "ACME",
  "resolved_symbol": "ACME",
  "identity_basis": "exact_symbol"
}
```

Use real response URLs. Security keys are `market:symbol`; person keys are author
IDs. Person entries use `/api/v1/persons`, plus `person_id`, `requested_handle`,
`resolved_handle` and `identity_basis: social_handle`. Without a social account,
use `identity_basis: verified_identity`, `verified_author_id` equal to the author
ID and an `identity_evidence_url`; name similarity alone is insufficient.

Statuses: `matched`, `image_not_provided`, `not_found`, `identity_mismatch`,
`request_failed`, `not_applicable`. Only `matched` has a primary `url`; every other
status has `url: null` and a specific `reason`. Optional `fallback_url` is a
previously verified picture, not a guessed URL. `not_applicable` covers crypto or
non-company instrument icons. A security using `same_issuer` must be company
equity/ADR, carry `verified_entity_key` matching its binding and an
`identity_evidence_url`; ETF/ETN provider logos are not interchangeable with fund
identity. Resolve non-US listings via the non-US endpoint, not suffix removal.

Include image lookup outcomes for displayed author/Signal identities and all
displayed primary/vehicle bindings, including historical ones. Missing pictures
are reported gaps, not a reason to drop a valid thesis. Refresh pictures without
rewriting historical text or bindings. The presentation builder resolves images
from this catalog, drops internal titles/types from visible copy, coalesces
same-statement merge members and derives 40-word previews and historical routes.

Validate new runs with both `--require-generation-contract` and
`--require-history-coverage`. New generation and presentation building require
version 3.2. Older packets remain readable under their earlier structural
contracts without the new-generation flag; they do not claim current compliance.
A 3.2 baseline cannot be downgraded by removing or changing the policy version.

## Product ThesisCard adapter

For segmented documents, use the optional document archive and exact source-span
references defined in [source stability](source-stability.md). A source text hash
never silently changes scope to a complete-document or binary-PDF hash. The
validator checks document spans and retains baseline revisions.

This packet remains the internal evidence format. Export reviewed content through
[ThesisCard contract](../../thesis-review-publish/references/thesis-card-contract.md);
do not rename its internal fields in place. description maps to body; dated event
prose, evidence and bindings supply update cards. The current company summary is a
separate snapshot mode, not a replacement for historical events. Source.text stays
in the private packet, never a public sources field. Append short named Markdown
original links to product body using the seven-field product contract 1.1.
Pass, context, holds and technical gaps are retained internally, never exported
just to fill required ticker/source fields. Generation 3.2 primary-anchor rules
remain applicable to current snapshots; full eligible history remains available
to export even when the UI hides its current-source Timeline duplicate.

## Multimedia Extension 1.0

Source `media` is optional for written sources and required for imported recorded
speech. It contains `kind`, `recording_id`, `canonical_recording_id`, `segment_id`,
`transcript_revision`, `transcript_origin`, `transcript_url`, `start_seconds`,
`end_seconds`, `duration_seconds`, `published_representation_at`, `speaker`,
`review` and optional verified `lineage`. Unknown offsets are null, never zero.
Every source in one original appearance uses `canonical_event_id` equal to
`recording:<canonical_recording_id>`; segment/source IDs remain distinct. This
allows a company event to cite several answers without making each turn a thesis.

`speaker` records its original label, mapped `author_id`, provider `person_id`,
status (`unresolved`, `candidate`, `verified`), confidence, attribution source,
presence and evidence URLs. Unmapped speakers have distinct ambiguous author
entries; do not fill their author ID with the target person's ID.

`review` starts pending. Verification requires a reviewer, method, matching
`text_sha256` and speech role. Primary evidence needs `author_statement`, a
verified speaker, and completed context review. ASR primary evidence additionally
needs critical-term verification against audio or the archived, verified full
transcript fallback defined in [multimedia.md](multimedia.md). Transcript-only
checks never set `audio_checked`. Video/interview primary evidence must
resolve `visual_dependency` as `none` or `verified`, not `unresolved`.

Media packets include `media_inventory`, one item per recording with a unique
`id` and complete `segments` source-ID list. The normalizer provides an inventory
and a review queue, not final classification. Merge those sources and identities
into the ordinary packet, supply source dispositions/pending items, and extract
reviewed records using the normal generation contract. The validator checks
inventory references, speaker ownership of each quote and review prerequisites.
An approved event cannot cite unreviewed media as primary or context evidence.

Example provider-neutral input for `normalize-media.mjs`:

```json
{
  "subject_id": "investor",
  "authors": [{"id":"investor","name":"Example Investor","identity_status":"verified","evidence_urls":["https://example.invalid/profile"]}],
  "recording": {"id":"publisher:episode-guid","kind":"interview","display_name":"Example interview","url":"https://example.invalid/episode","published_at":"2026-09-01T12:00:00Z","spoken_at":null},
  "transcript": {"format":"segments","origin":"asr","segments":[{"id":"answer-1","speaker":"speaker-B","start_seconds":42,"end_seconds":56,"text":"Exact original-language transcript turn."}]},
  "speaker_bindings": {}
}
```

For Arrays input, supply an episode configuration containing the same authors,
subject and recording metadata, plus `recording.episode_id` matched to the RSS
GUID and `person_aliases` mapping verified provider IDs to internal authors.
For a diarized transcription result, set `transcript_format: diarized_json` in
the config; the importer maps segment `speaker`, `start`, `end` and `text`.
Neither route marks media evidence reviewed automatically.

Preserve raw collection/transcription files alongside the bundle. A source's
media provenance is frozen with its baseline: changes to speaker, offsets,
lineage, original dates or transcript require a new retained source revision.
Product fields remain unchanged; supported seek URLs replace the plain source
link and media provenance travels in `sourceRevisions[].media` in the manifest.

## Current-run review extension

New packets also follow [run-review.md](run-review.md): declare the review contract, retain version-bound claim/event review, catalog matching and Signals search decisions, then pass the whole-batch gate before delivery.
