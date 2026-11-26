import fs from 'node:fs';
import path from 'node:path';

const [storeDir, cachePath, outputPath] = process.argv.slice(2);
if (!storeDir || !cachePath || !outputPath) throw new Error('usage: node analyze.mjs <store-dir> <a-cache-tsv> <output-json>');
const normalize = (value) => value.replaceAll('\\', '/');
const reps = [];
for (let index = 1; index <= 5; index += 1) {
  const file = path.join(storeDir, `rep-${index}.json`);
  reps.push(JSON.parse(fs.readFileSync(file, 'utf8')));
}
const byRep = reps.map((rep) => new Map(rep.records.map((record) => [normalize(record.file), record])));
const files = [...new Set(reps.flatMap((rep) => rep.records.map((record) => normalize(record.file))))].sort();
const flakyFiles = [];
for (const file of files) {
  const signatures = reps.map((rep, index) => {
    const record = byRep[index].get(file);
    return JSON.stringify({ status: record?.status ?? null, exitCode: record?.exitCode ?? null, summary: record?.summary ?? null, firstPassCount: record?.firstPassCount ?? null });
  });
  if (new Set(signatures).size > 1) {
    flakyFiles.push({ file, runs: reps.map((rep, index) => {
      const record = byRep[index].get(file);
      return { repetition: index + 1, status: record?.status ?? null, summary: record?.summary ?? null, summaryLines: record?.summaryLines ?? {}, firstPassCount: record?.firstPassCount ?? null };
    }) });
  }
}
const parserMismatches = [];
for (let index = 0; index < reps.length; index += 1) {
  for (const record of reps[index].records) {
    if (record.firstPassCount !== null && record.summary.pass !== null && record.firstPassCount !== record.summary.pass) {
      parserMismatches.push({ repetition: index + 1, file: normalize(record.file), firstPassMatch: record.firstPassMatch, firstPassCount: record.firstPassCount, parsedPass: record.summary.pass, summaryLines: record.summaryLines });
    }
  }
}
const cache = new Map();
for (const line of fs.readFileSync(cachePath, 'utf8').split(/\r?\n/u)) {
  if (!line.trim()) continue;
  const [file, tests, pass, fail, skipped, todo] = line.split('\t');
  cache.set(normalize(file), { tests: Number(tests), pass: Number(pass), fail: Number(fail), skipped: Number(skipped), todo: Number(todo) });
}
const cacheDiff = [];
for (const file of files) {
  const current = byRep[0].get(file);
  const old = cache.get(file);
  const currentCounts = current?.summary ?? null;
  const oldCounts = old ? { pass: old.pass, fail: old.fail, skipped: old.skipped, todo: old.todo } : null;
  if (!old || JSON.stringify(currentCounts) !== JSON.stringify(oldCounts)) cacheDiff.push({ file, current: currentCounts, aCache: oldCounts });
}
for (const file of cache.keys()) if (!byRep[0].has(file)) cacheDiff.push({ file, current: null, aCache: { pass: cache.get(file).pass, fail: cache.get(file).fail, skipped: cache.get(file).skipped, todo: cache.get(file).todo } });
const totals = reps.map((rep) => ({ repetition: rep.repetition, files: rep.totals.files, passFiles: rep.totals.passFiles, failFiles: rep.totals.failFiles, loadTimeoutFiles: rep.totals.loadTimeoutFiles, tests: rep.totals.tests }));
const verdict = flakyFiles.length ? `FLAKY FILE ${flakyFiles[0].file}` : parserMismatches.length ? `PARSER ${parserMismatches[0].file}` : 'NOT REPRODUCED (5 runs)';
const result = { schema: 'aster-s20-overnight2-n5-analysis/1', generatedAtUtc: new Date().toISOString(), repetitions: totals, fileCount: files.length, aCacheFileCount: cache.size, flakyFiles, parserMismatches, cacheDiff, verdict, summaryLines: reps.map((rep) => ({ repetition: rep.repetition, files: rep.records.map((record) => ({ file: normalize(record.file), summaryLines: record.summaryLines })) })) };
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ verdict, totals, flakyFileCount: flakyFiles.length, parserMismatchCount: parserMismatches.length, cacheDiffCount: cacheDiff.length, cacheFileCount: cache.size, currentFileCount: files.length }, null, 2));
