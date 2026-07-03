import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-launch-vehicles');
const tolerance = 1e-9;

let modulesPromise = null;

function compileModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const result = spawnSync(
    process.execPath,
    [
      tscBin,
      '--pretty',
      'false',
      '--outDir',
      tempOutDir,
      '--rootDir',
      path.join(repoRoot, 'src', 'v2'),
      '--module',
      'NodeNext',
      '--target',
      'ES2020',
      '--moduleResolution',
      'NodeNext',
      '--isolatedModules',
      'true',
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'launch-vehicles.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
}

async function loadModule() {
  if (!modulesPromise) {
    compileModules();
    modulesPromise = import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'launch-vehicles.js')).href);
  }
  return modulesPromise;
}

const expectedAnchors = [
  {
    name: 'Falcon Heavy',
    config: 'Expendable',
    curve: [
      [0, 15010],
      [10, 12345],
      [20, 10115],
      [30, 8225],
      [40, 6640],
      [55, 4670],
    ],
  },
  {
    name: 'Falcon Heavy',
    config: 'Recovery',
    curve: [
      [0, 6690],
      [10, 5130],
      [20, 3845],
      [30, 2740],
      [40, 1805],
      [55, 650],
    ],
  },
  {
    name: 'Vulcan',
    config: 'VC2',
    curve: [
      [0, 5920],
      [10, 4750],
      [20, 3710],
      [30, 2790],
      [40, 1970],
      [55, 945],
    ],
  },
  {
    name: 'Vulcan',
    config: 'VC4',
    curve: [
      [0, 8550],
      [10, 7140],
      [20, 5880],
      [30, 4780],
      [40, 3800],
      [55, 2555],
    ],
  },
  {
    name: 'Vulcan',
    config: 'VC6',
    curve: [
      [0, 10850],
      [10, 9130],
      [20, 7630],
      [30, 6310],
      [40, 5150],
      [55, 3685],
    ],
  },
  {
    name: 'New Glenn',
    config: 'Standard',
    curve: [
      [0, 7180],
      [10, 4930],
      [20, 2365],
      [30, 120],
    ],
  },
  {
    name: 'Falcon 9 FT',
    config: 'ASDS',
    curve: [
      [0, 3310],
      [10, 2220],
    ],
  },
  {
    name: 'Falcon 9 FT',
    config: 'RTLS',
    curve: [
      [0, 1770],
      [10, 875],
    ],
  },
];

function findVehicle(vehicles, name, config) {
  const vehicle = vehicles.find((candidate) => candidate.name === name && candidate.config === config);
  assert.ok(vehicle, `missing vehicle ${name} ${config}`);
  return vehicle;
}

function assertClose(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: got ${actual}, expected ${expected}`);
}

test('launch vehicle catalog matches locked DEC-13-1 anchors exactly', async () => {
  const { LAUNCH_VEHICLES, payloadAtC3 } = await loadModule();

  assert.equal(LAUNCH_VEHICLES.length, expectedAnchors.length);

  for (const expected of expectedAnchors) {
    const vehicle = findVehicle(LAUNCH_VEHICLES, expected.name, expected.config);
    assert.equal(vehicle.source, 'NASA LSP elvperf');
    assert.equal(vehicle.asOf, '2024-02-29');
    assert.deepEqual(
      vehicle.curve.map((point) => [point.c3, point.payloadKg]),
      expected.curve,
      `${expected.name} ${expected.config} curve mismatch`,
    );

    for (const [c3, payloadKg] of expected.curve) {
      assert.equal(payloadAtC3(vehicle, c3), payloadKg, `${expected.name} ${expected.config} C3=${c3}`);
    }
  }
});

test('payloadAtC3 interpolates linearly between published anchors', async () => {
  const { LAUNCH_VEHICLES, payloadAtC3 } = await loadModule();
  const vc6 = findVehicle(LAUNCH_VEHICLES, 'Vulcan', 'VC6');

  assert.equal(payloadAtC3(vc6, 30), 6310);
  assert.equal(payloadAtC3(vc6, 25), 6970);
});

test('payloadAtC3 never extrapolates past short published curves', async () => {
  const { BEYOND_CURVE, LAUNCH_VEHICLES, payloadAtC3 } = await loadModule();
  const f9Asds = findVehicle(LAUNCH_VEHICLES, 'Falcon 9 FT', 'ASDS');
  const f9Rtls = findVehicle(LAUNCH_VEHICLES, 'Falcon 9 FT', 'RTLS');
  const newGlenn = findVehicle(LAUNCH_VEHICLES, 'New Glenn', 'Standard');

  assert.equal(payloadAtC3(f9Asds, 10.1), BEYOND_CURVE);
  assert.equal(payloadAtC3(f9Rtls, 20), BEYOND_CURVE);
  assert.equal(payloadAtC3(newGlenn, 30.1), BEYOND_CURVE);
});

test('New Glenn keeps C3=30 anchor, interpolates steep interior, and stops after it', async () => {
  const { BEYOND_CURVE, LAUNCH_VEHICLES, payloadAtC3 } = await loadModule();
  const newGlenn = findVehicle(LAUNCH_VEHICLES, 'New Glenn', 'Standard');

  assert.equal(payloadAtC3(newGlenn, 30), 120);
  assert.equal(payloadAtC3(newGlenn, 25), 1242.5);
  assert.equal(payloadAtC3(newGlenn, 31), BEYOND_CURVE);
  assert.equal(payloadAtC3(newGlenn, 35), BEYOND_CURVE);
});

test('payloadAtC3 guards non-finite and below-first C3 inputs', async () => {
  const { BEYOND_CURVE, LAUNCH_VEHICLES, payloadAtC3 } = await loadModule();
  const fhExp = findVehicle(LAUNCH_VEHICLES, 'Falcon Heavy', 'Expendable');

  assert.equal(payloadAtC3(fhExp, Number.NaN), BEYOND_CURVE);
  assert.equal(payloadAtC3(fhExp, Number.POSITIVE_INFINITY), BEYOND_CURVE);
  assert.equal(payloadAtC3(fhExp, Number.NEGATIVE_INFINITY), BEYOND_CURVE);
  assert.equal(payloadAtC3(fhExp, -1), BEYOND_CURVE);
});

test('deliveredMassKg excludes injection by construction and applies mode departure only for sample return', async () => {
  const {
    BEYOND_CURVE,
    G0_MPS2,
    LAUNCH_VEHICLES,
    SCREENING_ISP_S,
    deliveredMassKg,
    deterministicMarginMps,
  } = await loadModule();
  const fhExp = findVehicle(LAUNCH_VEHICLES, 'Falcon Heavy', 'Expendable');
  const newGlenn = findVehicle(LAUNCH_VEHICLES, 'New Glenn', 'Standard');

  const launchVehiclePayloadKg = 10115;
  const rendezvousMps = 1500;
  const stationkeepingMps = 150;
  const marginMps = deterministicMarginMps(rendezvousMps);
  const budget = { rendezvousMps, stationkeepingMps, marginMps, departureMps: 600 };
  const dvNoInjectionMps = rendezvousMps + stationkeepingMps + marginMps;

  // DEC-13-4 double-count guard:
  // Path A (correct): 10115 * exp(-1725 / (320 * 9.80665)) = 5837.652223940382 kg.
  // Path B (wrong): add a 3200 m/s injection term already embodied in payload-at-C3.
  const expectedNoInjectionKg =
    launchVehiclePayloadKg * Math.exp(-dvNoInjectionMps / (SCREENING_ISP_S * G0_MPS2));
  const trapInjectionChargedKg =
    launchVehiclePayloadKg * Math.exp(-(dvNoInjectionMps + 3200) / (SCREENING_ISP_S * G0_MPS2));
  const oneWayKg = deliveredMassKg(fhExp, 20, budget);

  assert.notEqual(oneWayKg, BEYOND_CURVE);
  assertClose(oneWayKg, 5837.652223940382, 'hand-computed no-injection delivered mass');
  assertClose(oneWayKg, expectedNoInjectionKg, 'production matches Path A');
  assert.ok(Math.abs(oneWayKg - trapInjectionChargedKg) > 1000, 'production must not match Path B');

  const sampleReturnKg = deliveredMassKg(fhExp, 20, budget, 'sample-return');
  assert.notEqual(sampleReturnKg, BEYOND_CURVE);
  assert.ok(sampleReturnKg < oneWayKg);
  assertClose(
    sampleReturnKg,
    oneWayKg * Math.exp(-budget.departureMps / (SCREENING_ISP_S * G0_MPS2)),
    'sample-return applies departure factor',
  );

  assert.equal(deliveredMassKg(newGlenn, 35, budget), BEYOND_CURVE);
});
