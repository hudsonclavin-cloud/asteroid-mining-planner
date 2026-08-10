// A3 compare data layer tests (S-S17-A3-2026-08-08-A).
//
// These tests pin the four entry conditions the G-A2 audit made binding
// (SLICE_17_FOUNDING.md §8, 2026-08-08 gate-closure record) plus DEC-17-10
// bounds refusal, the DEC-17-6 cap, and serial determinism.
//
// No real Lambert solving happens here. `deps.solveLambert` is stubbed so each
// cell's C3 is exactly controllable: mapBranches computes
// c3 = |v1 - earthVelocity|², so with a zero Earth velocity and v1 = [k,0,0]
// the cell's C3 is exactly k². That keeps these tests about ORCHESTRATION —
// index order, epoch anchoring, injection, echo, refusal — and leaves the
// solver's own correctness to its own suites.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-compare-data');

function compileModule() {
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
    path.join(repoRoot, 'src', 'v2', 'porkchop', 'compare-data.ts'),
  ]);
  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let modules = null;
async function loadModules() {
  if (modules === null) {
    compileModule();
    const compareData = await import(
      pathToFileURL(path.join(tempOutDir, 'porkchop', 'compare-data.js')).href
    );
    const gridCompute = await import(
      pathToFileURL(path.join(tempOutDir, 'porkchop', 'grid-compute.js')).href
    );
    const segmentWindows = await import(
      pathToFileURL(path.join(tempOutDir, 'porkchop', 'segment-windows.js')).href
    );
    const launchVehicles = await import(
      pathToFileURL(path.join(tempOutDir, 'porkchop', 'launch-vehicles.js')).href
    );
    modules = { compareData, gridCompute, segmentWindows, launchVehicles };
  }
  return modules;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

// DEC-17-2 locked anchors. These two differ by 69.184 s and live one field
// apart in tools/slice17-research/data/s17-structure-7day.json.
const REQUESTED_START_JD = 2461041.500800741; // span.requested.start  — CORRECT (D-02)
const FIXTURE_BOUNDS_FIRST_JD = 2461041.5;    // span.fixtureBounds.first — WRONG anchor
const EARTH_SPAN = { firstSample: 2461041.5, lastSample: 2466519.5 };

const ZERO_STATE = {
  positionM: { x: 1.495978707e11, y: 0, z: 0 },
  velocityMps: { x: 0, y: 0, z: 0 },
};

const ELEMENTS = {
  aAu: 1.1,
  e: 0.1,
  iDeg: 2,
  omDeg: 10,
  wDeg: 20,
  maDeg: 30,
  epochJdTdb: REQUESTED_START_JD,
};

/** Stub solver whose C3 is a pure function of the call index. grid-compute
 * calls it exactly once per cell. */
function makeDeps(c3ForCallIndex) {
  let callIndex = 0;
  return {
    getEarthStateAtTdbSeconds: () => ZERO_STATE,
    propagateTargetStateAtTdbSeconds: () => ({
      positionM: { x: 2e11, y: 0, z: 0 },
      velocityMps: { x: 0, y: 0, z: 0 },
    }),
    solveLambert: () => {
      const c3 = c3ForCallIndex(callIndex);
      callIndex += 1;
      if (c3 === null) {
        return null;
      }
      return {
        branches: [
          {
            branch: 'single',
            converged: true,
            x: 0,
            v1: [Math.sqrt(c3), 0, 0],
            v2: [0, 0, 0],
          },
        ],
      };
    },
    nowMs: () => 0,
  };
}

const VEHICLE = {
  name: 'Test LV',
  config: 'expendable',
  site: 'test',
  fairingM: 5,
  curve: [
    { c3: 0, payloadKg: 10000 },
    { c3: 60, payloadKg: 1000 },
  ],
  source: 'test fixture',
  asOf: '2026-01-01',
};

const DV_BUDGET = { rendezvousMps: 1000, stationkeepingMps: 150, marginMps: 100 };

function baseParams(overrides = {}) {
  return {
    depStartJdTdb: REQUESTED_START_JD,
    depEndJdTdb: REQUESTED_START_JD + 28.016438356164384, // 5 columns @ 7.004109589041096 d
    nDep: 5,
    nTof: 3,
    tofMinDays: 182.5,
    tofMaxDays: 215.70707070707072,
    M: 0,
    thresholdMode: 'relative',
    deltaKm2S2: 5,
    absoluteKm2S2: 25,
    bMinCells: 2,
    earthSpanJdTdb: EARTH_SPAN,
    vehicle: VEHICLE,
    dvBudget: DV_BUDGET,
    ...overrides,
  };
}

const BODY = { bodyId: 'test-1', bodyElements: ELEMENTS };

/** Hand-build a PorkchopCell array in GRID-COMPUTE layout (index = dep*nTof + tof). */
function buildPorkchopCells(nDep, nTof, c3At) {
  const cells = new Array(nDep * nTof);
  for (let depIdx = 0; depIdx < nDep; depIdx += 1) {
    for (let tofIdx = 0; tofIdx < nTof; tofIdx += 1) {
      const c3 = c3At(depIdx, tofIdx);
      cells[depIdx * nTof + tofIdx] = {
        depJD: REQUESTED_START_JD + depIdx,
        tofDays: 182.5 + tofIdx,
        status: c3 === null ? 'no_solution' : 'ok',
        M: 0,
        branches: c3 === null
          ? []
          : [{ branch: 'single', converged: true, c3, vInfDep: Math.sqrt(c3), vInfArr: 0, dlaDeg: 0, x: 0, v1: [0, 0, 0], v2: [0, 0, 0] }],
        selectedBranch: c3 === null ? null : 0,
      };
    }
  }
  return cells;
}

// ---------------------------------------------------------------------------
// Layout provenance — non-circular evidence for D-01
// ---------------------------------------------------------------------------

test('grid-compute fills TOF-fastest (index = depIdx * nTof + tofIdx)', async () => {
  const { gridCompute } = await loadModules();
  const params = baseParams();
  // depJD / tofDays are recorded per cell regardless of solver outcome, so a
  // null-returning solver still proves the fill order.
  const result = gridCompute.computePorkchopGrid(
    ELEMENTS,
    {
      depStartJD: params.depStartJdTdb,
      depEndJD: params.depEndJdTdb,
      tofMinDays: params.tofMinDays,
      tofMaxDays: params.tofMaxDays,
      nDep: params.nDep,
      nTof: params.nTof,
    },
    0,
    makeDeps(() => null),
  );

  assert.equal(result.cells.length, 15);
  // Consecutive cells share a departure and differ in TOF => TOF varies fastest.
  assert.equal(result.cells[0].depJD, result.cells[1].depJD);
  assert.notEqual(result.cells[0].tofDays, result.cells[1].tofDays);
  // Stepping by nTof advances the departure by exactly one column.
  assert.notEqual(result.cells[0].depJD, result.cells[params.nTof].depJD);
  assert.equal(result.cells[0].tofDays, result.cells[params.nTof].tofDays);
});

test('D-01 toSegmentGrid remaps grid-compute layout to departure-fastest', async () => {
  const { compareData } = await loadModules();
  const nDep = 5;
  const nTof = 3;
  // Tag exactly one cell: departure column 3, TOF row 1.
  const cells = buildPorkchopCells(nDep, nTof, (d, t) => (d === 3 && t === 1 ? 1 : 99));
  const grid = compareData.toSegmentGrid(cells, {
    nDep, nTof, depStartJd: REQUESTED_START_JD, depCellDays: 7, tofMinDays: 182.5, tofCellDays: 16,
  });

  // segment-windows layout: index = depIdx + nDep * tofIdx
  assert.equal(grid.cells[3 + nDep * 1].c3, 1, 'tagged cell must land at depIdx + nDep*tofIdx');
  // The transposed position must NOT hold it.
  assert.notEqual(grid.cells[3 * nTof + 1].c3, 1);
});

test('D-01 LOCK: breadth is measured on the DEPARTURE axis (asymmetric grid)', async () => {
  const { compareData, segmentWindows } = await loadModules();
  const nDep = 5;
  const nTof = 3;
  assert.notEqual(nDep, nTof, 'the lock is meaningless on a square grid');

  // One low-C3 run spanning departure columns 1..4 at TOF row 1 only.
  const inWindow = (d, t) => t === 1 && d >= 1 && d <= 4;
  const cells = buildPorkchopCells(nDep, nTof, (d, t) => (inWindow(d, t) ? 1 : 99));

  const grid = compareData.toSegmentGrid(cells, {
    nDep, nTof, depStartJd: REQUESTED_START_JD, depCellDays: 7, tofMinDays: 182.5, tofCellDays: 16,
  });
  const out = segmentWindows.segmentWindows(grid, {
    thresholdMode: 'absolute', absoluteKm2S2: 50, connectivity: 8, bMinCells: 2,
  });

  assert.equal(out.components.length, 1);
  const [component] = out.components;
  assert.equal(component.cellCount, 4);
  assert.equal(component.breadthCells, 4, 'component spans 4 DEPARTURE columns');
  assert.equal(component.breadthDays, 3 * 7, 'A2: (breadthCells - 1) * depCellDays');
  assert.equal(component.tofSpanDays, 0, 'component occupies a single TOF row');

  // Discrimination proof: feeding the SAME cells element-wise (the transpose a
  // naive .map would produce) reports breadth on the wrong axis. If this
  // assertion ever matches the correct result, the test has stopped locking
  // anything.
  const transposed = segmentWindows.segmentWindows(
    { ...grid, cells: cells.map((c) => ({ c3: c.selectedBranch === null ? null : c.branches[0].c3, converged: c.selectedBranch !== null })) },
    { thresholdMode: 'absolute', absoluteKm2S2: 50, connectivity: 8, bMinCells: 2 },
  );
  assert.notEqual(
    transposed.components[0].breadthCells,
    component.breadthCells,
    'transposed feed must produce a DIFFERENT breadth — otherwise this test cannot fail',
  );
});

// ---------------------------------------------------------------------------
// D-02 — epoch anchor
// ---------------------------------------------------------------------------

/** Segment a single-cell grid anchored at `depStartJd`, returning component 0. */
async function segmentAtAnchor(depStartJd) {
  const { compareData, segmentWindows } = await loadModules();
  const nDep = 5;
  const nTof = 3;
  const cells = buildPorkchopCells(nDep, nTof, (d, t) => (d === 0 && t === 0 ? 1 : 99));
  return segmentWindows.segmentWindows(
    compareData.toSegmentGrid(cells, {
      nDep, nTof, depStartJd, depCellDays: 7.004109589041096, tofMinDays: 182.5, tofCellDays: 16.603535353535353,
    }),
    { thresholdMode: 'absolute', absoluteKm2S2: 50, connectivity: 8, bMinCells: 1 },
  ).components[0];
}

test('D-02 the departure epoch threaded into segmentation is span.requested.start', async () => {
  const { compareData } = await loadModules();
  const nDep = 5;
  const nTof = 3;
  const cells = buildPorkchopCells(nDep, nTof, (d, t) => (d === 0 && t === 0 ? 1 : 99));
  const grid = compareData.toSegmentGrid(cells, {
    nDep, nTof, depStartJd: REQUESTED_START_JD, depCellDays: 7.004109589041096, tofMinDays: 182.5, tofCellDays: 16.603535353535353,
  });

  assert.equal(grid.depStartJd, REQUESTED_START_JD);
  assert.notEqual(grid.depStartJd, FIXTURE_BOUNDS_FIRST_JD);
  const component = await segmentAtAnchor(REQUESTED_START_JD);
  assert.equal(component.argmin.depJd, REQUESTED_START_JD, 'column 0 argmin is the anchor itself');
  assert.equal(component.argmin.dateIso, '2026-01-01', 'the DEC-17-2 span start');
});

test('D-02 BLIND SPOT: column 0 cannot discriminate the two anchors', async () => {
  // Recorded deliberately. jdToIsoDate (segment-windows.ts:94-96) formats a TDB
  // JD as UTC, so its error is forward-only: at column 0 the requested.start
  // anchor renders 2026-01-01T00:01:09.184Z and the fixtureBounds.first anchor
  // renders 2026-01-01T00:00:00.000Z — the SAME calendar date. This is why
  // G-A1's single dateIso assertion could not have caught the defect, and why
  // the sensitivity test below exists instead of a naive anchor comparison.
  const correct = await segmentAtAnchor(REQUESTED_START_JD);
  const wrong = await segmentAtAnchor(FIXTURE_BOUNDS_FIRST_JD);
  assert.equal(correct.argmin.dateIso, wrong.argmin.dateIso, 'both anchors render the same date HERE');
  assert.notEqual(correct.argmin.depJd, wrong.argmin.depJd, 'but the underlying JD differs by 69.184 s');
});

test('D-02 SENSITIVITY: a 69.184 s anchor shift does flip dateIso across a midnight straddle', async () => {
  // The anchor choice is load-bearing wherever a departure column lands within
  // 69.184 s of midnight. Over the locked 731-column grid the requested.start
  // anchor clears every boundary by 49.172 s (closest: column 243), while the
  // fixtureBounds.first anchor flips columns 0 and 730. This test pins the
  // mechanism on a straddling anchor so the suite fails if the offset handling
  // ever changes.
  const TDB_MINUS_UTC_DAYS = 69.184 / 86400;
  const justBeforeMidnight = 2461041.4995;
  const before = await segmentAtAnchor(justBeforeMidnight);
  const after = await segmentAtAnchor(justBeforeMidnight + TDB_MINUS_UTC_DAYS);

  assert.equal(before.argmin.dateIso, '2025-12-31');
  assert.equal(after.argmin.dateIso, '2026-01-01');
  assert.notEqual(before.argmin.dateIso, after.argmin.dateIso);
});

test('D-02 computeCompareData threads the injected anchor into argmin.dateIso', async () => {
  const { compareData } = await loadModules();
  // Only the first cell of the first departure column converges.
  const [result] = compareData.computeCompareData(
    [BODY],
    baseParams({ bMinCells: 1 }),
    makeDeps((i) => (i === 0 ? 1 : 99)),
  );
  assert.equal(result.ok, true);
  assert.equal(result.segmentation.components[0].argmin.dateIso, '2026-01-01');
});

// ---------------------------------------------------------------------------
// D-03 — absolute threshold injection
// ---------------------------------------------------------------------------

test('D-03 injected absoluteKm2S2 is used, never the module default of 25', async () => {
  const { compareData } = await loadModules();
  const [result] = compareData.computeCompareData(
    [BODY],
    baseParams({ thresholdMode: 'absolute', absoluteKm2S2: 12 }),
    makeDeps(() => 1),
  );
  assert.equal(result.ok, true);
  assert.equal(result.segmentation.threshold.mode, 'absolute');
  assert.equal(result.segmentation.threshold.valueKm2S2, 12, 'resolved T is the INJECTED value');
  assert.notEqual(result.segmentation.threshold.valueKm2S2, 25, 'the 25 literal must never leak');
  assert.equal(result.echo.absoluteKm2S2, 12);
});

test('D-03 injection changes membership, proving the value is load-bearing', async () => {
  const { compareData } = await loadModules();
  // Half the cells at C3 = 20: inside a 25 boundary, outside a 12 boundary.
  const deps = () => makeDeps((i) => (i % 2 === 0 ? 20 : 99));
  const at = (absoluteKm2S2) =>
    compareData.computeCompareData(
      [BODY],
      baseParams({ thresholdMode: 'absolute', absoluteKm2S2, bMinCells: 1 }),
      deps(),
    )[0];

  const wide = at(25);
  const narrow = at(12);
  assert.equal(wide.ok, true);
  assert.ok(wide.segmentation.components.length > 0, 'C3=20 cells are members at T=25');
  assert.equal(narrow.ok, true);
  assert.equal(narrow.segmentation.components.length, 0, 'C3=20 cells are holes at T=12');
});

// ---------------------------------------------------------------------------
// D-04 — provenance echo
// ---------------------------------------------------------------------------

test('D-04 echo carries liveMin, delta, absolute, and grid geometry from the computation', async () => {
  const { compareData } = await loadModules();
  const params = baseParams({ bMinCells: 1 });
  const [result] = compareData.computeCompareData(
    [BODY],
    params,
    makeDeps((i) => (i === 0 ? 3.25 : 99)),
  );

  assert.equal(result.ok, true);
  // The fixture realizes c3 through sqrt, so the grid's true min is one ulp
  // below the requested 3.25; asserting 3.25 inverted the test and passed only
  // under back-derivation.
  const realizedMin = Math.sqrt(3.25) ** 2; // what the stub actually builds
  assert.equal(
    result.echo.liveMin,
    realizedMin,
    'liveMin is MEASURED (equals the realized grid min, sqrt(3.25)^2 = ' +
      '3.2499999999999996); back-derivation (threshold − Δ) yields exactly ' +
      '3.25 and must FAIL here',
  );
  assert.equal(result.echo.deltaKm2S2, 5);
  assert.equal(result.echo.absoluteKm2S2, 25);
  assert.equal(result.echo.nDep, 5);
  assert.equal(result.echo.nTof, 3);
  assert.equal(
    result.echo.depCellDays,
    (params.depEndJdTdb - params.depStartJdTdb) / (params.nDep - 1),
    'A2 (N-1) sampling interval',
  );
  // The A2 copy rule needs all three quantities; none may be absent.
  for (const key of ['liveMin', 'deltaKm2S2', 'absoluteKm2S2', 'nDep', 'nTof', 'depCellDays']) {
    assert.ok(key in result.echo, `echo must carry ${key}`);
    assert.notEqual(result.echo[key], undefined, `echo.${key} must not be undefined`);
  }
});

test('D-04 relative-mode threshold equals echoed liveMin + delta', async () => {
  const { compareData } = await loadModules();
  const [result] = compareData.computeCompareData(
    [BODY],
    baseParams({ thresholdMode: 'relative', deltaKm2S2: 5, bMinCells: 1 }),
    makeDeps((i) => (i === 0 ? 3.25 : 99)),
  );
  assert.equal(result.ok, true);
  assert.equal(result.segmentation.threshold.valueKm2S2, result.echo.liveMin + result.echo.deltaKm2S2);
});

// ---------------------------------------------------------------------------
// DEC-17-10 — bounds validation refuses, never clamps, never throws
// ---------------------------------------------------------------------------

test('DEC-17-10 out-of-bounds departure window returns a structured refusal', async () => {
  const { compareData } = await loadModules();
  const results = compareData.computeCompareData(
    [BODY],
    baseParams({ depEndJdTdb: EARTH_SPAN.lastSample + 1 }),
    makeDeps(() => 1),
  );
  assert.equal(results.length, 1);
  const [refusal] = results;
  assert.equal(refusal.ok, false);
  assert.equal(refusal.reason, 'out-of-bounds');
  assert.equal(typeof refusal.detail, 'string');
  assert.ok(refusal.detail.length > 0);
  assert.equal(refusal.bodyId, BODY.bodyId);
});

test('DEC-17-10 refusal is a value — a start before the first sample does not throw', async () => {
  const { compareData } = await loadModules();
  assert.doesNotThrow(() => {
    const [refusal] = compareData.computeCompareData(
      [BODY],
      baseParams({ depStartJdTdb: EARTH_SPAN.firstSample - 1 }),
      makeDeps(() => 1),
    );
    assert.equal(refusal.ok, false);
    assert.equal(refusal.reason, 'out-of-bounds');
  });
});

test('a grid with no converged cell refuses with no-convergence', async () => {
  const { compareData } = await loadModules();
  const [refusal] = compareData.computeCompareData(
    [BODY],
    baseParams(),
    makeDeps(() => null),
  );
  assert.equal(refusal.ok, false);
  assert.equal(refusal.reason, 'no-convergence');
});

// ---------------------------------------------------------------------------
// DEC-17-6 — cap and serial determinism
// ---------------------------------------------------------------------------

test('DEC-17-6 cap: bodies beyond 5 are refused with cap-exceeded, first 5 computed', async () => {
  const { compareData } = await loadModules();
  const bodies = Array.from({ length: 7 }, (_, i) => ({
    bodyId: `body-${i}`,
    bodyElements: ELEMENTS,
  }));
  const results = compareData.computeCompareData(bodies, baseParams({ bMinCells: 1 }), makeDeps(() => 1));

  assert.equal(results.length, 7, 'every input body gets a result — none silently dropped');
  assert.equal(compareData.COMPARE_BODY_CAP, 5);
  for (let i = 0; i < 5; i += 1) {
    assert.equal(results[i].ok, true, `body ${i} within the cap must be computed`);
  }
  for (let i = 5; i < 7; i += 1) {
    assert.equal(results[i].ok, false);
    assert.equal(results[i].reason, 'cap-exceeded');
    assert.equal(results[i].bodyId, `body-${i}`);
  }
});

test('serial orchestration preserves input order and is deterministic', async () => {
  const { compareData } = await loadModules();
  const bodies = ['alpha', 'beta', 'gamma'].map((bodyId) => ({ bodyId, bodyElements: ELEMENTS }));
  const run = () =>
    compareData.computeCompareData(bodies, baseParams({ bMinCells: 1 }), makeDeps((i) => (i % 4 === 0 ? 1 : 99)));

  const first = run();
  const second = run();

  assert.deepEqual(
    first.map((r) => r.bodyId),
    ['alpha', 'beta', 'gamma'],
    'output order matches input order',
  );
  assert.deepEqual(
    first.map((r) => (r.ok ? r.segmentation.components.map((c) => c.minC3) : r.reason)),
    second.map((r) => (r.ok ? r.segmentation.components.map((c) => c.minC3) : r.reason)),
    'two identical runs produce identical segmentation',
  );
  assert.deepEqual(first.map((r) => r.echo?.liveMin), second.map((r) => r.echo?.liveMin));
});

test('deliveredMass is null on NO-PRACTICAL-WINDOW rather than a fabricated number', async () => {
  const { compareData } = await loadModules();
  const params = baseParams({ bMinCells: 2, thresholdMode: 'absolute', absoluteKm2S2: 50 });
  // Three singleton WINDOWS on departure-column semantics, none meeting
  // breadth 2 — mirrors 163693's breadth-binding state.
  const [result] = compareData.computeCompareData(
    [BODY],
    params,
    makeDeps((i) => (Math.floor(i / params.nTof) % 2 === 0 ? 1 : 99)),
  );
  assert.equal(result.ok, true);
  assert.equal(result.segmentation.components.length, 3);
  assert.equal(result.segmentation.bestPractical, null);
  assert.equal(result.deliveredMass, null);
});
