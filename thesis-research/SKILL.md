---
name: thesis-research
description: Recover, update, review, export, and operate source-backed public-investor theses from social posts, documents, podcasts, interviews, and speeches. Use for author backfills, incremental thesis updates, source-first review, ThesisCard export, or Thesis pipeline health checks.
---

# Thesis Research

This is the portable entrypoint for the complete Thesis workflow. It bundles
the backfill, update, review/publish, and operations modes plus their shared
contracts, prompts, validators, and export scripts.

Backfill uses the current seven-stage flow: Archive, Triage, Facts, optional
weekly grouping, Media, Language, and Delivery. Canonical company identity is
resolved before grouping so one author/company history cannot fragment across
record aliases. The bundled machine policy, packed-stage planner,
candidate-closure checks, deterministic presentation, and final-public gates
are part of the package; do not replace them with ad hoc prompt-only steps.

## Choose A Mode

- **Backfill:** recover an author's historical public investment views. Read
  [Backfill mode](resources/skills/thesis-backfill/SKILL.md), then its detailed
  workflow only as needed.
- **Update:** process new statements against an existing author/company
  baseline. Read [Update mode](resources/skills/thesis-update/SKILL.md).
- **Review and export:** verify candidates against originals, resolve grouping
  and attribution, and prepare version-bound output. Read
  [Review mode](resources/skills/thesis-review-publish/SKILL.md).
- **Operations:** inspect coverage, queues, automation health, and recovery
  options. Read [Operations mode](resources/skills/thesis-ops/SKILL.md).

For work spanning modes, read the
[shared core contract](resources/skills/references/thesis-core-contract.md), the
[machine policy](resources/skills/references/thesis-policy.mjs), and the
[operation contract](resources/skills/references/thesis-operation-contract.md).

## Public Product Contract

- Public output is limited to fundamental company theses. Technical analysis,
  trade setups, and technical-only Timeline rows stay private.
- Every thesis needs a verified investable object, an author-owned judgment,
  and an author-stated reason. Every visible update needs a material change to
  a reason, evidence, condition, risk, valuation, forecast, or stance.
- Public prose is title-free, direct, conclusion-first, and no longer than 500
  characters excluding the named original-link footer. A current Thesis Feed
  body begins with its reviewed stance sentence; the combined visible body is
  subject to the same limit.
- Preserve original sources, speakers, timestamps, quotations, hashes, and
  immutable historical versions. Do not infer missing logic or authorship.
- Keep reviewed helpful media, including source-bound price charts, attached to
  the exact current or Timeline expression they explain. A chart may clarify an
  independently qualifying thesis but cannot supply a missing judgment or reason.
- Build and review the final presentation, not only intermediate records. Final
  review must cover every visible card and Timeline row and bind to the exact
  presentation hash.
- For Thesis Feed handoff, validate the seven-field ThesisCards and their grouped
  projection. The Feed owns navigation, typography, image layout and lightbox
  behavior; the skill owns evidence-bound body, ticker and media values.

## Portability Boundary

The bundled scripts use relative paths and Node.js built-ins; the Markdown
parser is vendored. Python 3 is needed only for the podcast RSS resolver.

Prototype integration is optional. References to `thesis-field-notes/`, Alva
feeds, production IDs, or publishing commands apply only when the recipient has
an equivalent product workspace. This skill does not include source archives,
credentials, production allocations, deployed feeds, or permission to publish.

Before external writes, publication, notifications, schedule changes, or data
deletion, obtain the authorization required by the recipient's environment.
