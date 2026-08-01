// Publish gate — L6-3 remediation (S16-REMEDIATE-2026-08-01-A).
//
// npm 0.1.0 was published from a DIRTY worktree: its baked-provenance.json
// records dirty:true, and nothing in the pipeline objected. That version is
// immutable on npm; this gate exists so it cannot happen again. It runs from
// `prepublishOnly`, BEFORE the build that bakes provenance, and fails the
// publish outright when the worktree is not clean.
//
// Escape hatch: none, deliberately. A provenance-bearing evidence package
// published from unrecorded state is the exact defect; an override flag would
// merely relocate it. If a dirty publish is ever truly required, that is a
// Hudson decision made by editing this file in a commit — which makes the
// worktree state part of the record again.
//
// NOTE (audit L6-3, second half): mcp/src/resources/repo.ts still omits the
// baked `dirty` flag from emitted SourceRefs. That file is protected surface
// and is NOT changed by this remediation; the fix ships with the next release
// under its own dispatch. Until then this gate makes the flag's value
// invariantly `false` for every future publish, which is the stronger fix.

import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');

const status = execFileSync('git', ['status', '--porcelain'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();

if (status.length > 0) {
  console.error('PUBLISH BLOCKED: the worktree is dirty. A published evidence package must be');
  console.error('reproducible from a commit; npm 0.1.0 was baked dirty and that is not repeatable.');
  console.error('Commit or stash everything (including untracked files), then publish.\n');
  console.error(status.split('\n').slice(0, 20).map((l) => `  ${l}`).join('\n'));
  if (status.split('\n').length > 20) console.error(`  ... and ${status.split('\n').length - 20} more`);
  process.exit(1);
}

console.log('publish gate: worktree clean — proceeding');
