import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-render-star-renderer');
const starCatalogPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'star-catalog-tycho2-mag75.bin');

let modulePromise;

function compileModules() {
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
      path.join(repoRoot, 'src', 'v2', 'boundary', 'star-catalog-tycho2.ts'),
      path.join(repoRoot, 'src', 'v2', 'render', 'star-renderer.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

async function loadModules() {
  if (!modulePromise) {
    compileModules();
    modulePromise = Promise.all([
      import(pathToFileURL(path.join(tempOutDir, 'boundary', 'star-catalog-tycho2.js')).href),
      import(pathToFileURL(path.join(tempOutDir, 'render', 'star-renderer.js')).href),
      import('three'),
    ]).then(([boundary, renderer, THREE]) => ({ boundary, renderer, THREE }));
  }

  return modulePromise;
}

function readCatalogBuffer() {
  const file = fs.readFileSync(starCatalogPath);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
}

test('constructor builds THREE.Points geometry with expected star attributes', async () => {
  const { boundary, renderer, THREE } = await loadModules();
  const catalog = boundary.parseStarCatalog(readCatalogBuffer());
  const starRenderer = new renderer.StarRenderer(catalog, 2);

  try {
    const mesh = starRenderer.getMesh();
    assert.ok(mesh instanceof THREE.Points);
    assert.equal(mesh.frustumCulled, false);
    assert.equal(mesh.geometry.getAttribute('position').count, catalog.count);
    assert.equal(mesh.geometry.getAttribute('magnitude').count, catalog.count);
    assert.equal(mesh.geometry.getAttribute('color').count, catalog.count);
    assert.ok(starRenderer.material instanceof THREE.ShaderMaterial);
    assert.equal(starRenderer.material.uniforms.uPixelRatio.value, 2);
    assert.ok(starRenderer.material.vertexShader.includes('mat3(viewMatrix)'));
    assert.ok(starRenderer.material.fragmentShader.includes('gl_PointCoord'));
    assert.match(
      starRenderer.material.vertexShader,
      /gl_PointSize = pointSizePx \* uPixelRatio;/,
    );
    assert.doesNotMatch(
      starRenderer.material.vertexShader,
      /gl_PointSize\s*=.*(clipPosition|rotatedDirection|uDistanceScale|position|viewMatrix)/,
    );
  } finally {
    starRenderer.dispose();
  }
});

test('INV-014 spot-check: Polaris direction in geometry matches the parsed catalog', async () => {
  const { boundary, renderer } = await loadModules();
  const catalog = boundary.parseStarCatalog(readCatalogBuffer());
  const starRenderer = new renderer.StarRenderer(catalog);

  const expectedPolaris = [
    0.010119381181391063,
    0.007899137626296716,
    0.9999175541545137,
  ];

  try {
    const positionAttribute = starRenderer.geometry.getAttribute('position');
    let bestIndex = -1;
    let bestDot = -Infinity;

    for (let i = 0; i < positionAttribute.count; i += 1) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      const dot = x * expectedPolaris[0] + y * expectedPolaris[1] + z * expectedPolaris[2];
      if (dot > bestDot) {
        bestDot = dot;
        bestIndex = i;
      }
    }

    assert.ok(bestIndex >= 0);
    assert.ok(bestDot > 0.9999, `Polaris alignment too weak: ${bestDot}`);
  } finally {
    starRenderer.dispose();
  }
});
