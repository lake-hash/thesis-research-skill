---
name: thesis-ops
description: Monitor the health of investor automations and the Thesis processing pipeline, reconcile source and candidate coverage, diagnose failures or suspicious classification patterns, and propose bounded recovery actions. Use for multi-author operations and total-agent oversight.
---

# Thesis Operations

Read [thesis-ops.md](thesis-ops.md) for operational procedures and the shared
[operation contract](../references/thesis-operation-contract.md) for run, source,
candidate and state semantics. Use the [Thesis core contract](../references/thesis-core-contract.md)
when evaluating content-quality or delivery failures.

## Operating Boundary

- Distinguish collection, classification, review, export, publication and
  notification state. Success in one stage does not prove another.
- Reconcile checkpoints, source dispositions, candidate coverage, active/pending
  company identities and delivery manifests before retrying.
- Resume only failed or missing portions. Preserve completed work and immutable
  history; do not restart a whole author because one batch failed.
- Treat anomalous pass rates, empty output, repeated objects, stale hashes and
  missing media/ticker decisions as review signals, not automatic content verdicts.
- Propose bounded recovery with stop conditions. Do not change schedules, publish,
  notify or delete data without the required authorization.

Use `../thesis-backfill/scripts/thesis-pipeline.mjs` for current policy, validation,
batch checks and delivery checks rather than invoking individual gates ad hoc.
