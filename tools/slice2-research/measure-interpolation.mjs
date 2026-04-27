import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const reportPath = path.join(__dirname, 'interpolation-report.md');

const BODIES = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];
const WINDOW = {
  start: '2026-05-01',
  stop: '2026-07-30',
};

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v, s) {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function magnitude(v) {
  return Math.hypot(v.x, v.y, v.z);
}

function interpolateLinear(p0, p1, u) {
  return add(scale(p0, 1 - u), scale(p1, u));
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

function rms(values) {
  if (!values.length) return 0;
  const sumSquares = values.reduce((sum, value) => sum + value * value, 0);
  return Math.sqrt(sumSquares / values.length);
}

function roundUpClean(value) {
  if (value <= 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const normalized = value / magnitude;
  let bucket;
  if (normalized <= 1) bucket = 1;
  else if (normalized <= 2) bucket = 2;
  else if (normalized <= 5) bucket = 5;
  else bucket = 10;
  return bucket * magnitude;
}

async function readDataset(name, cadence) {
  const inputPath = path.join(dataDir, `${cadence}-${name}.json`);
  return JSON.parse(await fs.readFile(inputPath, 'utf8'));
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

function measureBody(daily, truth) {
  const linearErrors = [];
  const hermiteErrors = [];

  for (const truthSample of truth.samples) {
    const bracket = findBracket(daily.samples, truthSample.jdTdb);
    if (!bracket) continue;

    if (truthSample.jdTdb === bracket.left.jdTdb || truthSample.jdTdb === bracket.right.jdTdb) {
      continue;
    }

    const deltaDays = bracket.right.jdTdb - bracket.left.jdTdb;
    const dtSeconds = deltaDays * 86400;
    const u = (truthSample.jdTdb - bracket.left.jdTdb) / deltaDays;

    const linearEstimate = interpolateLinear(bracket.left.positionKm, bracket.right.positionKm, u);
    const hermiteEstimate = interpolateHermite(
      bracket.left.positionKm,
      bracket.left.velocityKms,
      bracket.right.positionKm,
      bracket.right.velocityKms,
      dtSeconds,
      u,
    );

    linearErrors.push(magnitude(subtract(linearEstimate, truthSample.positionKm)));
    hermiteErrors.push(magnitude(subtract(hermiteEstimate, truthSample.positionKm)));
  }

  return {
    count: hermiteErrors.length,
    maxLinearKm: Math.max(...linearErrors),
    rmsLinearKm: rms(linearErrors),
    maxHermiteKm: Math.max(...hermiteErrors),
    rmsHermiteKm: rms(hermiteErrors),
  };
}

function formatKm(value) {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1) return value.toFixed(6);
  return value.toPrecision(6);
}

function formatBar(value) {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1) return String(value);
  return Number(value.toPrecision(6)).toString();
}

function buildReport(results) {
  const rows = results.map((result) =>
    `| ${result.body} | ${result.count} | ${formatKm(result.maxLinearKm)} | ${formatKm(result.rmsLinearKm)} | ${formatKm(result.maxHermiteKm)} | ${formatKm(result.rmsHermiteKm)} | ${formatBar(result.recommendedBarKm)} |`,
  ).join('\n');

  return `# Slice 2 Interpolation Measurement Report

## Window

- Start: \`${WINDOW.start}\`
- Stop: \`${WINDOW.stop}\`
- Daily cadence: \`1d\`
- Truth cadence: \`6h\`

## Horizons API Parameters

- \`EPHEM_TYPE='VECTORS'\`
- \`REF_SYSTEM='ICRF'\`
- \`REF_PLANE='FRAME'\`
- \`TIME_TYPE='TDB'\`
- \`OUT_UNITS='KM-S'\`
- \`VEC_TABLE='2'\`
- Centers:
  - Sun: \`@ssb\`
  - Mercury: \`@sun\`
  - Venus: \`@sun\`
  - Earth: \`@sun\`
  - Moon: \`500@399\` (explicit Earth geocenter; \`@earth\` was ambiguous in this API mode)
  - Mars: \`@sun\`

## Measured Errors

| Body | Interpolated truth points | Max linear error (km) | RMS linear error (km) | Max Hermite error (km) | RMS Hermite error (km) | Recommended cutover bar (km) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

## Recommendation

Recommended Slice 2 cutover bars are set to \`3 × max Hermite error\`, rounded up to a clean number for each body. These bars are intended for daily sample caches interpolated to intermediate timesteps using cubic Hermite interpolation with Horizons-provided velocities.
`;
}

async function main() {
  const results = [];

  for (const body of BODIES) {
    const daily = await readDataset(body, 'daily');
    const truth = await readDataset(body, 'truth');
    const measured = measureBody(daily, truth);
    const recommendedBarKm = roundUpClean(measured.maxHermiteKm * 3);
    results.push({
      body,
      ...measured,
      recommendedBarKm,
    });
  }

  const report = buildReport(results);
  await fs.writeFile(reportPath, report, 'utf8');
  console.log(report);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
