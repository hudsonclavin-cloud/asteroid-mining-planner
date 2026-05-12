import * as THREE from 'three';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  FRAME_JUPITER_J2000_ICRF,
  FRAME_MARS_J2000_ICRF,
  FRAME_SATURN_J2000_ICRF,
  assertCanonicalState,
  createAsteroidCatalogIndex,
  configureFrameTransformHooks,
  interpolateBodyStateSeries,
  isAsteroidBodyId,
  resetFrameTransformHooks,
  transformCanonicalState,
  type AsteroidBody,
  type AsteroidBodyId,
  type CanonicalState,
} from '../../core/index.js';
import { BODY_CONSTANTS } from '../../core/constants/bodies.js';
import type { BodyId } from '../../core/constants/bodies.js';
import {
  AsteroidRenderer,
  propagateAsteroidBodyState,
  resolveAliasedPointSizeRange,
  setAsteroidPointsMaxSize,
} from '../../render/index.js';
import { createJupiterOblateMesh } from '../../render/jupiter-oblate.js';
import { createMarsOblateMesh } from '../../render/mars-oblate.js';
import { createSaturnOblateMesh } from '../../render/saturn-oblate.js';
import { createSaturnRingsGroup } from '../../render/saturn-rings.js';
import { HaloSystem } from '../../render/halos.js';
import {
  loadSlice7AsteroidCatalogFixture,
  loadSolarSystemStatesBrowser,
  SLICE3_EPOCH_TDB,
} from './loader.js';

const AU_M = 149_597_870_700;
const OVERVIEW_ORBIT_RADIUS_M = 7 * AU_M;
const JUPITER_SYSTEM_OVERVIEW_RADIUS_M = 5_000_000_000;
const MARS_SYSTEM_OVERVIEW_RADIUS_M = 60_000_000;
const SATURN_SYSTEM_OVERVIEW_RADIUS_M = 6_000_000_000;
const MIN_CAMERA_DISTANCE_M = 1e9;
const MAX_CAMERA_DISTANCE_M = 15 * AU_M;
const ORBIT_SENSITIVITY = 0.005;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const TIME_SCRUB_STEP_SECONDS = 1800;
const FOCUS_TRANSITION_DURATION_MS = 650;
const POINTER_CLICK_THRESHOLD_PX = 4;
const ASTEROID_POINT_RAYCAST_PIXEL_THRESHOLD = 8;
export const MARS_RENDER_TILT_RAD = THREE.MathUtils.degToRad(25.19);
const MARS_FOCUS_ORBIT_POLAR_RAD = Math.PI / 3;
const SATURN_RENDER_TILT_RAD = THREE.MathUtils.degToRad(26.7);
const SATURN_FOCUS_ORBIT_POLAR_RAD = Math.PI / 3;
export const ASTEROID_FOCUS_ORBIT_POLAR_RAD = Math.PI / 3;
const OUTER_SYSTEM_OVERVIEW = 'outer-system-overview' as const;

const BODY_IDS: BodyId[] = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'phobos',
  'deimos',
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
 * Slice 6 focus keymap:
 * 1 Sun, 2 Mercury, 3 Venus, 4 Earth, 5 Moon, 6 Mars (legacy), M Mars,
 * P Phobos, X Deimos,
 * 7 Jupiter, 8 Io, 9 Europa, 0 Ganymede, - Callisto,
 * S Saturn, T Titan, R Rhea, I Iapetus, Y Tethys, D Dione,
 * N Mimas, E Enceladus, = outer-system overview.
 *
 * Mars claims 'm' so the default Slice 6 manual verification path can press
 * 'm' from overview without remembering the older numeric alias. Mimas moves to
 * 'n'; Saturn focus itself remains on 's' for the Slice 4-5 regression path.
 */
const FOCUS_KEY_TO_BODY: Record<string, BodyId> = {
  '1': 'sun',
  '2': 'mercury',
  '3': 'venus',
  '4': 'earth',
  '5': 'moon',
  '6': 'mars',
  m: 'mars',
  p: 'phobos',
  x: 'deimos',
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
  n: 'mimas',
  e: 'enceladus',
};

type FocusTarget = BodyId | AsteroidBodyId | typeof OUTER_SYSTEM_OVERVIEW;
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
  if (bodyId === 'mars') {
    return createMarsOblateMesh({
      material: new THREE.MeshLambertMaterial({ color: BODY_CONSTANTS.mars.vizColor }),
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

function isAsteroidFocusTarget(bodyId: FocusTarget): bodyId is AsteroidBodyId {
  return typeof bodyId === 'string' && isAsteroidBodyId(bodyId);
}

export function createMarsSystemRenderGroups(): {
  marsSystemGroup: THREE.Group;
  marsTiltGroup: THREE.Group;
  marsCenteredGroup: THREE.Group;
} {
  const marsTiltGroup = new THREE.Group();
  marsTiltGroup.name = 'mars-tilt-group';
  marsTiltGroup.rotation.x = MARS_RENDER_TILT_RAD;

  const marsCenteredGroup = new THREE.Group();
  marsCenteredGroup.name = 'mars-centered-group';

  const marsSystemGroup = new THREE.Group();
  marsSystemGroup.name = 'mars-system-group';
  marsSystemGroup.add(marsTiltGroup);
  // marsCenteredGroup is a SIBLING of marsTiltGroup, NOT a child.
  // Render-only tilt applies to body geometry only, never to the child group
  // containing other bodies in the same frame. Child bodies in mars-centered
  // ICRF are already in canonical orientation; applying render tilt rotates
  // them out of position and breaks focus-target agreement (Phase F, May 2026).
  // This matches the Saturn precedent, where saturnTiltGroup contains Saturn
  // body + rings only while Saturn moons remain siblings in the parent system.
  marsSystemGroup.add(marsCenteredGroup);

  return { marsSystemGroup, marsTiltGroup, marsCenteredGroup };
}

export function getDefaultAsteroidFocusRadius(radiusM: number): number {
  return Math.max(5 * radiusM, radiusM + 1_000);
}

function getDefaultFocusRadius(
  bodyId: BodyId | AsteroidBodyId,
  asteroidBody?: Pick<AsteroidBody, 'estimatedRadiusM'>,
): number {
  if (isAsteroidBodyId(bodyId)) {
    if (!asteroidBody) {
      throw new Error(`Missing asteroid metadata for focus target '${bodyId}'`);
    }
    return getDefaultAsteroidFocusRadius(asteroidBody.estimatedRadiusM);
  }
  if (bodyId === 'mars') {
    return MARS_SYSTEM_OVERVIEW_RADIUS_M;
  }
  if (bodyId === 'jupiter') {
    return JUPITER_SYSTEM_OVERVIEW_RADIUS_M;
  }
  if (bodyId === 'saturn') {
    return SATURN_SYSTEM_OVERVIEW_RADIUS_M;
  }
  return Math.max(5 * BODY_CONSTANTS[bodyId].radiusM, BODY_CONSTANTS[bodyId].radiusM + 400_000);
}

export function resolveFocusOrbitRadius(
  activeFocusBody: FocusTarget,
  nextFocusBody: BodyId | AsteroidBodyId,
  currentOrbitRadius: number,
  asteroidBody?: Pick<AsteroidBody, 'estimatedRadiusM'>,
): number {
  if (activeFocusBody === OUTER_SYSTEM_OVERVIEW) {
    return getDefaultFocusRadius(nextFocusBody, asteroidBody);
  }

  if (activeFocusBody === nextFocusBody) {
    return currentOrbitRadius;
  }

  // Slice 6 Phase E: cross-body focus transitions can span adversarial scale gaps
  // (Mars at 60 Mm vs. Phobos at 413 km is ~145x). Reusing the previous body's
  // orbit radius can strand the new target in the halo/body handoff zone, so a
  // real body change always snaps to the target's default focus distance.
  return getDefaultFocusRadius(nextFocusBody, asteroidBody);
}

function getMinOrbitRadiusForFocus(
  bodyId: FocusTarget,
  asteroidBody?: Pick<AsteroidBody, 'estimatedRadiusM'>,
): number {
  if (bodyId === OUTER_SYSTEM_OVERVIEW) {
    return MIN_CAMERA_DISTANCE_M;
  }
  if (isAsteroidFocusTarget(bodyId)) {
    if (!asteroidBody) {
      throw new Error(`Missing asteroid metadata for focus target '${bodyId}'`);
    }
    return asteroidBody.estimatedRadiusM + 1_000;
  }
  return BODY_CONSTANTS[bodyId].radiusM + 400_000;
}

export async function mountSolarSystem(mount: HTMLElement): Promise<() => void> {
  const [allStates, asteroidCatalog] = await Promise.all([
    loadSolarSystemStatesBrowser(),
    loadSlice7AsteroidCatalogFixture(),
  ]);
  const stateSeries = new Map<BodyId, CanonicalState[]>();
  const asteroidBodies = Object.values(asteroidCatalog.asteroids);
  const asteroidIndex = createAsteroidCatalogIndex(asteroidBodies);

  for (const bodyId of BODY_IDS) {
    const samples = allStates[bodyId];
    if (!samples || samples.length === 0) {
      throw new Error(`Missing state series for body '${bodyId}'`);
    }
    stateSeries.set(bodyId, samples.map((sample) => sample.state));
  }
  const earthSeries = stateSeries.get('earth')!;
  const marsSeries = stateSeries.get('mars')!;
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
    marsHeliocentricStateProvider(tdbSeconds: number): CanonicalState {
      return interpolateBodyStateSeries('mars', marsSeries, tdbSeconds);
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
  renderer.domElement.style.cursor = 'grab';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    MAX_CAMERA_DISTANCE_M * 10,
  );

  const renderRoots = new Map<BodyId, THREE.Object3D>();
  const meshes = new Map<BodyId, THREE.Mesh>();
  const { marsSystemGroup, marsTiltGroup, marsCenteredGroup } = createMarsSystemRenderGroups();
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
    if (bodyId === 'mars') {
      marsTiltGroup.add(mesh);
      marsSystemGroup.userData = {
        renderOnlyTiltDeg: 25.19,
        focusAnchorBodyId: 'mars',
      };
      scene.add(marsSystemGroup);
      renderRoots.set(bodyId, marsSystemGroup);
      continue;
    }
    if (bodyId === 'phobos' || bodyId === 'deimos') {
      marsCenteredGroup.add(mesh);
      renderRoots.set(bodyId, mesh);
      continue;
    }
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
  const asteroidRenderer = new AsteroidRenderer(asteroidBodies);
  // Slice 7 Phase H: asteroidRenderer.root now owns the full browse stack for
  // the catalog: orbit-line batch, points layer, instanced bodies, and focused
  // body/orbit highlight. Runtime still mounts a single sibling system under
  // the shared heliocentric scene graph.
  scene.add(asteroidRenderer.root);
  if (asteroidRenderer.pointsMaterial instanceof THREE.ShaderMaterial) {
    const [, maxPointSize] = resolveAliasedPointSizeRange(renderer.getContext());
    setAsteroidPointsMaxSize(asteroidRenderer.pointsMaterial, maxPointSize);
  }

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
  let pointerDragged = false;
  let pointerDownX = 0;
  let pointerDownY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let animationHandle = 0;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

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

    if (nativeState.frame === FRAME_MARS_J2000_ICRF) {
      // INV-004 is asserted in unit tests on heliocentric-frame inputs where the bound is
      // meaningful; asserting it on native-frame inputs would fail by floating-point
      // cancellation inherent to translate-by-large-vector arithmetic, not by a transform bug.
      return transformCanonicalState(
        nativeState,
        FRAME_MARS_J2000_ICRF,
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

  function getAsteroidBody(bodyId: AsteroidBodyId): AsteroidBody {
    const asteroid = asteroidIndex.byBodyId.get(bodyId);
    if (!asteroid) {
      throw new Error(`Unknown asteroid focus target '${bodyId}'`);
    }
    return asteroid;
  }

  function getAsteroidHeliocentricState(bodyId: AsteroidBodyId, tdbSeconds: number): CanonicalState {
    return propagateAsteroidBodyState(getAsteroidBody(bodyId), tdbSeconds);
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
    if (isAsteroidFocusTarget(bodyId)) {
      return getAsteroidHeliocentricState(bodyId, tdbSeconds).positionM;
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
    const nextAsteroid = isAsteroidFocusTarget(nextFocusBody)
      ? getAsteroidBody(nextFocusBody)
      : undefined;
    targetFocusBody = nextFocusBody;
    focusTransitionFromAnchor = fromAnchor;
    focusTransitionStartMs = nowMs;
    orbitRadius = clamp(
      nextOrbitRadius,
      getMinOrbitRadiusForFocus(nextFocusBody, nextAsteroid),
      MAX_CAMERA_DISTANCE_M,
    );
    if (isAsteroidFocusTarget(nextFocusBody)) {
      orbitPolar = ASTEROID_FOCUS_ORBIT_POLAR_RAD;
    } else if (nextFocusBody === 'mars') {
      // Slice 5 lesson applied preemptively: render-only +X-axis tilt coupled
      // with the global default orbit (azimuth=0, polar=π/2) produces a
      // mathematically edge-on view. Mars uses the Saturn precedent from
      // commit 8f3c30e and resets focus to a three-quarter view at π/3.
      orbitPolar = MARS_FOCUS_ORBIT_POLAR_RAD;
    } else if (nextFocusBody === 'saturn') {
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
    const viewport = { width: window.innerWidth, height: window.innerHeight };

    camera.near = Math.max(1, orbitRadius * 1e-4);
    camera.far = Math.max(orbitRadius * 10, 5e8);
    camera.updateProjectionMatrix();
    camera.position.set(camLocal.x, camLocal.y, camLocal.z);

    const haloUpdates: Array<{ bodyId: BodyId; positionRelCam: THREE.Vector3; radiusM: number }> = [];

    for (const bodyId of BODY_IDS) {
      const root = renderRoots.get(bodyId)!;
      let relX = 0;
      let relY = 0;
      let relZ = 0;

      if (bodyId === 'phobos' || bodyId === 'deimos') {
        const marsCentered = getNativeState(bodyId, currentTdbSeconds);
        relX = marsCentered.positionM.x;
        relY = marsCentered.positionM.y;
        relZ = marsCentered.positionM.z;
      } else {
        const helio = getHeliocentricState(bodyId, currentTdbSeconds);
        relX = helio.positionM.x - anchorPosM.x;
        relY = helio.positionM.y - anchorPosM.y;
        relZ = helio.positionM.z - anchorPosM.z;
      }
      root.position.set(relX, relY, relZ);

      const helio = getHeliocentricState(bodyId, currentTdbSeconds);
      const posRelCam = new THREE.Vector3(
        helio.positionM.x - anchorPosM.x - camLocal.x,
        helio.positionM.y - anchorPosM.y - camLocal.y,
        helio.positionM.z - anchorPosM.z - camLocal.z,
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
      viewport,
    );
    const activeFocusBody = getActiveFocusBody(nowMs);
    asteroidRenderer.setFocusedAsteroid(
      isAsteroidFocusTarget(activeFocusBody) ? activeFocusBody : null,
    );
    asteroidRenderer.update({
      anchorPositionM: anchorPosM,
      camera,
      tdbSeconds: currentTdbSeconds,
      viewport,
    });

    const epochStep = Math.round((currentTdbSeconds - SLICE3_EPOCH_TDB) / TIME_SCRUB_STEP_SECONDS);
    document.title = `Aster V2 — Solar System — step ${epochStep}`;
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

  function setCursor(style: string): void {
    renderer.domElement.style.cursor = style;
  }

  function updateRaycasterFromClient(clientX: number, clientY: number): void {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    raycaster.setFromCamera(pointerNdc, camera);
    const worldUnitsPerPixel =
      (2 * orbitRadius * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(rect.height, 1);
    raycaster.params.Points.threshold = Math.max(
      1_000,
      worldUnitsPerPixel * ASTEROID_POINT_RAYCAST_PIXEL_THRESHOLD,
    );
  }

  function pickAsteroidAt(clientX: number, clientY: number): AsteroidBodyId | null {
    updateRaycasterFromClient(clientX, clientY);
    const intersections = raycaster.intersectObjects(
      asteroidRenderer
        .getRaycastTargets()
        .filter((target) => target.visible !== false || target === asteroidRenderer.points),
      false,
    );
    for (const intersection of intersections) {
      const asteroidBodyId = asteroidRenderer.resolveIntersection(intersection);
      if (asteroidBodyId) {
        return asteroidBodyId;
      }
    }
    return null;
  }

  function updatePointerCursor(clientX: number, clientY: number): void {
    if (pointerActive && pointerDragged) {
      setCursor('grabbing');
      return;
    }
    const asteroidBodyId = pickAsteroidAt(clientX, clientY);
    setCursor(asteroidBodyId ? 'pointer' : pointerActive ? 'grabbing' : 'grab');
  }

  function onPointerDown(event: PointerEvent): void {
    pointerActive = true;
    pointerDragged = false;
    pointerDownX = event.clientX;
    pointerDownY = event.clientY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    setCursor('grabbing');
    renderer.domElement.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!pointerActive) {
      updatePointerCursor(event.clientX, event.clientY);
      return;
    }
    const dx = event.clientX - lastPointerX;
    const dy = event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    if (
      !pointerDragged &&
      Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) >= POINTER_CLICK_THRESHOLD_PX
    ) {
      pointerDragged = true;
    }

    if (!pointerDragged) {
      return;
    }

    orbitAzimuth -= dx * ORBIT_SENSITIVITY;
    orbitPolar = clamp(orbitPolar + dy * ORBIT_SENSITIVITY, 0.001, Math.PI - 0.001);
    updateVisibleState();
    setCursor('grabbing');
  }

  function onPointerUp(event: PointerEvent): void {
    if (!pointerDragged) {
      const asteroidBodyId = pickAsteroidAt(event.clientX, event.clientY);
      if (asteroidBodyId) {
        const nowMs = performance.now();
        const activeFocusBody = getActiveFocusBody(nowMs);
        const asteroidBody = getAsteroidBody(asteroidBodyId);
        const nextOrbitRadius = resolveFocusOrbitRadius(
          activeFocusBody,
          asteroidBodyId,
          orbitRadius,
          asteroidBody,
        );
        startFocusTransition(asteroidBodyId, nextOrbitRadius);
      }
    }
    pointerActive = false;
    pointerDragged = false;
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
    updatePointerCursor(event.clientX, event.clientY);
  }

  function onWheel(event: WheelEvent): void {
    event.preventDefault();
    const activeFocusBody = getActiveFocusBody(performance.now());
    const minOrbitRadius = getMinOrbitRadiusForFocus(
      activeFocusBody,
      isAsteroidFocusTarget(activeFocusBody) ? getAsteroidBody(activeFocusBody) : undefined,
    );
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
      const nextOrbitRadius = resolveFocusOrbitRadius(
        activeFocusBody,
        nextFocusBody,
        orbitRadius,
      );
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
    asteroidRenderer.dispose();
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
