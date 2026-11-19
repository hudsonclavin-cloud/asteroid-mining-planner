// S20_CHAIN Stage 3: rewrite the stale parts of STATUS.md from git and file reads (Nova, 2026-11-18).
// Run from the root of the s20-a-cache worktree:
//   node <payload>/write-status.mjs --verify-files <n> --verify-tests <n> --mcp-tests <n>
// Every value except the three counts comes from git or from files in this tree. Every anchor must occur exactly
// once. Exit codes: 0 written; 2 bad arguments; 3 a precondition about git state failed; 4 an anchor is missing or
// repeated; 5 a file read failed its check. On any non-zero exit STATUS.md is NOT written.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const fail = (code, message) => { console.error(`write-status: ${message}`); process.exit(code); };
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  const v = i >= 0 ? Number(argv[i + 1]) : NaN;
  if (!Number.isInteger(v) || v <= 0) fail(2, `--${name} <positive integer> is required`);
  return v;
};
const verifyFiles = arg('verify-files');
const verifyTests = arg('verify-tests');
const mcpTests = arg('mcp-tests');

// Git state.
const BASE = 'da27cb5';
if (git('rev-parse', '--short=7', 'origin/main') !== BASE) fail(3, `origin/main is not ${BASE}`);
if (git('branch', '--show-current') !== 's20-a-cache') fail(3, 'not on branch s20-a-cache');
if (git('status', '--porcelain', '--untracked-files=no') !== '') fail(3, 'tracked files are modified; run this before any STATUS or AGENTS edit');
const evidSubject = git('log', '-1', '--format=%s');
if (evidSubject !== 'docs(research): Slice 20 A-cache run evidence') fail(3, `HEAD is not the evidence commit: "${evidSubject}"`);
const EVID = git('rev-parse', '--short=7', 'HEAD');

const fix = git('log', '--reverse', '--format=%h %s', `${BASE}..s20-mcp-fix`).split('\n').filter(Boolean);
if (fix.length !== 2 || !fix[0].includes(' fix(mcp): ') || !fix[1].includes(' ci: ')) fail(3, `s20-mcp-fix must hold exactly the fix(mcp) and ci commits; found:\n${fix.join('\n')}`);
const [FIX1, FIX2] = fix.map((line) => line.split(' ')[0]);
const fixTip = git('rev-parse', 's20-mcp-fix');

const merges = git('log', '--merges', '--format=%h %P', `${BASE}..HEAD`).split('\n').filter(Boolean);
if (merges.length !== 1) fail(3, `expected exactly one merge commit on s20-a-cache since ${BASE}; found ${merges.length}`);
const [MERGE, , mergeP2] = merges[0].split(' ');
if (mergeP2 !== fixTip) fail(3, 'the merge commit\'s second parent is not the tip of s20-mcp-fix');

const firstParent = git('log', '--first-parent', '--reverse', '--format=%h', `${BASE}..HEAD`).split('\n').filter(Boolean);
const steps = firstParent.filter((sha) => sha !== MERGE && sha !== EVID);
if (steps.length < 2) fail(3, `expected the Steps 1-11 commits before the merge; found ${steps.length}`);
const FIRST = steps[0];
const LAST = steps[steps.length - 1];

const nineMerges = git('log', '--merges', '--reverse', '--format=%h', `0d31cda..${BASE}`).split('\n').filter(Boolean);
const expectedNine = ['75606da', 'f6ba35d', 'f066cc1', '34716d0', '35e63d6', 'ebc045a', 'c1d88a7', 'd05fac2', 'da27cb5'];
if (nineMerges.join(',') !== expectedNine.join(',')) fail(3, `merges 0d31cda..${BASE} differ from Nova's list: ${nineMerges.join(',')}`);

// File reads.
const bundles = {};
for (const dir of readdirSync('docs/v2', { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  let html;
  try { html = readFileSync(path.join('docs/v2', dir.name, 'index.html'), 'utf8'); } catch { continue; }
  for (const m of html.matchAll(/(solarSystemV2|porkchopV2|compareV2|aboutV2)-[A-Za-z0-9_-]+\.js/g)) {
    (bundles[m[1]] ??= new Set()).add(m[0]);
  }
}
const order = ['aboutV2', 'compareV2', 'porkchopV2', 'solarSystemV2'];
for (const k of order) {
  if (!bundles[k] || bundles[k].size !== 1) fail(5, `expected exactly one ${k} entry bundle in docs/v2/*/index.html; found ${bundles[k] ? [...bundles[k]].join(', ') : 'none'}`);
}
const bundleList = order.map((k) => `\`${[...bundles[k]][0]}\``).join(', ');

const cacheBytes = readFileSync('docs/lambert-screen-cache.json');
const fixtureBytes = readFileSync('tests/fixtures/v2/lambert-screen-cache.json');
if (!cacheBytes.equals(fixtureBytes)) fail(5, 'docs/lambert-screen-cache.json differs from the fixture');
const cache = JSON.parse(cacheBytes.toString('utf8'));
if (cache?.metadata?.schemaVersion !== 2) fail(5, `cache schemaVersion is ${cache?.metadata?.schemaVersion}, not 2`);
const RAW = cacheBytes.length.toLocaleString('en-US');
const GZIP = gzipSync(cacheBytes).length.toLocaleString('en-US');

const d = new Date();
const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const NODE = process.version;

// Replacements.
let s = readFileSync('STATUS.md', 'utf8');
if (s.charCodeAt(0) === 0xfeff || s.includes('\r')) fail(5, 'STATUS.md has a BOM or CR');
const once = (needle) => {
  const n = s.split(needle).length - 1;
  if (n !== 1) fail(4, `anchor occurs ${n} times: ${needle.slice(0, 70)}`);
};
const replaceLine = (start, line) => {
  once(start);
  const i = s.indexOf(start);
  const j = s.indexOf('\n', i);
  s = s.slice(0, i) + line + s.slice(j);
};
const replaceBetween = (startNeedle, endNeedle, block) => {
  once(startNeedle);
  once(endNeedle);
  const i = s.indexOf(startNeedle);
  const j = s.indexOf(endNeedle);
  if (j <= i) fail(4, 'block anchors are out of order');
  s = s.slice(0, i) + block + s.slice(j);
};

replaceLine('> **Refreshed 2026-11-13 from command output on branch `s20-text-sweep`',
  `> **Refreshed ${TODAY} from command output on branch \`s20-a-cache\`, which carries the MCP fix (\`s20-mcp-fix\`, merged in) and the DEC-20-15 screening cache; \`origin/main\` was \`${BASE}\`. The 2026-11-13 record had gone stale across nine merges and a Codex session-start gate stopped on it (2026-11-18). This STATUS commit is the last commit on its branch.**`);

replaceBetween('The following is the command transcript used to rebuild this section', 'Solar-system ephemeris window 2026-11-01..2027-03-31 TDB',
`The following is the command transcript used to rebuild this section (run in the \`s20-a-cache\` worktree before the
STATUS commit; \`tools/slice20-research/a-cache/write-status.mjs\` (dispatch S20_CHAIN) reads every value below from git
or the tree, except the three test counts, which come from the runs named):

\`\`\`text
git rev-parse --short origin/main
git log --merges --reverse --format=%h 0d31cda..origin/main
git log --reverse --format='%h %s' da27cb5..s20-mcp-fix
git log --merges --format='%h %P' da27cb5..HEAD
git log --first-parent --reverse --format=%h da27cb5..HEAD
docs/v2/*/index.html entry-bundle names; docs/lambert-screen-cache.json bytes, gzip (Node zlib, default level), schemaVersion
npm run verify ; npm --prefix mcp test
\`\`\`

| Item | Commit | State |
|---|---|---|
| origin/main before this record | \`${BASE}\` | Merge s20-rulings (SLICE_20 \u00a79.2-\u00a79.6). Read from \`git rev-parse origin/main\` |
| This record | branch \`s20-a-cache\` | From \`${BASE}\`: DEC-20-15 Steps 1-11 \`${FIRST}\`..\`${LAST}\`; \`s20-mcp-fix\` (\`${FIX1}\` fix(mcp), \`${FIX2}\` ci) merged at \`${MERGE}\`; evidence \`${EVID}\`; an AGENTS.md \u00a72 gate amendment if Hudson commits it; then this STATUS commit, last |

**Session-start match rule (worktrees, SLICE_20 \u00a79.6).** Run the AGENTS.md \u00a72 gate in the canonical tree after \`git fetch origin\`. \`origin/main\` matches this record when it is (i) the SHA in the first row, (ii) the last commit of the branch in the second row, or (iii) a merge commit whose first parent is the first-row SHA and whose second parent is that last commit. A feature worktree is created from that \`origin/main\`; its own HEAD is not compared with this file. Every branch that merges to main ends with a STATUS commit, so the record stays current across merges. A merge without one makes the next session stop; the remedy is a STATUS refresh, never a waived gate.
**Merged since the prior record (\`origin/main\` was \`0d31cda\`), oldest first:** \`75606da\` PR #13 long-run research \u00b7 \`f6ba35d\` PR #14 long-run 2 \u00b7 \`f066cc1\` PR #15 Front A text sweep \u00b7 \`34716d0\` PR #1 K2 momentum bank \u00b7 \`35e63d6\` PR #16 mcp-config \u00b7 \`ebc045a\` Front A tail (B1, B3, B4, B6, B7) \u00b7 \`c1d88a7\` PR #17 NHATS research \u00b7 \`d05fac2\` PR #18 MCP scope \u00b7 \`da27cb5\` Slice 20 \u00a79 rulings.
**Open work not on main:** none from the Slice 20 dispatches once this branch is merged.
**Deploy boundary:** the checked-in \`docs/\` tree is the deploy payload. Entry bundles on \`s20-a-cache\`, live once merged: ${bundleList}. \`docs/lambert-screen-cache.json\` is schemaVersion 2 (no \`bestWindows\`): ${RAW} bytes raw, ${GZIP} gzipped.
`);

replaceLine('**Baseline verification (2026-11-13, before the S20 text sweep):**',
  `**Baseline verification (${TODAY}, \`s20-a-cache\` at \`${EVID}\`, Windows, Node ${NODE}):** \`npm run verify\` passed ${verifyFiles}/${verifyFiles} files and ${verifyTests} tests, with 0 failures and 0 load-timeouts. MCP tests ${mcpTests}/${mcpTests} and eval 10/10 against the schemaVersion 2 cache. CI (Linux, Node 24) is the reference count; the Windows-vs-Linux per-file comparison is in \`tools/slice20-research/a-cache/REPORT.md\`.`);

replaceLine('| Mission planning | **20** (Front A text sweep) |',
  '| Mission planning | **20** (Return Leg) | **IN PROGRESS** (founding `src/v2/SLICE_20_FOUNDING.md`, LOCKED 2026-11-04; DEC-20-1..15). Front A merged: text sweep `f066cc1`, tail `ebc045a`; Clome tail re-gate 7/7 PASS 2026-11-16; close record not yet appended. Rulings \u00a79.2-\u00a79.6, incl. DEC-20-14 (arcs refused at one solar radius) and DEC-20-15 (screening cache), at `da27cb5`. Merged with this record: the MCP compile fix + CI `mcp` job (`s20-mcp-fix`) and the DEC-20-15 schemaVersion 2 screening cache (`s20-a-cache`); end gate A-C pending. Next: Front B (K1 return-leg math; audit before deploy). |');

writeFileSync('STATUS.md', s, 'utf8');
console.log(JSON.stringify({ written: 'STATUS.md', TODAY, BASE, FIRST, LAST, FIX1, FIX2, MERGE, EVID, bundles: order.map((k) => [...bundles[k]][0]), RAW, GZIP, verifyFiles, verifyTests, mcpTests, node: NODE }, null, 1));
