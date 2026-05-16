import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-runtime-date-hud');
const runtimeSource = fs.readFileSync(
  path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
  'utf8',
);

function compileRuntimeModule() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });

  const tscBin = path.join(repoRoot, 'node_modules', '.bin', 'tsc');
  const result = spawnSync(
    tscBin,
    [
      '--pretty', 'false',
      '--outDir', tempOutDir,
      '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext',
      '--target', 'ES2020',
      '--moduleResolution', 'NodeNext',
      '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
}

let runtimeModulePromise;

async function loadRuntimeModule() {
  if (!runtimeModulePromise) {
    compileRuntimeModule();
    runtimeModulePromise = import(
      pathToFileURL(path.join(tempOutDir, 'app', 'solar-system', 'runtime.js')).href
    );
  }

  return runtimeModulePromise;
}

test('date HUD label formats TDB seconds into a readable date string', async () => {
  const { formatTdbDateLabel } = await loadRuntimeModule();

  assert.equal(formatTdbDateLabel(830_865_600), '2026 May 01 00:00 TDB');
  assert.equal(formatTdbDateLabel(830_887_200), '2026 May 01 06:00 TDB');
  assert.equal(formatTdbDateLabel(830_952_000), '2026 May 02 00:00 TDB');
});

test('date HUD text updates from the current simulated TDB time', async () => {
  const { renderDateHud } = await loadRuntimeModule();
  const element = { textContent: '' };

  renderDateHud(element, 830_865_600);
  assert.equal(element.textContent, '2026 May 01 00:00 TDB');

  renderDateHud(element, 830_887_200);
  assert.equal(element.textContent, '2026 May 01 06:00 TDB');

  renderDateHud(element, 830_952_000);
  assert.equal(element.textContent, '2026 May 02 00:00 TDB');
});

test('runtime creates and removes the date HUD element symmetrically', () => {
  assert.match(runtimeSource, /data-testid', 'date-hud'/);
  assert.match(runtimeSource, /renderDateHud\(dateHud, currentTdbSeconds\);/);
  assert.match(runtimeSource, /dateHud\.remove\(\);/);
});
