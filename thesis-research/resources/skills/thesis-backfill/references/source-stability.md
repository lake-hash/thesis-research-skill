# Stable Evidence From Draft To Delivery

Apply these rules during generation, agent review and final export. They extend
the existing language and grouping contract; they do not introduce manual approval
or authorize publication beyond the user's requested scope.

## 1. Preserve Every Claim's Evidence

The current card may combine views from several dates. Map every meaningful clause
to exact originals before approval, including earlier facts, conditions and trade
preferences. Keep those references through preparation, export and rendering.
Putting an original in Timeline is not enough when the main body also uses it.

For example, a new AI-demand comment cannot alone support earlier cloud-financing
and credit-risk paragraphs. A September product-roadmap post can support product
names but not automatically a five-to-ten-year outlook from March. Either retain
the relevant named original links or remove the unsupported detail; do not invent
an economic bridge to make the summary sound complete.

## 2. Select The Source By Meaning, Then Recency

Choose the newest reviewed source that supports both the core judgment and its
decisive reason. A price reaction, position confirmation or volatility warning does
not qualify just because it is newer. If later evidence materially changes the
view, revise the current synthesis and reassess its primary source; do not hide a
reversal behind an older thesis. A later comment that adds no new core argument
can remain in Timeline without replacing the analytical anchor.

The displayed primary date and primary URL must come from the same expression.
Earlier supporting statements retain their own dates internally. On changing the
primary source, recalculate the visible Timeline exclusion: preserve the old event,
hide only the newly displayed primary expression, and do not hide every cited
supporting event. Never rewrite historical updates using later knowledge.

## 3. Recover Context Before Rejecting Or Expanding

Read quote/reply parents, threads, document passages and speaker turns before
assessing support. Keep quoted speakers distinct; an attached forecast is not
automatically the author's own prediction. Short text can contain a valid view or
position update. Length is a diagnostic, not an inclusion threshold, and English
word counts must not be applied to unsegmented Chinese text.

Likewise, shared tickers can reflect a company and a genuinely separate basket;
recency alone does not prove an outdated card. Classify checks as confirmed issue,
candidate, evidence gap or cleared, and record the evidence for any repair. Do not
turn screening counts into error counts, bulk merges or discarded theses.

## 4. Name The Hash Scope

`sources[].text_sha256` always hashes exactly `sources[].text`. Never compare a
page excerpt to a hash of an entire letter or compare extracted text to PDF bytes.
Search the registered complete-document archive before declaring a revision lost.
The same original can legitimately have complete-text and excerpt revisions.
Keep the old values; do not overwrite a historical hash to make a check pass.

For newly segmented documents, retain `documents[]` with `id`, `url`, full `text`,
`text_sha256`, `hash_scope: document_text`, `extraction_version` and `archive_path`.
Each source retains its own text/hash plus `text_scope: excerpt|document` and
`document_ref: {document_id, start_char, end_char, locator}`. Offsets are zero-based
UTF-16 code units into the exact archived `document.text` (the JavaScript slice
convention), not PDF page numbers or UTF-8 byte offsets. Preserve the locator for
readers. Changed extraction/normalization requires a retained new revision.

The document validator verifies each hash independently, exact slice equality and
baseline immutability. These checks prove traceability, not that the cited passage
actually supports a financial conclusion.

## 5. Seal The Reviewed Input And Check The Delivered Output

Use the preparation adapter to produce `thesis-export-input/1.1`. It derives
`sourceCoverage` from the validated history and complete current claim map, binding
the prose, primary source/date, review identity and all source revisions. This
receipt is integrity metadata, not a substitute for source-first semantic review.
Do not hand-create or re-seal a receipt to bypass a failure. Changed prose,
references, attribution or dates require review and preparation again.

The public card still has exactly seven fields. Its Markdown body ends with named
original hyperlinks, primary first and URL-deduplicated. All source revisions remain
in the private packet/manifest. A new footer must not shrink to the newest link,
replace originals with homepages, duplicate itself on retry or reintroduce public
sources/title fields. Timeline uses its own originals, not the current synthesis.

After any downstream formatter or renderer adapter, check the actual delivered
card bodies against the untouched export manifest:

```bash
node <review-skill>/scripts/validate-delivery.mjs cards.json ingestion-manifest.json
node <review-skill>/scripts/validate-delivery.mjs current-cards.json current-manifest.json
```

Reject lost/reordered links, changed bodies, mismatched primary dates, missing cards
or altered provenance. Old input 1.0 is explicitly `legacy_compatibility`; using
`--allow-legacy` does not certify current claim coverage. Do not export a modified
manifest alongside a broken card merely to make the gate green. Also reconcile
the expected keep-event ledger so dropping both a card and its manifest is caught.

## 6. Recheck Language And Media Without Adding Bureaucracy

Retain the existing plain-English rules: direct judgment, short summary first when
needed, connected explanation, concrete referents, no fixed title/body template,
no narrator boilerplate and no padded business rationale for a simple trade.
Review every revised sentence for source coverage and uncertainty afterward.

For unverifiable audio, seek a corresponding complete, parseable and reliably
attributed transcript. If neither route works, skip the interview with a private
attempt log. Never turn unchecked ASR into verified evidence or leave the user an
approval task. Retain current hashes, dates and source permissions.

End each run with passed checks, actual coverage and remaining uncertainty. Tests
can reliably catch field/link/hash regressions; no prompt or test suite guarantees
perfect semantic judgment or complete discovery of all public speech.
