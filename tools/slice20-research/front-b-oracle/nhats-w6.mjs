import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importV2, loadCatalogBodies } from '../nhats/lib/aster.mjs';
import { statesFor } from '../nhats/n2-agreement/agreement.mjs';
import { trajEpochs } from '../nhats/n2-agreement/fetch-states.mjs';

const [outputPath] = process.argv.slice(2);
if (!outputPath) throw new Error('usage: node nhats-w6.mjs <output-json>');
const here = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(fs.readFileSync(path.join(here, '..', 'nhats', 'n1-sample', 'n1-sample.json'), 'utf8'));
const bodyByDesignation = new Map((await loadCatalogBodies()).map((body) => [body.designation, body]));
const { computePorkchopGrid, computeReturnPorkchopGrid } = await importV2('porkchop/grid-compute.js');
const { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } = await importV2('core/units.js');

const MU_E_KM3_S2 = 398600.43550702266;
const R_E_KM = 6378.1366;
const ALT_KM = 125;
const ENTRY_LIMIT_KMS = 12;
const PICKS = [
  ['99942', 'min_dv_traj'],
  ['2000 SG344', 'min_dv_traj'],
  ['101955', 'min_dv_traj'],
  ['420210', 'min_dv_traj'],
  ['2023 VF3', 'min_dur_traj'],
  ['251732', 'min_dur_traj'],
];

const toCanon = (state) => ({
  frame: 'FRAME_HELIO_J2000_ICRF',
  tdbSeconds: 0,
  positionM: { x: state.r[0] * 1000, y: state.r[1] * 1000, z: state.r[2] * 1000 },
  velocityMps: { x: state.v[0] * 1000, y: state.v[1] * 1000, z: state.v[2] * 1000 },
});
const tdbSeconds = (jd) => (jd - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
const grid = (depJD, tofDays) => ({ depStartJD: depJD, depEndJD: depJD, tofMinDays: tofDays, tofMaxDays: tofDays, nDep: 1, nTof: 1 });
const close = (actual, text) => {
  const expected = Number(text);
  const decimals = String(text).includes('.') ? String(text).split('.')[1].length : 0;
  const halfUnit = 0.5 * 10 ** -decimals;
  return { text, expected, actual, absDiff: Math.abs(actual - expected), halfUnit, withinPrintedPrecision: Math.abs(actual - expected) <= halfUnit + 1e-12 };
};
const norm = (v) => Math.hypot(v[0], v[1], v[2]);
const assertEpoch = (actual, expected, label) => {
  if (Math.abs(actual - expected) > 1e-3) throw new Error(`${label} epoch mismatch: ${actual} vs ${expected}`);
};

const rows = [];
for (const [designation, kind] of PICKS) {
  const body = bodyByDesignation.get(designation);
  const sampleBody = sample.bodies.find((candidate) => candidate.des === designation);
  const trajectory = sampleBody?.nhats?.[kind];
  if (!body || !trajectory) throw new Error(`missing NHATS body or trajectory: ${designation} ${kind}`);
  const epochs = trajEpochs(trajectory).tdb0h;
  const states = statesFor(designation, epochs);
  const outDepSeconds = tdbSeconds(epochs.L);
  const outArrSeconds = outDepSeconds + Number(trajectory.dur_out) * SECONDS_PER_DAY;
  const retDepSeconds = tdbSeconds(epochs.D);
  const retArrSeconds = retDepSeconds + Number(trajectory.dur_ret) * SECONDS_PER_DAY;
  const outbound = computePorkchopGrid(
    body.elements,
    grid(epochs.L, Number(trajectory.dur_out)),
    0,
    {
      getEarthStateAtTdbSeconds: (t) => { assertEpoch(t, outDepSeconds, 'outbound departure'); return toCanon(states.eL); },
      propagateTargetStateAtTdbSeconds: (t) => { assertEpoch(t, outArrSeconds, 'outbound arrival'); return toCanon(states.aA); },
    },
  ).cells[0].branches[0];
  const returned = computeReturnPorkchopGrid(
    body.elements,
    grid(epochs.D, Number(trajectory.dur_ret)),
    0,
    {
      getEarthStateAtTdbSeconds: (t) => { assertEpoch(t, retArrSeconds, 'return arrival'); return toCanon(states.eR); },
      propagateTargetStateAtTdbSeconds: (t) => { assertEpoch(t, retDepSeconds, 'return departure'); return toCanon(states.aD); },
    },
  ).cells[0].branches[0];
  if (!outbound?.converged || !returned?.converged) throw new Error(`M0 did not converge: ${designation} ${kind}`);
  const vInfRet = returned.vInfEKmps;
  const entrySpeed = Math.sqrt(vInfRet ** 2 + (2 * MU_E_KM3_S2) / (R_E_KM + ALT_KM));
  const vInfStar = Math.sqrt(ENTRY_LIMIT_KMS ** 2 - (2 * MU_E_KM3_S2) / (R_E_KM + ALT_KM));
  const modelBDv = Math.max(0, vInfRet - vInfStar);
  const controlled = Number(trajectory.vrel_arr_earth) > 0;
  const invertedVInf = controlled ? null : Math.sqrt(Math.max(0, Number(trajectory.v_arr_earth) ** 2 - (2 * MU_E_KM3_S2) / (R_E_KM + ALT_KM)));
  const comparisons = {
    c3: close(outbound.c3, trajectory.c3),
    v_dep_earth: close(outbound.vInfDep, trajectory.v_dep_earth),
    vrel_arr_neo: close(outbound.vInfArr, trajectory.vrel_arr_neo),
    vrel_dep_neo: close(returned.vInfAsteroidDepartureKmps, trajectory.vrel_dep_neo),
  };
  if (!controlled) comparisons.v_arr_earth = close(entrySpeed, trajectory.v_arr_earth);
  if (controlled) comparisons.modelB_entry_control = close(modelBDv, trajectory.vrel_arr_earth);
  const allPrinted = Object.values(comparisons).every((comparison) => comparison.withinPrintedPrecision);
  rows.push({
    designation, kind, controlled, orbitId: sampleBody.nhats.orbit_id, launch: trajectory.launch,
    durations: { out: trajectory.dur_out, stay: trajectory.dur_at, ret: trajectory.dur_ret },
    earthSource: states.earthSource,
    endpointMapping: { outbound: 'Earth at L -> asteroid at A', return: 'asteroid at D -> Earth at R' },
    outbound: { M: 0, branch: outbound.branch, c3: outbound.c3, vInfDep: outbound.vInfDep, vInfArr: outbound.vInfArr },
    return: { M: 0, branch: returned.branch, vInfAsteroidDeparture: returned.vInfAsteroidDepartureKmps, vInfE: returned.vInfEKmps, vInfEVector: returned.vInfE },
    entry: { muEarthKm3S2: MU_E_KM3_S2, radiusKm: R_E_KM, altitudeKm: ALT_KM, entryLimitKmS: ENTRY_LIMIT_KMS, vInfStarKmS: vInfStar, naturalEntrySpeedKmS: entrySpeed, invertedVInfKmS: invertedVInf, modelBDvKmS: modelBDv, publishedEntryControlled: controlled },
    published: { c3: trajectory.c3, v_dep_earth: trajectory.v_dep_earth, vrel_arr_neo: trajectory.vrel_arr_neo, vrel_dep_neo: trajectory.vrel_dep_neo, v_arr_earth: trajectory.v_arr_earth, vrel_arr_earth: trajectory.vrel_arr_earth },
    comparisons, allPrinted,
  });
}
const output = {
  schema: 'aster-s20-front-b-nhats-w6/1',
  generatedAtUtc: new Date().toISOString(),
  method: 'Committed NHATS raw sample and Horizons state table; calendar dates read as 0h TDB. Outbound uses computePorkchopGrid at M=0; return uses computeReturnPorkchopGrid at M=0 with the same endpoint states used by tools/slice20-research/nhats/n2-agreement/agreement.mjs.',
  sample: { selected: PICKS, uncontrolled: rows.filter((row) => !row.controlled).length, controlled: rows.filter((row) => row.controlled).length },
  rows,
  pass: rows.length === 6 && rows.every((row) => row.allPrinted),
};
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputPath, rows: rows.length, uncontrolled: output.sample.uncontrolled, controlled: output.sample.controlled, pass: output.pass }, null, 2));
if (!output.pass) process.exitCode = 1;
