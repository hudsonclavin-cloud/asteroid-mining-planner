import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-grid');
const neaFixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const horizonsFixturePath = path.join(repoRoot, 'src', 'v2', 'data', 'horizons-inner-solar-system-2026-2040.json');
const secondsPerDay = 86_400;
const relTol = 1e-12;
const validatedRoundTripCases = [
  {
    label: 'Apophis M=1 existing validated cell',
    designation: '99942',
    depJD: 2461175.500800741,
    tofDays: 1095.75,
    expectedSelectedBranch: 1,
    expectedC3: 1781.2916629949357,
    expectedV1: [26.376288487940847, 17.796832466915845, 17.75091207370921],
  },
  {
    label: 'Apophis M=1 short-TOF near-boundary cell',
    designation: '99942',
    depJD: 2462114.500800741,
    tofDays: 480.7040816326531,
    expectedSelectedBranch: 0,
    expectedC3: 8.784792714834586,
    expectedV1: [-28.978159473645643, 3.6448018737526233, 4.280360794460954],
  },
  {
    label: 'Bennu M=1 long-TOF high-x² right-branch stress cell',
    designation: '101955',
    depJD: 2461309.500800741,
    tofDays: 1058.4744897959185,
    expectedSelectedBranch: 1,
    expectedC3: 200.43224970561695,
    expectedV1: [-14.69023687322232, 28.445017596532892, 17.539278831231947],
  },
];

let modulesPromise = null;

function compileModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const result = spawnSync(
    process.execPath,
    [
      tscBin,
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'grid-compute.ts'),
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'porkchop.worker.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'lambert-multi-rev.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'izzo.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'units', 'utc-to-tdb.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'earth-index.ts'),
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'sun-arc.ts'),
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'return-selection.ts'),
      path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
      path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
      path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'slice9-runtime-asteroids.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
}

async function importJs(relPath) {
  return import(pathToFileURL(path.join(tempOutDir, relPath)).href);
}

async function loadModules() {
  if (!modulesPromise) {
    compileModules();
    modulesPromise = (async () => {
      const [
        gridCompute,
        workerModule,
        lambertMultiRevModule,
        horizons,
        slice9,
        runtimeAsteroids,
        tdbUnits,
        units,
        hermite,
        earthIndex,
        sunArc,
        returnSelection,
        keplerian,
      ] = await Promise.all([
        importJs('porkchop/grid-compute.js'),
        importJs('porkchop/porkchop.worker.js'),
        importJs('core/lambert/lambert-multi-rev.js'),
        importJs('boundary/horizons.js'),
        importJs('boundary/slice9-nea-catalog.js'),
        importJs('app/solar-system/slice9-runtime-asteroids.js'),
        importJs('core/units/utc-to-tdb.js'),
        importJs('core/units.js'),
        importJs('core/interpolators/hermite.js'),
        importJs('porkchop/earth-index.js'),
        importJs('porkchop/sun-arc.js'),
        importJs('porkchop/return-selection.js'),
        importJs('core/propagators/keplerian.js'),
      ]);

      const rawCatalog = JSON.parse(fs.readFileSync(neaFixturePath, 'utf8'));
      const canonicalCatalog = slice9.ingestSlice9Fixture(rawCatalog);
      const bodies = Object.values(canonicalCatalog.asteroids).map((body) =>
        runtimeAsteroids.normalizeSlice9BodyForRuntime(body),
      );
      const byDesignation = new Map(bodies.map((body) => [body.designation, body]));

      const rawHorizons = JSON.parse(fs.readFileSync(horizonsFixturePath, 'utf8'));
      const horizonsStates = horizons.ingestSlice2Fixture(rawHorizons);
      const earthSeries = horizonsStates.earth.map((sample) => sample.state);

      return {
        ...gridCompute,
        ...workerModule,
        ...lambertMultiRevModule,
        ...tdbUnits,
        ...units,
        ...hermite,
        ...earthIndex,
        ...sunArc,
        ...returnSelection,
        ...keplerian,
        earthSeries,
        byDesignation,
      };
    })();
  }

  return modulesPromise;
}

function relDiff(actual, expected) {
  return Math.abs(actual - expected) / Math.max(Math.abs(expected), 1);
}

function assertVecClose(actual, expected, label) {
  for (let index = 0; index < 3; index += 1) {
    const diff = relDiff(actual[index], expected[index]);
    assert.ok(diff < relTol, `${label}[${index}] mismatch: got ${actual[index]}, expected ${expected[index]}, relDiff=${diff}`);
  }
}

function subtract3(left, right) {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function magnitude3(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function vectorKmFromMeters(positionM) {
  return [positionM.x / 1000, positionM.y / 1000, positionM.z / 1000];
}

function vectorKmpsFromMps(velocityMps) {
  return [velocityMps.x / 1000, velocityMps.y / 1000, velocityMps.z / 1000];
}

function tdbSecondsToJd(tdbSeconds, J2000_TDB_JULIAN_DATE) {
  return tdbSeconds / secondsPerDay + J2000_TDB_JULIAN_DATE;
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function stateComponents(state) {
  return [
    state.positionM.x,
    state.positionM.y,
    state.positionM.z,
    state.velocityMps.x,
    state.velocityMps.y,
    state.velocityMps.z,
  ];
}

function thrownShape(fn) {
  try {
    fn();
    return null;
  } catch (error) {
    return { name: error.name, message: error.message };
  }
}

function buildDeps(modules, earthSeries) {
  return {
    getEarthStateAtTdbSeconds: (tdbSeconds) =>
      modules.interpolateBodyStateSeries('earth', earthSeries, tdbSeconds),
    propagateTargetStateAtTdbSeconds: (bodyElements, tdbSeconds) =>
      modules.propagateKeplerianStateVectors(bodyElements, tdbSeconds),
  };
}

test('indexed Earth lookup is identity-equivalent to the production linear lookup', async () => {
  const modules = await loadModules();
  const samples = modules.earthSeries;
  const epochs = [];
  for (const sample of samples) {
    epochs.push(sample.tdbSeconds);
    epochs.push(sample.tdbSeconds - 1e-6 * secondsPerDay);
    epochs.push(sample.tdbSeconds + 1e-6 * secondsPerDay);
  }
  for (let index = 0; index < samples.length - 1; index += 1) {
    epochs.push((samples[index].tdbSeconds + samples[index + 1].tdbSeconds) / 2);
  }
  const random = mulberry32(20261125);
  const minT = samples[0].tdbSeconds;
  const maxT = samples.at(-1).tdbSeconds;
  for (let index = 0; index < 1000; index += 1) {
    epochs.push(minT + random() * (maxT - minT));
  }

  let maxAbsDifference = 0;
  for (const tdbSeconds of epochs) {
    const linearError = thrownShape(() => modules.interpolateBodyStateSeries('earth', samples, tdbSeconds));
    const indexedError = thrownShape(() => modules.interpolateIndexedBodyStateSeries('earth', samples, tdbSeconds));
    if (linearError !== null || indexedError !== null) {
      assert.deepEqual(indexedError, linearError);
      continue;
    }
    const linear = modules.interpolateBodyStateSeries('earth', samples, tdbSeconds);
    const indexed = modules.interpolateIndexedBodyStateSeries('earth', samples, tdbSeconds);
    const linearComponents = stateComponents(linear);
    const indexedComponents = stateComponents(indexed);
    for (let component = 0; component < linearComponents.length; component += 1) {
      maxAbsDifference = Math.max(
        maxAbsDifference,
        Math.abs(linearComponents[component] - indexedComponents[component]),
      );
    }
  }

  assert.equal(maxAbsDifference, 0);
  for (const tdbSeconds of [minT - 1, maxT + 1, minT - 1e-6 * secondsPerDay, maxT + 1e-6 * secondsPerDay]) {
    const linearError = thrownShape(() => modules.interpolateBodyStateSeries('earth', samples, tdbSeconds));
    const indexedError = thrownShape(() => modules.interpolateIndexedBodyStateSeries('earth', samples, tdbSeconds));
    assert.deepEqual(indexedError, linearError);
  }
});

function lowPerihelionEllipseState(trueAnomalyRad) {
  const muKm3S2 = 1.32712440018e11;
  const perihelionKm = 100_000;
  const aphelionKm = 10_000_000;
  const eccentricity = (aphelionKm - perihelionKm) / (aphelionKm + perihelionKm);
  const semiLatusRectumKm = perihelionKm * (1 + eccentricity);
  const radiusKm = semiLatusRectumKm / (1 + eccentricity * Math.cos(trueAnomalyRad));
  const speedFactorKmps = Math.sqrt(muKm3S2 / semiLatusRectumKm);
  return {
    positionKm: [radiusKm * Math.cos(trueAnomalyRad), radiusKm * Math.sin(trueAnomalyRad), 0],
    velocityKmps: [
      -speedFactorKmps * Math.sin(trueAnomalyRad),
      speedFactorKmps * (eccentricity + Math.cos(trueAnomalyRad)),
      0,
    ],
  };
}

test('DEC-20-14 flags only a low-perihelion flown arc and excludes it from selection', async () => {
  const modules = await loadModules();
  const muKm3S2 = 1.32712440018e11;
  const atApoapsis = lowPerihelionEllipseState(Math.PI);
  const afterPerihelion = lowPerihelionEllipseState(Math.PI / 2);
  const beforePerihelion = lowPerihelionEllipseState(Math.PI);

  const throughSun = modules.assessSunArc(
    atApoapsis.positionKm,
    atApoapsis.velocityKmps,
    afterPerihelion.positionKm,
    muKm3S2,
    0,
  );
  assert.ok(throughSun.perihelionKm < modules.SOLAR_PERIHELION_LIMIT_KM);
  assert.equal(throughSun.passesPerihelion, true);
  assert.equal(throughSun.refusalReason, 'through-sun');

  const beforeSun = modules.assessSunArc(
    afterPerihelion.positionKm,
    afterPerihelion.velocityKmps,
    beforePerihelion.positionKm,
    muKm3S2,
    0,
  );
  assert.ok(beforeSun.perihelionKm < modules.SOLAR_PERIHELION_LIMIT_KM);
  assert.equal(beforeSun.passesPerihelion, false);
  assert.equal(beforeSun.refusalReason, undefined);

  const M1 = modules.assessSunArc(
    afterPerihelion.positionKm,
    afterPerihelion.velocityKmps,
    beforePerihelion.positionKm,
    muKm3S2,
    1,
  );
  assert.equal(M1.passesPerihelion, true);
  assert.equal(M1.refusalReason, 'through-sun');

  const body = modules.byDesignation.get('99942');
  assert.ok(body, 'Apophis should exist in fixture');
  const result = modules.computePorkchopGrid(
    body.elements,
    { depStartJD: modules.J2000_TDB_JULIAN_DATE, depEndJD: modules.J2000_TDB_JULIAN_DATE, tofMinDays: 200, tofMaxDays: 200, nDep: 1, nTof: 1 },
    1,
    {
      getEarthStateAtTdbSeconds: (tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: 10_000_000_000, y: 0, z: 0 },
        velocityMps: { x: 0, y: 0, z: 0 },
      }),
      propagateTargetStateAtTdbSeconds: (_elements, tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: afterPerihelion.positionKm[0] * 1000, y: afterPerihelion.positionKm[1] * 1000, z: 0 },
        velocityMps: { x: 0, y: 0, z: 0 },
      }),
      solveLambert: () => ({
        M: 1,
        branches: [
          { branch: 'left', converged: true, x: -0.2, v1: atApoapsis.velocityKmps, v2: [0, 0, 0] },
          { branch: 'right', converged: true, x: 0.2, v1: [0, Math.sqrt(muKm3S2 / 10_000_000), 0], v2: [0, 0, 0] },
        ],
      }),
    },
  );
  const [cell] = result.cells;
  assert.equal(cell.branches[0].refusalReason, 'through-sun');
  assert.equal(cell.branches[1].refusalReason, undefined);
  assert.equal(cell.selectedBranch, 1);
});

test('return kernel uses asteroid-departure/Earth-arrival endpoints and refuses after the runtime Earth span', async () => {
  const modules = await loadModules();
  const body = modules.byDesignation.get('99942');
  assert.ok(body, 'Apophis should exist in fixture');
  const departureTdbSeconds = 1_000 * secondsPerDay;
  const depJD = tdbSecondsToJd(departureTdbSeconds, modules.J2000_TDB_JULIAN_DATE);
  const earthMaxTdbSeconds = departureTdbSeconds + 300 * secondsPerDay;
  const calls = [];
  const result = modules.computeReturnPorkchopGrid(
    body.elements,
    {
      depStartJD: depJD,
      depEndJD: depJD,
      tofMinDays: 200,
      tofMaxDays: 400,
      nDep: 1,
      nTof: 2,
      earthMaxTdbSeconds,
    },
    0,
    {
      getEarthStateAtTdbSeconds: (tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: 400_000_000_000, y: 500_000_000_000, z: 600_000_000_000 },
        velocityMps: { x: 4_000, y: 5_000, z: 6_000 },
      }),
      propagateTargetStateAtTdbSeconds: (_elements, tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: 100_000_000_000, y: 200_000_000_000, z: 300_000_000_000 },
        velocityMps: { x: 1_000, y: 2_000, z: 3_000 },
      }),
      solveLambert: (r1, r2, tofSeconds, muKm3S2, M, lw) => {
        calls.push({ r1, r2, tofSeconds, muKm3S2, M, lw });
        return {
          M,
          branches: [{ branch: 'single', converged: true, x: 0, v1: [10, 20, 30], v2: [40, 50, 60] }],
        };
      },
    },
  );

  assert.equal(calls.length, 1, 'Earth-span refusal must occur before Lambert');
  assert.deepEqual(calls[0].r1, [100_000_000, 200_000_000, 300_000_000]);
  assert.deepEqual(calls[0].r2, [400_000_000, 500_000_000, 600_000_000]);
  assert.equal(calls[0].M, 0);
  assert.equal(calls[0].lw, true);
  assert.deepEqual(result.cells[0].branches[0].vInfE, [36, 45, 54]);
  assert.deepEqual(result.cells[0].branches[0].vInfAsteroidDeparture, [9, 18, 27]);
  assert.equal(result.cells[0].branches[0].earthArrivalTdbSeconds, departureTdbSeconds + 200 * secondsPerDay);
  assert.equal(result.cells[1].status, 'earth-span');
  assert.equal(result.cells[1].earthLastSampleTdbSeconds, earthMaxTdbSeconds);
  assert.equal(result.earthSpanRefusedCount, 1);
});

test('return selection uses asteroid-departure speed, excludes flags, ties to M=0, and pairs support at departure', async () => {
  const modules = await loadModules();
  const selected = modules.selectReturnBranch([
    { converged: true, refusalReason: 'through-sun', vInfAsteroidDepartureKmps: 1, M: 0 },
    { converged: true, refusalReason: undefined, vInfAsteroidDepartureKmps: 2, M: 1 },
    { converged: true, refusalReason: undefined, vInfAsteroidDepartureKmps: 2, M: 0 },
    { converged: true, refusalReason: undefined, vInfAsteroidDepartureKmps: 9, M: 2 },
  ]);
  assert.equal(selected, 2, 'flagged cheapest branch is excluded and an exact tie chooses M=0');

  const outboundArrivalTdbSeconds = 1_000 * secondsPerDay;
  const paired = modules.pairedReturnGridParams(outboundArrivalTdbSeconds, { nDep: 3, nTof: 4 });
  assert.equal(paired.depStartJD, modules.J2000_TDB_JULIAN_DATE + 1008);
  assert.equal(paired.depEndJD, modules.J2000_TDB_JULIAN_DATE + 1730.5);
  assert.equal(paired.tofMinDays, 182.5);
  assert.equal(paired.tofMaxDays, 1826.25);
  assert.equal(paired.nDep, 3);
  assert.equal(paired.nTof, 4);

  const boundary = { encounterJd: paired.depStartJD, encounterDateLabel: '2028-10-01', encounterBody: '99942' };
  assert.equal(modules.isReturnDepartureUnsupported(paired.depStartJD - 1, boundary), false);
  assert.equal(modules.isReturnDepartureUnsupported(paired.depStartJD, boundary), false);
  assert.equal(modules.isReturnDepartureUnsupported(paired.depStartJD + 1, boundary), true);
  assert.equal(modules.isReturnDepartureUnsupported(paired.depStartJD, undefined), null);

  const body = modules.byDesignation.get('99942');
  assert.ok(body, 'Apophis should exist in fixture');
  const depJD = modules.J2000_TDB_JULIAN_DATE + 1000;
  const departureSeconds = 1000 * secondsPerDay;
  const supportedAtDeparture = modules.computeReturnPorkchopGrid(
    body.elements,
    {
      depStartJD: depJD,
      depEndJD: depJD,
      tofMinDays: 200,
      tofMaxDays: 200,
      nDep: 1,
      nTof: 1,
      earthMaxTdbSeconds: departureSeconds + 300 * secondsPerDay,
      supportBoundary: { encounterJd: depJD + 100, encounterDateLabel: '2002-10-01', encounterBody: '99942' },
    },
    0,
    {
      getEarthStateAtTdbSeconds: (tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: 400_000_000_000, y: 500_000_000_000, z: 600_000_000_000 },
        velocityMps: { x: 4_000, y: 5_000, z: 6_000 },
      }),
      propagateTargetStateAtTdbSeconds: (_elements, tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: 100_000_000_000, y: 200_000_000_000, z: 300_000_000_000 },
        velocityMps: { x: 1_000, y: 2_000, z: 3_000 },
      }),
      solveLambert: () => ({
        M: 0,
        branches: [{ branch: 'single', converged: true, x: 0, v1: [10, 20, 30], v2: [40, 50, 60] }],
      }),
    },
  );
  assert.equal(supportedAtDeparture.cells[0].branches[0].support, false);
});

function buildValidatedReference(modules, body, depUtc, tofDays, M) {
  const validatedDepartureTdbSeconds = modules.utcStringToTdbSeconds(depUtc);
  const depJD = tdbSecondsToJd(validatedDepartureTdbSeconds, modules.J2000_TDB_JULIAN_DATE);
  const departureTdbSeconds = modules.jdTdbToSecondsSinceJ2000(depJD);
  const tofSeconds = tofDays * secondsPerDay;
  const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
  const earthState = modules.interpolateBodyStateSeries('earth', modules.earthSeries, departureTdbSeconds);
  const asteroidState = modules.propagateKeplerianStateVectors(body.elements, arrivalTdbSeconds);
  const earthPositionKm = vectorKmFromMeters(earthState.positionM);
  const earthVelocityKmps = vectorKmpsFromMps(earthState.velocityMps);
  const asteroidPositionKm = vectorKmFromMeters(asteroidState.positionM);
  const asteroidVelocityKmps = vectorKmpsFromMps(asteroidState.velocityMps);
  const result = modules.lambertMultiRev(
    earthPositionKm,
    asteroidPositionKm,
    tofSeconds,
    1.32712440018e11,
    M,
    true,
  );

  assert.ok(result, 'validated reference should converge');

  const mappedBranches = result.branches.map((branch) => {
    const vInfDepVector = subtract3(branch.v1, earthVelocityKmps);
    const vInfArrVector = subtract3(branch.v2, asteroidVelocityKmps);
    const vInfDep = magnitude3(vInfDepVector);
    return {
      branch: branch.branch,
      converged: branch.converged,
      c3: vInfDep * vInfDep,
      v1: branch.v1,
      v2: branch.v2,
      vInfArr: magnitude3(vInfArrVector),
    };
  });

  let selectedBranch = null;
  let selectedC3 = Number.POSITIVE_INFINITY;
  for (let index = 0; index < mappedBranches.length; index += 1) {
    if (!mappedBranches[index].converged) {
      continue;
    }
    if (mappedBranches[index].c3 < selectedC3) {
      selectedC3 = mappedBranches[index].c3;
      selectedBranch = index;
    }
  }

  return {
    departureTdbSeconds,
    depJD,
    tofDays,
    tofSeconds,
    branches: mappedBranches,
    selectedBranch,
  };
}

test('computePorkchopGrid round-trips three validated M=1 cells through JD+days boundary across the regime', async () => {
  const modules = await loadModules();

  for (const expectedCase of validatedRoundTripCases) {
    const body = modules.byDesignation.get(expectedCase.designation);
    assert.ok(body, `${expectedCase.label}: body should exist in fixture`);

    const result = modules.computePorkchopGrid(
      body.elements,
      {
        depStartJD: expectedCase.depJD,
        depEndJD: expectedCase.depJD,
        tofMinDays: expectedCase.tofDays,
        tofMaxDays: expectedCase.tofDays,
        nDep: 1,
        nTof: 1,
      },
      1,
      buildDeps(modules, modules.earthSeries),
    );

    assert.equal(result.cells.length, 1, `${expectedCase.label}: expected one cell`);
    const [cell] = result.cells;
    assert.equal(cell.status, 'ok', `${expectedCase.label}: cell should converge`);
    assert.equal(
      cell.selectedBranch,
      expectedCase.expectedSelectedBranch,
      `${expectedCase.label}: selectedBranch mismatch`,
    );
    const actual = cell.branches[cell.selectedBranch];
    assert.ok(
      relDiff(actual.c3, expectedCase.expectedC3) < relTol,
      `${expectedCase.label}: c3 mismatch: got ${actual.c3}, expected ${expectedCase.expectedC3}`,
    );
    assertVecClose(actual.v1, expectedCase.expectedV1, `${expectedCase.label} selected v1`);
  }
});

test('computePorkchopGrid maps below-T_min cells to no_solution', async () => {
  const modules = await loadModules();
  const body = modules.byDesignation.get('99942');
  assert.ok(body, 'Apophis should exist in fixture');

  const departureTdbSeconds = modules.utcStringToTdbSeconds('2029-01-01');
  const depJD = tdbSecondsToJd(departureTdbSeconds, modules.J2000_TDB_JULIAN_DATE);
  const result = modules.computePorkchopGrid(
    body.elements,
    {
      depStartJD: depJD,
      depEndJD: depJD,
      tofMinDays: 45,
      tofMaxDays: 45,
      nDep: 1,
      nTof: 1,
    },
    1,
    buildDeps(modules, modules.earthSeries),
  );

  assert.equal(result.cells.length, 1);
  assert.deepEqual(result.cells[0], {
    depJD,
    tofDays: 45,
    status: 'no_solution',
    M: 1,
    branches: [],
    selectedBranch: null,
  });
});

test('computePorkchopGrid selects the lower-C3 branch when both M=1 branches converge', async () => {
  const modules = await loadModules();
  const body = modules.byDesignation.get('99942');
  assert.ok(body, 'Apophis should exist in fixture');

  const reference = buildValidatedReference(modules, body, '2026-05-15', 1095.75, 1);
  const result = modules.computePorkchopGrid(
    body.elements,
    {
      depStartJD: reference.depJD,
      depEndJD: reference.depJD,
      tofMinDays: reference.tofDays,
      tofMaxDays: reference.tofDays,
      nDep: 1,
      nTof: 1,
    },
    1,
    buildDeps(modules, modules.earthSeries),
  );

  const [cell] = result.cells;
  assert.equal(cell.status, 'ok');
  assert.equal(cell.branches.length, 2);
  assert.ok(cell.branches.every((branch) => branch.converged), 'expected both branches to converge');
  assert.notEqual(cell.selectedBranch, null);

  const otherBranchIndex = cell.selectedBranch === 0 ? 1 : 0;
  assert.ok(cell.branches[cell.selectedBranch].c3 <= cell.branches[otherBranchIndex].c3);
  assert.equal(cell.selectedBranch, reference.selectedBranch);
});

test('computePorkchopGrid maps all-failed synthetic solver output to stall', async () => {
  const modules = await loadModules();
  const body = modules.byDesignation.get('99942');
  assert.ok(body, 'Apophis should exist in fixture');

  const depJD = modules.J2000_TDB_JULIAN_DATE + 1000;
  const result = modules.computePorkchopGrid(
    body.elements,
    {
      depStartJD: depJD,
      depEndJD: depJD,
      tofMinDays: 400,
      tofMaxDays: 400,
      nDep: 1,
      nTof: 1,
    },
    1,
    {
      nowMs: (() => {
        let tick = 0;
        return () => (tick += 5);
      })(),
      getEarthStateAtTdbSeconds: (tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: 1.2e11, y: 0, z: 0 },
        velocityMps: { x: 0, y: 30_000, z: 0 },
      }),
      propagateTargetStateAtTdbSeconds: (_bodyElements, tdbSeconds) => ({
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds,
        positionM: { x: 0, y: 1.4e11, z: 0 },
        velocityMps: { x: -20_000, y: 0, z: 0 },
      }),
      solveLambert: () => ({
        M: 1,
        branches: [
          { branch: 'left', converged: false, x: -0.25, v1: [25, 1, 0], v2: [22, -2, 0] },
          { branch: 'right', converged: false, x: 0.25, v1: [26, 2, 0], v2: [21, -1, 0] },
        ],
      }),
    },
  );

  assert.equal(result.compute_ms, 5);
  assert.equal(result.cells.length, 1);
  assert.equal(result.cells[0].status, 'stall');
  assert.equal(result.cells[0].selectedBranch, null);
  assert.equal(result.cells[0].branches.length, 2);
  assert.ok(result.cells[0].branches.every((branch) => branch.converged === false));
});

test('porkchop worker init bootstraps Earth state and strips velocity internals from outbound branches', async () => {
  const modules = await loadModules();

  const handlers = new Map();
  const posted = [];
  const fakeScope = {
    addEventListener(type, handler) {
      handlers.set(type, handler);
    },
    postMessage(message) {
      posted.push(message);
    },
  };

  let capturedDeps = null;
  modules.installPorkchopWorker(fakeScope, {
    computeGrid: (_bodyElements, _gridParams, _M, deps) => {
      capturedDeps = deps;
      return {
        compute_ms: 12.5,
        cells: [
          {
            depJD: 2451545,
            tofDays: 200,
            status: 'ok',
            M: 1,
            selectedBranch: 0,
            branches: [
              {
                branch: 'left',
                converged: true,
                c3: 1.23,
                vInfDep: 1.1,
                vInfArr: 2.2,
                // NaN exercises stripBranch's non-finite guard (audit MED-2 / M-A):
                // the posted payload must carry null, never NaN.
                dlaDeg: Number.NaN,
                x: -0.2,
                v1: [1, 2, 3],
                v2: [4, 5, 6],
              },
            ],
          },
        ],
      };
    },
  });

  const onMessage = handlers.get('message');
  assert.equal(typeof onMessage, 'function');

  const earthStateSeries = [
    {
      frame: 'FRAME_HELIO_J2000_ICRF',
      tdbSeconds: 0,
      positionM: { x: 1, y: 2, z: 3 },
      velocityMps: { x: 4, y: 5, z: 6 },
    },
  ];

  onMessage({ data: { type: 'init', earthStateSeries } });
  assert.deepEqual(posted.shift(), {
    type: 'ready',
    earthSampleCount: 1,
  });

  onMessage({
    data: {
      type: 'compute-grid',
      direction: 'outbound',
      bodyId: 'asteroid-99942',
      bodyElements: {
        aM: 1,
        e: 0.1,
        iRad: 0,
        omRad: 0,
        wRad: 0,
        maRad: 0,
        epochTdbSeconds: 0,
      },
      gridParams: {
        depStartJD: 2451545,
        depEndJD: 2451545,
        tofMinDays: 200,
        tofMaxDays: 200,
        nDep: 1,
        nTof: 1,
      },
      M: 1,
    },
  });

  assert.ok(capturedDeps, 'worker should pass ephemeris dependencies into computeGrid');
  assert.deepEqual(capturedDeps.getEarthStateAtTdbSeconds(0), earthStateSeries[0]);

  assert.deepEqual(posted.shift(), {
    type: 'grid-result',
    direction: 'outbound',
    bodyId: 'asteroid-99942',
    M: 1,
    compute_ms: 12.5,
    cells: [
      {
        depJD: 2451545,
        tofDays: 200,
        status: 'ok',
        M: 1,
        selectedBranch: 0,
        branches: [
          {
            branch: 'left',
            converged: true,
            c3: 1.23,
            vInfDep: 1.1,
            vInfArr: 2.2,
            dlaDeg: null,
            x: -0.2,
          },
        ],
      },
    ],
  });
});

test('porkchop worker return direction preserves vectors, endpoint epochs, and Earth-span count', async () => {
  const modules = await loadModules();
  const handlers = new Map();
  const posted = [];
  const fakeScope = {
    addEventListener(type, handler) {
      handlers.set(type, handler);
    },
    postMessage(message) {
      posted.push(message);
    },
  };

  modules.installPorkchopWorker(fakeScope, {
    computeReturnGrid: (_bodyElements, _gridParams, _M, deps) => {
      assert.deepEqual(deps.getEarthStateAtTdbSeconds(0), {
        frame: 'FRAME_HELIO_J2000_ICRF',
        tdbSeconds: 0,
        positionM: { x: 1, y: 2, z: 3 },
        velocityMps: { x: 4, y: 5, z: 6 },
      });
      return {
        earthSpanRefusedCount: 1,
        compute_ms: 7.5,
        cells: [
          {
            depJD: 2451545,
            tofDays: 200,
            status: 'ok',
            M: 0,
            asteroidDepartureTdbSeconds: 100,
            earthArrivalTdbSeconds: 17_280_100,
            branches: [
              {
                branch: 'single',
                converged: true,
                asteroidDepartureTdbSeconds: 100,
                earthArrivalTdbSeconds: 17_280_100,
                vInfE: [31, 32, 33],
                vInfEKmps: 55.42562584220407,
                arrivalC3: 3072,
                vInfAsteroidDeparture: [41, 42, 43],
                vInfAsteroidDepartureKmps: 72.06941098690994,
                v1: [51, 52, 53],
                v2: [61, 62, 63],
                M: 0,
                muKm3S2: 1.32712440018e11,
                arrivalDeclinationDeg: 27.123,
                elementProvenance: null,
                tier: null,
                support: false,
                notEvaluated: {
                  bPlane: null,
                  entryFlightPathAngle: null,
                  entryLocation: null,
                  atmosphereRelativeEntrySpeed: null,
                  earthMoonCapture: null,
                  catchFeasibility: null,
                },
              },
            ],
            selectedBranch: 0,
          },
        ],
      };
    },
  });

  const onMessage = handlers.get('message');
  assert.equal(typeof onMessage, 'function');
  const earthStateSeries = [
    {
      frame: 'FRAME_HELIO_J2000_ICRF',
      tdbSeconds: 0,
      positionM: { x: 1, y: 2, z: 3 },
      velocityMps: { x: 4, y: 5, z: 6 },
    },
  ];
  onMessage({ data: { type: 'init', earthStateSeries } });
  posted.shift();
  onMessage({
    data: {
      type: 'compute-grid',
      direction: 'return',
      bodyId: 'asteroid-99942',
      bodyElements: {
        aM: 1,
        e: 0.1,
        iRad: 0,
        omRad: 0,
        wRad: 0,
        maRad: 0,
        epochTdbSeconds: 0,
      },
      gridParams: {
        depStartJD: 2451545,
        depEndJD: 2451545,
        tofMinDays: 200,
        tofMaxDays: 200,
        nDep: 1,
        nTof: 1,
      },
      M: 0,
    },
  });

  assert.deepEqual(posted.shift(), {
    type: 'grid-result',
    direction: 'return',
    bodyId: 'asteroid-99942',
    M: 0,
    earthSpanRefusedCount: 1,
    compute_ms: 7.5,
    cells: [
      {
        depJD: 2451545,
        tofDays: 200,
        status: 'ok',
        M: 0,
        asteroidDepartureTdbSeconds: 100,
        earthArrivalTdbSeconds: 17_280_100,
        branches: [
          {
            branch: 'single',
            converged: true,
            asteroidDepartureTdbSeconds: 100,
            earthArrivalTdbSeconds: 17_280_100,
            vInfE: [31, 32, 33],
            vInfEKmps: 55.42562584220407,
            arrivalC3: 3072,
            vInfAsteroidDeparture: [41, 42, 43],
            vInfAsteroidDepartureKmps: 72.06941098690994,
            v1: [51, 52, 53],
            v2: [61, 62, 63],
            M: 0,
            muKm3S2: 1.32712440018e11,
            arrivalDeclinationDeg: 27.123,
            elementProvenance: null,
            tier: null,
            support: false,
            notEvaluated: {
              bPlane: null,
              entryFlightPathAngle: null,
              entryLocation: null,
              atmosphereRelativeEntrySpeed: null,
              earthMoonCapture: null,
              catchFeasibility: null,
            },
          },
        ],
        selectedBranch: 0,
      },
    ],
  });
});

test('porkchop worker rejects a compute message without an explicit direction', async () => {
  const modules = await loadModules();
  const handlers = new Map();
  const posted = [];
  const fakeScope = {
    addEventListener(type, handler) {
      handlers.set(type, handler);
    },
    postMessage(message) {
      posted.push(message);
    },
  };
  modules.installPorkchopWorker(fakeScope);
  const onMessage = handlers.get('message');
  onMessage({
    data: {
      type: 'compute-grid',
      bodyId: 'asteroid-433',
      bodyElements: {},
      gridParams: {},
      M: 0,
    },
  });
  assert.deepEqual(posted, [
    { type: 'error', reason: 'Porkchop worker requires an explicit compute direction' },
  ]);
});
