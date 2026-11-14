// S20_LONGRUN shared helpers (tools-only research; nothing here is imported by production code).
//
// - buildV2(): compiles the PRODUCTION TypeScript modules with the repo's own tsc into a scratch
//   directory OUTSIDE the repo (never .tmp-* inside the worktree) and returns an importer.
// - Production data loaders driven from Node (the browser loaders use fetch()).
// - makeIndexedEarthLookup(): the tools-only bisection lookup LR2 verifies against production.
// - Seeded PRNG / shuffle so every sample in this run is reproducible.
//
// Scratch root: env LONGRUN_SCRATCH, else <os tmp>/aster-longrun-scratch.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '..', '..', '..', '..');
export const scratchRoot = process.env.LONGRUN_SCRATCH ?? path.join(os.tmpdir(), 'aster-longrun-scratch');
export const buildDir = path.join(scratchRoot, 'build-v2');

export const RUN_SEED = 20261113; // dispatch date; every seeded choice in this run derives from it

export const V2_ENTRIES = [
  'boundary/horizons.ts',
  'boundary/slice9-nea-catalog.ts',
  'boundary/tier-assignments.ts',
  'core/units.ts',
  'core/interpolators/hermite.ts',
  'core/propagators/keplerian.ts',
  'core/lambert/lambert-multi-rev.ts',
  'core/lambert/dla.ts',
  'porkchop/grid-compute.ts',
  'porkchop/compare-data.ts',
  'porkchop/delta-v.ts',
  'porkchop/launch-vehicles.ts',
  'porkchop/propagation-guard.ts',
  'porkchop/segment-windows.ts',
  'porkchop/support-boundary.ts',
];

export function sha256File(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

const git = (...args) => spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).stdout.trim();

/**
 * Identity of the PRODUCTION code the tools ran against. Evidence commits on the research branch
 * move HEAD without touching src/, so the identity is the src/v2 tree hash plus the commit the
 * branch forked from origin/main (falls back to HEAD when origin/main is not available).
 */
export function gitHead() {
  return git('merge-base', 'HEAD', 'origin/main') || git('rev-parse', 'HEAD');
}
export function srcV2Tree() {
  return git('rev-parse', 'HEAD:src/v2');
}
export function srcDirty() {
  return git('status', '--porcelain', '--', 'src/').length > 0;
}

/** Compile production modules into scratch. Call ONCE (build.mjs); workers use importV2(). */
export function buildV2() {
  fs.rmSync(buildDir, { recursive: true, force: true });
  fs.mkdirSync(buildDir, { recursive: true });
  // AGENTS.md §2.2: process.execPath + the full tsc path, never the .bin shim.
  const tsc = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false',
      '--outDir', buildDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      '--skipLibCheck', 'true',
      ...V2_ENTRIES.map((rel) => path.join(repoRoot, 'src', 'v2', rel)),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  const stamp = {
    head: gitHead(),
    srcV2Tree: srcV2Tree(),
    srcDirtyAtBuild: srcDirty(),
    node: process.version,
    tscStatus: tsc.status,
    tscOutput: `${tsc.stdout ?? ''}${tsc.stderr ?? ''}`.trim().split('\n').slice(0, 40),
    entries: V2_ENTRIES,
    sourceSha256: Object.fromEntries(
      V2_ENTRIES.map((rel) => [rel, sha256File(path.join(repoRoot, 'src', 'v2', rel))]),
    ),
  };
  fs.writeFileSync(path.join(buildDir, 'build-stamp.json'), `${JSON.stringify(stamp, null, 2)}\n`);
  return stamp;
}

export function readBuildStamp() {
  const stampPath = path.join(buildDir, 'build-stamp.json');
  if (!fs.existsSync(stampPath)) {
    throw new Error(`no build at ${buildDir}; run tools/slice20-research/longrun/lib/build.mjs first`);
  }
  const stamp = JSON.parse(fs.readFileSync(stampPath, 'utf8'));
  if (stamp.srcV2Tree !== srcV2Tree() || stamp.srcDirtyAtBuild || srcDirty()) {
    throw new Error(`build is stale or src/ is modified (stamp tree ${stamp.srcV2Tree}, now ${srcV2Tree()}); rebuild from a clean src/`);
  }
  return stamp;
}

export const importV2 = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);

/** mulberry32: small, well-known 32-bit PRNG. Deterministic across platforms (integer math only). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates with the seeded PRNG; returns a new array. */
export function seededShuffle(items, seed) {
  const rand = mulberry32(seed);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// COPY of the non-exported `utcMidnightToJdTdb` in src/v2/app/compare/main.ts:95-108 (same
// constants, same operation order). Kept byte-equivalent in behaviour; diff by eye against it.
export function makeUtcMidnightToJdTdb(J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY) {
  return function utcMidnightToJdTdb(utcDate) {
    const utcMillis = Date.parse(`${utcDate}T00:00:00Z`);
    if (!Number.isFinite(utcMillis)) {
      throw new Error(`Invalid UTC date '${utcDate}'`);
    }
    const unixToJ2000Seconds = 946_728_000;
    const tdbMinusUtcSeconds = 69.184;
    const tdbSecondsSinceJ2000 = utcMillis / 1000 - unixToJ2000Seconds + tdbMinusUtcSeconds;
    return J2000_TDB_JULIAN_DATE + tdbSecondsSinceJ2000 / SECONDS_PER_DAY;
  };
}

/** Calendar date of a TDB Julian date (no TDB-UTC shift). */
export const jdTdbToDate = (jd) => new Date((jd - 2_440_587.5) * 86_400_000).toISOString().slice(0, 10);

export const EARTH_FIXTURE_REL = 'src/v2/data/horizons-inner-solar-system-2026-2040.json';
export const CATALOG_FIXTURE_REL = 'tests/fixtures/v2/nea-catalog-slice9.json';
export const TIER_ARTIFACT_REL = 'docs/tier-sizing-per-body.json';
export const SCREEN_CACHE_REL = 'tests/fixtures/v2/lambert-screen-cache.json';

/** Earth series exactly as the compare page builds it: ingestSlice2Fixture(...).earth.map(s => s.state). */
export async function loadEarthSeries() {
  const { ingestSlice2Fixture } = await importV2('boundary/horizons.js');
  const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, EARTH_FIXTURE_REL), 'utf8'));
  return ingestSlice2Fixture(fixture).earth.map((s) => s.state);
}

export async function loadCatalogBodies() {
  const { ingestSlice9Fixture } = await importV2('boundary/slice9-nea-catalog.js');
  const catalog = ingestSlice9Fixture(JSON.parse(fs.readFileSync(path.join(repoRoot, CATALOG_FIXTURE_REL), 'utf8')));
  return Object.values(catalog.asteroids);
}

/** Same Map shape as loadTierAssignments() (designation -> record), read from the committed artifact. */
export function loadTiers() {
  const artifact = JSON.parse(fs.readFileSync(path.join(repoRoot, TIER_ARTIFACT_REL), 'utf8'));
  const entries = Object.entries(artifact.records ?? {});
  if (entries.length !== 41_906) {
    throw new Error(`tier artifact count mismatch: expected 41906, got ${entries.length}`);
  }
  return new Map(entries);
}

/** metadata.feasibleC3MaxKm2S2, the DEC-17-5(a) runtime read the compare page injects. */
export function loadFeasibleC3Max() {
  const cachePath = path.join(scratchRoot, 'screen-cache-metadata.json');
  if (fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    if (cached.sourceSha256 && cached.feasibleC3MaxKm2S2 !== undefined) return cached.feasibleC3MaxKm2S2;
  }
  const full = path.join(repoRoot, SCREEN_CACHE_REL);
  const value = JSON.parse(fs.readFileSync(full, 'utf8')).metadata.feasibleC3MaxKm2S2;
  fs.mkdirSync(scratchRoot, { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify({ sourceSha256: sha256File(full), feasibleC3MaxKm2S2: value }));
  return value;
}

/**
 * Tools-only indexed (bisection) Earth lookup with the SAME semantics as production
 * interpolateBodyStateSeries (core/interpolators/hermite.ts:82-122):
 *   - an epoch equal to a sample time returns that sample object itself;
 *   - an epoch strictly inside a bracket returns production interpolateBodyState(s0, s1, t);
 *   - anything else throws (production fails INV-008).
 * It calls the production interpolateBodyState, so only the BRACKET SEARCH differs.
 */
export function makeIndexedEarthLookup(samples, interpolateBodyState) {
  const n = samples.length;
  if (n < 2) throw new Error('indexed lookup needs at least two samples');
  const times = new Float64Array(n);
  for (let i = 0; i < n; i += 1) {
    times[i] = samples[i].tdbSeconds;
    if (i > 0 && !(times[i] > times[i - 1])) {
      throw new Error(`sample times not strictly increasing at index ${i}`);
    }
  }
  const first = times[0];
  const last = times[n - 1];
  function lookup(tdbSeconds) {
    if (!(tdbSeconds >= first && tdbSeconds <= last)) {
      throw new RangeError(`epoch ${tdbSeconds} outside Earth sample range [${first}, ${last}]`);
    }
    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >>> 1;
      if (times[mid] <= tdbSeconds) lo = mid;
      else hi = mid;
    }
    if (times[lo] === tdbSeconds) return samples[lo];
    if (times[hi] === tdbSeconds) return samples[hi];
    return interpolateBodyState(samples[lo], samples[hi], tdbSeconds);
  }
  lookup.firstTdbSeconds = first;
  lookup.lastTdbSeconds = last;
  return lookup;
}

/** Atomic JSON write: side file + rename, so a crash never leaves a half-written checkpoint. */
export function writeJsonAtomic(filePath, value, pretty = false) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const side = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(side, pretty ? `${JSON.stringify(value, null, 2)}\n` : `${JSON.stringify(value)}\n`);
  fs.renameSync(side, filePath);
}

export function quantile(sortedAscending, q) {
  if (sortedAscending.length === 0) return null;
  const pos = (sortedAscending.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sortedAscending[lo] + (sortedAscending[hi] - sortedAscending[lo]) * (pos - lo);
}
