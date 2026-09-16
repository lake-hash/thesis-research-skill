# Agent Review And Authorized Publication

## Default Policy

The agent owns source and content review. Do not ask the user to inspect or approve
individual candidates. When the user requests publication of the batch, complete
the checks and publish eligible changes without a second approval request.
Loading a skill alone is not authorization to publish or create a schedule.

Review each candidate against eight checks: attribution, source fidelity, full
context, chronology, author/company grouping, ticker binding, meaningful increment
and plain English. Every check must pass; a score cannot compensate for a failed
source check. Record the actual reviewer, method, evidence note and content hash
with `review-agent STORE.json REVIEW.json`. Its input includes `id`,
`content_hash`, `expected_revision`, `reviewer`, `method`, `evidence_note` and
`checks` with each named check set to `pass` only after inspection.

The default path is queued -> processing -> ready_for_agent_review ->
ready_to_publish -> published. Candidate generation/validation alone is not agent
acceptance. Changed content invalidates acceptance. Before publication recheck
the current baseline and fingerprint, archive prior versions, apply only the
authorized batch, read back and render the live result. `mark-published` requires
the matching hash, release version, live URL and `authorization` containing the
user request `reference` and batch `scope`. It records verified publication; it
does not execute it.

For unavailable audio, search the publisher and credible corresponding full
transcripts. Verify episode/date, parse completeness, speaker, surrounding Q&A,
critical terms and visual dependencies. A search snippet, episode summary,
anonymous ASR mirror or AI confidence badge is insufficient. Do not claim to have
listened. After bounded fallback attempts fail, intake with `fallback.exhausted`
and a concrete `reason`; record `transcript_search` and `transcript_review`
attempts. The interview becomes `skipped`, not a user task or a public pending row.
Retain original material and reason privately. Do not discard unrelated valid
sources. A later run may reopen a skipped item only when new evidence is available.

Finish with published counts, skipped counts and concrete reasons, not a link to
a manual workbench. A local store is not an unattended worker.

## Optional Legacy Manual Mode

The following path is retained only for an explicit request for human review,
not the default backfill/update workflow. Existing user decisions remain in the
audit history; never relabel a model decision as a user decision. In this mode,
`ready_for_agent_review` is the source-checked decision boundary exposed to the
optional manual interface.

Source verification, editorial approval, the user's decision and publication are
separate stages. Do not label all of them Pending review. A fetched transcript is
not a request for the user to approve its factual accuracy.

| State | Owner | Exit condition |
| --- | --- | --- |
| queued | Agent | Begin a named review attempt |
| processing | Agent | Actual running attempt with an unexpired lease |
| needs_evidence | Agent | Resolve a specific blocker, with attempts recorded |
| ready_for_agent_review | Agent (user only in manual mode) | Complete candidate; source and content review passed |
| approved | Publisher | Current-version user approval; publication is separate |
| changes_requested | Agent | Revise, re-review and issue a new candidate version |
| rejected | User decision recorded | Preserve the decision; do not publish |
| published | Receipt recorded | Verified release matches the approved content |

During each invoked backfill/update run, continue beyond normalization: inspect
sources, attempt available verification, classify statements, generate prose and
perform source-first content review. Do not stop merely because a queue file
exists. If evidence or a required tool is unavailable after actual checks, record
the blocker, attempts, needed evidence and next action. Do not imply a background
worker exists when none is configured. Do not hand raw turns to the user instead
of completing agent-owned work.

## Local Queue

`scripts/review-workflow.mjs` stores items, versions and decision history on disk.
The private local UI writes the same store, not localStorage. This is not a cloud
approval service or recurring worker. The public Playbook has no Audit tab.

```bash
node <review-skill>/scripts/review-workflow.mjs init STORE.json
node <review-skill>/scripts/review-workflow.mjs intake-media STORE.json media-sources.json review-config.json
node <review-skill>/scripts/review-workflow.mjs start-source STORE.json recording:ID AGENT-ATTEMPT-ID
node <review-skill>/scripts/review-workflow.mjs ingest-packet STORE.json reviewed-packet.json previous-packet.json
node <review-skill>/scripts/review-workflow.mjs receipts STORE.json
```

Omit the previous packet only for a genuinely new baseline. Packet intake invokes
generation/media validation and includes the body, tickers, event changes,
original sources and previous body. Identical intake is idempotent. Changed
content or source/review evidence invalidates approval and retains the old version.

Media config contains `recording`, actual `attempts`, and `capability_check`.
Declare an executor unavailable only after checking the run's tools/configuration.
Intake is a diagnostic state update, not audio verification. Finish each started
attempt by rerunning intake with verified sources or concrete blockers; do not
leave a failed attempt showing as processing.

## User Decisions

Only source-checked candidate versions get Approve, Request changes and Do not
adopt actions. Show author, tickers, new/update operation, complete copy, Timeline
changes, sources/timecodes and the previous version. Require reasons for changes
or rejection. Source jobs and blocked candidates have no approval action; a user
click cannot set audio_checked or resolve an unknown speaker.

Approvals bind version and content fingerprint, including sources. Stale requests
fail. The local API is loopback-only, same-origin and CSRF protected; decisions
are saved atomically and survive reload. Local approval records are not proof of
a remote authenticated backend user.

For an explicit chat approval, the agent may use `decide STORE.json DECISION.json`
with the same id, content_hash, expected_revision, decision and note fields as
the UI. Do not invoke it based on a model's own source/content approval.

Before publishing, obtain explicit batch authorization, verify current approval
fingerprints and baselines, publish through the existing workflow, then verify the
live result. Only after that use `mark-published STORE.json RECEIPT.json` with
`id`, `content_hash`, `url`, `release_version`. Approval never sets published_at.

End each run with actionable counts: ready for the user, blocked with owner and
reason, approved but unpublished, and published with receipts. Link the review
workspace. Never request blanket approval for incomplete evidence or promise
unattended work from a skill alone.
