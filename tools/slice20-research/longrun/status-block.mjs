#!/usr/bin/env node
// Prints the S20_LONGRUN status block (lines 3-5 of the report) and a facts list straight from the
// committed summary files, so the top-level REPORT.md copies numbers instead of retyping them.
//
//   node tools/slice20-research/longrun/status-block.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (rel) => (fs.existsSync(path.join(here, rel)) ? JSON.parse(fs.readFileSync(path.join(here, rel), 'utf8')) : null);
const lr1 = read('lr1-oracle/lr1-summary.json');
const lr2 = read('lr2-symmetric/lr2-summary.json');
const lr3 = read('lr3-mutation/lr3-mutation.json');
const lr4 = read('lr4-repro/lr4-repro.json');
const e = (x) => x.toExponential(3);
const f = (x, d = 3) => x.toFixed(d);
const pct = (x) => `${(100 * x).toFixed(1)}%`;
const n = (x) => x.toLocaleString('en-US');
const out = [];

if (lr1) {
  const a = lr1.izzo.all;
  const vt = lr1.vallado.valladoTight.dVInfEarthArrivalKmS;
  const vd = lr1.vallado.valladoDefault.dVInfEarthArrivalKmS;
  const far = lr1.closure.all.farnocchiaMissKm;
  const wide = lr1.closureByTransferPerihelion.find((b) => b.band === 'q >= 0.1 AU');
  out.push(`LR1 ORACLE: ${n(lr1.recordCount)} converged branches compared (${n(lr1.recordCountByGroup['M=0 single'])} M=0 cells; ${n(lr1.recordCountByGroup['M=1 left'])} M=1 cells x 2 branches; 40 bodies) | max |Δv∞| izzo ${e(a.dVInfEarthArrivalKmS.max)} km/s · vallado(M=0) ${e(vt.max)} km/s tight, ${e(vd.max)} km/s at poliastro defaults · closure ${f(far.max)} km worst, ${e(wide.farnocchiaMissKm.max)} km where the transfer perihelion is >= 0.1 AU | no threshold set by the dispatch; numbers stated only; the closure tail is propagator-limited on near-rectilinear transfer orbits`);
} else out.push('LR1 ORACLE: not run');
if (lr2) {
  const p = lr2.primary.overall;
  out.push(`LR2 SYMMETRIC: ${n(lr2.bodiesDone)}/${n(lr2.catalogBodies)} bodies (${n(lr2.primary.measured)} measured) | median |error| ${f(p.medianAbs)} km/s · p90 ${f(p.p90Abs)} km/s · overcharge share ${pct(p.overchargeShare)} (compare-path best window; UNVALIDATED until LR1 passes review)`);
} else out.push('LR2 SYMMETRIC: not run');
if (lr3) {
  const c = lr3.counts;
  const survived = (c.survived ?? 0) + (c['not-executed-by-any-test'] ?? 0) + (c['no-test-imports-module'] ?? 0);
  out.push(`LR3 MUTATION: ${n(c.run)} of ${n(c.enumerated)} mutants run | killed ${n((c.killed ?? 0) + (c.timeout ?? 0))} | SURVIVED ${n(survived)} (${lr3.top5SurvivorFiles.map((x) => `${x.file.replace('src/v2/', '')} ${x.survived}`).join(', ')})`);
} else out.push('LR3 MUTATION: not run');

console.log(out.join('\n'));
console.log('\n--- facts ---');
if (lr1) {
  for (const [name, g] of Object.entries(lr1.izzo)) console.log(`LR1 izzo ${name}: n ${g.dVInfEarthArrivalKmS.n}, max |dvinfE| ${e(g.dVInfEarthArrivalKmS.max)}, rms ${e(g.dVInfEarthArrivalKmS.rms)}, max |dvinf ast-dep| ${e(g.dVInfAsteroidDepartureKmS.max)}, rms ${e(g.dVInfAsteroidDepartureKmS.rms)}`);
  for (const [key, g] of Object.entries(lr1.vallado)) console.log(`LR1 ${key}: solved ${g.dVInfEarthArrivalKmS.n}, errors ${lr1.errors[key].length}, max ${e(g.dVInfEarthArrivalKmS.max)}, rms ${e(g.dVInfEarthArrivalKmS.rms)}`);
  for (const b of lr1.closureByTransferPerihelion) console.log(`LR1 closure [${b.band}]: n ${b.n}, farnocchia max ${e(b.farnocchiaMissKm.max)} median ${e(b.farnocchiaMissKm.median)}, cowell max ${e(b.cowellMissKm.max)}, propagator disagreement max ${e(b.propagatorDisagreementKm.max)}`);
  console.log(`LR1 closure all: energy rel max ${e(lr1.closure.all.energyRelDiff.max)}, h rel max ${e(lr1.closure.all.angularMomentumRelDiff.max)}, cowell max ${e(lr1.closure.all.cowellMissKm.max)}`);
  console.log(`LR1 grid refused ${lr1.grid.refusedCellsEarthArrivalAfterFixtureEnd} of ${lr1.grid.totalCells}`);
}
if (lr2) {
  console.log(`LR2 state ${lr2.state}; status ${JSON.stringify(lr2.statusCounts)}`);
  for (const m of [lr2.primary, lr2.secondary]) {
    const o = m.overall;
    console.log(`LR2 ${m.label.split(' - ')[0]}: measured ${m.measured}, median |e| ${f(o.medianAbs)}, p10 ${f(o.p10Abs)}, p90 ${f(o.p90Abs)}, p99 ${f(o.p99Abs)}, max ${f(o.maxAbs)}, over ${pct(o.overchargeShare)}, under ${pct(o.underchargeShare)}, inside interim ${pct(o.withinInterimRange)}, above ${pct(o.aboveInterimRange)}, below ${pct(o.belowInterimRange)}`);
    for (const [k, d] of Object.entries(m.byReturnWindowRefusal)) console.log(`   [${k}] n ${d.n}, median |e| ${f(d.medianAbs)}, p90 ${f(d.p90Abs)}, p99 ${f(d.p99Abs)}, over ${pct(d.overchargeShare)}`);
    console.log(`   return cells ${m.returnCells.total}, refused ${m.returnCells.refusedEarthArrivalAfterFixtureEnd} (${pct(m.returnCells.refusedEarthArrivalAfterFixtureEnd / m.returnCells.total)}), noConv ${m.returnCells.noConvergence}; bodies any-refused ${m.bodies.anyReturnCellRefused}, all-refused ${m.bodies.allReturnCellsRefused}; L1 measured ${m.bodies.l1Measured}, chosen return after support ${m.bodies.chosenReturnDepartsAfterSupport}, outbound after support ${m.bodies.outboundArrivesAfterSupport}, L1 no supported cell ${m.bodies.l1WithNoSupportedReturnCell}`);
  }
}
if (lr3) {
  console.log(`LR3 state ${lr3.state}; counts ${JSON.stringify(lr3.counts)}`);
  for (const t of lr3.tierTable) console.log(`   tier ${t.tier} (${t.name}): ${t.run}/${t.mutants} run, killed ${t.killed} (compile ${t.killedByCompile}), timeout ${t.timeout}, survived ${t.survived}, never executed ${t.notExecuted}, never imported ${t.noImporter}`);
  console.log(`   pruning check: sampled ${lr3.pruningCheck.sampled}, still survived ${lr3.pruningCheck.stillSurvived}, killed without pruning ${lr3.pruningCheck.killedWithoutPruning.length}`);
  console.log(`   unexecuted functions: ${lr3.unexecutedFunctions.length}`);
}
if (lr4) console.log(`LR4: ${lr4.identical}/${lr4.trackedDocsFiles} identical, differing ${lr4.differing.length}, missing ${lr4.missingFromBuild.length}, only in build ${lr4.onlyInBuild.length}, emitted into outDir ${lr4.emittedIntoOutDir}`);
