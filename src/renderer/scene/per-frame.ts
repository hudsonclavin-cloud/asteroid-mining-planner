/**
 * Per-frame helpers for the animation loop.
 * Imports all the dependencies that animate() needs to apply worker position
 * updates to the Three.js scene, and to update the timeline indicator.
 */

import { planets } from './planets';
import { moonMesh, moonRelativeSceneState, updateMoonOrbitVisualization } from './moon/index';
import { updateMajorMoons } from './moon/major-moons';
import { syncActiveMissionVisuals } from './mission-overlay';
import {
  asteroidMesh, asteroidCount, positionCache, visibleScale, pendingPositions, setPendingPositions,
} from '../../state/index';
import { dummy } from './index';
import { currentJD } from '../../utils/time-state';
import { optimalTrajectory } from '../../state/index';
import { setGlowLinePoints } from './orbits/index';

// moonOrbitLine is declared in moon/index but not yet wired — skip orbit viz for now
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _moonOrbitLine: any = null;
export function setMoonOrbitLineRef(line: any) { _moonOrbitLine = line; }

export function applyPositions(buf: Float32Array): void {
  // Update planet positions (first 8 × 3 floats)
  for (let i = 0; i < 8; i++) {
    if (planets[i]) planets[i].position.set(buf[i * 3], buf[i * 3 + 1], buf[i * 3 + 2]);
  }

  // Update Moon
  const rel = moonRelativeSceneState(currentJD);
  const ep = planets[2].position;
  moonMesh.position.set(ep.x + rel.x, ep.y + rel.y, ep.z + rel.z);
  moonMesh.lookAt(planets[2].position);

  updateMajorMoons(currentJD);

  if (_moonOrbitLine) {
    updateMoonOrbitVisualization(currentJD, _moonOrbitLine, planets, setGlowLinePoints);
  }

  // Update asteroid InstancedMesh
  if (asteroidMesh && asteroidCount > 0) {
    const base = 24; // 8 planets × 3 floats
    for (let i = 0; i < asteroidCount; i++) {
      const x = buf[base + i * 3], y = buf[base + i * 3 + 1], z = buf[base + i * 3 + 2];
      positionCache[i * 3]     = x;
      positionCache[i * 3 + 1] = y;
      positionCache[i * 3 + 2] = z;
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(visibleScale.length > i ? visibleScale[i] : 1.0);
      dummy.updateMatrix();
      asteroidMesh.setMatrixAt(i, (dummy as any).matrix);
    }
    asteroidMesh.instanceMatrix.needsUpdate = true;
  }

  syncActiveMissionVisuals();
}

export function consumePendingPositions(): void {
  if (pendingPositions) {
    applyPositions(pendingPositions);
    setPendingPositions(null);
  }
}

export function updateTimelineIndicator(): void {
  const traj = optimalTrajectory as any;
  if (!traj) return;
  const jdMin = traj.jd_dep || 0;
  const jdMax = traj.jd_ret_arr || traj.jd_arr || jdMin + 1;
  const t = Math.max(0, Math.min(1, (currentJD - jdMin) / (jdMax - jdMin)));
  const el = document.getElementById('mission-timeline-indicator') as HTMLElement | null;
  if (el) el.style.left = (t * 100) + '%';
}
