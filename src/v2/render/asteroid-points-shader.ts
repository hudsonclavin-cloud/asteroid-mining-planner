import * as THREE from 'three';
import type { AsteroidBody } from '../core/constants/asteroids.js';

export const ASTEROID_POINTS_DEFAULT_OPACITY = 0.08;
export const ASTEROID_POINTS_DEFAULT_SCALE = 0.75;
export const ASTEROID_POINTS_FALLBACK_MAX_SIZE_PX = 64;
export const ASTEROID_POINTS_MIN_SIZE_PX = 2;
export const ASTEROID_MAIN_BELT_COLOR_HEX = 0x86a7d7;
export const ASTEROID_CURATED_NEA_COLOR_HEX = 0xffb173;

const VERTEX_SHADER = `
attribute float aSize;

uniform float uScale;
uniform float uMinPointSize;
uniform float uMaxPointSize;

varying vec3 vColor;

void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float pointSize = clamp(aSize * uScale, uMinPointSize, uMaxPointSize);
  gl_PointSize = pointSize;
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

export function createAsteroidPointsShaderMaterial(
  options: AsteroidPointsShaderOptions = {},
): THREE.ShaderMaterial {
  const opacity = options.opacity ?? ASTEROID_POINTS_DEFAULT_OPACITY;
  const scale = options.scale ?? ASTEROID_POINTS_DEFAULT_SCALE;
  const minPointSize = options.minPointSize ?? ASTEROID_POINTS_MIN_SIZE_PX;
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
      uMinPointSize: { value: minPointSize },
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
