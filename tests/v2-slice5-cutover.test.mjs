// B1 — Slice 5 Retroactive Cutover Validation Harness
// Validates Saturn ring substructure rendering contracts added in Slice 5,
// preserves the Slice 4 Saturn-system numeric cutover as a regression gate,
// and codifies the default Saturn-focus camera fix that shipped in commit
// 8f3c30e after manual verification surfaced an edge-on failure mode.

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice5-cutover');

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function radialExtents(geometry) {
  const positions = geometry.attributes.position.array;
  let min = Infinity;
  let max = 0;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    const radius = Math.hypot(x, z);
    min = Math.min(min, radius);
    max = Math.max(max, radius);
  }

  return { min, max };
}

function getRequiredObject(group, name) {
  const object = group.getObjectByName(name);
  assert.ok(object, `expected object '${name}' to exist`);
  return object;
}

function extractRuntimeConstant(source, name) {
  const regex = new RegExp(`const ${name} = ([^;]+);`);
  const match = source.match(regex);
  assert.ok(match, `expected runtime constant '${name}'`);
  return match[1];
}

function evalPolarExpression(expression) {
  return Function(`return (${expression});`)();
}

function evalTiltDegrees(expression) {
  const match = expression.match(/degToRad\(([^)]+)\)/);
  assert.ok(match, `expected degToRad(...) expression, got '${expression}'`);
  return Number(match[1]);
}

console.log('Compiling Saturn runtime and ring helpers for Slice 5 cutover...');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
const tscResult = spawnSync(
  tscBin,
  [
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
    path.join(repoRoot, 'src', 'v2', 'render', 'saturn-rings.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);

if (tscResult.status !== 0) {
  console.error('FAIL tsc compilation');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}
console.log('PASS tsc compilation\n');

const [runtime, saturnRings] = await Promise.all([
  import(pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'runtime.js')).href),
  import(pathToFileURL(path.join(tempOutDir, 'render', 'saturn-rings.js')).href),
]);

const ringsGroup = saturnRings.createSaturnRingsGroup();
const expectedSubstructureMeshNames = [
  'saturn-rings-huygens-gap',
  'saturn-rings-huygens-ringlet',
  'saturn-rings-laplace-gap',
  'saturn-rings-laplace-ringlet',
  'saturn-rings-encke-gap',
  'saturn-rings-keeler-gap',
  'saturn-rings-roche-division',
];

for (const name of expectedSubstructureMeshNames) {
  const mesh = getRequiredObject(ringsGroup, name);
  assert.equal(mesh.parent, ringsGroup);
  assert.equal(mesh.userData.role, 'ring-substructure');
}
assert.equal(ringsGroup.children.length, 9);
console.log('PASS Slice 5 ring substructure meshes exist under saturn-rings');

const saturnRingsSource = fs.readFileSync(
  path.join(repoRoot, 'src', 'v2', 'render', 'saturn-rings.ts'),
  'utf8',
);
const mainRingMesh = getRequiredObject(ringsGroup, 'saturn-rings-main');
const cassiniMesh = getRequiredObject(ringsGroup, 'saturn-rings-cassini-division');
assert.equal(mainRingMesh.renderOrder, 0);
assert.equal(cassiniMesh.renderOrder, 0);
assert.ok(
  !/ringMesh\.renderOrder\s*=\s*0/.test(saturnRingsSource),
  'baseline main ring must not set explicit renderOrder=0',
);
assert.ok(
  !/cassiniMesh\.renderOrder\s*=\s*0/.test(saturnRingsSource),
  'baseline Cassini mesh must not set explicit renderOrder=0',
);
for (const name of expectedSubstructureMeshNames) {
  const mesh = getRequiredObject(ringsGroup, name);
  assert.ok(mesh.renderOrder >= 1, `${name} renderOrder=${mesh.renderOrder} should be explicit overlay order`);
}
console.log('PASS renderOrder discipline preserved: baseline default, overlays explicit');

assert.equal(saturnRings.SATURN_A_RING_OUTER_RADIUS_M, 136_770_000);
const mainRingExtents = radialExtents(mainRingMesh.geometry);
assert.ok(
  Math.abs(mainRingExtents.max - saturnRings.SATURN_A_RING_OUTER_RADIUS_M) <= 10,
  `A ring outer extent ${mainRingExtents.max} m should match ${saturnRings.SATURN_A_RING_OUTER_RADIUS_M} m`,
);
console.log('PASS A ring outer radius matches exact 136,770 km PDS value');

const runtimeSource = fs.readFileSync(
  path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
  'utf8',
);
const saturnFocusPolarRad = evalPolarExpression(
  extractRuntimeConstant(runtimeSource, 'SATURN_FOCUS_ORBIT_POLAR_RAD'),
);
const saturnTiltDeg = evalTiltDegrees(extractRuntimeConstant(runtimeSource, 'SATURN_RENDER_TILT_RAD'));
const saturnTiltRad = (saturnTiltDeg * Math.PI) / 180;
const viewDirection = {
  x: -Math.sin(saturnFocusPolarRad),
  y: -Math.cos(saturnFocusPolarRad),
  z: 0,
};
const ringPlaneNormal = {
  x: 0,
  y: Math.cos(saturnTiltRad),
  z: Math.sin(saturnTiltRad),
};
const normalDotView = Math.abs(
  viewDirection.x * ringPlaneNormal.x +
    viewDirection.y * ringPlaneNormal.y +
    viewDirection.z * ringPlaneNormal.z,
);
const viewToNormalAngleDeg =
  (Math.acos(clamp(normalDotView, -1, 1)) * 180) / Math.PI;
assert.ok(Math.abs(saturnFocusPolarRad - Math.PI / 3) <= 1e-12);
assert.ok(
  normalDotView >= 0.1,
  `Saturn default focus remains too close to edge-on (|dot|=${normalDotView}, angle=${viewToNormalAngleDeg} deg)`,
);
console.log(
  `PASS Saturn default focus orbit stays non-edge-on (polar=${saturnFocusPolarRad.toFixed(6)} rad, view-normal angle=${viewToNormalAngleDeg.toFixed(3)} deg)`,
);

const slice4Regression = spawnSync(
  process.execPath,
  ['--test', 'tests/v2-slice4-cutover.test.mjs'],
  { cwd: repoRoot, encoding: 'utf8' },
);
assert.equal(
  slice4Regression.status,
  0,
  `Slice 4 cutover regression failed\n${slice4Regression.stdout}\n${slice4Regression.stderr}`,
);
console.log('PASS Slice 4 Saturn moon cutover criteria remain green under Slice 5 regression gate');
