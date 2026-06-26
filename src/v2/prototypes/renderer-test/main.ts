/**
 * PROTOTYPE — main.ts
 * Entry point for the renderer test scene.
 * Accessible at: http://localhost:5173/asteroid-mining-planner/v2/renderer-test/
 */

import * as THREE from 'three';
import { buildTestScene } from './scene';

const app = document.getElementById('app')!;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

// Scene + Camera
const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x000005);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 5000);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Build the test scene (async — textures load progressively)
buildTestScene(renderer, scene, camera).catch(console.error);

// ---------------------------------------------------------------------------
// HUD overlay — inspection controls
// ---------------------------------------------------------------------------
const hud = document.createElement('div');
hud.style.cssText = `
  position: fixed; top: 12px; left: 12px;
  color: #aaffee; font-family: monospace; font-size: 12px;
  background: rgba(0,0,5,0.7); padding: 10px 14px; border-radius: 4px;
  pointer-events: none; line-height: 1.7;
`;
hud.innerHTML = `
  <b style="color:#00d4ff">Renderer Prototype</b><br>
  Orbit: drag &nbsp;Zoom: scroll &nbsp;Pan: right-drag<br>
  <br>
  <span style="color:#888">Ambient</span>  0.08 <span style="color:#555">(was 1.5)</span><br>
  <span style="color:#888">Sun</span>      4.0 warm #fffde8<br>
  <span style="color:#888">Terminator</span> smoothstep(−0.12, 0.12)<br>
  <br>
  <b style="color:#aaffee">Camera presets</b><br>
  <span style="color:#2f8">1</span> Earth &nbsp;
  <span style="color:#fc9">2</span> Venus &nbsp;
  <span style="color:#f64">3</span> Mars<br>
  <span style="color:#c95">4</span> Jupiter &nbsp;
  <span style="color:#dca">5</span> Saturn<br>
  <span style="color:#8de">6</span> Uranus &nbsp;
  <span style="color:#46c">7</span> Neptune<br>
  <br>
  <span style="color:#555">Sun orbits slowly — watch terminator shift</span>
`;
document.body.appendChild(hud);
