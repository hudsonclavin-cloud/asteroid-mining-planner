import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Spec for the DEC-5 "both" compute path (AMD-1 mechanism: one M per message, two
// messages, issued sequentially). dual-m-compute.ts imports nothing at runtime —
// every import is `import type` — so it compiles standalone and is exercised here
// against a fake client, with no worker and no solver involved.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-porkchop-dual-m');

let modulePromise = null;

function compileModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  const result = spawnSync(
    process.execPath,
    [
      tscBin,
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'porkchop', 'dual-m-compute.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  if (result.status !== 0) {
    throw new Error(`tsc failed:\n${result.stdout}\n${result.stderr}`);
  }

  return import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'dual-m-compute.js')).href);
}

function loadModule() {
  if (modulePromise === null) {
    modulePromise = compileModule();
  }
  return modulePromise;
}

const REQUEST = {
  bodyId: 'asteroid-433',
  bodyElements: {
    aM: 2.1815058768962610e11,
    e: 0.22288929294611265,
    iRad: 0.18899384901473204,
    omRad: 5.310478612736303,
    wRad: 3.1226809007487173,
    maRad: 0.710056713354084,
    epochTdbSeconds: 1.0e9,
  },
  gridParams: {
    depStartJD: 2461041.5,
    depEndJD: 2466154.5,
    tofMinDays: 182.5,
    tofMaxDays: 1826.25,
    nDep: 200,
    nTof: 100,
  },
};

/** Records every computeGrid call and whether a prior call was still unresolved. */
function makeRecordingClient({ failOn = null } = {}) {
  const calls = [];
  let inFlight = false;
  let overlapped = false;

  return {
    calls,
    get overlapped() {
      return overlapped;
    },
    async computeGrid(args) {
      if (inFlight) {
        overlapped = true;
      }
      inFlight = true;
      calls.push(args);
      // Yield to the microtask queue so a concurrent caller would overlap here.
      await Promise.resolve();
      inFlight = false;
      if (failOn !== null && args.M === failOn) {
        throw new Error(`compute failed for M=${args.M}`);
      }
      return { type: 'grid-result', bodyId: args.bodyId, M: args.M, cells: [], compute_ms: 1 };
    },
    dispose() {},
  };
}

test('computeDualFamilyGrids issues exactly two messages, M=0 then M=1 (AMD-1)', async () => {
  const { computeDualFamilyGrids, M_ZERO_REV, M_ONE_REV } = await loadModule();
  const client = makeRecordingClient();

  await computeDualFamilyGrids(client, REQUEST);

  assert.equal(client.calls.length, 2, 'expected exactly two compute messages');
  assert.equal(client.calls[0].M, M_ZERO_REV, 'first message must be M=0');
  assert.equal(client.calls[1].M, M_ONE_REV, 'second message must be M=1');
  assert.equal(M_ZERO_REV, 0);
  assert.equal(M_ONE_REV, 1);
});

test('computeDualFamilyGrids awaits sequentially — never two computes in flight', async () => {
  const { computeDualFamilyGrids } = await loadModule();
  const client = makeRecordingClient();

  await computeDualFamilyGrids(client, REQUEST);

  assert.equal(
    client.overlapped,
    false,
    'second compute must not start before the first resolves (porkchop-client.ts single-flight guard)',
  );
});

test('computeDualFamilyGrids carries the request through unchanged, one M per message', async () => {
  const { computeDualFamilyGrids } = await loadModule();
  const client = makeRecordingClient();

  await computeDualFamilyGrids(client, REQUEST);

  for (const call of client.calls) {
    assert.equal(call.bodyId, REQUEST.bodyId);
    assert.deepEqual(call.bodyElements, REQUEST.bodyElements);
    assert.deepEqual(call.gridParams, REQUEST.gridParams);
    assert.equal(typeof call.M, 'number', 'M is a single value per message (AMD-1)');
    assert.equal(Object.prototype.hasOwnProperty.call(call, 'M'), true);
  }
});

test('computeDualFamilyGrids returns both grids keyed by family', async () => {
  const { computeDualFamilyGrids } = await loadModule();
  const client = makeRecordingClient();

  const grids = await computeDualFamilyGrids(client, REQUEST);

  assert.equal(grids.m0.M, 0, 'm0 must hold the M=0 result');
  assert.equal(grids.m1.M, 1, 'm1 must hold the M=1 result');
  assert.equal(grids.m0.bodyId, REQUEST.bodyId);
  assert.equal(grids.m1.bodyId, REQUEST.bodyId);
});

test('computeDualFamilyGrids propagates a failure from either family unchanged', async () => {
  const { computeDualFamilyGrids } = await loadModule();

  await assert.rejects(
    () => computeDualFamilyGrids(makeRecordingClient({ failOn: 0 }), REQUEST),
    /compute failed for M=0/,
  );
  await assert.rejects(
    () => computeDualFamilyGrids(makeRecordingClient({ failOn: 1 }), REQUEST),
    /compute failed for M=1/,
  );
});
