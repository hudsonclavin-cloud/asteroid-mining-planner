import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [buildDir, datasetPath, outputPath] = process.argv.slice(2);
if (!buildDir || !datasetPath || !outputPath) throw new Error('usage: node phase0-positive-control.mjs <build-dir> <lr1-gz> <output-json>');
const { lambertMultiRev } = await import(pathToFileURL(path.join(buildDir, 'core/lambert/lambert-multi-rev.js')).href);
const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(datasetPath)).toString('utf8'));
const picks = [
  data.records.find((record) => record.M === 0 && record.branch === 'single'),
  data.records.find((record) => record.M === 1 && record.branch === 'left'),
  data.records.find((record) => record.M === 1 && record.branch === 'right'),
];
if (picks.some((record) => !record)) throw new Error('positive-control records were not found');
const absMax = (a, b) => Math.max(...a.map((value, index) => Math.abs(value - b[index])));
const results = picks.map((record) => {
  const solved = lambertMultiRev(record.r1Km, record.r2Km, record.tofSeconds, data.muSunKm3S2, record.M, true);
  const branch = solved?.branches?.find((candidate) => candidate.branch === record.branch);
  if (!branch) throw new Error(`missing Aster branch for ${record.id}`);
  const asterAbsKmS = Math.max(absMax(branch.v1, record.aster.v1KmS), absMax(branch.v2, record.aster.v2KmS));
  const izzoAbsKmS = Math.max(absMax(branch.v1, record.izzo.v1KmS), absMax(branch.v2, record.izzo.v2KmS));
  return { id: record.id, M: record.M, branch: record.branch, asterBitIdentical: asterAbsKmS === 0, asterAbsKmS, izzoAbsKmS };
});
const output = { schema: 'aster-s20-overnight2-positive-control/1', buildDir, datasetPath, results, pass: results.every((result) => result.asterBitIdentical && result.izzoAbsKmS <= 1e-12) };
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
if (!output.pass) process.exitCode = 1;
