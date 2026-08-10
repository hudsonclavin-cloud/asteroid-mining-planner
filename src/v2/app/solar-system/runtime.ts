import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  J2000_ECLIPTIC_OBLIQUITY_RAD,
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
import { utcStringToTdbSeconds } from '../../core/units/utc-to-tdb.js';
import {
  AsteroidRenderer,
  propagateAsteroidBodyState,
  resolveAliasedPointSizeRange,
  StarRenderer,
  sampleCameraOrbitTween,
  setAsteroidPointsMaxSize,
  type CameraOrbitState,
  type CameraOrbitTween,
} from '../../render/index.js';
import { loadStarCatalog } from '../../boundary/star-catalog-tycho2.js';
import {
  createLambertScreenIndex,
  loadLambertScreenCacheAsync,
} from '../../boundary/lambert-screen-cache.js';
import { createJupiterOblateMesh } from '../../render/jupiter-oblate.js';
import { createMarsOblateMesh } from '../../render/mars-oblate.js';
import { createSaturnOblateMesh } from '../../render/saturn-oblate.js';
import { createSaturnRingsGroup } from '../../render/saturn-rings.js';
import { HaloSystem } from '../../render/halos.js';
import {
  ATMOSPHERE_BODY_IDS,
  ATMOSPHERE_PARAMS,
  createAtmosphereMesh,
} from '../../render/atmosphere.js';
import { buildEarthMaterial, updateSunDirection } from '../../render/earth-shader.js';
import { mountPhaseCOverlay } from '../ui-overlay/index.js';
import {
  readSelectedBody,
  selectBody,
  subscribeToBodyLabelsVisible,
  subscribeToFocusRequests,
  subscribeToStarfieldDisplay,
} from '../ui-store/index.js';
import { loadSlice9NeaCatalogFixture, loadSolarSystemStatesBrowser } from './loader.js';
import {
  buildSlice9RuntimePropagationBodies,
  isSlice9RuntimeEllipticBody,
  normalizeSlice9BodyForRuntime,
} from './slice9-runtime-asteroids.js';

const AU_M = 149_597_870_700;
const OVERVIEW_ORBIT_RADIUS_M = 7 * AU_M;
const JUPITER_SYSTEM_OVERVIEW_RADIUS_M = 5_000_000_000;
const MARS_SYSTEM_OVERVIEW_RADIUS_M = 60_000_000;
const SATURN_SYSTEM_OVERVIEW_RADIUS_M = 6_000_000_000;
const EARTH_FOCUS_RADIUS_M = 400_000_000;
const MIN_CAMERA_DISTANCE_M = 1e9;
const MAX_CAMERA_DISTANCE_M = 15 * AU_M;
const MIN_SUN_CLEARANCE_M = 5e9;
const ORBIT_SENSITIVITY = 0.005;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const TIME_SCRUB_STEP_SECONDS = 1800;
const FOCUS_TRANSITION_DURATION_MS = 650;
const POINTER_CLICK_THRESHOLD_PX = 4;
const ASTEROID_POINT_RAYCAST_PIXEL_THRESHOLD = 8;
const SLICE9_HYBRID_COARSE_CELL_SIZE_AU = 1;
const SLICE9_HYBRID_FINE_CELL_SIZE_AU = 0.25;
const SLICE9_HYBRID_DENSITY_TRIGGER = 200;
export const MARS_RENDER_TILT_RAD = THREE.MathUtils.degToRad(25.19);
const MARS_FOCUS_ORBIT_POLAR_RAD = Math.PI / 3;
const SATURN_RENDER_TILT_RAD = THREE.MathUtils.degToRad(26.7);
const SATURN_FOCUS_ORBIT_POLAR_RAD = Math.PI / 3;
export const ASTEROID_FOCUS_ORBIT_POLAR_RAD = Math.PI / 3;
const OVERVIEW_ORBIT_POLAR_RAD = Math.PI / 3;
export const TOP_DOWN_PRESET_KEY = 't';
export const TOP_DOWN_ORBIT_RADIUS_M = 8 * AU_M;
export const TOP_DOWN_PRESET_DURATION_MS = 1_000;
export const INTERACTIVE_MIN_ORBIT_POLAR_RAD = 0.001;
export const INTERACTIVE_MAX_ORBIT_POLAR_RAD = Math.PI - INTERACTIVE_MIN_ORBIT_POLAR_RAD;
const OUTER_SYSTEM_OVERVIEW = 'outer-system-overview' as const;
// Guarded for non-Vite runtimes (node --test): env is absent there, so ?. + ?? '/'
// keeps module load safe. Under `vite build` the whole chain is statically replaced
// by the literal base and the ?? folds away — bundle byte-identical (RR1E build gate).
const TEXTURE_BASE_URL = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
const EARTH_DAY_TEXTURE_URL = `${TEXTURE_BASE_URL}2k_earth_daymap.jpg`;
const EARTH_NIGHT_TEXTURE_URL = `${TEXTURE_BASE_URL}2k_earth_nightmap.jpg`;
const EARTH_NORMAL_TEXTURE_URL = `${TEXTURE_BASE_URL}2k_earth_normal.jpg`;
const EARTH_SPECULAR_TEXTURE_URL = `${TEXTURE_BASE_URL}2k_earth_specular.jpg`;
const EARTH_CLOUD_TEXTURE_URL = `${TEXTURE_BASE_URL}2k_earth_clouds.jpg`;

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

const LABELED_BODY_IDS: ReadonlyArray<{ bodyId: BodyId; label: string }> = [
  { bodyId: 'sun', label: 'Sun' },
  { bodyId: 'mercury', label: 'Mercury' },
  { bodyId: 'venus', label: 'Venus' },
  { bodyId: 'earth', label: 'Earth' },
  { bodyId: 'mars', label: 'Mars' },
  { bodyId: 'jupiter', label: 'Jupiter' },
  { bodyId: 'saturn', label: 'Saturn' },
];

/*
 * Slice 6 focus keymap:
 * 1 Sun, 2 Mercury, 3 Venus, 4 Earth, 5 Moon, 6 Mars (legacy), M Mars,
 * P Phobos, X Deimos,
 * 7 Jupiter, 8 Io, 9 Europa, 0 Ganymede, - Callisto,
 * S Saturn, K Titan, R Rhea, I Iapetus, Y Tethys, D Dione,
 * N Mimas, E Enceladus, = outer-system overview.
 *
 * Mars claims 'm' so the default Slice 6 manual verification path can press
 * 'm' from overview without remembering the older numeric alias. Mimas moves to
 * 'n'; Saturn focus itself remains on 's' for the Slice 4-5 regression path.
 * Slice 8.5 repurposes 't' for the top-down preset. Slice 17 B0a adds 'k' for
 * Titan — previously the only rendered body without a focus key; 't' stays
 * with the top-down preset.
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
  k: 'titan',
  r: 'rhea',
  i: 'iapetus',
  y: 'tethys',
  d: 'dione',
  n: 'mimas',
  e: 'enceladus',
};

type FocusTarget = BodyId | AsteroidBodyId | typeof OUTER_SYSTEM_OVERVIEW;
type Position3 = CanonicalState['positionM'];

export interface FocusedAsteroidHudElement {
  textContent: string;
  style: {
    display: string;
  };
}

export interface DateHudElement {
  textContent: string;
}

export interface PlanetHoverTooltipElement {
  textContent: string;
  style: {
    display: string;
    left: string;
    top: string;
  };
}

const J2000_TDB_JULIAN_DAY = 2451545;
const TDB_MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TDB_AT_UNIX_EPOCH = utcStringToTdbSeconds('1970-01-01T00:00:00Z');
const nowTdbSeconds = (): number =>
  Date.now() / 1000 + TDB_AT_UNIX_EPOCH;
const PLANET_HOVER_TOOLTIP_OFFSET_PX = 12;
const PLANET_HOVER_TOOLTIP_THROTTLE_MS = 33;

export const PLANET_HOVER_TOOLTIP_BODY_IDS: BodyId[] = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'mars',
  'jupiter',
  'saturn',
];

export interface CameraPreset {
  key: string;
  focusBody: FocusTarget;
  orbitState: CameraOrbitState;
  durationMs: number;
}

export interface Direction3 {
  x: number;
  y: number;
  z: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

export function rotateEclipticDirectionToIcrf(direction: Direction3): Direction3 {
  const cosObliquity = Math.cos(J2000_ECLIPTIC_OBLIQUITY_RAD);
  const sinObliquity = Math.sin(J2000_ECLIPTIC_OBLIQUITY_RAD);
  return {
    x: direction.x,
    y: direction.y * cosObliquity - direction.z * sinObliquity,
    z: direction.y * sinObliquity + direction.z * cosObliquity,
  };
}

export function resolveViewportSize(
  measuredWidth: number,
  measuredHeight: number,
  fallbackWidth = window.innerWidth,
  fallbackHeight = window.innerHeight,
): ViewportSize {
  const width = Number.isFinite(measuredWidth) && measuredWidth > 0
    ? measuredWidth
    : fallbackWidth;
  const height = Number.isFinite(measuredHeight) && measuredHeight > 0
    ? measuredHeight
    : fallbackHeight;
  return { width, height };
}

export function isEditableKeyboardTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') {
    return false;
  }

  const candidate = target as {
    tagName?: unknown;
    isContentEditable?: unknown;
  };
  if (candidate.isContentEditable === true) {
    return true;
  }

  const tagName = typeof candidate.tagName === 'string' ? candidate.tagName.toLowerCase() : '';
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}

export function resolveSunLightPosition(
  sunRelativePosition: Position3,
  sunRadiusM: number,
): Position3 {
  if (Math.hypot(sunRelativePosition.x, sunRelativePosition.y, sunRelativePosition.z) >= 1) {
    return sunRelativePosition;
  }

  return {
    x: sunRadiusM,
    y: sunRadiusM * 0.3,
    z: sunRadiusM * 0.2,
  };
}

function createBodyLabelElement(text: string): HTMLDivElement {
  const element = document.createElement('div');
  element.style.pointerEvents = 'none';

  const pill = document.createElement('div');
  pill.textContent = text;
  pill.style.position = 'absolute';
  pill.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  pill.style.fontSize = '12px';
  pill.style.lineHeight = '1';
  pill.style.color = '#ffffff';
  pill.style.background = 'rgba(0, 0, 0, 0.58)';
  pill.style.border = '1px solid rgba(255, 255, 255, 0.18)';
  pill.style.borderRadius = '999px';
  pill.style.padding = '3px 6px';
  pill.style.pointerEvents = 'none';
  pill.style.userSelect = 'none';
  pill.style.whiteSpace = 'nowrap';
  pill.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.65)';
  pill.style.transform = 'translate(12px, -12px)';
  element.appendChild(pill);
  return element;
}

function createBodyLabelObject(text: string): CSS2DObject {
  return new CSS2DObject(createBodyLabelElement(text));
}

function setBodyLabelText(element: HTMLElement, text: string): void {
  const pill = element.firstElementChild;
  if (!(pill instanceof HTMLElement)) {
    throw new Error('Body label anchor is missing its pill element');
  }
  pill.textContent = text;
}

function formatAsteroidLabel(asteroid: AsteroidBody): string {
  return asteroid.designation || asteroid.name || asteroid.bodyId;
}

export const TOP_DOWN_ECLIPTIC_NORMAL_ICRF = rotateEclipticDirectionToIcrf({
  x: 0,
  y: 0,
  z: 1,
});

export function getCameraPresetForKey(key: string): CameraPreset | null {
  if (key === TOP_DOWN_PRESET_KEY) {
    return {
      key,
      focusBody: 'sun',
      orbitState: TOP_DOWN_ORBIT_STATE,
      durationMs: TOP_DOWN_PRESET_DURATION_MS,
    };
  }

  return null;
}

export function isCameraControlsLocked(tween: CameraOrbitTween | null, nowMs: number): boolean {
  if (!tween) {
    return false;
  }
  return nowMs - tween.startMs < tween.durationMs;
}

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

function clampOrbitRadiusForSunClearance(
  proposedRadius: number,
  minRadius: number,
  polar: number,
  azimuth: number,
  sunScenePos: { x: number; y: number; z: number },
): number {
  // Unit direction of the camera ray from scene origin.
  const sinP = Math.sin(polar);
  const dx = sinP * Math.cos(azimuth);
  const dy = Math.cos(polar);
  const dz = sinP * Math.sin(azimuth);
  // Ray-sphere intersection: |t*d - S|^2 = r^2, solved for t along the ray (t >= 0).
  const dot = dx * sunScenePos.x + dy * sunScenePos.y + dz * sunScenePos.z;
  const sunDist2 =
    sunScenePos.x ** 2 + sunScenePos.y ** 2 + sunScenePos.z ** 2;
  const discriminant = dot * dot - (sunDist2 - MIN_SUN_CLEARANCE_M ** 2);
  if (discriminant < 0) {
    // Camera ray line never enters the clearance sphere.
    return proposedRadius;
  }
  const sqrtDisc = Math.sqrt(discriminant);
  const tNear = dot - sqrtDisc;
  const tFar = dot + sqrtDisc;
  if (tFar <= 0) {
    // Clearance sphere lies entirely behind the camera ray direction.
    return proposedRadius;
  }
  if (tNear <= 0) {
    // Scene origin is inside the clearance sphere (e.g. the Sun is the focus
    // anchor, sunScenePos ~ 0). The forward ray exits the sphere; clamping
    // here would trap the camera at minRadius. Leave the radius unconstrained.
    return proposedRadius;
  }
  // Clearance sphere is ahead along the ray; stop before its near boundary.
  return Math.min(proposedRadius, Math.max(minRadius, tNear));
}

export function orbitStateToCameraDirection(
  orbitState: Pick<CameraOrbitState, 'polarRad' | 'azimuthRad'>,
): Direction3 {
  const cartesian = sphericalToCartesian(1, orbitState.polarRad, orbitState.azimuthRad);
  return {
    x: cartesian.x,
    y: cartesian.y,
    z: cartesian.z,
  };
}

function directionToOrbitState(direction: Direction3, radiusM: number): CameraOrbitState {
  const magnitude = Math.hypot(direction.x, direction.y, direction.z);
  if (!Number.isFinite(magnitude) || magnitude <= 0) {
    throw new RangeError('direction must be a finite non-zero vector');
  }

  const normalized = {
    x: direction.x / magnitude,
    y: direction.y / magnitude,
    z: direction.z / magnitude,
  };

  return {
    radiusM,
    polarRad: Math.acos(clamp(normalized.y, -1, 1)),
    azimuthRad: Math.atan2(normalized.z, normalized.x),
  };
}

const TOP_DOWN_ORBIT_STATE = directionToOrbitState(
  TOP_DOWN_ECLIPTIC_NORMAL_ICRF,
  TOP_DOWN_ORBIT_RADIUS_M,
);

export const TOP_DOWN_ORBIT_POLAR_RAD = TOP_DOWN_ORBIT_STATE.polarRad;
export const TOP_DOWN_ORBIT_AZIMUTH_RAD = TOP_DOWN_ORBIT_STATE.azimuthRad;

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
  if (bodyId === 'earth') {
    return new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: constants.vizColor,
        shininess: 15,
        specular: new THREE.Color(0x2244aa),
      }),
    );
  }

  const material =
    bodyId === 'sun'
      ? new THREE.MeshBasicMaterial({ color: constants.vizColor })
      : new THREE.MeshLambertMaterial({ color: constants.vizColor });

  return new THREE.Mesh(geometry, material);
}

function loadTexture(
  loader: THREE.TextureLoader,
  url: string,
  encoding: THREE.TextureEncoding,
): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.encoding = encoding;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

function wireEarthTextures(
  mesh: THREE.Mesh,
  loader: THREE.TextureLoader,
  sunDirection: THREE.Vector3,
): void {
  const material = mesh.material;
  if (!(material instanceof THREE.MeshPhongMaterial)) {
    throw new Error('Earth material must be MeshPhongMaterial before texture wiring');
  }

  Promise.all([
    loadTexture(loader, EARTH_DAY_TEXTURE_URL, THREE.sRGBEncoding),
    loadTexture(loader, EARTH_NIGHT_TEXTURE_URL, THREE.sRGBEncoding),
    loadTexture(loader, EARTH_NORMAL_TEXTURE_URL, THREE.LinearEncoding),
    loadTexture(loader, EARTH_SPECULAR_TEXTURE_URL, THREE.LinearEncoding),
  ]).then(([dayMap, nightMap, normalMap, specularMap]) => {
    const previousMaterial = mesh.material;
    mesh.material = buildEarthMaterial({
      dayMap,
      nightMap,
      normalMap,
      specularMap,
      sunDirection,
    });
    mesh.userData.nightMap = nightMap;
    if (previousMaterial instanceof THREE.Material) {
      previousMaterial.dispose();
    }
  }).catch((error) => {
    console.warn('Failed to load Earth hero shader textures', error);
  });

  loadTexture(loader, EARTH_CLOUD_TEXTURE_URL, THREE.sRGBEncoding)
    .then((texture) => {
      mesh.userData.cloudMap = texture;
    })
    .catch((error) => {
      console.warn(`Failed to load texture ${EARTH_CLOUD_TEXTURE_URL}`, error);
    });
}

function isAsteroidFocusTarget(bodyId: FocusTarget): bodyId is AsteroidBodyId {
  return typeof bodyId === 'string' && isAsteroidBodyId(bodyId);
}

export function renderFocusedAsteroidHud(
  element: FocusedAsteroidHudElement,
  asteroid: Pick<AsteroidBody, 'designation' | 'class'> | null,
): void {
  if (!asteroid) {
    element.textContent = '';
    element.style.display = 'none';
    return;
  }

  element.textContent = `${asteroid.designation} · ${asteroid.class}`;
  element.style.display = 'block';
}

function julianDayToGregorianDate(julianDay: number): {
  year: number;
  monthIndex: number;
  day: number;
  hour: number;
  minute: number;
} {
  const shiftedJulianDay = julianDay + 0.5;
  const z = Math.floor(shiftedJulianDay);
  const fractionalDay = shiftedJulianDay - z;
  const alpha = Math.floor((z - 1867216.25) / 36524.25);
  const a = z + 1 + alpha - Math.floor(alpha / 4);
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = Math.floor(b - d - Math.floor(30.6001 * e) + fractionalDay);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  const totalMinutes = Math.floor(fractionalDay * 1_440);
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return { year, monthIndex: month - 1, day, hour, minute };
}

export function formatTdbDateLabel(tdbSeconds: number): string {
  const julianDay = J2000_TDB_JULIAN_DAY + tdbSeconds / 86_400;
  const { year, monthIndex, day, hour, minute } = julianDayToGregorianDate(julianDay);
  return `${year} ${TDB_MONTH_LABELS[monthIndex]} ${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} TDB`;
}

const tdbSecondsToUtcMs = (tdbSeconds: number): number =>
  (tdbSeconds - TDB_AT_UNIX_EPOCH) * 1000;

function formatTdbCoverageDateLabel(tdbSeconds: number): string {
  const [year, monthLabel, day] = formatTdbDateLabel(tdbSeconds).split(' ');
  const month = String(TDB_MONTH_LABELS.indexOf(monthLabel) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatUtcDateTimeLabel(tdbSeconds: number): string {
  const isoString = new Date(tdbSecondsToUtcMs(tdbSeconds)).toISOString();
  return `${isoString.slice(0, 10)} ${isoString.slice(11, 16)} UTC`;
}

export function renderDateHud(element: DateHudElement, tdbSeconds: number): void {
  element.textContent = formatTdbDateLabel(tdbSeconds);
}

export function getBodyLabel(bodyId: BodyId): string {
  return bodyId.charAt(0).toUpperCase() + bodyId.slice(1);
}

export function projectWorldPositionToViewport(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera,
  viewport: { width: number; height: number },
): { x: number; y: number } {
  const ndc = worldPosition.clone().project(camera);
  return {
    x: (ndc.x + 1) * 0.5 * viewport.width,
    y: (1 - ndc.y) * 0.5 * viewport.height,
  };
}

export function renderPlanetHoverTooltip(
  element: PlanetHoverTooltipElement,
  label: string | null,
  screenPosition?: { x: number; y: number },
): void {
  if (!label || !screenPosition) {
    element.textContent = '';
    element.style.display = 'none';
    return;
  }

  element.textContent = label;
  element.style.left = `${Math.round(screenPosition.x + PLANET_HOVER_TOOLTIP_OFFSET_PX)}px`;
  element.style.top = `${Math.round(screenPosition.y + PLANET_HOVER_TOOLTIP_OFFSET_PX)}px`;
  element.style.display = 'block';
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
  return Math.max(20 * radiusM, radiusM + 5_000);
}

function buildAsteroidCanonicalPositions(
  asteroidBodies: readonly AsteroidBody[],
  tdbSeconds: number,
): THREE.Vector3[] {
  return asteroidBodies.map((asteroid) => {
    if (isSlice9RuntimeEllipticBody({ elements: asteroid.elements })) {
      const propagated = propagateAsteroidBodyState(asteroid, tdbSeconds);
      return new THREE.Vector3(
        propagated.positionM.x,
        propagated.positionM.y,
        propagated.positionM.z,
      );
    }
    return new THREE.Vector3(
      asteroid.anchorState.positionM.x,
      asteroid.anchorState.positionM.y,
      asteroid.anchorState.positionM.z,
    );
  });
}

function writeAsteroidCanonicalPositionsFromBuffer(
  positionsM: Float64Array,
  target: THREE.Vector3[],
): THREE.Vector3[] {
  const bodyCount = positionsM.length / 3;
  while (target.length < bodyCount) {
    target.push(new THREE.Vector3());
  }
  target.length = bodyCount;
  for (let bodyIndex = 0; bodyIndex < bodyCount; bodyIndex += 1) {
    const offset = bodyIndex * 3;
    target[bodyIndex].set(
      positionsM[offset],
      positionsM[offset + 1],
      positionsM[offset + 2],
    );
  }
  return target;
}

function getViewportSizeForMount(mount: HTMLElement): ViewportSize {
  const rect = mount.getBoundingClientRect();
  return resolveViewportSize(rect.width, rect.height);
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
  if (bodyId === 'earth') {
    return EARTH_FOCUS_RADIUS_M;
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
  const [allStates, asteroidCatalog, starCatalog] = await Promise.all([
    loadSolarSystemStatesBrowser(),
    loadSlice9NeaCatalogFixture(),
    loadStarCatalog(),
  ]);
  const stateSeries = new Map<BodyId, CanonicalState[]>();
  const asteroidBodies = Object.values(asteroidCatalog.asteroids).map(normalizeSlice9BodyForRuntime);
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

  const initialViewport = getViewportSizeForMount(mount);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(initialViewport.width, initialViewport.height);
  renderer.setClearColor(0x000000, 1);
  mount.replaceChildren(renderer.domElement);
  mount.style.position = 'relative';
  renderer.domElement.style.cursor = 'grab';
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(initialViewport.width, initialViewport.height);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  mount.appendChild(labelRenderer.domElement);
  let bodyLabelsVisible = true;
  const disposeBodyLabelsBridge = subscribeToBodyLabelsVisible((visible) => {
    bodyLabelsVisible = visible;
    labelRenderer.domElement.style.display = visible ? '' : 'none';
  });
  const disposePhaseCOverlay = mountPhaseCOverlay(mount);

  const focusedAsteroidHud = document.createElement('div');
  focusedAsteroidHud.setAttribute('data-testid', 'focused-asteroid-hud');
  focusedAsteroidHud.style.position = 'absolute';
  focusedAsteroidHud.style.top = '16px';
  focusedAsteroidHud.style.left = '16px';
  focusedAsteroidHud.style.padding = '8px 10px';
  focusedAsteroidHud.style.fontFamily = '"SF Mono", "Roboto Mono", monospace';
  focusedAsteroidHud.style.fontSize = '16px';
  focusedAsteroidHud.style.lineHeight = '1.3';
  focusedAsteroidHud.style.color = '#ffffff';
  focusedAsteroidHud.style.background = 'rgba(0, 0, 0, 0.28)';
  focusedAsteroidHud.style.border = '1px solid rgba(255, 255, 255, 0.16)';
  focusedAsteroidHud.style.borderRadius = '8px';
  focusedAsteroidHud.style.pointerEvents = 'none';
  focusedAsteroidHud.style.display = 'none';
  mount.appendChild(focusedAsteroidHud);

  const dateHud = document.createElement('div');
  dateHud.setAttribute('data-testid', 'date-hud');
  dateHud.style.position = 'absolute';
  dateHud.style.top = '16px';
  dateHud.style.right = '16px';
  dateHud.style.padding = '8px 10px';
  dateHud.style.fontFamily = '"SF Mono", "Roboto Mono", monospace';
  dateHud.style.fontSize = '15px';
  dateHud.style.lineHeight = '1.3';
  dateHud.style.color = '#ffffff';
  dateHud.style.background = 'rgba(0, 0, 0, 0.28)';
  dateHud.style.border = '1px solid rgba(255, 255, 255, 0.16)';
  dateHud.style.borderRadius = '8px';
  dateHud.style.pointerEvents = 'none';
  dateHud.style.whiteSpace = 'pre-line';
  mount.appendChild(dateHud);

  const timeStatusHud = document.createElement('div');
  timeStatusHud.setAttribute('data-testid', 'time-status-hud');
  timeStatusHud.style.position = 'absolute';
  timeStatusHud.style.top = '82px';
  timeStatusHud.style.right = '16px';
  timeStatusHud.style.display = 'grid';
  timeStatusHud.style.gap = '4px';
  timeStatusHud.style.maxWidth = '420px';
  timeStatusHud.style.padding = '8px 10px';
  timeStatusHud.style.fontFamily = '"SF Mono", "Roboto Mono", monospace';
  timeStatusHud.style.fontSize = '12px';
  timeStatusHud.style.lineHeight = '1.3';
  timeStatusHud.style.color = 'rgba(255, 255, 255, 0.82)';
  timeStatusHud.style.background = 'rgba(0, 0, 0, 0.28)';
  timeStatusHud.style.border = '1px solid rgba(255, 255, 255, 0.16)';
  timeStatusHud.style.borderRadius = '8px';
  timeStatusHud.style.pointerEvents = 'none';

  const coverageLine = document.createElement('div');
  coverageLine.setAttribute('data-testid', 'ephemeris-coverage-line');
  coverageLine.textContent =
    `View ephemeris coverage ${formatTdbCoverageDateLabel(timeMin)} – ${formatTdbCoverageDateLabel(timeMax)} TDB`;
  timeStatusHud.appendChild(coverageLine);

  const outOfCoverageWarning = document.createElement('div');
  outOfCoverageWarning.setAttribute('data-testid', 'ephemeris-coverage-warning');
  outOfCoverageWarning.textContent =
    'Current time is outside ephemeris coverage — showing nearest available date.';
  outOfCoverageWarning.style.color = '#ffd27a';
  outOfCoverageWarning.style.display = 'none';
  timeStatusHud.appendChild(outOfCoverageWarning);

  const trackingStatus = document.createElement('div');
  trackingStatus.setAttribute('data-testid', 'time-tracking-status');
  timeStatusHud.appendChild(trackingStatus);
  mount.appendChild(timeStatusHud);

  const planetHoverTooltip = document.createElement('div');
  planetHoverTooltip.setAttribute('data-testid', 'planet-hover-tooltip');
  planetHoverTooltip.className = 'planet-hover-tooltip';
  planetHoverTooltip.style.position = 'absolute';
  planetHoverTooltip.style.padding = '4px 6px';
  planetHoverTooltip.style.fontFamily = '"SF Mono", "Roboto Mono", monospace';
  planetHoverTooltip.style.fontSize = '13px';
  planetHoverTooltip.style.lineHeight = '1.2';
  planetHoverTooltip.style.color = '#ffffff';
  planetHoverTooltip.style.background = 'rgba(0, 0, 0, 0.72)';
  planetHoverTooltip.style.border = '1px solid rgba(255, 255, 255, 0.16)';
  planetHoverTooltip.style.borderRadius = '4px';
  planetHoverTooltip.style.pointerEvents = 'none';
  planetHoverTooltip.style.display = 'none';
  mount.appendChild(planetHoverTooltip);

  const scene = new THREE.Scene();
  const starRenderer = new StarRenderer(starCatalog, renderer.getPixelRatio());
  const disposeStarfieldDisplayBridge = subscribeToStarfieldDisplay(({ visible, brightness }) => {
    starRenderer.setVisible(visible);
    starRenderer.setOpacity(brightness);
  });
  const camera = new THREE.PerspectiveCamera(
    45,
    initialViewport.width / initialViewport.height,
    1,
    MAX_CAMERA_DISTANCE_M * 10,
  );
  scene.add(starRenderer.getMesh());

  const renderRoots = new Map<BodyId, THREE.Object3D>();
  const meshes = new Map<BodyId, THREE.Mesh>();
  const atmosphereShells = new Map<BodyId, THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>>();
  const textureLoader = new THREE.TextureLoader();
  const earthSunDirection = new THREE.Vector3(1, 0, 0);
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
    if (bodyId === 'earth') {
      wireEarthTextures(mesh, textureLoader, earthSunDirection);
    }
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
  for (const { bodyId, label } of LABELED_BODY_IDS) {
    const target = renderRoots.get(bodyId);
    if (!target) {
      continue;
    }
    const labelObject = createBodyLabelObject(label);
    labelObject.name = `body-label-${bodyId}`;
    labelObject.position.set(0, 0, 0);
    target.add(labelObject);
  }
  const focusedAsteroidLabel = createBodyLabelObject('');
  focusedAsteroidLabel.name = 'focused-asteroid-label';
  focusedAsteroidLabel.visible = false;
  scene.add(focusedAsteroidLabel);
  for (const [index, bodyId] of ATMOSPHERE_BODY_IDS.entries()) {
    const runtimeBodyId = bodyId as BodyId;
    const planetMesh = meshes.get(runtimeBodyId);
    if (!planetMesh) {
      continue;
    }
    const shell = createAtmosphereMesh(
      planetMesh as THREE.Mesh<THREE.SphereGeometry, THREE.Material | THREE.Material[]>,
      ATMOSPHERE_PARAMS[bodyId],
      index,
    );
    atmosphereShells.set(runtimeBodyId, shell);
    scene.add(shell);
  }

  const ambientLight = new THREE.AmbientLight(0x060810, 0.08);
  const sunLight = new THREE.DirectionalLight(0xfffde8, 4.0);
  const sunLightTarget = new THREE.Object3D();
  scene.add(ambientLight, sunLight, sunLightTarget);
  sunLight.target = sunLightTarget;

  const haloSystem = new HaloSystem(scene);
  const asteroidRenderer = new AsteroidRenderer(asteroidBodies, {
    cellRenderer: {
      partitionStrategy: 'slice9-hybrid',
      slice9HybridConfig: {
        coarseCellSizeAu: SLICE9_HYBRID_COARSE_CELL_SIZE_AU,
        fineCellSizeAu: SLICE9_HYBRID_FINE_CELL_SIZE_AU,
        densityTrigger: SLICE9_HYBRID_DENSITY_TRIGGER,
      },
    },
  });
  // Slice 7 Phase H: asteroidRenderer.root now owns the full browse stack for
  // the catalog: orbit-line batch, points layer, instanced bodies, and focused
  // body/orbit highlight. Runtime still mounts a single sibling system under
  // the shared heliocentric scene graph.
  scene.add(asteroidRenderer.root);
  if (asteroidRenderer.pointsMaterial instanceof THREE.ShaderMaterial) {
    const [, maxPointSize] = resolveAliasedPointSizeRange(renderer.getContext());
    setAsteroidPointsMaxSize(asteroidRenderer.pointsMaterial, maxPointSize);
  }
  loadLambertScreenCacheAsync()
    .then((cache) => {
      const index = createLambertScreenIndex(cache);
      asteroidRenderer.setScreeningIndex(index);
    })
    .catch((error) => {
      console.error('Failed to load Lambert screen cache for renderer:', error);
    });
  const asteroidWorker = new Worker(new URL('./asteroid-propagation-worker.ts', import.meta.url), {
    type: 'module',
  });
  const asteroidWorkerBodies = buildSlice9RuntimePropagationBodies(asteroidBodies);
  let asteroidWorkerReady = false;
  let asteroidWorkerRequestId = 0;
  let asteroidPendingWorkerRequestId = -1;
  let asteroidRequestedTdbSeconds: number | null = null;
  let asteroidPropagationRevision = 0;
  let asteroidCanonicalPositionsM = buildAsteroidCanonicalPositions(asteroidBodies, timeMin);
  let asteroidPositionsEpochTdbSeconds = timeMin;
  // S-S17-FLICKER-2026-08-09-A: bodyId -> slot in asteroidCanonicalPositionsM.
  // Built once; both the array and this map are ordered by asteroidBodies, the
  // same array AsteroidRenderer iterates, so the indices agree by construction.
  const asteroidCanonicalIndexByBodyId = new Map<AsteroidBodyId, number>(
    asteroidBodies.map((asteroid, index) => [asteroid.bodyId, index] as const),
  );
  asteroidWorker.onmessage = (event) => {
    const message = event.data;
    if (!message || typeof message !== 'object') {
      return;
    }
    if (message.type === 'ready') {
      asteroidWorkerReady = true;
      asteroidWorkerRequestId += 1;
      asteroidWorker.postMessage({
        type: 'propagate',
        requestId: asteroidWorkerRequestId,
        targetTdbSeconds: asteroidPositionsEpochTdbSeconds,
      });
      asteroidRequestedTdbSeconds = asteroidPositionsEpochTdbSeconds;
      asteroidPendingWorkerRequestId = asteroidWorkerRequestId;
      return;
    }
    if (message.type === 'propagate-result') {
      if (message.requestId !== asteroidPendingWorkerRequestId) {
        return;
      }
      writeAsteroidCanonicalPositionsFromBuffer(
        new Float64Array(message.positionsM),
        asteroidCanonicalPositionsM,
      );
      asteroidPositionsEpochTdbSeconds = message.targetTdbSeconds;
      asteroidRequestedTdbSeconds = null;
      asteroidPendingWorkerRequestId = -1;
      asteroidPropagationRevision += 1;
      updateVisibleState();
    }
  };
  asteroidWorker.postMessage({
    type: 'init',
    bodies: asteroidWorkerBodies,
  });

  let orbitRadius = TOP_DOWN_ORBIT_STATE.radiusM;
  let orbitAzimuth = TOP_DOWN_ORBIT_STATE.azimuthRad;
  let orbitPolar = TOP_DOWN_ORBIT_STATE.polarRad;
  let currentFocusBody: FocusTarget = 'sun';
  let targetFocusBody: FocusTarget = 'sun';
  let focusTransitionStartMs = 0;
  let focusTransitionFromAnchor: Position3 | null = null;
  let orbitTween: CameraOrbitTween | null = null;
  let currentTdbSeconds = timeMin;
  let tracking = true;
  let disposed = false;
  let pointerActive = false;
  let pointerDragged = false;
  let pointerDownX = 0;
  let pointerDownY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let hasPointerSample = false;
  let animationHandle = 0;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const hoverTargetToBodyId = new Map<THREE.Object3D, BodyId>();
  let lastPlanetHoverUpdateMs = Number.NEGATIVE_INFINITY;

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

  function requestAsteroidPropagation(targetTdbSeconds: number): void {
    if (!asteroidWorkerReady) {
      asteroidCanonicalPositionsM = buildAsteroidCanonicalPositions(asteroidBodies, targetTdbSeconds);
      asteroidPositionsEpochTdbSeconds = targetTdbSeconds;
      asteroidPropagationRevision += 1;
      return;
    }

    if (targetTdbSeconds === asteroidPositionsEpochTdbSeconds && asteroidPendingWorkerRequestId < 0) {
      return;
    }
    if (targetTdbSeconds === asteroidRequestedTdbSeconds) {
      return;
    }

    asteroidWorkerRequestId += 1;
    asteroidPendingWorkerRequestId = asteroidWorkerRequestId;
    asteroidRequestedTdbSeconds = targetTdbSeconds;
    asteroidWorker.postMessage({
      type: 'propagate',
      requestId: asteroidWorkerRequestId,
      targetTdbSeconds,
    });
  }

  function resolveStoreSelectedAsteroidBodyId(selectedBody: string | null): AsteroidBodyId | null {
    if (!selectedBody) {
      return null;
    }

    const byBodyId = asteroidIndex.byBodyId.get(selectedBody as AsteroidBodyId);
    if (byBodyId) {
      return byBodyId.bodyId;
    }

    const byDesignation = asteroidIndex.byDesignation.get(selectedBody);
    if (byDesignation) {
      return byDesignation.bodyId;
    }

    const spkId = Number(selectedBody);
    if (Number.isInteger(spkId)) {
      return asteroidIndex.bySpkId.get(spkId)?.bodyId ?? null;
    }

    return null;
  }

  function updateFocusedAsteroidHud(bodyId: FocusTarget): void {
    renderFocusedAsteroidHud(
      focusedAsteroidHud,
      isAsteroidFocusTarget(bodyId) ? getAsteroidBody(bodyId) : null,
    );
  }

  function updateFocusedAsteroidLabel(bodyId: FocusTarget): void {
    if (!isAsteroidFocusTarget(bodyId)) {
      focusedAsteroidLabel.visible = false;
      return;
    }

    const asteroid = getAsteroidBody(bodyId);
    setBodyLabelText(focusedAsteroidLabel.element, formatAsteroidLabel(asteroid));
    focusedAsteroidLabel.position.set(0, 0, 0);
    focusedAsteroidLabel.visible = true;
  }

  function hidePlanetHoverTooltip(): void {
    renderPlanetHoverTooltip(planetHoverTooltip, null);
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
      // S-S17-FLICKER-2026-08-09-A: the anchor reads the focused body's slot
      // from asteroidCanonicalPositionsM — the SAME array object that this
      // frame's AsteroidRenderer.update rebases every asteroid against — so
      // canonical[idx] - anchor is IDENTICALLY zero every frame, and the
      // focused mesh pins to centre.
      //
      // Two earlier shapes were both wrong. The original epoch-conditional
      // re-propagated to the current frame epoch while the array stayed at the
      // last worker-accepted epoch; (stale - fresh) was the drift that read as
      // swim under live time. Reading the renderer's cached map instead fixed
      // the steady state but left a one-frame pop per worker result, because
      // that map is written during the PREVIOUS update() call and so lags the
      // array on exactly the frame a result lands.
      //
      // The returned object is a COPY, not the live Vector3:
      // focusTransitionFromAnchor holds an anchor across the 650 ms focus
      // transition, and the worker handler mutates these vectors in place.
      const canonicalIndex = asteroidCanonicalIndexByBodyId.get(bodyId);
      if (canonicalIndex !== undefined) {
        const slot = asteroidCanonicalPositionsM[canonicalIndex];
        if (slot) {
          return { x: slot.x, y: slot.y, z: slot.z };
        }
      }
      return asteroidRenderer.getAsteroidCanonicalPosition(bodyId);
    }
    return getHeliocentricState(bodyId, tdbSeconds).positionM;
  }

  function syncStoreSelectionForFocus(bodyId: FocusTarget): void {
    selectBody(isAsteroidFocusTarget(bodyId) ? bodyId : null);
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
    } else if (nextFocusBody === OUTER_SYSTEM_OVERVIEW) {
      orbitPolar = OVERVIEW_ORBIT_POLAR_RAD;
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

    syncStoreSelectionForFocus(nextFocusBody);
    updateVisibleState(nowMs);
  }

  function updateVisibleState(nowMs = performance.now()): void {
    requestAsteroidPropagation(currentTdbSeconds);
    const anchorPosM = getCurrentOrbitCenter(nowMs);
    if (orbitTween) {
      const sample = sampleCameraOrbitTween(orbitTween, nowMs);
      orbitRadius = sample.state.radiusM;
      orbitPolar = sample.state.polarRad;
      orbitAzimuth = sample.state.azimuthRad;
      if (sample.completed) {
        orbitTween = null;
      }
    }
    const camLocal = sphericalToCartesian(orbitRadius, orbitPolar, orbitAzimuth);
    const viewport = getViewportSizeForMount(mount);

    camera.near = Math.max(1, orbitRadius * 1e-4);
    camera.far = Math.max(orbitRadius * 10, 5e8);
    camera.updateProjectionMatrix();
    camera.position.set(camLocal.x, camLocal.y, camLocal.z);

    const haloUpdates: Array<{
      bodyId: BodyId;
      positionRelScene: THREE.Vector3;
      distanceToCameraM: number;
      radiusM: number;
    }> = [];

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
      atmosphereShells.get(bodyId)?.position.copy(root.position);

      const helio = getHeliocentricState(bodyId, currentTdbSeconds);
      const positionRelScene = new THREE.Vector3(
        helio.positionM.x - anchorPosM.x,
        helio.positionM.y - anchorPosM.y,
        helio.positionM.z - anchorPosM.z,
      );
      const distanceToCameraM = Math.hypot(
        positionRelScene.x - camLocal.x,
        positionRelScene.y - camLocal.y,
        positionRelScene.z - camLocal.z,
      );
      haloUpdates.push({
        bodyId,
        positionRelScene,
        distanceToCameraM,
        radiusM: BODY_CONSTANTS[bodyId].radiusM,
      });
    }

    const sunHelio = getHeliocentricState('sun', currentTdbSeconds);
    const sunRelX = sunHelio.positionM.x - anchorPosM.x;
    const sunRelY = sunHelio.positionM.y - anchorPosM.y;
    const sunRelZ = sunHelio.positionM.z - anchorPosM.z;
    const sunLightPosition = resolveSunLightPosition(
      { x: sunRelX, y: sunRelY, z: sunRelZ },
      BODY_CONSTANTS.sun.radiusM,
    );
    const sunMesh = meshes.get('sun')!;
    sunLight.position.set(sunLightPosition.x, sunLightPosition.y, sunLightPosition.z);
    sunLightTarget.position.set(0, 0, 0);
    sunMesh.position.set(sunRelX, sunRelY, sunRelZ);
    updateSunDirection(sunMesh.position, renderRoots.get('earth')!.position, earthSunDirection);

    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    haloSystem.update(
      haloUpdates,
      camera,
      viewport,
    );
    const activeFocusBody = getActiveFocusBody(nowMs);
    updateFocusedAsteroidLabel(activeFocusBody);
    asteroidRenderer.setFocusedAsteroid(
      isAsteroidFocusTarget(activeFocusBody) ? activeFocusBody : null,
    );
    asteroidRenderer.update({
      anchorPositionM: anchorPosM,
      camera,
      tdbSeconds: currentTdbSeconds,
      viewport,
      canonicalPositionsM: asteroidCanonicalPositionsM,
      partitionRevision: asteroidPropagationRevision,
    });
    updateFocusedAsteroidHud(activeFocusBody);
    renderDateHud(dateHud, currentTdbSeconds);
    dateHud.textContent += `\n${formatUtcDateTimeLabel(currentTdbSeconds)}`;
    const wallClockTdbSeconds = nowTdbSeconds();
    outOfCoverageWarning.style.display =
      wallClockTdbSeconds < timeMin || wallClockTdbSeconds > timeMax ? 'block' : 'none';
    trackingStatus.textContent = tracking ? 'LIVE' : 'SCRUBBED — press Shift+N for now';

    document.title = `Aster V2 — Solar System — ${formatTdbDateLabel(currentTdbSeconds)}`;
  }

  function onResize(): void {
    const viewport = getViewportSizeForMount(mount);
    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(viewport.width, viewport.height);
    labelRenderer.setSize(viewport.width, viewport.height);
    starRenderer.setPixelRatio(renderer.getPixelRatio());
  }

  function scrubTime(deltaSeconds: number): void {
    tracking = false;
    currentTdbSeconds = clamp(currentTdbSeconds + deltaSeconds, timeMin, timeMax);
    updateVisibleState();
  }

  function setCursor(style: string): void {
    renderer.domElement.style.cursor = style;
  }

  // Phase C.1 bridge: UI dispatches requestFocus() into the external store.
  // The scene controller reacts here by reading selectedBody and reusing the
  // existing imperative focus path. Camera tween state remains scene-local.
  const disposeUiFocusBridge = subscribeToFocusRequests(() => {
    const nextBodyId = resolveStoreSelectedAsteroidBodyId(readSelectedBody());
    if (!nextBodyId) {
      return;
    }

    const nowMs = performance.now();
    const activeFocusBody = getActiveFocusBody(nowMs);
    const asteroidBody = getAsteroidBody(nextBodyId);
    const nextOrbitRadius = resolveFocusOrbitRadius(
      activeFocusBody,
      nextBodyId,
      orbitRadius,
      asteroidBody,
    );
    startFocusTransition(nextBodyId, nextOrbitRadius);
  });

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

  function getNearestOpaqueBodyDistance(): number | null {
    const opaqueTargets = [...meshes.values()].filter((mesh) => mesh.visible !== false);
    const bodyIntersection = raycaster.intersectObjects(opaqueTargets, false)[0];
    return bodyIntersection?.distance ?? null;
  }

  function pickAsteroidAt(clientX: number, clientY: number): AsteroidBodyId | null {
    updateRaycasterFromClient(clientX, clientY);
    const occluderDistance = getNearestOpaqueBodyDistance();
    let nearestAsteroidBodyId: AsteroidBodyId | null = null;
    let nearestAsteroidDistance = Number.POSITIVE_INFINITY;

    const intersections = raycaster.intersectObjects(
      asteroidRenderer
        .getRaycastTargets()
        .filter((target) => target.visible !== false || target === asteroidRenderer.points),
      false,
    );
    for (const intersection of intersections) {
      const asteroidBodyId = asteroidRenderer.resolveIntersection(intersection);
      if (asteroidBodyId && intersection.distance < nearestAsteroidDistance) {
        nearestAsteroidBodyId = asteroidBodyId;
        nearestAsteroidDistance = intersection.distance;
      }
    }
    const cellHit = asteroidRenderer.raycastIntersectCellsDetailed(raycaster.ray);
    if (cellHit && cellHit.distance < nearestAsteroidDistance) {
      nearestAsteroidBodyId = cellHit.bodyId;
      nearestAsteroidDistance = cellHit.distance;
    }

    if (!nearestAsteroidBodyId) {
      return null;
    }
    if (occluderDistance !== null && occluderDistance <= nearestAsteroidDistance) {
      return null;
    }
    return nearestAsteroidBodyId;
  }

  const hoverTargets = PLANET_HOVER_TOOLTIP_BODY_IDS
    .map((bodyId) => {
      const mesh = meshes.get(bodyId);
      if (!mesh) {
        return null;
      }
      hoverTargetToBodyId.set(mesh, bodyId);
      return mesh;
    })
    .filter((mesh): mesh is THREE.Mesh => mesh !== null);

  function updatePlanetHoverTooltip(clientX: number, clientY: number, nowMs = performance.now()): void {
    if (nowMs - lastPlanetHoverUpdateMs < PLANET_HOVER_TOOLTIP_THROTTLE_MS) {
      return;
    }
    lastPlanetHoverUpdateMs = nowMs;
    updateRaycasterFromClient(clientX, clientY);
    const intersections = raycaster.intersectObjects(hoverTargets, false);
    const hovered = intersections[0];

    if (!hovered) {
      hidePlanetHoverTooltip();
      return;
    }

    const bodyId = hoverTargetToBodyId.get(hovered.object);
    if (!bodyId) {
      hidePlanetHoverTooltip();
      return;
    }

    const worldPosition = hovered.object.getWorldPosition(new THREE.Vector3());
    const viewport = getViewportSizeForMount(mount);
    const screenPosition = projectWorldPositionToViewport(worldPosition, camera, viewport);
    renderPlanetHoverTooltip(planetHoverTooltip, getBodyLabel(bodyId), screenPosition);
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
    if (isCameraControlsLocked(orbitTween, performance.now())) {
      return;
    }
    pointerActive = true;
    pointerDragged = false;
    pointerDownX = event.clientX;
    pointerDownY = event.clientY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    hasPointerSample = true;
    hidePlanetHoverTooltip();
    setCursor('grabbing');
    renderer.domElement.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (isCameraControlsLocked(orbitTween, performance.now())) {
      return;
    }
    hasPointerSample = true;
    if (!pointerActive) {
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      updatePointerCursor(event.clientX, event.clientY);
      updatePlanetHoverTooltip(event.clientX, event.clientY);
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
    orbitPolar = clamp(
      orbitPolar + dy * ORBIT_SENSITIVITY,
      INTERACTIVE_MIN_ORBIT_POLAR_RAD,
      INTERACTIVE_MAX_ORBIT_POLAR_RAD,
    );
    updateVisibleState();
    setCursor('grabbing');
    hidePlanetHoverTooltip();
  }

  function resetPointerInteraction(pointerId?: number): void {
    pointerActive = false;
    pointerDragged = false;
    if (typeof pointerId === 'number' && renderer.domElement.hasPointerCapture(pointerId)) {
      renderer.domElement.releasePointerCapture(pointerId);
    }
  }

  function onPointerUp(event: PointerEvent): void {
    if (!pointerActive) {
      return;
    }
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
    resetPointerInteraction(event.pointerId);
    updatePointerCursor(event.clientX, event.clientY);
    updatePlanetHoverTooltip(event.clientX, event.clientY);
  }

  function onPointerLeave(event: PointerEvent): void {
    if (pointerActive) {
      resetPointerInteraction(event.pointerId);
    }
    hidePlanetHoverTooltip();
    setCursor('grab');
  }

  function onPointerCancel(event: PointerEvent): void {
    resetPointerInteraction(event.pointerId);
    hidePlanetHoverTooltip();
    setCursor('grab');
  }

  function onWheel(event: WheelEvent): void {
    if (isCameraControlsLocked(orbitTween, performance.now())) {
      return;
    }
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
    // Prevent camera from passing through or into the Sun.
    // Compute Sun's current scene position (world pos minus floating-origin anchor).
    const anchorPosM = getCurrentOrbitCenter(performance.now());
    const sunHelio = getHeliocentricState('sun', currentTdbSeconds);
    const sunScenePosForClamp = {
      x: sunHelio.positionM.x - anchorPosM.x,
      y: sunHelio.positionM.y - anchorPosM.y,
      z: sunHelio.positionM.z - anchorPosM.z,
    };
    orbitRadius = clampOrbitRadiusForSunClearance(
      orbitRadius,
      minOrbitRadius,
      orbitPolar,
      orbitAzimuth,
      sunScenePosForClamp,
    );
    updateVisibleState();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (isEditableKeyboardTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const nowMs = performance.now();
    const cancelCameraTween = () => {
      orbitTween = null;
    };

    if (event.key === 'ArrowRight') {
      cancelCameraTween();
      scrubTime(TIME_SCRUB_STEP_SECONDS);
      return;
    }
    if (event.key === 'ArrowLeft') {
      cancelCameraTween();
      scrubTime(-TIME_SCRUB_STEP_SECONDS);
      return;
    }
    if (event.key === 'Home') {
      cancelCameraTween();
      tracking = false;
      currentTdbSeconds = timeMin;
      updateVisibleState();
      return;
    }
    if (event.key === 'End') {
      cancelCameraTween();
      tracking = false;
      currentTdbSeconds = timeMax;
      updateVisibleState();
      return;
    }
    if (event.key === 'N') {
      tracking = true;
      return;
    }

    const nextFocusBody = FOCUS_KEY_TO_BODY[event.key];
    if (nextFocusBody) {
      cancelCameraTween();
      const activeFocusBody = getActiveFocusBody(nowMs);
      const nextOrbitRadius = resolveFocusOrbitRadius(
        activeFocusBody,
        nextFocusBody,
        orbitRadius,
      );
      startFocusTransition(nextFocusBody, nextOrbitRadius);
      return;
    }

    const preset = getCameraPresetForKey(event.key);
    if (preset) {
      const previousOrbitState = {
        radiusM: orbitRadius,
        polarRad: orbitPolar,
        azimuthRad: orbitAzimuth,
      };
      startFocusTransition(preset.focusBody, preset.orbitState.radiusM);
      orbitTween = {
        from: previousOrbitState,
        to: preset.orbitState,
        startMs: nowMs,
        durationMs: preset.durationMs,
      };
      updateVisibleState(nowMs);
      return;
    }

    if (event.key === '=') {
      cancelCameraTween();
      startFocusTransition(OUTER_SYSTEM_OVERVIEW, OVERVIEW_ORBIT_RADIUS_M);
    }
  }

  function renderFrame(frameTimestampMs: number): void {
    if (disposed) return;
    if (tracking) {
      currentTdbSeconds = clamp(nowTdbSeconds(), timeMin, timeMax);
    }
    updateVisibleState(frameTimestampMs);
    if (!pointerActive && hasPointerSample) {
      updatePlanetHoverTooltip(lastPointerX, lastPointerY, frameTimestampMs);
    }
    renderer.render(scene, camera);
    if (bodyLabelsVisible) {
      labelRenderer.render(scene, camera);
    }
    animationHandle = window.requestAnimationFrame(renderFrame);
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', onPointerLeave);
  renderer.domElement.addEventListener('pointercancel', onPointerCancel);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);

  updateVisibleState();
  animationHandle = window.requestAnimationFrame(renderFrame);

  return () => {
    disposed = true;
    disposeBodyLabelsBridge();
    disposeStarfieldDisplayBridge();
    disposeUiFocusBridge();
    disposePhaseCOverlay();
    resetFrameTransformHooks();
    asteroidWorker.terminate();
    window.cancelAnimationFrame(animationHandle);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
    renderer.domElement.removeEventListener('pointercancel', onPointerCancel);
    renderer.domElement.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    focusedAsteroidHud.remove();
    dateHud.remove();
    timeStatusHud.remove();
    planetHoverTooltip.remove();
    labelRenderer.domElement.remove();
    starRenderer.dispose();
    haloSystem.dispose();
    asteroidRenderer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    for (const mesh of meshes.values()) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    for (const shell of atmosphereShells.values()) {
      shell.geometry.dispose();
      shell.material.dispose();
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
