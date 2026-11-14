#!/usr/bin/env node
// LR3 — priority order for the mutation run, so a time-boxed (partial) campaign covers the riskiest
// code first and every finished-or-partial tier is an unbiased sample of that tier.
//
//   node plan.mjs <mutants.json> <order.json>
//
// Layers (by file):
//   honesty  - refusal / disclosure / support / invariant code: what stops Aster from overclaiming
//   math     - Lambert, propagation, interpolation, frames, units, grid kernel, dV, segmentation
//   plumbing - worker, client, URL, colormap
//   view     - porkchop-view.ts (canvas rendering)
// Tiers, run in this order; inside a tier the order is a seeded shuffle:
//   1 honesty, exported functions      2 math, exported functions      3 plumbing, exported functions
//   4 honesty + math, module-private helpers (beyond the dispatch's "exported function" scope: the
//     exported functions call them, and most of the solver arithmetic lives there)
//   5 view, exported functions         6 plumbing + view, module-private helpers
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { RUN_SEED, seededShuffle } from '../lib/common.mjs';

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const [mutantsPath, orderPath] = isMain ? process.argv.slice(2) : [];

const HONESTY = [
  /^src\/v2\/porkchop\/(support-boundary|tier-disclosure|propagation-guard|near-zero-c3|format-c3)\.ts$/,
  /^src\/v2\/core\/constants\/near-zero-c3\.ts$/,
  /^src\/v2\/core\/invariants\//,
];
const PLUMBING = [/^src\/v2\/porkchop\/(porkchop\.worker|porkchop-client|compare-url|colormap|grid-span)\.ts$/];
const VIEW = [/^src\/v2\/porkchop\/porkchop-view\.ts$/];
export function layerOf(file) {
  if (HONESTY.some((re) => re.test(file))) return 'honesty';
  if (VIEW.some((re) => re.test(file))) return 'view';
  if (PLUMBING.some((re) => re.test(file))) return 'plumbing';
  return 'math';
}
export function tierOf(m) {
  const layer = layerOf(m.file);
  if (m.exported) return { honesty: 1, math: 2, plumbing: 3, view: 5 }[layer];
  return layer === 'honesty' || layer === 'math' ? 4 : 6;
}

if (isMain && mutantsPath && orderPath) {
  const { mutants } = JSON.parse(fs.readFileSync(mutantsPath, 'utf8'));
  const tiers = new Map();
  for (const m of mutants) {
    const t = tierOf(m);
    if (!tiers.has(t)) tiers.set(t, []);
    tiers.get(t).push(m.id);
  }
  const order = [];
  const summary = [];
  for (const t of [...tiers.keys()].sort((a, b) => a - b)) {
    const ids = seededShuffle(tiers.get(t).sort(), RUN_SEED + t);
    summary.push({ tier: t, mutants: ids.length, firstPosition: order.length });
    order.push(...ids);
  }
  fs.writeFileSync(orderPath, `${JSON.stringify(order)}\n`);
  console.log(JSON.stringify({ total: order.length, tiers: summary }, null, 2));
}
