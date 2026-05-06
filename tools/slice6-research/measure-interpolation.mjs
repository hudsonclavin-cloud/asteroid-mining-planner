import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const outputPath = path.join(dataDir, 'cadence-measurements.json');

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function magnitude(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function rms(values) {
  if (!values.length) return 0;
  const sumSquares = values.reduce((sum, value) => sum + value * value, 0);
  return Math.sqrt(sumSquares / values.length);
}

function interpolateHermite(p0, v0, p1, v1, dtSeconds, u) {
  const u2 = u * u;
  const u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1;
  const h10 = u3 - 2 * u2 + u;
  const h01 = -2 * u3 + 3 * u2;
  const h11 = u3 - u2;
  return add(
    add(scale(p0, h00), scale(v0, h10 * dtSeconds)),
    add(scale(p1, h01), scale(v1, h11 * dtSeconds)),
  );
}

async function readDataset(filename) {
  return JSON.parse(await fs.readFile(path.join(dataDir, filename), 'utf8'));
}

function findBracket(samples, jdTdb) {
  for (let i = 0; i < samples.length - 1; i += 1) {
    const left = samples[i];
    const right = samples[i + 1];
    if (left.jdTdb <= jdTdb && jdTdb <= right.jdTdb) {
      return { left, right };
    }
  }
  return null;
}

function measureCadence(candidate, truth) {
  const errors = [];

  for (const truthSample of truth.samples) {
    const bracket = findBracket(candidate.samples, truthSample.jdTdb);
    if (!bracket) continue;
    if (truthSample.jdTdb === bracket.left.jdTdb || truthSample.jdTdb === bracket.right.jdTdb) {
      continue;
    }

    const deltaDays = bracket.right.jdTdb - bracket.left.jdTdb;
    const dtSeconds = deltaDays * 86400;
    const u = (truthSample.jdTdb - bracket.left.jdTdb) / deltaDays;
    const estimate = interpolateHermite(
      bracket.left.positionKm,
      bracket.left.velocityKms,
      bracket.right.positionKm,
      bracket.right.velocityKms,
      dtSeconds,
      u,
    );

    errors.push(magnitude(subtract(estimate, truthSample.positionKm)));
  }

  return {
    max_error_km: errors.length ? Math.max(...errors) : 0,
    rms_error_km: rms(errors),
    truth_points_checked: errors.length,
  };
}

function formatMeasurement(body, fixtureCadence, measurement) {
  return [
    `${body.padEnd(7)} ${fixtureCadence.padEnd(4)}`,
    `max=${measurement.max_error_km.toFixed(6)} km`,
    `rms=${measurement.rms_error_km.toFixed(6)} km`,
    `checked=${measurement.truth_points_checked}`,
  ].join('  ');
}

async function main() {
  const phobosTruth = await readDataset('phobos-5m.json');
  const phobosCandidates = [
    { label: '15m', data: await readDataset('phobos-15m.json') },
    { label: '30m', data: await readDataset('phobos-30m.json') },
    { label: '1h', data: await readDataset('phobos-1h.json') },
  ];

  const deimosTruth = await readDataset('deimos-15m.json');
  const deimosCandidates = [
    { label: '30m', data: await readDataset('deimos-30m.json') },
    { label: '1h', data: await readDataset('deimos-1h.json') },
  ];

  const phobosMeasurements = phobosCandidates.map((candidate) => {
    const measurement = measureCadence(candidate.data, phobosTruth);
    console.log(formatMeasurement('phobos', candidate.label, measurement));
    return {
      fixture_cadence: candidate.label,
      ...measurement,
    };
  });

  const deimosMeasurements = deimosCandidates.map((candidate) => {
    const measurement = measureCadence(candidate.data, deimosTruth);
    console.log(formatMeasurement('deimos', candidate.label, measurement));
    return {
      fixture_cadence: candidate.label,
      ...measurement,
    };
  });

  const document = {
    phobos: {
      truth_cadence: '5m',
      validation_window_days: 90,
      measurements: phobosMeasurements,
    },
    deimos: {
      truth_cadence: '15m',
      validation_window_days: 90,
      measurements: deimosMeasurements,
    },
  };

  await fs.writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
