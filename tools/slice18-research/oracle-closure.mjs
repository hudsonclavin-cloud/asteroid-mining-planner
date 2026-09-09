#!/usr/bin/env node
/**
 * ORACLE HOLE CLOSURE — transitive import closure of the oracle-validated entry points,
 * then a filtered (comment/blank-stripped) diff of EVERY file in that closure against the
 * commit the oracle fixture names as the validated solver state.
 *
 * The prior audit hand-listed 8 lambert files. If the real closure contains a file that
 * list missed, the "unchanged since validation" argument has a hole. This computes the
 * closure from the source instead of asserting it.
 *
 * Repo READ-ONLY (git read commands only). Writes only here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = 'C:/Users/hudso/asteroid-mining-planner';
const OUT = 'C:/Users/hudso/Documents/aster-slice18/audit/oracle-closure-results.json';

// Entry points the dual-oracle validation actually exercised.
const ENTRIES = [
  'src/v2/core/lambert/izzo.ts',
  'src/v2/core/lambert/lambert-multi-rev.ts',
];

const git = (...args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/** Resolve a relative import specifier (with .js extension, NodeNext style) to a repo-relative .ts path. */
function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null; // bare specifier => external package (none expected)
  const dir = path.posix.dirname(fromFile);
  let p = path.posix.normalize(path.posix.join(dir, spec));
  if (p.endsWith('.js')) p = p.slice(0, -3) + '.ts';
  else if (!p.endsWith('.ts')) p = p + '.ts';
  return p;
}

/** All import/export-from specifiers in a file, including `import type`. */
function importsOf(relPath) {
  const abs = path.join(REPO, relPath);
  if (!fs.existsSync(abs)) return { missing: true, specs: [] };
  const src = fs.readFileSync(abs, 'utf8');
  const specs = [];
  const re = /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) specs.push(m[1]);
  // dynamic import() too
  const re2 = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = re2.exec(src)) !== null) specs.push(m[1]);
  return { missing: false, specs };
}

// ---- transitive closure ----
const closure = new Set();
const external = new Set();
const missing = new Set();
const edges = [];
const stack = [...ENTRIES];
while (stack.length) {
  const cur = stack.pop();
  if (closure.has(cur)) continue;
  closure.add(cur);
  const { missing: miss, specs } = importsOf(cur);
  if (miss) { missing.add(cur); continue; }
  for (const spec of specs) {
    const resolved = resolveImport(cur, spec);
    if (resolved === null) { external.add(spec); continue; }
    edges.push([cur, resolved]);
    if (!closure.has(resolved)) stack.push(resolved);
  }
}

// ---- baselines ----
// The fixture names the SOLVER commit it validated; the validation run landed later.
const fixture = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/slice11-research/data/multi-rev-poliastro-validation.json'), 'utf8'));
const solverCommit = fixture.solverCommit;
const VALIDATION_LANDED = '3560ff8';

/** Strip comments/blank lines so a comment-only edit does not read as a change. */
function stripNonCode(text) {
  // Normalize CRLF FIRST. JS regex `.` does not match \r, so /\/\/.*$/ silently fails to
  // strip // comments on CRLF files — which made two files read as CODE CHANGED on the
  // first pass of this very script. Self-caught; see the audit report.
  const lf = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const noBlock = lf.replace(/\/\*[\s\S]*?\*\//g, '');
  return noBlock
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, '').trimEnd())
    .filter((l) => l.trim() !== '')
    .join('\n');
}

function fileAt(rev, relPath) {
  try { return git('show', `${rev}:${relPath}`); } catch { return null; }
}

const perFile = [];
let anyCodeChange = false;
let anyRawChange = false;
for (const rel of [...closure].sort()) {
  const now = fs.existsSync(path.join(REPO, rel)) ? fs.readFileSync(path.join(REPO, rel), 'utf8') : null;
  const row = { file: rel };
  for (const [label, rev] of [['sinceSolverCommit', solverCommit], ['sinceValidationLanded', VALIDATION_LANDED]]) {
    const then = fileAt(rev, rel);
    if (then === null) { row[label] = 'DID NOT EXIST AT BASELINE'; anyCodeChange = true; continue; }
    const rawSame = then === now;
    const codeSame = stripNonCode(then) === stripNonCode(now ?? '');
    if (!rawSame) anyRawChange = true;
    if (!codeSame) anyCodeChange = true;
    row[label] = codeSame ? (rawSame ? 'identical' : 'code-identical (comments differ)') : '*** CODE CHANGED ***';
  }
  row.lastTouchedBy = git('log', '-1', '--format=%h %ad %s', '--date=short', '--', rel).trim();
  perFile.push(row);
}

const results = {
  generatedAtUtc: new Date().toISOString(),
  entryPoints: ENTRIES,
  oracleFixture: {
    path: 'tools/slice11-research/data/multi-rev-poliastro-validation.json',
    solverCommit,
    validationLandedCommit: VALIDATION_LANDED,
    generated: fixture.generated,
    overallMaxRelError: fixture.overallMaxRelError,
    overallPassesAuditTarget: fixture.overallPassesAuditTarget,
    toleranceTarget: fixture.tolerance_target,
    auditTargetScope: fixture.auditTargetScope,
  },
  closureSize: closure.size,
  closureFiles: [...closure].sort(),
  externalSpecifiers: [...external],
  missingFiles: [...missing],
  priorHandListed: [
    'src/v2/core/lambert/izzo.ts', 'src/v2/core/lambert/householder.ts',
    'src/v2/core/lambert/initial-guess.ts', 'src/v2/core/lambert/tof.ts',
    'src/v2/core/lambert/lambert-multi-rev.ts', 'src/v2/core/lambert/hyp2f1b.ts',
    'src/v2/core/lambert/stumpff.ts', 'src/v2/core/lambert/vec3.ts',
  ],
  perFile,
  anyCodeChangeInClosure: anyCodeChange,
  anyRawChangeInClosure: anyRawChange,
};
results.filesInClosureNotHandListed = results.closureFiles.filter((f) => !results.priorHandListed.includes(f));
results.handListedNotInClosure = results.priorHandListed.filter((f) => !results.closureFiles.includes(f));

fs.writeFileSync(OUT, JSON.stringify(results, null, 1));

console.log('oracle fixture solverCommit: ' + solverCommit.slice(0, 7) + '  (validation landed ' + VALIDATION_LANDED + ')');
console.log('transitive closure: ' + closure.size + ' files');
for (const f of results.closureFiles) console.log('  ' + f);
console.log('external (bare) specifiers: ' + (results.externalSpecifiers.length ? results.externalSpecifiers.join(', ') : 'NONE — closure is self-contained'));
console.log('in closure but NOT hand-listed by the prior audit: ' + (results.filesInClosureNotHandListed.length ? results.filesInClosureNotHandListed.join(', ') : 'none'));
console.log('hand-listed but NOT in closure: ' + (results.handListedNotInClosure.length ? results.handListedNotInClosure.join(', ') : 'none'));
console.log('');
console.log('file'.padEnd(46) + 'vs solverCommit'.padEnd(34) + 'vs validation-landed');
for (const r of perFile) console.log('  ' + r.file.replace('src/v2/core/', '').padEnd(44) + String(r.sinceSolverCommit).padEnd(34) + r.sinceValidationLanded);
console.log('');
console.log('ANY CODE CHANGE IN CLOSURE: ' + anyCodeChange + '   (raw incl. comments: ' + anyRawChange + ')');
