import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const INPUTS = [
  {
    key: 'saturn',
    targetId: '699',
    center: '@sun',
    origin: 'heliocentric',
    inputPath: path.join(__dirname, 'data', 'daily-saturn.json'),
  },
  {
    key: 'titan',
    targetId: '606',
    center: '500@699',
    origin: 'saturn-centered',
    inputPath: path.join(__dirname, 'data', '12h-titan.json'),
  },
  {
    key: 'rhea',
    targetId: '605',
    center: '500@699',
    origin: 'saturn-centered',
    inputPath: path.join(__dirname, 'data', '3h-rhea.json'),
  },
  {
    key: 'iapetus',
    targetId: '608',
    center: '500@699',
    origin: 'saturn-centered',
    inputPath: path.join(__dirname, 'data', 'daily-iapetus.json'),
  },
  {
    key: 'tethys',
    targetId: '603',
    center: '500@699',
    origin: 'saturn-centered',
    inputPath: path.join(__dirname, 'data', '1h-tethys.json'),
  },
  {
    key: 'dione',
    targetId: '604',
    center: '500@699',
    origin: 'saturn-centered',
    inputPath: path.join(__dirname, 'data', '3h-dione.json'),
  },
  {
    key: 'mimas',
    targetId: '601',
    center: '500@699',
    origin: 'saturn-centered',
    inputPath: path.join(__dirname, 'data', '1h-mimas.json'),
  },
  {
    key: 'enceladus',
    targetId: '602',
    center: '500@699',
    origin: 'saturn-centered',
    inputPath: path.join(__dirname, 'data', '1h-enceladus.json'),
  },
];

const outputPath = path.join(
  repoRoot,
  'tests',
  'fixtures',
  'v2',
  'horizons-saturn-system-90d.json',
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
    }),
  ),
};

fs.writeFileSync(outputPath, `${JSON.stringify(fixture, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
