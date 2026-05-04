import * as THREE from 'three';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  FRAME_JUPITER_J2000_ICRF,
  FRAME_SATURN_J2000_ICRF,
  assertCanonicalState,
  configureFrameTransformHooks,
  interpolateBodyStateSeries,
  resetFrameTransformHooks,
  transformCanonicalState,
  type CanonicalState,
} from '../../core/index.js';
import { BODY_CONSTANTS } from '../../core/constants/bodies.js';
import type { BodyId } from '../../core/constants/bodies.js';
import { createJupiterOblateMesh } from '../../render/jupiter-oblate.js';
import { createSaturnOblateMesh } from '../../render/saturn-oblate.js';
import { createSaturnRingsGroup } from '../../render/saturn-rings.js';
import { HaloSystem } from '../../render/halos.js';
import { loadSolarSystemStatesBrowser, SLICE3_EPOCH_TDB } from './loader.js';

const AU_M = 149_597_870_700;
const OVERVIEW_ORBIT_RADIUS_M = 7 * AU_M;
const JUPITER_SYSTEM_OVERVIEW_RADIUS_M = 5_000_000_000;
const SATURN_SYSTEM_OVERVIEW_RADIUS_M = 6_000_000_000;
const MIN_CAMERA_DISTANCE_M = 1e9;
const MAX_CAMERA_DISTANCE_M = 15 * AU_M;
const ORBIT_SENSITIVITY = 0.005;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const TIME_SCRUB_STEP_SECONDS = 3600;
const FOCUS_TRANSITION_DURATION_MS = 650;
const SATURN_RENDER_TILT_RAD = THREE.MathUtils.degToRad(26.7);
const SATURN_FOCUS_ORBIT_POLAR_RAD = Math.PI / 3;
const OUTER_SYSTEM_OVERVIEW = 'outer-system-overview' as const;

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
  'saturn',
  'titan',
  'rhea',
  'iapetus',
  'tethys',
  'dione',
  'mimas',
  'enceladus',
];

/*
 * Slice 4 focus keymap:
 * 1 Sun, 2 Mercury, 3 Venus, 4 Earth, 5 Moon, 6 Mars,
 * 7 Jupiter, 8 Io, 9 Europa, 0 Ganymede, - Callisto,
 * S Saturn, T Titan, R Rhea, I Iapetus, Y Tethys, D Dione,
 * M Mimas, E Enceladus, = outer-system overview.
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
  s: 'saturn',
  t: 'titan',
  r: 'rhea',
  i: 'iapetus',
  y: 'tethys',
  d: 'dione',
  m: 'mimas',
  e: 'enceladus',
};

type FocusTarget = BodyId | typeof OUTER_SYSTEM_OVERVIEW;
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
  if (bodyId === 'saturn') {
    return createSaturnOblateMesh({
      material: new THREE.MeshLambertMaterial({ color: BODY_CONSTANTS.saturn.vizColor }),
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
  if (bodyId === 'saturn') {
    return SATURN_SYSTEM_OVERVIEW_RADIUS_M;
  }
  return Math.max(5 * BODY_CONSTANTS[bodyId].radiusM, BODY_CONSTANTS[bodyId].radiusM + 400_000);
}

function getMinOrbitRadiusForFocus(bodyId: FocusTarget): number {
  if (bodyId === OUTER_SYSTEM_OVERVIEW) {
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
  const saturnSeries = stateSeries.get('saturn')!;

  let timeMin = Number.NEGATIVE_INFINITY;
  let timeMax = Number.POSITIVE_INFINITY;
  for (const series of stateSeries.values()) {
    timeMin = Math.max(timeMin, series[0].tdbSeconds);
    timeMax = Math.min(timeMax, series[series.length - 1].tdbSeconds);
  }

  configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds: number): CanonicalState {
      return interpolateBodyStateSeries('earth', earthSeries, tdbSeconds);
    },
    jupiterHeliocentricStateProvider(tdbSeconds: number): CanonicalState {
      return interpolateBodyStateSeries('jupiter', jupiterSeries, tdbSeconds);
    },
    saturnHeliocentricStateProvider(tdbSeconds: number): CanonicalState {
      return interpolateBodyStateSeries('saturn', saturnSeries, tdbSeconds);
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

  const renderRoots = new Map<BodyId, THREE.Object3D>();
  const meshes = new Map<BodyId, THREE.Mesh>();
  const saturnTiltGroup = new THREE.Group();
  saturnTiltGroup.name = 'saturn-tilt-group';
  saturnTiltGroup.rotation.x = SATURN_RENDER_TILT_RAD;
  const saturnSystemGroup = new THREE.Group();
  saturnSystemGroup.name = 'saturn-system-group';
  saturnSystemGroup.add(saturnTiltGroup);
  const saturnRingsGroup = createSaturnRingsGroup();
  for (const bodyId of BODY_IDS) {
    const mesh = createBodyMesh(bodyId);
    meshes.set(bodyId, mesh);
    if (bodyId === 'saturn') {
      saturnTiltGroup.add(mesh, saturnRingsGroup);
      saturnSystemGroup.userData = {
        renderOnlyTiltDeg: 26.7,
        focusAnchorBodyId: 'saturn',
      };
      scene.add(saturnSystemGroup);
      renderRoots.set(bodyId, saturnSystemGroup);
      continue;
    }
    scene.add(mesh);
    renderRoots.set(bodyId, mesh);
  }

  const ambientLight = new THREE.AmbientLight(0x404060, 1.5);
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
  const sunLightTarget = new THREE.Object3D();
  scene.add(ambientLight, sunLight, sunLightTarget);
  sunLight.target = sunLightTarget;

  const haloSystem = new HaloSystem(scene);

  let orbitRadius = OVERVIEW_ORBIT_RADIUS_M;
  let orbitAzimuth = 0;
  let orbitPolar = Math.PI / 2;
  let currentFocusBody: FocusTarget = OUTER_SYSTEM_OVERVIEW;
  let targetFocusBody: FocusTarget = OUTER_SYSTEM_OVERVIEW;
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
      // INV-004 is asserted in unit tests on heliocentric-frame inputs where the bound is
      // meaningful; asserting it on native-frame inputs would fail by floating-point
      // cancellation inherent to translate-by-large-vector arithmetic, not by a transform bug.
      return transformCanonicalState(
        nativeState,
        FRAME_GCRS_EARTH,
        FRAME_HELIO_J2000_ICRF,
        tdbSeconds,
      );
    }

    if (nativeState.frame === FRAME_JUPITER_J2000_ICRF) {
      // INV-004 is asserted in unit tests on heliocentric-frame inputs where the bound is
      // meaningful; asserting it on native-frame inputs would fail by floating-point
      // cancellation inherent to translate-by-large-vector arithmetic, not by a transform bug.
      return transformCanonicalState(
        nativeState,
        FRAME_JUPITER_J2000_ICRF,
        FRAME_HELIO_J2000_ICRF,
        tdbSeconds,
      );
    }

    if (nativeState.frame === FRAME_SATURN_J2000_ICRF) {
      // INV-004 is asserted in unit tests on heliocentric-frame inputs where the bound is
      // meaningful; asserting it on native-frame inputs would fail by floating-point
      // cancellation inherent to translate-by-large-vector arithmetic, not by a transform bug.
      return transformCanonicalState(
        nativeState,
        FRAME_SATURN_J2000_ICRF,
        FRAME_HELIO_J2000_ICRF,
        tdbSeconds,
      );
    }

    return nativeState;
  }

  function getOuterSystemOverviewAnchor(tdbSeconds: number): Position3 {
    const jupiter = getHeliocentricState('jupiter', tdbSeconds).positionM;
    const saturn = getHeliocentricState('saturn', tdbSeconds).positionM;
    // Slice 4 startup is an outer-system overview. Anchor the camera on the midpoint
    // between Jupiter and Saturn so both planet systems stay in frame on first paint.
    return {
      x: (jupiter.x + saturn.x) / 2,
      y: (jupiter.y + saturn.y) / 2,
      z: (jupiter.z + saturn.z) / 2,
    };
  }

  function getAnchorPosition(bodyId: FocusTarget, tdbSeconds: number): Position3 {
    if (bodyId === OUTER_SYSTEM_OVERVIEW) {
      return getOuterSystemOverviewAnchor(tdbSeconds);
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

  function getActiveFocusBody(nowMs: number): FocusTarget {
    return hasActiveFocusTransition(nowMs) ? targetFocusBody : currentFocusBody;
  }

  function getCurrentOrbitCenter(nowMs: number): Position3 {
    const targetAnchor = getAnchorPosition(targetFocusBody, currentTdbSeconds);
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

  function startFocusTransition(nextFocusBody: FocusTarget, nextOrbitRadius: number): void {
    const nowMs = performance.now();
    const fromAnchor = getCurrentOrbitCenter(nowMs);
    const activeFocusBody = getActiveFocusBody(nowMs);
    targetFocusBody = nextFocusBody;
    focusTransitionFromAnchor = fromAnchor;
    focusTransitionStartMs = nowMs;
    orbitRadius = clamp(
      nextOrbitRadius,
      getMinOrbitRadiusForFocus(nextFocusBody),
      MAX_CAMERA_DISTANCE_M,
    );
    if (nextFocusBody === 'saturn') {
      // Saturn's rings are render-only tilted about +X; the global default orbit
      // orientation (polar = π/2, azimuth = 0) lands exactly edge-on to that plane.
      // Reset Saturn focus to a three-quarter view so rings are visible on focus.
      orbitPolar = SATURN_FOCUS_ORBIT_POLAR_RAD;
    }

    if (activeFocusBody === nextFocusBody) {
      currentFocusBody = nextFocusBody;
      focusTransitionFromAnchor = null;
    }

    updateVisibleState(nowMs);
  }

  function updateVisibleState(nowMs = performance.now()): void {
    const anchorPosM = getCurrentOrbitCenter(nowMs);
    const camLocal = sphericalToCartesian(orbitRadius, orbitPolar, orbitAzimuth);

    camera.near = Math.max(1, orbitRadius * 1e-4);
    camera.far = Math.max(orbitRadius * 10, 5e8);
    camera.updateProjectionMatrix();
    camera.position.set(camLocal.x, camLocal.y, camLocal.z);

    const haloUpdates: Array<{ bodyId: BodyId; positionRelCam: THREE.Vector3; radiusM: number }> = [];

    for (const bodyId of BODY_IDS) {
      const root = renderRoots.get(bodyId)!;
      const helio = getHeliocentricState(bodyId, currentTdbSeconds);
      const relX = helio.positionM.x - anchorPosM.x;
      const relY = helio.positionM.y - anchorPosM.y;
      const relZ = helio.positionM.z - anchorPosM.z;
      root.position.set(relX, relY, relZ);

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
    const minOrbitRadius = getMinOrbitRadiusForFocus(activeFocusBody);
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
      const nextOrbitRadius = activeFocusBody === OUTER_SYSTEM_OVERVIEW
        ? getDefaultFocusRadius(nextFocusBody)
        : clamp(orbitRadius, getMinOrbitRadiusForFocus(nextFocusBody), MAX_CAMERA_DISTANCE_M);
      startFocusTransition(nextFocusBody, nextOrbitRadius);
      return;
    }

    if (event.key === '=') {
      startFocusTransition(OUTER_SYSTEM_OVERVIEW, OVERVIEW_ORBIT_RADIUS_M);
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
    for (const child of saturnRingsGroup.children) {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const material = child.material;
        if (Array.isArray(material)) {
          for (const entry of material) {
            if ('map' in entry && entry.map) {
              entry.map.dispose();
            }
            entry.dispose();
          }
        } else {
          if ('map' in material && material.map) {
            material.map.dispose();
          }
          material.dispose();
        }
      }
    }
  };
}
