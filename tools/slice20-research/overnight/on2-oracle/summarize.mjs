import fs from 'node:fs';
import path from 'node:path';

const [cellsPath, oraclePath, lr1Path, outputPath, datasetPath] = process.argv.slice(2);
if (!cellsPath || !oraclePath || !lr1Path || !outputPath || !datasetPath) throw new Error('usage: node summarize.mjs <cells> <oracle> <lr1> <summary> <dataset-jsonl>');
const cells = JSON.parse(fs.readFileSync(cellsPath, 'utf8'));
const oracle = JSON.parse(fs.readFileSync(oraclePath, 'utf8'));
const lr1 = JSON.parse(fs.readFileSync(lr1Path, 'utf8'));
if (cells.cells.length !== oracle.results.length) throw new Error('cell/oracle record count mismatch');
const norm = (v) => Math.hypot(v[0], v[1], v[2]);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const p95 = (values) => { const a = values.slice().sort((x, y) => x - y); if (!a.length) return null; const p = (a.length - 1) * 0.95; const lo = Math.floor(p); const hi = Math.ceil(p); return a[lo] + (a[hi] - a[lo]) * (p - lo); };
const median = (values) => { const a = values.slice().sort((x, y) => x - y); if (!a.length) return null; const m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const stats = {};
const existence = { M0: { single: { both: 0, asterOnly: 0, izzoOnly: 0, neither: 0 } }, M1: {}, M2: {} };
const disagreements = [];
const datasetLines = [];
const closure = {};
const allClosure = [];
const vallado = { default: [], tight: [] };
const addStat = (m, branch, key, value) => { const id = `M${m}/${branch}/${key}`; (stats[id] ??= []).push(value); };
function passesPerihelion(r, v, mu, tof, perihelionKm) {
  if (!(perihelionKm > 0) || !(tof > 0)) return false;
  const rMag = norm(r); const v2 = norm(v) ** 2; const energy = 0.5 * v2 - mu / rMag; const h = [r[1] * v[2] - r[2] * v[1], r[2] * v[0] - r[0] * v[2], r[0] * v[1] - r[1] * v[0]];
  if (energy >= 0) return (r[0] * v[0] + r[1] * v[1] + r[2] * v[2]) < 0;
  const a = -mu / (2 * energy); const e = Math.sqrt(Math.max(0, 1 + 2 * energy * norm(h) ** 2 / mu ** 2));
  if (!(a > 0) || !(e < 1)) return false;
  const ev = [((v2 - mu / rMag) * r[0] - (r[0] * v[0] + r[1] * v[1] + r[2] * v[2]) * v[0]) / mu, ((v2 - mu / rMag) * r[1] - (r[0] * v[0] + r[1] * v[1] + r[2] * v[2]) * v[1]) / mu, ((v2 - mu / rMag) * r[2] - (r[0] * v[0] + r[1] * v[1] + r[2] * v[2]) * v[2]) / mu];
  const cosF = Math.max(-1, Math.min(1, (ev[0] * r[0] + ev[1] * r[1] + ev[2] * r[2]) / Math.max(e * rMag, 1e-300)));
  const sinF = e > 0 ? (h[0] * (ev[1] * r[2] - ev[2] * r[1]) + h[1] * (ev[2] * r[0] - ev[0] * r[2]) + h[2] * (ev[0] * r[1] - ev[1] * r[0])) / Math.max(norm(h) * e * rMag, 1e-300) : 0;
  const E0 = Math.atan2(Math.sqrt(1 - e * e) * sinF, e + cosF); const M0 = E0 - e * Math.sin(E0); const n = Math.sqrt(cells.muSunKm3S2 / a ** 3); return Math.floor((M0 + n * tof) / (2 * Math.PI)) > Math.floor(M0 / (2 * Math.PI));
}
for (let index = 0; index < cells.cells.length; index += 1) {
  const rec = cells.cells[index]; const out = oracle.results[index];
  if (rec.status === 'refused_earth' || rec.status === 'asteroid_propagation_refused') continue;
  const branches = rec.M === 0 ? ['single'] : ['left', 'right'];
  if (rec.M > 0) { existence[`M${rec.M}`].left ??= { both: 0, asterOnly: 0, izzoOnly: 0, neither: 0 }; existence[`M${rec.M}`].right ??= { both: 0, asterOnly: 0, izzoOnly: 0, neither: 0 }; }
  const asterMap = new Map((rec.asterBranches ?? []).map((b) => [b.branch, b]));
  const lines = { id: rec.id, status: rec.status, M: rec.M, designation: rec.designation, depJd: rec.depJd, tofDays: rec.tofDays, branches: {} };
  for (const branch of branches) {
    const a = asterMap.get(branch); const asterOk = Boolean(a?.converged); const z = out.izzo?.[branch]; const izzoOk = Boolean(z?.ok); const category = asterOk && izzoOk ? 'both' : asterOk ? 'asterOnly' : izzoOk ? 'izzoOnly' : 'neither';
    existence[`M${rec.M}`][branch][category] += 1;
    const d = { category, asterConverged: asterOk, izzoConverged: izzoOk };
    if (asterOk && izzoOk) {
      const aV1 = a.v1; const aV2 = a.v2; const zV1 = z.v1KmS; const zV2 = z.v2KmS;
      const dV1 = norm(sub(aV1, zV1)); const dV2 = norm(sub(aV2, zV2)); const dDep = norm(sub(sub(aV1, rec.vAsteroid), sub(zV1, rec.vAsteroid))); const dArr = norm(sub(sub(aV2, rec.vEarth), sub(zV2, rec.vEarth)));
      d.dv1KmS = dV1; d.dv2KmS = dV2; d.dvInfDepKmS = dDep; d.dvInfArrKmS = dArr;
      for (const [key, value] of [['dv1', dV1], ['dv2', dV2], ['dvInfDep', dDep], ['dvInfArr', dArr]]) addStat(rec.M, branch, key, value);
    }
    lines.branches[branch] = d;
    if (category === 'asterOnly' || category === 'izzoOnly') disagreements.push({ id: rec.id, branch, M: rec.M, depJd: rec.depJd, tofDays: rec.tofDays, T: rec.tmin?.T ?? null, TMin: rec.tmin?.TMin ?? null, normalizedMargin: rec.tmin?.normalizedMargin ?? null, category });
  }
  for (const c of out.closures ?? []) {
    const a = asterMap.get(c.branch); if (!a?.converged || c.error) continue;
    const pass = passesPerihelion(rec.r1, a.v1, cells.muSunKm3S2, rec.tofDays * 86400, c.perihelionKm);
    const item = { id: rec.id, branch: c.branch, M: rec.M, perihelionKm: c.perihelionKm, perihelionAu: c.perihelionKm / 149597870.7, passesPerihelion: pass, missKm: c.missKm, energyRelDiff: c.energyRelDiff, angularMomentumRelDiff: c.angularMomentumRelDiff };
    allClosure.push(item); (closure[`M${rec.M}`] ??= []).push(item);
  }
  if (rec.M === 0 && out.vallado_tight) { const a = asterMap.get('single'); for (const name of ['default', 'tight']) { const v = out[`vallado_${name}`]; if (v?.ok && a?.converged) { vallado[name].push(norm(sub(sub(a.v2, rec.vEarth), sub(v.v2KmS, rec.vEarth)))); } } }
  datasetLines.push(JSON.stringify({ id: rec.id, M: rec.M, designation: rec.designation, depJd: rec.depJd, tofDays: rec.tofDays, status: rec.status, branches: lines.branches, closure: (out.closures ?? []).map((c) => ({ branch: c.branch, missKm: c.missKm, perihelionKm: c.perihelionKm })) }));
}
const numericStats = Object.fromEntries(Object.entries(stats).map(([key, values]) => [key, { count: values.length, max: values.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY), p95: p95(values), median: median(values) }]));
const closureSummary = Object.fromEntries(Object.entries(closure).map(([m, values]) => {
  const bins = { lt0_1Au: values.filter((v) => v.perihelionAu < 0.1), ge0_1Au: values.filter((v) => v.perihelionAu >= 0.1), sunGrazingPass: values.filter((v) => v.perihelionKm < 695700 && v.passesPerihelion) };
  const summarize = (xs) => ({
    count: xs.length,
    maxMissKm: xs.length ? xs.reduce((a, b) => Math.max(a, b.missKm), 0) : null,
    p95MissKm: p95(xs.map((v) => v.missKm)),
    medianMissKm: median(xs.map((v) => v.missKm)),
    maxEnergyRelDiff: xs.length ? xs.reduce((a, b) => Math.max(a, b.energyRelDiff), 0) : null,
    p95EnergyRelDiff: p95(xs.map((v) => v.energyRelDiff)),
    medianEnergyRelDiff: median(xs.map((v) => v.energyRelDiff)),
    maxAngularMomentumRelDiff: xs.length ? xs.reduce((a, b) => Math.max(a, b.angularMomentumRelDiff), 0) : null,
    p95AngularMomentumRelDiff: p95(xs.map((v) => v.angularMomentumRelDiff)),
    medianAngularMomentumRelDiff: median(xs.map((v) => v.angularMomentumRelDiff)),
  });
  return [m, { count: values.length, bins: { lt0_1Au: summarize(bins.lt0_1Au), ge0_1Au: summarize(bins.ge0_1Au), sunGrazingPass: summarize(bins.sunGrazingPass) }, sunGrazingShare: values.length ? bins.sunGrazingPass.length / values.length : null }];
}));
const maxByM = Object.fromEntries([0, 1, 2].map((m) => [
  `M${m}`,
  Math.max(...Object.entries(numericStats).filter(([key]) => key.startsWith(`M${m}/`) && key.endsWith('/dvInfArr')).map(([, value]) => value.max), 0),
]));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ schema: 'aster-s20-overnight-on2-summary/1', generatedAtUtc: new Date().toISOString(), grid: cells.grid, selection: cells.selection, cellStats: cells.stats, existence, existenceDisagreements: disagreements, vectorStats: numericStats, maxDvInfArrByM: maxByM, valladoM0: { default: { count: vallado.default.length, maxDvInfArrKmS: vallado.default.reduce((a, b) => Math.max(a, b), 0) }, tight: { count: vallado.tight.length, maxDvInfArrKmS: vallado.tight.reduce((a, b) => Math.max(a, b), 0) } }, closure: closureSummary, closureTotal: allClosure.length, lr1, oracle: { python: oracle.python, poliastro: oracle.poliastro, wallSeconds: oracle.wallSeconds, selfTest: oracle.selfTest } }, null, 2)}\n`, 'utf8');
fs.writeFileSync(datasetPath, `${datasetLines.join('\n')}\n`, 'utf8');
console.log(JSON.stringify({ outputPath, datasetPath, disagreements: disagreements.length, closureTotal: allClosure.length, existence }, null, 2));
