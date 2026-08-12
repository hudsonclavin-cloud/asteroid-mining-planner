import * as THREE from 'three';
import type { AsteroidBody } from '../core/constants/asteroids.js';
import type { LambertScreenResult } from '../boundary/lambert-screen-cache.js';
import { getScreeningColor } from './asteroid-screening-color.js';

// Phase E round 2: V2 renders asteroid positions at honest-scale camera-relative
// scene units, so point-size attenuation must use camera-relative depth
// directly. At outer-system overview, a main-belt body sits around 1.37e12 m
// from the camera; this scale targets a 4-8 px point sprite for large
// main-belt asteroids so the soft-glow fragment shader can actually register.
// S-S17-FRONTB-BATCH-2026-08-11-A (NEA legibility — SIZE/HUE, not brightness):
//
// Two brightness retunes produced no perceived change because brightness was
// never the binding variable. Measured against star-renderer.ts, the points
// lost on SIZE, in two compounding ways:
//
//  1. PIXEL-RATIO ASYMMETRY. Stars do `gl_PointSize = px * uPixelRatio`
//     (star-renderer.ts:31); this shader had no pixel-ratio term at all. On a
//     DPR-2 display every star was drawn at 2x its nominal size while every
//     NEA point was drawn at 1x — a free 2x linear / 4x area advantage to the
//     decorative layer. uPixelRatio below closes that gap, so both shaders now
//     express sizes in the same CSS-pixel units.
//  2. NO FAR-FIELD FLOOR. The old lower clamp of 1.0 let far-field points
//     collapse to a single pixel, below the ~2-3 device px of a typical
//     Tycho-2 star. MIN_SIZE_PX puts a floor under them instead.
//
// The near-field bloom (large soft haze halos at deep zoom) had a separate
// cause: the FALLBACK max was never the operative ceiling — runtime overrides
// uMaxPointSize from the GL ALIASED_POINT_SIZE_RANGE max, typically 255+
// (runtime.ts:1074-1077). A body that is physically sub-pixel (points mode is
// only used below 2 px apparent diameter, asteroid-renderer.ts:28) was being
// drawn as a 255 px sprite. MAX_SIZE_PX is the design ceiling the runtime now
// clamps that driver value against.
//
// Brightness knobs are therefore restored to their pre-toning originals —
// opacity 0.36 -> 0.4, scale 1.4e12 -> 1.5e12, frag mix 0.75/0.25 -> 0.7/0.3
// (the wider halo helps a small sprite read as a soft dot rather than an
// aliased square). Nothing about the brightness axis was ever the defect.
export const ASTEROID_POINTS_DEFAULT_OPACITY = 0.4;
export const ASTEROID_POINTS_DEFAULT_SCALE = 1.5e12;
/** Far-field floor, CSS px (x devicePixelRatio at draw). Above a typical
 * star's ~1.0-1.5 CSS px so the data layer stays the larger mark. */
export const ASTEROID_POINTS_MIN_SIZE_PX = 2.5;
/** Design ceiling, CSS px. Points mode is only used below 2 px apparent
 * diameter, so a sprite never legitimately needs to be large; this exists to
 * stop sub-pixel bodies blooming into haze. */
export const ASTEROID_POINTS_MAX_SIZE_PX = 12;
export const ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX = 64;
export const ASTEROID_MAIN_BELT_COLOR_HEX = 0x86a7d7;
export const ASTEROID_CURATED_NEA_COLOR_HEX = 0xffb173;

const VERTEX_SHADER = `
attribute float aSize;

uniform float uScale;
uniform float uMinPointSize;
uniform float uMaxPointSize;
uniform float uPixelRatio;

varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(1e-6, -mvPosition.z);
  float pointSize = aSize * uScale / depth;
  // Clamp in CSS px, then convert to device px — same units and same order as
  // star-renderer.ts, so the two layers are directly comparable on any display.
  gl_PointSize = clamp(pointSize, uMinPointSize, uMaxPointSize) * uPixelRatio;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = `
uniform float uOpacity;

varying vec3 vColor;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float radius = length(centered);

  if (radius > 0.5) {
    discard;
  }

  float core = 1.0 - smoothstep(0.0, 0.22, radius);
  float halo = 1.0 - smoothstep(0.08, 0.5, radius);
  // Restored to the pre-toning original 0.7 / 0.3: the brightness axis was
  // never the defect (see header), and the wider halo helps a small sprite
  // read as a soft dot rather than an aliased square.
  float alpha = (0.7 * core + 0.3 * halo) * uOpacity;
  gl_FragColor = vec4(vColor, alpha);
}
`;

export interface PointSizeRangeReader {
  readonly ALIASED_POINT_SIZE_RANGE?: number | string;
  getParameter(parameter: number | string): unknown;
}

export interface AsteroidPointsShaderOptions {
  readonly opacity?: number;
  readonly scale?: number;
  readonly minPointSize?: number;
  readonly maxPointSize?: number;
  readonly pixelRatio?: number;
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function resolveAliasedPointSizeRange(gl?: PointSizeRangeReader | null): [number, number] {
  if (!gl) {
    return [1, ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX];
  }

  const parameter =
    typeof gl.ALIASED_POINT_SIZE_RANGE === 'number' ||
    typeof gl.ALIASED_POINT_SIZE_RANGE === 'string'
      ? gl.ALIASED_POINT_SIZE_RANGE
      : 'ALIASED_POINT_SIZE_RANGE';
  const raw = gl.getParameter(parameter);
  if (!Array.isArray(raw) && !(raw instanceof Float32Array)) {
    return [1, ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX];
  }

  const min = Number(raw[0]);
  const max = Number(raw[1]);
  if (!isFinitePositive(min) || !isFinitePositive(max) || max < min) {
    return [1, ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX];
  }

  return [min, max];
}

export function getAsteroidPointColor(body: Pick<AsteroidBody, 'isCuratedNea'>): THREE.Color {
  return new THREE.Color(
    body.isCuratedNea ? ASTEROID_CURATED_NEA_COLOR_HEX : ASTEROID_MAIN_BELT_COLOR_HEX,
  );
}

export function getAsteroidPointColorWithScreening(
  body: Pick<AsteroidBody, 'isCuratedNea'>,
  screen: LambertScreenResult | null,
): THREE.Color {
  if (screen !== null) {
    return getScreeningColor(screen);
  }
  return getAsteroidPointColor(body);
}

export function createAsteroidPointsShaderMaterial(
  options: AsteroidPointsShaderOptions = {},
): THREE.ShaderMaterial {
  const opacity = options.opacity ?? ASTEROID_POINTS_DEFAULT_OPACITY;
  const scale = options.scale ?? ASTEROID_POINTS_DEFAULT_SCALE;
  const minPointSize = options.minPointSize ?? ASTEROID_POINTS_MIN_SIZE_PX;
  const maxPointSize = options.maxPointSize ?? ASTEROID_POINTS_MAX_SIZE_PX;
  const pixelRatio = options.pixelRatio ?? 1;

  return new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    vertexColors: true,
    uniforms: {
      uOpacity: { value: opacity },
      uScale: { value: scale },
      uMinPointSize: { value: minPointSize },
      uMaxPointSize: { value: maxPointSize },
      uPixelRatio: { value: pixelRatio },
    },
  });
}

/** Mirrors StarRenderer.setPixelRatio so both layers track the display
 * together across monitor moves and resizes. */
export function setAsteroidPointsPixelRatio(
  material: THREE.ShaderMaterial,
  pixelRatio: number,
): void {
  if (!isFinitePositive(pixelRatio)) {
    throw new RangeError('pixelRatio must be a finite positive number');
  }
  const uniform = material.uniforms.uPixelRatio;
  if (!uniform) {
    throw new Error('Asteroid points shader missing uPixelRatio uniform');
  }
  uniform.value = pixelRatio;
}

export function setAsteroidPointsMaxSize(
  material: THREE.ShaderMaterial,
  maxPointSize: number,
): void {
  if (!isFinitePositive(maxPointSize)) {
    throw new RangeError('maxPointSize must be a finite positive number');
  }
  const uniform = material.uniforms.uMaxPointSize;
  if (!uniform) {
    throw new Error('Asteroid points shader missing uMaxPointSize uniform');
  }
  uniform.value = maxPointSize;
}
