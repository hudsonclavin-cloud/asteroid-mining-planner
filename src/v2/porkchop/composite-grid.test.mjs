import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Spec for the DEC-5 "both" composite selection rule. composite-grid.ts has no
// runtime imports, so it compiles standalone and is exercised here against
// synthetic cells — no worker, no solver, no fixtures.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-composite');

let modulePromise = null;

function compileModule() {
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
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'composite-grid.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(`tsc failed:\n${result.stdout}\n${result.stderr}`);
  }

  return import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'composite-grid.js')).href);
}

function loadModule() {
  if (modulePromise === null) {
    modulePromise = compileModule();
  }
  return modulePromise;
}

/** An `ok` cell whose selected branch carries the given C3. */
function okCell(M, c3, { depJD = 2461041.5, tofDays = 182.5, selectedBranch = 0 } = {}) {
  const branches = selectedBranch === 0 ? [{ c3 }] : [{ c3: c3 + 1000 }, { c3 }];
  return { depJD, tofDays, status: 'ok', M, selectedBranch, branches };
}

function deadCell(M, status, { depJD = 2461041.5, tofDays = 182.5 } = {}) {
  return { depJD, tofDays, status, M, selectedBranch: null, branches: [] };
}

test('both families solve: strictly lower C3 wins', async () => {
  const { compositeGrids } = await loadModule();

  const lowerM1 = compositeGrids([okCell(0, 9)], [okCell(1, 4)]);
  assert.equal(lowerM1.cells[0].M, 1, 'M=1 must win when its C3 is strictly lower');
  assert.equal(lowerM1.counts.m1Won, 1);
  assert.equal(lowerM1.counts.fromM1, 1);

  const lowerM0 = compositeGrids([okCell(0, 4)], [okCell(1, 9)]);
  assert.equal(lowerM0.cells[0].M, 0, 'M=0 must win when its C3 is strictly lower');
  assert.equal(lowerM0.counts.m0Won, 1);
  assert.equal(lowerM0.counts.fromM0, 1);
});

test('exact tie goes to M=0 and is counted', async () => {
  const { compositeGrids } = await loadModule();

  const tied = compositeGrids([okCell(0, 7.5)], [okCell(1, 7.5)]);
  assert.equal(tied.cells[0].M, 0, 'an exact tie must resolve to M=0');
  assert.equal(tied.counts.exactTies, 1, 'the tie must be counted, not passed silently');
  assert.equal(tied.counts.m0Won, 0, 'a tie is not a strict win');
  assert.equal(tied.counts.m1Won, 0);
});

test('only one family solves: that family is taken — the measured defect', async () => {
  const { compositeGrids } = await loadModule();

  // The defect this fixes: M=1 has no solution below T_min, M=0 does.
  const m1Blank = compositeGrids([okCell(0, 12)], [deadCell(1, 'no_solution')]);
  assert.equal(m1Blank.cells[0].status, 'ok', 'a valid M=0 transfer must not render as no_solution');
  assert.equal(m1Blank.cells[0].M, 0);
  assert.equal(m1Blank.counts.onlyM0, 1);

  const m0Blank = compositeGrids([deadCell(0, 'no_solution')], [okCell(1, 12)]);
  assert.equal(m0Blank.cells[0].status, 'ok');
  assert.equal(m0Blank.cells[0].M, 1);
  assert.equal(m0Blank.counts.onlyM1, 1);
});

test('neither solves: no_solution, but a stall is never collapsed (SLICE_11_FOUNDING.md:207)', async () => {
  const { compositeGrids } = await loadModule();

  const bothDead = compositeGrids([deadCell(0, 'no_solution')], [deadCell(1, 'no_solution')]);
  assert.equal(bothDead.cells[0].status, 'no_solution');
  assert.equal(bothDead.counts.neither, 1);
  assert.equal(bothDead.counts.neitherStall, 0);

  const m1Stalled = compositeGrids([deadCell(0, 'no_solution')], [deadCell(1, 'stall')]);
  assert.equal(m1Stalled.cells[0].status, 'stall', 'a stall must survive the composite, not become no_solution');
  assert.equal(m1Stalled.counts.neitherStall, 1);

  const m0Stalled = compositeGrids([deadCell(0, 'stall')], [deadCell(1, 'no_solution')]);
  assert.equal(m0Stalled.cells[0].status, 'stall');
  assert.equal(m0Stalled.counts.neitherStall, 1);
});

test('composite minimum is never worse than either single-family minimum', async () => {
  const { compositeGrids, minSelectedC3 } = await loadModule();

  const m0 = [okCell(0, 30, { tofDays: 182.5 }), okCell(0, 12, { tofDays: 212.5 }), deadCell(0, 'no_solution', { tofDays: 242.5 })];
  const m1 = [okCell(1, 8, { tofDays: 182.5 }), deadCell(1, 'no_solution', { tofDays: 212.5 }), okCell(1, 40, { tofDays: 242.5 })];

  const { cells } = compositeGrids(m0, m1);
  const compositeMin = minSelectedC3(cells).c3;
  const m0Min = minSelectedC3(m0).c3;
  const m1Min = minSelectedC3(m1).c3;

  assert.ok(compositeMin <= m0Min, `composite ${compositeMin} must be <= M=0 min ${m0Min}`);
  assert.ok(compositeMin <= m1Min, `composite ${compositeMin} must be <= M=1 min ${m1Min}`);
  assert.equal(compositeMin, 8);
});

test('per-cell provenance: every ok cell carries the M that produced it', async () => {
  const { compositeGrids } = await loadModule();

  const { cells } = compositeGrids(
    [okCell(0, 5, { tofDays: 182.5 }), okCell(0, 50, { tofDays: 212.5 })],
    [okCell(1, 9, { tofDays: 182.5 }), okCell(1, 6, { tofDays: 212.5 })],
  );

  assert.equal(cells[0].M, 0, 'cell 0 came from M=0');
  assert.equal(cells[1].M, 1, 'cell 1 came from M=1');
});

test('AMD-2: the compared C3 is the selected branch, not branch 0', async () => {
  const { compositeGrids, selectedC3 } = await loadModule();

  // M=1 cell whose selectedBranch is 1 (branch 0 is the worse right/left branch).
  const m1 = okCell(1, 3, { selectedBranch: 1 });
  assert.equal(selectedC3(m1), 3, 'selectedC3 must read branches[selectedBranch]');
  assert.equal(m1.branches[0].c3, 1003, 'branch 0 is deliberately worse');

  const { cells } = compositeGrids([okCell(0, 500)], [m1]);
  assert.equal(cells[0].M, 1, 'selection must use the selected branch (3), not branch 0 (1003)');
});

test('misaligned or mismatched grids throw rather than mis-pair cells', async () => {
  const { compositeGrids } = await loadModule();

  assert.throws(() => compositeGrids([okCell(0, 1)], []), /length mismatch/);
  assert.throws(
    () => compositeGrids([okCell(0, 1, { tofDays: 182.5 })], [okCell(1, 1, { tofDays: 999 })]),
    /misalignment/,
  );
});

test('counts account for every cell exactly once', async () => {
  const { compositeGrids } = await loadModule();

  const m0 = [okCell(0, 5, { tofDays: 1 }), okCell(0, 50, { tofDays: 2 }), deadCell(0, 'no_solution', { tofDays: 3 }), deadCell(0, 'no_solution', { tofDays: 4 })];
  const m1 = [okCell(1, 9, { tofDays: 1 }), okCell(1, 6, { tofDays: 2 }), okCell(1, 20, { tofDays: 3 }), deadCell(1, 'no_solution', { tofDays: 4 })];

  const { counts } = compositeGrids(m0, m1);
  assert.equal(counts.total, 4);
  assert.equal(counts.fromM0 + counts.fromM1, counts.total, 'every cell must come from exactly one family');
  assert.equal(counts.m0Won + counts.m1Won + counts.exactTies + counts.onlyM0 + counts.onlyM1 + counts.neither, counts.total);
});
