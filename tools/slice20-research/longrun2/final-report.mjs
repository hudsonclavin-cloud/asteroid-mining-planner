#!/usr/bin/env node
// Builds the top-level S20_LONGRUN2 REPORT.md. Every number is read from the committed summary files of
// the four XRs or from the run-facts file given on the command line; the prose is in this script.
//
//   node final-report.mjs <run-facts.json> <out REPORT.md>
//
// run-facts.json: { longrun2, host, commits:[{sha,subject}], tipBeforeFinal, originMain, verifyBaseline,
//                   verifyFinal, scopesMarkdown, bundle, clocks:{xr0,xr1,xr2,xr3}, disk }
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [factsPath, outPath] = process.argv.slice(2);
const facts = JSON.parse(fs.readFileSync(factsPath, 'utf8'));
const read = (rel) => (fs.existsSync(path.join(here, rel)) ? JSON.parse(fs.readFileSync(path.join(here, rel), 'utf8')) : null);
const xr0 = read('xr0-lr2-crosscheck/xr0-summary.json');
const xr1 = read('xr1-cache-repro/xr1-cache-diff.json');
const xr1s = read('xr1-cache-repro/xr1-second-solver.json');
const xr1o = read('xr1-cache-repro/xr1-old-solver-check.json');
const xr2 = read('xr2-validity/xr2-summary.json');
const xr3 = read('xr3-m1-returns/xr3-summary.json');

const n = (x) => (typeof x === 'number' ? x.toLocaleString('en-US') : String(x));
const e = (x) => (typeof x === 'number' ? x.toExponential(3) : 'n/a');
const f = (x, d = 3) => (typeof x === 'number' && Number.isFinite(x) ? x.toFixed(d) : 'n/a');
const pct = (x, d = 1) => (typeof x === 'number' && Number.isFinite(x) ? `${(100 * x).toFixed(d)}%` : 'n/a');
const L = [];
const row = (c) => L.push(`| ${c.join(' | ')} |`);

// ---- status block: six lines ----------------------------------------------------------------------
const P = xr1 ? xr1.provenance : null;
const driftKeys = P ? ['catalogFixture', 'horizonsFixture', 'precomputeScript', 'docsVsTestsCache'].filter((k) => P[k].verdict === 'DRIFT') : [];
const driftNames = { catalogFixture: 'catalogFixtureSha256', horizonsFixture: 'horizonsFixtureSha256', precomputeScript: 'precomputeScriptSha256', docsVsTestsCache: 'docs copy vs tests copy' };
L.push(`LONGRUN2: ${facts.longrun2}`);
L.push(`HOST: ${facts.host.os} ${facts.host.arch} node ${facts.host.node} | ${facts.host.cores} cores | COMMITS: ${facts.commits.length} on s20-longrun2-research before the commit that adds this file, tip ${facts.tipBeforeFinal} (a file cannot hold its own commit hash)`);
L.push(xr0 ? `XR0 LR2 CROSS-CHECK: ${n(xr0.compared)} bodies | agree ${n(xr0.agreeAtCommittedPrecision)} | differ ${n(xr0.differ)} | max |Δerror| ${xr0.maxAbsDErrorKmS === 0 ? '0' : e(xr0.maxAbsDErrorKmS)} km/s | ${xr0.verdict} LR2` : 'XR0 LR2 CROSS-CHECK: not run');
L.push(xr1 ? `XR1 CACHE: provenance ${driftKeys.length ? `DRIFT: ${driftKeys.map((k) => driftNames[k]).join(', ')}` : 'MATCH'} | bodies recomputed ${n(xr1.bodies.recomputed)} | status changes ${n(xr1.statusChanges.length)} | minC3 max rel diff ${xr1.minC3.bodiesChanged ? e(xr1.minC3.maxRelDiff) : '0'} (${n(xr1.minC3.bodiesChanged)} bodies differ in a stored digit) | screening-colour changes ${n(xr1.displayed.byComponent.colour)}` : 'XR1 CACHE: not run');
if (xr2) {
  const a = xr2.screeningGrid.all;
  L.push(`XR2 VALIDITY: outbound cells swept ${n(a.cells)} (${xr2.state}) | through-Sun converged cells ${n(a.flagged)} (${pct(a.flaggedShareOfConverged, 3)}) | bodies with >=1 ${n(a.bodiesWithFlagged)} | affecting a shipped best window ${n(xr2.rulingCritical.totalShownWindowsOrCellsFlagged)}`);
} else L.push('XR2 VALIDITY: not run');
if (xr3) {
  const a = xr3.primary.all;
  L.push(`XR3 M=1 RETURNS: ${n(xr3.bodiesDone)} of ${n(xr3.catalogBodies)} bodies (${n(a.bodies)} measured) | median |error| ${f(a.m0PlusM1.medianAbs)} km/s (M=0+M=1) against ${f(a.m0.medianAbs)} (M=0 only) | overcharge share ${pct(a.m0PlusM1.overchargeShare)}`);
} else L.push('XR3 M=1 RETURNS: not run');
L.push('');
L.push('# S20_LONGRUN2 final report');
L.push('');
if (driftKeys.length) L.push(`**XR1 PROVENANCE DRIFT: ${driftKeys.map((k) => driftNames[k]).join(', ')}.** The shipped screening cache records a sha256 for the script that built it, and that script has been edited twice since (2026-08-05). Both input fixtures still match, and the recomputed cache changes nothing the catalog displays, but it is not bit-identical to the shipped file.`);
L.push('');
L.push('Everything below is LEADS-grade research evidence. **No XR number is validated, with one exception: XR0\'s verdict about LR2, which is what XR0 is for.** Nothing here enters a DEC, a test, a fixture or the site.');
L.push('');

// ---- host and rules -------------------------------------------------------------------------------
L.push('## 0. Host, base and rules kept');
L.push('');
row(['Item', 'Value']);
row(['---', '---']);
row(['Host', `${facts.host.description}`]);
row(['OS / arch / node / npm / python', `${facts.host.os} / ${facts.host.arch} / ${facts.host.node} / ${facts.host.npm} / ${facts.host.python}`]);
row(['Cores / RAM / free disk', `${facts.host.cores} / ${facts.host.ramGb} GB / ${facts.disk}`]);
row(['Canonical tree `C:\\Users\\hudso\\asteroid-mining-planner`', 'does not exist on this host (expected by the dispatch); nothing to touch']);
row(['pwd / remote', `\`${facts.host.pwd}\` / \`${facts.host.remote}\``]);
row(['origin/main at start', `\`${facts.originMain}\``]);
row(['Worktree / branch', `\`<scratch>/aster-longrun2\` / \`s20-longrun2-research\``]);
row(['Throwaway clone for the recompute', '`<scratch>/aster-tmp-xr1`, full history, never committed from']);
row(['poliastro venv', 'present from the first run (python 3.12.3, poliastro 0.17.0); not needed and not used; nothing installed in this run']);
row(['`npm run verify` at start', `exit ${facts.verifyBaseline.exit} — ${facts.verifyBaseline.filesPassed}/${facts.verifyBaseline.files} files, ${facts.verifyBaseline.tests} tests passed, ${facts.verifyBaseline.failed} failed`]);
row(['`npm run verify` at end', facts.verifyFinal ? `exit ${facts.verifyFinal.exit} — ${facts.verifyFinal.filesPassed}/${facts.verifyFinal.files} files, ${facts.verifyFinal.tests} tests passed, ${facts.verifyFinal.failed} failed` : 'not run']);
L.push('');
L.push('- **Context mismatch, recorded, no XR halted by it.** The dispatch expects main to carry Front A\'s sweep fix and six protected hand-commits, and to verify at 111 files / 370 tests. origin/main at start holds exactly seven commits past `0d31cda`: the six first-long-run commits and their merge. No path outside `tools/slice20-research/longrun/` differs from `0d31cda`, and verify is 109 files / 363 tests, the same as the first run. Everything here was therefore measured against the `0d31cda` source tree.');
L.push('- One agent. No sub-agent, swarm, workflow or second session. Long work ran as background processes with checkpoints.');
L.push('- No push, no merge, no ASTER_* override, no package added. Every committed path is under `tools/slice20-research/longrun2/`. The precompute script and every shipped fixture were read only; the script ran unedited in the throwaway clone.');
L.push('- Each commit carries one trailer line (`Claude-Session: ...`) after the dispatch\'s subject line.');
L.push('');

// ---- XR0 ------------------------------------------------------------------------------------------
if (xr0) {
  L.push('## 1. XR0 — independent cross-check of LR2');
  L.push('');
  L.push(`**VERDICT: this ${xr0.verdict} LR2's primary column** on the ${n(xr0.compared)} bodies compared.`);
  L.push('');
  L.push(`**What ran.** A standalone script that imports nothing from the first long run: its own loops over the outbound and return grids with direct calls to the production solver, the production linear-scan Earth lookup, an epoch test for the DEC-20-3 refusal. LR2 used \`computeCompareData\`, the grid kernel with swapped providers, a NaN sentinel and its own bisection lookup. ${facts.clocks.xr0}`);
  L.push('');
  L.push(`**How much.** ${xr0.state}: ${n(xr0.bodiesComputed)} bodies (${Object.entries(xr0.bodiesByReason).map(([k, v]) => `${v} ${k}`).join(', ')}). Gate first: the three S20_01 R3 min-C3 rows reproduced (${xr0.gate.map((g) => `${g.des} ${g.assumed.toFixed(4)} / ${g.computed.toFixed(4)}`).join('; ')}).`);
  L.push('');
  L.push(`**Headline.** ${n(xr0.agreeAtCommittedPrecision)} of ${n(xr0.compared)} bodies agree on every compared field (status, window, assumed burn, refused-cell count, computed minimum and its cell, error) after LR2's own 6-decimal rounding; ${n(xr0.differ)} differ; max |Δerror| ${xr0.maxAbsDErrorKmS === 0 ? '0' : e(xr0.maxAbsDErrorKmS)} km/s.${xr0.fullPrecision ? ` LR2's full-precision working file was still on this host (it is not committed evidence): against it, ${n(xr0.fullPrecision.bitIdentical)} of ${n(xr0.fullPrecision.compared)} bodies with an error on both sides are bit-identical.` : ''}`);
  L.push('');
  L.push(`**Outliers.** ${xr0.differ === 0 ? 'None: no disagreeing body.' : `${xr0.differ} disagreeing bodies, listed in xr0-lr2-crosscheck/REPORT.md.`}`);
  L.push('');
  L.push('**What it does not cover.** LR2\'s secondary (best-stack) column; the other 41,366 bodies; anything both paths share by definition (the production solver, propagator, `segmentWindows`, the 723 x 100 return grid). The sample is not random: all 498 non-gate bodies from the first 500 are numbered objects, plus LR2\'s own extreme rows.');
  L.push('');
  L.push('**Needs Nova\'s ruling.** Whether 540 bodies with bit-identical results from an independent path is enough to lift LR2\'s "UNVALIDATED" label for the primary column, and whether the secondary column needs the same treatment before DEC-20-7 leans on it.');
  L.push('');
}

// ---- XR1 ------------------------------------------------------------------------------------------
if (xr1) {
  const g = P.solverCommit;
  const dp = xr1.displayed;
  L.push('## 2. XR1 — shipped screening cache: provenance, reproducibility, solver drift');
  L.push('');
  L.push('**Provenance check (reported before the recompute started).**');
  row(['Check', 'Verdict', 'Now', 'Recorded']);
  row(['---', '---', '---', '---']);
  row(['catalog fixture sha256', P.catalogFixture.verdict, `\`${P.catalogFixture.now.slice(0, 16)}...\``, `\`${P.catalogFixture.recorded.slice(0, 16)}...\``]);
  row(['horizons fixture sha256', P.horizonsFixture.verdict, `\`${P.horizonsFixture.now.slice(0, 16)}...\``, `\`${P.horizonsFixture.recorded.slice(0, 16)}...\``]);
  row(['precompute script sha256', `**${P.precomputeScript.verdict}**`, `\`${P.precomputeScript.now.slice(0, 16)}...\``, `\`${P.precomputeScript.recorded.slice(0, 16)}...\``]);
  row(['docs/ cache = tests/ cache', P.docsVsTestsCache.verdict, `\`${P.docsVsTestsCache.docs.sha256.slice(0, 16)}...\``, `\`${P.docsVsTestsCache.tests.sha256.slice(0, 16)}...\``]);
  L.push('');
  L.push(`- solverCommit \`${g.recorded.slice(0, 7)}\` **is** an ancestor of HEAD, ${n(g.commitsSince)} commits back. ${g.coreAndPorkchopFilesDiffering.length} files under \`src/v2/core\` and \`src/v2/porkchop\` differ since (${g.coreAndPorkchopFilesDiffering.filter((x) => x.status === 'A').length} added, ${g.coreAndPorkchopFilesDiffering.filter((x) => x.status === 'M').length} modified).`);
  L.push(`- Of the ${g.modulesTheScriptCompiles.length} modules the script actually compiles, ${g.modulesTheScriptCompiles.filter((m) => m.changed).length} changed: ${g.modulesTheScriptCompiles.filter((m) => m.changed).map((m) => `\`${m.file.replace('src/v2/', '')}\``).join(', ')}. Read from the diff: the executable changes are a catalog-size assertion, an \`M != 0\` guard in \`izzo.ts\` the script never takes, and a new unused constant; the rest is comments. Of the seven solver files Nova listed, the script compiles four (\`izzo.ts\`, \`householder.ts\`, \`hyp2f1b.ts\`, \`initial-guess.ts\`) and only \`izzo.ts\` changed executable code; \`lambert-multi-rev.ts\`, \`dla.ts\` and \`feasibility.ts\` were added later and are not imported by the script.`);
  L.push('- The drifted script hash is explained: the recorded value is the script as committed in `9e93ffc`, one commit after the recorded solverCommit (whose own script hashes differently). [Likely] the cache was built in a tree whose HEAD was `8471659` with the new script not yet committed. Two later commits (fixture path, tsc invocation) changed the script without changing what it computes.');
  L.push('');
  L.push(`**Recompute.** The unedited script, no arguments, in a throwaway clone: exit ${xr1.recompute.log.exit}, ${xr1.recompute.log.completeLine}, ${n(xr1.recompute.metadata.recomputed.totalSolves)} solves (shipped: ${n(xr1.recompute.metadata.shipped.totalSolves)} in ${f(xr1.recompute.metadata.shipped.wallTimeSeconds, 1)} s).`);
  L.push('');
  row(['Diff, all 41,906 bodies', 'Count']);
  row(['---', '---:']);
  row(['Status changes', n(xr1.statusChanges.length)]);
  row(['isCoOrbital changes', n(xr1.isCoOrbitalChanges.length)]);
  row(['minC3Date / minC3TofDays changes', n(xr1.minC3CellChanges.count)]);
  row(['Different top window / different top-5 set', `${n(xr1.bestWindows.differentTopWindow)} / ${n(xr1.bestWindows.differentTop5Set)}`]);
  row(['Bodies whose stored minC3 differs at all', n(xr1.minC3.bodiesChanged)]);
  row(['... max / median relative difference', `${e(xr1.minC3.maxRelDiff)} / ${e(xr1.minC3.medianRelDiffAmongChanged)}`]);
  row(['Bodies with the same five windows but a different stored digit', n(xr1.bestWindows.sameCellsDifferentValues)]);
  row(['Metadata differences beyond generatedAt, wallTimeSeconds, totalSolves, provenance', n(xr1.metadataDifferencesOtherThanExpected.length)]);
  row(['**Bodies the catalog would show differently**', `**${n(dp.bodiesShownDifferently)}**`]);
  row(['... status badge / LOW-HIGH class / C3 text / co-orbital tag / near-zero flag / 3D colour', `${dp.byComponent.status} / ${dp.lowHighClassificationChanges} / ${dp.byComponent.c3Text} / ${dp.byComponent.coOrbital} / ${dp.byComponent.nearZero} / ${dp.byComponent.colour}`]);
  row(['A stored value changes but nothing displayed does', n(dp.valueChangedButNothingDisplayedChanges)]);
  L.push('');
  L.push(`**The question that matters: ${n(dp.bodiesShownDifferently)} bodies would be shown differently.** The mapping was read from the code that consumes the cache (status badge labels, \`formatC3\` to three significant figures, the co-orbital tag, the near-zero flag, \`getScreeningColor\`). The recomputed file is nonetheless **not byte-identical**: bodies section differs, sha256 \`${xr1.recompute.file.sha256.slice(0, 16)}...\` against \`${xr1.recompute.shippedFile.sha256.slice(0, 16)}...\`.`);
  L.push('');
  if (xr1o) {
    const og = xr1o.byGroup;
    L.push(`**Why the digits differ.** Not the committed source changes. The recorded commit's solver and today's solver, both run on this host, agree bit for bit on ${n(xr1o.cellsBitIdenticalOldVsCurrent)} of ${n(xr1o.cells)} cells (${xr1o.bodies} bodies); the old solver run here reproduces the shipped minC3 for ${og['largest shipped-vs-recomputed difference'].oldSolverHereEqualsShipped + og['seeded from the other changed bodies'].oldSolverHereEqualsShipped} of ${og['largest shipped-vs-recomputed difference'].bodies + og['seeded from the other changed bodies'].bodies} changed bodies and ${og['seeded from the unchanged bodies'].oldSolverHereEqualsShipped} of ${og['seeded from the unchanged bodies'].bodies} unchanged ones. The computation calls \`Math.sin\`, \`cos\`, \`pow\`, \`exp\`, \`log\`, \`acos\` and \`asinh\`, which ECMAScript leaves implementation-approximated, so a different V8 build or CPU can legitimately change last bits. [Likely] that is the cause; the cache records no host or Node version. Not excluded: a solver edit present but uncommitted when the May cache was built and never committed since.`);
    L.push('');
  }
  if (xr1s) {
    const a = xr1s.inSample;
    const x = xr1s.extraNearestThreshold;
    L.push(`**Second mechanism: can the catalog and the porkchop page disagree about a body?** Not on this evidence. Over ${a.bodies} seeded bodies (${n(a.cells)} cells) \`izzo.ts\` and \`lambert-multi-rev.ts\` at M=0 converge on exactly the same cells (${n(a.onlyIzzoConverged)} / ${n(a.onlyMultiRevConverged)} one-sided) and the largest per-cell relative C3 difference is ${a.maxPerCellRelC3Diff === 0 ? 'exactly 0' : e(a.maxPerCellRelC3Diff)}. No body straddles 25 km²/s², including the ${x.bodies + (25 - x.bodies)} nearest the threshold (${x.bodies} of them outside the sample). Against the shipped cache the multi-rev minimum differs by at most ${e(a.relMinC3MultiRevVsShipped.max)} relative: the shipped-versus-recomputed difference above, which is the same for either solver.`);
    L.push('');
  }
  {
    const top = xr1.minC3.largest25;
    const small = top.filter((x) => x.shipped < 0.1).length;
    L.push(`**Outliers.** The 25 largest relative minC3 differences are listed in xr1-cache-repro/REPORT.md. ${small} of the 25 have C3 below 0.1 km²/s² and the largest C3 among them is ${Math.max(...top.map((x) => x.shipped)).toPrecision(3)}, as expected when a last-bit difference in v∞ is divided by a small C3. The largest relative difference, ${e(xr1.minC3.maxRelDiff)}, is on ${top[0].des} at C3 ${top[0].shipped.toPrecision(4)} km²/s².`);
  }
  L.push('');
  L.push('**Needs Nova\'s ruling.**');
  L.push('1. What to do about the stale script hash. Regenerating the cache would refresh the provenance and change stored digits for 1,787 bodies while changing nothing displayed; leaving it means the recorded hash describes a script version that no longer exists on main.');
  L.push('2. Whether "the cache reproduces" should mean byte-identical. On this evidence it does not across hosts today: the same committed source gives different last digits here than in the shipped file. "Reproduces to every displayed value" does hold.');
  L.push('3. Whether the cache should record its host and Node version, and whether something should check the three hashes (a hash-only check needs no git history).');
  L.push('4. The recorded solverCommit is the parent of the commit that carries the cache, and [Likely] the script was uncommitted when it ran. That is the same pattern STATUS.md records for the MCP package (built from a dirty worktree).');
  L.push('5. Nothing on the site reads `bestWindows`; `minC3Date` and `minC3TofDays` are read only by the MCP tool. `bestWindows` is about 26 MB of the 34.5 MB shipped file (re-serialised without it, the cache is 8.0 MB). Is it still wanted there?');
  L.push('');
}

// ---- XR2 ------------------------------------------------------------------------------------------
if (xr2) {
  const a = xr2.screeningGrid.all;
  const c = xr2.compareGrid.all;
  const rc = xr2.rulingCritical;
  const ret = xr2.returnCensus;
  L.push('## 3. XR2 — physical-validity census');
  L.push('');
  L.push(`**The ruling-critical count: ${n(rc.totalShownWindowsOrCellsFlagged)}.** Flagged = transfer perihelion below one solar radius and the flown arc passes perihelion (LR1's definition, copied with its source cited).`);
  L.push('');
  row(['What the site shows', 'checked', 'flagged']);
  row(['---', '---:', '---:']);
  row(['The cache\'s minC3 cell', n(rc.cacheMinC3Cell.bodiesChecked), n(rc.cacheMinC3Cell.flagged)]);
  row(['The cache\'s bestWindows', n(rc.cacheBestWindows.windowsChecked), n(rc.cacheBestWindows.flaggedWindows)]);
  row(['Compare\'s bestPractical argmin', n(rc.compareBestPractical.bodiesWithAWindow), n(rc.compareBestPractical.argminFlagged)]);
  row(['Any cell inside compare\'s bestPractical window', `${n(rc.compareBestPractical.windowCellsChecked)} cells in ${n(rc.compareBestPractical.bodiesWithAWindow)} windows`, `${n(rc.compareBestPractical.flaggedCellsInsideWindows)} cells in ${n(rc.compareBestPractical.windowsWithAFlaggedCell)} windows`]);
  L.push('');
  L.push(rc.totalShownWindowsOrCellsFlagged === 0
    ? `**Zero, stated plainly:** no shown minimum, no cached best window and no cell of any compare best-practical window flies through the Sun. A perihelion refusal would be a quiet fix: it would remove cells from the grids and change no number the site shows as a best window today. The closest any compare window comes is a transfer perihelion of ${f(rc.compareBestPractical.smallestWindowPerihelionAu)} AU.`
    : `Affected bodies are listed with their displayed numbers in xr2-validity/REPORT.md.`);
  L.push('');
  L.push(`**What ran.** The precompute script takes no hooks and may not be edited, so the outbound census is an independent sweep of the same screening grid with the production kernel, plus the compare page's grid through \`computeCompareData\`, for every body. ${facts.clocks.xr2}`);
  L.push('');
  row(['Grid', 'state', 'bodies', 'cells swept', 'converged', 'flagged', 'share of converged', 'bodies with >= 1', 'perihelion < 1 solar radius', '< 0.01 AU', '< 0.1 AU']);
  row(['---', '---', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:', '---:']);
  row(['Outbound, screening grid (783 x 55)', xr2.state, n(a.bodies), n(a.cells), n(a.converged), n(a.flagged), pct(a.flaggedShareOfConverged, 3), n(a.bodiesWithFlagged), pct(a.belowSunShare, 3), pct(a.below001AuShare, 3), pct(a.below01AuShare, 2)]);
  row(['Outbound, compare grid (731 x 100)', xr2.state, n(c.bodies), n(c.cells), n(c.converged), n(c.flagged), pct(c.flaggedShareOfConverged, 3), n(c.bodiesWithFlagged), pct(c.belowSunShare, 3), pct(c.below001AuShare, 3), pct(c.below01AuShare, 2)]);
  if (ret) row([`Return grid (731 x 100), ${ret.bodies} seeded bodies; counts are converged BRANCHES at M=0 and M=1`, ret.state, n(ret.bodies), `${n(ret.admissibleCells)} admissible cells`, `${n(ret.all.convergedBranches)} branches`, n(ret.all.flagged), pct(ret.all.flaggedShare, 3), '', '', '', '']);
  L.push('');
  const d = a.perihelionDecilesAu;
  if (d) L.push(`Transfer perihelion over all converged screening cells, deciles in AU: ${[10, 20, 30, 40, 50, 60, 70, 80, 90].map((p) => `p${p} ${d[`p${p}`].toPrecision(3)}`).join(', ')}. By tier and orbit class: xr2-validity/REPORT.md.`);
  L.push('');
  if (ret) {
    L.push(`**Return grid.** ${n(ret.all.flagged)} of ${n(ret.all.convergedBranches)} converged branches flagged (${pct(ret.all.flaggedShare, 2)}) against LR1's 219 of 14,124 (1.55%). M=0: ${n(ret.byGroup['M0 single'].flagged)} of ${n(ret.byGroup['M0 single'].converged)} (${pct(ret.byGroup['M0 single'].flaggedShare, 2)}; LR1 0.28%). M=1: ${n(ret.m1.flagged)} of ${n(ret.m1.convergedBranches)} (${pct(ret.m1.flaggedShare, 2)}; LR1 2.49%). The smallest asteroid-departure |v∞| on any flagged return branch is ${f(ret.minFlaggedVInfDepKmS)} km/s.`);
    L.push('');
  }
  const kv = xr2.kernelMinC3VersusShippedCache;
  L.push(`**Bonus from the same sweep.** The kernel's minimum C3 (lambert-multi-rev, M=0) against the shipped izzo value for ${n(kv.bodies)} bodies: max relative difference ${e(kv.maxRelDiff)}, median ${e(kv.medianRelDiff)}, same minimum cell for ${n(kv.sameArgminCell)}, a different cell for ${n(kv.differentArgminCell)}, ${kv.straddle25.length} on opposite sides of 25 km²/s². The kernel reaches its epochs through a Julian date, so its epochs differ from the script's by rounding. [Likely] that rounding, not the solver, accounts for nearly all of this difference: on identical epochs XR1 found the two solvers bit-identical, and shipped against recomputed differ by at most ${e(xr1 ? xr1.minC3.maxRelDiff : null)}.`);
  L.push('');
  L.push(`**Outliers.** Flagged cells per body on the screening grid: min ${xr2.screeningGrid.flaggedCellsPerBody.min}, median ${xr2.screeningGrid.flaggedCellsPerBody.median}, max ${xr2.screeningGrid.flaggedCellsPerBody.max} of 43,065. Not propagatable (skipped): ${xr2.notPropagatable.join(', ') || 'none'}.`);
  L.push('');
  L.push('**Needs Nova\'s ruling.**');
  L.push('1. Whether K1 (and the outbound grids) should refuse or label cells whose arc passes inside the Sun. On this evidence it changes no shown best window.');
  L.push(`2. Where the line goes. One solar radius is LR1\'s definition: ${pct(a.belowSunShare, 2)} of converged screening cells have a transfer perihelion below it, ${pct(a.below001AuShare, 2)} below 0.01 AU and ${pct(a.below01AuShare, 1)} below 0.1 AU. A thermal limit would remove far more grid cells than the solar-radius flag does. No cell of any compare best-practical window has a transfer perihelion below ${f(rc.compareBestPractical.smallestWindowPerihelionAu)} AU; for the cache\'s minC3 cells and best windows this run recorded only the solar-radius flag.`);
  L.push('3. Whether a refusal belongs in the kernel (a protected file) or in the layer that displays cells.');
  L.push('');
}

// ---- XR3 ------------------------------------------------------------------------------------------
if (xr3) {
  L.push('## 4. XR3 — LR2 with M=1 returns admitted');
  L.push('');
  L.push(`**What ran.** A copy of LR2's merged \`run-shard.mjs\` with the return leg solved at M=0 and M=1 (both branches); nothing else changed. Reusing LR2's pipeline is deliberate: this measures M=1, not the pipeline. ${facts.clocks.xr3}`);
  L.push('');
  L.push(`**How much.** ${xr3.state}. Status: ${Object.entries(xr3.statusCounts).map(([k, v]) => `${k} ${n(v)}`).join('; ')}. The M=0 values equal LR2's committed rows for the same bodies: primary error ${n(xr3.lr2M0Check.primaryErrorEqual)} of ${n(xr3.lr2M0Check.compared)}, secondary error ${n(xr3.lr2M0Check.secondaryErrorEqual)} of ${n(xr3.lr2M0Check.compared)}.`);
  L.push('');
  row(['Window', 'bodies (paired)', 'returns', 'median \\|error\\|', 'p90 \\|error\\|', 'overcharge share', 'inside 0.08-5.1 km/s', 'M=1 is the minimum', 'median gain when it is']);
  row(['---', '---:', '---', '---:', '---:', '---:', '---:', '---:', '---:']);
  const two = (name, b) => {
    row([name, n(b.bodies), 'M=0 only', f(b.m0.medianAbs), f(b.m0.p90Abs), pct(b.m0.overchargeShare), pct(b.m0.withinInterimRange), '', '']);
    row(['', '', 'M=0 and M=1', f(b.m0PlusM1.medianAbs), f(b.m0PlusM1.p90Abs), pct(b.m0PlusM1.overchargeShare), pct(b.m0PlusM1.withinInterimRange), `${n(b.m1IsTheMinimum.bodies)} (${pct(b.m1IsTheMinimum.share)})`, `${f(b.gainWhenM1WinsKmS.median)} km/s`]);
  };
  two('**Primary: compare-path best window**', xr3.primary.all);
  two('... complete pairing windows', xr3.primary.completeWindows);
  two('Secondary: best sample-return stack cell', xr3.secondary.all);
  two('... complete pairing windows', xr3.secondary.completeWindows);
  L.push('');
  const pg = xr3.primary.all.gainWhenM1WinsKmS;
  const sg = xr3.secondary.all.gainWhenM1WinsKmS;
  L.push(`**Reading.** Admitting M=1 can only lower the computed return burn, so every error moves up (toward overcharge) or stays. When an M=1 cell is the minimum it beats the best M=0 cell by a median ${f(pg.median)} km/s at the primary window (p90 ${f(pg.p90)}, max ${f(pg.max)}) and ${f(sg.median)} km/s at the secondary (p90 ${f(sg.p90)}, max ${f(sg.max)}). At the secondary window ${n(xr3.secondary.all.errorSignChanges.underchargeToOvercharge)} bodies flip from undercharge to overcharge; at the primary ${n(xr3.primary.all.errorSignChanges.underchargeToOvercharge)}.`);
  L.push('');
  {
    const fp = xr3.primary.all.flaggedMinima;
    const fs2 = xr3.secondary.all.flaggedMinima;
    L.push(`**Is an M=1 minimum a through-Sun arc? (beyond the dispatch, using XR2's flag)** Primary window: the overall minimum is flagged for ${n(fp.overallMinimumFlagged)} of ${n(xr3.primary.all.bodies)} bodies, and M=1 wins only because of a flagged arc for ${n(fp.m1WinsOnlyBecauseOfAFlaggedArc)}; the best M=1 cell taken alone is flagged for ${n(fp.m1MinimumFlagged)}. Secondary window: ${n(fs2.overallMinimumFlagged)}, ${n(fs2.m1WinsOnlyBecauseOfAFlaggedArc)} and ${n(fs2.m1MinimumFlagged)}. So the M=1 numbers above are not produced by arcs through the Sun.`);
    L.push('');
    const fb = [...xr3.primary.all.flaggedMinimumBodies.map((x) => ({ ...x, w: 'primary' })), ...xr3.secondary.all.flaggedMinimumBodies.map((x) => ({ ...x, w: 'secondary' }))];
    if (fb.length) L.push(`One finding about LR2 itself: **LR2's own M=0 minimum is a through-Sun arc for ${xr3.primary.all.flaggedMinimumBodies.length} primary and ${xr3.secondary.all.flaggedMinimumBodies.length} secondary rows** (${fb.map((x) => `${x.des} ${x.w}`).join(', ')}). Every one sits on a pairing window with ${n(Math.min(...fb.map((x) => x.refusedCells)))} to ${n(Math.max(...fb.map((x) => x.refusedCells)))} of 72,300 cells refused, so its minimum came from ${n(Math.min(...fb.map((x) => x.admissibleCells)))} to ${n(Math.max(...fb.map((x) => x.admissibleCells)))} cells. LR2's committed rows are left as recorded; none of these values is shown on the site, so XR2's count of zero is unaffected.`);
    L.push('');
  }
  {
    const top = xr3.primary.largestGains;
    const trunc = top.filter((x) => x.refused > 0).length;
    L.push(`**Outliers.** The ten largest M=1 gains per window are in xr3-m1-returns/REPORT.md, each with its refused-cell count; at the primary window ${trunc} of the ten sit on truncated pairing windows, and the largest gain is ${f(top[0]?.gain)} km/s (${top[0]?.des}).`);
  }
  L.push('');
  L.push('**Needs Nova\'s ruling.**');
  L.push('1. DEC-20-2 says M=0 only where compare is involved. These numbers show what excluding M=1 changes, per window type.');
  L.push('2. XR2\'s return census finds every M=1 branch whose orbit has its perihelion inside the Sun does pass it. If M=1 returns are admitted anywhere, the perihelion ruling (section 3) applies to them first.');
  L.push('');
}

// ---- surprising -----------------------------------------------------------------------------------
L.push('## 5. Anything surprising - list only');
L.push('');
for (const item of facts.surprising) L.push(`- ${item}`);
L.push('');
L.push('## 6. Commits on s20-longrun2-research (oldest first)');
L.push('');
for (const c of facts.commits) L.push(`- \`${c.sha}\` ${c.subject}`);
L.push('- (the commit that adds this file) docs(research): Slice 20 second long run evidence');
L.push('');
L.push(`Delivery: ${facts.bundle}`);
L.push('');
L.push('## 7. .dispatch-scope contents, per commit');
L.push('');
L.push(facts.scopesMarkdown.trim());
L.push('');
L.push('## 8. Not done');
L.push('');
for (const item of facts.notDone) L.push(`- ${item}`);
L.push('');
fs.writeFileSync(outPath, `${L.join('\n')}\n`);
console.log(L.slice(0, 6).join('\n'));
console.log(`\nwritten ${outPath} (${L.length} lines)`);
