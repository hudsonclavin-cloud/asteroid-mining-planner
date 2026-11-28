import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const [cellsPath, oraclePath, outputPath, builtCommit] = process.argv.slice(2);
if (!cellsPath || !oraclePath || !outputPath || !builtCommit) throw new Error('usage: node generate-return-pinned-cells.mjs <cells-json> <oracle-json> <output-json> <built-commit>');
const cells = JSON.parse(fs.readFileSync(cellsPath, 'utf8'));
const oracle = JSON.parse(fs.readFileSync(oraclePath, 'utf8'));
const scriptPath = fileURLToPath(import.meta.url);
const scriptSha256 = crypto.createHash('sha256').update(fs.readFileSync(scriptPath)).digest('hex');
const wanted = [
  ['433', 0, 'single'], ['433', 1, 'left'], ['433', 1, 'right'], ['433', 2, 'left'],
  ['99942', 0, 'single'], ['99942', 1, 'left'], ['99942', 1, 'right'], ['99942', 2, 'right'],
  ['101955', 0, 'single'], ['101955', 1, 'left'], ['101955', 2, 'left'], ['101955', 2, 'right'],
];
const sub = (a, b) => a.map((value, index) => value - b[index]);
const cases = wanted.map(([designation, M, branch]) => {
  const index = cells.cells.findIndex((cell) => cell.designation === designation && cell.M === M && cell.status === 'aster_result' && cell.asterBranches.some((candidate) => candidate.branch === branch && candidate.converged));
  if (index < 0) throw new Error(`no converged cell found for ${designation} M${M} ${branch}`);
  const cell = cells.cells[index];
  const z = oracle.results[index].izzo?.[branch];
  if (!z?.ok) throw new Error(`izzo did not converge for ${cell.id}`);
  return {
    id: cell.id,
    designation,
    depJD: cell.depJd,
    tofDays: cell.tofDays,
    M,
    branch,
    v1KmS: z.v1KmS,
    v2KmS: z.v2KmS,
    vInfEKmS: sub(z.v2KmS, cell.vEarth),
  };
});
const output = {
  schema: 'aster-s20-return-pinned-cells/1',
  generatedAtUtc: new Date().toISOString(),
  count: cases.length,
  selection: '12 cells: three bodies; each body includes M0 single and three additional branch cases. Across the set, M1 left/right and M2 left/right are all covered.',
  provenance: {
    oracle: 'poliastro izzo.lambert',
    izzoVersion: oracle.poliastro,
    python: oracle.python,
    node: process.version,
    host: os.hostname(),
    builtCommit,
    sourceInput: 'tools/slice20-research/front-b-oracle/summary.json',
    generator: path.relative(process.cwd(), scriptPath),
    scriptSha256,
  },
  cases,
};
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputPath, count: output.count, scriptSha256, builtCommit }, null, 2));
