import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

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

      const result = runTsc(
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

function expectedCanonicalPosition(elements, trueAnomalyRad) {
  const radiusM = (elements.aM * (1 - elements.e * elements.e)) /
    (1 + elements.e * Math.cos(trueAnomalyRad));
  const x = radiusM * Math.cos(trueAnomalyRad);
  const y = radiusM * Math.sin(trueAnomalyRad);
  const cosOm = Math.cos(elements.omRad);
  const sinOm = Math.sin(elements.omRad);
  const cosI = Math.cos(elements.iRad);
  const sinI = Math.sin(elements.iRad);
  const cosW = Math.cos(elements.wRad);
  const sinW = Math.sin(elements.wRad);
  const ecliptic = {
    x: (cosOm * cosW - sinOm * sinW * cosI) * x + (-cosOm * sinW - sinOm * cosW * cosI) * y,
    y: (sinOm * cosW + cosOm * sinW * cosI) * x + (-sinOm * sinW + cosOm * cosW * cosI) * y,
    z: sinW * sinI * x + cosW * sinI * y,
  };
  // Independent nominal J2000 ecliptic-to-equatorial rotation.
  const obliquityRad = (84381.448 * Math.PI) / (180 * 3600);
  return {
    x: ecliptic.x,
    y: ecliptic.y * Math.cos(obliquityRad) - ecliptic.z * Math.sin(obliquityRad),
    z: ecliptic.y * Math.sin(obliquityRad) + ecliptic.z * Math.cos(obliquityRad),
  };
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

test('sampled orbit vectors preserve the independently derived canonical orientation', async () => {
  const core = await loadKeplerian();
  const fixture = readJson(fixturePath);
  const vesta = fixture.asteroids['asteroid-4'];
  const elements = toCoreElements(vesta);
  const samples = core.sampleOrbitEllipse(elements, 64);

  for (const index of [7, 19, 37, 52]) {
    const sample = samples[index];
    const expected = expectedCanonicalPosition(elements, sample.trueAnomalyRad);
    assert.ok(Math.abs(sample.x - expected.x) <= 1, `x orientation at sample ${index}`);
    assert.ok(Math.abs(sample.y - expected.y) <= 1, `y orientation at sample ${index}`);
    assert.ok(Math.abs(sample.z - expected.z) <= 1, `z orientation at sample ${index}`);
  }
});
