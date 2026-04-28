import { mountInnerSolarSystem } from './runtime.js';

const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 Inner Solar System mount point "#app" was not found');
}

void mountInnerSolarSystem(mount);
