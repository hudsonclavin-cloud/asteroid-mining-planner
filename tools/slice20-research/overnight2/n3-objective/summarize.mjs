import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const [storeDir, outputDir = path.resolve(import.meta.dirname)] = process.argv.slice(2);
if (!storeDir) throw new Error('usage: node summarize.mjs <store-dir> [output-dir]');
fs.mkdirSync(outputDir, { recursive: true });
function readJsonl(file) { if (!fs.existsSync(file)) return []; return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
function stats(values) {
  if (!values.length) return { count: 0, min: null, median: null, p90: null, p95: null, max: null };
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))];
  return { count: sorted.length, min: sorted[0], median: at(0.5), p90: at(0.9), p95: at(0.95), max: sorted.at(-1) };
}
function pickValues(rows, objective, key) { return rows.map((row) => row.objectives[objective]?.[key]).filter((value) => Number.isFinite(value)); }
function share(rows, predicate) { return rows.length ? rows.filter(predicate).length / rows.length : null; }
function equalPick(a, b) { return a && b && a.di === b.di && a.ti === b.ti && a.M === b.M && a.branch === b.branch; }
function spread(rows, objective) {
  const values = rows.map((row) => row.objectives[objective]?.depJd).filter(Number.isFinite);
  return values.length ? { minJd: Math.min(...values), maxJd: Math.max(...values), spreadDays: Math.max(...values) - Math.min(...values) } : null;
}
function writeParts(rows) {
  for (const name of fs.readdirSync(outputDir)) if (/^body-table\.part\d+of\d+\.jsonl\.gz$/.test(name)) fs.unlinkSync(path.join(outputDir, name));
  const cap = 8000000;
  const groups = [];
  let group = [];
  let bytes = 0;
  for (const row of rows) {
    const line = `${JSON.stringify(row)}\n`;
    const size = Buffer.byteLength(line);
    if (group.length && bytes + size > cap) { groups.push(group); group = []; bytes = 0; }
    group.push(line); bytes += size;
  }
  if (group.length) groups.push(group);
  const total = groups.length;
  groups.forEach((group, index) => fs.writeFileSync(path.join(outputDir, `body-table.part${index + 1}of${total}.jsonl.gz`), zlib.gzipSync(Buffer.from(group.join(''), 'utf8'), { level: 9 })));
  return total;
}
function objectiveSummary(rows, objective) {
  const selected = rows.map((row) => row.objectives[objective]).filter(Boolean);
  return {
    selected: selected.length,
    none: rows.length - selected.length,
    screenPassShare: share(selected, (pick) => pick.screen),
    supportedShare: share(selected, (pick) => pick.supported),
    M0Share: share(selected, (pick) => pick.M === 0),
    M1Share: share(selected, (pick) => pick.M === 1),
    tofDays: stats(selected.map((pick) => pick.tofDays)),
    departureSpread: spread(rows, objective),
    medianVInfDep: stats(pickValues(rows, objective, 'vInfDep')),
    medianVInfArr: stats(pickValues(rows, objective, 'vInfArr')),
  };
}

const rows = readJsonl(path.join(storeDir, 'coarse-results.jsonl')).sort((a, b) => a.bodyIndex - b.bodyIndex);
const a = rows.map((row) => row.objectives.A).filter(Boolean);
const b = rows.map((row) => row.objectives.B).filter(Boolean);
const c = rows.map((row) => row.objectives.C).filter(Boolean);
const d = rows.map((row) => row.objectives.D).filter(Boolean);
const bOverA = rows.map((row) => row.objectives.A && row.objectives.B ? row.objectives.B.vInfDep - row.objectives.A.vInfDep : null).filter(Number.isFinite);
const objectiveComparisons = {
  bExistsShare: share(rows, (row) => Boolean(row.objectives.B)),
  bOverA: stats(bOverA),
  cScreenPassShare: share(c, (pick) => pick.screen),
  AEqualsCShare: share(rows.filter((row) => row.objectives.A && row.objectives.C), (row) => equalPick(row.objectives.A, row.objectives.C)),
  AEqualsBShareAmongB: share(rows.filter((row) => row.objectives.A && row.objectives.B), (row) => equalPick(row.objectives.A, row.objectives.B)),
};

const nhats = JSON.parse(fs.readFileSync(path.join(path.dirname(import.meta.dirname), '..', 'nhats', 'n1-sample', 'n1-sample.json'), 'utf8'));
const rowsByDesignation = new Map(rows.map((row) => [row.designation, row]));
const nhatsComparisons = [];
const nhatsMu = 398600.43550702266;
const nhatsREI = 6503.1366;
const nhatsVInfAt12 = Math.sqrt(12 ** 2 - 2 * nhatsMu / nhatsREI);
for (const body of nhats.bodies) {
  const row = rowsByDesignation.get(body.des);
  const traj = body.nhats?.min_dv_traj;
  if (!row || !traj) continue;
  const entrySpeed = Number(traj.v_arr_earth);
  const controlDV = Number(traj.vrel_arr_earth);
  const naturalVInfArr = controlDV > 0 ? nhatsVInfAt12 + controlDV : Math.sqrt(Math.max(0, entrySpeed ** 2 - 2 * nhatsMu / nhatsREI));
  nhatsComparisons.push({
    designation: body.des,
    nhatsNeedsControl: controlDV > 0,
    nhatsVInfArr: naturalVInfArr,
    objectiveA: row.objectives.A ? { vInfArr: row.objectives.A.vInfArr, screen: row.objectives.A.screen } : null,
    objectiveC: row.objectives.C ? { vInfArr: row.objectives.C.vInfArr, screen: row.objectives.C.screen } : null,
  });
}
const nhatsSummary = {
  bodies: nhatsComparisons.length,
  needsControlShare: share(nhatsComparisons, (row) => row.nhatsNeedsControl),
  medianVInfArr: stats(nhatsComparisons.map((row) => row.nhatsVInfArr)),
  objectiveAFailsScreenShare: share(nhatsComparisons.filter((row) => row.objectiveA), (row) => !row.objectiveA.screen),
  objectiveCFailsScreenShare: share(nhatsComparisons.filter((row) => row.objectiveC), (row) => !row.objectiveC.screen),
  objectiveAMedianVInfArr: stats(nhatsComparisons.map((row) => row.objectiveA?.vInfArr).filter(Number.isFinite)),
  objectiveCMedianVInfArr: stats(nhatsComparisons.map((row) => row.objectiveC?.vInfArr).filter(Number.isFinite)),
};

const output = {
  schema: 'aster-s20-overnight2-n3-objective-summary/1',
  generatedAtUtc: new Date().toISOString(),
  bodies: rows.length,
  cellsPerBody: rows[0]?.cells ?? null,
  cells: rows.reduce((sum, row) => sum + row.cells, 0),
  refusedEarth: rows.reduce((sum, row) => sum + row.refusedEarth, 0),
  refusedSun: rows.reduce((sum, row) => sum + row.refusedSun, 0),
  refusedEarthShare: rows.length && rows[0]?.cells ? rows.reduce((sum, row) => sum + row.refusedEarth, 0) / rows.reduce((sum, row) => sum + row.cells, 0) : null,
  vInfAt12KmS: nhatsVInfAt12,
  objectiveSummary: {
    A: objectiveSummary(rows, 'A'),
    B: objectiveSummary(rows, 'B'),
    C: objectiveSummary(rows, 'C'),
    D: objectiveSummary(rows, 'D'),
  },
  objectiveComparisons,
  nhatsSanity: nhatsSummary,
  nhatsSanityRecords: nhatsComparisons,
  datasetParts: writeParts(rows),
  orderPath: path.join(storeDir, 'order.json'),
};
fs.writeFileSync(path.join(outputDir, 'summary.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
