#!/usr/bin/env node
// LR3 — pick the sample for the pruning check: a seeded draw of surviving mutants (honesty and math
// layers, functions that tests DO execute) to be re-run with `mutate.mjs run --all-importers`.
//   node pruning-sample.mjs <lr3-mutation.json> <sample-size> <out order.json>
import fs from 'node:fs';
import { RUN_SEED, seededShuffle } from '../lib/common.mjs';

const [datasetPath, sizeArg, outPath] = process.argv.slice(2);
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
const pool = dataset.mutants
  .filter((m) => m.outcome === 'survived' && (m.layer === 'honesty' || m.layer === 'math'))
  .map((m) => m.id)
  .sort();
const sample = seededShuffle(pool, RUN_SEED + 303).slice(0, Number(sizeArg));
fs.writeFileSync(outPath, `${JSON.stringify(sample)}\n`);
console.log(JSON.stringify({ pool: pool.length, sampled: sample.length, sample }));
