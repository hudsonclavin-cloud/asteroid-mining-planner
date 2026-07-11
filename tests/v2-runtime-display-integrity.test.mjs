import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-runtime-display-integrity');
const solarRuntimePath = path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts');
const innerRuntimePath = path.join(repoRoot, 'src', 'v2', 'app', 'inner-solar-system', 'runtime.ts');
const earthMoonRuntimePath = path.join(repoRoot, 'src', 'v2', 'app', 'earth-moon', 'runtime.ts');

function compileRuntimeModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const result = runTsc(
[
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      solarRuntimePath,
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

test('sun light fallback preserves true mesh anchor while keeping a stable fallback direction', async () => {
  const { resolveSunLightPosition } = await loadRuntimeModule();

  assert.deepEqual(
    resolveSunLightPosition({ x: 10, y: 20, z: 30 }, 100),
    { x: 10, y: 20, z: 30 },
  );
  assert.deepEqual(
    resolveSunLightPosition({ x: 0, y: 0, z: 0 }, 100),
    { x: 100, y: 30, z: 20 },
  );
});

test('viewport sizing falls back cleanly when mount rect is empty', async () => {
  const { resolveViewportSize } = await loadRuntimeModule();

  assert.deepEqual(resolveViewportSize(1280, 720, 800, 600), { width: 1280, height: 720 });
  assert.deepEqual(resolveViewportSize(0, 720, 800, 600), { width: 800, height: 720 });
  assert.deepEqual(resolveViewportSize(NaN, NaN, 800, 600), { width: 800, height: 600 });
});

test('keyboard shortcut guard ignores editable targets and accepts canvas-like targets', async () => {
  const { isEditableKeyboardTarget } = await loadRuntimeModule();

  assert.equal(isEditableKeyboardTarget({ tagName: 'INPUT' }), true);
  assert.equal(isEditableKeyboardTarget({ tagName: 'textarea' }), true);
  assert.equal(isEditableKeyboardTarget({ isContentEditable: true }), true);
  assert.equal(isEditableKeyboardTarget({ tagName: 'canvas' }), false);
  assert.equal(isEditableKeyboardTarget(null), false);
});

test('solar runtime source wires display integrity guards into the live interaction path', () => {
  const source = fs.readFileSync(solarRuntimePath, 'utf8');

  assert.match(source, /selectBody\(isAsteroidFocusTarget\(bodyId\) \? bodyId : null\);/);
  assert.match(source, /renderer\.domElement\.addEventListener\('pointercancel', onPointerCancel\);/);
  assert.match(source, /renderer\.domElement\.addEventListener\('pointerleave', onPointerLeave\);/);
  assert.match(source, /const occluderDistance = getNearestOpaqueBodyDistance\(\);/);
  assert.match(source, /renderer\.setPixelRatio\(window\.devicePixelRatio\);/);
  assert.match(source, /const viewport = getViewportSizeForMount\(mount\);/);
});

test('inner and earth-moon runtimes mirror the corrected display patterns', () => {
  const innerSource = fs.readFileSync(innerRuntimePath, 'utf8');
  const earthMoonSource = fs.readFileSync(earthMoonRuntimePath, 'utf8');

  assert.match(innerSource, /sunLight\.position\.set\(sunLightPosition\.x, sunLightPosition\.y, sunLightPosition\.z\);/);
  assert.match(innerSource, /sunMesh\.position\.set\(sunRelX, sunRelY, sunRelZ\);/);
  assert.match(innerSource, /renderer\.domElement\.addEventListener\('pointerleave', onPointerLeave\);/);
  assert.match(innerSource, /renderer\.setPixelRatio\(window\.devicePixelRatio\);/);

  assert.match(earthMoonSource, /renderer\.domElement\.addEventListener\('pointerleave', onPointerLeave\);/);
  assert.match(earthMoonSource, /renderer\.setPixelRatio\(window\.devicePixelRatio\);/);
  assert.match(earthMoonSource, /isEditableKeyboardTarget\(event\.target\)/);
});
