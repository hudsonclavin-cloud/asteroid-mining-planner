// Front C full disclosure strings (Slice 18 close-out, Item 5; DEC-18-8).
//
// Every sentence is pinned VERBATIM against the committed tier artifact, and
// the values inside them are traced to a second, independently produced
// artifact where one exists:
//   - L1 encounter (date, body, δv): dv-scope-per-body.json, written by
//     dv-scope.mjs — a different script from tier-sizing.mjs, which now
//     carries the same encounter into the tier artifact.
//   - impactor termination dates: the Front B truth fixture (0d927e4).
//   - 3D/Biela first-day drift: nea-drift-results.json.
// The catalog-wide test enforces hard stop 6's rule in the only direction that
// can be tested: there must be NO body whose string needs a value the
// committed data lacks (a null would mean "omit and record").

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-tier-disclosure');
const tierArtifactPath = path.join(repoRoot, 'tools', 'slice18-research', 'tier-sizing-per-body.json');
const dvScopePath = path.join(repoRoot, 'tools', 'slice18-research', 'dv-scope-per-body.json');
const truthPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-drift-truth-2026-2046.json');
const neaDriftPath = path.join(repoRoot, 'tools', 'slice18-research', 'nea-drift-results.json');
const cadPath = path.join(repoRoot, 'tools', 'slice18-research', 'cad-wide', 'cad-all-0.3.json');
const dvScopeResultsPath = path.join(repoRoot, 'tools', 'slice18-research', 'dv-scope-results.json');
const catalogPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

const VERBATIM = {
  '2018 LA':
    'This object no longer exists. Its JPL ephemeris terminates 2018-06-02 at a verified Earth impact. ' +
    'The transfer windows below are computed from its last known orbit and describe a mission to nothing.',
  '3D':
    'This object no longer exists. Comet 3D/Biela disintegrated in the 1840s-50s. That is historical record, ' +
    'not ephemeris-verified. The transfer windows below are computed from 1832 elements and are 253 million km ' +
    "wrong on the window's first day.",
  '2015 D1':
    'Aster cannot propagate this object. Its eccentricity is 1.0035, which is not an elliptical orbit. ' +
    'No transfer windows are computed.',
  // Apophis: the EARLIEST material encounter is the 2028-Sep-12 Earth pass (δv 2.6 m/s,
  // ≥ 1e6 km by the window's end under DEC-18-6) — not the famous 2029-Apr-13 flyby
  // (2,776 m/s), which is the LARGEST-drift row and is kept as maxDriftEncounterCd.
  '99942':
    'Screening for this object is supported through 2028-09-12. A close approach to Earth on that date changes ' +
    'its orbit by an estimated 2.6 m/s. Arrivals after it are computed from an orbit the encounter invalidates.',
  '3552':
    'Aster cannot bound the screening error for this object. Its orbit reaches 7.29 AU, and the close-approach ' +
    'data Aster uses does not cover encounters beyond 0.28 AU from Jupiter.',
  '433':
    'Aster has not measured the screening error for this object. Two-body propagation over the screening window ' +
    'drifted 0.46 to 330 million km across the 17 asteroids that were measured. This object was not among them.',
};

const THRESHOLD_PROVENANCE =
  '10^6 km is the drift at which the optimal transfer window was measured to move (3 of 15 tested cells); ' +
  'at 10^5 km, none moved. The number of objects above this threshold depends on the close-approach data ' +
  'snapshot and is not fixed.';

let modulesPromise = null;
async function loadModules() {
  if (modulesPromise === null) {
    modulesPromise = (async () => {
      fs.rmSync(tempOutDir, { recursive: true, force: true });
      fs.mkdirSync(tempOutDir, { recursive: true });
      const result = runTsc([
        '--pretty', 'false',
        '--outDir', tempOutDir,
        '--rootDir', path.join(repoRoot, 'src', 'v2'),
        '--module', 'NodeNext',
        '--target', 'ES2020',
        '--moduleResolution', 'NodeNext',
        '--isolatedModules', 'true',
        path.join(repoRoot, 'src', 'v2', 'porkchop', 'tier-disclosure.ts'),
      ]);
      assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
      const disclosure = await import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'tier-disclosure.js')).href);
      const artifact = JSON.parse(fs.readFileSync(tierArtifactPath, 'utf8'));
      return { disclosure, records: artifact.records, populations: artifact.populations };
    })();
  }
  return modulesPromise;
}

test('the six representative bodies render their sentences verbatim from the committed artifact', async () => {
  const { disclosure, records } = await loadModules();
  for (const [designation, expected] of Object.entries(VERBATIM)) {
    const record = records[designation];
    assert.ok(record, `${designation} must be in the tier artifact`);
    assert.equal(disclosure.fullTierDisclosure(record), expected, designation);
  }
  // The premise of each sentence, read back from the artifact rather than assumed.
  assert.equal(records['2018 LA'].subReason, 'verified-destroyed-ephemeris-termination');
  assert.equal(records['3D'].subReason, 'historically-destroyed-disintegration');
  assert.equal(records['2015 D1'].subReason, 'cannot-propagate-hyperbolic-orbit');
  assert.equal(records['99942'].subReason, 'materially-degraded-delta-v');
  assert.equal(records['3552'].subReason, 'structurally-blind-jupiter-crossing');
  assert.equal(records['433'].subReason, 'unmeasured');
});

test('every one of the 41,906 bodies has a full sentence — no value is missing from committed data', async () => {
  const { disclosure, records, populations } = await loadModules();
  const entries = Object.values(records);
  assert.equal(entries.length, 41_906);
  const missing = entries.filter((record) => disclosure.fullTierDisclosure(record) === null).map((r) => r.des);
  assert.deepEqual(missing, [], 'bodies whose sentence would need an uncommitted value (omit + record if any)');
  // Cross-tier arithmetic on the artifact this module reads.
  const byTier = { L0: 0, L1: 0, L2: 0 };
  for (const record of entries) byTier[record.tier] += 1;
  assert.deepEqual(byTier, { L0: 11, L1: 10150, L2: 31745 });
  assert.equal(byTier.L0 + byTier.L1 + byTier.L2, 41_906);
  assert.deepEqual(populations, { L0: 11, L1: 10150, L2: 31745, total: 41906, structurallyBlindL2: 688 });
});

test('L1: the max-drift date traces to dv-scope-per-body.json, and the boundary is the EARLIEST material encounter, recomputed from the CAD snapshot', async () => {
  const { records } = await loadModules();
  const dvScope = JSON.parse(fs.readFileSync(dvScopePath, 'utf8')).records;
  const l1 = Object.values(records).filter((record) => record.tier === 'L1');
  assert.equal(l1.length, 10_150);

  // (a) The materiality row is the one a DIFFERENT script recorded — exact string equality.
  const traceMismatches = l1.filter((record) => dvScope[record.des]?.cd !== record.maxDriftEncounterCd).map((r) => r.des);
  assert.deepEqual(traceMismatches, []);

  // (b) The boundary is recomputed here, independently of tier-sizing.mjs, from the
  // committed CAD snapshot with the DEC-18-6 criterion: the earliest row after the
  // body's element epoch whose own added drift (dv × time remaining) reaches 1e6 km.
  const cad = JSON.parse(fs.readFileSync(cadPath, 'utf8'));
  const scope = JSON.parse(fs.readFileSync(dvScopeResultsPath, 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')).asteroids;
  const epochByDes = new Map(Object.values(catalog).map((body) => [body.designation, body.elements.epochTdbJd]));
  const col = Object.fromEntries(['des', 'jd', 'cd', 'dist', 'v_rel', 'body'].map((name) => [name, cad.fields.indexOf(name)]));
  const AU_KM = 149_597_870.7;
  const l1Set = new Set(l1.map((record) => record.des));
  const earliest = new Map();
  for (const row of cad.data) {
    const des = row[col.des];
    if (!l1Set.has(des)) continue;
    const jd = Number(row[col.jd]);
    if (jd <= epochByDes.get(des)) continue;
    const mu = scope.perturberGM[row[col.body]];
    if (!mu) continue;
    const d = Number(row[col.dist]) * AU_KM;
    const v = Number(row[col.v_rel]);
    const dv = 2 * v * Math.sin(Math.atan(mu / (d * v * v)));
    const added = dv * Math.max(0, (scope.windowEndJd - jd) * 86_400);
    if (added < 1e6) continue;
    const prev = earliest.get(des);
    if (prev === undefined || jd < prev.jd) earliest.set(des, { jd, cd: row[col.cd], body: row[col.body], dvKmS: dv });
  }
  const boundaryMismatches = [];
  let precedesMaxDrift = 0;
  for (const record of l1) {
    const expected = earliest.get(record.des);
    const carried = record.encounter;
    if (!expected || !carried) {
      boundaryMismatches.push(`${record.des}: missing`);
      continue;
    }
    if (carried.jd !== expected.jd || carried.cd !== expected.cd || carried.body !== expected.body || Math.abs(carried.dvKmS - expected.dvKmS) > 1e-12 * expected.dvKmS) {
      boundaryMismatches.push(`${record.des}: ${JSON.stringify(carried)} vs ${JSON.stringify(expected)}`);
    }
    if (carried.cd !== record.maxDriftEncounterCd) precedesMaxDrift += 1;
  }
  assert.deepEqual(boundaryMismatches, []);
  // The correction this test exists for: the earliest material encounter precedes the
  // max-drift row for a large minority of L1 bodies. Shipping the max-drift date would
  // over-claim support for them.
  assert.equal(precedesMaxDrift, 2_352);
  // Bodies that are not L1 carry no encounter — the field is a tier claim, not a CAD dump.
  assert.equal(Object.values(records).filter((record) => record.tier !== 'L1' && record.encounter !== undefined).length, 0);
});

test('impactor dates and the 3D drift trace to the truth fixture and nea-drift-results.json', async () => {
  const { records } = await loadModules();
  const truth = JSON.parse(fs.readFileSync(truthPath, 'utf8')).findings.S_nonExistentCatalogBodies.bodies;
  assert.equal(truth.length, 9);
  for (const body of truth) {
    assert.equal(records[body.designation].terminationTdb, body.terminatesAfterTdb, body.designation);
    assert.equal(records[body.designation].tier, 'L0');
  }
  const withTermination = Object.values(records).filter((record) => record.terminationTdb !== undefined);
  assert.equal(withTermination.length, 9);
  const neaDrift = JSON.parse(fs.readFileSync(neaDriftPath, 'utf8'));
  assert.equal(records['3D'].firstDayDriftKm, neaDrift.bodies['3D'].B_catalogElements.at_first_record_km);
  assert.equal(Object.values(records).filter((record) => record.firstDayDriftKm !== undefined).length, 1);
});

test('formatters: dates, million-km, m/s, AU — and no value is invented from junk', async () => {
  const { disclosure } = await loadModules();
  assert.equal(disclosure.formatDisclosureDate('2018-JUN-02 17:01:09.1849 TDB'), '2018-06-02');
  assert.equal(disclosure.formatDisclosureDate('2029-Apr-13 21:46'), '2029-04-13');
  assert.equal(disclosure.formatDisclosureDate('not a date'), null);
  assert.equal(disclosure.formatMillionKm(253342299.89055187), '253 million');
  assert.equal(disclosure.formatMillionKm(Number.NaN), null);
  assert.equal(disclosure.formatMetersPerSecond(2.775704395041767), '2,776');
  assert.equal(disclosure.formatMetersPerSecond(0.00646024310864031), '6.5');
  assert.equal(disclosure.formatMetersPerSecond(3.003616155186443), '3,004');
  assert.equal(disclosure.formatAu(7.291), '7.29');
});

test('a record missing its value yields null (omit), never a sentence with a hole', async () => {
  const { disclosure } = await loadModules();
  const bareL1 = { des: 'x', tier: 'L1', subReason: 'materially-degraded-delta-v', classification: 'material' };
  assert.equal(disclosure.fullTierDisclosure(bareL1), null);
  assert.equal(disclosure.shortTierLabel(bareL1), 'supported until a dated encounter');
  const bareImpactor = { des: 'y', tier: 'L0', subReason: 'verified-destroyed-ephemeris-termination', classification: 'nonExistent' };
  assert.equal(disclosure.fullTierDisclosure(bareImpactor), null);
  assert.equal(disclosure.legendLineFor('L0'), 'L0 — no longer exists or cannot be propagated');
});

test('threshold provenance is verbatim and rides with every mention of 10^6 km; legend has one line per key', async () => {
  const { disclosure } = await loadModules();
  assert.equal(disclosure.THRESHOLD_PROVENANCE, THRESHOLD_PROVENANCE);
  assert.ok(disclosure.L1_CRITERION.includes('10^6 km'));
  assert.ok(disclosure.L1_CRITERION.endsWith(THRESHOLD_PROVENANCE));
  const legend = disclosure.TIER_LEGEND;
  assert.deepEqual(legend.map((entry) => entry.key), ['L0', 'L1', 'L2', 'PROP FAIL']);
  for (const entry of legend) {
    assert.ok(entry.line.length <= 48, `${entry.key} line must stay one line in a 320 px sidebar (${entry.line.length} chars)`);
    assert.ok(entry.title.length > entry.line.length);
    if (entry.title.includes('10^6 km')) {
      assert.ok(entry.title.includes(THRESHOLD_PROVENANCE), `${entry.key} names 10^6 km, so it must carry the provenance`);
    }
  }
  assert.ok(legend.find((entry) => entry.key === 'L1').title.includes(THRESHOLD_PROVENANCE));
});

test('short labels never expose a slug', async () => {
  const { disclosure, records } = await loadModules();
  const slugs = new Set(Object.values(records).map((record) => record.subReason));
  for (const record of [records['2018 LA'], records['3D'], records['2015 D1'], records['99942'], records['3552'], records['433']]) {
    const label = disclosure.shortTierLabel(record);
    assert.ok(!slugs.has(label), `${record.des}: '${label}' is a slug`);
    // letter-hyphen-letter is slug style; digit-hyphen-digit is a date and allowed.
    assert.ok(!/[a-z]-[a-z]/i.test(label), `${record.des}: '${label}' looks like an identifier`);
  }
  assert.equal(disclosure.shortTierLabel(records['99942']), 'supported through 2028-09-12');
  assert.equal(records['99942'].maxDriftEncounterCd, '2029-Apr-13 21:46', 'the 2029 flyby is still traceable in the record');
});
