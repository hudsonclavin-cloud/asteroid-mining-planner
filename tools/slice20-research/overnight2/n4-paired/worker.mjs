import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [buildDir, repoRoot, orderPath] = process.argv.slice(2);
const imp = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);
const [{ computePorkchopGrid }, { lambertMultiRev }, { propagateKeplerianStateVectors }, { interpolateBodyStateSeries }, { ingestSlice2Fixture }, { ingestSlice9Fixture }] = await Promise.all([
  imp('porkchop/grid-compute.js'),
  imp('core/lambert/lambert-multi-rev.js'),
  imp('core/propagators/keplerian.js'),
  imp('core/interpolators/hermite.js'),
  imp('boundary/horizons.js'),
  imp('boundary/slice9-nea-catalog.js'),
]);

const earthFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const catalogFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const tierFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/tier-sizing-per-body.json'), 'utf8'));
const earthSeries = ingestSlice2Fixture(earthFixture).earth.map((sample) => sample.state);
const earthLastSeconds = earthSeries.at(-1).tdbSeconds;
const bodies = Object.values(ingestSlice9Fixture(catalogFixture).asteroids);
const orderData = JSON.parse(fs.readFileSync(orderPath, 'utf8'));
const order = orderData.order;

const MU_SUN = 132712440018;
const MU_EARTH = 398600.43550702266;
const R_EI_KM = 6503.1366;
const SEC_DAY = 86400;
const DEP_START_JD = 2461041.500800741;
const DEP_END_JD = 2466154.500800741;
const TOF_MIN = 182.5;
const TOF_MAX = 1826.25;
const V_INF_AT_12 = Math.sqrt(12 ** 2 - 2 * MU_EARTH / R_EI_KM);
const RETURN_STAY_MIN = 8;
const RETURN_STAY_MAX = 730.5;
const RETURN_N_DEP = 40;
const RETURN_N_TOF = 25;
const oldDebug = console.debug;
console.debug = () => {};

const vec = (v, scale = 1) => [v.x * scale, v.y * scale, v.z * scale];
const mag = (v) => Math.hypot(v[0], v[1], v[2]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const jdSeconds = (jd) => (jd - 2451545) * SEC_DAY;
const earthAt = (seconds) => interpolateBodyStateSeries('earth', earthSeries, seconds);
const jdDate = (jd) => new Date((jd - 2440587.5) * 86400000).toISOString().slice(0, 10);

function perihelion(r, v, tofSeconds) {
  const rmag = mag(r); const v2 = dot(v, v); const energy = 0.5 * v2 - MU_SUN / rmag;
  const h = cross(r, v); const h2 = dot(h, h); const e = Math.sqrt(Math.max(0, 1 + 2 * energy * h2 / MU_SUN ** 2));
  const a = energy < 0 ? -MU_SUN / (2 * energy) : null; const q = a === null ? h2 / (MU_SUN * (1 + e)) : a * (1 - e);
  let passes = dot(r, v) < 0;
  if (a !== null && e < 1) {
    const ev = [(v2 - MU_SUN / rmag) * r[0] / MU_SUN - dot(r, v) * v[0] / MU_SUN, (v2 - MU_SUN / rmag) * r[1] / MU_SUN - dot(r, v) * v[1] / MU_SUN, (v2 - MU_SUN / rmag) * r[2] / MU_SUN - dot(r, v) * v[2] / MU_SUN];
    const f = Math.atan2(dot(cross(ev, r), h) / Math.max(mag(h) * e * rmag, 1e-300), dot(ev, r) / Math.max(e * rmag, 1e-300));
    const E = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(f), e + Math.cos(f)); const M0 = E - e * Math.sin(E); const n = Math.sqrt(MU_SUN / a ** 3);
    passes = Math.floor((M0 + n * tofSeconds) / (2 * Math.PI)) > Math.floor(M0 / (2 * Math.PI));
  }
  return { perihelionKm: q, passesPerihelion: passes };
}

function returnPick(cell, branch, outbound) {
  const vEI = Math.sqrt(branch.vInfArr ** 2 + 2 * MU_EARTH / R_EI_KM);
  const entryControlDV = Math.max(0, branch.vInfArr - V_INF_AT_12);
  const stayDays = cell.depJd - outbound.arrivalJd;
  return {
    di: cell.di,
    ti: cell.ti,
    depJd: cell.depJd,
    departureDate: jdDate(cell.depJd),
    tofDays: cell.tofDays,
    arrivalJd: cell.arrivalJd,
    M: branch.M,
    branch: branch.branch,
    vInfDep: branch.vInfDep,
    vInfArr: branch.vInfArr,
    vEI,
    screen: vEI <= 12,
    supported: branch.supported,
    entryControlDV,
    objectiveCCost: branch.vInfDep + entryControlDV,
    stayDays,
    totalMissionDays: outbound.tofDays + stayDays + cell.tofDays,
    outboundC3: outbound.c3,
    outboundVInfDep: outbound.vInfDep,
    crudeTotalVInfKmS: outbound.vInfDep + branch.vInfDep,
  };
}

function outboundBest(body) {
  const gridParams = { depStartJD: DEP_START_JD, depEndJD: DEP_END_JD, tofMinDays: TOF_MIN, tofMaxDays: TOF_MAX, nDep: 50, nTof: 25 };
  const deps = { getEarthStateAtTdbSeconds: earthAt, propagateTargetStateAtTdbSeconds: (elements, seconds) => propagateKeplerianStateVectors(elements, seconds) };
  const grids = [0, 1].map((M) => computePorkchopGrid(body.elements, gridParams, M, deps));
  let best = null;
  for (let index = 0; index < grids[0].cells.length; index += 1) {
    for (const [gridIndex, grid] of grids.entries()) {
      const cell = grid.cells[index];
      if (cell.selectedBranch === null) continue;
      const branch = cell.branches[cell.selectedBranch];
      if (!branch.converged) continue;
      const candidate = { depJd: cell.depJD, tofDays: cell.tofDays, arrivalJd: cell.depJD + cell.tofDays, M: gridIndex, branch: branch.branch, vInfDep: branch.vInfDep, vInfArr: branch.vInfArr, c3: branch.c3, departureDate: jdDate(cell.depJD) };
      if (best === null || candidate.vInfDep < best.vInfDep) best = candidate;
    }
  }
  return best;
}

function pairedReturn(body, outbound, tier) {
  const depStart = outbound.arrivalJd + RETURN_STAY_MIN;
  const depEnd = outbound.arrivalJd + RETURN_STAY_MAX;
  const depGrid = Array.from({ length: RETURN_N_DEP }, (_, i) => depStart + (depEnd - depStart) * i / (RETURN_N_DEP - 1));
  const tofGrid = Array.from({ length: RETURN_N_TOF }, (_, i) => TOF_MIN + (TOF_MAX - TOF_MIN) * i / (RETURN_N_TOF - 1));
  const boundary = tier.tier === 'L1' && tier.encounter ? tier.encounter.jd : null;
  const base = { totalCells: RETURN_N_DEP * RETURN_N_TOF, refusedEarth: 0, noSolution: 0, refusedSun: 0, shown: 0, shownScreen: 0, shownSupport: 0, shownBoth: 0, selectedA: null, selectedC: null };
  let bestA = null; let bestC = null;
  for (let di = 0; di < depGrid.length; di += 1) {
    const depJd = depGrid[di]; const depSeconds = jdSeconds(depJd);
    let asteroid = null;
    for (let ti = 0; ti < tofGrid.length; ti += 1) {
      const tofDays = tofGrid[ti]; const arrivalJd = depJd + tofDays; const arrivalSeconds = jdSeconds(arrivalJd);
      const cell = { di, ti, depJd, tofDays, arrivalJd };
      if (arrivalSeconds > earthLastSeconds) { base.refusedEarth += 1; continue; }
      if (asteroid === null) {
        const state = propagateKeplerianStateVectors(body.elements, depSeconds);
        asteroid = { r: vec(state.positionM, 0.001), v: vec(state.velocityMps, 0.001) };
      }
      const earth = earthAt(arrivalSeconds); const earthR = vec(earth.positionM, 0.001); const earthV = vec(earth.velocityMps, 0.001);
      const branches = [];
      for (const M of [0, 1]) {
        let result = null;
        try { result = lambertMultiRev(asteroid.r, earthR, tofDays * SEC_DAY, MU_SUN, M, true); } catch { result = null; }
        for (const branch of result?.branches ?? []) if (branch.converged) {
          const vInfDep = mag([branch.v1[0] - asteroid.v[0], branch.v1[1] - asteroid.v[1], branch.v1[2] - asteroid.v[2]]);
          const vInfArr = mag([branch.v2[0] - earthV[0], branch.v2[1] - earthV[1], branch.v2[2] - earthV[2]]);
          const pq = perihelion(asteroid.r, branch.v1, tofDays * SEC_DAY);
          if (pq.perihelionKm < 695700 && pq.passesPerihelion) { base.refusedSun += 1; continue; }
          branches.push({ M, branch: branch.branch, vInfDep, vInfArr, supported: boundary === null || depJd < boundary });
        }
      }
      if (!branches.length) { base.noSolution += 1; continue; }
      base.shown += 1;
      const candidates = branches.map((branch) => returnPick(cell, branch, outbound));
      const cellCandidate = candidates[0];
      for (const candidate of candidates.slice(1)) if (candidate.vInfDep < cellCandidate.vInfDep) Object.assign(cellCandidate, candidate);
      if (cellCandidate.screen) base.shownScreen += 1;
      if (cellCandidate.supported) base.shownSupport += 1;
      if (cellCandidate.screen && cellCandidate.supported) base.shownBoth += 1;
      if (bestA === null || cellCandidate.vInfDep < bestA.vInfDep) bestA = cellCandidate;
      if (bestC === null || cellCandidate.objectiveCCost < bestC.objectiveCCost) bestC = cellCandidate;
    }
  }
  base.selectedA = bestA;
  base.selectedC = bestC;
  base.supportBoundaryJd = boundary;
  base.returnDepStartJd = depStart;
  base.returnDepEndJd = depEnd;
  return base;
}

function computeBody(bodyIndex, mode) {
  const body = bodies[order[bodyIndex]]; const tier = tierFixture.records[body.designation] ?? {};
  const row = { mode, bodyIndex, designation: body.designation, bodyId: body.bodyId, tier: tier.tier ?? null, outbound: null, paired: null, propagationRefused: null };
  try {
    const outbound = outboundBest(body);
    if (outbound === null) { row.status = 'outbound-no-solution'; return row; }
    row.status = 'ok'; row.outbound = outbound; row.paired = pairedReturn(body, outbound, tier);
  } catch (error) { row.status = 'outbound-propagation-refused'; row.propagationRefused = `${error.name}: ${error.message}`; }
  return row;
}

process.on('message', (message) => {
  if (!message || message.type !== 'compute') return;
  try { process.send?.({ type: 'result', result: computeBody(message.bodyIndex, message.mode) }); }
  catch (error) { process.send?.({ type: 'error', bodyIndex: message.bodyIndex, error: `${error.name}: ${error.message}` }); }
});
process.send?.({ type: 'ready' });
