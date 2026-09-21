// Propagation guard regression tests (Slice 18 close-out, Item 1).
//
// WHY THESE SHAPES:
//  * The guard is a hand-copied mirror of keplerian.ts validateKeplerianElements.
//    A mirror drifts silently, so the first test verifies it BY A DIFFERENT
//    METHOD: it propagates every one of the 41,906 catalog bodies at its own
//    element epoch and asserts "propagator threw RangeError" <=> "guard
//    refused", body by body. If the propagator's precondition ever changes,
//    this fails.
//  * 2015 D1 (C/2015 D1 (SOHO), e = 1.0035, a < 0) is the one catalog body that
//    fails. Before Item 1, computeCompareData THREW on it — "RangeError: aM must
//    be > 0 for elliptical Kepler propagation" — taking every other body's
//    result down with it, and PorkchopView surfaced the same raw throw. The
//    third test pins the refusal-as-value, in place, row never omitted.
//  * 433 and 2018 LA must be byte-identical to the pre-guard path. The third
//    test checks their compare grid cells deep-equal the historical
//    computePorkchopGrid output on the same geometry and dependencies.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

// Colocated under src/v2, so the architecture import wall
// (tests/v2-architecture.test.mjs) forbids importing tests/helpers/run-tsc.mjs.
// Same contract as that helper: spawn the real tsc JS entry, never the
// Windows .bin shim (which returns status:null under spawnSync).
function runTsc(args) {
  return spawnSync(
    process.execPath,
    [path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'), ...args],
    { cwd: repoRoot, encoding: 'utf8' },
  );
}
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-propagation-guard');
const neaFixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const horizonsFixturePath = path.join(repoRoot, 'src', 'v2', 'data', 'horizons-inner-solar-system-2026-2040.json');

const HYPERBOLIC_BODY_ID = 'asteroid-2015 D1';
const VERBATIM_2015_D1_MESSAGE =
  'Aster cannot propagate this object. Its eccentricity is 1.0035, which is not an elliptical orbit. No transfer windows are computed.';

// DEC-17-2 anchor (span.requested.start), as the compare page uses it.
const REQUESTED_START_JD = 2461041.500800741;

function compileModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'porkchop', 'propagation-guard.ts'),
    path.join(repoRoot, 'src', 'v2', 'porkchop', 'compare-data.ts'),
    path.join(repoRoot, 'src', 'v2', 'porkchop', 'grid-compute.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
  ]);
  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

async function importJs(relPath) {
  return import(pathToFileURL(path.join(tempOutDir, relPath)).href);
}

let modulesPromise = null;
async function loadModules() {
  if (modulesPromise === null) {
    compileModules();
    modulesPromise = (async () => {
      const [guard, compareData, gridCompute, keplerian, hermite, horizons, slice9, units] = await Promise.all([
        importJs('porkchop/propagation-guard.js'),
        importJs('porkchop/compare-data.js'),
        importJs('porkchop/grid-compute.js'),
        importJs('core/propagators/keplerian.js'),
        importJs('core/interpolators/hermite.js'),
        importJs('boundary/horizons.js'),
        importJs('boundary/slice9-nea-catalog.js'),
        importJs('core/units.js'),
      ]);
      const catalog = slice9.ingestSlice9Fixture(JSON.parse(fs.readFileSync(neaFixturePath, 'utf8')));
      const horizonsStates = horizons.ingestSlice2Fixture(JSON.parse(fs.readFileSync(horizonsFixturePath, 'utf8')));
      const earthSeries = horizonsStates.earth.map((sample) => sample.state);
      return { guard, compareData, gridCompute, keplerian, hermite, units, catalog, earthSeries };
    })();
  }
  return modulesPromise;
}

test('guard agrees with the propagator on every catalog body (verified by propagating, not by reading the guard)', async () => {
  const { guard, keplerian, catalog } = await loadModules();
  const bodies = Object.values(catalog.asteroids);
  assert.equal(bodies.length, 41_906, 'the whole committed catalog, not a sample');

  const refused = [];
  const disagreements = [];
  for (const body of bodies) {
    const verdict = guard.assessPropagation(body.elements);
    let thrown = null;
    try {
      keplerian.propagateKeplerianStateVectors(body.elements, body.elements.epochTdbSeconds);
    } catch (error) {
      thrown = error;
    }
    if (thrown !== null && !(thrown instanceof RangeError)) {
      throw thrown; // anything but the precondition RangeError is a harness bug
    }
    const propagatorRefused = thrown !== null;
    if (propagatorRefused !== !verdict.propagatable) {
      disagreements.push(`${body.designation}: propagator ${propagatorRefused ? 'threw' : 'accepted'}, guard ${verdict.propagatable ? 'accepted' : 'refused'}`);
    }
    if (!verdict.propagatable) {
      refused.push(body.designation);
    }
  }
  assert.deepEqual(disagreements, [], 'guard and propagator must never disagree');
  assert.deepEqual(refused, ['2015 D1'], 'exactly the one hyperbolic body in the catalog');
});

test('2015 D1: the verdict carries the catalog eccentricity and the verbatim sentence', async () => {
  const { guard, keplerian, catalog } = await loadModules();
  const body = catalog.asteroids[HYPERBOLIC_BODY_ID];
  assert.ok(body, `${HYPERBOLIC_BODY_ID} must be in the catalog fixture`);

  const verdict = guard.assessPropagation(body.elements);
  assert.equal(verdict.propagatable, false);
  assert.equal(verdict.eccentricity, body.elements.e, 'unrounded catalog value, not a literal');
  assert.ok(verdict.eccentricity >= 1, 'hyperbolic');
  assert.equal(verdict.message, VERBATIM_2015_D1_MESSAGE);
  // The FIRST failing check, in the propagator's own order: aM <= 0 trips before the e range.
  assert.equal(verdict.reason, 'non-positive-semi-major-axis');
  assert.throws(
    () => keplerian.propagateKeplerianStateVectors(body.elements, body.elements.epochTdbSeconds),
    /aM must be > 0/,
    'the propagator complains about aM first, matching the guard order',
  );
});

test('message rounds the eccentricity to 4 decimals and invents nothing for a non-finite one', async () => {
  const { guard } = await loadModules();
  assert.equal(guard.propagationRefusalMessage(1.003535566834499), VERBATIM_2015_D1_MESSAGE);
  assert.equal(guard.formatEccentricityForRefusal(1.003535566834499), '1.0035');
  assert.equal(guard.formatEccentricityForRefusal(Number.NaN), 'NaN');
  assert.equal(guard.formatEccentricityForRefusal(Number.POSITIVE_INFINITY), 'Infinity');
});

test('computeCompareData: 2015 D1 is refused as a value in place; 433 and 2018 LA are byte-identical to the historical path', async () => {
  const { compareData, gridCompute, keplerian, hermite, units, catalog, earthSeries } = await loadModules();
  const eros = catalog.asteroids['asteroid-433'];
  const hyperbolic = catalog.asteroids[HYPERBOLIC_BODY_ID];
  const la2018 = catalog.asteroids['asteroid-2018 LA'];
  assert.ok(eros && hyperbolic && la2018, 'all three regression bodies must be in the catalog fixture');

  const propagatedElements = [];
  const deps = {
    getEarthStateAtTdbSeconds: (tdbSeconds) => hermite.interpolateBodyStateSeries('earth', earthSeries, tdbSeconds),
    propagateTargetStateAtTdbSeconds: (bodyElements, tdbSeconds) => {
      propagatedElements.push(bodyElements);
      return keplerian.propagateKeplerianStateVectors(bodyElements, tdbSeconds);
    },
    nowMs: () => 0,
  };
  const tdbSecondsToJd = (seconds) => units.J2000_TDB_JULIAN_DATE + seconds / units.SECONDS_PER_DAY;
  const gridParams = {
    depStartJD: REQUESTED_START_JD,
    depEndJD: REQUESTED_START_JD + 28.016438356164384,
    tofMinDays: 182.5,
    tofMaxDays: 215.70707070707072,
    nDep: 5,
    nTof: 3,
  };
  const params = {
    depStartJdTdb: gridParams.depStartJD,
    depEndJdTdb: gridParams.depEndJD,
    nDep: gridParams.nDep,
    nTof: gridParams.nTof,
    tofMinDays: gridParams.tofMinDays,
    tofMaxDays: gridParams.tofMaxDays,
    M: 0,
    thresholdMode: 'absolute',
    deltaKm2S2: 5,
    absoluteKm2S2: 1e6, // wide open: this test is about the gate, not the windows
    bMinCells: 1,
    earthSpanJdTdb: {
      firstSample: tdbSecondsToJd(earthSeries[0].tdbSeconds),
      lastSample: tdbSecondsToJd(earthSeries[earthSeries.length - 1].tdbSeconds),
    },
    vehicle: {
      name: 'Test LV', config: 'expendable', site: 'test', fairingM: 5,
      curve: [{ c3: 0, payloadKg: 10000 }, { c3: 60, payloadKg: 1000 }],
      source: 'test fixture', asOf: '2026-01-01',
    },
    dvBudget: { rendezvousMps: 1000, stationkeepingMps: 150, marginMps: 100 },
  };
  const bodies = [eros, hyperbolic, la2018].map((body) => ({ bodyId: body.bodyId, bodyElements: body.elements }));

  let results;
  assert.doesNotThrow(() => {
    results = compareData.computeCompareData(bodies, params, deps);
  }, 'the hyperbolic body must no longer take the whole compare down');

  assert.deepEqual(results.map((r) => r.bodyId), bodies.map((b) => b.bodyId), 'every body, in input order — never omitted');
  assert.deepEqual(results[1], {
    ok: false,
    bodyId: HYPERBOLIC_BODY_ID,
    reason: 'not-propagatable',
    detail: VERBATIM_2015_D1_MESSAGE,
  });
  assert.ok(
    !propagatedElements.includes(hyperbolic.elements),
    'the propagator must never be handed the hyperbolic elements',
  );

  for (const [index, body] of [[0, eros], [2, la2018]]) {
    const result = results[index];
    assert.equal(result.ok, true, `${body.designation} must compute`);
    // Same geometry, same deps, same M: the pre-guard call is exactly this one.
    const historical = gridCompute.computePorkchopGrid(body.elements, gridParams, 0, deps);
    assert.deepEqual(result.grid.cells, historical.cells, `${body.designation} cells byte-identical to the historical path`);
  }
});
