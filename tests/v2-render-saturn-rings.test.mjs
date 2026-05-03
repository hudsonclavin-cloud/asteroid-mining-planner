import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-saturn-rings');

function compileRenderHelper() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
  const result = spawnSync(
    tscBin,
    [
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'render', 'saturn-rings.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(
    result.status,
    0,
    `tsc compilation failed\n${result.stderr || result.stdout}`,
  );
}

function radialExtents(geometry) {
  const positions = geometry.attributes.position.array;
  let min = Infinity;
  let max = 0;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const radius = Math.hypot(x, z);

    assert.ok(Math.abs(y) <= 1e-6, `vertex y=${y} should stay on the local XZ plane`);
    min = Math.min(min, radius);
    max = Math.max(max, radius);
  }

  return { min, max };
}

function assertNormalsPointAlongPositiveY(geometry) {
  const normals = geometry.attributes.normal.array;
  for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i];
    const ny = normals[i + 1];
    const nz = normals[i + 2];

    assert.ok(Math.abs(nx) <= 1e-6, `normal x=${nx} should be ~0`);
    assert.ok(Math.abs(nz) <= 1e-6, `normal z=${nz} should be ~0`);
    assert.ok(Math.abs(ny - 1) <= 1e-6, `normal y=${ny} should be ~1`);
  }
}

test('Saturn rings geometry radii, Cassini placement, alpha contract, and local orientation all match spec', async () => {
  compileRenderHelper();

  const module = await import(
    pathToFileURL(path.join(tempOutDir, 'render', 'saturn-rings.js')).href
  );

  const {
    createSaturnRingsGroup,
    createSaturnRingTexture,
    sampleSaturnCassiniDivisionOpacity,
    sampleSaturnRingOpacity,
    SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
    SATURN_RING_B_OUTER_RADIUS_M,
    SATURN_RING_C_OUTER_RADIUS_M,
    SATURN_RING_DEFAULT_INNER_RADIUS_M,
    SATURN_RING_FALLBACK_INNER_RADIUS_M,
    SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD,
    SATURN_RING_OUTER_RADIUS_M,
    SATURN_RING_REGION_OPACITY,
  } = module;

  assert.equal(SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD, -Math.PI / 2);

  const defaultGroup = createSaturnRingsGroup();
  const fallbackGroup = createSaturnRingsGroup({ omitDRing: true });

  const defaultMain = defaultGroup.getObjectByName('saturn-rings-main');
  const defaultCassini = defaultGroup.getObjectByName('saturn-rings-cassini-division');
  const fallbackMain = fallbackGroup.getObjectByName('saturn-rings-main');

  assert.ok(defaultMain);
  assert.ok(defaultCassini);
  assert.ok(fallbackMain);
  assert.equal(defaultGroup.userData.localPlaneNormalAxis, 'Y');
  assert.equal(defaultGroup.userData.renderOnly, true);

  const defaultMainExtents = radialExtents(defaultMain.geometry);
  const fallbackMainExtents = radialExtents(fallbackMain.geometry);
  const cassiniExtents = radialExtents(defaultCassini.geometry);
  const toleranceM = 10;

  assert.ok(Math.abs(defaultMainExtents.min - SATURN_RING_DEFAULT_INNER_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(defaultMainExtents.max - SATURN_RING_OUTER_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(fallbackMainExtents.min - SATURN_RING_FALLBACK_INNER_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(fallbackMainExtents.max - SATURN_RING_OUTER_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(cassiniExtents.min - SATURN_CASSINI_DIVISION_INNER_RADIUS_M) <= toleranceM);
  assert.ok(Math.abs(cassiniExtents.max - SATURN_CASSINI_DIVISION_OUTER_RADIUS_M) <= toleranceM);

  assertNormalsPointAlongPositiveY(defaultMain.geometry);
  assertNormalsPointAlongPositiveY(defaultCassini.geometry);

  const dSample = sampleSaturnRingOpacity(
    (SATURN_RING_DEFAULT_INNER_RADIUS_M + SATURN_RING_FALLBACK_INNER_RADIUS_M) / 2
  );
  const cSample = sampleSaturnRingOpacity(
    (SATURN_RING_FALLBACK_INNER_RADIUS_M + SATURN_RING_C_OUTER_RADIUS_M) / 2
  );
  const bSample = sampleSaturnRingOpacity(
    (SATURN_RING_C_OUTER_RADIUS_M + SATURN_CASSINI_DIVISION_INNER_RADIUS_M) / 2
  );
  const aSample = sampleSaturnRingOpacity(
    (SATURN_CASSINI_DIVISION_OUTER_RADIUS_M + SATURN_RING_OUTER_RADIUS_M) / 2
  );

  assert.equal(dSample, SATURN_RING_REGION_OPACITY.d);
  assert.equal(cSample, SATURN_RING_REGION_OPACITY.c);
  assert.equal(bSample, SATURN_RING_REGION_OPACITY.b);
  assert.equal(aSample, SATURN_RING_REGION_OPACITY.a);
  assert.ok(dSample < cSample);
  assert.ok(cSample < bSample);
  assert.ok(cSample < aSample && aSample < bSample);

  const cassiniMid =
    (SATURN_CASSINI_DIVISION_INNER_RADIUS_M + SATURN_CASSINI_DIVISION_OUTER_RADIUS_M) / 2;
  const cassiniInnerEdge = SATURN_CASSINI_DIVISION_INNER_RADIUS_M + 1;
  const cassiniOuterEdge = SATURN_CASSINI_DIVISION_OUTER_RADIUS_M - 1;
  const cassiniMidOpacity = sampleSaturnCassiniDivisionOpacity(cassiniMid);
  const cassiniInnerOpacity = sampleSaturnCassiniDivisionOpacity(cassiniInnerEdge);
  const cassiniOuterOpacity = sampleSaturnCassiniDivisionOpacity(cassiniOuterEdge);

  assert.ok(cassiniMidOpacity > cassiniInnerOpacity);
  assert.ok(cassiniMidOpacity > cassiniOuterOpacity);
  assert.ok(cassiniInnerOpacity > 0);
  assert.ok(cassiniOuterOpacity > 0);

  const texture = createSaturnRingTexture();
  const data = texture.image.data;
  const nonZeroAlphaValues = new Set();
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) {
      nonZeroAlphaValues.add(data[i]);
    }
  }

  assert.ok(nonZeroAlphaValues.size >= 4, `expected >=4 distinct alpha levels, got ${nonZeroAlphaValues.size}`);
});
