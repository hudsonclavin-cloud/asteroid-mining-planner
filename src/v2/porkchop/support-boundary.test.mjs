// L1 support boundary tests (Slice 18 close-out, Item 6 — W4/W5).
//
// The partition is arithmetic on committed numbers: arrival = depJD + tofDays
// against the encounter JD the tier artifact carries. These tests use the
// real 99942 (Apophis) encounter from the artifact and the dedicated page's
// grid geometry, and check the partition BY A DIFFERENT FORMULATION: per
// departure column, the boundary TOF is encounterJd − depJD, and every cell
// at or beyond it must be unsupported, every cell below it supported.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-support-boundary');
const tierArtifactPath = path.join(repoRoot, 'tools', 'slice18-research', 'tier-sizing-per-body.json');

// Dedicated page geometry (app/porkchop/main.ts GRID_PARAMS): 2026-01-01 → 2040-01-01 TDB, 182.5–1826.25 d.
const J2000_TDB_JD = 2451545.0;
const SECONDS_PER_DAY = 86_400;
function utcMidnightToJdTdb(utcDate) {
  const utcSeconds = Date.parse(`${utcDate}T00:00:00Z`) / 1000;
  return J2000_TDB_JD + (utcSeconds - 946_728_000 + 69.184) / SECONDS_PER_DAY;
}
const GRID = {
  depStartJD: utcMidnightToJdTdb('2026-01-01'),
  depEndJD: utcMidnightToJdTdb('2040-01-01'),
  tofMinDays: 182.5,
  tofMaxDays: 1826.25,
  nDep: 200,
  nTof: 100,
};

function linspace(start, end, count) {
  return Array.from({ length: count }, (_, i) => (count === 1 ? start : start + ((end - start) * i) / (count - 1)));
}

/** Cells in grid-compute layout (index = depIdx * nTof + tofIdx), depJD/tofDays only. */
function syntheticCells(grid) {
  const deps = linspace(grid.depStartJD, grid.depEndJD, grid.nDep);
  const tofs = linspace(grid.tofMinDays, grid.tofMaxDays, grid.nTof);
  const cells = [];
  for (const depJD of deps) for (const tofDays of tofs) cells.push({ depJD, tofDays });
  return cells;
}

// Colocated under src/v2 — the architecture import wall forbids tests/helpers.
function runTsc(args) {
  return spawnSync(
    process.execPath,
    [path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'), ...args],
    { cwd: repoRoot, encoding: 'utf8' },
  );
}

let modulesPromise = null;
async function loadModules() {
  if (modulesPromise === null) {
    modulesPromise = (async () => {
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
        path.join(repoRoot, 'src', 'v2', 'porkchop', 'support-boundary.ts'),
      ]);
      assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
      const boundary = await import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'support-boundary.js')).href);
      const records = JSON.parse(fs.readFileSync(tierArtifactPath, 'utf8')).records;
      return { boundary, records };
    })();
  }
  return modulesPromise;
}

test('99942: the boundary comes from the committed artifact, and the partition matches the per-column formulation', async () => {
  const { boundary, records } = await loadModules();
  const apophis = records['99942'];
  assert.equal(apophis.tier, 'L1');
  const b = boundary.supportBoundaryFor(apophis);
  assert.ok(b, 'an L1 body with an encounter yields a boundary');
  assert.equal(b.encounterJd, apophis.encounter.jd);
  assert.equal(b.encounterDateLabel, '2029-04-13');
  assert.equal(b.encounterBody, 'Earth');
  // The encounter lies inside the departure window, so the grid must split both ways.
  assert.ok(b.encounterJd > GRID.depStartJD && b.encounterJd < GRID.depEndJD);

  const cells = syntheticCells(GRID);
  const partition = boundary.partitionCells(cells, b);
  assert.equal(partition.supported + partition.unsupported, cells.length);
  assert.ok(partition.supported > 0 && partition.unsupported > 0);

  // Different formulation: per column, cells at/after the boundary TOF are unsupported.
  let unsupportedByColumn = 0;
  for (let depIndex = 0; depIndex < GRID.nDep; depIndex += 1) {
    const column = cells.slice(depIndex * GRID.nTof, (depIndex + 1) * GRID.nTof);
    const boundaryTof = boundary.boundaryTofDaysAtDeparture(column[0].depJD, b);
    let flipped = false;
    for (const cell of column) {
      const unsupported = cell.tofDays >= boundaryTof;
      assert.equal(boundary.isArrivalAfterEncounter(cell, b), unsupported);
      // Monotone within a column: once unsupported, every longer TOF is unsupported.
      if (flipped) assert.equal(unsupported, true);
      flipped = flipped || unsupported;
      if (unsupported) unsupportedByColumn += 1;
    }
  }
  assert.equal(partition.unsupported, unsupportedByColumn);
  // Departures after the encounter are unsupported at EVERY TOF (arrival is later still).
  const lateColumns = cells.filter((cell) => cell.depJD >= b.encounterJd);
  assert.ok(lateColumns.length > 0);
  assert.ok(lateColumns.every((cell) => boundary.isArrivalAfterEncounter(cell, b)));
});

test('edge behaviour: an encounter before the window makes every cell unsupported; after the last arrival, none', async () => {
  const { boundary } = await loadModules();
  const cells = syntheticCells(GRID);
  const before = { encounterJd: GRID.depStartJD - 1, encounterDateLabel: '2025-12-31', encounterBody: 'Earth' };
  const after = { encounterJd: GRID.depEndJD + GRID.tofMaxDays + 1, encounterDateLabel: '2045-01-02', encounterBody: 'Earth' };
  assert.deepEqual(boundary.partitionCells(cells, before), { supported: 0, unsupported: cells.length });
  assert.deepEqual(boundary.partitionCells(cells, after), { supported: cells.length, unsupported: 0 });
  // Arrival exactly at the encounter is not before it.
  const exact = { depJD: 2461000, tofDays: 200 };
  assert.equal(boundary.isArrivalAfterEncounter(exact, { encounterJd: 2461200, encounterDateLabel: 'x', encounterBody: 'Earth' }), true);
  assert.equal(boundary.isArrivalAfterEncounter(exact, { encounterJd: 2461200.0001, encounterDateLabel: 'x', encounterBody: 'Earth' }), false);
});

test('no boundary is invented: non-L1 tiers and records without an encounter yield undefined', async () => {
  const { boundary, records } = await loadModules();
  assert.equal(boundary.supportBoundaryFor(records['433']), undefined, 'L2 unmeasured');
  assert.equal(boundary.supportBoundaryFor(records['2018 LA']), undefined, 'L0');
  assert.equal(boundary.supportBoundaryFor(null), undefined);
  assert.equal(boundary.supportBoundaryFor({ des: 'x', tier: 'L1', subReason: 'materially-degraded-delta-v', classification: 'material' }), undefined, 'L1 without encounter');
  // Every L1 body in the artifact yields a boundary; no other tier does.
  const entries = Object.values(records);
  const withBoundary = entries.filter((record) => boundary.supportBoundaryFor(record) !== undefined);
  assert.equal(withBoundary.length, 10_150);
  assert.ok(withBoundary.every((record) => record.tier === 'L1'));
});

test('the unsupported-cell sentence is verbatim', async () => {
  const { boundary } = await loadModules();
  assert.equal(
    boundary.unsupportedCellMessage({ encounterJd: 0, encounterDateLabel: '2029-04-13', encounterBody: 'Earth' }),
    "Arrival is after this object's 2029-04-13 encounter. This cell is computed from an orbit that encounter invalidates.",
  );
});
