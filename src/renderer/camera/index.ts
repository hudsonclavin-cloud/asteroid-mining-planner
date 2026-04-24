// TODO: import from src/renderer/scene/index (camera, renderer)
import { camera, renderer } from '../scene/index.js';

export function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);
