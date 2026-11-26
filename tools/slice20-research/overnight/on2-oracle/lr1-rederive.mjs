import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [buildDir, lr1Path, outputPath] = process.argv.slice(2);
if (!buildDir || !lr1Path || !outputPath) throw new Error('usage: node lr1-rederive.mjs <build-dir> <lr1-gz> <output-json>');
const { lambertMultiRev } = await import(pathToFileURL(path.join(buildDir, 'core/lambert/lambert-multi-rev.js')).href);
const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(lr1Path)).toString('utf8'));
const results = { M0: { count: 0, asterBitIdentical: 0, maxAsterAbsKmS: 0, maxIzzoAbsKmS: 0 }, M1: { count: 0, asterBitIdentical: 0, maxAsterAbsKmS: 0, maxIzzoAbsKmS: 0 }, failures: [] };
const absMax = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
for (const rec of data.records) {
  if (rec.M !== 0 && rec.M !== 1) continue;
  const key = `M${rec.M}`;
  results[key].count += 1;
  const solved = lambertMultiRev(rec.r1Km, rec.r2Km, rec.tofSeconds, data.muSunKm3S2, rec.M, true);
  const branch = solved?.branches?.find((candidate) => candidate.branch === rec.branch);
  if (!branch || !rec.aster?.v1KmS) {
    results.failures.push({ id: rec.id, reason: 'missing Aster branch' });
    continue;
  }
  const asterDiff = Math.max(absMax(branch.v1, rec.aster.v1KmS), absMax(branch.v2, rec.aster.v2KmS));
  results[key].maxAsterAbsKmS = Math.max(results[key].maxAsterAbsKmS, asterDiff);
  if (branch.v1.every((v, i) => v === rec.aster.v1KmS[i]) && branch.v2.every((v, i) => v === rec.aster.v2KmS[i])) results[key].asterBitIdentical += 1;
  if (rec.izzo?.v1KmS) results[key].maxIzzoAbsKmS = Math.max(results[key].maxIzzoAbsKmS, Math.max(absMax(branch.v1, rec.izzo.v1KmS), absMax(branch.v2, rec.izzo.v2KmS)));
}
results.verdict = results.failures.length === 0 && results.M0.maxIzzoAbsKmS <= 1e-12 && results.M1.maxIzzoAbsKmS <= 1e-12 ? 'LR1 REPRODUCED' : 'LR1 DIFFERS';
fs.writeFileSync(outputPath, `${JSON.stringify({ ...results, generatedAtUtc: new Date().toISOString() }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(results, null, 2));
