import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-lowthrust-edelbaum');

async function loadModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
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

const REL_TOL = 1e-9;
const relErr = (actual, expected) => Math.abs(actual - expected) / Math.abs(expected);

test('Edelbaum coplanar 1 AU -> 1.5 AU matches the closed form written out here', async () => {
  const { edelbaum, keplerian } = await loadModules();
  // Closed form, written out: V = sqrt(mu / r) at each circular radius; dV = |V0 - V1| (coplanar, di = 0).
  const mu = keplerian.GM_SUN_M3_S2;                 // repo's own solar GM, m^3/s^2
  const AU = 149_597_870_700;                         // IAU 2012 astronomical unit, metres
  const r0 = 1.0 * AU;
  const r1 = 1.5 * AU;
  const v0 = Math.sqrt(mu / r0);
  const v1 = Math.sqrt(mu / r1);
  const expectedDeltaV = Math.abs(v0 - v1);
  const a = 1e-4;                                    // m/s^2, a representative ion-engine acceleration
  const expectedTof = expectedDeltaV / a;

  const transfer = edelbaum.edelbaumCircularTransfer({ muM3S2: mu, r0M: r0, r1M: r1, accelerationMps2: a });
  assert.ok(relErr(transfer.deltaVMps, expectedDeltaV) <= REL_TOL, `dV ${transfer.deltaVMps} vs ${expectedDeltaV}`);
  assert.ok(relErr(transfer.timeOfFlightSeconds, expectedTof) <= REL_TOL, `tof ${transfer.timeOfFlightSeconds} vs ${expectedTof}`);
  assert.ok(relErr(transfer.v0Mps, v0) <= REL_TOL);
  assert.ok(relErr(transfer.v1Mps, v1) <= REL_TOL);
  assert.equal(transfer.fidelity, 'screening-analytic-edelbaum-coplanar');
  // Sanity against the physical scale: ~29.78 km/s and ~24.32 km/s circular speeds, ~5.5 km/s difference.
  assert.ok(expectedDeltaV > 5_000 && expectedDeltaV < 6_000, `dV out of expected band: ${expectedDeltaV}`);
  assert.ok(relErr(edelbaum.edelbaumCoplanarDeltaVMps(mu, r0, r1), expectedDeltaV) <= REL_TOL);
});

test('Edelbaum dV -> 0 as the radii converge, and is symmetric in direction', async () => {
  const { edelbaum, keplerian } = await loadModules();
  const mu = keplerian.GM_SUN_M3_S2;
  const r0 = 149_597_870_700;
  let previous = Infinity;
  for (const factor of [1.5, 1.1, 1.01, 1.001, 1.000001]) {
    const dv = edelbaum.edelbaumCoplanarDeltaVMps(mu, r0, r0 * factor);
    assert.ok(dv < previous, `dV should fall as radii converge: ${dv} !< ${previous}`);
    previous = dv;
  }
  assert.equal(edelbaum.edelbaumCoplanarDeltaVMps(mu, r0, r0), 0);
  // First-order: dV ~= v0 * eps / 2 for r1 = r0 * (1 + eps). At eps = 1e-6 and v0 ~= 29.8 km/s
  // that is ~0.0149 m/s. Pin the linearised value itself (coefficient 1/2 included) to 0.1 %, so a
  // factor-of-2, missing-sqrt, or sign error in the closed form cannot pass; the second-order term
  // at eps = 1e-6 is ~3e-7 relative, far inside that margin.
  const v0 = edelbaum.circularSpeedMps(mu, r0);
  const epsilon = 1e-6;
  const linearised = (v0 * epsilon) / 2;
  assert.ok(
    Math.abs(previous - linearised) < linearised * 1e-3,
    `near-identical radii: dV should be ~v0*eps/2 = ${linearised}, got ${previous}`,
  );
  assert.equal(
    edelbaum.edelbaumCoplanarDeltaVMps(mu, r0, 1.5 * r0),
    edelbaum.edelbaumCoplanarDeltaVMps(mu, 1.5 * r0, r0),
  );
});

test('Edelbaum time of flight scales inversely with acceleration', async () => {
  const { edelbaum } = await loadModules();
  const dv = 5_467;
  const tofA = edelbaum.edelbaumTimeOfFlightSeconds(dv, 1e-4);
  const tofB = edelbaum.edelbaumTimeOfFlightSeconds(dv, 2e-4);
  const tofC = edelbaum.edelbaumTimeOfFlightSeconds(dv, 1e-3);
  assert.ok(relErr(tofA / tofB, 2) <= REL_TOL);
  assert.ok(relErr(tofA / tofC, 10) <= REL_TOL);
  assert.ok(relErr(tofA, dv / 1e-4) <= REL_TOL);
});

test('Edelbaum rejects non-finite or non-positive inputs with TypeError, never a number', async () => {
  const { edelbaum, keplerian } = await loadModules();
  const mu = keplerian.GM_SUN_M3_S2;
  const r = 149_597_870_700;
  for (const bad of [0, -1, NaN, Infinity, -Infinity]) {
    assert.throws(() => edelbaum.circularSpeedMps(mu, bad), TypeError);
    assert.throws(() => edelbaum.circularSpeedMps(bad, r), TypeError);
    assert.throws(() => edelbaum.edelbaumTimeOfFlightSeconds(1, bad), TypeError);
    assert.throws(() => edelbaum.edelbaumCircularTransfer({ muM3S2: mu, r0M: r, r1M: bad, accelerationMps2: 1e-4 }), TypeError);
  }
  assert.throws(() => edelbaum.edelbaumTimeOfFlightSeconds(-1, 1e-4), TypeError);
  assert.throws(() => edelbaum.edelbaumTimeOfFlightSeconds(NaN, 1e-4), TypeError);
  assert.equal(edelbaum.edelbaumTimeOfFlightSeconds(0, 1e-4), 0);
});
