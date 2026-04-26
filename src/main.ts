/**
 * src/main.ts — Stage 9 entry point
 *
 * Boot sequence for Aster. Imports extracted modules and calls their init
 * functions in dependency order. Cross-module deps still using runtime globals
 * are marked with TODO comments for final wiring.
 *
 * NOTE: index.html inline script remains authoritative until Stage 9 wiring is
 * complete and verified. This file represents the target entry point.
 */

// ── Styles ────────────────────────────────────────────────────────────────────
import './styles/main.css';
import * as THREE from 'three';

// ── Worker client ─────────────────────────────────────────────────────────────
import { initWorker, getWorker } from './workers/physics/client';

// ── Renderer ──────────────────────────────────────────────────────────────────
import { initScene, scene, sunMesh, animate, renderer, camera, controls, moonOrbitVisualsEnabled, setMoonOrbitVisualsEnabled, nhatsRing, nhatsRingMat, registerAnimateHooks } from './renderer/scene/index';
import { dummy } from './renderer/scene/index';
import { planets } from './renderer/scene/planets';
import { createProceduralLandOverlay, updatePlanetSpin, PLANET_VISUALS } from './renderer/scene/planets';
import { initTextures } from './renderer/scene/textures';
import { initGizmo, gizmoRaycaster, updateGizmo } from './renderer/scene/gizmo';
import { initEarthDetail, earthLayerActive, earthDetailGroup, shellGroup, updateEarthDetailSpin } from './renderer/scene/earth/detail';
import { initPorkchop } from './renderer/scene/orbits/porkchop';
import { renderPorkchop } from './renderer/scene/orbits/porkchop';
import { buildAsteroidMesh } from './renderer/scene/asteroids/instanced-field/index';
import { majorMoonMeshes, majorMoonOrbitLines } from './renderer/scene/moon/major-moons';
import { moonMesh, physicalRadiusToSceneAU } from './renderer/scene/moon/index';
import { missionAnim, setMissionAnimationPlaying, updateSpacecraftFollow, updateBurnVectorPulse, updateMissionAnimation } from './renderer/scene/mission-overlay';
import { consumePendingPositions, updateTimelineIndicator } from './renderer/scene/per-frame';
import { maybePropagateCurrentJD } from './workers/physics/client';

// ── UI ────────────────────────────────────────────────────────────────────────
import { initLabels } from './ui/overlays/labels';
import { initTooltips } from './ui/overlays/tooltips';
import { initPanelControls } from './ui/panels/bottom/controls';
import { initFilterEvents } from './ui/panels/left/filter-events';
import { applyFilters, renderLeaderboard, updateDualRangeUI } from './ui/panels/left/filters';
import { initMissionEvents, initPlaybackEvents } from './ui/hud/mission-control/events';
import { initKeyboardShortcuts } from './ui/hud/keyboard';
import { initHonestyBanner } from './ui/modals/honesty-banner';
import { initTour } from './ui/modals/tour';
import { renderBurnEditTable, renderBurnList, computeMultiBurnElements, recomputeAllBurnOrbits } from './ui/hud/mission-control/burn-sequence';
import { toggleBurnMode, updateBurnUI } from './ui/hud/mission-control/burn-mode';
import { fetchResearchBriefing } from './ui/panels/right/research';

// ── Data ──────────────────────────────────────────────────────────────────────
import { fetchPrices } from './economics/pricing/index';
import { fetchNHATSData } from './data/nhats/index';
import { triggerCatalogFetch } from './data/asterank/index';
import { runMissionOptimizer, selectTrajectory } from './economics/mission-costs/planner';
import { runRedirectOptimizer } from './economics/mission-costs/redirect';
import { exportMissionPlan, exportMissionReport } from './utils/export';
import { encodeStateToURL, loadStateFromURL } from './utils/share';
import { setStatus } from './utils/status';
import { jdToDate } from './utils/dates';
import { currentJD, setCurrentJD, lastSpeed, setIsPlaying, setLastSpeed, setSimSpeed, isPlaying, isScrubbing, simSpeed, clampJD } from './utils/time-state';
import { kep2cart } from './physics/orbital/keplerian/elements';
import { updateLabelPositions } from './ui/overlays/labels';
import {
  selectedId,
  setSelectedId,
  asteroidData,
  asteroidCount,
  asteroidMesh,
  currentBurnElements,
  optimalTrajectory,
  setOptimalTrajectory,
  missionResults,
  mpBurns,
  _activeMissionType,
  setActiveMissionType,
  burns,
  burnDV,
  setBurnDV,
  activeBurnIdx,
  setActiveBurnIdx,
  MAX_BURNS,
  burnOrbitLines,
  newOrbitLine,
  originalOrbitLine,
  porkchopData,
  getSelectedAsteroid,
  missionConfig,
  burnVectorArrows,
  activeRedirectVisual,
  burnModeActive,
  positionCache,
  visibleScale,
  setAsteroidData,
  setAsteroidCount,
  setAsteroidMesh,
  setPositionCache,
  setVisibleScale,
  fpsFrames, setFpsFrames,
  fpsLast, setFpsLast,
  frameCount, setFrameCount,
  flyTarget, setFlyTarget,
  ghostTime, setGhostTime,
} from './state/index';
import { SPACECRAFT } from './economics/mission-costs/defaults';
import { propellantKgNum } from './economics/mission-costs/index';
import { saveToIndexedDB } from './data/cache/indexeddb';
import { showTour } from './ui/modals/tour';
import { getAsteroidDV, resolveAsteroidEconomics } from './economics/pricing/active';

const noop = (): void => {};
const fmtSliderVal = (pos: number): string => {
  const min = 1e6;
  const max = 1e12;
  const ratio = pos / 100;
  const value = min * Math.pow(max / min, ratio);
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}k`;
};

const selectedIdRef = {
  get value() { return selectedId; },
  set value(v: number) { setSelectedId(v); },
};
const currentJDRef = {
  get value() { return currentJD; },
  set value(v: number) { setCurrentJD(v); },
};
const optimalTrajectoryRef = {
  get value() { return optimalTrajectory; },
  set value(v: any) { setOptimalTrajectory(v); },
};
const missionResultsRef = { get value() { return missionResults; } };
const mpBurnsRef = { get value() { return mpBurns; } };
const activeMissionTypeRef = {
  get value() { return _activeMissionType; },
  set value(v: 'extract' | 'redirect') { setActiveMissionType(v); },
};
const burnsRef = { get value() { return burns; } };
const burnDVRef = {
  get value() { return burnDV; },
  set value(v: { p: number; n: number; r: number }) { setBurnDV(v); },
};
const activeBurnIdxRef = {
  get value() { return activeBurnIdx; },
  set value(v: number) { setActiveBurnIdx(v); },
};
const missionAnimRef = { value: missionAnim };
const lastSpeedRef = {
  get value() { return lastSpeed; },
  set value(v: number) { setLastSpeed(v); },
};
const porkchopDataRef = { get value() { return porkchopData; } };

function openMissionPlanner(_id: number): void {}
function closeMissionPlanner(): void {}
function exportFilteredCatalog(): void {}
function deselectAsteroid(): void {}
function clearActivePresetSelection(): void {}
function resetFilters(): void {}
function applyPreset(_key: string): void {}
function saveUserPreset(_name: string): void {}
function populateSavedPresets(): void {}
function renderEconomicsTab(_id: number): void {}
function renderMaterialsTab(_id: number): void {}
function togglePrimaryPlayback(): void {}
let _bodyScaleTrue = false;
function applyBodyScaleMode(): void {
  const trueScaleFactor = (baseRadius: number, radiusKm: number): number => {
    if (!Number.isFinite(baseRadius) || !Number.isFinite(radiusKm) || baseRadius <= 0) return 1;
    return physicalRadiusToSceneAU(radiusKm) / baseRadius;
  };
  planets.forEach(mesh => {
    mesh.scale.setScalar(_bodyScaleTrue ? trueScaleFactor(mesh.userData.baseRadius, mesh.userData.trueRadiusKm) : 1);
  });
  moonMesh.scale.setScalar(_bodyScaleTrue ? trueScaleFactor(moonMesh.userData.baseRadius, moonMesh.userData.trueRadiusKm) : 1);
  majorMoonMeshes.forEach(mesh => {
    mesh.scale.setScalar(_bodyScaleTrue ? trueScaleFactor(mesh.userData.baseRadius, mesh.userData.trueRadiusKm) : 1);
  });
  sunMesh.scale.setScalar(_bodyScaleTrue ? trueScaleFactor(sunMesh.userData.baseRadius, sunMesh.userData.trueRadiusKm) : 1);
  const btn = document.getElementById('btn-scale-mode');
  if (btn) { btn.classList.toggle('active', _bodyScaleTrue); btn.textContent = _bodyScaleTrue ? 'SIZE: TRUE' : 'SIZE: READ'; }
}
function toggleBodyScaleMode(): void {
  _bodyScaleTrue = !_bodyScaleTrue;
  applyBodyScaleMode();
  setStatus(_bodyScaleTrue ? 'Body scale: TRUE RELATIVE SIZES' : 'Body scale: READABLE DISPLAY SIZES', true);
}
function applyMoonOrbitVisualState(): void {
  const visible = moonOrbitVisualsEnabled && !earthLayerActive;
  majorMoonOrbitLines.forEach(line => { line.visible = visible; });
  const btn = document.getElementById('btn-moon-orbits');
  if (btn) { btn.classList.toggle('active', moonOrbitVisualsEnabled); btn.textContent = moonOrbitVisualsEnabled ? 'MOONS: ON' : 'MOONS: OFF'; }
}
function toggleMoonOrbitVisuals(): void {
  setMoonOrbitVisualsEnabled(!moonOrbitVisualsEnabled);
  applyMoonOrbitVisualState();
  setStatus(moonOrbitVisualsEnabled ? 'Moon orbits ON' : 'Moon orbits OFF', true);
}
function syncFollowButton(): void {}
function syncSpeedButtons(): void {}
function syncMissionSpeedButtons(): void {}
function setPlayState(playing: boolean): void { setIsPlaying(playing); }
function missionSpeedFromUi(speed: number): number { return speed; }
function getPlayableMissionContext(): any {
  if (optimalTrajectory) return { type: 'extract', traj: optimalTrajectory };
  if (activeRedirectVisual) return { type: 'redirect', visual: activeRedirectVisual };
  return null;
}
function missionContextMatches(_ctx: any): boolean { return false; }
function activatePlayableMission(_ctx: any): boolean { return false; }
function spectralTypeColor(ast: any): THREE.Color {
  const spec = (ast.spec || ast.spec_B || ast.spec_T || ast.taxonomy || '').trim().toUpperCase().charAt(0);
  if (spec === 'C' || spec === 'B') return new THREE.Color(0x4488ff);
  if (spec === 'D') return new THREE.Color(0x3366cc);
  if (spec === 'S' || spec === 'Q' || spec === 'A') return new THREE.Color(0xff8844);
  if (spec === 'M' || spec === 'E' || spec === 'P') return new THREE.Color(0xffcc00);
  if (spec === 'X' || spec === 'V' || spec === 'T') return new THREE.Color(0xcc66ff);
  return new THREE.Color(0x00d4ff);
}
function getDisplayValueUsd(ast: any): number | null {
  return resolveAsteroidEconomics(ast).extractableValueUsd;
}
function keplerPosAU(ast: any, jd: number): { x: number; y: number; z: number } {
  const deg = Math.PI / 180;
  const state = kep2cart(
    Number(ast.a) || 1,
    Number(ast.e) || 0,
    (Number(ast.i) || 0) * deg,
    (Number(ast.om) || 0) * deg,
    (Number(ast.w) || 0) * deg,
    (Number(ast.ma) || 0) * deg,
    Number(ast.epoch) || 2451545.0,
    jd,
  );
  return { x: state.x, y: state.y, z: state.z };
}
function setMissionAnimationPlayingWrapper(playing: boolean): void {
  setMissionAnimationPlaying(playing, {
    syncSpeedButtons,
    syncMissionSpeedButtons,
    syncMissionPlaybackButtons: noop,
    setIsPlaying,
    setSimSpeed: noop,
  });
}

let selectedAsteroidKey: string | null = null;

function installLegacyBootBridges(): void {
  Object.defineProperty(window, 'selectedId', {
    configurable: true,
    get: () => selectedId,
    set: (v: number) => setSelectedId(v),
  });
  Object.defineProperty(window, 'asteroidData', {
    configurable: true,
    get: () => asteroidData,
  });
  Object.defineProperty(window, 'selectedAsteroidKey', {
    configurable: true,
    get: () => selectedAsteroidKey,
    set: (v: string | null) => { selectedAsteroidKey = v; },
  });
  (window as any).loadSourceStatus = (window as any).loadSourceStatus || {};
  (window as any).saveToIndexedDB = saveToIndexedDB;
  (window as any).fetchNHATSData = fetchNHATSData;
  (window as any).loadStateFromURL = loadStateFromURL;
  (window as any).showTour = showTour;
  (window as any).buildAsteroidMesh = (data: any[]) =>
    buildAsteroidMesh(data, {
      scene,
      dummy,
      currentJD,
      worker: getWorker(),
      asteroidData,
      asteroidCount,
      asteroidMesh,
      positionCache,
      visibleScale,
      keplerPosAU,
      spectralTypeColor,
      getAsteroidDV,
      getDisplayValueUsd,
      applyFilters: noop,
      setAsteroidData,
      setAsteroidCount,
      setAsteroidMesh,
      setPositionCache,
      setVisibleScale,
      setDustMesh: noop,
      setDustCount: noop,
      WORKER_URL: (window as any).WORKER_URL,
    });
}

async function main() {
  installLegacyBootBridges();

  // 1. Physics worker
  initWorker();

  // 2. Three.js scene (renderer + camera + controls + starfield)
  initScene();

  // 3. Planet textures
  initTextures(planets, sunMesh);

  // 4. Burn vector gizmo
  initGizmo(scene);

  // 5. Earth detail shells
  initEarthDetail({
    scene,
    createProceduralLandOverlay,
  });

  // 6. Labels overlay
  initLabels();

  // 7. Tooltips
  initTooltips();

  // 8. Porkchop canvas overlay
  initPorkchop({
    selectedId: () => selectedId,
    asteroidData: () => asteroidData,
    currentJD: () => currentJD,
    currentBurnElements: () => currentBurnElements,
    worker: getWorker(),
    jdToDate,
    setCurrentJD,
  });

  // 9. Panel controls (share, export, deselect)
  initPanelControls(encodeStateToURL, exportFilteredCatalog, deselectAsteroid);

  // 10. Filter events (leaderboard, sliders, toggles)
  initFilterEvents(
    applyFilters,
    renderLeaderboard,
    updateDualRangeUI,
    fmtSliderVal,
    clearActivePresetSelection,
    resetFilters,
    applyPreset,
    saveUserPreset,
    populateSavedPresets,
    exportFilteredCatalog,
    renderEconomicsTab,
    renderMaterialsTab,
    fetchResearchBriefing,
    exportMissionReport,
    fetchPrices,
    setStatus,
    {
      filterDvMin: 0,
      filterDvMax: 12,
      filterValMin: 0,
      filterValMax: 100,
      filterWindowStart: new Date().getFullYear(),
      filterWindowEnd: new Date().getFullYear() + 10,
      filterNHATS: false,
      filterPHA: false,
      filterWater: false,
      filterSpec: { C: true, S: true, M: true, X: true },
      lbSortMode: 'dv',
      matPriceMode: 'earth',
      selectedId,
      asteroidData,
      MISSION_DV_FILTER_MAX: 12,
    },
  );

  // 11. Mission events (planner buttons, trajectory selection)
  initMissionEvents(
    selectedIdRef,
    currentJDRef,
    openMissionPlanner,
    closeMissionPlanner,
    runMissionOptimizer,
    runRedirectOptimizer,
    exportMissionPlan,
    encodeStateToURL,
    selectTrajectory,
    optimalTrajectoryRef,
    missionResultsRef,
    mpBurnsRef,
    renderBurnEditTable,
    getPlayableMissionContext,
    missionContextMatches,
    activatePlayableMission,
    noop,
    setMissionAnimationPlayingWrapper,
    missionAnimRef,
    syncMissionSpeedButtons,
    missionSpeedFromUi,
    activeMissionTypeRef,
    burnsRef,
    MAX_BURNS,
    burnDVRef,
    activeBurnIdxRef,
    computeMultiBurnElements,
    renderBurnList,
    recomputeAllBurnOrbits,
    updateBurnUI,
    burnOrbitLines,
    newOrbitLine,
    originalOrbitLine,
    toggleBurnMode,
    renderer.domElement,
    burnVectorArrows,
    gizmoRaycaster,
    camera,
    SPACECRAFT,
    missionConfig,
    propellantKgNum,
    jdToDate,
    THREE,
    porkchopDataRef,
    jdToDate,
    togglePrimaryPlayback,
    toggleBodyScaleMode,
    toggleMoonOrbitVisuals,
    missionAnimRef,
    syncFollowButton,
    lastSpeedRef,
    setPlayState,
    syncSpeedButtons,
  );

  // 12. Playback events (play/pause, speed, follow-spacecraft)
  initPlaybackEvents(
    togglePrimaryPlayback,
    toggleBodyScaleMode,
    toggleMoonOrbitVisuals,
    missionAnimRef,
    syncFollowButton,
    lastSpeedRef,
    setPlayState,
    syncSpeedButtons,
    setMissionAnimationPlayingWrapper,
    missionSpeedFromUi,
  );

  // 13. Keyboard shortcuts
  initKeyboardShortcuts();

  // 14. Honesty banner + model assumptions toggle
  initHonestyBanner(getSelectedAsteroid);

  // 15. Onboarding tour
  initTour();

  // 16. Async data fetches
  await fetchPrices();
  triggerCatalogFetch();

  // 17. Register per-frame hooks
  const DEG = Math.PI / 180;
  registerAnimateHooks({
    onFrame(dt: number, now: number, elapsedTime: number) {
      setFrameCount(frameCount + 1);

      // Mission animation & time advance
      updateMissionAnimation(dt, clampJD);

      // Spacecraft follow camera
      updateSpacecraftFollow(camera, controls);

      // Burn vector pulse
      updateBurnVectorPulse(burnVectorArrows, elapsedTime);

      // Planet spin
      updatePlanetSpin(dt);
      updateEarthDetailSpin(dt, (PLANET_VISUALS as any).Earth?.rotation ?? 0.0002);

      // Timeline indicator
      if (optimalTrajectory && (() => { const el = document.getElementById('mission-timeline'); return el && el.style.display !== 'none'; })()) {
        updateTimelineIndicator();
      }

      // FPS counter
      setFpsFrames(fpsFrames + 1);
      if (now - fpsLast >= 1000) {
        const fpEl = document.getElementById('fps-display');
        if (fpEl) fpEl.textContent = fpsFrames + ' FPS';
        const ocEl = document.getElementById('obj-count-display');
        if (ocEl) ocEl.textContent = asteroidData.length + ' AST';
        const hEl = document.getElementById('hud-fps');
        if (hEl) hEl.textContent = fpsFrames + ' FPS';
        setFpsFrames(0);
        setFpsLast(now);
      }

      // Time advancement
      if (!missionAnim.active && !isScrubbing && simSpeed !== 0) {
        const nextJD = clampJD(currentJD + (simSpeed / 86400) * dt);
        if (nextJD === currentJD) {
          setIsPlaying(false);
        } else {
          setCurrentJD(nextJD);
        }
      }

      // Worker propagation
      maybePropagateCurrentJD(!isPlaying && !missionAnim.playing);

      // Apply buffered positions
      consumePendingPositions();

      // NHATS pulsing ring
      if (selectedId >= 0 && asteroidData[selectedId]?.nhats?.accessible && positionCache.length > selectedId * 3) {
        nhatsRing.position.set(positionCache[selectedId * 3], positionCache[selectedId * 3 + 1], positionCache[selectedId * 3 + 2]);
        nhatsRing.quaternion.copy(camera.quaternion);
        nhatsRingMat.opacity = Math.sin(Date.now() * 0.002) * 0.3 + 0.5;
        nhatsRing.visible = true;
      } else {
        nhatsRing.visible = false;
      }

      // Gizmo update in burn mode
      if (burnModeActive && selectedId >= 0) {
        updateGizmo({
          burnModeActive, selectedId, asteroidData, currentBurnElements,
          currentJD, camera,
          kep2cartJS: (a: number, e: number, i: number, om: number, w: number, m: number, epoch: number, jd: number) =>
            kep2cart(a, e, i, om, w, m, epoch, jd),
          DEG,
        });
      }

      // Fly-to animation
      if (flyTarget) {
        const ft = flyTarget as any;
        ft.progress = Math.min(1, ft.progress + (16 / 1500));
        const t = ft.progress;
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const tgtV = new THREE.Vector3(ft.x, ft.y, ft.z);
        const dir = new THREE.Vector3(0.3, 0.4, 1).normalize();
        const dest = tgtV.clone().add(dir.multiplyScalar(ft.dist));
        camera.position.lerp(dest, ease * 0.08);
        (camera as any).controls?.target?.lerp?.(tgtV, ease * 0.08);
        if (ft.progress >= 1) setFlyTarget(null);
      }

      // Earth layer distance check
      if (planets[2]) {
        const earthPos = planets[2].position;
        const distToEarth = camera.position.distanceTo(earthPos);
        if (distToEarth < 0.15 && !earthLayerActive) {
          earthDetailGroup.visible = true;
          shellGroup.visible = true;
        } else if (distToEarth >= 0.15 && earthLayerActive) {
          earthDetailGroup.visible = false;
          shellGroup.visible = false;
        }
        if (earthLayerActive) {
          earthDetailGroup.position.copy(earthPos);
          shellGroup.position.copy(earthPos);
        }
      }

      // Sun light tracks Earth
      if (planets[2]) {
        (camera as any)._sunDir?.target?.position?.copy?.(planets[2].position);
      }
    },
  });

  // 18. Animation loop
  animate();
}

main().catch(err => console.error('[main] boot failed:', err));
