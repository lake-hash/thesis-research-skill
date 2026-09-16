# Fast Triage Prompt

Use only on normalized, deduplicated source batches. Do not draft thesis/update
prose and do not make publication decisions.

For each source return compact JSON with:

```json
{
  "source_id": "stable source ID",
  "authorship": "author_owned | other | unresolved",
  "disposition": "candidate | no_judgment | needs_context",
  "investable_object": "resolved | inherited | unresolved | none",
  "object_level": "company | theme | asset | basket | unresolved",
  "object_hints": ["canonical name or source wording"],
  "ticker_hints": ["author-named or context-inherited ticker"],
  "what_present": true,
  "why_present": true,
  "possible_increment": "new_reason | new_evidence | changed_condition | none | unresolved",
  "content_domain": "fundamental | technical_only | mixed | unresolved",
  "context_source_ids_needed": [],
  "visual_hint": "required | possibly_helpful | none | unresolved",
  "reason": "One short source-based explanation"
}
```

Rules:

- Preserve recall. Ambiguous short replies, image-dependent posts and unresolved
  objects go to `needs_context`, not `no_judgment`.
- This semantic result is unioned with deterministic object/ticker/thread hints.
  If a source with a resolved object contains subjective, causal, valuation or
  technical language, `no_judgment` requires a second triage review.
- Exception: a standalone broad-market, macro, policy-calendar, event-risk,
  sector-rotation or theme statement with no specific investable company/security
  is `no_judgment`, with `investable_object: none`. Stop there. Do not create a
  theme/context candidate and do not invent a proxy ticker.
- `inherited` is allowed only when the verified reply/thread parent or an existing
  matched company history identifies the same object. Missing context that could
  establish this relationship is `needs_context`; generic topical similarity is
  not inheritance.
- A holding, preference list, transaction, result or price recap without what+why
  is not a thesis candidate. It may still be private trade history.
- An update candidate needs a possible new reason, evidence or condition. Action
  or performance alone is `none`.
- Technical analysis and trade setups are out of scope for the public product.
  Chart patterns, moving averages, support/resistance, breakouts, momentum,
  relative strength, options timing, stops and targets are `technical_only` and
  `no_judgment`. A mixed source may contribute only its independent fundamental
  company what+why; technical material remains private.
- Keep company and theme object hints separate. Do not expand a theme list into
  company candidates without independent what+why.
- `visual_hint` only schedules image inspection. It does not include media.
- Use the source text and supplied context only. Do not infer motives, recommend a
  security, upgrade certainty or describe price movement as validation.
- Return JSON only. Keep `reason` under 25 words.
