#!/usr/bin/env node
// N2b - Horizons Earth states for the trajectories N2 could not compare, in batches of <= 12 epochs.
// Authorised by Hudson on 2026-11-16, after N2's single 100-epoch Earth request returned HTTP 502 four times
// through the full 30/120/600 s back-off and was halted under the dispatch rule. Twelve epochs is the largest
// Earth TLIST shown to work in this run (N0). Same query as lib/apis.mjs, same polite recording client (one
// request at a time, >= 1.1 s apart, every response saved with URL, UTC time and sha256, back-off on 429/5xx).
// Scope: every trajectory with a launch or return epoch outside the Earth fixture span (the 123 that N2
// skipped); both epoch readings (TDB 0h and UTC 0h). Merges into horizons-states.json, checkpointing after each
// batch. On 429/5xx past the back-off schedule it stops and keeps what it has.
//   NHATS_STORE=<store> node tools/slice20-research/nhats/n2-agreement/fetch-earth-12.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonAtomic } from '../lib/aster.mjs';
import { fetchHorizonsVectors } from '../lib/apis.mjs';
import { trajEpochs } from './fetch-states.mjs';

const BATCH = 12;
const here = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(fs.readFileSync(path.join(here, '..', 'n1-sample', 'n1-sample.json'), 'utf8'));
const statePath = path.join(here, 'horizons-states.json');
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const FIX0 = 2461041.5; const FIX1 = 2466519.5;
const key = (jd) => jd.toFixed(9);
const trajs = [];
for (const b of sample.bodies) for (const kind of ['min_dv_traj', 'min_dur_traj']) {
  const t = b.nhats[kind]; if (!t) continue;
  const e = trajEpochs(t);
  const outside = Object.values(e).some((r) => r.L < FIX0 || r.L > FIX1 || r.R < FIX0 || r.R > FIX1);
  if (outside) trajs.push({ des: b.des, kind, e });
}
const need = [...new Set(trajs.flatMap((x) => Object.values(x.e).flatMap((r) => [key(r.L), key(r.R)])))].filter((j) => !state.earth[j]).sort();
state.n2b = state.n2b ?? { authorisedBy: 'Hudson, 2026-11-16 (chat): "Fetch the remaining 123 Earth states in 12-epoch batches"', batchSize: BATCH, trajectoriesInScope: trajs.length, epochsInScope: null, requests: [], halted: null };
state.n2b.epochsInScope = [...new Set(trajs.flatMap((x) => Object.values(x.e).flatMap((r) => [key(r.L), key(r.R)])))].length;
console.log(JSON.stringify({ trajectoriesInScope: trajs.length, epochsInScope: state.n2b.epochsInScope, stillNeeded: need.length, batches: Math.ceil(need.length / BATCH) }));
for (let i = 0; i < need.length; i += BATCH) {
  const chunk = need.slice(i, i + BATCH);
  let r;
  try {
    r = await fetchHorizonsVectors('399', chunk.map(Number), `n2b-horizons-earth-12-${String(state.n2b.requests.length).padStart(2, '0')}`);
  } catch (error) {
    state.n2b.halted = { atBatchStartingWith: chunk[0], error: String(error.message ?? error).slice(0, 400), status: error.status ?? null };
    writeJsonAtomic(statePath, state, false);
    console.error('HALTED', JSON.stringify(state.n2b.halted));
    process.exit(2);
  }
  for (const jd of chunk) {
    const row = r.parsed.rows.find((x) => Math.abs(x.jd - Number(jd)) < 1e-8);
    if (!row) throw new Error(`Earth: no row at ${jd} in ${r.file}`);
    state.earth[jd] = { r: row.r, v: row.v };
  }
  const entry = { file: r.file, sha256: r.sha256, epochs: chunk.length, target: r.parsed.target, center: r.parsed.center, frame: r.parsed.frame, fromCache: r.fromCache };
  state.earthRequests.push(entry); state.n2b.requests.push(entry);
  writeJsonAtomic(statePath, state, false);
  console.log(`batch ${state.n2b.requests.length}: ${chunk.length} epochs, ${r.file}${r.fromCache ? ' (cache)' : ''}`);
}
console.log(JSON.stringify({ done: true, earthEpochs: Object.keys(state.earth).length, n2bRequests: state.n2b.requests.length }));
