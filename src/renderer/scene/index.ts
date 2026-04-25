import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// TODO: import from src/utils/constants (TWO_PI, BODY_SCALE_MODES)

// ─── Three.js Setup ───────────────────────────────────────────────────────────
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x050508);
document.body.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 2000);
camera.position.set(0, 6, 18);
camera.lookAt(0, 0, 0);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.1;
controls.maxDistance = 500;
export const clock = new THREE.Clock();
// TODO: import from src/utils/constants (BODY_SCALE_MODES)
let bodyScaleMode = /* BODY_SCALE_MODES.readable */ 'readable';
export let moonOrbitVisualsEnabled = true;
export function setMoonOrbitVisualsEnabled(v: boolean) { moonOrbitVisualsEnabled = v; }

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
export const sunDirectional = new THREE.DirectionalLight(0xffffff, 0.8);
sunDirectional.castShadow = false;
scene.add(sunDirectional);
scene.add(sunDirectional.target);

export const SUN_DISPLAY_RADIUS = 0.06;
export const SUN_TRUE_RADIUS_KM = 696340;
export const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(SUN_DISPLAY_RADIUS, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff4e0 })
);
sunMesh.userData.baseRadius = SUN_DISPLAY_RADIUS;
sunMesh.userData.trueRadiusKm = SUN_TRUE_RADIUS_KM;
scene.add(sunMesh);
export const sunGlowMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xfff4e0, transparent: true, opacity: 0.15 })
);
sunGlowMesh.userData.baseRadius = 0.12;
sunGlowMesh.userData.trueRadiusKm = SUN_TRUE_RADIUS_KM * (0.12 / SUN_DISPLAY_RADIUS);
scene.add(sunGlowMesh);

// Starfield
(function() {
  const N = 8000;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    // TODO: import from src/utils/constants (TWO_PI)
    const TWO_PI = 2 * Math.PI;
    const theta = Math.random() * TWO_PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 300 + Math.random() * 200;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true, transparent: true, opacity: 0.5 })));
})();

export function initScene(): void {
  // Scene, renderer, camera, controls, starfield are all initialized above at module scope.
  // Call this to ensure side-effects (DOM attachment) have run.
}

// Dummy Object3D used for InstancedMesh matrix writes
export const dummy = new THREE.Object3D();

// NHATS pulsing ring (billboard at selected asteroid position)
export const nhatsRingMat = new THREE.MeshBasicMaterial({
  color: 0xfbbf24, transparent: true, opacity: 0.7, side: THREE.DoubleSide,
});
export const nhatsRing = new THREE.Mesh(
  new THREE.RingGeometry(0.008, 0.012, 32),
  nhatsRingMat
);
nhatsRing.visible = false;
scene.add(nhatsRing);

// ─── Object disposal ──────────────────────────────────────────────────────────
// Source: index.html lines 3966–3973

function disposeMaterial(mat: any) {
  if (!mat) return;
  if (Array.isArray(mat)) { mat.forEach(disposeMaterial); return; }
  if (typeof mat.dispose === 'function') mat.dispose();
}

export function disposeObject3D(obj: THREE.Object3D | null | undefined): void {
  if (!obj) return;
  obj.traverse((node: any) => {
    if (node.geometry && !node.geometry.userData?.sharedAsset && typeof node.geometry.dispose === 'function') node.geometry.dispose();
    disposeMaterial(node.material);
  });
  if (obj.parent) obj.parent.remove(obj);
}

// ─── Per-frame hook registrations ────────────────────────────────────────────
// Other modules call registerAnimateHooks() once during boot (from main.ts)
// to inject per-frame callbacks without creating circular imports.

type AnimateHooks = {
  onFrame: (dt: number, now: number, elapsedTime: number) => void;
};

let _hooks: AnimateHooks | null = null;

export function registerAnimateHooks(hooks: AnimateHooks): void {
  _hooks = hooks;
}

// ─── Main animation loop ──────────────────────────────────────────────────────
export function animate(): void {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min(clock.getDelta(), 0.1);
  if (_hooks) _hooks.onFrame(dt, now, clock.elapsedTime);
  controls.update();
  renderer.render(scene, camera);
}
