import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const [storeDir, outputDir = path.resolve(import.meta.dirname)] = process.argv.slice(2);
if (!storeDir) throw new Error('usage: node summarize.mjs <store-dir> [output-dir]');
fs.mkdirSync(outputDir, { recursive: true });
function readJsonl(file) { if (!fs.existsSync(file)) return []; return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
function stats(values) {
  if (!values.length) return { count: 0, min: null, median: null, p90: null, p95: null, max: null };
  const sorted = [...values].sort((a, b) => a - b); const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))];
  return { count: sorted.length, min: sorted[0], median: at(0.5), p90: at(0.9), p95: at(0.95), max: sorted.at(-1) };
}
function share(rows, predicate) { return rows.length ? rows.filter(predicate).length / rows.length : null; }
function yearFromJd(jd) { return new Date((jd - 2440587.5) * 86400000).getUTCFullYear(); }
function equalPick(a, b) { return a && b && a.di === b.di && a.ti === b.ti && a.M === b.M && a.branch === b.branch; }
function writeParts(rows) {
  for (const name of fs.readdirSync(outputDir)) if (/^body-table\.part\d+of\d+\.jsonl\.gz$/.test(name)) fs.unlinkSync(path.join(outputDir, name));
  const cap = 8000000; const groups = []; let group = []; let bytes = 0;
  for (const row of rows) { const line = `${JSON.stringify(row)}\n`; const size = Buffer.byteLength(line); if (group.length && bytes + size > cap) { groups.push(group); group = []; bytes = 0; } group.push(line); bytes += size; }
  if (group.length) groups.push(group); const total = groups.length;
  groups.forEach((group, index) => fs.writeFileSync(path.join(outputDir, `body-table.part${index + 1}of${total}.jsonl.gz`), zlib.gzipSync(Buffer.from(group.join(''), 'utf8'), { level: 9 })));
  return total;
}

const rows = readJsonl(path.join(storeDir, 'coarse-results.jsonl')).sort((a, b) => a.bodyIndex - b.bodyIndex);
const pairedRows = rows.filter((row) => row.paired);
const selectedA = pairedRows.map((row) => row.paired.selectedA).filter(Boolean);
const selectedC = pairedRows.map((row) => row.paired.selectedC).filter(Boolean);
const totalCells = pairedRows.reduce((sum, row) => sum + row.paired.totalCells, 0);
const refusedCells = pairedRows.reduce((sum, row) => sum + row.paired.refusedEarth, 0);
const refusedSunBranches = pairedRows.reduce((sum, row) => sum + row.paired.refusedSun, 0);
const noSolutionCells = pairedRows.reduce((sum, row) => sum + row.paired.noSolution, 0);
const shownCells = pairedRows.reduce((sum, row) => sum + row.paired.shown, 0);
const shownScreenCells = pairedRows.reduce((sum, row) => sum + row.paired.shownScreen, 0);
const shownSupportCells = pairedRows.reduce((sum, row) => sum + row.paired.shownSupport, 0);
const shownBothCells = pairedRows.reduce((sum, row) => sum + row.paired.shownBoth, 0);
const aggregateRows = rows;
const aggregate = {
  bodies: rows.length,
  pairedBodies: pairedRows.length,
  totalCells,
  refusedEarthCells: refusedCells,
  refusedEarthCellShare: totalCells ? refusedCells / totalCells : null,
  refusedSunBranches,
  noSolutionCells,
  shownCells,
  shownScreenCells,
  shownSupportCells,
  shownBothCells,
  zeroShownBodies: aggregateRows.filter((row) => !row.paired || row.paired.shown === 0).length,
  zeroShownShare: share(aggregateRows, (row) => !row.paired || row.paired.shown === 0),
  zeroShownScreenBodies: aggregateRows.filter((row) => !row.paired || row.paired.shownScreen === 0).length,
  zeroShownScreenShare: share(aggregateRows, (row) => !row.paired || row.paired.shownScreen === 0),
  zeroShownSupportShare: share(aggregateRows, (row) => !row.paired || row.paired.shownSupport === 0),
  zeroShownBothShare: share(aggregateRows, (row) => !row.paired || row.paired.shownBoth === 0),
  noReturnSolutionShare: share(aggregateRows.filter((row) => row.paired), (row) => row.paired.shown === 0),
};
function pickSummary(picks) {
  return {
    selected: picks.length,
    screenPassShare: share(picks, (pick) => pick.screen),
    supportedShare: share(picks, (pick) => pick.supported),
    M0Share: share(picks, (pick) => pick.M === 0),
    M1Share: share(picks, (pick) => pick.M === 1),
    sameAsA: null,
    totalMissionDays: stats(picks.map((pick) => pick.totalMissionDays)),
    crudeTotalVInfKmS: stats(picks.map((pick) => pick.crudeTotalVInfKmS)),
    returnVInfDep: stats(picks.map((pick) => pick.vInfDep)),
    returnVInfArr: stats(picks.map((pick) => pick.vInfArr)),
  };
}
const objective = { A: pickSummary(selectedA), C: pickSummary(selectedC) };
objective.C.sameAsA = share(pairedRows.filter((row) => row.paired.selectedA && row.paired.selectedC), (row) => equalPick(row.paired.selectedA, row.paired.selectedC));
objective.A.sameAsA = 1;

const byYear = {};
for (const row of rows) {
  const key = row.outbound ? String(yearFromJd(row.outbound.arrivalJd)) : 'no-outbound';
  const bucket = (byYear[key] ??= { bodies: 0, pairedBodies: 0, totalCells: 0, refusedEarthCells: 0, zeroShown: 0, zeroShownScreen: 0, medianTotalMissionDays: [] });
  bucket.bodies += 1;
  if (row.paired) { bucket.pairedBodies += 1; bucket.totalCells += row.paired.totalCells; bucket.refusedEarthCells += row.paired.refusedEarth; if (row.paired.shown === 0) bucket.zeroShown += 1; if (row.paired.shownScreen === 0) bucket.zeroShownScreen += 1; if (row.paired.selectedA) bucket.medianTotalMissionDays.push(row.paired.selectedA.totalMissionDays); }
}
for (const bucket of Object.values(byYear)) { bucket.refusedEarthCellShare = bucket.totalCells ? bucket.refusedEarthCells / bucket.totalCells : null; bucket.zeroShownShare = bucket.bodies ? bucket.zeroShown / bucket.bodies : null; bucket.zeroShownScreenShare = bucket.bodies ? bucket.zeroShownScreen / bucket.bodies : null; bucket.medianTotalMissionDays = stats(bucket.medianTotalMissionDays); delete bucket.zeroShown; delete bucket.zeroShownScreen; }

const statusCounts = rows.reduce((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc; }, {});
const output = {
  schema: 'aster-s20-overnight2-n4-paired-summary/1',
  generatedAtUtc: new Date().toISOString(),
  bodies: rows.length,
  statusCounts,
  grid: { outbound: { depStartJd: 2461041.500800741, depEndJd: 2466154.500800741, nDep: 50, nTof: 25, tofMinDays: 182.5, tofMaxDays: 1826.25, M: [0, 1], selection: 'production computePorkchopGrid AMD-2 min-C3 branch per M, then global minimum vInfDep with M=0 retained on exact ties' }, pairedReturn: { stayMinDays: 8, stayMaxDays: 730.5, nDep: 40, nTof: 25, tofMinDays: 182.5, tofMaxDays: 1826.25, M: [0, 1], earthRefusal: 'arrival after last Earth fixture sample', sunRefusalPerihelionKm: 695700 } },
  aggregate,
  objective,
  byOutboundArrivalYear: byYear,
  refusalDefinitionComparison: { priorRun1Share: 0.265, priorRun1Grid: '723 departure x 100 TOF, M=0', thisRunGrid: '40 departure x 25 TOF, M=0 and M=1', definitionsMatch: true, note: 'The refusal condition matches DEC-20-3; the measured share is grid-resolution and M-family dependent.' },
  datasetParts: writeParts(rows),
  orderPath: path.join(storeDir, 'order.json'),
};
fs.writeFileSync(path.join(outputDir, 'summary.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
