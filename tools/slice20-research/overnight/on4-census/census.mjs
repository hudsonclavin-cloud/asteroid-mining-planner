import fs from 'node:fs';
import path from 'node:path';
import { fork } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const [buildDir, repoRoot, storeDir, mode = 'coarse', workerCountArg = '15'] = process.argv.slice(2);
if (!buildDir || !repoRoot || !storeDir) throw new Error('usage: node census.mjs <build-dir> <repo-root> <store-dir> [coarse|full] [workers]');
const workerPath = path.resolve(import.meta.dirname, 'worker.mjs'); const orderPath = path.join(storeDir, 'order.json'); const resultPath = path.join(storeDir, `${mode}-results.jsonl`); const checkpointPath = path.join(storeDir, `${mode}-checkpoint.json`);
fs.mkdirSync(storeDir, { recursive: true });
if (!fs.existsSync(orderPath)) {
  const { ingestSlice9Fixture } = await import(pathToFileURL(path.join(buildDir, 'boundary/slice9-nea-catalog.js')).href);
  const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8')); const bodies = Object.values(ingestSlice9Fixture(fixture).asteroids); let seed = 20261125; const rand = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; const indices = bodies.map((_, i) => i); for (let i = indices.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; } fs.writeFileSync(orderPath, `${JSON.stringify({ schema: 'aster-s20-overnight-on4-order/1', seed: 20261125, bodies: bodies.map((b) => b.designation), order: indices })}\n`, 'utf8');
}
const orderData = JSON.parse(fs.readFileSync(orderPath, 'utf8')); const wanted = mode === 'full' ? 500 : orderData.order.length; const previous = new Set(); if (fs.existsSync(resultPath)) for (const line of fs.readFileSync(resultPath, 'utf8').split(/\r?\n/)) { if (!line) continue; try { const x = JSON.parse(line); previous.add(x.bodyIndex); } catch {} }
const queue = orderData.order.map((_, i) => i).filter((i) => i < wanted && !previous.has(i)); const total = wanted; const resultsFile = fs.openSync(resultPath, 'a'); const workers = []; const active = new Map(); let completed = previous.size; let settled = false;
function writeCheckpoint() { fs.writeFileSync(checkpointPath, `${JSON.stringify({ mode, total, completed, updatedAtUtc: new Date().toISOString(), remaining: queue.length + active.size }, null, 2)}\n`, 'utf8'); }
function dispatch(worker) { if (!queue.length) return; const bodyIndex = queue.shift(); active.set(worker, bodyIndex); worker.send({ type: 'compute', bodyIndex, mode }); }
await new Promise((resolve, reject) => {
  const n = Math.max(1, Math.min(Number(workerCountArg) || 1, 15));
  for (let i = 0; i < n; i += 1) {
    const worker = fork(workerPath, [buildDir, repoRoot, orderPath], { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] }); workers.push(worker);
    worker.on('message', (message) => { if (message.type === 'ready') { dispatch(worker); return; } const bodyIndex = active.get(worker); active.delete(worker); if (message.type === 'result') { fs.writeSync(resultsFile, `${JSON.stringify(message.result)}\n`); completed += 1; if (completed % 500 === 0 || completed === total) { console.log(`${mode}: ${completed}/${total} bodies`); writeCheckpoint(); } if (completed === total && queue.length === 0 && active.size === 0 && !settled) { settled = true; resolve(); } else dispatch(worker); } else { queue.unshift(bodyIndex); dispatch(worker); } });
    worker.on('exit', (code) => { const bodyIndex = active.get(worker); if (bodyIndex !== undefined) { active.delete(worker); queue.unshift(bodyIndex); } if (!settled && code !== 0 && queue.length === 0 && active.size === 0) { settled = true; reject(new Error(`${mode} worker exited ${code}`)); } });
  }
  if (total === completed) { settled = true; resolve(); }
});
for (const worker of workers) worker.kill(); fs.closeSync(resultsFile); writeCheckpoint(); console.log(JSON.stringify({ mode, total, completed, resultPath, checkpointPath }, null, 2));
