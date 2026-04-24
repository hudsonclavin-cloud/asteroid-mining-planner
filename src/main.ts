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

// ── Worker client ─────────────────────────────────────────────────────────────
import { initWorker } from './workers/physics/client';

// ── Renderer ──────────────────────────────────────────────────────────────────
import { initScene, scene, planets, sunMesh, animate } from './renderer/scene/index';
import { initTextures } from './renderer/scene/textures';
import { initGizmo } from './renderer/scene/gizmo';
import { initEarthDetail } from './renderer/scene/earth/detail';
import { initPorkchop } from './renderer/scene/orbits/porkchop';

// ── UI ────────────────────────────────────────────────────────────────────────
import { initLabels } from './ui/overlays/labels';
import { initTooltips } from './ui/overlays/tooltips';
import { initPanelControls } from './ui/panels/bottom/controls';
import { initFilterEvents } from './ui/panels/left/filter-events';
import { initMissionEvents, initPlaybackEvents } from './ui/hud/mission-control/events';
import { initKeyboardShortcuts } from './ui/hud/keyboard';
import { initHonestyBanner } from './ui/modals/honesty-banner';
import { initTour } from './ui/modals/tour';

// ── Data ──────────────────────────────────────────────────────────────────────
import { fetchPrices } from './economics/pricing/index';
import { fetchNHATSData } from './data/nhats/index';

async function main() {
  // 1. Physics worker
  initWorker();

  // 2. Three.js scene (renderer + camera + controls + starfield)
  initScene();

  // 3. Planet textures
  initTextures(planets, sunMesh);

  // 4. Burn vector gizmo
  initGizmo(scene);

  // 5. Earth detail shells
  // TODO: pass createProceduralLandOverlay from renderer/scene/earth/detail once wired
  initEarthDetail({
    scene,
    // @ts-ignore — runtime global during transition
    createProceduralLandOverlay: (typeof createProceduralLandOverlay !== 'undefined')
      // @ts-ignore
      ? createProceduralLandOverlay : () => null,
  });

  // 6. Labels overlay
  initLabels();

  // 7. Tooltips
  initTooltips();

  // 8. Porkchop canvas overlay
  // TODO: pass porkchop deps once wired
  initPorkchop({
    // @ts-ignore — runtime globals during transition
    getPorkchopData: () => (typeof porkchopData !== 'undefined' ? porkchopData : null),
    // @ts-ignore
    renderPorkchop: () => {},
  });

  // 9. Panel controls (share, export, deselect)
  initPanelControls(
    // @ts-ignore — runtime global during transition
    () => (typeof encodeStateToURL !== 'undefined' ? encodeStateToURL() : undefined),
    // @ts-ignore
    () => (typeof exportFilteredCatalog !== 'undefined' ? exportFilteredCatalog() : undefined),
    // @ts-ignore
    () => (typeof deselectAsteroid !== 'undefined' ? deselectAsteroid() : undefined),
  );

  // 10. Filter events (leaderboard, sliders, toggles)
  // TODO: pass applyFilters, renderLeaderboard, updateDualRangeUI once wired
  initFilterEvents(
    // @ts-ignore
    () => (typeof applyFilters !== 'undefined' ? applyFilters() : undefined),
    // @ts-ignore
    () => (typeof renderLeaderboard !== 'undefined' ? renderLeaderboard() : undefined),
    // @ts-ignore — pass through runtime stubs
    ...([] as any[]),
  );

  // 11. Mission events (planner buttons, trajectory selection)
  // TODO: pass typed callbacks once modules are wired
  initMissionEvents(
    // @ts-ignore
    { value: (typeof selectedId !== 'undefined' ? selectedId : -1) },
    // @ts-ignore
    { value: (typeof currentJD !== 'undefined' ? currentJD : 2451545.0) },
    // @ts-ignore
    (id: number) => (typeof openMissionPlanner !== 'undefined' ? openMissionPlanner(id) : undefined),
    // @ts-ignore
    () => (typeof closeMissionPlanner !== 'undefined' ? closeMissionPlanner() : undefined),
    // @ts-ignore
    () => (typeof runMissionOptimizer !== 'undefined' ? runMissionOptimizer() : undefined),
    // @ts-ignore
    () => (typeof runRedirectOptimizer !== 'undefined' ? runRedirectOptimizer() : undefined),
    // @ts-ignore
    () => (typeof exportMissionPlan !== 'undefined' ? exportMissionPlan() : undefined),
    // @ts-ignore
    () => (typeof shareMissionPlan !== 'undefined' ? shareMissionPlan() : undefined),
    // @ts-ignore
    (idx: number) => (typeof selectTrajectory !== 'undefined' ? selectTrajectory(idx) : undefined),
  );

  // 12. Playback events (play/pause, speed, follow-spacecraft)
  initPlaybackEvents(
    // @ts-ignore
    () => (typeof togglePrimaryPlayback !== 'undefined' ? togglePrimaryPlayback() : undefined),
    // @ts-ignore
    () => (typeof toggleBodyScaleMode !== 'undefined' ? toggleBodyScaleMode() : undefined),
    // @ts-ignore
    () => (typeof toggleMoonOrbitVisuals !== 'undefined' ? toggleMoonOrbitVisuals() : undefined),
    // @ts-ignore
    { value: null },
    // @ts-ignore
    () => (typeof syncFollowButton !== 'undefined' ? syncFollowButton() : undefined),
    // @ts-ignore
    { value: 1 },
    // @ts-ignore
    (playing: boolean) => (typeof setPlayState !== 'undefined' ? setPlayState(playing) : undefined),
    // @ts-ignore
    () => (typeof syncSpeedButtons !== 'undefined' ? syncSpeedButtons() : undefined),
    // @ts-ignore
    (playing: boolean) => (typeof setMissionAnimationPlaying !== 'undefined' ? setMissionAnimationPlaying(playing) : undefined),
    // @ts-ignore
    (speed: number) => speed,
  );

  // 13. Keyboard shortcuts
  initKeyboardShortcuts();

  // 14. Honesty banner + model assumptions toggle
  initHonestyBanner(
    // @ts-ignore
    () => (typeof getSelectedAsteroid !== 'undefined' ? getSelectedAsteroid() : null),
  );

  // 15. Onboarding tour
  initTour();

  // 16. Async data fetches
  await Promise.all([
    fetchPrices(),
    fetchNHATSData(),
  ]);

  // 17. Animation loop
  animate();
}

main().catch(err => console.error('[main] boot failed:', err));
