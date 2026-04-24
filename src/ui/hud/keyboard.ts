// TODO: import { toggleBurnMode, cancelBurn } from 'src/ui/hud/mission-control/burn-mode.ts'
// TODO: import { burnModeActive } from 'src/ui/hud/mission-control/state.ts'
// TODO: import { selectedId, asteroidData } from 'src/data/catalog.ts'
// TODO: import { flyTo, deselectAsteroid } from 'src/ui/hud/selection.ts'
// TODO: import { toggleLeftPanel } from 'src/ui/panels/left/index.ts'
// TODO: import { closeMissionPlanner } from 'src/ui/hud/mission-control/index.ts'
// TODO: import { togglePrimaryPlayback, setPlayState, syncSpeedButtons, setMissionAnimationPlaying } from 'src/time/playback.ts'
// TODO: import { setCurrentJD } from 'src/time/state.ts'
// TODO: import { currentJD, lastSpeed, isPlaying, simSpeed } from 'src/time/state.ts'
// TODO: import { missionAnim, missionUiFromSpeed, missionSpeedFromUi } from 'src/ui/hud/mission-control/state.ts'
// TODO: import { trailsEnabled, clearTrail, updateOrbitEllipse } from 'src/renderer/trails.ts'
// TODO: import { planets } from 'src/renderer/planets.ts'
// TODO: import { camera, controls } from 'src/renderer/scene.ts'
// TODO: import { activateEarthLayer, deactivateEarthLayer, earthLayerActive } from 'src/ui/hud/earth-layer.ts'
// TODO: import { setStatus } from 'src/ui/hud/status.ts'
// TODO: import { planetOrbitGroup } from 'src/renderer/scene.ts'
// TODO: import { asteroidMesh } from 'src/data/catalog.ts'

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────
export const SPEED_STEPS = [1, 10, 100, 1000, 10000];

/**
 * Attach all keyboard shortcut listeners to the window.
 * Call once during app initialisation.
 */
export function initKeyboardShortcuts(): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const so = document.getElementById('shortcut-overlay')!;
    if (e.key === '?') {
      so.style.display = so.style.display === 'flex' ? 'none' : 'flex';
      return;
    }
    if (e.key === 'Escape') {
      if (so.style.display === 'flex') { so.style.display = 'none'; return; }
      const mp = document.getElementById('mission-planner');
      if (mp && mp.style.display === 'flex') { closeMissionPlanner(); return; } // TODO: import closeMissionPlanner from src/ui/hud/mission-control/index.ts
      if (burnModeActive) { cancelBurn(); return; } // TODO: import burnModeActive, cancelBurn
      if (selectedId >= 0) { deselectAsteroid(); return; } // TODO: import selectedId, deselectAsteroid
      return;
    }
    if (e.key === 'b' || e.key === 'B') { if (selectedId >= 0) toggleBurnMode(); return; } // TODO: import toggleBurnMode
    if (e.key === ' ') {
      e.preventDefault();
      togglePrimaryPlayback(); // TODO: import from src/time/playback.ts
      return;
    }
    if (e.key === '[') {
      const activeStep = missionAnim.active ? missionUiFromSpeed(missionAnim.speed) : lastSpeed; // TODO: import missionAnim, lastSpeed
      const idx = SPEED_STEPS.indexOf(activeStep);
      if (idx > 0) {
        const nextStep = SPEED_STEPS[idx - 1];
        if (missionAnim.active) {
          missionAnim.speed = missionSpeedFromUi(nextStep); // TODO: import missionSpeedFromUi
        } else {
          lastSpeed = nextStep;
          if (isPlaying) simSpeed = lastSpeed; // TODO: import isPlaying, simSpeed
        }
        syncSpeedButtons(); // TODO: import from src/time/playback.ts
      } else if (missionAnim.active) {
        setMissionAnimationPlaying(false); // TODO: import from src/time/playback.ts
      } else {
        setPlayState(false); // TODO: import from src/time/playback.ts
      }
      return;
    }
    if (e.key === ']') {
      const activeStep = missionAnim.active ? missionUiFromSpeed(missionAnim.speed) : lastSpeed;
      const idx = SPEED_STEPS.indexOf(activeStep);
      if (idx < SPEED_STEPS.length - 1) {
        const nextStep = SPEED_STEPS[idx + 1];
        if (missionAnim.active) {
          missionAnim.speed = missionSpeedFromUi(nextStep);
        } else {
          lastSpeed = nextStep;
          if (isPlaying) simSpeed = lastSpeed;
        }
        syncSpeedButtons();
      }
      return;
    }
    if (e.key === 'f' || e.key === 'F') { if (selectedId >= 0) flyTo(selectedId); return; } // TODO: import flyTo from src/ui/hud/selection.ts
    if (e.key === 'e' || e.key === 'E') {
      const ep = planets[2].position; // TODO: import planets from src/renderer/planets.ts
      flyTarget = { x: ep.x, y: ep.y + 0.05, z: ep.z + 0.1, dist: 0, progress: 0 }; // TODO: import flyTarget setter from src/renderer/camera.ts
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      camera.position.set(0, 6, 18); // TODO: import camera from src/renderer/scene.ts
      controls.target.set(0, 0, 0);  // TODO: import controls from src/renderer/scene.ts
      flyTarget = null;
      return;
    }
    if (e.key === 't' || e.key === 'T') {
      trailsEnabled = !trailsEnabled; // TODO: import trailsEnabled from src/renderer/trails.ts
      if (!trailsEnabled) clearTrail(); // TODO: import clearTrail from src/renderer/trails.ts
      else if (selectedId >= 0) { const ast = asteroidData[selectedId]; if (ast) updateOrbitEllipse(ast); } // TODO: import asteroidData, updateOrbitEllipse
      setStatus(trailsEnabled ? 'Trails ON' : 'Trails OFF'); // TODO: import setStatus from src/ui/hud/status.ts
      return;
    }
    if (e.key === 'm' || e.key === 'M') {
      toggleLeftPanel(); // TODO: import from src/ui/panels/left/index.ts
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setCurrentJD(currentJD - 1); // TODO: import setCurrentJD, currentJD from src/time/state.ts
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setCurrentJD(currentJD + 1);
      return;
    }
    if (e.key === '1') {
      if (asteroidMesh) { asteroidMesh.visible = !asteroidMesh.visible; setStatus(asteroidMesh.visible ? 'Asteroid cloud ON' : 'Asteroid cloud OFF'); } // TODO: import asteroidMesh from src/data/catalog.ts
      return;
    }
    if (e.key === '2') {
      planetOrbitGroup.visible = !planetOrbitGroup.visible; // TODO: import planetOrbitGroup from src/renderer/scene.ts
      setStatus(planetOrbitGroup.visible ? 'Planet orbits ON' : 'Planet orbits OFF');
      return;
    }
    if (e.key === '3') {
      trailsEnabled = !trailsEnabled;
      if (!trailsEnabled) clearTrail();
      else if (selectedId >= 0) { const ast = asteroidData[selectedId]; if (ast) updateOrbitEllipse(ast); }
      setStatus(trailsEnabled ? 'Trails ON' : 'Trails OFF');
      return;
    }
    if (e.key === '4') {
      if (earthLayerActive) deactivateEarthLayer(); else activateEarthLayer(); // TODO: import from src/ui/hud/earth-layer.ts
      setStatus(earthLayerActive ? 'Earth layer ON' : 'Earth layer OFF');
      return;
    }
  });
}

// ─── Module-level declarations for cross-module deps ─────────────────────────
// TODO: replace all declares below with real imports once modules are extracted

declare let burnModeActive: boolean;
declare let selectedId: number;
declare let asteroidData: any[];
declare let currentJD: number;
declare let lastSpeed: number;
declare let isPlaying: boolean;
declare let simSpeed: number;
declare let trailsEnabled: boolean;
declare let flyTarget: any;
declare let earthLayerActive: boolean;
declare let planetOrbitGroup: any;
declare let asteroidMesh: any;
declare const missionAnim: any;
declare const planets: any[];
declare const camera: any;
declare const controls: any;
declare function toggleBurnMode(): void;
declare function cancelBurn(): void;
declare function deselectAsteroid(): void;
declare function flyTo(id: number): void;
declare function toggleLeftPanel(): void;
declare function closeMissionPlanner(): void;
declare function togglePrimaryPlayback(): void;
declare function setPlayState(playing: boolean): void;
declare function syncSpeedButtons(): void;
declare function setMissionAnimationPlaying(playing: boolean): void;
declare function setCurrentJD(jd: number): void;
declare function missionUiFromSpeed(speed: number): number;
declare function missionSpeedFromUi(step: number): number;
declare function clearTrail(): void;
declare function updateOrbitEllipse(ast: any): void;
declare function activateEarthLayer(): void;
declare function deactivateEarthLayer(): void;
declare function setStatus(msg: string): void;
