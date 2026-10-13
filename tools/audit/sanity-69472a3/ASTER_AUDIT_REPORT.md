# Aster repository sanity audit

**Repository:** `hudsonclavin-cloud/asteroid-mining-planner`
**Audited commit:** `69472a35bc3aef706edbc5c941ec734e13922b1d` (`main`, `origin/main` identical, worktree clean)
**Environment:** Linux container, Node v22.22.0
**Method:** 20 independent domain readers, 6 child sessions, adversarial two-lens verification

---

## 1. Method, and what it cost

Twenty readers each took one slice of the corpus — routers, invariants, the math core,
the catalog, each slice's founding document, the MCP server, the test suite, the legacy
app, the research corpus, the user-facing copy — and read it against the code. None saw
another's work. Every reader built a ledger of the concrete facts its domain asserts and
checked each with a command.

Findings then went through two independent verifiers: one asked *does this reproduce from
scratch?*, the other was told to **try hard to refute it** — to look for a charitable
reading, a correction already recorded elsewhere, an inflated severity, or a misread.
Lower-severity findings got a single combined pass.

Three things about the method are worth stating plainly, because an audit that hides its
own limits is the thing this repository exists to argue against.

**The swarm had to be rebuilt twice.** The first run exhausted its usage credits partway
through, and a later run hit a session limit. Of the original twenty readers, eight
finished the first time. The rest were re-run, and two reports that had been written to
disk but lost their structured return were transcribed rather than re-derived.

**One reader spawned six real cloud sessions.** The test-suite reader found it had no
in-process sub-agent tool and used the cloud-session API instead, creating six sibling
sessions (`D3-SA-A` … `D3-SA-F`) that partitioned the 81 test files between them. That
was not planned. It cost about $71 and it produced the single best body of work in the
audit, because those containers had outbound network and could run
`git fetch --deepen=2000` to recover the 873 commits of history the default shallow clone
hides. Their findings are folded in and labelled.

**The clone is shallow by default.** Fifty commits, root `2eaf936` of 2026-09-09. Early
readers marked roughly forty STATUS.md hashes unverifiable for this reason alone. A later
session deepened the clone and resolved them; those verdicts are now settled, not unknown.

---

## 2. The verdict

**The V2 math is sound. The V2 record of it has drifted. And what the public actually lands
on is neither — it is the V1 app, outside the typechecker, outside the test suite, and
outside the honesty layer entirely.**

On the first point the evidence is strong and consistent. An independent re-derivation of the
Izzo Lambert algorithm, a scratch universal-variable propagator checked against the solver over
2,404 cases, a re-run of the Kepler sweep, independent checks of the DV algebra and the colormap
anchors — none found a defect in the shipped V2 numerical core. The Lambert solver reproduces
its committed oracle artifacts to the last bits of a double; its T_min computation matches a
200,001-point dense scan to 5.8e-16; the Kepler solver's true residual is 1.8e-15 radians. The
one genuine V2 physics defect found anywhere is in the renderer, where every planetary rotation
axis is 59 to 115 degrees from its true orientation because a pole on local +Y is tilted about X
in a frame whose north is +Z.

On the second, roughly seven in ten surviving findings are a stale statement, a wrong number in
prose, or two repository sources contradicting each other with neither marked as superseding.
That matters more here than in most codebases for a reason specific to how this project is
built: every agent session bootstraps by reading `AGENTS.md` and `STATUS.md` and believing them.
Those files are not documentation about the system, they **are** the control plane. A stale
`STATUS.md` is not debt, it is a wrong instruction to the next dispatch.

The third point is the one I did not expect and would not have found without reaching the last
domain. The honesty layer — the project's whole claim to be worth taking seriously — governs
`/v2/`. The site root serves the legacy V1 application, which carries the ROI marketing copy,
contains every economic claim the project ships, is excluded from `tsconfig.json`, is covered by
no test, and values whole asteroids at terrestrial spot price with no saturation caveat. Its
"REALIZABLE NPV (demand-adj. 10yr sell, 8% discount)" returns the undiscounted paper value for
water. Its three-stage propellant model understates launch mass by up to 3,557x.

So the audit's single sharpest sentence is this: the repository states its governing principle
at `src/v2/app/catalog-list/honesty-disclosure.ts:10-12` — *"no claim is made before the data
that would back it exists"* — and the page a visitor reaches first breaks that principle on its
largest number.

## 3. What is sound, measured

| Gate | Command | Result |
|---|---|---|
| Typecheck | `node node_modules/typescript/bin/tsc --noEmit` | exit 0, clean |
| Full suite | `node tools/run-tests.mjs` | 81/81 files, 304 passed, 0 failed, 1 skipped |
| Build reproducibility | `npx vite build --outDir <scratch>` | all 50 artifacts byte-identical to `docs/` |
| Lambert vs its oracles | re-solve the pinned cells | bit-identical; poliastro rows reproduce to 3.98e-16 |
| Lambert BVP closure | 2,404 independent propagations | worst position residual 6.82e-11 relative |
| T_min (multi-rev) | 84 cases vs a dense scan | worst relative difference 5.8e-16 |
| Kepler residual | 17,280 solves, wrapped | 1.7763568394002505e-15 rad, 0 throws |
| Additive-only discipline | full history, three methods | **zero deletions, ever**, in every guarded document |
| STATUS.md commit hashes | deepened clone, all 84 tokens | every real hash resolves and is correctly described |

Two of these deserve emphasis because they are the opposite of what an auditor expects to
find. The additive-only founding documents have **never** lost a line — not once, across
923 commits, verified by per-commit numstat that would catch a delete-and-re-add inside a
single commit. And every commit hash STATUS.md cites is real and accurately described.
The historical record is honest; it is the *current-state* record that has drifted.

---

## 4. Theme 1 — The honesty layer contradicts itself where users can see it

These are the most serious findings in the audit, because they are the product failing at
the one thing it claims to do.

**The ΔV stack overcharges by 74% in the default mode.** `delta-v.ts:34-53`'s
`buildDeltaVStack` always adds the sample-return departure burn. `DEC-7`
(`SLICE_11_FOUNDING.md:117`, LOCKED) scopes that line to sample return only. The cost card
twenty-five lines away in the same file *does* respect the selected mode
(`main.ts:428-429`); the ΔV stack panel does not. At the default body's displayed minimum
cell, in the default one-way mode, the headline total ΔV reads about 74% high.

**The guided tour contradicts the band model on the same screen.** The FK3 tour
(`fk3-guided-tour.ts:35`) tells the user an AMBER cell "flies only with a dogleg".
`feasibility.ts:61-64` defines AMBER as direct-but-penalized and RED as dogleg-required,
and `DEC-13-3` prices AMBER at zero added ΔV — which the cost card rendered at the same
moment states verbatim. Two shipped strings, same page, opposite claims.

**The porkchop page advertises a year of departures the grid does not have.**
`main.ts:637` renders "Grid spans 2026–2040 departures". `GRID_PARAMS.depEndJD` is
`2040-01-01`, so the grid holds one instant of calendar 2040. The screening cache that
produces the catalog badge runs to 2040-12-31, and **8.11% of the catalog's cached best
windows fall outside the grid the page draws**. This one was already on the Slice 19 list
as an honesty defect; the audit's contribution is the measured consequence.

**The compare page's size note uses the wrong albedo factor.** `compare/main.ts:205,:240`
applies 2.93 as a shrink factor from the 0.14 point estimate. 2.93 is √(0.60/0.07), the
ratio between the two X-complex extremes. From 0.14 to 0.60 the correct factor is
√(0.60/0.14) = 2.07. No displayed value shrinks by 2.9×.

**The validation card misdescribes its own headline measurement.** The
`lambert-multirev-magnitude` row says the 3.60e-12 figure is "magnitude only … not the
vector directions". The generating script compares the solver's heliocentric **v1 and v2
vectors** against poliastro component-wise and by norm; the string "C3" appears once in the
whole file, in an unrelated note. Both halves of the user-facing sentence are false, and
the next row's narrative ("closes the magnitude-only gap above") is built on the false
premise. The error is conservative — the card claims less than was proven — but it is a
false statement about evidence on the surface whose only job is describing evidence.

**The catalog can render an empty state that is a lie.** `catalog-list/panel.ts:86-100`
returns no rows whenever the tier signal is null, and the empty-state chooser never
consults that signal. If `tier-sizing-per-body.json` fails its count check or simply
arrives after the screening cache — 10.9 MB against 34.5 MB, both fetched eagerly — the
user is told "No bodies match the current filters" for a catalog of 41,906 bodies.

---

---

## 4a. Theme 0 — The deployed site root is a different product with different standards

This is the finding that reframes the rest, and it was the last domain the audit reached.

`docs/index.html` is the GitHub Pages root. It still serves the **legacy V1 application**,
whose `og:description` reads "The Bloomberg Terminal of space resource extraction. Find your
asteroid, plan your burn, calculate your ROI." The disciplined V2 work — the honesty layer,
the fidelity tiers, the disclosure strings, the validation card — lives one directory down,
at `/v2/`.

A word-boundary grep over `src/v2/**` finds **zero** occurrences of ROI, NPV, revenue,
platinum, profit, commodity or dollar. V2 makes no economic claim at all. Every economic
claim Aster ships is on the root page, produced by `src/economics/**`, and that tree is
excluded from the typechecker:

```
"exclude": ["node_modules","dist","physics.worker.js","worker","src/data","src/economics",
            "src/main.ts","src/physics","src/renderer","src/state","src/styles","src/ui",
            "src/utils","src/workers"]
```

So "tsc clean" — a gate in CI and a line in every status report — certifies `src/v2` and
nothing else. The reader that removed those excludes measured 21 real type errors behind
them, including a call with a missing required argument and a handler that is invoked but
never defined.

What the economics layer then does, measured by compiling and **running the repository's own
functions** rather than by reading them:

- **`computeWholeBodyValueSummary` values an asteroid's entire mass at terrestrial spot
  price.** For 1580 Betulia, an object in the repo's own shipped fallback catalog, it returns
  $1.90e14 in Earth mode and $1.14e18 in space mode — about **10,320× world GDP**, water alone
  $6.64e17. A 1 km M-type holds 1,632 years of global platinum production, priced at spot. A
  repo-wide grep finds no market-saturation or price-collapse caveat anywhere outside `docs/`.
  This is the largest number the page displays and the one its value filter sorts on.
- **"REALIZABLE NPV (demand-adj. 10yr sell, 8% discount)" returns the undiscounted paper
  value** for water and for every unknown spectral type. `npv/index.ts:38` returns
  `returnedKg * spotPricePerKg` whenever the commodity has no annual-market entry, skipping
  both the elasticity correction and the discounting the label promises. `annualMarketKg.water`
  is null, so C-types — whose primary commodity is water — always take that branch. For Betulia
  the page shows the same figure for PAPER VALUE and for REALIZABLE NPV.
- **The elasticity model compares ore kilograms against a refined-commodity market.** M-type
  ore is 0.010 wt% PGM, so 2,000 kg of ore holds 0.2 kg of platinum — but the whole 2,000 kg is
  added to the platinum market in the price-impact term, a ~10,000× overstatement, while the
  price applied is the blended ore price.
- **The three-stage propellant calculation sizes every stage against dry mass alone.** In a
  serial stack each lower stage must lift the stages above it. Correct staging with the same
  three specific impulses gives an initial mass of 5.40e7 kg at ΔV = 30 km/s where the code
  gives 3.24e5 kg — a factor of 167, rising to 3,557× at 45 km/s. Launch cost scales directly
  from that number, and the error is largest exactly where the branch fires.
- **Two incompatible unsourced price tables coexist**, differing by up to 2,672×, and the same
  asteroid gets two different masses up to 3.53× apart depending on which planner runs.
- **No economic constant in the repository is sourced.** Every `Source:` comment cites a line
  range in `index.html`, and `DATA_SOURCES.md` documents none of them.

The contrast is the point. `src/v2/app/catalog-list/honesty-disclosure.ts:10-12` states the
project's governing principle: *"no claim is made before the data that would back it exists."*
The root page — the first thing any visitor sees — violates that principle on its most
prominent number, using a code path the typechecker does not read and the test suite does not
cover.

---

## 4b. Theme 0b — Every rendered planetary axis points the wrong way

The oblate-body meshes put their pole on local **+Y** (`mesh.scale.set(1, polarScale, 1)` in
all three oblate modules; the ring geometry's normal is +Y and the code records
`localPlaneNormalAxis: 'Y'`). The scene basis is ICRF with **+Z** as celestial north. The only
tilts applied anywhere are two `rotation.x` assignments. Rotating a +Y pole by θ about X leaves
it at 90° − θ from +Z, not θ.

I reproduced this directly against the repo's own three.js build:

| body | design doc says | actual angle from ICRF +Z | true pole (pck00010) |
|---|---|---|---|
| Saturn rings and figure | 26.7° | **63.30°** | 6.46° from +Z |
| Mars figure | 25.19° | **64.81°** | 37.11° from +Z |
| Jupiter figure | 0° ("along Z") | **90.00°** | 25.51° from +Z |

Earth, the Moon, Mercury, Venus and all eleven moons are plain spheres in no tilt group, so
their texture poles also sit on ICRF +Y — 90° from the celestial pole.

Two things are *not* wrong, and it matters for the diagnosis: the flattening magnitudes are
exact, and the radii match the cited kernel exactly. The defect is purely the orientation of
the axis in the scene basis. Separately, the two values themselves are obliquities measured to
each planet's **orbital** plane, used as angles from the **ICRF Z** axis — two different
reference planes — and the repo vendors `pck00010.tpc`, which carries the correct pole right
ascension and declination for every body and is never read.

The regression test that `V2_FOUNDING_DOCUMENT.md:1470` presents as the fix for exactly this
class of defect cannot fail.

---

## 5. Theme 2 — The agent control plane is stale in load-bearing ways

**`STATUS.md` is 36 commits behind on exactly the facts agents are told to trust first.**
It pins `origin/main` at `81252f2` and local HEAD at `3d395fb` on branch
`claude/s18-close-out`, "NOT merged". In fact `origin/main == HEAD == 69472a3`, that branch
no longer exists, and its work is in linear history. Of the thirteen bundle names in the
deploy-boundary paragraph, one still exists. `AGENTS.md` §2 instructs every session to stop
if HEAD does not match STATUS — a session following that rule today stops on a false alarm.

**`README.md` asserts the opposite of the repository's headline result.** Lines 118-119:
"Status: designed; instrument corrected; **no data collected; no results exist**." The repo
holds a sealed, pre-registered, closed study: DOI 10.5281/zenodo.21752617, 468 runs, zero
provider errors, results in `SLICE_16_FOUNDING.md` §30 and tracked ledgers. The README is
the front door and the only one of these a visitor reads.

**A committed audit whose summary is refuted is still cited as current.**
`REPO_AUDIT_2026-07-31.md` says there is no root README, that every run ledger is
untracked, and cites a path that does not exist. All three are false at HEAD; all fourteen
ledgers are tracked. The file carries no supersession banner and is actively cited by
STATUS, the RUNBOOK and the Slice 16 remediation report.

**`HANDOFF.md`** (2026-07-10) is still routed to by `AGENTS.md` §5 and still asserts that
tracked artifacts are missing. The 2026-08-03 audit rated this HIGH; nothing changed.

**The cleanup queue and "Next Session" list work that is already done** — C1 (CRLF
normalization, done at `e70c00b`), C17 (the hook bug, fixed at `f7b19e7` twenty minutes
after it was written down), C12 (ruled WONTFIX in 2026-08), the Slice 19 payload item
(landed at `69472a3`), and the branch merge itself.

---

## 6. Theme 3 — Evidence that cannot be re-run, does not exist, or does not say what it is cited for

**Nine HIGH findings are carried as open with no recoverable statement of what they are.**
`STATUS.md:406` cites sweep `S-REPO-SWEEP-2026-08-04-A` with nine HIGH findings and names
six by number only (R-03, R-04, R-05, R-13, R-16, R-17). No sweep report, no findings
table, and no definition of R-01…R-17 exists anywhere in the repository. The only two files
that mention the marker are the two that cite it.

**Every Slice 18 measurement script is unrunnable from a clone.** All fourteen executables
in `tools/slice18-research/` hardcode one machine's paths:

```
const REPO  = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = 'C:/Users/hudso/Documents/aster-slice18/build-v2x';
const OUT   = 'C:/Users/hudso/Documents/aster-slice18/audit/audit-1-results.json';
```

They read a build tree that is not in the repository and write outside version control.
INV-034 requires evidence to be git-tracked; these are tracked. But tracking a results file
whose generator runs on exactly one laptop satisfies the letter of the invariant while
defeating its purpose, and the next finding is what that gap lets through.

**The committed Kepler artifact is the pre-correction run.**
`audit-1-results.json` records 2π where the prose says 1.8e-15, because
`audit-1-core.mjs:126-131` contains an attempted wrap that is a no-op — the ternary's two
branches are the identical expression, and the result is discarded by `void resid`. The
number itself is right and reproducible directly from the solver (I measured
1.7763568394002505e-15). `MATH_LAYER_AUDIT.md:70` discloses the aliasing bug and says it was
corrected; the corrected run was never committed, so the repo's own stated reproduce path
yields 2π. `STATUS.md:287` repeats the figure with no disclosure and calls the artifacts
"not in version control" although they are tracked.

**Three reports that closed Slice 13 decisions never existed on any ref.** A child session
enumerated all 1,283 unique paths across all 923 commits of the deepened clone:
`aster-audit-reports/` appears nowhere. Three positive controls confirm the enumeration
does reach deleted paths. The founding doc already conceded the weaker claim that the
report is untracked; the upgrade is from *untracked* to *never committed anywhere*, which
closes an open question the 2026-08-03 audit left. Context that makes it coherent rather
than alarming: that directory was always repo-external by design.

**A committed measurement records a fixture hash no checkout reproduces.**
`earth-vz-span-max.json` pins the Horizons fixture at `c91f4e50…` / 7,510,022 bytes; the
committed blob is `b278dd55…` / 7,214,102 bytes. The pinned value is the CRLF
working-copy hash. Separately, the same script's per-year table compares a value in m/s
against one stored in km/s (`:130` vs `:131`), so it records each year's **last sample**
rather than its maximum. The span maximum, computed correctly thirty lines earlier, is
unaffected.

---

## 7. Theme 4 — Tests that prove less than they are cited for

The repository's own history records tests that froze the wrong values, which is why the
test suite was audited for what it actually proves rather than whether it passes. It
passes: 81/81 files, 304 tests. The question was what the green means.

**A Slice 9 assertion compares the fixture to itself.** `v2-boundary-slice9.test.mjs:67-68`
defines a helper returning `fixture.catalog.inv014TierDistribution`, and `:91` asserts that
field equals the helper's output. Both operands are the same object. The assertion cannot
fail for any fixture content, including fabricated tier counts — and the tier distribution
is the one field INV-014 is about.

**An "independent re-implementation" is a transcription.** `STATUS.md:316` says the L1
boundary "equals an independent re-implementation of the DEC-18-6 criterion", and the test
comments say it recomputes "independently of tier-sizing.mjs". The test shares the
generator's formula character-for-character, its threshold, its epoch filter and all three
input files. It is a self-consistency check presented as corroboration.

**The orbit-sampling tests cannot detect any orientation error.** All three compare only
`magnitude(sample)` against the conic radius law. The rotation they are meant to exercise is
orthogonal, so it preserves the norm exactly. An identity rotation, a transposed matrix, a
missing obliquity step or a doubled one would all pass.

**The rotation test uses the module's own constant on both sides.**
`v2-boundary-horizons.test.mjs:123-124` computes its expected values from
`core.J2000_ECLIPTIC_OBLIQUITY_RAD`, the same constant the production code uses. It
constrains the rotation's form but cannot constrain its value. (A different test does pin
the obliquity indirectly, through a frozen Vesta residual — changing it shifts that residual
by 7.034 km and fails.)

**The architecture test does not enforce the architecture.** `v2-architecture.test.mjs`
checks that no *relative* import escapes `src/v2`, and skips every non-relative specifier.
The documented wall in `AGENTS.md` §1 names five legacy directories; the test names none of
them, and the live `@`→`src/` alias bypasses it entirely.

**Three "validated" Lambert cells are frozen self-output.** `grid-compute.test.mjs` labels
them "validated", frozen at `916417e` — the same commit that introduced the module they
test. `SLICE_11_FOUNDING.md:394` says so explicitly, to its credit.

Further test findings: Jupiter and Saturn Hermite tests average zero-error anchor points
into their reported RMS (25% dilution for three bodies); a Slice 8 band distribution pins a
10,000-body tally onto a 10,008-body count and passes only because the tolerance is 10; and
a high-eccentricity convergence test asserts only `Number.isFinite`.

---

## 8. Theme 5 — Enforcement that is documented but absent

**"Hook-enforced" is false in any clone.** `AGENTS.md` §2.1 says its hard rules "are
enforced by `.githooks/`" and that "the pre-push hook blocks it". The hooks are committed
mode `100644`, `core.hooksPath` is unset, nothing in the repository sets it, and there is no
`prepare` script. Git ignores a non-executable hook and ignores `.githooks/` entirely
without `core.hooksPath`. On Windows the exec bit is not modelled, which is why it works on
one machine; `STATUS.md:507` records the chmod as living only in an uncommitted working
tree. In a Linux container — what every cloud agent session runs in — none of §2.1 has a
mechanical backstop, while the document tells the agent one exists.

When the hooks *are* installed, they work: a clone test confirmed every documented block
fires, including bullet deletions, out-of-scope paths and protected paths.

**Four invariant documents claim runtime enforcement that the code does not perform.**
INV-008 through INV-011 each say the bar is "called on every interpolated state before it is
returned to any caller". `assertInterpolationError` has no non-test call site in `src/v2`.
The bars are enforced by the cutover tests only. INV-012 and INV-013 document the real
policy ("production runtime intentionally does not enforce…"), contradicting their four
siblings.

---

## 9. Theme 6 — Identifier collisions and index drift

`INVARIANTS.md:187` summarises INV-017…020 as "one component, worker-only compute,
bookmarkable URL, no partial renders". "No partial renders" is not an invariant in the
source document; INV-019 — a real containment rule requiring multi-rev Lambert code to live
in `src/v2/core/lambert/` under its own audit — is missing from the index entirely. The
in-repo audit skill cites "INV-019" for a third meaning.

INV-014 is defined twice with unrelated meanings (star background, and the Slice 9 tier
contract) and both are cited by live tests. INV-007 is referenced and typed but never
defined. INV-015 still describes the solver as "PyKEP source code, compiled to
WebAssembly", which `DEC-1 Revision 2` replaced with a clean-room TypeScript implementation
and which `INV-024` now forbids; the amendment INV-015 demands of itself was never written.
`GM_SUN` is attributed to DE430 in five tracked places; `1.32712440018e20` is the
DE405-era value. The `src/v2/research/` folder names encode a slice plan roughly eight
slices out of date.

---

## 10. What I could not verify

- Anything requiring outbound network to an external oracle: a poliastro re-run, the npm
  registry state of `aster-mission-mcp@0.1.0`, the IERS leap-second table, live GitHub
  Actions history. A child session correctly declined to widen its own network allowance
  when asked.
- Whether the repo-external `aster-audit-reports/` files exist on the owner's machine.
- Browser-dependent behaviour: the live site, the pointer-binding defects recorded from
  manual testing, and anything needing a headless run.
- The 2026-08-04 sweep's nine HIGH findings, which cannot be verified because their
  statement does not exist.


---

## 10a. Verification status of this report

Every finding below carries a "checked" count: the number of independent verifier passes it
received. 2 means both a reproduction lens and a refutation lens ran against it.

- **80 findings** have been through adversarial verification. Of those, **4 were refuted
  outright** and are excluded from the register, and roughly a third were corrected or
  downgraded. That attrition is the point of the exercise.
- **14 HIGH findings** — the legacy-economics set and the honesty-surface set — were still in
  the verification queue when this report was written. I verified their load-bearing claims
  personally instead, by compiling and running the repository's own functions; those
  reproductions are quoted in §15.
- The remaining lower-severity findings are single-source. They are reported as what one
  careful reader found and reproduced, not as adjudicated fact.

Two refutations are worth naming because they show the repo doing something right. A reader
reported that `INVARIANTS.md` still labels the Lambert excess vectors "heliocentric ECLIPTIC"
with no annotation. It does carry that label — but the same file carries a dated additive
amendment naming those exact lines and saying "That label is wrong and is superseded by
measurement". The reader had searched the top of the file and missed the correction at the
bottom, which is precisely where an additive-only document must put it. The convention worked;
a partial read defeated it. Similarly, a reported missing payload caveat on AMBER cells turned
out to be rendered in the pinned-cell readout in the deployed bundle.

---

## 11. What to do, in order

The ordering below is by *consequence if left alone*, not by effort. Items 1 and 2 are
cheap and block the most downstream damage.

### First — stop the control plane lying to the next session

1. **Rewrite `STATUS.md`'s Git State, Push state and Deploy boundary from commands, not
   memory.** It is the documented exception to the additive-only rule, so it can simply be
   corrected. While there: strike the completed cleanup items (C1, C12, C17), strike the
   "Next Session" entries the same file records as done, fix the Identity path to the
   Windows laptop, and remove the "artifacts not in version control" sentence for artifacts
   that are tracked.
2. **Fix `README.md`'s Slice 16 status line.** One sentence, and it currently tells every
   visitor the opposite of the repository's headline result.
3. **Put a supersession banner on `REPO_AUDIT_2026-07-31.md` and `HANDOFF.md`**, or stop
   routing to them from `AGENTS.md` §5. A refuted audit that is still cited is worse than
   no audit.

### Second — the user-visible honesty defects

4. **The ΔV stack's mode bug** (`delta-v.ts` / `main.ts:404`). A shipped number is ~74% high
   in the default mode. This is a product defect, not a documentation one, and it is the
   single finding most corrosive to the honesty-layer claim.
5. **The FK3 tour's AMBER/dogleg sentence**, which contradicts the cost card on the same
   screen.
6. **The porkchop grid literal** (`main.ts:637`) — already on the Slice 19 list; the audit
   adds that 8.11% of cached best windows fall outside the advertised span.
7. **The compare-page albedo factor** (2.93 where 2.07 is correct).
8. **The validation card's `lambert-multirev-magnitude` note**, which misdescribes a vector
   comparison as magnitude-only.
9. **The catalog's empty state** when the tier artifact is missing or late: distinguish
   "no matches" from "tiers not loaded".

### Third — make the evidence re-runnable

10. **De-hardcode the fourteen `tools/slice18-research/` scripts.** Take the repo root from
    the script's own location and write results beside themselves. Until that happens no one
    can regenerate or falsify any Slice 18 number, and that gap is exactly what let the
    uncorrected Kepler artifact ship.
11. **Re-run and re-commit `audit-1-results.json`** with the wrap actually applied, or
    annotate the artifact in place to say it is the pre-correction pass.
12. **Decide what to do about the 2026-08-04 sweep.** Nine HIGH findings are carried as open
    with no recoverable statement. Either recover the report, or strike the reference and
    accept the loss explicitly — carrying nine unknowable HIGH items is worse than either.
13. **Fix the per-year unit bug in `measure-earth-vz.mjs`** and re-emit, and re-pin the
    fixture hash on the committed-blob basis rather than a CRLF working copy.

### Fourth — make enforcement real

14. **Either make the hooks work in a clone** — commit them `100755` and add a documented
    `core.hooksPath` step or a `prepare` script — **or change `AGENTS.md` §2.1 to say they
    are enforced on one machine only.** Right now the document promises a backstop that a
    Linux agent session does not have. Note the measured good news: the discipline has held
    anyway. No guarded document has ever lost a line.
15. **Fix `v2-architecture.test.mjs`** so it enforces the wall `AGENTS.md` §1 actually
    describes, including non-relative and aliased specifiers.
16. **Replace the self-comparing assertions** — the Slice 9 tier distribution, the
    "independent re-implementation" of the L1 boundary, and the orbit-sampling tests that
    cannot see an orientation error. Each is a green check that cannot fail.

### Fifth — the index and identifier hygiene

17. Correct `INVARIANTS.md:187` to describe INV-019 and drop "no partial renders"; resolve
    the INV-014 double definition; define or retire INV-007; write the INV-015 amendment
    that INV-015 itself demands; fix the `GM_SUN` DE430 attribution in all five places.
18. Annotate `SLICE_18_FOUNDING.md` with the Front B date correction (§9 already has the
    mechanism and the precedent in C-3).
19. Rename or annotate the `src/v2/research/` folders so they stop encoding a slice plan
    eight slices out of date.

---

## 12. One structural suggestion

Most of what this audit found is the same failure repeated: a fact was true when written,
the fact changed, and nothing connected the two. The repository already has the right
instinct — additive-only documents, verify-before-lock, INV-033's "report only verified
facts" — and the measured evidence is that those rules *held* where they were mechanically
checkable.

The gap is that the volatile facts live in prose. A `STATUS.md` git-state block generated by
a script at commit time, and a CI job that fails when a cited path, commit or count does not
resolve, would have caught a large fraction of these 219 findings before they were written
down. That is a smaller change than it sounds: most of the checks in this audit were one
command each.

---

## 14. Cross-reader convergence

Readers did not see each other's work. Where several land on the same defect from
different domains, the finding is much harder to dismiss as one reader's misreading.

| Defect | Independent readers | Orchestrator check |
|---|---|---|
| Kepler residual: committed artifact says 2π, prose says 1.8e-15 | A1-F03, B2-F05, C2-F02 (3) | Reproduced from a scratch compile: raw 2π, wrapped 1.776e-15 |
| STATUS git-state / deploy boundary stale, branch already merged | A1-F01, A3-F02, C2-F06 (3) | Reproduced: origin/main == HEAD, 36 commits past the pin |
| Fixture sha256 recorded from a CRLF working copy, irreproducible in any clone | A2-F03, B2-F09, C1-F15 (3) | Reproduced: artifact says c91f4e50/7,510,022; blob is b278dd55/7,214,102 |
| INV-008..011 claim runtime enforcement that the code does not perform | A2-F05, B2-F03 (2) | Not independently re-checked |
| INVARIANTS index misdescribes INV-017..020 / drops INV-019 | A2-F01, A1-F09, A2-F14 (2 readers, 3 findings) | Reproduced: SLICE_11:36 defines INV-019; index says "no partial renders" |
| INV-015 still describes the solver as PyKEP compiled to WebAssembly | A2-F02, B1-F07 (2) | Not independently re-checked |
| ci.yml header "two gates … never builds docs/" vs four jobs incl. build | A2-F15, A3-F06, D1-F11 (3) | Reproduced by reading ci.yml: typecheck, build, golden-numbers, full-tests |
| GM_SUN "DE430" label is actually the DE405 value | B2-F04, C2-F08 (2) | Not independently re-checked |
| research/ folder names encode a slice plan ~8 slices out of date | D1-F08, D2-F10 (2) | Not independently re-checked |
| INV-014 defined twice with different meanings, both cited by live tests | A2-F07, C1-F05 (2) | Not independently re-checked |
| boundary/README source map names files that do not exist | A1-F16, C1-F09 (2) | Not independently re-checked |
| ".gitignore:17" citation is off at HEAD | A2-F13, C1-F10 (2) | Not independently re-checked |

Twelve defects were found by two or more readers working from different corpora.

---

## 15. Findings the orchestrator verified personally

Every item below was reproduced directly in this container at HEAD
`69472a35bc3aef706edbc5c941ec734e13922b1d`, worktree clean, Node v22.22.0.

## Baseline health (the good news, measured)

| Gate | Command | Result |
|---|---|---|
| Typecheck | `node node_modules/typescript/bin/tsc --noEmit` | exit 0, clean |
| Full suite | `node tools/run-tests.mjs` | 81/81 files, 304 passed, 0 failed, 1 skipped, 337.6 s |
| Headline vs per-file | test-all.log | headline 304 == sum of per-file counts (no C15 discrepancy on this run) |

STATUS.md's Test State row (81 files / 304 / 1 skipped) reproduces exactly.
That row is one of the few volatile numbers in STATUS.md that is still true.

## V1 — The Kepler residual: the number is right, the committed artifact is stale

Three readers found this independently; four verifiers then reproduced it, and their
disagreement about severity sharpened it. The accurate statement is narrower than my
first draft, so I am restating it.

What everyone reproduces:

- `tools/slice18-research/audit-1-results.json` records
  `keplerSweep.worstResidualRad = 6.283185307179586` (2*pi) at `{e:0, M:-pi}`.
- The committed generator `audit-1-core.mjs:126-131` contains an attempted wrap that is a
  no-op: the ternary's two branches are the identical expression `E - e*Math.sin(E) - M`,
  and the result is discarded by `void resid;` at :131. The value actually recorded is the
  unwrapped `r` at :129.
- The 2*pi is an aliasing artefact of the harness, not a solver defect. `solveKeplerEquation`
  normalises M through `normalizeSignedAngleRadians`, which maps M = -pi to +pi, so the
  unwrapped difference is exactly 2*pi there.

My own re-run, from a scratch compile of `src/v2/core/propagators/keplerian.ts`:

```
solves        = 17280
raw worst     = 6.283185307179586 at {"e":0,"M":-3.141592653589793}
wrapped worst = 1.7763568394002505e-15 at {"e":0.1,"M":2.8099800957108707}
throws        = 0
```

So **1.8e-15 is the true figure and it IS reproducible from the repo's solver.** My earlier
phrasing, that the published evidence does not support the published number, was too strong.

What is actually defective is narrower and still real: the committed artifact and the
committed script are the pre-correction pass, so anyone following the repo's own stated
reproduce path — `MATH_LAYER_AUDIT.md:5`, "Reproduce: audit-1-core.mjs ... Results JSONs
alongside" — gets 2*pi. `MATH_LAYER_AUDIT.md:70` discloses the aliasing bug in situ and says
it was corrected; the corrected run was never committed. `STATUS.md:287` repeats
"Kepler residual <=1.8e-15 rad over 17,280 solves" with no disclosure at all, and in the same
sentence calls the audit artifacts "not in version control" although they are tracked.
`SLICE_18_FOUNDING.md:169` says those artifacts landed "so that every claim below has a
git-tracked source as INV-034 requires" — and for this claim, none does.

Classed as a stale-evidence defect. Severity MEDIUM rather than HIGH: the maths is sound,
nothing a user sees is wrong, and the markdown discloses it. It earns MEDIUM rather than LOW
because STATUS.md is the agent-facing router, repeats the number undisclosed, and
misdescribes where the evidence lives.

## V2 — Every Slice 18 evidence script is unrunnable from a clone

All 14 executable scripts in `tools/slice18-research/` hardcode one machine's
absolute paths, e.g. `audit-1-core.mjs:10-12`:

```
const REPO  = 'C:/Users/hudso/asteroid-mining-planner';
const BUILD = 'C:/Users/hudso/Documents/aster-slice18/build-v2x';
const OUT   = 'C:/Users/hudso/Documents/aster-slice18/audit/audit-1-results.json';
```

`git ls-files '*.mjs' '*.js' '*.ts' | xargs grep -ln 'C:/Users'` returns exactly
those 14 files. They read a build tree that does not exist in the repository and
write outside version control.

INV-034 requires evidence to be git-tracked. These are tracked. But tracking a
results file whose generator cannot run anywhere except one laptop satisfies the
letter of the invariant while defeating its purpose: no one can regenerate or
falsify the numbers. The Kepler defect above is what that gap lets through.

`STATUS.md:287` still says of the same audit: "Artifacts: `Documents\aster-slice18\audit\`
(not in version control)", which contradicts `STATUS.md:134` recording that the 15
artifacts were landed.

## V3 — "Hook-enforced" is not enforced in any clone

`AGENTS.md:98-102` (§2.1) says the standing rules "are enforced by .githooks/" and
"The pre-push hook blocks it". Measured here:

```
git ls-files -s .githooks
100644 ... .githooks/pre-commit
100644 ... .githooks/pre-push          <- not executable
git config core.hooksPath              <- unset (exit 1)
```

Nothing in the repository sets `core.hooksPath`, and package.json has no
`prepare`/`postinstall` that installs hooks. Git ignores a non-executable hook and
ignores `.githooks/` entirely unless `core.hooksPath` is set. On Windows the exec
bit is not modelled, which is why it works on Hudson's laptop; STATUS.md:507 records
the chmod to 100755 as living only in his uncommitted working tree.

Consequence: in a Linux container — the environment every cloud agent session runs
in, including this one — none of §2.1's "hook-enforced hard rules" has a mechanical
backstop. They rest entirely on agent compliance, while the document tells the agent
a backstop exists.

## V4 — The validation card misdescribes its own headline measurement

`src/v2/data/validation-provenance.json`, row `lambert-multirev-magnitude`, rendered
to users by `src/v2/app/porkchop/validation-card.ts`:

> value "3.60e-12" — "Magnitude only: this confirms the sizes of C3 and excess
> velocity agree, not the vector directions." solverConfig: "...magnitudes only."

What the measurement actually is: `tools/slice11-research/measurements/multi-rev-dual-oracle-validate.mjs`
`compareBranch()` (:323-334) compares the solver's heliocentric **v1 and v2 vectors**
against poliastro component-wise (`v1MaxComponentRel`, `v2MaxComponentRel`) and by
vector norm (`v1VectorRel`, `v2VectorRel`). Nothing else is compared. The string "C3"
appears once in the whole file, inside an unrelated prose note at :806. No C3 or
|v-infinity| magnitude is computed for M>=1 anywhere in it.

So both halves of the user-facing sentence are false: it was a vector comparison, and
the magnitudes it claims were checked were never checked. The error is conservative —
the card claims less than was actually proven — but it is a false statement about
evidence on the surface whose entire purpose is to describe evidence precisely, and
the next row (`dla-m1-vector`, "Closes the magnitude-only gap above") builds a
narrative on the false premise.

## V5 — README contradicts the repository's headline result

`README.md:118-119`:

> **Status: designed; instrument corrected; no data collected; no results exist.**

Against: `STATUS.md:43` "CLOSED 2026-08-02 — HAS A RESULT"; DOI 10.5281/zenodo.21752617;
`src/v2/SLICE_16_FOUNDING.md:1431` "Executed: 312 primary + 156 control = 468 runs";
and the tracked ledgers under `tools/slice16-harness/runs/`. The README is the
repository's front door and the only one of these a visitor reads first.

## V6 — INVARIANTS.md's index drops a real invariant and invents one

`INVARIANTS.md:187` summarises INV-017..020 as "one component, worker-only compute,
bookmarkable URL, no partial renders".

`src/v2/SLICE_11_FOUNDING.md:33-37` actually defines: INV-017 one component;
INV-018 worker-only compute; **INV-019 — M=1 solutions must use the Slice 10 audited
Lambert layer, production multi-rev code must live in `src/v2/core/lambert/` and pass
its own audit before integration**; INV-020 bookmarkable URL.

"No partial renders" is not an invariant in that document. INV-019 — a real
math-layer containment rule — is missing from the index entirely. Separately,
`.claude/skills/multi-agent-audit/SKILL.md` cites "INV-019" for a third meaning
("new code must not touch audited prior code"). One identifier, three meanings.

## Checked and NOT a finding (refuted during my own review)

- **ΔV stack's symmetric-return assumption.** `delta-v.ts:30-32` makes the return
  departure ΔV equal the outbound arrival v-infinity, which looked like an
  undisclosed modelling assumption. It is disclosed: `src/v2/SLICE_11_FOUNDING.md:117`
  states "Departure ΔV (sample return) = v∞_arr (matches outbound)", and
  `src/v2/SLICE_13_FOUNDING.md:31` closes OQ-13-1 with a user-visible two-state mode
  toggle, mode disclosed per INV-016e(iii). DEC-13-4 further documents why injection
  is excluded from the spacecraft ΔV when pricing with a vehicle. Not a defect.
- **INV-016c disclosure numbers.** `src/v2/app/porkchop/main.ts:944` interpolates
  `LEO_PARKING_RADIUS_KM`, `STATIONKEEPING_DV_KMPS` and `DV_MARGIN_FRACTION` directly
  from `delta-v.ts`, so the displayed assumptions cannot drift from the constants.
  The vis-viva algebra at `delta-v.ts:21-23` is correct. This is the honesty layer
  working as designed.

---

## 13. Complete finding register

326 findings survived; 4 were refuted outright and are excluded.
The "checked" column counts independent verifier passes: 2 means a reproduction lens and a refutation lens both ran.

### HIGH — 21

| id | reader | class | checked | finding | where |
|---|---|---|---|---|---|
| A1-F01 | routers & STATUS | STALE | 2 | STATUS Git State / deploy boundary stale by 36 commits; names refs and bundles that do not exist at HEAD | STATUS.md:22-28 (also :308-310, :402) |
| A1-F02 | routers & STATUS | STALE | 2 | README says the Slice 16 study has 'no data collected; no results exist' — the repo holds a sealed, closed study with results | README.md:118-125 (cf. :7-9) |
| A5-F01 | strategy & narrative | FUNDAMENTALLY_FALSE | 4 | DEVLOG's Moon "accurate to ~1-2 deg" is false by ~93 deg; the documented epoch phase is not implemented | DEVLOG.md:61,64-65 (code: physics.worker.js:120-124; index.html:1690-1692) |
| B3-F01 | adversarial numerics | FUNDAMENTALLY_FALSE | 2 | FK3 guided tour tells the user an AMBER cell "flies only with a dogleg"; the repo's own band model assigns doglegs to RED and prices AMBER at zero added delta-V | src/v2/app/porkchop/fk3-guided-tour.ts:35 (with src/v2/app/porkchop/main.ts:521-524, src/v |
| C3-F02 | Slice 17 compare & QOL | FACTUAL_ERROR | 4 | The shipped compare-page size note applies the X-complex span factor (2.93, 0.07→0.60) as a shrink factor from the 0.14 point estimate; the correct factor from 0.14 to 0.60 is 2.07 | src/v2/app/compare/main.ts:205 and :240 (renders on /v2/compare/ for every body with H) |
| C4-F01 | renderer & physical constants | FUNDAMENTALLY_FALSE | 2 | Every rendered planetary rotation axis and the Saturn ring plane are 59-115 deg from their true orientation, and the docs state an angle the code does not produce | src/v2/render/saturn-rings.md:5,24,31; src/v2/render/mars-oblate.md:9,15,40,50; src/v2/ren |
| C4-F03 | renderer & physical constants | FUNDAMENTALLY_FALSE | 2 | The top-down regression test cannot fail, and V2_FOUNDING_DOCUMENT.md:1470 presents it as the fix for exactly that defect | tests/v2-runtime-camera-presets.test.mjs:55-67,90-97; described at V2_FOUNDING_DOCUMENT.md |
| C5-F01 | honesty surfaces & user copy | FUNDAMENTALLY_FALSE | 0 | First-visit guided tour fires the AMBER variant and states the opposite of what the tool computed | src/v2/app/porkchop/fk3-guided-tour.ts:22, :37; src/v2/app/porkchop/main.ts:65-67, :521-52 |
| C5-F02 | honesty surfaces & user copy | FUNDAMENTALLY_FALSE | 0 | "Aster has not measured the screening error for this object" renders for 7 of the 17 asteroids it did measure | src/v2/porkchop/tier-disclosure.ts:27-29 (rendered at src/v2/app/porkchop/main.ts:210,221; |
| C5-F03 | honesty surfaces & user copy | CODE_BUG | 0 | Catalog shows "No bodies match the current filters" when the tier artifact fails to load | src/v2/app/catalog-list/panel.ts:86-92 and :539-548; src/v2/app/catalog-list/empty.ts:11 |
| C5-F04 | honesty surfaces & user copy | FUNDAMENTALLY_FALSE | 0 | "Total ΔV" headline always prices a sample return, unlabelled, while the mission mode says one-way | src/v2/porkchop/delta-v.ts:34-52; src/v2/app/porkchop/main.ts:905-946 (headline :913, Depa |
| D4-F01 | legacy V1 & economics | FUNDAMENTALLY_FALSE | 0 | tsconfig excludes the entire legacy src tree, so "tsc clean" certifies nothing about it; 21 real type errors are hidden from CI | tsconfig.json:21-36 |
| D4-F02 | legacy V1 & economics | FUNDAMENTALLY_FALSE | 0 | REFACTOR_MAP marks Stages 3-9 "complete" and src/main.ts as the entry point, but the extracted legacy tree is not built, not wired, and cannot run | REFACTOR_MAP.md:129-134 (headings also at :22, :54, :65, :74, :88, :109) |
| D4-F03 | legacy V1 & economics | FUNDAMENTALLY_FALSE | 0 | The deployed root page presents resource values up to 10,320x world GDP at terrestrial spot prices, with no market-saturation caveat anywhere in the repo | src/economics/pricing/active.ts:170-196, surfaced at docs/index.html:325-328 and :444-445; |
| D4-F04 | legacy V1 & economics | FUNDAMENTALLY_FALSE | 0 | "REALIZABLE NPV (demand-adj. 10yr sell, 8% discount)" returns the undiscounted paper value for water and for every unknown commodity | src/economics/npv/index.ts:38; labels at src/economics/npv/index.ts:7 and src/economics/mi |
| D4-F05 | legacy V1 & economics | CODE_BUG | 0 | The NPV elasticity model compares ore kilograms against a refined-commodity annual market, overstating market impact by ~10,000x for M-type | src/economics/npv/index.ts:41,45 fed by src/economics/mission-costs/index.ts:91 |
| D4-F06 | legacy V1 & economics | CODE_BUG | 0 | The 3-stage propellant calculation sizes each stage against dry mass alone, understating launch mass by 167x-3,557x in the exact regime that triggers it | src/economics/mission-costs/planner.ts:288-297 |
| D4-F07 | legacy V1 & economics | CONTRADICTION | 0 | Two mutually incompatible, unsourced price models in one application, differing by up to 2,672x | src/economics/pricing/active.ts:49-57 vs src/workers/physics/planner/redirect.ts:117-119 |
| D4-F08 | legacy V1 & economics | CONTRADICTION | 0 | The same asteroid has two different masses, up to 3.53x apart, depending on which planner runs | src/economics/pricing/active.ts:47 (duplicate at src/economics/scoring.ts:63-65) vs src/wo |
| D4-F09 | legacy V1 & economics | FUNDAMENTALLY_FALSE | 0 | getAsteroidDV applies the AU/yr-to-km/s factor to velocities expressed in units of circular velocity, understating heliocentric delta-V by 2*pi | src/economics/pricing/active.ts:202-217 (method label at :312) |
| D4-F10 | legacy V1 & economics | MISSING_EVIDENCE | 0 | No economic constant in the repo is sourced; every "Source:" comment cites an index.html line range, and DATA_SOURCES.md documents none of them | src/economics/** (all Source: comments); DATA_SOURCES.md:39-46, 76-81 |

### MEDIUM — 124

| id | reader | class | checked | finding | where |
|---|---|---|---|---|---|
| A1-F03 | routers & STATUS | MISSING_EVIDENCE | 2 | 'Kepler residual ≤1.8e-15 rad over 17,280 solves' is contradicted by the committed audit artifact and script (both record 2π) | STATUS.md:287; tools/slice18-research/MATH_LAYER_AUDIT.md:54,70,116; tools/slice18-researc |
| A1-F04 | routers & STATUS | STALE | 2 | Cleanup C17 (hook misses deleted bullets) and C1 (CRLF normalization) are recorded as open but were fixed/done at HEAD | STATUS.md:485 (C17), STATUS.md:469 (C1) |
| A1-F05 | routers & STATUS | STALE | 2 | Slice 19 item 2 already landed (69472a3); item 5's CRLF cause removed by e70c00b; item 1 cites a bundle name that no longer exists | STATUS.md:427-430 (item 2), :452-461 (item 5), :425 (bundle name) |
| A1-F06 | routers & STATUS | CONTRADICTION | 2 | 'Next Session' repeats items the same file records as done (OQ-17-5/-9/-4, D-07, §8 close, Node unify, branch merge) | STATUS.md:395-398, :402 |
| A1-F07 | routers & STATUS | CONTRADICTION | 2 | STATUS Identity names a retired macOS path as the canonical repo while the same file says the environment is a Windows laptop | STATUS.md:12 vs :83, :162, :347, :404; HANDOFF.md:4 |
| A1-F08 | routers & STATUS | STALE | 2 | HANDOFF.md (2026-07-10) is still routed to by AGENTS §5 and carries multiple now-false claims with no supersession banner | HANDOFF.md:3-8, :59, :67-71, :85-92; AGENTS.md:198 |
| A1-F09 | routers & STATUS | CONTRADICTION | 2 | INVARIANTS.md registry line for INV-017..020 does not describe INV-019 | INVARIANTS.md:187 vs src/v2/SLICE_11_FOUNDING.md:33-37 |
| A2-F01 | invariants vs code | FACTUAL_ERROR | 2 | INVARIANTS.md index misdescribes INV-019 as 'no partial renders' | INVARIANTS.md:187 |
| A2-F02 | invariants vs code | STALE | 2 | INV-015 text still says the solver is PyKEP compiled to WebAssembly; no amendment despite its own requirement | src/v2/SLICE_10_FOUNDING.md:51 |
| A2-F03 | invariants vs code | STALE | 2 | Committed evidence pins a fixture sha256/byte count that no checkout of the repo reproduces (measured on a CRLF working copy) | tools/slice12-research/data/earth-vz-span-max.json:9-10 (and src/v2/SLICE_12_FOUNDING.md:1 |
| A2-F05 | invariants vs code | FUNDAMENTALLY_FALSE | 2 | Invariant docs describe runtime enforcement paths the code does not implement (interpolation error, INV-001/003 enforcers) | src/v2/core/invariants/INV-008.md:46 (also INV-009.md:52, INV-010.md:55, INV-011.md:71); s |
| A2-F09 | invariants vs code | STALE | 2 | INVARIANTS section 4 says DLA is 'not yet in production' and no DEC is locked | INVARIANTS.md:134-137 |
| A3-F01 | build/deploy/CI/hooks | FUNDAMENTALLY_FALSE | 2 | "Hook-enforced" rules are not enforced in any fresh clone: hooks are committed non-executable and nothing installs them | AGENTS.md:98-102 (also STATUS.md:29, STATUS.md:507) |
| A3-F02 | build/deploy/CI/hooks | STALE | 2 | STATUS.md Git State / Push state / Deploy boundary are 17 commits and three docs rebuilds stale, unannotated | STATUS.md:22-28 (:22, :23, :25, :26, :28) |
| A4-F02 | prior audits & queues | MISSING_EVIDENCE | 4 | The 2026-08-04 sweep report (9 HIGH findings, R-01..R-17) does not exist in the repository | STATUS.md:406 (also cited at SLICE_17_FOUNDING.md:420-423) |
| A4-F04 | prior audits & queues | STALE | 2 | Cleanup C17 describes an additive-only hook bug that was fixed at f7b19e7, and instructs agents to work around it | STATUS.md:485 |
| A4-F07 | prior audits & queues | STALE | 2 | Cleanup C12 was ruled WONTFIX on 2026-08-02 and is still carried as an open queue item | STATUS.md:480 |
| A4-F09 | prior audits & queues | FACTUAL_ERROR | 2 | The GM_SUN constant is attributed to DE430 in five tracked places; 1.32712440018e20 is the DE405/IAU-1976 value, and the repo contradicts itself | tools/slice18-research/MATH_LAYER_AUDIT.md:47 (also tools/slice18-research/audit-3-results |
| A4-F13 | prior audits & queues | STALE | 2 | The Slice 19 carried-forward list and the deploy boundary describe a build that HEAD replaced | STATUS.md:427-430 (item 2), STATUS.md:425 (item 1's shipping proof), STATUS.md:28 (deploy  |
| A4-F14 | prior audits & queues | STALE | 4 | REPO_AUDIT_2026-07-31.md is a committed, actively-cited audit whose executive summary is refuted at HEAD and which carries no supersession banner | tools/audit/REPO_AUDIT_2026-07-31.md:10, :13, :549-553 |
| A4-F15 | prior audits & queues | STALE | 2 | STATUS routes the next session to a queue that declares itself superseded, which forwards to a queue that is itself stale | STATUS.md:399 -> tools/slice16-harness/CLOSE_REPORT.md:164 -> tools/slice16-harness/ARCHIV |
| A4-F18 | prior audits & queues | STALE | 2 | src/v2/SLICE_V1_STATUS.md describes tracked renderer code and tracked textures as untracked / blocked | src/v2/SLICE_V1_STATUS.md:13-14, :22-25, :27 |
| A5-F02 | strategy & narrative | STALE | 2 | Three further stale statements in the same DEVLOG Moon block (worker vs main thread, period value/label, nodal precession) | DEVLOG.md:55-56,60,64 |
| A5-F04 | strategy & narrative | CONTRADICTION | 2 | REFACTOR_MAP calls six stages "complete" while their rows are unfinished, and Stage 9's output is unreferenced dead code excluded from typecheck | REFACTOR_MAP.md:22,54,74,88,109,129 (headings) vs :52,61,83,84,85,97,100,123,134 (pending  |
| A5-F05 | strategy & narrative | FACTUAL_ERROR | 2 | gooding.ts contains the Bate-Mueller-White solver, and its REFACTOR_MAP source range is wrong and self-overlapping | REFACTOR_MAP.md:35 (also DEVLOG.md:122-123) |
| A5-F07 | strategy & narrative | FACTUAL_ERROR | 2 | NOTICE gives a non-existent distribution path for the Horizons ephemeris fixture | NOTICE:41 |
| A5-F13 | strategy & narrative | STALE | 2 | The Slice 21 QOL backlog still lists as open four Tier-1 items and three nits that shipped in Slice 17 | strategy/SLICE21_QOL_BACKLOG_TRIAGED.md:42-48,52-64,98-109 and strategy/RESEARCH_LEDGER_20 |
| B1-F02 | Lambert (mathematician) | FACTUAL_ERROR | 2 | Product-facing provenance mis-describes the 3.60e-12 multi-rev figure as 'magnitudes of C3 and excess velocity ... magnitudes only, not the vector directions'; it is a per-componen | src/v2/data/validation-provenance.json rows[lambert-multirev-magnitude] (measures/solverCo |
| B2-F02 | core math, frames, time | FUNDAMENTALLY_FALSE | 2 | DLA_RESEARCH_SUMMARY.md §3/§4 still instruct the rejected obliquity rotation and the inverted dogleg test, unannotated | tools/slice12-research/DLA_RESEARCH_SUMMARY.md:39-45 and :54 (errata exist only at :12 and |
| B2-F03 | core math, frames, time | FUNDAMENTALLY_FALSE | 2 | INV-008..011 and invariants README claim runtime enforcement inside core/interpolators and core/propagators that the code does not perform | src/v2/core/invariants/INV-008.md:46; INV-009.md:52; INV-010.md:55; INV-011.md:71; src/v2/ |
| B2-F05 | core math, frames, time | MISSING_EVIDENCE | 2 | Committed audit artefacts contradict the Kepler-residual claim (2π in JSON vs 1.8e-15 in prose) | tools/slice18-research/audit-1-results.json:52; tools/slice18-research/audit-1-core.mjs:12 |
| B3-F02 | adversarial numerics | STALE | 0 | main.ts's "measured recon" justification for the FK3 showcase names a cell that is not the displayed grid's minimum and reports the wrong feasibility verdict | src/v2/app/porkchop/main.ts:65-68 |
| B3-F03 | adversarial numerics | STALE | 0 | segment-windows.ts still carries its UNAUDITED quarantine header and the claim that only tests import it, seven weeks after G-A2 closed and after a shipped route began importing it | src/v2/porkchop/segment-windows.ts:1-7 |
| B3-F04 | adversarial numerics | FUNDAMENTALLY_FALSE | 0 | SLICE_11_FOUNDING states twice that the porkchop needs Earth samples to ~2045; the pipeline never samples Earth after departure and the shipped 2026-2040 fixture is sufficient | src/v2/SLICE_11_FOUNDING.md:161 and :168 |
| B3-F05 | adversarial numerics | CONTRADICTION | 2 | The delta-V stack panel always charges a sample-return departure burn, including in the default one-way mode; at the default body's displayed minimum cell the headline Total delta- | src/v2/porkchop/delta-v.ts:34-53; src/v2/app/porkchop/main.ts:404, :925-926, :944 |
| B3-F06 | adversarial numerics | MISSING_EVIDENCE | 0 | INV-016c's model assumptions (impulsive, patched-conic, no gravity assists, no SEP) are disclosed nowhere on the porkchop route; INVARIANTS.md's index line restates the invariant f | INVARIANTS.md:184 vs src/v2/SLICE_11_FOUNDING.md:28 and :63; implementation at src/v2/app/ |
| B3-F07 | adversarial numerics | CODE_BUG | 0 | The 6th parameter of the production Lambert entry point is named `lw` (long way) but is consumed as `prograde` | src/v2/core/lambert/lambert-multi-rev.ts:282 and :291 (mirrored in the LambertSolver type  |
| B3-F10 | adversarial numerics | CODE_BUG | 0 | assertFiniteNumber in the catalog ingestion accepts null (and '', false, []) as 0; the shipped catalog's one null element is silently ingested as mean anomaly 0 | src/v2/boundary/slice9-nea-catalog.ts:166-171, consumed at :402 |
| B3-F17 | adversarial numerics | FACTUAL_ERROR | 0 | INVARIANTS.md's porkchop units line is wrong about the worker's internal units and contradicts the code block three lines above it | INVARIANTS.md:34 (inside the "Lambert convention (AMD-7)" block) |
| B4-F01 | Slice 10-11 docs vs code | FACTUAL_ERROR | 4 | "The M=0-only view reproduces cached minC3 within 7.631e-11" was measured on the cache's grid, not the view's; real divergence reaches ~1.8 km^2/s^2 | src/v2/SLICE_11_FOUNDING.md:488 |
| B4-F02 | Slice 10-11 docs vs code | FACTUAL_ERROR | 2 | Shipped porkchop page claims "Grid spans 2026-2040 departures" but the grid ends 2040-01-01; 8.11% of the catalog's cached best windows fall outside it | src/v2/app/porkchop/main.ts:637 (and src/v2/SLICE_11_FOUNDING.md:88) |
| B4-F03 | Slice 10-11 docs vs code | CONTRADICTION | 0 | OQ-4 states a delta-V stack formula (2 x sqrt(C3)) that contradicts DEC-7 and the shipped code (2 x vInfArr); the two differ by 12.8 km/s on Apophis's best cell | src/v2/SLICE_11_FOUNDING.md:63 vs :113-118 and src/v2/porkchop/delta-v.ts:26-42 |
| B4-F04 | Slice 10-11 docs vs code | CONTRADICTION | 0 | Slice 10 Section 7 lists Phase C.2/C.3/C.4 as PENDING two lines above Phase D/E recording them verified and deployed; the audit's own F9 "Phase C status text drift - Refreshed" was | src/v2/SLICE_10_FOUNDING.md:455,475-477 vs :479-487,490-496; audit record :424 |
| B4-F05 | Slice 10-11 docs vs code | CONTRADICTION | 0 | Slice 10's close note claims "All eight measurement OQs are closed (OQ-1 through OQ-8)"; OQ-1 is open, OQ-6 does not exist in the slice, and two of the rest are not measurements | src/v2/SLICE_10_FOUNDING.md:500 (vs :165-171 and :453) |
| B4-F06 | Slice 10-11 docs vs code | FUNDAMENTALLY_FALSE | 0 | DEC-6's locked evidence ("dv=6 km/s ⇒ C3≈25, benchmark-compatible with NHATS's accessible-target population") is contradicted by the repo's own NHATS cache and was never amended af | src/v2/SLICE_10_FOUNDING.md:137 |
| B4-F07 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | DEC-4's performance arithmetic understates the screening solve count by ~180x and quotes a WASM per-solve time for a path that was never built | src/v2/SLICE_10_FOUNDING.md:123 |
| B4-F08 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | AMD-7 records the wrong units for the worker's solver zone and contradicts AMD-1 | src/v2/SLICE_11_FOUNDING.md:257 vs :200 |
| B4-F09 | Slice 10-11 docs vs code | STALE | 0 | SLICE_11 Section 8 still reports the overlay's fixed M:1 divergence as OPEN; the overlay now passes M:0 with the DEC-5 contour toggle | src/v2/SLICE_11_FOUNDING.md:492 |
| B4-F10 | Slice 10-11 docs vs code | STALE | 0 | The live Slice 10 fixture spec, NOTICE and research README all point the long-span Horizons fixture at a path that no longer exists | src/v2/boundary/slice10-fixture-spec.md:9 (also src/v2/SLICE_10_FOUNDING.md:347, NOTICE:41 |
| B4-F11 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | DEC-11C-5's span requirement ("Earth samples must extend to ~2045") is wrong, and the fixture adopted to satisfy it stops at 2040-12-31 | src/v2/SLICE_11_FOUNDING.md:161 and :168 (amendment) |
| B5-F01 | Slice 12-13 DLA & launch vehicles | FUNDAMENTALLY_FALSE | 2 | DLA research summary still instructs the obliquity rotation DEC-12-2 forbids, with no erratum | tools/slice12-research/DLA_RESEARCH_SUMMARY.md:39-48 (also :69, :75) |
| B5-F02 | Slice 12-13 DLA & launch vehicles | FUNDAMENTALLY_FALSE | 0 | The inverted feasibility inequality survives uncorrected in §4 of the DLA research summary (fourth resurrection) | tools/slice12-research/DLA_RESEARCH_SUMMARY.md:54 (and :30-32) |
| B5-F03 | Slice 12-13 DLA & launch vehicles | CODE_BUG | 0 | measure-earth-vz.mjs compares m/s against km/s, so the committed per-year table is each year's last sample, not its maximum | tools/slice12-research/measure-earth-vz.mjs:130 (artifact: tools/slice12-research/data/ear |
| B5-F04 | Slice 12-13 DLA & launch vehicles | STALE | 0 | SLICE_13_FOUNDING records the New Glenn C3=5 anchor as landed and 'Parked: nothing'; it was reverted and is parked as Cleanup C8 | src/v2/SLICE_13_FOUNDING.md:100 |
| B5-F06 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The shipped '~1 m/s-per-degree (JPL DESCANSO Vol. 12 evidence)' figure is not in the committed evidence, which forbids that lift | src/v2/app/porkchop/main.ts:879 (user-facing); also INVARIANTS.md:120 and src/v2/SLICE_13_ |
| B5-F07 | Slice 12-13 DLA & launch vehicles | CONTRADICTION | 0 | DEC-12-4 locks the DLA toggle default OFF; production ships it ON with no §5a amendment | src/v2/SLICE_12_FOUNDING.md:91 vs src/v2/app/porkchop/main.ts:313 |
| B5-F08 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The M=1 artifact claims the dead branch counter was removed in schemaVersion 2; the committed file is still schemaVersion 1 with the counter present | tools/slice12-research/data/dla-oracle-m1-vectors.json:99 (deadCounterNote); target tools/ |
| B5-F09 | Slice 12-13 DLA & launch vehicles | FACTUAL_ERROR | 0 | The 3d verification record dates the elvperf page '10 Feb 2026'; every committed screenshot says 29 February 2024 | tools/slice13-research/literature/3d-verification-record.md:9 |
| B5-F10 | Slice 12-13 DLA & launch vehicles | PROCESS_VIOLATION | 0 | Decision-closing audit reports cited by both founding docs are untracked and never existed on any ref (INV-034) | src/v2/SLICE_13_FOUNDING.md:84 and :98; src/v2/SLICE_12_FOUNDING.md:110 and :168 |
| B5-F11 | Slice 12-13 DLA & launch vehicles | PROCESS_VIOLATION | 0 | The INV-016d disclosure, site picker and band legend are hidden behind the DLA toggle while the feasibility verdict is not | src/v2/app/porkchop/main.ts:669-703 vs src/v2/porkchop/porkchop-view.ts:1319, :1418-1431,  |
| B5-F12 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The fixture sha256 cited by the 2026-09-22 vZ correction cannot be reproduced from the repository | src/v2/SLICE_12_FOUNDING.md:172; tools/slice12-research/data/earth-vz-span-max.json (fixtu |
| C1-F06 | catalog & data boundary | STALE | 2 | Slice 8 fixture spec describes field names and an example record that do not match the fixture and would fail ingestion | src/v2/boundary/slice8-fixture-spec.md:253-277,296-298,359-365 |
| C1-F07 | catalog & data boundary | STALE | 2 | Slice 7 fixture spec requires conditionCode/dataArcDays (absent from the fixture), omits fields ingestion requires, and names loader.ts as the consumer (no longer true) | src/v2/boundary/slice7-fixture-spec.md:14,74-99,112-124 |
| C2-F06 | Slice 18 fidelity tiers | STALE | 2 | STATUS's Slice 18 row and git-state table still describe the close-out branch as unmerged and list bundle names no longer in docs/ | STATUS.md:45 (Slice 18 row), :26, :28 |
| C2-F07 | Slice 18 fidelity tiers | CODE_BUG | 2 | Catalog list renders 'No bodies match the current filters.' when the tier artifact fails to load or arrives after the screen cache | src/v2/app/catalog-list/panel.ts:79-81, :86-100, :539-548 |
| C3-F01 | Slice 17 compare & QOL | FUNDAMENTALLY_FALSE | 4 | The §1 thesis sentence misstates the measured sample: 163693 has the WORST minimum C3 of the five, not the second-best | SLICE_17_FOUNDING.md:48-51 |
| C3-F04 | Slice 17 compare & QOL | PROCESS_VIOLATION | 2 | The founding doc's §9 binding "DEC-17-4's quality copy may not ship without [the MPC spot check]" was violated by the A4c ship, and no §8 entry records a waiver | SLICE_17_FOUNDING.md:673-677 (also :668 and §8:417-418) |
| C3-F05 | Slice 17 compare & QOL | PROCESS_VIOLATION | 2 | DEC-17-5 (LOCKED) clauses are not implemented on /v2/compare/ and were not recorded as residuals when Front A was declared CLOSED | SLICE_17_FOUNDING.md:197-209 (DEC-17-5), §4:305-310; STATUS.md:44 |
| C4-F02 | renderer & physical constants | FUNDAMENTALLY_FALSE | 2 | 25.19 deg and 26.7 deg are obliquities to the orbital plane, used as angles from the ICRF Z axis; the repo's own kernel pole data is never read | src/v2/render/saturn-rings.md:24; src/v2/render/mars-oblate.md:9; src/v2/app/solar-system/ |
| C4-F04 | renderer & physical constants | FUNDAMENTALLY_FALSE | 2 | The 'explicit renderOrder=0 breaks transparent rendering' mechanism is impossible in three.js, and two tests enforce a source ban derived from it | V2_FOUNDING_DOCUMENT.md:1422; enforced at tests/v2-slice5-cutover.test.mjs:119-126 and tes |
| C4-F05 | renderer & physical constants | STALE | 2 | SLICE_V1_STATUS.md is false in every load-bearing line and nothing marks it superseded | src/v2/SLICE_V1_STATUS.md:3,13,14,22-25,27,34,57 |
| C4-F06 | renderer & physical constants | FACTUAL_ERROR | 0 | The 'locked from mission constants' oblate Y-scales match neither BODY_CONSTANTS nor the mesh factories, and the atmosphere shells use the wrong copies | src/v2/SLICE_V1_FOUNDING.md:261-269; src/v2/render/atmosphere.ts:26-28; src/v2/render/satu |
| C4-F07 | renderer & physical constants | FACTUAL_ERROR | 0 | OQ-V1-1's rationale asserts a blending mode the production rings do not use | src/v2/SLICE_V1_FOUNDING.md:121-122 |
| C4-F08 | renderer & physical constants | FUNDAMENTALLY_FALSE | 0 | The prototype's Saturn ring '26.7 deg tilt' applies exactly zero tilt, and its RingGeometry UV claim is wrong | src/v2/prototypes/renderer-test/rings.ts:66-69,47 |
| C4-F09 | renderer & physical constants | FACTUAL_ERROR | 0 | The A-ring outer radius is asserted as 'the exact PDS value' but is 5 km off, and three other radii claimed as exact PDS are 25-170 km off | tests/v2-slice5-cutover.test.mjs:133,139; src/v2/render/saturn-rings.md:14,18-22,33,36-38, |
| C4-F10 | renderer & physical constants | CONTRADICTION | 0 | saturn-rings.md gives the B/Cassini boundary two different radii, and the constant for one of them is dead code | src/v2/render/saturn-rings.md:37 vs :40; src/v2/render/saturn-rings.ts:65,210-227 |
| C4-F11 | renderer & physical constants | CODE_BUG | 0 | The Cassini-division 'gap' meshes are more opaque than the band they are specified to be lower-alpha than, and normal blending cannot punch holes | src/v2/render/saturn-ring-substructure.md:53-54,63,67 vs src/v2/render/saturn-rings.ts:81- |
| C4-F12 | renderer & physical constants | CONTRADICTION | 0 | Three shipped scenes have three different lighting balances; the inner-solar-system route still has the exact pre-Phase-B values | src/v2/SLICE_V1_FOUNDING.md:27-28,398-402 vs src/v2/app/solar-system/runtime.ts:1290-1291, |
| C4-F13 | renderer & physical constants | CODE_BUG | 0 | On first paint the whole scene is lit from a fabricated direction, disclosed nowhere | src/v2/app/solar-system/runtime.ts resolveSunLightPosition (returns {sunRadiusM, sunRadius |
| C4-F14 | renderer & physical constants | STALE | 0 | DEC-V1-3 / Phase A never shipped: 10 of 15 textures are deployed but never fetched, and NOTICE says they are loaded | src/v2/SLICE_V1_FOUNDING.md:271-273,385-395; NOTICE:55-59; src/v2/app/solar-system/runtime |
| C4-F15 | renderer & physical constants | CODE_BUG | 0 | The Earth cloud texture is downloaded on every page load and never rendered; the documented cloud shell does not exist | src/v2/app/solar-system/runtime.ts:582-588,574; docs at src/v2/SLICE_V1_FOUNDING.md:30,252 |
| C4-F16 | renderer & physical constants | PROCESS_VIOLATION | 0 | 8.5 MB of staging assets ship to the live site, including two TIFFs the founding doc itself says browsers cannot decode | docs/_staging_v1/ (4 files); textures/_staging_v1/; vite.config.ts:8; src/v2/SLICE_V1_FOUN |
| C4-F17 | renderer & physical constants | FUNDAMENTALLY_FALSE | 0 | The documented 'belt-band' orbit-line architecture produces 2 orbit lines in the shipped scene, over a catalog with no main belt | src/v2/render/asteroid-instancing.md:115-123; V2_FOUNDING_DOCUMENT.md:1458,1469; src/v2/re |
| C4-F18 | renderer & physical constants | FUNDAMENTALLY_FALSE | 0 | halos.md documents the wrong halo interface - the exact interface whose misuse caused the halo frame bug - and contradicts itself on the core dependency | src/v2/render/halos.md:23,25 vs src/v2/render/halos.ts:2-3,14,43,56,74-83,102-116 |
| C4-F22 | renderer & physical constants | CONTRADICTION | 0 | INVARIANTS says the atmosphere must be spherical while the locked DEC and the code make three shells oblate - and none of the three is tilted with its body | INVARIANTS.md:87-88 vs src/v2/SLICE_V1_FOUNDING.md:267-268 and src/v2/render/atmosphere.ts |
| C4-F23 | renderer & physical constants | FUNDAMENTALLY_FALSE | 0 | The renderOrder ladder's stated failure mode cannot occur for the additive shells it governs | src/v2/SLICE_V1_FOUNDING.md:361-365 (DEC-V1-4c); mirrored at INVARIANTS.md:91; src/v2/rese |
| C4-F24 | renderer & physical constants | STALE | 0 | The anti-edge-on comments and the Slice 5 cutover both describe a default camera orbit the runtime no longer has | src/v2/app/solar-system/runtime.ts:1673-1674,1679-1680; V2_FOUNDING_DOCUMENT.md:1419; test |
| C4-F25 | renderer & physical constants | STALE | 0 | Four shipped textures are listed as missing, and the Earth normal + specular maps are listed as out of scope while the shipped shader samples both | src/v2/SLICE_V1_FOUNDING.md:132,180,215-218,456-459 vs src/v2/app/solar-system/runtime.ts: |
| C4-F26 | renderer & physical constants | STALE | 0 | Both asteroid spatial docs present the Slice 8 uniform grid as the production partition; production runs the Slice 9 hybrid on four times the bodies | src/v2/render/spatial-index.md:32,51,107-111,155-158; src/v2/render/asteroid-instancing.md |
| C4-F33 | renderer & physical constants | CONTRADICTION | 0 | earth-moon gives scene children camera-relative coordinates, which INVARIANTS forbids absolutely | INVARIANTS.md:95-102 vs src/v2/app/earth-moon/runtime.ts:118,205-206 and src/v2/render/cam |
| C5-F05 | honesty surfaces & user copy | FUNDAMENTALLY_FALSE | 0 | Co-orbital caveat attributes an N-body error bound to a patched-conic-vs-patched-conic disagreement; the "4-year horizon" has no source | src/v2/app/catalog-list/honesty-disclosure.ts:67-70 |
| C5-F06 | honesty surfaces & user copy | FUNDAMENTALLY_FALSE | 0 | About page restates the false multi-revolution magnitude claim with its "magnitude only" caveat removed | src/v2/app/about/main.ts:268, :277-278; src/v2/data/validation-provenance.json:45-56 |
| C5-F07 | honesty surfaces & user copy | FACTUAL_ERROR | 0 | "within 1.18% ... on the curve segments the tool screens on" is false for the 40→55 anchor segment | src/v2/app/about/main.ts:279-283; evidence at tools/slice13-research/elvperf/oracle/oracle |
| C5-F08 | honesty surfaces & user copy | FACTUAL_ERROR | 0 | "a metallic-bright surface could shrink this ≈2.9×" misapplies a two-sided albedo span as a one-sided shrink factor | src/v2/app/compare/main.ts:240 (constant at :205); source at tools/slice17-research/litera |
| C5-F09 | honesty surfaces & user copy | FACTUAL_ERROR | 0 | The OBSERVED provenance row's scope wording does not match the number it publishes | src/v2/data/validation-provenance.json:13, :86, :90 |
| C5-F10 | honesty surfaces & user copy | MISSING_EVIDENCE | 0 | "the effective ceiling is only ~34-39 deg": the lower bound has no source anywhere in the repo | src/v2/app/porkchop/main.ts:700 |
| C5-F11 | honesty surfaces & user copy | PROCESS_VIOLATION | 0 | The ΔV stack discloses its three numbers but none of the model assumptions INV-016c requires, and INVARIANTS.md misdescribes the invariant | src/v2/app/porkchop/main.ts:944; INVARIANTS.md:184 vs src/v2/SLICE_11_FOUNDING.md:28,63 |
| C5-F12 | honesty surfaces & user copy | FACTUAL_ERROR | 0 | The Slice 13 audit evidence link's fragment matches no heading, so the jump lands at the top of the file | src/v2/app/about/main.ts:67-72 (anchor at :71), emitted by artifactUrl at :178-181 |
| C5-F13 | honesty surfaces & user copy | STALE | 0 | The "index-current" invariants exhibit is pinned to a commit missing 16 invariant IDs | src/v2/app/about/main.ts:443-447 (caption), ARTIFACTS.invariants at :83-87 |
| C5-F14 | honesty surfaces & user copy | STALE | 0 | Slice 13's close-out record still claims a reverted launch-vehicle anchor landed, unannotated | src/v2/SLICE_13_FOUNDING.md:100 |
| D1-F01 | MCP & Slice 14-15 | STALE | 2 | mcp/README.md 'Advertised span vs accepted span' section is self-contradictory after 0052ecb | mcp/README.md:56-79 |
| D1-F02 | MCP & Slice 14-15 | PROCESS_VIOLATION | 2 | Committed eval report's origin commit does not contain the code that produced it (run from an uncommitted worktree) | mcp/eval/slice15-eval-report.json:3-4 (also slice15-eval-summary.md:2-3; cause mcp/eval/ru |
| D1-F03 | MCP & Slice 14-15 | FACTUAL_ERROR | 2 | SLICE_15 cites INV-022 for the no-extrapolation rule; that is INV-023 | src/v2/SLICE_15_FOUNDING.md:27 (also :143, :191; src/v2/founding-drafts/DRAFT_2026-07-07_R |
| D1-F04 | MCP & Slice 14-15 | CONTRADICTION | 2 | AMD A2 (DEC-15-8) applied inconsistently: dla_feasibility turns an unknown-but-well-formed siteId into an MCP error, other tools into a not_found refusal | src/v2/SLICE_15_FOUNDING.md:197 vs mcp/src/tools/dla-feasibility.ts:29 and mcp/test/comput |
| D1-F05 | MCP & Slice 14-15 | PROCESS_VIOLATION | 2 | INV-027 violated: adapters re-derive v-infinity/DLA that core already provides and compute a marginDeg quantity that exists nowhere in core | mcp/src/tools/compute-shared.ts:270-300 (also explain-cell.ts:133-176, dla-feasibility.ts: |
| D2-F02 | Slice 16 study | FACTUAL_ERROR | 2 | STATUS conflates the post-data primary set (25) with the executed scenario count (26); 25 does not reproduce 468 runs | STATUS.md:57 |
| D2-F04 | Slice 16 study | PROCESS_VIOLATION | 2 | Per-RQ rates and the per-dimension table include S-30 (registered as non-binary) without saying so, and the per-RQ split is an unregistered metric not labelled exploratory | src/v2/SLICE_16_FOUNDING.md:1497 (§30.6), 1458-1465 (§30.2), 1449 (§30.1); tools/slice16-h |
| D2-F05 | Slice 16 study | PROCESS_VIOLATION | 2 | The registered contrast analysis (CI on the difference vs 10 pp, Holm) was never computed; §30.3 substitutes overlapping marginal CIs | src/v2/SLICE_16_FOUNDING.md:124-128 (DEC-16-8), 1471-1473 (§30.3); tools/slice16-harness/g |
| D4-F11 | legacy V1 & economics | FUNDAMENTALLY_FALSE | 0 | tests/v2-architecture.test.mjs enforces nothing about the legacy directories; the live @ alias bypasses it entirely | tests/v2-architecture.test.mjs:47-70, decisively :53 |
| D4-F12 | legacy V1 & economics | CONTRADICTION | 0 | The V2 wall list in AGENTS.md section 1 and INVARIANTS.md section 1 omits src/physics, src/data, src/utils, src/styles and src/main.ts | AGENTS.md:38-39; INVARIANTS.md:11-13; vs tsconfig.json:24-35 |
| D4-F13 | legacy V1 & economics | FUNDAMENTALLY_FALSE | 0 | The shipped mission profile asserts "Izzo 2015 Lambert" unconditionally while the extract path silently falls back to a different solver and discards the flag | src/economics/mission-costs/planner.ts:413 and :425; src/workers/physics/planner/extract.t |
| D4-F14 | legacy V1 & economics | FACTUAL_ERROR | 0 | gooding.ts does not implement Gooding's algorithm; REFACTOR_MAP repeats the wrong name | src/physics/orbital/lambert/gooding.ts:6; REFACTOR_MAP.md:35 |
| D4-F15 | legacy V1 & economics | CONTRADICTION | 0 | Three disagreeing composition tables, two in the same file; the user-facing text differs from the value calculation by up to 50x | src/economics/scoring.ts:3-10 (COMPOSITIONS), :12-19 (FRACTIONS), :56-61 (MAT_COMP, duplic |
| D4-F16 | legacy V1 & economics | CODE_BUG | 0 | MAT_COMP.M sums to 100.081 weight-percent of bulk mass | src/economics/pricing/active.ts:43; duplicate src/economics/scoring.ts:59 |
| D4-F17 | legacy V1 & economics | CODE_BUG | 0 | MAT_DIFFICULTY['pgm'] is undefined for every PGM row; the 'platinum' entry is dead | src/economics/scoring.ts:28-33 vs :39-42; consumed at src/economics/pricing/active.ts:265 |
| D4-F18 | legacy V1 & economics | CODE_BUG | 0 | renderPorkchop is called with one argument where two are required (runtime TypeError), and onBurnResult is called although never defined; both masked by declare stubs | src/economics/mission-costs/planner.ts:275; src/workers/physics/client.ts:34, :42, :243 |
| D4-F19 | legacy V1 & economics | CODE_BUG | 0 | In the redirect path the water/metal split comes from a UI slider, not composition, letting an M-type report 50x its whole-body water inventory | src/workers/physics/planner/redirect.ts:111-113; slider read at src/economics/mission-cost |
| D4-F20 | legacy V1 & economics | CODE_BUG | 0 | Two different Tsiolkovsky implementations in one module diverge above ~9.4 km/s and both feed the same render | src/economics/mission-costs/index.ts:36-40 vs :72-74; both consumed in src/economics/missi |
| D4-F21 | legacy V1 & economics | FACTUAL_ERROR | 0 | The "COSTS (+/-15%)" section header does not match the band actually displayed, which ranges +/-10% to +/-35% | src/economics/mission-costs/planner.ts:390 and :322-323; src/economics/mission-costs/index |
| D4-F22 | legacy V1 & economics | STALE | 0 | STATUS.md still presents the "~10.6 MB no page fetches" Slice 19 item as open, although HEAD itself is the commit that fixed it | STATUS.md:427-430 |
| D4-F23 | legacy V1 & economics | PROCESS_VIOLATION | 0 | 8,905,716 bytes of docs/_staging_v1/ are deployed, referenced by nothing, uncounted by the payload analysis, and would be destroyed by the next build | docs/_staging_v1/ (4 tracked files); vite.config.ts:10-11; STATUS.md:433-436 |
| D4-F24 | legacy V1 & economics | CODE_BUG | 0 | Spectral-type mapping assigns E-type asteroids an 88%-iron composition and V-type asteroids 5% water | src/economics/pricing/active.ts:114-117 |
| D4-F25 | legacy V1 & economics | CODE_BUG | 0 | The "Light Prospector" is given Isp 3000 s while the model is documented as impulsive, single-stage chemical | src/economics/mission-costs/defaults.ts:10; assumptions panel at src/economics/mission-cos |
| D4-F26 | legacy V1 & economics | CONTRADICTION | 0 | Legacy and V2 physical constants disagree, most materially an 11% mass/value difference from a different default albedo | src/physics/constants/index.ts:4-16 and src/economics/pricing/active.ts:233 vs src/v2/core |

### LOW — 181

| id | reader | class | checked | finding | where |
|---|---|---|---|---|---|
| A1-F10 | routers & STATUS | STALE | 1 | AGENTS §1 repo map: `_rescued-agent-defs/` labelled 'local-only, untracked' (it is tracked) and the founding-doc list omits eight tracked founding docs | AGENTS.md:34, :40-47 |
| A1-F11 | routers & STATUS | FACTUAL_ERROR | 1 | AGENTS §8 cites prior-art files that do not exist ('mining-economics', 'orchestrator.md' dispatch rounds) | AGENTS.md:281-290 |
| A1-F12 | routers & STATUS | STALE | 1 | AGENTS §2.1 rule 3 and §4 under-describe the current hook guard set and the test runner | AGENTS.md:111-114, :177, :32 |
| A1-F13 | routers & STATUS | STALE | 1 | STATUS carries two different structurally-blind/L2 counts without annotating the earlier one | STATUS.md:129 vs :154/:316 |
| A1-F14 | routers & STATUS | STALE | 1 | STATUS says the Slice 18 measurement/audit artifacts are 'NOT in version control' in five places never annotated after they were landed | STATUS.md:162, :191, :201, :230, :287 |
| A1-F15 | routers & STATUS | STALE | 1 | STATUS 'Open, carried forward from Front A' still says the overlay passes a fixed M: 1 and is 'still OPEN' | STATUS.md:256 (also :239) |
| A1-F16 | routers & STATUS | STALE | 0 | boundary/README.md Source Map names conversion files that do not exist (boundary/asterank.ts, boundary/nhats.ts) | src/v2/boundary/README.md:31-32 |
| A1-F17 | routers & STATUS | STALE | 0 | mission/README.md and AGENTS §1 describe `mission/` as the planning-math home; the directory holds only the README | src/v2/mission/README.md:3-11; AGENTS.md:26 |
| A1-F18 | routers & STATUS | STALE | 0 | src/v2/research/README.md status (2026-05-22) contradicts the repo: founding docs exist; 12 folders not 5 | src/v2/research/README.md:7-19 |
| A1-F19 | routers & STATUS | STALE | 0 | QA.md is an unlabeled V1 'Phase 5' report at the repo root | QA.md:1, :28-153 |
| A1-F20 | routers & STATUS | CONTRADICTION | 0 | slice-discipline skill mandates src/v2/SLICE_N_FOUNDING.md; Slice 17's founding doc lives at the repo root | .claude/skills/slice-discipline/SKILL.md:38; SLICE_17_FOUNDING.md (root); STATUS.md:44 |
| A2-F04 | invariants vs code | CODE_BUG | 1 | measure-earth-vz.mjs per-year maximum compares m/s against km/s; committed per-year table is wrong and self-contradictory | tools/slice12-research/measure-earth-vz.mjs:129-131; tools/slice12-research/data/earth-vz- |
| A2-F06 | invariants vs code | STALE | 1 | INV-005 cites a non-existent assertPropagationDrift and stayed 'deferred' after the Slice 7 propagator landed | src/v2/core/invariants/README.md:44; V2_FOUNDING_DOCUMENT.md:80 |
| A2-F07 | invariants vs code | CONTRADICTION | 1 | INV-014 is defined twice with different meanings and both are cited by live tests | src/v2/SLICE_8_5_FOUNDING.md:56 vs src/v2/SLICE_9_FOUNDING.md:264-276; INVARIANTS.md:181 |
| A2-F08 | invariants vs code | FACTUAL_ERROR | 1 | INV-007 is referenced and typed but never defined | V2_FOUNDING_DOCUMENT.md:198,212; src/v2/core/invariants/INV-008.md:51; src/v2/core/types.t |
| A2-F10 | invariants vs code | FACTUAL_ERROR | 1 | r128 API table gives a false reason for avoiding OrbitControls ('Not in r128 bundle') | INVARIANTS.md:113 |
| A2-F11 | invariants vs code | FACTUAL_ERROR | 1 | Atmosphere-shell rule cites a non-existent founding-doc section 'V1-C1' | INVARIANTS.md:85 |
| A2-F12 | invariants vs code | STALE | 1 | Stale line reference for the per-frame atmosphere position copy | INVARIANTS.md:89-90 |
| A2-F13 | invariants vs code | STALE | 1 | INV-034 text cites '.gitignore:17' as the excluding glob; at HEAD that line is a comment | INVARIANTS.md:171-172; src/v2/SLICE_9_FOUNDING.md:427 |
| A2-F14 | invariants vs code | FACTUAL_ERROR | 1 | multi-agent-audit skill attributes to INV-019 a general 'must not touch audited prior code' rule it does not state | .claude/skills/multi-agent-audit/SKILL.md:54-55 |
| A2-F15 | invariants vs code | STALE | 1 | ci.yml header says two gates and 'never builds docs/' but a build job runs npm run build | .github/workflows/ci.yml:4-8 |
| A2-F16 | invariants vs code | CODE_BUG | 1 | colormap propagates a NaN C3 to a silent black heatmap pixel | src/v2/porkchop/colormap.ts:36-58; src/v2/porkchop/porkchop-view.ts:802-807 |
| A2-F17 | invariants vs code | STALE | 1 | V2 founding doc still states the 3-pixel halo threshold replaced after Slice 6 | V2_FOUNDING_DOCUMENT.md:189 (also 390, 429, 471) |
| A2-F18 | invariants vs code | STALE | 1 | Eccentricity-band populations in constants/README differ from the shipped Slice 8 fixture | src/v2/core/constants/README.md:313-318 |
| A2-F19 | invariants vs code | CONTRADICTION | 1 | SLICE_17 reserves bare INV-035/036 for new global proposals after INVARIANTS.md declared those numbers skipped as ambiguous | SLICE_17_FOUNDING.md:697,703 vs INVARIANTS.md:233 |
| A3-F03 | build/deploy/CI/hooks | STALE | 2 | Slice 19 item 5: the "CRLF hashing basis" blocker for OQ-17-7 no longer exists (S19-D04 made the checkout LF); the real remaining provenance gap (script hash) is not mentioned | STATUS.md:454-462 |
| A3-F04 | build/deploy/CI/hooks | STALE | 0 | Cleanup C17 is recorded as open and pins `.githooks/pre-commit:53`, but f7b19e7 fixed it 20 minutes after it was recorded | STATUS.md:485 |
| A3-F05 | build/deploy/CI/hooks | CODE_BUG | 0 | C15's recommended fix ("anchor the regex to the `ℹ pass` summary line") would zero the headline on this runner, whose children emit TAP (`# pass N`); the first-match bug itself is  | tools/run-tests.mjs:170-171 (also :168 and STATUS.md:483) |
| A3-F06 | build/deploy/CI/hooks | STALE | 0 | ci.yml header describes two gates and "never builds docs/"; the workflow has four jobs including `npm run build` | .github/workflows/ci.yml:3-8 |
| A3-F07 | build/deploy/CI/hooks | CONTRADICTION | 0 | The committed `.dispatch-scope` is described as "never staged", names a deleted file, and matches none of HEAD's 21 changed paths | STATUS.md:507 (also .dispatch-scope:4 and AGENTS.md:106-109 rule 2) |
| A3-F08 | build/deploy/CI/hooks | PROCESS_VIOLATION | 0 | HEAD mixes a src/v2 source change with the docs/ rebuild in one commit, against §9's artifacts-only rule | commit 69472a3 (src/v2/app/solar-system/loader.ts + 20 docs/ paths) vs AGENTS.md:303-305,  |
| A3-F09 | build/deploy/CI/hooks | FACTUAL_ERROR | 0 | Slice 19 item 1 quotes the porkchop literal with ASCII hyphens and names a bundle that no longer exists; the literal itself still ships | STATUS.md:418-419 and :425 |
| A3-F10 | build/deploy/CI/hooks | FACTUAL_ERROR | 0 | "Eager first-paint set 110,906,873 B" is the sum of six data payloads only; it omits the page's JS, HTML and the five Earth textures (≈3.8 MB) that load at scene construction | STATUS.md:434-439 (item 3) |
| A3-F11 | build/deploy/CI/hooks | STALE | 0 | `publicDir: 'textures'` ships 8.9 MB of `_staging_v1` source masters that no page references; the V1 status table still calls the derived JPGs blocked | vite.config.ts:8; src/v2/SLICE_V1_STATUS.md:23-25 and :28 |
| A3-F12 | build/deploy/CI/hooks | UNVERIFIABLE | 0 | run-tests.mjs rationale cites "209 files" / "208 of 209 discovered files", a count that matches nothing in this repository | tools/run-tests.mjs:3-6 |
| A3-F13 | build/deploy/CI/hooks | FACTUAL_ERROR | 0 | Slice 19 preamble misattributes the on-disk/served size gap to `.gitattributes:9 … eol=lf` | STATUS.md:412-414 |
| A4-F03 | prior audits & queues | MISSING_EVIDENCE | 2 | 'R-01'..'R-17' names two disjoint finding sets; Cleanup C16 records only the 'F2' collision | STATUS.md:406 and SLICE_17_FOUNDING.md:422-423 vs tools/s17-ga12-audit-2026-08-07/RECONCIL |
| A4-F05 | prior audits & queues | STALE | 2 | Cleanup C1 (CRLF / .gitattributes normalization) is complete but still listed open | STATUS.md:469 |
| A4-F06 | prior audits & queues | STALE | 4 | OQ-17-7's restated blocker is false at HEAD: the fixture reproduces its provenance hash; the real mismatch is the generator script's own sha256 | STATUS.md:457-461 |
| A4-F08 | prior audits & queues | STALE | 0 | Cleanup C11 is resolved, and its pointer into the remediation report is dangling | STATUS.md:479 |
| A4-F10 | prior audits & queues | MISSING_EVIDENCE | 2 | The math-layer audit's headline Kepler residual is contradicted by the committed artifact and script it names as its reproduction path | tools/slice18-research/MATH_LAYER_AUDIT.md:70 (reproduction path declared at :5); repeated |
| A4-F11 | prior audits & queues | FACTUAL_ERROR | 0 | 'M=0 max rel err 3.35e-14 over 2,500 cells' quotes one body's row as the M=0 maximum | tools/slice18-research/MATH_LAYER_AUDIT.md:72; STATUS.md:291 |
| A4-F12 | prior audits & queues | MISSING_EVIDENCE | 2 | tools/overnight-2026-08-05/ is cited as evidence by production source and a test's provenance header, and does not exist in the repo | src/v2/app/catalog-list/panel.ts:327; tests/v2-segment-windows.test.mjs:5-6 (raised as R-1 |
| A4-F16 | prior audits & queues | STALE | 2 | HANDOFF.md still asserts, with no superseded banner, that artifacts the repo tracks are missing | HANDOFF.md:1-8, :70, :85-92 |
| A4-F17 | prior audits & queues | MISSING_EVIDENCE | 2 | Two of the three absent aster-audit-reports citations in SLICE_13_FOUNDING remain unannotated, including the one that closes a pre-deploy audit gate | src/v2/SLICE_13_FOUNDING.md:84 and :98 (the L3-6 annotation at :110-112 covers only :39) |
| A4-F19 | prior audits & queues | STALE | 2 | Eight of the seventeen 2026-08-07 recorded contradictions are still live at HEAD with neither side marked | tools/context-audit-2026-08-07/CONTRADICTIONS.md (C-01, C-06, C-07, C-08, C-09, C-10, C-12 |
| A4-F20 | prior audits & queues | FACTUAL_ERROR | 0 | STATUS quotes the shipped porkchop literal with ASCII hyphens; the source uses en-dashes | STATUS.md:418-419 vs src/v2/app/porkchop/main.ts:637 |
| A5-F06 | strategy & narrative | STALE | 2 | DATA_SOURCES.md claims to document Aster's current data sources but describes only the frozen V1 app | DATA_SOURCES.md:3,9-16,56-65,98-106 |
| A5-F08 | strategy & narrative | STALE | 0 | NOTICE still says the Lambert implementation has not landed | NOTICE:13-14 |
| A5-F09 | strategy & narrative | CONTRADICTION | 2 | IDEA_KERNELS §6.1 still carries the payload figures the intake's own §9.2 correction retracted | strategy/IDEA_KERNELS_2026-09.md:112-118 |
| A5-F10 | strategy & narrative | FACTUAL_ERROR | 2 | IDEA_KERNELS:167 assigns H0 a "Slice-21 seat"; every other repo source says Slice 19 | strategy/IDEA_KERNELS_2026-09.md:167 |
| A5-F11 | strategy & narrative | FACTUAL_ERROR | 0 | The 2060 daily-record arithmetic in the intake correction is off by one | strategy/INTAKE_2026-09-11_EXTERNAL_AI_SESSION.md:271,286-287 |
| A5-F12 | strategy & narrative | FACTUAL_ERROR | 0 | The intake's generator CENTER line citations are off by one row | strategy/INTAKE_2026-09-11_EXTERNAL_AI_SESSION.md:208-210 |
| A5-F14 | strategy & narrative | STALE | 2 | The roadmap's Slice 18 is "Explain This Cell"; the slice that shipped and closed is "Screening Fidelity" | strategy/ASTER_ROADMAP_2026-08.md:63,72-74 |
| A5-F15 | strategy & narrative | FACTUAL_ERROR | 2 | ASTER_PRODUCT_VISION says the deployed V2 view shows "eight planets"; it shows six | ASTER_PRODUCT_VISION.md:27 (with :40) |
| A5-F16 | strategy & narrative | STALE | 2 | LEGACY.md still calls the legacy app the shipped product | LEGACY.md:14 (also :9-11, :50) |
| A5-F17 | strategy & narrative | STALE | 2 | UPDATES.md is abandoned (newest entry 2026-04-21) and DEVLOG.md since 2026-07-02, while both still present as live logs agents are told to read | UPDATES.md:1-3 and last heading :951; DEVLOG.md:1-3 and :80,87,100,102,277 |
| A5-F18 | strategy & narrative | FACTUAL_ERROR | 0 | "MIT license throughout" is not true of the dependency tree | INVARIANTS.md:16 (related LICENSE:29-31, NOTICE:3-5) |
| A5-F19 | strategy & narrative | STALE | 0 | Three texture assets are recorded as "Missing" / blocked on ImageMagick but ship, deploy and are loaded | src/v2/SLICE_V1_FOUNDING.md:215,217,218; src/v2/SLICE_V1_STATUS.md:23-25 |
| A5-F20 | strategy & narrative | CONTRADICTION | 0 | "founding-drafts has no commit after e219ccc and zero diff" is contradicted by the 2026-08-06 draft rename and banner | src/v2/SLICE_16_FOUNDING.md:328 vs src/v2/founding-drafts/DRAFT_2026-07-07_REMOTE_MCP_TRAN |
| A5-F21 | strategy & narrative | STALE | 0 | Two strategy documents still describe themselves as uncommitted | strategy/RESEARCH_LEDGER_2026-08.md:2-3; strategy/ASTER_ROADMAP_2026-08.md:8 |
| B1-F01 | Lambert (mathematician) | CODE_BUG | 0 | Exact parabolic input (T* == T1 bit-exactly) returns no_convergence / null: x0=1 makes all three derivative formulas 0/0 | src/v2/core/lambert/initial-guess.ts:34-35; src/v2/core/lambert/tof.ts:82,89,104; src/v2/c |
| B1-F03 | Lambert (mathematician) | FACTUAL_ERROR | 0 | The x^2 <= 0.90 multi-rev cap is justified by hyp2f1b precision, but hyp2f1b is never evaluated on the M>=1 path (and the M=0 path that uses it has no cap) | src/v2/core/lambert/lambert-multi-rev.ts:10-12; tools/slice18-research/MATH_LAYER_AUDIT.md |
| B1-F04 | Lambert (mathematician) | MISSING_EVIDENCE | 0 | 'Dispatch 37.5 measured hyp2f1b relative error <= 1e-9 through x^2 = 0.95' has no committed artifact and is ill-posed | src/v2/core/lambert/lambert-multi-rev.ts:10; src/v2/SLICE_11_FOUNDING.md:134,186 ('37.5 ve |
| B1-F05 | Lambert (mathematician) | FACTUAL_ERROR | 0 | hyp2f1b's documented and tested domain [0, 0.5] excludes the negative arguments production passes for hyperbolic near-parabolic transfers | src/v2/core/lambert/hyp2f1b.ts:4,9-10; tests/v2-lambert/hyp2f1b.test.mjs:77 |
| B1-F06 | Lambert (mathematician) | FACTUAL_ERROR | 0 | stumpff.ts claims to be used by the Izzo solver (it is dead code in v2) and calls its 1e-6 series cutoff 'conservative' although the closed form just above it loses ~6 digits | src/v2/core/lambert/stumpff.ts:1-2,17-18; src/v2/SLICE_10_FOUNDING.md DEC-1 Revision 2 ('H |
| B1-F07 | Lambert (mathematician) | STALE | 0 | INV-015 text still states the solver is PyKEP source compiled to WebAssembly, without an amendment marker | src/v2/SLICE_10_FOUNDING.md:51 |
| B1-F08 | Lambert (mathematician) | FACTUAL_ERROR | 0 | 'Units inside the worker: meters, m/s' misstates the units the Lambert math actually runs in (km, km/s, mu in km^3/s^2) | src/v2/SLICE_11_FOUNDING.md AMD-7 (last sentence); INVARIANTS.md:34 |
| B1-F09 | Lambert (mathematician) | CODE_BUG | 0 | lambertMultiRev's 6th parameter is named `lw` but is consumed as `prograde`; the trap is recorded only in a slice-18 research script | src/v2/core/lambert/lambert-multi-rev.ts:276-291; src/v2/porkchop/grid-compute.ts:13-20; t |
| B1-F10 | Lambert (mathematician) | MISSING_EVIDENCE | 0 | The M=1 'reference' agreement test is self-referential (same tof/householder/initial-guess modules); the Node test suite has no independent anchor for M>=1 | tests/v2-lambert/lambert-multi-rev.test.mjs:6,54,121,278-281; tools/slice11-research/measu |
| B1-F11 | Lambert (mathematician) | STALE | 0 | izzo.ts header still says multi-rev is 'partially implemented but not end-to-end validated' | src/v2/core/lambert/izzo.ts:19-20,72-76 |
| B2-F01 | core math, frames, time | CODE_BUG | 2 | Sun rendered at its SSB-relative position inside a Sun-centered scene (frame/origin mixing) | src/v2/boundary/slice2-fixture-spec.md:32; src/v2/core/constants/README.md:21; src/v2/boun |
| B2-F04 | core math, frames, time | FACTUAL_ERROR | 0 | The queued GM_SUN label correction is itself wrong: 1.32712440018e20 is the DE405 value, not 'DE430' | STATUS.md:295 and :482 (C14); src/v2/SLICE_18_FOUNDING.md:162 (OQ-18-5); tools/slice18-res |
| B2-F06 | core math, frames, time | FACTUAL_ERROR | 0 | INV-011 Phobos truth-point count is wrong (17,280 vs 21,600) | src/v2/core/invariants/INV-011.md:21 |
| B2-F07 | core math, frames, time | FACTUAL_ERROR | 0 | Slice 8 'Eccentricity Band Population' describes the SBDB inventory, not the shipped catalog | src/v2/core/constants/README.md:315-318 (from tools/slice8-research/round3-synthesis-repor |
| B2-F08 | core math, frames, time | FACTUAL_ERROR | 0 | MATH_LAYER_AUDIT's 'obliquity rotation in exactly two places' inventory is wrong | tools/slice18-research/MATH_LAYER_AUDIT.md:25 |
| B2-F09 | core math, frames, time | FACTUAL_ERROR | 0 | Fixture identity recorded from a CRLF working copy; hash and byte count do not match the committed blob | tools/slice12-research/data/earth-vz-span-max.json:8-9; src/v2/SLICE_12_FOUNDING.md:172; t |
| B2-F10 | core math, frames, time | STALE | 0 | INV-005 names a runtime check that does not exist; its 'reserved for future propagator slices' deferral is stale | src/v2/core/invariants/README.md:41-46; INV-008.md:53; V2_FOUNDING_DOCUMENT.md:80 |
| B2-F11 | core math, frames, time | FACTUAL_ERROR | 0 | utc-to-tdb test pins a physically wrong value at the J2000 UTC epoch | tests/v2-lambert/utc-to-tdb.test.mjs:33-37 |
| B2-F12 | core math, frames, time | UNVERIFIABLE | 0 | Commit hashes cited as evidence are not resolvable in this clone (shallow) | tools/slice18-research/MATH_LAYER_AUDIT.md:3,72; src/v2/SLICE_12_FOUNDING.md:60-61; STATUS |
| B3-F08 | adversarial numerics | CODE_BUG | 0 | izzo.lambert has no tof > 0 guard and returns ok:true with a velocity pair for a negative time of flight | src/v2/core/lambert/izzo.ts:60-128 (guards at :90-100 cover geometry only) |
| B3-F09 | adversarial numerics | CODE_BUG | 0 | The porkchop worker defines an error-message type but uses it for one precondition only; every other failure escapes the message handler as an uncaught exception | src/v2/porkchop/porkchop.worker.ts:105-152 (error message posted only at :124-130) |
| B3-F11 | adversarial numerics | FUNDAMENTALLY_FALSE | 0 | The colormap test named for monotonicity and the no-NaN floor asserts those properties against a reimplementation inside the test file, not against production code | src/v2/porkchop/colormap.test.mjs:12-23 and :61-75 |
| B3-F12 | adversarial numerics | FACTUAL_ERROR | 0 | A path:line citation in composite-grid.ts points at the wrong line | src/v2/porkchop/composite-grid.ts:231-232 |
| B3-F13 | adversarial numerics | CODE_BUG | 0 | c3ToViridisRgb(NaN) returns [NaN, NaN, NaN] because clamp01 is NaN-transparent | src/v2/porkchop/colormap.ts:22-30 and :36-58 |
| B3-F14 | adversarial numerics | CODE_BUG | 0 | payloadAtC3(vehicle, NaN) returns BEYOND_CURVE, asserting a false statement about the published curve — the exact reasoning the module applies to corrupted budgets | src/v2/porkchop/launch-vehicles.ts:198-201 (contrast :41-46) |
| B3-F15 | adversarial numerics | CODE_BUG | 0 | computePorkchopGrid validates no grid parameter; buildLinspace turns nDep = 0 or negative into one departure column | src/v2/porkchop/grid-compute.ts:67-74 and :157-168 |
| B3-F16 | adversarial numerics | CONTRADICTION | 0 | SLICE_11_FOUNDING:63 states a delta-V stack model that DEC-7 in the same document replaces, and claims Slice 11 displays it | src/v2/SLICE_11_FOUNDING.md:63 vs :113-119 (DEC-7) |
| B4-F12 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | DEC-7 mis-classifies 1999 AO10 as Apollo, contradicting the catalog and the slice's own OQ-4 table | src/v2/SLICE_10_FOUNDING.md:147 (and :153) vs :306 |
| B4-F13 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | The PyKEP vendor postmortem says "Three viable continuations" and then lists four | src/v2/research/slice-10-lambert/pykep-vendor-attempt-postmortem.md:20 |
| B4-F14 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | The cache contract advertises tofMaxDays 1826 but the generator never samples beyond 1802 days | tests/fixtures/v2/lambert-screen-cache.json metadata.tofMaxDays; tools/build/precompute-la |
| B4-F15 | Slice 10-11 docs vs code | MISSING_EVIDENCE | 0 | The cache's precomputeScriptSha256 provenance hash does not match the script at HEAD (the other two hashes do) | tests/fixtures/v2/lambert-screen-cache.json metadata.provenance.precomputeScriptSha256 |
| B4-F16 | Slice 10-11 docs vs code | MISSING_EVIDENCE | 0 | OQ-8's only cited audit artifacts are /tmp paths that do not exist, so the slice's headline discipline result has no in-repo evidence | src/v2/SLICE_10_FOUNDING.md:441-442 |
| B4-F17 | Slice 10-11 docs vs code | FACTUAL_ERROR | 0 | INV-018 and OQ-1 attribute Measurement 1 to "a Web Worker"; the committed script uses Node worker_threads and measures the M=0 lambert() path, not the production multi-rev path | src/v2/SLICE_11_FOUNDING.md:35 and :47 |
| B4-F18 | Slice 10-11 docs vs code | CONTRADICTION | 0 | Section 7's cache-regeneration record disagrees with the shipped artifact on both date and commit | src/v2/SLICE_10_FOUNDING.md:457,459,468 |
| B5-F13 | Slice 12-13 DLA & launch vehicles | STALE | 0 | launch-vehicles.ts header says the New Glenn densification is 'pending, oracle to quantify' and names a C3=35 anchor that cannot exist | src/v2/porkchop/launch-vehicles.ts:7-8 |
| B5-F14 | Slice 12-13 DLA & launch vehicles | STALE | 0 | INVARIANTS.md still describes DLA as 'not yet in production' and its oracle as not yet run | INVARIANTS.md:134 (§4 Math-layer validation oracles) |
| B5-F15 | Slice 12-13 DLA & launch vehicles | FACTUAL_ERROR | 0 | The validation card labels the 2.10% RMS as covering 'every measured point'; it covers 6 of 22 | src/v2/data/validation-provenance.json, row cost-oracle-observed (solverConfig) |
| B5-F16 | Slice 12-13 DLA & launch vehicles | STALE | 0 | STATUS's retraction cites compare-data line numbers that have drifted onto unrelated code (the retraction itself is correct) | STATUS.md:345 |
| B5-F17 | Slice 12-13 DLA & launch vehicles | CONTRADICTION | 0 | Site numbers in the research summary and the shipped MGS disclosure disagree with the sourced OQ-12-2 values, outside the posted errata | tools/slice12-research/DLA_RESEARCH_SUMMARY.md:19-20; src/v2/app/porkchop/main.ts:700 |
| B5-F18 | Slice 12-13 DLA & launch vehicles | CONTRADICTION | 0 | The ΔV-stack panel always charges a sample-return departure burn while the cost card defaults to one-way, and its disclosure says neither | src/v2/porkchop/delta-v.ts:30-42; src/v2/app/porkchop/main.ts:925-926 and :944 |
| B5-F19 | Slice 12-13 DLA & launch vehicles | MISSING_EVIDENCE | 0 | The unreproducible showcase figures are restated unlabelled in production source | src/v2/app/porkchop/main.ts:65-67 |
| B5-F20 | Slice 12-13 DLA & launch vehicles | CODE_BUG | 0 | A non-finite C3 yields BEYOND_CURVE, asserting a curve statement the module's own rationale calls a falsehood | src/v2/porkchop/launch-vehicles.ts:199-201 (pinned by src/v2/porkchop/launch-vehicles.test |
| B5-F21 | Slice 12-13 DLA & launch vehicles | CONTRADICTION | 0 | The golden test and SLICE_14 cite two different capture commits for the same golden set, and the capture evidence is untracked | tests/v2-golden/launch-vehicles.golden.test.mjs:10-11 vs src/v2/SLICE_14_FOUNDING.md:98 |
| B5-F22 | Slice 12-13 DLA & launch vehicles | PROCESS_VIOLATION | 0 | INV-022's third provenance element (official-published vs estimated) is on no anchor | src/v2/porkchop/launch-vehicles.ts:69-177 (all 38 anchor comments) |
| B5-F23 | Slice 12-13 DLA & launch vehicles | STALE | 0 | The research library's status line still says the corpus has not been translated into DECs | src/v2/research/README.md:19 (governing src/v2/research/slice-12-deltav-propulsion/PROVENA |
| B5-F24 | Slice 12-13 DLA & launch vehicles | FACTUAL_ERROR | 0 | SLICE_13_FOUNDING names the two advisory strings at a file that does not exist | src/v2/SLICE_13_FOUNDING.md:19 (also DEC-13-3 at :61) |
| C1-F01 | catalog & data boundary | MISSING_EVIDENCE | 2 | Third-amendment (quality-axis) evidence and the A.3 harness's truth/CAD inputs are not committed | src/v2/SLICE_9_FOUNDING.md:248-262,364-367; tools/slice9-diagnostic/SLICE_9_QUALITY_AXIS_D |
| C1-F02 | catalog & data boundary | FACTUAL_ERROR | 0 | Not-Kepler-safe breakdown sums to 397, not 348 (overlapping categories presented as a decomposition) | src/v2/SLICE_9_FOUNDING.md:357-361 |
| C1-F03 | catalog & data boundary | STALE | 2 | 'Bounded re-anchor (~12k, not all 42k)' / 'hybrid for stale subsets' is stale: 99.1% of the catalog is Horizons re-anchored | src/v2/SLICE_9_FOUNDING.md:39-46; tests/fixtures/v2/nea-catalog-slice9.json top-level anch |
| C1-F04 | catalog & data boundary | CODE_BUG | 0 | assertFiniteNumber accepts null/boolean/empty as 0/1; committed record 2015 D1 has elements.maRad null and ingests silently as 0 | src/v2/boundary/slice9-nea-catalog.ts:166-172 (same helper at horizons.ts:206-212); fixtur |
| C1-F05 | catalog & data boundary | CONTRADICTION | 2 | INV-014 is assigned to two unrelated rules (star background vs three-gate tier) with no namespace note | src/v2/SLICE_8_5_FOUNDING.md:56; tests/v2-render-star-catalog.test.mjs:105; tests/v2-rende |
| C1-F08 | catalog & data boundary | STALE | 0 | Slice 10 fixture spec points at a tests/fixtures path that does not exist; the fixture lives in src/v2/data | src/v2/boundary/slice10-fixture-spec.md:9 |
| C1-F09 | catalog & data boundary | STALE | 0 | Boundary README source map cites boundary/asterank.ts and boundary/nhats.ts, which do not exist | src/v2/boundary/README.md:271-275 |
| C1-F10 | catalog & data boundary | FACTUAL_ERROR | 0 | '.gitignore:17' citation is off by two at HEAD | src/v2/SLICE_9_FOUNDING.md:427; INVARIANTS.md:172; tests/v2-slice9-cutover.test.mjs:32 |
| C1-F11 | catalog & data boundary | STALE | 0 | Status headers and scope lines left at 'implementation pending' / pre-ship values | src/v2/SLICE_9_FOUNDING.md:3; src/v2/SLICE_8_5_FOUNDING.md:3,5,15,83,102; src/v2/SLICE_9_P |
| C1-F12 | catalog & data boundary | FACTUAL_ERROR | 0 | NEA fixture spec example contradicts the committed epochPolicy and the albedo-0.14 radius formula | tests/fixtures/v2/nea-catalog-slice9.spec.md:37,78-80 |
| C1-F13 | catalog & data boundary | CODE_BUG | 0 | Boundary test's tier-distribution assertion compares the fixture summary to itself; the 41,558/348 split is pinned nowhere | tests/v2-boundary-slice9.test.mjs:67-69,81,91 (cited as retained coverage at src/v2/SLICE_ |
| C1-F14 | catalog & data boundary | PROCESS_VIOLATION | 0 | Path A record (reanchor-90d-*.json) is tracked without the '!' exception the .gitignore convention requires | .gitignore:17-18,30-32; tools/slice9-ingestion/data/reanchor-90d-summary.json, reanchor-90 |
| C1-F15 | catalog & data boundary | STALE | 0 | Committed sha256 for the 2026-2040 fixture is the CRLF-checkout hash and is no longer reproducible under eol=lf | tools/slice12-research/data/earth-vz-span-max.json:8; src/v2/SLICE_12_FOUNDING.md:172 |
| C1-F16 | catalog & data boundary | MISSING_EVIDENCE | 0 | Gate 1 (CAD encounter-flag) per-body evidence for the production fixture is not committed | src/v2/SLICE_9_FOUNDING.md:180-182,359; tools/slice9-ingestion/build-nea-catalog.mjs:29,11 |
| C2-F01 | Slice 18 fidelity tiers | STALE | 2 | dv-scope-results.json is a stale aggregate from the uncommitted CAD pull and does not reproduce from committed inputs | tools/slice18-research/dv-scope-results.json (rowsTotal, scope.byPredictedAddedDrift, dist |
| C2-F02 | Slice 18 fidelity tiers | STALE | 2 | Committed Kepler-sweep evidence shows a 2π residual; the '≤1.8e-15 rad' claim exists in no committed artifact | STATUS.md:285; tools/slice18-research/MATH_LAYER_AUDIT.md:54,70; tools/slice18-research/au |
| C2-F03 | Slice 18 fidelity tiers | FACTUAL_ERROR | 2 | Founding doc dates Front B's completion 2026-09-02; git and the artifacts say 2026-09-06; STATUS corrected it, the founding doc did not | src/v2/SLICE_18_FOUNDING.md:183, :233, :95 (DEC-18-3 annotation date) |
| C2-F04 | Slice 18 fidelity tiers | STALE | 0 | The founding doc's header lock date (2026-09-02) is wrong and not covered by C-3 | src/v2/SLICE_18_FOUNDING.md:3 |
| C2-F05 | Slice 18 fidelity tiers | STALE | 0 | STATUS still says the OQ-18-6 ruling and the date correction await annotations that landed on 2026-09-10 | STATUS.md:121, :146, :160 |
| C2-F08 | Slice 18 fidelity tiers | FACTUAL_ERROR | 0 | The 'DE430' attribution of GM_SUN = 1.32712440018e20 is itself a mislabel (it is the DE405 value) | tools/slice18-research/MATH_LAYER_AUDIT.md:47; STATUS.md:295; STATUS.md:482 (C14); src/v2/ |
| C2-F09 | Slice 18 fidelity tiers | FACTUAL_ERROR | 0 | 'minC3 value shift ≤ 1.1 km²/s² abs on every body' is contradicted by the committed argmin results (2025 VP: 2.27) | tools/slice18-research/NEA_DRIFT_MEASUREMENT.md:119; STATUS.md:277 |
| C2-F10 | Slice 18 fidelity tiers | FACTUAL_ERROR | 0 | DEC-18-6's 'Verified' footnote derives 24.3% from the wrong count (10,152 gives 24.2%) | src/v2/SLICE_18_FOUNDING.md:109 |
| C2-F11 | Slice 18 fidelity tiers | FACTUAL_ERROR | 0 | DEC-18-5's 'Verified' footnote places countVerified: 9 in the wrong finding of the truth fixture | src/v2/SLICE_18_FOUNDING.md:87 |
| C2-F12 | Slice 18 fidelity tiers | FACTUAL_ERROR | 0 | Apophis's 2028-09-12 pass is at 0.257 AU, not '~0.27 AU' | src/v2/SLICE_18_FOUNDING.md:245 |
| C2-F13 | Slice 18 fidelity tiers | CONTRADICTION | 0 | The math-layer audit is dated 2026-09-06 by its own header and 2026-09-09 by STATUS | tools/slice18-research/MATH_LAYER_AUDIT.md:3; STATUS.md:45; STATUS.md:284 |
| C2-F14 | Slice 18 fidelity tiers | UNVERIFIABLE | 0 | Observation: 2015 D1 is catalogued as 'C/2015 D1 (SOHO)', a comet that (external knowledge) disintegrated in 2015; the record tiers it only as 'cannot propagate' | tests/fixtures/v2/nea-catalog-slice9.json asteroid-2015 D1; src/v2/SLICE_18_FOUNDING.md:71 |
| C3-F03 | Slice 17 compare & QOL | FUNDAMENTALLY_FALSE | 2 | "Display calls the SAME core function that generated the catalog, so it cannot drift" is false: the catalog generator has its own copy of the H→D formula with its own literal 0.14; | src/v2/app/compare/main.ts:182-186; SLICE_17_FOUNDING.md:615-616; STATUS.md:77; STATUS.md: |
| C3-F06 | Slice 17 compare & QOL | CONTRADICTION | 0 | STATUS says OQ-17-8 is disposed; the founding doc never dispositions it | STATUS.md:44 and STATUS.md:79; SLICE_17_FOUNDING.md:395-400 and §8:586 |
| C3-F07 | Slice 17 compare & QOL | STALE | 0 | STATUS's Slice 19 item 1 cites a deployed bundle name that no longer exists and quotes the literal with the wrong dash/× characters | STATUS.md:425 (also :418-421 and :28) |
| C3-F08 | Slice 17 compare & QOL | FACTUAL_ERROR | 0 | DEC-17-2's "median 243.42 ms/body" is one body's run-median, not the per-body median | SLICE_17_FOUNDING.md:129 |
| C3-F09 | Slice 17 compare & QOL | FACTUAL_ERROR | 0 | A quoted backlog caveat is paraphrased, not quoted | SLICE_17_FOUNDING.md:342 (§5 B5) and :560-561 (§8 CUT) |
| C3-F10 | Slice 17 compare & QOL | PROCESS_VIOLATION | 0 | User copy duplicates constants as literals on two trust surfaces, including one whose header claims it cannot drift | src/v2/app/compare/main.ts:239, :240, :786, :205; src/v2/app/catalog-list/honesty-disclosu |
| C3-F11 | Slice 17 compare & QOL | FACTUAL_ERROR | 0 | ERRATUM D-07's artifact path does not resolve, and the "D-07" label covers two further §8 amendments that never landed | SLICE_17_FOUNDING.md:641 |
| C4-F19 | renderer & physical constants | FUNDAMENTALLY_FALSE | 0 | The documented halo toggle cannot be operated by a consuming page | src/v2/render/halos.md:34,45-46 vs src/v2/render/halos.ts:5,91 |
| C4-F20 | renderer & physical constants | CODE_BUG | 0 | halos.ts uses two inconsistent pixel scales in one function, so the documented 1.5 px / 4 px thresholds are 5.48% off | src/v2/render/halos.ts:102-103 vs :114; documented at src/v2/render/halos.md:9,14 |
| C4-F21 | renderer & physical constants | STALE | 0 | INVARIANTS pins the per-frame atmosphere copy at a line 518 lines away | INVARIANTS.md:89-90 |
| C4-F27 | renderer & physical constants | CONTRADICTION | 0 | Orbit trails are listed as a Slice 7 non-goal but shipped in Slice 7 | src/v2/render/asteroid-rendering.md:105-107 vs src/v2/app/solar-system/runtime.ts:1309-131 |
| C4-F28 | renderer & physical constants | FUNDAMENTALLY_FALSE | 0 | Mars's limb glow is attributed to an ultraviolet nightglow | src/v2/research/slice-renderer-planets/RESEARCH.md:189; src/v2/prototypes/renderer-test/at |
| C4-F29 | renderer & physical constants | CONTRADICTION | 0 | The r128 API table forbids CDN OrbitControls, which the repo loads from a CDN, and states a false fact about r128 | INVARIANTS.md:113 vs index.html:19,806,1482 and src/v2/prototypes/renderer-test/scene.ts:3 |
| C4-F30 | renderer & physical constants | STALE | 0 | The Slice V1 founding doc still calls itself a skeleton and its prototype untracked | src/v2/SLICE_V1_FOUNDING.md:3,11,466-467,478 |
| C4-F31 | renderer & physical constants | CODE_BUG | 0 | Earth's city lights bleed onto the daylit hemisphere | src/v2/render/earth-shader.ts:49-50,53,60 |
| C4-F32 | renderer & physical constants | MISSING_EVIDENCE | 0 | Two 'display integrity' tests verify only that source text exists | tests/v2-runtime-display-integrity.test.mjs:80-103; same pattern at tests/v2-runtime-camer |
| C4-F34 | renderer & physical constants | CODE_BUG | 0 | The documented inner-radius-ascending renderOrder for ring substructure is not implemented | src/v2/render/saturn-ring-substructure.md:71-75 vs src/v2/render/saturn-rings.ts:71-72,325 |
| C4-F35 | renderer & physical constants | PROCESS_VIOLATION | 0 | A procedurally invented ring brightness profile lives in a tracked file - the INV-V1-001 class | src/v2/prototypes/renderer-test/rings.ts:42-45,96-124 vs src/v2/SLICE_V1_FOUNDING.md:70-77 |
| C5-F15 | honesty surfaces & user copy | PROCESS_VIOLATION | 0 | INV-025: bare internal identifiers in deployed user-facing copy | src/v2/app/catalog-list/honesty-disclosure.ts:69; v2/earth-moon/index.html and docs/v2/ear |
| C5-F16 | honesty surfaces & user copy | STALE | 0 | The smoke harness's "Expected C3" literal is one solver fix behind the shipped solver | src/v2/app/porkchop-smoke/main.ts:16-20; rendered at src/v2/porkchop/porkchop-view.ts:1468 |
| C5-F17 | honesty surfaces & user copy | PROCESS_VIOLATION | 0 | INV-026 residue: two trust-surface numbers still render from literals rather than derived values | src/v2/app/about/main.ts:377-379 (with src/v2/boundary/slice9-nea-catalog.ts:20); src/v2/p |
| C5-F18 | honesty surfaces & user copy | FACTUAL_ERROR | 0 | The "?" shortcut overlay omits the middle-drag pan binding the code implements | src/v2/app/solar-system/runtime.ts:1117 vs :2008 |
| C5-F19 | honesty surfaces & user copy | MISSING_EVIDENCE | 0 | The compare page's method badge does not state that its search is single-revolution only | src/v2/app/compare/main.ts:757 and :931; src/v2/porkchop/compare-data.ts:300-312 |
| C5-F20 | honesty surfaces & user copy | MISSING_EVIDENCE | 0 | The close-approach-degeneracy caveat is popover-only for 3,163 rows that render a green "low C3" badge | src/v2/app/catalog-list/honesty-disclosure.ts:74-83 vs src/v2/app/catalog-list/row.ts:27-4 |
| D1-F06 | MCP & Slice 14-15 | CODE_BUG | 0 | dla_feasibility throws (MCP tool error) instead of returning a value when the DLA is undefined (null) | mcp/src/tools/compute-shared.ts:281,294 |
| D1-F08 | MCP & Slice 14-15 | STALE | 2 | Research-corpus folders/README use a superseded slice numbering (14 = composition, 15 = ISRU) with no annotation | src/v2/research/README.md:12-19 (also slice-14-composition/PROVENANCE.md:10-14, slice-15-i |
| D1-F09 | MCP & Slice 14-15 | STALE | 0 | proxy/ is a dead byte-identical duplicate of worker/ whose README documents the other directory and a macOS absolute path | proxy/README.md:44 (also :29,49-53,61,122-126; REFACTOR_MAP.md:14; .gitattributes:19-20) |
| D1-F10 | MCP & Slice 14-15 | FACTUAL_ERROR | 0 | SLICE_14 has two different OQs both numbered OQ-14-5 | src/v2/SLICE_14_FOUNDING.md:81 and :100 |
| D1-F11 | MCP & Slice 14-15 | STALE | 0 | ci.yml self-description ('two gates … never builds docs/') no longer matches its four jobs; DEC-14-5 record not amended | .github/workflows/ci.yml:3-8 (DEC-14-5 at src/v2/SLICE_14_FOUNDING.md:140-145) |
| D1-F12 | MCP & Slice 14-15 | FACTUAL_ERROR | 0 | DEC-15-6/OQ-15-7 say mcp/ imports core 'via tsconfig paths'; the tsconfig has no paths | src/v2/SLICE_15_FOUNDING.md:91 (also :147, :150) |
| D1-F13 | MCP & Slice 14-15 | STALE | 0 | SLICE_15 §8 describes the committed eval report with values the file no longer carries | src/v2/SLICE_15_FOUNDING.md:193 |
| D1-F14 | MCP & Slice 14-15 | STALE | 0 | SLICE_15 DEFERRED block says the five Fable drafts are 'NOT yet downloaded … NOT ingested'; they were ingested 2026-07-18 | src/v2/SLICE_15_FOUNDING.md:206 |
| D1-F15 | MCP & Slice 14-15 | UNVERIFIABLE | 0 | npm-registry claims (publisher 'hudsoclavin', shasum c912f2b, 2026-07-10 handshake, aster-mcp collision, 0.1.0 baked dirty) cannot be verified offline; the handle may be a typo | src/v2/SLICE_15_FOUNDING.md:69 (also :174; STATUS.md:14; mcp/scripts/check-publish-clean.m |
| D2-F01 | Slice 16 study | UNVERIFIABLE | 2 | Sealed commit 670b039 and tag slice16-prereg-v1 are absent from this checkout (shallow clone); the doc's own verification recipe cannot be run | src/v2/SLICE_16_FOUNDING.md:1340-1348 (§27); STATUS.md:49; tools/slice16-harness/config.mj |
| D2-F03 | Slice 16 study | FACTUAL_ERROR | 2 | '$13.82 (pilots + attempt 1)' excludes the pilots, and all spend figures are the harness's token-price estimate (cache unpriced) presented as 'actual spend' | STATUS.md:63; src/v2/SLICE_16_FOUNDING.md:1086,1581-1583; tools/slice16-harness/CLOSE_REPO |
| D2-F06 | Slice 16 study | MISSING_EVIDENCE | 2 | 'Collected under the instrument sealed at 670b039' is not literally true for the harness: four post-seal harness commits, a mid-run code change at row 65, harnessDirty:true/serverB | src/v2/SLICE_16_FOUNDING.md:1437,1445,1503-1505; tools/slice16-harness/PRE_RUN_GATE.md box |
| D2-F07 | Slice 16 study | FACTUAL_ERROR | 0 | 'One prefix fingerprint across every row' is false across the 468 rows (one per arm) | src/v2/SLICE_16_FOUNDING.md:1505; tools/slice16-harness/FINISH_REPORT.md §How the run went |
| D2-F08 | Slice 16 study | STALE | 0 | RUNBOOK.md ('procedure of record') keeps stale model/r/test/mock counts; its closing banner corrects only the scenario set | tools/slice16-harness/RUNBOOK.md:16-24,35,40-44, §5b checks 1-3 and 5b, §7 table, :414 |
| D2-F09 | Slice 16 study | FACTUAL_ERROR | 0 | Hook comment misdates the appendix append as 2026-09-21; the commit is 2026-09-22 | .githooks/pre-commit:62 |
| D2-F10 | Slice 16 study | STALE | 0 | src/v2/research/README.md still presents the 2026-05-22 slice numbering (16 = redirect/capture, 17 = economics, 18-20 = risk) as current; the renumbering is explained nowhere in th | src/v2/research/README.md:13-15,17-19; src/v2/research/slice-16-redirect-capture/PROVENANC |
| D2-F11 | Slice 16 study | FACTUAL_ERROR | 0 | STATUS drops the dated snapshot from the Haiku model id | STATUS.md:51 |
| D2-F12 | Slice 16 study | FACTUAL_ERROR | 0 | runs/README.md labels the 18-row mock ledger and its grades as instrument 'A12'; they are A9-era (r=3), collected before A10, the remediation and A12 | tools/slice16-harness/runs/README.md NOT-STUDY-DATA table rows for ledger-mock.jsonl and l |
| D4-F27 | legacy V1 & economics | FACTUAL_ERROR | 0 | LEGACY.md's scope list links absolute macOS paths, broken in every clone | LEGACY.md:9-11 |
| D4-F28 | legacy V1 & economics | PROCESS_VIOLATION | 0 | proxy/ and worker/ are byte-identical duplicates declaring the same Cloudflare Worker name, and only worker/ is covered by tests | proxy/{README.md,index.js,wrangler.toml} vs worker/{...}; tests/phase6-contract-smoke.test |
| D4-F29 | legacy V1 & economics | CONTRADICTION | 0 | The extract and redirect planners convert the same UI year input to Julian Date by two different formulas | src/economics/mission-costs/planner.ts:82-83 vs src/economics/mission-costs/redirect.ts:16 |
| D4-F30 | legacy V1 & economics | FACTUAL_ERROR | 0 | The shipped fallback catalog claims 12 entries but holds 11, is 7.45 years stale, and carries price/profit values from 1e-42 to 1.5e14 USD that flow into user-facing fields | src/data/asteroids/fallback-catalog.ts:2-15; same data in physics.worker.js |
| D4-F31 | legacy V1 & economics | CODE_BUG | 0 | The redirect feasibility score's "value" term is saturated at its ceiling for essentially every target, while the UI describes the score as weighted by value | src/workers/physics/planner/redirect.ts:221; duplicate src/economics/scoring.ts:192; claim |
| D4-F32 | legacy V1 & economics | FACTUAL_ERROR | 0 | The deployed root ships a dead importmap pointing at a third-party CDN | docs/index.html:17-24 (and index.html:15-24) |