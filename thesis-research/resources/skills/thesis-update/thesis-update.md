# Thesis Update

Run the incremental half of the Thesis workflow. The unit is an author-owned
investment judgment, not a post. A source can contain several judgments and one
judgment can update several records.

## Preconditions

- Work in the recipient's authorized Thesis repository. Verify the repository
  root and its own `.git` before edits, and do not relocate the task into a
  parent or unrelated checkout.
- Read the versioned `thesis-field-notes/classification-rules.txt` and
  `editorial-rules.txt`. Do not copy or replace their policy in this skill.
- Read the shared [operation contract](../references/thesis-operation-contract.md)
  before consuming or emitting a run, source, candidate, or state record.
- Require the author's automation configuration, per-channel checkpoints,
  approved and pending thesis records, relevant history, and a resumable run ID.
- If a source or record is from another author, keep it as a possible Signal or
  context item; never use it to alter the tracked author's Timeline.

## Workflow

1. Load each channel's last successful checkpoint and declared overlap window.
   Collect new, edited, and late-arriving material. Save original text,
   timestamps, links, locators, revision hashes, and reply or quoted context
   before asking a model to classify it.
   Reuse source-hash, policy-version and catalog-revision caches. Process only
   new/edited sources plus the overlap window; never reload unchanged history into
   every reasoning request.
2. Record the actual coverage and technical failures separately. A failed,
   truncated, unauthorized, or incomplete source is a gap or technical failure,
   never a Pass and never evidence that the author had no update.
3. Deduplicate source copies and the underlying statement event. Then split each
   source into the author's distinct judgments. Keep parent posts and quoted
   material available when a short reply depends on them.
   Run a compact high-recall triage first. It returns object hints, what/why,
   possible material increment and context/image needs, but no reader prose.
4. Match against approved records, pending candidates, and earlier claims in the
   same run. Resolve the author and company identity first. Same-author same-company
   mechanisms, horizons and trade episodes share one active thesis. Preserve
   account/episode distinctions inside history. Ticker similarity alone is not
   issuer identity proof.
5. Produce a structured candidate for every relevant judgment. Include source
   IDs, exact supporting text, operation, event type, matched record IDs,
   relationship explanation, proposed copy, and the baseline version.
6. Route the candidate:
   - Create only when no existing author/company record or pending alias matches.
     New drivers and trading episodes within a company append to its history;
     assets and baskets retain their own resolved object keys.
   - Existing update for new evidence, reasons, assumptions, forecasts, risks or
     conditions concerning that author/company. Preserve meaningful historical
     statements without rewriting earlier prose.
   - Use EVIDENCE, REVISE, POSITION, CLOSED, WITHDRAW, or REAFFIRM as applicable.
     Distinguish advice, planned action, and reported execution.
   - Keep position/trade history, no_judgment, duplicate, context and hold
     distinct. Buys, sells, holds, sizing, returns and price recaps alone do not
     become thesis updates. Pure repeats stay
     internal rather than exporting another card; never classify gaps as Pass.
   - Hold when attribution, context, grouping, entity binding, chronology, or
     evidence remains uncertain.
   - Apply the [increment review](../thesis-backfill/references/update-increment-review.md)
     contract before editing prose. Record `timeline_review` outcomes, preserve
     amounts/periods and action tense, and combine pages only within the same
     company and verified document revision. Source-only attachments create no
     Timeline version. Do not suppress a candidate on a thin generated summary.
7. Inspect source images only for candidates where they are required or may add
   decision-useful context. Use `required`, `helpful`, `none` or `unresolved`,
   and include only useful bound images in product media.
8. Let the model automatically resolve low-risk context and duplication when the
   evidence is unambiguous. Send authorship, reversal, exit, security mapping,
   conflicting evidence, and core-card changes to human review. Model output is
   always a candidate; it does not publish or rewrite the public baseline.
9. Validate candidate ownership, source IDs, operation and event compatibility,
   thesis/setup type, exact support text, duplicate claim keys, and baseline
   version. Save the inbox and run checkpoint even when no candidate is found.

## Required state and output

Keep collection, processing, review, publication, and notification states
separate. Return a run report with author, channels, requested and actual
coverage, new or revised source count, dispositions, candidates by operation,
holds by reason, failures and retries, and the next checkpoint.

Use the shared contract's run envelope, source dispositions, candidate fields,
state transitions, and idempotency keys so review and operations can consume
the result without interpreting free-form prose.

The internal change reason explains its relation to the baseline. The exported
update body states the author's contemporaneous expression directly, not a
comparison with later events; preserve exact source support. It may propose a local change to the current prose, but it
must preserve the record ID and historical events. A successful collection is
not a published update.

Retry only the failed portion, normally no more than two bounded attempts.
After the limit, retain the gap and continue independent channels. Never rerun a
successful archive just to clear a queue, and never infer unchanged conviction
from silence.
Record cache hits, triage/deep-review counts, context/image inspections and stage
elapsed time in the run report.

For the prototype, inspect the current `thesis-field-notes/refresh.js` and its
feed paths before using it. Treat it as an implementation aid, not as proof that
the complete multi-author service, review queue, or automation isolation exists.
Use current Alva data-skill documentation before relying on an unfamiliar source
endpoint.

## Product field handoff

Read the [ThesisCard contract](../thesis-review-publish/references/thesis-card-contract.md)
for product fields, ID ownership, timestamp policy and export input. It overrides
older title/independent-mechanism wording for this export route. Read current
[company generation policy](../thesis-backfill/references/generation-contract.md)
for grouping and immutable history.

Retain stable eventId, internalThesisKey, original source revisions, event-specific
bindings, complete description, review state and baselineVersion. Produce normalized
export-input candidates; do not allocate thesisId or copy today's card into old
events. A source edit needs a separately versioned correction, not a second insert.
Only reviewed, material statements enter the card adapter. Missing date, identity,
source or ticker remains hold. `media` contains only source images reviewed as
required/helpful; it is `[]` when images add no material context.
