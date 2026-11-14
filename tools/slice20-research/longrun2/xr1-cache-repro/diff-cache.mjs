#!/usr/bin/env node
// XR1 steps 1, 3 and 4 — provenance check, shipped-versus-recomputed diff, and what the catalog would
// show differently.
//
//   node diff-cache.mjs <recomputed-cache.json> <git-facts.json> <recompute.log>
//
// <git-facts.json> holds the answers that need git history (is solverCommit an ancestor of HEAD, which
// files differ since). They were obtained by hand in a full-history clone and written to that file;
// this script does not read git history. Hashes and byte counts are taken from Node Buffers.
//
// "Displayed" is derived from the production code that consumes the cache, not guessed:
//   status badge      src/v2/app/design/components/StatusBadge.ts:5-8 (one label per status value)
//   C3 text           src/v2/app/design/components/C3Value.ts:24-29 -> porkchop/format-c3.ts formatC3
//   co-orbital tag    src/v2/app/catalog-list/row.ts:176, :211 (isCoOrbital)
//   near-zero flag    src/v2/boundary/lambert-screen-cache.ts:112-115 -> core/constants/near-zero-c3.ts
//   3D point colour   src/v2/render/asteroid-screening-color.ts getScreeningColor (status, minC3 ramp
//                     over 0..25, co-orbital tint), taken here as THREE.Color.getHexString()
// minC3Date / minC3TofDays are not shown by the V2 site; mcp/src/tools/catalog-shared.ts:196-199 returns
// them. No non-test module under src/v2 or mcp/src reads bestWindows (grep at this commit).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FILES, importV2, quantile, readStamp, repoRoot } from '../lib/common2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [recomputedPath, gitFactsPath, recomputeLogPath] = process.argv.slice(2);
readStamp();
const { getScreeningColor } = await importV2('render/asteroid-screening-color.js');
const { formatC3 } = await importV2('porkchop/format-c3.js');
const { validateLambertScreenCache } = await importV2('boundary/lambert-screen-cache.js');

const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const fileFacts = (p) => { const b = fs.readFileSync(p); return { sha256: sha(b), bytes: b.length }; };
const shippedBuf = fs.readFileSync(path.join(repoRoot, FILES.cacheShipped));
const recomputedBuf = fs.readFileSync(recomputedPath);
const shipped = JSON.parse(shippedBuf.toString('utf8'));
const recomputed = JSON.parse(recomputedBuf.toString('utf8'));
const gitFacts = JSON.parse(fs.readFileSync(gitFactsPath, 'utf8'));
const log = fs.readFileSync(recomputeLogPath, 'utf8');

// ---- step 1: provenance --------------------------------------------------------------------------
const P = shipped.metadata.provenance;
const check = (name, now, recorded) => ({ name, verdict: now === recorded ? 'MATCH' : 'DRIFT', now, recorded });
const docsFacts = fileFacts(path.join(repoRoot, FILES.cacheDocs));
const provenance = {
  catalogFixture: check(FILES.catalog, fileFacts(path.join(repoRoot, FILES.catalog)).sha256, P.catalogFixtureSha256),
  horizonsFixture: check(FILES.earth, fileFacts(path.join(repoRoot, FILES.earth)).sha256, P.horizonsFixtureSha256),
  precomputeScript: check(FILES.precompute, fileFacts(path.join(repoRoot, FILES.precompute)).sha256, P.precomputeScriptSha256),
  docsVsTestsCache: { name: `${FILES.cacheDocs} vs ${FILES.cacheShipped}`, verdict: docsFacts.sha256 === sha(shippedBuf) ? 'MATCH' : 'DRIFT', docs: docsFacts, tests: { sha256: sha(shippedBuf), bytes: shippedBuf.length } },
  solverCommit: { recorded: P.solverCommit, ...gitFacts },
};

// ---- step 3: per-body diff -----------------------------------------------------------------------
const bodiesText = (buf) => { const t = buf.toString('utf8'); return t.slice(t.indexOf(',"bodies":') + 10); };
const bodiesIdentical = sha(Buffer.from(bodiesText(shippedBuf))) === sha(Buffer.from(bodiesText(recomputedBuf)));
const rByDes = new Map(recomputed.bodies.map((b) => [b.designation, b]));
const STATUSES = ['low_departure_c3', 'high_departure_c3', 'lambert_unconvergeable', 'propagator_failed'];
const matrix = Object.fromEntries(STATUSES.map((a) => [a, Object.fromEntries(STATUSES.map((b) => [b, 0]))]));
const winKey = (w) => `${w.launchDate}|${w.tofDays}`;
const sv = validateLambertScreenCache(shipped).bodies;
const rv = new Map(validateLambertScreenCache(recomputed).bodies.map((b) => [b.designation, b]));
const display = (b) => ({
  status: b.status,
  c3Text: formatC3(b.minC3),
  coOrbital: b.isCoOrbital,
  nearZero: b.isNearZeroC3Degenerate,
  colour: getScreeningColor(b).getHexString(),
});
const changes = {
  missingInRecomputed: [], extraInRecomputed: [], orderDiffers: false,
  status: [], isCoOrbital: [], identity: [],
  minC3Changed: [], minC3Cell: [], topWindow: [], top5Set: [], windowValuesOnly: [],
  displayed: [], displayedBy: { status: 0, c3Text: 0, coOrbital: 0, nearZero: 0, colour: 0 },
  valueChangedButNothingDisplayedChanges: 0,
};
const relDiffs = [];
for (let i = 0; i < shipped.bodies.length; i += 1) {
  const s = shipped.bodies[i];
  const r = rByDes.get(s.designation);
  if (!r) { changes.missingInRecomputed.push(s.designation); continue; }
  if (recomputed.bodies[i]?.designation !== s.designation) changes.orderDiffers = true;
  matrix[s.status][r.status] += 1;
  if (s.status !== r.status) changes.status.push({ des: s.designation, from: s.status, to: r.status, shippedMinC3: s.minC3, recomputedMinC3: r.minC3 });
  if (s.isCoOrbital !== r.isCoOrbital) changes.isCoOrbital.push({ des: s.designation, from: s.isCoOrbital, to: r.isCoOrbital });
  if (s.bodyId !== r.bodyId || s.spkId !== r.spkId) changes.identity.push(s.designation);
  if (s.minC3 !== r.minC3) {
    const rel = s.minC3 !== null && r.minC3 !== null && s.minC3 !== 0 ? Math.abs(r.minC3 - s.minC3) / Math.abs(s.minC3) : null;
    changes.minC3Changed.push({ des: s.designation, shipped: s.minC3, recomputed: r.minC3, rel });
    if (rel !== null) relDiffs.push(rel);
  }
  if (s.minC3Date !== r.minC3Date || s.minC3TofDays !== r.minC3TofDays) {
    changes.minC3Cell.push({ des: s.designation, shipped: [s.minC3Date, s.minC3TofDays], recomputed: [r.minC3Date, r.minC3TofDays], sameC3: s.minC3 === r.minC3 });
  }
  const sk = s.bestWindows.map(winKey);
  const rk = r.bestWindows.map(winKey);
  if (sk[0] !== rk[0]) changes.topWindow.push(s.designation);
  if (sk.slice().sort().join(',') !== rk.slice().sort().join(',')) changes.top5Set.push(s.designation);
  else if (JSON.stringify(s.bestWindows) !== JSON.stringify(r.bestWindows)) changes.windowValuesOnly.push(s.designation);
  // ---- step 4: what the catalog shows -------------------------------------------------------------
  const ds = display(sv[i]);
  const dr = display(rv.get(s.designation));
  const diffKeys = Object.keys(ds).filter((k) => ds[k] !== dr[k]);
  if (diffKeys.length) {
    changes.displayed.push({ des: s.designation, shipped: ds, recomputed: dr, differs: diffKeys });
    for (const k of diffKeys) changes.displayedBy[k] += 1;
  } else if (s.minC3 !== r.minC3) {
    changes.valueChangedButNothingDisplayedChanges += 1;
  }
}
const sDes = new Set(shipped.bodies.map((b) => b.designation));
for (const r of recomputed.bodies) if (!sDes.has(r.designation)) changes.extraInRecomputed.push(r.designation);

const IGNORED_META = new Set(['generatedAt', 'wallTimeSeconds', 'totalSolves', 'provenance']);
const metaDiff = [];
for (const key of new Set([...Object.keys(shipped.metadata), ...Object.keys(recomputed.metadata)])) {
  if (IGNORED_META.has(key)) continue;
  if (JSON.stringify(shipped.metadata[key]) !== JSON.stringify(recomputed.metadata[key])) metaDiff.push({ key, shipped: shipped.metadata[key], recomputed: recomputed.metadata[key] });
}
relDiffs.sort((a, b) => a - b);
const statusCounts = (c) => Object.fromEntries(STATUSES.map((st) => [st, c.bodies.filter((b) => b.status === st).length]));
const logFacts = {
  exit: (log.match(/EXIT (\d+)/) ?? [])[1] ?? null,
  completeLine: (log.match(/Precompute complete in [^\n]+/) ?? [null])[0],
  totalSolvesLine: (log.match(/Total solves: [^\n]+/) ?? [null])[0],
  coOrbitalLine: (log.match(/Co-orbital bodies tagged: [^\n]+/) ?? [null])[0],
};
const result = {
  schema: 'aster-s20-longrun2-xr1-diff/1',
  label: 'LEADS-grade research evidence. Nothing here enters a DEC, a test, a fixture or the site.',
  generatedAtUtc: new Date().toISOString(),
  node: process.version,
  provenance,
  recompute: {
    file: { sha256: sha(recomputedBuf), bytes: recomputedBuf.length },
    shippedFile: { sha256: sha(shippedBuf), bytes: shippedBuf.length },
    wholeFileIdentical: sha(recomputedBuf) === sha(shippedBuf),
    bodiesSectionByteIdentical: bodiesIdentical,
    metadata: { shipped: shipped.metadata, recomputed: recomputed.metadata },
    log: logFacts,
  },
  bodies: { shipped: shipped.bodies.length, recomputed: recomputed.bodies.length, sameOrder: !changes.orderDiffers, missingInRecomputed: changes.missingInRecomputed, extraInRecomputed: changes.extraInRecomputed },
  statusCounts: { shipped: statusCounts(shipped), recomputed: statusCounts(recomputed) },
  statusMatrixFromTo: matrix,
  statusChanges: changes.status,
  isCoOrbitalChanges: changes.isCoOrbital,
  coOrbitalCount: { shipped: shipped.bodies.filter((b) => b.isCoOrbital).length, recomputed: recomputed.bodies.filter((b) => b.isCoOrbital).length },
  identityChanges: changes.identity,
  minC3: {
    bodiesChanged: changes.minC3Changed.length,
    maxRelDiff: relDiffs.length ? relDiffs[relDiffs.length - 1] : 0,
    medianRelDiffAmongChanged: relDiffs.length ? quantile(relDiffs, 0.5) : null,
    largest25: changes.minC3Changed.filter((x) => x.rel !== null).sort((a, b) => b.rel - a.rel).slice(0, 25),
  },
  minC3CellChanges: { count: changes.minC3Cell.length, withSameC3: changes.minC3Cell.filter((x) => x.sameC3).length, first25: changes.minC3Cell.slice(0, 25) },
  bestWindows: { differentTopWindow: changes.topWindow.length, differentTop5Set: changes.top5Set.length, sameCellsDifferentValues: changes.windowValuesOnly.length, firstTopWindowChanges: changes.topWindow.slice(0, 25) },
  metadataDifferencesOtherThanExpected: metaDiff,
  displayed: {
    how: 'production StatusBadge labels (one per status), formatC3, isCoOrbital, isNearZeroC3Degenerate, getScreeningColor(...).getHexString()',
    bodiesShownDifferently: changes.displayed.length,
    byComponent: changes.displayedBy,
    lowHighClassificationChanges: changes.status.filter((x) => ['low_departure_c3', 'high_departure_c3'].includes(x.from) && ['low_departure_c3', 'high_departure_c3'].includes(x.to)).length,
    valueChangedButNothingDisplayedChanges: changes.valueChangedButNothingDisplayedChanges,
    first50: changes.displayed.slice(0, 50),
  },
};
fs.writeFileSync(path.join(here, 'xr1-cache-diff.json'), `${JSON.stringify(result, null, 2)}\n`);

// The recomputed cache itself: committed gzipped only when it differs from the shipped one.
const gzName = 'recomputed-lambert-screen-cache.json.gz';
for (const f of fs.readdirSync(here)) if (f.startsWith('recomputed-lambert-screen-cache')) fs.rmSync(path.join(here, f));
let committedCopy = 'not committed: the bodies section is byte-identical to the shipped fixture, so the shipped file plus the sha256 above reproduce it';
if (!bodiesIdentical) {
  const gz = zlib.gzipSync(recomputedBuf, { level: 9 });
  if (gz.length <= 9_500_000) { fs.writeFileSync(path.join(here, gzName), gz); committedCopy = `${gzName} (${gz.length} bytes gzip)`; } else {
    const half = Math.ceil(recomputed.bodies.length / 2);
    const parts = [recomputed.bodies.slice(0, half), recomputed.bodies.slice(half)].map((bodies, k) => zlib.gzipSync(Buffer.from(`${JSON.stringify(k === 0 ? { metadata: recomputed.metadata, part: 1, parts: 2, bodies } : { part: 2, parts: 2, bodies })}\n`), { level: 9 }));
    if (parts.every((p) => p.length <= 9_500_000)) { parts.forEach((p, k) => fs.writeFileSync(path.join(here, `recomputed-lambert-screen-cache.part${k + 1}of2.json.gz`), p)); committedCopy = `two gzip parts (${parts.map((p) => p.length).join(' and ')} bytes)`; } else committedCopy = `not committed: gzip parts exceed 10 MB; full file sha256 ${sha(recomputedBuf)}, ${recomputedBuf.length} bytes`;
  }
}
result.recomputedCopy = committedCopy;
fs.writeFileSync(path.join(here, 'xr1-cache-diff.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  provenance: Object.fromEntries(Object.entries(provenance).filter(([k]) => k !== 'solverCommit').map(([k, v]) => [k, v.verdict])),
  wholeFileIdentical: result.recompute.wholeFileIdentical, bodiesSectionByteIdentical: bodiesIdentical,
  statusChanges: changes.status.length, coOrbitalChanges: changes.isCoOrbital.length, minC3Changed: changes.minC3Changed.length, maxRel: result.minC3.maxRelDiff,
  minC3CellChanges: changes.minC3Cell.length, topWindow: changes.topWindow.length, top5Set: changes.top5Set.length, windowValuesOnly: changes.windowValuesOnly.length,
  metaDiff, displayed: changes.displayed.length, displayedBy: changes.displayedBy, log: logFacts, committedCopy,
}, null, 1));
