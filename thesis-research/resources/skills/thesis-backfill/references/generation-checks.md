# Generation Checks From Source To Final Prose

Use these checks during extraction and again on the assembled result. They
address missing updates and meaning changes, not scheduling or publication.

## Different Admission Rules

| Material | Required treatment |
|---|---|
| New company/asset thesis | Object, own judgment and a meaningful fundamental reason; match author-company records first |
| New price threshold, target or technical condition for a matched question | Preserve only in private technical/position history; not a public update |
| New fundamental horizon or risk condition | Preserve as a dated update when it changes the investment judgment |
| Reported purchase, add, reduction, exit, transfer or loss | Preserve scope and outcome in history; match the right account/episode, not ticker alone |
| Repeated unchanged cheer or identical threshold | May coalesce with a specified earlier event; do not create noise or require every post to appear separately |
| Position/outcome without any recoverable thesis | Keep a supported pending history item or separate history artifact; never invent a rationale to qualify it as a setup |
| Promotion, list or price recap | Inspect for an actual embedded judgment; neither automatically qualify nor automatically reject |
| Another business line or trade for the same author and company | Update the company thesis; preserve distinct account and episode history |

First collect the claims, then group across the whole window, then revisit
earlier dispositions. "No standalone mechanism" can be correct for creating a
new thesis but wrong for retaining an update to one found later. The first
occurrence of a meaningful threshold is not redundant simply because it is
repeated later. Discretionary position choices before the first captured thesis
retain their actual dates and unknown original rationale.

Maintain a compact `history_coverage` trace for recognized assessments, actions
and outcomes. Each claim maps to event IDs, a justified coalescing target, or a
pending item with the specific missing evidence. A single source can require
several trace items: exporting its HIMS purchase does not also account for its
NUAI purchase. Check that the linked prose actually preserves the claim; IDs
alone do not prove semantic coverage. Sample source dispositions independently
to detect claims the trace never recognized.

Do not coalesce a revised forecast, new allocation, changed horizon, adverse
outcome or an explicit condition into generic continued confidence. Keep earlier
conditional floors alongside later lower-price observations. Do not declare a
conditional forecast failed or successful without assessing its condition.

## Preserve Meaning Before Rewriting

For each important claim, identify the following from the actual source and
carry it through the summary and event text. Keep this in working notes or
support metadata; it is not a visible prose template.

- **Subject and owner:** company, speaker, account, portfolio and trade episode.
- **Action and strength:** sell versus reconsider; intention/advice versus reported
  execution; negation and the condition attached to the action.
- **Stage:** proposal, offer, agreement, completion; expected approval versus
  advisory vote or final authorization. Never shorten away a material stage.
- **Numerical basis:** unit, denominator, period, average versus typical,
  scenario versus observed result. Do not invent missing arithmetic.
- **Time scope:** date of speech versus trade date; business horizon versus
  retention/contract term. A nearby date does not apply to every claim.

Examples of distinctions, not mandatory wording:
- "I will sell if the thesis breaks" stays a conditional sale, not a possible
  reconsideration and not a completed exit.
- An offer to acquire a company remains an offer, even in a short caption.
- "14% away from a target" does not specify a 14% discount to target.
- Reported average payback for an unspecified investment cohort does not become
  the typical payback of all infrastructure projects.
- A business outlook through 2030 is not a founder-retention deadline.

Missing evidence for one number need not block an independently supported
qualitative claim. Omit or qualify that number and retain the unresolved item.
Do not remove a defining risk or action merely to make the prose smoother.

## Final Reader Pass

Use [plain-language-and-sources.md](plain-language-and-sources.md) and both bundled
prompts. Explain actors, business roles, named projects and operational stages.
Build `card_claims` from the finished wording, check evidence for each claim role,
and choose the primary link only from sources supporting the core argument.
Rebuild those mappings after edits. A newer buy/hold update remains in Timeline.

Write the content a reader needs, then keep review tasks outside it. Replace
"before this setup can be approved" with the actual source limitation, such as
"The entry price was not disclosed", only when that limitation matters. Remove
"must be kept distinct", "tracked separately" and similar routing instructions
from investment prose; retain the relevant account or product distinction in
ordinary language. Useful attribution and unresolved factual conditions remain.

Longer content opens with a paragraph that summarizes the investment view and
its key condition/current state. Supporting paragraphs add new information,
not a second copy of the opening. The first sentence itself names any company,
counterparty, product or transaction needed to understand the mechanism; do not
repair an incomplete `the partnership` or `new products` opening in sentence two.
Name unfamiliar companies and counterparties;
explain documents or products briefly. When deleting an unsupported figure, do
not leave dangling phrases such as "the cited ratio" or "those order figures".
Use a sourced useful figure with its basis, or state the qualitative mechanism.

## Assembly And Review

Reconcile source claims to final events after all context recovery and merging.
Check one FIRST_OBSERVED per record, dated subsequent events, distinct trade
episodes, original source identities, and preserved failed/closed outcomes.
Different statements on different dates do not become one original event merely
because they repeat the same view; coalesce presentation through the trace while
preserving their source dates.

Run the canonical packet validator on the final output with history coverage and
generation contract 3.2 required, then build the presentation manifest. These
checks catch missing links, duplicated company cards, duplicate first observations,
primary-source mismatch, future context and historical rewrites;
they cannot detect an omitted claim that was never recognized or guarantee that
prose matches the source. Source-first semantic review remains required. Freeze
drafts before external review and separate own corrections, reviewer-requested
repairs and the final verdict. Do not call hand-rewritten output first-pass skill
success or call a targeted regression a full-corpus quality pass.

Check the final grouped card and visible Timeline together: no Timeline row may
repeat the card's primary source. Verify that its original event and full detail
still exist, all other dated updates remain, and changing the primary Source
recalculates visibility without changing historical prose or timestamps.
