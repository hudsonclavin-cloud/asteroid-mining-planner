#!/usr/bin/env node
// N2/N3 inputs - Horizons heliocentric states (lib/apis.mjs query) at every epoch of every N1 trajectory:
//   asteroid: one request per body, all its arrival and departure epochs (both trajectories, both epoch readings);
//   Earth: launch and return epochs of all trajectories, in batches of <= 100 epochs per request.
// Epoch readings: the NHATS calendar date as TDB 0h (primary, N0) and as UTC 0h (TDB = UTC + 69.184 s).
// Writes horizons-states.json (compact). Rerun-safe (saved copies are reused); a checkpoint is written after
// every body.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeJsonAtomic } from '../lib/aster.mjs';
import { fetchHorizonsVectors, horizonsCommand } from '../lib/apis.mjs';
import { epochsOf } from '../lib/legs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(fs.readFileSync(path.join(here, '..', 'n1-sample', 'n1-sample.json'), 'utf8'));
export const READINGS = [['tdb0h', 0], ['utc0h', 69.184 / 86_400]];
const key = (jd) => jd.toFixed(9);
export function trajEpochs(traj) {
  return Object.fromEntries(READINGS.map(([name, off]) => { const e = epochsOf(traj, off); return [name, { L: Number(key(e.L)), A: Number(key(e.A)), D: Number(key(e.D)), R: Number(key(e.R)) }]; }));
}
const outPath = path.join(here, 'horizons-states.json');
const state = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : { schema: 'aster-s20-nhats-horizons-states/1', bodies: {}, earth: {}, earthRequests: [], failures: [] };
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const earthJds = new Set();
  for (const b of sample.bodies) {
    const trajs = ['min_dv_traj', 'min_dur_traj'].map((k) => b.nhats[k]).filter(Boolean);
    const eps = trajs.map(trajEpochs);
    for (const e of eps) for (const r of Object.values(e)) { earthJds.add(key(r.L)); earthJds.add(key(r.R)); }
    if (state.bodies[b.des]?.rows) continue;
    const jds = [...new Set(eps.flatMap((e) => Object.values(e).flatMap((r) => [key(r.A), key(r.D)])))].sort();
    try {
      const r = await fetchHorizonsVectors(horizonsCommand(b.des), jds.map(Number), `n2-horizons-${b.des}`);
      const rows = {};
      for (const jd of jds) { const row = r.parsed.rows.find((x) => Math.abs(x.jd - Number(jd)) < 1e-8); if (!row) throw new Error(`no row at ${jd}`); rows[jd] = { r: row.r, v: row.v }; }
      state.bodies[b.des] = { command: horizonsCommand(b.des), target: r.parsed.target, soln: r.parsed.soln, center: r.parsed.center, frame: r.parsed.frame, file: r.file, sha256: r.sha256, rows };
    } catch (error) {
      if (error.status && (error.status === 429 || error.status >= 500)) throw error; // past the back-off schedule: halt the workstream
      state.failures.push({ des: b.des, error: String(error.message ?? error).slice(0, 600) });
      state.bodies[b.des] = { command: horizonsCommand(b.des), error: String(error.message ?? error).slice(0, 600) };
    }
    writeJsonAtomic(outPath, state, false);
  }
  const need = [...earthJds].filter((j) => !state.earth[j]).sort();
  for (let i = 0; i < need.length; i += 100) {
    const chunk = need.slice(i, i + 100);
    const r = await fetchHorizonsVectors('399', chunk.map(Number), `n2-horizons-earth-${Math.floor(i / 100)}`);
    for (const jd of chunk) { const row = r.parsed.rows.find((x) => Math.abs(x.jd - Number(jd)) < 1e-8); if (!row) throw new Error(`Earth: no row at ${jd}`); state.earth[jd] = { r: row.r, v: row.v }; }
    state.earthRequests.push({ file: r.file, sha256: r.sha256, epochs: chunk.length, target: r.parsed.target, center: r.parsed.center, frame: r.parsed.frame });
    writeJsonAtomic(outPath, state, false);
  }
  console.log(JSON.stringify({ bodies: Object.keys(state.bodies).length, withRows: Object.values(state.bodies).filter((b) => b.rows).length, failures: state.failures, earthEpochs: Object.keys(state.earth).length, earthRequests: state.earthRequests.length }));
}
