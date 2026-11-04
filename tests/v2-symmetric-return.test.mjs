import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactPath = path.join(repoRoot, 'src', 'v2', 'data', 'symmetric-return-error.json');
const scriptPath = path.join(repoRoot, 'tools', 'slice20-research', 'derive-symmetric-error.mjs');

test('symmetric-return disclosure is derived from the committed six-row artifact', () => {
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const output = execFileSync(process.execPath, [scriptPath, artifactPath], { encoding: 'utf8' }).trim();
  assert.deepEqual(JSON.parse(output), artifact.derived);
  assert.equal(artifact.rows.length, 6);

  const appRoot = path.join(repoRoot, 'src', 'v2', 'app');
  const appSource = fs
    .readdirSync(appRoot, { recursive: true })
    .filter((entry) => entry.endsWith('.ts'))
    .map((entry) => fs.readFileSync(path.join(appRoot, entry), 'utf8'))
    .join('\n');
  assert.doesNotMatch(appSource, /(?:0\.08-5\.1|(?:0\.08|5\.1)\s+km\/s)/);
});
