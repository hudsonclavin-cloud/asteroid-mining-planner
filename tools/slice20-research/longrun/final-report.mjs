#!/usr/bin/env node
// Builds the top-level S20_LONGRUN REPORT.md. Every number is read from the committed summary files
// (lr1-summary.json, lr2-summary.json, lr3-mutation.json, lr4-repro.json) or from the run-facts file
// given on the command line; the prose is in this script.
//
//   node final-report.mjs <run-facts.json> <out REPORT.md>
//
// run-facts.json (written by the operator of the run, from command output):
//   { longrun, commits: [{sha, subject}], tipBeforeFinal, verifyBaseline, verifyFinal, lr2Wall, lr3Clock,
//     scopesMarkdown, bundle }
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [factsPath, outPath] = process.argv.slice(2);
const facts = JSON.parse(fs.readFileSync(factsPath, 'utf8'));
const read = (rel) => JSON.parse(fs.readFileSync(path.join(here, rel), 'utf8'));
const lr1 = read('lr1-oracle/lr1-summary.json');
const lr2 = read('lr2-symmetric/lr2-summary.json');
const lr3 = read('lr3-mutation/lr3-mutation.json');
const lr4 = read('lr4-repro/lr4-repro.json');
const notes = read('lr3-mutation/survivor-notes.json');

const e = (x) => x.toExponential(3);
const f = (x, d = 3) => x.toFixed(d);
const pct = (x, d = 1) => `${(100 * x).toFixed(d)}%`;
const n = (x) => x.toLocaleString('en-US');
const L = [];
const row = (cols) => L.push(`| ${cols.join(' | ')} |`);

// ---- status block (first five lines) -----------------------------------------------------------
const izzoAll = lr1.izzo.all;
const vt = lr1.vallado.valladoTight;
const vd = lr1.vallado.valladoDefault;
const wide = lr1.closureByTransferPerihelion.find((b) => b.band === 'q >= 0.1 AU');
const inside = lr1.closureByTransferPerihelion[0];
const p = lr2.primary.overall;
const s2 = lr2.secondary.overall;
const c = lr3.counts;
const lr3Killed = (c.killed ?? 0) + (c.timeout ?? 0);
const lr3Survived = (c.survived ?? 0) + (c['not-executed-by-any-test'] ?? 0) + (c['no-test-imports-module'] ?? 0);
L.push(`LONGRUN: ${facts.longrun}`);
L.push(`COMMITS: ${facts.commits.length} on s20-longrun-research before the commit that adds this file, tip ${facts.tipBeforeFinal} (a file cannot contain the hash of its own commit; the final tip is in the chat summary and in git log)`);
L.push(`LR1 ORACLE: ${n(lr1.recordCount)} converged branches compared (${n(lr1.recordCountByGroup['M=0 single'])} M=0 cells and ${n(lr1.recordCountByGroup['M=1 left'])} M=1 cells x 2 branches, 40 bodies) | max |Δv∞| izzo ${e(izzoAll.dVInfEarthArrivalKmS.max)} km/s · vallado(M=0) ${e(vt.dVInfEarthArrivalKmS.max)} km/s tight, ${e(vd.dVInfEarthArrivalKmS.max)} km/s at poliastro defaults · closure ${f(lr1.closure.all.farnocchiaMissKm.max)} km worst, ${e(wide.farnocchiaMissKm.max)} km where the transfer perihelion is >= 0.1 AU | no threshold was set, numbers only; the closure tail is propagator-limited on near-rectilinear transfer orbits`);
L.push(`LR2 SYMMETRIC: ${n(lr2.bodiesDone)}/${n(lr2.catalogBodies)} bodies, ${n(lr2.primary.measured)} measured | median |error| ${f(p.medianAbs)} km/s · p90 ${f(p.p90Abs)} km/s · overcharge share ${pct(p.overchargeShare)} (at the compare-path best window; UNVALIDATED until LR1 passes review)`);
L.push(`LR3 MUTATION: ${n(c.run)} of ${n(c.enumerated)} mutants run | killed ${n(lr3Killed)} | SURVIVED ${n(lr3Survived)} (${lr3.top5SurvivorFiles.map((x) => `${x.file.replace('src/v2/', '')} ${x.survived}`).join(', ')})`);
L.push('');
L.push('# S20_LONGRUN final report');
L.push('');
L.push('Everything below is LEADS-grade research evidence. **No LR2 or LR3 number is validated.** Nothing here enters a DEC, a test or the site.');
L.push('');

// ---- 0. environment ----------------------------------------------------------------------------
L.push('## 0. Read first: this did not run where the dispatch says');
L.push('');
L.push('- **Cloud container, not the laptop.** Linux x64, Node v22.23.4, 4 cores, 15 GB. The dispatch says "Run in CLAUDE CODE on Hudson\'s laptop" and STATUS.md names the Windows checkout as canonical, so tripwire (a) "pwd wrong" fired by the letter at Phase 0. Hudson waived it in-session on 2026-11-14 with three answers: run here with paths adapted; create the poliastro venv here; deliver by git bundle with no push.');
L.push('- **Paths.** Worktree `<session scratchpad>/aster-longrun` on branch `s20-longrun-research` off origin/main `0d31cda`; scratch `<session scratchpad>/aster-longrun-scratch`; LR4 clone `aster-clean`; LR3 throwaway copies `aster-mutants/w0..w3`. The canonical tree at `C:\\Users\\hudso\\asteroid-mining-planner` does not exist in this container and was not touched. The container\'s own clone (`/home/user/asteroid-mining-planner`) had no file edited; its `.git` holds the worktree\'s commits.');
L.push('- **One agent, zero sub-agents, zero workflows.** The session had a standing multi-agent mode switched on. The dispatch and AGENTS.md §2.1.7 forbid it, so it was not used. Long computations ran as background processes.');
L.push('- **No push, no merge, no ASTER_* override, no package added to package.json.** Every staged path is under `tools/slice20-research/longrun/`. Each commit used an exact-path `.dispatch-scope` (contents pasted in section 8) and the scope file was restored afterwards.');
L.push('- **Installed outside the repo:** a Python 3.12.3 venv at `~/.aster-slice11-venv` with poliastro 0.17.0, astropy 5.3.4, numpy 1.26.4, scipy 1.17.1, numba 0.68.1. pip refused poliastro 0.17.0 on Python 3.12 (`Requires-Python <3.11`); it was installed with `--ignore-requires-python`, which is how the same pins can exist on the laptop\'s Python 3.12.10 (S20_01 R6).');
L.push('- **What does not transfer to the laptop without a re-run:** LR3 (test behaviour) and LR4 (build output) were measured on Node 22; the laptop runs Node 24. LR1 and LR2 are IEEE-754 arithmetic on the same inputs, but they too were measured here, not there.');
L.push('- **Commit messages** carry one trailer line (`Claude-Session: ...`) after the dispatch\'s subject line.');
L.push('');
L.push('Where this run went beyond or beside the dispatch text (each is also labelled where it appears):');
L.push('1. LR1 adds a second closure propagator (cowell), a tightened vallado setting next to the default one, and the transfer orbit\'s eccentricity and perihelion per cell.');
L.push('2. LR2 adds a secondary window per body (the best sample-return ΔV stack cell). The dispatch asks only for the compare-path window.');
L.push('3. LR3 mutates module-private helpers as well as exported functions (separate tiers), and chooses tests by measured function coverage on top of the import graph.');
L.push('4. LR4 could not send four files to the scratch outDir: the build config hard-codes their destination.');
L.push('');

// ---- LR0 ---------------------------------------------------------------------------------------
L.push('## 1. LR0 — Phase 0');
L.push('');
row(['Item', 'Value']);
row(['---', '---']);
row(['pwd (container clone)', '`/home/user/asteroid-mining-planner`']);
row(['remote', '`https://github.com/hudsonclavin-cloud/asteroid-mining-planner`']);
row(['origin/main', '`0d31cda3d1dca81d29f45092be26b94bb44294c1`']);
row(['worktree / branch', '`<scratchpad>/aster-longrun` / `s20-longrun-research`']);
row(['free disk at start', '30 GB (tripwire (e) floor 5 GB; lowest seen 25 GB)']);
row(['node / npm', 'v22.23.4 / 10.9.9']);
row(['python', '3.13.18 system; 3.12.3 used for the venv']);
row(['poliastro venv at start', 'ABSENT; created after Hudson\'s answer; `import poliastro` prints 0.17.0']);
row(['`npm run verify` baseline', `exit 0 — ${facts.verifyBaseline.files}/${facts.verifyBaseline.files} files, ${facts.verifyBaseline.tests} tests passed, ${facts.verifyBaseline.failed} failed`]);
row(['`npm run verify` after the run', facts.verifyFinal ? `exit ${facts.verifyFinal.exit} — ${facts.verifyFinal.filesPassed}/${facts.verifyFinal.files} files, ${facts.verifyFinal.tests} tests passed, ${facts.verifyFinal.failed} failed` : 'not run']);
row(['Founding doc', '`src/v2/SLICE_20_FOUNDING.md`: §9.1 lock record dated 2026-11-04 present; its line 3 still reads "STATUS: DRAFT — not locked"']);
L.push('');

// ---- LR1 ---------------------------------------------------------------------------------------
L.push('## 2. LR1 — K1 oracle dataset');
L.push('');
L.push(`**What ran.** 40 bodies (seed ${lr1.seed}; ${Object.entries(lr1.sampling.tierCount).map(([k, v]) => `${v} ${k}`).join(', ')}; all six named bodies present, 2000 SG344 included). 150 return cells per body from the ${lr1.grid.nDep}x${lr1.grid.nTof} return grid, M=0 and M=1. Aster side: the unedited \`computePorkchopGrid\` with swapped providers, one cell at a time, v∞ vectors recomputed. Oracle side: a new poliastro driver that writes only where its two arguments point.`);
L.push('');
L.push(`**How much.** ${n(lr1.recordCount)} converged branches compared: ${n(lr1.recordCountByGroup['M=0 single'])} at M=0 (every sampled cell converged), ${n(lr1.recordCountByGroup['M=1 left'])} M=1 cells with both branches. Refused before sampling (Earth arrival after ${lr1.grid.earthFixtureLastDateTdb}): **${n(lr1.grid.refusedCellsEarthArrivalAfterFixtureEnd)} of ${n(lr1.grid.totalCells)}** grid cells, the same count S20_01 R1 reports. The kernel's own |v∞| equals the recomputed vector's norm exactly on every branch (${lr1.kernelCheck.kernelMagnitudeVsRecomputedVectorMismatches} mismatches).`);
L.push('');
row(['Check', 'n', 'max', 'RMS', 'Note']);
row(['---', '---:', '---:', '---:', '---']);
row(['(a) izzo, \\|Δv∞,E\\| km/s', n(izzoAll.dVInfEarthArrivalKmS.n), e(izzoAll.dVInfEarthArrivalKmS.max), e(izzoAll.dVInfEarthArrivalKmS.rms), `0 solver errors; branch mapping fixed before comparing`]);
row(['(a) izzo, \\|Δv∞,asteroid-departure\\| km/s', n(izzoAll.dVInfAsteroidDepartureKmS.n), e(izzoAll.dVInfAsteroidDepartureKmS.max), e(izzoAll.dVInfAsteroidDepartureKmS.rms), '']);
row(['(b) vallado M=0, poliastro defaults', n(vd.dVInfEarthArrivalKmS.n), e(vd.dVInfEarthArrivalKmS.max), e(vd.dVInfEarthArrivalKmS.rms), `${lr1.errors.valladoDefault.length} cells: "Maximum number of iterations reached"`]);
row(['(b) vallado M=0, numiter 200 / rtol 1e-12', n(vt.dVInfEarthArrivalKmS.n), e(vt.dVInfEarthArrivalKmS.max), e(vt.dVInfEarthArrivalKmS.rms), `${lr1.errors.valladoTight.length} cells: same error`]);
row(['(c) closure miss km, farnocchia, all cells', n(lr1.closure.all.farnocchiaMissKm.n), e(lr1.closure.all.farnocchiaMissKm.max), e(lr1.closure.all.farnocchiaMissKm.rms), `median ${e(lr1.closure.all.farnocchiaMissKm.median)}`]);
row(['(c) closure miss km, farnocchia, transfer perihelion >= 0.1 AU', n(wide.n), e(wide.farnocchiaMissKm.max), e(wide.farnocchiaMissKm.rms), `median ${e(wide.farnocchiaMissKm.median)}`]);
row(['(c) closure miss km, cowell rtol 1e-13, all cells', n(lr1.closure.all.cowellMissKm.n), e(lr1.closure.all.cowellMissKm.max), e(lr1.closure.all.cowellMissKm.rms), '']);
row(['(c) \\|ΔE\\|/\\|E\\| between Aster\'s endpoint states', n(lr1.closure.all.energyRelDiff.n), e(lr1.closure.all.energyRelDiff.max), e(lr1.closure.all.energyRelDiff.rms), '']);
row(['(c) \\|Δh\\|/\\|h\\| between Aster\'s endpoint states', n(lr1.closure.all.angularMomentumRelDiff.n), e(lr1.closure.all.angularMomentumRelDiff.max), e(lr1.closure.all.angularMomentumRelDiff.rms), '']);
L.push('');
L.push(`**Outliers.** Agreement with izzo has none worth the name: the worst cell is ${e(izzoAll.dVInfEarthArrivalKmS.max)} km/s. The closure check does. Its largest misses (${f(lr1.closure.all.farnocchiaMissKm.max)} km analytic, ${f(lr1.closure.all.cowellMissKm.max, 1)} km numerical) all sit on cells whose transfer orbit is near-rectilinear, with its perihelion inside the Sun. On those cells the two poliastro propagators land up to ${f(lr1.propagatorDisagreementKm.max, 1)} km from each other, so the miss measures the propagators there, not Aster; energy and angular momentum between Aster's own endpoint states still agree to ${e(lr1.closure.all.energyRelDiff.max)} and ${e(lr1.closure.all.angularMomentumRelDiff.max)}. Every listed cell is in lr1-oracle/REPORT.md.`);
L.push('');
L.push(`A side finding from the same column: **${inside.n} of ${n(lr1.recordCount)} sampled converged branches (${pct(inside.n / lr1.recordCount, 2)}) fly an arc that passes inside the Sun** (transfer perihelion under one solar radius and the flown arc passes perihelion; ${inside.byGroup.M0} at M=0, ${inside.byGroup.M1left + inside.byGroup.M1right} at M=1). The kernel has no perihelion check and reports them as converged. None competes for a minimum in this sample: the smallest asteroid-departure |v∞| among them is ${f(inside.minVInfAsteroidDepartureKmS)} km/s.`);
L.push('');
L.push('**Needs Nova\'s ruling.**');
L.push(`1. DEC-20-9(c) asks for closure "within tolerance". One number will not fit every cell: ${e(wide.farnocchiaMissKm.max)} km covers every sampled cell with transfer perihelion >= 0.1 AU, while the near-rectilinear cells need a different propagator, an exclusion, or the energy/angular-momentum check instead.`);
L.push('2. Whether K1 should label or refuse cells whose arc passes inside the Sun. DEC-20-1\'s "not evaluated" list does not mention it.');
L.push(`3. Which vallado setting DEC-20-9(b) means. At poliastro's defaults the agreement is ${e(vd.dVInfEarthArrivalKmS.max)} km/s (its own rtol 1e-8); tightened it is ${e(vt.dVInfEarthArrivalKmS.max)} km/s. Either way vallado fails to converge on a few ordinary cells (${lr1.errors.valladoDefault.length} and ${lr1.errors.valladoTight.length} of 6,000).`);
L.push('4. M=2 was not sampled (the dispatch asks for M=0 and M=1; DEC-20-9 names M=0, 1, 2).');
L.push('5. Whether oracle evidence produced in a cloud container is admissible for DEC-20-9, or the three scripts should be re-run on the laptop (nothing in them is OS-specific).');
L.push('');

// ---- LR2 ---------------------------------------------------------------------------------------
const pc = lr2.primary.byReturnWindowRefusal['no return cell refused (complete window)'];
const sc = lr2.secondary.byReturnWindowRefusal['no return cell refused (complete window)'];
L.push('## 3. LR2 — catalog-wide symmetric-return error');
L.push('');
L.push('**UNVALIDATED until LR1 passes review.**');
L.push('');
L.push(`**What ran.** Gate first: the tools-only indexed Earth lookup against the production linear scan, 10,485 epochs (5,000 random, both endpoints, every sample epoch), max abs difference exactly 0. Then every catalog body in a seeded shuffle: the production \`computeCompareData\` for the outbound best window, the production \`departureDvFromVInf\` for the assumed burn, and the unedited kernel with swapped providers over the DEC-20-2 pairing window (723 x 100 cells, M=0) for the computed minimum asteroid-departure |v∞|. The worker reproduces all six S20_01 R3 rows at M=0 (one differs, 0.2427 against 0.2244 km/s, because DEC-20-2's 8-day minimum stay is now applied).`);
L.push('');
L.push(`**How much.** ${lr2.state}: ${n(lr2.bodiesDone)} of ${n(lr2.catalogBodies)} bodies, ${facts.lr2Wall}. Status: ${Object.entries(lr2.statusCounts).map(([k, v]) => `${k} ${n(v)}`).join('; ')}.`);
L.push('');
row(['Window', 'measured', 'median \\|error\\|', 'p10 / p90 / p99 \\|error\\|', 'overcharge / undercharge', 'inside 0.08-5.1 km/s', 'above 5.1']);
row(['---', '---:', '---:', '---:', '---:', '---:', '---:']);
row(['**Primary: compare-path best practical window (the dispatch procedure)**', n(lr2.primary.measured), f(p.medianAbs), `${f(p.p10Abs)} / ${f(p.p90Abs)} / ${f(p.p99Abs)}`, `${pct(p.overchargeShare)} / ${pct(p.underchargeShare)}`, pct(p.withinInterimRange), pct(p.aboveInterimRange)]);
row(['... complete pairing windows only (no refused cell)', n(pc.n), f(pc.medianAbs), `${f(pc.p10Abs)} / ${f(pc.p90Abs)} / ${f(pc.p99Abs)}`, `${pct(pc.overchargeShare)} / ${pct(pc.underchargeShare)}`, pct(pc.withinInterimRange), pct(pc.aboveInterimRange)]);
row(['Secondary: best sample-return stack cell (beyond the dispatch)', n(lr2.secondary.measured), f(s2.medianAbs), `${f(s2.p10Abs)} / ${f(s2.p90Abs)} / ${f(s2.p99Abs)}`, `${pct(s2.overchargeShare)} / ${pct(s2.underchargeShare)}`, pct(s2.withinInterimRange), pct(s2.aboveInterimRange)]);
row(['... complete pairing windows only', n(sc.n), f(sc.medianAbs), `${f(sc.p10Abs)} / ${f(sc.p90Abs)} / ${f(sc.p99Abs)}`, `${pct(sc.overchargeShare)} / ${pct(sc.underchargeShare)}`, pct(sc.withinInterimRange), pct(sc.aboveInterimRange)]);
L.push('');
L.push('error = assumed − computed, km/s; positive means the symmetric assumption overcharges. By tier and by orbit class: lr2-symmetric/REPORT.md.');
L.push('');
L.push(`**What the two rows say.** At the window compare recommends, the outbound arrival |v∞| is large (median ${f(lr2.primary.chosenReturn.medianAssumedKmS)} km/s, because compare ranks by departure C3 alone), while a return departure costing a median ${f(lr2.primary.chosenReturn.medianComputedKmS)} km/s exists inside the pairing window. So the assumption overcharges for ${pct(p.overchargeShare)} of bodies and the size is several km/s. At the window the sample-return stack itself would rank first, the assumed burn is small by construction (median ${f(lr2.secondary.chosenReturn.medianAssumedKmS)} km/s) and the error is under 1 km/s for most bodies, more often an undercharge. S20_01 R3 saw both behaviours in six rows; this is the same pattern at catalog scale.`);
L.push('');
L.push(`**Refusals, support, convergence (primary).** ${n(lr2.primary.returnCells.refusedEarthArrivalAfterFixtureEnd)} of ${n(lr2.primary.returnCells.total)} return cells refused under DEC-20-3 (${pct(lr2.primary.returnCells.refusedEarthArrivalAfterFixtureEnd / lr2.primary.returnCells.total)}); ${n(lr2.primary.bodies.anyReturnCellRefused)} bodies lose at least one cell and ${n(lr2.primary.bodies.allReturnCellsRefused)} lose all of them. Non-converged admissible cells: ${lr2.primary.returnCells.noConvergence} in total. Of ${n(lr2.primary.bodies.l1Measured)} measured L1 bodies, the chosen return departs at or after the support date for ${n(lr2.primary.bodies.chosenReturnDepartsAfterSupport)}, and ${n(lr2.primary.bodies.l1WithNoSupportedReturnCell)} have no supported converged return cell at all.`);
L.push('');
const overTop = lr2.extremes.primaryLargestOvercharge;
const underTop = lr2.extremes.primaryLargestUndercharge;
const classTally = (rows) => Object.entries(rows.reduce((acc, x) => ({ ...acc, [x.cls]: (acc[x.cls] ?? 0) + 1 }), {})).map(([k, v]) => `${v} ${k}`).join(', ');
const minRefused = Math.min(...underTop.map((x) => x.retRefused));
L.push(`**Outliers.** The ten largest overcharges run from ${f(overTop[overTop.length - 1].errorKmS)} to ${f(overTop[0].errorKmS)} km/s (orbit classes: ${classTally(overTop)}). The ten largest undercharges (${f(underTop[0].errorKmS)} to ${f(underTop[underTop.length - 1].errorKmS)} km/s) are an artefact: every one sits on a window where at least ${n(minRefused)} of 72,300 return cells were refused, so "computed" is the minimum of at most ${72300 - minRefused} cells. A refused cell cannot be the minimum, which pushes truncated windows toward undercharge; that is why the complete-window rows are shown separately. All forty extreme rows are in lr2-symmetric/REPORT.md.`);
L.push('');
L.push('**Needs Nova\'s ruling.**');
L.push(`1. Which window the DEC-20-7 interim disclosure should describe. Its "0.08-5.1 km/s" holds for ${pct(s2.withinInterimRange)} of bodies at the best-stack window and for ${pct(p.withinInterimRange)} at the compare-path best window, where ${pct(p.aboveInterimRange)} are above 5.1. The compare page itself is one-way and charges no return burn; the symmetric charge is applied on the porkchop page to whichever cell the user pins.`);
L.push(`2. How truncated pairing windows are reported. ${pct(lr2.primary.bodies.anyReturnCellRefused / lr2.primary.bodiesWithWindow)} of bodies with a window lose return cells to the 2040-12-31 fixture end.`);
L.push('3. The return grid\'s column count (723 over 722.5 days) is this run\'s choice; DEC-20-2 fixes the window and the TOF range only.');
L.push(`4. Under DEC-20-6's default-on filter, ${n(lr2.primary.bodies.l1WithNoSupportedReturnCell)} of ${n(lr2.primary.bodies.l1Measured)} measured L1 bodies have no supported return cell at today's (unfiltered) compare-path window. The filter would also change which outbound window ranks first, which this run did not model. A count for Front C/D to plan around, not a recommendation.`);
L.push('5. Whether the secondary-window columns stay in the evidence (they are beyond the dispatch) or are dropped.');
L.push('');

// ---- LR3 ---------------------------------------------------------------------------------------
const tier = (t) => lr3.tierTable.find((x) => x.tier === t);
const dispatchTiers = [1, 2, 3, 5].map(tier);
const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0);
const verdict = (id) => {
  const note = notes[id];
  if (!note) return null;
  const a = note.assessment;
  if (a.startsWith('REAL GAP')) return 'real';
  if (a.startsWith('NOT EQUIVALENT')) return 'real';
  if (a.startsWith('EQUIVALENT')) return 'equivalent';
  return 'other';
};
const survivors = lr3.mutants.filter((m) => ['survived', 'not-executed-by-any-test', 'no-test-imports-module'].includes(m.outcome));
const withIdNote = survivors.filter((m) => notes[m.id]);
const realGaps = survivors.filter((m) => verdict(m.id) === 'real');
const equivalents = survivors.filter((m) => verdict(m.id) === 'equivalent');
L.push('## 4. LR3 — mutation campaign');
L.push('');
L.push('**Not validated. A surviving mutant is a lead; some are equivalent mutants.**');
L.push('');
L.push(`**What ran.** A mutator written on the TypeScript compiler API already in node_modules (no new dependency) listed ${n(c.enumerated)} mutants in 48 production files under src/v2/core and src/v2/porkchop: ${n(lr3.mutants.filter((m) => m.exported).length)} inside exported functions (the dispatch scope) and ${n(lr3.mutants.filter((m) => !m.exported).length)} inside module-private helpers (added, labelled). Each ran in a throwaway copy of a fresh clone against the test files that import its module and executed its function at baseline. All ${lr3.baselineTests.length} discovered test files pass unmutated in the copy.`);
L.push('');
L.push(`**How much.** ${lr3.state}. ${facts.lr3Clock}`);
L.push('');
row(['Tier (run order)', 'Mutants', 'Run', 'Killed', '... by the compile step', 'Timeout', 'Survived, function executed', 'Survived, function never executed']);
row(['---', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
for (const t of lr3.tierTable) row([`${t.tier}. ${t.name}`, t.mutants, t.run, t.killed, t.killedByCompile, t.timeout, t.survived, t.notExecuted + t.noImporter]);
row(['**All**', n(c.enumerated), n(c.run), n(c.killed ?? 0), n(c.killedByCompile ?? 0), n(c.timeout ?? 0), n(c.survived ?? 0), n((c['not-executed-by-any-test'] ?? 0) + (c['no-test-imports-module'] ?? 0))]);
L.push('');
L.push(`Dispatch scope only (exported functions, tiers 1, 2, 3 and 5): ${n(sum(dispatchTiers, 'run'))} of ${n(sum(dispatchTiers, 'mutants'))} run, ${n(sum(dispatchTiers, 'killed') + sum(dispatchTiers, 'timeout'))} killed, ${n(sum(dispatchTiers, 'survived') + sum(dispatchTiers, 'notExecuted') + sum(dispatchTiers, 'noImporter'))} survived.`);
L.push('');
L.push(`**Top files by survivors:** ${lr3.top5SurvivorFiles.map((x) => `\`${x.file.replace('src/v2/', '')}\` ${x.survived} of ${x.run} run`).join('; ')}.`);
L.push('');
L.push(`**Read by hand.** ${withIdNote.length} survivors in the honesty and math layers carry an individual written reading (more are covered by a per-function or per-file note). Of those ${withIdNote.length}: ${realGaps.length} are read as real gaps, ${equivalents.length} as equivalent mutants, and the rest as untested boundaries, untested defensive branches or iteration-path changes that cannot alter a converged answer. The readings that matter most:`);
const pick = (file, line) => survivors.find((m) => m.file === `src/v2/${file}` && m.line === line);
const bullets = [
  ['porkchop/delta-v.ts', 'injectionDvFromC3', 'No test pins the injection ΔV. Dividing by the parking radius can be swapped for multiplying, and the final subtraction for an addition, and both test files that run the function still pass. The stack total survives a flipped margin sign for the same reason.'],
  ['porkchop/grid-compute.ts', 'computePorkchopGrid', 'No test pins the grid\'s axis direction. Building the departure or the TOF axis from (end, start) reverses the cell order and all three test files that run the kernel still pass.'],
  ['porkchop/propagation-guard.ts', 'assessPropagation', 'The non-finite-element refusal and the eccentricity refusal can each be deleted without a test failing. The one refusal the tests drive through this function is a non-positive semi-major axis.'],
  ['porkchop/tier-disclosure.ts', 'fullTierDisclosure', 'The guard that returns no sentence when the date or the delta-v cannot be formatted can be deleted; the mutant would print a disclosure containing "null".'],
  ['core/invariants/assertions.ts', 'assertInterpolationError', 'A sign error inside the error norm makes the interpolation and Keplerian error-bar assertions unable to fire for z-dominated errors, and no test notices.'],
  ['porkchop/compare-data.ts', 'computeCompareData', 'The TOF cell width can be computed from swapped arguments (it goes negative) and the two test files that run this function still pass.'],
  ['core/lambert/lambert-multi-rev.ts', 'solveOneBranch', 'The fail-closed x² > 0.90 limit is not pinned. Its two checks mask each other as single mutants, so both were deleted together by hand in a spare copy (a second-order check outside the campaign): the only two test files that execute this function still pass.'],
];
for (const [file, fnName, text] of bullets) {
  const hits = survivors.filter((m) => m.file === `src/v2/${file}` && m.function === fnName);
  if (hits.length) L.push(`- \`${file}\` \`${fnName}\` (${hits.length} survivor${hits.length === 1 ? '' : 's'}, lines ${[...new Set(hits.map((m) => m.line))].sort((a, b) => a - b).join(', ')}): ${text}`);
}
void pick;
L.push('');
L.push(`**Functions no test executes** (measured by V8 function coverage): ${lr3.unexecutedFunctions.length ? lr3.unexecutedFunctions.map((u) => `\`${u.file.replace('src/v2/', '')}\` \`${u.function}\` (${u.mutants} mutant${u.mutants === 1 ? '' : 's'}${u.exported ? ', exported' : ''})`).join('; ') : 'none found in the tiers run'}.`);
L.push('');
L.push(`**Check on the test selection.** ${lr3.pruningCheck.sampled} surviving mutants were re-run against every test file that imports their module, with the function-level selection switched off (${lr3.pruningCheck.testFilesRun} test-file runs): ${lr3.pruningCheck.stillSurvived} still survived, ${lr3.pruningCheck.killedWithoutPruning.length} were killed only without the selection.`);
L.push('');
L.push('**Other facts.** One process was killed by the kernel for memory during the run (a single test process at 13 GB, about 03:14Z): a mutant making the code run away, recorded as killed. "Killed by the compile step" means the test\'s own tsc run rejected the mutant, which is a kill by the type system rather than by an assertion.');
L.push('');
L.push('**Needs Nova\'s ruling.**');
L.push('1. Which survivors become Front E work. lr3-mutation/SURVIVORS.md lists every one with its diff, the tests that ran and a suggested test; nothing was written.');
L.push('2. Whether mutating module-private helpers (tiers 4 and 6) is wanted. Drop those tiers to get exactly the dispatch scope.');
L.push('3. Whether "killed by the compile step" should count as killed for the project rule "a test that cannot fail".');
L.push('4. The hand readings are one reader\'s, made in this run; "equivalent" was checked by execution only where the note says so.');
L.push('');

// ---- LR4 ---------------------------------------------------------------------------------------
L.push('## 5. LR4 — fresh-clone build reproducibility');
L.push('');
L.push(`**${lr4.identical} of ${lr4.trackedDocsFiles} files tracked under docs/ at ${lr4.cloneHead.slice(0, 7)} are byte-identical to a fresh-clone build** (sha256; ${lr4.differing.length} differing, ${lr4.missingFromBuild.length} missing, ${lr4.onlyInBuild.length} extra). Fresh clone from GitHub, \`npm ci\`, \`npm run build -- --outDir <scratch> --emptyOutDir\`, on ${lr4.platform}, Node ${lr4.node}.`);
L.push('');
L.push(`${lr4.emittedIntoOutDir} files went to the scratch outDir. The other ${lr4.notEmittedIntoOutDir.length} (${lr4.notEmittedIntoOutDir.map((x) => `\`${x.file}\``).join(', ')}) are written by \`writeBundle\` plugins to a hard-coded \`docs/\` path in vite.config.ts and ignore \`--outDir\`; they were rewritten in the clone's own docs/ and are identical too. Anyone building "into scratch" in a tree they care about gets those four files written into that tree. No ruling needed.`);
L.push('');

// ---- surprising --------------------------------------------------------------------------------
L.push('## 6. Anything surprising (list only)');
L.push('');
const surprising = [
  'The dispatch was handed to a cloud session; its tripwire (a) fired at Phase 0 and needed a waiver.',
  'A standing multi-agent mode was on in the session that received a dispatch forbidding sub-agents.',
  'pip refuses poliastro 0.17.0 on Python 3.12 without `--ignore-requires-python`.',
  '`npm run verify` discovers 109 test files and 363 tests at 0d31cda; AGENTS.md §9.1 still records 74 files and 256 tests (2026-08-13).',
  'SLICE_20_FOUNDING.md line 3 still says "DRAFT — not locked" above a §9.1 lock record.',
  `${pct(inside.n / lr1.recordCount, 2)} of sampled converged return branches fly through the Sun, and the kernel has no perihelion check.`,
  'Both poliastro propagators lose kilometres on those near-rectilinear orbits, and they disagree with each other.',
  'poliastro 0.17.0\'s vallado `prograde` flag selects the short way, not the direction of motion.',
  `At the compare-path best window the symmetric charge is above the disclosed 5.1 km/s maximum for ${pct(p.aboveInterimRange)} of bodies.`,
  `${pct(lr2.primary.returnCells.refusedEarthArrivalAfterFixtureEnd / lr2.primary.returnCells.total)} of all paired-return cells are refused by the 2040-12-31 fixture end.`,
  'The largest "undercharges" in LR2 are produced by that truncation, not by the orbits.',
  'vite.config.ts writes four files to docs/ regardless of --outDir.',
  'tests/v2-compare-data.test.mjs compiles the Lambert solver but executes none of its functions (function coverage).',
  'No test pins the numeric value of the injection ΔV formula.',
  'The grid kernel\'s axis order can be reversed without a test failing.',
  'A mutant drove one test process to 13 GB before the kernel killed it.',
  'The full catalog run finished in about an hour against an 8-hour box.',
];
for (const item of surprising) L.push(`- ${item}`);
L.push('');

// ---- commits -----------------------------------------------------------------------------------
L.push('## 7. Commits on s20-longrun-research (oldest first)');
L.push('');
for (const commit of facts.commits) L.push(`- \`${commit.sha}\` ${commit.subject}`);
L.push('- (the commit that adds this file) docs(research): Slice 20 long run evidence');
L.push('');
L.push(`Delivery: ${facts.bundle}`);
L.push('');
L.push('## 8. .dispatch-scope contents, per commit');
L.push('');
L.push(facts.scopesMarkdown.trim());
L.push('');
L.push('## 9. Not done');
L.push('');
L.push('- Nothing was pushed or merged; the branch exists only in this container\'s clone and in the bundle.');
L.push('- No test was written, no production file was changed, no DEC or founding doc was touched.');
L.push('- LR1: M=2; a closure tolerance. LR2: M=1 returns; any joint objective (OQ-20-1). LR3: higher-order mutants as a campaign (one second-order check was done by hand, section 4); line-level coverage; a second reader for the hand notes.');
L.push('- The laptop was not involved at any point; nothing here verifies the laptop\'s environment.');
L.push('');
fs.writeFileSync(outPath, `${L.join('\n')}\n`);
console.log(L.slice(0, 5).join('\n'));
console.log(`\nwritten ${outPath} (${L.length} lines)`);
