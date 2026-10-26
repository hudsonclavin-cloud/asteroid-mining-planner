import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { contrastRatio } from '../tools/design/contrast.mjs';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-a11y-floor');

async function loadOverrides() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'design', 'a11y-overrides.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return import(pathToFileURL(path.join(outDir, 'app', 'design', 'a11y-overrides.js')).href);
}

test('contrast utility matches WCAG reference pairs and the three lightness overrides', async () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.ok(Math.abs(contrastRatio('#777777', '#ffffff') - 4.478) < 0.01);
  const { A11Y_OVERRIDES } = await loadOverrides();
  assert.ok(contrastRatio('#ffffff', A11Y_OVERRIDES.statusLowC3.value) >= 4.5);
  assert.ok(contrastRatio('#ffffff', A11Y_OVERRIDES.tierL1.value) >= 4.5);
  assert.ok(contrastRatio(A11Y_OVERRIDES.catalogHint.value, A11Y_OVERRIDES.catalogHint.background) >= 4.5);
});

test('catalog row is keyboard-focusable and Enter activates the same handler as click', async () => {
  const rowOutDir = path.join(repoRoot, '.tmp-tests', 'v2-a11y-row');
  fs.rmSync(rowOutDir, { recursive: true, force: true });
  fs.mkdirSync(rowOutDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', rowOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'row.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const { renderRow } = await import(pathToFileURL(path.join(rowOutDir, 'app', 'catalog-list', 'row.js')).href);
  const { selectedBodySignal } = await import(pathToFileURL(path.join(rowOutDir, 'app', 'ui-store', 'store.js')).href);
  const row = renderRow({
    bodyId: 'asteroid-keyboard', spkId: 1, designation: 'keyboard', name: 'Keyboard', orbitClass: 'NEA', H: null,
    screen: { status: 'low_departure_c3', minC3: 1.2, minC3Date: '2026-01-01', minC3TofDays: 200, bestWindows: [], isCoOrbital: false, isNearZeroC3Degenerate: false },
    screeningGrid: { kind: 'screen-cache', departureStepDays: 10, tofStepDays: 20, tofMinDays: 10, tofMaxDays: 100, departureSpan: { startUtc: '2026-01-01', endUtc: '2026-02-01' } },
    tier: { des: 'keyboard', tier: 'L2', subReason: 'test', classification: 'test' },
  }, 0);
  const button = row.props.children[0];
  assert.equal(button.type, 'button');
  assert.equal(button.props.tabIndex, 0);
  let prevented = false;
  button.props.onKeyDown({
    key: 'Enter',
    preventDefault: () => { prevented = true; },
    currentTarget: { click: () => button.props.onClick() },
  });
  assert.equal(prevented, true);
  assert.equal(selectedBodySignal.value, 'asteroid-keyboard');
});
