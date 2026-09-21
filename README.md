# Thesis Research Skill

A self-contained Codex skill for source-backed investor-thesis research,
incremental updates, review, export, and pipeline operations.

## Install

Install directly from GitHub:

```bash
npx skills add lake-hash/thesis-research-skill --skill thesis-research --agent codex -g --copy -y
```

Or clone this repository, then copy or symlink the `thesis-research` directory
into your Codex skills directory:

```bash
cp -R thesis-research ~/.codex/skills/thesis-research
```

Invoke it as `$thesis-research` or describe an author backfill, thesis update,
source review, export, or Thesis operations task.

## Contents

The top-level skill routes among four bundled workflows:

- Backfill historical investor views
- Process incremental updates
- Review and prepare publication/export
- Audit pipeline and automation health

All cross-workflow references and scripts are included under
`thesis-research/resources/skills/` with their original relative layout.
The package includes canonical author/company history consolidation, optional
weekly Feed compression, expression-local media handling, and hash-bound final
presentation review.

## Requirements

- A current Codex installation with skill support
- Node.js 18 or newer for validators and exporters
- Python 3 only when resolving podcast RSS feeds
- Access to the source providers and destination systems required by the task

No credentials, private source archives, production IDs, or deployed Alva
resources are included.

## Validate

```bash
node scripts/validate-bundle.mjs
node thesis-research/resources/skills/thesis-backfill/scripts/thesis-pipeline.mjs test
```
