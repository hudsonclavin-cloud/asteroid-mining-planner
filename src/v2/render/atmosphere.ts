import * as THREE from 'three';

export const ATMOSPHERE_BODY_IDS = [
  'earth',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
] as const;

export type AtmosphereBodyId = (typeof ATMOSPHERE_BODY_IDS)[number];

export interface AtmosphereParams {
  readonly color: string;
  readonly intensity: number;
  readonly scale: number;
  readonly power: number;
  readonly oblateYScale?: number;
}

export const ATMOSPHERE_PARAMS: Record<AtmosphereBodyId, AtmosphereParams> = {
  earth: { color: '#4488ff', intensity: 0.8, scale: 1.025, power: 3.5 },
  venus: { color: '#e0d08a', intensity: 1.0, scale: 1.04, power: 2.5 },
  mars: { color: '#7ba6d8', intensity: 0.25, scale: 1.015, power: 5.0, oblateYScale: 0.9939 },
  jupiter: { color: '#e0b08a', intensity: 0.35, scale: 1.02, power: 2.0, oblateYScale: 0.934 },
  saturn: { color: '#e8d7a8', intensity: 0.3, scale: 1.02, power: 2.0, oblateYScale: 0.9021 },
  uranus: { color: '#b8e3e6', intensity: 0.5, scale: 1.02, power: 2.5 },
  neptune: { color: '#4d7dcc', intensity: 0.5, scale: 1.02, power: 2.5 },
};

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = 1.0 - clamp(dot(vNormal, vViewDir), 0.0, 1.0);
    fresnel = pow(fresnel, uPower);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

export function createAtmosphereMesh(
  planetMesh: THREE.Mesh<THREE.SphereGeometry, THREE.Material | THREE.Material[]>,
  params: AtmosphereParams,
  renderOrderIndex: number,
): THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial> {
  const radiusM = planetMesh.geometry.parameters.radius * params.scale;
  const geometry = new THREE.SphereGeometry(radiusM, 64, 32);
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uColor: { value: new THREE.Color(params.color) },
      uIntensity: { value: params.intensity },
      uPower: { value: params.power },
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(planetMesh.position);
  mesh.renderOrder = 1000 + renderOrderIndex;

  if (params.oblateYScale !== undefined) {
    mesh.scale.set(1, params.oblateYScale, 1);
  }

  return mesh;
}
