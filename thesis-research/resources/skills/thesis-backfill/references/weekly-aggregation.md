# Weekly Thesis Aggregation

Weekly aggregation is a presentation and language-compression layer. It does
not delete or overwrite event-level facts, sources, dates, ticker evidence,
media decisions or trade episodes.

## Eligibility

An event may join a weekly group only when all of the following match:

- the same author and active company thesis;
- the same UTC calendar week, Monday through Sunday;
- the same expression-local displayed ticker set;
- the same per-ticker direction (`bullish`, `bearish` or `none`);
- a public `update` or the current card's primary event;
- no conflicting action, reversal, condition or certainty change.

The grouping key is conservative. A matching ticker alone is not enough. If the
author changes direction, introduces a separate mechanism with a conflicting
conclusion, or reports a new buy/sell/reduction/exit, keep separate groups.

## Output

The grouping command emits `weekly-thesis-grouping/1.0` with one group per
eligible display unit. Each group contains `member_event_ids`, the anchor event
(the latest eligible event in the week), all source IDs, the exact ticker
directions, the week bounds and a `needs_semantic_review` flag. The original
events remain the source of truth.

Language generation may write one reader-facing summary for the group. The
summary must cover every material increment in the member events or explicitly
leave an event as a separate group. The review stage must check that the weekly
summary did not erase a reversal, condition, risk, action or source-specific
ticker direction.

## Product behavior

The Feed may display one weekly card or Timeline update for a group. Opening it
must show the week range, the anchor date, the combined source list and the
underlying event dates in the detail view. A single event remains unchanged.
The raw event projection remains available for audit, point-in-time navigation
and later regrouping.

## Quality and performance

Weekly aggregation reduces repeated language work without using unsupported
synonym rotation. It must run after event-level Facts review and before Media or
Language packing. Media is still reviewed against individual attachment IDs and
then unioned into the weekly display group. Final public review runs on the
actual grouped presentation, not only the raw events.

