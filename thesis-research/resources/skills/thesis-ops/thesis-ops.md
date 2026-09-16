# Thesis Operations

Operate the control plane for many author automations. Start with deterministic
run and coverage checks; use content review only for targeted anomalies. This
skill reports and proposes actions, but does not silently change schedules,
rules, public records, or notifications.

## Inputs

- Author and channel automation registry.
- Run ledger, checkpoints, source dispositions, candidate inbox, review ledger,
  publication history, and notification delivery records.
- Current classification and editorial rule versions.
- Optional sampled source text for content-quality investigation.
- The shared [operation contract](../references/thesis-operation-contract.md).

## Health checks

For each author and channel, check:

- The automation is enabled as intended and ran within its expected cadence.
- The last successful checkpoint advanced only after durable source storage.
- Requested versus actual coverage, pagination, attachments, transcripts, and
  source permissions are visible.
- Every collected source has a disposition and every non-ignored candidate has
  a processing and review state.
- Review and publication queues show count, oldest item, conflicts, and retry
  age. A growing queue is an operational issue, not evidence of more theses.
- Duplicate keys, cross-author links, thesis/setup mismatches, invalid support,
  and version conflicts are rejected and explainable.
- Publication verification and notification delivery are tracked separately.

Classify the result as healthy with no new content, healthy with pending work,
partial coverage, processing failure, review backlog, publication failure,
content-quality anomaly, or blocked source. Never report “no update” when the
source or processing state is unknown.

## Total-agent review

The total agent reads the health summary and only the source samples needed to
explain an anomaly. Investigate sudden increases in Pass, new-record creation,
holds, cross-author matches, repeated failures, or unusually long runtimes.
Sample Pass, duplicate, hold, and approved decisions across authors and
channels; do not measure semantic accuracy from task success or candidate count.

Return a prioritized operations report:

1. What is broken or suspicious, with author, channel, run, and source IDs.
2. Whether the issue is collection, processing, grouping, editorial, review,
   publication, or notification.
3. The smallest safe next action and its stopping condition.
4. What remains unknown and the evidence needed to resolve it.

## Recovery rules

- Retry only a named failed batch or channel, within its retry budget. Preserve
  successful checkpoints and never rerun the whole archive by default.
- Request context backfill for a named source or candidate when that is the
  missing evidence. Do not turn it into a Pass to reduce backlog.
- Send attribution, reversal, security mapping, and core thesis changes to
  human review.
- Pause or reduce an automation only when the user or an approved operating
  policy authorizes that action. A monitor may recommend it and show impact.
- A rule change requires a fixed-sample replay and review before adoption by all
  authors.

## Output and limits

Return the run-window, authors and channels checked, coverage gaps, queue
counts, failures and retries, anomaly samples, proposed actions, and next
check time. Distinguish “not run,” “ran with no new source,” “ran partially,”
and “ran and produced candidates.”

Reconcile source dispositions, candidate IDs, review decisions, publication
versions, and notifications using the shared contract. Flag missing transitions
or duplicate keys before diagnosing content quality.

Do not create a new thesis, rewrite a public card, publish, send a notification,
change an automation schedule, or change classification policy from an
operations report alone. Those are separate authorized operations handled by
the update or review-publish workflow.

## Product field handoff

Read the [ThesisCard contract](../thesis-review-publish/references/thesis-card-contract.md)
for product fields, ID ownership, timestamp policy and export input. It overrides
older title/independent-mechanism wording for this export route. Read current
[company generation policy](../thesis-backfill/references/generation-contract.md)
for grouping and immutable history.

Reconcile reviewed items → exported cards → backend receipts → published versions
→ notification receipts separately. Check author-scoped thesisId mapping, unique
event keys, content conflicts, card-index alignment, hold counts and assignment
revision. No backend receipt means not_sent/unknown, never successful ingestion.
A missing logo is a fallback warning; missing original text, approved identity,
exact timestamp or resolved investment symbol blocks that card. Monitor sources
with restricted full-text export instead of publishing invented summaries.
