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

function buildDeps(modules, earthSeries) {
  return {
    getEarthStateAtTdbSeconds: (tdbSeconds) =>
      modules.interpolateBodyStateSeries('earth', earthSeries, tdbSeconds),
    propagateTargetStateAtTdbSeconds: (bodyElements, tdbSeconds) =>
      modules.propagateKeplerianStateVectors(bodyElements, tdbSeconds),
  };
}

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
