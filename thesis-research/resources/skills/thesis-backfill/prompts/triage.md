# Triage Stage

Input is a normalized, deduplicated source batch. Return JSON only and account
for every supplied `source_id` exactly once. Do not draft public prose, group
records, select a primary source or approve publication.

Each row contains:

```json
{
  "source_id": "stable ID",
  "authorship": "author_owned | other | unresolved",
  "disposition": "candidate | no_judgment | needs_context",
  "investable_object": "resolved | inherited | unresolved | none",
  "object_level": "company | asset | basket | theme | unresolved",
  "object_hints": [],
  "ticker_hints": [],
  "what_present": false,
  "why_present": false,
  "possible_increment": "new_reason | new_evidence | changed_condition | none | unresolved",
  "content_domain": "fundamental | technical_only | mixed | unresolved",
  "context_source_ids_needed": [],
  "visual_hint": "required | possibly_helpful | none | unresolved",
  "reason": "source-based explanation under 25 words"
}
```

- Preserve recall. Short replies, missing parents and image-dependent meaning use
  `needs_context`, not a guessed decision.
- `inherited` requires verified conversational or matched-history identity.
- Technical-only, action-only, performance-only and objective-result sources are
  not public candidates unless an independent non-technical what and why remains.
- A row with author-owned resolved/inherited object, ticker, what, why and material
  fundamental/mixed increment cannot be `no_judgment`.
- `visual_hint` schedules inspection only; images never supply missing what, why,
  ticker or direction.
