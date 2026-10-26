import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-compare-honesty');
const compareSourcePath = path.join(repoRoot, 'src', 'v2', 'app', 'compare', 'main.ts');

async function loadCompareRenderers() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = runTsc([
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
    compareSourcePath,
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);

  const emittedPath = path.join(tempOutDir, 'app', 'compare', 'main.js');
  const emitted = fs.readFileSync(emittedPath, 'utf8');
  const mountStart = emitted.lastIndexOf("const mount = document.getElementById('app');");
  assert.notEqual(mountStart, -1, 'compare module mount should be present in emitted source');
  fs.writeFileSync(
    emittedPath,
    `${emitted.slice(0, mountStart)}\nexport { renderOkRow, computeDominance };\n`,
  );
  const compare = await import(`${pathToFileURL(emittedPath).href}?honesty=${Date.now()}`);
  const constants = await import(
    `${pathToFileURL(path.join(tempOutDir, 'core', 'constants', 'near-zero-c3.js')).href}?honesty=${Date.now()}`,
  );
  return { ...compare, constants };
}

function textOf(value) {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return '';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(textOf).join('');
  }
  if (typeof value === 'object' && value.props) {
    return textOf(value.props.children);
  }
  return '';
}

function component(c3, breadthCells, dateIso) {
  return {
    breadthCells,
    breadthDays: (breadthCells - 1) * 7,
    minC3: c3,
    c3,
    argmin: {
      depJd: Date.parse(`${dateIso}T00:00:00Z`) / 86_400_000 + 2_440_587.5,
      dateIso,
      tofDays: 232.3,
    },
  };
}

function result(bodyId, c3, breadthCells, deliveredMass, nearZeroC3Degenerate) {
  const practical = component(c3, breadthCells, '2028-08-24');
  return {
    ok: true,
    bodyId,
    grid: { cells: [], computeMs: 1 },
    segmentation: {
      components: [practical],
      practical: [practical],
      bestPractical: practical,
      threshold: { mode: 'relative', valueKm2S2: c3 + 5 },
    },
    deliveredMass,
    echo: {
      liveMin: c3,
      liveMinNearZeroC3Degenerate: nearZeroC3Degenerate,
      bestPracticalNearZeroC3Degenerate: nearZeroC3Degenerate,
      deltaKm2S2: 5,
      absoluteKm2S2: 25,
      nDep: 731,
      nTof: 100,
      depCellDays: 7,
    },
  };
}

test('T1 compare rows render the near-zero flag only for sub-threshold minima and preserve values', async () => {
  const { renderOkRow, constants } = await loadCompareRenderers();
  const nearC3 = 0.00005501593238631661;
  const normalC3 = 1.6244339770314757;
  assert(nearC3 < constants.NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2);
  assert(normalC3 > constants.NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2);
  const near = result('near-body', nearC3, 2, 1000, constants.isNearZeroC3Degenerate(nearC3));
  const normal = result('normal-body', normalC3, 2, 1000, constants.isNearZeroC3Degenerate(normalC3));

  const nearText = textOf(renderOkRow(near, 'Near', 'vehicle', false, () => {}, undefined, undefined, undefined, false, 0));
  const normalText = textOf(renderOkRow(normal, 'Normal', 'vehicle', false, () => {}, undefined, undefined, undefined, false, 0));
  assert.match(nearText, /near-zero C3/);
  assert.match(nearText, /5\.50e-5 km/);
  assert.doesNotMatch(normalText, /near-zero C3/);
  assert.match(normalText, /1\.62 km/);
});

test('T2 compare hide state preserves practical order and dominance while replacing flagged values', async () => {
  const { renderOkRow, computeDominance, constants } = await loadCompareRenderers();
  const nearC3 = 0.00005501593238631661;
  const normalC3 = 1.6244339770314757;
  assert(nearC3 < constants.NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2);
  assert(normalC3 > constants.NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2);
  const near = result('near-body', nearC3, 2, 1000, constants.isNearZeroC3Degenerate(nearC3));
  const normal = result('normal-body', normalC3, 2, 1000, constants.isNearZeroC3Degenerate(normalC3));
  const rows = [near, normal];

  const dominanceOff = [...computeDominance(rows).entries()];
  const dominanceOn = [...computeDominance(rows).entries()];
  assert.deepEqual(dominanceOn, dominanceOff);

  const compareSource = fs.readFileSync(compareSourcePath, 'utf8');
  const orderedStart = compareSource.indexOf('const ordered =');
  const firstOkStart = compareSource.indexOf('const firstOk =', orderedStart);
  assert.notEqual(orderedStart, -1);
  assert.notEqual(firstOkStart, -1);
  const orderingSource = compareSource.slice(orderedStart, firstOkStart);
  assert.match(orderingSource, /bestPractical\.c3 - b\.segmentation\.bestPractical\.c3/);
  assert.doesNotMatch(orderingSource, /hideNearZeroC3/);

  const offRow = renderOkRow(near, 'Near', 'vehicle', false, () => {}, dominanceOff[0][1], undefined, undefined, false, 2);
  const onRow = renderOkRow(near, 'Near', 'vehicle', false, () => {}, dominanceOn[0][1], undefined, undefined, true, 2);
  const offText = textOf(offRow.props.children[2]);
  const onText = textOf(onRow.props.children[2]);
  assert.match(offText, /near-zero C3/);
  assert.match(offText, /5\.50e-5 km/);
  assert.equal((onText.match(/near-zero-C3 window hidden \(2\)/g) ?? []).length, 2);
  assert.doesNotMatch(onText, /near-zero C3/);
  assert.doesNotMatch(onText, /5\.50e-5 km/);
  assert.equal(near.echo.liveMin, 0.00005501593238631661);
  assert.equal(near.segmentation.bestPractical.c3, 0.00005501593238631661);

  const normalOnText = textOf(renderOkRow(normal, 'Normal', 'vehicle', false, () => {}, dominanceOn[1][1], undefined, undefined, true, 2));
  assert.doesNotMatch(normalOnText, /near-zero-C3 window hidden/);
  assert.match(normalOnText, /1\.62 km/);
});

test('T3 compare size factors are derived from the imported albedo constants in both directions', async () => {
  const {
    describeSize,
    diameterFactor,
    COMPARE_DEFAULT_ALBEDO,
    ALBEDO_LOW_REFLECTIVITY,
    ALBEDO_HIGH_REFLECTIVITY,
  } = await loadCompareRenderers();
  assert.ok(Math.abs(diameterFactor(ALBEDO_HIGH_REFLECTIVITY, COMPARE_DEFAULT_ALBEDO) - 2.070196678) < 1e-6);
  assert.ok(Math.abs(diameterFactor(COMPARE_DEFAULT_ALBEDO, ALBEDO_LOW_REFLECTIVITY) - 1.414213562) < 1e-6);
  const note = describeSize(20).notes.join(' ');
  assert.match(note, /≈2\.1×/);
  assert.match(note, /≈1\.4×/);
});

test('W3a compare flags an Apophis window arriving after support without changing ranking data', async () => {
  const { renderOkRow, computeDominance, constants } = await loadCompareRenderers();
  const apophis = result('asteroid-99942', 1, 2, 1000, constants.isNearZeroC3Degenerate(1));
  const other = result('asteroid-other', 2, 2, 900, constants.isNearZeroC3Degenerate(2));
  const rows = [apophis, other];
  const before = structuredClone(rows);
  const rankingBefore = rows.map((row) => row.bodyId);
  const dominance = computeDominance(rows);
  const tierArtifact = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'docs', 'tier-sizing-per-body.json'), 'utf8'),
  );
  const tier = tierArtifact.records['99942'];
  assert.equal(tier.tier, 'L1');

  const text = textOf(renderOkRow(
    apophis,
    'Apophis',
    'vehicle',
    false,
    () => {},
    dominance.get(apophis.bodyId),
    undefined,
    tier,
    false,
    0,
  ));

  assert.match(text, /ARRIVES AFTER SUPPORTED DATE/);
  assert.match(
    text,
    /This window arrives 2029-04-13, after 2028-09-12, the last date Aster's orbit for Apophis is supported\. Not certified; ranking unchanged\./,
  );
  assert.deepEqual(rows, before);
  assert.deepEqual(rows.map((row) => row.bodyId), rankingBefore);
});
