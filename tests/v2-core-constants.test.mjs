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
  ASTEROID_DEFAULT_ALBEDO,
  createAsteroidCatalogIndex,
  deriveAsteroidRadiusMFromAbsoluteMagnitude,
  BODY_CADENCE_SECONDS,
  BODY_CLASSES,
  BODY_CONSTANTS,
  BODY_INTERPOLATION_INVARIANTS,
  INTERPOLATION_ERROR_BARS_M,
  INV008_BARS_M,
  INV010_BARS_M,
  INV011_BARS_M,
  SATURN_A_RING_OUTER_RADIUS_M,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M,
  SATURN_C_RING_INNER_RADIUS_M,
  SATURN_D_RING_INNER_RADIUS_M,
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
  getAsteroidByDesignation,
  getAsteroidBySpkId,
  getBodyClass,
} = await import(
  pathToFileURL(path.join(tempOutDir, 'core', 'index.js')).href
);
const {
  eccentricityBandForBody,
  hasOrbitLineForBody,
} = await import(pathToFileURL(path.join(tempOutDir, 'core', 'constants', 'asteroids.js')).href);

const SLICE2_BODY_IDS = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];
const SLICE6_BODY_IDS = ['phobos', 'deimos'];
const SLICE3_BODY_IDS = ['jupiter', 'io', 'europa', 'ganymede', 'callisto'];
const SLICE4_BODY_IDS = ['saturn', 'titan', 'rhea', 'iapetus', 'tethys', 'dione', 'mimas', 'enceladus'];
const EXPECTED_BODY_IDS = [...SLICE2_BODY_IDS, ...SLICE6_BODY_IDS, ...SLICE3_BODY_IDS, ...SLICE4_BODY_IDS];

const EXPECTED_SLICE6_CONSTANTS = {
  mars: {
    naifId: 499,
    radiusM: 3_396_190.0,
    radiiM: { a: 3_396_190.0, b: 3_396_190.0, c: 3_376_200.0 },
    vizColor: 0xC1440E,
    cadenceSeconds: 86_400,
    barM: 50,
    invariantId: 'INV-008',
  },
  phobos: {
    naifId: 401,
    radiusM: 13_000.0,
    radiiM: { a: 13_000.0, b: 11_400.0, c: 9_100.0 },
    vizColor: 0x8A7B69,
    cadenceSeconds: 1_800,
    barM: 5_000,
    invariantId: 'INV-011',
  },
  deimos: {
    naifId: 402,
    radiusM: 7_800.0,
    radiiM: { a: 7_800.0, b: 6_000.0, c: 5_100.0 },
    vizColor: 0x9EA3A8,
    cadenceSeconds: 3_600,
    barM: 500,
    invariantId: 'INV-011',
  },
};

const EXPECTED_SLICE3_CONSTANTS = {
  jupiter: {
    naifId: 599,
    radiusM: 71_492_000.0,
    radiiM: { a: 71_492_000.0, b: 71_492_000.0, c: 66_854_000.0 },
    vizColor: 0xC4A878,
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
  SATURN_A_RING_OUTER_RADIUS_M: 136_770_000,
  SATURN_CASSINI_DIVISION_INNER_RADIUS_M: 117_500_000,
  SATURN_CASSINI_DIVISION_OUTER_RADIUS_M: 122_050_000,
};

const EXPECTED_SATURN_RING_SUBSTRUCTURE_RADII = {
  SATURN_HUYGENS_GAP_INNER_RADIUS_M: 117_500_000,
  SATURN_HUYGENS_GAP_OUTER_RADIUS_M: 117_930_000,
  SATURN_HUYGENS_RINGLET_INNER_RADIUS_M: 117_806_000,
  SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M: 117_824_000,
  SATURN_LAPLACE_GAP_INNER_RADIUS_M: 119_845_000,
  SATURN_LAPLACE_GAP_OUTER_RADIUS_M: 120_086_000,
  SATURN_LAPLACE_RINGLET_INNER_RADIUS_M: 120_037_000,
  SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M: 120_078_000,
  SATURN_ENCKE_GAP_INNER_RADIUS_M: 133_423_000,
  SATURN_ENCKE_GAP_OUTER_RADIUS_M: 133_745_000,
  SATURN_KEELER_GAP_INNER_RADIUS_M: 136_487_000,
  SATURN_KEELER_GAP_OUTER_RADIUS_M: 136_522_000,
  SATURN_ROCHE_DIVISION_INNER_RADIUS_M: 136_770_000,
  SATURN_ROCHE_DIVISION_OUTER_RADIUS_M: 139_380_000,
};

const ASTEROID_FIXTURE_PATH = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');
const ASTEROID_FIXTURE = JSON.parse(fs.readFileSync(ASTEROID_FIXTURE_PATH, 'utf8'));
const CURATED_NEA_FIXTURE = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'tools', 'slice7-research', 'data', 'famous-neas.json'), 'utf8')
);
const CURATED_NEA_SET = new Set(CURATED_NEA_FIXTURE.map((asteroid) => asteroid.designation));
const ASTEROID_ENTRIES = Object.entries(ASTEROID_FIXTURE.asteroids).map(([bodyId, asteroid]) => ({
  bodyId,
  bodyClass: 'asteroid',
  ...asteroid,
  isCuratedNea: asteroid.isCuratedNea ?? CURATED_NEA_SET.has(asteroid.designation),
  estimatedRadiusM: asteroid.estimatedRadiusM ?? asteroid.estimatedRadiusKm * 1000,
  elementsFrame: asteroid.elementsFrame ?? 'FRAME_HELIO_J2000_ECLIPTIC',
  eccentricityBand: eccentricityBandForBody(asteroid.elements.e),
  hasOrbitLine: hasOrbitLineForBody(asteroid.H),
}));
const ASTEROID_INDEX = createAsteroidCatalogIndex(ASTEROID_ENTRIES);
const CURATED_NEA_DESIGNATIONS = ['101955', '99942', '433', '25143', '162173', '4179', '1620', '4769'];

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

// Verify all Slice 6 moon body IDs are present in INV011_BARS_M.
for (const id of SLICE6_BODY_IDS) {
  assert(
    Object.prototype.hasOwnProperty.call(INV011_BARS_M, id),
    `INV011_BARS_M has key '${id}'`,
    `key '${id}' missing from INV011_BARS_M`
  );
}

// Verify each INV011_BARS_M value > 0.
for (const id of SLICE6_BODY_IDS) {
  const val = INV011_BARS_M[id];
  assert(
    typeof val === 'number' && val > 0,
    `INV011_BARS_M['${id}'] > 0`,
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

assert(
  BODY_CLASSES.sun === 'star' &&
    BODY_CLASSES.mars === 'planet' &&
    BODY_CLASSES.phobos === 'moon' &&
    getBodyClass('asteroid-101955') === 'asteroid',
  'body-class tagging covers fixed bodies and asteroid ids',
  `got ${JSON.stringify({
    sun: BODY_CLASSES.sun,
    mars: BODY_CLASSES.mars,
    phobos: BODY_CLASSES.phobos,
    asteroid: getBodyClass('asteroid-101955'),
  })}`
);

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

// Verify Slice 6 Mars-system constants match the README and invariant specs.
for (const [id, expected] of Object.entries(EXPECTED_SLICE6_CONSTANTS)) {
  const entry = BODY_CONSTANTS[id];
  assert(entry.naifId === expected.naifId, `BODY_CONSTANTS['${id}'].naifId matches Slice 6 docs`, `got ${entry.naifId}`);
  assert(entry.radiusM === expected.radiusM, `BODY_CONSTANTS['${id}'].radiusM matches Slice 6 docs`, `got ${entry.radiusM}`);
  assert(entry.vizColor === expected.vizColor, `BODY_CONSTANTS['${id}'].vizColor matches Slice 6 docs`, `got ${entry.vizColor}`);
  assert(BODY_CADENCE_SECONDS[id] === expected.cadenceSeconds, `BODY_CADENCE_SECONDS['${id}'] matches Slice 6 cadence`, `got ${BODY_CADENCE_SECONDS[id]}`);
  assert(INTERPOLATION_ERROR_BARS_M[id] === expected.barM, `INTERPOLATION_ERROR_BARS_M['${id}'] matches Slice 6 bar`, `got ${INTERPOLATION_ERROR_BARS_M[id]}`);
  assert(BODY_INTERPOLATION_INVARIANTS[id] === expected.invariantId, `BODY_INTERPOLATION_INVARIANTS['${id}'] matches Slice 6 invariant`, `got ${BODY_INTERPOLATION_INVARIANTS[id]}`);

  if (id === 'phobos' || id === 'deimos') {
    assert(INV011_BARS_M[id] === expected.barM, `INV011_BARS_M['${id}'] matches Slice 6 bar`, `got ${INV011_BARS_M[id]}`);
  }

  if (expected.radiiM) {
    assert(
      entry.radiiM?.a === expected.radiiM.a &&
        entry.radiiM?.b === expected.radiiM.b &&
        entry.radiiM?.c === expected.radiiM.c,
      `BODY_CONSTANTS['${id}'].radiiM matches Slice 6 triaxial values`,
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

for (const [name, expectedValue] of Object.entries(EXPECTED_SATURN_RING_SUBSTRUCTURE_RADII)) {
  const actualValue = ({
    SATURN_HUYGENS_GAP_INNER_RADIUS_M,
    SATURN_HUYGENS_GAP_OUTER_RADIUS_M,
    SATURN_HUYGENS_RINGLET_INNER_RADIUS_M,
    SATURN_HUYGENS_RINGLET_OUTER_RADIUS_M,
    SATURN_LAPLACE_GAP_INNER_RADIUS_M,
    SATURN_LAPLACE_GAP_OUTER_RADIUS_M,
    SATURN_LAPLACE_RINGLET_INNER_RADIUS_M,
    SATURN_LAPLACE_RINGLET_OUTER_RADIUS_M,
    SATURN_ENCKE_GAP_INNER_RADIUS_M,
    SATURN_ENCKE_GAP_OUTER_RADIUS_M,
    SATURN_KEELER_GAP_INNER_RADIUS_M,
    SATURN_KEELER_GAP_OUTER_RADIUS_M,
    SATURN_ROCHE_DIVISION_INNER_RADIUS_M,
    SATURN_ROCHE_DIVISION_OUTER_RADIUS_M,
  })[name];

  assert(
    actualValue === expectedValue,
    `${name} matches Slice 5 docs`,
    `got ${actualValue}`
  );
}

assert(
  ASTEROID_INDEX.byBodyId.size === 1008,
  'createAsteroidCatalogIndex ingests all 1008 asteroid records',
  `got ${ASTEROID_INDEX.byBodyId.size}`
);

assert(
  ASTEROID_INDEX.curatedNeas.length === 8,
  'createAsteroidCatalogIndex identifies the 8 curated NEAs',
  `got ${ASTEROID_INDEX.curatedNeas.length}`
);

for (const [eccentricity, expectedBand] of [
  [0.0999, 'A'],
  [0.1, 'B'],
  [0.1999, 'B'],
  [0.2, 'C'],
  [0.2999, 'C'],
  [0.3, 'D'],
]) {
  assert(
    eccentricityBandForBody(eccentricity) === expectedBand,
    `eccentricityBandForBody(${eccentricity}) returns ${expectedBand}`,
    `got ${eccentricityBandForBody(eccentricity)}`
  );
}

for (const [absoluteMagnitude, expectedHasOrbitLine] of [
  [10.97, true],
  [10.98, false],
  [10.99, false],
]) {
  assert(
    hasOrbitLineForBody(absoluteMagnitude) === expectedHasOrbitLine,
    `hasOrbitLineForBody(${absoluteMagnitude}) returns ${expectedHasOrbitLine}`,
    `got ${hasOrbitLineForBody(absoluteMagnitude)}`
  );
}

for (const designation of CURATED_NEA_DESIGNATIONS) {
  const asteroid = getAsteroidByDesignation(ASTEROID_INDEX, designation);
  assert(
    asteroid?.isCuratedNea === true,
    `curated NEA designation ${designation} remains flagged`,
    `got ${asteroid ? asteroid.isCuratedNea : 'missing'}`
  );
}

const bennuByDesignation = getAsteroidByDesignation(ASTEROID_INDEX, '101955');
const bennuBySpkId = getAsteroidBySpkId(ASTEROID_INDEX, 101955);
assert(
  bennuByDesignation?.bodyId === 'asteroid-101955' &&
    bennuBySpkId?.bodyId === 'asteroid-101955',
  'asteroid lookup works by designation and SPK id for Bennu',
  `got ${JSON.stringify({
    byDesignation: bennuByDesignation?.bodyId ?? null,
    bySpkId: bennuBySpkId?.bodyId ?? null,
  })}`
);

const expectedBennuRadiusM = deriveAsteroidRadiusMFromAbsoluteMagnitude(
  bennuByDesignation.H,
  ASTEROID_DEFAULT_ALBEDO
);
assert(
  Math.abs(expectedBennuRadiusM - bennuByDesignation.estimatedRadiusM) <= 1e-6,
  'estimatedRadiusM matches the H-derived default-albedo formula for Bennu',
  `got ${bennuByDesignation.estimatedRadiusM}, expected ${expectedBennuRadiusM}`
);

assert(
  bennuByDesignation.eccentricityBand === eccentricityBandForBody(bennuByDesignation.elements.e) &&
    bennuByDesignation.hasOrbitLine === hasOrbitLineForBody(bennuByDesignation.H),
  'Slice 7 asteroid fixture entries can be extended with Slice 8 band and orbit-line metadata',
  `got ${JSON.stringify({
    eccentricityBand: bennuByDesignation.eccentricityBand,
    expectedBand: eccentricityBandForBody(bennuByDesignation.elements.e),
    hasOrbitLine: bennuByDesignation.hasOrbitLine,
    expectedHasOrbitLine: hasOrbitLineForBody(bennuByDesignation.H),
  })}`
);

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll assertions passed.');
}
