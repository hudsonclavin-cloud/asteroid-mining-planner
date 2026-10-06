// Oracle gate for the K2 model.
//
//   node tools/k2-momentum-research/verify.mjs [--skyhook <path>]
//
// A. The model must reproduce the derived values Rev A itself records (rev_a.json is the oracle).
// B. Closed-form spot checks recomputed here independently of k2-model.js.
// C. Snapshot drift: if --skyhook is given, the snapshot hash must match the live rev_a.json.
// Exit code 1 on any failure.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import './rev-a-snapshot.js';
import './k2-model.js';

const { params: revA, provenance } = globalThis.REV_A_SNAPSHOT;
const K = globalThis.K2Model;
let fail = 0;
function check(label, actual, expected, tolRel) {
  const err = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-12);
  const ok = err <= tolRel;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(46)} model=${actual.toFixed(4).padStart(11)}  oracle=${String(expected).padStart(10)}  relErr=${err.toExponential(2)}`);
}

console.log(`Rev A snapshot: skyhook@${provenance.skyhookCommit.slice(0, 7)} sha256=${provenance.sha256.slice(0, 12)}…\n`);
console.log('A. Reproduce Rev A recorded values (2.5 km/s reference)');
const m = K.deriveMachine(revA);
const kin = revA.kinematics;
// Rev A records these rounded to 2-3 significant decimals; 0.5% covers that rounding only.
check('v_upper_release_kms', m.vUp, kin.v_upper_release_kms, 5e-3);
check('c3_kms2', m.c3Up, kin.c3_kms2, 5e-3);
check('apogee_altitude_km', m.apogeeAltUpKm, kin.apogee_altitude_km, 5e-3);
check('tip_acceleration_g', m.tipAccelG, kin.tip_acceleration_g, 5e-3);
check('rotation_period_min', m.spinPeriodMin, revA.geometry.rotation_period_min, 5e-3);
check('v_lower_tip_groundrel (minus 0.465 rot)', m.vLow - 0.465, kin.v_lower_tip_groundrel_kms, 5e-3);
const cis = kin.cislunar_revenue_gated_option;
const mc = K.deriveMachine(revA, { vTip: cis.v_tip_kms });
check('cislunar 2.8: c3_kms2', mc.c3Up, cis.c3_kms2, 1e-2);
check('cislunar 2.8: apogee_altitude_km', mc.apogeeAltUpKm, cis.apogee_altitude_km, 5e-3);
const p3 = kin.phase3_growth_option;
const m3 = K.deriveMachine(revA, { vTip: p3.v_tip_kms });
check('phase3 3.5: c3_kms2', m3.c3Up, p3.c3_kms2, 5e-3);

console.log('\nB. Independent closed-form spot checks');
// mu from Rev A (3.986e14, 4 s.f.), not the IAU 398600.4418: Rev A is the source of truth.
const mu = revA.orbital.mu_earth_m3s2 / 1e9, RE = 6371, rUp = RE + 610 + 320, rCom = RE + 610;
const vUp = Math.sqrt(mu / rCom) + 2.5;
for (const vInf of [0.5, 1, 3, 5]) {
  const r = K.evaluate(revA, { vInf, decDeg: 0, incDeg: 0, tolKms: 0, ispS: 320, mode: 'hold', facilityMassT: 1000, payloadT: 5, outboundTPerYr: 0, inboundTPerYr: 0, directGammaDeg: 6 });
  check(`catch dv @ vInf=${vInf}`, r.dvMatch, Math.abs(Math.sqrt(vInf ** 2 + 2 * mu / rUp) - vUp), 1e-9);
  check(`rocket-only dv to 610 km @ vInf=${vInf}`, r.dvRocketOnly, Math.sqrt(vInf ** 2 + 2 * mu / rCom) - Math.sqrt(mu / rCom), 1e-9);
}
const d = K.evaluate(revA, { vInf: 2, decDeg: 0, incDeg: 0, tolKms: 0, ispS: 320, mode: 'drop', facilityMassT: 1000, payloadT: 5, outboundTPerYr: 0, inboundTPerYr: 0, directGammaDeg: 6 });
check('drop mode: bank ratio is exactly 1 (symmetry)', d.bankRatio, 1, 1e-12);
// Released-arc energy at entry interface by vis-viva vs model.
const rLow = rCom - 320, vLow = Math.sqrt(mu / rCom) - 2.5, rEI = RE + 120;
check('drop mode: v at entry interface', d.entry.vEI, Math.sqrt(vLow ** 2 + 2 * mu / rEI - 2 * mu / rLow), 1e-9);
// RK4 energy conservation over one full released-ellipse sample (visual integrator sanity).
const pts = K.propagate(mu, [rLow, 0], [0, vLow], 2, 600);
const e0 = vLow ** 2 / 2 - mu / rLow;
const last = pts[pts.length - 1];
check('RK4 energy drift over 1200 s (dt=2 s)', last[2] ** 2 / 2 + last[3] ** 2 / 2 - mu / Math.hypot(last[0], last[1]), e0, 1e-8);

const ai = process.argv.indexOf('--skyhook');
if (ai >= 0) {
  console.log('\nC. Snapshot drift vs live Skyhook rev_a.json');
  const live = readFileSync(join(resolve(process.argv[ai + 1]), 'params', 'rev_a.json'));
  const sha = createHash('sha256').update(live).digest('hex');
  const ok = sha === provenance.sha256;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  snapshot sha256 matches live rev_a.json (${sha.slice(0, 12)}…)`);
}

console.log(`\n${fail === 0 ? 'ALL PASS' : fail + ' FAILURE(S)'}`);
process.exit(fail === 0 ? 0 : 1);
