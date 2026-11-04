import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-shortcut-and-method');

function textOf(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(textOf).join('');
  return textOf(value.props?.children);
}

async function loadMethodBadge() {
  const comparePath = path.join(repoRoot, 'src', 'v2', 'app', 'compare', 'main.ts');
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', comparePath,
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const emittedPath = path.join(outDir, 'app', 'compare', 'main.js');
  const emitted = fs.readFileSync(emittedPath, 'utf8');
  const mountStart = emitted.lastIndexOf("const mount = document.getElementById('app');");
  assert.notEqual(mountStart, -1, 'compare module mount should be present in emitted source');
  fs.writeFileSync(emittedPath, `${emitted.slice(0, mountStart)}\nexport { MethodBadge };\n`);
  const compare = await import(`${pathToFileURL(emittedPath).href}?method=${Date.now()}`);
  return compare.MethodBadge;
}

test('the shortcut overlay names middle-drag pan and compare renders its M=0 method', async () => {
  // architecture guard: the shortcut copy is assembled inside the imperative
  // WebGL mount and includes dynamic focus/time rows; importing that mount in
  // Node would require the renderer and browser event lifecycle.
  const runtime = fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'app', 'solar-system', 'runtime.ts'), 'utf8');
  assert.match(runtime, /\['right-drag \/ middle-drag \/ Shift\+drag', 'pan the view'\]/);
  assert.match(runtime, /panDragActive = event\.button === 2 \|\| event\.button === 1/);

  const MethodBadge = await loadMethodBadge();
  const text = textOf(MethodBadge({
    echo: null,
    ephemerisSpan: { firstJd: 2_461_041.5, lastJd: 2_466_519.5 },
    vehicleName: 'vehicle',
    totalComputeMs: 1,
    thresholdMode: 'absolute',
  }));
  assert.match(text, /Method — single-revolution \(M=0\) Lambert patched-conic screen/);
});
