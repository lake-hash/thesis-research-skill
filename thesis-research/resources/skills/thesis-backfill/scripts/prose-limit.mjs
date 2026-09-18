import ThesisLinks from './source-links.cjs';

export const PROSE_MAX_CHARS = 500;
const entries = value => Array.isArray(value) ? value.filter(v => v && typeof v === 'object') : [];

export function proseLength(value) {
  const prose = ThesisLinks.split(String(value ?? '').replace(/\r\n?/g, '\n')).prose;
  return Array.from(prose).length;
}

export function composeVisibleProse(stanceSentence, description) {
  const stance=String(stanceSentence??'').trim(),body=String(description??'').trim();
  if(!stance)return body;if(!body)return stance;
  const normalize=value=>value.replace(/\s+/g,' ').trim();
  return normalize(body).startsWith(normalize(stance))?body:stance+'\n\n'+body;
}

export function validateProseLimit(packet, {baseline, required = false, check}) {
  const declared = packet.generation_policy?.prose_max_chars;
  const priorLimit = baseline?.generation_policy?.prose_max_chars;
  if (declared === undefined && priorLimit === undefined && !required) return;
  check(declared === PROSE_MAX_CHARS, 'Generation policy must declare prose_max_chars: 500');
  const priorRecords = new Map(entries(baseline?.records).map(r => [r.id, r]));
  const validate = (value, previous, label) => {
    // Existing published wording is frozen; a new limit does not authorize edits.
    if (previous !== undefined && value === previous) return;
    const count = proseLength(value);
    check(count <= PROSE_MAX_CHARS,
      `${label} has ${count} prose characters; maximum is 500. Rewrite and recheck evidence; do not truncate.`);
  };
  for (const record of entries(packet.records)) {
    const prior = priorRecords.get(record.id);
    validate(composeVisibleProse(record.stance_sentence,record.description),
      prior?composeVisibleProse(prior.stance_sentence,prior.description):undefined,
      'Record ' + record.id);
    const priorEvents = new Map(entries(prior?.events).map(e => [e.id, e]));
    for (const event of entries(record.events)) {
      validate(event.description, priorEvents.get(event.id)?.description, 'Event ' + event.id);
    }
  }
}
