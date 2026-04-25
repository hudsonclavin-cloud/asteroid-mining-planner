/**
 * Extract-mission planner — worker dispatch, result handling, trajectory list rendering,
 * trajectory selection, mission profile text generation, and burn-table management.
 * Source: index.html lines 4476–4537 (runMissionOptimizer) and lines 5121–5429
 * (onPlanResult, renderTrajectoryList, selectTrajectory, computeMissionProfile and helpers).
 *
 * This module owns the full lifecycle of the extract mission planning path:
 *   1. runMissionOptimizer() — validates inputs, dispatches plan_mission to physics worker
 *   2. onPlanResult()        — receives sorted results, renders trajectory card list
 *   3. selectTrajectory()    — activates a result card, draws the 3-D arc, builds timeline
 *   4. computeMissionProfile() — produces the full mission cost/revenue text block
 */

import {
  missionConfig,
  missionResults, setMissionResults,
  selectedTrajIdx, setSelectedTrajIdx,
  optimalTrajectory, setOptimalTrajectory,
  setMissionPlanningActive,
  setMissionReturnTargetPos,
  _activeReturnQueryId, setActiveReturnQueryId,
  _plannerTimeoutId, setPlannerTimeoutId,
  bumpExtractRequestSeq, setActiveExtractRequestId,
  mpBurns,
  selectedId,
  asteroidData,
  porkchopData,
  getSelectedAsteroid,
} from '../../state/index';

import { SPACECRAFT, LAUNCH_VEHICLES, DEST_LABELS } from './defaults';

import { jdToDate, fmtUSD, dateToJD } from '../../utils/dates';

import { propellantKgNum, computeEconomicsSummary, computeMissionCost } from './index';
import { getMatSpec } from '../pricing/active';

import { getWorker } from '../../workers/physics/client';

import * as THREE from 'three';
import { scene, disposeObject3D } from '../../renderer/scene/index';
import {
  ORBIT_NEON, makeGlowLine, makeDashedGlowLine, showGlowLine,
  setGlowLinePoints, buildOrbitSegmentPoints, validateArcPoints,
  asteroidToOrbitElements, setArcAnchorFromGlowLine,
} from '../../renderer/scene/orbits/index';
import { setStatus } from '../../utils/status';
import { flyTarget, setFlyTarget } from '../../state/index';
import { renderBurnEditTable } from '../../ui/hud/mission-control/burn-sequence';
import { renderPorkchop } from '../../renderer/scene/orbits/porkchop';
import { buildExtractScoreBreakdownHtml, summarizeTrajectoryOperationalMetrics } from './redirect';
import { clearPlannerError, showPlannerError } from '../../ui/hud/mission-control/errors';
import {
  clearTrajectoryLine,
  drawTrajectoryLine,
  drawBurnVectors,
  buildMissionTimeline,
} from '../../renderer/scene/mission-overlay';

export async function runMissionOptimizer() {
  clearPlannerError();
  const ast = getSelectedAsteroid();
  if (!ast) return showPlannerError('No asteroid selected — click an asteroid first.');

  // Validate asteroid orbital elements before sending to worker
  if (!ast) return showPlannerError('No asteroid selected.');
  const required = ['a', 'e', 'i', 'om', 'w', 'ma'];
  const missing = required.filter(k => ast[k] === undefined || isNaN(ast[k]));
  if (missing.length) return showPlannerError(`Asteroid missing orbital elements: ${missing.join(', ')}`);
  if (ast.epoch === undefined || isNaN(ast.epoch)) return showPlannerError('Asteroid epoch is undefined.');

  const ys = parseInt((document.getElementById('mp-year-start') as HTMLInputElement).value) || 2026;
  const ye = parseInt((document.getElementById('mp-year-end') as HTMLInputElement).value)   || 2035;
  const currentYear = new Date().getFullYear();
  if (ys < currentYear || ye < currentYear) return showPlannerError(`Launch window must be ${currentYear} or later. Past years are blocked.`);
  if (ye < ys) return showPlannerError('Launch window end year must be greater than or equal to the start year.');
  missionConfig.destination     = (document.getElementById('mp-destination') as HTMLSelectElement).value;
  missionConfig.spacecraft      = (document.querySelector('input[name="mp-craft"]:checked') as HTMLInputElement)?.value || 'medium';
  missionConfig.launchVehicle   = (document.getElementById('mp-launch-vehicle') as HTMLSelectElement).value;
  missionConfig.launchYearStart = ys;
  missionConfig.launchYearEnd   = ye;
  const jd_start = dateToJD(ys, 1, 1);
  const jd_end   = dateToJD(ye + 1, 1, 1);
  const parkAlt  = parseInt((document.getElementById('mp-park-alt') as HTMLInputElement).value) || 400;
  const sc       = missionConfig.spacecraft;
  const STAY_MAP: Record<string, number> = { light:14, medium:45, heavy:90 };
  (missionConfig as any).parkingAlt_km = parkAlt;

  (document.getElementById('mp-computing') as HTMLElement).style.display = 'block';
  (document.getElementById('mp-results') as HTMLElement).style.display   = 'none';
  (document.getElementById('mp-profile') as HTMLElement).style.display   = 'none';
  (document.getElementById('mp-burns') as HTMLElement).style.display     = 'none';
  (document.getElementById('mp-actions') as HTMLElement).style.display   = 'none';
  (document.getElementById('mp-progress-bar') as HTMLElement).style.width = '5%';
  (document.getElementById('mp-progress-label') as HTMLElement).textContent = 'Running Aster Lambert solver...';
  setMissionReturnTargetPos(null);
  setActiveReturnQueryId(0);

  try {

    // 30-second timeout: if worker never replies, surface an error
    if (_plannerTimeoutId) clearTimeout(_plannerTimeoutId);
    setPlannerTimeoutId(setTimeout(() => {
      setPlannerTimeoutId(null);
      showPlannerError('Worker timeout (>30 s). The solver may be overloaded — try a shorter launch window or a NHATS ✓ target.');
    }, 30000));

    const reqId = bumpExtractRequestSeq();
    setActiveExtractRequestId(reqId);
    getWorker().postMessage({
      cmd: 'plan_mission', ast, jd_start, jd_end,
      reqId,
      destination: missionConfig.destination,
      parkingAlt_km: parkAlt,
      spacecraft: sc,
      stayDays: STAY_MAP[sc] || 45,
    });
  } catch(err) {
    showPlannerError(err);
  }
}

// ─── Result handling ──────────────────────────────────────────────────────────

export function onPlanResult(results: any[], noFeasibleWindow: boolean, dbg: any, source: string) {
  (document.getElementById('mp-computing') as HTMLElement).style.display = 'none';
  if (noFeasibleWindow || !results || results.length === 0) {
    const resultPanel = document.getElementById('mp-results');
    const errorPanel = document.getElementById('mp-results-error');
    const dbgLine = dbg
      ? `<br><span style="color:#4b5563;font-size:9px">diag: lambert_null=${dbg.lambert_null} gate_fail=${dbg.gate_fail} phase1=${dbg.phase1_count} best_dv=${dbg.best_dv ?? '—'}</span>`
      : '';
    const bestDv = dbg?.best_dv;
    const hint = bestDv && bestDv < 30
      ? `Best one-way ΔV found: ${bestDv} km/s — try extending the window past ${missionConfig.launchYearEnd || 2035} or pick a NHATS ✓ target.`
      : 'Try a NHATS ✓ target (◈ NHATS ACCESSIBLE ONLY filter), extend the launch window, or pick a lower-ΔV asteroid.';
    if (errorPanel) {
      errorPanel.innerHTML =
        '<div style="color:#ef4444;padding:12px 4px;font-size:10px;line-height:1.6">' +
        'NO FEASIBLE WINDOW FOUND<br>' +
        `<span style="color:#6b7280">${hint}</span>` +
        dbgLine + '</div>';
      errorPanel.style.display = 'block';
    }
    if (resultPanel) {
      const list = document.getElementById('mp-trajectory-list');
      if (list) list.innerHTML = '';
      resultPanel.style.display = 'block';
    }
    return;
  }
  setMissionPlanningActive(true);
  const sortedResults: any[] = [...results].sort((a: any, b: any) => {
    const sa = summarizeTrajectoryOperationalMetrics(a);
    const sb = summarizeTrajectoryOperationalMetrics(b);
    const scoreA = Number.isFinite(sa?.score) ? sa.score : -Infinity;
    const scoreB = Number.isFinite(sb?.score) ? sb.score : -Infinity;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.dv_total - b.dv_total;
  });
  (sortedResults as any).source = source || 'lambert';
  setMissionResults(sortedResults);
  setOptimalTrajectory(missionResults[0] || null);
  renderTrajectoryList();
  (document.getElementById('mp-results') as HTMLElement).style.display = 'block';
  (document.getElementById('mp-result-count') as HTMLElement).textContent = `(${results.length} options)`;
  if (results.length) {
    (document.getElementById('mp-assumptions-wrap') as HTMLElement).style.display = 'block';
    selectTrajectory(0);
  }
  // Refresh model assumptions panel
  const _ac = document.getElementById('mp-assumptions-content');
  if (_ac) {
    _ac.innerHTML = `
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">Propagation:</span>Keplerian (two-body, no perturbations)</div>
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">Burn model:</span>Impulsive (no gravity losses)</div>
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">Gravity losses:</span>Not modeled — add 3–5% margin</div>
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">Perturbations:</span>Not modeled (J₂, lunar, planetary)</div>
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">Spacecraft:</span>Single-stage Tsiolkovsky</div>
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">Margin reserves:</span>Not included — add ±10–20%</div>
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">ΔV uncertainty:</span>±15% (Lambert patched-conic)</div>
      <div><span style="color:#4a6a7a;display:inline-block;width:130px">Segment split:</span>Lambert-computed per solved segment</div>
      <div style="margin-top:6px;color:#3a5a6a;border-top:1px solid #0d1f33;padding-top:6px">For high-fidelity analysis: <a href="https://ssd.jpl.nasa.gov/horizons/" target="_blank" style="color:#00d4ff">JPL Horizons</a>.</div>`;
  }
}

export function renderTrajectoryList() {
  const errorEl = document.getElementById('mp-results-error');
  if (errorEl) errorEl.style.display = 'none';
  const list   = document.getElementById('mp-trajectory-list');
  if (!list) { console.error('[renderTrajectoryList] mp-trajectory-list not found'); return; }
  const uncPct = 0.15;
  const badge  = '<span style="color:#4a6a7a;font-size:7px;border:1px solid #4a6a7a;padding:1px 3px;margin-left:4px;vertical-align:middle">📐 ASTER</span>';
  list.innerHTML = '';
  missionResults.forEach((t: any, i: number) => {
    const profile = t._profile || (t._profile = computeMissionProfile(t));
    const dep   = jdToDate(t.jd_dep);
    const arr   = jdToDate(t.jd_arr);
    const dvUnc = +(t.dv_total * uncPct).toFixed(2);
    const ops = summarizeTrajectoryOperationalMetrics(t);
    const card  = document.createElement('div');
    card.className = 'mp-traj-card' + (i === selectedTrajIdx ? ' mp-traj-selected' : '');
    const gaBadge = t.lunarAssist
      ? '<span style="font-size:7px;color:#fbbf24;border:1px solid #fbbf24;padding:1px 4px;margin-left:5px;vertical-align:middle">LUNAR GA</span>'
      : '';
    const hvBadge = t.highDv
      ? '<span style="font-size:7px;color:#fb923c;border:1px solid #fb923c;padding:1px 4px;margin-left:5px;vertical-align:middle">⚠ HIGH ΔV</span>'
      : '';
    const lvBadge = ops?.fitsLaunchVehicle === false
      ? '<span style="font-size:7px;color:#f87171;border:1px solid #f87171;padding:1px 4px;margin-left:5px;vertical-align:middle">OVERWEIGHT</span>'
      : '';
    const costWarning = profile.totalCost < 500e6
      ? '<div class="mp-traj-meta" style="color:#fbbf24">Historical first-of-a-kind mining missions are typically $2B-$10B+</div>'
      : '';
    const scoreBreakdown = buildExtractScoreBreakdownHtml(t, ops);
    card.innerHTML = `<div class="mp-traj-rank">#${i+1}${gaBadge}${hvBadge}${badge}</div>
      <div class="mp-traj-dates">↑ ${dep} &nbsp;→&nbsp; ↓ ${arr}</div>
      <div class="mp-traj-dv">ΔV TOTAL: ${t.dv_total.toFixed(2)} ± ${dvUnc} km/s <span style="font-size:7px;color:#94a3b8;border:1px solid #334155;padding:1px 4px;vertical-align:middle">planning-level estimate</span></div>
      <div class="mp-traj-meta" title="Screening-grade Lambert estimate — individual burn values carry ±15% uncertainty">Dep ${t.dv_dep.toFixed(2)} + Arr ${t.dv_arr.toFixed(2)} + Ret ${t.dv_return.toFixed(2)} + Cap ${(t.dv_capture||0).toFixed(2)} km/s &nbsp;·&nbsp; TOF ${Math.round(t.tof)}d</div>
      <div class="mp-traj-meta" style="color:#4b5563">C3: ${(t.C3||0).toFixed(1)} km²/s² &nbsp;·&nbsp; Stay: ${t.stay_days||'?'}d &nbsp;·&nbsp; Return: ${Math.round(t.tof_return||0)}d to ${(t.returnTarget?.label || (document.getElementById('mp-destination') as HTMLSelectElement)?.value || 'target')}</div>
      <div class="mp-traj-meta" style="color:#6a8a9a">Score ${ops?.score ?? '—'}/100 ${lvBadge}&nbsp;·&nbsp; Launch ${fmtUSD(ops?.launchCost)} &nbsp;·&nbsp; Paper ${fmtUSD(profile.paperValue)} &nbsp;·&nbsp; NPV ${fmtUSD(profile.realizedNpv)}</div>
      ${scoreBreakdown}
      <div class="mp-traj-meta" style="color:#64748b">Source: Asterank + screening-grade economics</div>
      ${costWarning}`;
    card.addEventListener('click', () => selectTrajectory(i));
    list.appendChild(card);
  });
}


export function selectTrajectory(idx: number) {
  setSelectedTrajIdx(idx);
  const traj = missionResults[idx];
  if (!traj) return;
  setOptimalTrajectory(traj);
  document.querySelectorAll('.mp-traj-card').forEach((c, i) =>
    (c as HTMLElement).classList.toggle('mp-traj-selected', i === idx));
  setMissionReturnTargetPos(null);
  clearTrajectoryLine();
  drawTrajectoryLine(traj);
  // Frame camera on Earth departure position to show trajectory
  {
    const ep  = traj.earthPos;
    const ap  = traj.astPos;
    const sep = Math.hypot(ap.x - ep.x, ap.y - ep.y, ap.z - ep.z);
    setFlyTarget({ x: ep.x, y: ep.y, z: ep.z, dist: Math.max(1.5, sep * 1.2), progress: 0 });
  }
  // Request accurate terminal return position for the selected destination
  if (traj.jd_ret_arr && traj.returnTarget?.body) {
    const reqId = _activeReturnQueryId + 1;
    setActiveReturnQueryId(reqId);
    getWorker().postMessage({ cmd:'query_pos', jd: traj.jd_ret_arr, reqId, target: traj.returnTarget });
  }
  const profile = computeMissionProfile(traj);
  (document.getElementById('mp-profile-text') as HTMLElement).textContent = profile.text;
  (document.getElementById('mp-profile') as HTMLElement).style.display = 'block';
  (document.getElementById('mp-verify-wrap') as HTMLElement).style.display = 'flex';
  mpBurns.splice(0, mpBurns.length,
    { label:'1 · DEPARTURE',       jd: traj.jd_dep,                       dv_kms: traj.dv_dep    },
    { label:'2 · ASTEROID ARRIVAL',jd: traj.jd_arr,                       dv_kms: traj.dv_arr    },
    { label:'3 · MCC',             jd: (traj.jd_dep + traj.jd_arr) / 2,   dv_kms: traj.dv_mcc || +(traj.dv_dep * 0.02).toFixed(3) },
    { label:'4 · ASTEROID DEP.',   jd: traj.jd_ret_dep || traj.jd_arr+30, dv_kms: traj.dv_return },
    { label:'5 · DEST. CAPTURE',   jd: traj.jd_ret_arr || traj.jd_arr+30+(traj.tof_return||traj.tof), dv_kms: traj.dv_capture || 0 },
  );
  renderBurnEditTable();
  (document.getElementById('mp-burns') as HTMLElement).style.display   = 'block';
  (document.getElementById('mp-actions') as HTMLElement).style.display = 'block';
  drawBurnVectors(traj);
  buildMissionTimeline(traj);
  // Re-render porkchop so selected dot updates (only if panel is visible)
  if (
    porkchopData &&
    (document.getElementById('porkchop-panel') as HTMLElement).style.display !== 'none'
  ) {
    renderPorkchop(porkchopData); // redraws grid then overlays current mission results
  }
}

export function computeMissionProfile(traj: any): any {
  const ast  = asteroidData[selectedId];
  const sc   = SPACECRAFT[missionConfig.spacecraft as keyof typeof SPACECRAFT]    || SPACECRAFT.medium;
  const lv   = LAUNCH_VEHICLES[missionConfig.launchVehicle as keyof typeof LAUNCH_VEHICLES] || LAUNCH_VEHICLES.f9;
  const dest = DEST_LABELS[missionConfig.destination]  || 'LEO';
  const g0   = 0.00980665;

  // ── Propulsion: single-stage or 3-stage if mass ratio > 10 ──────────────────
  const rawPropKg = sc.dry_kg * (Math.exp(traj.dv_total / (g0 * sc.isp)) - 1);
  const isStaged  = rawPropKg > 10 * sc.dry_kg;
  let propKg: number, wetKg: number, propNote: string;
  if (isStaged) {
    // 3 equal ΔV stages (chemical, Isp 320/350/320 s)
    const dvS = traj.dv_total / 3;
    propKg  = sc.dry_kg * (Math.exp(dvS / (g0 * 320)) - 1)
            + sc.dry_kg * (Math.exp(dvS / (g0 * 350)) - 1)
            + sc.dry_kg * (Math.exp(dvS / (g0 * 320)) - 1);
    wetKg   = sc.dry_kg + propKg;
    propNote = '3-stage chemical (high-ΔV mode)';
  } else {
    propKg  = propellantKgNum(traj.dv_total, sc.isp, sc.dry_kg);
    wetKg   = sc.dry_kg + propKg;
    propNote = `single-stage, Isp ${sc.isp} s`;
  }
  const frac = propKg / wetKg;

  const dot = (label: string, val: string) => `  ${label.padEnd(22, '.')} ${val}`;
  const sep = (label: string) => `\n─── ${label} ${'─'.repeat(Math.max(0, 45 - label.length))}`;

  // ── Launch cost & overweight check ──────────────────────────────────────────
  const launchCost = wetKg * lv.cost_per_kg;
  const fits       = wetKg <= lv.max_kg;
  const betterLV   = Object.values(LAUNCH_VEHICLES)
    .filter((v: any) => v.max_kg >= wetKg)
    .sort((a: any, b: any) => a.cost_per_kg - b.cost_per_kg)[0] as any;
  const overweightLine = fits ? '' :
    dot('  SUGGEST VEHICLE', betterLV ? betterLV.name : 'none available');

  // ── Mission cost with uncertainty range ──────────────────────────────────────
  const opsDays    = Math.round(traj.tof + (traj.tof_return || traj.tof) + (traj.stay_days || 45));
  const opsCost    = (opsDays / 30) * 8e6;  // $8M/month — DSN time, staffing, contingency
  const totalCost  = launchCost + sc.cost_usd + opsCost;
  const _src     = (missionResults as any).source || 'lambert';
  const dvUnc_mp = traj.dv_total * 0.15;
  const costRng_mp = computeMissionCost(totalCost, dvUnc_mp);

  // ── Revenue (canonical screening-grade return model) ────────────────────────
  const spec = getMatSpec(ast);
  const econSummary = computeEconomicsSummary(ast, {
    dryMass: sc.dry_kg,
    isp: sc.isp,
    dv: traj.dv_total,
    launchCostPerKg: lv.cost_per_kg,
    totalCostMultiplier: 1,
    payloadKg: sc.payload_kg,
  });
  const revenuePerKg = econSummary.revenuePerKg;
  const returnedKg = econSummary.returnedKg;
  const revLow = econSummary.paperValueUsd;
  const revHigh = revLow;
  const paperValue = econSummary.paperValueUsd;
  const npvRealized = econSummary.realizableNpvUsd;

  // ── Simple time-value NPV for ROI display ───────────────────────────────────
  const missionYears = opsDays / 365.25;
  const npvFactor    = 1 / Math.pow(1.05, missionYears);
  const npvLow  = Number.isFinite(revLow) ? revLow * npvFactor - totalCost : null;
  const npvHigh = npvLow;

  const roiLow  = Number.isFinite(revLow) && totalCost > 0 ? (revLow  - totalCost) / totalCost * 100 : null;
  const roiHigh = roiLow;
  const breakEvenKg = Number.isFinite(revenuePerKg) && revenuePerKg > 0 ? Math.ceil(totalCost / revenuePerKg) : null;
  const fmtMaybeUSD = (v: number | null) => Number.isFinite(v as number) ? fmtUSD(v as number) : 'unknown';
  const fmtMaybePct = (v: number | null) => Number.isFinite(v as number) ? `${(v as number).toFixed(0)}%` : 'unknown';

  const lines = [
    '═'.repeat(50),
    `  ⚡ MISSION PLAN — ${(ast.name || ast.full_name || ast.designation || '').toUpperCase().slice(0,30)}`,
    '═'.repeat(50),
    dot('TARGET', (ast.name || ast.full_name || ast.designation || '?').slice(0,28)),
    dot('TYPE', `${ast.spec || ast.spec_T || 'X'}-type`),
    dot('DIAMETER', ast._diam_m ? (ast._diam_m/1000).toFixed(2)+' km' : '? km'),
    dot('DESTINATION', dest),
    dot('SPACECRAFT', sc.name),
    dot('LAUNCH VEHICLE', lv.name),
    sep('TRAJECTORY'),
    dot('LAUNCH DATE', jdToDate(traj.jd_dep)),
    dot('ARRIVAL DATE', jdToDate(traj.jd_arr)),
    dot('MINING STAY', (traj.stay_days || '?') + ' days'),
    dot('RETURN DEPART', traj.jd_ret_dep ? jdToDate(traj.jd_ret_dep) : '—'),
    dot('RETURN ARRIVAL', traj.jd_ret_arr ? jdToDate(traj.jd_ret_arr) : '—'),
    dot('MISSION DURATION', opsDays + ' days (est)'),
    sep('DELTA-V BUDGET  (screening-grade Lambert estimates, ±15%)'),
    dot('1 · DEPARTURE BURN', traj.dv_dep.toFixed(3) + ' km/s (est.)  (from ' + ((missionConfig as any).parkingAlt_km||400) + ' km LEO)'),
    dot('2 · ASTEROID ARRIVAL', traj.dv_arr.toFixed(3) + ' km/s (est.)'),
    dot('3 · MID-COURSE (MCC)', (traj.dv_mcc||0).toFixed(3) + ' km/s (est.)  (2% budget)'),
    dot('4 · ASTEROID DEPART', traj.dv_return.toFixed(3) + ' km/s (est.)'),
    dot('5 · DEST. CAPTURE', (traj.dv_capture||0).toFixed(3) + ' km/s (est.)'),
    dot('TOTAL MISSION ΔV', traj.dv_total.toFixed(2) + ' km/s (est.)'),
    dot('C3', (traj.C3||0).toFixed(2) + ' km²/s²'),
    dot('V∞ DEPARTURE', (traj.vinf_dep||0).toFixed(2) + ' km/s'),
    dot('V∞ ARRIVAL', (traj.vinf_arr||0).toFixed(2) + ' km/s'),
    traj.lunarAssist ? dot('LUNAR GRAVITY ASSIST', 'CANDIDATE (low C3)') : '',
    sep('PROPULSION'),
    dot('MODEL', propNote),
    dot('DRY MASS', sc.dry_kg.toLocaleString() + ' kg'),
    dot('PROPELLANT MASS', Math.round(propKg).toLocaleString() + ' kg'),
    dot('WET MASS', Math.round(wetKg).toLocaleString() + ' kg'),
    dot('MASS FRACTION', (frac*100).toFixed(1) + '%'),
    dot('LAUNCH CAPACITY', lv.max_kg.toLocaleString()+' kg '+(fits?'✓ FITS':'✗ OVERWEIGHT')),
    overweightLine,
    sep('COSTS  (±15%  Lambert + ops uncertainty)'),
    dot('LAUNCH', `${fmtUSD(launchCost * 0.90)} – ${fmtUSD(launchCost * 1.10)}`),
    dot('SPACECRAFT', fmtUSD(sc.cost_usd)),
    dot('OPERATIONS', `${fmtUSD(opsCost * 0.85)} – ${fmtUSD(opsCost * 1.15)}`),
    dot('TOTAL MISSION', `${fmtUSD(costRng_mp.low)} – ${fmtUSD(costRng_mp.high)}`),
    totalCost < 500e6 ? dot('SANITY WARNING', 'Historical mining missions are typically $2B – $10B+') : '',
    sep('REFERENCE MISSION COSTS'),
    dot('DART (kinetic impactor)',      '$324M'),
    dot('OSIRIS-REx (sample return)',   '$1.16B'),
    dot('KISS asteroid capture study',  '$2.6B'),
    dot('Psyche (metal asteroid orb.)', '~$1.0B'),
    dot('First-of-kind mining est.',    '$2B – $10B+'),
    sep('REVENUE ESTIMATE'),
    dot('ORE PAYLOAD CAP', sc.payload_kg.toLocaleString() + ' kg max'),
    dot('MISSION RETURN', `${Math.round(returnedKg || 0).toLocaleString()} kg  (${econSummary.returnModelSource})`),
    dot('REVENUE / KG', Number.isFinite(revenuePerKg) ? '$' + revenuePerKg.toFixed(2) : 'unknown'),
    dot('PAPER VALUE', fmtMaybeUSD(paperValue) + '  (spot price, no market impact)'),
    dot('REALIZABLE NPV', fmtMaybeUSD(npvRealized) + '  (demand-adj. 10yr sell, 8% discount)'),
    sep('RETURNS'),
    dot('EST. ROI', fmtMaybePct(roiLow)),
    dot('NPV 5%', fmtMaybeUSD(npvLow)),
    breakEvenKg ? dot('BREAK-EVEN PAYLOAD', breakEvenKg.toLocaleString() + ' kg') : '',
    sep('PROPAGATION METHOD'),
    dot('TRAJECTORY SOURCE', 'Izzo 2015 Lambert + patched-conic'),
    dot('PROPAGATOR', 'Keplerian 2-body (secular J2000 elements)'),
    dot('DRY MASS', sc.dry_kg.toLocaleString() + ' kg'),
    dot('ISP', sc.isp + ' s (single-stage)'),
    dot('PAYLOAD CAPACITY', sc.payload_kg.toLocaleString() + ' kg'),
    dot('ΔV UNCERTAINTY', `±${(traj.dv_total * 0.15).toFixed(2)} km/s  (±15% Aster Lambert)`),
    dot('COST UNCERTAINTY', '±15% (launcher pricing + ops variance)'),
    '',
    '⚠  Real missions include 3–5% gravity losses and',
    '   ±10–20% margin reserves not reflected here.',
    '',
    '═'.repeat(50),
    '  Patched-conic · Izzo 2015 Lambert · Phase 9F',
    '═'.repeat(50),
  ].filter(l => l !== undefined && l !== '');
  return {
    text: lines.join('\n'),
    totalCost,
    revLow,
    revHigh,
    roiLow,
    roiHigh,
    paperValue,
    realizedNpv: npvRealized,
  };
}
