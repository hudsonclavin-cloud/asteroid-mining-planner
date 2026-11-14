// S20_LONGRUN2 shared helpers (tools-only research; nothing here is imported by production code).
//
// Compiles the PRODUCTION TypeScript modules the second long run needs into <scratch>/build-v2x, outside
// the repo, with the repo's own tsc. Scratch root: env LONGRUN2_SCRATCH (required).
// Pure helpers (seeded PRNG, quantile, atomic write, the LR2-verified indexed Earth lookup) are imported
// from the first long run's lib, which is on main. XR0 does not use this file at all.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export {
  mulberry32, seededShuffle, quantile, writeJsonAtomic, jdTdbToDate, makeIndexedEarthLookup,
} from '../../longrun/lib/common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '..', '..', '..', '..');
export const scratchRoot = process.env.LONGRUN2_SCRATCH;
if (!scratchRoot) throw new Error('set LONGRUN2_SCRATCH to a directory outside the repo');
export const buildDir = path.join(scratchRoot, 'build-v2x');
export const RUN2_SEED = 20261114; // dispatch date

export const ENTRIES = [
  'boundary/horizons.ts', 'boundary/slice9-nea-catalog.ts', 'boundary/tier-assignments.ts',
  'boundary/lambert-screen-cache.ts',
  'core/units.ts', 'core/units/utc-to-tdb.ts', 'core/interpolators/hermite.ts', 'core/propagators/keplerian.ts',
  'core/lambert/lambert-multi-rev.ts', 'core/lambert/izzo.ts',
  'porkchop/grid-compute.ts', 'porkchop/compare-data.ts', 'porkchop/delta-v.ts', 'porkchop/launch-vehicles.ts',
  'porkchop/propagation-guard.ts', 'porkchop/segment-windows.ts', 'porkchop/support-boundary.ts',
  'porkchop/format-c3.ts', 'render/asteroid-screening-color.ts',
];

export function sha256File(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/** Compile once (build.mjs). The stamp is keyed to the bytes of every compiled entry, not to git. */
export function build() {
  fs.rmSync(buildDir, { recursive: true, force: true });
  fs.mkdirSync(buildDir, { recursive: true });
  const tsc = spawnSync(process.execPath, [
    path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '--pretty', 'false', '--outDir', buildDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'), '--module', 'NodeNext', '--target', 'ES2020',
    '--moduleResolution', 'NodeNext', '--isolatedModules', 'true', '--skipLibCheck', 'true',
    ...ENTRIES.map((e) => path.join(repoRoot, 'src', 'v2', e)),
  ], { cwd: repoRoot, encoding: 'utf8' });
  // render/asteroid-screening-color.ts imports 'three'; give the scratch build the repo's node_modules.
  const link = path.join(buildDir, 'node_modules');
  if (!fs.existsSync(link)) fs.symlinkSync(path.join(repoRoot, 'node_modules'), link, 'dir');
  const stamp = {
    node: process.version, tscStatus: tsc.status,
    tscOutput: `${tsc.stdout ?? ''}${tsc.stderr ?? ''}`.trim().split('\n').slice(0, 30),
    sourceSha256: Object.fromEntries(ENTRIES.map((e) => [e, sha256File(path.join(repoRoot, 'src', 'v2', e))])),
  };
  fs.writeFileSync(path.join(buildDir, 'build-stamp.json'), `${JSON.stringify(stamp, null, 2)}\n`);
  return stamp;
}

export function readStamp() {
  const stampPath = path.join(buildDir, 'build-stamp.json');
  if (!fs.existsSync(stampPath)) throw new Error('no build; run tools/slice20-research/longrun2/lib/build.mjs first');
  const stamp = JSON.parse(fs.readFileSync(stampPath, 'utf8'));
  for (const [entry, sha] of Object.entries(stamp.sourceSha256)) {
    if (sha256File(path.join(repoRoot, 'src', 'v2', entry)) !== sha) throw new Error(`source changed since the build: ${entry}`);
  }
  return stamp;
}

export const importV2 = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);

export const FILES = {
  earth: 'src/v2/data/horizons-inner-solar-system-2026-2040.json',
  catalog: 'tests/fixtures/v2/nea-catalog-slice9.json',
  tiers: 'docs/tier-sizing-per-body.json',
  cacheShipped: 'tests/fixtures/v2/lambert-screen-cache.json',
  cacheDocs: 'docs/lambert-screen-cache.json',
  precompute: 'tools/build/precompute-lambert-screen.mjs',
};

export async function loadEarthSeries() {
  const { ingestSlice2Fixture } = await importV2('boundary/horizons.js');
  return ingestSlice2Fixture(JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.earth), 'utf8'))).earth.map((s) => s.state);
}

/** Catalog bodies in fixture order - the order the precompute script iterates. */
export async function loadCatalogBodies() {
  const { ingestSlice9Fixture } = await importV2('boundary/slice9-nea-catalog.js');
  return Object.values(ingestSlice9Fixture(JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.catalog), 'utf8'))).asteroids);
}

export function loadTiers() {
  return new Map(Object.entries(JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.tiers), 'utf8')).records ?? {}));
}

export function loadCache(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// ---- transfer-orbit validity, LR1's definition verbatim -----------------------------------------
// Read from tools/slice20-research/longrun/lr1-oracle/oracle_driver.py (transferOrbit: semi-major axis,
// eccentricity, perihelion from the departure state) and lr1-oracle/report.mjs (perihelionPassages and
// the band "q < 1 solar radius AND the flown arc passes perihelion"). Constants as there.
export const AU_KM = 149_597_870.7; // IAU 2012 astronomical unit
export const SOLAR_RADIUS_KM = 695_700; // IAU 2015 nominal solar radius

/** Eccentricity and perihelion (km) of the two-body orbit through (r, v). oracle_driver.py lines for transferOrbit. */
export function transferOrbit(r, v, mu) {
  const rMag = Math.hypot(r[0], r[1], r[2]);
  const energy = 0.5 * (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) - mu / rMag;
  const hx = r[1] * v[2] - r[2] * v[1];
  const hy = r[2] * v[0] - r[0] * v[2];
  const hz = r[0] * v[1] - r[1] * v[0];
  const a = -mu / (2 * energy);
  const ecc = Math.sqrt(Math.max(0, 1 + (2 * energy * (hx * hx + hy * hy + hz * hz)) / (mu * mu)));
  return { a, ecc, q: a * (1 - ecc), energy, rMag };
}

/** How many times the flown arc passes perihelion. COPY of perihelionPassages in lr1-oracle/report.mjs. */
export function perihelionPassages(r1, v1, tofSeconds, mu, eccentricity) {
  const r = Math.hypot(r1[0], r1[1], r1[2]);
  const energy = (v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]) / 2 - mu / r;
  const rv = r1[0] * v1[0] + r1[1] * v1[1] + r1[2] * v1[2];
  if (energy >= 0) {
    if (rv >= 0) return 0;
    const a = -mu / (2 * energy);
    const coshF = Math.max(1, (1 - r / a) / eccentricity);
    const F = Math.acosh(coshF);
    const timeToPerihelion = (eccentricity * Math.sinh(F) - F) / Math.sqrt(mu / (-a) ** 3);
    return tofSeconds > timeToPerihelion ? 1 : 0;
  }
  const a = -mu / (2 * energy);
  const n = Math.sqrt(mu / a ** 3);
  const cosE = Math.min(1, Math.max(-1, (1 - r / a) / eccentricity));
  let E = Math.acos(cosE);
  if (rv < 0) E = 2 * Math.PI - E;
  const meanAnomaly = E - eccentricity * Math.sin(E);
  return Math.floor((meanAnomaly + n * tofSeconds) / (2 * Math.PI));
}

// Fixed log histogram of transfer perihelion, for deciles over billions of cells without storing them.
export const Q_HIST = { minLog10Au: -7, maxLog10Au: 1.5, bins: 850 }; // 0.01 dex per bin (about 2.3% in q)
export function qBin(qKm) {
  if (!(qKm > 0)) return 0;
  const x = Math.log10(qKm / AU_KM);
  const i = Math.floor(((x - Q_HIST.minLog10Au) / (Q_HIST.maxLog10Au - Q_HIST.minLog10Au)) * Q_HIST.bins);
  return i < 0 ? 0 : i >= Q_HIST.bins ? Q_HIST.bins - 1 : i;
}
export const qBinUpperAu = (i) => 10 ** (Q_HIST.minLog10Au + ((i + 1) / Q_HIST.bins) * (Q_HIST.maxLog10Au - Q_HIST.minLog10Au));
