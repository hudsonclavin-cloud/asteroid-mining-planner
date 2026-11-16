#!/usr/bin/env node
// Copy every saved raw JPL response from the scratch store into this folder, gzipped (raw/<file>.gz), and the
// request manifest (manifest.ndjson; its sha256 and bytes are of the UNCOMPRESSED response). Idempotent; each
// gz is checked against the manifest hash after writing. Refuses any file over 10 MB (shard instead).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '..');
const store = process.env.NHATS_STORE;
if (!store) throw new Error('set NHATS_STORE');
const manifest = fs.readFileSync(path.join(store, 'manifest.ndjson'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
fs.mkdirSync(path.join(out, 'raw'), { recursive: true });
let written = 0;
for (const m of manifest) {
  const dst = path.join(out, 'raw', `${m.file}.gz`);
  const src = fs.readFileSync(path.join(store, 'raw', m.file));
  if (createHash('sha256').update(src).digest('hex') !== m.sha256) throw new Error(`store copy of ${m.file} does not match the manifest`);
  if (!fs.existsSync(dst)) {
    const gz = zlib.gzipSync(src, { level: 9 });
    if (gz.length > 10_000_000) throw new Error(`${m.file} gz is ${gz.length} B > 10 MB: shard it`);
    fs.writeFileSync(dst, gz);
    written += 1;
  }
  const back = zlib.gunzipSync(fs.readFileSync(dst));
  if (createHash('sha256').update(back).digest('hex') !== m.sha256) throw new Error(`${dst} does not round-trip to the manifest hash`);
}
fs.writeFileSync(path.join(out, 'manifest.ndjson'), `${manifest.map((m) => JSON.stringify(m)).join('\n')}\n`);
console.log(JSON.stringify({ requests: manifest.length, newGz: written, status: Object.fromEntries([...new Set(manifest.map((m) => m.status))].map((s) => [s, manifest.filter((m) => m.status === s).length])) }));
