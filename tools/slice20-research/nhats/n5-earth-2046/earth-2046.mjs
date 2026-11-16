#!/usr/bin/env node
// N5 EARTH PAST 2040 - evidence for the Slice 21 charter. Read-only toward the fixture: nothing is created,
// extended or edited. Pulls Earth's daily heliocentric state vectors 2040-01-01 .. 2046-01-01 from Horizons in
// the fixture's frame (ICRF, equatorial: REF_PLANE FRAME), centre (Sun body centre 500@10 = the fixture's
// targets.earth.center '@sun'), units (km, km/s) and time scale (TDB), and compares the 2040 overlap with
// src/v2/data/horizons-inner-solar-system-2026-2040.json targets.earth.records.
//   NHATS_STORE=<store> node tools/slice20-research/nhats/n5-earth-2046/earth-2046.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRoot, FILES, sha256File, writeJsonAtomic } from '../lib/aster.mjs';
import { get } from '../lib/jpl.mjs';
import { horizonsSpanUrl, parseHorizonsVectors } from '../lib/apis.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(repoRoot, FILES.earth);
const fixtureShaBefore = sha256File(fixturePath);
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const earth = fixture.targets.earth;
const url = horizonsSpanUrl('399', '2040-01-01', '2046-01-01', '1 d');
const r = await get(url, { label: 'n5-horizons-earth-2040-2046' });
const p = parseHorizonsVectors(r.body);
const byJd = new Map(earth.records.map((x) => [x[0].toFixed(6), x]));
const overlap = [];
for (const row of p.rows) {
  const f = byJd.get(row.jd.toFixed(6));
  if (!f) continue;
  const dr = [row.r[0] - f[1], row.r[1] - f[2], row.r[2] - f[3]];
  const dv = [row.v[0] - f[4], row.v[1] - f[5], row.v[2] - f[6]];
  overlap.push({ jd: row.jd, dPosKm: Math.hypot(...dr), dVelKmS: Math.hypot(...dv), maxComponentPosKm: Math.max(...dr.map(Math.abs)), maxComponentVelKmS: Math.max(...dv.map(Math.abs)) });
}
const max = (k) => overlap.reduce((m, x) => Math.max(m, x[k]), 0);
const step = p.rows.slice(1).map((x, i) => x.jd - p.rows[i].jd);
const fixtureShaAfter = sha256File(fixturePath);
const result = {
  schema: 'aster-s20-nhats-n5-earth-2046/1', generatedAtUtc: new Date().toISOString(),
  request: { url, file: r.file, sha256: r.sha256, bytes: Buffer.byteLength(r.body) },
  // Horizons prints no 'Reference plane' line for REF_PLANE=FRAME (the ICRF equatorial axes); the frame identity is
  // shown by the overlap below, not by the header.
  horizonsHeader: { lines: p.header.split('\n').filter((l) => /^(Target body name|Center body name|Center-site name|Start time|Stop  time|Output units|Output type|Output format|Reference frame|Reference plane)/.test(l)).map((l) => l.trim().replace(/\s{2,}/g, '  ')) },
  fixture: { path: FILES.earth, frame: fixture.frame, timeScale: fixture.timeScale, units: fixture.units, earthTargetId: earth.targetId, earthCenter: earth.center, earthOrigin: earth.origin, records: earth.records.length, firstJd: earth.records[0][0], lastJd: earth.records[earth.records.length - 1][0], sha256Before: fixtureShaBefore, sha256After: fixtureShaAfter, unchanged: fixtureShaBefore === fixtureShaAfter },
  horizonsSeries: { rows: p.rows.length, firstJd: p.rows[0].jd, firstCalendar: p.rows[0].calendar, lastJd: p.rows[p.rows.length - 1].jd, lastCalendar: p.rows[p.rows.length - 1].calendar, stepDays: { min: Math.min(...step), max: Math.max(...step) }, rowsPastFixtureEnd: p.rows.filter((x) => x.jd > earth.records[earth.records.length - 1][0]).length },
  overlap2040: { days: overlap.length, firstJd: overlap[0]?.jd ?? null, lastJd: overlap[overlap.length - 1]?.jd ?? null, maxAbsPositionDiffKm: max('dPosKm'), maxAbsVelocityDiffKmS: max('dVelKmS'), maxAbsPositionComponentDiffKm: max('maxComponentPosKm'), maxAbsVelocityComponentDiffKmS: max('maxComponentVelKmS'), bitIdenticalDays: overlap.filter((x) => x.dPosKm === 0 && x.dVelKmS === 0).length },
  note: 'The raw Horizons response is saved (gzipped) under raw/ with its sha256 in manifest.ndjson. No fixture was created, extended or edited.',
};
writeJsonAtomic(path.join(here, 'n5-earth-2046.json'), result);
console.log(JSON.stringify(result, null, 1));
