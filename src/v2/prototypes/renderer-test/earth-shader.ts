/**
 * PROTOTYPE — earth-shader.ts
 *
 * Earth-specific ShaderMaterial: day texture + city lights (night) + soft terminator.
 *
 * Research basis:
 *   - Deep Research PDF 1, p.5: Sangil Lee shader pattern (sangillee.com)
 *   - Perplexity "NASA city lights texture" output: SVS ID 30003
 *   - Key finding: the TERMINATOR SOFTENING is what makes it look real,
 *     not the shader architecture. Hard threshold at ndotl == 0 looks synthetic.
 *
 * This shader REPLACES MeshPhongMaterial on Earth only.
 * All other planets use MeshPhongMaterial from materials.ts.
 *
 * Texture requirements (both must be loaded before calling buildEarthMaterial):
 *   u_dayMap:   Solar System Scope 2k_earth_daymap.jpg (CC BY 4.0)
 *   u_nightMap: NASA SVS ID 30003 earth_lights_4800.tif (public domain)
 *               Downscale to 4096×2048 JPEG before use.
 *
 * u_cityGain: brightness multiplier for night lights. 1.0 = as-is. Lower to
 *             keep city lights subtle when viewed from far away.
 */

import * as THREE from 'three';

// WebGL 1 safe (no 3D textures, no while loops, 2 samplers = within 8-unit limit).
// World normal passed as varying so the terminator calculation works in world space,
// not view space — critical for correct sun-direction math.
const VERT_GLSL = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    // Transform normal to world space for sun-direction dot product.
    // Using modelMatrix (not normalMatrix) because we want world-space, not view-space.
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG_GLSL = /* glsl */`
  uniform sampler2D u_dayMap;
  uniform sampler2D u_nightMap;
  uniform vec3  u_sunDir;    // world-space unit vector from planet toward sun
  uniform float u_cityGain;  // night-light brightness multiplier

  varying vec2 vUv;
  varying vec3 vWorldNormal;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(u_sunDir);
    float ndotl = dot(N, L);

    // --- Terminator softening ---
    // smoothstep(-0.12, 0.12, ndotl):
    //   ndotl < -0.12 → dayMask = 0.0 (full night)
    //   ndotl > +0.12 → dayMask = 1.0 (full day)
    //   -0.12 to +0.12 → smooth dawn/dusk band
    // This ~14° soft zone is the key visual improvement over a hard step.
    float dayMask = smoothstep(-0.12, 0.12, ndotl);

    // City lights fade from full brightness at deep night to zero before daylight.
    // The asymmetric range (-0.25 to 0.05) keeps lights on into civil twilight.
    float nightMask = 1.0 - smoothstep(-0.25, 0.05, ndotl);

    vec3 dayColor   = texture2D(u_dayMap,   vUv).rgb;
    vec3 nightColor = texture2D(u_nightMap, vUv).rgb * nightMask * u_cityGain;

    // mix(a, b, t): t=0 → a (night), t=1 → b (day)
    vec3 color = mix(nightColor, dayColor, dayMask);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface EarthMaterialOptions {
  dayMap:    THREE.Texture;
  nightMap:  THREE.Texture;
  sunDir:    THREE.Vector3;   // updated per-frame from scene sunlight position
  cityGain?: number;          // default 0.8
}

/**
 * Returns a ShaderMaterial for Earth with day/night blending.
 * sunDir is a live Vector3 — update it every frame and the shader tracks the sun
 * automatically (uniforms hold a reference to the Vector3 value).
 */
export function buildEarthMaterial(opts: EarthMaterialOptions): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader:   VERT_GLSL,
    fragmentShader: FRAG_GLSL,
    uniforms: {
      u_dayMap:   { value: opts.dayMap },
      u_nightMap: { value: opts.nightMap },
      u_sunDir:   { value: opts.sunDir },
      u_cityGain: { value: opts.cityGain ?? 0.8 },
    },
  });
}

/**
 * Convenience: update the sun direction uniform each frame.
 * sunWorldPos: the sun's world position.
 * earthWorldPos: Earth's world position.
 * target: the uniform's Vector3 value (same reference passed to buildEarthMaterial).
 */
export function updateSunDir(
  sunWorldPos: THREE.Vector3,
  earthWorldPos: THREE.Vector3,
  target: THREE.Vector3,
): void {
  target.subVectors(sunWorldPos, earthWorldPos).normalize();
}
