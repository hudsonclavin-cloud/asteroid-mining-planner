import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const v2Root = path.join(repoRoot, 'src', 'v2');

function listSourceFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (/\.(?:ts|tsx|js|mjs|cjs)$/.test(entry.name)) out.push(fullPath);
    }
  }
  return out.sort();
}

function extractSpecifiers(source) {
  const specifiers = [];
  for (const match of source.matchAll(/\bimport\s+(?:type\s+)?(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g)) {
    specifiers.push(match[1]);
  }
  for (const match of source.matchAll(/\bexport\s+[^'"]+?\s+from\s+['"]([^'"]+)['"]/g)) {
    specifiers.push(match[1]);
  }
  for (const match of source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

function isWithinV2(resolvedPath) {
  const relative = path.relative(v2Root, resolvedPath);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative) || resolvedPath === v2Root;
}

test('src/v2 sources do not import relative modules outside src/v2', () => {
  const offenders = [];

  for (const filePath of listSourceFiles(v2Root)) {
    const source = fs.readFileSync(filePath, 'utf8');
    for (const specifier of extractSpecifiers(source)) {
      if (!specifier.startsWith('.')) continue;
      const resolved = path.resolve(path.dirname(filePath), specifier);
      if (!isWithinV2(resolved)) {
        offenders.push({
          file: path.relative(repoRoot, filePath),
          specifier,
          resolved: path.relative(repoRoot, resolved),
        });
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `src/v2 import wall violations:\n${offenders.map((o) => `${o.file} -> ${o.specifier} (${o.resolved})`).join('\n')}`,
  );
});

test('C3 grid label sites use derived formatters and contain no literal dimension labels', () => {
  const labelSites = [
    {
      file: 'src/v2/app/compare/main.ts',
      formatter: 'formatRequestedC3GridLabel',
      site: /const compareGridLabel\s*=\s*formatRequestedC3GridLabel\(COMPARE_GRID\)/,
    },
    {
      file: 'src/v2/app/porkchop/main.ts',
      formatter: 'formatJdC3GridLabel',
      site: /const PORKCHOP_GRID_LABEL\s*=\s*formatJdC3GridLabel\(GRID_PARAMS\)/,
    },
    {
      file: 'src/v2/porkchop/porkchop-view.ts',
      formatter: 'formatJdC3GridLabel',
      site: /formatJdC3GridLabel\(props\.gridParams\)/,
    },
  ];
  const literalGridPattern = /\d+\s*[×x]\s*\d+\s+grid/g;
  const siteFailures = [];
  const literalFailures = [];

  for (const { file, formatter, site } of labelSites) {
    const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');
    if (!source.includes(formatter) || !site.test(source)) {
      siteFailures.push(`${file}: expected ${formatter} at its grid-label site`);
    }
    for (const match of source.matchAll(literalGridPattern)) {
      const line = source.slice(0, match.index).split('\n').length;
      literalFailures.push(`${file}:${line}: ${match[0]}`);
    }
  }

  assert.deepEqual(siteFailures, [], `grid-label formatter wiring failures:\n${siteFailures.join('\n')}`);
  assert.deepEqual(
    literalFailures,
    [],
    `literal grid labels (file:line: literal):\n${literalFailures.join('\n')}`,
  );
});
