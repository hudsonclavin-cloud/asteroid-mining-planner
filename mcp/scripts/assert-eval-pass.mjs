// CI gate for the MCP eval. eval/run-eval.ts records failing pairs in its report but exits 0,
// so CI reads the report. --fresh also rejects a report older than 30 minutes: without it, a
// run that never rewrote the report would be graded on the committed copy.
// Usage: node mcp/scripts/assert-eval-pass.mjs <eval-report.json> [--fresh]
import { readFileSync } from 'node:fs';

const [reportPath, flag] = process.argv.slice(2);
if (!reportPath || (flag !== undefined && flag !== '--fresh')) {
  console.error('usage: node assert-eval-pass.mjs <eval-report.json> [--fresh]');
  process.exit(2);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const { totalPairs, passed, failed, generatedAt } = report;

if (flag === '--fresh') {
  const ageMs = Date.now() - Date.parse(generatedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 30 * 60 * 1000) {
    console.error(`MCP eval report is not from this run: generatedAt=${generatedAt}`);
    process.exit(1);
  }
}

if (!Number.isInteger(totalPairs) || totalPairs < 1 || passed !== totalPairs || failed !== 0) {
  console.error(`MCP eval FAILED: ${passed}/${totalPairs} passed, ${failed} failed`);
  for (const pair of report.pairs ?? []) {
    if (!pair.passed) console.error(`- ${pair.id}: ${pair.reason}`);
  }
  process.exit(1);
}

console.log(`MCP eval: ${passed}/${totalPairs} PASS (generatedAt ${generatedAt})`);
