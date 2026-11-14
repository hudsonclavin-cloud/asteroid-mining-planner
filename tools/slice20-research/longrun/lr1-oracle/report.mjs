#!/usr/bin/env node
// LR1 step 4 — merge Aster cells with the poliastro results, compute deltas, write the committed
// dataset (gzip parts, each <= 10 MB), lr1-summary.json and REPORT.md. Every number in REPORT.md is
// printed from the summary object computed here; nothing is typed by hand.
//
// NO pass/fail threshold is set (dispatch LR1 step 4). "Outliers" are listed by a descriptive rule
// (more than 100x the metric's median), which is a reading aid, not a gate.
//
// Usage: node tools/slice20-research/longrun/lr1-oracle/report.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { quantile, scratchRoot, sha256File } from '../lib/common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const cells = JSON.parse(fs.readFileSync(path.join(scratchRoot, 'lr1', 'lr1-cells.json'), 'utf8'));
const oracle = JSON.parse(fs.readFileSync(path.join(scratchRoot, 'lr1', 'oracle-results.json'), 'utf8'));
if (cells.records.length !== oracle.results.length) throw new Error('cell/result count mismatch');

const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mag3 = (a) => Math.hypot(a[0], a[1], a[2]);
const OUTLIER_FACTOR = 100;
const MAX_LISTED = 25;

function compare(aster, other, rec) {
  if (!other || other.error) return { error: other ? other.error : 'missing' };
  const vInfDep = sub3(other.v1KmS, rec.vAsteroidDepKmS);
  const vInfArr = sub3(other.v2KmS, rec.vEarthArrKmS);
  // The same body velocity is subtracted on both sides, so |delta v-infinity| equals |delta v|;
  // computed from the v-infinity vectors anyway, because those are the quantities being compared.
  const dDep = mag3(sub3(vInfDep, aster.vInfAsteroidDepartureKmS));
  const dArr = mag3(sub3(vInfArr, aster.vInfEarthArrivalKmS));
  return {
    v1KmS: other.v1KmS,
    v2KmS: other.v2KmS,
    vInfAsteroidDepartureKmS: vInfDep,
    vInfEarthArrivalKmS: vInfArr,
    dVInfAsteroidDepartureKmS: dDep,
    dVInfEarthArrivalKmS: dArr,
    relDVInfEarthArrival: dArr / mag3(aster.vInfEarthArrivalKmS),
    relDV2: mag3(sub3(other.v2KmS, aster.v2KmS)) / mag3(aster.v2KmS),
  };
}

const merged = cells.records.map((rec, index) => {
  const res = oracle.results[index];
  if (res.id !== rec.id) throw new Error(`id mismatch at ${index}: ${rec.id} vs ${res.id}`);
  const out = { ...rec, izzoLowpath: res.izzoLowpath, izzo: compare(rec.aster, res.izzo, rec) };
  if (res.izzoOtherPath) out.izzoOtherPath = compare(rec.aster, res.izzoOtherPath, rec);
  if (rec.M === 0) {
    out.valladoShortWay = res.valladoShortWay;
    out.valladoDefault = compare(rec.aster, res.vallado_default, rec);
    out.valladoTight = compare(rec.aster, res.vallado_tight, rec);
  }
  out.transferOrbit = res.transferOrbit;
  out.closure = res.closure;
  return out;
});

// Perihelion bands of the TRANSFER orbit (from Aster's r1, v1). Descriptive strata, not a gate:
// both poliastro propagators lose accuracy when the transfer orbit is near-rectilinear.
const AU_KM = 149_597_870.7; // IAU 2012 astronomical unit
const SOLAR_RADIUS_KM = 695_700; // IAU 2015 nominal solar radius
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** How many times the flown arc (r1, v1) -> TOF passes the transfer orbit's perihelion (two-body). */
function perihelionPassages(r1, v1, tofSeconds, mu, eccentricity) {
  const r = mag3(r1);
  const energy = dot3(v1, v1) / 2 - mu / r;
  const rv = dot3(r1, v1);
  if (energy >= 0) {
    // hyperbolic or parabolic: one passage at most, and only when departing inbound
    if (rv >= 0) return 0;
    const a = -mu / (2 * energy); // negative
    const coshF = Math.max(1, (1 - r / a) / eccentricity);
    const F = Math.acosh(coshF);
    const timeToPerihelion = (eccentricity * Math.sinh(F) - F) / Math.sqrt(mu / (-a) ** 3);
    return tofSeconds > timeToPerihelion ? 1 : 0;
  }
  const a = -mu / (2 * energy);
  const n = Math.sqrt(mu / a ** 3);
  const cosE = Math.min(1, Math.max(-1, (1 - r / a) / eccentricity));
  let E = Math.acos(cosE);
  if (rv < 0) E = 2 * Math.PI - E;
  const meanAnomaly = E - eccentricity * Math.sin(E);
  return Math.floor((meanAnomaly + n * tofSeconds) / (2 * Math.PI));
}
for (const r of merged) {
  r.transferOrbit.arcPerihelionPassages = perihelionPassages(r.r1Km, r.aster.v1KmS, r.tofSeconds, cells.muSunKm3S2, r.transferOrbit.eccentricity);
}
const PERIHELION_BANDS = [
  { name: 'q < 1 solar radius AND the flown arc passes perihelion (arc goes inside the Sun)', test: (q, n) => q < SOLAR_RADIUS_KM && n >= 1 },
  { name: 'q < 1 solar radius, flown arc does not reach perihelion (out-and-back arc)', test: (q, n) => q < SOLAR_RADIUS_KM && n < 1 },
  { name: '1 solar radius <= q < 0.1 AU', test: (q) => q >= SOLAR_RADIUS_KM && q < 0.1 * AU_KM },
  { name: 'q >= 0.1 AU', test: (q) => q >= 0.1 * AU_KM },
];

function stats(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (v.length === 0) return { n: 0 };
  const rms = Math.sqrt(v.reduce((acc, x) => acc + x * x, 0) / v.length);
  return { n: v.length, max: v[v.length - 1], rms, median: quantile(v, 0.5), p90: quantile(v, 0.9), p99: quantile(v, 0.99), min: v[0] };
}

function metric(label, rows, pick) {
  const withValue = rows.map((r) => ({ r, value: pick(r) })).filter((x) => Number.isFinite(x.value));
  const s = stats(withValue.map((x) => x.value));
  const cut = s.n > 0 ? OUTLIER_FACTOR * s.median : Infinity;
  const over = withValue.filter((x) => x.value > cut).sort((a, b) => b.value - a.value);
  const worst = withValue.slice().sort((a, b) => b.value - a.value).slice(0, 5);
  const describe = (x) => ({
    id: x.r.id, value: x.value, depDate: new Date((x.r.depJdTdb - 2440587.5) * 86400000).toISOString().slice(0, 10),
    tofDays: x.r.tofDays, x: x.r.x, vInfEarthArrivalKmS: mag3(x.r.aster.vInfEarthArrivalKmS),
    transferEccentricity: x.r.transferOrbit.eccentricity, transferPerihelionAu: x.r.transferOrbit.perihelionKm / AU_KM,
  });
  return { label, ...s, outlierRule: `> ${OUTLIER_FACTOR} x median`, outlierCut: cut, outlierCount: over.length, outliers: over.slice(0, MAX_LISTED).map(describe), worst5: worst.map(describe) };
}

const groups = {
  'M=0 single': merged.filter((r) => r.M === 0),
  'M=1 left': merged.filter((r) => r.M === 1 && r.branch === 'left'),
  'M=1 right': merged.filter((r) => r.M === 1 && r.branch === 'right'),
  all: merged,
};
const countErrors = (rows, key) => rows.filter((r) => r[key] && r[key].error).map((r) => ({ id: r.id, error: r[key].error }));

const summary = {
  schema: 'aster-s20-longrun-lr1-summary/1',
  label: 'LEADS-grade research evidence. Not a validation. No pass/fail threshold is set.',
  environment: 'CLOUD RUN (Linux container), not the laptop the dispatch names; waived by Hudson in-session 2026-11-14',
  headCommit: cells.headCommit,
  node: cells.node,
  oracleVersions: { python: oracle.python, poliastro: oracle.poliastro, numpy: oracle.numpy, astropy: oracle.astropy, scipy: oracle.scipy, numba: oracle.numba },
  seed: cells.seed,
  muSunKm3S2: cells.muSunKm3S2,
  grid: cells.grid,
  sampling: cells.sampling,
  kernelCheck: cells.checks,
  inputsSha256: cells.inputs,
  recordCount: merged.length,
  recordCountByGroup: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
  perBody: cells.perBody,
  izzo: {},
  izzoOtherPathDiagnostic: {},
  vallado: {},
  closure: {},
  errors: {
    izzo: countErrors(merged, 'izzo'),
    valladoDefault: countErrors(groups['M=0 single'], 'valladoDefault'),
    valladoTight: countErrors(groups['M=0 single'], 'valladoTight'),
    farnocchia: merged.filter((r) => r.closure.farnocchia.error).map((r) => ({ id: r.id, error: r.closure.farnocchia.error })),
    cowell: merged.filter((r) => r.closure.cowell.error).map((r) => ({ id: r.id, error: r.closure.cowell.error })),
  },
};
for (const [name, rows] of Object.entries(groups)) {
  summary.izzo[name] = {
    dVInfEarthArrivalKmS: metric('izzo |d v-inf Earth arrival| km/s', rows, (r) => r.izzo.dVInfEarthArrivalKmS),
    dVInfAsteroidDepartureKmS: metric('izzo |d v-inf asteroid departure| km/s', rows, (r) => r.izzo.dVInfAsteroidDepartureKmS),
    relDV2: metric('izzo |d v2| / |v2|', rows, (r) => r.izzo.relDV2),
  };
  summary.closure[name] = {
    farnocchiaMissKm: metric('farnocchia closure miss km', rows, (r) => r.closure.farnocchia.missKm),
    cowellMissKm: metric('cowell closure miss km', rows, (r) => r.closure.cowell.missKm),
    farnocchiaArrivalVelocityDiffKmS: metric('farnocchia |v_prop - v2| km/s', rows, (r) => r.closure.farnocchia.arrivalVelocityDiffKmS),
    energyRelDiff: metric('|E2-E1|/|E1|', rows, (r) => r.closure.energyRelDiff),
    angularMomentumRelDiff: metric('|h2-h1|/|h1|', rows, (r) => r.closure.angularMomentumRelDiff),
  };
}
summary.closureByTransferPerihelion = PERIHELION_BANDS.map((band) => {
  const rows = merged.filter((r) => band.test(r.transferOrbit.perihelionKm, r.transferOrbit.arcPerihelionPassages));
  return {
    band: band.name,
    n: rows.length,
    byGroup: { M0: rows.filter((r) => r.M === 0).length, M1left: rows.filter((r) => r.M === 1 && r.branch === 'left').length, M1right: rows.filter((r) => r.M === 1 && r.branch === 'right').length },
    selectedBranches: rows.filter((r) => r.selected).length,
    minVInfAsteroidDepartureKmS: rows.reduce((acc, r) => Math.min(acc, r.aster.vInfDepMagKernel), Infinity),
    farnocchiaMissKm: stats(rows.map((r) => r.closure.farnocchia.missKm)),
    cowellMissKm: stats(rows.map((r) => r.closure.cowell.missKm)),
    propagatorDisagreementKm: stats(rows.map((r) => r.closure.propagatorDisagreementKm)),
    izzoDVInfEarthArrivalKmS: stats(rows.map((r) => r.izzo.dVInfEarthArrivalKmS)),
    energyRelDiff: stats(rows.map((r) => r.closure.energyRelDiff)),
    maxEccentricity: rows.reduce((acc, r) => Math.max(acc, r.transferOrbit.eccentricity), 0),
    minPerihelionKm: rows.reduce((acc, r) => Math.min(acc, r.transferOrbit.perihelionKm), Infinity),
    bodies: [...new Set(rows.map((r) => r.designation))].length,
  };
});
summary.transferOrbitConstants = { auKm: AU_KM, solarRadiusKm: SOLAR_RADIUS_KM };
summary.propagatorDisagreementKm = metric('|r_farnocchia - r_cowell| km', merged, (r) => r.closure.propagatorDisagreementKm);
for (const name of ['M=1 left', 'M=1 right']) {
  const rows = groups[name].filter((r) => r.izzoOtherPath && !r.izzoOtherPath.error);
  const s = stats(rows.map((r) => r.izzoOtherPath.dVInfEarthArrivalKmS));
  summary.izzoOtherPathDiagnostic[name] = {
    note: 'Aster branch vs the OTHER poliastro lowpath value; large values confirm the a-priori branch mapping matters and was not chosen by closeness',
    n: s.n, min: s.min, median: s.median, max: s.max,
    otherPathErrors: groups[name].filter((r) => r.izzoOtherPath && r.izzoOtherPath.error).length,
  };
}
const m0 = groups['M=0 single'];
for (const key of ['valladoDefault', 'valladoTight']) {
  summary.vallado[key] = {
    settings: oracle.valladoSettings[key === 'valladoDefault' ? 'default' : 'tight'],
    shortWayCells: m0.filter((r) => r.valladoShortWay).length,
    longWayCells: m0.filter((r) => !r.valladoShortWay).length,
    dVInfEarthArrivalKmS: metric(`${key} |d v-inf Earth arrival| km/s`, m0, (r) => r[key].dVInfEarthArrivalKmS),
    dVInfAsteroidDepartureKmS: metric(`${key} |d v-inf asteroid departure| km/s`, m0, (r) => r[key].dVInfAsteroidDepartureKmS),
    relDV2: metric(`${key} |d v2| / |v2|`, m0, (r) => r[key].relDV2),
  };
}

// ---- committed dataset: gzip parts, each <= 10 MB ---------------------------------------------
const LIMIT = 9_500_000;
const header = {
  schema: 'aster-s20-longrun-lr1-oracle/1',
  label: summary.label,
  environment: summary.environment,
  headCommit: cells.headCommit,
  seed: cells.seed,
  muSunKm3S2: cells.muSunKm3S2,
  frame: cells.frame,
  kernel: cells.kernel,
  earthLookup: cells.earthLookup,
  oracleVersions: summary.oracleVersions,
  izzoSettings: oracle.izzoSettings,
  valladoSettings: oracle.valladoSettings,
  cowellRtol: oracle.cowellRtol,
  grid: cells.grid,
  sampling: cells.sampling,
  fieldNotes: {
    aster: 'Aster (production kernel) Lambert endpoint velocities and the recomputed v-infinity vectors',
    izzo: 'poliastro izzo.lambert velocities, its v-infinity vectors (same body velocity subtracted) and |delta| to Aster',
    valladoDefault: 'M=0 only; poliastro vallado.lambert defaults', valladoTight: 'M=0 only; numiter=200, rtol=1e-12',
    closure: "Aster's (r1, v1) propagated two-body for the TOF; miss to r2; energy / angular momentum between Aster's endpoint states",
  },
};
for (const name of fs.readdirSync(here)) {
  if (/^lr1-oracle\.part\d+of\d+\.json\.gz$/.test(name)) fs.rmSync(path.join(here, name));
}
let parts = [];
for (let n = 1; n <= 16; n += 1) {
  parts = [];
  const size = Math.ceil(merged.length / n);
  let ok = true;
  for (let p = 0; p < n; p += 1) {
    const slice = merged.slice(p * size, (p + 1) * size);
    const gz = zlib.gzipSync(Buffer.from(`${JSON.stringify({ ...header, part: p + 1, parts: n, recordCount: slice.length, records: slice })}\n`, 'utf8'), { level: 9 });
    if (gz.length > LIMIT) { ok = false; break; }
    parts.push({ name: `lr1-oracle.part${p + 1}of${n}.json.gz`, gz, records: slice.length });
  }
  if (ok) break;
}
summary.datasetParts = parts.map((p) => {
  fs.writeFileSync(path.join(here, p.name), p.gz);
  return { file: p.name, bytes: p.gz.length, records: p.records, sha256: sha256File(path.join(here, p.name)) };
});
fs.writeFileSync(path.join(here, 'lr1-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

// ---- REPORT.md ---------------------------------------------------------------------------------
const e = (x) => (x === null || x === undefined || !Number.isFinite(x) ? 'n/a' : x.toExponential(3));
const lines = [];
const row = (cols) => lines.push(`| ${cols.join(' | ')} |`);
lines.push('# LR1 — K1 return-leg oracle dataset (LEADS-grade, not a validation)');
lines.push('');
lines.push(`Run: CLOUD container (Linux, node ${cells.node}), not the laptop the dispatch names; tripwire (a) waived by Hudson in-session 2026-11-14.`);
lines.push(`Repo HEAD ${cells.headCommit} (origin/main). Oracle: poliastro ${oracle.poliastro}, numpy ${oracle.numpy}, astropy ${oracle.astropy}, scipy ${oracle.scipy}, numba ${oracle.numba}, python ${oracle.python}.`);
lines.push('**No pass/fail threshold is set in this run. The numbers below are stated, not judged.** The Slice 11 precedent (3.35e-14) is context, not a gate.');
lines.push('');
lines.push('## What ran');
lines.push(`- Bodies: ${cells.perBody.length} (tier counts ${JSON.stringify(cells.sampling.tierCount)}; seed ${cells.seed}). Required bodies present: ${cells.sampling.required.join(', ')}.`);
lines.push(`- Return grid: ${cells.grid.nDep} asteroid-departure dates ${cells.grid.departureStartUtc}..${cells.grid.departureEndUtc} x ${cells.grid.nTof} TOF ${cells.grid.tofMinDays}-${cells.grid.tofMaxDays} d (${cells.grid.totalCells} cells).`);
lines.push(`- Refused by DEC-20-3 (Earth arrival after the fixture end ${cells.grid.earthFixtureLastDateTdb} TDB, JD ${cells.grid.earthFixtureLastJdTdb}): **${cells.grid.refusedCellsEarthArrivalAfterFixtureEnd}** of ${cells.grid.totalCells} cells; admissible ${cells.grid.admissibleCells}. The count is body-independent (grid geometry only).`);
lines.push(`- Sampled: ${cells.sampling.cellsPerBody} admissible cells per body, M = ${cells.sampling.mValues.join(', ')}; converged branches compared: **${merged.length}** (${Object.entries(summary.recordCountByGroup).filter(([k]) => k !== 'all').map(([k, v]) => `${k}: ${v}`).join('; ')}).`);
lines.push(`- Kernel check: converged branches where |recomputed v-infinity vector| differs from the kernel's own magnitude (exact float compare): ${cells.checks.kernelMagnitudeVsRecomputedVectorMismatches}.`);
if (cells.sampling.notes.length) lines.push(`- Sampling notes: ${cells.sampling.notes.join('; ')}.`);
lines.push('');
lines.push('## (a) Implementation agreement — poliastro izzo.lambert, full vectors');
row(['Group', 'n', 'max \\|Δv∞,E\\| km/s', 'RMS \\|Δv∞,E\\| km/s', 'max \\|Δv∞,ast-dep\\| km/s', 'RMS \\|Δv∞,ast-dep\\| km/s', 'max \\|Δv2\\|/\\|v2\\|']);
row(['---', '---:', '---:', '---:', '---:', '---:', '---:']);
for (const name of Object.keys(groups)) {
  const g = summary.izzo[name];
  row([name, g.dVInfEarthArrivalKmS.n, e(g.dVInfEarthArrivalKmS.max), e(g.dVInfEarthArrivalKmS.rms), e(g.dVInfAsteroidDepartureKmS.max), e(g.dVInfAsteroidDepartureKmS.rms), e(g.relDV2.max)]);
}
lines.push('');
lines.push(`izzo errors (poliastro raised): ${summary.errors.izzo.length}.`);
lines.push('Branch mapping was fixed a priori (right <-> lowpath=True, left <-> lowpath=False). Diagnostic, Aster branch against the OTHER lowpath value:');
for (const [name, d] of Object.entries(summary.izzoOtherPathDiagnostic)) {
  lines.push(`- ${name}: n ${d.n}, min ${e(d.min)}, median ${e(d.median)}, max ${e(d.max)} km/s (other-path solver errors: ${d.otherPathErrors}).`);
}
lines.push('');
lines.push('## (b) Formulation independence, M = 0 — poliastro vallado.lambert (universal variables)');
row(['Setting', 'n solved', 'errors', 'max \\|Δv∞,E\\| km/s', 'RMS \\|Δv∞,E\\| km/s', 'max \\|Δv∞,ast-dep\\| km/s', 'RMS \\|Δv∞,ast-dep\\| km/s']);
row(['---', '---:', '---:', '---:', '---:', '---:', '---:']);
for (const key of ['valladoDefault', 'valladoTight']) {
  const g = summary.vallado[key];
  row([`${key} (numiter ${g.settings.numiter}, rtol ${g.settings.rtol})`, g.dVInfEarthArrivalKmS.n, summary.errors[key].length, e(g.dVInfEarthArrivalKmS.max), e(g.dVInfEarthArrivalKmS.rms), e(g.dVInfAsteroidDepartureKmS.max), e(g.dVInfAsteroidDepartureKmS.rms)]);
}
lines.push('');
lines.push(`Short-way / long-way cells among M=0: ${summary.vallado.valladoDefault.shortWayCells} / ${summary.vallado.valladoDefault.longWayCells} (the vallado flag is derived from (r1 x r2).z, see oracle_driver.py).`);
lines.push('');
lines.push("## (c) Endpoint closure — Aster's departure state propagated two-body for the TOF");
row(['Group', 'n', 'farnocchia max miss km', 'farnocchia RMS miss km', `cowell (rtol ${oracle.cowellRtol}) max miss km`, 'cowell RMS miss km', 'max \\|ΔE\\|/\\|E\\|', 'max \\|Δh\\|/\\|h\\|']);
row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
for (const name of Object.keys(groups)) {
  const g = summary.closure[name];
  row([name, g.farnocchiaMissKm.n, e(g.farnocchiaMissKm.max), e(g.farnocchiaMissKm.rms), e(g.cowellMissKm.max), e(g.cowellMissKm.rms), e(g.energyRelDiff.max), e(g.angularMomentumRelDiff.max)]);
}
lines.push('');
lines.push(`Propagator errors: farnocchia ${summary.errors.farnocchia.length}, cowell ${summary.errors.cowell.length}.`);
lines.push('');
lines.push('### Closure by transfer-orbit perihelion (descriptive strata, not a gate)');
lines.push("The largest misses sit on cells whose Lambert transfer orbit is near-rectilinear: eccentricity ~0.99999 and a perihelion inside the Sun. On those cells the two poliastro propagators land far from EACH OTHER, so the miss there measures the propagators, not Aster. `propagator disagreement` = |r_farnocchia - r_cowell|.");
lines.push('Whether the flown arc reaches that perihelion is computed per cell from (r1, v1, TOF): an M=0 out-and-back arc usually does not; an arc that does pass it goes inside the Sun and is not flyable.');
row(['Transfer perihelion q', 'cells (M0 / M1 left / M1 right)', 'bodies', 'farnocchia max / median miss km', 'cowell max / median miss km', 'propagator disagreement max / median km', 'izzo max \\|Δv∞,E\\| km/s', 'max \\|ΔE\\|/\\|E\\|', 'max e', 'min q km']);
row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
for (const b of summary.closureByTransferPerihelion) {
  row([b.band, `${b.n} (${b.byGroup.M0} / ${b.byGroup.M1left} / ${b.byGroup.M1right})`, b.bodies, `${e(b.farnocchiaMissKm.max)} / ${e(b.farnocchiaMissKm.median)}`, `${e(b.cowellMissKm.max)} / ${e(b.cowellMissKm.median)}`, `${e(b.propagatorDisagreementKm.max)} / ${e(b.propagatorDisagreementKm.median)}`, e(b.izzoDVInfEarthArrivalKmS.max), e(b.energyRelDiff.max), b.n ? b.maxEccentricity.toFixed(8) : 'n/a', b.n ? b.minPerihelionKm.toFixed(0) : 'n/a']);
}
lines.push('');
lines.push(`Constants for the strata: AU ${AU_KM} km, nominal solar radius ${SOLAR_RADIUS_KM} km.`);
{
  const inside = summary.closureByTransferPerihelion[0];
  lines.push(`Read against the kernel: grid-compute.ts and lambert-multi-rev.ts contain no check on the transfer orbit's perihelion, so the ${inside.n} sampled branches in the first row (${(100 * inside.n / merged.length).toFixed(2)}% of ${merged.length}) are reported as converged although the arc passes inside the Sun. ${inside.selectedBranches} of them are the branch the kernel selects for its cell; the smallest asteroid-departure |v∞| among them is ${Number.isFinite(inside.minVInfAsteroidDepartureKmS) ? inside.minVInfAsteroidDepartureKmS.toFixed(3) : 'n/a'} km/s.`);
}
lines.push('');
lines.push('## Outliers and errors (every one listed, or the first 25 with the total)');
lines.push(`Rule: a cell is listed when its value exceeds ${OUTLIER_FACTOR} x the metric's median in its group. This is a reading aid, not a threshold.`);
const byId = new Map(merged.map((r) => [r.id, r]));
const outlierBlocks = [
  ['(a) izzo |Δv∞,E|', (name) => summary.izzo[name].dVInfEarthArrivalKmS],
  ['(a) izzo |Δv∞,ast-dep|', (name) => summary.izzo[name].dVInfAsteroidDepartureKmS],
  ['(c) farnocchia miss', (name) => summary.closure[name].farnocchiaMissKm],
  ['(c) cowell miss', (name) => summary.closure[name].cowellMissKm],
];
for (const [title, pick] of outlierBlocks) {
  for (const name of ['M=0 single', 'M=1 left', 'M=1 right']) {
    const m = pick(name);
    lines.push(`- ${title}, ${name}: median ${e(m.median)}, p99 ${e(m.p99)}, max ${e(m.max)}; ${m.outlierCount} cell(s) above the rule.`);
    for (const o of m.outliers) lines.push(`  - \`${o.id}\` value ${e(o.value)} (dep ${o.depDate}, TOF ${o.tofDays.toFixed(2)} d, x ${o.x.toFixed(6)}, |v∞,E| ${o.vInfEarthArrivalKmS.toFixed(4)} km/s, transfer e ${o.transferEccentricity.toFixed(7)}, q ${o.transferPerihelionAu.toExponential(2)} AU)`);
    if (m.outlierCount > m.outliers.length) lines.push(`  - ... ${m.outlierCount - m.outliers.length} more in lr1-summary.json / the dataset`);
  }
}
for (const key of ['valladoDefault', 'valladoTight']) {
  const m = summary.vallado[key].dVInfEarthArrivalKmS;
  lines.push(`- (b) ${key} |Δv∞,E|, M=0: median ${e(m.median)}, p99 ${e(m.p99)}, max ${e(m.max)}; ${m.outlierCount} cell(s) above the rule; solver errors ${summary.errors[key].length}.`);
  for (const o of m.outliers) lines.push(`  - \`${o.id}\` value ${e(o.value)} (dep ${o.depDate}, TOF ${o.tofDays.toFixed(2)} d, x ${o.x.toFixed(6)}, |v∞,E| ${o.vInfEarthArrivalKmS.toFixed(4)} km/s, transfer e ${o.transferEccentricity.toFixed(7)}, q ${o.transferPerihelionAu.toExponential(2)} AU)`);
  if (m.outlierCount > m.outliers.length) lines.push(`  - ... ${m.outlierCount - m.outliers.length} more in lr1-summary.json / the dataset`);
  const errs = summary.errors[key];
  for (const er of errs.slice(0, MAX_LISTED)) {
    const rec = byId.get(er.id);
    lines.push(`  - error \`${er.id}\`: ${er.error} (transfer e ${rec.transferOrbit.eccentricity.toFixed(7)}, q ${(rec.transferOrbit.perihelionKm / AU_KM).toExponential(2)} AU, TOF ${rec.tofDays.toFixed(2)} d)`);
  }
  if (errs.length > MAX_LISTED) lines.push(`  - ... ${errs.length - MAX_LISTED} more errors in lr1-summary.json`);
}
lines.push('');
lines.push('## Per-body convergence (Aster kernel)');
row(['Body', 'tier', 'class', 'M=0 ok / no-solution / stall', 'M=1 ok / no-solution / stall', 'M=1 branches converged / not']);
row(['---', '---', '---', '---', '---', '---']);
for (const b of cells.perBody) {
  const a = b.byM.M0; const c = b.byM.M1;
  row([b.designation, b.tier, b.orbitClass, `${a.cellsOk} / ${a.cellsNoSolution} / ${a.cellsStall}`, `${c.cellsOk} / ${c.cellsNoSolution} / ${c.cellsStall}`, `${c.branchesConverged} / ${c.branchesNotConverged}`]);
}
lines.push('');
lines.push('## Files');
for (const p of summary.datasetParts) lines.push(`- \`${p.file}\` — ${p.bytes} bytes gzip, ${p.records} records, sha256 ${p.sha256}`);
lines.push('- `lr1-summary.json` — every aggregate in this report, uncompressed.');
lines.push('- `build-cells.mjs`, `oracle_driver.py`, `report.mjs` — the three steps; see README.md.');
lines.push('');
fs.writeFileSync(path.join(here, 'REPORT.md'), `${lines.join('\n')}\n`);
console.log(JSON.stringify({
  records: merged.length,
  parts: summary.datasetParts.map((p) => [p.file, p.bytes]),
  izzoAll: { maxArr: summary.izzo.all.dVInfEarthArrivalKmS.max, rmsArr: summary.izzo.all.dVInfEarthArrivalKmS.rms, maxDep: summary.izzo.all.dVInfAsteroidDepartureKmS.max },
  valladoTight: { n: summary.vallado.valladoTight.dVInfEarthArrivalKmS.n, max: summary.vallado.valladoTight.dVInfEarthArrivalKmS.max, errors: summary.errors.valladoTight.length },
  valladoDefault: { n: summary.vallado.valladoDefault.dVInfEarthArrivalKmS.n, max: summary.vallado.valladoDefault.dVInfEarthArrivalKmS.max, errors: summary.errors.valladoDefault.length },
  closureAll: { farnocchiaMax: summary.closure.all.farnocchiaMissKm.max, cowellMax: summary.closure.all.cowellMissKm.max, energyMax: summary.closure.all.energyRelDiff.max, hMax: summary.closure.all.angularMomentumRelDiff.max },
  errors: Object.fromEntries(Object.entries(summary.errors).map(([k, v]) => [k, v.length])),
}, null, 2));
