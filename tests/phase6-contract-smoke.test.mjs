import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function readRepoFile(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
}

function unique(values) {
  return [...new Set(values)];
}

test('all texture assets referenced by legacy/index.html exist on disk', () => {
  const html = readRepoFile('legacy/index.html');
  const refs = unique(
    [...html.matchAll(/\b(2k_[A-Za-z0-9_.-]+)\b/g)].map((match) => match[1]),
  ).sort();

  assert.ok(refs.length > 0, 'expected at least one texture filename reference in legacy/index.html');

  const missing = refs.filter((asset) => !fs.existsSync(path.join(repoRoot, 'textures', asset)));
  assert.deepEqual(
    missing,
    [],
    `missing texture assets: ${missing.join(', ')}`,
  );
});

test('legacy entry is frozen, noindexed, and points visitors to V2', () => {
  const html = readRepoFile('legacy/index.html');
  const bannerStart = html.indexOf('<div id="slice-19-5-legacy-banner"');
  const bannerEnd = html.indexOf('</div>', bannerStart) + '</div>'.length;
  const banner = html.slice(bannerStart, bannerEnd);

  assert.ok(html.includes('<meta name="robots" content="noindex, nofollow">'));
  assert.ok(banner.includes('This is the original 2026 prototype, frozen.'));
  assert.ok(banner.includes('Its economic and value figures are unsourced and known to be wrong.'));
  assert.ok(banner.includes('href="../v2/solar-system/"'));
  assert.ok(banner.includes('current tool'));
  assert.ok(banner.includes('position:fixed;top:0;'));
  assert.ok(!banner.includes('banner-dismiss'));
});

test('worker README documents the worker routes implemented in worker/index.js', () => {
  const workerSource = readRepoFile('worker/index.js');
  const readme = readRepoFile('worker/README.md');

  const implementedRoutes = unique(
    [...workerSource.matchAll(/url\.pathname === '([^']+)'/g)].map((match) => match[1]),
  ).sort();
  const documentedRoutes = unique(
    [...readme.matchAll(/`(?:GET|POST) ([^`]+)`/g)].map((match) => match[1]),
  ).sort();

  assert.deepEqual(
    documentedRoutes,
    implementedRoutes,
    `README route list drifted from worker implementation`,
  );
});

test('worker README documents all environment variables used by worker/index.js', () => {
  const workerSource = readRepoFile('worker/index.js');
  const readme = readRepoFile('worker/README.md');

  const envVars = unique(
    [...workerSource.matchAll(/env\.([A-Z0-9_]+)/g)].map((match) => match[1]),
  ).sort();

  for (const envVar of envVars) {
    assert.match(
      readme,
      new RegExp(`\\b${envVar}\\b`),
      `worker/README.md is missing environment variable ${envVar}`,
    );
  }
});

test('worker README documents wildcard localhost development origin support', () => {
  const readme = readRepoFile('worker/README.md');

  assert.match(readme, /http:\/\/localhost:<port>/);
  assert.match(readme, /http:\/\/127\.0\.0\.1:<port>/);
});

test('physics worker no longer hardcodes NHATS and Asterank production route URLs', () => {
  const workerSource = readRepoFile('legacy/physics.worker.js');

  assert.doesNotMatch(workerSource, /https:\/\/aster-proxy\.hudsonclavin\.workers\.dev\/api\/nhats/);
  assert.doesNotMatch(workerSource, /https:\/\/aster-proxy\.hudsonclavin\.workers\.dev\/api\/asterank/);
});

test('.gitignore covers local worker secrets and wrangler state', () => {
  const gitignore = readRepoFile('.gitignore');

  for (const entry of [
    'worker/.dev.vars',
    'worker/.dev.vars.*',
    '.wrangler/',
    'worker/.wrangler/',
  ]) {
    assert.match(
      gitignore,
      new RegExp(`^${entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'),
      `.gitignore is missing ${entry}`,
    );
  }
});
