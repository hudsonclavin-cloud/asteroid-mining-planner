/**
 * Regression guard: with every feature flag at its default, the Phase 3 scaffolds
 * (src/v2/flags.ts, src/v2/lowthrust, src/v2/livedata) change nothing a user sees.
 *
 * Three guards, each independent:
 *  1. every flag is OFF;
 *  2. no production module imports a scaffold module (import-graph wall) — if nothing
 *     imports them, nothing visible can depend on them;
 *  3. the exact user-facing strings fixed by the 2026-11-04 live review are present
 *     verbatim in production source (a copy guard in the repo's own style).
 *
 * A full-page text snapshot of the porkchop cost card and the compare method block would
 * need the FakeNode DOM harness that lives inline in tests/v2-dla-render.test.mjs; lifting
 * it into a shared helper is a refactor of an existing test and is left to Slice 21.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const v2Root = path.join(repoRoot, 'src', 'v2');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-flags-off-guard');

const SCAFFOLD_PREFIXES = ['flags', 'lowthrust/', 'livedata/'];
const SCAFFOLD_OWN_DIRS = ['lowthrust', 'livedata', '__tests__'];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|mjs|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('every feature flag defaults to OFF', async () => {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false', '--outDir', tempOutDir, '--rootDir', v2Root,
      '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext', '--isolatedModules', 'true',
      path.join(v2Root, 'flags.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  const flags = await import(pathToFileURL(path.join(tempOutDir, 'flags.js')).href);
  for (const [name, enabled] of Object.entries(flags.FEATURE_FLAGS)) {
    assert.equal(enabled, false, `${name} must default to false`);
  }
});

function resolveSpecifier(file, spec) {
  // Mirror the resolution rules tests/v2-architecture.test.mjs uses: relative paths, the tsconfig/vite
  // '@/' alias (-> src/), and repo-rooted 'src/'. Anything else is a bare package name, returned as is.
  let absolute = null;
  if (spec.startsWith('.')) absolute = path.resolve(path.dirname(file), spec);
  else if (spec.startsWith('@/')) absolute = path.resolve(repoRoot, 'src', spec.slice(2));
  else if (spec.startsWith('src/')) absolute = path.resolve(repoRoot, spec);
  if (absolute === null) return spec;
  return path.relative(v2Root, absolute).split(path.sep).join('/');
}

test('no production module under src/v2 imports a scaffold module', () => {
  const offenders = [];
  for (const file of walk(v2Root)) {
    const rel = path.relative(v2Root, file).split(path.sep).join('/');
    const top = rel.split('/')[0];
    if (SCAFFOLD_OWN_DIRS.includes(top) || rel === 'flags.ts') continue;
    if (/\.test\.mjs$/.test(rel)) continue;
    const source = fs.readFileSync(file, 'utf8');
    // Three import forms: `... from 'x'` (static import / re-export), `import('x')` (dynamic),
    // and the bare side-effect form `import 'x'` that has no `from` clause.
    const importPattern = /from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|\bimport\s+['"]([^'"]+)['"]/g;
    for (const match of source.matchAll(importPattern)) {
      const spec = (match[1] ?? match[2] ?? match[3] ?? '').replace(/\.js$/, '');
      const resolved = resolveSpecifier(file, spec);
      if (SCAFFOLD_PREFIXES.some((prefix) => resolved === prefix || resolved.startsWith(prefix))) {
        offenders.push(`${rel} -> ${spec}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `scaffold modules must stay unwired: ${offenders.join(', ')}`);
});

test('the 2026-11-04 live-review wording is present verbatim in production source', () => {
  const porkchop = fs.readFileSync(path.join(v2Root, 'app', 'porkchop', 'main.ts'), 'utf8');
  const compare = fs.readFileSync(path.join(v2Root, 'app', 'compare', 'main.ts'), 'utf8');
  const provenance = fs.readFileSync(path.join(v2Root, 'data', 'validation-provenance.json'), 'utf8');
  const expected = [
    [porkchop, 'the launch-site payload penalty is NOT modelled'],
    [porkchop, 'Delivered mass excludes the launch-site payload penalty for this DLA band; Aster does not model that penalty yet.'],
    [porkchop, '\\u00B7 launch geometry'],
    [porkchop, 'C3 used for payload lookup:'],
    [provenance, 'may overestimate actual capability by up to 3.11% (OBSERVED max).'],
    [compare, 'a constant read from the screening cache (the grids themselves are recomputed live, see badge below).'],
  ];
  for (const [source, needle] of expected) {
    assert.ok(source.includes(needle), `missing: ${needle}`);
  }
  assert.ok(!porkchop.includes("'0 m/s (modelled; launch-geometry, AMBER)'"), 'old contradictory AMBER string returned');
  assert.ok(!porkchop.includes('Payload at C3 = ${'), 'old misleading payload label returned');
  assert.ok(!provenance.includes('by up to ~3%'), 'old ~3% caveat returned');
});
