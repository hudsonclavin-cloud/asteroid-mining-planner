#!/usr/bin/env node
/**
 * Slice 21 pre-research — ephemeris coverage boundary (measurement, not a feature).
 *
 * Imports the PRODUCTION loader (ingestSlice2Fixture, src/v2/boundary/horizons.ts) and the
 * production grid-span constants. The page's private TDB/UTC date helpers and the worker's
 * private linspace are copied here because they are not exported; each copy's comment names
 * its original so the two can be diffed by eye. Reports, per body, the series
 * start/end (JD TDB and calendar date), the body count, bytes on disk and in the committed
 * blob, and — for the porkchop grid — the first departure column whose arrival epoch falls
 * past coverage. The grid is body-independent (GRID_PARAMS in src/v2/app/porkchop/main.ts),
 * so the column is the same for 433, 99942 and 101955; the script reports each explicitly.
 *
 * Writes tools/slice21-research/data/ephemeris-coverage.json (a TRACKED file; a re-run changes
 * only generatedAtUtc and headCommit when the fixture is unchanged) by side-file + atomic rename,
 * or the path given with `--out <path>`. Compiles into .tmp-tests/ (gitignored). Run from the repo root:
 *   node tools/slice21-research/ephemeris-coverage/measure.mjs [--out <path>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..');
const FIXTURE_REL = 'src/v2/data/horizons-inner-solar-system-2026-2040.json';
const MAIN_REL = 'src/v2/app/porkchop/main.ts';
const OUT_REL = 'tools/slice21-research/data/ephemeris-coverage.json';
const BODIES = ['433', '99942', '101955'];

const tempOutDir = path.join(repoRoot, '.tmp-tests', 'slice21-ephemeris-coverage');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tsc = spawnSync(
  process.execPath,
  [
    path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
    path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
    path.join(repoRoot, 'src', 'v2', 'porkchop', 'grid-span.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);
if (tsc.status !== 0) {
  console.error('TypeScript compile failed:');
  console.error(tsc.stderr || tsc.stdout);
  process.exit(1);
}
const importJs = (rel) => import(pathToFileURL(path.join(tempOutDir, rel)).href);
const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importJs('core/units.js');
const { PORKCHOP_DEPARTURE_START_UTC, PORKCHOP_DEPARTURE_END_UTC } = await importJs('porkchop/grid-span.js');

// GRID_PARAMS lives in the porkchop PAGE module, which boots a DOM on import; read its literal
// numbers from source instead of importing it, and record that this was a source read.
const mainSource = fs.readFileSync(path.join(repoRoot, MAIN_REL), 'utf8');
// The literal ends `} as const;` in main.ts; match that terminator exactly and refuse a block that
// carries keys other than the six GRID_PARAMS fields (a lazy `};` match would run on past it).
const gridBlock = mainSource.match(/export const GRID_PARAMS = \{([\s\S]*?)\}\s*(?:as const)?;/);
if (!gridBlock) throw new Error(`GRID_PARAMS not found in ${MAIN_REL}`);
const gridKeys = [...gridBlock[1].matchAll(/^\s*([A-Za-z_]\w*)\s*:/gm)].map((k) => k[1]).sort();
const expectedGridKeys = ['nDep', 'nTof', 'tofMaxDays', 'tofMinDays', 'depStartJD', 'depEndJD'].sort();
if (JSON.stringify(gridKeys) !== JSON.stringify(expectedGridKeys)) {
  throw new Error(`GRID_PARAMS block has unexpected keys: ${gridKeys.join(', ')} (expected ${expectedGridKeys.join(', ')})`);
}
const gridNumber = (key) => {
  const m = gridBlock[1].match(new RegExp(`${key}:\\s*([0-9.]+)`));
  if (!m) throw new Error(`GRID_PARAMS.${key} not found`);
  return Number(m[1]);
};
const grid = {
  departureStartUtc: PORKCHOP_DEPARTURE_START_UTC,
  departureEndUtc: PORKCHOP_DEPARTURE_END_UTC,
  tofMinDays: gridNumber('tofMinDays'),
  tofMaxDays: gridNumber('tofMaxDays'),
  nDep: gridNumber('nDep'),
  nTof: gridNumber('nTof'),
  readFrom: `${MAIN_REL} (GRID_PARAMS literal, read from source) + src/v2/porkchop/grid-span.ts (imported)`,
};

// Same conventions as the page: UTC midnight -> JD TDB with TDB-UTC = 69.184 s; JD TDB -> calendar date.
// COPIES of the non-exported originals `utcMidnightToJdTdb` and `jdTdbToUtcDateString` in
// src/v2/app/porkchop/main.ts; keep them byte-equivalent in behaviour.
const UNIX_TO_J2000_SECONDS = 946_728_000;
const TDB_MINUS_UTC_SECONDS = 69.184;
const utcMidnightToJdTdb = (utcDate) =>
  J2000_TDB_JULIAN_DATE + (Date.parse(`${utcDate}T00:00:00Z`) / 1000 - UNIX_TO_J2000_SECONDS + TDB_MINUS_UTC_SECONDS) / SECONDS_PER_DAY;
const jdTdbToUtcDate = (jd) =>
  new Date(((jd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY - TDB_MINUS_UTC_SECONDS + UNIX_TO_J2000_SECONDS) * 1000).toISOString().slice(0, 10);
const tdbSecondsToJd = (s) => J2000_TDB_JULIAN_DATE + s / SECONDS_PER_DAY;
// Calendar date of the TDB instant itself (no TDB-UTC shift): JD .5 is TDB midnight of that date.
const jdTdbToTdbDate = (jd) => new Date((jd - 2_440_587.5) * SECONDS_PER_DAY * 1000).toISOString().slice(0, 10);

const fixturePath = path.join(repoRoot, FIXTURE_REL);
const fixtureBytes = fs.readFileSync(fixturePath);
const onDiskBytes = fixtureBytes.length;
const onDiskSha256 = createHash('sha256').update(fixtureBytes).digest('hex');
const blobSize = spawnSync('git', ['cat-file', '-s', `HEAD:${FIXTURE_REL}`], { cwd: repoRoot, encoding: 'utf8' });
const committedBlobBytes = blobSize.status === 0 ? Number(blobSize.stdout.trim()) : null;

const fixture = JSON.parse(fixtureBytes.toString('utf8'));
const series = ingestSlice2Fixture(fixture);
const bodies = Object.keys(series);
const perBody = {};
for (const key of bodies) {
  const samples = series[key];
  const first = samples[0].state.tdbSeconds;
  const last = samples[samples.length - 1].state.tdbSeconds;
  perBody[key] = {
    samples: samples.length,
    firstJdTdb: tdbSecondsToJd(first),
    lastJdTdb: tdbSecondsToJd(last),
    firstDateTdb: jdTdbToTdbDate(tdbSecondsToJd(first)),
    lastDateTdb: jdTdbToTdbDate(tdbSecondsToJd(last)),
    firstDateUtcPageConvention: jdTdbToUtcDate(tdbSecondsToJd(first)),
    lastDateUtcPageConvention: jdTdbToUtcDate(tdbSecondsToJd(last)),
    cadenceDays: samples.length > 1 ? (last - first) / SECONDS_PER_DAY / (samples.length - 1) : null,
  };
}
const earth = perBody.earth;
if (!earth) throw new Error('fixture has no earth series');
const coverageEndJd = earth.lastJdTdb;
const coverageStartJd = earth.firstJdTdb;

// Porkchop grid columns (body-independent).
const depStartJd = utcMidnightToJdTdb(grid.departureStartUtc);
const depEndJd = utcMidnightToJdTdb(grid.departureEndUtc);
const depStep = (depEndJd - depStartJd) / (grid.nDep - 1);
const columnJd = (i) => depStartJd + i * depStep;
const firstColumnWhere = (predicate) => {
  for (let i = 0; i < grid.nDep; i += 1) if (predicate(columnJd(i))) return i;
  return null;
};
const describeColumn = (i) => (i === null ? null : { index: i, departureJdTdb: columnJd(i), departureDate: jdTdbToUtcDate(columnJd(i)) });
const gridCoverage = {
  outboundDepartureBeyondCoverage: describeColumn(firstColumnWhere((jd) => jd > coverageEndJd)),
  arrivalAtMinTofBeyondCoverage: describeColumn(firstColumnWhere((jd) => jd + grid.tofMinDays > coverageEndJd)),
  arrivalAtMaxTofBeyondCoverage: describeColumn(firstColumnWhere((jd) => jd + grid.tofMaxDays > coverageEndJd)),
  lastColumnDepartureDate: jdTdbToUtcDate(columnJd(grid.nDep - 1)),
  latestArrivalDate: jdTdbToUtcDate(columnJd(grid.nDep - 1) + grid.tofMaxDays),
};
const bodiesReport = {};
for (const designation of BODIES) {
  bodiesReport[designation] = {
    note: 'The porkchop grid is body-independent; this column is identical for every body.',
    ...gridCoverage,
  };
}

const spanDays = coverageEndJd - coverageStartJd;
const bytesPerDay = onDiskBytes / spanDays;
const extensionTo = (endUtc) => {
  const extraDays = utcMidnightToJdTdb(endUtc) - coverageEndJd;
  return {
    endUtc,
    extraDays: Math.round(extraDays),
    estimatedExtraBytes: Math.round(extraDays * bytesPerDay),
    estimatedTotalBytes: Math.round(onDiskBytes + extraDays * bytesPerDay),
    basis: 'linear extrapolation of measured bytes/day at the same cadence and body count — an ESTIMATE, not a measurement',
  };
};

const result = {
  generatedAtUtc: new Date().toISOString(),
  headCommit: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).stdout.trim(),
  fixture: {
    path: FIXTURE_REL,
    onDiskBytes,
    onDiskSha256,
    committedBlobBytes,
    source: fixture.source ?? null,
    frame: fixture.frame ?? null,
    timeScale: fixture.timeScale ?? null,
    units: fixture.units ?? null,
    loader: 'ingestSlice2Fixture (src/v2/boundary/horizons.ts), imported from a tsc build in .tmp-tests/',
  },
  bodies: { count: bodies.length, keys: bodies, perBody },
  coverage: {
    startJdTdb: coverageStartJd,
    endJdTdb: coverageEndJd,
    startDateTdb: jdTdbToTdbDate(coverageStartJd),
    endDateTdb: jdTdbToTdbDate(coverageEndJd),
    startDateUtcPageConvention: jdTdbToUtcDate(coverageStartJd),
    endDateUtcPageConvention: jdTdbToUtcDate(coverageEndJd),
    dateConventionNote: 'A JD ending in .5 is TDB midnight of *DateTdb. The page convention (jdTdbToUtcDateString in app/porkchop/main.ts) subtracts TDB-UTC = 69.184 s, which lands that midnight on the previous UTC calendar day.',
    spanDays,
    bytesPerDay,
    bytesPerDayBasis: 'onDiskBytes / spanDays (JD span, 5478 days). The per-sample rate, onDiskBytes / 5479 samples per body, is 0.02% lower; the extension estimates use the per-day figure.',
  },
  grid,
  gridCoverageByBody: bodiesReport,
  extensionEstimates: [extensionTo('2044-12-31'), extensionTo('2049-12-31'), extensionTo('2050-12-31'), extensionTo('2052-01-01')],
};

const outFlag = process.argv.indexOf('--out');
const outPath = outFlag > -1 && process.argv[outFlag + 1] ? path.resolve(process.argv[outFlag + 1]) : path.join(repoRoot, OUT_REL);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
const sidePath = `${outPath}.tmp-${process.pid}`;
fs.writeFileSync(sidePath, `${JSON.stringify(result, null, 2)}\n`);
fs.renameSync(sidePath, outPath);
console.log(JSON.stringify(result, null, 2));
