import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-keplerian');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');
const vestaTruthPath = path.join(
  repoRoot,
  'tools',
  'slice7-research',
  'data',
  'horizons-truth',
  'asteroid-4-90d.json',
);
const anchoredAccuracyPath = path.join(
  repoRoot,
  'tools',
  'slice7-research',
  'data',
  'keplerian-accuracy-anchored.json',
);

let compiledModulesPromise = null;

async function loadCore() {
  if (!compiledModulesPromise) {
    compiledModulesPromise = (async () => {
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
          path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
        ],
        { cwd: repoRoot, encoding: 'utf8' },
      );

      assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
      return import(pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href);
    })();
  }

  return compiledModulesPromise;
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
    epochTdbSeconds: raw.elements.epochTdbJd,
  };
}

function vectorNorm(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function subtract(left, right) {
  return {
    x: left.x - right.x,
    y: left.y - right.y,
    z: left.z - right.z,
  };
}

function dot(left, right) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

function cross(left, right) {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

function shiftEpoch(core, elements, deltaSeconds) {
  const meanMotionRadPerSec = Math.sqrt(
    core.GM_SUN_M3_S2 / (elements.aM * elements.aM * elements.aM),
  );
  return {
    ...elements,
    maRad: core.normalizeAngleRadians(elements.maRad + meanMotionRadPerSec * deltaSeconds),
    epochTdbSeconds: elements.epochTdbSeconds + deltaSeconds,
  };
}

test('propagateKeplerianStateVectors reproduces the fixture anchor state within one meter', async () => {
  const core = await loadCore();
  const fixture = readJson(fixturePath);
  const rawVesta = fixture.asteroids['asteroid-4'];
  const elements = toCoreElements(rawVesta);
  const anchorSeconds = core.jdTdbToSecondsSinceJ2000(rawVesta.anchor.epochTdbJd);

  elements.epochTdbSeconds = anchorSeconds;
  const propagated = core.propagateKeplerianStateVectors(elements, anchorSeconds);
  const anchorPositionM = {
    x: rawVesta.anchor.positionKm[0] * 1000,
    y: rawVesta.anchor.positionKm[1] * 1000,
    z: rawVesta.anchor.positionKm[2] * 1000,
  };

  const errorM = vectorNorm(subtract(propagated.positionM, anchorPositionM));
  assert.ok(errorM <= 1, `expected <= 1 meter anchor reproduction error, got ${errorM} m`);
});

test('forward 30d epoch shift then backward propagation returns to the initial state within one meter', async () => {
  const core = await loadCore();
  const fixture = readJson(fixturePath);
  const rawVesta = fixture.asteroids['asteroid-4'];
  const elements = toCoreElements(rawVesta);
  const anchorSeconds = core.jdTdbToSecondsSinceJ2000(rawVesta.anchor.epochTdbJd);
  elements.epochTdbSeconds = anchorSeconds;
  const initial = core.propagateKeplerianStateVectors(elements, anchorSeconds);
  const shifted = shiftEpoch(core, elements, 30 * 86400);
  const propagatedBack = core.propagateKeplerianStateVectors(shifted, anchorSeconds);

  const errorM = vectorNorm(subtract(propagatedBack.positionM, initial.positionM));
  assert.ok(errorM <= 1, `expected <= 1 meter round-trip error, got ${errorM} m`);
});

test('angular momentum and specific orbital energy remain conserved over 90 days', async () => {
  const core = await loadCore();
  const fixture = readJson(fixturePath);
  const rawVesta = fixture.asteroids['asteroid-4'];
  const elements = toCoreElements(rawVesta);
  const anchorSeconds = core.jdTdbToSecondsSinceJ2000(rawVesta.anchor.epochTdbJd);
  elements.epochTdbSeconds = anchorSeconds;
  const checkpoints = [0, 30, 60, 90].map((days) =>
    core.propagateKeplerianStateVectors(elements, anchorSeconds + days * 86400),
  );

  const baselineH = cross(checkpoints[0].positionM, checkpoints[0].velocityMps);
  const baselineHNorm = vectorNorm(baselineH);
  const baselineEnergy =
    0.5 * dot(checkpoints[0].velocityMps, checkpoints[0].velocityMps) -
    core.GM_SUN_M3_S2 / vectorNorm(checkpoints[0].positionM);

  for (const checkpoint of checkpoints.slice(1)) {
    const h = cross(checkpoint.positionM, checkpoint.velocityMps);
    const energy =
      0.5 * dot(checkpoint.velocityMps, checkpoint.velocityMps) -
      core.GM_SUN_M3_S2 / vectorNorm(checkpoint.positionM);
    const relativeHError = vectorNorm(subtract(h, baselineH)) / baselineHNorm;
    assert.ok(relativeHError <= 1e-12, `expected angular momentum conservation, got ${relativeHError}`);
    assert.ok(
      Math.abs(energy - baselineEnergy) <= 1e-7,
      `expected energy conservation, got ${energy - baselineEnergy}`,
    );
  }
});

test('high-e solver converges within the iteration cap', async () => {
  const core = await loadCore();
  const eccentricAnomaly = core.solveKeplerEquation(2.4, 0.9, { maxIterations: 50 });
  assert.ok(Number.isFinite(eccentricAnomaly));
});

test('production Keplerian port matches the round-2 Vesta day-90 research residual', async () => {
  const core = await loadCore();
  const fixture = readJson(fixturePath);
  const truth = readJson(vestaTruthPath);
  const anchoredAccuracy = readJson(anchoredAccuracyPath);
  const rawVesta = fixture.asteroids['asteroid-4'];
  const elements = toCoreElements(rawVesta);
  elements.epochTdbSeconds = core.jdTdbToSecondsSinceJ2000(rawVesta.anchor.epochTdbJd);
  const finalTruth = truth.samples[truth.samples.length - 1];
  const expected = anchoredAccuracy.asteroids.find((entry) => entry.designation === '4');

  assert.ok(expected, 'Missing Vesta record in keplerian-accuracy-anchored.json');

  const targetSeconds = core.jdTdbToSecondsSinceJ2000(finalTruth.jdTdb);
  const propagated = core.propagateKeplerianStateVectors(elements, targetSeconds);
  const truthPositionM = {
    x: finalTruth.positionKm.x * 1000,
    y: finalTruth.positionKm.y * 1000,
    z: finalTruth.positionKm.z * 1000,
  };
  const errorKm = vectorNorm(subtract(propagated.positionM, truthPositionM)) / 1000;

  assert.ok(
    Math.abs(errorKm - expected.error_at_90d_km) <= 1e-3,
    `expected Vesta day-90 residual ${expected.error_at_90d_km} km, got ${errorKm} km`,
  );
});

test('assertKeplerianError routes asteroid overflows to INV-012', async () => {
  const core = await loadCore();
  const truth = {
    positionM: { x: 0, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
    frame: core.FRAME_HELIO_J2000_ICRF,
    tdbSeconds: 0,
  };
  const estimate = {
    positionM: { x: 100_001_000, y: 0, z: 0 },
    velocityMps: { x: 0, y: 0, z: 0 },
    frame: core.FRAME_HELIO_J2000_ICRF,
    tdbSeconds: 0,
  };

  assert.throws(
    () => core.assertKeplerianError(estimate, truth, 'asteroid-101955'),
    (error) => error?.invariantId === 'INV-012',
  );
});
