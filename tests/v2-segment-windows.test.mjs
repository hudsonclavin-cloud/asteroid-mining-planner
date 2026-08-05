// A1 segmentWindows tests (S-S17-A1-2026-08-05-A).
//
// FIXTURE PROVENANCE: the "artifact" blocks below carry the numeric VALUES
// verbatim from tools/slice17-research/data/s17-structure-7day.json,
// committed at 806745c (extraction: tools/overnight-2026-08-05/
// L3_A1_FIXTURES.md), with two shape mappings: the artifact's argmin key
// `date` is written `dateIso` here, and `breadthCells` (NOT stored in the
// artifact) is derived per the L3 rule round(breadthDays/depCellDays)+1.
// The 'artifact cross-check' test below READS the committed JSON at runtime
// and verifies every pasted constant against it, so regeneration of the
// artifact cannot silently strand these constants.
// The artifact stores COMPONENT SUMMARIES ONLY — no per-cell grid data
// (verified by exhaustive key walk, L3). Per the dispatch, the
// artifact-fixture tests therefore assert against summaries — threshold
// resolution, derivation rules, B_min classification, and sort order — and
// deliberately do NOT fabricate cell grids to force a segmentation match.
// Grid-level segmentation semantics are covered by the synthetic tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-segment-windows');

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
    path.join(repoRoot, 'src', 'v2', 'porkchop', 'segment-windows.ts'),
  ]);
  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let mod = null;
async function loadModule() {
  if (mod === null) {
    compileModule();
    mod = await import(
      pathToFileURL(path.join(tempOutDir, 'porkchop', 'segment-windows.js')).href
    );
  }
  return mod;
}

// Grid geometry from the artifact (L3). DEP_CELL_DAYS / TOF_CELL_DAYS /
// DEP_START_JD are stored fields; TOF_MIN_DAYS is INFERRED (L3 §1: the TOF
// grid minimum is not a stored field — inferred from minimum observed
// argmin tofDays).
const DEP_CELL_DAYS = 7.004109589041096;
const TOF_CELL_DAYS = 16.603535353535353;
const DEP_START_JD = 2461041.500800741;
const TOF_MIN_DAYS = 182.5;

function makeGrid(nDep, nTof, cellFn) {
  const cells = [];
  for (let tof = 0; tof < nTof; tof++) {
    for (let dep = 0; dep < nDep; dep++) {
      cells.push(cellFn(dep, tof));
    }
  }
  return {
    nDep,
    nTof,
    depStartJd: DEP_START_JD,
    depCellDays: DEP_CELL_DAYS,
    tofMinDays: TOF_MIN_DAYS,
    tofCellDays: TOF_CELL_DAYS,
    cells,
  };
}
const member = (c3) => ({ c3, converged: true });
// Hole cells carry a c3 BELOW every threshold the tests use, so the
// `converged` flag itself is load-bearing: if membership or liveGridMin
// ever stopped checking convergence, holes would join components / drag the
// relative threshold down and tests would fail.
const hole = () => ({ c3: 0.25, converged: false });

// ---------------------------------------------------------------- synthetic

test('empty grid: no components, NO-PRACTICAL-WINDOW, relative threshold is Infinity', async () => {
  const { segmentWindows } = await loadModule();
  const result = segmentWindows(makeGrid(0, 0, () => null), { thresholdMode: 'relative' });
  assert.deepEqual(result.components, []);
  assert.deepEqual(result.practical, []);
  assert.equal(result.bestPractical, null);
  assert.equal(result.threshold.valueKm2S2, Infinity);
});

test('all cells below T: one component spanning the whole grid', async () => {
  const { segmentWindows } = await loadModule();
  const result = segmentWindows(makeGrid(3, 3, () => member(1.0)), { thresholdMode: 'relative' });
  assert.equal(result.components.length, 1);
  assert.equal(result.components[0].cellCount, 9);
  assert.equal(result.components[0].breadthCells, 3);
  assert.equal(result.components[0].minC3, 1.0);
  assert.equal(result.bestPractical.c3, 1.0);
});

test('a non-converged hole splits a would-be single component', async () => {
  const { segmentWindows } = await loadModule();
  // 5 columns × 1 row: [m m][HOLE][m m] — without the hole this is one strip.
  const grid = makeGrid(5, 1, (dep) => (dep === 2 ? hole() : member(2.0)));
  const result = segmentWindows(grid, { thresholdMode: 'absolute', absoluteKm2S2: 25 });
  assert.equal(result.components.length, 2);
  assert.deepEqual(result.components.map((c) => c.cellCount), [2, 2]);
});

test('tie exactly at T is included (c3 <= T, DEC-17-1)', async () => {
  const { segmentWindows } = await loadModule();
  // liveMin 1.0, delta 5 -> T = 6.0. One cell at exactly 6.0 adjacent to the min.
  const grid = makeGrid(2, 1, (dep) => member(dep === 0 ? 1.0 : 6.0));
  const result = segmentWindows(grid, { thresholdMode: 'relative', deltaKm2S2: 5 });
  assert.equal(result.components.length, 1);
  assert.equal(result.components[0].cellCount, 2);
  // and one epsilon above T is excluded:
  const grid2 = makeGrid(2, 1, (dep) => member(dep === 0 ? 1.0 : 6.0 + 1e-9));
  const result2 = segmentWindows(grid2, { thresholdMode: 'relative', deltaKm2S2: 5 });
  assert.equal(result2.components[0].cellCount, 1);
});

test('single-cell component exists in components but not in practical (B_min=2)', async () => {
  const { segmentWindows } = await loadModule();
  // Row 0: two-cell cluster (cols 0-1, c3 3). Isolated singleton at col 4 (c3 2, the global min).
  const grid = makeGrid(5, 1, (dep) => {
    if (dep <= 1) return member(3.0);
    if (dep === 4) return member(2.0);
    return hole();
  });
  const result = segmentWindows(grid, { thresholdMode: 'absolute', absoluteKm2S2: 25 });
  assert.equal(result.components.length, 2);
  assert.equal(result.components[0].minC3, 2.0); // sorted: singleton first (lower c3)
  assert.equal(result.components[0].breadthCells, 1);
  assert.equal(result.practical.length, 1);
  assert.equal(result.practical[0].minC3, 3.0);
  // Ranking never falls back to the global minimum (DEC-17-3):
  assert.equal(result.bestPractical.c3, 3.0);
});

test('grid of only singletons: NO-PRACTICAL-WINDOW (synthetic 163693 shape)', async () => {
  const { segmentWindows } = await loadModule();
  // Members on a sparse lattice, no two within 8-neighborhood of each other.
  const grid = makeGrid(5, 5, (dep, tof) =>
    dep % 4 === 0 && tof % 4 === 0 ? member(7 + dep + tof) : hole(),
  );
  const result = segmentWindows(grid, { thresholdMode: 'absolute', absoluteKm2S2: 25 });
  assert.equal(result.components.length, 4);
  assert.ok(result.components.every((c) => c.cellCount === 1 && c.breadthCells === 1));
  assert.equal(result.practical.length, 0);
  assert.equal(result.bestPractical, null);
});

test('diagonal-only adjacency joins under conn8', async () => {
  const { segmentWindows } = await loadModule();
  const grid = makeGrid(2, 2, (dep, tof) => (dep === tof ? member(2.0) : hole()));
  const result = segmentWindows(grid, { thresholdMode: 'absolute', absoluteKm2S2: 25 });
  assert.equal(result.components.length, 1);
  assert.equal(result.components[0].cellCount, 2);
  assert.equal(result.components[0].breadthCells, 2); // spans both dep columns -> practical
  assert.equal(result.practical.length, 1);
});

test('null-c3 cell is a hole even when flagged converged', async () => {
  const { segmentWindows } = await loadModule();
  const grid = makeGrid(3, 1, (dep) => (dep === 1 ? { c3: null, converged: true } : member(2.0)));
  const result = segmentWindows(grid, { thresholdMode: 'absolute', absoluteKm2S2: 25 });
  assert.equal(result.components.length, 2);
});

test('liveGridMin excludes non-converged and non-finite cells from the relative threshold', async () => {
  const { segmentWindows, liveGridMin } = await loadModule();
  // A non-converged cell with the LOWEST c3 must not drag T down (DEC-17-8:
  // T = liveMin + Δ over the live grid, i.e. converged cells).
  const cells = [{ c3: 0.1, converged: false }, member(3.0), member(3.5)];
  assert.equal(liveGridMin(cells), 3.0);
  const grid = { ...makeGrid(3, 1, () => member(0)), cells };
  const result = segmentWindows(grid, { thresholdMode: 'relative', deltaKm2S2: 1 });
  assert.equal(result.threshold.valueKm2S2, 4.0);
  assert.equal(result.components.length, 1);
  assert.equal(result.components[0].cellCount, 2); // the two converged cells only
  assert.equal(liveGridMin([{ c3: Infinity, converged: true }]), Infinity);
});

test('all-Infinity converged grid under relative mode has no members (not a garbage component)', async () => {
  const { segmentWindows } = await loadModule();
  const result = segmentWindows(
    makeGrid(2, 1, () => ({ c3: Infinity, converged: true })),
    { thresholdMode: 'relative' },
  );
  assert.deepEqual(result.components, []);
  assert.equal(result.bestPractical, null);
});

test('argmin and derived outputs from a real segmentation run', async () => {
  const { segmentWindows } = await loadModule();
  // 1×1 member at the grid origin pins the JD→ISO conversion to the
  // artifact's own span anchor (span.requested.start = 2026-01-01).
  const one = segmentWindows(makeGrid(1, 1, () => member(2.0)), {
    thresholdMode: 'absolute',
    absoluteKm2S2: 25,
  });
  assert.equal(one.components[0].argmin.depJd, DEP_START_JD);
  assert.equal(one.components[0].argmin.dateIso, '2026-01-01');
  assert.equal(one.components[0].argmin.tofDays, TOF_MIN_DAYS);
  assert.equal(one.components[0].tofSpanDays, 0);
  // 4×3 all-member with a unique minimum at (dep 2, tof 1).
  const grid = makeGrid(4, 3, (dep, tof) => member(dep === 2 && tof === 1 ? 1.0 : 5.0));
  const result = segmentWindows(grid, { thresholdMode: 'absolute', absoluteKm2S2: 25 });
  assert.equal(result.components.length, 1);
  const comp = result.components[0];
  assert.equal(comp.argmin.depJd, DEP_START_JD + 2 * DEP_CELL_DAYS);
  assert.equal(comp.argmin.tofDays, TOF_MIN_DAYS + 1 * TOF_CELL_DAYS);
  assert.equal(comp.tofSpanDays, 2 * TOF_CELL_DAYS);
  assert.equal(comp.breadthCells, 4);
});

test('classifyComponents finds the true minimum on unsorted input (DEC-17-3)', async () => {
  const { classifyComponents } = await loadModule();
  const unsorted = [
    { minC3: 5, breadthCells: 3, argmin: { depJd: 1, dateIso: 'x', tofDays: 1 } },
    { minC3: 2, breadthCells: 4, argmin: { depJd: 2, dateIso: 'y', tofDays: 2 } },
  ];
  const { bestPractical } = classifyComponents(unsorted, 2);
  assert.equal(bestPractical.c3, 2);
});

test('threshold resolution: relative = liveMin + delta; absolute ignores liveMin', async () => {
  const { segmentWindows, resolveThreshold } = await loadModule();
  const grid = makeGrid(2, 1, (dep) => member(dep === 0 ? 3.25 : 30.0));
  const rel = segmentWindows(grid, { thresholdMode: 'relative' }); // default delta 5
  assert.equal(rel.threshold.mode, 'relative');
  assert.equal(rel.threshold.valueKm2S2, 3.25 + 5);
  const relCustom = segmentWindows(grid, { thresholdMode: 'relative', deltaKm2S2: 2 });
  assert.equal(relCustom.threshold.valueKm2S2, 3.25 + 2);
  const abs = segmentWindows(grid, { thresholdMode: 'absolute' }); // default 25
  assert.equal(abs.threshold.mode, 'absolute');
  assert.equal(abs.threshold.valueKm2S2, 25);
  assert.equal(abs.components.length, 1); // the 30.0 cell is over the absolute bar
  assert.deepEqual(resolveThreshold(10, { thresholdMode: 'relative', deltaKm2S2: 5 }), {
    mode: 'relative',
    valueKm2S2: 15,
  });
});

test('conn4 is not implemented and throws; malformed grid shape throws', async () => {
  const { segmentWindows } = await loadModule();
  const grid = makeGrid(2, 1, () => member(1));
  assert.throws(() => segmentWindows(grid, { thresholdMode: 'relative', connectivity: 4 }));
  assert.throws(() =>
    segmentWindows({ ...grid, nDep: 3 }, { thresholdMode: 'relative' }),
  );
});

// ------------------------------------------------------------- property test

test('property: random grids — component minima bound, practical subset, sort, cell conservation', async () => {
  const { segmentWindows } = await loadModule();
  // Deterministic LCG so failures reproduce.
  let seed = 0xC0FFEE;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let trial = 0; trial < 40; trial++) {
    const nDep = 2 + Math.floor(rand() * 6);
    const nTof = 2 + Math.floor(rand() * 6);
    const grid = makeGrid(nDep, nTof, () => {
      const r = rand();
      if (r < 0.2) return hole();
      if (r < 0.25) return { c3: null, converged: true };
      return member(Math.floor(rand() * 40) / 2); // quantized so ties occur
    });
    const result = segmentWindows(grid, { thresholdMode: 'absolute', absoluteKm2S2: 12 });
    const memberCells = grid.cells.filter(
      (c) => c.converged && c.c3 !== null && c.c3 <= 12,
    );
    const globalMin = memberCells.length
      ? Math.min(...memberCells.map((c) => c.c3))
      : Infinity;
    let prev = -Infinity;
    let cellSum = 0;
    for (const comp of result.components) {
      assert.ok(comp.minC3 >= globalMin - 1e-9, `component min below global min (trial ${trial})`);
      assert.ok(comp.minC3 >= prev, `components not sorted (trial ${trial})`);
      prev = comp.minC3;
      cellSum += comp.cellCount;
      assert.equal(comp.breadthDays, (comp.breadthCells - 1) * DEP_CELL_DAYS);
    }
    assert.equal(cellSum, memberCells.length, `cell conservation (trial ${trial})`);
    for (const p of result.practical) {
      assert.ok(result.components.includes(p), `practical ⊄ components (trial ${trial})`);
      assert.ok(p.breadthCells >= 2);
    }
  }
});

// ------------------------------------------- artifact fixtures (summaries)

// bodies["2"].structure.liveMinPlus5.conn8 — 433, threshold = liveMin + 5.
const ARTIFACT_433 = {
  liveMin: 1.6396903345121228,
  thresholdKm2S2: 6.639690334512123,
  components: [
    { minC3: 1.6396903345121228, argmin: { dateIso: '2032-06-11', tofDays: 265.5176767676768 }, breadthDays: 91.05342465778813, breadthCells: 14, cellCount: 24, tofSpanDays: 83.01767676767673 },
    { minC3: 2.3672122595483507, argmin: { dateIso: '2039-05-28', tofDays: 298.72474747474746 }, breadthDays: 84.04931506840512, breadthCells: 13, cellCount: 23, tofSpanDays: 66.4141414141414 },
  ],
};

// bodies["4"].structure.liveMinPlus5.conn8 — 163693: five singletons.
const ARTIFACT_163693 = {
  liveMin: 6.7561195189011825,
  thresholdKm2S2: 11.756119518901183,
  components: [
    { minC3: 6.7561195189011825, argmin: { dateIso: '2034-05-19', tofDays: 182.5 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 7.003143991119908, argmin: { dateIso: '2027-05-13', tofDays: 182.5 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 9.323484296870058, argmin: { dateIso: '2034-05-05', tofDays: 199.10353535353536 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 9.450073703487464, argmin: { dateIso: '2027-04-29', tofDays: 199.10353535353536 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 11.619994558375424, argmin: { dateIso: '2036-04-19', tofDays: 182.5 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
  ],
};

// bodies["0"].structure.liveMinPlus2.conn8 — 99942, threshold = liveMin + 2.
const ARTIFACT_99942 = {
  liveMin: 0.00005501593238631661,
  thresholdKm2S2: 2.000055015932386,
  components: [
    { minC3: 0.00005501593238631661, argmin: { dateIso: '2028-08-24', tofDays: 232.31060606060606 }, breadthDays: 168.0986301372759, breadthCells: 25, cellCount: 42, tofSpanDays: 166.03535353535352 },
    { minC3: 0.09938818519513135, argmin: { dateIso: '2036-05-24', tofDays: 315.3282828282828 }, breadthDays: 161.0945205478929, breadthCells: 24, cellCount: 38, tofSpanDays: 149.4318181818182 },
    { minC3: 0.6700687457041004, argmin: { dateIso: '2035-06-09', tofDays: 331.9318181818182 }, breadthDays: 84.04931506840512, breadthCells: 13, cellCount: 24, tofSpanDays: 99.62121212121212 },
    { minC3: 0.8802187693069754, argmin: { dateIso: '2035-04-27', tofDays: 381.74242424242425 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 1.0609756270535315, argmin: { dateIso: '2027-06-03', tofDays: 348.5353535353535 }, breadthDays: 49.028767123352736, breadthCells: 8, cellCount: 15, tofSpanDays: 66.41414141414145 },
    { minC3: 1.1529863739374495, argmin: { dateIso: '2027-05-06', tofDays: 381.74242424242425 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 1.270250046776918, argmin: { dateIso: '2027-04-22', tofDays: 398.3459595959596 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 1.457605227533293, argmin: { dateIso: '2036-04-19', tofDays: 348.5353535353535 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 1.6050369796531911, argmin: { dateIso: '2029-05-31', tofDays: 282.1212121212121 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 1.647029680075459, argmin: { dateIso: '2029-05-10', tofDays: 298.72474747474746 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 1.6921359064521835, argmin: { dateIso: '2029-06-21', tofDays: 265.5176767676768 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
    { minC3: 1.945475873216996, argmin: { dateIso: '2029-07-12', tofDays: 248.9141414141414 }, breadthDays: 0, breadthCells: 1, cellCount: 1, tofSpanDays: 0 },
  ],
};

test('artifact 433 @min+5 conn8: threshold, derivation rules, B_min classification', async () => {
  const { resolveThreshold, classifyComponents } = await loadModule();
  const t = resolveThreshold(ARTIFACT_433.liveMin, { thresholdMode: 'relative', deltaKm2S2: 5 });
  assert.equal(t.valueKm2S2, ARTIFACT_433.thresholdKm2S2);
  assert.equal(t.valueKm2S2, ARTIFACT_433.liveMin + 5);
  const { practical, bestPractical } = classifyComponents(ARTIFACT_433.components, 2);
  assert.equal(practical.length, 2);
  assert.equal(bestPractical.c3, 1.6396903345121228);
  assert.equal(bestPractical.argmin.dateIso, '2032-06-11');
});

test('artifact 163693 @min+5 conn8: NO-PRACTICAL-WINDOW', async () => {
  const { resolveThreshold, classifyComponents } = await loadModule();
  const t = resolveThreshold(ARTIFACT_163693.liveMin, { thresholdMode: 'relative', deltaKm2S2: 5 });
  assert.equal(t.valueKm2S2, ARTIFACT_163693.thresholdKm2S2); // the artifact's STORED threshold
  const { practical, bestPractical } = classifyComponents(ARTIFACT_163693.components, 2);
  assert.equal(practical.length, 0);
  assert.equal(bestPractical, null); // 163693 sorts last, never ranked by global min (DEC-17-3)
});

test('artifact 99942 @min+2 conn8: 4 practical of 12, best = global min component', async () => {
  const { resolveThreshold, classifyComponents } = await loadModule();
  const t = resolveThreshold(ARTIFACT_99942.liveMin, { thresholdMode: 'relative', deltaKm2S2: 2 });
  assert.equal(t.valueKm2S2, ARTIFACT_99942.thresholdKm2S2); // the artifact's STORED threshold
  const { practical, bestPractical } = classifyComponents(ARTIFACT_99942.components, 2);
  assert.equal(practical.length, 4);
  assert.deepEqual(
    practical.map((c) => c.minC3),
    [0.00005501593238631661, 0.09938818519513135, 0.6700687457041004, 1.0609756270535315],
  );
  assert.equal(bestPractical.c3, 0.00005501593238631661);
  assert.equal(bestPractical.argmin.dateIso, '2028-08-24');
});

test('artifact derivation rules: breadthCells/breadthDays/tofSpanDays are cell multiples', async () => {
  await loadModule();
  const all = [...ARTIFACT_433.components, ...ARTIFACT_163693.components, ...ARTIFACT_99942.components];
  assert.equal(all.length, 19);
  for (const comp of all) {
    // Artifact stores breadthDays measured from actual dates (float noise vs
    // exact multiples ~1e-10); the module derives breadthDays as
    // (breadthCells-1)*cell. Both must agree to well under a millisecond.
    assert.equal(comp.breadthCells, Math.round(comp.breadthDays / DEP_CELL_DAYS) + 1);
    assert.ok(Math.abs((comp.breadthCells - 1) * DEP_CELL_DAYS - comp.breadthDays) < 1e-6);
    const tofCells = Math.round(comp.tofSpanDays / TOF_CELL_DAYS);
    assert.ok(Math.abs(tofCells * TOF_CELL_DAYS - comp.tofSpanDays) < 1e-6);
  }
});

test('artifact cross-check: pasted constants match the committed artifact, read at runtime', async () => {
  await loadModule();
  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'tools', 'slice17-research', 'data', 's17-structure-7day.json'),
      'utf8',
    ),
  );
  assert.equal(artifact.grid.departureCellDays, DEP_CELL_DAYS);
  assert.equal(artifact.grid.tofCellDays, TOF_CELL_DAYS);
  assert.equal(artifact.span.requested.start.jdTdb, DEP_START_JD);
  const cases = [
    ['2', 'liveMinPlus5', ARTIFACT_433, '433', 20000433],
    ['4', 'liveMinPlus5', ARTIFACT_163693, '163693', 20163693],
    ['0', 'liveMinPlus2', ARTIFACT_99942, '99942', 20099942],
  ];
  for (const [bodyKey, mode, pasted, expectId, expectSpkId] of cases) {
    const body = artifact.bodies[bodyKey];
    assert.equal(body.id, expectId);
    assert.equal(body.spkId, expectSpkId);
    const stored = body.structure[mode];
    assert.equal(body.live.minC3, pasted.liveMin);
    assert.equal(stored.thresholdKm2S2, pasted.thresholdKm2S2);
    const mapped = stored.conn8.map((c) => ({
      minC3: c.minC3,
      argmin: { dateIso: c.argmin.date, tofDays: c.argmin.tofDays },
      breadthDays: c.breadthDays,
      breadthCells: Math.round(c.breadthDays / artifact.grid.departureCellDays) + 1,
      cellCount: c.cellCount,
      tofSpanDays: c.tofSpanDays,
    }));
    assert.deepEqual(mapped, pasted.components);
  }
});

test('artifact sort order restores under the module comparator', async () => {
  const { compareByMinC3 } = await loadModule();
  // Deterministic shuffle (reverse), then sort back.
  const shuffled = [...ARTIFACT_99942.components].reverse();
  const withDepJd = shuffled.map((c) => ({ ...c, argmin: { ...c.argmin, depJd: 0 } }));
  withDepJd.sort(compareByMinC3);
  assert.deepEqual(
    withDepJd.map((c) => c.minC3),
    ARTIFACT_99942.components.map((c) => c.minC3),
  );
});
