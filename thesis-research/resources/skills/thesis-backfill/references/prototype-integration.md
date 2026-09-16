# Integrating With The Existing Prototype

Work in the verified independent Thesis repository. The prototype folder is
`<repo>/thesis-field-notes`; it is not the entire Thesis product.

Read the current classification and editorial rule files, `README.md`,
`reviewed.json`, `reviewed-en.json`, and existing pending records before designing
a write. Record the relevant rule versions. Use the existing canonical author and
thesis IDs where they exist. The skill's review packet is an interchange/audit
contract; it is **not** a drop-in replacement for the prototype's schema-3 UI data.

## Reuse With Care

- Source packets, source hashes and dated reviewed events are evidence inputs.
- `collect.js` has a known-author allowlist; inspect it rather than assuming it
  accepts any new handle. Use discovered adapters or an isolated collection for
  a new author. Do not modify the shared roster as a side effect of a backfill.
- `build-reviewed.mjs`, `expanded-authors.mjs`, `broader-coverage.mjs`,
  `build-english.mjs` and copy modules contain curated seed data. Blindly rerunning
  them is not universal extraction and may overwrite subsequent approved work.
- `rescreen.js` / `rescreen-summary.json` are bounded historical discovery with
  explicit gaps, not a complete independent reviewer or a publishable thesis set.
- `refresh.js` is a scheduled private-candidate collector; its live checkpoint and
  pending queue are state, not disposable build artifacts.
- `publish-reviewed.js`, `alva release` and cloud `fs write` calls are external
  mutations. Creating this skill or a local backfill does not authorize them.

## Local Merge

1. Preserve a baseline of the records being changed and read the latest pending
   matches. Authorize only the intended author/record scope in the merge plan.
2. Make an explicit mapping from review packet IDs to the target schema's author,
   thesis, source and event IDs. Prefer existing IDs and keep unrelated records.
   Existing `company_groups` membership is migration input, not the final storage
   model. Materialize one active record per author/company and retain old IDs in
   `record_aliases`. Never leave retired records in `theses` for another reader to
   mistake for active cards. Update the root's current body;
   preserve member histories, aliases and bookmarks. Do not create duplicate
   company cards for another business line or trading episode.
3. Map `description` to the prototype's reviewed `body`/`summary` as required;
   preserve blank-line paragraph breaks and render continuous prose with equal
   typography. Do not prefix the old title or create a bold opening paragraph.
   Do not carry or generate a `title` field on active records or updates.
   Replace legacy dependencies with IDs, company/author labels or description.
   A title-field migration archives the previous edition and preserves all other
   source and historical fields; it does not rewrite historical descriptions.
   Retain original source quotes and structured history. Main-feed investment
   records and `display_role: context` are separate display choices.
   Timeline uses a body preview of at most 40 English words, date, historical ticker
   logos and source. Longer previews show Show more and open a dedicated historical
   detail. No event titles, type prefixes or original-excerpt blocks are rendered.
   Never borrow the current card assessment or tags for an earlier event.
   Exclude the selected main-card source from visible Timeline rows after grouping,
   using canonical source identity. Retain the full events, aliases and historical
   details. A later change of primary source recalculates this display filter.
   Match the current prototype's versioned prose baseline before applying edits;
   preserve a prior copy and reason for historical language changes. Review all
   card, Timeline and Signals copy in scope, including visible supporting notes.
4. Resolve logos and portraits through the APIs and identity rules in
   [generation-contract.md](generation-contract.md). Preserve the mutable
   `profile_images` catalog separately from immutable event bindings. Use one image
   resolver for ticker tags, author profiles, search and Signals. Missing images
   use verified fallbacks; do not substitute another company or person.
5. Reconcile new/append/merge/hold counts and compare historical source identities,
   timestamps and attribution against the baseline. Do not advance `seen` or
   overwrite pending state to make a backfill appear processed.
6. Run the relevant existing validators and render the changed cards locally if
   UI-facing artifacts were requested. Report local review separately from release.

For a new backfill, also validate the canonical packet with
`--require-history-coverage --require-generation-contract --require-prose-limit --require-run-review` before adapting it.
Run `build-presentation.mjs` for a deterministic preview/detail manifest. It is
not a schema-3 payload or a replacement for rendering the actual prototype.
Carry the recognized assessment,
position and outcome trace through to final prototype event IDs or retained
pending history. A source linked only to a thesis ID is not a completed update.
Recheck one initial observation per question after supplements; source-count or
quote-only scripts cannot replace that final history check. Do not silently
change immutable baseline events to make a migrated history pass.

Use `history-guard.js` and the guarded standard publisher for ordinary updates.
The card's single date, Source URL and ordering come from an anchor that supports
its core judgment and reason. Do not simply pool each member's old primary pointer
and select the newest: some point to position-only activity that should remain
private unless it also adds a material thesis increment. Review coverage against
the combined card, map `primary_event_id`/`primary_source_id` to the prototype's
source fields, and preserve all other claim-to-source/detail links. A newer holding
confirmation changes latest activity, not the reasoned card's source date.
Coalescing same-source fragments for display preserves their original event IDs
and paragraphs. Broader basket/macro views remain separate from company groups.
Do not duplicate the entire source archive in a public projection; inspect payload
size against the platform's current limit before publication.

For an explicitly authorized publication, first verify current cloud IDs, latest
reviewed revision, shared state and requested destinations. Do not assume copying
the repository moved the cloud deployment or scheduled job. Use the available
Alva design/review workflow for the actual prototype publication, then verify the
live page. Do not notify or change cadence as an implied part of publication.
