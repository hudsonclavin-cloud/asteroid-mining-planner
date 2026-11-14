#!/usr/bin/env node
// XR2 — fold the census shards (scratch) into the committed evidence and REPORT.md. Safe to run while
// shards are still going: it reports "PARTIAL: n of m". Every number in REPORT.md comes from the
// summary object built here.
//
//   node summarize.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AU_KM, FILES, Q_HIST, SOLAR_RADIUS_KM, importV2, jdTdbToDate, qBinUpperAu, readStamp, repoRoot, scratchRoot, sha256File } from '../lib/common2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(scratchRoot, 'xr2');
readStamp();
const { formatC3 } = await importV2('porkchop/format-c3.js');
const LABEL = 'LEADS-grade research evidence. Nothing here enters a DEC, a test, a fixture or the site.';

const states = fs.readdirSync(dir).filter((f) => /^outbound-state-\d+of\d+\.json$/.test(f)).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
if (!states.length) throw new Error('no outbound census state found');
const OF = states[0].of;
const rows = [];
const shardRows = new Map();
for (const st of states) {
  // only the rows the saved histograms cover, so counts and histograms describe the same bodies
  const lines = fs.readFileSync(path.join(dir, `outbound-${st.shard}of${st.of}.ndjson`), 'utf8').split('\n').filter(Boolean).slice(0, st.hist.bodiesInHist);
  const parsed = lines.map((l) => JSON.parse(l));
  shardRows.set(st.shard, parsed);
  rows.push(...parsed);
}
const total = states.reduce((a, s) => a + s.total, 0);
const complete = states.length === OF && states.every((s) => s.state === 'complete') && rows.length === total;
const shipped = JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.cacheShipped), 'utf8'));
const shippedByDes = new Map(shipped.bodies.map((b) => [b.designation, b]));

const addHist = (into, from) => { for (let i = 0; i < from.length; i += 1) into[i] += from[i]; };
const mergeHists = (key) => {
  const out = {};
  for (const st of states) for (const [k, h] of Object.entries(st.hist[key])) { if (!out[k]) out[k] = new Array(Q_HIST.bins).fill(0); addHist(out[k], h); }
  return out;
};
const deciles = (hist) => {
  const n = hist.reduce((a, v) => a + v, 0);
  if (!n) return null;
  const out = {};
  let cum = 0;
  let next = 1;
  for (let i = 0; i < hist.length && next <= 9; i += 1) {
    cum += hist[i];
    while (next <= 9 && cum >= (next / 10) * n) { out[`p${next * 10}`] = qBinUpperAu(i); next += 1; }
  }
  return out;
};
const sumHists = (group, prefix) => { const out = new Array(Q_HIST.bins).fill(0); for (const [k, h] of Object.entries(group)) if (k.startsWith(prefix)) addHist(out, h); return out; };

function gridSummary(pick, histKey) {
  const have = rows.filter((r) => pick(r) && typeof pick(r).converged === 'number');
  const agg = (list) => {
    const s = { bodies: list.length, cells: 0, converged: 0, below01Au: 0, below001Au: 0, belowSun: 0, flagged: 0, hyperbolic: 0, bodiesWithFlagged: 0, bodiesWithBelowSun: 0 };
    for (const r of list) {
      const g = pick(r);
      s.cells += g.cells; s.converged += g.converged; s.below01Au += g.below01Au; s.below001Au += g.below001Au; s.belowSun += g.belowSun; s.flagged += g.flagged; s.hyperbolic += g.hyperbolic;
      if (g.flagged > 0) s.bodiesWithFlagged += 1;
      if (g.belowSun > 0) s.bodiesWithBelowSun += 1;
    }
    s.flaggedShareOfConverged = s.converged ? s.flagged / s.converged : null;
    s.belowSunShare = s.converged ? s.belowSun / s.converged : null;
    s.below001AuShare = s.converged ? s.below001Au / s.converged : null;
    s.below01AuShare = s.converged ? s.below01Au / s.converged : null;
    return s;
  };
  const hists = mergeHists(histKey);
  const byKey = (keyOf, prefix) => Object.fromEntries([...new Set(have.map(keyOf))].sort().map((k) => [k, { ...agg(have.filter((r) => keyOf(r) === k)), perihelionDecilesAu: deciles(hists[`${prefix}:${k}`] ?? []) }]));
  const perBodyFlagged = have.map((r) => pick(r).flagged).sort((a, b) => a - b);
  return {
    all: { ...agg(have), perihelionDecilesAu: deciles(sumHists(hists, 'tier:')) },
    byTier: byKey((r) => r.tier, 'tier'),
    byOrbitClass: byKey((r) => r.cls, 'class'),
    flaggedCellsPerBody: { min: perBodyFlagged[0] ?? null, median: perBodyFlagged[Math.floor(perBodyFlagged.length / 2)] ?? null, max: perBodyFlagged[perBodyFlagged.length - 1] ?? null },
  };
}
const screening = gridSummary((r) => r.scr, 'histScreen');
const compare = gridSummary((r) => (r.cmp && r.cmp.status === 'ok' ? r.cmp : null), 'histCompare');

// ---- the ruling-critical count -------------------------------------------------------------------
const shown = (r) => {
  const s = shippedByDes.get(r.des);
  return { des: r.des, tier: r.tier, cls: r.cls, status: s?.status ?? null, c3Text: s ? formatC3(s.minC3) : null, minC3: s?.minC3 ?? null, minC3Date: s?.minC3Date ?? null, minC3TofDays: s?.minC3TofDays ?? null };
};
const minC3Affected = rows.filter((r) => r.scr && r.scr.shippedMinC3CellFlagged === 1).map((r) => ({ ...shown(r) }));
const bestWindowsAffected = rows.filter((r) => r.scr && r.scr.shippedBestWindowsFlagged.length > 0).map((r) => {
  const s = shippedByDes.get(r.des);
  return { ...shown(r), flaggedWindows: r.scr.shippedBestWindowsFlagged.map((k) => ({ rank: k + 1, launchDate: s.bestWindows[k].launchDate, tofDays: s.bestWindows[k].tofDays, c3: s.bestWindows[k].c3, vInfArr: s.bestWindows[k].vInfArr })) };
});
const withWindow = rows.filter((r) => r.cmp && typeof r.cmp.window === 'object');
const compareAffected = withWindow.filter((r) => r.cmp.window.flagged > 0).map((r) => ({ ...shown(r), window: { c3: r.cmp.window.c3, dep: jdTdbToDate(r.cmp.window.depJd), tofDays: r.cmp.window.tofDays, cells: r.cmp.window.cells, flaggedCells: r.cmp.window.flagged, argminFlagged: r.cmp.window.argminFlagged, argminPerihelionAu: r.cmp.window.argminQKm / AU_KM, argminEccentricity: r.cmp.window.argminEcc } }));
const windowCells = withWindow.reduce((a, r) => a + r.cmp.window.cells, 0);
const kernelVsShipped = rows.filter((r) => r.scr && r.scr.kernelMinC3 !== null && shippedByDes.get(r.des)?.minC3 !== null).map((r) => {
  const s = shippedByDes.get(r.des);
  return { des: r.des, rel: Math.abs(r.scr.kernelMinC3 - s.minC3) / Math.abs(s.minC3), sameCell: r.scr.kernelMinDate === s.minC3Date && r.scr.kernelMinTof === s.minC3TofDays, straddle: (r.scr.kernelMinC3 <= 25) !== (s.minC3 <= 25), kernel: r.scr.kernelMinC3, shipped: s.minC3 };
});
const rels = kernelVsShipped.map((x) => x.rel).sort((a, b) => a - b);
const critical = {
  shippedCellsThatCouldNotBeMatchedToTheGrid: rows.reduce((a, r) => a + (r.scr ? r.scr.shippedCellsUnmatched : 0), 0),
  cacheMinC3Cell: { bodiesChecked: rows.filter((r) => r.scr && shippedByDes.get(r.des)?.minC3Date).length, flagged: minC3Affected.length, bodies: minC3Affected },
  cacheBestWindows: { windowsChecked: rows.reduce((a, r) => a + (r.scr ? (shippedByDes.get(r.des)?.bestWindows.length ?? 0) : 0), 0), flaggedWindows: bestWindowsAffected.reduce((a, b) => a + b.flaggedWindows.length, 0), bodies: bestWindowsAffected },
  compareBestPractical: {
    bodiesWithAWindow: withWindow.length, windowCellsChecked: windowCells,
    argminFlagged: withWindow.filter((r) => r.cmp.window.argminFlagged === 1).length,
    windowsWithAFlaggedCell: compareAffected.length, flaggedCellsInsideWindows: compareAffected.reduce((a, b) => a + b.window.flaggedCells, 0),
    windowsWithACellBelowOneSolarRadiusNotFlown: withWindow.filter((r) => r.cmp.window.belowSun > 0 && r.cmp.window.flagged === 0).length,
    smallestWindowPerihelionAu: withWindow.length ? Math.min(...withWindow.map((r) => r.cmp.window.minQKm)) / AU_KM : null,
    bodies: compareAffected,
  },
};
critical.totalShownWindowsOrCellsFlagged = critical.cacheMinC3Cell.flagged + critical.cacheBestWindows.flaggedWindows + critical.compareBestPractical.windowsWithAFlaggedCell;

// ---- return census --------------------------------------------------------------------------------
let returnCensus = null;
const retPath = path.join(dir, 'return-census.ndjson');
if (fs.existsSync(retPath)) {
  const rrows = fs.readFileSync(retPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const cp = JSON.parse(fs.readFileSync(path.join(dir, 'return-census-checkpoint.json'), 'utf8'));
  const GROUPS = ['M0 single', 'M1 left', 'M1 right'];
  const g = Object.fromEntries(GROUPS.map((name) => {
    const hist = new Array(Q_HIST.bins).fill(0);
    const s = { converged: 0, below01Au: 0, belowSun: 0, flagged: 0, flaggedSelected: 0, bodiesWithFlagged: 0, minFlaggedVInfDep: null };
    for (const r of rrows) {
      const x = r.stats[name];
      s.converged += x.converged; s.below01Au += x.below01Au; s.belowSun += x.belowSun; s.flagged += x.flagged; s.flaggedSelected += x.flaggedSelected;
      if (x.flagged > 0) s.bodiesWithFlagged += 1;
      if (x.minFlaggedVInfDep !== null && (s.minFlaggedVInfDep === null || x.minFlaggedVInfDep < s.minFlaggedVInfDep)) s.minFlaggedVInfDep = x.minFlaggedVInfDep;
      addHist(hist, x.hist);
    }
    s.flaggedShare = s.converged ? s.flagged / s.converged : null;
    s.perihelionDecilesAu = deciles(hist);
    return [name, s];
  }));
  const allConv = GROUPS.reduce((a, n) => a + g[n].converged, 0);
  const allFlag = GROUPS.reduce((a, n) => a + g[n].flagged, 0);
  const m1Conv = g['M1 left'].converged + g['M1 right'].converged;
  const m1Flag = g['M1 left'].flagged + g['M1 right'].flagged;
  returnCensus = {
    state: cp.state === 'complete' ? 'COMPLETE' : `PARTIAL: ${rrows.length} of ${cp.total}`,
    bodies: rrows.length, seed: cp.seed, skippedNotPropagatable: cp.skippedNotPropagatable ?? [],
    tierCounts: rrows.reduce((acc, r) => ({ ...acc, [r.tier]: (acc[r.tier] ?? 0) + 1 }), {}),
    admissibleCells: rrows.reduce((a, r) => a + r.admissibleCells, 0), refusedCells: rrows.reduce((a, r) => a + r.refusedCells, 0),
    byGroup: g,
    all: { convergedBranches: allConv, flagged: allFlag, flaggedShare: allConv ? allFlag / allConv : null },
    m1: { convergedBranches: m1Conv, flagged: m1Flag, flaggedShare: m1Conv ? m1Flag / m1Conv : null },
    lr1: { convergedBranches: 14124, flagged: 219, flaggedShare: 219 / 14124, m0: { n: 6000, flagged: 17 }, m1: { n: 8124, flagged: 202 }, source: 'tools/slice20-research/longrun/lr1-oracle/REPORT.md (closure by transfer-orbit perihelion, first row)' },
    minFlaggedVInfDepKmS: GROUPS.map((n) => g[n].minFlaggedVInfDep).filter((v) => v !== null).reduce((a, v) => Math.min(a, v), Infinity),
    perBody: rrows.map((r) => ({ des: r.des, tier: r.tier, cls: r.cls, admissibleCells: r.admissibleCells, ...Object.fromEntries(GROUPS.map((n) => [n, { converged: r.stats[n].converged, belowSun: r.stats[n].belowSun, flagged: r.stats[n].flagged, flaggedSelected: r.stats[n].flaggedSelected }])) })),
  };
  fs.writeFileSync(path.join(here, 'xr2-return-census.json'), `${JSON.stringify(returnCensus)}\n`);
}

// ---- committed per-body rows ----------------------------------------------------------------------
const r3 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Number(x.toPrecision(7)) : x ?? null);
const COLS = [
  ['des', (r) => r.des], ['tier', (r) => r.tier], ['cls', (r) => r.cls], ['status', (r) => r.status ?? 'ok'],
  ['scrConverged', (r) => r.scr?.converged ?? null], ['scrBelow01Au', (r) => r.scr?.below01Au ?? null], ['scrBelow001Au', (r) => r.scr?.below001Au ?? null],
  ['scrBelowSun', (r) => r.scr?.belowSun ?? null], ['scrFlagged', (r) => r.scr?.flagged ?? null], ['scrHyperbolic', (r) => r.scr?.hyperbolic ?? null],
  ['scrMinPerihelionKm', (r) => r3(r.scr?.minQKm)], ['kernelMinC3', (r) => r.scr?.kernelMinC3 ?? null], ['kernelMinDate', (r) => r.scr?.kernelMinDate ?? null], ['kernelMinTof', (r) => r.scr?.kernelMinTof ?? null],
  ['shippedMinC3CellFlagged', (r) => r.scr?.shippedMinC3CellFlagged ?? null], ['shippedBestWindowsFlagged', (r) => (r.scr ? r.scr.shippedBestWindowsFlagged.length : null)],
  ['cmpStatus', (r) => r.cmp?.status ?? null], ['cmpConverged', (r) => r.cmp?.converged ?? null], ['cmpBelowSun', (r) => r.cmp?.belowSun ?? null], ['cmpFlagged', (r) => r.cmp?.flagged ?? null],
  ['winCells', (r) => (typeof r.cmp?.window === 'object' ? r.cmp.window.cells : null)], ['winFlagged', (r) => (typeof r.cmp?.window === 'object' ? r.cmp.window.flagged : null)],
  ['winBelowSun', (r) => (typeof r.cmp?.window === 'object' ? r.cmp.window.belowSun : null)], ['winMinPerihelionKm', (r) => (typeof r.cmp?.window === 'object' ? r3(r.cmp.window.minQKm) : null)],
  ['winArgminPerihelionKm', (r) => (typeof r.cmp?.window === 'object' ? r3(r.cmp.window.argminQKm) : null)], ['winArgminEcc', (r) => (typeof r.cmp?.window === 'object' ? r3(r.cmp.window.argminEcc) : null)],
];
const files = [];
for (const f of fs.readdirSync(here)) if (/^xr2-outbound-\d+of\d+\.json$/.test(f)) fs.rmSync(path.join(here, f));
for (const st of states) {
  const name = `xr2-outbound-${st.shard}of${st.of}.json`;
  fs.writeFileSync(path.join(here, name), `${JSON.stringify({ schema: 'aster-s20-longrun2-xr2-outbound/1', label: LABEL, shard: st.shard, of: st.of, state: st.state, order: 'catalog order; this shard holds catalog positions p with p % of == shard', columns: COLS.map(([n]) => n), rows: shardRows.get(st.shard).map((r) => COLS.map(([, p]) => p(r))) })}\n`);
  files.push({ file: name, bytes: fs.statSync(path.join(here, name)).size, rows: shardRows.get(st.shard).length, sha256: sha256File(path.join(here, name)) });
}

const summary = {
  schema: 'aster-s20-longrun2-xr2-summary/1', label: LABEL, generatedAtUtc: new Date().toISOString(),
  state: complete ? 'COMPLETE' : `PARTIAL: ${rows.length} of ${total}`, bodies: rows.length, catalogBodies: total, node: states[0].node,
  definition: { flag: 'transfer perihelion below one solar radius AND the flown arc passes perihelion (LR1 definition; lib/common2.mjs cites the source lines)', constants: states[0].constants, perihelionHistogram: { ...Q_HIST, note: 'deciles are bin upper edges; 0.01 dex per bin (about 2.3% in perihelion distance)' } },
  shards: states.map((s) => ({ shard: s.shard, state: s.state, done: s.hist.bodiesInHist, total: s.total, secondsThisRun: s.secondsThisRun })),
  notPropagatable: rows.filter((r) => r.status === 'not-propagatable').map((r) => r.des),
  screeningGrid: { grid: states[0].screenGrid, solver: 'computePorkchopGrid -> lambert-multi-rev.ts at M=0 (the cache itself was built with izzo.ts)', ...screening },
  compareGrid: { grid: '731 departures 2026-01-01..2040-01-01 x 100 TOF 182.5-1826.25 d, production computeCompareData', ...compare },
  rulingCritical: critical,
  kernelMinC3VersusShippedCache: {
    note: 'bonus from the same sweep: the kernel (lambert-multi-rev, M=0) minimum over the screening grid against the shipped izzo value, ALL bodies. The kernel reaches each departure epoch through a Julian date, so its epochs differ from the script\'s by rounding (well under a millisecond); XR1 step 5 repeats this on identical epochs for 300 bodies.',
    bodies: kernelVsShipped.length, maxRelDiff: rels[rels.length - 1] ?? null, medianRelDiff: rels[Math.floor(rels.length / 2)] ?? null,
    sameArgminCell: kernelVsShipped.filter((x) => x.sameCell).length, differentArgminCell: kernelVsShipped.filter((x) => !x.sameCell).length,
    straddle25: kernelVsShipped.filter((x) => x.straddle).map((x) => ({ des: x.des, kernel: x.kernel, shipped: x.shipped })),
    largest10: kernelVsShipped.slice().sort((a, b) => b.rel - a.rel).slice(0, 10),
  },
  returnCensus: returnCensus ? { ...returnCensus, perBody: undefined } : null,
  files,
};
fs.writeFileSync(path.join(here, 'xr2-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

// ---- REPORT.md ------------------------------------------------------------------------------------
const n = (x) => (typeof x === 'number' ? x.toLocaleString('en-US') : String(x));
const pct = (x, d = 3) => (typeof x === 'number' ? `${(100 * x).toFixed(d)}%` : 'n/a');
const au = (x) => (typeof x === 'number' ? x.toPrecision(3) : 'n/a');
const L = [];
const row = (c) => L.push(`| ${c.join(' | ')} |`);
L.push('# XR2 — physical-validity census of the outbound and return grids');
L.push('');
L.push(`**${LABEL}**`);
L.push('');
L.push(`State: **${summary.state}** (outbound). A cell is *flagged* when its transfer orbit's perihelion is below one solar radius (${n(SOLAR_RADIUS_KM)} km) **and** the flown arc passes perihelion: LR1's definition, copied with its source lines cited in \`lib/common2.mjs\`.`);
L.push('');
L.push('## The ruling-critical count');
const c = critical;
L.push(`**Flagged cells that are, or are inside, a window the site shows: ${c.totalShownWindowsOrCellsFlagged}.**`);
L.push('');
row(['What is shown', 'checked', 'flagged']);
row(['---', '---:', '---:']);
row(['The cache\'s minC3 cell (one per body)', n(c.cacheMinC3Cell.bodiesChecked), n(c.cacheMinC3Cell.flagged)]);
row(['The cache\'s bestWindows (up to five per body)', n(c.cacheBestWindows.windowsChecked), n(c.cacheBestWindows.flaggedWindows)]);
row(['Compare\'s bestPractical window: the argmin cell', n(c.compareBestPractical.bodiesWithAWindow), n(c.compareBestPractical.argminFlagged)]);
row(['Compare\'s bestPractical window: any cell of the window', `${n(c.compareBestPractical.bodiesWithAWindow)} windows, ${n(c.compareBestPractical.windowCellsChecked)} cells`, `${n(c.compareBestPractical.windowsWithAFlaggedCell)} windows, ${n(c.compareBestPractical.flaggedCellsInsideWindows)} cells`]);
L.push('');
if (c.totalShownWindowsOrCellsFlagged === 0) {
  L.push(`**Zero.** No shipped minimum-C3 cell, no cached best window and no cell of any compare best-practical window flies through the Sun${complete ? '' : ' in the bodies processed so far'}. On this evidence a perihelion refusal would change no number the site shows today; it would only remove cells nobody is shown as a best window.`);
} else {
  L.push('Affected bodies, with what the site displays for them:');
  row(['Body', 'tier', 'class', 'status shown', 'C3 shown', 'where']);
  row(['---', '---', '---', '---', '---', '---']);
  for (const b of c.cacheMinC3Cell.bodies) row([b.des, b.tier, b.cls, b.status, b.c3Text, `cache minC3 cell ${b.minC3Date} + ${b.minC3TofDays} d`]);
  for (const b of c.cacheBestWindows.bodies) row([b.des, b.tier, b.cls, b.status, b.c3Text, b.flaggedWindows.map((w) => `bestWindows #${w.rank}: ${w.launchDate} + ${w.tofDays} d, C3 ${formatC3(w.c3)}`).join('; ')]);
  for (const b of c.compareBestPractical.bodies) row([b.des, b.tier, b.cls, b.status, b.c3Text, `compare window ${b.window.dep} + ${b.window.tofDays.toFixed(1)} d (C3 ${formatC3(b.window.c3)}): ${b.window.flaggedCells} of ${b.window.cells} cells flagged${b.window.argminFlagged ? ', INCLUDING the argmin' : ''}`]);
}
L.push('');
L.push(`Context: ${n(c.compareBestPractical.windowsWithACellBelowOneSolarRadiusNotFlown)} compare windows contain a cell whose orbit has its perihelion inside the Sun but whose flown arc does not reach it (not flagged). The smallest transfer perihelion inside any compare window is ${au(c.compareBestPractical.smallestWindowPerihelionAu)} AU. Cache cells that could not be matched to the swept grid: ${c.shippedCellsThatCouldNotBeMatchedToTheGrid}.`);
L.push('The V2 site reads the cache\'s status, minC3 and isCoOrbital; no non-test module reads `bestWindows`, and `minC3Date` / `minC3TofDays` are returned only by the MCP tool (see XR1).');
L.push('');
const gridBlock = (title, g, note) => {
  L.push(`## ${title}`);
  L.push(note);
  L.push('');
  const a = g.all;
  row(['', 'bodies', 'cells swept', 'converged', 'flagged', 'flagged share', 'bodies with >= 1 flagged', 'perihelion < 1 solar radius', '< 0.01 AU', '< 0.1 AU', 'hyperbolic']);
  row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
  const line = (name, s) => row([name, n(s.bodies), n(s.cells), n(s.converged), n(s.flagged), pct(s.flaggedShareOfConverged), n(s.bodiesWithFlagged), pct(s.belowSunShare), pct(s.below001AuShare), pct(s.below01AuShare, 2), n(s.hyperbolic)]);
  line('**all**', a);
  for (const [k, s] of Object.entries(g.byTier)) line(`tier ${k}`, s);
  for (const [k, s] of Object.entries(g.byOrbitClass)) line(`class ${k}`, s);
  L.push('');
  L.push(`Flagged cells per body: min ${g.flaggedCellsPerBody.min}, median ${g.flaggedCellsPerBody.median}, max ${g.flaggedCellsPerBody.max}.`);
  L.push('');
  L.push('Transfer perihelion over all converged cells, deciles in AU (bin upper edges, 0.01 dex bins):');
  row(['', 'p10', 'p20', 'p30', 'p40', 'p50', 'p60', 'p70', 'p80', 'p90']);
  row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
  const dl = (name, d) => { if (d) row([name, ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => au(d[`p${p}`]))]); };
  dl('**all**', a.perihelionDecilesAu);
  for (const [k, s] of Object.entries(g.byTier)) dl(`tier ${k}`, s.perihelionDecilesAu);
  for (const [k, s] of Object.entries(g.byOrbitClass)) dl(`class ${k}`, s.perihelionDecilesAu);
  L.push('');
};
gridBlock('Outbound, screening grid (the cache\'s grid)', screening, `783 departures (2026-01-01, 7 d steps) x 55 TOF (182 to 1802 d, 30 d steps) per body, swept with the production kernel \`computePorkchopGrid\` (lambert-multi-rev at M=0). The precompute script could not be instrumented without editing it. Bodies not propagatable: ${summary.notPropagatable.join(', ') || 'none'}.`);
gridBlock('Outbound, compare grid', compare, '731 departures x 100 TOF per body through the production `computeCompareData`, the grid the compare page computes live.');
const kv = summary.kernelMinC3VersusShippedCache;
L.push('## Bonus from the same sweep: kernel minimum C3 against the shipped cache, every body');
L.push(`${kv.note}`);
L.push(`Bodies ${n(kv.bodies)}: max relative difference ${kv.maxRelDiff?.toExponential(3)}, median ${kv.medianRelDiff?.toExponential(3)}; same argmin cell for ${n(kv.sameArgminCell)}, a different cell for ${n(kv.differentArgminCell)}; bodies on opposite sides of 25 km²/s²: ${kv.straddle25.length}${kv.straddle25.length ? ` (${kv.straddle25.map((x) => x.des).join(', ')})` : ''}.`);
L.push('');
if (returnCensus) {
  const rc = returnCensus;
  L.push('## Return grid, 400 seeded bodies');
  L.push(`State: ${rc.state}. ${rc.bodies} bodies drawn by one seeded shuffle of the catalog (seed ${rc.seed}; tiers ${Object.entries(rc.tierCounts).map(([k, v]) => `${k} ${v}`).join(', ')}), every admissible cell of the 731 x 100 return grid (${n(rc.admissibleCells)} cells; ${n(rc.refusedCells)} refused for Earth arrival after the fixture end), M=0 and M=1, every converged branch.`);
  L.push('');
  row(['Group', 'converged branches', 'perihelion < 1 solar radius', 'flagged', 'flagged share', 'flagged AND selected by the kernel', 'bodies with >= 1 flagged', 'LR1 (40 bodies, 150 cells each)']);
  row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---']);
  row(['M=0', n(rc.byGroup['M0 single'].converged), n(rc.byGroup['M0 single'].belowSun), n(rc.byGroup['M0 single'].flagged), pct(rc.byGroup['M0 single'].flaggedShare), n(rc.byGroup['M0 single'].flaggedSelected), n(rc.byGroup['M0 single'].bodiesWithFlagged), `17 of 6,000 (${pct(17 / 6000)})`]);
  row(['M=1 left', n(rc.byGroup['M1 left'].converged), n(rc.byGroup['M1 left'].belowSun), n(rc.byGroup['M1 left'].flagged), pct(rc.byGroup['M1 left'].flaggedShare), n(rc.byGroup['M1 left'].flaggedSelected), n(rc.byGroup['M1 left'].bodiesWithFlagged), '107 of 4,062']);
  row(['M=1 right', n(rc.byGroup['M1 right'].converged), n(rc.byGroup['M1 right'].belowSun), n(rc.byGroup['M1 right'].flagged), pct(rc.byGroup['M1 right'].flaggedShare), n(rc.byGroup['M1 right'].flaggedSelected), n(rc.byGroup['M1 right'].bodiesWithFlagged), '95 of 4,062']);
  row(['**all**', n(rc.all.convergedBranches), '', n(rc.all.flagged), pct(rc.all.flaggedShare), '', '', `219 of 14,124 (${pct(219 / 14124)})`]);
  L.push('');
  L.push(`Smallest asteroid-departure |v∞| on any flagged return branch: ${rc.minFlaggedVInfDepKmS.toFixed(3)} km/s (LR1 saw 9.307 km/s in its sample).`);
  L.push('');
}
L.push('## Files');
for (const f of files) L.push(`- \`${f.file}\` — ${f.rows} bodies, ${f.bytes} bytes, sha256 ${f.sha256}`);
L.push('- `xr2-summary.json` — every aggregate above; `xr2-return-census.json` — the return census with per-body counts.');
L.push('- `census-shard.mjs`, `return-census.mjs`, `summarize.mjs`; shared definitions in `../lib/common2.mjs`.');
L.push('');
fs.writeFileSync(path.join(here, 'REPORT.md'), `${L.join('\n')}\n`);
console.log(JSON.stringify({ state: summary.state, screening: { converged: screening.all.converged, flagged: screening.all.flagged, share: screening.all.flaggedShareOfConverged, bodiesWithFlagged: screening.all.bodiesWithFlagged }, compare: { converged: compare.all.converged, flagged: compare.all.flagged, share: compare.all.flaggedShareOfConverged }, critical: { total: c.totalShownWindowsOrCellsFlagged, minC3: c.cacheMinC3Cell.flagged, bestWindows: c.cacheBestWindows.flaggedWindows, compareWindows: c.compareBestPractical.windowsWithAFlaggedCell, argmin: c.compareBestPractical.argminFlagged, unmatched: c.shippedCellsThatCouldNotBeMatchedToTheGrid }, kernelVsShipped: { max: kv.maxRelDiff, differentCell: kv.differentArgminCell, straddle: kv.straddle25.length }, returnCensus: returnCensus ? { bodies: returnCensus.bodies, share: returnCensus.all.flaggedShare } : null, files: files.map((f) => [f.file, f.bytes]) }, null, 1));
