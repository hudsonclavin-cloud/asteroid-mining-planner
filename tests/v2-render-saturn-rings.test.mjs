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

let saturnRingsModulePromise;

async function loadSaturnRingsModule() {
  if (!saturnRingsModulePromise) {
    compileRenderHelper();
    saturnRingsModulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'render', 'saturn-rings.js')).href
    );
  }

  return saturnRingsModulePromise;
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

function getRequiredObject(group, name) {
  const object = group.getObjectByName(name);
  assert.ok(object, `expected object '${name}' to exist`);
  return object;
}

test('Saturn ring local plane stays on XZ with +Y normals', async () => {
  const module = await loadSaturnRingsModule();
  const {
    createSaturnRingsGroup,
    SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD,
  } = module;

  assert.equal(SATURN_RING_LOCAL_PLANE_ROTATION_X_RAD, -Math.PI / 2);

  const defaultGroup = createSaturnRingsGroup();
  const defaultMain = getRequiredObject(defaultGroup, 'saturn-rings-main');
  const defaultCassini = getRequiredObject(defaultGroup, 'saturn-rings-cassini-division');

  assert.equal(defaultGroup.userData.localPlaneNormalAxis, 'Y');
  assert.equal(defaultGroup.userData.renderOnly, true);
  assertNormalsPointAlongPositiveY(defaultMain.geometry);
  assertNormalsPointAlongPositiveY(defaultCassini.geometry);
});

test('Saturn main ring and Cassini geometry radii match spec', async () => {
  const module = await loadSaturnRingsModule();
  const {
    createSaturnRingsGroup,
    SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
    SATURN_RING_DEFAULT_INNER_RADIUS_M,
    SATURN_RING_FALLBACK_INNER_RADIUS_M,
    SATURN_RING_OUTER_RADIUS_M,
  } = module;

  const defaultGroup = createSaturnRingsGroup();
  const fallbackGroup = createSaturnRingsGroup({ omitDRing: true });

  const defaultMain = getRequiredObject(defaultGroup, 'saturn-rings-main');
  const defaultCassini = getRequiredObject(defaultGroup, 'saturn-rings-cassini-division');
  const fallbackMain = getRequiredObject(fallbackGroup, 'saturn-rings-main');

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
});

test('Saturn ring opacity sampling preserves D/C/B/A ordering', async () => {
  const module = await loadSaturnRingsModule();
  const {
    sampleSaturnRingOpacity,
    SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
    SATURN_RING_B_OUTER_RADIUS_M,
    SATURN_RING_C_OUTER_RADIUS_M,
    SATURN_RING_DEFAULT_INNER_RADIUS_M,
    SATURN_RING_FALLBACK_INNER_RADIUS_M,
    SATURN_RING_OUTER_RADIUS_M,
    SATURN_RING_REGION_OPACITY,
  } = module;

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
  assert.equal(sampleSaturnRingOpacity(SATURN_RING_OUTER_RADIUS_M + 1), 0);
});

test('Saturn Cassini opacity peaks at the division center', async () => {
  const module = await loadSaturnRingsModule();
  const {
    sampleSaturnCassiniDivisionOpacity,
    SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
    SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  } = module;
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
});

test('Saturn ring texture preserves multiple radial alpha levels', async () => {
  const module = await loadSaturnRingsModule();
  const { createSaturnRingTexture } = module;
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

test('Saturn ring substructure adds seven named sibling meshes under saturn-rings', async () => {
  const module = await loadSaturnRingsModule();
  const { createSaturnRingsGroup } = module;
  const group = createSaturnRingsGroup();

  const expectedNames = [
    'saturn-rings-huygens-gap',
    'saturn-rings-huygens-ringlet',
    'saturn-rings-laplace-gap',
    'saturn-rings-laplace-ringlet',
    'saturn-rings-encke-gap',
    'saturn-rings-keeler-gap',
    'saturn-rings-roche-division',
  ];

  for (const name of expectedNames) {
    const mesh = getRequiredObject(group, name);
    assert.equal(mesh.parent, group);
    assert.equal(mesh.userData.role, 'ring-substructure');
  }

  assert.equal(group.children.length, 9);
  assert.deepEqual(group.userData.substructureFeatureNames, [
    'Huygens Gap',
    'Huygens Ringlet',
    'Laplace Gap',
    'Laplace Ringlet',
    'Encke Gap',
    'Keeler Gap',
    'Roche Division',
  ]);
});

test('Saturn ring substructure radii match Slice 5 constants', async () => {
  const module = await loadSaturnRingsModule();
  const {
    createSaturnRingsGroup,
    SATURN_ENCKE_GAP_INNER_RADIUS_M,
    SATURN_ENCKE_GAP_OUTER_RADIUS_M,
    SATURN_HUYGENS_GAP_INNER_RADIUS_M,
    SATURN_HUYGENS_GAP_OUTER_RADIUS_M,
    SATURN_HUYGENS_RINGLET_INNER_RADIUS_M,
    SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M,
    SATURN_KEELER_GAP_INNER_RADIUS_M,
    SATURN_KEELER_GAP_OUTER_RADIUS_M,
    SATURN_LAPLACE_GAP_INNER_RADIUS_M,
    SATURN_LAPLACE_GAP_OUTER_RADIUS_M,
    SATURN_LAPLACE_RINGLET_INNER_RADIUS_M,
    SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M,
    SATURN_ROCHE_DIVISION_INNER_RADIUS_M,
    SATURN_ROCHE_DIVISION_OUTER_RADIUS_M,
  } = module;

  const group = createSaturnRingsGroup();
  const toleranceM = 10;
  const expected = [
    ['saturn-rings-huygens-gap', SATURN_HUYGENS_GAP_INNER_RADIUS_M, SATURN_HUYGENS_GAP_OUTER_RADIUS_M],
    ['saturn-rings-huygens-ringlet', SATURN_HUYGENS_RINGLET_INNER_RADIUS_M, SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M],
    ['saturn-rings-laplace-gap', SATURN_LAPLACE_GAP_INNER_RADIUS_M, SATURN_LAPLACE_GAP_OUTER_RADIUS_M],
    ['saturn-rings-laplace-ringlet', SATURN_LAPLACE_RINGLET_INNER_RADIUS_M, SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M],
    ['saturn-rings-encke-gap', SATURN_ENCKE_GAP_INNER_RADIUS_M, SATURN_ENCKE_GAP_OUTER_RADIUS_M],
    ['saturn-rings-keeler-gap', SATURN_KEELER_GAP_INNER_RADIUS_M, SATURN_KEELER_GAP_OUTER_RADIUS_M],
    ['saturn-rings-roche-division', SATURN_ROCHE_DIVISION_INNER_RADIUS_M, SATURN_ROCHE_DIVISION_OUTER_RADIUS_M],
  ];

  for (const [name, innerRadiusM, outerRadiusM] of expected) {
    const mesh = getRequiredObject(group, name);
    const extents = radialExtents(mesh.geometry);
    assert.ok(Math.abs(extents.min - innerRadiusM) <= toleranceM, `${name} inner radius`);
    assert.ok(Math.abs(extents.max - outerRadiusM) <= toleranceM, `${name} outer radius`);
    assert.equal(mesh.userData.innerRadiusM, innerRadiusM);
    assert.equal(mesh.userData.outerRadiusM, outerRadiusM);
  }
});

test('Saturn ring substructure renderOrder keeps gaps below ringlets and preserves Slice 4 meshes', async () => {
  const module = await loadSaturnRingsModule();
  const {
    createSaturnRingsGroup,
    SATURN_RING_CASSINI_RENDER_ORDER,
    SATURN_RING_GAP_RENDER_ORDER,
    SATURN_RING_MAIN_RENDER_ORDER,
    SATURN_RING_RINGLET_RENDER_ORDER,
  } = module;

  const group = createSaturnRingsGroup();
  const main = getRequiredObject(group, 'saturn-rings-main');
  const cassini = getRequiredObject(group, 'saturn-rings-cassini-division');
  const huygensGap = getRequiredObject(group, 'saturn-rings-huygens-gap');
  const huygensRinglet = getRequiredObject(group, 'saturn-rings-huygens-ringlet');
  const laplaceGap = getRequiredObject(group, 'saturn-rings-laplace-gap');
  const laplaceRinglet = getRequiredObject(group, 'saturn-rings-laplace-ringlet');
  const enckeGap = getRequiredObject(group, 'saturn-rings-encke-gap');
  const keelerGap = getRequiredObject(group, 'saturn-rings-keeler-gap');
  const rocheDivision = getRequiredObject(group, 'saturn-rings-roche-division');

  assert.equal(main.renderOrder, SATURN_RING_MAIN_RENDER_ORDER);
  assert.equal(cassini.renderOrder, SATURN_RING_CASSINI_RENDER_ORDER);
  assert.equal(huygensGap.renderOrder, SATURN_RING_GAP_RENDER_ORDER);
  assert.equal(laplaceGap.renderOrder, SATURN_RING_GAP_RENDER_ORDER);
  assert.equal(enckeGap.renderOrder, SATURN_RING_GAP_RENDER_ORDER);
  assert.equal(keelerGap.renderOrder, SATURN_RING_GAP_RENDER_ORDER);
  assert.equal(rocheDivision.renderOrder, SATURN_RING_GAP_RENDER_ORDER);
  assert.equal(huygensRinglet.renderOrder, SATURN_RING_RINGLET_RENDER_ORDER);
  assert.equal(laplaceRinglet.renderOrder, SATURN_RING_RINGLET_RENDER_ORDER);
  assert.ok(huygensGap.renderOrder < huygensRinglet.renderOrder);
  assert.ok(laplaceGap.renderOrder < laplaceRinglet.renderOrder);
});

test('Saturn ring substructure preserves child ordering in inner-radius sequence', async () => {
  const module = await loadSaturnRingsModule();
  const { createSaturnRingsGroup } = module;
  const group = createSaturnRingsGroup();
  const childNames = group.children.map((child) => child.name);

  assert.deepEqual(childNames, [
    'saturn-rings-main',
    'saturn-rings-cassini-division',
    'saturn-rings-huygens-gap',
    'saturn-rings-huygens-ringlet',
    'saturn-rings-laplace-gap',
    'saturn-rings-laplace-ringlet',
    'saturn-rings-encke-gap',
    'saturn-rings-keeler-gap',
    'saturn-rings-roche-division',
  ]);
});

test('Saturn Roche Division uses a fading texture rather than a flat-opacity band', async () => {
  const module = await loadSaturnRingsModule();
  const {
    createSaturnRingsGroup,
    createSaturnRocheDivisionTexture,
    SATURN_ROCHE_DIVISION_INNER_RADIUS_M,
    SATURN_ROCHE_DIVISION_OUTER_RADIUS_M,
    SATURN_RING_SUBSTRUCTURE_OPACITY,
  } = module;

  const group = createSaturnRingsGroup();
  const rocheDivision = getRequiredObject(group, 'saturn-rings-roche-division');
  assert.ok(rocheDivision.material.map, 'Roche Division should use a gradient texture');
  assert.equal(rocheDivision.userData.featureType, 'division');
  assert.equal(rocheDivision.userData.feature, 'Roche Division');
  assert.equal(rocheDivision.userData.innerRadiusM, SATURN_ROCHE_DIVISION_INNER_RADIUS_M);
  assert.equal(rocheDivision.userData.outerRadiusM, SATURN_ROCHE_DIVISION_OUTER_RADIUS_M);

  const texture = createSaturnRocheDivisionTexture();
  const data = texture.image.data;
  let minAlpha = 255;
  let maxAlpha = 0;
  for (let i = 3; i < data.length; i += 4) {
    const alpha = data[i];
    if (alpha === 0) continue;
    minAlpha = Math.min(minAlpha, alpha);
    maxAlpha = Math.max(maxAlpha, alpha);
  }

  assert.ok(maxAlpha > minAlpha, 'Roche Division texture should fade outward');
  assert.ok(maxAlpha >= Math.round(SATURN_RING_SUBSTRUCTURE_OPACITY.rocheInner * 255) - 2);
  assert.ok(minAlpha <= Math.round(SATURN_RING_SUBSTRUCTURE_OPACITY.rocheOuter * 255) + 2);
});
