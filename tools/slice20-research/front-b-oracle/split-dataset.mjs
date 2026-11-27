import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const [inputPath, outputDir] = process.argv.slice(2);
if (!inputPath || !outputDir) throw new Error('usage: node split-dataset.mjs <jsonl> <output-dir>');
const cap = 8_000_000;
const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => `${line}\n`);
const groups = [];
let group = [];
let bytes = 0;
for (const line of lines) {
  const size = Buffer.byteLength(line);
  if (group.length && bytes + size > cap) {
    groups.push(group);
    group = [];
    bytes = 0;
  }
  group.push(line);
  bytes += size;
}
if (group.length) groups.push(group);
fs.mkdirSync(outputDir, { recursive: true });
for (const name of fs.readdirSync(outputDir)) {
  if (/^dataset\.part\d+of\d+\.jsonl\.gz$/.test(name)) fs.unlinkSync(path.join(outputDir, name));
}
for (const [index, part] of groups.entries()) {
  const outputPath = path.join(outputDir, `dataset.part${index + 1}of${groups.length}.jsonl.gz`);
  fs.writeFileSync(outputPath, zlib.gzipSync(Buffer.from(part.join(''), 'utf8'), { level: 9 }));
}
console.log(JSON.stringify({ inputPath, outputDir, records: lines.length, parts: groups.length, capBytes: cap }, null, 2));
