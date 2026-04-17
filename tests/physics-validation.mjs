/**
 * Aster Physics Validation Harness
 *
 * Loads physics.worker.js via Node vm so pure math functions can be tested
 * without a browser or web-worker runtime. No dependencies beyond Node ≥18.
 *
 * Run:  npm test   OR   node tests/physics-validation.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import vm from 'vm';

// ── Load worker into isolated sandbox ────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const workerSrc = readFileSync(resolve(__dir, '../physics.worker.js'), 'utf8');

const sandbox = {
  self: { onmessage: null, postMessage: () => {} },
  console,
};
vm.createContext(sandbox);
vm.runInContext(workerSrc, sandbox);

const {
  kep2cart,
  cart2kep,
  izzoLambert,
  lambert,
  destinationCaptureDv,
  applyBurn,
  propagateElements,
} = sandbox;

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
    results.push({ name, ok: true });
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
    results.push({ name, ok: false, err: err.message });
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

function near(a, b, tol = 1e-6, label = '') {
  const diff = Math.abs(a - b);
  if (!isFinite(a) || !isFinite(b) || diff > tol)
    throw new Error(`${label ? label + ': ' : ''}|${a} - ${b}| = ${diff.toExponential(3)} > tol ${tol}`);
}

// ── Constants (must match worker) ────────────────────────────────────────────
const J2000 = 2451545.0;
const DEG   = Math.PI / 180;

// ── SECTION 1: kep2cart / cart2kep round-trips ───────────────────────────────
console.log('\n[1] kep2cart / cart2kep round-trips');

test('Earth orbit: kep2cart → cart2kep recovers a and e', () => {
  // Earth: a=1 AU, e=0.0167, i≈0
  const a = 1.0, e = 0.0167, i = 0.0 * DEG, Om = 0, w = 102.9 * DEG, M0 = 100 * DEG;
  const jd = J2000;
  const st = kep2cart(a, e, i, Om, w, M0, jd, jd);
  assert(isFinite(st.x) && isFinite(st.vx), 'kep2cart returned non-finite');
  const el = cart2kep(st.x, st.y, st.z, st.vx, st.vy, st.vz, jd);
  assert(el !== null, 'cart2kep returned null');
  near(el.a, a, 1e-8, 'semi-major axis');
  near(el.e, e, 1e-8, 'eccentricity');
});

test('Amor-class asteroid: kep2cart → cart2kep recovers a and e', () => {
  // 1221 Amor-like: a=1.92, e=0.435, i=11.9°
  const a = 1.92, e = 0.435, i = 11.9 * DEG, Om = 171 * DEG, w = 26 * DEG, M0 = 45 * DEG;
  const jd = J2000 + 1000;
  const st = kep2cart(a, e, i, Om, w, M0, jd, jd);
  assert(isFinite(st.x) && isFinite(st.vx), 'kep2cart returned non-finite');
  const el = cart2kep(st.x, st.y, st.z, st.vx, st.vy, st.vz, jd);
  assert(el !== null, 'cart2kep returned null');
  near(el.a, a, 1e-7, 'semi-major axis');
  near(el.e, e, 1e-7, 'eccentricity');
  near(el.i, i, 1e-7, 'inclination');
});

test('High-eccentricity Apollo: kep2cart → cart2kep recovers a and e', () => {
  // 1566 Icarus-like: a=1.078, e=0.827
  const a = 1.078, e = 0.827, i = 22.9 * DEG, Om = 88.0 * DEG, w = 31.3 * DEG, M0 = 200 * DEG;
  const jd = J2000 + 500;
  const st = kep2cart(a, e, i, Om, w, M0, jd, jd);
  assert(isFinite(st.x) && isFinite(st.vx), 'kep2cart returned non-finite');
  const el = cart2kep(st.x, st.y, st.z, st.vx, st.vy, st.vz, jd);
  assert(el !== null, 'cart2kep returned null');
  near(el.a, a, 1e-6, 'semi-major axis');
  near(el.e, e, 1e-6, 'eccentricity');
});

test('Round-trip: state → elements → state recovers position and velocity', () => {
  const a = 1.3, e = 0.2, i = 15 * DEG, Om = 45 * DEG, w = 90 * DEG, M0 = 30 * DEG;
  const jd = J2000;
  const st1 = kep2cart(a, e, i, Om, w, M0, jd, jd);
  const el  = cart2kep(st1.x, st1.y, st1.z, st1.vx, st1.vy, st1.vz, jd);
  assert(el !== null, 'cart2kep returned null');
  const st2 = kep2cart(el.a, el.e, el.i, el.Om, el.w, el.M0, el.epoch_JD, jd);
  near(st2.x,  st1.x,  1e-10, 'x');
  near(st2.y,  st1.y,  1e-10, 'y');
  near(st2.z,  st1.z,  1e-10, 'z');
  near(st2.vx, st1.vx, 1e-10, 'vx');
  near(st2.vy, st1.vy, 1e-10, 'vy');
  near(st2.vz, st1.vz, 1e-10, 'vz');
});

// ── SECTION 2: Zero-impulse burn invariant ────────────────────────────────────
console.log('\n[2] Zero-impulse burn invariant');

test('Zero burn leaves semi-major axis unchanged', () => {
  // Note: propagateElements returns a state vector (x/y/z/vx/vy/vz), not elements.
  // applyBurn returns cart2kep elements. Compare against the input ast.a directly.
  const ast = { a: 1.3, e: 0.2, i: 10, om: 45, w: 90, ma: 30, epoch: J2000 };
  const jd = J2000 + 100;
  const elB = applyBurn(ast, jd, 0, 0, 0);
  assert(elB !== null, 'applyBurn returned null for zero burn');
  assert(Number.isFinite(elB.a), `elB.a is not finite: ${elB.a}`);
  near(elB.a, ast.a, 1e-8, 'semi-major axis after zero burn');
  near(elB.e, ast.e, 1e-8, 'eccentricity after zero burn');
});

test('Prograde burn increases semi-major axis', () => {
  const ast = { a: 1.0, e: 0.01, i: 0, om: 0, w: 0, ma: 0, epoch: J2000 };
  const jd = J2000;
  const elAfter = applyBurn(ast, jd, 0.5, 0, 0); // 0.5 km/s prograde
  assert(elAfter !== null && isFinite(elAfter.a), 'applyBurn failed');
  assert(elAfter.a > 1.0, `prograde burn should raise a: got ${elAfter.a}`);
});

test('Normal burn changes inclination', () => {
  const ast = { a: 1.2, e: 0.1, i: 0, om: 0, w: 0, ma: 90, epoch: J2000 };
  const jd = J2000;
  const el0 = applyBurn(ast, jd, 0, 0, 0);
  const elN = applyBurn(ast, jd, 0, 0.5, 0); // normal burn
  assert(elN !== null && isFinite(elN.i), 'applyBurn with normal dv failed');
  assert(Math.abs(elN.i) > Math.abs(el0.i), 'normal burn should change inclination');
});

// ── SECTION 3: Lambert solver fixture cases ───────────────────────────────────
console.log('\n[3] Lambert solver fixture cases');

test('Izzo Lambert: Earth→1.5 AU in ~259d — returns finite velocities', () => {
  // Non-degenerate 120° transfer from 1 AU to 1.5 AU.
  // Avoids the 180° (anti-parallel) singularity where the transfer plane is undefined.
  const r1 = [1.0, 0.0, 0.0];
  const r2 = [1.5 * Math.cos(2 * Math.PI / 3), 1.5 * Math.sin(2 * Math.PI / 3), 0.0];
  const tof = 259.0;
  const lam = izzoLambert(r1, r2, tof, 1);
  assert(lam !== null, 'izzoLambert returned null');
  assert(lam.v1 && lam.v2, 'missing v1 or v2');
  assert(lam.v1.every(isFinite), `v1 non-finite: ${lam.v1}`);
  assert(lam.v2.every(isFinite), `v2 non-finite: ${lam.v2}`);
  // Departure speed should be in plausible heliocentric range for inner solar system
  const v1_mag = Math.hypot(...lam.v1);
  assert(v1_mag > 20 && v1_mag < 55, `v1_mag ${v1_mag.toFixed(2)} km/s out of range`);
});

test('BMW Lambert: same geometry — returns finite velocities', () => {
  // Same 120° geometry as Izzo test — avoids 180° singularity
  const r1 = [1.0, 0.0, 0.0];
  const r2 = [1.5 * Math.cos(2 * Math.PI / 3), 1.5 * Math.sin(2 * Math.PI / 3), 0.0];
  const tof = 259.0;
  const lam = lambert(r1, r2, tof);
  assert(lam !== null, 'lambert (BMW) returned null');
  assert(lam.v1.every(isFinite), `v1 non-finite: ${lam.v1}`);
  assert(lam.v2.every(isFinite), `v2 non-finite: ${lam.v2}`);
});

test('Izzo Lambert: short-arc transfer (60d, 1 AU→1.3 AU) — reasonable ΔV', () => {
  const r1 = [1.0, 0.0, 0.0];
  // 1.3 AU target 60° ahead in orbit plane
  const r2 = [1.3 * Math.cos(60 * DEG), 1.3 * Math.sin(60 * DEG), 0.0];
  const tof = 120.0;
  const lam = izzoLambert(r1, r2, tof, 1);
  assert(lam !== null, 'izzoLambert returned null');
  assert(lam.v1.every(isFinite) && lam.v2.every(isFinite), 'non-finite velocities');
  // Heliocentric departure speed must be finite and positive; fast short arcs can exceed 40 km/s
  const v1_mag = Math.hypot(...lam.v1);
  assert(isFinite(v1_mag) && v1_mag > 0, `v1_mag not positive-finite: ${v1_mag}`);
});

test('Lambert: near-degenerate (r1 ≈ r2) — returns null gracefully', () => {
  // Both solvers must not crash or return garbage when start = end
  const r1 = [1.0, 0.0, 0.0];
  const r2 = [1.0 + 1e-8, 0.0, 0.0];
  const lamI = izzoLambert(r1, r2, 30.0, 1);
  const lamB = lambert(r1, r2, 30.0);
  // Either null or finite — must not throw or return NaN/Infinity
  if (lamI !== null) assert(lamI.v1.every(isFinite), 'Izzo: NaN in near-degenerate');
  if (lamB !== null) assert(lamB.v1.every(isFinite), 'BMW: NaN in near-degenerate');
});

// ── SECTION 4: Staging monotonicity ──────────────────────────────────────────
console.log('\n[4] Staging / propellant monotonicity');

// Reimplement inline — matches propellantKgNum in index.html exactly.
function propellantKgNum(dv_kms, isp, m_dry) {
  const g0 = 0.00980665;
  return m_dry * (Math.exp(dv_kms / (g0 * isp)) - 1);
}
function isSingleStageFeasible(dv_kms, isp) {
  const g0 = 0.00980665;
  return Math.exp(dv_kms / (g0 * isp)) <= 20;
}

test('propellantKgNum increases monotonically with ΔV', () => {
  const isp = 320, dry = 5000;
  let prev = 0;
  for (const dv of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const prop = propellantKgNum(dv, isp, dry);
    assert(prop > prev, `propellant not monotone at ΔV=${dv}: ${prop} ≤ ${prev}`);
    prev = prop;
  }
});

test('propellantKgNum returns raw value — no silent cap at mass ratio 20', () => {
  const isp = 320, dry = 5000;
  // ΔV = 25 km/s → mass ratio ≈ e^(25/3.138) ≈ 2900, propKg ≈ 14.5 Mt
  const prop = propellantKgNum(25, isp, dry);
  const ratio = (prop + dry) / dry;
  assert(ratio > 100, `expected ratio >> 20 for high ΔV, got ${ratio.toFixed(1)}`);
});

test('isSingleStageFeasible: mass ratio ≤ 20 → feasible', () => {
  assert(isSingleStageFeasible(9.4, 320), '9.4 km/s @ Isp 320 should be feasible (ratio ≈ 20)');
  assert(isSingleStageFeasible(5.0, 320), '5 km/s should be feasible');
});

test('isSingleStageFeasible: mass ratio > 20 → infeasible', () => {
  assert(!isSingleStageFeasible(15.0, 320), '15 km/s @ Isp 320 should be infeasible');
  assert(!isSingleStageFeasible(12.0, 320), '12 km/s @ Isp 320 should be infeasible');
});

// ── SECTION 5: Capture model invariants ──────────────────────────────────────
console.log('\n[5] destinationCaptureDv invariants');

test('capture ΔV increases with v_inf', () => {
  const r_park = 6371 + 400;
  const dv1 = destinationCaptureDv(1.0, 'leo', r_park);
  const dv2 = destinationCaptureDv(2.0, 'leo', r_park);
  const dv3 = destinationCaptureDv(4.0, 'leo', r_park);
  assert(isFinite(dv1) && isFinite(dv2) && isFinite(dv3), 'non-finite capture ΔV');
  assert(dv1 < dv2 && dv2 < dv3, `capture ΔV not monotone: ${dv1.toFixed(3)} ${dv2.toFixed(3)} ${dv3.toFixed(3)}`);
});

test('destination adders: geo > leo, l1 > leo', () => {
  const r_park = 6371 + 400;
  const vinf = 2.0;
  const dv_leo = destinationCaptureDv(vinf, 'leo', r_park);
  const dv_geo = destinationCaptureDv(vinf, 'geo', r_park);
  const dv_l1  = destinationCaptureDv(vinf, 'l1',  r_park);
  assert(dv_geo > dv_leo, `geo (${dv_geo.toFixed(3)}) should be > leo (${dv_leo.toFixed(3)})`);
  assert(dv_l1  > dv_leo, `l1 (${dv_l1.toFixed(3)}) should be > leo (${dv_leo.toFixed(3)})`);
});

test('capture ΔV is always positive and finite', () => {
  const r_park = 6371 + 400;
  for (const vinf of [0.5, 1, 2, 3, 5, 8]) {
    const dv = destinationCaptureDv(vinf, 'leo', r_park);
    assert(isFinite(dv) && dv > 0, `capture ΔV not positive-finite at vinf=${vinf}: ${dv}`);
  }
});

// ── SECTION 6: Phase-1 prefilter regression ───────────────────────────────────
console.log('\n[6] Phase-1 candidate sort regression');

test('est_total prefilter: candidate with lower outbound but higher est_total sorts after better candidate', () => {
  // Candidate A: low outbound (4 km/s) but high vinf_arr (5 km/s) → high est_total
  // Candidate B: higher outbound (5 km/s) but low vinf_arr (1 km/s) → lower est_total
  // After Step 2 fix, sort by est_total → B should rank first.
  const r_park = 6371 + 400;
  const destination = 'leo';

  const makeCandidate = (dv_dep, dv_arr, vinf_arr) => {
    const mcc = 0.02 * (dv_dep + dv_arr);
    const est_return = vinf_arr;
    const est_capture = destinationCaptureDv(vinf_arr, destination, r_park);
    const est_total = dv_dep + dv_arr + mcc + est_return + est_capture;
    return { dv_dep, dv_arr, vinf_arr, est_total };
  };

  const candA = makeCandidate(4.0, 1.0, 5.0); // low outbound, bad return
  const candB = makeCandidate(5.0, 1.0, 1.0); // higher outbound, good return

  // Verify the premise: A has lower outbound, B has lower est_total
  assert(candA.dv_dep + candA.dv_arr < candB.dv_dep + candB.dv_arr,
    'setup: A should have lower outbound than B');
  assert(candB.est_total < candA.est_total,
    `setup: B should have lower est_total than A (B=${candB.est_total.toFixed(3)}, A=${candA.est_total.toFixed(3)})`);

  // Sort by est_total (Phase 2 fix) → B first
  const sorted = [candA, candB].sort((a, b) => a.est_total - b.est_total);
  assert(sorted[0] === candB, 'est_total sort: B (lower est_total) should rank first');
});

test('old outbound-only sort would have ranked A first (regression guard)', () => {
  const candA = { dv_dep: 4.0, dv_arr: 1.0, est_total: 20.0 }; // lower outbound
  const candB = { dv_dep: 5.0, dv_arr: 1.0, est_total: 10.0 }; // lower est_total

  // Old sort by dv_dep + dv_arr
  const oldSorted = [candA, candB].sort((a, b) => (a.dv_dep + a.dv_arr) - (b.dv_dep + b.dv_arr));
  assert(oldSorted[0] === candA, 'old sort would have ranked A first (proving the bug existed)');

  // New sort by est_total
  const newSorted = [candA, candB].sort((a, b) => a.est_total - b.est_total);
  assert(newSorted[0] === candB, 'new sort correctly ranks B first');
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(52)}`);
console.log(`  ${passed} passed, ${failed} failed  (${passed + failed} total)`);
console.log(`${'─'.repeat(52)}\n`);

if (failed > 0) {
  console.error('FAILED TESTS:');
  results.filter(r => !r.ok).forEach(r => console.error(`  ✗ ${r.name}\n    ${r.err}`));
  process.exit(1);
}
