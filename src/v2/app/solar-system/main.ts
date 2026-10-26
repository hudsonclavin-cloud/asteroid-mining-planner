import { mountSolarSystem } from './runtime.js';
import { installGlobalFocusStyle } from '../design/global-style.js';

installGlobalFocusStyle();

const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 Solar System mount point "#app" was not found');
}

void mountSolarSystem(mount);
