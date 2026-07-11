// Shared tsc runner for test files — kills the Windows .bin/tsc shim class.
//
// WHY: node_modules/.bin/tsc is a shell shim; under spawnSync on Windows it
// returns status:null, so every "compile TS then import JS" test died with
// "tsc failed, null !== 0" (INVARIANTS.md §5; S15 pre-publish audit Section E;
// RR1C probe proved this exact rewire flips householder.test to PASS).
//
// Contract: mirrors the spawnSync call sites it replaces — callers pass the
// tsc ARGS array (and optionally spawnSync options) and read .status/.stdout/
// .stderr off the returned object, exactly as before. Only the spawn source
// changes: process.execPath + node_modules/typescript/bin/tsc (the real JS
// entry), never the shim.
//
// ESM gotcha (RR1C): if you build a module URL from a Windows path for
// dynamic import()/--import, wrap it in pathToFileURL() — a raw path throws
// ERR_UNSUPPORTED_ESM_URL_SCHEME. This helper spawns (no URL), but callers
// importing their compiled output should keep using pathToFileURL, as the
// existing tests already do.

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// tests/helpers/ -> repo root, independent of the caller's directory depth.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tscScript = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

export function runTsc(args, options = {}) {
  return spawnSync(process.execPath, [tscScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options
  });
}
