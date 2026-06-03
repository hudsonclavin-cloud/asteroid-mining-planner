#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadLambertMultiRev } from './lambert-multi-rev-local.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const TEMP_OUT_DIR = path.join(repoRoot, '.tmp-tests', 'slice11-m2');
const DATA_PATH = path.join(repoRoot, 'tools', 'slice11-research', 'data', 'multi-rev-worth-it.json');
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const SCREEN_CACHE_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json');
const HORIZONS_FIXTURE = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-inner-solar-system-2026-2040.json',
);

const RNG_SEED = 11;
const SAMPLE_TARGET = 25;
const MU_SUN = 1.32712440018e11;
const FEASIBLE_C3_MAX = 25.0;
const MEANINGFUL_DELTA = 1.0;
const SECONDS_PER_DAY = 86_400;

function isoNow() {
  return new Date().toISOString();
}

function kmVectorFromMeters(positionM) {
  return [positionM.x / 1000, positionM.y / 1000, positionM.z / 1000];
}

function kmpsVectorFromMps(velocityMps) {
  return [velocityMps.x / 1000, velocityMps.y / 1000, velocityMps.z / 1000];
}

function subtract3(left, right) {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function magnitude3(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deterministicShuffle(items, seed) {
  const rng = mulberry32(seed);
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool;
}

function compileRuntimeModules() {
  fs.rmSync(TEMP_OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(TEMP_OUT_DIR, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
  const tscResult = spawnSync(
    tscBin,
    [
      '--pretty', 'false',
      '--outDir', TEMP_OUT_DIR,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
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
  if (tscResult.status !== 0) {
    throw new Error(tscResult.stderr || tscResult.stdout || 'TypeScript compile failed');
  }
}

const importJs = async (relPath) => import(pathToFileURL(path.join(TEMP_OUT_DIR, relPath)).href);

function buildDepartureDates(startUtc, endUtc, stepDays) {
  const dates = [];
  const cursor = new Date(`${startUtc}T00:00:00Z`);
  const stop = new Date(`${endUtc}T00:00:00Z`);
  while (cursor <= stop) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + stepDays);
  }
  return dates;
}

function buildTofDays(minDays, maxDays, stepDays) {
  const values = [];
  for (let day = minDays; day <= maxDays; day += stepDays) {
    values.push(day);
  }
  return values;
}

function chooseSample(bodies) {
  const byClass = {
    ATE: bodies.filter((body) => body.class === 'ATE'),
    APO: bodies.filter((body) => body.class === 'APO'),
    AMO: bodies.filter((body) => body.class === 'AMO'),
    IEO: bodies.filter((body) => body.class === 'IEO'),
  };

  const ate = deterministicShuffle(byClass.ATE, RNG_SEED + 1).slice(0, SAMPLE_TARGET);
  const apoPool = deterministicShuffle(byClass.APO, RNG_SEED + 2);
  const amo = deterministicShuffle(byClass.AMO, RNG_SEED + 3).slice(0, SAMPLE_TARGET);
  const ieoPool = deterministicShuffle(byClass.IEO, RNG_SEED + 4);
  const ieo = ieoPool.slice(0, SAMPLE_TARGET);

  const sample = [...ate];
  const used = new Set(sample.map((body) => body.bodyId));

  function takeInto(target, pool, count) {
    for (const body of pool) {
      if (used.has(body.bodyId)) {
        continue;
      }
      used.add(body.bodyId);
      target.push(body);
      if (target.length === count) {
        return;
      }
    }
  }

  const apo = [];
  takeInto(apo, apoPool, SAMPLE_TARGET);

  const amoUnique = [];
  takeInto(amoUnique, amo, SAMPLE_TARGET);

  const ieoUnique = [];
  takeInto(ieoUnique, ieo, SAMPLE_TARGET);
  if (ieoUnique.length < SAMPLE_TARGET) {
    takeInto(ieoUnique, apoPool, SAMPLE_TARGET);
  }

  sample.push(...apo, ...amoUnique, ...ieoUnique);

  if (sample.length !== 100) {
    throw new Error(`Expected 100 sampled bodies, received ${sample.length}`);
  }

  return sample;
}

async function main() {
  compileRuntimeModules();

  const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
  const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
  const { normalizeSlice9BodyForRuntime } = await importJs('app/solar-system/slice9-runtime-asteroids.js');
  const { utcStringToTdbSeconds } = await importJs('core/units/utc-to-tdb.js');
  const { interpolateBodyStateSeries } = await importJs('core/interpolators/hermite.js');
  const { propagateKeplerianStateVectors } = await importJs('core/propagators/keplerian.js');

  const lambertMultiRev = await loadLambertMultiRev(TEMP_OUT_DIR);

  const rawCatalog = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
  const canonicalCatalog = ingestSlice9Fixture(rawCatalog);
  const bodies = Object.values(canonicalCatalog.asteroids).map((body) => normalizeSlice9BodyForRuntime(body));

  const rawScreenCache = JSON.parse(fs.readFileSync(SCREEN_CACHE_FIXTURE, 'utf8'));
  const cacheByBodyId = new Map(rawScreenCache.bodies.map((body) => [body.bodyId, body]));
  const sample = chooseSample(bodies);

  const metadata = rawScreenCache.metadata;
  const departureDatesUtc = buildDepartureDates(
    metadata.screeningWindow.startUtc,
    metadata.screeningWindow.endUtc,
    metadata.departureGridSpacingDays,
  );
  const departureTdbSeconds = departureDatesUtc.map((date) => utcStringToTdbSeconds(date));
  const tofDaysGrid = buildTofDays(metadata.tofMinDays, metadata.tofMaxDays, metadata.tofGridSpacingDays);

  const rawHorizons = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
  const horizonsStates = ingestSlice2Fixture(rawHorizons);
  const earthSeries = horizonsStates.earth.map((sampleEntry) => sampleEntry.state);

  const bodiesOut = [];
  let fullyFailedBodies = 0;
  const meaningfulByClass = { ATE: 0, APO: 0, AMO: 0, IEO: 0 };

  for (let bodyIndex = 0; bodyIndex < sample.length; bodyIndex += 1) {
    const body = sample[bodyIndex];
    const m0 = cacheByBodyId.get(body.bodyId);
    if (!m0) {
      throw new Error(`Missing M=0 cache entry for ${body.bodyId}`);
    }

    let best = null;
    let failedCells = 0;
    let convergedCells = 0;

    for (let depIndex = 0; depIndex < departureTdbSeconds.length; depIndex += 1) {
      const departureTdb = departureTdbSeconds[depIndex];
      const departureDate = departureDatesUtc[depIndex];
      const earthState = interpolateBodyStateSeries('earth', earthSeries, departureTdb);
      const earthPositionKm = kmVectorFromMeters(earthState.positionM);
      const earthVelocityKmps = kmpsVectorFromMps(earthState.velocityMps);

      for (const tofDays of tofDaysGrid) {
        const tofSeconds = tofDays * SECONDS_PER_DAY;
        const arrivalTdb = departureTdb + tofSeconds;
        const asteroidState = propagateKeplerianStateVectors(body.elements, arrivalTdb);
        const asteroidPositionKm = kmVectorFromMeters(asteroidState.positionM);
        const asteroidVelocityKmps = kmpsVectorFromMps(asteroidState.velocityMps);

        const branches = lambertMultiRev(MU_SUN, earthPositionKm, asteroidPositionKm, tofSeconds, { M: 1 });
        const candidates = [branches.left, branches.right].filter((result) => result.ok);
        if (candidates.length === 0) {
          failedCells += 1;
          continue;
        }

        convergedCells += 1;
        for (const result of candidates) {
          const vInfDep = subtract3(result.v1, earthVelocityKmps);
          const vInfArr = subtract3(result.v2, asteroidVelocityKmps);
          const c3 = magnitude3(vInfDep) ** 2;
          const vInfDepMag = magnitude3(vInfDep);
          const vInfArrMag = magnitude3(vInfArr);
          if (!Number.isFinite(c3) || !Number.isFinite(vInfDepMag) || !Number.isFinite(vInfArrMag)) {
            continue;
          }
          if (!best || c3 < best.m1_minC3) {
            best = {
              m1_minC3: c3,
              m1_dep_date: departureDate,
              m1_tof_days: tofDays,
              m1_branch: result.branch,
            };
          }
        }
      }
    }

    if (!best) {
      fullyFailedBodies += 1;
    }

    const delta = best && m0.minC3 !== null ? m0.minC3 - best.m1_minC3 : null;
    const meaningfulWin = Boolean(best && delta !== null && delta >= MEANINGFUL_DELTA && best.m1_minC3 <= FEASIBLE_C3_MAX);
    if (meaningfulWin) {
      meaningfulByClass[body.class] += 1;
    }

    bodiesOut.push({
      bodyId: body.bodyId,
      designation: body.designation,
      orbitClass: body.class,
      eccentricity: body.elements.e,
      m0_minC3: m0.minC3,
      m1_minC3: best?.m1_minC3 ?? null,
      delta,
      m1_dep_date: best?.m1_dep_date ?? null,
      m1_tof_days: best?.m1_tof_days ?? null,
      m1_branch: best?.m1_branch ?? null,
      convergedCells,
      failedCells,
      meaningful_win: meaningfulWin,
    });

    if ((bodyIndex + 1) % 10 === 0) {
      console.log(`processed ${bodyIndex + 1} / ${sample.length}`);
    }
  }

  const fullyFailedFraction = fullyFailedBodies / sample.length;
  if (fullyFailedFraction > 0.2) {
    throw new Error(`M=1 screening fully failed for ${fullyFailedBodies}/${sample.length} bodies (${(fullyFailedFraction * 100).toFixed(1)}%)`);
  }

  const wins = bodiesOut.filter((body) => body.meaningful_win);
  const output = {
    schemaVersion: 1,
    generatedAt: isoNow(),
    sampleSize: bodiesOut.length,
    rngSeed: RNG_SEED,
    criteria: {
      meaningfulDelta: MEANINGFUL_DELTA,
      feasibleC3Max: FEASIBLE_C3_MAX,
    },
    bodies: bodiesOut,
    summary: {
      meaningfulWinCount: wins.length,
      meaningfulWinFraction: wins.length / bodiesOut.length,
      byOrbitClass: meaningfulByClass,
      tofRangeOfWins: {
        minDays: wins.length > 0 ? Math.min(...wins.map((body) => body.m1_tof_days)) : null,
        maxDays: wins.length > 0 ? Math.max(...wins.map((body) => body.m1_tof_days)) : null,
      },
      fullyFailedBodies,
      fullyFailedFraction,
    },
  };

  writeJson(DATA_PATH, output);
  console.log(`wrote ${DATA_PATH}`);
}

await main();
