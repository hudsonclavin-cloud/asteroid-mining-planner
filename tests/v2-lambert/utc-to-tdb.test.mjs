import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-utc-to-tdb');
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
        path.join(repoRoot, 'src', 'v2', 'core', 'units', 'utc-to-tdb.ts'),
        path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' }
);
assert.equal(tscResult.status, 0, tscResult.stderr || tscResult.stdout || 'tsc failed');

const { utcStringToTdbSeconds, TDB_MINUS_UTC_SECONDS } = await import(
    pathToFileURL(path.join(tempOutDir, 'core', 'units', 'utc-to-tdb.js')).href
);

const t0 = utcStringToTdbSeconds("2000-01-01T12:00:00Z");
assert.ok(
    Math.abs(t0 - TDB_MINUS_UTC_SECONDS) < 1e-12,
    `utcStringToTdbSeconds("2000-01-01T12:00:00Z") = ${t0}, expected ${TDB_MINUS_UTC_SECONDS}`
);

const t1 = utcStringToTdbSeconds("2000-01-02T12:00:00Z");
assert.ok(
    Math.abs(t1 - (86400 + TDB_MINUS_UTC_SECONDS)) < 1e-12,
    `utcStringToTdbSeconds("2000-01-02T12:00:00Z") = ${t1}, expected ${86400 + TDB_MINUS_UTC_SECONDS}`
);

const t2 = utcStringToTdbSeconds("2026-01-01");
const expected_t2 = 9496.5 * 86400 + TDB_MINUS_UTC_SECONDS;
assert.ok(
    Math.abs(t2 - expected_t2) < 1.0,
    `utcStringToTdbSeconds("2026-01-01") = ${t2}, expected ≈ ${expected_t2}`
);

const t_apophis = utcStringToTdbSeconds("2029-04-11");
const t_bennu = utcStringToTdbSeconds("2036-03-21");
assert.ok(t_apophis > t2, `2029 should be after 2026: ${t_apophis} vs ${t2}`);
assert.ok(t_bennu > t_apophis, `2036 should be after 2029: ${t_bennu} vs ${t_apophis}`);

const years_2026_to_2029 = (t_apophis - t2) / (86400 * 365.25);
assert.ok(
    years_2026_to_2029 > 3.2 && years_2026_to_2029 < 3.35,
    `Apophis - 2026-01-01 should be ~3.3 years (Jan to April), got ${years_2026_to_2029}`
);

console.log('utc-to-tdb.test: PASS');
