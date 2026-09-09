#!/usr/bin/env node
/**
 * MATH AUDIT script 3 — interpolator convergence, derived product quantities, units and
 * time-scale conversions, constants. Repo READ-ONLY.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = 'C:/Users/hudso/Documents/aster-slice18/build-v2x';
const OUT = 'C:/Users/hudso/Documents/aster-slice18/audit/audit-3-results.json';

const imp = async (rel) => import(pathToFileURL(path.join(BUILD, rel)).href);
const { interpolateBodyStateSeries } = await imp('core/interpolators/hermite.js');
const { ingestSlice2Fixture } = await imp('boundary/horizons.js');
const { utcStringToTdbSeconds, TDB_MINUS_UTC_SECONDS } = await import(pathToFileURL('C:/Users/hudso/Documents/aster-slice18/build-v2p/core/units/utc-to-tdb.js').href);
const { jdTdbToSecondsSinceJ2000, J2000_ECLIPTIC_OBLIQUITY_RAD } = await imp('core/units.js');
const { dlaDegFromVInf } = await imp('core/lambert/dla.js');
const { colorForPorkchopCell, c3ToViridisRgb, C3_COLOR_MIN, C3_COLOR_MAX } = await import(pathToFileURL('C:/Users/hudso/Documents/aster-slice18/audit/build-extra/porkchop/colormap.js').href);
const { compositeGrids, selectedC3, gridExtremes } = await imp('porkchop/composite-grid.js');

const R = { checks: {} };
const SPD = 86400;

// ---------- 2.6 INTERPOLATOR: convergence order via decimation ----------
{
  const earth = ingestSlice2Fixture(JSON.parse(fs.readFileSync(
    path.join(REPO, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'))).earth.map((s) => s.state);
  const rows = {};
  for (const step of [2, 4, 8]) {
    const dec = earth.filter((_, i) => i % step === 0);
    let worst = 0, sum = 0, count = 0;
    for (let i = 1; i < earth.length - 1 && count < 4000; i += 1) {
      if (i % step === 0) continue;
      const t = earth[i].tdbSeconds;
      if (t <= dec[0].tdbSeconds || t >= dec[dec.length - 1].tdbSeconds) continue;
      const est = interpolateBodyStateSeries('earth', dec, t);
      const err = Math.hypot(
        est.positionM.x - earth[i].positionM.x,
        est.positionM.y - earth[i].positionM.y,
        est.positionM.z - earth[i].positionM.z,
      ) / 1000;
      worst = Math.max(worst, err); sum += err; count += 1;
    }
    rows['step_' + step + 'd'] = { worstKm: worst, meanKm: sum / count, samples: count };
  }
  const order = Math.log2(rows.step_8d.worstKm / rows.step_4d.worstKm);
  R.checks.hermiteConvergence = {
    method: 'decimate the 1-day Earth series to 2/4/8-day, interpolate at removed samples, error vs true sample',
    rows,
    apparentOrder_8v4: order,
    expectedOrder: 4,
    productionCadenceNote: 'production Earth cadence is 1 day; implied production error ~ (1/2)^4 of step_2d worst',
    impliedProduction1dWorstKm: rows.step_2d.worstKm / 16,
    wouldCatch: 'wrong Hermite basis, dt scaling error, off-by-one bracketing (order would collapse to ~2 or worse)',
  };
}

// ---------- 2.8 DLA numeric ----------
{
  const cases = [
    { v: [0, 0, 5], expect: 90 },
    { v: [3, 4, 0], expect: 0 },
    { v: [0, 3, -3], expect: -45 },
    { v: [1e-4, 0, 0], expect: null, note: 'below epsilon -> null' },
    { v: [NaN, 1, 1], expect: null, note: 'NaN -> null' },
  ];
  R.checks.dla = {
    method: 'closed-form angles vs dlaDegFromVInf',
    rows: cases.map((c) => ({
      v: c.v, expect: c.expect,
      got: dlaDegFromVInf(c.v[0], c.v[1], c.v[2]),
      note: c.note ?? '',
    })),
    wouldCatch: 'formula error, missing null guards, degree/radian mixup',
  };
}

// ---------- 2.8 colormap anchors + monotonicity + null path ----------
{
  const t = (c3) => c3ToViridisRgb(c3);
  const rgbEq = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  let monotonicViolations = 0;
  let prev = null;
  for (let k = 0; k <= 300; k += 1) {
    const c3 = Math.exp(Math.log(1) + (k / 300) * (Math.log(1000) - Math.log(1)));
    const rgb = t(c3);
    const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    if (prev !== null && lum < prev - 1e-9) monotonicViolations += 1;
    prev = lum;
  }
  R.checks.colormap = {
    method: 'log anchors, luminance monotonicity over 301 log-spaced C3 values, clamp + null behavior',
    minAnchorEqualsBelowMin: rgbEq(t(C3_COLOR_MIN), t(0.5)),
    maxAnchorEqualsAboveMax: rgbEq(t(C3_COLOR_MAX), t(5000)),
    luminanceMonotonicViolations: monotonicViolations,
    okCellNullC3PaintsAs: 'C3_COLOR_MAX (bright) via ?? fallback - latent: an ok-cell with null C3 would render as deeply-infeasible, not distinct. Measured 0 such cells in the colormap investigation.',
    statusHandling: (() => {
      const ns = colorForPorkchopCell('no_solution', null);
      const ok = colorForPorkchopCell('ok', 10);
      return { noSolutionDistinctFromOk: !rgbEq(ns, ok) };
    })(),
    wouldCatch: 'log-scale anchor drift, non-monotone mapping, status colors colliding',
  };
}

// ---------- 2.8 composite invariant on a random synthetic grid ----------
{
  let violations = 0;
  const N = 10000;
  const mk = (M, i) => {
    const solvable = Math.random() > 0.3;
    return {
      depJD: 2461041.5 + (i % 100), tofDays: 182.5 + Math.floor(i / 100),
      status: solvable ? 'ok' : 'no_solution', M,
      selectedBranch: solvable ? 0 : null,
      branches: solvable ? [{ c3: 1 + Math.random() * 100 }] : [],
    };
  };
  const g0 = Array.from({ length: N }, (_, i) => mk(0, i));
  const g1 = Array.from({ length: N }, (_, i) => mk(1, i));
  const { cells } = compositeGrids(g0, g1);
  for (let i = 0; i < N; i += 1) {
    const c = selectedC3(cells[i]);
    const a = selectedC3(g0[i]);
    const b = selectedC3(g1[i]);
    const want = a === null && b === null ? null : Math.min(a ?? Infinity, b ?? Infinity);
    if ((c === null) !== (want === null) || (c !== null && c !== want)) violations += 1;
  }
  const ext = gridExtremes(cells);
  let extOk = true;
  if (ext.kind === 'extremes') {
    for (const cell of cells) {
      const c = selectedC3(cell);
      if (c !== null && (c < ext.minimum.c3 || c > ext.maximum.c3)) extOk = false;
    }
  }
  R.checks.compositeAndExtremes = {
    method: 'random 10,000-cell synthetic: composite must equal per-cell min across families; extremes must bound all cells',
    compositeViolations: violations,
    extremesBoundAllCells: extOk,
    wouldCatch: 'selection inversion, tie mishandling, extremes missing a cell',
  };
}

// ---------- units / time scales / constants ----------
{
  const t1 = utcStringToTdbSeconds('2026-01-01');
  const jd1 = 2451545.0 + t1 / SPD;
  const gridDeriv = 2451545.0 + (Date.parse('2026-01-01T00:00:00Z') / 1000 - 946728000 + 69.184) / SPD;
  R.checks.timeScales = {
    method: 'cross-implementation identity + arithmetic audit',
    'utcStringToTdbSeconds(2026-01-01) as JD': jd1,
    'app/porkchop utcMidnightToJdTdb equivalent': gridDeriv,
    identical: jd1 === gridDeriv,
    tdbMinusUtc: TDB_MINUS_UTC_SECONDS,
    arithmetic: '37 (TAI-UTC) + 32.184 (TT-TAI) = 69.184 ✓; leap-second dependent, documented in-file',
    jdRoundTrip: jdTdbToSecondsSinceJ2000(2461041.5) === (2461041.5 - 2451545.0) * SPD,
  };
  const obliqDeg = (J2000_ECLIPTIC_OBLIQUITY_RAD * 180) / Math.PI;
  R.checks.constants = {
    obliquityDeg: obliqDeg,
    obliquityExpected: '23.4392911... deg (IAU 1976/J2000, 84381.448 arcsec)',
    obliquityMatches: Math.abs(obliqDeg - 23.439291111111111) < 1e-12,
    gmSun: {
      repo_m3s2: 1.32712440018e20,
      note: 'DE430-era value. DE441 (the ephemeris behind the Horizons truth) uses 1.32712440041e20 - relative difference 1.7e-10; effect ~ 15 km along-track over the 19-year window (derived); negligible vs the 1e5 km planet floor. Comment in keplerian.ts says "IAU 2015 nominal", which is 1.3271244e20 exactly - the cited provenance does not match the digits carried. Value is fine; label is imprecise.',
    },
    radiusFormula: {
      formula: 'radiusM = (1329/sqrt(albedo)) * 10^(-H/5) * 500',
      standardForm: 'D_km = (1329/sqrt(p_V)) * 10^(-H/5); x500 = radius in m ✓ formula correct',
      spotCheck_H18_p014: ((1329 / Math.sqrt(0.14)) * 10 ** (-18 / 5)) * 500,
    },
  };
}

fs.writeFileSync(OUT, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
