import { MISSION_GATE_DEP_KMS, MISSION_GATE_TOTAL_KMS, MISSION_HIGH_DV_KMS } from '../../../physics/constants/index.js';
import { propagatePlanet, propagateAsteroid } from '../../../physics/propagation/planets.js';
import { resolveMissionTarget } from '../../../physics/propagation/targets.js';
import { solveLambertWithOrbitGuard } from '../../../physics/orbital/lambert/solver.js';
import { patchedConic, destinationCaptureDv, checkLunarAssist } from '../../../physics/orbital/patched-conic/index.js';

export function handlePlanMission(msg: any): void {
  const { ast, jd_start, jd_end, destination, parkingAlt_km, spacecraft, stayDays: stayMsg, reqId } = msg;
  const r_park_km = 6371 + (parkingAlt_km || 400);
  const STAY_DEF: Record<string, number>  = { light: 14, medium: 45, heavy: 90 };
  const stayDays  = stayMsg || STAY_DEF[spacecraft] || 45;

  const STEP_DEP  = 15;
  const TOF_STEPS = 24;
  const TOF_MIN   = 60, TOF_MAX = 600;

  const totalDeps = Math.ceil((jd_end - jd_start) / STEP_DEP);
  let depIdx = 0;
  const phase1: any[] = [];

  // ── Phase 1: outbound Lambert grid ──────────────────────────────────────
  let dbg_lambert_null = 0, dbg_gate_fail = 0, dbg_best_dv = Infinity;
  for (let jd_dep = jd_start; jd_dep <= jd_end; jd_dep += STEP_DEP) {
    depIdx++;
    if (depIdx % 15 === 0) {
      (self as any).postMessage({
        type: 'plan_progress',
        pct: 0.5 * depIdx / totalDeps,
        label: `Phase 1/2 — Scanning outbound windows (${depIdx}/${totalDeps} dates)...`,
      });
    }

    let earthDep: any;
    try { earthDep = propagatePlanet(2, jd_dep); } catch(_) { continue; }
    const r1 = [earthDep.x, earthDep.y, earthDep.z];
    const ve  = [earthDep.vx, earthDep.vy, earthDep.vz];

    for (let step = 0; step <= TOF_STEPS; step++) {
      const tof    = TOF_MIN + (TOF_MAX - TOF_MIN) * step / TOF_STEPS;
      const jd_arr = jd_dep + tof;

      let astArr: any;
      try { astArr = propagateAsteroid(ast, jd_arr); } catch(_) { continue; }
      const r2 = [astArr.x, astArr.y, astArr.z];
      const va  = [astArr.vx, astArr.vy, astArr.vz];

      const solve = solveLambertWithOrbitGuard(r1, r2, tof, { x: earthDep.x, y: earthDep.y, z: earthDep.z }, jd_dep);
      const lam = solve.lam;
      if (!lam) { dbg_lambert_null++; continue; }

      const pc = patchedConic(ve, lam.v1, va, lam.v2, r_park_km);
      if (!pc) continue;
      const combined = pc.dv_dep + pc.dv_arr;
      if (combined < dbg_best_dv) dbg_best_dv = combined;
      if (!isFinite(pc.dv_dep) || !isFinite(pc.dv_arr) || pc.dv_dep > 50 || pc.dv_arr > 50) { dbg_lambert_null++; continue; } // skip NaN/huge Lambert output
      if (pc.dv_dep > MISSION_GATE_DEP_KMS) { dbg_gate_fail++; continue; }

      phase1.push({
        jd_dep, jd_arr, tof,
        dv_dep: pc.dv_dep, dv_arr: pc.dv_arr,
        dv_mcc: 0.02 * (pc.dv_dep + pc.dv_arr),
        C3: pc.C3,
        vinf_dep: pc.vinf_dep_mag,
        vinf_arr: pc.vinf_arr_mag,
        earthPos: { x: r1[0], y: r1[1], z: r1[2] },
        astPos:   { x: r2[0], y: r2[1], z: r2[2] },
        orbit_el: solve.orbit_el || null,
      });
    }
  }

  // Keep top 30 outbound by combined outbound ΔV
  phase1.sort((a, b) => (a.dv_dep + a.dv_arr) - (b.dv_dep + b.dv_arr));
  const candidates = phase1.slice(0, 200);

  // ── Phase 2: return Lambert + destination capture ────────────────────────
  const results: any[] = [];
  for (let ci = 0; ci < candidates.length; ci++) {
    const c = candidates[ci];
    (self as any).postMessage({
      type: 'plan_progress',
      pct: 0.5 + 0.5 * (ci + 1) / candidates.length,
      label: `Phase 2/2 — Return trajectories (${ci+1}/${candidates.length})...`,
    });

    const jd_ret_dep = c.jd_arr + stayDays;
    let bestReturn: any = null;

    for (let rs = 0; rs <= 20; rs++) {
      const ret_tof     = 60 + 540 * rs / 20;
      const jd_ret_arr  = jd_ret_dep + ret_tof;

      let astDep: any, target: any;
      try { astDep  = propagateAsteroid(ast, jd_ret_dep); } catch(_) { continue; }
      try { target = resolveMissionTarget(destination, jd_ret_arr, r_park_km); } catch(_) { continue; }

      const rr1 = [astDep.x,   astDep.y,   astDep.z];
      const rr2 = [target.state.x, target.state.y, target.state.z];
      const vad = [astDep.vx,  astDep.vy,  astDep.vz];
      const vtd = [target.state.vx, target.state.vy, target.state.vz];
      const solve = solveLambertWithOrbitGuard(rr1, rr2, ret_tof, { x: astDep.x, y: astDep.y, z: astDep.z }, jd_ret_dep);
      const lam = solve.lam;
      if (!lam || !lam.v1 || !lam.v2 || !lam.v1.every(Number.isFinite) || !lam.v2.every(Number.isFinite)) continue;

      const dv_ret_dep = Math.hypot(lam.v1[0]-vad[0], lam.v1[1]-vad[1], lam.v1[2]-vad[2]);
      const vinf_ret   = Math.hypot(lam.v2[0]-vtd[0], lam.v2[1]-vtd[1], lam.v2[2]-vtd[2]);
      const dv_cap     = destinationCaptureDv(vinf_ret, target);
      const total_return = dv_ret_dep + (dv_cap as number);
      if (![dv_ret_dep, vinf_ret, dv_cap, total_return].every(Number.isFinite)) continue;

      if (!bestReturn || total_return < bestReturn.total_return) {
        bestReturn = {
          dv_return: dv_ret_dep,
          dv_capture: dv_cap,
          vinf_return: vinf_ret,
          tof_return: ret_tof,
          jd_ret_arr,
          total_return,
          target,
          orbit_el: solve.orbit_el || null,
        };
      }
    }
    if (!bestReturn) continue;

    const mcc = c.dv_mcc + 0.02 * bestReturn.dv_return;
    const dv_total = c.dv_dep + c.dv_arr + mcc + bestReturn.dv_return + bestReturn.dv_capture;
    if (!Number.isFinite(dv_total) || dv_total > MISSION_GATE_TOTAL_KMS) continue;

    results.push({
      schema_version: 2,
      reqId,
      jd_dep:    c.jd_dep,
      jd_arr:    c.jd_arr,
      jd_ret_dep,
      jd_ret_arr: bestReturn.jd_ret_arr,
      tof:        c.tof,
      tof_return: bestReturn.tof_return,
      stay_days:  stayDays,
      dv_dep:     +c.dv_dep.toFixed(3),
      dv_arr:     +c.dv_arr.toFixed(3),
      dv_mcc:     +mcc.toFixed(3),
      dv_return:  +bestReturn.dv_return.toFixed(3),
      dv_capture: +bestReturn.dv_capture.toFixed(3),
      dv_total:   +dv_total.toFixed(3),
      highDv:     dv_total > MISSION_HIGH_DV_KMS,
      C3:         +c.C3.toFixed(3),
      vinf_dep:   +c.vinf_dep.toFixed(3),
      vinf_arr:   +c.vinf_arr.toFixed(3),
      vinf_return:+bestReturn.vinf_return.toFixed(3),
      lunarAssist: checkLunarAssist(c.vinf_dep),
      earthPos:   c.earthPos,
      astPos:     c.astPos,
      outboundOrbitEl: c.orbit_el || null,
      returnTarget: {
        key: bestReturn.target.key,
        label: bestReturn.target.label,
        body: bestReturn.target.body,
        orbitRadiusKm: bestReturn.target.orbitRadiusKm,
        captureBasis: bestReturn.target.captureBasis,
      },
      returnTargetPos: {
        x: bestReturn.target.state.x,
        y: bestReturn.target.state.y,
        z: bestReturn.target.state.z,
      },
      returnOrbitEl: bestReturn.orbit_el || null,
    });
  }

  results.sort((a, b) => a.dv_total - b.dv_total);
  const top = results.slice(0, 10);
  const dbg = { lambert_null: dbg_lambert_null, gate_fail: dbg_gate_fail,
    phase1_count: phase1.length, best_dv: dbg_best_dv === Infinity ? null : +dbg_best_dv.toFixed(2) };
  if (top.length === 0) {
    (self as any).postMessage({ type: 'plan_result', schema_version: 2, reqId, results: [], noFeasibleWindow: true,
      dbg: Object.assign(dbg, { dv_dep_gate: MISSION_GATE_DEP_KMS, dv_total_gate: MISSION_GATE_TOTAL_KMS, high_dv_badge_gate: MISSION_HIGH_DV_KMS }) });
    return;
  }
  (self as any).postMessage({ type: 'plan_result', schema_version: 2, reqId, results: top, noFeasibleWindow: false, dbg });
}
