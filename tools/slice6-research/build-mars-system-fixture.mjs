import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const INPUTS = [
  {
    key: 'mars',
    targetId: '499',
    center: '500@10',
    origin: 'heliocentric',
    inputPath: path.join(__dirname, 'data', 'mars-1d.json'),
  },
  {
    key: 'phobos',
    targetId: '401',
    center: '500@499',
    origin: 'mars-centered',
    inputPath: path.join(__dirname, 'data', 'phobos-30m.json'),
  },
  {
    key: 'deimos',
    targetId: '402',
    center: '500@499',
    origin: 'mars-centered',
    inputPath: path.join(__dirname, 'data', 'deimos-1h.json'),
  },
];

const outPath =
  process.argv[2] ??
  path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-mars-system-90d.json');

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

fs.writeFileSync(outPath, `${JSON.stringify(fixture, null, 2)}\n`);

console.log(`Wrote ${outPath}`);
