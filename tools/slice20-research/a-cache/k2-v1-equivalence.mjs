import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [cachePath, outputPath] = process.argv.slice(2);
if (!cachePath || !outputPath) throw new Error('usage: node k2-v1-equivalence.mjs <cache.json> <output.json>');
const cacheBytes = readFileSync(cachePath);
const cache = JSON.parse(cacheBytes.toString('utf8'));
if (cache.metadata?.schemaVersion !== 1 || !Array.isArray(cache.bodies) || !cache.bodies.some((body) => Array.isArray(body.bestWindows))) {
  throw new Error('Expected the v1 cache with bestWindows for equivalence proof');
}
const c3Max = cache.metadata.feasibleC3MaxKm2S2;
const BIN = 0.25;
const MAXV = 8;

function summarize(kind) {
  const bins = new Array(Math.round(MAXV / BIN)).fill(0);
  let counted = 0;
  let overflow = 0;
  let noWindow = 0;
  const lowestSample = [];
  for (const body of cache.bodies) {
    let best;
    if (kind === 'bestWindows') {
      const windows = (body.bestWindows || []).filter((window) => Number.isFinite(window.vInfDep) && window.c3 <= c3Max);
      if (!windows.length) {
        noWindow++;
        continue;
      }
      best = windows.reduce((left, right) => (right.vInfDep < left.vInfDep ? right : left));
    } else {
      const minC3 = body.minC3;
      if (!Number.isFinite(minC3) || minC3 > c3Max) {
        noWindow++;
        continue;
      }
      best = { vInfDep: Math.sqrt(minC3), launchDate: body.minC3Date, tofDays: body.minC3TofDays };
    }
    counted++;
    const index = Math.floor(best.vInfDep / BIN);
    if (index >= bins.length) overflow++;
    else bins[index]++;
    if (lowestSample.length < 12 && best.vInfDep < 1.2) {
      lowestSample.push({
        designation: body.designation,
        vInfDep: +best.vInfDep.toFixed(3),
        launchDate: best.launchDate,
        tofDays: best.tofDays,
      });
    }
  }
  return { binKms: BIN, bins, overflow, counted, noWindow, catalogSize: cache.bodies.length, lowestSample };
}

const oldProxy = summarize('bestWindows');
const minC3Proxy = summarize('minC3');
const comparedFields = ['binKms', 'bins', 'overflow', 'counted', 'noWindow', 'catalogSize', 'lowestSample'];
const checks = Object.fromEntries(comparedFields.map((field) => [field, JSON.stringify(oldProxy[field]) === JSON.stringify(minC3Proxy[field])]));
const result = {
  cacheSha256: createHash('sha256').update(cacheBytes).digest('hex'),
  schemaVersion: cache.metadata.schemaVersion,
  c3MaxKm2S2: c3Max,
  oldProxy,
  minC3Proxy,
  checks,
  pass: Object.values(checks).every(Boolean),
};
writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
if (!result.pass) process.exitCode = 1;