#!/usr/bin/env node
// XR3 — fold the M = 1 shard rows (scratch) into the committed evidence and REPORT.md. Safe to run
// mid-flight: it reports "PARTIAL: n of 41,906". Every number in REPORT.md comes from the summary object.
//
//   LONGRUN_SCRATCH=<scratch> node summarize.mjs
//
// The comparison is PAIRED: for each window type, the M = 0 numbers and the M = 0 + M = 1 numbers are
// computed over exactly the same bodies (those with an M = 0 value), and the M = 0 values are also
// checked against LR2's committed rows for the same bodies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { quantile, repoRoot, scratchRoot, sha256File } from '../../longrun/lib/common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(scratchRoot, 'xr3');
const LABEL = 'LEADS-grade research evidence. Not validated. Nothing here enters a DEC, a test, a fixture or the site.';
const cps = fs.readdirSync(dir).filter((f) => /^xr3-checkpoint-\d+of\d+\.json$/.test(f)).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
if (!cps.length) throw new Error('no XR3 checkpoints found');
const OF = cps[0].of;
const shardRows = new Map();
for (const cp of cps) {
  const rows = [];
  for (const line of fs.readFileSync(path.join(dir, `xr3-rows-${cp.shard}of${cp.of}.ndjson`), 'utf8').split('\n')) { if (!line) continue; try { rows.push(JSON.parse(line)); } catch { /* line being written */ } }
  shardRows.set(cp.shard, rows);
}
const all = [...shardRows.values()].flat();
const CATALOG = 41906;
const shardTotal = cps.reduce((a, c) => a + c.total, 0);
const complete = cps.length === OF && cps.every((c) => c.state === 'complete') && all.length === CATALOG;

// LR2's committed rows, for the M = 0 equality check
const lr2Dir = path.join(repoRoot, 'tools/slice20-research/longrun/lr2-symmetric');
const lr2 = new Map();
for (const f of fs.readdirSync(lr2Dir).filter((x) => /^lr2-symmetric-\d+of\d+\.json$/.test(x))) {
  const shard = JSON.parse(fs.readFileSync(path.join(lr2Dir, f), 'utf8'));
  const col = Object.fromEntries(shard.columns.map((c, i) => [c, i]));
  for (const r of shard.rows) lr2.set(r[col.des], { status: r[col.status], err: r[col.errorKmS], computed: r[col.computedKmS], assumed: r[col.assumedKmS], sErr: r[col.secErrorKmS], sComputed: r[col.secComputedKmS], refused: r[col.retRefused] });
}
const r6 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : x ?? null);
const lr2Check = { compared: 0, primaryErrorEqual: 0, primaryComputedEqual: 0, secondaryErrorEqual: 0, statusEqual: 0, mismatches: [] };
for (const r of all) {
  const y = lr2.get(r.des);
  if (!y) continue;
  lr2Check.compared += 1;
  const st = r.status === 'm1-only' ? 'no-return-convergence' : r.status; // LR2 had no M = 1; an m1-only body was 'no-return-convergence' there
  const okStatus = st === y.status;
  const okErr = r6(r.err) === (y.err ?? null);
  const okComp = r6(r.ret?.computed) === (y.computed ?? null);
  const okSec = r6(r.sErr) === (y.sErr ?? null);
  if (okStatus) lr2Check.statusEqual += 1;
  if (okErr) lr2Check.primaryErrorEqual += 1;
  if (okComp) lr2Check.primaryComputedEqual += 1;
  if (okSec) lr2Check.secondaryErrorEqual += 1;
  if (!(okStatus && okErr && okComp && okSec) && lr2Check.mismatches.length < 25) lr2Check.mismatches.push({ des: r.des, status: [r.status, y.status], err: [r6(r.err), y.err], computed: [r6(r.ret?.computed), y.computed], sErr: [r6(r.sErr), y.sErr] });
}

function dist(values) {
  if (!values.length) return { n: 0 };
  const abs = values.map(Math.abs).sort((a, b) => a - b);
  const signed = values.slice().sort((a, b) => a - b);
  return {
    n: values.length, medianAbs: quantile(abs, 0.5), p10Abs: quantile(abs, 0.1), p90Abs: quantile(abs, 0.9), p99Abs: quantile(abs, 0.99), maxAbs: abs[abs.length - 1],
    p50Signed: quantile(signed, 0.5), overchargeShare: values.filter((v) => v > 0).length / values.length, underchargeShare: values.filter((v) => v < 0).length / values.length,
    withinInterimRange: values.filter((v) => Math.abs(v) >= 0.08 && Math.abs(v) <= 5.1).length / values.length,
    belowInterimRange: values.filter((v) => Math.abs(v) < 0.08).length / values.length,
    aboveInterimRange: values.filter((v) => Math.abs(v) > 5.1).length / values.length,
  };
}
function measure(label, errM0Of, errBestOf, retOf, errValidOf) {
  const paired = all.filter((r) => typeof errM0Of(r) === 'number' && typeof errBestOf(r) === 'number');
  const block = (list) => {
    const wins = list.filter((r) => retOf(r).m1Wins === 1);
    const gain = wins.map((r) => retOf(r).computed - retOf(r).best.v).sort((a, b) => a - b);
    const relGain = wins.map((r) => (retOf(r).computed - retOf(r).best.v) / retOf(r).computed).sort((a, b) => a - b);
    const flips = list.filter((r) => Math.sign(errM0Of(r)) !== Math.sign(errBestOf(r)));
    return {
      bodies: list.length,
      m0: dist(list.map(errM0Of)),
      m0PlusM1: dist(list.map(errBestOf)),
      m1IsTheMinimum: { bodies: wins.length, share: list.length ? wins.length / list.length : null, leftBranch: wins.filter((r) => retOf(r).best.branch === 'left').length, rightBranch: wins.filter((r) => retOf(r).best.branch === 'right').length },
      gainWhenM1WinsKmS: gain.length ? { n: gain.length, median: quantile(gain, 0.5), p90: quantile(gain, 0.9), p99: quantile(gain, 0.99), max: gain[gain.length - 1], medianRelative: quantile(relGain, 0.5) } : { n: 0 },
      errorSignChanges: { bodies: flips.length, underchargeToOvercharge: flips.filter((r) => errM0Of(r) < 0 && errBestOf(r) > 0).length },
      medianComputedM0: quantile(list.map((r) => retOf(r).computed).sort((a, b) => a - b), 0.5),
      medianComputedBest: quantile(list.map((r) => retOf(r).best.v).sort((a, b) => a - b), 0.5),
      // beyond the dispatch: LR1's through-Sun flag on the chosen cells, and the minimum over unflagged cells
      flaggedMinima: {
        m0MinimumFlagged: list.filter((r) => retOf(r).computedFlagged === 1).length,
        m1MinimumFlagged: list.filter((r) => retOf(r).m1 && retOf(r).m1.flagged === 1).length,
        overallMinimumFlagged: list.filter((r) => retOf(r).best.flagged === 1).length,
        overallMinimumFlaggedAndM1: list.filter((r) => retOf(r).best.flagged === 1 && retOf(r).best.M === 1).length,
        m1WinsOnlyBecauseOfAFlaggedArc: list.filter((r) => retOf(r).m1Wins === 1 && retOf(r).m1WinsValid !== 1).length,
      },
      m0PlusM1Unflagged: dist(list.filter((r) => typeof errValidOf(r) === 'number').map(errValidOf)),
      m1IsTheMinimumUnflagged: { bodies: list.filter((r) => retOf(r).m1WinsValid === 1).length, share: list.length ? list.filter((r) => retOf(r).m1WinsValid === 1).length / list.length : null },
      minimumChangedByExcludingFlagged: (() => {
        const ch = list.filter((r) => retOf(r).bestValid && retOf(r).bestValid.v !== retOf(r).best.v).map((r) => retOf(r).bestValid.v - retOf(r).best.v).sort((a, b) => a - b);
        return ch.length ? { bodies: ch.length, medianIncreaseKmS: quantile(ch, 0.5), maxIncreaseKmS: ch[ch.length - 1] } : { bodies: 0 };
      })(),
      noUnflaggedCell: list.filter((r) => !retOf(r).bestValid).length,
      flaggedMinimumBodies: list.filter((r) => retOf(r).best.flagged === 1 || retOf(r).computedFlagged === 1).map((r) => ({
        des: r.des, tier: r.tier, cls: r.cls, best: r6(retOf(r).best.v), bestM: retOf(r).best.M, perihelionAu: Number((retOf(r).best.qKm / 149597870.7).toPrecision(3)),
        eccentricity: Number(retOf(r).best.ecc.toPrecision(7)), retDepJdTdb: r6(retOf(r).best.dep), retTofDays: r6(retOf(r).best.tof),
        bestUnflagged: retOf(r).bestValid ? r6(retOf(r).bestValid.v) : null, refusedCells: retOf(r).refused, admissibleCells: retOf(r).cells - retOf(r).refused,
      })),
    };
  };
  const by = (keyOf) => Object.fromEntries([...new Set(paired.map(keyOf))].sort().map((k) => [k, block(paired.filter((r) => keyOf(r) === k))]));
  const m1Only = all.filter((r) => retOf(r) && retOf(r).status === 'm1-only');
  return {
    label,
    all: block(paired),
    completeWindows: block(paired.filter((r) => retOf(r).refused === 0)),
    truncatedWindows: block(paired.filter((r) => retOf(r).refused > 0)),
    byTier: by((r) => r.tier),
    m1OnlyBodies: m1Only.map((r) => r.des),
    returnCells: {
      m0Converged: all.reduce((a, r) => a + (retOf(r)?.ok ?? 0), 0),
      m1CellsWithAConvergedBranch: all.reduce((a, r) => a + (retOf(r)?.m1Ok ?? 0), 0),
      m1CellsWithout: all.reduce((a, r) => a + (retOf(r)?.m1NoSolution ?? 0), 0),
      refused: all.reduce((a, r) => a + (retOf(r)?.refused ?? 0), 0),
    },
    largestGains: paired.filter((r) => retOf(r).m1Wins === 1).sort((a, b) => (retOf(b).computed - retOf(b).best.v) - (retOf(a).computed - retOf(a).best.v)).slice(0, 10)
      .map((r) => ({ des: r.des, tier: r.tier, cls: r.cls, computedM0: r6(retOf(r).computed), best: r6(retOf(r).best.v), branch: retOf(r).best.branch, gain: r6(retOf(r).computed - retOf(r).best.v), errorM0: r6(errM0Of(r)), errorBest: r6(errBestOf(r)), refused: retOf(r).refused })),
  };
}
const primary = measure('PRIMARY - compare path best practical window', (r) => r.err, (r) => r.errBest, (r) => r.ret, (r) => r.errBestValid);
const secondary = measure('SECONDARY - best sample-return stack cell (beyond the original LR2 dispatch)', (r) => r.sErr, (r) => r.sErrBest, (r) => r.sRet, (r) => r.sErrBestValid);

const COLS = [
  ['des', (r) => r.des], ['tier', (r) => r.tier], ['cls', (r) => r.cls], ['status', (r) => r.status],
  ['assumedKmS', (r) => r6(r.assumed)], ['computedM0KmS', (r) => r6(r.ret?.computed)], ['minM1KmS', (r) => r6(r.ret?.m1?.v)], ['bestKmS', (r) => r6(r.ret?.best?.v)],
  ['bestM', (r) => r.ret?.best?.M ?? null], ['bestBranch', (r) => r.ret?.best?.branch ?? null], ['m1Wins', (r) => r.ret?.m1Wins ?? null],
  ['errorM0KmS', (r) => r6(r.err)], ['errorBestKmS', (r) => r6(r.errBest)], ['retRefused', (r) => r.ret?.refused ?? null], ['retM0Converged', (r) => r.ret?.ok ?? null], ['retM1CellsConverged', (r) => r.ret?.m1Ok ?? null],
  ['bestFlagged', (r) => r.ret?.best?.flagged ?? null], ['bestPerihelionKm', (r) => (typeof r.ret?.best?.qKm === 'number' ? Number(r.ret.best.qKm.toPrecision(7)) : null)],
  ['computedM0Flagged', (r) => r.ret?.computedFlagged ?? null], ['minM1Flagged', (r) => r.ret?.m1?.flagged ?? null],
  ['bestUnflaggedKmS', (r) => r6(r.ret?.bestValid?.v)], ['m1WinsUnflagged', (r) => r.ret?.m1WinsValid ?? null], ['errorBestUnflaggedKmS', (r) => r6(r.errBestValid)],
  ['bestRetDepJdTdb', (r) => r6(r.ret?.best?.dep)], ['bestRetTofDays', (r) => r6(r.ret?.best?.tof)], ['bestRetEarthArrivalVInfKmS', (r) => r6(r.ret?.best?.vArrE)], ['bestRetDepartsAfterSupport', (r) => r.ret?.best?.afterSup ?? null],
  ['secAssumedKmS', (r) => r6(r.sAssumed)], ['secComputedM0KmS', (r) => r6(r.sRet?.computed)], ['secMinM1KmS', (r) => r6(r.sRet?.m1?.v)], ['secBestKmS', (r) => r6(r.sRet?.best?.v)],
  ['secBestBranch', (r) => r.sRet?.best?.branch ?? null], ['secM1Wins', (r) => r.sRet?.m1Wins ?? null], ['secErrorM0KmS', (r) => r6(r.sErr)], ['secErrorBestKmS', (r) => r6(r.sErrBest)], ['secRetRefused', (r) => r.sRet?.refused ?? null],
  ['secBestFlagged', (r) => r.sRet?.best?.flagged ?? null], ['secBestUnflaggedKmS', (r) => r6(r.sRet?.bestValid?.v)], ['secM1WinsUnflagged', (r) => r.sRet?.m1WinsValid ?? null], ['secErrorBestUnflaggedKmS', (r) => r6(r.sErrBestValid)],
];
for (const f of fs.readdirSync(here)) if (/^xr3-m1-\d+of\d+\.json$/.test(f)) fs.rmSync(path.join(here, f));
const files = [];
for (const cp of cps) {
  const name = `xr3-m1-${cp.shard}of${cp.of}.json`;
  const rows = shardRows.get(cp.shard);
  fs.writeFileSync(path.join(here, name), `${JSON.stringify({ schema: 'aster-s20-longrun2-xr3/1', label: LABEL, shard: cp.shard, of: cp.of, state: cp.state, rowsInShard: rows.length, shardTotal: cp.total, seed: cp.seed, returnGrid: cp.returnGrid, compare: cp.compare, rounding: 'floats rounded to 6 decimals', order: 'LR2\'s seeded shuffle; this shard holds shuffle positions p with p % of == shard', columns: COLS.map(([c]) => c), rows: rows.map((r) => COLS.map(([, p]) => p(r))) })}\n`);
  files.push({ file: name, bytes: fs.statSync(path.join(here, name)).size, rows: rows.length, sha256: sha256File(path.join(here, name)) });
}
const statusCounts = all.reduce((acc, r) => { const k = r.status.split(':').slice(0, 2).join(':'); return { ...acc, [k]: (acc[k] ?? 0) + 1 }; }, {});
const summary = {
  schema: 'aster-s20-longrun2-xr3-summary/1', label: LABEL, generatedAtUtc: new Date().toISOString(),
  state: complete ? 'COMPLETE' : `PARTIAL: ${all.length} of ${CATALOG}`, bodiesDone: all.length, catalogBodies: CATALOG, shardTotal,
  shards: cps.map((c) => ({ shard: c.shard, of: c.of, state: c.state, done: shardRows.get(c.shard).length, total: c.total, secondsPerBody: c.secondsPerBodyThisRun })),
  seed: cps[0].seed, node: cps[0].node, baseCommit: cps[0].baseCommit, returnGrid: cps[0].returnGrid, statusCounts,
  lr2M0Check: lr2Check, primary, secondary, files,
};
fs.writeFileSync(path.join(here, 'xr3-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

const f = (x, d = 3) => (typeof x === 'number' && Number.isFinite(x) ? x.toFixed(d) : 'n/a');
const pct = (x) => (typeof x === 'number' && Number.isFinite(x) ? `${(100 * x).toFixed(1)}%` : 'n/a');
const n = (x) => (typeof x === 'number' ? x.toLocaleString('en-US') : String(x));
const nb = (x) => `${n(x)} ${x === 1 ? 'body' : 'bodies'}`;
const L = [];
const row = (c) => L.push(`| ${c.join(' | ')} |`);
L.push('# XR3 — LR2 with M=1 returns admitted');
L.push('');
L.push(`**${LABEL}**`);
L.push('');
L.push(`State: **${summary.state}** (LR2's seeded shuffle ${summary.seed}, ${OF} shards; a partial run is the same kind of unbiased sample LR2's was). Status: ${Object.entries(statusCounts).map(([k, v]) => `${k} ${n(v)}`).join('; ')}.`);
L.push('');
L.push('This XR reuses LR2\'s committed pipeline on purpose: `run-shard-m1.mjs` is a copy of LR2\'s `run-shard.mjs` with the return leg run at M=0 and M=1 (its header lists every change). It measures the effect of M=1, not the pipeline. The pipeline itself is what XR0 cross-checks.');
L.push('');
L.push(`**M=0 values against LR2's committed rows, same bodies:** ${n(lr2Check.compared)} compared; primary error equal at 6 decimals for ${n(lr2Check.primaryErrorEqual)}, primary computed for ${n(lr2Check.primaryComputedEqual)}, secondary error for ${n(lr2Check.secondaryErrorEqual)}, status for ${n(lr2Check.statusEqual)}.${lr2Check.mismatches.length ? ` First mismatches: ${lr2Check.mismatches.slice(0, 5).map((m) => `${m.des} (err ${m.err.join(' vs ')})`).join('; ')}.` : ''}`);
L.push('');
for (const m of [primary, secondary]) {
  L.push(`## ${m.label}`);
  L.push('');
  row(['Bodies (paired)', 'returns', 'median \\|error\\|', 'p90 \\|error\\|', 'overcharge share', 'inside 0.08-5.1 km/s', 'above 5.1', 'median computed km/s']);
  row(['---', '---', '---:', '---:', '---:', '---:', '---:', '---:']);
  const two = (name, b) => {
    row([`${name}: ${n(b.bodies)}`, 'M=0 only (LR2)', f(b.m0.medianAbs), f(b.m0.p90Abs), pct(b.m0.overchargeShare), pct(b.m0.withinInterimRange), pct(b.m0.aboveInterimRange), f(b.medianComputedM0)]);
    row(['', 'M=0 and M=1', f(b.m0PlusM1.medianAbs), f(b.m0PlusM1.p90Abs), pct(b.m0PlusM1.overchargeShare), pct(b.m0PlusM1.withinInterimRange), pct(b.m0PlusM1.aboveInterimRange), f(b.medianComputedBest)]);
  };
  two('all', m.all);
  two('complete pairing windows', m.completeWindows);
  two('truncated pairing windows', m.truncatedWindows);
  for (const [k, b] of Object.entries(m.byTier)) two(`tier ${k}`, b);
  L.push('');
  const w = m.all.m1IsTheMinimum;
  const g = m.all.gainWhenM1WinsKmS;
  L.push(`**How often an M=1 cell is the minimum:** ${n(w.bodies)} of ${n(m.all.bodies)} bodies (${pct(w.share)}); left branch ${n(w.leftBranch)}, right branch ${n(w.rightBranch)}. Complete windows only: ${n(m.completeWindows.m1IsTheMinimum.bodies)} of ${n(m.completeWindows.bodies)} (${pct(m.completeWindows.m1IsTheMinimum.share)}).`);
  L.push(`**By how much it beats the best M=0 cell when it does:** median ${f(g.median)} km/s, p90 ${f(g.p90)}, p99 ${f(g.p99)}, max ${f(g.max)}; median relative gain ${pct(g.medianRelative)}.`);
  L.push(`Error sign changes when M=1 is admitted: ${nb(m.all.errorSignChanges.bodies)} (${n(m.all.errorSignChanges.underchargeToOvercharge)} from undercharge to overcharge; the computed value can only go down, so the error can only go up).`);
  const fm = m.all.flaggedMinima;
  const uv = m.all.m0PlusM1Unflagged;
  L.push(`**Is the minimum a through-Sun arc? (beyond the dispatch)** Using LR1's flag on the chosen cells: the M=0 minimum is flagged for ${nb(fm.m0MinimumFlagged)}, the M=1 minimum for ${nb(fm.m1MinimumFlagged)}, the overall minimum for ${nb(fm.overallMinimumFlagged)} (${n(fm.overallMinimumFlaggedAndM1)} of them M=1). M=1 "wins" only because of a flagged arc for ${nb(fm.m1WinsOnlyBecauseOfAFlaggedArc)}. Excluding flagged cells changes the minimum for ${nb(m.all.minimumChangedByExcludingFlagged.bodies)}${m.all.minimumChangedByExcludingFlagged.bodies ? ` (median increase ${f(m.all.minimumChangedByExcludingFlagged.medianIncreaseKmS)} km/s, max ${f(m.all.minimumChangedByExcludingFlagged.maxIncreaseKmS)})` : ''}. Over unflagged cells only, M=0 and M=1: median |error| ${f(uv.medianAbs)} km/s, p90 ${f(uv.p90Abs)}, overcharge share ${pct(uv.overchargeShare)}, inside 0.08-5.1 km/s ${pct(uv.withinInterimRange)}; an M=1 cell is the minimum for ${nb(m.all.m1IsTheMinimumUnflagged.bodies)} (${pct(m.all.m1IsTheMinimumUnflagged.share)}).`);
  if (m.all.flaggedMinimumBodies.length) {
    const adm = m.all.flaggedMinimumBodies.map((x) => x.admissibleCells);
    L.push(`Bodies whose chosen minimum (LR2's M=0 value or the overall one) is a flagged arc, every one listed. Note the refused-cell counts: each pairing window lost most of its 72,300 cells to the fixture end, so the minimum was taken over ${Math.min(...adm) === Math.max(...adm) ? n(adm[0]) : `${n(Math.min(...adm))} to ${n(Math.max(...adm))}`} admissible cells.`);
    row(['Body', 'tier', 'class', 'minimum km/s', 'M', 'transfer perihelion AU', 'eccentricity', 'return TOF d', 'minimum over unflagged cells', 'admissible / refused cells']);
    row(['---', '---', '---', '---:', '---:', '---:', '---:', '---:', '---:', '---']);
    for (const x of m.all.flaggedMinimumBodies) row([x.des, x.tier, x.cls, f(x.best), x.bestM, String(x.perihelionAu), String(x.eccentricity), f(x.retTofDays, 1), x.bestUnflagged === null ? 'none (every admissible cell is flagged)' : f(x.bestUnflagged), `${n(x.admissibleCells)} / ${n(x.refusedCells)}`]);
    L.push('');
  }
  L.push(`Return cells: ${n(m.returnCells.m0Converged)} converged at M=0; ${n(m.returnCells.m1CellsWithAConvergedBranch)} cells have a converged M=1 branch, ${n(m.returnCells.m1CellsWithout)} admissible cells have none; ${n(m.returnCells.refused)} refused. Bodies where only M=1 converges: ${n(m.m1OnlyBodies.length)}${m.m1OnlyBodies.length ? ` (${m.m1OnlyBodies.slice(0, 10).join(', ')})` : ''}.`);
  L.push('');
  L.push('Ten largest gains from M=1:');
  row(['Body', 'tier', 'class', 'best M=0', 'best overall', 'branch', 'gain', 'error M=0', 'error with M=1', 'refused cells']);
  row(['---', '---', '---', '---:', '---:', '---', '---:', '---:', '---:', '---:']);
  for (const x of m.largestGains) row([x.des, x.tier, x.cls, f(x.computedM0), f(x.best), x.branch, f(x.gain), f(x.errorM0), f(x.errorBest), n(x.refused)]);
  L.push('');
}
L.push('## Files');
for (const x of files) L.push(`- \`${x.file}\` — ${x.rows} rows, ${x.bytes} bytes, sha256 ${x.sha256}`);
L.push('- `xr3-summary.json` — every aggregate above; `run-shard-m1.mjs`, `summarize.mjs`.');
L.push('');
fs.writeFileSync(path.join(here, 'REPORT.md'), `${L.join('\n')}\n`);
console.log(JSON.stringify({ state: summary.state, statusCounts, lr2Check: { ...lr2Check, mismatches: lr2Check.mismatches.length }, primary: { bodies: primary.all.bodies, m0Median: primary.all.m0.medianAbs, bestMedian: primary.all.m0PlusM1.medianAbs, m1Wins: primary.all.m1IsTheMinimum.share, gainMedian: primary.all.gainWhenM1WinsKmS.median }, secondary: { bodies: secondary.all.bodies, m0Median: secondary.all.m0.medianAbs, bestMedian: secondary.all.m0PlusM1.medianAbs, m1Wins: secondary.all.m1IsTheMinimum.share }, files: files.map((x) => [x.file, x.bytes]) }, null, 1));
