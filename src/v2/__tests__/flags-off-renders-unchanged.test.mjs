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

// The scaffold: one module file and two directories, all relative to src/v2.
const SCAFFOLD_MODULES = ['flags'];
const SCAFFOLD_DIRS = ['lowthrust', 'livedata'];
// Every extension Vite resolves by default; tests/v2-architecture.test.mjs walks the same set.
const SOURCE_FILE = /\.(?:ts|tsx|mts|cts|js|mjs|cjs|jsx)$/;
const TEST_FILE = /\.test\.(?:mjs|ts|js)$/;

function walk(dir, out = [], filter = SOURCE_FILE) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out, filter);
    else if (filter.test(entry.name)) out.push(full);
  }
  return out;
}

const stripExtension = (p) => p.replace(/\.(?:js|ts|mjs|mts|cjs|cts|tsx|jsx)$/, '');

/** True when a src/v2-relative, extension-less path is the scaffold module or lies inside a scaffold dir. */
function isScaffoldPath(rel) {
  if (SCAFFOLD_MODULES.includes(rel)) return true;
  return SCAFFOLD_DIRS.some((dir) => rel === dir || rel.startsWith(`${dir}/`));
}

/** A glob is an offender unless its literal root is provably outside every scaffold path. */
function globReachesScaffold(rel) {
  const root = rel.split('*')[0];
  return [...SCAFFOLD_MODULES, ...SCAFFOLD_DIRS].some((p) => p.startsWith(root) || root.startsWith(`${p}/`) || root === p);
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
  // Every way Vite can pull a module in from source text. Specifiers in template literals cannot be
  // resolved statically, so they are offenders outright (none exist under src/v2 today).
  const forms = [
    ['from', /\bfrom\s+['"]([^'"]+)['"]/g],                                       // import … from / export … from
    ['import', /\bimport\s+['"]([^'"]+)['"]/g],                                     // side-effect import 'x'
    ['import()', /\bimport\s*\(\s*(?:\/\*[\s\S]*?\*\/\s*)?['"]([^'"]+)['"]/g],   // dynamic import, optional leading comment
    ['new URL', /\bnew\s+URL\s*\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url/g],  // new URL('x', import.meta.url), workers and assets
  ];
  const globForm = /\bimport\.meta\.glob\s*\(\s*(?:\[\s*)?['"]([^'"]+)['"]/g;
  const templateForm = /\bimport\s*\(\s*`|\bimport\.meta\.glob\s*\(\s*(?:\[\s*)?`/g;
  for (const file of walk(v2Root)) {
    const rel = path.relative(v2Root, file).split(path.sep).join('/');
    const top = rel.split('/')[0];
    if (SCAFFOLD_DIRS.includes(top) || stripExtension(rel) === 'flags') continue; // the scaffold itself
    if (TEST_FILE.test(rel)) continue;                                              // test files, wherever they live
    const source = fs.readFileSync(file, 'utf8');
    for (const [label, pattern] of forms) {
      for (const match of source.matchAll(pattern)) {
        const spec = match[1];
        const resolved = stripExtension(resolveSpecifier(file, spec));
        if (isScaffoldPath(resolved)) offenders.push(`${rel} -> ${label} ${spec}`);
      }
    }
    for (const match of source.matchAll(globForm)) {
      const resolved = resolveSpecifier(file, match[1]);
      if (globReachesScaffold(resolved)) offenders.push(`${rel} -> import.meta.glob ${match[1]}`);
    }
    if (templateForm.test(source)) offenders.push(`${rel} -> template-literal import specifier (unresolvable)`);
  }
  assert.deepEqual(offenders, [], `scaffold modules must stay unwired: ${offenders.join(', ')}`);
});

test('no HTML entry or vite input references a scaffold module', () => {
  // The wall above is rooted at src/v2; a page could still load a scaffold through an HTML
  // <script src> or a vite rollupOptions.input entry, so scan those too.
  const htmlFiles = [path.join(repoRoot, 'index.html'), ...walk(path.join(repoRoot, 'v2'), [], /\.html$/)];
  const files = [...htmlFiles, path.join(repoRoot, 'vite.config.ts')].filter((f) => fs.existsSync(f));
  assert.ok(files.length >= 3, `expected the HTML entries and vite.config.ts, found ${files.length}`);
  const reference = /(?:src\/v2|@\/v2)\/(?:flags\b|lowthrust\b|livedata\b)/;
  const offenders = files.filter((f) => reference.test(fs.readFileSync(f, 'utf8'))).map((f) => path.relative(repoRoot, f));
  assert.deepEqual(offenders, [], `entries must not reference scaffold modules: ${offenders.join(', ')}`);
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
    [compare, 'a constant read from the screening cache (the grids themselves are recomputed live in this browser; see the segmentation-mode line that follows).'],
  ];
  for (const [source, needle] of expected) {
    assert.ok(source.includes(needle), `missing: ${needle}`);
  }
  assert.ok(!porkchop.includes("'0 m/s (modelled; launch-geometry, AMBER)'"), 'old contradictory AMBER string returned');
  assert.ok(!porkchop.includes('Payload at C3 = ${'), 'old misleading payload label returned');
  assert.ok(!provenance.includes('by up to ~3%'), 'old ~3% caveat returned');
});
