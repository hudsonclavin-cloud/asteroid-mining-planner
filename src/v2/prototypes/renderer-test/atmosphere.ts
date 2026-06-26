/**
 * PROTOTYPE — atmosphere.ts
 *
 * Fresnel glow shell for planet atmospheres.
 * Research basis: Deep Research PDF 1 p.1-5, Perplexity renderOrder output.
 *
 * Decision: Fresnel shell for the fleet (7 atmosphered bodies).
 * Earth gets this PLUS the day/night shader in earth-shader.ts.
 * Moon, Mercury, airless moons get nothing.
 */

import * as THREE from 'three';

export interface AtmosphereParams {
  color: string;        // limb glow hex from spacecraft imagery
  intensity: number;    // peak opacity at the rim (0–1)
  scale: number;        // multiplier on planet radius, e.g. 1.025
  power: number;        // Fresnel exponent: higher = thinner glow ring
  oblateYScale?: number; // match planet oblateness (Jupiter/Saturn/Mars)
}

/**
 * Per-planet atmosphere params.
 * Colors: from Perplexity "atmosphere colors" output, spacecraft imagery basis.
 * Power values: 3.5 medium (Earth/Venus), 5.0 thin (Mars), 2.0 wide (gas giants).
 *
 * Research finding: Mars glow is COOL BLUE not red. The red is the surface.
 * The upper-atmosphere UV nightglow is blue-green (#7ba6d8).
 */
export const ATMOSPHERE_PARAMS: Record<string, AtmosphereParams> = {
  earth:   { color: '#4488ff', intensity: 0.8,  scale: 1.025, power: 3.5 },
  venus:   { color: '#e0d08a', intensity: 1.0,  scale: 1.04,  power: 2.5 },
  mars:    { color: '#7ba6d8', intensity: 0.25, scale: 1.015, power: 5.0, oblateYScale: 0.9939 },
  jupiter: { color: '#e0b08a', intensity: 0.35, scale: 1.02,  power: 2.0, oblateYScale: 0.934  },
  saturn:  { color: '#e8d7a8', intensity: 0.30, scale: 1.02,  power: 2.0, oblateYScale: 0.9021 },
  uranus:  { color: '#b8e3e6', intensity: 0.50, scale: 1.02,  power: 2.5 },
  neptune: { color: '#4d7dcc', intensity: 0.50, scale: 1.02,  power: 2.5 },
};

// WebGL 1 safe: no while/do-while, no array indexing in loops.
// Uniform count: 3 (color, intensity, power) — well within WebGL 1's 64-fragment limit.
const VERT_GLSL = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAG_GLSL = /* glsl */`
  uniform vec3  uColor;
  uniform float uIntensity;
  uniform float uPower;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // Fresnel factor: 1 at the rim, 0 at face-on.
    // clamp prevents NaN if dot > 1 due to fp precision.
    float fresnel = 1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0);
    fresnel = pow(fresnel, uPower);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

/**
 * Creates an atmosphere mesh as a SIBLING (not child) of the planet mesh.
 * Must be co-positioned with the planet and updated in sync every frame.
 *
 * renderOrderIndex: unique index per planet, starting at 0.
 * Result renderOrder = 1000 + renderOrderIndex, above all opaque planets (0).
 *
 * Research: explicit renderOrder ladder prevents sort-order flipping with
 * ~10 transparent additive shells when the camera orbits (Perplexity r128 output).
 */
export function createAtmosphereMesh(
  planetMesh: THREE.Mesh,
  params: AtmosphereParams,
  renderOrderIndex: number,
): THREE.Mesh {
  const srcGeo = planetMesh.geometry as THREE.SphereGeometry;
  const r = srcGeo.parameters.radius * params.scale;

  const geo = new THREE.SphereGeometry(r, 64, 32);
  const mat = new THREE.ShaderMaterial({
    vertexShader:   VERT_GLSL,
    fragmentShader: FRAG_GLSL,
    uniforms: {
      uColor:     { value: new THREE.Color(params.color) },
      uIntensity: { value: params.intensity },
      uPower:     { value: params.power },
    },
    transparent: true,
    depthWrite:  false,
    depthTest:   true,   // still occludes against opaque planets
    blending:    THREE.AdditiveBlending,
    side:        THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(planetMesh.position);
  mesh.renderOrder = 1000 + renderOrderIndex;

  if (params.oblateYScale !== undefined) {
    mesh.scale.set(1, params.oblateYScale, 1);
  }

  return mesh;
}
