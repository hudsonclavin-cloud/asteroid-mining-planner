import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const [storeDir, outputDir = path.resolve(import.meta.dirname)] = process.argv.slice(2);
if (!storeDir) throw new Error('usage: node summarize.mjs <store-dir> [output-dir]');
fs.mkdirSync(outputDir, { recursive: true });

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}
function stats(values) {
  if (!values.length) return { count: 0, min: null, median: null, p95: null, max: null };
  const sorted = [...values].sort((a, b) => a - b);
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))];
  return { count: sorted.length, min: sorted[0], median: at(0.5), p95: at(0.95), max: sorted.at(-1) };
}
function summarizeRows(rows) {
  const tiers = {};
  const add = (bucket, row) => {
    bucket.bodies += 1;
    for (const [key, value] of [['shown', row.shown], ['shownScreen', row.shownScreen], ['shownSupport', row.shownSupport], ['shownBoth', row.shownBoth]]) {
      bucket[key] += value;
      bucket[`zero${key[0].toUpperCase()}${key.slice(1)}`].push(value === 0);
    }
    bucket.cells += row.cells; bucket.refusedEarth += row.refusedEarth; bucket.refusedSun += row.refusedSun; bucket.screenChangeCount += row.screenChangeCount;
    if (row.selectedBest) { bucket.bestCount += 1; bucket.bestFailsScreen.push(row.selectedBest.vEI > 12); }
    if (row.shown > 0) bucket.screenShare.push(row.shownScreen / row.shown);
  };
  const fresh = () => ({ bodies: 0, cells: 0, refusedEarth: 0, refusedSun: 0, screenChangeCount: 0, shown: 0, shownScreen: 0, shownSupport: 0, shownBoth: 0, bestCount: 0, zeroShown: [], zeroShownScreen: [], zeroShownSupport: [], zeroShownBoth: [], bestFailsScreen: [], screenShare: [] });
  const overall = fresh();
  for (const row of rows) { add(overall, row); const tier = row.tier ?? 'unknown'; (tiers[tier] ??= fresh()); add(tiers[tier], row); }
  const finish = (bucket) => ({ bodies: bucket.bodies, cells: bucket.cells, refusedEarth: bucket.refusedEarth, refusedEarthShare: bucket.cells ? bucket.refusedEarth / bucket.cells : null, refusedSun: bucket.refusedSun, screenChangeCount: bucket.screenChangeCount, zeroShownShare: bucket.bodies ? bucket.zeroShown.filter(Boolean).length / bucket.bodies : null, zeroShownScreenShare: bucket.bodies ? bucket.zeroShownScreen.filter(Boolean).length / bucket.bodies : null, zeroShownSupportShare: bucket.bodies ? bucket.zeroShownSupport.filter(Boolean).length / bucket.bodies : null, zeroShownBothShare: bucket.bodies ? bucket.zeroShownBoth.filter(Boolean).length / bucket.bodies : null, shownScreenShareDistribution: stats(bucket.screenShare), bestFailsScreenShare: bucket.bestCount ? bucket.bestFailsScreen.filter(Boolean).length / bucket.bestCount : null, bestCount: bucket.bestCount });
  return { overall: finish(overall), byTier: Object.fromEntries(Object.entries(tiers).map(([tier, bucket]) => [tier, finish(bucket)])) };
}
function writeParts(rows) {
  for (const name of fs.readdirSync(outputDir)) if (/^body-table\.part\d+of\d+\.jsonl\.gz$/.test(name)) fs.unlinkSync(path.join(outputDir, name));
  const cap = 8000000; const groups = []; let group = []; let bytes = 0;
  for (const row of rows) { const line = `${JSON.stringify(row)}\n`; const size = Buffer.byteLength(line); if (group.length && bytes + size > cap) { groups.push(group); group = []; bytes = 0; } group.push(line); bytes += size; }
  if (group.length) groups.push(group);
  const total = groups.length;
  groups.forEach((group, index) => fs.writeFileSync(path.join(outputDir, `body-table.part${index + 1}of${total}.jsonl.gz`), zlib.gzipSync(Buffer.from(group.join(''), 'utf8'), { level: 9 })));
  return total;
}
const coarse = readJsonl(path.join(storeDir, 'coarse-results.jsonl'));
const full = readJsonl(path.join(storeDir, 'full-results.jsonl'));
const comparison = [];
const fullByIndex = new Map(full.map((row) => [row.bodyIndex, row]));
for (const row of coarse) { const control = fullByIndex.get(row.bodyIndex); if (!control) continue; comparison.push({ bodyIndex: row.bodyIndex, designation: row.designation, tier: row.tier, coarse: { shown: row.shown, shownScreen: row.shownScreen, shownSupport: row.shownSupport, shownBoth: row.shownBoth, bestVEI: row.selectedBest?.vEI ?? null }, full: { shown: control.shown, shownScreen: control.shownScreen, shownSupport: control.shownSupport, shownBoth: control.shownBoth, bestVEI: control.selectedBest?.vEI ?? null }, bestVEIDifference: row.selectedBest && control.selectedBest ? control.selectedBest.vEI - row.selectedBest.vEI : null }); }
const zero = (key, rows) => rows.length ? rows.filter((row) => row[key] === 0).length / rows.length : null;
const comparisonSummary = comparison.length ? { bodies: comparison.length, coarse: { zeroShownShare: zero('shown', comparison.map((x) => x.coarse)), zeroShownScreenShare: zero('shownScreen', comparison.map((x) => x.coarse)), zeroShownSupportShare: zero('shownSupport', comparison.map((x) => x.coarse)), zeroShownBothShare: zero('shownBoth', comparison.map((x) => x.coarse)) }, full: { zeroShownShare: zero('shown', comparison.map((x) => x.full)), zeroShownScreenShare: zero('shownScreen', comparison.map((x) => x.full)), zeroShownSupportShare: zero('shownSupport', comparison.map((x) => x.full)), zeroShownBothShare: zero('shownBoth', comparison.map((x) => x.full)) }, bestVEIDifferenceKmS: stats(comparison.map((x) => x.bestVEIDifference).filter((x) => x !== null)) } : { bodies: 0 };
const output = { schema: 'aster-s20-overnight-on4-summary/1', generatedAtUtc: new Date().toISOString(), coarseBodies: coarse.length, fullBodies: full.length, coarseSummary: summarizeRows(coarse), fullResolutionControl: comparisonSummary, propagationRefusedBodies: coarse.filter((row) => row.propagationRefused).map((row) => ({ bodyIndex: row.bodyIndex, designation: row.designation, bodyId: row.bodyId, reason: row.propagationRefused })), screen: { earthMuNewKm3S2: 398600.43550702266, earthMuOldKm3S2: 398600.4418, rEIKm: 6503.1366 }, datasetParts: writeParts(coarse), orderPath: path.join(storeDir, 'order.json') };
fs.writeFileSync(path.join(outputDir, 'summary.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
