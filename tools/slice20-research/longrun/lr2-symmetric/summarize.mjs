#!/usr/bin/env node
// LR2 step 3 — fold the shard NDJSON files (scratch) into the committed compact shard files, the
// running summary and REPORT.md. Safe to run while the shards are still computing: it reports
// "PARTIAL: n of m" until every shard checkpoint says complete.
//
// UNVALIDATED until LR1 passes review. LEADS-grade research evidence only. No number here is
// typed by hand; REPORT.md is printed from the summary object.
//
// Usage: node tools/slice20-research/longrun/lr2-symmetric/summarize.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jdTdbToDate, quantile, scratchRoot, sha256File } from '../lib/common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(scratchRoot, 'lr2');
const LABEL = 'UNVALIDATED until LR1 passes review. LEADS-grade research evidence; nothing here enters a DEC, a test or the site.';

const checkpoints = fs.readdirSync(dir).filter((f) => /^checkpoint-\d+of\d+\.json$/.test(f)).sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
if (checkpoints.length === 0) throw new Error('no shard checkpoints found');
const OF = checkpoints[0].of;
const shardRows = new Map();
for (const cp of checkpoints) {
  const file = path.join(dir, `rows-${cp.shard}of${cp.of}.ndjson`);
  const rows = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line) continue;
    try { rows.push(JSON.parse(line)); } catch { /* a line still being written */ }
  }
  shardRows.set(cp.shard, rows);
}
const all = [...shardRows.values()].flat();
const total = checkpoints.reduce((acc, cp) => acc + cp.total, 0);
const complete = checkpoints.length === OF && checkpoints.every((cp) => cp.state === 'complete') && all.length === total;

// ---- committed compact shard files -------------------------------------------------------------
const r6 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : x ?? null);
const COLUMNS = [
  ['des', (r) => r.des], ['tier', (r) => r.tier], ['cls', (r) => r.cls], ['status', (r) => r.status],
  ['supportJdTdb', (r) => r6(r.supJd)],
  ['liveMinC3', (r) => r6(r.liveMinC3)], ['components', (r) => r.nComp ?? null], ['practical', (r) => r.nPractical ?? null],
  // primary: compare path's best practical window
  ['outDepJdTdb', (r) => r6(r.oDep)], ['outTofDays', (r) => r6(r.oTof)], ['outC3', (r) => r6(r.oC3)],
  ['assumedKmS', (r) => r6(r.assumed)], ['outArrivesAfterSupport', (r) => r.oAfterSup ?? null],
  ['retCells', (r) => r.ret?.cells ?? null], ['retRefused', (r) => r.ret?.refused ?? null], ['retOk', (r) => r.ret?.ok ?? null],
  ['retNoConvergence', (r) => r.ret?.noConv ?? null], ['retUnsupported', (r) => r.ret?.unsup ?? null],
  ['computedKmS', (r) => r6(r.ret?.computed)], ['retDepJdTdb', (r) => r6(r.ret?.dep)], ['retTofDays', (r) => r6(r.ret?.tof)],
  ['retEarthArrivalVInfKmS', (r) => r6(r.ret?.vArrE)], ['retDepartsAfterSupport', (r) => r.ret?.afterSup ?? null],
  ['computedSupportedKmS', (r) => r6(r.ret?.computedSup)], ['errorKmS', (r) => r6(r.err)],
  // secondary: best sample-return stack window
  ['secDepJdTdb', (r) => r6(r.sDep)], ['secTofDays', (r) => r6(r.sTof)], ['secC3', (r) => r6(r.sC3)],
  ['secStackKmS', (r) => r6(r.sStack)], ['secAssumedKmS', (r) => r6(r.sAssumed)], ['secOutArrivesAfterSupport', (r) => r.sOAfterSup ?? null],
  ['secRetStatus', (r) => r.sRet?.status ?? null], ['secRetRefused', (r) => r.sRet?.refused ?? null], ['secRetOk', (r) => r.sRet?.ok ?? null],
  ['secRetNoConvergence', (r) => r.sRet?.noConv ?? null], ['secRetUnsupported', (r) => r.sRet?.unsup ?? null],
  ['secComputedKmS', (r) => r6(r.sRet?.computed)], ['secRetDepJdTdb', (r) => r6(r.sRet?.dep)], ['secRetTofDays', (r) => r6(r.sRet?.tof)],
  ['secRetEarthArrivalVInfKmS', (r) => r6(r.sRet?.vArrE)], ['secRetDepartsAfterSupport', (r) => r.sRet?.afterSup ?? null],
  ['secComputedSupportedKmS', (r) => r6(r.sRet?.computedSup)], ['secErrorKmS', (r) => r6(r.sErr)],
];
const shardFiles = [];
for (const cp of checkpoints) {
  const rows = shardRows.get(cp.shard);
  const name = `lr2-symmetric-${cp.shard}of${cp.of}.json`;
  const payload = {
    schema: 'aster-s20-longrun-lr2-symmetric/1',
    label: LABEL,
    shard: cp.shard, of: cp.of, state: cp.state, rowsInShard: rows.length, shardTotal: cp.total,
    seed: cp.seed, baseCommit: cp.baseCommit, srcV2Tree: cp.srcV2Tree, node: cp.node,
    compare: cp.compare, returnGrid: cp.returnGrid, absoluteKm2S2: cp.absoluteKm2S2,
    rounding: 'floats rounded to 6 decimals to keep each file under 10 MB; full precision stayed in scratch',
    order: 'rows are in seeded-shuffle order (this shard holds shuffle positions p with p % of == shard)',
    columns: COLUMNS.map(([name2]) => name2),
    rows: rows.map((r) => COLUMNS.map(([, pick]) => pick(r))),
  };
  fs.writeFileSync(path.join(here, name), `${JSON.stringify(payload)}\n`);
  shardFiles.push({ file: name, bytes: fs.statSync(path.join(here, name)).size, rows: rows.length, sha256: sha256File(path.join(here, name)) });
}

// ---- summary -----------------------------------------------------------------------------------
function dist(values) {
  const signed = values.slice().sort((a, b) => a - b);
  const abs = values.map(Math.abs).sort((a, b) => a - b);
  if (signed.length === 0) return { n: 0 };
  const q = (arr, p) => quantile(arr, p);
  const over = values.filter((v) => v > 0).length;
  const under = values.filter((v) => v < 0).length;
  return {
    n: values.length,
    medianAbs: q(abs, 0.5), p10Abs: q(abs, 0.1), p90Abs: q(abs, 0.9), p99Abs: q(abs, 0.99), maxAbs: abs[abs.length - 1],
    meanSigned: values.reduce((a, v) => a + v, 0) / values.length,
    p10Signed: q(signed, 0.1), p50Signed: q(signed, 0.5), p90Signed: q(signed, 0.9), p99Signed: q(signed, 0.99),
    minSigned: signed[0], maxSigned: signed[signed.length - 1],
    overchargeShare: over / values.length, underchargeShare: under / values.length, overcharge: over, undercharge: under,
    withinInterimRange: values.filter((v) => Math.abs(v) >= 0.08 && Math.abs(v) <= 5.1).length / values.length,
    belowInterimRange: values.filter((v) => Math.abs(v) < 0.08).length / values.length,
    aboveInterimRange: values.filter((v) => Math.abs(v) > 5.1).length / values.length,
  };
}
const BINS = [-Infinity, -10, -5, -2, -1, -0.5, -0.1, 0.1, 0.5, 1, 2, 5, 10, Infinity];
const histogram = (values) => BINS.slice(0, -1).map((lo, i) => ({ lo, hi: BINS[i + 1], n: values.filter((v) => v >= lo && v < BINS[i + 1]).length }));
const groupBy = (rows, key) => {
  const m = new Map();
  for (const r of rows) {
    const k = key(r) ?? 'null';
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
};
const count = (rows, pred) => rows.filter(pred).length;
const statusCounts = Object.fromEntries(groupBy(all, (r) => r.status.split(':').slice(0, 2).join(':')).map(([k, v]) => [k, v.length]));

function measure(label, rows, errOf, retOf, outAfterSupOf, assumedOf, arrivalOf) {
  const measured = rows.filter((r) => typeof errOf(r) === 'number');
  const errs = measured.map(errOf);
  const l1 = measured.filter((r) => r.supJd !== null && r.supJd !== undefined);
  const supportedErr = l1.filter((r) => typeof retOf(r).computedSup === 'number').map((r) => assumedOf(r) - retOf(r).computedSup);
  return {
    label,
    bodiesWithWindow: rows.filter((r) => typeof assumedOf(r) === 'number').length,
    measured: measured.length,
    overall: dist(errs),
    histogramSignedKmS: histogram(errs),
    byTier: Object.fromEntries(groupBy(measured, (r) => r.tier).map(([k, v]) => [k, dist(v.map(errOf))])),
    byOrbitClass: Object.fromEntries(groupBy(measured, (r) => r.cls).map(([k, v]) => [k, dist(v.map(errOf))])),
    // A refused cell cannot be the minimum, so on a truncated window `computed` is an UPPER bound on
    // the full-window minimum and the error is biased toward undercharge. The clean population is
    // the bodies whose pairing window lost no cell.
    byReturnWindowRefusal: {
      'no return cell refused (complete window)': dist(measured.filter((r) => retOf(r).refused === 0).map(errOf)),
      'up to half the return cells refused': dist(measured.filter((r) => retOf(r).refused > 0 && retOf(r).refused <= retOf(r).cells / 2).map(errOf)),
      'more than half the return cells refused': dist(measured.filter((r) => retOf(r).refused > retOf(r).cells / 2).map(errOf)),
    },
    returnCells: {
      total: rows.reduce((a, r) => a + (retOf(r)?.cells ?? 0), 0),
      refusedEarthArrivalAfterFixtureEnd: rows.reduce((a, r) => a + (retOf(r)?.refused ?? 0), 0),
      noConvergence: rows.reduce((a, r) => a + (retOf(r)?.noConv ?? 0), 0),
      unsupportedDepartureAfterSupport: rows.reduce((a, r) => a + (retOf(r)?.unsup ?? 0), 0),
      converged: rows.reduce((a, r) => a + (retOf(r)?.ok ?? 0), 0),
    },
    bodies: {
      anyReturnCellRefused: count(rows, (r) => (retOf(r)?.refused ?? 0) > 0),
      allReturnCellsRefused: count(rows, (r) => retOf(r)?.status === 'all-return-cells-refused'),
      noReturnConvergence: count(rows, (r) => retOf(r)?.status === 'no-return-convergence'),
      anyReturnCellNoConvergence: count(rows, (r) => (retOf(r)?.noConv ?? 0) > 0),
      l1Measured: l1.length,
      chosenReturnDepartsAfterSupport: count(measured, (r) => retOf(r).afterSup === 1),
      outboundArrivesAfterSupport: count(measured, (r) => outAfterSupOf(r) === 1),
      l1WithNoSupportedReturnCell: count(l1, (r) => typeof retOf(r).computedSup !== 'number'),
    },
    l1SupportedOnly: { note: 'L1 bodies only: assumed minus the minimum over return cells departing BEFORE the support date', ...dist(supportedErr) },
    chosenReturn: {
      medianStayDays: quantile(measured.map((r) => retOf(r).dep - arrivalOf(r)).sort((a, b) => a - b), 0.5),
      medianReturnTofDays: quantile(measured.map((r) => retOf(r).tof).sort((a, b) => a - b), 0.5),
      medianEarthArrivalVInfKmS: quantile(measured.map((r) => retOf(r).vArrE).sort((a, b) => a - b), 0.5),
      medianAssumedKmS: quantile(measured.map(assumedOf).sort((a, b) => a - b), 0.5),
      medianComputedKmS: quantile(measured.map((r) => retOf(r).computed).sort((a, b) => a - b), 0.5),
    },
  };
}
const withOutbound = all.filter((r) => !r.status.startsWith('outbound-refused') && !r.status.startsWith('error'));
const primary = measure('PRIMARY - compare path best practical window (the dispatch procedure)', all, (r) => r.err, (r) => r.ret ?? {}, (r) => r.oAfterSup, (r) => r.assumed, (r) => r.oDep + r.oTof);
const secondary = measure('SECONDARY - outbound cell minimizing the production sample-return dV stack (beyond the dispatch procedure)', all, (r) => r.sErr, (r) => r.sRet ?? {}, (r) => r.sOAfterSup, (r) => r.sAssumed, (r) => r.sDep + r.sTof);

const worst = (errOf, sign) => all.filter((r) => typeof errOf(r) === 'number').sort((a, b) => sign * (errOf(b) - errOf(a))).slice(0, 10);
const describeP = (r) => ({ des: r.des, tier: r.tier, cls: r.cls, outDep: jdTdbToDate(r.oDep), outTofDays: r6(r.oTof), outC3: r6(r.oC3), assumedKmS: r6(r.assumed), computedKmS: r6(r.ret.computed), errorKmS: r6(r.err), retDep: jdTdbToDate(r.ret.dep), retTofDays: r6(r.ret.tof), retRefused: r.ret.refused });
const describeS = (r) => ({ des: r.des, tier: r.tier, cls: r.cls, outDep: jdTdbToDate(r.sDep), outTofDays: r6(r.sTof), outC3: r6(r.sC3), assumedKmS: r6(r.sAssumed), computedKmS: r6(r.sRet.computed), errorKmS: r6(r.sErr), retDep: jdTdbToDate(r.sRet.dep), retTofDays: r6(r.sRet.tof), retRefused: r.sRet.refused });

const summary = {
  schema: 'aster-s20-longrun-lr2-summary/1',
  label: LABEL,
  environment: 'CLOUD RUN (Linux container), not the laptop the dispatch names; waived by Hudson in-session 2026-11-14',
  generatedAtUtc: new Date().toISOString(),
  state: complete ? 'COMPLETE' : `PARTIAL: ${all.length} of ${total}`,
  bodiesDone: all.length,
  catalogBodies: total,
  shards: checkpoints.map((cp) => ({ shard: cp.shard, of: cp.of, state: cp.state, done: shardRows.get(cp.shard).length, total: cp.total, secondsPerBody: cp.secondsPerBodyThisRun })),
  seed: checkpoints[0].seed,
  baseCommit: checkpoints[0].baseCommit,
  srcV2Tree: checkpoints[0].srcV2Tree,
  node: checkpoints[0].node,
  compare: checkpoints[0].compare,
  returnGrid: checkpoints[0].returnGrid,
  statusCounts,
  bodiesWithOutboundGrid: withOutbound.length,
  tierCounts: Object.fromEntries(groupBy(all, (r) => r.tier).map(([k, v]) => [k, v.length])),
  orbitClassCounts: Object.fromEntries(groupBy(all, (r) => r.cls).map(([k, v]) => [k, v.length])),
  sameWindowBothDefinitions: count(all, (r) => typeof r.oDep === 'number' && r.oDep === r.sDep && r.oTof === r.sTof),
  interimDisclosureRangeKmS: { min: 0.08, max: 5.1, source: 'DEC-20-7 interim / src/v2/data/symmetric-return-error.json (six windows, S20_01 R3)' },
  primary,
  secondary,
  extremes: {
    primaryLargestOvercharge: worst((r) => r.err, 1).map(describeP),
    primaryLargestUndercharge: worst((r) => r.err, -1).map(describeP),
    secondaryLargestOvercharge: worst((r) => r.sErr, 1).map(describeS),
    secondaryLargestUndercharge: worst((r) => r.sErr, -1).map(describeS),
  },
  shardFiles,
};
fs.writeFileSync(path.join(here, 'lr2-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

// ---- REPORT.md ---------------------------------------------------------------------------------
const f = (x, d = 3) => (typeof x === 'number' && Number.isFinite(x) ? x.toFixed(d) : 'n/a');
const pct = (x) => (typeof x === 'number' && Number.isFinite(x) ? `${(100 * x).toFixed(1)}%` : 'n/a');
const L = [];
const row = (cols) => L.push(`| ${cols.join(' | ')} |`);
L.push('# LR2 — catalog-wide symmetric-return error');
L.push('');
L.push(`**${LABEL}**`);
L.push('');
L.push(`State: **${summary.state}**. Bodies processed ${all.length} of ${total} (seeded shuffle ${summary.seed}; shard i holds positions p % ${OF} == i, so a partial run is an unbiased sample).`);
L.push(`Run: CLOUD container (node ${summary.node}), production code at ${summary.baseCommit} (src/v2 tree ${summary.srcV2Tree}).`);
L.push('');
L.push('## What was measured, per body');
L.push(`- **Outbound** — the production \`computeCompareData\` with the compare page's arguments (${summary.compare.nDep}x${summary.compare.nTof}, M=${summary.compare.M}, ${summary.compare.departureStartUtc}..${summary.compare.departureEndUtc}, TOF ${summary.compare.tofMinDays}-${summary.compare.tofMaxDays} d, ${summary.compare.thresholdMode} threshold, delta ${summary.compare.deltaKm2S2}, B_min ${summary.compare.bMinCells}). Window = \`segmentation.bestPractical\`.`);
L.push('- **Assumed** — `departureDvFromVInf(outbound vInfArr)` at that window: what the symmetric assumption charges today.');
L.push(`- **Computed** — minimum asteroid-departure |v∞| over return departures in [arrival + ${summary.returnGrid.stayMinDays} d, arrival + ${summary.returnGrid.stayMaxDays} d] (${summary.returnGrid.nDep} columns) x TOF ${summary.returnGrid.tofMinDays}-${summary.returnGrid.tofMaxDays} d (${summary.returnGrid.nTof}), M=${summary.returnGrid.M}, unedited kernel with swapped providers and the verified indexed Earth lookup. Cells arriving at Earth after the last Earth sample are refused and counted.`);
L.push('- **error = assumed − computed** (km/s, sign kept). Positive = the assumption overcharges.');
L.push('- A **secondary** window is measured the same way: the outbound cell minimizing the production sample-return ΔV stack (S20_01 R3\'s "best stack"). It is beyond the dispatch\'s stated procedure and is labelled secondary everywhere.');
L.push('');
L.push('Read this before using any number: the compare page itself is one-way and does not charge a return burn. The symmetric charge is applied on the porkchop page to whichever cell the user pins in sample-return mode (`app/porkchop/main.ts`). The primary rows answer "how wrong is the charge at the window compare recommends"; the secondary rows answer "how wrong is it at the window the sample-return stack itself would rank first".');
L.push('');
L.push('## Status counts');
row(['Status', 'Bodies']);
row(['---', '---:']);
for (const [k, v] of Object.entries(statusCounts)) row([k, v]);
L.push('');
L.push(`Tier counts in the processed set: ${Object.entries(summary.tierCounts).map(([k, v]) => `${k} ${v}`).join(', ')}. Bodies where both window definitions pick the same cell: ${summary.sameWindowBothDefinitions}.`);
L.push('');
for (const m of [primary, secondary]) {
  L.push(`## ${m.label}`);
  L.push('');
  const o = m.overall;
  L.push(`Measured bodies: **${m.measured}** (bodies with a window: ${m.bodiesWithWindow}).`);
  L.push('');
  row(['', 'n', 'median \\|error\\|', 'p10 \\|e\\|', 'p90 \\|e\\|', 'p99 \\|e\\|', 'max \\|e\\|', 'signed p10 / p50 / p90', 'overcharge share', 'undercharge share']);
  row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
  const line = (name, d) => row([name, d.n, f(d.medianAbs), f(d.p10Abs), f(d.p90Abs), f(d.p99Abs), f(d.maxAbs), `${f(d.p10Signed)} / ${f(d.p50Signed)} / ${f(d.p90Signed)}`, pct(d.overchargeShare), pct(d.underchargeShare)]);
  line('**all**', o);
  for (const [k, d] of Object.entries(m.byTier)) line(`tier ${k}`, d);
  for (const [k, d] of Object.entries(m.byOrbitClass)) line(`class ${k}`, d);
  line('L1, supported return cells only', m.l1SupportedOnly);
  for (const [k, d] of Object.entries(m.byReturnWindowRefusal)) line(k, d);
  L.push('');
  L.push('The last three rows split the measured bodies by how much of the pairing window DEC-20-3 refused. A refused cell cannot be the minimum, so on a truncated window `computed` is an upper bound on the full-window minimum and the error is pushed toward undercharge. The "complete window" row is the population with no such bias.');
  L.push('');
  L.push(`Against the DEC-20-7 interim range (0.08-5.1 km/s, six windows): ${pct(o.withinInterimRange)} of measured bodies fall inside it, ${pct(o.belowInterimRange)} below 0.08, ${pct(o.aboveInterimRange)} above 5.1.`);
  L.push('');
  L.push('Signed error histogram (km/s):');
  row(['bin', 'bodies', 'share']);
  row(['---', '---:', '---:']);
  for (const b of m.histogramSignedKmS) {
    const name = b.lo === -Infinity ? `below ${b.hi}` : b.hi === Infinity ? `${b.lo} and above` : `${b.lo} to ${b.hi}`;
    row([name, b.n, pct(o.n ? b.n / o.n : NaN)]);
  }
  L.push('');
  L.push(`Medians at the chosen cells: assumed ${f(m.chosenReturn.medianAssumedKmS)} km/s, computed ${f(m.chosenReturn.medianComputedKmS)} km/s, stay ${f(m.chosenReturn.medianStayDays, 1)} d, return TOF ${f(m.chosenReturn.medianReturnTofDays, 1)} d, Earth-arrival |v∞| at the chosen return cell ${f(m.chosenReturn.medianEarthArrivalVInfKmS)} km/s.`);
  L.push('');
  L.push('Refusals, support and convergence:');
  L.push(`- Return cells: ${m.returnCells.total} evaluated; **${m.returnCells.refusedEarthArrivalAfterFixtureEnd} refused** (Earth arrival after the fixture end, ${pct(m.returnCells.total ? m.returnCells.refusedEarthArrivalAfterFixtureEnd / m.returnCells.total : NaN)}); ${m.returnCells.noConvergence} without convergence; ${m.returnCells.unsupportedDepartureAfterSupport} depart at or after the body's support date; ${m.returnCells.converged} converged.`);
  L.push(`- Bodies: ${m.bodies.anyReturnCellRefused} have at least one refused return cell; ${m.bodies.allReturnCellsRefused} have every return cell refused (no computed value); ${m.bodies.noReturnConvergence} have no converged return cell; ${m.bodies.anyReturnCellNoConvergence} have at least one non-converged admissible cell.`);
  L.push(`- Support (L1 only, ${m.bodies.l1Measured} measured): the chosen return departs at or after the support date for **${m.bodies.chosenReturnDepartsAfterSupport}** bodies; the outbound window itself arrives after support for ${m.bodies.outboundArrivesAfterSupport}; ${m.bodies.l1WithNoSupportedReturnCell} L1 bodies have no supported converged return cell.`);
  L.push('');
}
L.push('## Extremes (ten each)');
L.push('Read the "refused cells" column first: the largest undercharges sit on windows where almost every return cell was refused (of 72,300), so their `computed` is the minimum of a handful of cells, not of the pairing window.');
L.push('');
const ext = (title, rows2) => {
  L.push(`**${title}**`);
  L.push('');
  row(['Body', 'tier', 'class', 'outbound dep, TOF d', 'C3', 'assumed', 'computed', 'error', 'return dep, TOF d', 'refused cells']);
  row(['---', '---', '---', '---', '---:', '---:', '---:', '---:', '---', '---:']);
  for (const x of rows2) row([x.des, x.tier, x.cls, `${x.outDep}, ${f(x.outTofDays, 1)}`, f(x.outC3), f(x.assumedKmS), f(x.computedKmS), f(x.errorKmS), `${x.retDep}, ${f(x.retTofDays, 1)}`, x.retRefused]);
  L.push('');
};
ext('Primary — largest overcharge', summary.extremes.primaryLargestOvercharge);
ext('Primary — largest undercharge', summary.extremes.primaryLargestUndercharge);
ext('Secondary — largest overcharge', summary.extremes.secondaryLargestOvercharge);
ext('Secondary — largest undercharge', summary.extremes.secondaryLargestUndercharge);
L.push('## Files');
for (const s of shardFiles) L.push(`- \`${s.file}\` — ${s.rows} rows, ${s.bytes} bytes, sha256 ${s.sha256}`);
L.push('- `lr2-summary.json` — every aggregate above.');
L.push('- `lookup-verification.json` — the LR2.1 gate result for the indexed Earth lookup.');
L.push('- `verify-lookup.mjs`, `run-shard.mjs`, `summarize.mjs` — see README.md.');
L.push('');
fs.writeFileSync(path.join(here, 'REPORT.md'), `${L.join('\n')}\n`);
console.log(JSON.stringify({
  state: summary.state, statusCounts,
  primary: { measured: primary.measured, medianAbs: primary.overall.medianAbs, p90Abs: primary.overall.p90Abs, over: primary.overall.overchargeShare },
  secondary: { measured: secondary.measured, medianAbs: secondary.overall.medianAbs, p90Abs: secondary.overall.p90Abs, over: secondary.overall.overchargeShare },
  shardFiles: shardFiles.map((s) => [s.file, s.bytes]),
}, null, 2));
