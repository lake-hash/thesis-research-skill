# Behavioral Evaluation

Evaluate the skill with supplied evidence and permitted tools, not a real public
deployment. Require actual draft records and source/match decisions. Do not treat
the structural validator as a semantic evaluator.

Run the deterministic [guard tests](../scripts/test-validator.mjs) with
`node --test <skill-root>/scripts/test-validator.mjs`.
The [prototype sample check](../scripts/check-prototype-sample.mjs) imports the
available archived AEHR sample into generation contract 3.1 and writes a temporary
held packet and presentation manifest. It is
local-only, performs no new network retrieval, and does not approve or publish
the imported record. Run it from the installed skill or repository source.

| Input situation | Expected decision boundary |
|---|---|
| A common name matches a fund manager and a journalist | Resolve identity or ask; do not combine their statements |
| Only 90 days of indexed X data is available for an all-history request | Useful partial result plus older/channel gaps, not lifetime-complete |
| A short reply adopts a concrete reason in its parent | Can qualify without a length threshold; retain the parent context |
| A holdings filing lists a company but no reason | Position evidence or hold, not an invented thesis |
| A firm letter contains several named speakers | Attribute actual signatories/turns, not automatically the founder |
| Same interview exists as video, transcript and news recap | One statement event with multiple source representations |
| Two differently worded sources address one company's same question | One thesis with an update/reaffirmation, not two titles |
| A supplier's factory ramp and another company's unrelated product adoption share an AI theme | Independent company questions can remain separate |
| A person sells a memory ETF and prefers a supplier | Separate investment-vehicle change from underlying industry belief |
| A gold argument names no ETF | Gold view; optional explicit Alva GLD proxy, not a disclosed author holding |
| A standalone post says large positions are unattractive before several policy events but names no security | Triage `no_judgment`; omission ledger only, with no thesis/setup/context record |
| A short reply omits the ticker but its verified parent is an existing company thesis | May inherit that company object; preserve the parent as context and do not infer from topic similarity alone |
| One post compares several named securities and the prose discusses each one | One expression may carry every verified ticker; mention every object in prose and tag each one instead of keeping only the first |
| A source contains many tickers but the generated company paragraph uses only one section | Bind only the ticker(s) used by that paragraph; the other sections remain separate context or theses |
| The current post has no image but quotes a chart that explains the accepted why | Include the exact quoted-context attachment with provenance and a material-use reason |
| The quoted image is merely adjacent, repetitive or unrelated to the accepted prose | Omit it with a specific reason; quoted media does not follow automatically |
| A founder praises a crypto company's business without token economics | No invented token-price thesis |
| A setup is closed before its target is later reached | Retain exit; later target is not an earned return or reopened trade |
| A new trading episode follows a stop-out in the same ticker | New episode inside the company history; retain the failed episode and account scope |
| A post is edited after extraction | New source revision/correction link; old proof remains |
| Model output is empty or covers only half a batch | Resume missing sources; no silent no-judgment classification |
| A candidate has elegant prose but wrong speaker or unsupported number | Hold/revise, never approve from a total confidence score |
| A long entry has blank lines but its first paragraph only names the topic | Revise: opening must summarize the judgment and material condition; formatting alone is insufficient |
| A short complete view is padded to satisfy a two-paragraph template | Keep one paragraph; no minimum length or paragraph quota |
| An update says "the absence of a guidance increase is retained" | State that guidance did not rise and explain why it matters; move process narration out of reader copy |
| Timeline displays "Additional evidence" or an event headline | Fail presentation review: use date, body preview, ticker logos and source; types remain internal |
| A cleaner trade summary omits that the sale was only recommended | Fail fidelity review; advice is not execution |
| An older preview uses today's closed-trade conclusion | Fail chronology review; derive the preview only from the frozen historical description |
| A Signal repeats its summary instead of relating it to the thesis | Revise interpretation to explain specific support, challenge or qualification |
| Existing company thesis receives its first explicit buy-below threshold with no new mechanism | Private technical/operation history; not a public update |
| One post reports HIMS and NUAI additions | Preserve both claims and their scopes; one exported action does not account for the other |
| Trade table contains a loss but no original thesis | Retain supported pending/history item; no invented rationale or silent loss omission |
| Earlier context becomes relevant after a later thesis is found | Revisit and link history while retaining original dates and unknown origin |
| A later repeated threshold adds no change | May coalesce with explicit earlier event and reason; do not delete the first occurrence |
| A conditional sale becomes "reconsider" | Fail fidelity: retain action strength and condition without claiming execution |
| "Below $188, next support is $186" | Private source history: price levels alone do not explain a thesis update |
| A post lists four add levels and says sizing depends on the index | Private source history: operation planning without a reason/mechanism |
| A falling wedge, oversold signal and volume reversal support a rebound | Private `technical_out_of_scope` history; the public product does not track technical theses |
| Revenue or guidance is reported with no investment implication | Private fact evidence, not a public thesis/update |
| Acquisition offer becomes an acquisition | Fail stage fidelity; keep counterparties and offer stage |
| "14% away" becomes "14% below the target" | Fail numerical basis: source does not specify that denominator |
| Average cohort payback becomes typical project payback | Fail scope fidelity; retain average and unknown cohort |
| Business horizon becomes founder-retention deadline | Fail time scope; do not transfer a date to an unrelated claim |
| Recovered earlier source leaves two FIRST_OBSERVED events | Canonical final-packet validation must reject the assembled result |
| Recognized history is linked only to a group, not any event or pending item | Fail required history-coverage check; group membership is not historical preservation |

Useful real prototype cases for a local-only exercise: `art-mu-swing`,
`stewie-aehr`, `art-memory`, `wood-circle`, `wood-block-ai`,
`dalio-gold-bitcoin`, and the consolidated `qcap-reddit` / `qcap-reddit-data` history.
Read the raw source packets and dates rather than using their existing polished
summaries as proof. Treat the current approved records as a comparison baseline,
not as immutable ground truth about investment performance.

An independent evaluator should receive the skill, realistic user request and
minimum source packet. Do not prime it with the intended result or suspected bug.
Inspect its produced records for attribution, omissions, merges, entity mapping,
temporal leakage and prose. Report what was actually tested and any untested live
retrieval/coverage limitations.

## Generation 3.1 Regressions

- Sivers lasers, wireless and sensing: one author-company thesis with all source
  claims retained. LPKF glass, solar and quantum: the same grouping rule.
- A newer generic reaction or position-only confirmation cannot anchor a reasoned
  company thesis. A short statement with the actual judgment and reason can.
  A longer post about financing cannot support a different power-scarcity claim.
  Card date and Source must agree, and all supporting claims retain evidence links.
- Later context or ticker evidence cannot enter an earlier event. A current-card
  rewrite must not change historical descriptions, bindings or sources.
- An editorial note alone cannot permit historical edits during ordinary updates.
  Explicit correction mode still rejects changes to historical evidence.
- Forty words: no Show more. Forty-one: first forty plus ellipsis and Show more,
  with the complete body in a separately addressable historical detail.
- UCO returning SVXY, GDXU returning BMO, or the wrong Ren by name must not change
  pictures. Missing avatar_url produces a declared image gap and a fallback.
- `Building a position`, adding after a decline with unchanged conviction, an
  early-investment recollection, and a bare target-only reply remain private
  history. None supplies a new why or Timeline increment.
- A final card or Timeline row containing `the article sees`, `the source did not
  establish`, `the post points to`, `the author has a partnership`, referral-link
  disclosure or reviewer reconciliation fails final projection review. Preserve
  useful investment meaning directly and keep review metadata private.
- An inseparable IREN/SK hynix, Apple/Snap or Robinhood/SoFi comparison remains
  one expression with every used ticker. An unrelated roundup still separates.
- A Timeline override cannot return an image whose reviewed binding is `omit`.
  Product media is derived only from `include` bindings, including quoted context.
- A current-card source never appears again as a visible Timeline row. Source and
  displayed date change together when the primary expression changes.
- A new tickerless thesis is rejected. A tickerless update may remain only inside
  an unambiguous existing company record with explicit record-level resolution.
- Every final card and Timeline row is re-reviewed after grouping/overrides and
  bound to the exact presentation hash. A valid earlier review cannot approve a
  changed final projection.

These are deterministic invariant tests, not an independent semantic extraction
benchmark. Do not label imported prototype copy as a fresh first-pass generation.
