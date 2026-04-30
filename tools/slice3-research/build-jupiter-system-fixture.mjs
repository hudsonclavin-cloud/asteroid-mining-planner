import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const INPUTS = [
  {
    key: 'jupiter',
    targetId: '599',
    center: '@sun',
    origin: 'heliocentric',
    inputPath: path.join(__dirname, 'data', 'daily-jupiter.json'),
  },
  {
    key: 'io',
    targetId: '501',
    center: '500@599',
    origin: 'jupiter-centered',
    inputPath: path.join(__dirname, 'data', '1h-io.json'),
  },
  {
    key: 'europa',
    targetId: '502',
    center: '500@599',
    origin: 'jupiter-centered',
    inputPath: path.join(__dirname, 'data', '3h-europa.json'),
  },
  {
    key: 'ganymede',
    targetId: '503',
    center: '500@599',
    origin: 'jupiter-centered',
    inputPath: path.join(__dirname, 'data', '6h-ganymede.json'),
  },
  {
    key: 'callisto',
    targetId: '504',
    center: '500@599',
    origin: 'jupiter-centered',
    inputPath: path.join(__dirname, 'data', '12h-callisto.json'),
  },
];

const outputPath = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-jupiter-system-90d.json'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toTuple(sample) {
  return [
    sample.jdTdb,
    sample.positionKm.x,
    sample.positionKm.y,
    sample.positionKm.z,
    sample.velocityKms.x,
    sample.velocityKms.y,
    sample.velocityKms.z,
  ];
}

const fixture = {
  source: 'NASA/JPL Horizons API',
  frame: 'ICRF/J2000',
  timeScale: 'TDB',
  units: {
    position: 'km',
    velocity: 'km/s',
    time: 'TDB Julian Date',
  },
  targets: Object.fromEntries(
    INPUTS.map(({ key, targetId, center, origin, inputPath }) => {
      const raw = readJson(inputPath);
      return [
        key,
        {
          targetId,
          center,
          origin,
          records: raw.samples.map(toTuple),
        },
      ];
    })
  ),
};

fs.writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
