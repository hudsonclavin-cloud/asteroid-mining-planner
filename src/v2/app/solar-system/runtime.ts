import * as THREE from 'three';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  FRAME_JUPITER_J2000_ICRF,
  assertCanonicalState,
  assertFrameRoundTrip,
  configureFrameTransformHooks,
  interpolateBodyStateSeries,
  resetFrameTransformHooks,
  transformCanonicalState,
  type CanonicalState,
} from '../../core/index.js';
import { BODY_CONSTANTS } from '../../core/constants/bodies.js';
import type { BodyId } from '../../core/constants/bodies.js';
import { createJupiterOblateMesh } from '../../render/jupiter-oblate.js';
import { HaloSystem } from '../../render/halos.js';
import { loadSolarSystemStatesBrowser, SLICE3_EPOCH_TDB } from './loader.js';

const AU_M = 149_597_870_700;
const OVERVIEW_ORBIT_RADIUS_M = 7.5 * AU_M;
const JUPITER_SYSTEM_OVERVIEW_RADIUS_M = 5_000_000_000;
const MIN_CAMERA_DISTANCE_M = 1e9;
const MAX_CAMERA_DISTANCE_M = 15 * AU_M;
const ORBIT_SENSITIVITY = 0.005;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const TIME_SCRUB_STEP_SECONDS = 3600;
const FOCUS_TRANSITION_DURATION_MS = 650;

const BODY_IDS: BodyId[] = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'io',
  'europa',
  'ganymede',
  'callisto',
];

/*
 * Slice 3 focus keymap:
 * 1 Sun, 2 Mercury, 3 Venus, 4 Earth, 5 Moon, 6 Mars,
 * 7 Jupiter, 8 Io, 9 Europa, 0 Ganymede, - Callisto,
 * = heliocentric overview.
 */
const FOCUS_KEY_TO_BODY: Record<string, BodyId> = {
  '1': 'sun',
  '2': 'mercury',
  '3': 'venus',
  '4': 'earth',
  '5': 'moon',
  '6': 'mars',
  '7': 'jupiter',
  '8': 'io',
  '9': 'europa',
  '0': 'ganymede',
  '-': 'callisto',
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

function sphericalToCartesian(
  radius: number,
  polar: number,
  azimuth: number,
): { x: number; y: number; z: number } {
  const sinPolar = Math.sin(polar);
  return {
    x: radius * sinPolar * Math.cos(azimuth),
    y: radius * Math.cos(polar),
    z: radius * sinPolar * Math.sin(azimuth),
  };
}

function createBodyMesh(bodyId: BodyId): THREE.Mesh {
  if (bodyId === 'jupiter') {
    return createJupiterOblateMesh({
      material: new THREE.MeshLambertMaterial({ color: BODY_CONSTANTS.jupiter.vizColor }),
    });
  }

  const constants = BODY_CONSTANTS[bodyId];
  const geometry = new THREE.SphereGeometry(constants.radiusM, 32, 32);
  const material =
    bodyId === 'sun'
      ? new THREE.MeshBasicMaterial({ color: constants.vizColor })
      : new THREE.MeshLambertMaterial({ color: constants.vizColor });

  return new THREE.Mesh(geometry, material);
}

function getDefaultFocusRadius(bodyId: BodyId): number {
  if (bodyId === 'jupiter') {
    return JUPITER_SYSTEM_OVERVIEW_RADIUS_M;
  }
  return Math.max(5 * BODY_CONSTANTS[bodyId].radiusM, BODY_CONSTANTS[bodyId].radiusM + 400_000);
}

function getMinOrbitRadiusForFocus(bodyId: FocusBodyId): number {
  if (bodyId === null) {
    return MIN_CAMERA_DISTANCE_M;
  }
  return BODY_CONSTANTS[bodyId].radiusM + 400_000;
}

export async function mountSolarSystem(mount: HTMLElement): Promise<() => void> {
  const allStates = await loadSolarSystemStatesBrowser();
  const stateSeries = new Map<BodyId, CanonicalState[]>();

  for (const bodyId of BODY_IDS) {
    const samples = allStates[bodyId];
    if (!samples || samples.length === 0) {
      throw new Error(`Missing state series for body '${bodyId}'`);
    }
    stateSeries.set(bodyId, samples.map((sample) => sample.state));
  }

  const earthSeries = stateSeries.get('earth')!;
  const jupiterSeries = stateSeries.get('jupiter')!;
  const timeMin = Math.max(earthSeries[0].tdbSeconds, jupiterSeries[0].tdbSeconds);
  const timeMax = Math.min(
    earthSeries[earthSeries.length - 1].tdbSeconds,
    jupiterSeries[jupiterSeries.length - 1].tdbSeconds,
  );

  configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds: number): CanonicalState {
      return interpolateBodyStateSeries('earth', earthSeries, tdbSeconds);
    },
    jupiterHeliocentricStateProvider(tdbSeconds: number): CanonicalState {
      return interpolateBodyStateSeries('jupiter', jupiterSeries, tdbSeconds);
    },
  });

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

  const meshes = new Map<BodyId, THREE.Mesh>();
  for (const bodyId of BODY_IDS) {
    const mesh = createBodyMesh(bodyId);
    scene.add(mesh);
    meshes.set(bodyId, mesh);
  }

  const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
  const sunLightTarget = new THREE.Object3D();
  scene.add(ambientLight, sunLight, sunLightTarget);
  sunLight.target = sunLightTarget;

  const haloSystem = new HaloSystem(scene);

  let orbitRadius = JUPITER_SYSTEM_OVERVIEW_RADIUS_M;
  let orbitAzimuth = 0;
  let orbitPolar = Math.PI / 2;
  let currentFocusBody: FocusBodyId = 'jupiter';
  let targetFocusBody: FocusBodyId = 'jupiter';
  let focusTransitionStartMs = 0;
  let focusTransitionFromAnchor: Position3 | null = null;
  let currentTdbSeconds = timeMin;
  let disposed = false;
  let pointerActive = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let animationHandle = 0;

  function getNativeState(bodyId: BodyId, tdbSeconds: number): CanonicalState {
    const state = interpolateBodyStateSeries(bodyId, stateSeries.get(bodyId)!, tdbSeconds);
    assertCanonicalState(state);
    return state;
  }

  function getHeliocentricState(bodyId: BodyId, tdbSeconds: number): CanonicalState {
    const nativeState = getNativeState(bodyId, tdbSeconds);

    if (bodyId === 'moon') {
      assertFrameRoundTrip(nativeState, FRAME_GCRS_EARTH, FRAME_HELIO_J2000_ICRF, tdbSeconds);
      return transformCanonicalState(
        nativeState,
        FRAME_GCRS_EARTH,
        FRAME_HELIO_J2000_ICRF,
        tdbSeconds,
      );
    }

    if (nativeState.frame === FRAME_JUPITER_J2000_ICRF) {
      assertFrameRoundTrip(nativeState, FRAME_JUPITER_J2000_ICRF, FRAME_HELIO_J2000_ICRF, tdbSeconds);
      return transformCanonicalState(
        nativeState,
        FRAME_JUPITER_J2000_ICRF,
        FRAME_HELIO_J2000_ICRF,
        tdbSeconds,
      );
    }

    return nativeState;
  }

  function getAnchorPosition(bodyId: FocusBodyId, tdbSeconds: number): Position3 | null {
    if (bodyId === null) {
      return getHeliocentricState('sun', tdbSeconds).positionM;
    }
    return getHeliocentricState(bodyId, tdbSeconds).positionM;
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
    const targetAnchor = getAnchorPosition(targetFocusBody, currentTdbSeconds);
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

    const camLocal = sphericalToCartesian(orbitRadius, orbitPolar, orbitAzimuth);

    camera.near = Math.max(1, orbitRadius * 1e-4);
    camera.far = Math.max(orbitRadius * 10, 5e8);
    camera.updateProjectionMatrix();
    camera.position.set(camLocal.x, camLocal.y, camLocal.z);

    const haloUpdates: Array<{ bodyId: BodyId; positionRelCam: THREE.Vector3; radiusM: number }> = [];

    for (const bodyId of BODY_IDS) {
      const mesh = meshes.get(bodyId)!;
      const helio = getHeliocentricState(bodyId, currentTdbSeconds);
      const relX = helio.positionM.x - anchorPosM.x;
      const relY = helio.positionM.y - anchorPosM.y;
      const relZ = helio.positionM.z - anchorPosM.z;
      mesh.position.set(relX, relY, relZ);

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

    const sunHelio = getHeliocentricState('sun', currentTdbSeconds);
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

    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    haloSystem.update(
      haloUpdates,
      camera,
      { width: window.innerWidth, height: window.innerHeight },
    );

    const epochHour = Math.round((currentTdbSeconds - SLICE3_EPOCH_TDB) / TIME_SCRUB_STEP_SECONDS);
    document.title = `Aster V2 — Solar System — hour ${epochHour}`;
  }

  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function scrubTime(deltaSeconds: number): void {
    currentTdbSeconds = clamp(currentTdbSeconds + deltaSeconds, timeMin, timeMax);
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

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      scrubTime(TIME_SCRUB_STEP_SECONDS);
      return;
    }
    if (event.key === 'ArrowLeft') {
      scrubTime(-TIME_SCRUB_STEP_SECONDS);
      return;
    }
    if (event.key === 'Home') {
      currentTdbSeconds = timeMin;
      updateVisibleState();
      return;
    }
    if (event.key === 'End') {
      currentTdbSeconds = timeMax;
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

    if (event.key === '=') {
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
