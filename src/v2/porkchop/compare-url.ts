// Pure ?bodies= URL codec for the compare view (DEC-17-6: shareable URL
// ?bodies=<id,id,...> on /v2/compare/, cap 5). S-S17-A3PREP-2026-08-05-A.
// Zero imports from app/ or view code; the compare entry consumes this.

export const COMPARE_BODIES_PARAM = 'bodies';

/**
 * DEC-17-6 compare multi-select cap. Mirrored (necessarily — this pure
 * module cannot import app code) as SELECTED_BODY_SET_CAP in
 * src/v2/app/ui-store/store.ts; keep the two in step.
 */
export const COMPARE_BODIES_CAP = 5;

// Body ids in the catalog are short alphanumeric tokens, possibly with
// internal spaces, hyphens, or underscores (designation-derived). Anything
// else — empty, over-long, or carrying URL/HTML metacharacters — is junk
// and is dropped, not escaped.
const VALID_BODY_ID = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,31}$/;

function sanitize(rawIds: Iterable<string>): string[] {
  const out: string[] = [];
  for (const raw of rawIds) {
    const id = String(raw).trim();
    if (id.length === 0 || !VALID_BODY_ID.test(id)) {
      continue;
    }
    if (out.includes(id)) {
      continue;
    }
    out.push(id);
    if (out.length === COMPARE_BODIES_CAP) {
      break;
    }
  }
  return out;
}

/**
 * Parse a query string (with or without a leading '?', or a full URL) into
 * a deduped, capped, junk-free list of body ids. A missing or empty
 * `bodies` parameter yields [].
 */
export function parseCompareBodies(search: string): string[] {
  let query = search;
  const questionIdx = query.indexOf('?');
  if (questionIdx !== -1) {
    query = query.slice(questionIdx + 1);
  }
  const raw = new URLSearchParams(query).get(COMPARE_BODIES_PARAM);
  if (raw === null) {
    return [];
  }
  return sanitize(raw.split(','));
}

/**
 * Serialize body ids into a `bodies=a,b` query fragment (no leading '?'),
 * applying the same sanitize/dedupe/cap rules. Empty input (or all-junk
 * input) yields '' — callers omit the parameter entirely.
 */
export function serializeCompareBodies(bodyIds: readonly string[]): string {
  const ids = sanitize(bodyIds);
  if (ids.length === 0) {
    return '';
  }
  return `${COMPARE_BODIES_PARAM}=${ids.map(encodeURIComponent).join(',')}`;
}
