#!/usr/bin/env node
/**
 * Diagnostic: identify whether OQ-4 outliers are caused by wrong-body
 * resolution from our catalog, or by genuine propagation drift.
 *
 * For each of the 5 validation targets, prints:
 *   - NHATS metadata from the saved fixture
 *   - Our catalog entry and orbital elements
 *   - The element epoch in both TDB seconds and approximate UTC
 *
 * Notes:
 * - NHATS `orbit_id` is a JPL orbit-solution revision counter, not a body id.
 *   It is useful as provenance, but it cannot be matched directly to our SPK id.
 * - The approximate UTC conversion below ignores sub-second TT/TDB periodic
 *   terms. That is fine for this human-readable diagnostic.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const tempOutDir = path.join(repoRoot, '.tmp-tests', 'oq4-diag');
fs.rmSync(tempOutDir, { recursive: true, force: true });
fs.mkdirSync(tempOutDir, { recursive: true });

const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
const tscResult = spawnSync(
  tscBin,
  [
    '--pretty', 'false',
    '--outDir', tempOutDir,
    '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext',
    '--target', 'ES2020',
    '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'core', 'constants', 'asteroids.ts'),
    path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
  ],
  { cwd: repoRoot, encoding: 'utf8' },
);
if (tscResult.status !== 0) {
  console.error(tscResult.stderr || tscResult.stdout);
  process.exit(1);
}

const importJs = async (relPath) => import(pathToFileURL(path.join(tempOutDir, relPath)).href);

const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
const { toAsteroidBodyId } = await importJs('core/constants/asteroids.js');

const NHATS_FIXTURE_DIR = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nhats-validation-targets');
const NEA_FIXTURE = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const TDB_MINUS_UTC_SECONDS = 69.184;
const J2000_UNIX_MS = Date.parse('2000-01-01T12:00:00Z') - TDB_MINUS_UTC_SECONDS * 1000;

const catalogRaw = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
const canonicalCatalog = ingestSlice9Fixture(catalogRaw);

const TARGETS = [
  { fixture: '99942.json', designation: '99942', label: 'Apophis' },
  { fixture: '2000_SG344.json', designation: '2000 SG344', label: '2000 SG344' },
  { fixture: '1999_AO10.json', designation: '1999 AO10', label: '1999 AO10' },
  { fixture: '2001_GP2.json', designation: '2001 GP2', label: '2001 GP2' },
  { fixture: '101955.json', designation: '101955', label: 'Bennu' },
];

function tdbSecondsToApproxUtcIso(epochTdbSeconds) {
  return new Date(J2000_UNIX_MS + epochTdbSeconds * 1000).toISOString();
}

console.log('===== OQ-4 Outlier Diagnostic =====');
console.log('');

for (const target of TARGETS) {
  const nhatsRaw = JSON.parse(fs.readFileSync(path.join(NHATS_FIXTURE_DIR, target.fixture), 'utf8'));
  const bodyId = toAsteroidBodyId(target.designation);
  const nea = canonicalCatalog.asteroids[bodyId];

  console.log(`Target: ${target.label}`);
  console.log(`  Lookup designation:     "${target.designation}"`);
  console.log('  NHATS metadata:');
  console.log(`    des:                  ${nhatsRaw.des ?? '(missing)'}`);
  console.log(`    fullname:             ${nhatsRaw.fullname ?? '(missing)'}`);
  console.log(`    orbit_id:             ${nhatsRaw.orbit_id ?? '(missing)'}`);
  console.log(`    h:                    ${nhatsRaw.h ?? '(missing)'}`);
  console.log(`    computed:             ${nhatsRaw.computed ?? '(missing)'}`);
  console.log(`    obs_start:            ${nhatsRaw.obs_start ?? '(missing)'}`);
  console.log(`    obs_end:              ${nhatsRaw.obs_end ?? '(missing)'}`);
  console.log(`    min_dv_traj.launch:   ${nhatsRaw.min_dv_traj?.launch ?? '(missing)'}`);

  if (!nea) {
    console.log('  Catalog entry:          *** NOT FOUND ***');
    console.log('');
    continue;
  }

  console.log('  Catalog entry:');
  console.log(`    bodyId:               ${nea.bodyId}`);
  console.log(`    designation:          ${nea.designation}`);
  console.log(`    spkId:                ${nea.spkId}`);
  console.log(`    name:                 ${nea.name}`);
  console.log(`    H:                    ${nea.H}`);
  console.log(`    orbitClass:           ${nea.orbitClass}`);
  console.log(`    anchorSource:         ${nea.anchorSource}`);
  console.log(`    reanchorEpochTdbJd:   ${nea.reanchorEpochTdbJd}`);
  console.log('    elements:');
  console.log(`      aM:                 ${nea.elements.aM}`);
  console.log(`      e:                  ${nea.elements.e}`);
  console.log(`      iRad:               ${nea.elements.iRad}`);
  console.log(`      omRad:              ${nea.elements.omRad}`);
  console.log(`      wRad:               ${nea.elements.wRad}`);
  console.log(`      maRad:              ${nea.elements.maRad}`);
  console.log(`      epochTdbSeconds:    ${nea.elements.epochTdbSeconds}`);
  console.log(`      epoch approx UTC:   ${tdbSecondsToApproxUtcIso(nea.elements.epochTdbSeconds)}`);

  if (nhatsRaw.h !== undefined && nea.H !== null) {
    const diff = Math.abs(Number(nhatsRaw.h) - Number(nea.H));
    console.log(
      `  H magnitude check:      NHATS=${nhatsRaw.h}, ours=${nea.H}, |diff|=${diff.toFixed(3)}, match=${diff < 0.5 ? 'YES' : 'NO'}`
    );
  }

  console.log('');
}

console.log('===== End Diagnostic =====');
console.log('');
console.log('Interpretation guide:');
console.log('- H match within ~0.5 mag strongly suggests the correct body was resolved.');
console.log('- NHATS orbit_id is a solution-revision number, not a body id; use it as provenance only.');
console.log('- If the element epoch predates the NHATS launch/computed dates by years, propagation drift is plausible.');
