// Aster test runner — per-file watchdog + count accounting (RR1F).
//
// WHY THIS SHAPE: a single `node --test <209 files>` invocation lets one
// load-hung file wedge the whole run forever, and a file killed externally
// VANISHES from node's summary arithmetic (v2-ui-overlay: suite reported
// 208 of 209 discovered files — a silent skip is false-green by
// subtraction). So: each file runs in its own child with a hard wall-clock
// deadline; a wedged file is killed (process TREE — node --test spawns its
// own children) and recorded as an explicit LOAD-TIMEOUT failure; and the
// runner asserts its own arithmetic:
//   files_discovered === files_ok + files_failed + files_load_timeout
// A broken identity prints an ACCOUNTING MISMATCH banner and exits nonzero.
//
// Two complementary timeouts (not redundant):
//   --test-timeout=120000  — per-TEST, covers hangs inside a running test
//   ASTER_FILE_TIMEOUT     — per-FILE wall clock (default 180000 ms),
//                            covers module-LOAD hangs where no test ever
//                            starts and --test-timeout cannot fire.

import { readdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();
const searchRoots = ['tests', path.join('src', 'v2')];
const PER_TEST_TIMEOUT_MS = 120_000;
const FILE_TIMEOUT_MS = Number(process.env.ASTER_FILE_TIMEOUT ?? 180_000);

const testFiles = [];
for (const relativeRoot of searchRoots) {
  walk(relativeRoot);
}
testFiles.sort();

if (testFiles.length === 0) {
  console.error('No test files discovered.');
  process.exit(1);
}

console.log(`Discovered ${testFiles.length} test files (per-file watchdog: ${FILE_TIMEOUT_MS} ms):`);
for (const file of testFiles) {
  console.log(file);
}
console.log('');

const startedAt = Date.now();
const okFiles = [];
const failedFiles = [];
const loadTimeoutFiles = [];
let totalTestsPassed = 0;
let totalTestsFailed = 0;

for (const file of testFiles) {
  const result = await runOne(file);
  if (result.timedOut) {
    loadTimeoutFiles.push(file);
    console.error(`\n[LOAD-TIMEOUT] ${file} exceeded ${FILE_TIMEOUT_MS} ms wall clock and was killed.`);
  } else if (result.exitCode === 0) {
    okFiles.push(file);
  } else {
    failedFiles.push(file);
  }
  if (result.counts !== null) {
    totalTestsPassed += result.counts.pass;
    totalTestsFailed += result.counts.fail;
  }
}

const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);

console.log('\n================ FINAL SUMMARY ================');
console.log(`files discovered:    ${testFiles.length}`);
console.log(`files passed:        ${okFiles.length}`);
console.log(`files failed:        ${failedFiles.length}`);
console.log(`files LOAD-TIMEOUT:  ${loadTimeoutFiles.length}`);
console.log(`tests passed:        ${totalTestsPassed}`);
console.log(`tests failed:        ${totalTestsFailed}`);
console.log(`wall clock:          ${durationSeconds}s`);

if (failedFiles.length > 0 || loadTimeoutFiles.length > 0) {
  console.log('\n---------------- FAILURES ----------------');
  for (const file of failedFiles) {
    console.log(`FAILED        ${file}`);
  }
  for (const file of loadTimeoutFiles) {
    console.log(`LOAD-TIMEOUT  ${file}`);
  }
}

const accounted = okFiles.length + failedFiles.length + loadTimeoutFiles.length;
if (accounted !== testFiles.length) {
  console.error('\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error(`!!! ACCOUNTING MISMATCH: discovered ${testFiles.length} but accounted ${accounted}`);
  console.error('!!! (ok + failed + load_timeout must equal discovered — a file vanished)');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  process.exit(1);
}
console.log(`accounting:          ${testFiles.length} == ${okFiles.length} + ${failedFiles.length} + ${loadTimeoutFiles.length} OK`);

process.exit(failedFiles.length > 0 || loadTimeoutFiles.length > 0 ? 1 : 0);

function runOne(file) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ['--test', `--test-timeout=${PER_TEST_TIMEOUT_MS}`, file],
      { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
    );

    let output = '';
    let settled = false;
    let timedOut = false;

    child.stdout.on('data', (chunk) => {
      output += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on('data', (chunk) => {
      output += chunk;
      process.stderr.write(chunk);
    });

    const watchdog = setTimeout(() => {
      timedOut = true;
      killTree(child.pid);
      // If taskkill somehow failed to reap the direct child, force-settle
      // after a grace period so the RUN can never wedge on a kill failure.
      setTimeout(() => finish(1), 10_000);
    }, FILE_TIMEOUT_MS);

    const finish = (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      resolve({ exitCode, timedOut, counts: parseCounts(output) });
    };

    child.on('exit', (code) => finish(code ?? 1));
    child.on('error', (error) => {
      console.error(`Failed to launch node --test for ${file}:`, error);
      finish(1);
    });
  });
}

function killTree(pid) {
  if (process.platform === 'win32') {
    // taskkill /T kills the whole tree — node --test spawns its own child per
    // file, and a naive child.kill() strands it as a zombie (observed: six
    // wedged overlay processes accumulated across runs, one burned 3.3 CPU-h).
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // already gone
    }
  }
}

function parseCounts(output) {
  // node --test spec reporter summary lines: "ℹ tests N / ℹ pass N / ℹ fail N".
  // A load-killed file never prints them — that is exactly the LOAD-TIMEOUT case.
  const pass = output.match(/\bpass (\d+)\b/);
  const fail = output.match(/\bfail (\d+)\b/);
  if (!pass || !fail) {
    return null;
  }
  return { pass: Number(pass[1]), fail: Number(fail[1]) };
}

function walk(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const entryRelativePath = path.join(relativeDir, entry.name);
    if (shouldSkip(entryRelativePath)) {
      continue;
    }
    if (entry.isDirectory()) {
      walk(entryRelativePath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      testFiles.push(entryRelativePath);
    }
  }
}

function shouldSkip(relativePath) {
  return relativePath.split(path.sep).some((segment) => segment === 'node_modules' || segment === 'docs');
}
