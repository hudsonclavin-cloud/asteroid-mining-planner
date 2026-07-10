import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const mcpRoot = resolve(scriptDir, '..');
const repoRoot = resolve(mcpRoot, '..');
const generatedDir = resolve(mcpRoot, 'dist', 'mcp', 'src', 'generated');
const assetRoot = resolve(generatedDir, 'repo-assets');

const runtimeAssetPaths = [
  'tests/fixtures/v2/nea-catalog-slice9.json',
  'tests/fixtures/v2/lambert-screen-cache.json',
  'src/v2/data/horizons-inner-solar-system-2026-2040.json',
  'tools/slice11-research/data/poliastro-validation.json',
  'tools/slice11-research/data/multi-rev-poliastro-validation.json',
  'tools/slice12-research/data/dla-oracle-m1-vectors.json',
  'tools/slice13-research/elvperf/oracle/oracle-report.md'
];

function git(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

const commit = git(['log', '-1', '--format=%H']);
const dirty = git(['status', '--porcelain']).length > 0;
const bakedAt = new Date().toISOString();

mkdirSync(generatedDir, { recursive: true });
rmSync(assetRoot, { recursive: true, force: true });
mkdirSync(assetRoot, { recursive: true });

writeFileSync(
  resolve(generatedDir, 'baked-provenance.json'),
  `${JSON.stringify({ commit, bakedAt, dirty }, null, 2)}\n`,
  'utf8'
);

for (const relativePath of runtimeAssetPaths) {
  const source = resolve(repoRoot, relativePath);
  const destination = resolve(assetRoot, relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination);
}
