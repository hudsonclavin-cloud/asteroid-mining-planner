import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const installer = join(repoRoot, 'tools', 'setup-hooks.mjs');

test('prepare hook installer is silent and successful outside a git worktree', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aster-setup-hooks-nonrepo-'));
  try {
    const output = execFileSync(process.execPath, [installer], {
      cwd: directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.equal(output, '');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('prepare hook installer configures hooksPath inside a git worktree', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aster-setup-hooks-repo-'));
  try {
    execFileSync('git', ['init', '--quiet'], { cwd: directory, stdio: 'ignore' });
    const output = execFileSync(process.execPath, [installer], {
      cwd: directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    assert.match(output, /core\.hooksPath = \.githooks/);
    assert.equal(
      execFileSync('git', ['config', '--get', 'core.hooksPath'], {
        cwd: directory,
        encoding: 'utf8',
      }).trim(),
      '.githooks',
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
