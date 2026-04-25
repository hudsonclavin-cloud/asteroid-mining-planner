import * as THREE from 'three';
import { scene, disposeObject3D } from './index';
import {
  ORBIT_NEON,
  makeDashedGlowLine,
  showGlowLine,
  setArcAnchorFromGlowLine,
  buildOrbitSegmentPoints,
  validateArcPoints,
} from './orbits/index';
import {
  _activeMissionType,
  activeRedirectVisual,
  missionResults,
  selectedTrajIdx,
  optimalTrajectory,
  missionReturnTargetPos,
  trajectoryLine,
  setTrajectoryLine,
  trajectoryArrows,
  returnArcLine,
  setReturnArcLine,
  burnVectorArrows,
  _arcAnchors,
  mpBurns,
} from '../../state/index';
import { setCurrentJD, currentJD } from '../../utils/time-state';
import { jdToDate } from '../../utils/dates';
import { setStatus } from '../../utils/status';

// ── Phase 7F: Mission Visualization ──────────────────────────────────────────

export const missionAnim = {
  active: false, playing: false, speed: 86400,
  animJD: 0, phase: 'idle' as string,
  outboundPts: [] as THREE.Vector3[], returnPts: [] as THREE.Vector3[],
  targetPts: [] as THREE.Vector3[],
  mode: 'extract' as string,
  jdStart: 0, jdEnd: 0,
  attachEndJD: 0,
  captureEndJD: 0,
  captureRadiusAU: 0,
  redirectVisual: null as any,
  spacecraft: null as THREE.Group | null, engineLight: null as THREE.PointLight | null,
  asteroidBody: null as THREE.Mesh | null,
  trailLine: null as THREE.Line | null, trailPts: [] as THREE.Vector3[],
  thrusterPlumes: [] as THREE.Mesh[],
  autoFollow: false,
  manualOverride: false,
  spacecraftVisible: false,
  spacecraftDirection: new THREE.Vector3(0, 0, 1),
  sampledPosition: new THREE.Vector3(),
  sampledNext: new THREE.Vector3(),
  sampledAsteroid: new THREE.Vector3(),
  sampledAsteroidNext: new THREE.Vector3(),
  followOffset: new THREE.Vector3(0.3, 0.15, 0.3),
  followTarget: new THREE.Vector3(),
  plumeDirection: new THREE.Vector3(0, 0, -1),
  attachmentOffset: new THREE.Vector3(),
  captureCenter: new THREE.Vector3(),
};

export let playbackModeBeforeScrub = 'none';
export let playbackMissionRefBeforeScrub: any = null;
export let playbackMissionModeBeforeScrub: string | null = null;

export function setMissionAnimationPlaying(
  playing: boolean,
  deps: {
    syncSpeedButtons: () => void;
    syncMissionSpeedButtons: () => void;
    syncMissionPlaybackButtons: () => void;
    setIsPlaying: (v: boolean) => void;
    setSimSpeed: (v: number) => void;
  }
): void {
  const {
    syncSpeedButtons, syncMissionSpeedButtons, syncMissionPlaybackButtons,
    setIsPlaying, setSimSpeed,
  } = deps;
  if (!missionAnim.active) return;
  missionAnim.playing = playing;
  missionAnim.spacecraftVisible = playing;
  if (missionAnim.spacecraft) missionAnim.spacecraft.visible = playing;
  if (playing) {
    setIsPlaying(false);
    setSimSpeed(0);
    missionAnim.autoFollow = true;
    missionAnim.manualOverride = false;
  }
  syncSpeedButtons();
  syncMissionSpeedButtons();
  syncMissionPlaybackButtons();
}

export function drawTrajectoryLine(
  traj: any,
  deps: {
    scene: THREE.Scene;
    trajectoryLine: THREE.Object3D | null;
    returnArcLine: THREE.Object3D | null;
    trajectoryArrows: THREE.Object3D[];
    ORBIT_NEON: Record<string, number>;
    makeDashedGlowLine: (...args: any[]) => THREE.Line;
    showGlowLine: (line: THREE.Line) => void;
    _setArcAnchor: (key: string, line: THREE.Object3D, text: string, t?: number) => void;
    buildExtractMissionSegments: (traj: any) => any;
    disposeObject3D: (obj: THREE.Object3D | null) => void;
    getPathDirection: (pts: THREE.Vector3[], t: number, fallback: THREE.Vector3, reverse?: boolean) => THREE.Vector3;
    missionReturnTargetPos: any;
    setTrajectoryLine: (l: THREE.Line | null) => void;
    setReturnArcLine: (l: THREE.Line | null) => void;
    pushTrajectoryArrow: (a: THREE.ArrowHelper) => void;
    setStatus: (msg: string, warn?: boolean) => void;
  } = {
    scene,
    trajectoryLine,
    returnArcLine,
    trajectoryArrows,
    ORBIT_NEON,
    makeDashedGlowLine,
    showGlowLine,
    _setArcAnchor: setArcAnchorFromGlowLine,
    buildExtractMissionSegments,
    disposeObject3D,
    getPathDirection,
    missionReturnTargetPos,
    setTrajectoryLine,
    setReturnArcLine,
    pushTrajectoryArrow: (a: THREE.ArrowHelper) => {
      scene.add(a);
      trajectoryArrows.push(a as any);
    },
    setStatus,
  }
): boolean {
  const {
    scene, ORBIT_NEON, makeDashedGlowLine, showGlowLine, _setArcAnchor,
    buildExtractMissionSegments, disposeObject3D, getPathDirection,
    missionReturnTargetPos,
    setTrajectoryLine, setReturnArcLine, pushTrajectoryArrow, setStatus,
  } = deps;

  const segments = buildExtractMissionSegments(traj);
  if (!segments || segments.outboundPts.length < 2) {
    setStatus('Extract path unavailable without solved segment geometry', true);
    return false;
  }
  const geo = new THREE.BufferGeometry().setFromPoints(segments.outboundPts);
  const trajectoryLine = makeDashedGlowLine(geo, ORBIT_NEON.transfer, 0.92, 0.03, 0.02, { haloOpacity: 0.2 });
  scene.add(trajectoryLine);
  showGlowLine(trajectoryLine);
  setTrajectoryLine(trajectoryLine);
  const depText = Number.isFinite(traj?.dv_dep) ? `DEPARTURE  ΔV: ${traj.dv_dep.toFixed(2)} km/s` : 'DEPARTURE';
  const arrText = Number.isFinite(traj?.dv_arr) ? `ARRIVAL  ΔV: ${traj.dv_arr.toFixed(2)} km/s` : 'ARRIVAL';
  _setArcAnchor('departure', trajectoryLine, depText, 0.15);
  _setArcAnchor('arrival', trajectoryLine, arrText, 0.85);

  const outboundFallback = new THREE.Vector3(
    (traj.astPos?.x || 0) - (traj.earthPos?.x || 0),
    (traj.astPos?.y || 0) - (traj.earthPos?.y || 0),
    (traj.astPos?.z || 0) - (traj.earthPos?.z || 0),
  );
  const depDir = getPathDirection(segments.outboundPts, 0.02, outboundFallback, false);
  const arrDir = getPathDirection(segments.outboundPts, 0.98, outboundFallback, true);
  const depPos = segments.outboundPts[0];
  const arrPos = segments.outboundPts[segments.outboundPts.length - 1];
  const depArrow = new THREE.ArrowHelper(depDir, depPos.clone(), 0.12, ORBIT_NEON.transfer, 0.05, 0.025);
  const arrArrow = new THREE.ArrowHelper(arrDir, arrPos.clone(), 0.12, 0xffcf66, 0.05, 0.025);
  scene.add(depArrow); pushTrajectoryArrow(depArrow);
  scene.add(arrArrow); pushTrajectoryArrow(arrArrow);

  // Draw return arc
  _redrawReturnArc(traj, segments, deps);
  return true;
}

export function clearTrajectoryLine() {
  clearMissionPathVisuals();
}

function _redrawReturnArc(
  traj: any,
  segments: any | null,
  deps: {
    scene: THREE.Scene;
    returnArcLine: THREE.Object3D | null;
    ORBIT_NEON: Record<string, number>;
    makeDashedGlowLine: (...args: any[]) => THREE.Line;
    showGlowLine: (line: THREE.Line) => void;
    _setArcAnchor: (key: string, line: THREE.Object3D, text: string, t?: number) => void;
    buildExtractMissionSegments: (traj: any) => any;
    disposeObject3D: (obj: THREE.Object3D | null) => void;
    setReturnArcLine: (l: THREE.Line | null) => void;
  }
): boolean {
  const {
    scene, returnArcLine, ORBIT_NEON, makeDashedGlowLine, showGlowLine,
    _setArcAnchor, buildExtractMissionSegments, disposeObject3D, setReturnArcLine,
  } = deps;

  if (returnArcLine) { disposeObject3D(returnArcLine); setReturnArcLine(null); }
  const resolvedSegments = segments || buildExtractMissionSegments(traj);
  if (!resolvedSegments || resolvedSegments.returnPts.length < 2) return false;
  const retGeo = new THREE.BufferGeometry().setFromPoints(resolvedSegments.returnPts);
  const retLine = makeDashedGlowLine(retGeo, ORBIT_NEON.transfer, 0.64, 0.03, 0.02, { haloOpacity: 0.14 });
  scene.add(retLine);
  showGlowLine(retLine);
  setReturnArcLine(retLine);
  {
    const retText = traj && Number.isFinite(traj.dv_return) ? `RETURN  ΔV: ${traj.dv_return.toFixed(2)} km/s` : 'RETURN';
    _setArcAnchor('returnArc', retLine, retText);
  }
  return true;
}

export function syncActiveMissionVisuals(deps: {
  _activeMissionType: string;
  activeRedirectVisual: any;
  missionResults: any[];
  selectedTrajIdx: number;
  optimalTrajectory: any;
  trajectoryLine: THREE.Object3D | null;
  returnArcLine: THREE.Object3D | null;
  trajectoryArrows: THREE.Object3D[];
  burnVectorArrows: THREE.Object3D[];
  syncActiveRedirectVisuals: () => void;
  clearMissionPathVisuals: () => void;
  clearBurnVectors: () => void;
  drawBurnVectors: (traj: any) => void;
  drawTrajectoryLine: (traj: any) => boolean;
}): void {
  const {
    _activeMissionType, activeRedirectVisual, missionResults, selectedTrajIdx,
    optimalTrajectory, trajectoryLine, returnArcLine, trajectoryArrows,
    burnVectorArrows, syncActiveRedirectVisuals, clearMissionPathVisuals,
    clearBurnVectors, drawBurnVectors, drawTrajectoryLine,
  } = deps;

  if ((_activeMissionType === 'redirect' || missionAnim.mode === 'redirect') && activeRedirectVisual) {
    syncActiveRedirectVisuals();
    return;
  }
  const traj = missionResults[selectedTrajIdx] || optimalTrajectory;
  if (!traj) {
    syncActiveRedirectVisuals();
    return;
  }
  if (trajectoryLine || returnArcLine || trajectoryArrows.length) {
    clearMissionPathVisuals();
    drawTrajectoryLine(traj);
  }
  if (burnVectorArrows.length) {
    clearBurnVectors();
    drawBurnVectors(traj);
  }
}

export function buildExtractMissionSegments(traj: any) {
  if (!traj) return null;
  const jdRetArr = Number.isFinite(traj.jd_ret_arr)
    ? traj.jd_ret_arr
    : (Number.isFinite(traj.jd_ret_dep) && Number.isFinite(traj.tof_return) ? traj.jd_ret_dep + traj.tof_return : null);
  const outboundPts = traj.outboundOrbitEl && Number.isFinite(traj.jd_dep) && Number.isFinite(traj.jd_arr)
    ? buildOrbitSegmentPoints(traj.outboundOrbitEl, traj.jd_dep, traj.jd_arr, 140)
    : [];
  const returnPts = traj.returnOrbitEl && Number.isFinite(traj.jd_ret_dep) && Number.isFinite(jdRetArr)
    ? buildOrbitSegmentPoints(traj.returnOrbitEl, traj.jd_ret_dep, jdRetArr, 140)
    : [];
  if (outboundPts.length >= 2 && !validateArcPoints(outboundPts, 'extract-outbound')) return null;
  if (returnPts.length >= 2 && !validateArcPoints(returnPts, 'extract-return')) return null;
  return { outboundPts, returnPts, jdRetArr };
}

export function getPathDirection(pathPts: THREE.Vector3[] | null | undefined, t: number, fallbackVec: THREE.Vector3, reverse = false): THREE.Vector3 {
  const fallback = fallbackVec.clone();
  if (!pathPts || pathPts.length < 2) return reverse ? fallback.negate() : fallback;
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (pathPts.length - 1);
  const idx = Math.floor(scaled);
  const p0 = pathPts[idx];
  const p1 = pathPts[Math.min(idx + 1, pathPts.length - 1)];
  const dir = new THREE.Vector3().subVectors(p1, p0);
  if (dir.lengthSq() < 1e-10) return reverse ? fallback.negate() : fallback;
  dir.normalize();
  return reverse ? dir.negate() : dir;
}

function samplePathPosition(pathPts: THREE.Vector3[] | null | undefined, t: number, pos: THREE.Vector3, next: THREE.Vector3) {
  if (!pathPts || !pathPts.length) return false;
  if (pathPts.length === 1) {
    pos.copy(pathPts[0]);
    next.copy(pathPts[0]);
    return true;
  }
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (pathPts.length - 1);
  const idx = Math.floor(scaled);
  const frac = scaled - idx;
  const p0 = pathPts[idx];
  const p1 = pathPts[Math.min(idx + 1, pathPts.length - 1)];
  pos.copy(p0).lerp(p1, frac);
  next.copy(p1);
  return true;
}

export function samplePathVector(pathPts: THREE.Vector3[] | null | undefined, t: number, fallback: THREE.Vector3) {
  if (!pathPts || !pathPts.length) return fallback ? fallback.clone() : null;
  if (pathPts.length === 1) return pathPts[0].clone();
  const pos = new THREE.Vector3();
  const next = new THREE.Vector3();
  samplePathPosition(pathPts, t, pos, next);
  return pos;
}

export function getBurnColor(label: string) {
  const l = label.toLowerCase();
  if (l.includes('capture') || l.includes('arrival')) return 0xff4444;
  if (l.includes('mcc')) return 0xffcc00;
  if (l.includes('mining')) return 0x44ff44;
  return 0x00d4ff;
}

export function clearBurnVectors() {
  burnVectorArrows.forEach(obj => disposeObject3D(obj as any));
  burnVectorArrows.length = 0;
}

export function clearMissionPathVisuals() {
  if (trajectoryLine) { disposeObject3D(trajectoryLine); setTrajectoryLine(null); }
  trajectoryArrows.forEach(obj => disposeObject3D(obj as any));
  trajectoryArrows.length = 0;
  if (returnArcLine) { disposeObject3D(returnArcLine); setReturnArcLine(null); }
  (_arcAnchors as any).departure = null;
  (_arcAnchors as any).arrival = null;
  (_arcAnchors as any).returnArc = null;
}

export function drawBurnVectors(traj: any) {
  clearBurnVectors();
  const segments = buildExtractMissionSegments(traj);
  if (!segments?.outboundPts?.length) return;
  const outboundFallback = new THREE.Vector3(
    (traj.astPos?.x || 0) - (traj.earthPos?.x || 0),
    (traj.astPos?.y || 0) - (traj.earthPos?.y || 0),
    (traj.astPos?.z || 0) - (traj.earthPos?.z || 0),
  );
  const returnFallback = new THREE.Vector3(
    (traj.returnTargetPos?.x || traj.earthPos?.x || 0) - (traj.astPos?.x || 0),
    (traj.returnTargetPos?.y || traj.earthPos?.y || 0) - (traj.astPos?.y || 0),
    (traj.returnTargetPos?.z || traj.earthPos?.z || 0) - (traj.astPos?.z || 0),
  );
  const returnPts = segments.returnPts?.length ? segments.returnPts : null;
  const burnDefs = [
    { pos: segments.outboundPts[0].clone(), label: mpBurns[0]?.label || '1 · DEPARTURE', dv: traj.dv_dep, jd: traj.jd_dep, dir: getPathDirection(segments.outboundPts, 0.02, outboundFallback, false) },
    { pos: segments.outboundPts[segments.outboundPts.length - 1].clone(), label: mpBurns[1]?.label || '2 · ASTEROID ARRIVAL', dv: traj.dv_arr, jd: traj.jd_arr, dir: getPathDirection(segments.outboundPts, 0.98, outboundFallback, true) },
    { pos: samplePathVector(segments.outboundPts, 0.5, segments.outboundPts[0]), label: mpBurns[2]?.label || '3 · MCC', dv: traj.dv_mcc || 0, jd: mpBurns[2]?.jd, dir: getPathDirection(segments.outboundPts, 0.5, outboundFallback, false) },
    { pos: returnPts ? returnPts[0].clone() : segments.outboundPts[segments.outboundPts.length - 1].clone(), label: mpBurns[3]?.label || '4 · ASTEROID DEP.', dv: traj.dv_return, jd: traj.jd_ret_dep, dir: getPathDirection(returnPts, 0.02, returnFallback, false), offset: [0.04, 0, 0] },
    { pos: returnPts ? returnPts[returnPts.length - 1].clone() : new THREE.Vector3(traj.returnTargetPos?.x || 0, traj.returnTargetPos?.y || 0, traj.returnTargetPos?.z || 0), label: mpBurns[4]?.label || '5 · DEST. CAPTURE', dv: traj.dv_capture || 0, jd: traj.jd_ret_arr, dir: getPathDirection(returnPts, 0.98, returnFallback, true), offset: [0, 0.04, 0] },
  ];

  burnDefs.forEach((b) => {
    if (!b.dv || b.dv < 0.001 || !b.pos) return;
    const len = Math.max(0.06, Math.min(0.28, b.dv * 0.04));
    const col = getBurnColor(b.label);
    const ox = b.offset?.[0] || 0, oy = b.offset?.[1] || 0, oz = b.offset?.[2] || 0;
    const origin = new THREE.Vector3(b.pos.x + ox, b.pos.y + oy, b.pos.z + oz);
    const arrow = new THREE.ArrowHelper(b.dir, origin, len, col, len * 0.3, len * 0.12);
    arrow.userData = { burnLabel: b.label, dv: b.dv, jd: b.jd };
    scene.add(arrow);
    burnVectorArrows.push(arrow as any);
  });
}

export function buildMissionTimeline(traj: any) {
  const el = document.getElementById('mission-timeline') as HTMLElement | null;
  const inner = document.getElementById('mission-timeline-inner') as HTMLElement | null;
  const bottomBar = document.getElementById('bottom-bar') as HTMLElement | null;
  if (!el || !inner || !bottomBar) return;
  const jd0 = traj.jd_dep;
  const jd1 = traj.jd_arr;
  const jd2 = traj.jd_ret_dep;
  const jd3 = traj.jd_ret_arr || (jd2 + (traj.tof_return || traj.tof));
  const span = jd3 - jd0;
  if (span <= 0) return;

  inner.innerHTML = '<div id="mt-cursor" style="position:absolute;top:0;bottom:0;width:1px;background:#fff;opacity:0.6;pointer-events:none;z-index:2"></div>';
  const phases = [
    { label: 'COAST 1', start: jd0, end: jd1, color: '#0d1d2e' },
    { label: 'MINING', start: jd1, end: jd2, color: '#2a1e00' },
    { label: 'COAST 2', start: jd2, end: jd3, color: '#0d1d2e' },
  ];
  const burnMarkers = [
    { label: 'DEP', jd: jd0, color: '#00d4ff' },
    { label: 'ARR', jd: jd1, color: '#ff4444' },
    { label: 'AST-DEP', jd: jd2, color: '#00d4ff' },
    { label: 'CAP', jd: jd3, color: '#cc44cc' },
  ];

  phases.forEach(p => {
    const pct = (p.end - p.start) / span * 100;
    const left = (p.start - jd0) / span * 100;
    const seg = document.createElement('div');
    seg.className = 'mt-segment';
    seg.style.cssText = `left:${left.toFixed(2)}%;width:${pct.toFixed(2)}%;background:${p.color}`;
    seg.innerHTML = `<span class="mt-segment-label">${p.label}</span><span class="mt-segment-date">${jdToDate(p.start).slice(0,7)}</span>`;
    seg.title = `${p.label}: ${Math.round(p.end - p.start)} days`;
    seg.addEventListener('click', () => setCurrentJD(p.start));
    inner.appendChild(seg);
  });

  burnMarkers.forEach(b => {
    const left = (b.jd - jd0) / span * 100;
    const marker = document.createElement('div');
    marker.style.cssText = `position:absolute;left:${left.toFixed(2)}%;top:0;bottom:0;width:3px;background:${b.color};z-index:1;opacity:0.85;cursor:pointer`;
    marker.title = `${b.label}: ${jdToDate(b.jd)}`;
    marker.addEventListener('click', () => setCurrentJD(b.jd));
    inner.appendChild(marker);
  });

  el.style.display = 'block';
  bottomBar.style.bottom = '36px';
}

export function hideMissionTimeline() {
  const timeline = document.getElementById('mission-timeline') as HTMLElement | null;
  const bottomBar = document.getElementById('bottom-bar') as HTMLElement | null;
  if (timeline) timeline.style.display = 'none';
  if (bottomBar) bottomBar.style.bottom = '0px';
}

export function stopMissionAnimation() {
  if (missionAnim.spacecraft) { disposeObject3D(missionAnim.spacecraft); missionAnim.spacecraft = null; }
  if (missionAnim.asteroidBody) { disposeObject3D(missionAnim.asteroidBody); missionAnim.asteroidBody = null; }
  if (missionAnim.trailLine) { disposeObject3D(missionAnim.trailLine); missionAnim.trailLine = null; }
  missionAnim.active = false;
  missionAnim.playing = false;
  missionAnim.phase = 'idle';
  missionAnim.mode = 'extract';
  missionAnim.jdStart = 0;
  missionAnim.jdEnd = 0;
  missionAnim.attachEndJD = 0;
  missionAnim.captureEndJD = 0;
  missionAnim.captureRadiusAU = 0;
  missionAnim.redirectVisual = null;
  missionAnim.trailPts = [];
  missionAnim.outboundPts = [];
  missionAnim.returnPts = [];
  missionAnim.targetPts = [];
  missionAnim.thrusterPlumes = [];
  missionAnim.autoFollow = false;
  missionAnim.manualOverride = false;
  missionAnim.spacecraftVisible = false;
  missionAnim.engineLight = null;
  const ctrl = document.getElementById('mp-anim-controls') as HTMLElement | null;
  if (ctrl) ctrl.style.display = 'none';
  hideMissionTimeline();
}
