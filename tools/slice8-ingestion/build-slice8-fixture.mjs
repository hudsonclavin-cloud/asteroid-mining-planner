import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  cartesianToElements,
  elementsToCartesianAtEpoch,
} from '../slice7-research/state-to-elements.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const MAIN_BELT_PATH = path.join(repoRoot, 'tools', 'slice8-research', 'data', 'main-belt-top-10000.json');
const SLICE7_ANCHORS_PATH = path.join(repoRoot, 'tools', 'slice7-research', 'data', 'horizons-anchors.json');
const SLICE8_ANCHORS_PATH = path.join(repoRoot, 'tools', 'slice8-ingestion', 'data', 'horizons-anchors-9000.json');
const SLICE7_FIXTURE_PATH = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice7.json');
const OUTPUT_PATH = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'asteroid-catalog-slice8.json');

const ANCHOR_EPOCH_TDB_JD = 2461161.5;
const FRAME_HELIO_J2000_ECLIPTIC = 'FRAME_HELIO_J2000_ECLIPTIC';
const ASTEROID_DEFAULT_ALBEDO = 0.14;
const ASTEROID_ORBIT_LINE_THRESHOLD_H = 10.98;

function toBodyId(designation) {
  return `asteroid-${designation}`;
}

function eccentricityBandForBody(eccentricity) {
  if (eccentricity < 0.1) return 'A';
  if (eccentricity < 0.2) return 'B';
  if (eccentricity < 0.3) return 'C';
  return 'D';
}

function hasOrbitLineForBody(absoluteMagnitude) {
  return absoluteMagnitude < ASTEROID_ORBIT_LINE_THRESHOLD_H;
}

function deriveAsteroidRadiusMFromAbsoluteMagnitude(absoluteMagnitude, albedo = ASTEROID_DEFAULT_ALBEDO) {
  return ((1329 / Math.sqrt(albedo)) * 10 ** (-absoluteMagnitude / 5)) * 500;
}

function sortByDesignation(left, right) {
  return left.designation.localeCompare(right.designation, 'en', { numeric: true });
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJson(filePath, document) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function magnitude3(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function verifyRoundTrip(elements, anchor, designation) {
  const roundTrip = elementsToCartesianAtEpoch({
    a: elements.aKm,
    e: elements.e,
    i: elements.iRad,
    om: elements.omRad,
    w: elements.wRad,
    ma: elements.maRad,
    epoch_tdb_jd: elements.epochTdbJd,
  });

  const errorKm = Math.hypot(
    roundTrip.position_km.x - anchor.positionKm[0],
    roundTrip.position_km.y - anchor.positionKm[1],
    roundTrip.position_km.z - anchor.positionKm[2],
  );

  assert(
    errorKm <= 1e-3,
    `Anchor round-trip for ${designation} exceeded 1 meter: ${errorKm * 1000} m`,
  );
}

function buildSlice8RecordFromSlice7(slice7Record) {
  return {
    ...slice7Record,
    eccentricityBand: eccentricityBandForBody(slice7Record.elements.e),
    hasOrbitLine: hasOrbitLineForBody(slice7Record.H),
  };
}

function buildSlice8RecordFromInventoryAndAnchor(inventoryRecord, anchorRecord) {
  const elements = cartesianToElements({
    epoch_tdb_jd: anchorRecord.epoch_tdb_jd,
    position_km: anchorRecord.position_km,
    velocity_km_per_s: anchorRecord.velocity_km_per_s,
  });

  const record = {
    designation: inventoryRecord.designation,
    spkId: anchorRecord.spk_id,
    name: inventoryRecord.name ?? anchorRecord.name ?? null,
    class: inventoryRecord.class,
    isCuratedNea: false,
    neo: Boolean(inventoryRecord.neo),
    pha: Boolean(inventoryRecord.pha),
    H: inventoryRecord.H,
    G: inventoryRecord.G ?? null,
    estimatedRadiusM: deriveAsteroidRadiusMFromAbsoluteMagnitude(inventoryRecord.H),
    anchor: {
      epochTdbJd: anchorRecord.epoch_tdb_jd,
      positionKm: anchorRecord.position_km,
      velocityKmPerS: anchorRecord.velocity_km_per_s,
    },
    elements: {
      aKm: elements.a,
      e: elements.e,
      iRad: elements.i,
      omRad: elements.om,
      wRad: elements.w,
      maRad: elements.ma,
      epochTdbJd: elements.epoch_tdb_jd,
    },
    elementsFrame: FRAME_HELIO_J2000_ECLIPTIC,
    eccentricityBand: eccentricityBandForBody(elements.e),
    hasOrbitLine: hasOrbitLineForBody(inventoryRecord.H),
  };

  verifyRoundTrip(record.elements, record.anchor, record.designation);
  return record;
}

function summarizeDistribution(records) {
  const bands = { A: 0, B: 0, C: 0, D: 0 };
  let orbitLines = 0;
  let curatedNeas = 0;

  for (const record of records) {
    bands[record.eccentricityBand] += 1;
    if (record.hasOrbitLine) orbitLines += 1;
    if (record.isCuratedNea) curatedNeas += 1;
  }

  return { bands, orbitLines, curatedNeas };
}

const main = async () => {
  const [mainBeltInventory, slice7Anchors, slice8Anchors, slice7Fixture] = await Promise.all([
    readJson(MAIN_BELT_PATH),
    readJson(SLICE7_ANCHORS_PATH),
    readJson(SLICE8_ANCHORS_PATH),
    readJson(SLICE7_FIXTURE_PATH),
  ]);

  const inventory = [...mainBeltInventory];
  const slice7AnchorMap = new Map(slice7Anchors.bodies.map((body) => [body.designation, body]));
  const slice8AnchorMap = new Map(slice8Anchors.bodies.map((body) => [body.designation, body]));
  const slice7Asteroids = slice7Fixture.asteroids;

  assert(inventory.length === 10000, `Expected 10000 main-belt inventory records, received ${inventory.length}`);
  assert(slice7Anchors.bodies.length === 1008, `Expected 1008 Slice 7 anchors, received ${slice7Anchors.bodies.length}`);
  assert(slice8Anchors.bodies.length === 9000, `Expected 9000 Slice 8 anchors, received ${slice8Anchors.bodies.length}`);

  const asteroidRecords = {};

  for (const [bodyId, slice7Record] of Object.entries(slice7Asteroids)) {
    asteroidRecords[bodyId] = buildSlice8RecordFromSlice7(slice7Record);
  }

  for (const inventoryRecord of inventory) {
    const bodyId = toBodyId(inventoryRecord.designation);
    if (asteroidRecords[bodyId]) {
      continue;
    }

    const anchorRecord = slice8AnchorMap.get(inventoryRecord.designation);
    assert(anchorRecord, `Missing Slice 8 anchor for designation ${inventoryRecord.designation}`);
    asteroidRecords[bodyId] = buildSlice8RecordFromInventoryAndAnchor(inventoryRecord, anchorRecord);
  }

  assert(Object.keys(asteroidRecords).length === 10008, `Expected 10008 asteroid records, received ${Object.keys(asteroidRecords).length}`);

  const orderedEntries = Object.entries(asteroidRecords)
    .sort(([, left], [, right]) => sortByDesignation(left, right));
  const orderedRecords = orderedEntries.map(([, record]) => record);
  const distribution = summarizeDistribution(orderedRecords);

  const document = {
    selectionSource: 'JPL SBDB',
    anchorSource: 'NASA/JPL Horizons API',
    frame: 'ICRF/J2000 runtime target',
    timeScale: 'TDB',
    units: {
      anchorPosition: 'km',
      anchorVelocity: 'km/s',
      anchorTime: 'TDB Julian Date',
      semiMajorAxis: 'km',
      estimatedRadius: 'm',
      angles: 'radians',
    },
    propagation: {
      method: 'keplerian-two-body',
      anchorEpochTdbJd: ANCHOR_EPOCH_TDB_JD,
    },
    catalog: {
      totalBodies: 10008,
      mainBeltCount: 10000,
      curatedNeaCount: 8,
      mainBeltCutoffH: inventory[9999].H,
      orbitLineThresholdH: ASTEROID_ORBIT_LINE_THRESHOLD_H,
    },
    asteroids: Object.fromEntries(orderedEntries),
  };

  for (const designation of ['4', '101955', '99942', '280', '12280']) {
    const bodyId = toBodyId(designation);
    assert(document.asteroids[bodyId], `Missing required validation body ${bodyId}`);
  }

  for (const designation of ['4', '1', '2', '3', '15', '101955', '99942', '433']) {
    const bodyId = toBodyId(designation);
    assert(document.asteroids[bodyId], `Slice 7 subset missing ${bodyId}`);
  }

  for (const record of Object.values(document.asteroids)) {
    assert(record.elementsFrame === FRAME_HELIO_J2000_ECLIPTIC, `Unexpected elementsFrame for ${record.designation}`);
    assert(Number.isFinite(record.anchor.positionKm[0]), `Non-finite anchor position for ${record.designation}`);
    assert(Number.isFinite(record.anchor.velocityKmPerS[0]), `Non-finite anchor velocity for ${record.designation}`);
    assert(magnitude3(record.anchor.positionKm) > 0, `Zero position magnitude for ${record.designation}`);
    assert(magnitude3(record.anchor.velocityKmPerS) > 0, `Zero velocity magnitude for ${record.designation}`);
    assert(record.anchor.epochTdbJd === ANCHOR_EPOCH_TDB_JD, `Unexpected anchor epoch for ${record.designation}`);
  }

  await writeJson(OUTPUT_PATH, document);

  console.log(JSON.stringify({
    outputPath: path.relative(repoRoot, OUTPUT_PATH),
    totalBodies: document.catalog.totalBodies,
    curatedNeaCount: distribution.curatedNeas,
    bandDistribution: distribution.bands,
    orbitLineCount: distribution.orbitLines,
    fileSizeBytes: (await fs.stat(OUTPUT_PATH)).size,
  }, null, 2));
};

await main();
