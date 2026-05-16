import fs from 'node:fs/promises';
import path from 'node:path';

import {
  AU_KM,
  CAD_API_URL,
  SBDB_QUERY_URL,
  VALIDATION_START,
  VALIDATION_STOP,
  buildUrl,
  fetchJson,
  parseNumber,
  rowToObject,
  toSortedObject,
  writeJsonAtomic,
} from '../slice9-research/common.mjs';
import { propagateKeplerian } from '../slice9-research/keplerian-offline.mjs';

const INGESTION_ROOT = path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(INGESTION_ROOT, 'data');
const FIXTURE_PATH = path.resolve(INGESTION_ROOT, '..', '..', 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const SUMMARY_PATH = path.join(DATA_DIR, 'build-summary.json');
const RAW_SBDB_PATH = path.join(DATA_DIR, 'sbdb-nea-raw.json');
const RAW_CAD_PATH = path.join(DATA_DIR, 'cad-window-raw.json');

const CAD_DIST_MAX_AU = '0.05';
const CAD_BODIES = ['Earth', 'Venus'];
const QUALITY_RANK_FORMULA =
  'qualityRank = clamp01(0.6 * (condition_code == null ? 0 : 1 - condition_code / 9) + 0.4 * (data_arc_days == null ? 0 : log10(1 + data_arc_days) / log10(1001)))';

const SBDB_FIELDS = [
  'spkid',
  'pdes',
  'full_name',
  'class',
  'e',
  'a',
  'i',
  'om',
  'w',
  'ma',
  'epoch',
  'condition_code',
  'data_arc',
  'n_obs_used',
  'H',
  'sigma_a',
  'sigma_e',
  'pha',
].join(',');

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function round6(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function normalizeSbdbClass(value) {
  const code = String(value ?? '').trim().toUpperCase();
  return code || 'missing';
}

function eccentricityBandForBody(eccentricity) {
  if (eccentricity < 0.1) return 'A';
  if (eccentricity < 0.2) return 'B';
  if (eccentricity < 0.3) return 'C';
  return 'D';
}

function deriveAsteroidDiameterKmFromAbsoluteMagnitude(absoluteMagnitude, albedo = 0.14) {
  return (1329 / Math.sqrt(albedo)) * 10 ** (-absoluteMagnitude / 5);
}

function deriveAsteroidRadiusMFromAbsoluteMagnitude(absoluteMagnitude, albedo = 0.14) {
  return deriveAsteroidDiameterKmFromAbsoluteMagnitude(absoluteMagnitude, albedo) * 500;
}

function parsePhaFlag(value) {
  const code = String(value ?? '').trim().toUpperCase();
  return code === 'Y' || code === 'T' || code === 'TRUE';
}

function qualityRankForRow(row) {
  const conditionScore =
    row.conditionCode === null ? 0 : clamp01(1 - row.conditionCode / 9);
  const dataArcScore =
    row.dataArcDays === null
      ? 0
      : clamp01(Math.log10(1 + row.dataArcDays) / Math.log10(1001));
  return round6(0.6 * conditionScore + 0.4 * dataArcScore);
}

function normalizeSbdbRowsWithPha(payload) {
  const fields = payload.fields ?? [];
  const rows = payload.data ?? [];
  return rows.map((row) => {
    const entry = rowToObject(fields, row);
    return {
      designation: String(entry.pdes ?? '').trim(),
      spkid: String(entry.spkid ?? '').trim(),
      fullName: String(entry.full_name ?? '').trim(),
      orbitClass: normalizeSbdbClass(entry.class),
      aAu: parseNumber(entry.a),
      e: parseNumber(entry.e),
      iDeg: parseNumber(entry.i),
      omDeg: parseNumber(entry.om),
      wDeg: parseNumber(entry.w),
      maDeg: parseNumber(entry.ma),
      epochTdbJd: parseNumber(entry.epoch),
      conditionCode: parseNumber(entry.condition_code),
      dataArcDays: parseNumber(entry.data_arc),
      nObsUsed: parseNumber(entry.n_obs_used),
      hAbsMag: parseNumber(entry.H),
      sigmaA: parseNumber(entry.sigma_a),
      sigmaE: parseNumber(entry.sigma_e),
      pha: parsePhaFlag(entry.pha),
    };
  });
}

async function fetchCadWindowByBody(body) {
  const url = buildUrl(CAD_API_URL, {
    body,
    'date-min': VALIDATION_START,
    'date-max': VALIDATION_STOP,
    'dist-max': CAD_DIST_MAX_AU,
    sort: 'date',
  });
  return fetchJson(url);
}

async function fetchCadWindowFlags() {
  const payloads = {};
  const flaggedByDesignation = new Map();

  for (const body of CAD_BODIES) {
    const payload = await fetchCadWindowByBody(body);
    payloads[body] = payload;
    const rows = Array.isArray(payload.data) ? payload.data : [];
    for (const row of rows) {
      const designation = String(row[0] ?? '').trim();
      if (!designation) continue;
      const current = flaggedByDesignation.get(designation) ?? [];
      if (!current.includes(body)) {
        current.push(body);
      }
      flaggedByDesignation.set(designation, current);
    }
  }

  return {
    window: {
      start: VALIDATION_START,
      stop: VALIDATION_STOP,
      distMaxAu: CAD_DIST_MAX_AU,
      bodies: CAD_BODIES,
    },
    payloads,
    flaggedByDesignation,
  };
}

function buildAnchorFromElements(row) {
  const propagated = propagateKeplerian(
    {
      a: row.aAu,
      e: row.e,
      i: row.iDeg,
      om: row.omDeg,
      w: row.wDeg,
      ma: row.maDeg,
      epoch_tdb: row.epochTdbJd,
    },
    row.epochTdbJd,
  );

  return {
    epochTdbJd: row.epochTdbJd,
    positionKm: [
      propagated.position_km.x,
      propagated.position_km.y,
      propagated.position_km.z,
    ],
    velocityKmPerS: [
      propagated.velocity_km_per_s.x,
      propagated.velocity_km_per_s.y,
      propagated.velocity_km_per_s.z,
    ],
  };
}

function toBodyId(designation) {
  return `asteroid-${designation}`;
}

function buildFixture(rows, cadWindow) {
  const asteroids = {};
  const classDistribution = new Map();
  const inv014TierDistribution = new Map([
    ['visualization-tier', 0],
    ['planning-tier', 0],
    ['not-kepler-safe', 0],
  ]);
  let missingAbsoluteMagnitudeCount = 0;
  let anomalyTailCount = 0;

  for (const row of rows) {
    const flaggedBodies = cadWindow.flaggedByDesignation.get(row.designation) ?? [];
    const inv014Tier = flaggedBodies.length > 0 ? 'not-kepler-safe' : 'visualization-tier';
    const estimatedRadiusM =
      row.hAbsMag === null ? null : deriveAsteroidRadiusMFromAbsoluteMagnitude(row.hAbsMag);
    if (row.hAbsMag === null) {
      missingAbsoluteMagnitudeCount += 1;
    }
    if (!['AMO', 'APO', 'ATE', 'IEO'].includes(row.orbitClass)) {
      anomalyTailCount += 1;
    }

    classDistribution.set(row.orbitClass, (classDistribution.get(row.orbitClass) ?? 0) + 1);
    inv014TierDistribution.set(
      inv014Tier,
      (inv014TierDistribution.get(inv014Tier) ?? 0) + 1,
    );

    asteroids[toBodyId(row.designation)] = {
      designation: row.designation,
      spkId: Number(row.spkid),
      name: row.fullName || null,
      class: row.orbitClass,
      orbitClass: row.orbitClass,
      isCuratedNea: false,
      neo: true,
      pha: row.pha,
      H: row.hAbsMag,
      G: null,
      estimatedRadiusM,
      anchor: buildAnchorFromElements(row),
      elements: {
        aKm: row.aAu * AU_KM,
        e: row.e,
        iRad: degreesToRadians(row.iDeg),
        omRad: degreesToRadians(row.omDeg),
        wRad: degreesToRadians(row.wDeg),
        maRad: degreesToRadians(row.maDeg),
        epochTdbJd: row.epochTdbJd,
      },
      elementsFrame: 'FRAME_HELIO_J2000_ECLIPTIC',
      eccentricityBand: eccentricityBandForBody(row.e),
      conditionCode: row.conditionCode,
      dataArcDays: row.dataArcDays,
      nObsUsed: row.nObsUsed,
      sigmaA: row.sigmaA,
      sigmaE: row.sigmaE,
      inv014Tier,
      qualityRank: qualityRankForRow(row),
    };
  }

  return {
    selectionSource: 'JPL SBDB Query API (sb-group=neo)',
    anchorSource: 'SBDB osculating elements propagated at element epoch',
    frame: 'ICRF/J2000',
    timeScale: 'TDB',
    units: {
      anchorPosition: 'km',
      anchorVelocity: 'km/s',
      anchorTime: 'TDB JD',
      semiMajorAxis: 'km',
      estimatedRadius: 'm',
      angles: 'rad',
      dataArc: 'days',
      sigmaA: 'au',
      sigmaE: 'unitless',
    },
    propagation: {
      method: 'keplerian-two-body',
      epochPolicy: 'per-body-sbdb-osculating-elements',
    },
    closeApproachWindow: cadWindow.window,
    catalog: {
      totalBodies: rows.length,
      includedClasses: Object.keys(toSortedObject(classDistribution)),
      classDistribution: toSortedObject(classDistribution),
      inv014TierDistribution: {
        'visualization-tier': inv014TierDistribution.get('visualization-tier') ?? 0,
        'planning-tier': 0,
        'not-kepler-safe': inv014TierDistribution.get('not-kepler-safe') ?? 0,
      },
      missingAbsoluteMagnitudeCount,
      anomalyTailCount,
      qualityRankFormula: QUALITY_RANK_FORMULA,
    },
    asteroids,
  };
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const sbdbUrl = buildUrl(SBDB_QUERY_URL, {
    fields: SBDB_FIELDS,
    'sb-group': 'neo',
    'full-prec': 'true',
  });
  const payload = await fetchJson(sbdbUrl);
  if (!Array.isArray(payload.data) || !Array.isArray(payload.fields)) {
    throw new Error('Unexpected SBDB payload shape for Slice 9 ingestion');
  }

  const rows = normalizeSbdbRowsWithPha(payload);
  const cadWindow = await fetchCadWindowFlags();
  const fixture = buildFixture(rows, cadWindow);

  await writeJsonAtomic(RAW_SBDB_PATH, payload);
  await writeJsonAtomic(RAW_CAD_PATH, {
    generatedAtUtc: new Date().toISOString(),
    ...cadWindow.window,
    payloads: cadWindow.payloads,
  });
  await writeJsonAtomic(FIXTURE_PATH, fixture);
  await writeJsonAtomic(SUMMARY_PATH, {
    generatedAtUtc: new Date().toISOString(),
    sbdbQueryUrl: SBDB_QUERY_URL,
    cadApiUrl: CAD_API_URL,
    totalBodies: fixture.catalog.totalBodies,
    classDistribution: fixture.catalog.classDistribution,
    inv014TierDistribution: fixture.catalog.inv014TierDistribution,
    missingAbsoluteMagnitudeCount: fixture.catalog.missingAbsoluteMagnitudeCount,
    anomalyTailCount: fixture.catalog.anomalyTailCount,
    closeApproachWindow: fixture.closeApproachWindow,
  });

  console.log(`wrote ${FIXTURE_PATH}`);
  console.log(`liveCount=${fixture.catalog.totalBodies}`);
  console.log(`classDistribution=${JSON.stringify(fixture.catalog.classDistribution)}`);
  console.log(`inv014TierDistribution=${JSON.stringify(fixture.catalog.inv014TierDistribution)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
