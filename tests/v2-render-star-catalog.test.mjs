import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const catalogPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'star-catalog-tycho2-mag75.bin');

const HEADER_MAGIC = 'TYC2BIN0';
const VERSION = 1;
const HEADER_SIZE_BYTES = 16;
const RECORD_SIZE_BYTES = 28;

function raDecDegToUnitVector(raDeg, decDeg) {
  const raRad = (raDeg * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;
  const cosDec = Math.cos(decRad);
  return [
    cosDec * Math.cos(raRad),
    cosDec * Math.sin(raRad),
    Math.sin(decRad),
  ];
}

function dot(left, right) {
  return left[0] * right[0] + left[1] * right[1] + left[2] * right[2];
}

function loadCatalog() {
  const buffer = fs.readFileSync(catalogPath);
  const magic = buffer.subarray(0, 8).toString('ascii');
  const version = buffer.readUInt32LE(8);
  const count = buffer.readUInt32LE(12);
  const stars = [];

  for (let index = 0; index < count; index += 1) {
    const offset = HEADER_SIZE_BYTES + index * RECORD_SIZE_BYTES;
    stars.push({
      position: [
        buffer.readFloatLE(offset + 0),
        buffer.readFloatLE(offset + 4),
        buffer.readFloatLE(offset + 8),
      ],
      magnitude: buffer.readFloatLE(offset + 12),
      color: [
        buffer.readFloatLE(offset + 16),
        buffer.readFloatLE(offset + 20),
        buffer.readFloatLE(offset + 24),
      ],
    });
  }

  return { buffer, magic, version, count, stars };
}

function findNearestStar(stars, expectedDirection) {
  let best = null;
  for (const star of stars) {
    const closeness = dot(star.position, expectedDirection);
    if (!best || closeness > best.closeness) {
      best = { star, closeness };
    }
  }
  return best;
}

test('catalog binary loads without error and advertises the expected header', () => {
  const catalog = loadCatalog();
  assert.equal(catalog.magic, HEADER_MAGIC);
  assert.equal(catalog.version, VERSION);
  assert.equal(catalog.buffer.byteLength, HEADER_SIZE_BYTES + catalog.count * RECORD_SIZE_BYTES);
});

test('star count is in the expected runtime range', () => {
  const catalog = loadCatalog();
  assert.ok(catalog.count >= 6_000 && catalog.count <= 12_000, `unexpected star count ${catalog.count}`);
});

test('Sirius is the brightest record and lands at the expected direction', () => {
  const catalog = loadCatalog();
  const siriusDirection = raDecDegToUnitVector(101.28715533, -16.71611586);
  const nearest = findNearestStar(catalog.stars, siriusDirection);
  assert.ok(nearest.closeness > 0.999999, `Sirius direction mismatch: ${nearest.closeness}`);
  assert.equal(nearest.star, catalog.stars[0], 'Sirius should sort first as the brightest star');
  assert.ok(catalog.stars[0].magnitude < -0.9, `unexpected brightest magnitude ${catalog.stars[0].magnitude}`);
});

test('Polaris is present near the north celestial pole direction', () => {
  const catalog = loadCatalog();
  const polarisDirection = raDecDegToUnitVector(37.95456067, 89.26410897);
  const nearest = findNearestStar(catalog.stars, polarisDirection);
  assert.ok(nearest.closeness > 0.999999, `Polaris direction mismatch: ${nearest.closeness}`);
  assert.ok(nearest.star.magnitude > 1.5 && nearest.star.magnitude < 2.5);
});

test('color values stay within [0, 1] for all records', () => {
  const catalog = loadCatalog();
  for (const star of catalog.stars) {
    assert.ok(star.color.every((component) => component >= 0 && component <= 1));
  }
});

test('INV-014: at least 99% of star directions are unit-length within float32 tolerance', () => {
  const catalog = loadCatalog();
  let withinTolerance = 0;
  for (const star of catalog.stars) {
    const magnitude = Math.hypot(...star.position);
    if (Math.abs(magnitude - 1) <= 1e-4) {
      withinTolerance += 1;
    }
  }
  const fraction = withinTolerance / catalog.count;
  assert.ok(fraction >= 0.99, `unit-length fraction ${fraction} below 0.99`);
});
