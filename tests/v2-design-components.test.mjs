import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '.tmp-tests', 'v2-design-components');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'v2', 'f2-rendered-text.json'), 'utf8'));

function text(vnode) {
  if (vnode === null || vnode === undefined || typeof vnode === 'boolean') return '';
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (Array.isArray(vnode)) return vnode.map(text).join('');
  return text(vnode.props?.children);
}

async function load() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(root, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true',
    ...['C3Value', 'NearZeroC3Badge', 'StatusBadge', 'FeasibilityBadge', 'EvidenceBadge']
      .map((name) => path.join(root, 'src', 'v2', 'app', 'design', 'components', `${name}.ts`)),
  ], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return Promise.all(['C3Value', 'NearZeroC3Badge', 'StatusBadge', 'FeasibilityBadge', 'EvidenceBadge']
    .map(async (name) => [name, await import(pathToFileURL(path.join(outDir, 'app', 'design', 'components', `${name}.js`)).href)]));
}

test('shared honesty components preserve the characterization fixture', async () => {
  const modules = Object.fromEntries(await load());
  const c3 = text(modules.C3Value.C3Value({ value: 4.21, unit: 'km²/s²', grid: 'requested grid', refusal: '—' }));
  assert.equal(c3, fixture.surfaces.compare.normal);
  assert.equal(text(modules.NearZeroC3Badge.NearZeroC3Badge(true)), fixture.surfaces.catalog.nearZero);
  assert.equal(text(modules.StatusBadge.StatusBadge('low_departure_c3')), 'low C3');
  assert.equal(text(modules.FeasibilityBadge.FeasibilityBadge(fixture.surfaces.porkchop.feasibility)), 'AMBER');
  assert.equal(text(modules.EvidenceBadge.EvidenceBadge('STRICT')), 'STRICT');
  assert.ok(fixture.states.includes('L0') && fixture.states.includes('L1') && fixture.states.includes('L2'));
  assert.ok(fixture.states.includes('GREEN') && fixture.states.includes('AMBER') && fixture.states.includes('RED'));
});
