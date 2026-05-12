import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-orbit-sampling');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');

let compiledModulePromise = null;

async function loadKeplerian() {
  if (!compiledModulePromise) {
    compiledModulePromise = (async () => {
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
          path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' },
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
      return import(pathToFileURL(path.join(tempOutDir, 'core', 'propagators', 'keplerian.js')).href);
    })();
  }

  return compiledModulePromise;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toCoreElements(raw) {
  return {
    aM: raw.elements.aKm * 1000,
    e: raw.elements.e,
    iRad: raw.elements.iRad,
    omRad: raw.elements.omRad,
    wRad: raw.elements.wRad,
    maRad: raw.elements.maRad,
    epochTdbSeconds: 0,
  };
}

function magnitude(point) {
  return Math.hypot(point.x, point.y, point.z);
}

test('Vesta orbit samples close cleanly at 64 segments', async () => {
  const core = await loadKeplerian();
  const fixture = readJson(fixturePath);
  const vesta = fixture.asteroids['asteroid-4'];
  const samples = core.sampleOrbitEllipse(toCoreElements(vesta), 64);

  assert.equal(samples.length, 65);
  const first = samples[0];
  const last = samples[samples.length - 1];
  assert.ok(Math.abs(first.x - last.x) <= 1e-3);
  assert.ok(Math.abs(first.y - last.y) <= 1e-3);
  assert.ok(Math.abs(first.z - last.z) <= 1e-3);
});

test('Apophis high-e orbit uses expected radius law across the sampled ellipse', async () => {
  const core = await loadKeplerian();
  const fixture = readJson(fixturePath);
  const apophis = fixture.asteroids['asteroid-99942'];
  const elements = toCoreElements(apophis);
  const samples = core.sampleOrbitEllipse(elements, 128);
  const semiLatusRectumM = elements.aM * (1 - elements.e * elements.e);

  assert.equal(samples.length, 129);
  for (const sample of samples) {
    const expectedRadiusM = semiLatusRectumM / (1 + elements.e * Math.cos(sample.trueAnomalyRad));
    assert.ok(Math.abs(magnitude(sample) - expectedRadiusM) <= 1e-3);
    assert.ok(Math.abs(sample.orbitalRadiusM - expectedRadiusM) <= 1e-9);
  }
});

test('sampled orbit points satisfy the conic radius equation for Vesta', async () => {
  const core = await loadKeplerian();
  const fixture = readJson(fixturePath);
  const vesta = fixture.asteroids['asteroid-4'];
  const elements = toCoreElements(vesta);
  const samples = core.sampleOrbitEllipse(elements, 64);
  const semiLatusRectumM = elements.aM * (1 - elements.e * elements.e);

  for (const sample of samples) {
    const expectedRadiusM = semiLatusRectumM / (1 + elements.e * Math.cos(sample.trueAnomalyRad));
    assert.ok(Math.abs(magnitude(sample) - expectedRadiusM) <= 1e-3);
  }
});
