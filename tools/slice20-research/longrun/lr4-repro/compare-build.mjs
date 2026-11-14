#!/usr/bin/env node
// LR4 — compare a fresh-clone build against the committed docs/ at the same commit.
//
//   node compare-build.mjs <clean-clone-dir> <scratch-outDir> <result.json>
//
// The clone must already have been built with:  npm ci && npm run build -- --outDir <scratch-outDir> --emptyOutDir
// For every file tracked under docs/ at the clone's HEAD the committed blob's sha256 is compared with
// the built file's sha256. vite.config.ts has four writeBundle plugins that write to a HARD-CODED
// <repo>/docs path (physics.worker.js, lambert-screen-cache.json, tier-sizing-per-body.json,
// .nojekyll), so those land in the clone's own docs/ even when --outDir points elsewhere; they are
// looked up there and reported with that provenance.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const [cloneDir, outDir, resultPath] = process.argv.slice(2);
if (!cloneDir || !outDir || !resultPath) throw new Error('usage: compare-build.mjs <clone> <outDir> <result.json>');
const git = (...args) => spawnSync('git', args, { cwd: cloneDir, encoding: 'buffer', maxBuffer: 1 << 30 });
const sha = (buf) => createHash('sha256').update(buf).digest('hex');
const head = git('rev-parse', 'HEAD').stdout.toString().trim();
const tracked = git('ls-tree', '-r', '--name-only', 'HEAD', 'docs/').stdout.toString().split('\n').filter(Boolean);

function walk(dir, base = dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, acc);
    else acc.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return acc;
}
const built = new Set(walk(outDir));
const rows = [];
for (const file of tracked) {
  const rel = file.slice('docs/'.length);
  const committed = git('show', `HEAD:${file}`).stdout;
  const committedSha = sha(committed);
  let source = null;
  let builtBuf = null;
  if (built.has(rel)) {
    source = 'outDir';
    builtBuf = fs.readFileSync(path.join(outDir, rel));
  } else if (fs.existsSync(path.join(cloneDir, file))) {
    // not produced into outDir: either a hard-coded plugin write into <clone>/docs, or not rebuilt at all
    const st = git('status', '--porcelain', '--', file).stdout.toString();
    source = st.trim() ? 'clone-docs (modified by the build)' : 'clone-docs (unchanged working-tree file; not emitted into outDir)';
    builtBuf = fs.readFileSync(path.join(cloneDir, file));
  }
  rows.push({
    file,
    committedSha256: committedSha,
    committedBytes: committed.length,
    builtFrom: source,
    builtSha256: builtBuf ? sha(builtBuf) : null,
    builtBytes: builtBuf ? builtBuf.length : null,
    identical: builtBuf ? sha(builtBuf) === committedSha : false,
  });
}
const trackedRel = new Set(tracked.map((f) => f.slice('docs/'.length)));
const onlyInBuild = [...built].filter((rel) => !trackedRel.has(rel)).sort();
const result = {
  schema: 'aster-s20-longrun-lr4-repro/1',
  generatedAtUtc: new Date().toISOString(),
  cloneHead: head,
  node: process.version,
  platform: `${process.platform} ${process.arch}`,
  trackedDocsFiles: tracked.length,
  builtFilesInOutDir: built.size,
  identical: rows.filter((r) => r.identical).length,
  differing: rows.filter((r) => !r.identical && r.builtSha256).map((r) => r.file),
  missingFromBuild: rows.filter((r) => !r.builtSha256).map((r) => r.file),
  onlyInBuild,
  emittedIntoOutDir: rows.filter((r) => r.builtFrom === 'outDir').length,
  notEmittedIntoOutDir: rows.filter((r) => r.builtFrom && r.builtFrom !== 'outDir').map((r) => ({ file: r.file, builtFrom: r.builtFrom, identical: r.identical })),
  cloneDocsStatusAfterBuild: git('status', '--porcelain', '--', 'docs/').stdout.toString().split('\n').filter(Boolean),
  rows,
};
fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ ...result, rows: undefined }, null, 2));
