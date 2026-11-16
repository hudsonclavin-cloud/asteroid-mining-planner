#!/usr/bin/env node
// N4 ENTRY-SPEED CONVENTION (Q3). From N2's Earth-return v-inf (Horizons states through the kernel), compute the
// entry speed under each candidate convention and compare with NHATS's published v_arr_earth ("Entry Speed").
//   node tools/slice20-research/nhats/n4-entry-convention/convention.mjs
// Uncontrolled trajectories (vrel_arr_earth = 0.000) test the convention; controlled ones (> 0) test how the
// entry-control dV is booked. Our v-inf carries N2's residual; the fitted-altitude intervals below use NHATS's
// rounding (+-0.0005 km/s) only and are widened separately by N2's own residual scale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonAtomic, quantile } from '../lib/aster.mjs';
import { MU_E, R_E_DEC20_8_KM, entrySpeed } from '../lib/legs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const n2 = JSON.parse(fs.readFileSync(path.join(here, '..', 'n2-agreement', 'n2-agreement.json'), 'utf8'));
const OMEGA = 7.292115e-5; // rad/s, Earth rotation (IERS)
const HALF = 0.0005;
const rows = n2.rows.map((r) => ({ des: r.des, kind: r.kind, vinf: r.q.vinf_ret_earth, nhText: r.cmp.v_arr_earth.nhatsText, nh: Number(r.cmp.v_arr_earth.nhatsText), ctrlText: r.cmp.vrel_arr_earth.nhatsText, ctrl: Number(r.cmp.vrel_arr_earth.nhatsText) }));
const unc = rows.filter((r) => r.ctrl === 0);
const con = rows.filter((r) => r.ctrl > 0);
const atmRel = (vInertial, rKm, mode, gammaDeg = -6) => {
  const u = OMEGA * rKm; const g = (gammaDeg * Math.PI) / 180;
  if (mode === 'east') return Math.sqrt(vInertial ** 2 - 2 * vInertial * u * Math.cos(g) + u * u);
  if (mode === 'west') return Math.sqrt(vInertial ** 2 + 2 * vInertial * u * Math.cos(g) + u * u);
  return Math.sqrt(vInertial ** 2 + u * u); // polar: crossing the equator heading north or south
};
const CANDIDATES = [
  ...[0, 80, 100, 120, 121.92, 125, 130, 150, 200].map((h) => [`inertial, ${h} km, R_E ${R_E_DEC20_8_KM} km${h === 125 ? ' (DEC-20-8)' : ''}${h === 121.92 ? ' (400,000 ft)' : ''}`, (v) => entrySpeed(v, h)]),
  ['inertial, 125 km, R_E 6378.137 km (WGS-84)', (v) => entrySpeed(v, 125, 6378.137)],
  ['inertial, 125 km, R_E 6371.0 km (mean)', (v) => entrySpeed(v, 125, 6371.0)],
  ['inertial, 121.92 km, R_E 6378.137 km', (v) => entrySpeed(v, 121.92, 6378.137)],
  ['atmosphere-relative, 125 km, equatorial eastward, gamma -6 deg', (v) => atmRel(entrySpeed(v, 125), R_E_DEC20_8_KM + 125, 'east')],
  ['atmosphere-relative, 125 km, equatorial westward, gamma -6 deg', (v) => atmRel(entrySpeed(v, 125), R_E_DEC20_8_KM + 125, 'west')],
  ['atmosphere-relative, 125 km, polar (equator crossing)', (v) => atmRel(entrySpeed(v, 125), R_E_DEC20_8_KM + 125, 'polar')],
  ['hyperbolic excess speed alone (no gravity term) - sanity, not a candidate', (v) => v],
];
const stat = (vals) => { const s = vals.slice().sort((a, b) => a - b); return { n: s.length, median: quantile(s, 0.5), p90: quantile(s, 0.9), max: s.length ? s[s.length - 1] : null, min: s[0] ?? null }; };
const scored = CANDIDATES.map(([name, f]) => {
  const res = unc.map((r) => r.nh - f(r.vinf));
  return { convention: name, residual_nhats_minus_candidate: { medianAbs: stat(res.map(Math.abs)).median, maxAbs: stat(res.map(Math.abs)).max, meanSigned: res.reduce((a, b) => a + b, 0) / (res.length || 1) }, nWithinRounding: res.filter((x) => Math.abs(x) <= HALF + 1e-12).length, n: res.length, perTrajectory: unc.map((r, i) => ({ des: r.des, kind: r.kind, nhats: r.nhText, candidate: f(r.vinf), residual: res[i] })) };
}).sort((a, b) => a.residual_nhats_minus_candidate.medianAbs - b.residual_nhats_minus_candidate.medianAbs);
// Fitted inertial interface altitude per trajectory: r = 2 mu / (v_EI^2 - v_inf^2), v_EI = NHATS text +- 0.0005.
const N2_VINF_SCALE = n2.perQuantity.vrel_dep_neo.absDiff.p90; // a residual scale for our v-inf from N2
const fit = unc.map((r) => {
  const rOf = (vEI, vinf) => (2 * MU_E) / (vEI * vEI - vinf * vinf);
  const alt = rOf(r.nh, r.vinf) - R_E_DEC20_8_KM;
  const lo = rOf(r.nh + HALF, r.vinf) - R_E_DEC20_8_KM; const hi = rOf(r.nh - HALF, r.vinf) - R_E_DEC20_8_KM;
  const loW = rOf(r.nh + HALF, r.vinf - N2_VINF_SCALE) - R_E_DEC20_8_KM; const hiW = rOf(r.nh - HALF, r.vinf + N2_VINF_SCALE) - R_E_DEC20_8_KM;
  return { des: r.des, kind: r.kind, vinf: r.vinf, nhats: r.nhText, fittedAltitudeKm: alt, intervalKm: [lo, hi], widenedIntervalKm: [loW, hiW] };
});
const inter = (key) => fit.reduce((acc, f) => [Math.max(acc[0], f[key][0]), Math.min(acc[1], f[key][1])], [-Infinity, Infinity]);
// Controlled trajectories: two bookkeeping models for the entry-control dV.
const vinfAt = (vEI, h = 125) => Math.sqrt(vEI * vEI - (2 * MU_E) / (R_E_DEC20_8_KM + h));
const controlled = con.map((r) => ({ des: r.des, kind: r.kind, vinf: r.vinf, nhatsEntry: r.nhText, nhatsCtrlDv: r.ctrlText,
  naturalEntry125: entrySpeed(r.vinf), modelA_entrySpeedExcess: entrySpeed(r.vinf) - 12, modelB_vinfReduction: r.vinf - vinfAt(12) }));
// Second, independent altitude fit from the controlled trajectories under model B: NHATS's control dV (+-0.0005)
// fixes the v-inf whose entry speed is exactly 12 km/s: v12 = v_inf - dV, so r_EI = 2 mu / (144 - v12^2).
// d(v12)/d(h) is about 0.002 km/s per km, so this constrains the altitude about 4x more tightly than the
// uncontrolled fit (about 0.0008 km/s per km). Atmosphere-relative variants: the v12 that the same geometry
// would need (inverting atmRel numerically).
const rOfV12 = (v12) => (2 * MU_E) / (144 - v12 * v12);
const fitCtrl = con.map((r) => {
  const v12 = r.vinf - r.ctrl; const v12lo = r.vinf - (r.ctrl + HALF); const v12hi = r.vinf - (r.ctrl - HALF);
  return { des: r.des, kind: r.kind, vinf: r.vinf, ctrl: r.ctrlText, fittedAltitudeKm: rOfV12(v12) - R_E_DEC20_8_KM, intervalKm: [rOfV12(v12lo) - R_E_DEC20_8_KM, rOfV12(v12hi) - R_E_DEC20_8_KM],
    widenedIntervalKm: [rOfV12(v12lo - N2_VINF_SCALE) - R_E_DEC20_8_KM, rOfV12(v12hi + N2_VINF_SCALE) - R_E_DEC20_8_KM] };
});
const interC = (key) => fitCtrl.reduce((acc, f) => [Math.max(acc[0], f[key][0]), Math.min(acc[1], f[key][1])], [-Infinity, Infinity]);
const solveV12 = (mode) => { let lo = 0; let hi = 12; for (let i = 0; i < 200; i += 1) { const mid = (lo + hi) / 2; const v = mode === 'inertial' ? entrySpeed(mid) : atmRel(entrySpeed(mid), R_E_DEC20_8_KM + 125, mode); if (v > 12) hi = mid; else lo = mid; } return (lo + hi) / 2; };
const ctrlModels = ['inertial', 'east', 'west', 'polar'].map((mode) => {
  const v12 = solveV12(mode);
  const res = con.map((r) => r.ctrl - Math.max(0, r.vinf - v12));
  return { convention: mode === 'inertial' ? 'inertial, 125 km (DEC-20-8), model B' : `atmosphere-relative, 125 km, ${mode === 'polar' ? 'polar' : `equatorial ${mode}ward, gamma -6 deg`}, model B`, vinfAtEntry12: v12, medianAbsResidual: stat(res.map(Math.abs)).median, maxAbsResidual: stat(res.map(Math.abs)).max, nWithinRounding: res.filter((x) => Math.abs(x) <= HALF + 1e-12).length, n: res.length };
});
const result = {
  schema: 'aster-s20-nhats-n4-entry-convention/1', generatedAtUtc: new Date().toISOString(),
  documented: {
    statedConvention: null,
    quotes: [
      { url: 'https://ssd-api.jpl.nasa.gov/doc/nhats.html', text: 'nhats_traj.v_arr_earth — Entry Speed (km/s)' },
      { url: 'https://ssd-api.jpl.nasa.gov/doc/nhats.html', text: 'nhats_traj.vrel_arr_earth — Earth return dV (km/s)' },
      { url: 'https://cneos.jpl.nasa.gov/nhats/', text: "This total delta-V includes the maneuver required to depart a notional 400 km altitude circular Earth parking orbit, the delta-V required to match the NEA's velocity at arrival, the delta-V required to depart the NEA, and the delta-V (if any) required to control atmospheric entry speed at Earth return." },
      { url: 'https://cneos.jpl.nasa.gov/nhats/intro.html', text: 'This software uses the method of patched conics for the spacecraft, with full precision JPL ephemerides for the Earth and NEAs' },
    ],
    caveatsPage: { url: 'https://cneos.jpl.nasa.gov/nhats/caveats.html', quote: 'Earth atmospheric entry speed less than or equal to 12 km/s at an altitude of 125 km', alsoQuoted: "The total delta-V includes the Earth departure maneuver from a 400 km altitude circular parking orbit, the maneuver to match the NEA's velocity at arrival, the maneuver to depart the NEA and, if necessary, a maneuver to control the atmospheric re-entry speed during Earth return.", savedAs: 'caveats.json (and raw/00217-n4-doc-cneos-nhats-caveats.txt.gz)' },
    note: 'The CNEOS caveats page states the ALTITUDE (125 km) and the limit (12 km/s). No page fetched states whether the speed is inertial or atmosphere-relative, the Earth radius used, or how the control maneuver is booked. Those are inferred below, not quoted.',
  },
  counts: { trajectories: rows.length, uncontrolled: unc.length, controlled: con.length },
  candidates: scored.map(({ perTrajectory, ...s }) => s),
  fittedInertialAltitude: { R_E_km: R_E_DEC20_8_KM, mu: MU_E, pointEstimatesKm: stat(fit.map((f) => f.fittedAltitudeKm)), intersectionFromRoundingOnlyKm: inter('intervalKm'), n2VinfResidualScaleUsed: N2_VINF_SCALE, intersectionWidenedKm: inter('widenedIntervalKm') },
  controlled,
  controlledAltitudeFit_modelB: { pointEstimatesKm: stat(fitCtrl.map((f) => f.fittedAltitudeKm)), intersectionFromRoundingOnlyKm: interC('intervalKm'), intersectionWidenedKm: interC('widenedIntervalKm') },
  controlledConventionTest_modelB: ctrlModels,
  perTrajectory: { fitControlled: fitCtrl, fit, best: scored[0].perTrajectory, dec20_8: scored.find((s) => s.convention.includes('DEC-20-8')).perTrajectory },
};
writeJsonAtomic(path.join(here, 'n4-entry-convention.json'), result);
console.log(JSON.stringify({ counts: result.counts, candidates: result.candidates.map((c) => [c.convention, c.residual_nhats_minus_candidate.medianAbs.toExponential(2), c.residual_nhats_minus_candidate.maxAbs.toExponential(2), c.residual_nhats_minus_candidate.meanSigned.toExponential(2), `${c.nWithinRounding}/${c.n}`]), fit: result.fittedInertialAltitude, fitCtrl: result.controlledAltitudeFit_modelB, ctrlModels }, null, 1));
