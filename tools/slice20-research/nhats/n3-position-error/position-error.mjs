#!/usr/bin/env node
// N3 POSITION ERROR AND WHAT IT COSTS (Q2).
//   NHATS_STORE=<store> node tools/slice20-research/nhats/n3-position-error/position-error.mjs
// At every N2 epoch (calendar date as TDB 0h): the asteroid from Aster's OWN production path (the porkchop
// worker's propagateTargetStateAtTdbSeconds = propagateKeplerianStateVectors(body.elements, t), behind the
// assessPropagation guard), against Horizons. Earth from the fixture (the worker's
// interpolateBodyStateSeries('earth', ...)) against Horizons, where the epoch is inside the fixture span.
// Then N2's quantities again with Aster's positions, two ways:
//   (a) asteroid-only: Aster's asteroid + Horizons Earth - isolates the asteroid's position error;
//   (b) full production: Aster's asteroid + fixture Earth - only when launch and return are inside the Earth
//       span (outside it production refuses, DEC-20-3 / INV-008).
// Support: an L1 body's support boundary is supportBoundaryFor(tier).encounterJd (encounter.jd); an epoch is
// 'after' when it is at or after it (isArrivalAfterEncounter's >=). L2 bodies have no boundary in production.
// A return quantity is classified by the asteroid-departure epoch (DEC-20-5); a trajectory by both epochs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readStamp, importV2, loadCatalogBodies, loadEarthSeries, loadTiers, writeJsonAtomic, quantile } from '../lib/aster.mjs';
import { evaluateRoundTrip, dursOf } from '../lib/legs.mjs';
import { trajEpochs } from '../n2-agreement/fetch-states.mjs';
import { statesFor, vinfFromEntry } from '../n2-agreement/agreement.mjs';

console.debug = () => {};
readStamp();
const here = path.dirname(fileURLToPath(import.meta.url));
const { propagateKeplerianStateVectors } = await importV2('core/propagators/keplerian.js');
const { interpolateBodyStateSeries } = await importV2('core/interpolators/hermite.js');
const { assessPropagation } = await importV2('porkchop/propagation-guard.js');
const { supportBoundaryFor } = await importV2('porkchop/support-boundary.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');
const n2 = JSON.parse(fs.readFileSync(path.join(here, '..', 'n2-agreement', 'n2-agreement.json'), 'utf8'));
const sample = JSON.parse(fs.readFileSync(path.join(here, '..', 'n1-sample', 'n1-sample.json'), 'utf8'));
const catalog = new Map((await loadCatalogBodies()).map((b) => [b.designation, b]));
const tiers = loadTiers();
const earthSeries = await loadEarthSeries();
const FIX_START = earthSeries[0].tdbSeconds; const FIX_END = earthSeries[earthSeries.length - 1].tdbSeconds;
const GRID_START_JD = 2461041.5; // 2026-01-01, the Earth fixture's (and the porkchop grid's) first day
const tdbS = (jd) => (jd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mag = (a) => Math.hypot(a[0], a[1], a[2]);
const km = (s) => ({ r: [s.positionM.x / 1e3, s.positionM.y / 1e3, s.positionM.z / 1e3], v: [s.velocityMps.x / 1e3, s.velocityMps.y / 1e3, s.velocityMps.z / 1e3] });
const inSpan = (jd) => tdbS(jd) >= FIX_START && tdbS(jd) <= FIX_END;

const epochRows = [];
const earthRows = [];
const trajRows = [];
const refused = [];
const hzStates = JSON.parse(fs.readFileSync(path.join(here, '..', 'n2-agreement', 'horizons-states.json'), 'utf8'));
const n2ByKey = new Map(n2.rows.map((x) => [`${x.des}|${x.kind}`, x]));
const notInN2 = [];
// Every sampled trajectory gets its asteroid position errors (they need no Earth state); the cost rows need N2's.
for (const sb of sample.bodies) for (const kind of ['min_dv_traj', 'min_dur_traj']) {
  const t = sb.nhats[kind];
  if (!t || !hzStates.bodies[sb.des]?.rows) continue;
  const r0 = n2ByKey.get(`${sb.des}|${kind}`);
  const r = r0 ?? { des: sb.des, kind, tier: sb.tier };
  const body = catalog.get(r.des);
  const tierRec = tiers.get(r.des);
  const boundary = supportBoundaryFor(tierRec);
  const S = boundary?.encounterJd ?? null;
  const verdict = assessPropagation(body.elements);
  const e = trajEpochs(t).tdb0h;
  const ha = hzStates.bodies[r.des].rows;
  const kk = (jd) => jd.toFixed(9);
  const cls = (jd) => (S === null ? 'no-boundary' : jd >= S ? 'after' : 'before');
  if (!verdict.propagatable) { refused.push({ des: r.des, kind: r.kind, reason: verdict.reason }); continue; }
  const aster = (jd) => km(propagateKeplerianStateVectors(body.elements, tdbS(jd)));
  const aA = aster(e.A); const aD = aster(e.D);
  for (const [which, jd, a, hv] of [['arrival', e.A, aA, ha[kk(e.A)]], ['departure', e.D, aD, ha[kk(e.D)]]]) {
    epochRows.push({ des: r.des, kind: r.kind, tier: r.tier, which, jd, supportJd: S, support: cls(jd), daysFromSupport: S === null ? null : jd - S,
      daysFromElementsEpoch: jd - (J2000_TDB_JULIAN_DATE + body.elements.epochTdbSeconds / SECONDS_PER_DAY), beforeGridStart: jd < GRID_START_JD,
      posErrKm: mag(sub(a.r, hv.r)), velErrKmS: mag(sub(a.v, hv.v)) });
  }
  if (!r0) { notInN2.push({ des: r.des, kind: r.kind }); continue; }
  const h = statesFor(r.des, e);
  const earthAt = {};
  for (const [which, jd, hv] of [['launch', e.L, h.eL], ['return', e.R, h.eR]]) {
    if (!inSpan(jd)) { earthRows.push({ des: r.des, kind: r.kind, which, jd, inSpan: false }); continue; }
    const f = km(interpolateBodyStateSeries('earth', earthSeries, tdbS(jd)));
    earthAt[which] = f;
    // Only a genuine Horizons Earth state is a comparison; a fixture fallback (N2) would compare the fixture with itself.
    if (hv.source !== 'horizons') { earthRows.push({ des: r.des, kind: r.kind, which, jd, inSpan: true, horizonsEarth: false }); continue; }
    earthRows.push({ des: r.des, kind: r.kind, which, jd, inSpan: true, horizonsEarth: true, posErrKm: mag(sub(f.r, hv.r)), velErrKmS: mag(sub(f.v, hv.v)) });
  }
  const evA = evaluateRoundTrip(e, dursOf(t), { eL: h.eL, aA, aD, eR: h.eR });
  const full = earthAt.launch && earthAt.return ? evaluateRoundTrip(e, dursOf(t), { eL: earthAt.launch, aA, aD, eR: earthAt.return }) : null;
  // Against NHATS: total dV uses entry-control model B (the bookkeeping N2 found NHATS to use); the Earth-return
  // v-inf has no published NHATS value, so it is inverted from the entry speed (DEC-20-8) and only for trajectories
  // NHATS did NOT entry-control (for those it publishes the controlled 12.000).
  const controlled = Number(t.vrel_arr_earth) > 0;
  const QMAP = { vrel_dep_neo: 'vrel_dep_neo', vinf_ret_earth: 'vinf_ret_earth', dv_total_400: 'dv_total_400_modelB', c3: 'c3', vrel_arr_neo: 'vrel_arr_neo' };
  const nh = { vrel_dep_neo: Number(t.vrel_dep_neo), vinf_ret_earth: controlled ? null : vinfFromEntry(Number(t.v_arr_earth)), dv_total_400: Number(t.dv_total), c3: Number(t.c3), vrel_arr_neo: Number(t.vrel_arr_neo) };
  const pick = (ev) => (ev && ev.ok ? Object.fromEntries(Object.entries(QMAP).map(([k, qk]) => [k, ev.q[qk]])) : null);
  const qa = pick(evA); const qf = pick(full);
  const errs = (q) => (q ? Object.fromEntries(Object.keys(nh).map((k) => [k, { vsNhats: nh[k] === null ? null : q[k] - nh[k], vsHorizonsFed: q[k] - r.q[QMAP[k]] }])) : null);
  const trajClass = S === null ? 'no-boundary' : e.A >= S ? 'after' : e.D >= S ? 'straddle' : 'before';
  trajRows.push({ des: r.des, kind: r.kind, tier: r.tier, earthSourceN2: r.earthSource?.tdb0h ?? null, supportJd: S, returnSupport: cls(e.D), trajClass, launchBeforeGridStart: e.L < GRID_START_JD, fullProductionPossible: Boolean(full),
    entryControlled: controlled, asteroidOnly: qa, asteroidOnlyErr: errs(qa), fullProduction: qf, fullProductionErr: errs(qf), nhats: nh, horizonsFed: Object.fromEntries(Object.keys(nh).map((k) => [k, r.q[QMAP[k]]])),
    maxAsteroidPosErrKm: Math.max(mag(sub(aA.r, ha[kk(e.A)].r)), mag(sub(aD.r, ha[kk(e.D)].r))) });
}
const stat = (vals) => { const s = vals.filter((v) => v !== null && Number.isFinite(v)).map(Math.abs).sort((a, b) => a - b); return { n: s.length, median: quantile(s, 0.5), p90: quantile(s, 0.9), max: s.length ? s[s.length - 1] : null }; };
const groups = (rows, keyFn) => { const m = new Map(); for (const x of rows) { const k = keyFn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); } return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)); };
const posByGroup = Object.fromEntries(groups(epochRows, (x) => `${x.tier}/${x.support}`).map(([k, xs]) => [k, { epochs: xs.length, posErrKm: stat(xs.map((x) => x.posErrKm)), velErrKmS: stat(xs.map((x) => x.velErrKmS)),
  inGridWindowOnly: { epochs: xs.filter((x) => !x.beforeGridStart).length, posErrKm: stat(xs.filter((x) => !x.beforeGridStart).map((x) => x.posErrKm)) } }]));
const BINS = [[-Infinity, -1000], [-1000, -365], [-365, -90], [-90, 0], [0, 90], [90, 365], [365, 1000], [1000, Infinity]];
const binLabel = ([a, b]) => `[${a}, ${b}) d`;
const l1ByDays = Object.fromEntries(BINS.map((bin) => { const xs = epochRows.filter((x) => x.tier === 'L1' && x.daysFromSupport >= bin[0] && x.daysFromSupport < bin[1]); return [binLabel(bin), { epochs: xs.length, posErrKm: stat(xs.map((x) => x.posErrKm)) }]; }));
const EBINS = [[-Infinity, -1000], [-1000, -365], [-365, 0], [0, 365], [365, 1000], [1000, 2000], [2000, Infinity]];
const byElemEpoch = Object.fromEntries(['L1', 'L2'].map((tier) => [tier, Object.fromEntries(EBINS.map((bin) => { const xs = epochRows.filter((x) => x.tier === tier && x.daysFromElementsEpoch >= bin[0] && x.daysFromElementsEpoch < bin[1]); return [binLabel(bin), { epochs: xs.length, posErrKm: stat(xs.map((x) => x.posErrKm)) }]; }))]));
const costBy = (rows, classKey) => Object.fromEntries(groups(rows, (x) => `${x.tier}/${x[classKey]}`).map(([k, xs]) => [k, {
  trajectories: xs.length,
  asteroidOnly: Object.fromEntries(['vrel_dep_neo', 'vinf_ret_earth', 'dv_total_400'].map((q) => [q, { vsNhats: stat(xs.map((x) => x.asteroidOnlyErr?.[q].vsNhats ?? null)), vsHorizonsFed: stat(xs.map((x) => x.asteroidOnlyErr?.[q].vsHorizonsFed ?? null)) }])),
  fullProduction: { trajectories: xs.filter((x) => x.fullProductionPossible).length, ...Object.fromEntries(['vrel_dep_neo', 'vinf_ret_earth', 'dv_total_400'].map((q) => [q, { vsNhats: stat(xs.map((x) => x.fullProductionErr?.[q].vsNhats ?? null)) }])) },
}]));
const inWindowBefore = epochRows.filter((x) => x.support === 'before' && !x.beforeGridStart).sort((a, b) => b.posErrKm - a.posErrKm);
const sampleByDes = new Map(sample.bodies.map((b) => [b.des, b]));
const outliersInsideSupport = inWindowBefore.slice(0, 10).map((x) => ({ ...x, nhatsCondition: sampleByDes.get(x.des).nhats.occ, h: sampleByDes.get(x.des).nhats.h, supportLabel: sampleByDes.get(x.des).supportDateLabel }));
const fromN0 = JSON.parse(fs.readFileSync(path.join(here, '..', 'n0-gate', 'n0-gate.json'), 'utf8')).frameCentreCheck_HorizonsEarthVsFixture;
const result = {
  schema: 'aster-s20-nhats-n3-position-error/1', generatedAtUtc: new Date().toISOString(),
  method: 'see the header comment of position-error.mjs',
  counts: { trajectories: trajRows.length, asteroidEpochs: epochRows.length, trajectoriesWithPositionErrorsOnly_notInN2: notInN2.length, refused, earthEpochs: earthRows.length, earthEpochsInSpan: earthRows.filter((x) => x.inSpan).length },
  positionErrorByTierAndSupport: posByGroup,
  positionErrorL1ByDaysFromSupport: l1ByDays,
  insideSupportAndGridWindow_L1: { epochs: inWindowBefore.length, posErrKm: stat(inWindowBefore.map((x) => x.posErrKm)), top10: outliersInsideSupport },
  inGridWindowByTierAndSupport: Object.fromEntries(groups(epochRows.filter((x) => !x.beforeGridStart), (x) => `${x.tier}/${x.support}`).map(([k, xs]) => [k, { epochs: xs.length, posErrKm: stat(xs.map((x) => x.posErrKm)), velErrKmS: stat(xs.map((x) => x.velErrKmS)) }])),
  positionErrorByDaysFromElementsEpoch: byElemEpoch,
  costByTierAndReturnSupport_DEC20_5: costBy(trajRows, 'returnSupport'),
  costByTierAndTrajectoryClass: costBy(trajRows, 'trajClass'),
  earthFixtureVsHorizons: { inSpan: earthRows.filter((x) => x.inSpan).length, outOfSpan: earthRows.filter((x) => !x.inSpan).length, withHorizonsEarth: earthRows.filter((x) => x.horizonsEarth).length, posErrKm: stat(earthRows.filter((x) => x.horizonsEarth).map((x) => x.posErrKm)), velErrKmS: stat(earthRows.filter((x) => x.horizonsEarth).map((x) => x.velErrKmS)), alsoSee: 'n5-earth-2046 (the 2040 overlap, 366 days)', fromN0_HorizonsEarthVsFixture: fromN0 },
  epochRows, earthRows, trajRows,
};
writeJsonAtomic(path.join(here, 'n3-position-error.json'), result);
const fmt = (s) => (s.n ? `n=${s.n} med=${s.median.toExponential(2)} p90=${s.p90.toExponential(2)} max=${s.max.toExponential(2)}` : 'n=0');
console.log('counts', JSON.stringify(result.counts));
for (const [k, v] of Object.entries(posByGroup)) console.log('pos', k, fmt(v.posErrKm), '| vel', fmt(v.velErrKmS), '| inWindow', fmt(v.inGridWindowOnly.posErrKm));
for (const [k, v] of Object.entries(l1ByDays)) console.log('L1 days-from-support', k, fmt(v.posErrKm));
for (const [t, bins] of Object.entries(byElemEpoch)) for (const [k, v] of Object.entries(bins)) console.log(t, 'days-from-elements-epoch', k, fmt(v.posErrKm));
for (const [name, c] of [['returnSupport', result.costByTierAndReturnSupport_DEC20_5], ['trajClass', result.costByTierAndTrajectoryClass]]) for (const [k, v] of Object.entries(c)) console.log('cost', name, k, `n=${v.trajectories}`, ['vrel_dep_neo', 'vinf_ret_earth', 'dv_total_400'].map((q) => `${q}: vsN ${fmt(v.asteroidOnly[q].vsNhats)}`).join(' || '), `| fullProd n=${v.fullProduction.trajectories} dvTot ${fmt(v.fullProduction.dv_total_400.vsNhats)}`);
console.log('earth', JSON.stringify(result.earthFixtureVsHorizons));
