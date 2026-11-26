import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [buildDir, repoRoot, orderPath] = process.argv.slice(2);
const imp = (rel) => import(pathToFileURL(path.join(buildDir, rel)).href);
const [{ lambertMultiRev }, { propagateKeplerianStateVectors }, { ingestSlice2Fixture }, { ingestSlice9Fixture }] = await Promise.all([
  imp('core/lambert/lambert-multi-rev.js'),
  imp('core/propagators/keplerian.js'),
  imp('boundary/horizons.js'),
  imp('boundary/slice9-nea-catalog.js'),
]);

const earthFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src/v2/data/horizons-inner-solar-system-2026-2040.json'), 'utf8'));
const catalogFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const tierFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/tier-sizing-per-body.json'), 'utf8'));
const earthSeries = ingestSlice2Fixture(earthFixture).earth.map((sample) => sample.state);
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

const oldDebug = console.debug;
console.debug = () => {};
const gridCache = new Map();
const vec = (v, scale = 1) => [v.x * scale, v.y * scale, v.z * scale];
const mag = (v) => Math.hypot(v[0], v[1], v[2]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function gridFor(nDep, nTof) {
  const key = `${nDep}x${nTof}`;
  if (gridCache.has(key)) return gridCache.get(key);
  const dep = Array.from({ length: nDep }, (_, i) => DEP_START_JD + (DEP_END_JD - DEP_START_JD) * i / Math.max(1, nDep - 1));
  const tof = Array.from({ length: nTof }, (_, i) => TOF_MIN + (TOF_MAX - TOF_MIN) * i / Math.max(1, nTof - 1));
  const cells = [];
  for (let di = 0; di < nDep; di += 1) for (let ti = 0; ti < nTof; ti += 1) {
    const depJd = dep[di];
    const tofDays = tof[ti];
    const arrivalJd = depJd + tofDays;
    const depSeconds = (depJd - 2451545) * SEC_DAY;
    const arrivalSeconds = depSeconds + tofDays * SEC_DAY;
    let earth = null;
    if (arrivalSeconds <= earthSeries.at(-1).tdbSeconds) {
      const s = earthSeries;
      let lo = 0;
      let hi = s.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (s[mid].tdbSeconds === arrivalSeconds) { earth = s[mid]; break; }
        if (s[mid].tdbSeconds < arrivalSeconds) lo = mid + 1;
        else hi = mid - 1;
      }
      if (!earth) {
        const i = Math.max(0, Math.min(s.length - 2, hi));
        const a = s[i];
        const b = s[i + 1];
        const u = (arrivalSeconds - a.tdbSeconds) / (b.tdbSeconds - a.tdbSeconds);
        const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
        const h10 = u ** 3 - 2 * u ** 2 + u;
        const h01 = -2 * u ** 3 + 3 * u ** 2;
        const h11 = u ** 3 - u ** 2;
        const p = (axis) => h00 * a.positionM[axis] + h10 * a.velocityMps[axis] * (b.tdbSeconds - a.tdbSeconds) + h01 * b.positionM[axis] + h11 * b.velocityMps[axis] * (b.tdbSeconds - a.tdbSeconds);
        const dv = (axis) => ((6 * u ** 2 - 6 * u) * a.positionM[axis] + (3 * u ** 2 - 4 * u + 1) * a.velocityMps[axis] * (b.tdbSeconds - a.tdbSeconds) + (-6 * u ** 2 + 6 * u) * b.positionM[axis] + (3 * u ** 2 - 2 * u) * b.velocityMps[axis] * (b.tdbSeconds - a.tdbSeconds)) / (b.tdbSeconds - a.tdbSeconds);
        earth = { positionM: { x: p('x'), y: p('y'), z: p('z') }, velocityMps: { x: dv('x'), y: dv('y'), z: dv('z') }, tdbSeconds: arrivalSeconds };
      }
    }
    cells.push({ di, ti, depJd, tofDays, depSeconds, arrivalJd, earthR: earth ? vec(earth.positionM, 0.001) : null, earthV: earth ? vec(earth.velocityMps, 0.001) : null });
  }
  const value = { nDep, nTof, cells };
  gridCache.set(key, value);
  return value;
}

function perihelion(r, v, tofSeconds) {
  const rmag = mag(r);
  const v2 = dot(v, v);
  const energy = 0.5 * v2 - MU_SUN / rmag;
  const h = cross(r, v);
  const h2 = dot(h, h);
  const e = Math.sqrt(Math.max(0, 1 + 2 * energy * h2 / MU_SUN ** 2));
  const a = energy < 0 ? -MU_SUN / (2 * energy) : null;
  const q = a === null ? h2 / (MU_SUN * (1 + e)) : a * (1 - e);
  let passes = dot(r, v) < 0;
  if (a !== null && e < 1) {
    const ev = [(v2 - MU_SUN / rmag) * r[0] / MU_SUN - dot(r, v) * v[0] / MU_SUN, (v2 - MU_SUN / rmag) * r[1] / MU_SUN - dot(r, v) * v[1] / MU_SUN, (v2 - MU_SUN / rmag) * r[2] / MU_SUN - dot(r, v) * v[2] / MU_SUN];
    const f = Math.atan2(dot(cross(ev, r), h) / Math.max(mag(h) * e * rmag, 1e-300), dot(ev, r) / Math.max(e * rmag, 1e-300));
    const E = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(f), e + Math.cos(f));
    const M0 = E - e * Math.sin(E);
    const n = Math.sqrt(MU_SUN / a ** 3);
    passes = Math.floor((M0 + n * tofSeconds) / (2 * Math.PI)) > Math.floor(M0 / (2 * Math.PI));
  }
  return { perihelionKm: q, passesPerihelion: passes };
}

function jdDate(jd) {
  return new Date((jd - 2440587.5) * 86400000).toISOString().slice(0, 10);
}

function pickRecord(cell, branch) {
  const vEI = Math.sqrt(branch.vInfArr ** 2 + 2 * MU_EARTH / R_EI_KM);
  const entryControlDV = Math.max(0, branch.vInfArr - V_INF_AT_12);
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
  };
}

function computeBody(bodyIndex, mode) {
  const body = bodies[order[bodyIndex]];
  const tier = tierFixture.records[body.designation] ?? {};
  const grid = mode === 'full' ? gridFor(200, 100) : gridFor(50, 25);
  const base = {
    mode,
    bodyIndex,
    designation: body.designation,
    bodyId: body.bodyId,
    tier: tier.tier ?? null,
    cells: grid.cells.length,
    refusedEarth: 0,
    refusedSun: 0,
    shown: 0,
    shownScreen: 0,
    objectives: { A: null, B: null, C: null, D: null },
    propagationRefused: null,
  };
  let bestA = null;
  let bestB = null;
  let bestC = null;
  let bestD = null;
  try {
    for (const cell of grid.cells) {
      const asteroid = propagateKeplerianStateVectors(body.elements, cell.depSeconds);
      const r1 = vec(asteroid.positionM, 0.001);
      const va = vec(asteroid.velocityMps, 0.001);
      if (!cell.earthR) { base.refusedEarth += 1; continue; }
      const branches = [];
      for (const M of [0, 1]) {
        let result = null;
        try { result = lambertMultiRev(r1, cell.earthR, cell.tofDays * SEC_DAY, MU_SUN, M, true); } catch { result = null; }
        for (const b of result?.branches ?? []) if (b.converged) {
          const vInfDep = mag([b.v1[0] - va[0], b.v1[1] - va[1], b.v1[2] - va[2]]);
          const vInfArr = mag([b.v2[0] - cell.earthV[0], b.v2[1] - cell.earthV[1], b.v2[2] - cell.earthV[2]]);
          const pq = perihelion(r1, b.v1, cell.tofDays * SEC_DAY);
          const sunRefused = pq.perihelionKm < 695700 && pq.passesPerihelion;
          if (sunRefused) { base.refusedSun += 1; continue; }
          const supported = tier.tier !== 'L1' || !tier.encounter || cell.depJd < tier.encounter.jd;
          branches.push({ M, branch: b.branch, vInfDep, vInfArr, supported });
        }
      }
      if (!branches.length) continue;
      base.shown += 1;
      const candidates = branches.map((branch) => pickRecord(cell, branch));
      const cellCandidate = candidates[0];
      for (const candidate of candidates.slice(1)) if (candidate.vInfDep < cellCandidate.vInfDep) Object.assign(cellCandidate, candidate);
      if (bestA === null || cellCandidate.vInfDep < bestA.vInfDep) bestA = cellCandidate;
      if (cellCandidate.screen && (bestB === null || cellCandidate.vInfDep < bestB.vInfDep)) bestB = cellCandidate;
      if (bestC === null || cellCandidate.objectiveCCost < bestC.objectiveCCost) bestC = cellCandidate;
      if (bestD === null || cellCandidate.vInfArr < bestD.vInfArr) bestD = cellCandidate;
      if (cellCandidate.screen) base.shownScreen += 1;
    }
    base.objectives = { A: bestA, B: bestB, C: bestC, D: bestD };
  } catch (error) {
    base.propagationRefused = `${error.name}: ${error.message}`;
  }
  return base;
}

process.on('message', (message) => {
  if (!message || message.type !== 'compute') return;
  try { process.send?.({ type: 'result', result: computeBody(message.bodyIndex, message.mode) }); }
  catch (error) { process.send?.({ type: 'error', bodyIndex: message.bodyIndex, error: `${error.name}: ${error.message}` }); }
});
process.send?.({ type: 'ready' });
