import { readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();
const searchRoots = ['tests', path.join('src', 'v2')];
const testFiles = [];

for (const relativeRoot of searchRoots) {
  walk(relativeRoot);
}

testFiles.sort();

if (testFiles.length === 0) {
  console.error('No test files discovered.');
  process.exit(1);
}

console.log(`Discovered ${testFiles.length} test files:`);
for (const file of testFiles) {
  console.log(file);
}

const child = spawn(process.execPath, ['--test', '--test-timeout=120000', ...testFiles], {
  stdio: 'inherit',
  cwd: repoRoot,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error('Failed to launch node --test:', error);
  process.exit(1);
});

function walk(relativeDir) {
  const absoluteDir = path.join(repoRoot, relativeDir);
  for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
    const entryRelativePath = path.join(relativeDir, entry.name);
    if (shouldSkip(entryRelativePath)) {
      continue;
    }
    if (entry.isDirectory()) {
      walk(entryRelativePath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      testFiles.push(entryRelativePath);
    }
  }
}

function shouldSkip(relativePath) {
  return relativePath.split(path.sep).some((segment) => segment === 'node_modules' || segment === 'docs');
}
