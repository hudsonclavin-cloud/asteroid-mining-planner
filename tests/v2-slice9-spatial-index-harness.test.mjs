import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Worker } from 'node:worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { COMMON_EPOCH_TDB_JD } from '../tools/slice9-research/common.mjs';
import { propagateKeplerian } from '../tools/slice9-research/keplerian-offline.mjs';
import { propagateSlice9Batch } from '../tools/slice9-research/slice9-node-propagation-batch.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice9-spatial-index');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const occupancyPath = path.join(repoRoot, 'tools', 'slice9-research', 'data', 'occupancy-summary.json');
const workerPath = path.join(repoRoot, 'tools', 'slice9-research', 'slice9-node-propagation-worker.mjs');

const UNIFORM_CELL_SIZE_AU = 0.5;
const HYBRID_CONFIGS = [
  { coarseCellSizeAu: 1, fineCellSizeAu: 0.25, densityTrigger: 200 },
  { coarseCellSizeAu: 1, fineCellSizeAu: 0.25, densityTrigger: 500 },
  { coarseCellSizeAu: 1, fineCellSizeAu: 0.25, densityTrigger: 1000 },
];
const REPARTITION_OFFSETS_DAYS = [1, 30];
const OCCUPANCY_DRIFT_TOLERANCE = 0.05;
const PROPAGATION_RUN_COUNT = 5;
const AU_KM = 149_597_870.7;

function compileModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
  const result = spawnSync(
    tscBin,
    [
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
      path.join(repoRoot, 'src', 'v2', 'render', 'slice9-spatial-partition.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let modulePromise;

async function loadModules() {
  if (!modulePromise) {
    compileModules();
    modulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'render', 'slice9-spatial-partition.js')).href
    );
  }
  return modulePromise;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toOfflineElements(record) {
  return {
    a: record.elements.aKm / AU_KM,
    e: record.elements.e,
    i: (record.elements.iRad * 180) / Math.PI,
    om: (record.elements.omRad * 180) / Math.PI,
    w: (record.elements.wRad * 180) / Math.PI,
    ma: (record.elements.maRad * 180) / Math.PI,
    epoch_tdb: record.elements.epochTdbJd,
  };
}

function isOfflinePropagatable(record) {
  return (
    Number.isFinite(record.elements.aKm) &&
    record.elements.aKm > 0 &&
    Number.isFinite(record.elements.e) &&
    record.elements.e >= 0 &&
    record.elements.e < 1
  );
}

function loadFixtureBodies() {
  const fixture = readJson(fixturePath);
  const asteroidEntries = Object.entries(fixture.asteroids).sort(([left], [right]) =>
    left.localeCompare(right, 'en', { numeric: true }),
  );

  return asteroidEntries.map(([bodyId, record]) => ({
    bodyId,
    designation: record.designation,
    orbitClass: record.orbitClass,
    elements: toOfflineElements(record),
    anchorPositionKm: {
      x: record.anchor.positionKm[0],
      y: record.anchor.positionKm[1],
      z: record.anchor.positionKm[2],
    },
    propagatable: isOfflinePropagatable(record),
  }));
}

function propagateFixturePositions(bodies, targetJdTdb) {
  let fallbackBodyCount = 0;

  const positions = bodies.map((entry) => {
    if (!entry.propagatable) {
      fallbackBodyCount += 1;
      return entry.anchorPositionKm;
    }

    const propagated = propagateKeplerian(entry.elements, targetJdTdb);
    return {
      x: propagated.position_km.x,
      y: propagated.position_km.y,
      z: propagated.position_km.z,
    };
  });

  return {
    positions,
    fallbackBodyCount,
  };
}

function assertBodyCoverage(partitionCells, totalBodies) {
  const seen = new Set();
  let countedBodies = 0;

  for (const cell of partitionCells) {
    for (const bodyIndex of cell.bodyIndices) {
      countedBodies += 1;
      assert.ok(bodyIndex >= 0 && bodyIndex < totalBodies, `body index ${bodyIndex} must remain in range`);
      assert.ok(!seen.has(bodyIndex), `body index ${bodyIndex} must not appear in multiple leaf cells`);
      seen.add(bodyIndex);
    }
  }

  assert.equal(countedBodies, totalBodies, 'partition leaf cells must account for every body exactly once');
  assert.equal(seen.size, totalBodies, 'partition leaf cells must cover every body exactly once');
}

function pointWithinBounds(pointKm, boundsKm) {
  return (
    pointKm.x >= boundsKm.min.x &&
    pointKm.x < boundsKm.max.x &&
    pointKm.y >= boundsKm.min.y &&
    pointKm.y < boundsKm.max.y &&
    pointKm.z >= boundsKm.min.z &&
    pointKm.z < boundsKm.max.z
  );
}

function summarizeTimes(timesMs) {
  const sorted = [...timesMs].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const p95Index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return {
    medianMs: median,
    p95Ms: sorted[p95Index],
  };
}

function measureMainThreadPropagation(elements, targetJdTdb, runCount) {
  const durationsMs = [];
  let lastSummary = null;

  for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
    const start = process.hrtime.bigint();
    lastSummary = propagateSlice9Batch(elements, targetJdTdb);
    const end = process.hrtime.bigint();
    durationsMs.push(Number(end - start) / 1e6);
  }

  return {
    durationsMs,
    summary: summarizeTimes(durationsMs),
    lastSummary,
  };
}

async function measureWorkerPropagation(elements, targetJdTdb, runCount) {
  const worker = new Worker(pathToFileURL(workerPath), {
    type: 'module',
    workerData: { bodies: elements },
  });

  const durationsMs = [];
  const computeDurationsMs = [];
  let lastSummary = null;

  try {
    for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
      const startedAt = process.hrtime.bigint();
      const response = await new Promise((resolve, reject) => {
        const handleMessage = (message) => {
          if (message?.type !== 'measure-result') return;
          worker.off('message', handleMessage);
          worker.off('error', handleError);
          resolve(message);
        };
        const handleError = (error) => {
          worker.off('message', handleMessage);
          worker.off('error', handleError);
          reject(error);
        };

        worker.on('message', handleMessage);
        worker.on('error', handleError);
        worker.postMessage({
          type: 'measure',
          runLabel: `run-${runIndex + 1}`,
          targetJdTdb,
        });
      });
      const endedAt = process.hrtime.bigint();
      durationsMs.push(Number(endedAt - startedAt) / 1e6);
      computeDurationsMs.push(response.computeDurationMs);
      lastSummary = response;
    }
  } finally {
    worker.postMessage({ type: 'shutdown' });
    await worker.terminate();
  }

  return {
    durationsMs,
    computeDurationsMs,
    summary: summarizeTimes(durationsMs),
    computeSummary: summarizeTimes(computeDurationsMs),
    lastSummary,
  };
}

test('Slice 9 Phase B Node-side harness asserts partition correctness and measures CPU-only propagation components', async (t) => {
  const spatial = await loadModules();
  const occupancyBaseline = readJson(occupancyPath);
  const fixtureBodies = loadFixtureBodies();
  const totalBodies = fixtureBodies.length;
  const commonEpochPropagation = propagateFixturePositions(fixtureBodies, COMMON_EPOCH_TDB_JD);
  const commonEpochPositions = commonEpochPropagation.positions;
  const nonPropagatableBodies = fixtureBodies.filter((body) => !body.propagatable);

  assert.equal(totalBodies, 41_906, 'Slice 9 Node-side harness expects the closed 41,906-body fixture');
  assert.equal(commonEpochPropagation.fallbackBodyCount, nonPropagatableBodies.length);

  const uniform = spatial.partitionSlice9UniformPositions(commonEpochPositions, UNIFORM_CELL_SIZE_AU);
  const hybrids = HYBRID_CONFIGS.map((config) =>
    spatial.partitionSlice9HybridPositions(commonEpochPositions, config),
  );

  await t.test('Partition correctness holds for uniform 0.5 AU and all hybrid candidates', () => {
    assert.equal(uniform.summary.totalBodies, totalBodies);
    assertBodyCoverage(uniform.cells, totalBodies);

    for (const hybrid of hybrids) {
      assert.equal(hybrid.summary.totalBodies, totalBodies);
      assertBodyCoverage(hybrid.leafCells, totalBodies);
    }
  });

  await t.test('Hybrid structural validity holds for all candidate density triggers', () => {
    for (const hybrid of hybrids) {
      for (const coarseCell of hybrid.coarseCells) {
        if (!coarseCell.isSubPartitioned) {
          assert.equal(coarseCell.subCells.length, 0, `${coarseCell.key} must not expose subcells when under trigger`);
          continue;
        }

        assert.ok(
          coarseCell.bodyIndices.length > hybrid.densityTrigger,
          `${coarseCell.key} must exceed trigger ${hybrid.densityTrigger} before sub-partitioning`,
        );

        const subCellBodyCount = coarseCell.subCells.reduce(
          (sum, subCell) => sum + subCell.bodyIndices.length,
          0,
        );
        assert.equal(
          subCellBodyCount,
          coarseCell.bodyIndices.length,
          `${coarseCell.key} subcells must conserve all parent bodies`,
        );

        for (const subCell of coarseCell.subCells) {
          assert.ok(
            subCell.boundsKm.min.x >= coarseCell.boundsKm.min.x &&
              subCell.boundsKm.max.x <= coarseCell.boundsKm.max.x &&
              subCell.boundsKm.min.y >= coarseCell.boundsKm.min.y &&
              subCell.boundsKm.max.y <= coarseCell.boundsKm.max.y &&
              subCell.boundsKm.min.z >= coarseCell.boundsKm.min.z &&
              subCell.boundsKm.max.z <= coarseCell.boundsKm.max.z,
            `${subCell.key} must tile within coarse parent ${coarseCell.key}`,
          );

          for (const bodyIndex of subCell.bodyIndices) {
            assert.ok(
              pointWithinBounds(commonEpochPositions[bodyIndex], subCell.boundsKm),
              `${subCell.key} must contain body ${bodyIndex} within its subcell bounds`,
            );
          }
        }
      }
    }
  });

  await t.test('Body conservation holds across re-partition after time scrub', () => {
    for (const offsetDays of REPARTITION_OFFSETS_DAYS) {
      const targetJdTdb = COMMON_EPOCH_TDB_JD + offsetDays;
      const propagated = propagateFixturePositions(fixtureBodies, targetJdTdb);
      const positions = propagated.positions;

      const nextUniform = spatial.partitionSlice9UniformPositions(positions, UNIFORM_CELL_SIZE_AU);
      assertBodyCoverage(nextUniform.cells, totalBodies);

      const nextHybrid = spatial.partitionSlice9HybridPositions(positions, HYBRID_CONFIGS[1]);
      assertBodyCoverage(nextHybrid.leafCells, totalBodies);

      assert.equal(
        propagated.fallbackBodyCount,
        nonPropagatableBodies.length,
        `repartition at +${offsetDays}d must preserve fallback accounting for non-elliptic bodies`,
      );
    }
  });

  await t.test('Occupancy reproduction at 0.5 AU remains within the committed tolerance band', () => {
    const baseline = occupancyBaseline.occupancyTable.find((row) => row.cellSizeAu === UNIFORM_CELL_SIZE_AU);
    assert.ok(baseline, 'Missing 0.5 AU baseline occupancy row');

    const occupiedDrift = Math.abs(uniform.summary.occupiedCellCount - baseline.occupiedCellCount) / baseline.occupiedCellCount;
    const maxCellDrift = Math.abs(uniform.summary.maxBodiesPerCell - baseline.maxBodiesPerCell) / baseline.maxBodiesPerCell;

    t.diagnostic(
      `Slice 9 uniform 0.5 AU occupancy: occupied=${uniform.summary.occupiedCellCount} baseline=${baseline.occupiedCellCount} drift=${(occupiedDrift * 100).toFixed(2)}% maxBodies=${uniform.summary.maxBodiesPerCell} baselineMax=${baseline.maxBodiesPerCell} drift=${(maxCellDrift * 100).toFixed(2)}%`,
    );

    assert.ok(
      occupiedDrift <= OCCUPANCY_DRIFT_TOLERANCE,
      `0.5 AU occupied-cell drift ${(occupiedDrift * 100).toFixed(2)}% exceeded ${(OCCUPANCY_DRIFT_TOLERANCE * 100).toFixed(0)}%`,
    );
    assert.ok(
      maxCellDrift <= OCCUPANCY_DRIFT_TOLERANCE,
      `0.5 AU max-bodies-per-cell drift ${(maxCellDrift * 100).toFixed(2)}% exceeded ${(OCCUPANCY_DRIFT_TOLERANCE * 100).toFixed(0)}%`,
    );
  });

  await t.test('Propagation CPU-time measurements report main-thread and worker-thread components without inferring frame budget', async () => {
    const targetJdTdb = COMMON_EPOCH_TDB_JD + 1;

    const mainThread = measureMainThreadPropagation(fixtureBodies, targetJdTdb, PROPAGATION_RUN_COUNT);
    const workerThread = await measureWorkerPropagation(fixtureBodies, targetJdTdb, PROPAGATION_RUN_COUNT);

    assert.equal(mainThread.lastSummary.totalBodies, totalBodies);
    assert.equal(workerThread.lastSummary.totalBodies, totalBodies);
    assert.equal(mainThread.lastSummary.fallbackBodyCount, nonPropagatableBodies.length);
    assert.equal(workerThread.lastSummary.fallbackBodyCount, nonPropagatableBodies.length);
    assert.ok(Number.isFinite(mainThread.summary.medianMs) && mainThread.summary.medianMs > 0);
    assert.ok(Number.isFinite(workerThread.summary.medianMs) && workerThread.summary.medianMs > 0);
    assert.ok(Number.isFinite(workerThread.computeSummary.medianMs) && workerThread.computeSummary.medianMs > 0);

    const checksumDeltaKm =
      Math.abs(mainThread.lastSummary.checksumKm.x - workerThread.lastSummary.checksumKm.x) +
      Math.abs(mainThread.lastSummary.checksumKm.y - workerThread.lastSummary.checksumKm.y) +
      Math.abs(mainThread.lastSummary.checksumKm.z - workerThread.lastSummary.checksumKm.z);
    assert.ok(checksumDeltaKm < 1e-3, `worker checksum drift must remain negligible; received ${checksumDeltaKm}`);

    t.diagnostic(
      `Slice 9 propagation CPU-only timing: main median=${mainThread.summary.medianMs.toFixed(3)}ms p95=${mainThread.summary.p95Ms.toFixed(3)}ms; worker roundtrip median=${workerThread.summary.medianMs.toFixed(3)}ms p95=${workerThread.summary.p95Ms.toFixed(3)}ms; worker compute median=${workerThread.computeSummary.medianMs.toFixed(3)}ms p95=${workerThread.computeSummary.p95Ms.toFixed(3)}ms; fallback bodies=${nonPropagatableBodies.length}`,
    );
  });

  t.diagnostic(
    `Slice 9 offline propagation fallback bodies: ${nonPropagatableBodies.length} (${nonPropagatableBodies
      .map((body) => `${body.designation} [${body.orbitClass}]`)
      .join(', ')})`,
  );
  t.diagnostic(
    `Slice 9 hybrid summaries: ${hybrids
      .map(
        (hybrid) =>
          `D=${hybrid.densityTrigger} coarse=${hybrid.summary.coarseCellCount} subCells=${hybrid.summary.subCellCount} leafCells=${hybrid.summary.leafCellCount} maxLeaf=${hybrid.summary.maxLeafBodiesPerCell}`,
      )
      .join('; ')}`,
  );
});
