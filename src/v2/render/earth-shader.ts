import * as THREE from 'three';

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uNormalMap;
  uniform sampler2D uSpecularMap;
  uniform vec3 uSunDir;
  uniform float uCityGain;
  uniform float uSpecularGain;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  vec3 perturbNormal(vec3 worldPosition, vec3 surfaceNormal, vec2 uv) {
    vec3 q0 = dFdx(worldPosition);
    vec3 q1 = dFdy(worldPosition);
    vec2 st0 = dFdx(uv);
    vec2 st1 = dFdy(uv);

    vec3 tangent = normalize(q0 * st1.t - q1 * st0.t);
    vec3 bitangent = normalize(-q0 * st1.s + q1 * st0.s);
    vec3 mapNormal = texture2D(uNormalMap, uv).xyz * 2.0 - 1.0;

    return normalize(mat3(tangent, bitangent, surfaceNormal) * mapNormal);
  }

  void main() {
    vec3 baseNormal = normalize(vWorldNormal);
    vec3 normal = perturbNormal(vWorldPosition, baseNormal, vUv);
    vec3 lightDir = normalize(uSunDir);
    float ndotl = dot(normal, lightDir);

    float dayMask = smoothstep(-0.12, 0.12, ndotl);
    float nightMask = 1.0 - smoothstep(-0.25, 0.05, ndotl);

    vec3 dayColor = texture2D(uDayMap, vUv).rgb;
    vec3 nightColor = texture2D(uNightMap, vUv).rgb * nightMask * uCityGain;

    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 reflectDir = reflect(-lightDir, normal);
    float specularStrength = texture2D(uSpecularMap, vUv).r;
    float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * specularStrength * dayMask * uSpecularGain;

    vec3 color = mix(nightColor, dayColor, dayMask) + vec3(specular);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface EarthMaterialOptions {
  dayMap: THREE.Texture;
  nightMap: THREE.Texture;
  normalMap: THREE.Texture;
  specularMap: THREE.Texture;
  sunDirection: THREE.Vector3;
  cityGain?: number;
  specularGain?: number;
}

export function buildEarthMaterial(options: EarthMaterialOptions): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    extensions: {
      derivatives: true,
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uDayMap: { value: options.dayMap },
      uNightMap: { value: options.nightMap },
      uNormalMap: { value: options.normalMap },
      uSpecularMap: { value: options.specularMap },
      uSunDir: { value: options.sunDirection },
      uCityGain: { value: options.cityGain ?? 0.8 },
      uSpecularGain: { value: options.specularGain ?? 0.25 },
    },
  });
}

export function updateSunDirection(
  sunWorldPosition: THREE.Vector3,
  earthWorldPosition: THREE.Vector3,
  target: THREE.Vector3,
): void {
  target.subVectors(sunWorldPosition, earthWorldPosition).normalize();
}
