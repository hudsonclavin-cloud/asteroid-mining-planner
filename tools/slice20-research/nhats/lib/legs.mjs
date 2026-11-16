// One patched-conic leg through the UNEDITED production kernel computePorkchopGrid (porkchop/grid-compute.ts),
// on a 1 x 1 grid, with swapped / injected state providers (the DEC-20-1 pattern). The kernel calls
// lambertMultiRev(r1, r2, tof, MU_SUN, M, prograde = true) and computes v-inf at both ends itself.
// States are { r: [km], v: [km/s] } heliocentric ICRF equatorial (the Earth fixture's frame).
import { importV2 } from './aster.mjs';

const { computePorkchopGrid } = await importV2('porkchop/grid-compute.js');
const { injectionDvFromC3, EARTH_MU_KM3_PER_S2 } = await importV2('porkchop/delta-v.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');

export const MU_E = EARTH_MU_KM3_PER_S2; // 398600.4418 km^3/s^2 (Aster's production value)
export const R_E_EQ_DELTAV_KM = 6378.137; // the radius inside LEO_PARKING_RADIUS_KM = 6578.137 (200 km)
export const PARK_400_KM = R_E_EQ_DELTAV_KM + 400; // NHATS's notional 400 km circular parking orbit
export const PARK_200_KM = R_E_EQ_DELTAV_KM + 200; // Aster's production LEO_PARKING_RADIUS_KM
export const R_E_DEC20_8_KM = 6378.1366; // DEC-20-8 (IAU 2015 nominal equatorial radius)
export const ENTRY_LIMIT_KMS = 12; // NHATS entry-speed limit (method assumption, see N4)
export const entrySpeed = (vInf, altKm = 125, rE = R_E_DEC20_8_KM, mu = MU_E) => Math.sqrt(vInf * vInf + (2 * mu) / (rE + altKm));
export const injection = (c3, parkRadiusKm) => injectionDvFromC3(c3, MU_E, parkRadiusKm);
const DUMMY_ELEMENTS = Object.freeze({ note: 'unused: the arrival provider below ignores elements' });
const toCanon = (s) => ({ positionM: { x: s.r[0] * 1000, y: s.r[1] * 1000, z: s.r[2] * 1000 }, velocityMps: { x: s.v[0] * 1000, y: s.v[1] * 1000, z: s.v[2] * 1000 } });
const tdbS = (jd) => (jd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY; // the kernel's own conversion

/**
 * All converged branches for M in Ms, each with the kernel's own v-inf at both ends.
 * depJD is the leg's start epoch (TDB JD); tofDays its duration; startState / endState the bodies' states
 * at the start and end epochs. Throws if the kernel asks for any other epoch (>1 ms off).
 */
export function solveLeg(depJD, tofDays, startState, endState, Ms = [0, 1, 2]) {
  const t0 = tdbS(depJD);
  const t1 = t0 + tofDays * SECONDS_PER_DAY;
  const out = [];
  for (const M of Ms) {
    const g = computePorkchopGrid(DUMMY_ELEMENTS, { depStartJD: depJD, depEndJD: depJD, tofMinDays: tofDays, tofMaxDays: tofDays, nDep: 1, nTof: 1 }, M, {
      getEarthStateAtTdbSeconds: (t) => { if (Math.abs(t - t0) > 1e-3) throw new Error(`kernel asked start state at ${t}, expected ${t0}`); return toCanon(startState); },
      propagateTargetStateAtTdbSeconds: (_e, t) => { if (Math.abs(t - t1) > 1e-3) throw new Error(`kernel asked end state at ${t}, expected ${t1}`); return toCanon(endState); },
    });
    const c = g.cells[0];
    c.branches.forEach((b, i) => { if (b.converged) out.push({ M, branch: b.branch, c3: b.c3, vInfStart: b.vInfDep, vInfEnd: b.vInfArr, kernelSelected: i === c.selectedBranch, x: b.x }); });
  }
  return out;
}

/** NHATS-style evaluation of one round trip on fixed epochs. states: { eL, aA, aD, eR }. */
export function evaluateRoundTrip(epochs, durs, states, { parkRadiusKm = PARK_400_KM, Ms = [0, 1, 2] } = {}) {
  const out = solveLeg(epochs.L, durs.out, states.eL, states.aA, Ms);
  const ret = solveLeg(epochs.D, durs.ret, states.aD, states.eR, Ms);
  // Branch choice by NHATS's own objective on fixed epochs (total dV), leg by leg:
  //   outbound: injection(c3 at the parking orbit) + arrival match; return: departure + entry-speed control.
  // The entry-control term is modelled as max(0, v_EI(125 km) - 12): an assumption, recorded; it only
  // affects the choice between converged branches, never a reported v-inf.
  const entryCtrl = (vInf) => Math.max(0, entrySpeed(vInf) - ENTRY_LIMIT_KMS);
  const outPick = out.reduce((best, b) => { const cost = injection(b.c3, parkRadiusKm) + b.vInfEnd; return !best || cost < best.cost ? { ...b, cost } : best; }, null);
  const retPick = ret.reduce((best, b) => { const cost = b.vInfStart + entryCtrl(b.vInfEnd); return !best || cost < best.cost ? { ...b, cost } : best; }, null);
  if (!outPick || !retPick) return { ok: false, outCandidates: out.length, retCandidates: ret.length };
  const q = {
    c3: outPick.c3, v_dep_earth: outPick.vInfStart, vrel_arr_neo: outPick.vInfEnd, vrel_dep_neo: retPick.vInfStart,
    vinf_ret_earth: retPick.vInfEnd, v_arr_earth_125km: entrySpeed(retPick.vInfEnd),
    dv_dep_park_400: injection(outPick.c3, PARK_400_KM), dv_dep_park_200: injection(outPick.c3, PARK_200_KM),
    entry_ctrl_dv_model: entryCtrl(retPick.vInfEnd),
  };
  q.dv_total_400 = q.dv_dep_park_400 + q.vrel_arr_neo + q.vrel_dep_neo + q.entry_ctrl_dv_model;
  q.dv_total_200 = q.dv_dep_park_200 + q.vrel_arr_neo + q.vrel_dep_neo + q.entry_ctrl_dv_model;
  return {
    ok: true, q,
    outbound: { M: outPick.M, branch: outPick.branch, kernelSelectedInItsM: outPick.kernelSelected, candidates: out.map(({ M, branch, c3, vInfEnd }) => ({ M, branch, c3, vInfEnd })) },
    return: { M: retPick.M, branch: retPick.branch, kernelSelectedInItsM: retPick.kernelSelected, candidates: ret.map(({ M, branch, vInfStart, vInfEnd }) => ({ M, branch, vInfStart, vInfEnd })) },
  };
}
/** NHATS calendar date (YYYY-MM-DD) read as 0h TDB; offsetDays shifts the launch epoch (convention test). */
export const jdOfDate = (iso) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000 + 2_440_587.5;
export function epochsOf(traj, offsetDays = 0) {
  const L = jdOfDate(traj.launch) + offsetDays;
  const A = L + Number(traj.dur_out);
  const D = A + Number(traj.dur_at);
  const R = D + Number(traj.dur_ret);
  return { L, A, D, R };
}
export const dursOf = (traj) => ({ out: Number(traj.dur_out), stay: Number(traj.dur_at), ret: Number(traj.dur_ret) });
export const NHATS_FIELDS = ['c3', 'v_dep_earth', 'dv_dep_park', 'vrel_arr_neo', 'vrel_dep_neo', 'vrel_arr_earth', 'v_arr_earth', 'dv_total'];
/** Significant figures as published: count of digits in the string, leading zeros excluded. */
export function sigFigs(s) {
  const t = String(s).trim().replace(/^[-+]/, '');
  const digits = t.replace('.', '').replace(/^0+/, '');
  return digits.length === 0 ? 0 : digits.length;
}
export const decimals = (s) => { const t = String(s); const i = t.indexOf('.'); return i < 0 ? 0 : t.length - i - 1; };
