import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-ephemeris-hud');

async function loadModule() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'ephemeris-status.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return import(pathToFileURL(path.join(outDir, 'app', 'solar-system', 'ephemeris-status.js')).href);
}

const rollingFixtures = [
  'horizons-inner-system-rolling.json',
  'horizons-jupiter-system-rolling.json',
  'horizons-mars-system-rolling.json',
  'horizons-saturn-system-rolling.json',
];

function coverageFromRollingFixtures() {
  const series = rollingFixtures.flatMap((name) => {
    const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'data', name), 'utf8'));
    return Object.values(fixture.targets).map((target) => target.records);
  });
  const timeMin = Math.max(...series.map((records) => records[0][0]));
  const timeMax = Math.min(...series.map((records) => records.at(-1)[0]));
  const date = (jd) => new Date((jd - 2_440_587.5) * 86_400_000).toISOString().slice(0, 10);
  return {
    timeMin,
    timeMax,
    coverageStartDate: date(timeMin),
    coverageEndDate: date(timeMax),
  };
}

const coverage = coverageFromRollingFixtures();

test('tracking one day past coverage mounts NOT LIVE and the exact clamped-date warning', async () => {
  const { ephemerisStatusHud } = await loadModule();
  assert.equal(coverage.coverageStartDate, '2026-07-18');
  assert.equal(coverage.coverageEndDate, '2026-10-16');
  const hud = ephemerisStatusHud({
    ...coverage,
    tracking: true,
    wallClockTdbSeconds: coverage.timeMax + 1,
  });
  assert.equal(hud.trackingText, 'NOT LIVE \u00b7 clamped to 2026-10-16 TDB');
  assert.equal(
    hud.warningText,
    "Current time is past this view's ephemeris coverage (ends 2026-10-16 TDB). Positions are shown for 2026-10-16, not now.",
  );
  assert.doesNotMatch(hud.trackingText, /LIVE$/);
});

test('tracking inside coverage mounts LIVE without a warning', async () => {
  const { ephemerisStatusHud } = await loadModule();
  const hud = ephemerisStatusHud({
    ...coverage,
    tracking: true,
    wallClockTdbSeconds: (coverage.timeMin + coverage.timeMax) / 2,
  });
  assert.equal(hud.trackingText, 'LIVE');
  assert.equal(hud.warningText, null);
});
