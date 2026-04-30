import { mountSolarSystem } from './runtime.js';

const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 Solar System mount point "#app" was not found');
}

void mountSolarSystem(mount);
