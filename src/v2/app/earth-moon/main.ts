import { mountEmptyViewportCanvas } from '../../render/index.js';

const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 Earth-Moon mount point "#app" was not found');
}

mountEmptyViewportCanvas({ mount });
