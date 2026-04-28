import * as THREE from 'three';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  configureFrameTransformHooks,
  resetFrameTransformHooks,
  transformCanonicalState,
  type CanonicalState,
} from '../../core/index.js';
import { BODY_CONSTANTS } from '../../core/constants/bodies.js';
import type { BodyId } from '../../core/constants/bodies.js';
import { loadSlice2StatesBrowser, SLICE2_EPOCH_TDB } from './loader.js';
import type { CanonicalStateSample } from '../../boundary/horizons.js';
import { HaloSystem } from '../../render/halos.js';

const AU_M = 149_597_870_700;
const OVERVIEW_ORBIT_RADIUS_M = 7.5 * AU_M;
const MIN_CAMERA_DISTANCE_M = 1e9;        // ~6.7 AU min zoom
const MAX_CAMERA_DISTANCE_M = 15 * AU_M; // 15 AU max zoom-out
const ORBIT_SENSITIVITY = 0.005;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const TIME_SCRUB_STEP = 1;
const TIME_SCRUB_FAST_STEP = 5;
const FOCUS_TRANSITION_DURATION_MS = 650;

// All six body IDs in render order
const BODY_IDS: BodyId[] = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];
const FOCUS_KEY_TO_BODY: Record<string, BodyId> = {
  '1': 'sun',
  '2': 'mercury',
  '3': 'venus',
  '4': 'earth',
  '5': 'moon',
  '6': 'mars',
};

type FocusBodyId = BodyId | null;
type Position3 = CanonicalState['positionM'];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function smoothstep(progress: number): number {
  const clamped = clamp(progress, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function lerpPosition(start: Position3, end: Position3, progress: number): Position3 {
  return {
    x: lerp(start.x, end.x, progress),
    y: lerp(start.y, end.y, progress),
    z: lerp(start.z, end.z, progress),
  };
}

function sphericalToCartesian(radius: number, polar: number, azimuth: number): { x: number; y: number; z: number } {
  const sinPolar = Math.sin(polar);
  return {
    x: radius * sinPolar * Math.cos(azimuth),
    y: radius * Math.cos(polar),
    z: radius * sinPolar * Math.sin(azimuth),
  };
}

function createBodyMesh(bodyId: BodyId): THREE.Mesh {
  const constants = BODY_CONSTANTS[bodyId];
  const geometry = new THREE.SphereGeometry(constants.radiusM, 32, 32);

  let material: THREE.Material;
  if (bodyId === 'sun') {
    material = new THREE.MeshBasicMaterial({ color: constants.vizColor });
  } else {
    material = new THREE.MeshLambertMaterial({ color: constants.vizColor });
  }

  return new THREE.Mesh(geometry, material);
}

function getDefaultFocusRadius(bodyId: BodyId): number {
  const radiusM = BODY_CONSTANTS[bodyId].radiusM;
  return Math.max(5 * radiusM, radiusM + 400_000);
}

function getMinOrbitRadiusForFocus(bodyId: FocusBodyId): number {
  if (bodyId === null) {
    return MIN_CAMERA_DISTANCE_M;
  }
  return BODY_CONSTANTS[bodyId].radiusM + 400_000;
}

export async function mountInnerSolarSystem(mount: HTMLElement): Promise<() => void> {
  // Load all slice-2 states (browser-compatible fetch-based loader)
  const allStates = await loadSlice2StatesBrowser();

  // Build per-body lookup: tdbSeconds -> CanonicalState
  const stateMap = new Map<string, Map<number, CanonicalState>>();
  for (const [bodyId, samples] of Object.entries(allStates) as [string, CanonicalStateSample[]][]) {
    const m = new Map<number, CanonicalState>();
    for (const sample of samples) {
      m.set(sample.state.tdbSeconds, sample.state);
    }
    stateMap.set(bodyId, m);
  }

  // Ordered sample keys for stepping (all bodies share the same timestamps)
  const earthSamples = allStates['earth' as BodyId];
  const sampleTimestamps: number[] = earthSamples.map((s) => s.state.tdbSeconds);
  const totalSamples = sampleTimestamps.length;

  const earthMap = stateMap.get('earth')!;

  // Configure frame transform hook so GCRS↔HELIO can look up Earth anchor
  configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds: number): CanonicalState {
      const state = earthMap.get(tdbSeconds);
      if (!state) {
        throw new Error(`Missing Earth anchor for tdbSeconds=${tdbSeconds}`);
      }
      return state;
    },
  });

  // --- Three.js setup ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  mount.replaceChildren(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    MAX_CAMERA_DISTANCE_M * 10,
  );

  // Body meshes
  const meshes = new Map<BodyId, THREE.Mesh>();
  for (const bodyId of BODY_IDS) {
    const mesh = createBodyMesh(bodyId);
    scene.add(mesh);
    meshes.set(bodyId, mesh);
  }

  // Lighting: ambient + directional from Sun's position
  const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
  const sunLightTarget = new THREE.Object3D();
  scene.add(ambientLight, sunLight, sunLightTarget);
  sunLight.target = sunLightTarget;

  // Halo system
  const haloSystem = new HaloSystem(scene);

  // Camera orbit state — initial view is heliocentric overview at ~7.5 AU.
  let orbitRadius = OVERVIEW_ORBIT_RADIUS_M;
  let orbitAzimuth = 0;
  let orbitPolar = Math.PI * 0.35;
  let currentFocusBody: FocusBodyId = null;
  let targetFocusBody: FocusBodyId = null;
  let focusTransitionStartMs = 0;
  let focusTransitionFromAnchor: Position3 | null = null;

  let currentSampleIndex = 0;
  let disposed = false;
  let pointerActive = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let animationHandle = 0;

  /**
   * Get heliocentric state for a body at the current sample index.
   * Moon samples are in FRAME_GCRS_EARTH and must be transformed to heliocentric.
   */
  function getHeliocentricState(bodyId: BodyId): CanonicalState | null {
    const tdbSeconds = sampleTimestamps[currentSampleIndex];
    const bodyMap = stateMap.get(bodyId);
    if (!bodyMap) return null;
    const state = bodyMap.get(tdbSeconds);
    if (!state) return null;

    if (bodyId === 'moon' && state.frame === FRAME_GCRS_EARTH) {
      return transformCanonicalState(state, FRAME_GCRS_EARTH, FRAME_HELIO_J2000_ICRF, tdbSeconds);
    }
    return state;
  }

  function getAnchorPosition(bodyId: FocusBodyId): Position3 | null {
    if (bodyId === null) {
      return getHeliocentricState('sun')?.positionM ?? null;
    }
    return getHeliocentricState(bodyId)?.positionM ?? null;
  }

  function hasActiveFocusTransition(nowMs: number): boolean {
    return (
      focusTransitionFromAnchor !== null &&
      targetFocusBody !== currentFocusBody &&
      nowMs - focusTransitionStartMs < FOCUS_TRANSITION_DURATION_MS
    );
  }

  function getActiveFocusBody(nowMs: number): FocusBodyId {
    return hasActiveFocusTransition(nowMs) ? targetFocusBody : currentFocusBody;
  }

  function getCurrentOrbitCenter(nowMs: number): Position3 | null {
    const targetAnchor = getAnchorPosition(targetFocusBody);
    if (!targetAnchor) {
      return null;
    }

    if (!hasActiveFocusTransition(nowMs) || focusTransitionFromAnchor === null) {
      if (targetFocusBody !== currentFocusBody) {
        currentFocusBody = targetFocusBody;
        focusTransitionFromAnchor = null;
      }
      return targetAnchor;
    }

    const elapsedMs = nowMs - focusTransitionStartMs;
    const progress = smoothstep(elapsedMs / FOCUS_TRANSITION_DURATION_MS);

    if (progress >= 1) {
      currentFocusBody = targetFocusBody;
      focusTransitionFromAnchor = null;
      return targetAnchor;
    }

    return lerpPosition(focusTransitionFromAnchor, targetAnchor, progress);
  }

  function startFocusTransition(nextFocusBody: FocusBodyId, nextOrbitRadius: number): void {
    const nowMs = performance.now();
    const fromAnchor = getCurrentOrbitCenter(nowMs);
    if (!fromAnchor) {
      return;
    }

    const activeFocusBody = getActiveFocusBody(nowMs);
    targetFocusBody = nextFocusBody;
    focusTransitionFromAnchor = fromAnchor;
    focusTransitionStartMs = nowMs;
    orbitRadius = clamp(
      nextOrbitRadius,
      getMinOrbitRadiusForFocus(nextFocusBody),
      MAX_CAMERA_DISTANCE_M,
    );

    if (activeFocusBody === nextFocusBody) {
      currentFocusBody = nextFocusBody;
      focusTransitionFromAnchor = null;
    }

    updateVisibleState(nowMs);
  }

  function updateVisibleState(nowMs = performance.now()): void {
    const anchorPosM = getCurrentOrbitCenter(nowMs);
    if (!anchorPosM) return;
    const tdbSeconds = sampleTimestamps[currentSampleIndex];

    // Camera position in floating-origin world coords, centered on the active focus anchor.
    const camLocal = sphericalToCartesian(orbitRadius, orbitPolar, orbitAzimuth);

    // Dynamic frustum
    camera.near = Math.max(1, orbitRadius * 1e-4);
    camera.far = Math.max(orbitRadius * 10, 5e8);
    camera.updateProjectionMatrix();

    // Place camera in Three.js scene relative to the active focus anchor.
    camera.position.set(camLocal.x, camLocal.y, camLocal.z);

    const haloUpdates: Array<{ bodyId: BodyId; positionRelCam: THREE.Vector3; radiusM: number }> = [];

    for (const bodyId of BODY_IDS) {
      const mesh = meshes.get(bodyId)!;
      const helio = getHeliocentricState(bodyId);
      if (!helio) {
        mesh.position.set(0, 0, 0);
        continue;
      }

      // Floating origin: all positions relative to the blended focus anchor.
      const relX = helio.positionM.x - anchorPosM.x;
      const relY = helio.positionM.y - anchorPosM.y;
      const relZ = helio.positionM.z - anchorPosM.z;
      mesh.position.set(relX, relY, relZ);

      // Position relative to camera for halos
      const posRelCam = new THREE.Vector3(
        relX - camLocal.x,
        relY - camLocal.y,
        relZ - camLocal.z,
      );
      haloUpdates.push({
        bodyId,
        positionRelCam: posRelCam,
        radiusM: BODY_CONSTANTS[bodyId].radiusM,
      });
    }

    // Update Sun directional light to come from the Sun's direction relative to the
    // active focus anchor. When the Sun is the anchor, fall back to a stable oblique
    // direction so directional lighting remains well-defined.
    const sunHelio = getHeliocentricState('sun');
    if (sunHelio) {
      let sunRelX = sunHelio.positionM.x - anchorPosM.x;
      let sunRelY = sunHelio.positionM.y - anchorPosM.y;
      let sunRelZ = sunHelio.positionM.z - anchorPosM.z;
      if (Math.hypot(sunRelX, sunRelY, sunRelZ) < 1) {
        sunRelX = BODY_CONSTANTS.sun.radiusM;
        sunRelY = BODY_CONSTANTS.sun.radiusM * 0.3;
        sunRelZ = BODY_CONSTANTS.sun.radiusM * 0.2;
      }
      const sunMesh = meshes.get('sun')!;
      sunLight.position.set(sunRelX, sunRelY, sunRelZ);
      sunLightTarget.position.set(0, 0, 0);
      sunMesh.position.set(sunRelX, sunRelY, sunRelZ);
    }

    // The active focus anchor is always the floating-origin scene origin.
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Update halo system
    haloSystem.update(
      haloUpdates,
      camera,
      { width: window.innerWidth, height: window.innerHeight },
    );

    const epochDay = Math.round((tdbSeconds - SLICE2_EPOCH_TDB) / 86400);
    document.title = `Aster V2 — Inner Solar System — day ${epochDay + 1}/${totalSamples}`;
  }

  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function scrubSamples(delta: number): void {
    currentSampleIndex = clamp(currentSampleIndex + delta, 0, totalSamples - 1);
    updateVisibleState();
  }

  function onPointerDown(event: PointerEvent): void {
    pointerActive = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!pointerActive) return;
    const dx = event.clientX - lastPointerX;
    const dy = event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    orbitAzimuth -= dx * ORBIT_SENSITIVITY;
    orbitPolar = clamp(orbitPolar + dy * ORBIT_SENSITIVITY, 0.001, Math.PI - 0.001);
    updateVisibleState();
  }

  function onPointerUp(event: PointerEvent): void {
    pointerActive = false;
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  }

  function onWheel(event: WheelEvent): void {
    event.preventDefault();
    const activeFocusBody = getActiveFocusBody(performance.now());
    const minOrbitRadius = activeFocusBody === null
      ? MIN_CAMERA_DISTANCE_M
      : BODY_CONSTANTS[activeFocusBody].radiusM + 400_000;
    orbitRadius = clamp(
      orbitRadius * Math.exp(event.deltaY * WHEEL_ZOOM_SENSITIVITY),
      minOrbitRadius,
      MAX_CAMERA_DISTANCE_M,
    );
    updateVisibleState();
  }

  /*
   * Keyboard mapping:
   * 1 → Sun
   * 2 → Mercury
   * 3 → Venus
   * 4 → Earth
   * 5 → Moon
   * 6 → Mars
   * 0 → Heliocentric overview
   * Arrow/Home/End retain time scrubbing behavior.
   */
  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      scrubSamples(event.shiftKey ? TIME_SCRUB_FAST_STEP : TIME_SCRUB_STEP);
      return;
    }
    if (event.key === 'ArrowLeft') {
      scrubSamples(event.shiftKey ? -TIME_SCRUB_FAST_STEP : -TIME_SCRUB_STEP);
      return;
    }
    if (event.key === 'Home') {
      currentSampleIndex = 0;
      updateVisibleState();
      return;
    }
    if (event.key === 'End') {
      currentSampleIndex = totalSamples - 1;
      updateVisibleState();
      return;
    }

    const nextFocusBody = FOCUS_KEY_TO_BODY[event.key];
    if (nextFocusBody) {
      const nowMs = performance.now();
      const activeFocusBody = getActiveFocusBody(nowMs);
      const nextOrbitRadius = activeFocusBody === null
        ? getDefaultFocusRadius(nextFocusBody)
        : clamp(
          orbitRadius,
          getMinOrbitRadiusForFocus(nextFocusBody),
          MAX_CAMERA_DISTANCE_M,
        );
      startFocusTransition(nextFocusBody, nextOrbitRadius);
      return;
    }

    if (event.key === '0') {
      startFocusTransition(null, OVERVIEW_ORBIT_RADIUS_M);
    }
  }

  function renderFrame(): void {
    if (disposed) return;
    updateVisibleState();
    renderer.render(scene, camera);
    animationHandle = window.requestAnimationFrame(renderFrame);
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', onPointerUp);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);

  updateVisibleState();
  renderFrame();

  return () => {
    disposed = true;
    resetFrameTransformHooks();
    window.cancelAnimationFrame(animationHandle);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    renderer.domElement.removeEventListener('pointerleave', onPointerUp);
    renderer.domElement.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    haloSystem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    for (const mesh of meshes.values()) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  };
}
