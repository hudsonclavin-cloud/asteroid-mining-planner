#!/usr/bin/env node
// N2 AGREEMENT ON IDENTICAL INPUTS (Q1). Horizons positions in (horizons-states.json), the unedited production
// kernel out (lib/legs.mjs), compared with what NHATS publishes for the same trajectory.
//   NHATS_STORE=<store> node tools/slice20-research/nhats/n2-agreement/agreement.mjs
// Both sides are two-body patched conics: agreement checks implementation and pipeline, NOT the physics.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readStamp, writeJsonAtomic, quantile, importV2, loadEarthSeries } from '../lib/aster.mjs';
import { evaluateRoundTrip, dursOf, entrySpeed, MU_E, R_E_DEC20_8_KM, sigFigs, decimals } from '../lib/legs.mjs';
import { trajEpochs, READINGS } from './fetch-states.mjs';

console.debug = () => {};
readStamp();
const here = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(fs.readFileSync(path.join(here, '..', 'n1-sample', 'n1-sample.json'), 'utf8'));
const hz = JSON.parse(fs.readFileSync(path.join(here, 'horizons-states.json'), 'utf8'));
const key = (jd) => jd.toFixed(9);
// Earth fallback, used ONLY where horizons-states.json has no Horizons Earth state for an epoch (see README /
// REPORT: the Earth batch request was halted on repeated HTTP 502). The fixture's records are Horizons API
// vectors; at 0h-TDB nodes N0 found them bit-identical to a fresh Horizons answer, and N5 checks the 2040 overlap.
// Off-node epochs (the UTC-0h reading) go through the production Hermite interpolator. Every row records its
// Earth source.
const { interpolateBodyStateSeries } = await importV2('core/interpolators/hermite.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');
const earthSeries = await loadEarthSeries();
const FIX0 = earthSeries[0].tdbSeconds; const FIX1 = earthSeries[earthSeries.length - 1].tdbSeconds;
const fixtureEarth = (jd) => {
  const t = (jd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
  if (t < FIX0 || t > FIX1) return null;
  const s = interpolateBodyStateSeries('earth', earthSeries, t);
  const node = earthSeries.some((x) => x.tdbSeconds === t);
  return { r: [s.positionM.x / 1e3, s.positionM.y / 1e3, s.positionM.z / 1e3], v: [s.velocityMps.x / 1e3, s.velocityMps.y / 1e3, s.velocityMps.z / 1e3], source: node ? 'fixture-node' : 'fixture-interpolated' };
};
// [NHATS field, our quantity, note]
// [id, NHATS field, our quantity, note]
export const QUANTS = [
  ['c3', 'c3', 'c3', 'outbound C3 (km^2/s^2)'],
  ['v_dep_earth', 'v_dep_earth', 'v_dep_earth', 'Earth-departure v-inf'],
  ['vrel_arr_neo', 'vrel_arr_neo', 'vrel_arr_neo', 'asteroid-arrival v-inf = arrival dV'],
  ['vrel_dep_neo', 'vrel_dep_neo', 'vrel_dep_neo', 'asteroid-departure v-inf = departure dV'],
  ['v_arr_earth', 'v_arr_earth', 'v_arr_earth_125km', 'entry speed; ours under DEC-20-8 (inertial, 125 km, R_E 6378.1366 km), BEFORE any entry-speed control'],
  ['dv_dep_park', 'dv_dep_park', 'dv_dep_park_400', 'Earth-departure dV from a 400 km circular orbit (R_E 6378.137 km)'],
  ['vrel_arr_earth', 'vrel_arr_earth', 'entry_ctrl_dv_model', 'entry-speed control dV; ours is pre-registered MODEL A: max(0, v_EI(125 km) - 12)'],
  ['vrel_arr_earth_modelB', 'vrel_arr_earth', 'entry_ctrl_dv_modelB', 'entry-speed control dV; MODEL B (post hoc): max(0, v_inf - v_inf(v_EI = 12 at 125 km))'],
  ['dv_total', 'dv_total', 'dv_total_400', 'total dV at 400 km with model A'],
  ['dv_total_modelB', 'dv_total', 'dv_total_400_modelB', 'total dV at 400 km with model B (post hoc)'],
];
// Earth-return v-inf: NHATS does not publish it. The only route is to invert NHATS's entry speed under an
// assumed convention (DEC-20-8 here), which makes this comparison convention-dependent (see N4).
export const vinfFromEntry = (vEntry, altKm = 125, rE = R_E_DEC20_8_KM) => Math.sqrt(Math.max(0, vEntry * vEntry - (2 * MU_E) / (rE + altKm)));
export function statesFor(des, e) {
  const a = hz.bodies[des]; const E = hz.earth;
  const g = (tab, jd) => { const s = tab[key(jd)]; if (!s) throw new Error(`no Horizons state for ${des} at ${jd}`); return s; };
  const ge = (jd) => { const s = E[key(jd)]; if (s) return { ...s, source: 'horizons' }; const f = fixtureEarth(jd); if (!f) throw new Error(`no Horizons Earth state at ${jd}, and it is outside the Earth fixture span`); return f; };
  const eL = ge(e.L); const eR = ge(e.R);
  return { eL, aA: g(a.rows, e.A), aD: g(a.rows, e.D), eR, earthSource: [...new Set([eL.source, eR.source])].join('+') };
}
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const rows = [];
  const skipped = [];
  for (const b of sample.bodies) {
    for (const kind of ['min_dv_traj', 'min_dur_traj']) {
      const t = b.nhats[kind];
      if (!t) { skipped.push({ des: b.des, kind, why: 'NHATS has no such trajectory' }); continue; }
      if (!hz.bodies[b.des]?.rows) { skipped.push({ des: b.des, kind, why: `no Horizons states: ${hz.bodies[b.des]?.error ?? 'missing'}` }); continue; }
      const eps = trajEpochs(t);
      const byReading = {};
      const earthSource = {};
      try {
        for (const [name] of READINGS) {
          const st = statesFor(b.des, eps[name]);
          earthSource[name] = st.earthSource;
          byReading[name] = evaluateRoundTrip(eps[name], dursOf(t), st);
        }
      } catch (error) { skipped.push({ des: b.des, kind, why: String(error.message ?? error) }); continue; }
      const ev = byReading.tdb0h;
      if (!ev.ok) { skipped.push({ des: b.des, kind, why: 'kernel: no converged branch on a leg' }); continue; }
      const cmp = {};
      for (const [id, f, q] of QUANTS) {
        const nh = Number(t[f]);
        const ours = ev.q[q];
        const oursUtc = byReading.utc0h.ok ? byReading.utc0h.q[q] : null;
        cmp[id] = { nhatsText: t[f], nhats: nh, ours, absDiff: Math.abs(ours - nh), relDiff: nh === 0 ? null : Math.abs(ours - nh) / Math.abs(nh), halfUnit: 0.5 * 10 ** -decimals(t[f]), beyondRounding: Math.abs(ours - nh) > 0.5 * 10 ** -decimals(t[f]) + 1e-12, oursUtc0h: oursUtc, absDiffUtc0h: oursUtc === null ? null : Math.abs(oursUtc - nh) };
      }
      const nhVinfRet = vinfFromEntry(Number(t.v_arr_earth));
      // NHATS's +-0.0005 on the entry speed becomes +-0.0005 * v_EI / v_inf on the inverted v-inf.
      const halfDerived = (0.0005 * Number(t.v_arr_earth)) / Math.max(nhVinfRet, 1e-9);
      cmp.vinf_ret_earth_derived = { nhatsText: null, nhats: nhVinfRet, ours: ev.q.vinf_ret_earth, absDiff: Math.abs(ev.q.vinf_ret_earth - nhVinfRet), relDiff: Math.abs(ev.q.vinf_ret_earth - nhVinfRet) / nhVinfRet, halfUnit: halfDerived, beyondRounding: Math.abs(ev.q.vinf_ret_earth - nhVinfRet) > halfDerived + 1e-12, note: 'NHATS value inverted from its entry speed under DEC-20-8; convention-dependent; meaningless for entry-controlled trajectories (their published entry speed is the controlled 12.000)', entryControlled: Number(t.vrel_arr_earth) > 0 };
      rows.push({
        des: b.des, tier: b.tier, kind, earthSource, launch: t.launch, dur_out: t.dur_out, dur_at: t.dur_at, dur_ret: t.dur_ret,
        nhatsOrbitId: b.nhats.orbit_id, nhatsComputed: b.nhats.computed, horizonsSoln: hz.bodies[b.des].soln,
        orbitIdMatch: (hz.bodies[b.des].soln ?? []).some((s) => new RegExp(`JPL#\\s*${String(b.nhats.orbit_id).trim()}$`).test(s)),
        epochsJdTdb: eps.tdb0h, outbound: { M: ev.outbound.M, branch: ev.outbound.branch, kernelSelectedInItsM: ev.outbound.kernelSelectedInItsM, nCandidates: ev.outbound.candidates.length },
        return: { M: ev.return.M, branch: ev.return.branch, kernelSelectedInItsM: ev.return.kernelSelectedInItsM, nCandidates: ev.return.candidates.length },
        entryControlled: Number(t.vrel_arr_earth) > 0, q: ev.q, cmp, dv200: { dv_dep_park_200: ev.q.dv_dep_park_200, dv_total_200: ev.q.dv_total_200, minusNhatsTotal: ev.q.dv_total_200 - Number(t.dv_total) },
      });
    }
  }
  const stat = (vals) => { const s = vals.filter((v) => v !== null && Number.isFinite(v)).sort((a, b) => a - b); return { n: s.length, median: quantile(s, 0.5), p90: quantile(s, 0.9), max: s.length ? s[s.length - 1] : null }; };
  const summarise = (subset) => {
  const perQuantity = {};
  for (const f of [...QUANTS.map((x) => x[0]), 'vinf_ret_earth_derived']) {
    const c = subset.map((r) => r.cmp[f]);
    const worse = subset.filter((r) => r.cmp[f].relDiff !== null && r.cmp[f].relDiff > 1e-3).map((r) => ({ des: r.des, kind: r.kind, tier: r.tier, entryControlled: r.entryControlled, nhats: r.cmp[f].nhatsText ?? r.cmp[f].nhats, ours: r.cmp[f].ours, relDiff: r.cmp[f].relDiff, absDiff: r.cmp[f].absDiff, beyondRounding: r.cmp[f].beyondRounding ?? null, orbitIdMatch: r.orbitIdMatch }));
    const texts = subset.map((r) => r.cmp[f].nhatsText).filter((x) => x !== null && x !== undefined);
    perQuantity[f] = {
      n: c.length, relDiff: stat(c.map((x) => x.relDiff)), absDiff: stat(c.map((x) => x.absDiff)),
      nRelWorseThan1e3: worse.length, nBeyondRounding: c.filter((x) => x.beyondRounding).length,
      absDiffUtc0h: f === 'vinf_ret_earth_derived' ? null : stat(c.map((x) => x.absDiffUtc0h)), nBeyondRoundingUtc0h: f === 'vinf_ret_earth_derived' ? null : c.filter((x) => x.absDiffUtc0h !== null && x.absDiffUtc0h > x.halfUnit + 1e-12).length,
      published: texts.length ? { decimals: [...new Set(texts.map(decimals))], sigFigs: stat(texts.map(sigFigs).map(Number)), zeroValues: texts.filter((x) => Number(x) === 0).length } : null,
      worseThan1e3: worse,
    };
  }
  return perQuantity;
  };
  const perQuantity = summarise(rows);
  const perQuantityUncontrolled = summarise(rows.filter((r) => !r.entryControlled));
  const perQuantityControlled = summarise(rows.filter((r) => r.entryControlled));
  const result = {
    schema: 'aster-s20-nhats-n2-agreement/1', generatedAtUtc: new Date().toISOString(),
    what: 'Horizons states (heliocentric ICRF equatorial, km, km/s, TDB) at the NHATS trajectory epochs (calendar date read as TDB 0h; UTC 0h reported alongside) through the unedited kernel computePorkchopGrid (lambertMultiRev, prograde, M 0..2), branch chosen per leg by NHATS\'s total-dV objective. Agreement checks the implementation and the pipeline; both sides are two-body patched conics, so it says nothing about the physics.',
    trajectories: { compared: rows.length, of: sample.bodies.length * 2, skipped, earthSourceTdb0h: Object.fromEntries([...new Set(rows.map((r) => r.earthSource.tdb0h))].map((k) => [k, rows.filter((r) => r.earthSource.tdb0h === k).length])), earthSourceUtc0h: Object.fromEntries([...new Set(rows.map((r) => r.earthSource.utc0h))].map((k) => [k, rows.filter((r) => r.earthSource.utc0h === k).length])) },
    orbitIdMatch: { match: rows.filter((r) => r.orbitIdMatch).length, mismatch: rows.filter((r) => !r.orbitIdMatch).length },
    branches: { outboundNotM0: rows.filter((r) => r.outbound.M !== 0).length, returnNotM0: rows.filter((r) => r.return.M !== 0).length, outboundNotKernelChoice: rows.filter((r) => !r.outbound.kernelSelectedInItsM).length, returnNotKernelChoice: rows.filter((r) => !r.return.kernelSelectedInItsM).length },
    dv200km: { dv_total_200_minus_nhats: stat(rows.map((r) => r.dv200.minusNhatsTotal)) },
    entryControlled: { yes: rows.filter((r) => r.entryControlled).length, no: rows.filter((r) => !r.entryControlled).length },
    perQuantity, perQuantityUncontrolled, perQuantityControlled, rows,
  };
  writeJsonAtomic(path.join(here, 'n2-agreement.json'), result);
  const brief = (pq) => Object.fromEntries(Object.entries(pq).map(([k, v]) => [k, { n: v.n, relMed: v.relDiff.median, relMax: v.relDiff.max, absMed: v.absDiff.median, absMax: v.absDiff.max, worse1e3: v.nRelWorseThan1e3, beyondRounding: v.nBeyondRounding, beyondRoundingUtc0h: v.nBeyondRoundingUtc0h, absMedUtc: v.absDiffUtc0h?.median, pub: v.published && { dec: v.published.decimals, sf: [v.published.sigFigs.median, v.published.sigFigs.max], zeros: v.published.zeroValues } }]));
  console.log(JSON.stringify({ trajectories: { ...result.trajectories, skipped: result.trajectories.skipped.length }, entryControlled: result.entryControlled, orbitIdMatch: result.orbitIdMatch, branches: result.branches, dv200km: result.dv200km, all: brief(perQuantity), uncontrolled: brief(perQuantityUncontrolled), controlled: brief(perQuantityControlled) }));
}
