#!/usr/bin/env node
/**
 * OQ-4 validation harness: compare Aster v2 Lambert solver against NHATS
 * for the 5 DEC-7 reference targets.
 *
 * Outputs a structured report with per-target deviation (C3, v_inf_dep, v_inf_arr_neo).
 * The report is the input for OQ-4 tolerance lock.
 *
 * Run:  node tools/slice10-research/nhats-validation.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const tempOutDir = path.join(repoRoot, '.tmp-tests', 'oq4-harness');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'lambert', 'izzo.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'propagators', 'keplerian.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'units', 'utc-to-tdb.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'constants', 'asteroids.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'interpolators', 'hermite.ts'),
        path.join(repoRoot, 'src', 'v2', 'boundary', 'slice9-nea-catalog.ts'),
        path.join(repoRoot, 'src', 'v2', 'boundary', 'horizons.ts'),
        path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'slice9-runtime-asteroids.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
if (tscResult.status !== 0) {
    console.error('TypeScript compile failed:');
    console.error(tscResult.stderr || tscResult.stdout);
    process.exit(1);
}

const importJs = async (relPath) =>
    import(pathToFileURL(path.join(tempOutDir, relPath)).href);

const { lambert } = await importJs('core/lambert/izzo.js');
const { propagateKeplerianStateVectors } = await importJs('core/propagators/keplerian.js');
const { utcStringToTdbSeconds } = await importJs('core/units/utc-to-tdb.js');
const { createAsteroidCatalogIndex, getAsteroidByDesignation, getAsteroidBySpkId } = await importJs('core/constants/asteroids.js');
const { ingestSlice9Fixture } = await importJs('boundary/slice9-nea-catalog.js');
const { ingestSlice2Fixture } = await importJs('boundary/horizons.js');
const { interpolateBodyStateSeries } = await importJs('core/interpolators/hermite.js');
const { normalizeSlice9BodyForRuntime } = await importJs('app/solar-system/slice9-runtime-asteroids.js');

const SECONDS_PER_DAY = 86400;
const MU_SUN = 1.32712440018e11; // km^3/s^2

const NHATS_FIXTURE_DIR = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nhats-validation-targets');
const HORIZONS_FIXTURE = path.join(
    repoRoot, 'tests', 'fixtures', 'v2', 'horizons-inner-solar-system-2026-2040.json'
);
const NEA_FIXTURE = path.join(
    repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json'
);

const horizonsRaw = JSON.parse(fs.readFileSync(HORIZONS_FIXTURE, 'utf8'));
const horizonsStates = ingestSlice2Fixture(horizonsRaw);
const earthSeries = horizonsStates.earth.map((sample) => sample.state);

function earthStateAt(tdbSeconds) {
    return interpolateBodyStateSeries('earth', earthSeries, tdbSeconds);
}

const catalogRaw = JSON.parse(fs.readFileSync(NEA_FIXTURE, 'utf8'));
const canonicalCatalog = ingestSlice9Fixture(catalogRaw);
const normalizedCatalog = Object.values(canonicalCatalog.asteroids).map((body) =>
    normalizeSlice9BodyForRuntime(body)
);
const catalogIndex = createAsteroidCatalogIndex(normalizedCatalog);

const TARGETS = [
    { fixture: '99942.json', designation: '99942', label: 'Apophis', spkId: 2009942 },
    { fixture: '2000_SG344.json', designation: '2000 SG344', label: '2000 SG344', spkId: null },
    { fixture: '1999_AO10.json', designation: '1999 AO10', label: '1999 AO10', spkId: null },
    { fixture: '2001_GP2.json', designation: '2001 GP2', label: '2001 GP2', spkId: null },
    { fixture: '101955.json', designation: '101955', label: 'Bennu', spkId: 2101955 },
];

function kmVectorFromMeters(positionM) {
    return [positionM.x / 1000, positionM.y / 1000, positionM.z / 1000];
}

function kmpsVectorFromMps(velocityMps) {
    return [velocityMps.x / 1000, velocityMps.y / 1000, velocityMps.z / 1000];
}

function magnitude3(vector) {
    return Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);
}

function subtract3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

const results = [];

for (const target of TARGETS) {
    const nhatsRaw = JSON.parse(
        fs.readFileSync(path.join(NHATS_FIXTURE_DIR, target.fixture), 'utf8')
    );
    const traj = nhatsRaw.min_dv_traj;
    if (!traj) {
        results.push({ target: target.label, status: 'missing_min_dv_traj' });
        continue;
    }

    const nhats_c3 = parseFloat(traj.c3);
    const nhats_v_dep = parseFloat(traj.v_dep_earth);
    const nhats_v_arr_neo = parseFloat(traj.vrel_arr_neo);

    const t_launch_tdb = utcStringToTdbSeconds(traj.launch);
    const tof_seconds = parseFloat(traj.dur_out) * SECONDS_PER_DAY;
    const t_arrival_tdb = t_launch_tdb + tof_seconds;

    const earthAtLaunch = earthStateAt(t_launch_tdb);
    let nea = getAsteroidByDesignation(catalogIndex, target.designation);
    if (!nea && target.spkId !== null) {
        nea = getAsteroidBySpkId(catalogIndex, target.spkId);
    }
    if (!nea) {
        results.push({
            target: target.label,
            status: 'catalog_miss',
            designation: target.designation,
            spkId: target.spkId,
        });
        continue;
    }

    const neaAtArrival = propagateKeplerianStateVectors(nea.elements, t_arrival_tdb);

    const lambertResult = lambert(
        MU_SUN,
        kmVectorFromMeters(earthAtLaunch.positionM),
        kmVectorFromMeters(neaAtArrival.positionM),
        tof_seconds
    );

    if (!lambertResult.ok) {
        results.push({ target: target.label, status: 'lambert_failed', reason: lambertResult.reason });
        continue;
    }

    const earthVelKmS = kmpsVectorFromMps(earthAtLaunch.velocityMps);
    const neaVelKmS = kmpsVectorFromMps(neaAtArrival.velocityMps);

    const vInfDep = subtract3(lambertResult.v1, earthVelKmS);
    const vInfDepMag = magnitude3(vInfDep);
    const ourC3 = vInfDepMag * vInfDepMag;

    const vInfArrNeo = subtract3(lambertResult.v2, neaVelKmS);
    const vInfArrNeoMag = magnitude3(vInfArrNeo);

    const devC3 = (ourC3 - nhats_c3) / nhats_c3;
    const devVDep = (vInfDepMag - nhats_v_dep) / nhats_v_dep;
    const devVArr = (vInfArrNeoMag - nhats_v_arr_neo) / nhats_v_arr_neo;

    results.push({
        target: target.label,
        status: 'compared',
        launch: traj.launch,
        tof_days: parseFloat(traj.dur_out),
        nhats: { c3: nhats_c3, v_dep: nhats_v_dep, v_arr_neo: nhats_v_arr_neo },
        ours: { c3: ourC3, v_dep: vInfDepMag, v_arr_neo: vInfArrNeoMag },
        deviation: { c3: devC3, v_dep: devVDep, v_arr_neo: devVArr },
        iterations: lambertResult.iterations,
        x: lambertResult.x,
    });
}

console.log('');
console.log('===== OQ-4 Validation Harness Report =====');
console.log('');
console.log('Per-target comparison (Aster v2 Lambert vs NHATS min_dv_traj):');
console.log('-------------------------------------------------------------------------');
console.log(
    'Target           Launch       TOF(d)   C3(NHATS)  C3(ours)    dC3%     dv_dep%   dv_arr%  iters'
);
console.log('-------------------------------------------------------------------------');

for (const r of results) {
    if (r.status !== 'compared') {
        console.log(`${r.target.padEnd(16)} STATUS: ${r.status}${r.reason ? ' ' + r.reason : ''}`);
        continue;
    }
    const fmt = (n, decimals = 3) => n.toFixed(decimals).padStart(10);
    const fmtPct = (n) => (n * 100).toFixed(3).padStart(8) + '%';
    console.log(
        `${r.target.padEnd(16)} ${r.launch}  ${String(r.tof_days).padStart(5)}   ` +
        `${fmt(r.nhats.c3)} ${fmt(r.ours.c3)} ${fmtPct(r.deviation.c3)} ` +
        `${fmtPct(r.deviation.v_dep)} ${fmtPct(r.deviation.v_arr_neo)} ${String(r.iterations).padStart(5)}`
    );
}

console.log('');
const compared = results.filter((r) => r.status === 'compared');
if (compared.length > 0) {
    const absDevs = (key) => compared.map((r) => Math.abs(r.deviation[key]));
    const med = (arr) => {
        const s = [...arr].sort((a, b) => a - b);
        return s.length % 2 ? s[(s.length - 1) >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
    };
    console.log('Summary across compared targets:');
    console.log(`  Targets compared: ${compared.length} / ${TARGETS.length}`);
    console.log(`  |dC3| median = ${(med(absDevs('c3')) * 100).toFixed(4)}%, max = ${(Math.max(...absDevs('c3')) * 100).toFixed(4)}%`);
    console.log(`  |dv_dep| median = ${(med(absDevs('v_dep')) * 100).toFixed(4)}%, max = ${(Math.max(...absDevs('v_dep')) * 100).toFixed(4)}%`);
    console.log(`  |dv_arr| median = ${(med(absDevs('v_arr_neo')) * 100).toFixed(4)}%, max = ${(Math.max(...absDevs('v_arr_neo')) * 100).toFixed(4)}%`);
}
console.log('');
console.log('===== End Report =====');
