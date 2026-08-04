#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..', '..');
const sliceRoot = path.join(repoRoot, 'tools', 'slice17-research');
const runtimeOutDir = path.join(sliceRoot, '.tmp-s17-measure-runtime');
const outputPath = path.join(sliceRoot, 'data', 's17-cache-live-structure.json');
const cachePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json');
const catalogPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const earthPath = path.join(repoRoot, 'src', 'v2', 'data', 'horizons-inner-solar-system-2026-2040.json');
const tscEntry = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

const marker = 'S-S17-MEASURE-2026-08-04-D';
const bodyIds = ['99942', '101955', '433', '1566', '163693'];
const nDep = 200;
const nTof = 100;
const departureStart = '2026-01-01';
const departureEnd = '2040-01-01';
const gridParams = {
  depStartJD: utcMidnightToJdTdb(departureStart),
  depEndJD: utcMidnightToJdTdb(departureEnd),
  tofMinDays: 182.5,
  tofMaxDays: 1826.25,
  nDep,
  nTof,
};

function utcMidnightToJdTdb(utcDate) {
  const utcMillis = Date.parse(`${utcDate}T00:00:00Z`);
  const utcSecondsSinceUnix = utcMillis / 1000;
  const unixToJ2000Seconds = 946_728_000;
  const tdbMinusUtcSeconds = 69.184;
  const tdbSecondsSinceJ2000 = utcSecondsSinceUnix - unixToJ2000Seconds + tdbMinusUtcSeconds;
  return 2451545 + tdbSecondsSinceJ2000 / 86_400;
}

function jdTdbToUtcIsoString(jdTdb) {
  const tdbSecondsSinceJ2000 = (jdTdb - 2451545) * 86_400;
  const utcMillis = (tdbSecondsSinceJ2000 - 69.184 + 946_728_000) * 1000;
  return new Date(utcMillis).toISOString();
}

function jdTdbToUtcDateString(jdTdb) {
  return jdTdbToUtcIsoString(jdTdb).slice(0, 10);
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function gitHead() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'git rev-parse HEAD failed');
  }
  return result.stdout.trim();
}

function compileRuntimeModules() {
  fs.rmSync(runtimeOutDir, { recursive: true, force: true });
  fs.mkdirSync(runtimeOutDir, { recursive: true });
  const sourceRoot = path.join(repoRoot, 'src', 'v2');
  const entries = [
    'boundary/slice9-nea-catalog.ts',
    'boundary/horizons.ts',
    'app/solar-system/slice9-runtime-asteroids.ts',
    'core/interpolators/hermite.ts',
    'core/propagators/keplerian.ts',
    'porkchop/grid-compute.ts',
  ].map((entry) => path.join(sourceRoot, entry));
  const result = spawnSync(
    process.execPath,
    [
      tscEntry,
      '--pretty', 'false',
      '--outDir', runtimeOutDir,
      '--rootDir', sourceRoot,
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      '--skipLibCheck', 'true',
      ...entries,
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'TypeScript compile failed');
  }
}

async function importRuntime(relativePath, outDir = runtimeOutDir) {
  return import(pathToFileURL(path.join(outDir, relativePath)).href);
}

async function loadInputs() {
  const { ingestSlice9Fixture } = await importRuntime('boundary/slice9-nea-catalog.js');
  const { ingestSlice2Fixture } = await importRuntime('boundary/horizons.js');
  const { normalizeSlice9BodyForRuntime } = await importRuntime('app/solar-system/slice9-runtime-asteroids.js');
  const rawCatalog = readJson(catalogPath);
  const catalog = ingestSlice9Fixture(rawCatalog);
  const bodies = Object.values(catalog.asteroids).map((body) => normalizeSlice9BodyForRuntime(body));
  const byDesignation = new Map(bodies.map((body) => [body.designation, body]));
  const earthFixture = readJson(earthPath);
  const earthStates = ingestSlice2Fixture(earthFixture);
  const earthSeries = earthStates.earth.map((sample) => sample.state);
  const cache = readJson(cachePath);
  const cacheByDesignation = new Map(cache.bodies.map((body) => [body.designation, body]));
  return { byDesignation, earthSeries, cache, cacheByDesignation };
}

async function runtimeFunctions(outDir = runtimeOutDir) {
  const { computePorkchopGrid } = await importRuntime('porkchop/grid-compute.js', outDir);
  const { interpolateBodyStateSeries } = await importRuntime('core/interpolators/hermite.js', outDir);
  const { propagateKeplerianStateVectors } = await importRuntime('core/propagators/keplerian.js', outDir);
  return { computePorkchopGrid, interpolateBodyStateSeries, propagateKeplerianStateVectors };
}

function makeDeps(earthSeries, functions) {
  return {
    nowMs: () => performance.now(),
    getEarthStateAtTdbSeconds: (tdbSeconds) =>
      functions.interpolateBodyStateSeries('earth', earthSeries, tdbSeconds),
    propagateTargetStateAtTdbSeconds: (elements, tdbSeconds) =>
      functions.propagateKeplerianStateVectors(elements, tdbSeconds),
  };
}

function preflightBoundsGuard(earthSeries) {
  const first = earthSeries[0];
  const last = earthSeries[earthSeries.length - 1];
  if (!first || !last) {
    throw new Error('Earth Horizons fixture did not produce a usable state series');
  }
  const fixtureFirstJD = 2451545 + first.tdbSeconds / 86_400;
  const fixtureLastJD = 2451545 + last.tdbSeconds / 86_400;
  const requested = {
    start: {
      jdTdb: gridParams.depStartJD,
      isoUtc: jdTdbToUtcIsoString(gridParams.depStartJD),
    },
    end: {
      jdTdb: gridParams.depEndJD,
      isoUtc: jdTdbToUtcIsoString(gridParams.depEndJD),
    },
  };
  const fixtureBounds = {
    first: {
      jdTdb: fixtureFirstJD,
      isoUtc: jdTdbToUtcIsoString(fixtureFirstJD),
    },
    last: {
      jdTdb: fixtureLastJD,
      isoUtc: jdTdbToUtcIsoString(fixtureLastJD),
    },
  };

  console.log(`requested start: JD TDB ${requested.start.jdTdb} | ${requested.start.isoUtc}`);
  console.log(`requested end:   JD TDB ${requested.end.jdTdb} | ${requested.end.isoUtc}`);
  console.log(`fixture first:   JD TDB ${fixtureBounds.first.jdTdb} | ${fixtureBounds.first.isoUtc}`);
  console.log(`fixture last:    JD TDB ${fixtureBounds.last.jdTdb} | ${fixtureBounds.last.isoUtc}`);

  if (gridParams.depStartJD < fixtureFirstJD || gridParams.depEndJD > fixtureLastJD) {
    throw new Error('Pre-flight Earth ephemeris bounds guard failed');
  }
  return { requested, fixtureBounds };
}

function selectedC3(cell) {
  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return null;
  }
  const value = cell.branches[cell.selectedBranch]?.c3;
  return Number.isFinite(value) ? value : null;
}

function extractLiveMinimum(cells) {
  let best = null;
  for (let index = 0; index < cells.length; index += 1) {
    const c3 = selectedC3(cells[index]);
    if (c3 === null || (best !== null && c3 >= best.c3)) {
      continue;
    }
    best = { index, c3, depJD: cells[index].depJD, tofDays: cells[index].tofDays };
  }
  if (best === null) {
    throw new Error('Live grid has no converged cells');
  }
  return {
    minC3: best.c3,
    minC3Date: jdTdbToUtcDateString(best.depJD),
    minC3TofDays: best.tofDays,
  };
}

function segmentComponents(cells, threshold, connectivity) {
  const active = new Uint8Array(cells.length);
  for (let index = 0; index < cells.length; index += 1) {
    const c3 = selectedC3(cells[index]);
    active[index] = c3 !== null && c3 <= threshold ? 1 : 0;
  }
  const visited = new Uint8Array(cells.length);
  const offsets = connectivity === 4
    ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
    : [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const components = [];

  for (let start = 0; start < cells.length; start += 1) {
    if (active[start] === 0 || visited[start] === 1) {
      continue;
    }
    const stack = [start];
    visited[start] = 1;
    let cellCount = 0;
    let minC3 = Number.POSITIVE_INFINITY;
    let argminCell = null;
    let minDepJD = Number.POSITIVE_INFINITY;
    let maxDepJD = Number.NEGATIVE_INFINITY;
    let minTofDays = Number.POSITIVE_INFINITY;
    let maxTofDays = Number.NEGATIVE_INFINITY;

    while (stack.length > 0) {
      const index = stack.pop();
      const cell = cells[index];
      const c3 = selectedC3(cell);
      cellCount += 1;
      if (c3 < minC3) {
        minC3 = c3;
        argminCell = cell;
      }
      minDepJD = Math.min(minDepJD, cell.depJD);
      maxDepJD = Math.max(maxDepJD, cell.depJD);
      minTofDays = Math.min(minTofDays, cell.tofDays);
      maxTofDays = Math.max(maxTofDays, cell.tofDays);
      const depIndex = Math.floor(index / nTof);
      const tofIndex = index % nTof;
      for (const [depOffset, tofOffset] of offsets) {
        const nextDep = depIndex + depOffset;
        const nextTof = tofIndex + tofOffset;
        if (nextDep < 0 || nextDep >= nDep || nextTof < 0 || nextTof >= nTof) {
          continue;
        }
        const nextIndex = nextDep * nTof + nextTof;
        if (active[nextIndex] === 1 && visited[nextIndex] === 0) {
          visited[nextIndex] = 1;
          stack.push(nextIndex);
        }
      }
    }

    components.push({
      minC3,
      argmin: {
        date: jdTdbToUtcDateString(argminCell.depJD),
        tofDays: argminCell.tofDays,
      },
      breadthDays: maxDepJD - minDepJD,
      cellCount,
      tofSpanDays: maxTofDays - minTofDays,
    });
  }
  return components.sort((left, right) => left.minC3 - right.minC3);
}

function structureForGrid(cells, liveMinC3) {
  const thresholds = {
    liveMinPlus2: liveMinC3 + 2,
    liveMinPlus5: liveMinC3 + 5,
    liveMinPlus10: liveMinC3 + 10,
    absolute25: 25,
  };
  return Object.fromEntries(Object.entries(thresholds).map(([name, thresholdKm2S2]) => [name, {
    thresholdKm2S2,
    conn4: segmentComponents(cells, thresholdKm2S2, 4),
    conn8: segmentComponents(cells, thresholdKm2S2, 8),
  }]));
}

function dateDifferenceDays(left, right) {
  return Math.abs(Date.parse(`${left}T00:00:00Z`) - Date.parse(`${right}T00:00:00Z`)) / 86_400_000;
}

function runWorker(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: payload });
    worker.once('message', (message) => message.error ? reject(new Error(message.error)) : resolve(message));
    worker.once('error', reject);
    worker.once('exit', (code) => code === 0 || reject(new Error(`Worker exited with code ${code}`)));
  });
}

async function measureParallel(selectedBodies, earthSeries) {
  const startedAt = performance.now();
  const timeoutMs = 30 * 60 * 1000;
  let timeout;
  try {
    const results = await Promise.race([
      Promise.all(selectedBodies.map((body) => runWorker({
        mode: 'parallel-grid',
        runtimeOutDir,
        body,
        earthSeries,
        gridParams,
      }))),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('parallel worker attempt exceeded 30 minutes')), timeoutMs);
      }),
    ]);
    return {
      status: 'measured',
      wallMs: performance.now() - startedAt,
      bodies: results,
    };
  } catch (error) {
    return { status: 'not_measured', reason: String(error?.message ?? error) };
  } finally {
    clearTimeout(timeout);
  }
}

function buildSanityFlags(bodies) {
  const successful = bodies.filter((body) => !body.error);
  const withinFive = successful.map((body) => ({
    id: body.id,
    pass: body.live.minC3 >= body.cached.minC3 - 5 && body.live.minC3 <= body.cached.minC3 + 5,
    cachedMinC3: body.cached.minC3,
    liveMinC3: body.live.minC3,
  }));
  const eros = successful.find((body) => body.id === '433');
  const erosComponents = eros?.structure.liveMinPlus5.conn4.length ?? null;
  const componentMinima = successful.flatMap((body) =>
    Object.entries(body.structure).flatMap(([threshold, structure]) =>
      ['conn4', 'conn8'].flatMap((connectivity) => structure[connectivity].map((component, index) => ({
        id: body.id,
        threshold,
        connectivity,
        component: index,
        pass: component.minC3 >= body.live.minC3 - 1e-9,
      }))),
    ),
  );
  return {
    liveMinWithinCachedPlusMinus5: {
      pass: withinFive.every((entry) => entry.pass),
      bodies: withinFive,
    },
    erosLiveMinPlus5HasAtLeastTwoConn4Components: {
      pass: erosComponents !== null && erosComponents >= 2,
      componentCount: erosComponents,
    },
    allComponentMinimaAtLeastLiveMinMinus1e9: {
      pass: componentMinima.every((entry) => entry.pass),
      failures: componentMinima.filter((entry) => !entry.pass),
    },
    cachedMinOutsideViewWindow: {
      count: successful.filter((body) => body.spanFlag.cachedMinOutsideViewWindow).length,
      bodyIds: successful
        .filter((body) => body.spanFlag.cachedMinOutsideViewWindow)
        .map((body) => body.id),
    },
  };
}

async function main() {
  try {
    compileRuntimeModules();
    const functions = await runtimeFunctions();
    const { byDesignation, earthSeries, cache, cacheByDesignation } = await loadInputs();
    const span = preflightBoundsGuard(earthSeries);
    const deps = makeDeps(earthSeries, functions);
    const selectedBodies = bodyIds.map((id) => {
      const body = byDesignation.get(id);
      if (!body) {
        throw new Error(`Catalog body ${id} absent`);
      }
      return body;
    });
    const bodies = [];
    let serialTotalMs = 0;

    for (const id of bodyIds) {
      try {
        const body = byDesignation.get(id);
        const cachedRecord = cacheByDesignation.get(id);
        if (!cachedRecord) {
          throw new Error(`Cache record ${id} absent`);
        }
        const runCount = id === '99942' ? 3 : 1;
        const runsComputeMs = [];
        let liveGrid;
        for (let run = 0; run < runCount; run += 1) {
          const result = functions.computePorkchopGrid(body.elements, gridParams, 0, deps);
          runsComputeMs.push(result.compute_ms);
          if (run === 0) {
            liveGrid = result;
            serialTotalMs += result.compute_ms;
          }
        }
        const live = {
          ...extractLiveMinimum(liveGrid.cells),
          computeMs: liveGrid.compute_ms,
        };
        const cached = {
          minC3: cachedRecord.minC3,
          minC3Date: cachedRecord.minC3Date,
          minC3TofDays: cachedRecord.minC3TofDays,
          bestWindows: cachedRecord.bestWindows,
        };
        const structure = structureForGrid(liveGrid.cells, live.minC3);
        bodies.push({
          id,
          spkId: body.spkId,
          orbitClass: body.class,
          cached,
          live,
          diff: {
            deltaMinC3: live.minC3 - cached.minC3,
            absoluteDateDays: dateDifferenceDays(live.minC3Date, cached.minC3Date),
            absoluteTofDays: Math.abs(live.minC3TofDays - cached.minC3TofDays),
          },
          spanFlag: {
            cachedMinOutsideViewWindow: cached.minC3Date > departureEnd,
          },
          timing: {
            singleRunComputeMs: runsComputeMs[0],
            runsComputeMs,
            medianComputeMs: median(runsComputeMs),
          },
          structure,
        });
      } catch (error) {
        const errorName = error instanceof Error ? error.name : typeof error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : String(error);
        console.error(`[body ${id}] error.name: ${errorName}`);
        console.error(`[body ${id}] error.message: ${errorMessage}`);
        console.error(`[body ${id}] error.stack:`);
        console.error(errorStack);
        bodies.push({ id, error: String(error?.message ?? error) });
      }
    }

    const successfulCount = bodies.filter((body) => !body.error).length;
    if (successfulCount < 3) {
      throw new Error(`Only ${successfulCount} bodies succeeded; at least 3 required`);
    }
    const parallel = await measureParallel(selectedBodies, earthSeries);
    const result = {
      marker,
      generatedAt: new Date().toISOString(),
      head: gitHead(),
      machine: {
        platform: os.platform(),
        cpuModel: os.cpus()[0]?.model ?? 'unknown',
        coreCount: os.cpus().length,
        nodeVersion: process.version,
      },
      span,
      cacheMetadata: cache.metadata,
      liveGrid: {
        nDep,
        nTof,
        M: 0,
        departureStart,
        departureEnd,
        tofMinDays: gridParams.tofMinDays,
        tofMaxDays: gridParams.tofMaxDays,
      },
      bodies,
      serialTotalMs,
      parallel,
      sanity: buildSanityFlags(bodies),
    };
    writeJson(outputPath, result);
    console.log(`wrote ${outputPath}`);
    console.log(`successful bodies: ${successfulCount}/${bodyIds.length}`);
    console.log(`parallel: ${parallel.status}${parallel.reason ? ` — ${parallel.reason}` : ''}`);
    console.log(`sanity min±5: ${result.sanity.liveMinWithinCachedPlusMinus5.pass}`);
    console.log(`sanity Eros components: ${result.sanity.erosLiveMinPlus5HasAtLeastTwoConn4Components.pass}`);
    console.log(`sanity component minima: ${result.sanity.allComponentMinimaAtLeastLiveMinMinus1e9.pass}`);
    console.log(`sanity span flags: ${result.sanity.cachedMinOutsideViewWindow.count}`);
  } finally {
    fs.rmSync(runtimeOutDir, { recursive: true, force: true });
  }
}

async function workerMain() {
  try {
    const functions = await runtimeFunctions(workerData.runtimeOutDir);
    const deps = makeDeps(workerData.earthSeries, functions);
    const result = functions.computePorkchopGrid(workerData.body.elements, workerData.gridParams, 0, deps);
    parentPort.postMessage({ id: workerData.body.designation, computeMs: result.compute_ms });
  } catch (error) {
    parentPort.postMessage({ error: String(error?.message ?? error) });
  }
}

if (isMainThread) {
  await main();
} else {
  await workerMain();
}
