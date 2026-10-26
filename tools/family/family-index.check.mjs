#!/usr/bin/env node
// Self-check for the generated family files: every row has a sha, a date, a command and a status;
// the "N of M answered" header equals the computed count; the landing page carries the same data.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'strategy', 'family');
const m = JSON.parse(readFileSync(join(OUT, 'MANIFEST.json'), 'utf8'));
const sheet = readFileSync(join(OUT, 'PROOF_SHEET.md'), 'utf8');
const page = readFileSync(join(OUT, 'site', 'index.html'), 'utf8');
let fails = 0; const fail = (s) => { fails++; console.error('FAIL ' + s); };
for (const r of m.rows) {
  if (!/^[0-9a-f]{7}$/.test(r.head)) fail(`row ${r.id}: head sha missing`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.checked_at)) fail(`row ${r.id}: date missing`);
  if (!r.command) fail(`row ${r.id}: command missing`);
  if (r.status === 'ANSWERED' ? !r.evidence : !(r.refusal && r.refusal.code && r.refusal.reason && r.refusal.what_would_help)) fail(`row ${r.id}: status incomplete`);
}
const required = m.rows.filter(r => !r.optional);
const n = required.filter(r => r.status === 'ANSWERED').length;
if (m.proof_sheet.answered !== n || m.proof_sheet.required !== required.length) fail('manifest proof_sheet counts disagree with rows');
if (!sheet.includes(`**${n} of ${required.length} answered**`)) fail('PROOF_SHEET.md header does not match the computed count');
if (!page.includes(`"answered":${n},"required":${required.length}`)) fail('site/index.html GENERATED block does not match the computed count');
for (const mem of m.members) { if (typeof mem.private !== 'boolean' || !mem.head) fail(`member ${mem.id}: facts incomplete`); if (!page.includes(`"head": "${mem.head}"`)) fail(`member ${mem.id}: page head sha stale`); }
console.log(fails ? `${fails} failure(s)` : `ok — ${n} of ${required.length} answered; ${m.members.length} members; ${m.rows.length} rows; page in sync`);
process.exit(fails ? 1 : 0);
