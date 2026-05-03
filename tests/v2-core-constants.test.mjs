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

const {
  BODY_CADENCE_SECONDS,
  BODY_CONSTANTS,
  BODY_INTERPOLATION_INVARIANTS,
  INTERPOLATION_ERROR_BARS_M,
  INV008_BARS_M,
  INV010_BARS_M,
  SATURN_A_RING_OUTER_RADIUS_M,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  SATURN_C_RING_INNER_RADIUS_M,
  SATURN_D_RING_INNER_RADIUS_M,
} = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'constants', 'bodies.js')).href
);

const SLICE2_BODY_IDS = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];
const SLICE3_BODY_IDS = ['jupiter', 'io', 'europa', 'ganymede', 'callisto'];
const SLICE4_BODY_IDS = ['saturn', 'titan', 'rhea', 'iapetus', 'tethys', 'dione', 'mimas', 'enceladus'];
const EXPECTED_BODY_IDS = [...SLICE2_BODY_IDS, ...SLICE3_BODY_IDS, ...SLICE4_BODY_IDS];

const EXPECTED_SLICE3_CONSTANTS = {
  jupiter: {
    naifId: 599,
    radiusM: 71_492_000.0,
    radiiM: { a: 71_492_000.0, b: 71_492_000.0, c: 66_854_000.0 },
    vizColor: 0xD9C3A3,
    cadenceSeconds: 86_400,
    barM: 50_000,
    invariantId: 'INV-009',
  },
  io: {
    naifId: 501,
    radiusM: 1_829_400.0,
    vizColor: 0xC9A15A,
    cadenceSeconds: 3_600,
    barM: 5_000,
    invariantId: 'INV-009',
  },
  europa: {
    naifId: 502,
    radiusM: 1_562_600.0,
    vizColor: 0xD8D3C5,
    cadenceSeconds: 10_800,
    barM: 20_000,
    invariantId: 'INV-009',
  },
  ganymede: {
    naifId: 503,
    radiusM: 2_631_200.0,
    vizColor: 0x9A8F7A,
    cadenceSeconds: 21_600,
    barM: 20_000,
    invariantId: 'INV-009',
  },
  callisto: {
    naifId: 504,
    radiusM: 2_410_300.0,
    vizColor: 0x5E5851,
    cadenceSeconds: 43_200,
    barM: 50_000,
    invariantId: 'INV-009',
  },
};

const EXPECTED_SLICE4_CONSTANTS = {
  saturn: {
    naifId: 699,
    radiusM: 60_268_000.0,
    radiiM: { a: 60_268_000.0, b: 60_268_000.0, c: 54_364_000.0 },
    vizColor: 0xD8C3A5,
    cadenceSeconds: 86_400,
    barM: 1_000,
    invariantId: 'INV-010',
  },
  titan: {
    naifId: 606,
    radiusM: 2_575_150.0,
    vizColor: 0x9E8562,
    cadenceSeconds: 43_200,
    barM: 20_000,
    invariantId: 'INV-010',
  },
  rhea: {
    naifId: 605,
    radiusM: 765_000.0,
    vizColor: 0xCFCFD3,
    cadenceSeconds: 10_800,
    barM: 5_000,
    invariantId: 'INV-010',
  },
  iapetus: {
    naifId: 608,
    radiusM: 745_700.0,
    vizColor: 0xA79884,
    cadenceSeconds: 86_400,
    barM: 2_000,
    invariantId: 'INV-010',
  },
  tethys: {
    naifId: 603,
    radiusM: 538_400.0,
    vizColor: 0xF0ECE2,
    cadenceSeconds: 3_600,
    barM: 1_000,
    invariantId: 'INV-010',
  },
  dione: {
    naifId: 604,
    radiusM: 563_400.0,
    vizColor: 0xE8E0D3,
    cadenceSeconds: 10_800,
    barM: 50_000,
    invariantId: 'INV-010',
  },
  mimas: {
    naifId: 601,
    radiusM: 207_800.0,
    vizColor: 0x9F9B96,
    cadenceSeconds: 3_600,
    barM: 20_000,
    invariantId: 'INV-010',
  },
  enceladus: {
    naifId: 602,
    radiusM: 256_600.0,
    vizColor: 0xF6F6F2,
    cadenceSeconds: 3_600,
    barM: 5_000,
    invariantId: 'INV-010',
  },
};

const EXPECTED_SATURN_RING_RADII = {
  SATURN_D_RING_INNER_RADIUS_M: 66_900_000,
  SATURN_C_RING_INNER_RADIUS_M: 74_491_000,
  SATURN_A_RING_OUTER_RADIUS_M: 136_780_000,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M: 117_500_000,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M: 122_050_000,
};

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

// Verify all expected body IDs are present in BODY_CONSTANTS.
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

// Verify NAIF body IDs are present for every body
for (const id of EXPECTED_BODY_IDS) {
  const entry = BODY_CONSTANTS[id];
  assert(
    entry && typeof entry.naifId === 'number' && entry.naifId > 0,
    `BODY_CONSTANTS['${id}'].naifId > 0`,
    `got ${entry?.naifId}`
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

// Verify all Slice 2 body IDs are present in INV008_BARS_M.
for (const id of SLICE2_BODY_IDS) {
  assert(
    Object.prototype.hasOwnProperty.call(INV008_BARS_M, id),
    `INV008_BARS_M has key '${id}'`,
    `key '${id}' missing from INV008_BARS_M`
  );
}

// Verify each INV008_BARS_M value > 0.
for (const id of SLICE2_BODY_IDS) {
  const val = INV008_BARS_M[id];
  assert(
    typeof val === 'number' && val > 0,
    `INV008_BARS_M['${id}'] > 0`,
    `got ${val}`
  );
}

// Verify all Slice 4 body IDs are present in INV010_BARS_M.
for (const id of SLICE4_BODY_IDS) {
  assert(
    Object.prototype.hasOwnProperty.call(INV010_BARS_M, id),
    `INV010_BARS_M has key '${id}'`,
    `key '${id}' missing from INV010_BARS_M`
  );
}

// Verify each INV010_BARS_M value > 0.
for (const id of SLICE4_BODY_IDS) {
  const val = INV010_BARS_M[id];
  assert(
    typeof val === 'number' && val > 0,
    `INV010_BARS_M['${id}'] > 0`,
    `got ${val}`
  );
}

// Verify unified interpolation bars and cadence entries exist for all bodies.
for (const id of EXPECTED_BODY_IDS) {
  assert(
    Object.prototype.hasOwnProperty.call(INTERPOLATION_ERROR_BARS_M, id),
    `INTERPOLATION_ERROR_BARS_M has key '${id}'`,
    `key '${id}' missing from INTERPOLATION_ERROR_BARS_M`
  );
  assert(
    Object.prototype.hasOwnProperty.call(BODY_CADENCE_SECONDS, id),
    `BODY_CADENCE_SECONDS has key '${id}'`,
    `key '${id}' missing from BODY_CADENCE_SECONDS`
  );
  assert(
    Object.prototype.hasOwnProperty.call(BODY_INTERPOLATION_INVARIANTS, id),
    `BODY_INTERPOLATION_INVARIANTS has key '${id}'`,
    `key '${id}' missing from BODY_INTERPOLATION_INVARIANTS`
  );
}

// Verify Slice 3 Jupiter-system constants match the README values.
for (const [id, expected] of Object.entries(EXPECTED_SLICE3_CONSTANTS)) {
  const entry = BODY_CONSTANTS[id];
  assert(entry.naifId === expected.naifId, `BODY_CONSTANTS['${id}'].naifId matches README`, `got ${entry.naifId}`);
  assert(entry.radiusM === expected.radiusM, `BODY_CONSTANTS['${id}'].radiusM matches README`, `got ${entry.radiusM}`);
  assert(entry.vizColor === expected.vizColor, `BODY_CONSTANTS['${id}'].vizColor matches README`, `got ${entry.vizColor}`);
  assert(BODY_CADENCE_SECONDS[id] === expected.cadenceSeconds, `BODY_CADENCE_SECONDS['${id}'] matches Slice 3 cadence`, `got ${BODY_CADENCE_SECONDS[id]}`);
  assert(INTERPOLATION_ERROR_BARS_M[id] === expected.barM, `INTERPOLATION_ERROR_BARS_M['${id}'] matches Slice 3 bar`, `got ${INTERPOLATION_ERROR_BARS_M[id]}`);
  assert(BODY_INTERPOLATION_INVARIANTS[id] === expected.invariantId, `BODY_INTERPOLATION_INVARIANTS['${id}'] matches Slice 3 invariant`, `got ${BODY_INTERPOLATION_INVARIANTS[id]}`);

  if (expected.radiiM) {
    assert(
      entry.radiiM?.a === expected.radiiM.a &&
        entry.radiiM?.b === expected.radiiM.b &&
        entry.radiiM?.c === expected.radiiM.c,
      `BODY_CONSTANTS['${id}'].radiiM matches README triaxial values`,
      `got ${JSON.stringify(entry.radiiM)}`
    );
  }
}

// Verify Slice 4 Saturn-system constants match the README and invariant specs.
for (const [id, expected] of Object.entries(EXPECTED_SLICE4_CONSTANTS)) {
  const entry = BODY_CONSTANTS[id];
  assert(entry.naifId === expected.naifId, `BODY_CONSTANTS['${id}'].naifId matches Slice 4 docs`, `got ${entry.naifId}`);
  assert(entry.radiusM === expected.radiusM, `BODY_CONSTANTS['${id}'].radiusM matches Slice 4 docs`, `got ${entry.radiusM}`);
  assert(entry.vizColor === expected.vizColor, `BODY_CONSTANTS['${id}'].vizColor matches Slice 4 docs`, `got ${entry.vizColor}`);
  assert(BODY_CADENCE_SECONDS[id] === expected.cadenceSeconds, `BODY_CADENCE_SECONDS['${id}'] matches Slice 4 cadence`, `got ${BODY_CADENCE_SECONDS[id]}`);
  assert(INTERPOLATION_ERROR_BARS_M[id] === expected.barM, `INTERPOLATION_ERROR_BARS_M['${id}'] matches Slice 4 bar`, `got ${INTERPOLATION_ERROR_BARS_M[id]}`);
  assert(BODY_INTERPOLATION_INVARIANTS[id] === expected.invariantId, `BODY_INTERPOLATION_INVARIANTS['${id}'] matches Slice 4 invariant`, `got ${BODY_INTERPOLATION_INVARIANTS[id]}`);
  assert(INV010_BARS_M[id] === expected.barM, `INV010_BARS_M['${id}'] matches Slice 4 bar`, `got ${INV010_BARS_M[id]}`);

  if (expected.radiiM) {
    assert(
      entry.radiiM?.a === expected.radiiM.a &&
        entry.radiiM?.b === expected.radiiM.b &&
        entry.radiiM?.c === expected.radiiM.c,
      `BODY_CONSTANTS['${id}'].radiiM matches Slice 4 triaxial values`,
      `got ${JSON.stringify(entry.radiiM)}`
    );
  }
}

assert(
  SATURN_D_RING_INNER_RADIUS_M === EXPECTED_SATURN_RING_RADII.SATURN_D_RING_INNER_RADIUS_M,
  'SATURN_D_RING_INNER_RADIUS_M matches Slice 4 docs',
  `got ${SATURN_D_RING_INNER_RADIUS_M}`
);
assert(
  SATURN_C_RING_INNER_RADIUS_M === EXPECTED_SATURN_RING_RADII.SATURN_C_RING_INNER_RADIUS_M,
  'SATURN_C_RING_INNER_RADIUS_M matches Slice 4 docs',
  `got ${SATURN_C_RING_INNER_RADIUS_M}`
);
assert(
  SATURN_A_RING_OUTER_RADIUS_M === EXPECTED_SATURN_RING_RADII.SATURN_A_RING_OUTER_RADIUS_M,
  'SATURN_A_RING_OUTER_RADIUS_M matches Slice 4 docs',
  `got ${SATURN_A_RING_OUTER_RADIUS_M}`
);
assert(
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M === EXPECTED_SATURN_RING_RADII.SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
  'SATURN_CASSINI_DIVISION_INNER_RADIUS_M matches Slice 4 docs',
  `got ${SATURN_CASSINI_DIVISION_INNER_RADIUS_M}`
);
assert(
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M === EXPECTED_SATURN_RING_RADII.SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  'SATURN_CASSINI_DIVISION_OUTER_RADIUS_M matches Slice 4 docs',
  `got ${SATURN_CASSINI_DIVISION_OUTER_RADIUS_M}`
);

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll assertions passed.');
}
