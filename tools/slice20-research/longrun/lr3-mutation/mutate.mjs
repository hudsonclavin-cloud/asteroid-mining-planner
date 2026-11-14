#!/usr/bin/env node
// LR3 — mutation campaign over src/v2/core/** and src/v2/porkchop/** (tools-only research).
//
// No new dependency: mutation sites are found with the TypeScript compiler API the repo already
// installs. EVERY mutation is applied only inside a THROWAWAY COPY of the repo (never the longrun
// worktree, never Hudson's tree): the copy root must carry the marker file `.lr3-throwaway-copy`,
// which this script refuses to run without.
//
// Subcommands (all take --copy <dir>, the throwaway copy root):
//   enumerate --out <mutants.json>
//       Parse every production .ts under src/v2/core and src/v2/porkchop, list mutants.
//   baseline  --out <baseline.json> --cov <scratch dir>
//       Run every discovered test file once, unmutated: pass/fail, duration, the EMPIRICAL import
//       graph (which src/v2 modules that test file compiled into .tmp-tests/), and - from Node's
//       built-in NODE_V8_COVERAGE - which top-level functions of each module the test executed.
//   run --mutants <mutants.json> --baseline <baseline.json> --order <ids.json> --out <results.ndjson>
//       [--worker k --of n] [--max-seconds s] [--all-importers]
//       For each mutant: write the mutated file, run the test files that import that module AND
//       executed the mutated function at baseline (most specific first, stop at the first failure),
//       restore the file. A test that imports the module but never calls the mutated function runs
//       the same instructions with or without the mutant, so it cannot fail because of it; skipping
//       it changes the cost, not the verdict. --all-importers disables that pruning (used to check
//       it on a sample). Resumable: one NDJSON line per mutant; a restart skips recorded mutants.
//
// Operators (dispatch LR3.1): arithmetic swap (+/-, * and /), relational swap (< <=, > >=), sign flip
// (drop a unary minus), constant nudge (x 1.001), loop off-by-one (bound -1 / +1, start +1), guard
// removal (an `if` with no else whose branch ends in return / throw / continue / break), argument swap
// (adjacent call arguments).
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const command = argv[0];
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};
const copyRoot = path.resolve(arg('copy', ''));
if (!arg('copy', '') || !fs.existsSync(path.join(copyRoot, '.lr3-throwaway-copy'))) {
  console.error('refusing to run: --copy must be a throwaway copy containing the marker file .lr3-throwaway-copy');
  process.exit(2);
}
const require = createRequire(path.join(copyRoot, 'package.json'));
const ts = require('typescript');

const SCOPE_DIRS = ['src/v2/core', 'src/v2/porkchop'];
const isProductionTs = (rel) => rel.endsWith('.ts') && !rel.endsWith('.d.ts') && !/\.test\.[a-z]+$/.test(rel);
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.tmp-')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}
const toRel = (full) => path.relative(copyRoot, full).split(path.sep).join('/');

// ------------------------------------------------------------------------------------------------
// enumerate
// ------------------------------------------------------------------------------------------------
const ARITH = new Map([
  [ts.SyntaxKind.PlusToken, '-'], [ts.SyntaxKind.MinusToken, '+'],
  [ts.SyntaxKind.AsteriskToken, '/'], [ts.SyntaxKind.SlashToken, '*'],
  [ts.SyntaxKind.PlusEqualsToken, '-='], [ts.SyntaxKind.MinusEqualsToken, '+='],
  [ts.SyntaxKind.AsteriskEqualsToken, '/='], [ts.SyntaxKind.SlashEqualsToken, '*='],
]);
const RELATIONAL = new Map([
  [ts.SyntaxKind.LessThanToken, '<='], [ts.SyntaxKind.LessThanEqualsToken, '<'],
  [ts.SyntaxKind.GreaterThanToken, '>='], [ts.SyntaxKind.GreaterThanEqualsToken, '>'],
]);

function enumerate() {
  const files = SCOPE_DIRS.flatMap((d) => walk(path.join(copyRoot, d))).filter((f) => isProductionTs(toRel(f))).sort();
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true, noEmit: true, skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const isStringy = (node) => {
    const t = checker.getTypeAtLocation(node);
    const flag = (x) => (x.flags & (ts.TypeFlags.StringLike | ts.TypeFlags.TemplateLiteral)) !== 0;
    return flag(t) || (t.isUnion() && t.types.some(flag));
  };
  const mutants = [];
  const fileStats = [];
  for (const full of files) {
    const rel = toRel(full);
    const sf = program.getSourceFile(full);
    const text = sf.getFullText();
    const exportedNames = new Set();
    for (const st of sf.statements) {
      if (ts.isExportDeclaration(st) && st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) exportedNames.add((el.propertyName ?? el.name).text);
      }
    }
    const hasExport = (node) => (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
    const functions = [];
    for (const st of sf.statements) {
      if (ts.isFunctionDeclaration(st) && st.body && st.name) {
        functions.push({ name: st.name.text, exported: hasExport(st) || exportedNames.has(st.name.text), body: st.body });
      } else if (ts.isVariableStatement(st)) {
        const exported = (ts.getCombinedModifierFlags(st.declarationList.declarations[0]) & ts.ModifierFlags.Export) !== 0
          || st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        for (const decl of st.declarationList.declarations) {
          const init = decl.initializer;
          if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) && ts.isIdentifier(decl.name)) {
            functions.push({ name: decl.name.text, exported: Boolean(exported) || exportedNames.has(decl.name.text), body: init.body });
          }
        }
      } else if (ts.isClassDeclaration(st) && st.name) {
        const exported = hasExport(st) || exportedNames.has(st.name.text);
        for (const member of st.members) {
          if ((ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member) || ts.isGetAccessorDeclaration(member)) && member.body) {
            const mName = ts.isConstructorDeclaration(member) ? 'constructor' : member.name.getText(sf);
            functions.push({ name: `${st.name.text}.${mName}`, exported, body: member.body });
          }
        }
      }
    }
    let fileCount = 0;
    for (const fn of functions) {
      const add = (operator, node, start, end, replacement) => {
        const { line, character } = sf.getLineAndCharacterOfPosition(start);
        const lineStart = sf.getPositionOfLineAndCharacter(line, 0);
        let lineEnd = text.indexOf('\n', lineStart);
        if (lineEnd === -1) lineEnd = text.length;
        const singleLine = end <= lineEnd;
        const originalLine = text.slice(lineStart, lineEnd);
        const mutatedLine = singleLine ? text.slice(lineStart, start) + replacement + text.slice(end, lineEnd) : null;
        mutants.push({
          id: `${rel}#${mutants.length}`, file: rel, function: fn.name, exported: fn.exported, operator,
          line: line + 1, column: character + 1, start, end,
          original: text.slice(start, end).slice(0, 200), replacement: replacement.slice(0, 200),
          originalLine: originalLine.trim().slice(0, 240),
          mutatedLine: mutatedLine === null ? `(multi-line statement replaced by: ${replacement})` : mutatedLine.trim().slice(0, 240),
        });
        fileCount += 1;
      };
      const inTypePosition = (node) => {
        for (let p = node.parent; p && p !== fn.body; p = p.parent) if (ts.isTypeNode(p)) return true;
        return false;
      };
      const visit = (node) => {
        if (ts.isBinaryExpression(node)) {
          const kind = node.operatorToken.kind;
          const opStart = node.operatorToken.getStart(sf);
          const opEnd = node.operatorToken.getEnd();
          if (ARITH.has(kind)) {
            const plusLike = kind === ts.SyntaxKind.PlusToken || kind === ts.SyntaxKind.PlusEqualsToken;
            if (!(plusLike && (isStringy(node.left) || isStringy(node.right)))) add('arithmetic-swap', node, opStart, opEnd, ARITH.get(kind));
          } else if (RELATIONAL.has(kind)) {
            add('relational-swap', node, opStart, opEnd, RELATIONAL.get(kind));
          }
        }
        if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
          add('sign-flip', node, node.getStart(sf), node.operand.getStart(sf), '');
        }
        if (ts.isNumericLiteral(node) && !inTypePosition(node)) {
          const value = Number(node.text);
          const p = node.parent;
          const isIndex = ts.isElementAccessExpression(p) && p.argumentExpression === node;
          const isForInit = ts.isVariableDeclaration(p) && p.parent && ts.isVariableDeclarationList(p.parent) && ts.isForStatement(p.parent.parent);
          const isEnumOrProp = ts.isEnumMember(p) || (ts.isPropertyAssignment(p) && p.name === node);
          if (value !== 0 && Number.isFinite(value) && !isIndex && !isForInit && !isEnumOrProp) {
            add('constant-nudge', node, node.getStart(sf), node.getEnd(), `(${node.getText(sf)} * 1.001)`);
          }
        }
        if (ts.isForStatement(node)) {
          const cond = node.condition;
          if (cond && ts.isBinaryExpression(cond) && RELATIONAL.has(cond.operatorToken.kind)) {
            const r = cond.right;
            add('loop-bound-minus-1', cond, r.getStart(sf), r.getEnd(), `((${r.getText(sf)}) - 1)`);
            add('loop-bound-plus-1', cond, r.getStart(sf), r.getEnd(), `((${r.getText(sf)}) + 1)`);
          }
          const init = node.initializer;
          if (init && ts.isVariableDeclarationList(init)) {
            for (const d of init.declarations) {
              if (d.initializer && ts.isNumericLiteral(d.initializer)) {
                add('loop-start-plus-1', d, d.initializer.getStart(sf), d.initializer.getEnd(), String(Number(d.initializer.text) + 1));
              }
            }
          }
        }
        if (ts.isIfStatement(node) && !node.elseStatement) {
          const then = node.thenStatement;
          const last = ts.isBlock(then) ? then.statements[then.statements.length - 1] : then;
          if (last && (ts.isReturnStatement(last) || ts.isThrowStatement(last) || ts.isContinueStatement(last) || ts.isBreakStatement(last))) {
            add('guard-removal', node, node.getStart(sf), node.getEnd(), ';');
          }
        }
        if (ts.isCallExpression(node) && node.arguments.length >= 2) {
          const args = node.arguments;
          const pairs = new Set([0]);
          if (args.length >= 3) pairs.add(args.length - 2);
          for (const i of pairs) {
            const a = args[i];
            const b = args[i + 1];
            if (ts.isSpreadElement(a) || ts.isSpreadElement(b)) continue;
            const ta = a.getText(sf);
            const tb = b.getText(sf);
            if (ta === tb) continue;
            const between = text.slice(a.getEnd(), b.getStart(sf));
            add('argument-swap', node, a.getStart(sf), b.getEnd(), `${tb}${between}${ta}`);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(fn.body);
    }
    fileStats.push({ file: rel, functions: functions.length, exportedFunctions: functions.filter((f) => f.exported).length, mutants: fileCount });
  }
  return { mutants, fileStats };
}

// ------------------------------------------------------------------------------------------------
// test running
// ------------------------------------------------------------------------------------------------
function discoverTests() {
  // same discovery rule as tools/run-tests.mjs: *.test.mjs under tests/ and src/v2
  const out = [];
  for (const root of ['tests', path.join('src', 'v2')]) {
    for (const full of walk(path.join(copyRoot, root))) if (full.endsWith('.test.mjs')) out.push(toRel(full));
  }
  return out.sort();
}

function runTestFile(rel, timeoutMs, extraEnv = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, ['--test', '--test-timeout=120000', rel], {
      cwd: copyRoot, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...extraEnv },
    });
    let output = '';
    const keep = (chunk) => { if (output.length < 400_000) output += chunk; };
    child.stdout.on('data', keep);
    child.stderr.on('data', keep);
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* already gone */ }
    }, timeoutMs);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ file: rel, exitCode: code, timedOut, ms: Date.now() - started, output });
    });
  });
}

/** Map a .js emitted under .tmp-tests/ back to its src/v2 .ts by longest path suffix (or null). */
function sourceModuleFor(compiledFull) {
  const tmp = path.join(copyRoot, '.tmp-tests');
  const parts = path.relative(tmp, compiledFull).split(path.sep);
  if (parts[0] === '..') return null;
  for (let i = 1; i < parts.length; i += 1) {
    const candidate = ['src', 'v2', ...parts.slice(i)].join('/').replace(/\.js$/, '.ts');
    const direct = parts.slice(i).join('/').replace(/\.js$/, '.ts');
    if (direct.startsWith('src/v2/') && fs.existsSync(path.join(copyRoot, direct))) return direct;
    if (fs.existsSync(path.join(copyRoot, candidate))) return candidate;
  }
  return null;
}

function compiledModules() {
  const tmp = path.join(copyRoot, '.tmp-tests');
  const found = new Set();
  if (!fs.existsSync(tmp)) return found;
  for (const full of walk(tmp)) {
    if (!full.endsWith('.js')) continue;
    const mod = sourceModuleFor(full);
    if (mod) found.add(mod);
  }
  return found;
}

/** From a NODE_V8_COVERAGE directory: { 'src/v2/x.ts': [function names executed at least once] }. */
function executedFunctions(covDir) {
  const executed = new Map();
  if (!fs.existsSync(covDir)) return {};
  const prefix = `file://${path.join(copyRoot, '.tmp-tests')}/`;
  for (const name of fs.readdirSync(covDir)) {
    if (!name.endsWith('.json')) continue;
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(path.join(covDir, name), 'utf8')); } catch { continue; }
    for (const script of parsed.result ?? []) {
      if (!script.url || !script.url.startsWith(prefix) || !script.url.endsWith('.js')) continue;
      const mod = sourceModuleFor(decodeURIComponent(script.url.slice('file://'.length)));
      if (!mod) continue;
      if (!executed.has(mod)) executed.set(mod, new Set());
      for (const fn of script.functions ?? []) {
        if (fn.functionName && fn.ranges?.[0]?.count > 0) executed.get(mod).add(fn.functionName);
      }
    }
  }
  return Object.fromEntries([...executed.entries()].map(([k, v]) => [k, [...v].sort()]));
}

async function baseline() {
  const filter = arg('filter', ''); // substring filter, for a quick trial of the capture only
  const tests = discoverTests().filter((t) => t.includes(filter));
  const rows = [];
  const covRoot = path.resolve(arg('cov'));
  for (const rel of tests) {
    fs.rmSync(path.join(copyRoot, '.tmp-tests'), { recursive: true, force: true });
    const covDir = path.join(covRoot, String(rows.length));
    fs.rmSync(covDir, { recursive: true, force: true });
    fs.mkdirSync(covDir, { recursive: true });
    const r = await runTestFile(rel, 600_000, { NODE_V8_COVERAGE: covDir });
    const executed = executedFunctions(covDir);
    fs.rmSync(covDir, { recursive: true, force: true }); // the tsc child's coverage dump is large
    const source = fs.readFileSync(path.join(copyRoot, rel), 'utf8');
    rows.push({
      file: rel, pass: r.exitCode === 0 && !r.timedOut, exitCode: r.exitCode, timedOut: r.timedOut, ms: r.ms,
      modules: [...compiledModules()].sort(), executed,
      // module basenames the test file names in its own text: used only to ORDER tests (specific first)
      mentions: [...new Set([...source.matchAll(/([A-Za-z0-9_.-]+)\.(?:js|ts)['"`]/g)].map((x) => x[1]))].sort(),
    });
    const last = rows[rows.length - 1];
    console.log(`${rows.length}/${tests.length} ${r.exitCode === 0 ? 'ok  ' : 'FAIL'} ${r.ms} ms ${rel} (${last.modules.length} modules, ${Object.values(executed).reduce((a, v) => a + v.length, 0)} functions executed)`);
  }
  return { node: process.version, tests: rows };
}

async function run() {
  const { mutants } = JSON.parse(fs.readFileSync(arg('mutants'), 'utf8'));
  const base = JSON.parse(fs.readFileSync(arg('baseline'), 'utf8'));
  const outPath = arg('out');
  const worker = Number(arg('worker', '0'));
  const of = Number(arg('of', '1'));
  const maxSeconds = Number(arg('max-seconds', '0'));
  const order = JSON.parse(fs.readFileSync(arg('order'), 'utf8')); // array of mutant ids, priority order
  const byId = new Map(mutants.map((m) => [m.id, m]));
  const allImporters = argv.includes('--all-importers');
  const importers = new Map();
  for (const t of base.tests) {
    if (!t.pass) continue; // a test that fails unmutated cannot kill anything; listed in the report
    for (const mod of t.modules) {
      if (!importers.has(mod)) importers.set(mod, []);
      importers.get(mod).push(t);
    }
  }
  // V8 reports a class method under its bare name; the enumerator records `Class.method`.
  const bareName = (fnName) => fnName.split('.').pop();
  const selectTests = (m) => {
    const importing = importers.get(m.file) ?? [];
    const executing = importing.filter((t) => (t.executed[m.file] ?? []).includes(bareName(m.function)));
    const base2 = path.basename(m.file, '.ts');
    const chosen = (allImporters ? importing : executing).slice();
    // most specific first: tests that name the module in their own text, then fastest
    chosen.sort((a, b) => (Number(b.mentions.includes(base2)) - Number(a.mentions.includes(base2))) || (a.ms - b.ms));
    return { importing: importing.length, executing: executing.length, chosen };
  };
  const done = new Set();
  if (fs.existsSync(outPath)) {
    for (const line of fs.readFileSync(outPath, 'utf8').split('\n')) {
      if (!line) continue;
      try { done.add(JSON.parse(line).id); } catch { /* torn last line: redo that mutant */ }
    }
  }
  const fd = fs.openSync(outPath, 'a');
  const started = Date.now();
  let processed = 0;
  let state = 'complete';
  for (let position = 0; position < order.length; position += 1) {
    if (position % of !== worker) continue;
    const id = order[position];
    if (done.has(id)) continue;
    if (maxSeconds > 0 && (Date.now() - started) / 1000 > maxSeconds) { state = 'time-box'; break; }
    const m = byId.get(id);
    const full = path.join(copyRoot, m.file);
    const original = fs.readFileSync(full, 'utf8');
    if (original.slice(m.start, m.end).slice(0, 200) !== m.original) {
      fs.writeSync(fd, `${JSON.stringify({ id, outcome: 'error', detail: 'source text does not match the enumerated mutant' })}\n`);
      continue;
    }
    const selection = selectTests(m);
    const tests = selection.chosen;
    const record = { id, position, outcome: 'survived', testsRun: [], testsImporting: selection.importing, testsExecuting: selection.executing };
    if (allImporters) record.allImporters = true;
    const t0 = Date.now();
    if (selection.importing === 0) {
      record.outcome = 'no-test-imports-module';
    } else if (tests.length === 0) {
      record.outcome = 'not-executed-by-any-test'; // imported by tests, but no test calls this function
    } else {
      fs.writeFileSync(full, original.slice(0, m.start) + m.replacement + original.slice(m.end));
      try {
        for (const t of tests) {
          const r = await runTestFile(t.file, Math.max(45_000, 6 * t.ms + 20_000));
          record.testsRun.push(t.file);
          if (r.timedOut) { record.outcome = 'timeout'; record.killedBy = t.file; break; }
          if (r.exitCode !== 0) {
            record.outcome = 'killed';
            record.killedBy = t.file;
            record.killKind = /error TS\d+|TypeScript compile failed|tsc (failed|exited)/i.test(r.output) ? 'compile' : 'test';
            break;
          }
        }
      } finally {
        fs.writeFileSync(full, original); // restore, always
      }
    }
    record.ms = Date.now() - t0;
    fs.writeSync(fd, `${JSON.stringify(record)}\n`);
    processed += 1;
  }
  fs.closeSync(fd);
  console.log(JSON.stringify({ worker, of, state, processed, seconds: Math.round((Date.now() - started) / 1000) }));
}

if (command === 'enumerate') {
  const result = enumerate();
  fs.writeFileSync(arg('out'), `${JSON.stringify(result)}\n`);
  const byOp = {};
  for (const m of result.mutants) byOp[m.operator] = (byOp[m.operator] ?? 0) + 1;
  console.log(JSON.stringify({
    files: result.fileStats.length, mutants: result.mutants.length,
    inExportedFunctions: result.mutants.filter((m) => m.exported).length, byOperator: byOp,
  }, null, 2));
} else if (command === 'baseline') {
  const result = await baseline();
  fs.writeFileSync(arg('out'), `${JSON.stringify(result)}\n`);
  console.log(JSON.stringify({ tests: result.tests.length, passing: result.tests.filter((t) => t.pass).length, totalMs: result.tests.reduce((a, t) => a + t.ms, 0) }));
} else if (command === 'run') {
  await run();
} else {
  console.error('usage: mutate.mjs <enumerate|baseline|run> --copy <throwaway copy> ...');
  process.exit(2);
}
