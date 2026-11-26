import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

const [currentBuildDir, oldBuildDir, lr1Path, outputPath] = process.argv.slice(2);
if (!currentBuildDir || !oldBuildDir || !lr1Path || !outputPath) throw new Error('usage: node input-compare.mjs <current-build> <old-build> <lr1-gz> <output-json>');
const imp = (dir, rel) => import(pathToFileURL(path.join(dir, rel)).href);
const [currentLambert, oldLambert, oldGrid, horizons, hermite, keplerian, catalog] = await Promise.all([
  imp(currentBuildDir, 'core/lambert/lambert-multi-rev.js'),
  imp(oldBuildDir, 'core/lambert/lambert-multi-rev.js'),
  imp(oldBuildDir, 'porkchop/grid-compute.js'),
  imp(currentBuildDir, 'boundary/horizons.js'),
  imp(currentBuildDir, 'core/interpolators/hermite.js'),
  imp(currentBuildDir, 'core/propagators/keplerian.js'),
  imp(currentBuildDir, 'boundary/slice9-nea-catalog.js'),
]);
const repoRoot = path.resolve(import.meta.dirname, '../../../..');
const earthFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const catalogFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const earthSeries = horizons.ingestSlice2Fixture(earthFixture).earth.map((sample) => sample.state);
const bodyMap = catalog.ingestSlice9Fixture(catalogFixture).asteroids;
const bodyByDesignation = new Map(Object.values(bodyMap).map((body) => [body.designation, body]));
const payload = JSON.parse(zlib.gunzipSync(fs.readFileSync(lr1Path)).toString('utf8'));
const MU = payload.muSunKm3S2;
const DAY = 86400;
const jdSeconds = (jd) => (jd - 2451545.0) * DAY;
const absMax = (a, b) => Math.max(...a.map((value, index) => Math.abs(value - b[index])));
const allFinite = (values) => values.every(Number.isFinite);
const branchFor = (result, branch) => result?.branches?.find((candidate) => candidate.branch === branch) ?? null;
const median = (values) => {
  const sorted = values.slice().sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const stat = (values) => ({ count: values.length, max: values.length ? Math.max(...values) : null, median: median(values) });
const vectorDiff = (candidate, recorded) => {
  if (!candidate || !recorded) return null;
  return Math.max(absMax(candidate.v1, recorded.v1KmS), absMax(candidate.v2, recorded.v2KmS));
};
const rows = [];
const inputDiffs = [];
const currentDiffs = [];
const oldDiffs = [];
const oldGridDiffs = [];
const currentVsRecorded = [];
const oldVsRecorded = [];
for (const record of payload.records) {
  const currentResult = currentLambert.lambertMultiRev(record.r1Km, record.r2Km, record.tofSeconds, MU, record.M, true);
  const oldResult = oldLambert.lambertMultiRev(record.r1Km, record.r2Km, record.tofSeconds, MU, record.M, true);
  const currentBranch = branchFor(currentResult, record.branch);
  const oldBranch = branchFor(oldResult, record.branch);
  const currentDiff = vectorDiff(currentBranch, record.aster);
  const oldDiff = vectorDiff(oldBranch, record.aster);
  const currentInput = bodyByDesignation.get(record.designation);
  let oldGridBranch = null;
  try {
    const gridResult = oldGrid.computePorkchopGrid(currentInput?.elements ?? null, { depStartJD: record.depJdTdb, depEndJD: record.depJdTdb, tofMinDays: record.tofDays, tofMaxDays: record.tofDays, nDep: 1, nTof: 1 }, record.M, {
      getEarthStateAtTdbSeconds: (seconds) => keplerian.propagateKeplerianStateVectors(currentInput.elements, seconds),
      propagateTargetStateAtTdbSeconds: (_elements, seconds) => hermite.interpolateBodyStateSeries('earth', earthSeries, seconds),
    });
    oldGridBranch = gridResult.cells[0]?.branches?.find((candidate) => candidate.branch === record.branch) ?? null;
  } catch {
    oldGridBranch = null;
  }
  const oldGridDiff = oldGridBranch && record.aster ? Math.max(absMax(oldGridBranch.v1, record.aster.v1KmS), absMax(oldGridBranch.v2, record.aster.v2KmS)) : null;
  const currentAsteroid = currentInput ? keplerian.propagateKeplerianStateVectors(currentInput.elements, jdSeconds(record.depJdTdb)) : null;
  const currentR1 = currentAsteroid ? [currentAsteroid.positionM.x / 1000, currentAsteroid.positionM.y / 1000, currentAsteroid.positionM.z / 1000] : null;
  const currentEarth = hermite.interpolateBodyStateSeries('earth', earthSeries, jdSeconds(record.depJdTdb) + record.tofSeconds);
  const currentR2 = [currentEarth.positionM.x / 1000, currentEarth.positionM.y / 1000, currentEarth.positionM.z / 1000];
  const r1Diff = currentR1 ? absMax(currentR1, record.r1Km) : null;
  const r2Diff = absMax(currentR2, record.r2Km);
  const tofComputed = record.tofDays * DAY;
  const tofDiff = Math.abs(tofComputed - record.tofSeconds);
  const inputDiff = r1Diff !== 0 || r2Diff !== 0 || tofDiff !== 0 || MU !== payload.muSunKm3S2;
  const currentIzzoDiff = currentBranch && record.izzo ? Math.max(absMax(currentBranch.v1, record.izzo.v1KmS), absMax(currentBranch.v2, record.izzo.v2KmS)) : null;
  const row = { id: record.id, designation: record.designation, M: record.M, branch: record.branch, depJdTdb: record.depJdTdb, tofDays: record.tofDays, tofSecondsRecorded: record.tofSeconds, tofSecondsComputed: tofComputed, muSunRecorded: payload.muSunKm3S2, muSunComputed: MU, r1RecordedKm: record.r1Km, r1ComputedKm: currentR1, r2RecordedKm: record.r2Km, r2ComputedKm: currentR2, r1DiffKm: r1Diff, r2DiffKm: r2Diff, tofDiffSeconds: tofDiff, currentAsterVectorDiffKmS: currentDiff, oldAsterVectorDiffKmS: oldDiff, oldGridVectorDiffKmS: oldGridDiff, currentIzzoVectorDiffKmS: currentIzzoDiff, currentAsterBitIdentical: currentDiff === 0, oldAsterBitIdentical: oldDiff === 0, oldGridBitIdentical: oldGridDiff === 0 };
  rows.push(row);
  if (inputDiff) inputDiffs.push(row);
  if (currentDiff !== 0) currentDiffs.push(row);
  if (oldDiff !== 0) oldDiffs.push(row);
  if (oldGridDiff !== 0) oldGridDiffs.push({ id: record.id, oldGridVectorDiffKmS: oldGridDiff });
  if (currentDiff !== null) currentVsRecorded.push(currentDiff);
  if (oldDiff !== null) oldVsRecorded.push(oldDiff);
}
const twenty = currentDiffs.slice(0, 20);
const result = {
  schema: 'aster-s20-overnight2-n1-input-compare/1',
  generatedAtUtc: new Date().toISOString(),
  headCommit: payload.headCommit,
  records: payload.records.length,
  inputComparison: { differingRecordCount: inputDiffs.length, firstInputDifference: inputDiffs[0] ?? null, maxR1AbsKm: Math.max(...rows.map((row) => row.r1DiffKm ?? 0)), maxR2AbsKm: Math.max(...rows.map((row) => row.r2DiffKm ?? 0)), maxTofAbsSeconds: Math.max(...rows.map((row) => row.tofDiffSeconds)), muEqual: rows.every((row) => row.muSunRecorded === row.muSunComputed) },
  currentBuild: { vectorDiff: stat(currentVsRecorded), bitIdentical: rows.filter((row) => row.currentAsterBitIdentical).length, differing: currentDiffs.length, izzoVectorDiff: stat(rows.map((row) => row.currentIzzoVectorDiffKmS).filter((value) => value !== null)) },
  lr1HeadBuild: { vectorDiff: stat(oldVsRecorded), bitIdentical: rows.filter((row) => row.oldAsterBitIdentical).length, differing: oldDiffs.length, gridHarnessBitIdentical: rows.length - oldGridDiffs.length, gridHarnessDiffering: oldGridDiffs.length },
  sameCells: { idsCompared: rows.length, sameBodyEpochTofMBranch: rows.length, note: 'The comparison keys are the LR1 record ids; both builds are evaluated on each exact LR1 record input.' },
  firstTwentyCurrentDifferences: twenty,
  firstTwentyOldDifferences: oldDiffs.slice(0, 20),
  allRows: rows,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ inputDiffs: inputDiffs.length, current: result.currentBuild, old: result.lr1HeadBuild, firstTwenty: twenty.length }, null, 2));
