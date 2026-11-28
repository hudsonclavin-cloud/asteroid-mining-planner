import fs from 'node:fs';

const [inputPath, commit] = process.argv.slice(2);
if (!inputPath || !commit) throw new Error('usage: node stamp-w6-input.mjs <cells-json> <commit>');
const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
payload.headCommit = commit;
fs.writeFileSync(inputPath, `${JSON.stringify(payload)}\n`, 'utf8');
console.log(JSON.stringify({ inputPath, headCommit: payload.headCommit, cells: payload.cells.length }));
