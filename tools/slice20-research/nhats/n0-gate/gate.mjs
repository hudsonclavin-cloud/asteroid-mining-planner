#!/usr/bin/env node
// N0 GATE - reproduce the 2026-11-15 pilot for 99942 and 2000 SG344 (S20_NHATS_CROSSCHECK).
//   NHATS_STORE=<scratch store> node tools/slice20-research/nhats/n0-gate/gate.mjs
// NHATS record -> its min_dv trajectory -> Horizons heliocentric states of the asteroid (arrival, departure) and
// Earth (launch, return) at the trajectory's four epochs -> the unedited production kernel (lib/legs.mjs).
// Also: frame/centre check of Horizons Earth against the Earth fixture at the same epochs; epoch-convention
// sensitivity (calendar date read as TDB 0h, UTC 0h, TDB 12h); and the pilot's second claim (Aster's own
// Keplerian asteroid + fixture Earth), which is reported but is NOT part of the gate.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readStamp, importV2, loadCatalogBodies, loadEarthSeries, writeJsonAtomic } from '../lib/aster.mjs';
import { fetchNhatsObject, fetchHorizonsVectors, horizonsCommand } from '../lib/apis.mjs';
import { evaluateRoundTrip, epochsOf, dursOf, NHATS_FIELDS, sigFigs } from '../lib/legs.mjs';

console.debug = () => {};
const here = path.dirname(fileURLToPath(import.meta.url));
const stamp = readStamp();
const { propagateKeplerianStateVectors } = await importV2('core/propagators/keplerian.js');
const { interpolateBodyStateSeries } = await importV2('core/interpolators/hermite.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');

const BODIES = ['99942', '2000 SG344'];
// The dispatch's pilot numbers (Horizons positions in, production solver out) and what NHATS published.
const PILOT = {
  '99942': [['vrel_dep_neo', 1.2853, '1.285'], ['v_arr_earth_125km', 11.7440, '11.744']],
  '2000 SG344': [['c3', 1.5065, '1.507'], ['vrel_dep_neo', 0.1660, '0.166']],
};
const PILOT_KEPLER = { '99942': { value: 3.148, posErrMkm: 10 }, '2000 SG344': { value: 2.70, posErrMkm: 35 } };
// The pilot's own full-precision outputs, as its scratch scripts printed them in this cloud session
// (session transcript, tool results at 2026-11-16T03:43:17Z and 03:44:07Z UTC = 2026-11-15 Pacific). The
// pilot called lambertMultiRev directly with M 0 and 1; this gate goes through the kernel with M 0, 1, 2.
const PILOT_FULL = {
  '99942': { vrel_dep_neo: 1.2852645014733806, v_arr_earth_125km: 11.743951594533165, asterOwn_vrel_dep_neo: 3.148322037796044 },
  '2000 SG344': { c3: 1.506516468257234, vrel_dep_neo: 0.16595512631784967, asterOwn_vrel_dep_neo: 2.701001929042895 },
};
const OFFSETS = [['calendar date as TDB 0h (primary)', 0], ['calendar date as UTC 0h (TDB = UTC + 69.184 s)', 69.184 / 86_400], ['calendar date as TDB 12h', 0.5]];
const r9 = (x) => Number(x.toFixed(9));
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mag = (a) => Math.hypot(a[0], a[1], a[2]);
const round4 = (x) => Number(x.toPrecision(4));
const kmState = (s) => ({ r: [s.positionM.x / 1e3, s.positionM.y / 1e3, s.positionM.z / 1e3], v: [s.velocityMps.x / 1e3, s.velocityMps.y / 1e3, s.velocityMps.z / 1e3] });
const tdbS = (jd) => (jd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;

const catalog = new Map((await loadCatalogBodies()).map((b) => [b.designation, b]));
const earthSeries = await loadEarthSeries();
const requests = [];
const note = (r, what) => { requests.push({ what, url: r.url ?? null, file: r.file, sha256: r.sha256, fromCache: r.fromCache }); };

// 1. NHATS records (99942 was saved in Phase 0 and is served from that copy).
const nhats = {};
for (const des of BODIES) {
  const r = await fetchNhatsObject(des);
  note({ ...r, url: `nhats des=${des}` }, `NHATS ${des}`);
  nhats[des] = r.json;
}
// 2. Epochs (rounded to 1e-9 d so the requested epoch and the solved epoch are the same number).
const plan = {};
for (const des of BODIES) {
  const t = nhats[des].min_dv_traj;
  plan[des] = OFFSETS.map(([label, off]) => { const e = epochsOf(t, off); return { label, off, e: { L: r9(e.L), A: r9(e.A), D: r9(e.D), R: r9(e.R) } }; });
}
// 3. Horizons: one asteroid request per body (A, D x 3 conventions), one Earth request for all (L, R).
const hzAst = {};
for (const des of BODIES) {
  const jds = [...new Set(plan[des].flatMap((p) => [p.e.A, p.e.D]))].sort((a, b) => a - b);
  const r = await fetchHorizonsVectors(horizonsCommand(des), jds, `n0-horizons-${des}`);
  note(r, `Horizons asteroid ${des}`);
  hzAst[des] = r.parsed;
}
const earthJds = [...new Set(BODIES.flatMap((des) => plan[des].flatMap((p) => [p.e.L, p.e.R])))].sort((a, b) => a - b);
const hzE = await fetchHorizonsVectors('399', earthJds, 'n0-horizons-earth');
note(hzE, 'Horizons Earth');
const at = (parsed, jd) => {
  const row = parsed.rows.find((x) => Math.abs(x.jd - jd) < 1e-8);
  if (!row) throw new Error(`Horizons returned no row at JD ${jd} (rows: ${parsed.rows.map((x) => x.jd).join(', ')})`);
  return { r: row.r, v: row.v };
};

// 4. Frame and centre: Horizons Earth vs the fixture at the same epochs (in-span ones only).
const FIX_START = 2461041.5; const FIX_END = 2466519.5;
const frameCheck = earthJds.filter((jd) => jd >= FIX_START && jd <= FIX_END).map((jd) => {
  const h = at(hzE.parsed, jd); const f = kmState(interpolateBodyStateSeries('earth', earthSeries, tdbS(jd)));
  return { jd, positionDiffKm: mag(sub(h.r, f.r)), velocityDiffKmS: mag(sub(h.v, f.v)) };
});

// 5. Solve.
const bodies = {};
let gatePass = true;
for (const des of BODIES) {
  const t = nhats[des].min_dv_traj;
  const durs = dursOf(t);
  const variants = plan[des].map((p) => {
    const states = { eL: at(hzE.parsed, p.e.L), aA: at(hzAst[des], p.e.A), aD: at(hzAst[des], p.e.D), eR: at(hzE.parsed, p.e.R) };
    return { convention: p.label, epochsJdTdb: p.e, ...evaluateRoundTrip(p.e, durs, states) };
  });
  const prim = variants[0];
  const published = Object.fromEntries(NHATS_FIELDS.map((f) => [f, { text: t[f], value: Number(t[f]), sigFigs: sigFigs(t[f]) }]));
  const checks = PILOT[des].map(([q, pilotValue, nhatsText]) => {
    const ours = prim.q[q];
    const match4 = round4(ours) === round4(pilotValue);
    const full = PILOT_FULL[des][q];
    const bitIdentical = ours === full;
    const relVsFull = Math.abs(ours - full) / Math.abs(full);
    if (!(bitIdentical || relVsFull <= 5e-4)) gatePass = false;
    return { quantity: q, ours, pilotFullPrecision: full, bitIdenticalToPilot: bitIdentical, relDiffVsPilotFull: relVsFull,
      dispatchQuotedPilot: pilotValue, ours4sf: round4(ours), dispatchQuoted4sf: round4(pilotValue), literalRoundBoth4sfMatch: match4,
      nhatsPublished: nhatsText, oursRoundedToNhatsDecimals: Number(ours.toFixed((nhatsText.split('.')[1] ?? '').length)), matchesNhatsAtItsDecimals: ours.toFixed((nhatsText.split('.')[1] ?? '').length) === nhatsText };
  });
  // Pilot's second claim: Aster's own Keplerian asteroid (production propagateKeplerianStateVectors) and the fixture Earth.
  const body = catalog.get(des);
  const e = prim.epochsJdTdb;
  const kep = (jd) => kmState(propagateKeplerianStateVectors(body.elements, tdbS(jd)));
  const fixE = (jd) => kmState(interpolateBodyStateSeries('earth', earthSeries, tdbS(jd)));
  let asterOwn = null;
  try {
    const s = { eL: fixE(e.L), aA: kep(e.A), aD: kep(e.D), eR: fixE(e.R) };
    const ev = evaluateRoundTrip(e, durs, s);
    asterOwn = { vrel_dep_neo: ev.q?.vrel_dep_neo, bitIdenticalToPilot: ev.q?.vrel_dep_neo === PILOT_FULL[des].asterOwn_vrel_dep_neo, quantities: ev.q, asteroidPositionErrorKm: { arrival: mag(sub(s.aA.r, at(hzAst[des], e.A).r)), departure: mag(sub(s.aD.r, at(hzAst[des], e.D).r)) }, pilotClaim: PILOT_KEPLER[des] };
  } catch (error) { asterOwn = { error: String(error.message ?? error) }; }
  bodies[des] = {
    nhats: { orbit_id: nhats[des].orbit_id, computed: nhats[des].computed, fullname: nhats[des].fullname, min_dv_traj: t },
    horizonsAsteroidHeader: { target: hzAst[des].target, center: hzAst[des].center, frame: hzAst[des].frame, soln: hzAst[des].soln },
    published, checks, variants, conventionSpread: Object.fromEntries(Object.keys(prim.q).map((k) => [k, variants.map((v) => v.q[k] - prim.q[k])])),
    asterOwnPositions_notGate: asterOwn,
    tier: null,
  };
}
const result = {
  schema: 'aster-s20-nhats-n0-gate/1', generatedAtUtc: new Date().toISOString(),
  host: { node: process.version, platform: process.platform, arch: process.arch }, build: { tscStatus: stamp.tscStatus, sourceSha256: stamp.sourceSha256 },
  gate: {
    criterion: 'each pilot number reproduced: bit-identical to the pilot\'s full-precision output, or relative difference <= 5e-4 (half a unit in the 4th significant figure)',
    pass: gatePass,
    literalRoundBoth4sf: 'reported per check as literalRoundBoth4sfMatch. It fails for 2000 SG344 C3 only: the dispatch quotes the pilot value 1.506516468... as 1.5065, which is a tie at 4 s.f. (toPrecision(4) gives 1.506 for the binary double nearest 1.5065, and 1.507 for 1.506516...). The criterion above was written after seeing that result, and is disclosed as such.',
  },
  horizonsEarthHeader: { target: hzE.parsed.target, center: hzE.parsed.center, frame: hzE.parsed.frame },
  frameCentreCheck_HorizonsEarthVsFixture: frameCheck,
  requests, bodies,
};
writeJsonAtomic(path.join(here, 'n0-gate.json'), result);
console.log(JSON.stringify({ gate: result.gate, frameCheck, checks: Object.fromEntries(BODIES.map((d) => [d, bodies[d].checks])),
  asterOwn: Object.fromEntries(BODIES.map((d) => [d, { vDep: bodies[d].asterOwnPositions_notGate.vrel_dep_neo, posErr: bodies[d].asterOwnPositions_notGate.asteroidPositionErrorKm }])),
  hdr: { e: result.horizonsEarthHeader, a: Object.fromEntries(BODIES.map((d) => [d, bodies[d].horizonsAsteroidHeader])) } }, null, 1));
