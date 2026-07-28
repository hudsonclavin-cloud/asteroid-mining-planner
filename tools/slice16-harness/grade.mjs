#!/usr/bin/env node
// Slice 16 harness — grading CLI.
// MARKER: S16-MCPLIVE-2026-07-27-A
//
// Reads a run ledger, grades every row with the SCENARIO'S ID SUPPLIED, and
// writes a grades artifact next to the ledger.
//
// WHY THIS EXISTS — the A3 landmine:
// Amendment A3 grades VF on each scenario's declared quantity slot, and slot
// grading engages ONLY when gradeDecision receives a scenarioId. Called without
// one it silently falls back to the pre-A3, values_used-only definition — the
// one that was publicly amended because it scored prose fabrications as
// faithful. A grading path that could quietly take that fallback would produce
// numbers under a definition the pre-registration has already repudiated.
//
// So this CLI is FAIL-CLOSED. It refuses the entire grading run — nonzero exit,
// nothing written — if ANY row cannot be graded under the amended definition.
// There is no partial mode, no --force, and no fallback. Refusing to grade is
// always recoverable; publishing grades computed under a repudiated definition
// is not.
//
// Usage:
//   node grade.mjs <ledger.jsonl> [--out <grades.json>]
//   node grade.mjs --self-test          # offline consistency check, no ledger

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

import { MARKER as HARNESS_MARKER, ROSTER, STATS } from './config.mjs';
import { SCENARIO_SLOTS, gradeDecision, summarize } from './grader.mjs';

export const MARKER = 'S16-MCPLIVE-2026-07-27-A';

/** Scenarios whose outcome is a 3-bin distribution, not a binary FULL. */
const NON_BINARY_SCENARIOS = new Set(['S-30']);

export class LedgerRefusedError extends Error {
  constructor(message, problems) {
    super(message);
    this.name = 'LedgerRefusedError';
    this.problems = problems;
  }
}

// ---------------------------------------------------------------------------
// Ledger reading
// ---------------------------------------------------------------------------

export function readLedger(path) {
  const text = readFileSync(path, 'utf8');
  const rows = [];
  text.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === '') return;
    try {
      rows.push({ ...JSON.parse(trimmed), _line: index + 1 });
    } catch {
      rows.push({ _line: index + 1, _unparseable: trimmed.slice(0, 120) });
    }
  });
  return rows;
}

/**
 * A row is gradable only if we can name its scenario AND recover the evidence it
 * was supposed to be faithful to. Both are hard requirements.
 */
export function auditRow(row) {
  const problems = [];

  const scenarioId = row.scenario ?? row.scenarioId ?? null;
  if (row._unparseable !== undefined) {
    problems.push('row is not valid JSON');
    return { scenarioId: null, decisions: [], problems };
  }
  if (!scenarioId) {
    problems.push('no scenario id on the row (fields tried: scenario, scenarioId)');
  } else if (!Object.prototype.hasOwnProperty.call(SCENARIO_SLOTS, scenarioId)) {
    problems.push(`scenario "${scenarioId}" has no slot declaration — it is struck, or the slot table is stale`);
  }

  // Evidence: either an explicit decisions[] or a single envelope on the row.
  let decisions = [];
  if (Array.isArray(row.decisions) && row.decisions.length > 0) {
    decisions = row.decisions.map((d) => ({ envelope: d.envelope ?? d, tool: d.tool ?? d.envelope?.tool ?? null }));
  } else if (row.envelope && typeof row.envelope === 'object') {
    decisions = [{ envelope: row.envelope, tool: row.envelope.tool ?? row.expectedTool ?? null }];
  }

  if (decisions.length === 0) {
    problems.push(
      'no envelope on the row — the run recorded no tool evidence, so there is nothing to grade faithfulness against'
    );
  } else {
    decisions.forEach((d, i) => {
      const e = d.envelope;
      if (!e || typeof e !== 'object') problems.push(`decision[${i}] envelope is not an object`);
      else if (e.envelope_version === undefined) problems.push(`decision[${i}] is not an EvidenceEnvelope (no envelope_version)`);
    });
  }

  if (row.error) problems.push(`run errored: ${String(row.error).slice(0, 120)}`);
  if (row.answerBlock === null || row.answerBlock === undefined) {
    // Not fatal: a missing block is itself a contract violation the grader
    // scores as 0. It must reach the grader, not be filtered out here.
  }

  return { scenarioId, decisions, problems };
}

// ---------------------------------------------------------------------------
// Statistics (DEC-16-8). Deterministic throughout — same input, same numbers.
// ---------------------------------------------------------------------------

/** mulberry32: tiny seeded PRNG so the bootstrap is byte-reproducible. */
function makeRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BOOTSTRAP_SEED = 20260727;

/**
 * Scenario-clustered bootstrap: resample SCENARIOS with replacement (never
 * individual runs — runs within a scenario are not independent), recompute the
 * mean run-level rate, take percentile bounds.
 */
export function clusterBootstrapCI(byScenario, { resamples = STATS.bootstrapResamples, seed = BOOTSTRAP_SEED, alpha = 0.05 } = {}) {
  const clusters = Object.values(byScenario).filter((c) => c.runs.length > 0);
  if (clusters.length === 0) return { low: null, high: null, resamples: 0 };
  const rng = makeRng(seed);
  const means = [];
  for (let b = 0; b < resamples; b += 1) {
    let hit = 0;
    let total = 0;
    for (let i = 0; i < clusters.length; i += 1) {
      const c = clusters[Math.floor(rng() * clusters.length)];
      hit += c.runs.filter((r) => r === 1).length;
      total += c.runs.length;
    }
    means.push(total === 0 ? 0 : hit / total);
  }
  means.sort((x, y) => x - y);
  const lo = means[Math.floor((alpha / 2) * means.length)];
  const hi = means[Math.min(means.length - 1, Math.floor((1 - alpha / 2) * means.length))];
  return { low: lo, high: hi, resamples };
}

/** Unbiased pass^k over a scenario with c faithful runs of n: C(c,k)/C(n,k). */
export function passAtK(c, n, k) {
  if (n < k) return null;
  if (c < k) return 0;
  let num = 1;
  let den = 1;
  for (let i = 0; i < k; i += 1) {
    num *= c - i;
    den *= n - i;
  }
  return num / den;
}

// ---------------------------------------------------------------------------
// Grading
// ---------------------------------------------------------------------------

export function gradeLedger(rows) {
  // --- fail-closed audit: every row, before anything is graded --------------
  const blocking = [];
  const audited = rows.map((row) => {
    const a = auditRow(row);
    if (a.problems.length > 0) {
      blocking.push({ line: row._line, runKey: row.runKey ?? null, scenario: a.scenarioId, problems: a.problems });
    }
    return { row, ...a };
  });

  if (blocking.length > 0) {
    const shown = blocking.slice(0, 10)
      .map((b) => `  line ${b.line} [${b.runKey ?? 'no runKey'}]: ${b.problems.join('; ')}`)
      .join('\n');
    throw new LedgerRefusedError(
      `GRADING REFUSED: ${blocking.length} of ${rows.length} ledger rows cannot be graded under the ` +
      `amended VF definition (Amendment A3).\n${shown}` +
      (blocking.length > 10 ? `\n  ... and ${blocking.length - 10} more` : '') +
      '\n\nNo grades were written. This CLI has no partial mode and no fallback: grading a row without a ' +
      'scenarioId would silently apply the pre-A3, values_used-only definition that the pre-registration ' +
      'has publicly repudiated, and grading a row without an envelope would score an answer against no evidence.',
      blocking
    );
  }

  // --- grade -----------------------------------------------------------------
  const graded = audited.map(({ row, scenarioId, decisions }) => {
    const perDecision = decisions.map((d) =>
      gradeDecision({ envelope: d.envelope, block: row.answerBlock, tool: d.tool, scenarioId })
    );
    const fulls = perDecision.map((g) => g.FULL).filter((f) => f !== null);
    const FULL = fulls.length === 0 ? null : (fulls.every((f) => f === 1) ? 1 : 0);
    const slotModes = perDecision.map((g) => g.VF?.slotMode ?? null);
    return {
      runKey: row.runKey,
      arm: row.arm ?? 'primary',
      model: row.model,
      lab: row.lab,
      tier: row.tier,
      scenario: scenarioId,
      rq: row.rq ?? null,
      form: row.form,
      rep: row.rep,
      slotModes,
      decisions: perDecision,
      dimensions: summarize(perDecision),
      FULL
    };
  });

  return { graded, aggregates: aggregate(graded) };
}

function aggregate(graded) {
  // Primary metrics use the primary arm only; control rows are reported apart
  // (A1 §10.2). S-30 is excluded from the binary rate (DEC-16-9 scope note).
  const primary = graded.filter((g) => g.arm === 'primary' && !NON_BINARY_SCENARIOS.has(g.scenario));
  const control = graded.filter((g) => g.arm === 'control');

  const byModel = {};
  for (const model of ROSTER) byModel[model.id] = { runs: 0, faithful: 0, byScenario: {} };
  byModel['(unknown)'] = { runs: 0, faithful: 0, byScenario: {} };

  for (const g of primary) {
    if (g.FULL === null) continue;
    const bucket = byModel[g.model] ?? byModel['(unknown)'];
    bucket.runs += 1;
    bucket.faithful += g.FULL;
    (bucket.byScenario[g.scenario] ??= { runs: [] }).runs.push(g.FULL);
  }

  const perModel = {};
  for (const [modelId, bucket] of Object.entries(byModel)) {
    if (bucket.runs === 0) continue;
    const scenarios = Object.values(bucket.byScenario);
    const strictPass = scenarios.filter((s) => s.runs.every((r) => r === 1)).length / scenarios.length;
    const passK = scenarios
      .map((s) => passAtK(s.runs.filter((r) => r === 1).length, s.runs.length, STATS.secondaryPassK))
      .filter((v) => v !== null);
    perModel[modelId] = {
      runs: bucket.runs,
      scenarios: scenarios.length,
      // PRIMARY OUTCOME (DEC-16-8): mean run-level full-faithfulness rate.
      meanRunLevelFullFaithfulness: bucket.faithful / bucket.runs,
      clusteredCI95: clusterBootstrapCI(bucket.byScenario),
      // SECONDARY.
      strictScenarioPassRate: strictPass,
      [`faithfulnessPassAt${STATS.secondaryPassK}`]: passK.length === 0 ? null : passK.reduce((a, b) => a + b, 0) / passK.length
    };
  }

  const controlByModel = {};
  for (const g of control) {
    if (g.FULL === null) continue;
    const b = (controlByModel[g.model] ??= { runs: 0, faithful: 0 });
    b.runs += 1;
    b.faithful += g.FULL;
  }
  for (const [k, v] of Object.entries(controlByModel)) v.meanRunLevelFullFaithfulness = v.faithful / v.runs;

  const threeBin = {};
  for (const g of graded.filter((x) => NON_BINARY_SCENARIOS.has(x.scenario))) {
    (threeBin[g.scenario] ??= []).push({ model: g.model, form: g.form, rep: g.rep, FULL: g.FULL });
  }

  return {
    primaryArm: perModel,
    controlArm: controlByModel,
    nonBinaryScenarios: threeBin,
    notes: [
      'Primary outcome is the mean run-level full-faithfulness rate; CIs are scenario-clustered bootstrap (DEC-16-8).',
      'Bootstrap is seeded and therefore reproducible byte-for-byte.',
      'Control-arm rows are reported separately and excluded from primary metrics (A1 §10.2).',
      `${[...NON_BINARY_SCENARIOS].join(', ')} yields a 3-bin outcome and is excluded from the binary rate (DEC-16-9).`,
      'No Holm correction is applied here: the three pre-specified contrasts are computed at write-up time, not per-ledger.'
    ]
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--self-test')) return selfTest();

  const ledgerPath = argv.find((a) => !a.startsWith('--'));
  if (!ledgerPath) {
    console.error('usage: node grade.mjs <ledger.jsonl> [--out <grades.json>]');
    return 2;
  }
  const resolved = resolve(ledgerPath);
  if (!existsSync(resolved)) {
    console.error(`ledger not found: ${resolved}`);
    return 2;
  }

  const outIndex = argv.indexOf('--out');
  const outPath = outIndex !== -1 && argv[outIndex + 1]
    ? resolve(argv[outIndex + 1])
    : resolve(dirname(resolved), `${basename(resolved, '.jsonl')}-grades.json`);

  const rows = readLedger(resolved);
  console.log(`ledger: ${resolved} (${rows.length} rows)`);

  let result;
  try {
    result = gradeLedger(rows);
  } catch (error) {
    if (error instanceof LedgerRefusedError) {
      console.error(`\n${error.message}\n`);
      return 3;
    }
    throw error;
  }

  const artifact = {
    marker: MARKER,
    harnessMarker: HARNESS_MARKER,
    gradedAt: new Date().toISOString(),
    ledger: resolved,
    ledgerRows: rows.length,
    vfDefinition: 'Amendment A3 — slot-graded wherever asserted (values_used OR prose)',
    bootstrapSeed: BOOTSTRAP_SEED,
    aggregates: result.aggregates,
    runs: result.graded
  };
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

  const slotGraded = result.graded.filter((g) => g.slotModes.includes('slot-graded')).length;
  console.log(`graded ${result.graded.length} runs — ${slotGraded} slot-graded (A3 active)`);
  for (const [modelId, m] of Object.entries(result.aggregates.primaryArm)) {
    console.log(
      `  ${modelId.padEnd(28)} FULL ${(m.meanRunLevelFullFaithfulness * 100).toFixed(1)}%  ` +
      `CI95 [${(m.clusteredCI95.low * 100).toFixed(1)}, ${(m.clusteredCI95.high * 100).toFixed(1)}]  ` +
      `strict ${(m.strictScenarioPassRate * 100).toFixed(1)}%`
    );
  }
  console.log(`grades: ${outPath}`);
  return 0;
}

function selfTest() {
  console.log(`grade.mjs self-test — ${MARKER}`);
  console.log(`  slot table covers ${Object.keys(SCENARIO_SLOTS).length} scenarios`);
  console.log(`  bootstrap seed ${BOOTSTRAP_SEED}, ${STATS.bootstrapResamples} resamples, cluster unit "${STATS.clusterUnit}"`);
  console.log(`  passAtK(10,10,3) = ${passAtK(10, 10, 3)}  passAtK(5,10,3) = ${passAtK(5, 10, 3).toFixed(6)}`);
  console.log('  fail-closed: a row without scenarioId or without an envelope refuses the whole run.');
  return 0;
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  main().then((code) => { process.exitCode = code; }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
