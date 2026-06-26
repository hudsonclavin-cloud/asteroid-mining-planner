/**
 * PROTOTYPE — scene.ts  (v2)
 *
 * Full test scene: all seven atmosphered planets + Saturn rings.
 * Keyboard camera presets let you jump to each body.
 *
 * Bodies and tiers:
 *   Earth   — day/night ShaderMaterial + cloud shell + Fresnel atmo
 *   Venus   — textured Phong + thick atmosphere shell
 *   Mars    — textured Phong + thin cool-blue atmosphere
 *   Jupiter — textured Phong + oblate (0.934) + wide warm atmosphere
 *   Saturn  — textured Phong + oblate (0.9021) + rings + atmosphere
 *   Uranus  — textured Phong + aqua atmosphere
 *   Neptune — textured Phong + deep blue atmosphere
 *
 * What each planet tests:
 *   Earth:   terminator smoothstep, night-lights blend, cloud UV scroll
 *   Mars:    thin-atmo power=5.0, correct cool glow (not red), oblate Y-scale
 *   Jupiter: oblate Y-scale on both mesh and atmosphere shell
 *   Saturn:  RingGeometry + ring texture, oblate + ring tilt at 26.7°
 *   Uranus:  pale aqua glow (research: Voyager rebalancing)
 *   Neptune: deeper blue than Uranus (methane absorption)
 *
 * Camera controls:
 *   Drag / scroll: OrbitControls
 *   Keys 1–7: jump to Earth / Venus / Mars / Jupiter / Saturn / Uranus / Neptune
 *
 * NOT committed. Prototype only — do not import from production runtime.ts.
 */

import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { ATMOSPHERE_PARAMS, createAtmosphereMesh }   from './atmosphere';
import { buildEarthMaterial, updateSunDir }           from './earth-shader';
import { makePlanetMaterial, applyTexture, loadTexture, TEXTURE_FILES, EARTH_NIGHT_FILE } from './materials';
import { addSaturnRings }                             from './rings';

// ---------------------------------------------------------------------------
// Scene units: 1 unit = 1 Earth radius.
// Laid out on the X axis so each planet is easy to orbit individually.
// ---------------------------------------------------------------------------
const R = {
  earth:   1.0,
  venus:   0.95,
  mars:    0.532,
  jupiter: 11.21,
  saturn:  9.45,
  uranus:  4.01,
  neptune: 3.88,
};

// Planet positions spread enough that their atmospheres don't overlap at camera zoom.
const POS = {
  sun:     new THREE.Vector3( 400,  0,  0),
  earth:   new THREE.Vector3(   0,  0,  0),
  venus:   new THREE.Vector3( -15,  0,  0),
  mars:    new THREE.Vector3(  15,  0,  0),
  jupiter: new THREE.Vector3( -70,  0,  0),
  saturn:  new THREE.Vector3(  70,  0,  0),
  uranus:  new THREE.Vector3(-140,  0,  0),
  neptune: new THREE.Vector3( 140,  0,  0),
};

// Camera presets: position and target for each planet
const CAM_PRESETS: Record<string, { eye: THREE.Vector3; target: THREE.Vector3 }> = {
  earth:   { eye: new THREE.Vector3(   0, 1.5,  5),   target: POS.earth },
  venus:   { eye: new THREE.Vector3( -15, 1.5,  5),   target: POS.venus },
  mars:    { eye: new THREE.Vector3(  15, 0.8,  3),   target: POS.mars },
  jupiter: { eye: new THREE.Vector3( -70, 15,   40),  target: POS.jupiter },
  saturn:  { eye: new THREE.Vector3(  70, 15,   40),  target: POS.saturn },
  uranus:  { eye: new THREE.Vector3(-140, 6,    15),  target: POS.uranus },
  neptune: { eye: new THREE.Vector3( 140, 6,    15),  target: POS.neptune },
};

// ---------------------------------------------------------------------------
// Lighting — Research values from RESEARCH.md
// ---------------------------------------------------------------------------
function buildLighting(scene: THREE.Scene): THREE.DirectionalLight {
  const ambient = new THREE.AmbientLight(0x060810, 0.08);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfffde8, 4.0);
  sun.position.copy(POS.sun);
  sun.target.position.set(0, 0, 0);
  scene.add(sun);
  scene.add(sun.target);
  return sun;
}

// ---------------------------------------------------------------------------
// Helper: build a planet mesh, add texture, add atmosphere shell.
// Returns { mesh, atmoMesh } so the scene can do per-frame updates.
// ---------------------------------------------------------------------------
async function addPlanet(opts: {
  scene:       THREE.Scene;
  loader:      THREE.TextureLoader;
  base:        string;
  bodyId:      string;
  radius:      number;
  vizColor:    number;
  pos:         THREE.Vector3;
  oblateY?:    number;        // Y-scale for oblateness
  atmoIndex:   number;        // renderOrder = 1000 + atmoIndex
}): Promise<{ mesh: THREE.Mesh; atmo: THREE.Mesh | null }> {
  const geo  = new THREE.SphereGeometry(opts.radius, 64, 32);
  const mat  = makePlanetMaterial(opts.bodyId, opts.vizColor);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(opts.pos);
  if (opts.oblateY) mesh.scale.set(1, opts.oblateY, 1);
  opts.scene.add(mesh);

  const file = TEXTURE_FILES[opts.bodyId];
  if (file) {
    loadTexture(`${opts.base}${file}`, opts.loader)
      .then((tex) => applyTexture(mat, tex))
      .catch(() => console.warn(`[renderer-test] ${opts.bodyId} texture failed`));
  }

  let atmo: THREE.Mesh | null = null;
  const ap = ATMOSPHERE_PARAMS[opts.bodyId];
  if (ap) {
    atmo = createAtmosphereMesh(mesh, ap, opts.atmoIndex);
    opts.scene.add(atmo);
  }

  return { mesh, atmo };
}

// ---------------------------------------------------------------------------
// Earth — special case: day/night ShaderMaterial + cloud shell
// ---------------------------------------------------------------------------
async function addEarth(
  scene:  THREE.Scene,
  loader: THREE.TextureLoader,
  base:   string,
  sunDir: THREE.Vector3,
): Promise<{ mesh: THREE.Mesh; cloud: THREE.Mesh | null; atmo: THREE.Mesh }> {
  const geo   = new THREE.SphereGeometry(R.earth, 64, 32);
  const phong = makePlanetMaterial('earth', 0x2255AA);

  // Typed as THREE.Material so we can swap to ShaderMaterial
  const mesh  = new THREE.Mesh<THREE.SphereGeometry, THREE.Material>(geo, phong);
  mesh.position.copy(POS.earth);
  scene.add(mesh);

  // Load day texture first — visible immediately while night map loads
  loadTexture(`${base}${TEXTURE_FILES.earth}`, loader).then((dayTex) => {
    applyTexture(phong, dayTex);

    // Night map — real NASA SVS ID 30003 only. No fabricated fallback.
    // Earth stays day-texture-only until the real file is present.
    loadTexture(`${base}${EARTH_NIGHT_FILE}`, loader)
      .then((nightTex) => {
        console.info('[renderer-test] Earth: NASA city lights loaded ✓ — day/night shader active');
        mesh.material = buildEarthMaterial({ dayMap: dayTex, nightMap: nightTex, sunDir });
      })
      .catch(() => {
        // Day-only Phong stays active. Terminator visible via lighting alone.
        console.group('[renderer-test] Earth night map missing');
        console.info('To enable the day/night terminator shader:');
        console.info('  1. Download: https://svs.gsfc.nasa.gov/30003/');
        console.info('     File: earth_lights_4800.tif (public domain, NASA)');
        console.info('  2. Resize to 4096×2048 JPEG');
        console.info('  3. Save as: textures/2k_earth_nightmap.jpg');
        console.info('  4. Reload — shader activates automatically');
        console.info('Earth is showing day texture + lighting terminator (no city lights).');
        console.groupEnd();
      });
  }).catch(() => console.warn('[renderer-test] Earth day texture failed'));

  // Cloud shell
  let cloud: THREE.Mesh | null = null;
  try {
    const cloudTex = await loadTexture(`${base}2k_earth_clouds.jpg`, loader);
    (cloudTex as any).encoding = (THREE as any).sRGBEncoding ?? 3001;
    const cloudGeo = new THREE.SphereGeometry(R.earth * 1.005, 64, 32);
    const cloudMat = new THREE.MeshPhongMaterial({
      map:         cloudTex,
      alphaMap:    cloudTex,
      transparent: true,
      depthWrite:  false,
      opacity:     0.85,
      shininess:   10,
      specular:    new THREE.Color(0x111111),
    });
    cloud = new THREE.Mesh(cloudGeo, cloudMat);
    cloud.position.copy(POS.earth);
    cloud.renderOrder = 500;
    scene.add(cloud);
  } catch {
    console.warn('[renderer-test] Cloud texture missing — cloud shell skipped');
  }

  const atmo = createAtmosphereMesh(mesh as THREE.Mesh, ATMOSPHERE_PARAMS.earth, 0);
  scene.add(atmo);

  return { mesh: mesh as THREE.Mesh, cloud, atmo };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export async function buildTestScene(
  renderer: THREE.WebGLRenderer,
  scene:    THREE.Scene,
  camera:   THREE.PerspectiveCamera,
): Promise<() => void> {
  const base   = (import.meta as any).env?.BASE_URL as string ?? '/asteroid-mining-planner/';
  const loader = new THREE.TextureLoader();

  buildLighting(scene);

  // Starfield background
  {
    const starGeo = new THREE.BufferGeometry();
    const count   = 6000;
    const pos     = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 2000;
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 })));
  }

  // Sun sphere (just for visual reference, not a light source mesh)
  {
    const g = new THREE.SphereGeometry(8, 16, 16);
    const m = new THREE.MeshBasicMaterial({ color: 0xFFF5E0 });
    const s = new THREE.Mesh(g, m);
    s.position.copy(POS.sun);
    scene.add(s);
    // Very faint sun glow
    const glowGeo = new THREE.SphereGeometry(10, 16, 16);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color('#fffde8') } },
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float f=1.-clamp(dot(vN,vV),0.,1.); gl_FragColor=vec4(uColor,pow(f,1.5)*0.6); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(POS.sun);
    glow.renderOrder = 999;
    scene.add(glow);
  }

  // Live sun direction for Earth shader (updated per-frame)
  const sunDir = new THREE.Vector3();
  updateSunDir(POS.sun, POS.earth, sunDir);

  // --- Earth ---
  const earth = await addEarth(scene, loader, base, sunDir);

  // --- Venus ---
  const venus = await addPlanet({
    scene, loader, base, bodyId: 'venus', radius: R.venus,
    vizColor: 0xE8C98A, pos: POS.venus, atmoIndex: 1,
  });

  // --- Mars ---
  const mars = await addPlanet({
    scene, loader, base, bodyId: 'mars', radius: R.mars,
    vizColor: 0xC1440E, pos: POS.mars, oblateY: 0.9939, atmoIndex: 2,
  });

  // --- Jupiter ---
  const jupiter = await addPlanet({
    scene, loader, base, bodyId: 'jupiter', radius: R.jupiter,
    vizColor: 0xC4A878, pos: POS.jupiter, oblateY: 0.934, atmoIndex: 3,
  });

  // --- Saturn ---
  const saturnGeo  = new THREE.SphereGeometry(R.saturn, 64, 32);
  const saturnMat  = makePlanetMaterial('saturn', 0xD8C3A5);
  const saturnMesh = new THREE.Mesh(saturnGeo, saturnMat);
  saturnMesh.position.copy(POS.saturn);
  saturnMesh.scale.set(1, 0.9021, 1);
  scene.add(saturnMesh);
  loadTexture(`${base}${TEXTURE_FILES.saturn}`, loader)
    .then((tex) => applyTexture(saturnMat, tex))
    .catch(() => console.warn('[renderer-test] Saturn texture failed'));
  const saturnAtmo = createAtmosphereMesh(saturnMesh, ATMOSPHERE_PARAMS.saturn, 4);
  scene.add(saturnAtmo);
  await addSaturnRings(scene, saturnMesh, loader, base);

  // --- Uranus ---
  const uranus = await addPlanet({
    scene, loader, base, bodyId: 'uranus', radius: R.uranus,
    vizColor: 0xA8D8E8, pos: POS.uranus, atmoIndex: 5,
  });
  // Uranus is tilted ~98° — rolls on its side
  uranus.mesh.rotation.z = THREE.MathUtils.degToRad(98);

  // --- Neptune ---
  const neptune = await addPlanet({
    scene, loader, base, bodyId: 'neptune', radius: R.neptune,
    vizColor: 0x3F5FB5, pos: POS.neptune, atmoIndex: 6,
  });

  // ---------------------------------------------------------------------------
  // OrbitControls
  // ---------------------------------------------------------------------------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.copy(POS.earth);
  camera.position.copy(CAM_PRESETS.earth.eye);
  controls.update();

  // Smooth camera transition state
  let camTarget:    THREE.Vector3 | null = null;
  let camEye:       THREE.Vector3 | null = null;
  let camLerpAlpha  = 1;

  function jumpTo(preset: keyof typeof CAM_PRESETS) {
    const p = CAM_PRESETS[preset];
    camTarget   = p.target.clone();
    camEye      = p.eye.clone();
    camLerpAlpha = 0;
  }

  const keyMap: Record<string, keyof typeof CAM_PRESETS> = {
    '1': 'earth', '2': 'venus', '3': 'mars',
    '4': 'jupiter', '5': 'saturn', '6': 'uranus', '7': 'neptune',
  };
  const onKey = (e: KeyboardEvent) => { if (keyMap[e.key]) jumpTo(keyMap[e.key]); };
  window.addEventListener('keydown', onKey);

  // ---------------------------------------------------------------------------
  // Sun orbit (slow) — rotates around all planets to show terminator on each body
  // ---------------------------------------------------------------------------
  let t = 0;
  const sunOrbitRadius = 400;
  const sunMeshRef = scene.children.find(
    (c) => c instanceof THREE.Mesh &&
      (c as THREE.Mesh).position.distanceTo(POS.sun) < 5
  ) as THREE.Mesh | undefined;

  // ---------------------------------------------------------------------------
  // Animate
  // ---------------------------------------------------------------------------
  let raf = 0;

  function animate() {
    raf = requestAnimationFrame(animate);
    t += 0.001;

    // Rotate sun around Y axis so we can watch terminators shift
    const sunX = Math.cos(t * 0.15) * sunOrbitRadius;
    const sunZ = Math.sin(t * 0.15) * sunOrbitRadius;
    const sunPos = new THREE.Vector3(sunX, 0, sunZ);

    // Update DirectionalLight position
    const dirLight = scene.children.find(
      (c) => c instanceof THREE.DirectionalLight
    ) as THREE.DirectionalLight | undefined;
    if (dirLight) dirLight.position.set(sunX, 0, sunZ);

    // Update Earth sunDir uniform
    updateSunDir(sunPos, POS.earth, sunDir);

    // Visual sun sphere
    if (sunMeshRef) sunMeshRef.position.set(sunX, 0, sunZ);

    // Planet rotations (approximate real-world periods, normalized)
    earth.mesh.rotation.y  += 0.0012;
    if (earth.cloud) earth.cloud.rotation.y += 0.0008;
    venus.mesh.rotation.y  -= 0.0003; // retrograde
    mars.mesh.rotation.y   += 0.0011;
    jupiter.mesh.rotation.y += 0.0030;
    saturnMesh.rotation.y  += 0.0025;
    uranus.mesh.rotation.y  += 0.0014;
    neptune.mesh.rotation.y += 0.0010;

    // Smooth camera transition
    if (camLerpAlpha < 1 && camEye && camTarget) {
      camLerpAlpha = Math.min(1, camLerpAlpha + 0.04);
      const ease = 1 - Math.pow(1 - camLerpAlpha, 3); // cubic ease-out
      camera.position.lerpVectors(camera.position, camEye, ease * 0.1);
      controls.target.lerpVectors(controls.target, camTarget, ease * 0.1);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  return () => {
    cancelAnimationFrame(raf);
    controls.dispose();
    window.removeEventListener('keydown', onKey);
  };
}
