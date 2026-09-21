// Catalog row badge tests (Slice 18 close-out, Item 3).
//
// 2018 LA impacted Earth on 2018-06-02 (L0, verified-destroyed-ephemeris-
// termination) yet its cached screen says low_departure_c3, so the row wore a
// green LOW C3 badge for a body that no longer exists. Item 3 suppresses the
// two QUALITY badges (low/high C3) on L0 rows only, keeps the numeric C3
// visibly de-emphasised with the context "computed from the last known
// orbit", leaves 2015 D1's '—' alone, and changes nothing on non-L0 rows.
//
// renderRow returns a Preact VNode tree; these tests walk it for text and
// title props. No DOM is involved — the assertions are about what the row
// says, not how the browser lays it out.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-catalog-list-row');
const screenCachePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'lambert-screen-cache.json');
const tierArtifactPath = path.join(repoRoot, 'tools', 'slice18-research', 'tier-sizing-per-body.json');

const CONTEXT = 'computed from the last known orbit';
const BADGE_TEXT = {
  low_departure_c3: 'low C3',
  high_departure_c3: 'high C3',
  lambert_unconvergeable: 'unconv.',
  propagator_failed: 'prop fail',
};

// Colocated under src/v2, so the architecture import wall forbids
// tests/helpers/run-tsc.mjs; same contract — spawn the real tsc JS entry.
function runTsc(args) {
  return spawnSync(
    process.execPath,
    [path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'), ...args],
    { cwd: repoRoot, encoding: 'utf8' },
  );
}

let modulesPromise = null;
async function loadModules() {
  if (modulesPromise === null) {
    modulesPromise = (async () => {
      fs.rmSync(tempOutDir, { recursive: true, force: true });
      fs.mkdirSync(tempOutDir, { recursive: true });
      const result = runTsc([
        '--pretty', 'false',
        '--outDir', tempOutDir,
        '--rootDir', path.join(repoRoot, 'src', 'v2'),
        '--module', 'NodeNext',
        '--target', 'ES2020',
        '--moduleResolution', 'NodeNext',
        '--isolatedModules', 'true',
        path.join(repoRoot, 'src', 'v2', 'app', 'catalog-list', 'row.ts'),
      ]);
      assert.equal(result.status, 0, `tsc compilation failed\n${result.stderr || result.stdout}`);
      const row = await import(pathToFileURL(path.join(tempOutDir, 'app', 'catalog-list', 'row.js')).href);
      const formatC3Module = await import(pathToFileURL(path.join(tempOutDir, 'porkchop', 'format-c3.js')).href);
      const screens = new Map(
        JSON.parse(fs.readFileSync(screenCachePath, 'utf8')).bodies.map((entry) => [entry.bodyId, entry]),
      );
      const tiers = JSON.parse(fs.readFileSync(tierArtifactPath, 'utf8')).records;
      return { renderRow: row.renderRow, formatC3: formatC3Module.formatC3, screens, tiers };
    })();
  }
  return modulesPromise;
}

/** Row data for a committed body: screen from the Lambert cache, tier from the S18 artifact. */
function committedRow(modules, designation, orbitClass) {
  const bodyId = `asteroid-${designation}`;
  const screen = modules.screens.get(bodyId);
  const tierRecord = modules.tiers[designation];
  assert.ok(screen, `${bodyId} must be in the screen cache`);
  assert.ok(tierRecord, `${designation} must be in the tier artifact`);
  const tier = { des: tierRecord.des, tier: tierRecord.tier, subReason: tierRecord.subReason, classification: tierRecord.classification };
  return { bodyId, spkId: screen.spkId, designation, name: '', orbitClass, H: null, screen, tier };
}

function collectTexts(node, out = []) {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return out;
  }
  if (typeof node === 'string' || typeof node === 'number') {
    out.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectTexts(child, out);
    return out;
  }
  if (node.props) {
    collectTexts(node.props.children, out);
  }
  return out;
}

function collectTitles(node, out = []) {
  if (node === null || node === undefined || typeof node !== 'object') {
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectTitles(child, out);
    return out;
  }
  if (node.props) {
    if (typeof node.props.title === 'string') out.push(node.props.title);
    collectTitles(node.props.children, out);
  }
  return out;
}

test('2018 LA (L0, verified impact): LOW C3 badge suppressed; C3 kept with the last-known-orbit context', async () => {
  const modules = await loadModules();
  const data = committedRow(modules, '2018 LA', 'APO');
  // Premise, from the committed artifacts: the cache WOULD grade it, and the tier says it no longer exists.
  assert.equal(data.screen.status, 'low_departure_c3');
  assert.equal(data.tier.tier, 'L0');
  assert.equal(data.tier.subReason, 'verified-destroyed-ephemeris-termination');

  const texts = collectTexts(modules.renderRow(data, 0));
  assert.ok(!texts.includes('low C3') && !texts.includes('high C3'), 'no quality badge on an L0 row');
  assert.ok(texts.includes('L0'), 'the tier badge stays');
  const expected = `C3 ${modules.formatC3(data.screen.minC3)} km²/s² · ${CONTEXT}`;
  assert.ok(texts.includes(expected), `numeric C3 kept with context: ${expected}\n${JSON.stringify(texts)}`);
  assert.ok(!texts.includes(`C3 ${modules.formatC3(data.screen.minC3)} km²/s²`), 'the bare (undecorated) C3 line is gone');
  assert.ok(collectTitles(modules.renderRow(data, 0)).some((title) => title.startsWith('Computed from the last known orbit')));
});

test('2015 D1 (L0, hyperbolic): "—" stays, PROP FAIL badge stays, no context is invented for a null C3', async () => {
  const modules = await loadModules();
  const data = committedRow(modules, '2015 D1', 'JFC');
  assert.equal(data.screen.status, 'propagator_failed');
  assert.equal(data.screen.minC3, null);
  assert.equal(data.tier.tier, 'L0');

  const texts = collectTexts(modules.renderRow(data, 0));
  assert.ok(texts.includes('prop fail'), 'prop fail is not a quality badge and stays');
  assert.ok(texts.includes('C3 — km²/s²'), 'unchanged');
  assert.ok(!texts.some((text) => text.includes(CONTEXT)));
});

test('non-L0 rows are untouched: 433 (L2) and 99942 (L1) keep their badge and plain C3', async () => {
  const modules = await loadModules();
  for (const [designation, orbitClass] of [['433', 'AMO'], ['99942', 'ATE']]) {
    const data = committedRow(modules, designation, orbitClass);
    assert.notEqual(data.tier.tier, 'L0');
    const texts = collectTexts(modules.renderRow(data, 0));
    assert.ok(texts.includes(BADGE_TEXT[data.screen.status]), `${designation} keeps its '${BADGE_TEXT[data.screen.status]}' badge`);
    assert.ok(texts.includes(`C3 ${modules.formatC3(data.screen.minC3)} km²/s²`), `${designation} plain C3 line`);
    assert.ok(!texts.some((text) => text.includes(CONTEXT)), `${designation} carries no L0 context`);
  }
});

test('the rule is exactly {L0} x {low, high}: every other tier/status combination renders its badge', async () => {
  const modules = await loadModules();
  const seen = [];
  for (const tier of ['L0', 'L1', 'L2']) {
    for (const status of Object.keys(BADGE_TEXT)) {
      const quality = status === 'low_departure_c3' || status === 'high_departure_c3';
      const screen = {
        bodyId: 'asteroid-synthetic', spkId: 0, designation: 'synthetic', status,
        minC3: quality ? 12.5 : null, minC3Date: null, minC3TofDays: null, bestWindows: [], isCoOrbital: false,
      };
      const data = {
        bodyId: 'asteroid-synthetic', spkId: 0, designation: 'synthetic', name: '', orbitClass: 'APO', H: null,
        screen, tier: { des: 'synthetic', tier, subReason: 'synthetic', classification: 'synthetic' },
      };
      const texts = collectTexts(modules.renderRow(data, 0));
      const badgeShown = texts.includes(BADGE_TEXT[status]);
      const contextShown = texts.some((text) => text.includes(CONTEXT));
      seen.push({ tier, status, badgeShown, contextShown });
      assert.equal(badgeShown, !(tier === 'L0' && quality), `${tier}/${status}: badge shown?`);
      assert.equal(contextShown, tier === 'L0' && screen.minC3 !== null, `${tier}/${status}: context shown?`);
    }
  }
  assert.equal(seen.length, 12);
});
