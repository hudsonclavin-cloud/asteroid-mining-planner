import { TWO_PI, AU_KM, MOON_A_AU, MOON_PERIOD_DAYS, MOON_INCLINATION, MOON_NODE_J2000, MOON_NODE_PERIOD_DAYS, EM_L1_RADIUS_KM, EM_L2_RADIUS_KM, J2000 } from '../constants/index.js';
import { wrapToTwoPi } from '../utils/angle.js';
import { propagatePlanet } from './planets.js';

export function moonRelativeState(jd: number) {
  const angle = wrapToTwoPi((TWO_PI / MOON_PERIOD_DAYS) * (jd - J2000));
  const omega = TWO_PI / MOON_PERIOD_DAYS; // rad/day
  const nodeRate = -TWO_PI / MOON_NODE_PERIOD_DAYS;
  const node = wrapToTwoPi(MOON_NODE_J2000 + nodeRate * (jd - J2000));
  const cosNode = Math.cos(node), sinNode = Math.sin(node);
  const cosI = Math.cos(MOON_INCLINATION), sinI = Math.sin(MOON_INCLINATION);
  const xOrb = MOON_A_AU * Math.cos(angle);
  const yOrb = MOON_A_AU * Math.sin(angle);
  const vxOrb = -MOON_A_AU * omega * Math.sin(angle);
  const vyOrb = MOON_A_AU * omega * Math.cos(angle);
  const x = xOrb * cosNode - yOrb * cosI * sinNode;
  const y = xOrb * sinNode + yOrb * cosI * cosNode;
  const z = yOrb * sinI;
  const vx_au_day = vxOrb * cosNode - vyOrb * cosI * sinNode;
  const vy_au_day = vxOrb * sinNode + vyOrb * cosI * cosNode;
  const vz_au_day = vyOrb * sinI;
  return {
    x,
    y,
    z,
    vx: vx_au_day * AU_KM / 86400,
    vy: vy_au_day * AU_KM / 86400,
    vz: vz_au_day * AU_KM / 86400,
  };
}

export function propagateMoonState(jd: number) {
  const earth = propagatePlanet(2, jd);
  const rel = moonRelativeState(jd);
  return {
    x: earth.x + rel.x,
    y: earth.y + rel.y,
    z: earth.z + rel.z,
    vx: earth.vx + rel.vx,
    vy: earth.vy + rel.vy,
    vz: earth.vz + rel.vz,
  };
}

export function propagateEarthMoonLagrangeState(jd: number, pointKey: string) {
  const earth = propagatePlanet(2, jd);
  const rel = moonRelativeState(jd);
  const relNorm = Math.hypot(rel.x, rel.y, rel.z) || 1;
  const ux = rel.x / relNorm;
  const uy = rel.y / relNorm;
  const uz = rel.z / relNorm;
  const radiusKm = pointKey === 'l2' || pointKey === 'el5' ? EM_L2_RADIUS_KM : EM_L1_RADIUS_KM;
  const radiusAu = radiusKm / AU_KM;
  let px = earth.x + ux * radiusAu;
  let py = earth.y + uy * radiusAu;
  let pz = earth.z + uz * radiusAu;
  let vx = earth.vx + rel.vx * (radiusAu / MOON_A_AU);
  let vy = earth.vy + rel.vy * (radiusAu / MOON_A_AU);
  let vz = earth.vz + rel.vz * (radiusAu / MOON_A_AU);
  if (pointKey === 'el4' || pointKey === 'el5') {
    const sign = pointKey === 'el4' ? 1 : -1;
    const cos60 = 0.5;
    const sin60 = sign * Math.sqrt(3) / 2;
    const rx = rel.x * cos60 - rel.y * sin60;
    const ry = rel.x * sin60 + rel.y * cos60;
    const rvx = rel.vx * cos60 - rel.vy * sin60;
    const rvy = rel.vx * sin60 + rel.vy * cos60;
    px = earth.x + rx;
    py = earth.y + ry;
    pz = earth.z + rel.z;
    vx = earth.vx + rvx;
    vy = earth.vy + rvy;
    vz = earth.vz + rel.vz;
  }
  return { x: px, y: py, z: pz, vx, vy, vz };
}
