import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice9-live-runtime-integration');
const helperPath = path.join(
  repoRoot,
  'src',
  'v2',
  'app',
  'solar-system',
  'slice9-runtime-asteroids.ts',
);
const runtimePath = path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts');

function compileHelperModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const result = runTsc(
[
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      helperPath,
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let helperModulePromise;

async function loadHelperModule() {
  if (!helperModulePromise) {
    compileHelperModule();
    helperModulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'slice9-runtime-asteroids.js')).href
    );
  }
  return helperModulePromise;
}

test('slice9 runtime normalization preserves finite render-critical asteroid fields', async () => {
  const {
    normalizeSlice9BodyForRuntime,
    resolveSlice9RuntimeRadiusM,
    resolveSlice9RuntimeAbsoluteMagnitudeH,
    isSlice9RuntimeEllipticBody,
  } = await loadHelperModule();

  assert.equal(resolveSlice9RuntimeRadiusM({ estimatedRadiusM: 123, H: null }), 123);
  assert.ok(resolveSlice9RuntimeRadiusM({ estimatedRadiusM: null, H: 22 }) > 0);
  assert.equal(resolveSlice9RuntimeRadiusM({ estimatedRadiusM: null, H: null }), 250);

  assert.equal(resolveSlice9RuntimeAbsoluteMagnitudeH({ estimatedRadiusM: null, H: 19.5 }), 19.5);
  assert.ok(Number.isFinite(resolveSlice9RuntimeAbsoluteMagnitudeH({ estimatedRadiusM: 500, H: null })));
  assert.equal(resolveSlice9RuntimeAbsoluteMagnitudeH({ estimatedRadiusM: null, H: null }), 99);
  assert.equal(
    isSlice9RuntimeEllipticBody({
      elements: { aM: 1, e: 0.2, iRad: 0, omRad: 0, wRad: 0, maRad: 0, epochTdbSeconds: 0 },
    }),
    true,
  );
  assert.equal(
    isSlice9RuntimeEllipticBody({
      elements: { aM: 0, e: 1.1, iRad: 0, omRad: 0, wRad: 0, maRad: 0, epochTdbSeconds: 0 },
    }),
    false,
  );

  const normalized = normalizeSlice9BodyForRuntime({
    bodyId: 'asteroid-2026 GG',
    bodyClass: 'asteroid',
    designation: '2026 GG',
    spkId: 123,
    name: null,
    class: 'APO',
    orbitClass: 'APO',
    isCuratedNea: false,
    neo: true,
    pha: false,
    H: null,
    G: null,
    estimatedRadiusM: null,
    elementsFrame: 'FRAME_HELIO_J2000_ECLIPTIC',
    eccentricityBand: 'C',
    conditionCode: 8,
    dataArcDays: 13,
    nObsUsed: 10,
    sigmaA: null,
    sigmaE: null,
    inv014Tier: 'visualization-tier',
    qualityRank: 0.1,
    anchorSource: 'sbdb',
    reanchorEpochTdbJd: null,
    anchorState: {
      frame: 'FRAME_HELIO_J2000_ICRF',
      tdbSeconds: 1,
      positionM: { x: 1, y: 2, z: 3 },
      velocityMps: { x: 4, y: 5, z: 6 },
    },
    elements: {
      aM: 1,
      e: 0.2,
      iRad: 0.1,
      omRad: 0.2,
      wRad: 0.3,
      maRad: 0.4,
      epochTdbSeconds: 1,
    },
  });

  assert.equal(normalized.designation, '2026 GG');
  assert.ok(Number.isFinite(normalized.H));
  assert.ok(Number.isFinite(normalized.estimatedRadiusM) && normalized.estimatedRadiusM > 0);
  assert.equal(typeof normalized.hasOrbitLine, 'boolean');
});

test('solar-system runtime is wired to the Slice 9 live catalog and Phase B canonical pipeline', () => {
  const source = fs.readFileSync(runtimePath, 'utf8');

  assert.match(source, /loadSlice9NeaCatalogFixture/);
  assert.doesNotMatch(source, /loadSlice8AsteroidCatalogFixture/);
  assert.match(source, /new AsteroidRenderer\(asteroidBodies, \{\s*cellRenderer:\s*\{\s*partitionStrategy: 'slice9-hybrid'/s);
  assert.match(source, /densityTrigger: SLICE9_HYBRID_DENSITY_TRIGGER/);
  assert.match(source, /new Worker\(new URL\('\.\/asteroid-propagation-worker\.ts', import\.meta\.url\), \{\s*type: 'module'/s);
  assert.match(source, /canonicalPositionsM: asteroidCanonicalPositionsM/);
  assert.match(source, /partitionRevision: asteroidPropagationRevision/);
});
