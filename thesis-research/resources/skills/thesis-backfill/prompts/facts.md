# Source Review And Fact Ledger Stage

Read originals and required contemporaneous context source-first. Return
`reviewed-thesis-facts/1.0`; do not write `description`, `stance_sentence`,
`opening_plan` or titles.

Return only semantic group deltas. Deterministic assembly owns stable record IDs,
history receipts, source-decision wrapping and media inventory. For each supplied
`group_id`, return zero or more records with object identity and ordered events.

Each event contains only:

- source IDs and date;
- `public | source_only | hold`;
- what, why, increment and increment kind;
- expression-local tickers with direction and exact source evidence.

Each direction-evidence row must bind one source ID to one contiguous verbatim
quote from that source. Do not join separate snippets, add ellipses, normalize
punctuation or combine a ticker list and a judgment into a synthetic quote.

The final ledger contains:

- one disposition for every archived source;
- one record per author and resolved investment object;
- append-only events with source date, exact sources and context sources;
- `public | source_only | hold` per event;
- public-event `what`, `why`, material increment and increment kind;
- expression-local tickers and source-backed direction evidence;
- reviewed primary source and full-window `history_search` receipt;
- media inventory, without final image inclusion prose.

Review requirements:

- Match active, pending and same-run objects before creating a record.
- Resolve every complete triage candidate to public, pending or one evidence-bound
  hard admission failure. Event/macro/volatility wording is not a failure itself.
- Preserve distinct dates, reversals, corrections and trade episodes. Do not use
  future context or import another expression's reason.
- Shared multi-ticker records require one inseparable author-owned judgment.
- Another speaker's view stays context unless explicitly adopted.
- For every exclusion retain exact source evidence and a concrete reason.

The deterministic `facts` validator is the approval boundary. Failed facts return
to source review; they do not move to language generation.
