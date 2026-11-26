// S20_OVERNIGHT - copied build pattern for production-module research.
// This tool compiles repository production modules into an external scratch path.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(process.argv[2] ?? '');
const outDir = path.resolve(process.argv[3] ?? '');
if (!repoRoot || !outDir || !fs.existsSync(path.join(repoRoot, 'src', 'v2'))) {
  throw new Error('usage: node build.mjs <repo-root> <external-output-dir>');
}

const entries = [
  'boundary/horizons.ts',
  'boundary/slice9-nea-catalog.ts',
  'core/constants/bodies.ts',
  'core/units.ts',
  'core/interpolators/hermite.ts',
  'core/propagators/keplerian.ts',
  'core/lambert/lambert-multi-rev.ts',
  'porkchop/grid-compute.ts',
  'porkchop/delta-v.ts',
  'porkchop/support-boundary.ts',
  'porkchop/propagation-guard.ts',
];
const sha256File = (filePath) => createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
const tsc = spawnSync(process.execPath, [
  path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
  '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
  '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
  '--isolatedModules', 'true', '--skipLibCheck', 'true',
  ...entries.map((entry) => path.join(repoRoot, 'src', 'v2', entry)),
], { cwd: repoRoot, encoding: 'utf8' });
const output = `${tsc.stdout ?? ''}${tsc.stderr ?? ''}`.trim();
const compiled = {};
for (const entry of entries) {
  const js = path.join(outDir, entry.replace(/\.ts$/, '.js'));
  if (fs.existsSync(js)) compiled[entry] = { path: js, bytes: fs.statSync(js).size, sha256: sha256File(js) };
}
const stamp = {
  generatedAtUtc: new Date().toISOString(),
  repoRoot,
  node: process.version,
  tscStatus: tsc.status,
  tscOutput: output.split('\n').slice(0, 40),
  sourceSha256: Object.fromEntries(entries.map((entry) => [entry, sha256File(path.join(repoRoot, 'src', 'v2', entry))])),
  compiled,
};
fs.writeFileSync(path.join(outDir, 'build-stamp.json'), `${JSON.stringify(stamp, null, 2)}\n`, { encoding: 'utf8' });
console.log(JSON.stringify({ outDir, tscStatus: tsc.status, compiled: Object.keys(compiled).length, stamp: path.join(outDir, 'build-stamp.json') }, null, 2));
if (tsc.status !== 0) process.exit(tsc.status ?? 1);
