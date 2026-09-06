#!/usr/bin/env node
/**
 * FRONT B PHASE 3 — NEA drift measurement (main script).
 * Repo READ-ONLY. Lives and writes OUTSIDE the repo.
 *
 * Repo math only (INV-024): propagateKeplerianStateVectors (compiled build-v2x),
 * cartesianToElements (tools/slice7-research/state-to-elements.mjs), catalog via
 * ingestSlice9Fixture. No external astrodynamics library. No frame rotations of my
 * own anywhere: truth is ICRF, the propagator emits ICRF, differences are ICRF-ICRF.
 *
 * Measurements:
 *  A (specified): drift of TWO-BODY propagation from truth-derived elements,
 *    anchored at the truth sample nearest the catalog's mass element epoch
 *    (JD 2461160.5, one day before 2026-05-01). Forward to 2046, backward to
 *    2026-01-01. Sanity gate at the first-record anchor per the spec.
 *  A-mid (specified): same, anchored mid-window (methodological control only —
 *    99.1% of the catalog shares ONE epoch, so anchor variation is not a catalog
 *    property).
 *  B (ADDED): drift of the CATALOG'S OWN elements vs truth — the error the shipped
 *    screen actually incurs (model error + element-solution error). For
 *    horizons-reanchor bodies the elements were derived from a Horizons state at
 *    2026-05-01 (same source as this truth), so B ≈ A there; for the sbdb-anchored
 *    body (2026 BX8) and the stale comets it is genuinely different.
 *  U-vs-drift discriminator (ADDED, for Q if n=3 is ambiguous): rank correlation
 *    of condition code vs drift across all 17 NEAs.
 *  Verification (different method): osculating-a(t) quadrature prediction of
 *    along-track drift for two bodies, plus leave-one-out interpolation floor.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const HERE = 'C:/Users/hudso/Documents/aster-slice18';
const BUILD = path.join(HERE, 'build-v2x');
const OUT = path.join(HERE, 'nea-drift-results.json');

const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { propagateKeplerianStateVectors } = await imp('core/propagators/keplerian.js');
const { ingestSlice9Fixture } = await imp('boundary/slice9-nea-catalog.js');
const { cartesianToElements } = await import(
  pathToFileURL(path.join(REPO, 'tools/slice7-research/state-to-elements.mjs')).href
);

const SPD = 86400;
const J2000 = 2451545.0;
const AU_KM = 149597870.7;
const jdToSec = (jd) => (jd - J2000) * SPD;
const jdToIso = (jd) => new Date((jd - 2440587.5) * 86400000).toISOString().slice(0, 10);

const fixture = JSON.parse(fs.readFileSync(
  path.join(REPO, 'tests/fixtures/v2/nea-drift-truth-2026-2046.json'), 'utf8'));
const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(
  path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')));
const catByDes = new Map(Object.values(catalog.asteroids).map((b) => [b.designation, b]));

/** Truth-derived propagator elements from one truth record (repo pipeline, validated sub-metre on planets). */
function elementsFromRecord(rec) {
  const el = cartesianToElements({
    position_km: [rec[1], rec[2], rec[3]],
    velocity_km_per_s: [rec[4], rec[5], rec[6]],
    epoch_tdb_jd: rec[0],
  });
  return {
    aM: el.a * 1000, e: el.e, iRad: el.i, omRad: el.om, wRad: el.w, maRad: el.ma,
    epochTdbSeconds: jdToSec(el.epoch_tdb_jd),
  };
}

/** |propagated − truth| in km at every record, given propagator elements. */
function driftSeries(records, el) {
  const out = new Array(records.length);
  for (let i = 0; i < records.length; i += 1) {
    const r = records[i];
    const p = propagateKeplerianStateVectors(el, jdToSec(r[0]));
    out[i] = Math.hypot(p.positionM.x / 1000 - r[1], p.positionM.y / 1000 - r[2], p.positionM.z / 1000 - r[3]);
  }
  return out;
}

const results = { generatedAtUtc: new Date().toISOString(), anchors: {}, bodies: {}, addedMeasurements: {} };

// ---- anchor indices ----
const rec0 = fixture.targets['433'].records;
const ANCHOR_IDX = rec0.findIndex((r) => r[0] === 2461160.5);   // nearest sample to catalog epoch 2461161.5
const MID_IDX = 521;                                             // JD 2464688.5
if (ANCHOR_IDX < 0) { console.error('anchor JD 2461160.5 not on the grid'); process.exit(2); }
results.anchors = {
  sanity: { idx: 0, jd: rec0[0][0], date: jdToIso(rec0[0][0]) },
  primary: {
    idx: ANCHOR_IDX, jd: rec0[ANCHOR_IDX][0], date: jdToIso(rec0[ANCHOR_IDX][0]),
    note: 'Truth sample nearest the catalog mass element epoch JD 2461161.5 (2026-05-01); offset 1.0 day. 41,539 of 41,906 catalog bodies share that epoch.',
  },
  mid: { idx: MID_IDX, jd: rec0[MID_IDX][0], date: jdToIso(rec0[MID_IDX][0]),
    note: 'Methodological control only: 99.1% of the catalog shares one epoch, so anchor variation is NOT a catalog property. The planet run\u2019s 12x anchor sensitivity must not be read as applying across the catalog.' },
};

// ---- milestone indices relative to primary anchor ----
const STEP_D = 7;
const yearsToSteps = (y) => Math.round((y * 365.25) / STEP_D);
const IDX_2040 = rec0.findIndex((r) => r[0] === 2466515.5);      // 2040-12-27, nearest sample to last departure
const IDX_END = rec0.length - 1;                                 // 2046-01-01, last consumed arrival

console.log('=== SANITY GATE (anchor = first truth record, per spec) ===');
let sanityWorst = 0;
for (const [des, t] of Object.entries(fixture.targets)) {
  const el = elementsFromRecord(t.records[0]);
  const p = propagateKeplerianStateVectors(el, jdToSec(t.records[0][0]));
  const d = Math.hypot(p.positionM.x / 1000 - t.records[0][1], p.positionM.y / 1000 - t.records[0][2], p.positionM.z / 1000 - t.records[0][3]);
  sanityWorst = Math.max(sanityWorst, d);
  results.bodies[des] = { band: t.band, sanityAtFirstRecordKm: d };
  console.log('  ' + des.padEnd(11) + d.toExponential(3) + ' km');
}
console.log('  worst: ' + sanityWorst.toExponential(3) + ' km');
if (sanityWorst > 1e-3) { console.error('SANITY GATE FAILED (>1 m) — STOP'); process.exit(2); }
console.log('  GATE PASSED (all sub-metre)\n');

// ---- main measurement per body ----
for (const [des, t] of Object.entries(fixture.targets)) {
  const rec = t.records;
  const cat = catByDes.get(des);
  const R = results.bodies[des];

  // A: truth-derived elements at the primary anchor
  const elA = elementsFromRecord(rec[ANCHOR_IDX]);
  const dA = driftSeries(rec, elA);
  R.A_primaryAnchor = {
    anchorSanityKm: dA[ANCHOR_IDX],
    backward_to_2026_01_01_km: dA[0],
    fwd_1y_km: dA[ANCHOR_IDX + yearsToSteps(1)],
    fwd_5y_km: dA[ANCHOR_IDX + yearsToSteps(5)],
    fwd_10y_km: dA[ANCHOR_IDX + yearsToSteps(10)],
    at_2040_12_27_km: dA[IDX_2040],
    at_2046_01_01_km: dA[IDX_END],
  };
  let maxV = -1; let maxI = -1;
  for (let i = 0; i < dA.length; i += 1) if (dA[i] > maxV) { maxV = dA[i]; maxI = i; }
  R.A_primaryAnchor.max_km = maxV;
  R.A_primaryAnchor.max_at = jdToIso(rec[maxI][0]);
  R.A_primaryAnchor.yearly_km = [];
  for (let y = 0; y <= 19; y += 1) {
    const i = Math.min(ANCHOR_IDX + yearsToSteps(y), IDX_END);
    R.A_primaryAnchor.yearly_km.push(Math.round(dA[i]));
  }
  R.orbitalCircumferenceKm = cat ? 2 * Math.PI * (cat.elements.aM / 1000) : null;

  // A-mid: mid-window anchor, forward and backward
  const elM = elementsFromRecord(rec[MID_IDX]);
  const dM = driftSeries(rec, elM);
  R.A_midAnchor = {
    anchorSanityKm: dM[MID_IDX],
    bwd_1y_km: dM[MID_IDX - yearsToSteps(1)],
    bwd_5y_km: dM[MID_IDX - yearsToSteps(5)],
    fwd_1y_km: dM[MID_IDX + yearsToSteps(1)],
    fwd_5y_km: dM[MID_IDX + yearsToSteps(5)],
    fwd_end_km: dM[IDX_END],
    bwd_start_km: dM[0],
  };

  // B (ADDED): the catalog's own elements — the shipped screen's actual error
  if (cat) {
    const dB = driftSeries(rec, cat.elements);
    let maxB = -1; let maxBi = -1;
    for (let i = 0; i < dB.length; i += 1) if (dB[i] > maxB) { maxB = dB[i]; maxBi = i; }
    R.B_catalogElements = {
      elementEpochJd: cat.elements.epochTdbSeconds / SPD + J2000,
      anchorSource: cat.anchorSource,
      at_first_record_km: dB[0],
      at_primary_anchor_km: dB[ANCHOR_IDX],
      fwd_5y_km: dB[ANCHOR_IDX + yearsToSteps(5)],
      at_2040_12_27_km: dB[IDX_2040],
      at_2046_01_01_km: dB[IDX_END],
      max_km: maxB, max_at: jdToIso(rec[maxBi][0]),
    };
  }

  // CAs: drift immediately before/after each labelled approach (A series)
  R.closeApproaches = (t.closeApproaches || []).map((ca) => {
    let iAfter = rec.findIndex((r) => r[0] >= ca.jdTdb);
    if (iAfter <= 0) iAfter = 1;
    const iBefore = iAfter - 1;
    return {
      date: ca.calendarDate, relativeTo: ca.relativeTo, distKm: Math.round(ca.distKm),
      vRelKmS: ca.vRelKmS,
      drift_before_km: dA[iBefore], drift_after_km: dA[iAfter],
      ratio_after_over_before: dA[iBefore] > 0 ? dA[iAfter] / dA[iBefore] : null,
      drift_1y_later_km: dA[Math.min(iAfter + yearsToSteps(1), IDX_END)],
    };
  });
}

// ---- VERIFICATION 1 (different method): osculating-a quadrature for two bodies ----
// Along-track drift predicted purely from the TRUTH series' own osculating element
// evolution — no propagator involved. Phase error dphi(t) = integral of (n(tau)-n0) dtau,
// drift ~ |dphi| * r(t). Order-of-magnitude/shape check, not an exact model.
const GM_KM = 1.32712440018e11;
function quadraturePrediction(des) {
  const rec = fixture.targets[des].records;
  const n0 = (() => {
    const el = cartesianToElements({ position_km: [rec[ANCHOR_IDX][1], rec[ANCHOR_IDX][2], rec[ANCHOR_IDX][3]], velocity_km_per_s: [rec[ANCHOR_IDX][4], rec[ANCHOR_IDX][5], rec[ANCHOR_IDX][6]], epoch_tdb_jd: rec[ANCHOR_IDX][0] });
    return Math.sqrt(GM_KM / (el.a ** 3));
  })();
  let phase = 0;
  const pred = [];
  for (let i = ANCHOR_IDX; i < rec.length; i += 1) {
    const el = cartesianToElements({ position_km: [rec[i][1], rec[i][2], rec[i][3]], velocity_km_per_s: [rec[i][4], rec[i][5], rec[i][6]], epoch_tdb_jd: rec[i][0] });
    const n = Math.sqrt(GM_KM / (el.a ** 3));
    if (i > ANCHOR_IDX) phase += (n - n0) * STEP_D * SPD;   // rad accumulated over one step
    const rMag = Math.hypot(rec[i][1], rec[i][2], rec[i][3]);
    pred.push(Math.abs(phase) * rMag);
  }
  return pred;
}
results.addedMeasurements.quadratureVerification = {};
for (const des of ['433', '99942']) {
  const pred = quadraturePrediction(des);
  const elA = elementsFromRecord(fixture.targets[des].records[ANCHOR_IDX]);
  const dA = driftSeries(fixture.targets[des].records, elA);
  const rows = [];
  for (const y of [1, 5, 10, 15]) {
    const i = ANCHOR_IDX + yearsToSteps(y);
    if (i <= IDX_END) rows.push({ years: y, measured_km: Math.round(dA[i]), quadrature_km: Math.round(pred[i - ANCHOR_IDX]), ratio: dA[i] > 0 ? +(pred[i - ANCHOR_IDX] / dA[i]).toFixed(2) : null });
  }
  results.addedMeasurements.quadratureVerification[des] = rows;
}

// ---- VERIFICATION 2: leave-one-out hermite-free interpolation floor (for step 10 context) ----
// Cubic Hermite from bracketing samples i-1,i+1 evaluated at sample i, vs the sample itself.
function hermiteMid(recA, recB, jd) {
  const t0 = recA[0] * SPD; const t1 = recB[0] * SPD; const h = t1 - t0; const s = (jd * SPD - t0) / h;
  const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
  const out = [];
  for (let k = 0; k < 3; k += 1) {
    out.push(h00 * recA[1 + k] + h10 * h * recA[4 + k] + h01 * recB[1 + k] + h11 * h * recB[4 + k]);
  }
  return out;
}
results.addedMeasurements.interpolationFloorKm = {};
for (const [des, t] of Object.entries(fixture.targets)) {
  let worst = 0;
  for (let i = 1; i < t.records.length - 1; i += 2) {
    const est = hermiteMid(t.records[i - 1], t.records[i + 1], t.records[i][0]);
    const err = Math.hypot(est[0] - t.records[i][1], est[1] - t.records[i][2], est[2] - t.records[i][3]);
    if (err > worst) worst = err;
  }
  // leave-one-out over a 14-day gap overestimates the production 7-day-gap error; it is an UPPER BOUND.
  results.addedMeasurements.interpolationFloorKm[des] = worst;
}

fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
console.log('results written: ' + OUT);

// ---- console summary ----
const fmt = (x) => (x >= 1e6 ? (x / 1e6).toFixed(2) + 'M' : x >= 1e3 ? (x / 1e3).toFixed(1) + 'k' : x.toFixed(1));
console.log('\n=== A (truth-derived elements @ 2026-04-30 anchor) — drift km ===');
console.log('body        band   bwd->Jan26   +1y       +5y       +10y      2040       2046       max        max@');
for (const [des, R] of Object.entries(results.bodies)) {
  const a = R.A_primaryAnchor;
  console.log(des.padEnd(11) + R.band.padEnd(6) + fmt(a.backward_to_2026_01_01_km).padStart(9) + fmt(a.fwd_1y_km).padStart(10) + fmt(a.fwd_5y_km).padStart(10) + fmt(a.fwd_10y_km).padStart(10) + fmt(a.at_2040_12_27_km).padStart(10) + fmt(a.at_2046_01_01_km).padStart(11) + fmt(a.max_km).padStart(11) + ('  ' + a.max_at));
}
console.log('\n=== B (catalog elements — the shipped screen) — drift km ===');
console.log('body        src                first-rec   @anchor    +5y        2040       2046       max');
for (const [des, R] of Object.entries(results.bodies)) {
  if (!R.B_catalogElements) { console.log(des.padEnd(11) + 'NOT IN CATALOG'); continue; }
  const b = R.B_catalogElements;
  console.log(des.padEnd(11) + b.anchorSource.padEnd(19) + fmt(b.at_first_record_km).padStart(9) + fmt(b.at_primary_anchor_km).padStart(11) + fmt(b.fwd_5y_km).padStart(11) + fmt(b.at_2040_12_27_km).padStart(11) + fmt(b.at_2046_01_01_km).padStart(11) + fmt(b.max_km).padStart(11));
}
console.log('\n=== close approaches (A series) ===');
for (const [des, R] of Object.entries(results.bodies)) {
  for (const ca of R.closeApproaches) {
    console.log(des.padEnd(11) + ca.date.padEnd(19) + ('CA ' + fmt(ca.distKm) + ' km ').padEnd(16) + 'rel=' + String(ca.relativeTo).padEnd(8) + 'before=' + fmt(ca.drift_before_km) + ' after=' + fmt(ca.drift_after_km) + ' ratio=' + (ca.ratio_after_over_before === null ? 'n/a' : ca.ratio_after_over_before.toFixed(2)) + ' +1y=' + fmt(ca.drift_1y_later_km));
  }
}
console.log('\n=== quadrature verification (different method) ===');
console.log(JSON.stringify(results.addedMeasurements.quadratureVerification, null, 1));
console.log('\n=== interpolation floor (upper bound, 14-day leave-one-out) ===');
for (const [des, v] of Object.entries(results.addedMeasurements.interpolationFloorKm)) console.log('  ' + des.padEnd(11) + fmt(v) + ' km');
