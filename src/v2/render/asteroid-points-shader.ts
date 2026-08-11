import * as THREE from 'three';
import type { AsteroidBody } from '../core/constants/asteroids.js';
import type { LambertScreenResult } from '../boundary/lambert-screen-cache.js';
import { getScreeningColor } from './asteroid-screening-color.js';

// Phase E round 2: V2 renders asteroid positions at honest-scale camera-relative
// scene units, so point-size attenuation must use camera-relative depth
// directly. At outer-system overview, a main-belt body sits around 1.37e12 m
// from the camera; this scale targets a 4-8 px point sprite for large
// main-belt asteroids so the soft-glow fragment shader can actually register.
// S-S17-FRONTB-BATCH-2026-08-11-A (B0 NEA point-haze toning, RETUNED):
// the goal is points that read as DISTINCT DATA at default zoom — visible
// without squinting, but not a bloom-like haze bleeding onto planets and
// labels. The first pass cut opacity, point scale, and the fragment core/halo
// mix at once; the three reductions stacked MULTIPLICATIVELY and overshot into
// near-invisibility at default zoom (visual gate letter (b), failed). These
// are the midpoint values between the original and that overshoot:
//   opacity     0.4     -> 0.3     -> 0.36   (here)
//   point scale 1.5e12  -> 1.25e12 -> 1.4e12 (here)
//   frag mix    0.7/0.3 -> 0.8/0.2 -> 0.75/0.25 (see FRAGMENT_SHADER)
// Expected to need one more human look before it settles.
export const ASTEROID_POINTS_DEFAULT_OPACITY = 0.36;
export const ASTEROID_POINTS_DEFAULT_SCALE = 1.4e12;
export const ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX = 64;
export const ASTEROID_MAIN_BELT_COLOR_HEX = 0x86a7d7;
export const ASTEROID_CURATED_NEA_COLOR_HEX = 0xffb173;

const VERTEX_SHADER = `
attribute float aSize;

uniform float uScale;
uniform float uMaxPointSize;

varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(1e-6, -mvPosition.z);
  float pointSize = aSize * uScale / depth;
  gl_PointSize = clamp(pointSize, 1.0, uMaxPointSize);
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
  // S-S17-FRONTB-BATCH-2026-08-11-A (B0, RETUNED): core 0.7 -> 0.8 -> 0.75,
  // halo 0.3 -> 0.2 -> 0.25. Midpoint after the first pass overshot; some
  // glow skirt is what makes a sub-pixel point readable at default zoom.
  // Same discard radius throughout.
  float alpha = (0.75 * core + 0.25 * halo) * uOpacity;
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
  readonly maxPointSize?: number;
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
  const maxPointSize = options.maxPointSize ?? ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX;

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
      uMaxPointSize: { value: maxPointSize },
    },
  });
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
