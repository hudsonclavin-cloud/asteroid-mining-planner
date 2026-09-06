#!/usr/bin/env node
/**
 * MEASUREMENT — two-body Keplerian propagation drift vs JPL Horizons truth.
 * Dispatch: 2026-08-24 "TWO-BODY PROPAGATION DRIFT vs HORIZONS".
 *
 * Repo READ-ONLY. This script lives OUTSIDE the repo and writes only:
 *   - <this dir>/build-v2/            (tsc output of src/v2 propagator, OUTSIDE the repo)
 *   - <this dir>/two-body-drift-results.json
 *
 * Repo math only (INV-024 / dispatch C3):
 *   - propagateKeplerianStateVectors  src/v2/core/propagators/keplerian.ts:195 (compiled, not reimplemented)
 *   - cartesianToElements             tools/slice7-research/state-to-elements.mjs:65 (imported directly)
 * Method precedent: tools/slice7-research/measure-keplerian-anchored.mjs (anchor -> derive -> propagate -> |dr|).
 *
 * Frame handling (dispatch 2.4): NO transform of our own. cartesianToElements takes the
 * fixture's equatorial-ICRF state and itself rotates equatorial->ecliptic (state-to-elements.mjs:55-81,
 * comment: "Invert that here so the returned elements round-trip through the existing propagator
 * unchanged"); propagateKeplerianStateVectors then rotates ecliptic->equatorial once and returns
 * FRAME_HELIO_J2000_ICRF (keplerian.ts:146-158, 270). Fixture frame: "ICRF/J2000" (fixture header).
 *
 * Units: fixture positions km, velocities km/s, time TDB Julian Date (fixture "units" block).
 * Propagator input aM = a_km * 1000 (m); epochTdbSeconds = (jd - 2451545.0) * 86400
 * (src/v2/core/units.ts:1-2). Propagator output positionM (m) -> /1000 -> km. All drift in km.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const FIXTURE = path.join(REPO, 'src/v2/data/horizons-inner-solar-system-2026-2040.json');
const BUILD = path.join(__dirname, 'build-v2'); // OUTSIDE the repo
const RESULTS_JSON = path.join(__dirname, 'two-body-drift-results.json');

const J2000_TDB_JD = 2451545.0;   // src/v2/core/units.ts:1
const SECONDS_PER_DAY = 86400;    // src/v2/core/units.ts:2

// ---------- 1. compile the repo's propagator OUT OF the repo (repo precedent:
// tools/build/precompute-lambert-screen.mjs; AGENTS.md §2.2: process.execPath +
// full tsc bin path, never .bin shims) ----------
fs.rmSync(BUILD, { recursive: true, force: true });
fs.mkdirSync(BUILD, { recursive: true });
const tscBin = path.join(REPO, 'node_modules', 'typescript', 'bin', 'tsc');
const tsc = spawnSync(process.execPath, [
  tscBin,
  '--pretty', 'false',
  '--outDir', BUILD,
  '--rootDir', path.join(REPO, 'src', 'v2'),
  '--module', 'NodeNext',
  '--target', 'ES2020',
  '--moduleResolution', 'NodeNext',
  '--isolatedModules', 'true',
  path.join(REPO, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
], { encoding: 'utf8' });
if (tsc.status !== 0) {
  console.error('tsc failed:', tsc.stdout, tsc.stderr);
  process.exit(1);
}

const { propagateKeplerianStateVectors } = await import(
  pathToFileURL(path.join(BUILD, 'core', 'propagators', 'keplerian.js')).href
);
const { cartesianToElements } = await import(
  pathToFileURL(path.join(REPO, 'tools', 'slice7-research', 'state-to-elements.mjs')).href
);

// ---------- 2. load truth ----------
const fixture = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));
if (fixture.frame !== 'ICRF/J2000') throw new Error(`unexpected fixture frame ${fixture.frame}`);
if (fixture.units.position !== 'km' || fixture.units.velocity !== 'km/s') {
  throw new Error(`unexpected fixture units ${JSON.stringify(fixture.units)}`);
}

// Heliocentric bodies only: sun is center @ssb (barycentric), moon is 500@399
// (geocentric) — two-body heliocentric propagation is a category error for both.
const BODIES = ['mercury', 'venus', 'earth', 'mars'];
for (const b of BODIES) {
  const center = fixture.targets[b].center;
  if (center !== '@sun') throw new Error(`${b} center is ${center}, expected @sun`);
}

function jdToIsoApprox(jd) {
  // display-only calendar label for a TDB JD (TDB-UTC ~69 s, immaterial for a date label)
  return new Date((jd - 2440587.5) * 86400000).toISOString().slice(0, 10);
}

function elementsFromRecord(rec) {
  // rec = [jd, x_km, y_km, z_km, vx_kms, vy_kms, vz_kms] (fixture units block)
  const el = cartesianToElements({
    position_km: [rec[1], rec[2], rec[3]],
    velocity_km_per_s: [rec[4], rec[5], rec[6]],
    epoch_tdb_jd: rec[0],
  });
  // -> src/v2 propagator input shape (core/constants/asteroids.ts:15-23)
  return {
    aM: el.a * 1000,          // km -> m
    e: el.e,
    iRad: el.i,
    omRad: el.om,
    wRad: el.w,
    maRad: el.ma,
    epochTdbSeconds: (el.epoch_tdb_jd - J2000_TDB_JD) * SECONDS_PER_DAY,
  };
}

function driftSeries(records, anchorIndex) {
  const el = elementsFromRecord(records[anchorIndex]);
  const out = new Array(records.length);
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const tdbSeconds = (rec[0] - J2000_TDB_JD) * SECONDS_PER_DAY;
    const p = propagateKeplerianStateVectors(el, tdbSeconds);
    const dx = p.positionM.x / 1000 - rec[1];   // m -> km, then difference in km
    const dy = p.positionM.y / 1000 - rec[2];
    const dz = p.positionM.z / 1000 - rec[3];
    out[i] = Math.hypot(dx, dy, dz);
  }
  return out;
}

const YEAR_DAYS = 365; // fixture cadence is exactly 1 day/record; "+1 year" = +365 records
const results = {};

for (const body of BODIES) {
  const records = fixture.targets[body].records;
  const n = records.length;

  // ----- Step 3: anchor at FIRST epoch -----
  const dA = driftSeries(records, 0);
  const sanityKm = dA[0]; // 3.6 gate
  const milestonesA = {
    'sanity_at_anchor_km': sanityKm,
    '+1y_km': dA[YEAR_DAYS],
    '+5y_km': dA[5 * YEAR_DAYS],
    '+10y_km': dA[10 * YEAR_DAYS],
    'final_(+5478d≈15.0y)_km': dA[n - 1],
  };
  let maxKm = -1, maxIdx = -1;
  for (let i = 0; i < n; i++) if (dA[i] > maxKm) { maxKm = dA[i]; maxIdx = i; }

  // yearly samples + per-year window max for shape description
  const yearly = [];
  for (let y = 0; y <= 15; y++) {
    const idx = Math.min(y * YEAR_DAYS, n - 1);
    let wMax = 0;
    for (let i = Math.max(0, idx - YEAR_DAYS); i <= idx; i++) wMax = Math.max(wMax, dA[i]);
    yearly.push({ year: y, at_km: dA[idx], window_max_km: wMax });
  }

  // ----- Step 4: anchor at MIDDLE epoch, forward + backward -----
  const mid = Math.floor((n - 1) / 2); // index 2739
  const dB = driftSeries(records, mid);
  const sanityMidKm = dB[mid];
  const elapsed = (i) => Math.abs(i - mid); // days
  const milestonesB = {
    'sanity_at_anchor_km': sanityMidKm,
    'fwd_+1y_km': dB[mid + YEAR_DAYS],
    'fwd_+5y_km': dB[mid + 5 * YEAR_DAYS],
    ['fwd_end_(+' + (n - 1 - mid) + 'd)_km']: dB[n - 1],
    'bwd_-1y_km': dB[mid - YEAR_DAYS],
    'bwd_-5y_km': dB[mid - 5 * YEAR_DAYS],
    ['bwd_start_(-' + mid + 'd)_km']: dB[0],
  };

  results[body] = {
    records: n,
    anchor_first: {
      anchor_jd: records[0][0],
      anchor_date: jdToIsoApprox(records[0][0]),
      milestones_km: milestonesA,
      max_drift_km: maxKm,
      max_drift_at_jd: records[maxIdx][0],
      max_drift_at_date: jdToIsoApprox(records[maxIdx][0]),
      max_drift_at_elapsed_days: maxIdx,
      yearly,
    },
    anchor_mid: {
      anchor_index: mid,
      anchor_jd: records[mid][0],
      anchor_date: jdToIsoApprox(records[mid][0]),
      milestones_km: milestonesB,
    },
    anchor_comparison_same_elapsed: {
      '1y: firstFwd / midFwd / midBwd (km)': [dA[YEAR_DAYS], dB[mid + YEAR_DAYS], dB[mid - YEAR_DAYS]],
      '5y: firstFwd / midFwd / midBwd (km)': [dA[5 * YEAR_DAYS], dB[mid + 5 * YEAR_DAYS], dB[mid - 5 * YEAR_DAYS]],
      '7y: firstFwd / midFwd / midBwd (km)': [dA[7 * YEAR_DAYS], dB[mid + 7 * YEAR_DAYS], dB[mid - 7 * YEAR_DAYS]],
    },
  };
}

fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2));
console.log('results written:', RESULTS_JSON);

// console summary
for (const [body, r] of Object.entries(results)) {
  const m = r.anchor_first.milestones_km;
  console.log(`\n=== ${body} (anchor ${r.anchor_first.anchor_date}, JD ${r.anchor_first.anchor_jd}) ===`);
  console.log(`  SANITY drift at anchor epoch: ${m['sanity_at_anchor_km'].toExponential(3)} km`);
  console.log(`  +1y ${m['+1y_km'].toFixed(1)} km | +5y ${m['+5y_km'].toFixed(1)} km | +10y ${m['+10y_km'].toFixed(1)} km | final(≈15y) ${m['final_(+5478d≈15.0y)_km'].toFixed(1)} km`);
  console.log(`  max ${r.anchor_first.max_drift_km.toFixed(1)} km at ${r.anchor_first.max_drift_at_date} (elapsed ${r.anchor_first.max_drift_at_elapsed_days} d)`);
  console.log(`  yearly at-mark km: ${r.anchor_first.yearly.map(y => y.at_km.toFixed(0)).join(', ')}`);
  const c = r.anchor_comparison_same_elapsed;
  console.log(`  anchors@1y  [firstFwd, midFwd, midBwd]: ${c['1y: firstFwd / midFwd / midBwd (km)'].map(v => v.toFixed(1)).join(' / ')}`);
  console.log(`  anchors@5y  [firstFwd, midFwd, midBwd]: ${c['5y: firstFwd / midFwd / midBwd (km)'].map(v => v.toFixed(1)).join(' / ')}`);
  console.log(`  anchors@7y  [firstFwd, midFwd, midBwd]: ${c['7y: firstFwd / midFwd / midBwd (km)'].map(v => v.toFixed(1)).join(' / ')}`);
}
