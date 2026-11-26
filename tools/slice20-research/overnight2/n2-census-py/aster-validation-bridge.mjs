import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [buildDir, repoRoot, outputPath] = process.argv.slice(2);
if (!buildDir || !repoRoot || !outputPath) throw new Error('usage: node bridge.mjs <build-dir> <repo-root> <output-json>');
const [{ propagateKeplerianStateVectors }, { ingestSlice9Fixture }] = await Promise.all([
  import(pathToFileURL(path.join(buildDir, 'core/propagators/keplerian.js')).href),
  import(pathToFileURL(path.join(buildDir, 'boundary/slice9-nea-catalog.js')).href),
]);
const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/fixtures/v2/nea-catalog-slice9.json'), 'utf8'));
const bodies = Object.values(ingestSlice9Fixture(fixture).asteroids);
const depStartJd = 2461041.500800741;
const depEndJd = 2466154.500800741;
const cases = Array.from({ length: 20 }, (_, index) => {
  const bodyIndex = (index * 7919 + 17) % bodies.length;
  const fraction = (index * 0.6180339887498949 + 0.137) % 1;
  return { index, bodyIndex, designation: bodies[bodyIndex].designation, jdTdb: depStartJd + (depEndJd - depStartJd) * fraction };
});
const states = cases.map((item) => {
  const state = propagateKeplerianStateVectors(bodies[item.bodyIndex].elements, (item.jdTdb - 2451545) * 86400);
  return { ...item, positionKm: [state.positionM.x / 1000, state.positionM.y / 1000, state.positionM.z / 1000], velocityKmS: [state.velocityMps.x / 1000, state.velocityMps.y / 1000, state.velocityMps.z / 1000] };
});
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ schema: 'aster-s20-overnight2-n2-aster-validation/1', node: process.version, states }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ cases: states.length, node: process.version, outputPath }, null, 2));
