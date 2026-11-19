import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';

const repoRoot = process.cwd();
const tempOutDir = path.join(repoRoot, '.tmp-tests', 's20-a-cache-diff');
const v1Path = 'C:/Users/hudso/AppData/Local/Temp/s20-a-cache/cache-v1.json';
const v2Path = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json');
const outputPath = 'C:/Users/hudso/AppData/Local/Temp/s20-a-cache/diff-v1-v2.json';
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
mkdirSync(tempOutDir, { recursive: true });
const tsc = spawnSync(process.execPath, [
  tscBin, '--pretty', 'false', '--outDir', tempOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
  '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext', '--isolatedModules', 'true',
  path.join(repoRoot, 'src', 'v2', 'boundary', 'lambert-screen-cache.ts'),
  path.join(repoRoot, 'src', 'v2', 'porkchop', 'format-c3.ts'),
  path.join(repoRoot, 'src', 'v2', 'render', 'asteroid-screening-color.ts'),
], { cwd: repoRoot, encoding: 'utf8' });
if (tsc.status !== 0) {
  throw new Error(`Production-module TypeScript compile failed (status=${tsc.status}):\n${tsc.stderr || tsc.stdout}`);
}
const importBuilt = (relativePath) => import(pathToFileURL(path.join(tempOutDir, relativePath)).href);
const [{ validateLambertScreenCache }, { formatC3 }, { getScreeningColor }] = await Promise.all([
  importBuilt('boundary/lambert-screen-cache.js'),
  importBuilt('porkchop/format-c3.js'),
  importBuilt('render/asteroid-screening-color.js'),
]);

const v1Bytes = readFileSync(v1Path);
const v2Bytes = readFileSync(v2Path);
const v1Raw = JSON.parse(v1Bytes.toString('utf8'));
const v2Raw = JSON.parse(v2Bytes.toString('utf8'));
const v1 = validateLambertScreenCache(v1Raw);
const v2 = validateLambertScreenCache(v2Raw);
const oldBodies = v1.bodies;
const newBodies = v2.bodies;
const statuses = [...new Set([...oldBodies.map((body) => body.status), ...newBodies.map((body) => body.status)])].sort();
const statusMatrix = Object.fromEntries(statuses.map((status) => [status, Object.fromEntries(statuses.map((next) => [next, 0]))]));
let bodyOrderDifferences = 0;
let isCoOrbitalChanges = 0;
let c3TextChanges = 0;
let nearZeroFlagChanges = 0;
let screeningColorChanges = 0;
let minC3ValueMismatches = 0;
let minC3DateChanges = 0;
let minC3TofDaysChanges = 0;
const dateChangeSamples = [];
const relativeDifferences = [];
let bestWindowsBodiesV2 = 0;
for (let index = 0; index < Math.max(oldBodies.length, newBodies.length); index += 1) {
  const oldBody = oldBodies[index];
  const newBody = newBodies[index];
  if (!oldBody || !newBody) {
    bodyOrderDifferences += 1;
    continue;
  }
  if (oldBody.bodyId !== newBody.bodyId || oldBody.spkId !== newBody.spkId || oldBody.designation !== newBody.designation) {
    bodyOrderDifferences += 1;
  }
  statusMatrix[oldBody.status][newBody.status] += 1;
  if (oldBody.isCoOrbital !== newBody.isCoOrbital) isCoOrbitalChanges += 1;
  if (formatC3(oldBody.minC3) !== formatC3(newBody.minC3)) c3TextChanges += 1;
  if (oldBody.isNearZeroC3Degenerate !== newBody.isNearZeroC3Degenerate) nearZeroFlagChanges += 1;
  if (getScreeningColor(oldBody).getHexString() !== getScreeningColor(newBody).getHexString()) screeningColorChanges += 1;
  if (Object.hasOwn(newBody, 'bestWindows')) bestWindowsBodiesV2 += 1;
  if (oldBody.minC3 === null || newBody.minC3 === null || !Number.isFinite(oldBody.minC3) || !Number.isFinite(newBody.minC3)) {
    if (oldBody.minC3 !== newBody.minC3) minC3ValueMismatches += 1;
  } else {
    const absoluteDifference = Math.abs(newBody.minC3 - oldBody.minC3);
    const relativeDifference = oldBody.minC3 === 0 ? (newBody.minC3 === 0 ? 0 : Infinity) : absoluteDifference / Math.abs(oldBody.minC3);
    relativeDifferences.push(relativeDifference);
  }
  if (oldBody.minC3Date !== newBody.minC3Date) {
    minC3DateChanges += 1;
    if (dateChangeSamples.length < 12) dateChangeSamples.push({ designation: oldBody.designation, old: oldBody.minC3Date, new: newBody.minC3Date, field: 'minC3Date' });
  }
  if (oldBody.minC3TofDays !== newBody.minC3TofDays) {
    minC3TofDaysChanges += 1;
    if (dateChangeSamples.length < 12) dateChangeSamples.push({ designation: oldBody.designation, old: oldBody.minC3TofDays, new: newBody.minC3TofDays, field: 'minC3TofDays' });
  }
}

function metadataDifferences(left, right, prefix = 'metadata') {
  if (Object.is(left, right)) return [];
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object' || Array.isArray(left) !== Array.isArray(right)) {
    return [{ path: prefix, old: left, new: right }];
  }
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const differences = [];
  for (const key of [...keys].sort()) {
    if (prefix === 'metadata' && ['generatedAt', 'wallTimeSeconds', 'totalSolves', 'provenance', 'schemaVersion'].includes(key)) continue;
    if (!(key in left) || !(key in right)) differences.push({ path: `${prefix}.${key}`, old: left[key], new: right[key] });
    else differences.push(...metadataDifferences(left[key], right[key], `${prefix}.${key}`));
  }
  return differences;
}
const offDiagonal = Object.entries(statusMatrix).reduce((sum, [oldStatus, row]) => sum + Object.entries(row).reduce((n, [newStatus, count]) => n + (oldStatus === newStatus ? 0 : count), 0), 0);
const sortedRelative = [...relativeDifferences].sort((a, b) => a - b);
const median = sortedRelative.length === 0 ? null : sortedRelative.length % 2 === 1
  ? sortedRelative[(sortedRelative.length - 1) / 2]
  : (sortedRelative[sortedRelative.length / 2 - 1] + sortedRelative[sortedRelative.length / 2]) / 2;
const maxRelative = sortedRelative.length === 0 ? null : sortedRelative[sortedRelative.length - 1];
const unexpectedMetadataDifferences = metadataDifferences(v1Raw.metadata, v2Raw.metadata);
const gzip9 = (bytes) => gzipSync(bytes, { level: 9 }).length;
const brotli11 = (bytes) => brotliCompressSync(bytes, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY } }).length;
const sizes = {
  v1: { rawBytes: v1Bytes.length, gzip9Bytes: gzip9(v1Bytes), brotli11Bytes: brotli11(v1Bytes) },
  v2: { rawBytes: v2Bytes.length, gzip9Bytes: gzip9(v2Bytes), brotli11Bytes: brotli11(v2Bytes) },
};
const criteria = {
  bothCachesValidate: true,
  bodyCount41906: oldBodies.length === 41906 && newBodies.length === 41906,
  sameBodyOrder: bodyOrderDifferences === 0,
  statusMatrixDiagonal: offDiagonal === 0,
  isCoOrbitalUnchanged: isCoOrbitalChanges === 0,
  displayedC3TextUnchanged: c3TextChanges === 0,
  nearZeroFlagUnchanged: nearZeroFlagChanges === 0,
  screeningColorsUnchanged: screeningColorChanges === 0,
  minC3RelativeDifferenceWithin1e12: maxRelative !== null && maxRelative <= 1e-12,
  noMismatchedMinC3Nulls: minC3ValueMismatches === 0,
  noUnexpectedMetadataDifferences: unexpectedMetadataDifferences.length === 0,
  schemaVersion2HasNoBestWindows: v2Raw.metadata.schemaVersion === 2 && bestWindowsBodiesV2 === 0,
};
const result = {
  v1Sha256: createHash('sha256').update(v1Bytes).digest('hex'),
  v2Sha256: createHash('sha256').update(v2Bytes).digest('hex'),
  schemas: { v1: v1Raw.metadata.schemaVersion, v2: v2Raw.metadata.schemaVersion },
  bodyCount: { v1: oldBodies.length, v2: newBodies.length },
  bodyOrderDifferences,
  statusMatrix,
  statusOffDiagonal: offDiagonal,
  isCoOrbitalChanges,
  displayedC3TextChanges: c3TextChanges,
  nearZeroFlagChanges,
  screeningColorChanges,
  minC3: { finitePairs: relativeDifferences.length, mismatchedNullOrNonFiniteValues: minC3ValueMismatches, maxRelativeDifference: maxRelative, medianRelativeDifference: median },
  minC3DateChanges,
  minC3TofDaysChanges,
  dateChangeSamples,
  bestWindowsBodiesV2,
  unexpectedMetadataDifferences,
  sizes,
  criteria,
  pass: Object.values(criteria).every(Boolean),
};
writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ pass: result.pass, v1Sha256: result.v1Sha256, v2Sha256: result.v2Sha256, statusOffDiagonal: result.statusOffDiagonal, isCoOrbitalChanges, displayedC3TextChanges: c3TextChanges, nearZeroFlagChanges, screeningColorChanges, minC3: result.minC3, minC3DateChanges, minC3TofDaysChanges, sizes, criteria }, null, 2));
if (!result.pass) process.exitCode = 1;