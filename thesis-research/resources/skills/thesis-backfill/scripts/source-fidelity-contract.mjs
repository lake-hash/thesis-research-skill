export const SOURCE_FIDELITY_CONTRACT = 'source-fidelity/1.0';

const text = value => typeof value === 'string' && value.trim().length > 0;
const list = value => Array.isArray(value) ? value : [];

export const sourceNarrationPatterns = [
  /\b(?:the|this) author(?:'s)?\b/i,
  /\baccording to the author\b/i,
  /\b(?:the|this) (?:source|post|reply|thread|article|transcript|interview|podcast)\b/i,
  /\bthe author said\b/i,
  /\bthe author's view\b/i
];

export const degreePatterns = [
  /\blargest\b/ig, /\bsmallest\b/ig, /\bbest\b/ig, /\bworst\b/ig,
  /\bonly\b/ig, /\balways\b/ig, /\bnever\b/ig, /\bclearly\b/ig,
  /\bdefinitively\b/ig
];

export function sourceFidelityIssues({ prose, sources, allowedSourceIds = [] } = {}) {
  const issues = [];
  const value = String(prose || '');
  for (const pattern of sourceNarrationPatterns) {
    if (pattern.test(value)) issues.push(`public prose contains source/author narration: ${pattern}`);
    pattern.lastIndex = 0;
  }
  const allowed = new Set(allowedSourceIds);
  const sourceText = [...(sources?.entries?.() || [])]
    .filter(([id]) => !allowed.size || allowed.has(id))
    .map(([, source]) => source?.text || '')
    .join('\n');
  for (const pattern of degreePatterns) {
    const matches = value.match(pattern) || [];
    for (const match of matches) {
      const escaped = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`\\b${escaped}\\b`, 'i').test(sourceText)) issues.push(`public prose adds unsupported degree word: ${match}`);
    }
    pattern.lastIndex = 0;
  }
  return [...new Set(issues)];
}

export function sourceFidelityClaimIssues(claim, sources) {
  const issues = [];
  if (!claim || typeof claim !== 'object') return ['claim is not an object'];
  if (!text(claim.text)) issues.push('claim text is missing');
  if (!claim.semantic_claim || typeof claim.semantic_claim !== 'object') issues.push(`claim ${claim.id || '<unknown>'} is missing semantic_claim tuple`);
  for (const evidence of list(claim.evidence)) {
    const source = sources?.get?.(evidence.source_id);
    if (!source?.text?.includes(evidence.quote || '')) issues.push(`claim ${claim.id || '<unknown>'} has non-exact evidence`);
  }
  return issues;
}
