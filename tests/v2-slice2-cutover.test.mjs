// B1 — Slice 2 INV-008 Cutover Validation Harness
// Validates Hermite interpolation error against per-body cutover bars.
// Must exit 0 with all six bars cleared before Phase C begins.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-slice2-cutover');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-inner-system-90d.json');
const dataDir = path.join(repoRoot, 'tools', 'slice2-research', 'data');

// INV-008 cutover bars in km (matching founding doc)
const CUTOVER_BARS_KM = {
  sun:      0.00002,
  mercury: 100,
  venus:     1,
  earth:     0.5,
  moon:     20,
  mars:      0.05,
};

// J2000 epoch in Julian Date
const J2000_JD = 2451545.0;
const SECONDS_PER_DAY = 86400;

function jdToTdb(jd) {
  return (jd - J2000_JD) * SECONDS_PER_DAY;
}

function mag3(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

// Compile core + boundary
console.log('Compiling v2 core and boundary...');
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
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' }
);

if (tscResult.status !== 0) {
  console.error('FAIL tsc compilation');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}
console.log('PASS tsc compilation\n');

const { ingestSlice2Fixture } = await import(
  pathToFileURL(path.join(tempOutDir, 'boundary', 'horizons.js')).href
);
const { interpolateBodyState } = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'interpolators', 'hermite.js')).href
);

// Load and ingest the 90-day fixture
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const allStates = ingestSlice2Fixture(fixture);  // Record<string, CanonicalStateSample[]>

// Load truth files: build Map<tdbSeconds, {x,y,z} in meters> per body
function loadTruthMap(bodyName) {
  const raw = JSON.parse(fs.readFileSync(path.join(dataDir, `truth-${bodyName}.json`), 'utf8'));
  const map = new Map();
  for (const sample of raw.samples) {
    const tdb = jdToTdb(sample.jdTdb);
    map.set(tdb, {
      x: sample.positionKm.x * 1000,
      y: sample.positionKm.y * 1000,
      z: sample.positionKm.z * 1000,
    });
  }
  return map;
}

const BODIES = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];

let failures = 0;
const results = {};

for (const body of BODIES) {
  const samples = allStates[body];   // CanonicalStateSample[]
  const truthMap = loadTruthMap(body);

  let maxErrorKm = 0;
  let checkedPoints = 0;

  for (let i = 0; i < samples.length - 1; i++) {
    const s0 = samples[i].state;
    const s1 = samples[i + 1].state;

    // Validate samples are consecutive daily steps
    const dtSeconds = s1.tdbSeconds - s0.tdbSeconds;
    if (dtSeconds < 80000 || dtSeconds > 90000) continue;  // skip non-daily gaps

    // Sample at 6h, 12h, 18h within the interval
    for (const offsetH of [6, 12, 18]) {
      const tTarget = s0.tdbSeconds + offsetH * 3600;

      // Round to nearest second for Map lookup (truth is on exact 6h marks)
      // Truth tdb values are exactly (jd - 2451545) * 86400
      // Find closest truth key within 60 seconds
      let closestKey = null;
      let closestDist = Infinity;
      for (const [k] of truthMap) {
        const d = Math.abs(k - tTarget);
        if (d < closestDist) { closestDist = d; closestKey = k; }
        if (d < 1) break;  // exact match
      }
      if (closestKey === null || closestDist > 120) continue;  // no matching truth point

      const truthM = truthMap.get(closestKey);
      const interpState = interpolateBodyState(s0, s1, tTarget);
      const interpM = interpState.positionM;

      const dx = interpM.x - truthM.x;
      const dy = interpM.y - truthM.y;
      const dz = interpM.z - truthM.z;
      const errorM = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const errorKm = errorM / 1000;

      if (errorKm > maxErrorKm) maxErrorKm = errorKm;
      checkedPoints++;
    }
  }

  const bar = CUTOVER_BARS_KM[body];
  const pass = maxErrorKm <= bar;
  results[body] = { maxErrorKm, bar, pass, checkedPoints };

  const status = pass ? 'PASS' : 'FAIL';
  const sign = pass ? '≤' : '>';
  console.log(
    `${status} INV-008 ${body.padEnd(7)} max_err=${maxErrorKm.toExponential(3)} km  bar=${bar} km  (${checkedPoints} pts checked)`
  );

  if (!pass) failures++;
}

console.log('');
if (failures > 0) {
  console.error(`${failures} body/bodies exceeded INV-008 cutover bar. Phase C is BLOCKED.`);
  process.exit(1);
} else {
  console.log('All six INV-008 cutover bars cleared. Phase C is UNBLOCKED.');
}
