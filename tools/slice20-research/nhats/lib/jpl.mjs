// Polite, recording client for JPL APIs (S20_NHATS_CROSSCHECK).
// - one request at a time, at least SPACING_MS apart (the last request time is kept in a file, so separate
//   script runs also respect the spacing);
// - a descriptive User-Agent;
// - every raw response saved the moment it arrives, with URL, UTC retrieval time and sha256, in
//   <store>/raw/ and one line per request in <store>/manifest.ndjson;
// - never refetches: a URL already in the manifest with HTTP 200 is served from the saved copy;
// - HTTP 429 / 5xx: back off 30 s, 120 s, 600 s, then throw (the caller halts that workstream);
// - a request budget (default 1,500) across all runs.
// Store root: env NHATS_STORE (required).
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const store = process.env.NHATS_STORE;
if (!store) throw new Error('set NHATS_STORE to the raw-response store directory');
const rawDir = path.join(store, 'raw');
const manifestPath = path.join(store, 'manifest.ndjson');
const lastPath = path.join(store, 'last-request-ms');
fs.mkdirSync(rawDir, { recursive: true });
export const USER_AGENT = 'Aster-research-crosscheck/1.0 (tools-only research run; polite single-threaded client)';
export const SPACING_MS = 1100;
export const BUDGET = Number(process.env.NHATS_BUDGET ?? 1500);
const BACKOFF_S = [30, 120, 600];

export function readManifest() {
  if (!fs.existsSync(manifestPath)) return [];
  return fs.readFileSync(manifestPath, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET a URL. Returns { status, body (string), sha256, file, fromCache }. */
export async function get(url, { label = 'req' } = {}) {
  const manifest = readManifest();
  const hit = manifest.find((m) => m.url === url && m.status === 200);
  if (hit) {
    const body = fs.readFileSync(path.join(rawDir, hit.file), 'utf8');
    if (sha256(Buffer.from(body, 'utf8')) !== hit.sha256) throw new Error(`saved copy of ${url} does not match its manifest hash`);
    return { status: 200, body, sha256: hit.sha256, file: hit.file, fromCache: true };
  }
  const used = manifest.length;
  if (used >= BUDGET) throw new Error(`request budget ${BUDGET} exhausted`);
  for (let attempt = 0; ; attempt += 1) {
    const last = fs.existsSync(lastPath) ? Number(fs.readFileSync(lastPath, 'utf8')) : 0;
    const wait = last + SPACING_MS - Date.now();
    if (wait > 0) await sleep(wait);
    fs.writeFileSync(lastPath, String(Date.now()));
    const retrievedAtUtc = new Date().toISOString();
    let status;
    let buf;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json, text/plain, */*' } });
      status = res.status;
      buf = Buffer.from(await res.arrayBuffer());
    } catch (error) {
      status = 0;
      buf = Buffer.from(String(error && error.message ? error.message : error), 'utf8');
    }
    const seq = readManifest().length + 1;
    const file = `${String(seq).padStart(5, '0')}-${label.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 60)}.txt`;
    fs.writeFileSync(path.join(rawDir, file), buf);
    const entry = { seq, url, label, retrievedAtUtc, status, bytes: buf.length, sha256: sha256(buf), file, attempt };
    fs.appendFileSync(manifestPath, `${JSON.stringify(entry)}\n`);
    if (status === 200) return { status, body: buf.toString('utf8'), sha256: entry.sha256, file, fromCache: false };
    if ((status === 429 || status >= 500 || status === 0) && attempt < BACKOFF_S.length) {
      console.error(`HTTP ${status} on ${label}; backing off ${BACKOFF_S[attempt]} s`);
      await sleep(BACKOFF_S[attempt] * 1000);
      continue;
    }
    const err = new Error(`HTTP ${status} on ${url} after ${attempt + 1} attempt(s)`);
    err.status = status;
    throw err;
  }
}
