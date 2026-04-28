import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-core-constants');

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
    path.join(repoRoot, 'src', 'v2', 'core', 'index.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' }
);

if (tscResult.status !== 0) {
  console.error('FAIL tsc compilation');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}
console.log('PASS tsc compilation');

const { BODY_CONSTANTS, INV008_BARS_M } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'constants', 'bodies.js')).href
);

const EXPECTED_BODY_IDS = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];

let failures = 0;

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail) {
  console.error(`FAIL ${label}${detail ? ': ' + detail : ''}`);
  failures++;
}

function assert(condition, label, detail) {
  if (condition) {
    pass(label);
  } else {
    fail(label, detail);
  }
}

// Verify all six body IDs are present in BODY_CONSTANTS
for (const id of EXPECTED_BODY_IDS) {
  assert(
    Object.prototype.hasOwnProperty.call(BODY_CONSTANTS, id),
    `BODY_CONSTANTS has key '${id}'`,
    `key '${id}' missing from BODY_CONSTANTS`
  );
}

// Verify radiusM > 0 for each body
for (const id of EXPECTED_BODY_IDS) {
  const entry = BODY_CONSTANTS[id];
  assert(
    entry && typeof entry.radiusM === 'number' && entry.radiusM > 0,
    `BODY_CONSTANTS['${id}'].radiusM > 0`,
    `got ${entry?.radiusM}`
  );
}

// Verify vizColor is a valid number in range 0x000000–0xFFFFFF for each body
for (const id of EXPECTED_BODY_IDS) {
  const entry = BODY_CONSTANTS[id];
  const color = entry?.vizColor;
  assert(
    typeof color === 'number' && Number.isInteger(color) && color >= 0x000000 && color <= 0xFFFFFF,
    `BODY_CONSTANTS['${id}'].vizColor in [0x000000, 0xFFFFFF]`,
    `got ${color}`
  );
}

// Verify all six body IDs are present in INV008_BARS_M
for (const id of EXPECTED_BODY_IDS) {
  assert(
    Object.prototype.hasOwnProperty.call(INV008_BARS_M, id),
    `INV008_BARS_M has key '${id}'`,
    `key '${id}' missing from INV008_BARS_M`
  );
}

// Verify each INV008_BARS_M value > 0
for (const id of EXPECTED_BODY_IDS) {
  const val = INV008_BARS_M[id];
  assert(
    typeof val === 'number' && val > 0,
    `INV008_BARS_M['${id}'] > 0`,
    `got ${val}`
  );
}

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll assertions passed.');
}
