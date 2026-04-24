import { PLANETS, J2000, DEG } from '../constants/index.js';
import { kep2cart, propagateElements } from '../orbital/keplerian/elements.js';

// Propagate a planet at Julian Date jd using Standish 1992 secular elements
export function propagatePlanet(pIdx: number, jd: number) {
  const p = PLANETS[pIdx];
  const T = (jd - J2000) / 36525.0;

  const a  = p[0] + p[1] * T;
  const e  = p[2] + p[3] * T;
  const i  = (p[4] + p[5] * T) * DEG;
  const Om = (p[6] + p[7] * T) * DEG;
  const L  = (p[8] + p[9] * T) * DEG;
  const wb = (p[10] + p[11] * T) * DEG;

  const w  = wb - Om;
  const M0 = L - wb;

  return kep2cart(a, e, i, Om, w, M0, jd, jd);
}

// Propagate asteroid at Julian Date jd
export function propagateAsteroid(ast: { a: number; e: number; i: number; om: number; w: number; ma: number; epoch: number }, jd: number) {
  const a    = ast.a;
  const e    = ast.e;
  const i    = ast.i * DEG;
  const Om   = ast.om * DEG;
  const w    = ast.w * DEG;
  const M0   = ast.ma * DEG;
  const epochJD = ast.epoch; // already JD

  return kep2cart(a, e, i, Om, w, M0, epochJD, jd);
}

export { propagateElements };
