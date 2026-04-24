import * as THREE from 'three';
// TODO: import from src/renderer/scene — scene
// TODO: import from src/renderer/scene/orbits — makeDashedGlowLine, showGlowLine, makeOrbitLine
// TODO: import from src/renderer/scene/orbits/arcs — _setArcAnchor, clearMissionPathVisuals, clearBurnVectors
// TODO: import from src/renderer/scene/orbits/redirect — syncActiveRedirectVisuals, activeRedirectVisual
// TODO: import from src/physics — buildExtractMissionSegments
// TODO: import from src/utils — ORBIT_NEON, disposeObject3D

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
