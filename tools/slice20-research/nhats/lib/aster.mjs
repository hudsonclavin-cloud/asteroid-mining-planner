// S20_NHATS_CROSSCHECK - Aster side. COPIED (not imported) from the pattern in
// tools/slice20-research/longrun2/lib/common2.mjs, as the dispatch asks.
// Compiles the PRODUCTION modules with the repo's own tsc into <NHATS_STORE>/build (outside the repo).
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '..', '..', '..', '..');
export const store = process.env.NHATS_STORE;
if (!store) throw new Error('set NHATS_STORE to a directory outside the repo');
export const buildDir = path.join(store, 'build');
export const SEED = 20261115; // dispatch date
export const ENTRIES = [
  'boundary/horizons.ts', 'boundary/slice9-nea-catalog.ts', 'boundary/tier-assignments.ts',
  'core/units.ts', 'core/interpolators/hermite.ts', 'core/propagators/keplerian.ts', 'core/constants/bodies.ts',
  'core/lambert/lambert-multi-rev.ts', 'porkchop/grid-compute.ts', 'porkchop/delta-v.ts', 'porkchop/support-boundary.ts',
  'porkchop/propagation-guard.ts',
];
export const FILES = {
  earth: 'src/v2/data/horizons-inner-solar-system-2026-2040.json',
  catalog: 'tests/fixtures/v2/nea-catalog-slice9.json',
  tiers: 'docs/tier-sizing-per-body.json',
};
export const sha256File = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');

export function build() {
  fs.rmSync(buildDir, { recursive: true, force: true });
  fs.mkdirSync(buildDir, { recursive: true });
  // AGENTS.md 2.2: process.execPath + the full tsc path, never the .bin shim.
  const tsc = spawnSync(process.execPath, [
    path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '--pretty', 'false', '--outDir', buildDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'), '--module', 'NodeNext', '--target', 'ES2020',
    '--moduleResolution', 'NodeNext', '--isolatedModules', 'true', '--skipLibCheck', 'true',
    ...ENTRIES.map((e) => path.join(repoRoot, 'src', 'v2', e)),
  ], { cwd: repoRoot, encoding: 'utf8' });
  const stamp = { node: process.version, tscStatus: tsc.status, tscOutput: `${tsc.stdout ?? ''}${tsc.stderr ?? ''}`.trim().split('\n').slice(0, 30),
    sourceSha256: Object.fromEntries(ENTRIES.map((e) => [e, sha256File(path.join(repoRoot, 'src', 'v2', e))])) };
  fs.writeFileSync(path.join(buildDir, 'build-stamp.json'), `${JSON.stringify(stamp, null, 2)}\n`);
  return stamp;
}
export function readStamp() {
  const p = path.join(buildDir, 'build-stamp.json');
  if (!fs.existsSync(p)) throw new Error('no build; run lib/build.mjs first');
  const stamp = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [e, s] of Object.entries(stamp.sourceSha256)) if (sha256File(path.join(repoRoot, 'src', 'v2', e)) !== s) throw new Error(`source changed since the build: ${e}`);
  return stamp;
}
export const importV2 = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);

export async function loadEarthSeries() {
  const { ingestSlice2Fixture } = await importV2('boundary/horizons.js');
  return ingestSlice2Fixture(JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.earth), 'utf8'))).earth.map((s) => s.state);
}
export async function loadCatalogBodies() {
  const { ingestSlice9Fixture } = await importV2('boundary/slice9-nea-catalog.js');
  return Object.values(ingestSlice9Fixture(JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.catalog), 'utf8'))).asteroids);
}
export function loadTiers() {
  return new Map(Object.entries(JSON.parse(fs.readFileSync(path.join(repoRoot, FILES.tiers), 'utf8')).records ?? {}));
}
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function seededShuffle(items, seed) {
  const rand = mulberry32(seed); const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q; const lo = Math.floor(pos); const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
export function writeJsonAtomic(p, v, pretty = true) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const side = `${p}.tmp-${process.pid}`;
  fs.writeFileSync(side, pretty ? `${JSON.stringify(v, null, 2)}\n` : `${JSON.stringify(v)}\n`);
  fs.renameSync(side, p);
}
