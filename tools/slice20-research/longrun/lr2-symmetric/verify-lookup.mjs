#!/usr/bin/env node
// LR2 step 1 — verify the tools-only indexed (bisection) Earth lookup against the PRODUCTION lookup.
// Gate (dispatch LR2.1): >= 2,000 random epochs across the fixture plus both endpoints must match
// production interpolateBodyStateSeries with max abs difference EXACTLY 0. Otherwise HALT LR2.
//
// Also checked (stricter than the gate): every sample epoch itself, the epochs just inside each end,
// and that an out-of-range epoch throws in both. Writes lookup-verification.json next to this script.
//
// Usage: node tools/slice20-research/longrun/lr2-symmetric/verify-lookup.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RUN_SEED, EARTH_FIXTURE_REL, importV2, loadEarthSeries, makeIndexedEarthLookup, mulberry32, readBuildStamp,
  repoRoot, sha256File, writeJsonAtomic,
} from '../lib/common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const stamp = readBuildStamp();
const { interpolateBodyStateSeries, interpolateBodyState } = await importV2('core/interpolators/hermite.js');
const series = await loadEarthSeries();
const indexed = makeIndexedEarthLookup(series, interpolateBodyState);
const production = (t) => interpolateBodyStateSeries('earth', series, t);

const first = series[0].tdbSeconds;
const last = series[series.length - 1].tdbSeconds;
const N_RANDOM = 5000;
const rand = mulberry32((RUN_SEED ^ 0x1ee7c0de) >>> 0);

let maxAbsDiff = 0;
let compared = 0;
let sameObjectOnExactSample = 0;
let frameOrEpochMismatch = 0;
const diffState = (a, b) => {
  const d = Math.max(
    Math.abs(a.positionM.x - b.positionM.x), Math.abs(a.positionM.y - b.positionM.y), Math.abs(a.positionM.z - b.positionM.z),
    Math.abs(a.velocityMps.x - b.velocityMps.x), Math.abs(a.velocityMps.y - b.velocityMps.y), Math.abs(a.velocityMps.z - b.velocityMps.z),
  );
  if (a.frame !== b.frame || a.tdbSeconds !== b.tdbSeconds) frameOrEpochMismatch += 1;
  return d;
};
const check = (t) => {
  const p = production(t);
  const q = indexed(t);
  const d = diffState(p, q);
  if (!(d === 0)) maxAbsDiff = Math.max(maxAbsDiff, Number.isNaN(d) ? Infinity : d);
  compared += 1;
  return p === q;
};

// 1. random epochs across the fixture
for (let i = 0; i < N_RANDOM; i += 1) check(first + rand() * (last - first));
const randomCompared = compared;
// 2. both endpoints
check(first);
check(last);
// 3. just inside each end, and just either side of an interior sample
const eps = 1e-3; // seconds
for (const t of [first + eps, last - eps, series[2700].tdbSeconds - eps, series[2700].tdbSeconds + eps]) check(t);
// 4. every sample epoch (production returns the sample object itself; so must the indexed lookup)
for (const s of series) if (check(s.tdbSeconds)) sameObjectOnExactSample += 1;

// 5. out-of-range behaviour: both must throw
const throws = (fn, t) => { try { fn(t); return false; } catch { return true; } };
const outOfRange = {
  productionThrowsBeforeFirst: throws(production, first - 1),
  indexedThrowsBeforeFirst: throws(indexed, first - 1),
  productionThrowsAfterLast: throws(production, last + 1),
  indexedThrowsAfterLast: throws(indexed, last + 1),
  indexedThrowsOnNaN: throws(indexed, Number.NaN),
};

const pass = maxAbsDiff === 0 && frameOrEpochMismatch === 0 && sameObjectOnExactSample === series.length
  && Object.values(outOfRange).every(Boolean);
const result = {
  schema: 'aster-s20-longrun-lr2-lookup-verification/1',
  generatedAtUtc: new Date().toISOString(),
  headCommit: stamp.head,
  node: process.version,
  fixture: { path: EARTH_FIXTURE_REL, sha256: sha256File(path.join(repoRoot, EARTH_FIXTURE_REL)), samples: series.length, firstTdbSeconds: first, lastTdbSeconds: last },
  seed: (RUN_SEED ^ 0x1ee7c0de) >>> 0,
  randomEpochs: randomCompared,
  totalEpochsCompared: compared,
  maxAbsDiff,
  frameOrEpochMismatch,
  exactSampleEpochs: series.length,
  sameObjectOnExactSample,
  outOfRange,
  gate: 'max abs difference exactly 0 over >= 2,000 random epochs plus both endpoints',
  verdict: pass ? 'PASS' : 'FAIL -> HALT LR2',
};
writeJsonAtomic(path.join(here, 'lookup-verification.json'), result, true);
console.log(JSON.stringify(result, null, 2));
if (!pass) process.exit(1);
