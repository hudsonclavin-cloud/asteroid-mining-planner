/**
 * Independent numerical oracle for the coplanar Edelbaum closed form (AGENTS.md §2 math-layer gate).
 *
 * The oracle is a different METHOD, not the same formula restated: a two-body RK4 propagation with
 * continuous tangential thrust at constant acceleration a, started on a circular orbit of radius r0 and
 * stopped when the osculating semi-major axis reaches r1. Its accumulated ΔV is a·t by construction.
 * Edelbaum's coplanar result is the a → 0 limit of exactly that manoeuvre, so the propagated ΔV must
 * converge to |√(μ/r0) − √(μ/r1)| as a/g shrinks, and the discrepancy must fall monotonically.
 *
 * Measured once in a scratch run (same code), 1 AU → 1.5 AU, μ = GM_SUN:
 *   a = 1e-4 m/s²  (a/g = 1.7e-2): −0.96 %      a = 3e-5 (5.1e-3): −0.10 %
 *   a = 1e-5       (1.7e-3):       −0.0046 %    a = 3e-6 (5.1e-4): −0.0009 %
 * The test runs the first three (≈0.2 s) and asserts the trend and the final agreement.
 *
 * What this does NOT verify: the time-of-flight relation under mass flow (edelbaum.ts states the bias),
 * eclipses, plane change, or any published reference value. A published value is still owed to the
 * multi-agent audit before LOW_THRUST_ENABLED is ever set true.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lowthrust-edelbaum-oracle');

async function loadModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false', '--outDir', tempOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext', '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'lowthrust', 'edelbaum.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  const edelbaum = await import(pathToFileURL(path.join(tempOutDir, 'lowthrust', 'edelbaum.js')).href);
  const keplerian = await import(pathToFileURL(path.join(tempOutDir, 'core', 'propagators', 'keplerian.js')).href);
  return { edelbaum, keplerian };
}

/** Planar two-body motion plus tangential thrust a, RK4 with a fixed step; returns accumulated ΔV = a·t. */
function propagateTangentialSpiral(mu, r0, r1, a, dtSeconds) {
  let x = r0;
  let y = 0;
  let vx = 0;
  let vy = Math.sqrt(mu / r0);
  let t = 0;
  const deriv = (px, py, pvx, pvy) => {
    const r = Math.hypot(px, py);
    const v = Math.hypot(pvx, pvy);
    const g = -mu / (r * r * r);
    return [pvx, pvy, g * px + (a * pvx) / v, g * py + (a * pvy) / v];
  };
  const semiMajorAxis = () => 1 / (2 / Math.hypot(x, y) - (vx * vx + vy * vy) / mu);
  // Outward spirals (a > 0) raise the osculating semi-major axis towards r1; inward ones (a < 0) lower it.
  const reached = r1 > r0 ? () => semiMajorAxis() >= r1 : () => semiMajorAxis() <= r1;
  const maxSteps = 10_000_000;
  for (let step = 0; !reached(); step += 1) {
    if (step >= maxSteps) throw new Error('propagation did not reach r1');
    const k1 = deriv(x, y, vx, vy);
    const k2 = deriv(x + (dtSeconds / 2) * k1[0], y + (dtSeconds / 2) * k1[1], vx + (dtSeconds / 2) * k1[2], vy + (dtSeconds / 2) * k1[3]);
    const k3 = deriv(x + (dtSeconds / 2) * k2[0], y + (dtSeconds / 2) * k2[1], vx + (dtSeconds / 2) * k2[2], vy + (dtSeconds / 2) * k2[3]);
    const k4 = deriv(x + dtSeconds * k3[0], y + dtSeconds * k3[1], vx + dtSeconds * k3[2], vy + dtSeconds * k3[3]);
    x += (dtSeconds / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (dtSeconds / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    vx += (dtSeconds / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    vy += (dtSeconds / 6) * (k1[3] + 2 * k2[3] + 2 * k3[3] + k4[3]);
    t += dtSeconds;
  }
  return { deltaVMps: a * t, seconds: t };
}

test('RK4 tangential-thrust propagation converges to the Edelbaum coplanar dV as a/g -> 0', async () => {
  const { edelbaum, keplerian } = await loadModules();
  const mu = keplerian.GM_SUN_M3_S2;
  const AU = 149_597_870_700;
  const r0 = AU;
  const r1 = 1.5 * AU;
  const closedForm = edelbaum.edelbaumCoplanarDeltaVMps(mu, r0, r1);
  const gravity = mu / (r0 * r0);

  const accelerations = [1e-4, 3e-5, 1e-5]; // m/s²; a/g from 1.7e-2 down to 1.7e-3
  const relativeErrors = accelerations.map((a) => {
    const { deltaVMps } = propagateTangentialSpiral(mu, r0, r1, a, 1_800);
    return Math.abs(deltaVMps / closedForm - 1);
  });

  // The discrepancy must shrink as the manoeuvre approaches the low-thrust limit the formula assumes.
  for (let i = 1; i < relativeErrors.length; i += 1) {
    assert.ok(
      relativeErrors[i] < relativeErrors[i - 1] / 3,
      `error should fall ~linearly with a/g: ${relativeErrors.map((e) => e.toExponential(2)).join(' -> ')} at a/g = ${accelerations.map((a) => (a / gravity).toExponential(1)).join(', ')}`,
    );
  }
  // At a/g = 1.7e-3 the two methods agree to better than 0.02 % (measured 0.0046 %).
  assert.ok(relativeErrors.at(-1) < 2e-4, `final relative error ${relativeErrors.at(-1)} not < 2e-4`);
  // And the same relation holds in the other direction (1.5 AU -> 1 AU, decelerating thrust).
  const inward = propagateTangentialSpiral(mu, r1, r0, -1e-5, 1_800);
  assert.ok(Math.abs(Math.abs(inward.deltaVMps) / closedForm - 1) < 2e-4, `inward relative error ${Math.abs(inward.deltaVMps) / closedForm - 1}`);
});

test('the propagated time of flight equals dV / a, the relation edelbaum.ts uses', async () => {
  const { edelbaum, keplerian } = await loadModules();
  const mu = keplerian.GM_SUN_M3_S2;
  const AU = 149_597_870_700;
  const a = 1e-5;
  const { deltaVMps, seconds } = propagateTangentialSpiral(mu, AU, 1.5 * AU, a, 1_800);
  const transfer = edelbaum.edelbaumCircularTransfer({ muM3S2: mu, r0M: AU, r1M: 1.5 * AU, accelerationMps2: a });
  // Same ΔV to 0.02 % (above) implies the same ΔV / a; check the closed-form TOF against the propagation clock.
  assert.ok(Math.abs(seconds / transfer.timeOfFlightSeconds - 1) < 2e-4, `tof ${seconds} vs ${transfer.timeOfFlightSeconds}`);
  assert.ok(Math.abs(deltaVMps / transfer.deltaVMps - 1) < 2e-4);
});
