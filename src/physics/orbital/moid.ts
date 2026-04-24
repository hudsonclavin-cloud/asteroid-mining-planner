import { DEG } from '../constants/index.js';
import { kep2cart, propagateElements } from './keplerian/elements.js';
import { propagatePlanet, propagateAsteroid } from '../propagation/planets.js';

// MOID approximation: sample both orbits independently, find minimum pairwise distance
// Accuracy ~0.01 AU (see DEVLOG.md)
export function moidApprox(el: any, jd_ref: number, nPts: number): number {
  nPts = nPts || 120;
  const earthPts: any[] = [];
  const astPts: any[] = [];
  const T_earth = 365.25;
  const T_ast = Math.sqrt(el.a * el.a * el.a) * 365.25;

  for (let k = 0; k < nPts; k++) {
    const f = k / nPts;
    earthPts.push(propagatePlanet(2, jd_ref + f * T_earth));
    if (el.epoch_JD !== undefined) {
      astPts.push(kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, el.epoch_JD + f * T_ast));
    } else {
      const epochJD = el.epoch; // already JD
      astPts.push(kep2cart(el.a, el.e, el.i*DEG, el.om*DEG, el.w*DEG, el.ma*DEG, epochJD, epochJD + f * T_ast));
    }
  }

  let minDist = Infinity;
  for (let j = 0; j < nPts; j++) {
    for (let k = 0; k < nPts; k++) {
      const dx = astPts[j].x - earthPts[k].x;
      const dy = astPts[j].y - earthPts[k].y;
      const dz = astPts[j].z - earthPts[k].z;
      const d = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (d < minDist) minDist = d;
    }
  }
  return minDist;
}

// Close approach scan: find top N closest Earth approaches over `years` years
export function closeApproachScan(el: any, jd_start: number, years: number, n: number) {
  years = years || 5;
  n = n || 730;
  const dt = years * 365.25 / n;
  const localMins: { jd: number; dist: number }[] = [];
  let prevDist: number | null = null;
  let prevJD = jd_start;

  for (let k = 0; k <= n; k++) {
    const jd = jd_start + k * dt;
    let pos: any;
    try {
      pos = el.epoch_JD !== undefined ? propagateElements(el, jd) : propagateAsteroid(el, jd);
    } catch(_) { prevDist = null; continue; }
    const earth = propagatePlanet(2, jd);
    const dx = pos.x - earth.x, dy = pos.y - earth.y, dz = pos.z - earth.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (prevDist !== null && dist > prevDist && prevDist < 1.0) {
      localMins.push({ jd: prevJD, dist: prevDist });
    }
    prevDist = dist;
    prevJD = jd;
  }

  localMins.sort((a, b) => a.dist - b.dist);
  return localMins.slice(0, 3);
}
