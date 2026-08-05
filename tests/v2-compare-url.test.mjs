// compare-url codec tests (S-S17-A3PREP-2026-08-05-A). Pure codec: parse /
// serialize ?bodies= per DEC-17-6 (dedupe, cap 5, reject junk).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-compare-url');

let mod = null;
async function loadModule() {
  if (mod === null) {
    fs.rmSync(tempOutDir, { recursive: true, force: true });
    fs.mkdirSync(tempOutDir, { recursive: true });
    const result = runTsc([
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'compare-url.ts'),
    ]);
    assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
    mod = await import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'compare-url.js')).href);
  }
  return mod;
}

test('parse: basic list, with and without leading ? and other params', async () => {
  const { parseCompareBodies } = await loadModule();
  assert.deepEqual(parseCompareBodies('bodies=433,99942'), ['433', '99942']);
  assert.deepEqual(parseCompareBodies('?bodies=433,99942'), ['433', '99942']);
  assert.deepEqual(
    parseCompareBodies('/v2/compare/?tab=x&bodies=433,163693&y=1'),
    ['433', '163693'],
  );
});

test('parse: missing or empty parameter yields []', async () => {
  const { parseCompareBodies } = await loadModule();
  assert.deepEqual(parseCompareBodies(''), []);
  assert.deepEqual(parseCompareBodies('?other=1'), []);
  assert.deepEqual(parseCompareBodies('?bodies='), []);
  assert.deepEqual(parseCompareBodies('?bodies=,,,'), []);
});

test('parse: dedupes, first occurrence wins', async () => {
  const { parseCompareBodies } = await loadModule();
  assert.deepEqual(parseCompareBodies('bodies=433,99942,433,433'), ['433', '99942']);
});

test('parse: caps at 5', async () => {
  const { parseCompareBodies } = await loadModule();
  assert.deepEqual(
    parseCompareBodies('bodies=1,2,3,4,5,6,7'),
    ['1', '2', '3', '4', '5'],
  );
});

test('parse: junk is rejected, valid neighbors survive', async () => {
  const { parseCompareBodies } = await loadModule();
  assert.deepEqual(
    parseCompareBodies(
      `bodies=433,43%3C3,..%2F..,${'a'.repeat(40)},%20%20,163693`,
    ),
    ['433', '163693'],
  );
  assert.deepEqual(parseCompareBodies('bodies=<script>'), []);
});

test('parse: URL-encoded internal spaces decode and survive', async () => {
  const { parseCompareBodies } = await loadModule();
  assert.deepEqual(parseCompareBodies('bodies=2010%20AB,433'), ['2010 AB', '433']);
});

test('serialize: joins, dedupes, caps, drops junk; empty yields empty string', async () => {
  const { serializeCompareBodies } = await loadModule();
  assert.equal(serializeCompareBodies(['433', '99942']), 'bodies=433,99942');
  assert.equal(serializeCompareBodies([]), '');
  assert.equal(serializeCompareBodies(['<script>', '']), '');
  assert.equal(
    serializeCompareBodies(['1', '2', '3', '4', '5', '6']),
    'bodies=1,2,3,4,5',
  );
  assert.equal(serializeCompareBodies(['433', '433']), 'bodies=433');
  assert.equal(serializeCompareBodies(['2010 AB']), 'bodies=2010%20AB');
});

test('round-trip: parse(serialize(x)) is the sanitized x', async () => {
  const { parseCompareBodies, serializeCompareBodies } = await loadModule();
  const inputs = [
    ['433', '99942', '163693'],
    ['2010 AB', 'a_b-c'],
    ['433', 'junk<>', '433', '1', '2', '3', '4'],
  ];
  for (const ids of inputs) {
    const serialized = serializeCompareBodies(ids);
    const reparsed = parseCompareBodies(serialized === '' ? '' : `?${serialized}`);
    const sanitized = parseCompareBodies(
      `bodies=${ids.map(encodeURIComponent).join(',')}`,
    );
    assert.deepEqual(reparsed, sanitized);
  }
});
