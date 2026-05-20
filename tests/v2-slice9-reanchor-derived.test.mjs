import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const fixturePath = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');

const runnerModuleUrl = pathToFileURL(
  path.join(repoRoot, 'tools', 'slice9-ingestion', 'reanchor-stale-subset.mjs'),
).href;
const derivedFieldsModuleUrl = pathToFileURL(
  path.join(repoRoot, 'tools', 'slice9-ingestion', 'derived-fields.mjs'),
).href;

function readFixture() {
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
}

test('Slice 9 A.2b re-anchor recomputes derived fields after replacing elements', async () => {
  const { applyReanchor } = await import(runnerModuleUrl);
  const { eccentricityBandForBody, qualityRankForRecord, deriveAsteroidRadiusMFromAbsoluteMagnitude } =
    await import(derivedFieldsModuleUrl);

  const fixture = readFixture();
  const original = structuredClone(fixture.asteroids['asteroid-2006 TB7']);
  assert.ok(original, 'missing asteroid-2006 TB7');

  const staleRecord = structuredClone(original);
  staleRecord.eccentricityBand = 'B';
  const expectedBand = eccentricityBandForBody(original.elements.e);
  assert.equal(expectedBand, 'C');
  assert.notEqual(staleRecord.eccentricityBand, expectedBand, 'test setup requires a stale band');

  applyReanchor(staleRecord, {
    state: {
      epoch_tdb_jd: original.anchor.epochTdbJd,
      position_km: [...original.anchor.positionKm],
      velocity_km_per_s: [...original.anchor.velocityKmPerS],
    },
  });

  assert.equal(staleRecord.anchorSource, 'horizons-reanchor');
  assert.equal(staleRecord.reanchorEpochTdbJd, original.anchor.epochTdbJd);
  assert.equal(staleRecord.eccentricityBand, eccentricityBandForBody(staleRecord.elements.e));
  assert.equal(staleRecord.eccentricityBand, 'C');
  assert.equal(staleRecord.qualityRank, qualityRankForRecord(staleRecord));
  assert.equal(
    staleRecord.estimatedRadiusM,
    deriveAsteroidRadiusMFromAbsoluteMagnitude(staleRecord.H),
  );
});
