import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runTsc } from './helpers/run-tsc.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, '.tmp-tests', 'v2-about-evidence');
const slice13 = fs.readFileSync(path.join(repoRoot, 'src', 'v2', 'SLICE_13_FOUNDING.md'), 'utf8');
const invariants = fs.readFileSync(path.join(repoRoot, 'INVARIANTS.md'), 'utf8');

test('About evidence links use rendered audit-copy VNodes and real heading fragments', async () => {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const result = runTsc([
    '--pretty', 'false', '--outDir', outDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
    '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext',
    '--isolatedModules', 'true', path.join(repoRoot, 'src', 'v2', 'app', 'about', 'audit-copy.ts'),
  ], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const aboutCopy = await import(pathToFileURL(path.join(outDir, 'app', 'about', 'audit-copy.js')).href);
  const artifacts = aboutCopy.renderAboutAuditItems((_title, _body, artifact) => artifact);
  assert.ok(artifacts.some((artifact) => artifact.anchor === '8-engineering-record-running-log'));
  assert.match(slice13, /^## §8\. Engineering record \(running log\)$/m);
  const invariantIds = [...invariants.matchAll(/^\| (INV-[^ |]+)/gm)].map((match) => match[1]);
  assert.ok(invariantIds.length > 0);
});
