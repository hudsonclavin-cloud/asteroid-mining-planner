import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const dataDir = path.join(__dirname, 'data');
const outPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'horizons-inner-system-90d.json');

const BODY_META = {
  sun:     { targetId: '10',  center: '@ssb',    origin: 'ssb' },
  mercury: { targetId: '199', center: '@sun',    origin: 'heliocentric' },
  venus:   { targetId: '299', center: '@sun',    origin: 'heliocentric' },
  earth:   { targetId: '399', center: '@sun',    origin: 'heliocentric' },
  moon:    { targetId: '301', center: '500@399', origin: 'geocentric' },
  mars:    { targetId: '499', center: '@sun',    origin: 'heliocentric' },
};

const bodies = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];

const targets = {};

for (const body of bodies) {
  const filePath = path.join(dataDir, `daily-${body}.json`);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const samples = raw.samples ?? raw.records;

  if (!Array.isArray(samples) || samples.length === 0) {
    throw new Error(`daily-${body}.json has no samples`);
  }

  const records = samples.map((s) => {
    const jdTdb = s.jdTdb;
    const { x, y, z } = s.positionKm;
    const { x: vx, y: vy, z: vz } = s.velocityKms;
    return [jdTdb, x, y, z, vx, vy, vz];
  });

  const meta = BODY_META[body];
  targets[body] = {
    targetId: meta.targetId,
    center: meta.center,
    origin: meta.origin,
    records,
  };
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
  targets,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(fixture, null, 2), 'utf8');
console.log(`Written: ${outPath}`);
for (const body of bodies) {
  console.log(`  ${body}: ${targets[body].records.length} records`);
}
