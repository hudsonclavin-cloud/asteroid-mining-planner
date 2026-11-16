#!/usr/bin/env node
// N1 SAMPLE - 100 bodies in both NHATS (summary mode S, default constraints: dv 12, dur 450, stay 8, launch
// 2020-2045) and Aster's catalog, stratified by fidelity tier with one recorded seed; then each body's NHATS
// detail record (mode O, default constraints) with its min_dv_traj and min_dur_traj.
//   NHATS_STORE=<store> node tools/slice20-research/nhats/n1-sample/sample.mjs
// Rerun-safe: every request is served from the saved copy when present.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readStamp, loadCatalogBodies, loadTiers, seededShuffle, writeJsonAtomic, SEED } from '../lib/aster.mjs';
import { get } from '../lib/jpl.mjs';
import { NHATS_SUMMARY_URL, fetchNhatsObject } from '../lib/apis.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
readStamp();
const N = 100;
const FORCED = ['99942', '2000 SG344', '101955', '2008 HU4', '1998 KY26'];
const summaryResp = await get(NHATS_SUMMARY_URL, { label: 'n1-nhats-summary' });
const summary = JSON.parse(summaryResp.body);
if (summary.signature?.version !== '1.3') throw new Error(`NHATS API version ${summary.signature?.version}, documented 1.3`);
const nhatsDes = new Map(summary.data.map((r) => [r.des, r]));
const catalog = new Map((await loadCatalogBodies()).map((b) => [b.designation, b]));
const tiers = loadTiers();
const both = [...nhatsDes.keys()].filter((d) => catalog.has(d)).sort();
const tierOf = (d) => tiers.get(d)?.tier ?? 'none';
const byTier = { L0: [], L1: [], L2: [], none: [] };
for (const d of both) byTier[tierOf(d)].push(d);
const lacking = FORCED.filter((d) => !nhatsDes.has(d));
const forced = FORCED.filter((d) => nhatsDes.has(d) && catalog.has(d));
const nL0 = byTier.L0.length;
const rest = N - nL0;
const pop12 = byTier.L1.length + byTier.L2.length;
const quotaL1 = Math.round((rest * byTier.L1.length) / pop12);
const quota = { L0: nL0, L1: quotaL1, L2: rest - quotaL1 };
const picks = [];
for (const t of ['L0', 'L1', 'L2']) {
  const forcedHere = forced.filter((d) => tierOf(d) === t);
  const pool = seededShuffle(byTier[t].filter((d) => !forcedHere.includes(d)), SEED + { L0: 0, L1: 1, L2: 2 }[t]);
  const take = t === 'L0' ? byTier.L0 : [...forcedHere, ...pool.slice(0, Math.max(0, quota[t] - forcedHere.length))];
  for (const d of take) picks.push({ des: d, tier: t, forced: forcedHere.includes(d) });
}
// Detail records.
const bodies = [];
for (const p of picks) {
  const r = await fetchNhatsObject(p.des);
  const j = r.json;
  const tr = tiers.get(p.des);
  bodies.push({
    ...p, orbitClass: catalog.get(p.des).orbitClass ?? tr?.orbitClass ?? null,
    supportDateJdTdb: tr?.encounter?.jd ?? null, supportDateLabel: tr?.encounter?.cd ?? null,
    asterElementsEpochJdTdb: 2451545 + catalog.get(p.des).elements.epochTdbSeconds / 86400,
    nhats: { fullname: j.fullname, orbit_id: j.orbit_id, computed: j.computed, h: j.h, occ: j.occ, n_via_traj: j.n_via_traj, min_dv: j.min_dv, min_dur: j.min_dur, min_dv_traj: j.min_dv_traj ?? null, min_dur_traj: j.min_dur_traj ?? null },
    request: { file: r.file, sha256: r.sha256 },
  });
}
const result = {
  schema: 'aster-s20-nhats-n1-sample/1', generatedAtUtc: new Date().toISOString(), seed: SEED,
  method: 'NHATS mode S at default constraints; intersect with tests/fixtures/v2/nea-catalog-slice9.json designations; tier from docs/tier-sizing-per-body.json; all L0 in the intersection, then L1 and L2 in proportion to their intersection counts (forced bodies count toward their tier quota); within a tier a mulberry32 shuffle of the sorted designations seeded SEED + {L0:0, L1:1, L2:2}.',
  summaryRequest: { url: NHATS_SUMMARY_URL, file: summaryResp.file, sha256: summaryResp.sha256, apiVersion: summary.signature.version, count: Number(summary.count) },
  population: { nhats: nhatsDes.size, aster: catalog.size, both: both.length, nhatsNotInAster: [...nhatsDes.keys()].filter((d) => !catalog.has(d)).length, bothByTier: Object.fromEntries(Object.entries(byTier).map(([k, v]) => [k, v.length])) },
  quota, forcedRequested: FORCED, forcedIncluded: forced, requestedBodiesNhatsLacks: lacking,
  nhatsNotInAsterExamples: [...nhatsDes.keys()].filter((d) => !catalog.has(d)).slice(0, 20),
  trajectories: { min_dv: bodies.filter((b) => b.nhats.min_dv_traj).length, min_dur: bodies.filter((b) => b.nhats.min_dur_traj).length },
  bodies,
};
writeJsonAtomic(path.join(here, 'n1-sample.json'), result);
console.log(JSON.stringify({ ...result, bodies: bodies.map((b) => `${b.des}:${b.tier}`).join(' '), nhatsNotInAsterExamples: undefined }, null, 1));
