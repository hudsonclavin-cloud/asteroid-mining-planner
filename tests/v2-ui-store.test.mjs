import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-ui-store');

function compileStoreModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
  const result = spawnSync(
    tscBin,
    [
      '--pretty',
      'false',
      '--outDir',
      tempOutDir,
      '--rootDir',
      path.join(repoRoot, 'src', 'v2'),
      '--module',
      'NodeNext',
      '--target',
      'ES2020',
      '--moduleResolution',
      'NodeNext',
      '--isolatedModules',
      'true',
      path.join(repoRoot, 'src', 'v2', 'app', 'ui-store', 'store.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

async function loadFreshStoreModule() {
  compileStoreModule();
  const href = pathToFileURL(path.join(tempOutDir, 'app', 'ui-store', 'store.js')).href;
  return import(`${href}?cacheBust=${Date.now()}-${Math.random()}`);
}

test('ui store initial state matches the documented Phase C.1 defaults', async () => {
  const store = await loadFreshStoreModule();

  assert.equal(store.readCatalog(), null);
  assert.equal(store.readFilterClass(), null);
  assert.equal(store.readSearchQuery(), '');
  assert.equal(store.readSortKey(), 'designation-asc');
  assert.equal(store.readSelectedBody(), null);
  assert.equal(store.readFocusRequestId(), 0);
});

test('ui store action functions update the state they claim to own', async () => {
  const store = await loadFreshStoreModule();

  store.setFilterClass('APO');
  store.setSearch('Bennu');
  store.setSort('absolute-magnitude-asc');
  store.selectBody('asteroid-101955');

  assert.equal(store.readFilterClass(), 'APO');
  assert.equal(store.readSearchQuery(), 'Bennu');
  assert.equal(store.readSortKey(), 'absolute-magnitude-asc');
  assert.equal(store.readSelectedBody(), 'asteroid-101955');
});

test('ui store readonly signals reflect dispatched state updates', async () => {
  const store = await loadFreshStoreModule();

  store.setFilterClass('AMO');
  store.setSearch('Apophis');
  store.selectBody('99942');

  assert.equal(store.uiStoreSignals.filterClass.value, 'AMO');
  assert.equal(store.uiStoreSignals.searchQuery.value, 'Apophis');
  assert.equal(store.uiStoreSignals.selectedBody.value, '99942');
});

test('focusRequestId increments monotonically on requestFocus()', async () => {
  const store = await loadFreshStoreModule();

  assert.equal(store.requestFocus(), 1);
  assert.equal(store.requestFocus(), 2);
  assert.equal(store.requestFocus(), 3);
  assert.equal(store.readFocusRequestId(), 3);
});

test('focus-request subscription only fires when requestFocus increments', async () => {
  const store = await loadFreshStoreModule();
  const observed = [];
  const unsubscribe = store.subscribeToFocusRequests((requestId) => {
    observed.push(requestId);
  });

  store.setSearch('Eros');
  store.selectBody('433');
  store.requestFocus();
  store.requestFocus();
  unsubscribe();
  store.requestFocus();

  assert.deepEqual(observed, [1, 2]);
});
