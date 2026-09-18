# Source Fidelity Contract 1.0

Public Thesis and Timeline prose must preserve the source's semantic ownership,
subject, action, polarity, certainty, degree, conditions and time scope. A fluent
paraphrase is not approval when it adds an actor, owner, ranking or conclusion.

## Hard failures

Reject public prose that introduces source-process or author-narration language,
including `the author`, `the author's`, `according to the author`, `the post`,
`the source`, `the reply`, or `the thread`. Provenance belongs in source metadata
and the named original link, not in reader-facing prose.

Reject any possessive or attribution transformation that is not present in the
source evidence. For example, `the biggest negative catalyst for gold` cannot
become `the author's largest negative catalyst`.

Reject newly introduced degree words such as `largest`, `smallest`, `best`,
`worst`, `only`, `always`, `never`, `clearly` or `definitively` unless the exact
source evidence contains the same supported degree. Do not upgrade `may` to
`will`, a plan to an execution, or a reported result to an independent fact.

## Claim tuple

Every public claim maps to exact source evidence and preserves:

```json
{
  "source_id": "x:123",
  "subject": "GC",
  "owner": "labubu_trader",
  "predicate": "did_not_crash",
  "polarity": "positive",
  "certainty": "explicit",
  "degree": "largest_negative_catalyst_for_gold",
  "condition": null,
  "time_scope": "today",
  "quote": "Exact contiguous source span"
}
```

The generated sentence may simplify wording, but it cannot add a new actor,
possessor, quantifier, certainty level, condition or time scope. When a faithful
summary cannot fit, omit the unsupported detail or hold the expression.

The deterministic gate checks forbidden narration and unsupported degree words.
The source-first reviewer additionally reconstructs the claim tuple from the
original before approving the prose.
