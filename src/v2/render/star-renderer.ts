import * as THREE from 'three';
import type { StarCatalog } from '../boundary/star-catalog-tycho2.js';

export const STAR_RENDERER_MAGIC_DISTANCE = 1e9;
export const STAR_RENDERER_BASE_POINT_SIZE_PX = 3;
export const STAR_RENDERER_MAX_POINT_SIZE_PX = 8;

const STAR_VERTEX_SHADER = `
attribute float magnitude;
attribute vec3 color;

uniform float uPixelRatio;
uniform float uBasePointSizePx;
uniform float uMaxPointSizePx;
uniform float uDistanceScale;

varying vec3 vColor;

void main() {
  vColor = color;

  mat3 cameraRotation = mat3(viewMatrix);
  vec3 rotatedDirection = cameraRotation * normalize(position);
  vec4 clipPosition = projectionMatrix * vec4(rotatedDirection * uDistanceScale, 1.0);
  gl_Position = vec4(clipPosition.xy, clipPosition.w, clipPosition.w);

  // Stars are rendered at infinity, so point size must stay in screen pixels and
  // never depend on camera distance or view-space depth.
  float pointSizePx = clamp(uBasePointSizePx + (2.5 - magnitude) * 0.35, 1.0, uMaxPointSizePx);
  gl_PointSize = pointSizePx * uPixelRatio;
}
`;

const STAR_FRAGMENT_SHADER = `
varying vec3 vColor;

void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  if (dist > 0.5) {
    discard;
  }

  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  gl_FragColor = vec4(vColor, alpha);
}
`;

export class StarRenderer {
  readonly geometry: THREE.BufferGeometry;
  readonly material: THREE.ShaderMaterial;
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  constructor(catalog: StarCatalog, pixelRatio = 1) {
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(catalog.positions, 3));
    this.geometry.setAttribute('magnitude', new THREE.BufferAttribute(catalog.magnitudes, 1));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(catalog.colors, 3));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: pixelRatio },
        uBasePointSizePx: { value: STAR_RENDERER_BASE_POINT_SIZE_PX },
        uMaxPointSizePx: { value: STAR_RENDERER_MAX_POINT_SIZE_PX },
        uDistanceScale: { value: STAR_RENDERER_MAGIC_DISTANCE },
      },
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'star-catalog-tycho2';
    this.points.frustumCulled = false;
    this.points.renderOrder = -1000;
  }

  getMesh(): THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial> {
    return this.points;
  }

  setPixelRatio(pixelRatio: number): void {
    this.material.uniforms.uPixelRatio.value = pixelRatio;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
