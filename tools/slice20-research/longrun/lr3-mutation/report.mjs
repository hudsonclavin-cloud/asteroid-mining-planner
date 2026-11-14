#!/usr/bin/env node
// LR3 — fold the mutation results (scratch NDJSON) into lr3-mutation.json, REPORT.md and SURVIVORS.md.
// Safe to run while workers are still going: it reports "PARTIAL: n of m".
//
//   node report.mjs
//
// Reads from <scratch>/lr3: mutants.json, baseline.json, order.json, results-*.ndjson, and, when
// present, pruning-check*.ndjson (a sample of survivors re-run against ALL importing tests).
// Reads survivor-notes.json next to this script when present (hand-written, per-mutant notes).
// Nothing is typed by hand into the generated files except what survivor-notes.json carries.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scratchRoot, sha256File } from '../lib/common.mjs';
import { layerOf, tierOf } from './plan.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(scratchRoot, 'lr3');
const { mutants, fileStats } = JSON.parse(fs.readFileSync(path.join(dir, 'mutants.json'), 'utf8'));
const baseline = JSON.parse(fs.readFileSync(path.join(dir, 'baseline.json'), 'utf8'));
const order = JSON.parse(fs.readFileSync(path.join(dir, 'order.json'), 'utf8'));
const notesPath = path.join(here, 'survivor-notes.json');
const notes = fs.existsSync(notesPath) ? JSON.parse(fs.readFileSync(notesPath, 'utf8')) : {};

const readNdjson = (file) => fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).flatMap((line) => {
  try { return [JSON.parse(line)]; } catch { return []; }
});
const results = new Map();
for (const name of fs.readdirSync(dir).filter((f) => /^results-.*\.ndjson$/.test(f)).sort()) {
  for (const r of readNdjson(path.join(dir, name))) results.set(r.id, r);
}
const pruningCheck = fs.readdirSync(dir).filter((f) => /^pruning-check.*\.ndjson$/.test(f)).sort().flatMap((f) => readNdjson(path.join(dir, f)));

const TIER_NAMES = {
  1: 'honesty layer, exported functions', 2: 'math layer, exported functions', 3: 'plumbing, exported functions',
  4: 'honesty + math, module-private helpers (beyond the dispatch scope)', 5: 'view (porkchop-view.ts), exported functions',
  6: 'plumbing + view, module-private helpers (beyond the dispatch scope)',
};
const LAYER_WEIGHT = { honesty: 30, math: 30, plumbing: 10, view: 0 };
const OPERATOR_WEIGHT = {
  'guard-removal': 9, 'relational-swap': 7, 'sign-flip': 7, 'arithmetic-swap': 6, 'argument-swap': 6,
  'loop-bound-minus-1': 4, 'loop-bound-plus-1': 4, 'loop-start-plus-1': 4, 'constant-nudge': 3,
};
const SUGGESTION = {
  'guard-removal': 'A test that drives this guard\'s condition true and asserts the refusal itself (the returned refusal value or the thrown error), so removing the guard changes the observed result.',
  'relational-swap': 'A boundary test with the two operands exactly equal, asserting which side of the boundary the function lands on.',
  'sign-flip': 'A pinned-value test of this function, with a non-zero operand here, checked against an independently computed value.',
  'arithmetic-swap': 'A pinned-value test of this function with both operands non-trivial (non-zero, not 1, not equal to each other), checked against an independently computed value to a tolerance tighter than the change.',
  'argument-swap': 'A test that calls through this line with asymmetric arguments (the two swapped values clearly different) and asserts a result that depends on their order.',
  'loop-bound-minus-1': 'A test whose input has at least two elements and asserts on the LAST element\'s contribution.',
  'loop-bound-plus-1': 'A test that asserts the exact output length / element count, or that reading one past the end is visible in the result.',
  'loop-start-plus-1': 'A test whose input has at least two elements and asserts on the FIRST element\'s contribution.',
  'constant-nudge': 'A pinned-value test whose tolerance is tighter than 0.1% of the quantity this constant scales (the mutant changes it by 0.1%).',
};

const rows = mutants.map((m) => {
  const r = results.get(m.id);
  const layer = layerOf(m.file);
  return {
    ...m, layer, tier: tierOf(m),
    outcome: r ? r.outcome : 'not-run',
    killedBy: r?.killedBy ?? null, killKind: r?.killKind ?? null,
    testsRun: r?.testsRun ?? [], testsImporting: r?.testsImporting ?? null, testsExecuting: r?.testsExecuting ?? null, ms: r?.ms ?? null,
    risk: LAYER_WEIGHT[layer] + (OPERATOR_WEIGHT[m.operator] ?? 0) + (m.exported ? 2 : 0),
  };
});
const ran = rows.filter((r) => r.outcome !== 'not-run');
const SURVIVING = new Set(['survived', 'not-executed-by-any-test', 'no-test-imports-module']);
const survivors = ran.filter((r) => SURVIVING.has(r.outcome)).sort((a, b) => (b.risk - a.risk) || a.file.localeCompare(b.file) || (a.line - b.line) || (a.column - b.column));
const countBy = (list, key) => {
  const m = new Map();
  for (const x of list) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
  return Object.fromEntries([...m.entries()].sort((a, b) => b[1] - a[1]));
};
const outcomeCounts = countBy(ran, (r) => r.outcome);
const killed = ran.filter((r) => r.outcome === 'killed');
const tierTable = [1, 2, 3, 4, 5, 6].map((t) => {
  const inTier = rows.filter((r) => r.tier === t);
  const done = inTier.filter((r) => r.outcome !== 'not-run');
  return {
    tier: t, name: TIER_NAMES[t], mutants: inTier.length, run: done.length,
    killed: done.filter((r) => r.outcome === 'killed').length,
    killedByCompile: done.filter((r) => r.outcome === 'killed' && r.killKind === 'compile').length,
    timeout: done.filter((r) => r.outcome === 'timeout').length,
    survived: done.filter((r) => r.outcome === 'survived').length,
    notExecuted: done.filter((r) => r.outcome === 'not-executed-by-any-test').length,
    noImporter: done.filter((r) => r.outcome === 'no-test-imports-module').length,
    error: done.filter((r) => r.outcome === 'error').length,
  };
});
const fileTable = fileStats.filter((f) => f.mutants > 0).map((f) => {
  const mine = rows.filter((r) => r.file === f.file);
  const done = mine.filter((r) => r.outcome !== 'not-run');
  const surv = done.filter((r) => SURVIVING.has(r.outcome));
  return {
    file: f.file, layer: layerOf(f.file), mutants: mine.length, run: done.length,
    killed: done.filter((r) => r.outcome === 'killed' || r.outcome === 'timeout').length,
    survived: surv.length, survivedButExecuted: done.filter((r) => r.outcome === 'survived').length,
    survivalRate: done.length ? surv.length / done.length : null,
  };
}).sort((a, b) => b.survived - a.survived);
const top5 = fileTable.filter((f) => f.survived > 0).slice(0, 5);

// functions that no test executes at all
const unexecuted = new Map();
for (const r of ran.filter((x) => x.outcome === 'not-executed-by-any-test' || x.outcome === 'no-test-imports-module')) {
  const key = `${r.file}::${r.function}`;
  if (!unexecuted.has(key)) unexecuted.set(key, { file: r.file, function: r.function, exported: r.exported, layer: r.layer, outcome: r.outcome, mutants: 0, testsImporting: r.testsImporting });
  unexecuted.get(key).mutants += 1;
}
const unexecutedList = [...unexecuted.values()].sort((a, b) => (LAYER_WEIGHT[b.layer] - LAYER_WEIGHT[a.layer]) || (b.mutants - a.mutants));

const state = ran.length === mutants.length ? 'COMPLETE' : `PARTIAL: ${ran.length} of ${mutants.length}`;
const pruning = {
  note: 'A sample of surviving mutants re-run against EVERY test file that imports the module (pruning off). If the function-level pruning is sound, none of them is killed.',
  sampled: pruningCheck.length,
  stillSurvived: pruningCheck.filter((r) => r.outcome === 'survived').length,
  killedWithoutPruning: pruningCheck.filter((r) => r.outcome === 'killed' || r.outcome === 'timeout').map((r) => ({ id: r.id, outcome: r.outcome, killedBy: r.killedBy })),
  testFilesRun: pruningCheck.reduce((a, r) => a + r.testsRun.length, 0),
};

const dataset = {
  schema: 'aster-s20-longrun-lr3-mutation/1',
  label: 'LEADS-grade research evidence. A surviving mutant is a lead, not a verdict: some survivors are equivalent mutants (the change cannot alter any output).',
  environment: 'CLOUD RUN (Linux container), not the laptop the dispatch names; waived by Hudson in-session 2026-11-14',
  generatedAtUtc: new Date().toISOString(),
  state,
  node: baseline.node,
  scope: 'src/v2/core/** and src/v2/porkchop/** production .ts files; every function body (exported functions = dispatch scope, tiers 1-3 and 5; module-private helpers = tiers 4 and 6)',
  operators: Object.keys(OPERATOR_WEIGHT),
  testSelection: 'tests that compile the module into .tmp-tests (empirical import graph) AND executed the mutated top-level function at baseline (NODE_V8_COVERAGE); most specific first; stop at first failure',
  counts: { enumerated: mutants.length, run: ran.length, ...outcomeCounts, killedByCompile: killed.filter((r) => r.killKind === 'compile').length, killedByTest: killed.filter((r) => r.killKind === 'test').length },
  tierTable, fileTable, top5SurvivorFiles: top5, unexecutedFunctions: unexecutedList, pruningCheck: pruning,
  baselineTests: baseline.tests.map((t) => ({ file: t.file, pass: t.pass, ms: t.ms, modules: t.modules.length })),
  baselineFailing: baseline.tests.filter((t) => !t.pass).map((t) => t.file),
  mutants: rows.map((r) => ({
    id: r.id, file: r.file, function: r.function, exported: r.exported, layer: r.layer, tier: r.tier, operator: r.operator,
    line: r.line, column: r.column, originalLine: r.originalLine, mutatedLine: r.mutatedLine,
    outcome: r.outcome, killedBy: r.killedBy, killKind: r.killKind, testsImporting: r.testsImporting, testsExecuting: r.testsExecuting,
    testsRun: r.testsRun, risk: r.risk,
  })),
};
fs.writeFileSync(path.join(here, 'lr3-mutation.json'), `${JSON.stringify(dataset)}\n`);

// ---- markdown ----------------------------------------------------------------------------------
const pct = (a, b) => (b ? `${(100 * a / b).toFixed(1)}%` : 'n/a');
const L = [];
const row = (cols) => L.push(`| ${cols.join(' | ')} |`);
L.push('# LR3 — mutation campaign over core and porkchop');
L.push('');
L.push(`**${dataset.label}**`);
L.push('');
L.push(`State: **${state}**. Run in a throwaway copy of origin/main; node ${baseline.node}; cloud container (see the top-level report).`);
L.push('');
L.push('## Counts');
row(['Measure', 'Count']);
row(['---', '---:']);
row(['Mutants enumerated', mutants.length]);
row(['Mutants run', ran.length]);
row(['Killed (a test failed)', killed.length]);
row(['... killed by a failing assertion / runtime error', dataset.counts.killedByTest]);
row(['... killed by the TypeScript compile step inside a test', dataset.counts.killedByCompile]);
row(['Timeout (counted with killed)', outcomeCounts.timeout ?? 0]);
row(['**SURVIVED** although at least one test executes the function', outcomeCounts.survived ?? 0]);
row(['**SURVIVED** because no test executes the function at all', outcomeCounts['not-executed-by-any-test'] ?? 0]);
row(['**SURVIVED** because no test imports the module', outcomeCounts['no-test-imports-module'] ?? 0]);
row(['Error (source text did not match; not counted either way)', outcomeCounts.error ?? 0]);
L.push('');
L.push('## By tier (run order)');
row(['Tier', 'What', 'Mutants', 'Run', 'Killed', '(by compile)', 'Timeout', 'Survived (executed)', 'Survived (function never executed)', 'Survived (module never imported)', 'Survival rate of run']);
row(['---:', '---', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
for (const t of tierTable) row([t.tier, t.name, t.mutants, t.run, t.killed, t.killedByCompile, t.timeout, t.survived, t.notExecuted, t.noImporter, pct(t.survived + t.notExecuted + t.noImporter, t.run)]);
L.push('');
L.push('Inside a tier the run order is a seeded shuffle, so a partly run tier is an unbiased sample of that tier.');
L.push('');
L.push('## By file (most survivors first)');
row(['File', 'Layer', 'Mutants', 'Run', 'Killed', 'Survived', '... of which the function is executed by a test', 'Survival rate of run']);
row(['---', '---', '---:', '---:', '---:', '---:', '---:', '---:']);
for (const f of fileTable) row([`\`${f.file.replace('src/v2/', '')}\``, f.layer, f.mutants, f.run, f.killed, f.survived, f.survivedButExecuted, f.survivalRate === null ? 'n/a' : pct(f.survived, f.run)]);
L.push('');
L.push('## Functions no test executes');
L.push('Every mutant inside these survives by construction: no discovered test file calls the function. This is measured (V8 function coverage at baseline), not inferred.');
L.push('');
row(['File', 'Function', 'Exported', 'Layer', 'Mutants', 'Test files importing the module']);
row(['---', '---', '---', '---', '---:', '---:']);
for (const u of unexecutedList) row([`\`${u.file.replace('src/v2/', '')}\``, `\`${u.function}\``, u.exported ? 'yes' : 'no', u.layer, u.mutants, u.testsImporting ?? 0]);
L.push('');
L.push('## How tests were chosen, and the check on that choice');
L.push('- Import graph, measured: each of the discovered test files was run once unmutated and the modules it compiled into `.tmp-tests/` were recorded.');
L.push('- Function level, measured: the same run recorded, through `NODE_V8_COVERAGE`, which top-level functions each test executed. A mutant is run against the tests that import its module and executed its function. A test that never calls the function runs identical instructions with or without the mutant.');
L.push(`- Check: ${pruning.sampled} surviving mutants were re-run against every importing test with the pruning off (${pruning.testFilesRun} test-file runs). Still surviving: ${pruning.stillSurvived}. Killed only without pruning: ${pruning.killedWithoutPruning.length}${pruning.killedWithoutPruning.length ? ` (${pruning.killedWithoutPruning.map((k) => `\`${k.id}\` by ${k.killedBy}`).join('; ')})` : ''}.`);
L.push(`- Test files failing unmutated in the copy (excluded, cannot kill anything): ${dataset.baselineFailing.length ? dataset.baselineFailing.join(', ') : 'none'}.`);
L.push('- "Killed by compile" means the test\'s own tsc step rejected the mutant. That is a kill by the type system, not by an assertion.');
L.push('');
const block = (r, n) => {
  const out = [];
  out.push(`### ${n}. \`${r.file.replace('src/v2/', '')}:${r.line}\` — \`${r.function}\` — ${r.operator}${r.exported ? '' : ' (module-private helper)'}`);
  out.push('```diff');
  if (r.operator === 'guard-removal') {
    // the whole `if` statement is removed; show it on one line (first 200 characters)
    out.push(`- ${r.original.replace(/\s+/g, ' ')}${r.original.length >= 200 ? ' ...' : ''}`);
    out.push('+ ;');
  } else {
    out.push(`- ${r.originalLine}`);
    out.push(`+ ${r.mutatedLine}`);
  }
  out.push('```');
  if (r.outcome === 'survived') {
    out.push(`Layer ${r.layer}. ${r.testsRun.length} test file(s) executed this function and still passed (${r.testsImporting} import the module): ${r.testsRun.map((t) => `\`${t.replace(/^tests\//, '')}\``).join(', ')}.`);
  } else if (r.outcome === 'not-executed-by-any-test') {
    out.push(`Layer ${r.layer}. No test executes \`${r.function}\` (${r.testsImporting} test file(s) import the module; none calls it).`);
  } else {
    out.push(`Layer ${r.layer}. No discovered test file imports this module.`);
  }
  const note = notes[r.id] ?? notes[`fn:${r.file}::${r.function}`] ?? notes[`file:${r.file}`];
  out.push(`Suggested test: ${note?.suggestion ?? SUGGESTION[r.operator]}`);
  if (note?.assessment) out.push(`Assessment: ${note.assessment}`);
  out.push('');
  return out;
};
const executedSurvivors = survivors.filter((r) => r.outcome === 'survived');
const headline = executedSurvivors.filter((r) => r.layer === 'honesty' || r.layer === 'math');
L.push('## Survivors ranked by risk');
L.push(`${survivors.length} survivors in total: ${executedSurvivors.length} in functions that tests do execute, ${survivors.length - executedSurvivors.length} in functions no test executes (tabled above).`);
L.push('Ranking: honesty and math layers first, then by operator (guard removal, then comparison and sign changes, then arithmetic and argument swaps, then loop bounds, then 0.1% constant nudges), exported functions before helpers.');
L.push(`The ${Math.min(40, headline.length)} highest-ranked executed survivors in the honesty and math layers follow. **Every survivor, with its diff and the tests that ran, is in \`SURVIVORS.md\`** and in \`lr3-mutation.json\`.`);
L.push('');
headline.slice(0, 40).forEach((r, i) => L.push(...block(r, i + 1)));
L.push('## Files');
L.push('- `mutate.mjs` (enumerate / baseline / run), `plan.mjs` (priority order), `report.mjs` (this report).');
L.push('- `lr3-mutation.json` — every mutant with its outcome, the tier and file tables, the baseline test list.');
L.push('- `SURVIVORS.md` — every survivor, ranked.');
L.push('- `survivor-notes.json` — hand-written notes merged into the survivor blocks (when present).');
L.push('');
fs.writeFileSync(path.join(here, 'REPORT.md'), `${L.join('\n')}\n`);

const S = [];
S.push('# LR3 — every surviving mutant, ranked by risk');
S.push('');
S.push(`**${dataset.label}**`);
S.push('');
S.push(`State: ${state}. ${survivors.length} survivors. "Suggested test" is a suggestion only; no test was written.`);
S.push('');
survivors.forEach((r, i) => S.push(...block(r, i + 1)));
fs.writeFileSync(path.join(here, 'SURVIVORS.md'), `${S.join('\n')}\n`);

console.log(JSON.stringify({
  state, counts: dataset.counts, top5: top5.map((f) => [f.file, f.survived]),
  tiers: tierTable.map((t) => [t.tier, t.run, t.mutants, t.killed + t.timeout, t.survived, t.notExecuted + t.noImporter]),
  files: ['lr3-mutation.json', 'REPORT.md', 'SURVIVORS.md'].map((n) => [n, fs.statSync(path.join(here, n)).size]),
  sha: sha256File(path.join(here, 'lr3-mutation.json')).slice(0, 12),
}, null, 2));
