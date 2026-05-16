import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const DEFAULT_INPUT_PATH = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'star-catalog-tycho2-mag75.bin');

const HEADER_MAGIC = 'TYC2BIN0';
const HEADER_SIZE_BYTES = 16;
const RECORD_SIZE_BYTES = 28;

function parseStringFlag(name, fallback) {
  const arg = process.argv.find((entry) => entry.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3) : fallback;
}

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

function parseBinaryCatalog(buffer) {
  const magic = buffer.subarray(0, 8).toString('ascii');
  const version = buffer.readUInt32LE(8);
  const count = buffer.readUInt32LE(12);
  const expectedSize = HEADER_SIZE_BYTES + count * RECORD_SIZE_BYTES;

  if (buffer.byteLength !== expectedSize) {
    throw new Error(`Binary size mismatch: expected ${expectedSize}, found ${buffer.byteLength}`);
  }

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

  return { magic, version, count, stars };
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

async function main() {
  const inputPath = path.resolve(parseStringFlag('input', DEFAULT_INPUT_PATH));
  const buffer = await fs.readFile(inputPath);
  const catalog = parseBinaryCatalog(buffer);

  if (catalog.magic !== HEADER_MAGIC) {
    throw new Error(`Header magic mismatch: expected ${HEADER_MAGIC}, found ${catalog.magic}`);
  }

  if (catalog.count < 6_000 || catalog.count > 12_000) {
    throw new Error(`Star count ${catalog.count} is outside expected range 6000-12000`);
  }

  let nonUnitCount = 0;
  for (const star of catalog.stars) {
    const magnitude = Math.hypot(...star.position);
    if (Math.abs(magnitude - 1) > 1e-4) {
      nonUnitCount += 1;
    }
    if (star.magnitude < -2 || star.magnitude > 8) {
      throw new Error(`Magnitude out of range: ${star.magnitude}`);
    }
    if (star.color.some((component) => component < 0 || component > 1)) {
      throw new Error(`Color out of range: ${star.color.join(', ')}`);
    }
  }

  const polarisDirection = raDecDegToUnitVector(37.95456067, 89.26410897);
  const siriusDirection = raDecDegToUnitVector(101.28715533, -16.71611586);
  const polaris = findNearestStar(catalog.stars, polarisDirection);
  const sirius = findNearestStar(catalog.stars, siriusDirection);

  if (!polaris || polaris.closeness < 0.999999) {
    throw new Error('Polaris was not found within the expected angular tolerance');
  }
  if (!sirius || sirius.closeness < 0.999999) {
    throw new Error('Sirius was not found within the expected angular tolerance');
  }

  const brightest = catalog.stars[0];
  if (brightest.magnitude > -0.9) {
    throw new Error(`Brightest star magnitude ${brightest.magnitude} does not look like Sirius`);
  }
  if (sirius.star !== brightest) {
    throw new Error('Sirius is not the brightest record after preprocessing sort');
  }

  console.log(
    JSON.stringify(
      {
        magic: catalog.magic,
        version: catalog.version,
        count: catalog.count,
        nonUnitCount,
        polaris: {
          magnitude: polaris.star.magnitude,
          closeness: polaris.closeness,
          position: polaris.star.position,
        },
        sirius: {
          magnitude: sirius.star.magnitude,
          closeness: sirius.closeness,
          position: sirius.star.position,
        },
      },
      null,
      2,
    ),
  );
}

await main();
