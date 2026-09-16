# Podcast, Interview And Recording Extraction

This workflow adds public audio/video statements to the same author/company
history as X and written sources. It does not create a parallel thesis per channel.
Load this file for podcasts, TV/web interviews, conference recordings, speeches,
earnings Q&A and user-provided audio or video.

## Retrieve The Recording, Not A Description

1. Resolve the person's stable identity and inventoried channels. Query the
   documented Alva Persons and podcast transcript endpoints, publisher archives,
   RSS and original video channels. Episode titles and descriptions are discovery
   leads, not transcriptions or proof the person spoke.
2. Use `scripts/collect-podcasts.js` for bounded indexed retrieval. It returns
   episodes, show RSS addresses, exact continuation offsets and coverage limits.
   Resume `next_offset`; a page-budget stop does not mean the window is complete.
   Browse results are date-descending; `created_at` is ingestion time, never the
   speaking date. Query names can match discussed or archival speakers too.
3. Match the returned `episode_id` GUID to the publisher RSS item with
   `scripts/resolve-podcast-rss.py`. Preserve the public episode URL, enclosure,
   publication timestamp and metadata evidence. Do not invent a playback link from
   the Arrays internal ID. Missing RSS items require publisher archive lookup,
   not a guessed link or a different episode with a similar title.
4. Prefer an original publisher transcript. Alva also provides ASR transcripts.
   For other sources, use authorized captions, transcripts or the installed
   `transcribe` skill on legitimately accessible audio/video. Diarized JSON is
   preferred for multi-speaker recordings. Check API/key availability; do not
   pretend transcription ran when it did not. Do not bypass paid/private access.
5. Normalize the original turn text with `scripts/normalize-media.mjs`. Use its
   Arrays adapter or explicit speaker-segment JSON for other providers. Keep
   unparsed turns and speaker gaps in the review queue, not silent omissions.

```bash
alva run --local-file <skill-root>/scripts/collect-podcasts.js --args '{"speaker":"PERSON NAME","start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD","limit":2,"max_pages":3}'
python3 <skill-root>/scripts/resolve-podcast-rss.py downloaded-rss.xml EXACT-EPISODE-GUID
node <skill-root>/scripts/normalize-media.mjs episode.json NEW-media-sources.json episode-config.json
```

The collector's response is wrapped in Alva's `result` JSON string. Preserve that
raw response, then use its `episodes` entries individually. Do not send whole
multi-hour archives to the model in a single response.

## Attribution Before Extraction

Provider `resolved_speakers` values are candidates. Require a verified mapping
to the target person, supported by introductions, on-screen labels, publisher
speaker attribution or checked dialogue. Never identify someone by perceived
voice resemblance. A host may express a personal thesis; role alone neither
includes nor excludes them. Check the actual speaker of each supporting turn.

Alva-specific traps:
- `attribution_source: title` is not a verified transcript-to-person binding,
  even when confidence is high or `presence` says evidenced.
- `presence: archival` denotes played tape, not participation. Resolve the
  original recording and date before creating an author event.
- Intro montages can mix a narrator, host questions and guest clips under one
  speaker label. Split/review those turns; do not treat every mapped label as the
  guest. Exact names and financial terms may be wrong in ASR.

Review each segment's `media.review`: `status`, `reviewer`, `method`,
`text_sha256` and `speech_role`. Roles include `author_statement`, `question`,
`advertisement`, `quoted_third_party`, `archival_clip`, or `unresolved`.
Only a verified author statement can become primary investment evidence. A
host's question is context, not the guest's belief. A read-out of a third-party
forecast is not endorsed unless the guest explicitly adopts it.

For ASR, check the cited audio when possible. If it cannot be checked, seek the
corresponding full publisher or human-verified transcript. Parse the full document,
match the episode/date and speaker, and inspect surrounding Q&A. Another copy of
the same unchecked ASR, an AI-verified badge, a summary or a search snippet does
not resolve attribution. Check names, tickers, numbers, units, negation, conditions
and buy/sell tense. Mark `audio_checked` only after actual audio inspection.
Transcript-only acceptance uses `review.transcript_fallback`, never a fake audio
check. Preserve the full transcript archive, URL and hash, matched source hash,
provenance (`publisher` or `human_verified`), evidence note, and true checks for
`full_text_parsed`, `episode_matched`, `speaker_verified`, `date_verified`,
`context_checked`, `critical_terms_checked`. These flags record checks, not replace
them. Unresolved visual dependencies still block the affected claim.

If neither route works after bounded retrieval and parsing attempts, skip the
interview for this run. Keep raw turns and a specific reason in the private
coverage log; do not publish its content or create a user approval task. Search
the publisher and one or more credible transcript providers before declaring
fallback exhausted; record unavailable, unparseable and attribution-conflicted
results distinctly. Do not silently repair original text:
retain the original and create a corrected transcript revision. Official
transcripts still need source/context review; publisher status is not semantic
approval. For video/interviews, set `visual_dependency` to `none`, `verified` or
`unresolved`. If the claim depends on a chart/slide/gesture, inspect the frame at
the timecode and retain its evidence; captions alone are insufficient.

## Segment And Match

Keep full source turns and the surrounding question/answer, including uncertainty
or retractions. Classify every segment, including no-judgment material, and sample
discarded segments for missed theses. Use speaker-aware/topic-coherent batches;
carry adjacent turns across batch boundaries. Do not make one thesis per sentence
or a maximum of four theses per episode.

One recording is one expression context. For a given author/company, assemble
its relevant turns into one coherent dated event; different companies can have
their own records. Reconcile all episode batches before approval. Preserve
independent new position actions and material changes, not summaries of questions.
Apply the same plain-English and increment rules as written sources: short
summary first for long copy, no generated title, no process narration, no future
information inserted into history.

## Dates, Timecodes And Cross-Platform Copies

- Store publication time, confirmed recording/speaking time, transcript revision,
  media-relative offsets and collection time separately. `00:12:30` is not an
  absolute date. Never add a playback offset to a publication timestamp.
- Use a confirmed original speaking date when available; otherwise the original
  publication date with the correct precision. Never guess midnight to satisfy
  the product's millisecond field. Day-only product exports remain explicit holds.
- A podcast, its YouTube upload, an X clip and a publisher transcript of the same
  appearance share `canonical_recording_id` only after a verified lineage match.
  Different appearances repeating the same sentence are not duplicate recordings.
  Keep segment IDs, all source URLs and transcript revisions. A new upload date
  must not make an old statement the newest author view.
- Seek links are generated only for supported YouTube links or confirmed direct
  media fragments. Otherwise keep the original URL and a written segment locator;
  do not pretend every platform supports `?t=`.

## Handoff And Honest Completion

Follow [review execution](../../thesis-review-publish/references/review-workflow.md).
Normalization is not the end of the run. Attempt source verification and content
generation before handing work back; if tools/evidence prevent that, record the
actual attempts and skip unverifiable interviews. The agent reviews complete
candidates and publishes within the authorized scope without manual approval.

`normalize-media` emits a source bundle, not approved theses. Merge its authors,
coverage, sources and `media_inventory` into the research packet; classify segments
and build ordinary records/events using the generation/review prompts. Supply
dispositions and pending items for every source. Only after speaker, transcript
and context review may a source be `primary` and `context_complete: true`.

Run the usual packet validator and product preparation adapter. The adapter puts
original turn text in the private research packet, named verified seek hyperlinks
at the end of product body, and recording/segment/speaker provenance in the
manifest. It does not emit public sources or add new
public ThesisCard fields or use `media[]` (image/priceChart only) for audio/video.

Report per channel: appearances discovered, retrieved transcripts, source turns,
speaker/ASR/visual gaps, reviewed statements, approved theses/updates and export
blockers. Complete indexed pagination is not complete public-speech coverage.
Do not publish new investor content, change monitoring schedules or update Notion
merely because this skill was loaded.
