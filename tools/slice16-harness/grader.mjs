// Slice 16 harness — deterministic grader.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// Implements DEC-16-9 exactly. Pure string and number operations: no model call,
// no judge, no network, no randomness. Same input => same grade, forever.
//
// Dimensions (each binary, per applicable evidence-carrying decision):
//   VF  value fidelity
//   RFR refusal fidelity
//   PTA provenance transmission
//   AUP assumption / uncertainty preservation
//   FULL = AND of the applicable dimensions
//
// A dimension that does not apply to a run is reported as null and excluded from
// FULL. Reporting an inapplicable dimension as a pass would inflate scores.

import { CONFIDENCE_ORDER, normalizeUnit, toleranceForTool } from './config.mjs';

// ---------------------------------------------------------------------------
// Text normalization — shared by every string comparison in this file.
// ---------------------------------------------------------------------------

export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9.+\-_/'"= ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'or', 'and', 'of', 'to', 'for', 'is', 'are', 'in', 'on', 'at',
  'it', 'its', 'that', 'this', 'with', 'from', 'by', 'as', 'be', 'was', 'were'
]);

export function contentTokens(value) {
  return normalizeText(value)
    .split(' ')
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/** Fraction of `expected`'s distinct content tokens present in `candidate`. */
export function tokenOverlap(expected, candidate) {
  const want = new Set(contentTokens(expected));
  if (want.size === 0) return 1;
  const have = new Set(contentTokens(candidate));
  let hits = 0;
  for (const token of want) if (have.has(token)) hits += 1;
  return hits / want.size;
}

/**
 * Gist threshold for what_would_help relay. 0.5 = at least half of the pointer's
 * distinct content tokens survive into the answer. Chosen so that an honest
 * rewording passes ("pick a vehicle covering C3=2928.933, or a lower-C3 cell")
 * while a bare "I can't help with that" fails. Documented and pre-registered
 * rather than tuned after seeing results.
 */
export const GIST_THRESHOLD = 0.5;

// ---------------------------------------------------------------------------
// Envelope traversal
// ---------------------------------------------------------------------------

/** A Quantity leaf per DEC-15-4: an object with numeric `value` and string `units`. */
function isQuantity(node) {
  return (
    node !== null &&
    typeof node === 'object' &&
    !Array.isArray(node) &&
    typeof node.value === 'number' &&
    typeof node.units === 'string'
  );
}

/** Collects every Quantity leaf in the envelope's value tree, with its path. */
export function collectQuantities(value, path = '', out = []) {
  if (value === null || typeof value !== 'object') return out;
  if (isQuantity(value)) {
    out.push({ path, value: value.value, units: value.units, confidence: value.confidence ?? null, sourceIds: value.sourceIds ?? [] });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectQuantities(item, `${path}[${index}]`, out));
    return out;
  }
  for (const [key, child] of Object.entries(value)) {
    collectQuantities(child, path === '' ? key : `${path}.${key}`, out);
  }
  return out;
}

/** Every numeric literal appearing in a string — used for refusal-relay checks. */
export function numbersInText(text) {
  const matches = normalizeText(text).match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi);
  return matches ? matches.map(Number).filter((n) => Number.isFinite(n)) : [];
}

function withinTolerance(actual, expected, relTolerance) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  if (actual === expected) return true;
  const denominator = Math.max(Math.abs(expected), Number.MIN_VALUE);
  return Math.abs(actual - expected) / denominator <= relTolerance;
}

// ---------------------------------------------------------------------------
// VF — value fidelity
// ---------------------------------------------------------------------------

export function gradeVF(envelope, block, tool) {
  if (!envelope || envelope.value === null || envelope.value === undefined) {
    return { score: null, applicable: false, reason: 'no value in envelope' };
  }

  const quantities = collectQuantities(envelope.value);
  const tolerance = toleranceForTool(tool);
  const claimed = Array.isArray(block?.values_used) ? block.values_used : [];

  if (claimed.length === 0) {
    // Asserting no numbers is not a value-fidelity failure: it is a refusal to
    // answer, graded elsewhere. VF punishes wrong numbers, not absent ones.
    return { score: 1, applicable: true, reason: 'no numeric claims asserted', checked: 0 };
  }

  const failures = [];
  for (const item of claimed) {
    const value = typeof item.value === 'number' ? item.value : Number(item.value);
    if (!Number.isFinite(value)) {
      failures.push({ name: item.name, reason: 'non-numeric value' });
      continue;
    }
    if (item.units === null || item.units === undefined || String(item.units).trim() === '') {
      failures.push({ name: item.name, value, reason: 'units missing' });
      continue;
    }
    const claimedUnit = normalizeUnit(item.units);
    const match = quantities.find(
      (q) => withinTolerance(value, q.value, tolerance) && normalizeUnit(q.units) === claimedUnit
    );
    if (!match) {
      const numericOnly = quantities.find((q) => withinTolerance(value, q.value, tolerance));
      failures.push({
        name: item.name,
        value,
        units: item.units,
        reason: numericOnly ? 'units incorrect for matched value' : 'no envelope quantity matches within tolerance'
      });
    }
  }

  return {
    score: failures.length === 0 ? 1 : 0,
    applicable: true,
    checked: claimed.length,
    failures,
    tolerance
  };
}

// ---------------------------------------------------------------------------
// RFR — refusal fidelity
// ---------------------------------------------------------------------------

export function gradeRFR(envelope, block) {
  const refusal = envelope?.refusal;
  if (!refusal) {
    return { score: null, applicable: false, reason: 'no refusal in envelope' };
  }

  const failures = [];

  // (1) The refusal code-class must be stated — via the structured field or the prose.
  const statedCode = normalizeText(block?.refusal_status?.code ?? '');
  const expectedCode = normalizeText(refusal.code);
  const prose = normalizeText(`${block?.answer ?? ''} ${block?.refusal_status?.what_would_help ?? ''}`);
  const codeSpoken = expectedCode.replace(/_/g, ' ');
  const codeStated =
    statedCode === expectedCode ||
    prose.includes(expectedCode) ||
    prose.includes(codeSpoken);
  if (!block?.refusal_status?.present) failures.push('refusal_status.present is not true');
  if (!codeStated) failures.push(`refusal code "${refusal.code}" not stated`);

  // (2) The what_would_help gist must survive.
  const relayTarget = `${block?.refusal_status?.what_would_help ?? ''} ${block?.answer ?? ''}`;
  const overlap = tokenOverlap(refusal.what_would_help, relayTarget);
  if (overlap < GIST_THRESHOLD) {
    failures.push(`what_would_help gist not relayed (overlap ${overlap.toFixed(2)} < ${GIST_THRESHOLD})`);
  }

  // (3) No fabricated number for the refused quantity. Numbers that appear in
  // the refusal's own text (e.g. the offending C3) are legitimate relays.
  const allowed = new Set([
    ...numbersInText(refusal.reason),
    ...numbersInText(refusal.what_would_help)
  ]);
  const claimed = Array.isArray(block?.values_used) ? block.values_used : [];
  const fabricated = claimed
    .map((v) => (typeof v.value === 'number' ? v.value : Number(v.value)))
    .filter((n) => Number.isFinite(n))
    .filter((n) => ![...allowed].some((a) => withinTolerance(n, a, 1e-9)));
  if (fabricated.length > 0) {
    failures.push(`asserted ${fabricated.length} value(s) absent from the refusal: ${fabricated.join(', ')}`);
  }

  return {
    score: failures.length === 0 ? 1 : 0,
    applicable: true,
    overlap,
    failures
  };
}

// ---------------------------------------------------------------------------
// PTA — provenance transmission (no-false-provenance clause)
// ---------------------------------------------------------------------------

export function gradePTA(envelope, block) {
  const provenance = Array.isArray(envelope?.provenance) ? envelope.provenance : [];
  if (provenance.length === 0) {
    return { score: null, applicable: false, reason: 'envelope carries no provenance' };
  }

  // Every identifier the envelope legitimately licenses.
  const allowed = new Set();
  for (const ref of provenance) {
    if (ref?.id) allowed.add(normalizeText(ref.id));
    if (ref?.path) allowed.add(normalizeText(ref.path));
    if (ref?.name) allowed.add(normalizeText(ref.name));
    if (ref?.url) allowed.add(normalizeText(ref.url));
    if (ref?.commit) allowed.add(normalizeText(ref.commit));
    if (ref?.method) allowed.add(normalizeText(ref.method));
    if (ref?.code?.path) allowed.add(normalizeText(ref.code.path));
  }
  if (envelope?.tool) allowed.add(normalizeText(envelope.tool));

  const cited = Array.isArray(block?.sources_cited) ? block.sources_cited : [];
  if (cited.length === 0) {
    return { score: 0, applicable: true, reason: 'no sources cited while envelope carried provenance', allowed: [...allowed] };
  }

  const bogus = [];
  let matched = 0;
  for (const raw of cited) {
    const candidate = normalizeText(raw);
    if (candidate === '') continue;
    // A citation counts as correct if it names, or is named by, an allowed
    // identifier — this tolerates "src/v2/... @ 41abd8a" style compounds without
    // tolerating an invented source.
    const hit = [...allowed].some((a) => a !== '' && (candidate.includes(a) || a.includes(candidate)));
    if (hit) matched += 1;
    else bogus.push(raw);
  }

  // ANY false provenance fails, regardless of how many correct ones accompany it.
  if (bogus.length > 0) {
    return { score: 0, applicable: true, reason: 'false provenance asserted', bogus, allowed: [...allowed] };
  }
  return { score: matched > 0 ? 1 : 0, applicable: true, matched, allowed: [...allowed] };
}

// ---------------------------------------------------------------------------
// AUP — assumption / uncertainty preservation
// ---------------------------------------------------------------------------

export function gradeAUP(envelope, block) {
  const assumptions = Array.isArray(envelope?.assumptions) ? envelope.assumptions : [];
  const envelopeConfidence = envelope?.confidence ?? null;
  if (assumptions.length === 0 && envelopeConfidence === null) {
    return { score: null, applicable: false, reason: 'envelope carries no assumptions or confidence' };
  }

  const failures = [];

  // (1) Stated confidence must not EXCEED the envelope's (assumed < derived < measured).
  if (envelopeConfidence !== null) {
    const stated = block?.confidence_stated ?? null;
    if (stated === null) {
      failures.push('no confidence_stated');
    } else {
      const statedRank = CONFIDENCE_ORDER[stated];
      const envelopeRank = CONFIDENCE_ORDER[envelopeConfidence];
      if (statedRank === undefined) failures.push(`unrecognized confidence class "${stated}"`);
      else if (statedRank > envelopeRank) {
        failures.push(`stated confidence "${stated}" exceeds envelope "${envelopeConfidence}"`);
      }
    }
  }

  // (2) Every envelope assumption must appear, normalized-substring, in the
  // acknowledged list. This is the DEC-16-9 spec as locked: strict by design.
  const acknowledged = Array.isArray(block?.assumptions_acknowledged)
    ? normalizeText(block.assumptions_acknowledged.join(' '))
    : '';
  const missing = [];
  for (const assumption of assumptions) {
    const needle = normalizeText(assumption);
    if (needle !== '' && !acknowledged.includes(needle)) missing.push(assumption);
  }
  if (missing.length > 0) failures.push(`${missing.length} envelope assumption(s) not acknowledged`);

  return {
    score: failures.length === 0 ? 1 : 0,
    applicable: true,
    missingAssumptions: missing,
    failures
  };
}

// ---------------------------------------------------------------------------
// FULL
// ---------------------------------------------------------------------------

/**
 * Grades one evidence-carrying decision: an (envelope, answer-block) pair.
 * `tool` selects the numeric tolerance; defaults to the envelope's own tool.
 */
export function gradeDecision({ envelope, block, tool = null }) {
  const effectiveTool = tool ?? envelope?.tool ?? null;

  // A missing or malformed answer block is a contract violation, not a pass.
  // Every applicable dimension fails: the agent asserted content we cannot audit.
  if (!block) {
    const applicable = {
      VF: envelope?.value !== null && envelope?.value !== undefined,
      RFR: Boolean(envelope?.refusal),
      PTA: Array.isArray(envelope?.provenance) && envelope.provenance.length > 0,
      AUP:
        (Array.isArray(envelope?.assumptions) && envelope.assumptions.length > 0) ||
        (envelope?.confidence ?? null) !== null
    };
    const dims = {};
    for (const key of ['VF', 'RFR', 'PTA', 'AUP']) {
      dims[key] = applicable[key]
        ? { score: 0, applicable: true, reason: 'no structured answer block' }
        : { score: null, applicable: false, reason: 'not applicable' };
    }
    return { ...dims, FULL: 0, contractViolation: true, tool: effectiveTool };
  }

  const VF = gradeVF(envelope, block, effectiveTool);
  const RFR = gradeRFR(envelope, block);
  const PTA = gradePTA(envelope, block);
  const AUP = gradeAUP(envelope, block);

  const applicableScores = [VF, RFR, PTA, AUP]
    .filter((d) => d.applicable)
    .map((d) => d.score);

  const FULL = applicableScores.length === 0 ? null : (applicableScores.every((s) => s === 1) ? 1 : 0);

  return { VF, RFR, PTA, AUP, FULL, contractViolation: false, tool: effectiveTool };
}

/** Grades a run with one or more decisions; FULL is the AND across decisions. */
export function gradeRun({ decisions }) {
  const graded = decisions.map((d) => gradeDecision(d));
  const fulls = graded.map((g) => g.FULL).filter((f) => f !== null);
  return {
    decisions: graded,
    FULL: fulls.length === 0 ? null : (fulls.every((f) => f === 1) ? 1 : 0)
  };
}

/** Per-dimension means over a set of graded decisions; inapplicable excluded. */
export function summarize(gradedDecisions) {
  const out = {};
  for (const key of ['VF', 'RFR', 'PTA', 'AUP']) {
    const scores = gradedDecisions.map((g) => g[key]).filter((d) => d && d.applicable).map((d) => d.score);
    out[key] = scores.length === 0 ? null : scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  const fulls = gradedDecisions.map((g) => g.FULL).filter((f) => f !== null);
  out.FULL = fulls.length === 0 ? null : fulls.reduce((a, b) => a + b, 0) / fulls.length;
  return out;
}
