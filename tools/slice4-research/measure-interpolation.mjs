import fs from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const reportPath = path.join(__dirname, 'interpolation-report.md');

const WINDOW = {
  start: '2026-05-01',
  stop: '2026-07-30',
};

const BODIES = [
  { name: 'saturn', display: 'Saturn', frame: 'heliocentric', center: '@sun', targetId: '699' },
  { name: 'titan', display: 'Titan', frame: 'saturn-centered', center: '500@699', targetId: '606' },
  { name: 'rhea', display: 'Rhea', frame: 'saturn-centered', center: '500@699', targetId: '605' },
  { name: 'iapetus', display: 'Iapetus', frame: 'saturn-centered', center: '500@699', targetId: '608' },
  { name: 'tethys', display: 'Tethys', frame: 'saturn-centered', center: '500@699', targetId: '603' },
  { name: 'dione', display: 'Dione', frame: 'saturn-centered', center: '500@699', targetId: '604' },
  { name: 'mimas', display: 'Mimas', frame: 'saturn-centered', center: '500@699', targetId: '601' },
  { name: 'enceladus', display: 'Enceladus', frame: 'saturn-centered', center: '500@699', targetId: '602' },
];

const CADENCES = [
  { label: 'daily', display: '1 d' },
  { label: '12h', display: '12 h' },
  { label: '6h', display: '6 h' },
  { label: '3h', display: '3 h' },
];

const TRUTH_CADENCE = { label: 'truth', display: '30 m' };

const SUPPLEMENTS = {
  mimas: {
    title: 'Mimas Cadence Extension',
    truthLabel: 'truth-15m',
    truthDisplay: '15 m',
    cadences: [
      { label: 'daily', display: '1 d' },
      { label: '12h', display: '12 h' },
      { label: '6h', display: '6 h' },
      { label: '3h', display: '3 h' },
      { label: '1h', display: '1 h' },
      { label: '30m', display: '30 m' },
    ],
  },
  enceladus: {
    title: 'Enceladus Cadence Extension',
    truthLabel: 'truth-15m',
    truthDisplay: '15 m',
    cadences: [
      { label: 'daily', display: '1 d' },
      { label: '12h', display: '12 h' },
      { label: '6h', display: '6 h' },
      { label: '3h', display: '3 h' },
      { label: '1h', display: '1 h' },
      { label: '30m', display: '30 m' },
    ],
  },
  tethys: {
    title: 'Tethys Cadence Extension',
    truthLabel: 'truth-15m',
    truthDisplay: '15 m',
    cadences: [
      { label: 'daily', display: '1 d' },
      { label: '12h', display: '12 h' },
      { label: '6h', display: '6 h' },
      { label: '3h', display: '3 h' },
      { label: '1h', display: '1 h' },
      { label: '30m', display: '30 m' },
    ],
  },
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
  const magnitudeValue = 10 ** exponent;
  const normalized = value / magnitudeValue;
  let bucket;
  if (normalized <= 1) bucket = 1;
  else if (normalized <= 2) bucket = 2;
  else if (normalized <= 5) bucket = 5;
  else bucket = 10;
  return bucket * magnitudeValue;
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

function formatMegabytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
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
  return rows.find((row) => row.maxErrorKm <= 10) ?? null;
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
      if (!recommendation.recommended) {
        return `- ${recommendation.bodyDisplay}: no tested cadence clears the ~10 km target. A denser supplement or architectural escalation is required.`;
      }
      return `- ${recommendation.bodyDisplay}: recommend ${recommendation.recommended.cadenceDisplay} as the loosest cadence under the ~10 km target. Max ${formatKm(recommendation.recommended.maxErrorKm)} km at ${recommendation.recommended.cadenceDisplay}.`;
    })
    .join('\n');
}

function buildBarRows(recommendations) {
  return recommendations
    .map((recommendation) => {
      if (!recommendation.recommended) {
        return `- ${recommendation.bodyDisplay}: no cutover bar proposed yet because no tested cadence cleared the ~10 km target.`;
      }
      const recommendedBarKm = roundUpClean(recommendation.recommended.maxErrorKm * 3);
      const headroom = recommendedBarKm / recommendation.recommended.maxErrorKm;
      return `- ${recommendation.bodyDisplay}: ${recommendation.recommended.cadenceDisplay} cadence, max ${formatKm(recommendation.recommended.maxErrorKm)} km, suggested bar ${formatBar(recommendedBarKm)} km, honest margin ${headroom.toFixed(1)}x.`;
    })
    .join('\n');
}

function buildSupplementRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.cadenceDisplay} | ${formatKm(row.maxErrorKm)} | ${formatKm(row.rmsErrorKm)} | ${row.truthPointCount} |`,
    )
    .join('\n');
}

function buildProvenanceRows(fetchTimestampByBody) {
  return BODIES.map((body) => {
    const pathText = [
      `tools/slice4-research/data/daily-${body.name}.json`,
      `tools/slice4-research/data/12h-${body.name}.json`,
      `tools/slice4-research/data/6h-${body.name}.json`,
      `tools/slice4-research/data/3h-${body.name}.json`,
      `tools/slice4-research/data/truth-${body.name}.json`,
    ].join(', ');
    return `- ${body.display}: fetched ${fetchTimestampByBody.get(body.name)}; cached files: ${pathText}`;
  }).join('\n');
}

function buildFixtureProjection(recommendations, datasetsByBodyAndCadence) {
  const targets = {};
  for (const body of BODIES) {
    const recommendation = recommendations.find((entry) => entry.body === body.name);
    if (!recommendation?.recommended) {
      return null;
    }
    const raw = datasetsByBodyAndCadence.get(`${body.name}:${recommendation.recommended.cadence}`);
    targets[body.name] = {
      targetId: body.targetId,
      center: body.center,
      origin: body.frame === 'heliocentric' ? 'heliocentric' : 'saturn-centered',
      records: raw.samples.map(toTuple),
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

  const bytes = Buffer.byteLength(`${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
  return { fixture, bytes };
}

function buildCadencePolicyParagraph(recommendations, fixtureProjection, supplementRowsByBody) {
  const mimasRecommendation = recommendations.find((entry) => entry.body === 'mimas')?.recommended;
  const enceladusRecommendation = recommendations.find((entry) => entry.body === 'enceladus')?.recommended;
  const mimasNote = mimasRecommendation
    ? `Mimas is the cadence driver at ${mimasRecommendation.cadenceDisplay}.`
    : 'Mimas did not clear the ~10 km target in the measured cadence set.';
  const enceladusNote = enceladusRecommendation
    ? `Enceladus settles at ${enceladusRecommendation.cadenceDisplay}.`
    : 'Enceladus also remains above the ~10 km target in the measured cadence set.';

  const supplementNoteParts = [];
  if (supplementRowsByBody.has('mimas')) {
    supplementNoteParts.push('The Mimas supplement was required.');
  }
  if (supplementRowsByBody.has('enceladus')) {
    supplementNoteParts.push('The Enceladus supplement was required.');
  }
  const supplementNote = supplementNoteParts.length ? ` ${supplementNoteParts.join(' ')}` : '';

  if (!fixtureProjection) {
    return `Per-body cadence remains the correct architectural pattern, but the current measured set does not yet produce a complete all-body cadence recommendation because at least one body did not clear the ~10 km target.${supplementNote}`;
  }

  return `Per-body cadence is the correct Slice 4 policy. A shared cadence would waste storage on slow bodies like Saturn, Titan, and Iapetus while still under-serving fast local motion in the inner Saturn system. ${mimasNote} ${enceladusNote}${supplementNote} Projected Saturn-system fixture size, if only the recommended cadences are retained in a single tuple-based fixture envelope matching the Slice 3 builder pattern, is about ${formatMegabytes(fixtureProjection.bytes)} MiB (${fixtureProjection.bytes} bytes).`;
}

function buildNotes(results, recommendations, supplementRowsByBody) {
  const notes = [
    "- `CENTER='500@699'` worked on the first try for all seven Saturnian moons; no center-ambiguity workaround was required.",
    '- Saturn daily cadence is expected to be viable because the heliocentric motion is smooth over this 90-day window.',
  ];

  const mimas3h = results.find((row) => row.body === 'mimas' && row.cadence === '3h');
  const enceladus3h = results.find((row) => row.body === 'enceladus' && row.cadence === '3h');
  const tethys3h = results.find((row) => row.body === 'tethys' && row.cadence === '3h');
  if (mimas3h) {
    notes.push(
      mimas3h.maxErrorKm <= 10
        ? `- Mimas at 3 h unexpectedly stays under the ~10 km target (${formatKm(mimas3h.maxErrorKm)} km), so the supplement is not needed.`
        : `- Mimas at 3 h is the new cadence cliff: max error is ${formatKm(mimas3h.maxErrorKm)} km, so the supplement is required.`,
    );
  }
  if (enceladus3h) {
    notes.push(
      enceladus3h.maxErrorKm <= 10
        ? `- Enceladus at 3 h stays under the ~10 km target (${formatKm(enceladus3h.maxErrorKm)} km).`
        : `- Enceladus at 3 h exceeds the ~10 km target (${formatKm(enceladus3h.maxErrorKm)} km), so a denser supplement is required.`,
    );
  }
  if (tethys3h) {
    notes.push(
      tethys3h.maxErrorKm <= 10
        ? `- Tethys at 3 h stays under the ~10 km target (${formatKm(tethys3h.maxErrorKm)} km).`
        : `- Tethys at 3 h exceeds the ~10 km target (${formatKm(tethys3h.maxErrorKm)} km), so a denser supplement is required.`,
    );
  }

  const unresolved = recommendations.filter((entry) => !entry.recommended).map((entry) => entry.bodyDisplay);
  if (unresolved.length) {
    notes.push(`- No tested cadence clears the ~10 km target for: ${unresolved.join(', ')}.`);
  }

  if (supplementRowsByBody.has('mimas')) {
    notes.push('- The Mimas supplement is incorporated into the recommendation set below.');
  }
  if (supplementRowsByBody.has('enceladus')) {
    notes.push('- The Enceladus supplement is incorporated into the recommendation set below.');
  }

  return notes.join('\n');
}

function buildSupplementSections(supplementRowsByBody) {
  const sections = [];

  for (const [bodyName, rows] of supplementRowsByBody.entries()) {
    const supplement = SUPPLEMENTS[bodyName];
    const recommendation = chooseRecommendedCadence(rows);
    const recommendationText = recommendation
      ? `Recommendation: use ${recommendation.cadenceDisplay} for ${BODIES.find((body) => body.name === bodyName).display}. Max error is ${formatKm(recommendation.maxErrorKm)} km at ${recommendation.cadenceDisplay}.`
      : `Recommendation: no tested supplement cadence clears the ~10 km target for ${BODIES.find((body) => body.name === bodyName).display}; architectural escalation is required.`;

    sections.push(`
## ${supplement.title}

The baseline 30-minute-truth matrix left ${BODIES.find((body) => body.name === bodyName).display} above the ~10 km target at 3 h, so a denser extension was run against ${supplement.truthDisplay} truth.

| Cadence | Max error (km) | RMS error (km) | Truth points |
| --- | ---: | ---: | ---: |
${buildSupplementRows(rows)}

${recommendationText}
`);
  }

  return sections.join('\n');
}

function buildReport(results, recommendations, fetchTimestampByBody, datasetsByBodyAndCadence, supplementRowsByBody) {
  const fixtureProjection = buildFixtureProjection(recommendations, datasetsByBodyAndCadence);

  return `# Slice 4 Interpolation Measurement Report

## Methodology

- Window: \`${WINDOW.start}\` through \`${WINDOW.stop}\`
- Bodies in scope: Saturn, Titan, Rhea, Iapetus, Tethys, Dione, Mimas, Enceladus
- Candidate cadences measured: \`1 d\`, \`12 h\`, \`6 h\`, \`3 h\`
- Truth cadence: \`30 m\` for the baseline matrix; \`15 m\` for any conditional supplements
- Interpolation method: cubic Hermite using Horizons-provided positions and velocities
- Frames:
  - Saturn measured in its fetched heliocentric frame (\`CENTER='@sun'\`)
  - All seven moons measured in their fetched Saturn-centered frame (\`CENTER='500@699'\`)
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

${buildCadencePolicyParagraph(recommendations, fixtureProjection, supplementRowsByBody)}

## Notes and Anomalies

${buildNotes(results, recommendations, supplementRowsByBody)}

## Data Provenance

- API endpoint: \`https://ssd.jpl.nasa.gov/api/horizons.api\`
- Cached data directory: \`tools/slice4-research/data/\`
${buildProvenanceRows(fetchTimestampByBody)}
${buildSupplementSections(supplementRowsByBody)}
`;
}

async function loadSupplementRows(bodyName) {
  const supplement = SUPPLEMENTS[bodyName];
  const truthPath = path.join(dataDir, `${supplement.truthLabel}-${bodyName}.json`);
  if (!(await fileExists(truthPath))) {
    return null;
  }

  for (const cadence of supplement.cadences) {
    const candidatePath = path.join(dataDir, `${cadence.label}-${bodyName}.json`);
    if (!(await fileExists(candidatePath))) {
      throw new Error(
        `Partial ${bodyName} supplement detected: missing ${path.relative(process.cwd(), candidatePath)}`,
      );
    }
  }

  const truth = await readDataset(bodyName, supplement.truthLabel);
  const rows = [];
  for (const cadence of supplement.cadences) {
    const candidate = await readDataset(bodyName, cadence.label);
    const measured = measureCadence(candidate, truth);
    rows.push({
      body: bodyName,
      bodyDisplay: BODIES.find((body) => body.name === bodyName).display,
      cadence: cadence.label,
      cadenceDisplay: cadence.display,
      ...measured,
    });
  }
  return rows;
}

async function main() {
  const results = [];
  const recommendations = [];
  const fetchTimestampByBody = new Map();
  const datasetsByBodyAndCadence = new Map();
  const supplementRowsByBody = new Map();

  for (const body of BODIES) {
    const truth = await readDataset(body.name, TRUTH_CADENCE.label);
    fetchTimestampByBody.set(body.name, truth.fetchedAtUtc ?? 'unknown');

    const bodyRows = [];
    for (const cadence of CADENCES) {
      const candidate = await readDataset(body.name, cadence.label);
      datasetsByBodyAndCadence.set(`${body.name}:${cadence.label}`, candidate);
      const measured = measureCadence(candidate, truth);
      bodyRows.push({
        body: body.name,
        bodyDisplay: body.display,
        frame: body.frame,
        center: body.center,
        cadence: cadence.label,
        cadenceDisplay: cadence.display,
        ...measured,
      });
    }

    results.push(...bodyRows);
    recommendations.push({
      body: body.name,
      bodyDisplay: body.display,
      recommended: chooseRecommendedCadence(bodyRows),
    });
  }

  for (const bodyName of Object.keys(SUPPLEMENTS)) {
    const rows = await loadSupplementRows(bodyName);
    if (!rows) continue;
    supplementRowsByBody.set(bodyName, rows);
    const recommendation = recommendations.find((entry) => entry.body === bodyName);
    if (recommendation) {
      recommendation.recommended = chooseRecommendedCadence(rows);
    }
  }

  const report = buildReport(
    results,
    recommendations,
    fetchTimestampByBody,
    datasetsByBodyAndCadence,
    supplementRowsByBody,
  );
  await fs.writeFile(reportPath, `${report}\n`, 'utf8');
  console.log(report);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
