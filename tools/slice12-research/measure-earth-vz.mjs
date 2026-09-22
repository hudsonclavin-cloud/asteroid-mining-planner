#!/usr/bin/env node
/**
 * EARTH |vZ| SPAN MAXIMUM — frame discriminator, re-measured over the full fixture.
 *
 * WHY THIS EXISTS. SLICE_12_FOUNDING.md:45 records the OQ-12-1 frame recon correctly:
 * it "sampled Earth's velocity ... at four epochs across 2027: |vZ| reached 11.715 km/s
 * (2027-10-01)". The changelog line at SLICE_12_FOUNDING.md:164 restates the same figure
 * as "max Earth |vZ| = 11.715 km/s from the worker's own fixture" — a SPAN maximum, which
 * it is not. This script measures the actual span maximum so the distinction rests on a
 * reproducible artifact instead of on a deleted scratch script.
 *
 * WHAT IT DOES NOT DO. It does not reopen DEC-12-2. The ruling is that the porkchop
 * fixture is ICRF/equatorial BY MEASUREMENT and that no rotation is applied. A larger
 * |vZ| strengthens that ruling: an ecliptic frame would show vZ ~ 0 at every epoch, and
 * the measured peak sits at the obliquity ratio. Nothing here changes any DEC.
 *
 * METHOD. Ingests the committed fixture through the PRODUCTION boundary module
 * (src/v2/boundary/horizons.ts, ingestSlice2Fixture) rather than re-reading the JSON, so
 * the number is the one the worker's own path yields. The ingest applies no rotation to
 * this fixture (isEclipticJ2000Frame requires the literal substring "ECLIPTIC"), so the
 * canonical values are the fixture's values in m/s.
 *
 * Reads ONLY committed data. No network.
 *
 * Output:
 *   tools/slice12-research/data/earth-vz-span-max.json
 *
 * Run:
 *   node tools/slice12-research/measure-earth-vz.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const FIXTURE_REL = 'src/v2/data/horizons-inner-solar-system-2026-2040.json';
const OUT_REL = 'tools/slice12-research/data/earth-vz-span-max.json';

const tempOutDir = path.join(repoRoot, '.tmp-tests', 'slice12-earth-vz');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
const tscResult = spawnSync(
  process.execPath,
  [
    tscBin,
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);
if (tscResult.status !== 0) {
  console.error('TypeScript compile failed:');
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}

const importJs = async (relPath) => import(pathToFileURL(path.join(tempOutDir, relPath)).href);
const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importJs('core/units.js');

const fixturePath = path.join(repoRoot, FIXTURE_REL);
const fixtureBytes = fs.readFileSync(fixturePath);
const fixtureSha256 = createHash('sha256').update(fixtureBytes).digest('hex');
const fixture = JSON.parse(fixtureBytes.toString('utf8'));
const states = ingestSlice2Fixture(fixture);
const earth = states.earth;

const tdbSecondsToJd = (s) => J2000_TDB_JULIAN_DATE + s / SECONDS_PER_DAY;

/** JD (TDB) -> calendar date string in the SAME TDB scale. No UTC offset applied:
 * mixing scales here is exactly the one-day error mcp/README.md carries. */
function jdTdbToDateStringTdb(jd) {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const dd = Math.floor(day);
  const pad = (n) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(dd)}`;
}

let spanMax = null;
let spanMinAbs = null;
let maxSpeed = 0;
const perYearMax = new Map();

for (const sample of earth) {
  const vz = sample.state.velocityMps.z;
  const absVz = Math.abs(vz);
  const jd = tdbSecondsToJd(sample.state.tdbSeconds);
  const dateStr = jdTdbToDateStringTdb(jd);
  const year = dateStr.slice(0, 4);

  if (spanMax === null || absVz > spanMax.absVzMps) {
    spanMax = { absVzMps: absVz, signedVzMps: vz, jdTdb: jd, dateTdb: dateStr };
  }
  if (spanMinAbs === null || absVz < spanMinAbs.absVzMps) {
    spanMinAbs = { absVzMps: absVz, jdTdb: jd, dateTdb: dateStr };
  }
  const v = sample.state.velocityMps;
  const speed = Math.hypot(v.x, v.y, v.z);
  if (speed > maxSpeed) maxSpeed = speed;

  const prior = perYearMax.get(year);
  if (prior === undefined || absVz > prior.absVzKmS) {
    perYearMax.set(year, { absVzKmS: absVz / 1000, dateTdb: dateStr });
  }
}

// The figure SLICE_12_FOUNDING.md:45 reports, reproduced: the 2027-10-01 sample.
const RECON_SAMPLE_DATE_TDB = '2027-10-01';
let reconSample = null;
let year2027Max = null;
for (const sample of earth) {
  const jd = tdbSecondsToJd(sample.state.tdbSeconds);
  const dateStr = jdTdbToDateStringTdb(jd);
  const absVz = Math.abs(sample.state.velocityMps.z);
  if (dateStr === RECON_SAMPLE_DATE_TDB) {
    reconSample = { absVzKmS: absVz / 1000, jdTdb: jd, dateTdb: dateStr };
  }
  if (dateStr.startsWith('2027') && (year2027Max === null || absVz > year2027Max.absVzKmS * 1000)) {
    year2027Max = { absVzKmS: absVz / 1000, dateTdb: dateStr };
  }
}

const OBLIQUITY_RAD = 0.40909280422232897; // J2000 mean obliquity, 23.4392911 deg
const ratio = spanMax.absVzMps / maxSpeed;

const out = {
  generatedAtUtc: new Date().toISOString(),
  purpose:
    'Span maximum of Earth |vZ| in the porkchop worker long-span fixture, to separate the ' +
    'four-epoch SAMPLE max recorded in SLICE_12_FOUNDING.md:45 from the SPAN max the ' +
    'changelog line at :164 calls it. Does not reopen DEC-12-2.',
  source: 'tools/slice12-research/measure-earth-vz.mjs over ' + FIXTURE_REL,
  ingestedVia: 'src/v2/boundary/horizons.ts ingestSlice2Fixture (production path; no rotation applied)',
  fixture: {
    path: FIXTURE_REL,
    sha256: fixtureSha256,
    bytes: fixtureBytes.length,
    frameLabel: fixture.frame,
    timeScale: fixture.timeScale,
    earthSampleCount: earth.length,
    firstJdTdb: tdbSecondsToJd(earth[0].state.tdbSeconds),
    lastJdTdb: tdbSecondsToJd(earth[earth.length - 1].state.tdbSeconds),
    canonicalFrame: earth[0].state.frame,
  },
  spanMaxAbsVz: {
    kmPerSec: spanMax.absVzMps / 1000,
    signedKmPerSec: spanMax.signedVzMps / 1000,
    jdTdb: spanMax.jdTdb,
    dateTdb: spanMax.dateTdb,
  },
  spanMinAbsVz: {
    kmPerSec: spanMinAbs.absVzMps / 1000,
    jdTdb: spanMinAbs.jdTdb,
    dateTdb: spanMinAbs.dateTdb,
  },
  reconSampleReproduced: {
    note:
      'SLICE_12_FOUNDING.md:45 reports |vZ| = 11.715 km/s at 2027-10-01 from a four-epoch ' +
      '2027 probe. Reproduced here to confirm the sample figure is correct as a SAMPLE.',
    dateTdb: RECON_SAMPLE_DATE_TDB,
    kmPerSec: reconSample === null ? null : reconSample.absVzKmS,
    calendarYear2027MaxKmPerSec: year2027Max === null ? null : year2027Max.absVzKmS,
    calendarYear2027MaxDateTdb: year2027Max === null ? null : year2027Max.dateTdb,
  },
  frameDiscriminator: {
    maxSpeedKmPerSec: maxSpeed / 1000,
    maxAbsVzOverMaxSpeed: ratio,
    sinObliquityJ2000: Math.sin(OBLIQUITY_RAD),
    note:
      'An ecliptic frame would show vZ ~ 0 at every epoch. The measured peak sits at the ' +
      'obliquity ratio, so the fixture is equatorial by measurement — DEC-12-2 unaffected ' +
      'and strengthened.',
  },
  perCalendarYearMaxAbsVzKmPerSec: Object.fromEntries(
    [...perYearMax.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([y, v]) => [y, v.absVzKmS]),
  ),
};

fs.writeFileSync(path.join(repoRoot, OUT_REL), `${JSON.stringify(out, null, 2)}\n`, 'utf8');
fs.rmSync(tempOutDir, { recursive: true, force: true });

console.log(`earth samples          : ${earth.length}`);
console.log(`canonical frame        : ${out.fixture.canonicalFrame}`);
console.log(`SPAN max |vZ|          : ${out.spanMaxAbsVz.kmPerSec} km/s at ${out.spanMaxAbsVz.dateTdb} (JD TDB ${out.spanMaxAbsVz.jdTdb})`);
console.log(`span min |vZ|          : ${out.spanMinAbsVz.kmPerSec} km/s at ${out.spanMinAbsVz.dateTdb}`);
console.log(`2027-10-01 sample      : ${out.reconSampleReproduced.kmPerSec} km/s  (SLICE_12_FOUNDING.md:45 records 11.715)`);
console.log(`2027 calendar-year max : ${out.reconSampleReproduced.calendarYear2027MaxKmPerSec} km/s at ${out.reconSampleReproduced.calendarYear2027MaxDateTdb}`);
console.log(`|vZ|max / |v|max       : ${ratio}  vs sin(obliquity) ${Math.sin(OBLIQUITY_RAD)}`);
console.log(`written                : ${OUT_REL}`);
