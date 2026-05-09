import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GM_SUN_M3_S2,
  J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
  propagateKeplerian,
} from './keplerian-propagate.mjs';
import {
  cartesianToElements,
  elementsRadiansKmToPropagationInput,
} from './state-to-elements.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const horizonsTruthDir = path.join(dataDir, 'horizons-truth');

const BENNU_DESIGNATION = '101955';
const BENNU_DAY90_LIMIT_KM = 100_000;

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function vectorErrorKm(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y, left.z - right.z);
}

function summarizeAsteroid(body, anchor, truthSamples) {
  const derivedElements = cartesianToElements({
    position_km: anchor.position_km,
    velocity_km_per_s: anchor.velocity_km_per_s,
    epoch_tdb_jd: anchor.epoch_tdb_jd,
  });
  const propagationInput = elementsRadiansKmToPropagationInput(derivedElements);

  let maxErrorKm = 0;
  let sumSquaredErrorKm = 0;
  let errorAt30dKm = null;
  let errorAt60dKm = null;
  let errorAt90dKm = null;
  let epochErrorKm = null;

  for (let index = 0; index < truthSamples.length; index += 1) {
    const truth = truthSamples[index];
    const propagated = propagateKeplerian(propagationInput, truth.jdTdb);
    const errorKm = vectorErrorKm(propagated.position_km, truth.positionKm);
    if (index === 0) epochErrorKm = errorKm;
    if (index === 30) errorAt30dKm = errorKm;
    if (index === 60) errorAt60dKm = errorKm;
    if (index === 90) errorAt90dKm = errorKm;

    maxErrorKm = Math.max(maxErrorKm, errorKm);
    sumSquaredErrorKm += errorKm * errorKm;
  }

  return {
    designation: body.designation,
    name: body.name,
    class: body.class,
    H: body.H,
    anchor_epoch_tdb_jd: anchor.epoch_tdb_jd,
    epoch_error_km: epochErrorKm,
    max_error_km: maxErrorKm,
    rms_error_km: Math.sqrt(sumSquaredErrorKm / truthSamples.length),
    error_at_30d_km: errorAt30dKm,
    error_at_60d_km: errorAt60dKm,
    error_at_90d_km: errorAt90dKm,
    truth_points_checked: truthSamples.length,
    derived_elements: derivedElements,
  };
}

function printComparisonTable(round2Rows, round1ByDesignation) {
  console.log(
    'Body                 Class   R1Max(km)    R2Max(km)    R1RMS(km)    R2RMS(km)    R190d(km)    R290d(km)',
  );
  console.log(
    '-------------------  ------  -----------  -----------  -----------  -----------  -----------  -----------',
  );

  for (const row of round2Rows) {
    const round1 = round1ByDesignation.get(row.designation);
    const bodyLabel = `${row.designation} ${row.name}`.slice(0, 19).padEnd(19, ' ');
    const classLabel = row.class.padEnd(6, ' ');
    const r1Max = round1.max_error_km.toFixed(1).padStart(11, ' ');
    const r2Max = row.max_error_km.toFixed(1).padStart(11, ' ');
    const r1Rms = round1.rms_error_km.toFixed(1).padStart(11, ' ');
    const r2Rms = row.rms_error_km.toFixed(1).padStart(11, ' ');
    const r1Day90 = round1.error_at_90d_km.toFixed(1).padStart(11, ' ');
    const r2Day90 = row.error_at_90d_km.toFixed(1).padStart(11, ' ');
    console.log(
      `${bodyLabel}  ${classLabel}  ${r1Max}  ${r2Max}  ${r1Rms}  ${r2Rms}  ${r1Day90}  ${r2Day90}`,
    );
  }
}

async function main() {
  const sampleBodies = await readJson(path.join(dataDir, 'sample-asteroids.json'));
  const anchorsDocument = await readJson(path.join(dataDir, 'horizons-anchors.json'));
  const round1Accuracy = await readJson(path.join(dataDir, 'keplerian-accuracy.json'));

  const anchorsByDesignation = new Map(
    anchorsDocument.bodies.map((body) => [body.designation, body]),
  );
  const round1ByDesignation = new Map(
    round1Accuracy.asteroids.map((body) => [body.designation, body]),
  );

  const round2Rows = [];
  for (const body of sampleBodies) {
    const anchor = anchorsByDesignation.get(body.designation);
    if (!anchor) {
      throw new Error(`Missing Horizons anchor for ${body.designation} ${body.name}`);
    }
    const truth = await readJson(
      path.join(horizonsTruthDir, `asteroid-${body.designation}-90d.json`),
    );
    const round1 = round1ByDesignation.get(body.designation);
    if (!round1) {
      throw new Error(`Missing round-1 accuracy row for ${body.designation} ${body.name}`);
    }
    if (truth.referenceFrameHeader !== 'ICRF') {
      throw new Error(
        `Truth frame mismatch for ${body.designation} ${body.name}: ${truth.referenceFrameHeader}`,
      );
    }

    const summary = summarizeAsteroid(body, anchor, truth.samples);
    round2Rows.push({
      ...summary,
      round1_max_error_km: round1.max_error_km,
      round1_rms_error_km: round1.rms_error_km,
      round1_error_at_90d_km: round1.error_at_90d_km,
      max_error_improvement_factor: round1.max_error_km / summary.max_error_km,
      rms_error_improvement_factor: round1.rms_error_km / summary.rms_error_km,
      error_at_90d_improvement_factor: round1.error_at_90d_km / summary.error_at_90d_km,
    });
  }

  round2Rows.sort((left, right) => right.max_error_km - left.max_error_km);
  printComparisonTable(round2Rows, round1ByDesignation);

  const bennu = round2Rows.find((row) => row.designation === BENNU_DESIGNATION);
  if (!bennu) {
    throw new Error('Bennu was not present in the round-2 measurement set');
  }
  if (bennu.error_at_90d_km > BENNU_DAY90_LIMIT_KM) {
    throw new Error(
      `Bennu day-90 error remains above ${BENNU_DAY90_LIMIT_KM} km: ${bennu.error_at_90d_km} km`,
    );
  }

  const output = {
    generatedAtUtc: new Date().toISOString(),
    anchor_epoch_tdb_jd: anchorsDocument.anchor_epoch_tdb_jd,
    validation_window_days: 90,
    validation_window_start_tdb: '2026-05-01',
    validation_window_end_tdb: '2026-07-30',
    obliquity_arcsec: J2000_ECLIPTIC_OBLIQUITY_ARCSEC,
    GM_sun_m3_s2: GM_SUN_M3_S2,
    bennu_day_90_limit_km: BENNU_DAY90_LIMIT_KM,
    asteroids: round2Rows,
  };

  const outputPath = path.join(dataDir, 'keplerian-accuracy-anchored.json');
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
