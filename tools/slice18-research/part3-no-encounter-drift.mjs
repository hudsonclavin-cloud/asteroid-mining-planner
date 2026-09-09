#!/usr/bin/env node
/**
 * PART 3 (gated) — what predicts drift for bodies with NO labelled close approach,
 * and does the delta-v estimate reproduce the measured cliff?
 * Repo READ-ONLY. Derived in-repo math only (delta-v formula derived below, not imported).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = 'C:/Users/hudso/Documents/aster-slice18/build-v2x';
const OUT = 'C:/Users/hudso/Documents/aster-slice18/audit/part3-results.json';
const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { ingestSlice2Fixture } = await imp('boundary/horizons.js');
const { ingestSlice9Fixture } = await imp('boundary/slice9-nea-catalog.js');

const AU = 149597870.7;
const SPD = 86400;
const J2000 = 2451545.0;

const truth = JSON.parse(fs.readFileSync(path.join(REPO, 'tests/fixtures/v2/nea-drift-truth-2026-2046.json'), 'utf8'));
const drift = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/slice18-research/nea-drift-results.json'), 'utf8'));
const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')));
const catByDes = new Map(Object.values(catalog.asteroids).map((b) => [b.designation, b]));
const planets = ingestSlice2Fixture(JSON.parse(fs.readFileSync(path.join(REPO, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8')));

// planet positions (km) at each JD, from the 1-day series by nearest sample (7-day truth grid: nearest is exact-day match)
function planetPosByJd(name) {
  const map = new Map();
  for (const s of planets[name]) {
    const jd = J2000 + s.state.tdbSeconds / SPD;
    map.set(Math.round(jd * 2) / 2, [s.state.positionM.x / 1000, s.state.positionM.y / 1000, s.state.positionM.z / 1000]);
  }
  return map;
}
const P = { mercury: planetPosByJd('mercury'), venus: planetPosByJd('venus'), earth: planetPosByJd('earth'), mars: planetPosByJd('mars') };
const GM = { mercury: 22031.868551, venus: 324858.592, earth: 398600.435507, mars: 42828.375816 }; // km^3/s^2, JPL DE values (audit-side reference, not repo code)

// 3.1 —— per-NEA minimum distance to each inner planet over 2026-2040 (fixture coverage), from data
const rows = [];
for (const [des, t] of Object.entries(truth.targets)) {
  if (t.band !== 'nea') continue;
  const cat = catByDes.get(des);
  const aAU = cat.elements.aM / 1000 / AU;
  const e = cat.elements.e;
  const minDist = { mercury: Infinity, venus: Infinity, earth: Infinity, mars: Infinity };
  for (const r of t.records) {
    const jd = r[0];
    for (const pn of Object.keys(P)) {
      const pp = P[pn].get(jd);
      if (!pp) continue;
      const d = Math.hypot(r[1] - pp[0], r[2] - pp[1], r[3] - pp[2]);
      if (d < minDist[pn]) minDist[pn] = d;
    }
  }
  // strongest encounter influence proxy: max GM/d among inner planets (from data), plus Q for Jupiter
  let maxPerturb = 0, maxPerturbPlanet = null;
  for (const pn of Object.keys(minDist)) {
    const inf = GM[pn] / minDist[pn];
    if (Number.isFinite(inf) && inf > maxPerturb) { maxPerturb = inf; maxPerturbPlanet = pn; }
  }
  rows.push({
    des,
    hasLabelledCA: (t.closeApproaches || []).length > 0,
    e, aAU: +aAU.toFixed(3), qAU: +(aAU * (1 - e)).toFixed(3), QAU: +(aAU * (1 + e)).toFixed(3),
    iDeg: +((cat.elements.iRad * 180) / Math.PI).toFixed(2),
    minEarthKm: Math.round(minDist.earth), minVenusKm: Math.round(minDist.venus),
    minMarsKm: Math.round(minDist.mars), minMercKm: Math.round(minDist.mercury),
    maxPerturbPlanet, maxPerturbGMoverD: maxPerturb,
    maxDriftKm: drift.bodies[des].A_primaryAnchor.max_km,
    drift5yKm: drift.bodies[des].A_primaryAnchor.fwd_5y_km,
  });
}

function spearman(xs, ys) {
  const rank = (arr) => {
    const idx = arr.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
    const out = new Array(arr.length);
    idx.forEach(([, i], k) => { out[i] = k; });
    return out;
  };
  const rx = rank(xs), ry = rank(ys), n = xs.length;
  const mx = (n - 1) / 2, my = (n - 1) / 2;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i += 1) { num += (rx[i] - mx) * (ry[i] - my); dx += (rx[i] - mx) ** 2; dy += (ry[i] - my) ** 2; }
  return num / Math.sqrt(dx * dy);
}

const noCA = rows.filter((r) => !r.hasLabelledCA);
const vars = ['e', 'aAU', 'qAU', 'QAU', 'iDeg', 'minEarthKm', 'minVenusKm', 'maxPerturbGMoverD'];
const correlations = {};
for (const v of vars) {
  correlations[v] = {
    noCA_maxDrift: +spearman(noCA.map((r) => r[v]), noCA.map((r) => r.maxDriftKm)).toFixed(3),
    all17_maxDrift: +spearman(rows.map((r) => r[v]), rows.map((r) => r.maxDriftKm)).toFixed(3),
  };
}

// 3.2 —— delta-v estimate vs measured rate change, derived here:
// hyperbolic flyby: tan(theta/2) = mu/(d*vrel^2); dv = 2*vrel*sin(theta/2).
// Small-angle: dv ~ 2*mu/(d*vrel). Post-encounter drift growth ~ dv per unit time.
const YEAR_S = 365.25 * SPD;
function dvKms(muKm3S2, dKm, vrelKms) {
  const tanHalf = muKm3S2 / (dKm * vrelKms * vrelKms);
  const theta = 2 * Math.atan(tanHalf);
  return 2 * vrelKms * Math.sin(theta / 2);
}
const dvCases = [];
const CASES = [
  { des: '99942', d: 38011, vrel: 7.42, mu: GM.earth, measuredRateAfterKmYr: 226e6, measuredRateBeforeKmYr: 44e3 },
  { des: '2012 UE34', d: 109649, vrel: 6.12, mu: GM.earth, measuredRateAfterKmYr: 39.9e6, measuredRateBeforeKmYr: 2.66e6 },
  { des: '2025 HH', d: 126825, vrel: 7.98, mu: GM.earth, measuredRateAfterKmYr: 12e6, measuredRateBeforeKmYr: 0.2e6, note: 'window-edge limited' },
  { des: '163693 (Venus, distant)', d: 11.91e6, vrel: 13.0, mu: GM.venus, measuredRateAfterKmYr: null, measuredRateBeforeKmYr: null, note: 'no measurable change observed' },
  { des: '2019 SE9 (Earth, distant)', d: 5.06e6, vrel: 7.0, mu: GM.earth, measuredRateAfterKmYr: null, measuredRateBeforeKmYr: null, note: 'no measurable change observed' },
];
for (const c of CASES) {
  const dv = dvKms(c.mu, c.d, c.vrel);
  const predRate = dv * YEAR_S; // km/yr
  dvCases.push({
    ...c,
    dvKms: +dv.toFixed(4),
    predictedRateKmYr: Math.round(predRate),
    measuredOverPredicted: c.measuredRateAfterKmYr === null ? null : +(c.measuredRateAfterKmYr / predRate).toFixed(2),
  });
}

const results = { rows, correlations, dvCases };
fs.writeFileSync(OUT, JSON.stringify(results, null, 1));

console.log('=== 3.1 no-labelled-CA bodies (' + noCA.length + ' of ' + rows.length + ' NEAs) ===');
for (const r of noCA.sort((a, b) => b.maxDriftKm - a.maxDriftKm)) {
  console.log('  ' + r.des.padEnd(11) + 'max=' + (r.maxDriftKm / 1e6).toFixed(2).padStart(7) + 'M km  e=' + r.e.toFixed(3) + ' Q=' + String(r.QAU).padStart(7) + ' AU  minEarth=' + (r.minEarthKm / 1e6).toFixed(1) + 'M km  maxPerturb=' + r.maxPerturbPlanet);
}
console.log('\n=== Spearman correlations vs max drift ===');
for (const [v, c] of Object.entries(correlations)) console.log('  ' + v.padEnd(20) + 'noCA(n=' + noCA.length + '): ' + String(c.noCA_maxDrift).padStart(7) + '   all17: ' + String(c.all17_maxDrift).padStart(7));
console.log('\n=== 3.2 delta-v cliff test ===');
for (const c of dvCases) console.log('  ' + String(c.des).padEnd(24) + 'dv=' + String(c.dvKms).padStart(8) + ' km/s  predicted ' + String((c.predictedRateKmYr / 1e6).toFixed(1)).padStart(7) + 'M km/yr  measured/predicted=' + (c.measuredOverPredicted ?? 'n/a') + '  ' + (c.note ?? ''));
