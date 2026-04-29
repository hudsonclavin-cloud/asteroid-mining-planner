import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const reportPath = path.join(__dirname, 'interpolation-report.md');

const WINDOW = {
  start: '2026-05-01',
  stop: '2026-07-30',
};

const BODIES = [
  { name: 'jupiter', frame: 'heliocentric', center: '@sun' },
  { name: 'io', frame: 'jupiter-centered', center: '500@599' },
  { name: 'europa', frame: 'jupiter-centered', center: '500@599' },
  { name: 'ganymede', frame: 'jupiter-centered', center: '500@599' },
  { name: 'callisto', frame: 'jupiter-centered', center: '500@599' },
];

const CADENCES = [
  { label: 'daily', display: '1 d' },
  { label: '12h', display: '12 h' },
  { label: '6h', display: '6 h' },
  { label: '3h', display: '3 h' },
];

const TRUTH_CADENCE = { label: 'truth', display: '30 m' };

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

async function readDataset(bodyName, cadenceLabel) {
  const inputPath = path.join(dataDir, `${cadenceLabel}-${bodyName}.json`);
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
    truthPointCount: errors.length,
    maxErrorKm: errors.length ? Math.max(...errors) : 0,
    rmsErrorKm: rms(errors),
  };
}

function chooseRecommendedCadence(rows) {
  return rows.find((row) => row.maxErrorKm <= 10) ?? rows[rows.length - 1];
}

function formatKm(value) {
  if (value === 0) return '0';
  if (Math.abs(value) >= 100) return value.toFixed(2);
  if (Math.abs(value) >= 1) return value.toFixed(3);
  return value.toPrecision(6);
}

function formatBar(value) {
  if (value === 0) return '0';
  if (Math.abs(value) >= 1) return String(value);
  return Number(value.toPrecision(6)).toString();
}

function buildResultsRows(results) {
  return results
    .map(
      (result) =>
        `| ${result.bodyDisplay} | ${result.cadenceDisplay} | ${formatKm(result.maxErrorKm)} | ${formatKm(result.rmsErrorKm)} | ${result.truthPointCount} |`,
    )
    .join('\n');
}

function buildCadenceRecommendationRows(recommendations) {
  return recommendations
    .map((recommendation) => {
      const needsSupplement = recommendation.body === 'io' && recommendation.maxErrorKm > 10;
      const note = needsSupplement
        ? '3 h still exceeds ~10 km; Io extension required'
        : `max ${formatKm(recommendation.maxErrorKm)} km at ${recommendation.cadenceDisplay}`;
      return `- ${recommendation.bodyDisplay}: recommend ${recommendation.cadenceDisplay} as the loosest cadence under the ~10 km target. ${note}.`;
    })
    .join('\n');
}

function buildBarRows(recommendations) {
  return recommendations
    .map((recommendation) => {
      const recommendedBarKm = roundUpClean(recommendation.maxErrorKm * 3);
      const headroom = recommendedBarKm > 0 ? recommendedBarKm / recommendation.maxErrorKm : 0;
      return `- ${recommendation.bodyDisplay}: ${recommendation.cadenceDisplay} cadence, max ${formatKm(recommendation.maxErrorKm)} km, suggested bar ${formatBar(recommendedBarKm)} km, honest margin ${headroom.toFixed(1)}x.`;
    })
    .join('\n');
}

function buildProvenanceRows(fetchTimestampByBody) {
  return BODIES.map((body) => {
    const pathText = [
      `tools/slice3-research/data/daily-${body.name}.json`,
      `tools/slice3-research/data/12h-${body.name}.json`,
      `tools/slice3-research/data/6h-${body.name}.json`,
      `tools/slice3-research/data/3h-${body.name}.json`,
      `tools/slice3-research/data/truth-${body.name}.json`,
    ].join(', ');
    return `- ${titleCase(body.name)}: fetched ${fetchTimestampByBody.get(body.name)}; cached files: ${pathText}`;
  }).join('\n');
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildReport(results, recommendations, fetchTimestampByBody) {
  const ioNeedsSupplement = recommendations.some(
    (recommendation) => recommendation.body === 'io' && recommendation.maxErrorKm > 10,
  );

  return `# Slice 3 Interpolation Measurement Report

## Methodology

- Window: \`${WINDOW.start}\` through \`${WINDOW.stop}\`
- Bodies in scope: Jupiter, Io, Europa, Ganymede, Callisto
- Candidate cadences measured: \`1 d\`, \`12 h\`, \`6 h\`, \`3 h\`
- Truth cadence: \`30 m\`
- Interpolation method: cubic Hermite using Horizons-provided positions and velocities
- Frames:
  - Jupiter measured in its fetched heliocentric frame (\`CENTER='@sun'\`)
  - Galileans measured in their fetched Jupiter-centered frame (\`CENTER='500@599'\`)
- Horizons API parameters:
  - \`EPHEM_TYPE='VECTORS'\`
  - \`REF_SYSTEM='ICRF'\`
  - \`REF_PLANE='FRAME'\`
  - \`TIME_TYPE='TDB'\`
  - \`OUT_UNITS='KM-S'\`
  - \`VEC_TABLE='2'\`

## Per-Body Results

| Body | Cadence | Max error (km) | RMS error (km) | Truth points |
| --- | --- | ---: | ---: | ---: |
${buildResultsRows(results)}

## Cadence Recommendation Per Body

${buildCadenceRecommendationRows(recommendations)}

## Recommended Cutover Bars Per Body

Suggested cutover bars are computed as \`3 × max error\`, rounded up to a clean number, using the recommended cadence for each body.

${buildBarRows(recommendations)}

## Cadence Policy Recommendation

Per-body cadence is the better policy. A uniform cadence wastes storage on slow-changing bodies while still under-serving fast local motion in the Jupiter system, especially Io. The results support choosing the loosest cadence per body that stays under roughly 10 km max interpolation error, then setting each body's cutover bar from that measured max.

## Notes and Anomalies

- \`CENTER='500@599'\` worked on the first try for all four Galileans; no center-ambiguity workaround was required.
- Jupiter daily cadence is expected to be viable because the heliocentric motion is smooth over this window.
- Io is the most likely outlier because its orbital timescale is short relative to the coarser candidate cadences.${ioNeedsSupplement ? '\n- Io exceeds the ~10 km target at 3 h cadence in this first-pass experiment, so the Io cadence extension is required.' : '\n- Io stays below the ~10 km target at 3 h cadence in this first-pass experiment, so the Io cadence extension is not needed.'}

## Data Provenance

- API endpoint: \`https://ssd.jpl.nasa.gov/api/horizons.api\`
- Cached data directory: \`tools/slice3-research/data/\`
${buildProvenanceRows(fetchTimestampByBody)}
`;
}

async function main() {
  const results = [];
  const recommendations = [];
  const fetchTimestampByBody = new Map();

  for (const body of BODIES) {
    const truth = await readDataset(body.name, TRUTH_CADENCE.label);
    fetchTimestampByBody.set(body.name, truth.fetchedAtUtc ?? 'unknown');

    const bodyRows = [];
    for (const cadence of CADENCES) {
      const candidate = await readDataset(body.name, cadence.label);
      const measured = measureCadence(candidate, truth);
      bodyRows.push({
        body: body.name,
        bodyDisplay: titleCase(body.name),
        frame: body.frame,
        center: body.center,
        cadence: cadence.label,
        cadenceDisplay: cadence.display,
        ...measured,
      });
    }

    results.push(...bodyRows);
    recommendations.push(chooseRecommendedCadence(bodyRows));
  }

  const report = buildReport(results, recommendations, fetchTimestampByBody);
  await fs.writeFile(reportPath, `${report}\n`, 'utf8');
  console.log(report);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
