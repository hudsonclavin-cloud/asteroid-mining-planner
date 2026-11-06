import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const tempOutDir = path.join(repoRoot, '.tmp-tests', 'v2-livedata-sources');
const fixturePath = path.join(repoRoot, 'src', 'v2', 'livedata', 'fixture-orbits.json');
const catalogPath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

async function loadModules() {
  fs.rmSync(tempOutDir, { recursive: true, force: true });
  fs.mkdirSync(tempOutDir, { recursive: true });
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--pretty', 'false', '--outDir', tempOutDir, '--rootDir', path.join(repoRoot, 'src', 'v2'),
      '--module', 'NodeNext', '--target', 'ES2020', '--moduleResolution', 'NodeNext', '--isolatedModules', 'true',
      path.join(repoRoot, 'src', 'v2', 'livedata', 'fixtureSource.ts'),
      path.join(repoRoot, 'src', 'v2', 'livedata', 'sbdbSource.ts'),
      path.join(repoRoot, 'src', 'v2', 'core', 'units.ts'),
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout || 'tsc failed');
  const load = (rel) => import(pathToFileURL(path.join(tempOutDir, rel)).href);
  return {
    adapter: await load('livedata/adapter.js'),
    fixtureSource: await load('livedata/fixtureSource.js'),
    sbdbSource: await load('livedata/sbdbSource.js'),
    units: await load('core/units.js'),
  };
}

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

test('fixture source: the three committed bodies are verbatim copies of the catalog and carry provenance', async () => {
  const { fixtureSource, units } = await loadModules();
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const source = new fixtureSource.FixtureOrbitSource(fixture);
  assert.deepEqual(source.designations(), ['433', '99942', '101955']);
  for (const designation of source.designations()) {
    const catalogRecord = catalog.asteroids[`asteroid-${designation}`];
    assert.ok(catalogRecord, `catalog lacks ${designation}`);
    assert.deepEqual(fixture.bodies[designation].elements, catalogRecord.elements, `${designation} drifted from the catalog`);
    const elements = await source.fetchElements(designation);
    assert.equal(elements.aM, units.kilometersToMeters(catalogRecord.elements.aKm));
    assert.equal(elements.epochTdbSeconds, units.jdTdbToSecondsSinceJ2000(catalogRecord.elements.epochTdbJd));
    assert.equal(elements.e, catalogRecord.elements.e);
    assert.equal(elements.iRad, catalogRecord.elements.iRad);
    assert.equal(elements.asOf, fixture.asOf);
    assert.equal(elements.elementsFrame, catalogRecord.elementsFrame);
    assert.match(elements.source, /committed fixture/);
  }
  assert.equal(fixture.asOf, '2026-05-01');
  assert.match(fixture.note, /element epoch/);
});

test('fixture source: an unknown designation is a typed not-found refusal', async () => {
  const { fixtureSource, adapter } = await loadModules();
  const source = new fixtureSource.FixtureOrbitSource(fixture);
  await assert.rejects(source.fetchElements('nope'), (error) => {
    assert.ok(error instanceof adapter.OrbitSourceError);
    assert.equal(error.kind, 'not-found');
    assert.equal(error.designation, 'nope');
    return true;
  });
  assert.throws(() => new fixtureSource.FixtureOrbitSource({}), TypeError);
});

const sbdbPayloadFor433 = {
  fields: ['pdes', 'full_name', 'epoch', 'e', 'a', 'i', 'om', 'w', 'ma'],
  data: [['433', '433 Eros (A898 PA)', '2461000.5', '0.2228', '1.4583', '10.828', '304.27', '178.90', '40.68']],
};

test('SBDB source: parses a Query API row with the repo units and never touches the network', async () => {
  const { sbdbSource } = await loadModules();
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, hasSignal: Boolean(init?.signal) });
    return { ok: true, status: 200, json: async () => sbdbPayloadFor433 };
  };
  const source = new sbdbSource.SbdbOrbitSource({ fetchImpl });
  const elements = await source.fetchElements('433');
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.startsWith(sbdbSource.SBDB_QUERY_API_URL + '?'));
  assert.ok(calls[0].url.includes(encodeURIComponent('pdes|EQ|433')));
  assert.ok(calls[0].hasSignal, 'request must carry an abort signal for the timeout');
  assert.equal(elements.aM, 1.4583 * sbdbSource.ASTRONOMICAL_UNIT_M);
  assert.equal(elements.e, 0.2228);
  // Angles: compare to within a few ulp. `deg * (PI / 180)` and `(deg * PI) / 180` differ in the
  // last bit, and the test must not pin the adapter to one operation order.
  const assertRadians = (actual, degrees, name) => {
    const expected = degrees * Math.PI / 180;
    assert.ok(Math.abs(actual - expected) <= 4 * Number.EPSILON * Math.abs(expected),
      `${name}: expected ${expected} rad (from ${degrees} deg), got ${actual}`);
  };
  assertRadians(elements.iRad, 10.828, 'iRad');
  assertRadians(elements.omRad, 304.27, 'omRad');
  assertRadians(elements.wRad, 178.90, 'wRad');
  assertRadians(elements.maRad, 40.68, 'maRad');
  assert.equal(elements.epochTdbSeconds, (2461000.5 - 2451545.0) * 86400);
  assert.equal(elements.asOf, '2025-11-21');
  assert.equal(elements.source, 'JPL SBDB Query API');
  assert.equal(elements.elementsFrame, 'FRAME_HELIO_J2000_ECLIPTIC');
});

test('SBDB source: empty data is not-found, bad JSON is malformed, HTTP errors are network', async () => {
  const { sbdbSource, adapter } = await loadModules();
  const kindOf = async (fetchImpl) => {
    try {
      await new sbdbSource.SbdbOrbitSource({ fetchImpl }).fetchElements('433');
    } catch (error) {
      assert.ok(error instanceof adapter.OrbitSourceError, String(error));
      return error.kind;
    }
    return 'no-error';
  };
  assert.equal(await kindOf(async () => ({ ok: true, status: 200, json: async () => ({ fields: [], data: [] }) })), 'not-found');
  assert.equal(await kindOf(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('x'); } })), 'malformed');
  assert.equal(await kindOf(async () => ({ ok: true, status: 200, json: async () => ({ nope: true }) })), 'malformed');
  assert.equal(await kindOf(async () => ({ ok: false, status: 503, json: async () => ({}) })), 'network');
  assert.equal(await kindOf(async () => { throw new Error('ECONNRESET'); }), 'network');
  assert.equal(await kindOf(async () => ({ ok: true, status: 200, json: async () => ({ fields: ['pdes'], data: [['433']] }) })), 'malformed');
});

test('SBDB source: a fetch that never resolves is aborted as a timeout', async () => {
  const { sbdbSource, adapter } = await loadModules();
  const fetchImpl = (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')));
  });
  const source = new sbdbSource.SbdbOrbitSource({ fetchImpl, timeoutMs: 20 });
  await assert.rejects(source.fetchElements('433'), (error) => {
    assert.ok(error instanceof adapter.OrbitSourceError);
    assert.equal(error.kind, 'timeout');
    return true;
  });
});

test('SBDB source: parseSbdbQueryPayload is pure and exported', async () => {
  const { sbdbSource } = await loadModules();
  const parsed = sbdbSource.parseSbdbQueryPayload(sbdbPayloadFor433, '433');
  assert.equal(parsed.e, 0.2228);
  assert.throws(() => sbdbSource.parseSbdbQueryPayload(null, '433'), /payload/);
});

test('SBDB source: every malformed shape is a typed OrbitSourceError, never a bare throw', async () => {
  const { sbdbSource, adapter } = await loadModules();
  const fields = sbdbPayloadFor433.fields;
  const row = sbdbPayloadFor433.data[0];
  const withCell = (name, value) => {
    const copy = row.slice();
    copy[fields.indexOf(name)] = value;
    return { fields, data: [copy] };
  };
  const kindOf = (payload) => {
    try {
      sbdbSource.parseSbdbQueryPayload(payload, '433');
      return 'parsed';
    } catch (error) {
      return error instanceof adapter.OrbitSourceError ? error.kind : `BARE:${error.name}`;
    }
  };
  // Empty and whitespace cells are missing values, not 0 (Number('') === 0 would have parsed e = 0).
  assert.equal(kindOf(withCell('e', '')), 'malformed');
  assert.equal(kindOf(withCell('a', '   ')), 'malformed');
  assert.equal(kindOf(withCell('i', 'abc')), 'malformed');
  // A row that is not an array.
  assert.equal(kindOf({ fields, data: [null] }), 'malformed');
  assert.equal(kindOf({ fields, data: [42] }), 'malformed');
  // An epoch no real SBDB record can carry (would otherwise reach Date#toISOString and RangeError).
  assert.equal(kindOf(withCell('epoch', '1e20')), 'malformed');
  assert.equal(kindOf(withCell('epoch', '-5')), 'malformed');
  // No pdes column at all.
  const noPdes = { fields: fields.filter((f) => f !== 'pdes'), data: [row.filter((_, i) => fields[i] !== 'pdes')] };
  assert.equal(kindOf(noPdes), 'malformed');
  // The control row still parses.
  assert.equal(kindOf(sbdbPayloadFor433), 'parsed');
});

test('SBDB source: the row is selected by pdes, so another body\'s row is never returned as the requested one', async () => {
  const { sbdbSource, adapter } = await loadModules();
  const fields = sbdbPayloadFor433.fields;
  const eros = sbdbPayloadFor433.data[0];
  const apophis = ['99942', '99942 Apophis (2004 MN4)', '2461000.5', '0.1911', '0.9226', '3.339', '203.96', '126.68', '100.00'];
  // Apophis first, Eros second: the parser must pick Eros for '433'.
  const picked = sbdbSource.parseSbdbQueryPayload({ fields, data: [apophis, eros] }, '433');
  assert.equal(picked.e, 0.2228);
  // A payload containing only another body is not-found, not silently Apophis.
  await assert.rejects(
    async () => sbdbSource.parseSbdbQueryPayload({ fields, data: [apophis] }, '433'),
    (error) => error instanceof adapter.OrbitSourceError && error.kind === 'not-found',
  );
  // Whitespace around pdes is tolerated.
  const padded = eros.slice();
  padded[fields.indexOf('pdes')] = ' 433 ';
  assert.equal(sbdbSource.parseSbdbQueryPayload({ fields, data: [padded] }, '433').e, 0.2228);
});

test('SBDB source: a fetch that resolves to nothing is a typed network error', async () => {
  const { sbdbSource, adapter } = await loadModules();
  for (const value of [undefined, null]) {
    const source = new sbdbSource.SbdbOrbitSource({ fetchImpl: async () => value });
    await assert.rejects(
      () => source.fetchElements('433'),
      (error) => error instanceof adapter.OrbitSourceError && error.kind === 'network',
    );
  }
});
