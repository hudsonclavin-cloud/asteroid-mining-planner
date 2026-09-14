#!/usr/bin/env node
/**
 * FRONT C TIER SIZING — catalog-wide, no network.
 *
 * Sizes the three disclosure tiers Hudson named, from committed data plus the delta-v
 * scope already computed. The load-bearing number is the CANNOT-BOUND population:
 * bodies whose dominant perturber lies outside what any available data source will
 * return, so no honest error statement can be made about them at all.
 *
 * Jupiter-crossing threshold: Q >= 4.95 AU (Jupiter perihelion). A body whose aphelion
 * reaches Jupiter's orbit can have Jupiter encounters, and CAD's measured 0.28 AU
 * Jupiter cap means those encounters are invisible to the instrument.
 *
 * Repo READ-ONLY.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const HERE = 'C:/Users/hudso/Documents/aster-slice18/audit';
const RESEARCH_DIR = path.join(REPO, 'tools/slice18-research');
const PER_BODY_OUT = path.join(RESEARCH_DIR, 'tier-sizing-per-body.json');
const CAD_PATH = path.join(RESEARCH_DIR, 'cad-wide/cad-all-0.3.json');
const AU_KM = 149597870.7;
const JUPITER_PERIHELION_AU = 4.95;

const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const bodies = Object.values(raw.asteroids);
const TOTAL = bodies.length;

const scope = JSON.parse(fs.readFileSync(path.join(HERE, 'dv-scope-results.json'), 'utf8'));
// rebuild the material set from the per-body top records we kept, plus recompute from source
const materialSet = new Set();
{
  const cad = JSON.parse(fs.readFileSync(CAD_PATH, 'utf8'));
  const F = cad.fields;
  const ix = { des: F.indexOf('des'), jd: F.indexOf('jd'), dist: F.indexOf('dist'), vrel: F.indexOf('v_rel'), body: F.indexOf('body') };
  const GM = scope.perturberGM;
  const END_JD = scope.windowEndJd;
  const SPD = 86400, J2000 = 2451545.0;
  const epochJd = new Map(bodies.map((b) => [b.designation, J2000 + (b.elements.epochTdbJd ? (b.elements.epochTdbJd - J2000) : 0)]));
  for (const b of bodies) epochJd.set(b.designation, b.elements.epochTdbJd);
  const acc = new Map();
  for (const r of cad.data) {
    const des = r[ix.des];
    const ep = epochJd.get(des);
    if (ep === undefined) continue;
    const jd = +r[ix.jd];
    if (jd <= ep) continue;
    const mu = GM[r[ix.body]];
    if (!mu) continue;
    const d = +r[ix.dist] * AU_KM, v = +r[ix.vrel];
    const dv = 2 * v * Math.sin(Math.atan(mu / (d * v * v)));
    const added = dv * Math.max(0, (END_JD - jd) * SPD);
    if (!acc.has(des) || added > acc.get(des)) acc.set(des, added);
  }
  for (const [des, added] of acc) if (added >= 1e6) materialSet.add(des);
}

// ---- classify ----
const NEA_CLASSES = ['APO', 'AMO', 'ATE', 'IEO'];
const rows = { nonExistent: [], hyperbolic: [], comet: [], jupiterCrossing: [], material: [], quiet: [] };
const counts = {};
const qHist = { 'lt_1.5': 0, '1.5-2': 0, '2-3': 0, '3-4.95': 0, '4.95-10': 0, '10-50': 0, 'ge_50': 0 };
let qMissing = 0;

const assign = [];
for (const b of bodies) {
  const des = b.designation;
  const e = b.elements.e;
  const aAU = b.elements.aKm / AU_KM;
  const Q = aAU * (1 + e);
  const isComet = ['JFC', 'HTC', 'ETC', 'CTc', 'COM', 'PAR', 'HYP'].includes(b.orbitClass) || !NEA_CLASSES.includes(b.orbitClass);
  const historicallyDestroyed = des === '3D' && b.name === '3D/Biela';
  const nonExistent = (b.anchorSource === 'stale-unanchored' && NEA_CLASSES.includes(b.orbitClass)) || historicallyDestroyed;
  const hyperbolic = !(e < 1) || !(aAU > 0);

  if (Number.isFinite(Q)) {
    if (Q < 1.5) qHist['lt_1.5'] += 1;
    else if (Q < 2) qHist['1.5-2'] += 1;
    else if (Q < 3) qHist['2-3'] += 1;
    else if (Q < JUPITER_PERIHELION_AU) qHist['3-4.95'] += 1;
    else if (Q < 10) qHist['4.95-10'] += 1;
    else if (Q < 50) qHist['10-50'] += 1;
    else qHist['ge_50'] += 1;
  } else qMissing += 1;

  // precedence: does not exist > cannot propagate > comet > Jupiter-crossing > material > quiet
  let classification;
  let fidelityTier;
  let subReason;
  if (nonExistent) {
    classification = 'nonExistent';
    fidelityTier = 'L0';
    subReason = historicallyDestroyed ? 'historically-destroyed-disintegration' : 'verified-destroyed-ephemeris-termination';
  } else if (hyperbolic) {
    classification = 'hyperbolic';
    fidelityTier = 'L0';
    subReason = 'cannot-propagate-hyperbolic-orbit';
  } else if (isComet) {
    classification = 'comet';
    fidelityTier = 'L2';
    subReason = 'structurally-blind-comet';
  } else if (Q >= JUPITER_PERIHELION_AU) {
    classification = 'jupiterCrossing';
    fidelityTier = 'L2';
    subReason = 'structurally-blind-jupiter-crossing';
  } else if (materialSet.has(des)) {
    classification = 'material';
    fidelityTier = 'L1';
    subReason = 'materially-degraded-delta-v';
  } else {
    classification = 'quiet';
    fidelityTier = 'L2';
    subReason = 'unmeasured';
  }
  counts[classification] = (counts[classification] || 0) + 1;
  assign.push({ des, tier: fidelityTier, subReason, classification, Q: +Q.toFixed(3), e: +e.toFixed(4), aAU: +aAU.toFixed(3), orbitClass: b.orbitClass, material: materialSet.has(des) });
}
const fidelityCounts = Object.fromEntries(['L0', 'L1', 'L2'].map((tier) => [tier, assign.filter((row) => row.tier === tier).length]));
const structurallyBlindCount = assign.filter((row) => row.tier === 'L2' && row.subReason.startsWith('structurally-blind-')).length;
if (fidelityCounts.L0 !== 11 || fidelityCounts.L1 !== 10150 || fidelityCounts.L2 !== 31745 || TOTAL !== 41906 || structurallyBlindCount !== 688) throw new Error(`Front C population mismatch: ${JSON.stringify({ total: TOTAL, fidelityCounts, structurallyBlindCount })}`);

// overlaps that matter for the design
const jupCrossingAlsoMaterial = assign.filter((r) => r.tier === 'jupiterCrossing' && r.material).length;
const quietCount = counts.quiet || 0;
const cannotBound = (counts.jupiterCrossing || 0) + (counts.comet || 0) + (counts.hyperbolic || 0);

const results = {
  generatedAtUtc: new Date().toISOString(),
  catalogTotal: TOTAL,
  jupiterPerihelionAu: JUPITER_PERIHELION_AU,
  aphelionHistogram: qHist,
  qMissing,
  tierCounts: counts,
  tierPercent: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, +(100 * v / TOTAL).toFixed(2)])),
  cannotBoundTotal: cannotBound,
  cannotBoundPercent: +(100 * cannotBound / TOTAL).toFixed(2),
  jupiterCrossingAlsoHasMaterialCadEncounter: jupCrossingAlsoMaterial,
  materialSetSize: materialSet.size,
  note: 'Precedence: nonExistent > hyperbolic > comet > jupiterCrossing > material > quiet. A body is counted once, in its strongest tier.',
};
fs.writeFileSync(PER_BODY_OUT, JSON.stringify({ generatedAtUtc: results.generatedAtUtc, cadFetchedAtUtc: '2026-09-11T04:27:49.000Z', source: 'tier-sizing.mjs over nea-catalog-slice9.json + dv-scope-results.json + cad-all-0.3.json', catalogTotal: TOTAL, populations: { L0: fidelityCounts.L0, L1: fidelityCounts.L1, L2: fidelityCounts.L2, total: TOTAL, structurallyBlindL2: structurallyBlindCount }, records: Object.fromEntries(assign.sort((a, b) => a.des.localeCompare(b.des)).map((row) => [row.des, row])) }, null, 1));

const pct = (n) => (100 * n / TOTAL).toFixed(2) + '%';
console.log('catalog total: ' + TOTAL);
console.log('');
console.log('=== APHELION (Q) DISTRIBUTION, catalog-wide ===');
for (const [k, v] of Object.entries(qHist)) console.log('  Q ' + k.padEnd(10) + String(v).padStart(7) + '  ' + pct(v));
if (qMissing) console.log('  (non-finite Q: ' + qMissing + ')');
console.log('');
console.log('=== TIER SIZING (each body counted once, strongest tier) ===');
console.log('  does not exist (stale-unanchored NEA):  ' + String(counts.nonExistent || 0).padStart(7) + '  ' + pct(counts.nonExistent || 0));
console.log('  cannot propagate (e >= 1):             ' + String(counts.hyperbolic || 0).padStart(7) + '  ' + pct(counts.hyperbolic || 0));
console.log('  comet / not-kepler-safe class:         ' + String(counts.comet || 0).padStart(7) + '  ' + pct(counts.comet || 0));
console.log('  Jupiter-crossing (Q >= 4.95 AU):       ' + String(counts.jupiterCrossing || 0).padStart(7) + '  ' + pct(counts.jupiterCrossing || 0));
console.log('  materially degraded (delta-v >= 1e6):  ' + String(counts.material || 0).padStart(7) + '  ' + pct(counts.material || 0));
console.log('  no instrument signal ("quiet"):        ' + String(quietCount).padStart(7) + '  ' + pct(quietCount));
console.log('');
console.log('  CANNOT-BOUND TOTAL (comet + Jupiter-crossing + hyperbolic): ' + cannotBound + '  ' + pct(cannotBound));
console.log('  of the Jupiter-crossing, also have a material CAD encounter: ' + jupCrossingAlsoMaterial);
