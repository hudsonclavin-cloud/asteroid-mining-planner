import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as THREE from 'three';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-runtime-hover-tooltips');
const runtimeSource = fs.readFileSync(
  path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
  'utf8',
);

function compileRuntimeModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
  const result = spawnSync(
    tscBin,
    [
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let runtimeModulePromise;

async function loadRuntimeModule() {
  if (!runtimeModulePromise) {
    compileRuntimeModule();
    runtimeModulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'runtime.js')).href
    );
  }

  return runtimeModulePromise;
}

test('hover tooltip helper shows Earth text and hides on empty state', async () => {
  const { renderPlanetHoverTooltip } = await loadRuntimeModule();
  const element = { textContent: '', style: { display: '', left: '', top: '' } };

  renderPlanetHoverTooltip(element, 'Earth', { x: 120, y: 80 });
  assert.equal(element.textContent, 'Earth');
  assert.equal(element.style.display, 'block');
  assert.equal(element.style.left, '132px');
  assert.equal(element.style.top, '92px');

  renderPlanetHoverTooltip(element, null);
  assert.equal(element.textContent, '');
  assert.equal(element.style.display, 'none');
});

test('world-position projection maps screen center correctly', async () => {
  const { projectWorldPositionToViewport } = await loadRuntimeModule();
  const camera = new THREE.PerspectiveCamera(45, 2, 1, 1_000);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -1);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  const screenPosition = projectWorldPositionToViewport(
    new THREE.Vector3(0, 0, -10),
    camera,
    { width: 800, height: 400 },
  );

  assert.ok(Math.abs(screenPosition.x - 400) <= 1e-6);
  assert.ok(Math.abs(screenPosition.y - 200) <= 1e-6);
});

test('hoverable bodies stay limited to the planet set through Saturn', async () => {
  const { PLANET_HOVER_TOOLTIP_BODY_IDS } = await loadRuntimeModule();

  assert.deepEqual(PLANET_HOVER_TOOLTIP_BODY_IDS, [
    'sun',
    'mercury',
    'venus',
    'earth',
    'mars',
    'jupiter',
    'saturn',
  ]);
});

test('runtime wires the hover tooltip element, planet-only raycast path, and cleanup', () => {
  assert.match(runtimeSource, /data-testid', 'planet-hover-tooltip'/);
  assert.match(runtimeSource, /className = 'planet-hover-tooltip'/);
  assert.match(runtimeSource, /const hoverTargets = PLANET_HOVER_TOOLTIP_BODY_IDS/);
  assert.match(runtimeSource, /raycaster\.intersectObjects\(hoverTargets, false\)/);
  assert.match(runtimeSource, /planetHoverTooltip\.remove\(\);/);
});
