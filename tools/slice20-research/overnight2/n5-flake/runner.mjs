import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const [outputPath, repetition = '1'] = process.argv.slice(2);
if (!outputPath) throw new Error('usage: node runner.mjs <output-json> [repetition]');
const repoRoot = process.cwd();
const searchRoots = ['tests', path.join('src', 'v2')];
const perTestTimeoutMs = 120000;
const fileTimeoutMs = 180000;
const concurrency = 6;
const testFiles = [];
for (const root of searchRoots) walk(root);
testFiles.sort();

function walk(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relative = path.join(relativeDir, entry.name);
    if (relative.split(path.sep).some((segment) => segment === 'node_modules' || segment === 'docs')) continue;
    if (entry.isDirectory()) walk(relative);
    else if (entry.isFile() && entry.name.endsWith('.test.mjs')) testFiles.push(relative);
  }
}

function parseSummary(output) {
  const summary = {};
  const summaryLines = {};
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^\s*(\S)\s+(tests|pass|fail|skipped|todo)\s+(\d+)\s*$/u);
    if (!match) continue;
    summary[match[2]] = Number(match[3]);
    summaryLines[match[2]] = line;
  }
  return { summary, summaryLines, firstPassMatch: output.match(/\bpass (\d+)\b/)?.[0] ?? null, firstPassCount: Number(output.match(/\bpass (\d+)\b/)?.[1] ?? NaN) };
}

function killTree(pid) {
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
  else { try { process.kill(-pid, 'SIGKILL'); } catch {} }
}

function runOne(file) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(process.execPath, ['--test', `--test-timeout=${perTestTimeoutMs}`, file], { cwd: repoRoot, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let settled = false;
    let timedOut = false;
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    const finish = (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(watchdog);
      const parsed = parseSummary(output);
      resolve({ file, repetition: Number(repetition), status: timedOut ? 'load-timeout' : exitCode === 0 ? 'pass' : 'fail', exitCode, timedOut, wallMs: Date.now() - startedAt, summary: { pass: parsed.summary.pass ?? null, fail: parsed.summary.fail ?? null, skipped: parsed.summary.skipped ?? null, todo: parsed.summary.todo ?? null }, summaryLines: parsed.summaryLines, firstPassMatch: parsed.firstPassMatch, firstPassCount: Number.isFinite(parsed.firstPassCount) ? parsed.firstPassCount : null });
    };
    const watchdog = setTimeout(() => { timedOut = true; killTree(child.pid); setTimeout(() => finish(1), 10000); }, fileTimeoutMs);
    child.on('exit', (code) => finish(code ?? 1));
    child.on('error', () => finish(1));
  });
}

const records = new Array(testFiles.length);
let next = 0;
async function worker() {
  while (true) {
    const index = next;
    next += 1;
    if (index >= testFiles.length) return;
    records[index] = await runOne(testFiles[index]);
  }
}
await Promise.all(Array.from({ length: Math.min(concurrency, testFiles.length) }, () => worker()));
const totals = { files: testFiles.length, passFiles: records.filter((record) => record.status === 'pass').length, failFiles: records.filter((record) => record.status === 'fail').length, loadTimeoutFiles: records.filter((record) => record.status === 'load-timeout').length, tests: { pass: 0, fail: 0, skipped: 0, todo: 0 } };
for (const record of records) for (const key of Object.keys(totals.tests)) if (typeof record.summary[key] === 'number') totals.tests[key] += record.summary[key];
const output = { schema: 'aster-s20-overnight2-n5-repetition/1', generatedAtUtc: new Date().toISOString(), repetition: Number(repetition), node: process.version, searchRoots, flags: ['--test', `--test-timeout=${perTestTimeoutMs}`], perFileTimeoutMs: fileTimeoutMs, concurrency, testFiles, records, totals };
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ repetition: output.repetition, totals: output.totals }, null, 2));
if (totals.failFiles || totals.loadTimeoutFiles) process.exitCode = 1;
