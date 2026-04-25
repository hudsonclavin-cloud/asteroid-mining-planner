import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// TODO: import from src/utils/constants (TWO_PI, BODY_SCALE_MODES)

// ─── Three.js Setup ───────────────────────────────────────────────────────────
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x050508);
document.body.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 2000);
camera.position.set(0, 6, 18);
camera.lookAt(0, 0, 0);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.1;
controls.maxDistance = 500;
export const clock = new THREE.Clock();
// TODO: import from src/utils/constants (BODY_SCALE_MODES)
let bodyScaleMode = /* BODY_SCALE_MODES.readable */ 'readable';
export let moonOrbitVisualsEnabled = true;
export function setMoonOrbitVisualsEnabled(v: boolean) { moonOrbitVisualsEnabled = v; }

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
export const sunDirectional = new THREE.DirectionalLight(0xffffff, 0.8);
sunDirectional.castShadow = false;
scene.add(sunDirectional);
scene.add(sunDirectional.target);

export const SUN_DISPLAY_RADIUS = 0.06;
export const SUN_TRUE_RADIUS_KM = 696340;
export const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_DISPLAY_RADIUS, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff4e0 })
);
sunMesh.userData.baseRadius = SUN_DISPLAY_RADIUS;
sunMesh.userData.trueRadiusKm = SUN_TRUE_RADIUS_KM;
scene.add(sunMesh);
export const sunGlowMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff4e0, transparent: true, opacity: 0.15 })
);
sunGlowMesh.userData.baseRadius = 0.12;
sunGlowMesh.userData.trueRadiusKm = SUN_TRUE_RADIUS_KM * (0.12 / SUN_DISPLAY_RADIUS);
scene.add(sunGlowMesh);

// Starfield
(function() {
  const N = 8000;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    // TODO: import from src/utils/constants (TWO_PI)
    const TWO_PI = 2 * Math.PI;
    const theta = Math.random() * TWO_PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 300 + Math.random() * 200;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true, transparent: true, opacity: 0.5 })));
})();

export function initScene(): void {
  // Scene, renderer, camera, controls, starfield are all initialized above at module scope.
  // Call this to ensure side-effects (DOM attachment) have run.
}

// ─── Object disposal ──────────────────────────────────────────────────────────
// Source: index.html lines 3966–3973

function disposeMaterial(mat: any) {
  if (!mat) return;
  if (Array.isArray(mat)) { mat.forEach(disposeMaterial); return; }
  if (typeof mat.dispose === 'function') mat.dispose();
}

export function disposeObject3D(obj: THREE.Object3D | null | undefined): void {
  if (!obj) return;
  obj.traverse((node: any) => {
    if (node.geometry && !node.geometry.userData?.sharedAsset && typeof node.geometry.dispose === 'function') node.geometry.dispose();
    disposeMaterial(node.material);
  });
  if (obj.parent) obj.parent.remove(obj);
}

// ─── Main animation loop ──────────────────────────────────────────────────────
// TODO: import from src/renderer/scene/planets (planets)
// TODO: import from src/renderer/scene/moon/index (moonOrbitLine, moonMesh, moonRelativeSceneState, MOON_PERIOD_DAYS)
// TODO: import from src/renderer/scene/orbits/index (nhatsRing, nhatsRingMat)
// TODO: import from src/ui/... (placeLabels, updateMissionAnimation, updateSpacecraftFollow, updateBurnVectorPulse, updatePlanetSpin, updateTimelineIndicator)
// TODO: import from src/physics/... (maybePropagateCurrentJD)
// TODO: import from src/... (clampJD, setCurrentJD, setPlayState)
// TODO: import from src/... (asteroidData, positionCache, selectedId, currentJD, lastPropJD, isPlaying, isScrubbing, simSpeed, missionAnim, optimalTrajectory, pendingPositions, applyPositions, burnModeActive, currentBurnElements, ghostTime, ghostOriginal, ghostNew, updateGizmo, flyTarget, earthLayerActive, earthDetailGroup, shellGroup, satellitesEnabled, satelliteMesh, satelliteData, propagateSatellite, issIndex, drawISSOrbit, frameCount, fpsFrames, fpsLast, asteroidCount, dummy, kep2cartJS, DEG)
// TODO: import from src/renderer/scene/earth (activateEarthLayer, deactivateEarthLayer)
export function animate(): void {
  requestAnimationFrame(animate);

  // TODO: frameCount, fpsFrames, fpsLast are module-level state — import or hoist from src/...
  // frameCount++;
  const now = performance.now();
  const dt = Math.min(clock.getDelta(), 0.1);

  // TODO: import updateMissionAnimation from src/...
  // updateMissionAnimation(dt);
  // TODO: import updateSpacecraftFollow from src/...
  // updateSpacecraftFollow();
  // TODO: import updateBurnVectorPulse from src/...
  // updateBurnVectorPulse(clock.elapsedTime);
  // TODO: import updatePlanetSpin from src/...
  // updatePlanetSpin(dt);
  // TODO: import optimalTrajectory, updateTimelineIndicator from src/...
  // if (optimalTrajectory && document.getElementById('mission-timeline').style.display !== 'none') {
  //   updateTimelineIndicator();
  // }

  // FPS counter
  // TODO: fpsFrames, fpsLast, asteroidCount are module-level state — import from src/...
  // fpsFrames++;
  // if (now - fpsLast >= 1000) {
  //   document.getElementById('fps-display').textContent = fpsFrames + ' FPS';
  //   document.getElementById('obj-count-display').textContent = asteroidCount + ' AST';
  //   const hudFps = document.getElementById('hud-fps');
  //   if (hudFps) hudFps.textContent = fpsFrames + ' FPS';
  //   fpsFrames = 0;
  //   fpsLast = now;
  // }

  // TODO: import missionAnim, isScrubbing, simSpeed, currentJD, clampJD, setPlayState, setCurrentJD from src/...
  // if (!missionAnim.active && !isScrubbing && simSpeed !== 0) {
  //   const nextJD = clampJD(currentJD + (simSpeed / 86400) * dt);
  //   if (nextJD === currentJD) {
  //     setPlayState(false);
  //   } else {
  //     setCurrentJD(nextJD, { propagate: false });
  //   }
  // }

  // TODO: import isPlaying, missionAnim, currentJD, lastPropJD, isScrubbing, maybePropagateCurrentJD from src/...
  // if ((isPlaying || missionAnim.playing) && currentJD !== lastPropJD) {
  //   maybePropagateCurrentJD(false);
  // } else if (!isScrubbing && currentJD !== lastPropJD) {
  //   maybePropagateCurrentJD(true);
  // }

  // TODO: import pendingPositions, applyPositions from src/...
  // if (pendingPositions) {
  //   applyPositions(pendingPositions);
  //   pendingPositions = null;
  // }

  // NHATS pulsing ring
  // TODO: import selectedId, asteroidData, positionCache, nhatsRing, nhatsRingMat from src/...
  // if (selectedId >= 0 && asteroidData[selectedId]?.nhats?.accessible && positionCache.length > selectedId * 3) {
  //   nhatsRing.position.set(positionCache[selectedId*3], positionCache[selectedId*3+1], positionCache[selectedId*3+2]);
  //   nhatsRing.quaternion.copy(camera.quaternion);
  //   nhatsRingMat.opacity = Math.sin(Date.now() * 0.002) * 0.3 + 0.5;
  //   nhatsRing.visible = true;
  // } else {
  //   nhatsRing.visible = false;
  // }

  // Update gizmo in burn mode
  // TODO: import burnModeActive, selectedId, updateGizmo, currentBurnElements, ghostTime, ghostOriginal, ghostNew, asteroidData, kep2cartJS, DEG, currentJD from src/...
  // if (burnModeActive && selectedId >= 0) {
  //   updateGizmo();
  //   // Ghost orbit tracers
  //   if (currentBurnElements) {
  //     ghostTime = (ghostTime + 0.0008) % 1;
  //     const tJD = currentJD + ghostTime * 730;
  //     const ast = asteroidData[selectedId];
  //     try {
  //       const posOrig = kep2cartJS(ast.a, ast.e, ast.i*DEG, ast.om*DEG, ast.w*DEG, ast.ma*DEG, ast.epoch, tJD);
  //       const posNew = kep2cartJS(currentBurnElements.a, currentBurnElements.e,
  //         currentBurnElements.i, currentBurnElements.Om, currentBurnElements.w,
  //         currentBurnElements.M0, currentBurnElements.epoch_JD, tJD);
  //       ghostOriginal.position.set(posOrig.x, posOrig.y, posOrig.z);
  //       ghostNew.position.set(posNew.x, posNew.y, posNew.z);
  //       ghostOriginal.visible = true;
  //       ghostNew.visible = true;
  //     } catch(_) {}
  //   } else {
  //     ghostOriginal.visible = false;
  //     ghostNew.visible = false;
  //   }
  // }

  // Fly-to animation
  // TODO: import flyTarget from src/...
  // if (flyTarget) {
  //   flyTarget.progress = Math.min(1, flyTarget.progress + (16/1500));
  //   const t = flyTarget.progress;
  //   const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  //   const tgtV = new THREE.Vector3(flyTarget.x, flyTarget.y, flyTarget.z);
  //   const dir = new THREE.Vector3(0.3, 0.4, 1).normalize();
  //   const dest = tgtV.clone().add(dir.multiplyScalar(flyTarget.dist));
  //   camera.position.lerp(dest, ease * 0.08);
  //   controls.target.lerp(tgtV, ease * 0.08);
  //   if (flyTarget.progress >= 1) flyTarget = null;
  // }

  // ─── Phase 4: Earth Layer ─────────────────────────────────────────────────
  // TODO: import planets from src/renderer/scene/planets
  // TODO: import activateEarthLayer, deactivateEarthLayer, earthLayerActive, earthDetailGroup, shellGroup from src/renderer/scene/earth
  // const earthPos = planets[2].position;
  // const distToEarth = camera.position.distanceTo(earthPos);
  // if (distToEarth < 0.15 && !earthLayerActive) activateEarthLayer();
  // else if (distToEarth >= 0.15 && earthLayerActive) deactivateEarthLayer();

  // if (earthLayerActive) {
  //   earthDetailGroup.position.copy(earthPos);
  //   shellGroup.position.copy(earthPos);
  //   if (satellitesEnabled && satelliteMesh && satelliteData.length > 0 && frameCount % 3 === 0) {
  //     const satCount = Math.min(satelliteData.length, 8000);
  //     for (let i = 0; i < satCount; i++) {
  //       try {
  //         const pos = propagateSatellite(satelliteData[i], currentJD);
  //         dummy.position.set(earthPos.x+pos.x, earthPos.y+pos.y, earthPos.z+pos.z);
  //         dummy.scale.setScalar(1);
  //       } catch(_) {
  //         dummy.position.set(earthPos.x, earthPos.y, earthPos.z);
  //         dummy.scale.setScalar(0);
  //       }
  //       dummy.updateMatrix();
  //       satelliteMesh.setMatrixAt(i, dummy.matrix);
  //     }
  //     satelliteMesh.instanceMatrix.needsUpdate = true;
  //   }
  //   if (issIndex >= 0 && frameCount % 30 === 0) drawISSOrbit();
  // }

  // Orbital ellipse is static per selection — no per-frame trail update needed

  // ─── Phase 5: Labels ──────────────────────────────────────────────────────
  // TODO: import placeLabels from src/ui/...
  // placeLabels();

  // TODO: import planets, sunDirectional from src/renderer/scene/planets and src/renderer/lighting
  // sunDirectional.target.position.copy(planets[2].position);
  controls.update();
  renderer.render(scene, camera);
}
