# SLICE 20 — RETURN LEG — FOUNDING DOCUMENT

STATUS: DRAFT — not locked. Hudson rules the PROPOSED DECs and locks with a dated line in §9.
Repo home when committed: `src/v2/SLICE_20_FOUNDING.md` (protected path; Hudson hand-commits).
Additive-only once committed. Written by Nova on 2026-11-04 at main = `674b5b9`.

## §1. Purpose and scope

Aster plans only the outbound leg. Mining is a round trip. Slice 20 adds **K1: the asteroid → Earth return leg**,
computed per body as a screening-fidelity Lambert grid. It exports the Earth-arrival hyperbolic excess velocity as a
**vector with its epoch**, not a scalar. K1 is also the prerequisite for K2 (the Momentum Bank, Slice 26).

Slice 20 also carries Front A, the audit's "tests that can fail" plus the work Slice 19.5 routed here. Per
ASTER_TIMELINE §1 rule 1, Front A is the first front and is not cuttable.

The slice also settles two honesty questions that are open on the live site today:
- **OQ-19-4:** compare shows "best windows" that arrive after the date Aster can vouch for the asteroid's orbit.
- **The symmetric-return assumption:** sample-return mode charges the return departure burn as equal to the outbound
  arrival v∞. The S20_01 recon measured that charge off by 0.08–5.1 km/s, in both directions.

IN SCOPE: Fronts A–F (§6).

OUT OF SCOPE (each with its destination):
- Extending the Earth ephemeris past 2040-12-31: Slice 21 H0, which already owns fixture regeneration and
  `horizonsFixtureSha256` (DEC-20-3).
- A catalog-wide return screening cache, and the catalog's supported-window filter: Slice 21 (DEC-20-6).
- B-plane targeting, entry flight-path angle, entry location, Earth–Moon capture, tether catch: not computed;
  reported as "not evaluated" (DEC-20-1). Catch is K2, Slice 26.
- Precision-per-tier policy (B11): Slice 22.
- Planetary axes (Front G): Slice 22.

## §2. Inputs and pre-research

All on `main` unless stated.

- **S20_01 recon** (read-only), `tools/slice20-research/recon/S20_01-REPORT.md` (`4b75726`). Findings this doc rests
  on:
  - **Kernel is swap-only.** Feeding the unedited `computePorkchopGrid` swapped providers gives the return-leg v∞
    bit-identically. The work is around the kernel:
    - Earth must be read at **arrival** epochs;
    - the v∞ vectors are stripped at the worker boundary (`porkchop.worker.ts:73-86`);
    - selection, segmentation and support are keyed to departure C3 and the arrival epoch.
  - **Earth fixture** `horizons-inner-solar-system-2026-2040.json` ends **2040-12-31**. Return arrivals need up to
    2044-12-31 (return departures to 2040), 2049-12-31 (chained) or 2052-01-01 (chained plus a 2-year return window).
    The latest return departure that keeps a 1826.25 d TOF inside the fixture is **2035-12-31**.
  - **Compute:** the existing linear-scan Earth lookup makes a return grid ~10× slower (2.7 s/body). An indexed lookup
    gives identical states (max abs diff 0) at 145–221 ms/body.
  - **Symmetric-return error:** 0.08–5.1 km/s across six rows, sign changing (overcharges at min-C3 windows,
    undercharges at the windows sample-return mode picks). Exploratory, unvalidated.
  - **Support** (`support-boundary.ts`) is a statement about the epoch at which the asteroid's Keplerian elements are
    evaluated. For a return leg that is asteroid **departure**.
  - **OQ-19-4 size:** 7,400 of 10,150 L1 catalog best windows (72.9%) arrive after support. On the live compare grid
    it is 7,211; **556 L1 bodies have no supported cell at all**.
  - **Oracle:** poliastro 0.17 (venv `~/.aster-slice11-venv`) matched 90 return cells to 2e-15. The committed driver is
    POSIX-only and writes into the repo.
  - **K2** consumes a scalar v∞ and one declination today; a real catch needs vector, epoch and B-plane.
  - **MCP (R14):** `marginDeg` lives only in the adapter and is pinned by eval P9; unknown-`siteId` is pinned by unit
    test T19. INV-029 leaves one free tool slot of 8.
- **S20_02 literature pass** (leads, unverified): `tools/slice20-research/literature/S20_02_return_leg_perplexity.md`.
- **S20_03 verification pass:** `tools/slice20-research/literature/S20_03_verify_return_leg_results.md`. Values this doc
  may use (all CONFIRMED there, convention as stated):
  - NHATS entry-speed criterion: **≤ 12 km/s at 125 km altitude**; NHATS does not state inertial vs
    atmosphere-relative.
  - NHATS minimum asteroid stay: **8 days**. NHATS total round trip ≤ 450 days.
  - NHATS solves outbound and return as separate Lambert legs over independently varied outbound TOF, stay and
    inbound TOF; it does not assume symmetric return.
  - OSIRIS-REx: atmosphere-relative entry speed ≤ 12.4 km/s (requirement); interface radius 6503.142 km.
    Stardust: 12.9 km/s inertial at radius 6503.14 km. Reference context only; neither is an arrival-v∞ value.
  - `poliastro.iod.vallado.lambert` (0.17.0) is a non-Izzo (universal-variable) solver, **M = 0 only**.
  - NOT usable: the Keck 2012 return C3 range (UNVERIFIABLE; only 2008 HU4 at 1.8 km²/s² has partial support), and
    any low-v∞ validity threshold (UNVERIFIABLE; none exists in the literature found).
- **K2 prototype**, PR #1 (`origin/claude/k2-momentum-bank`, `8cb8d54`, tools-only, CI green, open): first research
  artifact; merged before Front B.
- **Carried rulings:** R14 (DEC-15-8 / INV-027, `SLICE_19_5_FOUNDING.md` §9.1); OQ-19-4 (ruled below, DEC-20-6);
  the Slice 19.5 §9.3 residuals routed to Slice 20 (F2 remainder, breadth-qualifier copy, cached-vs-recomputed copy,
  the FIX2 G4 source-text guards).
- **Pre-slice maintenance, already shipped:** the solar-system view's ephemeris window rolled to
  2026-11-01..2027-03-31 TDB (`s20-eph-roll`, merged at `674b5b9`); next refresh due before 2027-03-31.

## §3. Decisions

Status per DEC: RULED (Hudson has decided) · PROPOSED (needs Hudson).

### DEC-20-1 — K1 output contract. PROPOSED.
- **Quantity:** `v∞,E = v_Lambert,arrival(t_E) − v_Earth(t_E)`, the patched-conic incoming Earth-relative asymptotic
  velocity: spacecraft velocity relative to Earth, in the direction of inbound motion.
- **Exported per return window:**
  - asteroid departure epoch and Earth arrival epoch (TDB, tagged);
  - the v∞,E vector (km/s, ICRF equatorial axes, the frame `dla.ts` already uses), its magnitude and arrival C3;
  - the asteroid-departure v∞ vector and magnitude (the spacecraft's departure burn in this model);
  - the Lambert endpoint velocity vectors, revolution count M and branch;
  - μ values used; the asteroid elements' provenance; the body's tier and support status.
- **Derived, labelled:** arrival declination of the v∞,E vector. Its sign convention is stated in the UI and in the
  export (OQ-20-6).
- **Null and labelled "not evaluated":** B-plane coordinates, entry flight-path angle, entry location, atmosphere-relative
  entry speed, Earth–Moon capture, catch feasibility. Precedent: OSIRIS-REx targeted the B-plane and delivered
  finite-radius states to a separate entry analysis (S20_02 §1, S20_03 #7–8).
- **Mechanism:** the existing grid kernel with injected providers (asteroid at departure, Earth at arrival). No change
  to `src/v2/core/lambert/*`.

### DEC-20-2 — Return grid, pairing rule and selection. PROPOSED.
- **Standalone return grid** (K1's own view): asteroid departure dates × TOF 182.5–1826.25 d (outbound parity), M = 0
  and M = 1 on the porkchop page (parity), M = 0 only where compare is involved.
- **Paired return** (for a selected outbound window arriving at t_a): return departure
  t_d ∈ [t_a + S_min, t_a + S_max], with
  - **S_min = 8 d**: NHATS's minimum stay, the only verified stay precedent (S20_03 #12);
  - **S_max = 730.5 d**: a Nova screening choice, disclosed in the UI as "a screening choice, not a sourced value"
    (OQ-20-2).
- **Selection objective:** the minimum **asteroid-departure |v∞|** (the spacecraft's burn, the quantity the symmetric
  assumption stands in for). Earth-arrival |v∞| and the entry-speed screen (DEC-20-8) are reported for the selected
  window, not ranked. Reason: the two minima are not jointly reachable (S20_01 R3); a joint objective is OQ-20-1.
- Selection inside a cell keeps AMD-2's rule shape (min of the objective among converged branches; exact ties to M = 0),
  with the objective replaced. The outbound AMD-2 selection is unchanged.

### DEC-20-3 — Earth-span refusal (amends DEC-17-10 additively). PROPOSED; Hudson ruling pending.
- DEC-17-10's bounds check assumed Earth is read only at departure. For the return leg Earth is read at **arrival**.
  Every return cell whose Earth arrival is after the Earth fixture end (2040-12-31) is **refused**, not clamped and
  not extrapolated. The panel states the count of refused cells and the reason: "Earth positions after 2040-12-31 are
  not yet in Aster's ephemeris."
- Extending the Earth span is Slice 21 H0's job (it already owns fixture regeneration and `horizonsFixtureSha256`).
- Additive amendment to `SLICE_17_FOUNDING.md` §9 [P]: the bounds rule applies to every epoch at which Earth is read.
- **Strongest counterargument:** late outbound windows lose most of their paired returns (any return departure after
  2035-12-31 loses long-TOF cells). **Why accept it:** a refusal is honest and reversible; extending one fixture now
  splits H0's regeneration across two slices.

### DEC-20-4 — Indexed Earth lookup, outside core. PROPOSED.
An indexed (bisection) lookup over the existing Earth samples, implemented in the porkchop dependency layer, not in the
protected `core/interpolators/hermite.ts`. It must return states identical to the linear scan (test: max abs diff 0
over ≥ 1,000 random epochs, plus both endpoints). If the audit (§6 Front B) requires the change in core, it becomes a
[P] edit with its own commit.

### DEC-20-5 — Support for the return leg. PROPOSED.
Support governs the epoch at which the asteroid's elements are evaluated (S20_01 R4). For a return leg that is the
asteroid **departure** epoch. A paired return whose departure is after the body's support date carries the same flag
as an outbound window arriving after it. Earth arrival is governed by DEC-20-3, not by support.

### DEC-20-6 — OQ-19-4: filter, never exclude. RULED (Hudson, 2026-11-03).
Hudson's ruling: windows that arrive after the support date are **not excluded**. Users can filter them out, and the
filter is **on by default**.

Implementation rules (Nova, to make the ruling honest; PROPOSED):
- **Surfaces:** compare and the porkchop page (both compute live grids, so they can filter per window).
- **Ranking under the filter:** among supported windows only. With the filter off: the current ranking, with the X2
  flag.
- **Visible count:** when the filter hides anything, the surface says "<n> windows hidden: they arrive after the date
  Aster can vouch for this orbit — show them".
- **No supported window:** the 556-body case shows a refusal state ("No window in this grid arrives before <date>; <n>
  unsupported windows are hidden — show them"), never an empty table.
- **Catalog:** keeps the flag only. Its precomputed best windows (7,400 affected) can't be re-ranked per window without
  a cache that stores the best *supported* window; filtering would hide whole bodies that do have supported windows.
  The catalog filter moves to Slice 21's cache regeneration.
- **Conflict to rule:** DEC-18-7 says after-encounter cells are "de-emphasized, never suppressed". A default-on hide is
  suppression by default. Proposed resolution: an additive amendment to `SLICE_18_FOUNDING.md` §9 [P] that a
  one-click, user-reversible filter with a visible hidden-count satisfies "never suppressed". Hudson rules (OQ-20-10).
- This changes what ranks first, which DEC-17-3 governs, so it is math-layer work with audit-before-deploy (Front C).

### DEC-20-7 — Sample-return totals. PROPOSED; Hudson ruling pending.
- **Interim (Front A, now):** the existing symmetric-return disclosure (`SLICE_11_FOUNDING.md:117`, `porkchop/main.ts`)
  states the measured error range and its sign change, citing S20_01 R3.
- **Front E:** sample-return totals switch from the symmetric assumption to the computed paired return (DEC-20-2),
  only after Front B's oracle and audit pass. If the audit fails or the front is cut, the totals stay symmetric with
  the quantified disclosure, and K1 ships as a separate panel.
- **Strongest counterargument:** scope at 8 h/week. **Why replace anyway:** a shipped number off by up to 5 km/s, in
  either direction, is worse than the scope; NHATS (the closest published method) never assumes symmetry (S20_03 #13).

### DEC-20-8 — Entry-speed screen against a named profile. PROPOSED.
- Two-body inertial entry speed: `v_EI = sqrt(v∞² + 2·μ_E / r_EI)`, with `r_EI = R_E + 125 km`.
  - `R_E` = the core Earth radius (`core/constants/bodies.ts`, 6,378,136.6 m).
  - `μ_E` = a new core constant GM_EARTH [P], **verify-before-lock** at Front B's entry gate (official source and
    value recorded with it).
- The result is compared against **one named profile: "NHATS: ≤ 12 km/s at 125 km"** (S20_03 #11), and labelled
  "entry-speed screen (two-body, inertial)". NHATS does not state its convention; Aster states its own.
- It is never labelled "capsule feasible" or "return feasible". Heating, loads, corridor, landing and atmosphere-relative
  speed are "not evaluated".
- No weak-arrival numeric cutoff (S20_03 #16). Every return result carries "Earth–Moon capture not evaluated".

### DEC-20-9 — Oracle and audit for K1. PROPOSED.
Before K1 deploys:
- **(a) Implementation agreement:** poliastro `izzo.lambert` on return cells, vectors not magnitudes, M = 0, 1, 2.
- **(b) Formulation independence, M = 0:** poliastro `vallado.lambert` (universal-variable; S20_03 #15).
- **(c) Formulation independence, all M:** endpoint closure. Propagate each returned departure state under two-body
  dynamics for the TOF and require arrival at Earth's position within tolerance. Also check energy and angular-momentum
  consistency.
- **Driver:** a Windows-capable driver that writes outside the repo; committed results only.
- **Audit:** a four-lens audit (mathematician, adversarial, architect, reconciliation) written by Nova or a fresh
  session, with a mutation check (break the endpoint swap in a throwaway clone; a test must fail).

### DEC-20-10 — Vectors cross the worker. PROPOSED.
The worker message carries the v∞ vectors (or v1/v2 plus the subtracted body velocity) for the return direction.
`stripBranch` keeps its outbound behaviour. The message gains an explicit `direction: 'outbound' | 'return'` field.

### DEC-20-11 — K4 light-time chip (QOL slot). RULED (Slice 19 kernels §6.3); restated.
- **Quantity:** Earth-to-body distance ÷ c.
- **Display:** 2 significant figures, tier-inherited caveat.
- **Refusals:** L0, PROP FAIL, non-finite, no selection.
- **Tests:** behavioural; no source-regex.
- **Constant:** c = 299,792,458 m/s (exact by SI definition) into core [P].
- Start from the preserved patch; its quantity, precision and refusals are the rework.

### DEC-20-12 — R14: MCP math into core. RULED (Slice 19.5 §9.1 R14); implementation PROPOSED.
- Move `marginDeg` into core beside `classifyFeasibility` [P]; it has never been audited, so it joins Front B's audit.
- Unify the unknown-`siteId` path to the `not_found` refusal (DEC-15-8). T19 changes, with Hudson's ruling recorded.
- Eval P9 is amended per the `0052ecb` precedent only if its pinned value moves.

### DEC-20-13 — AGENTS §3 matches practice. PROPOSED.
AGENTS §3 says Claude Code does not build, test or write TypeScript. In practice, Claude Code is the execution agent
when Codex quota is out (project instructions). Amend §3 [P] so the rule matches the practice and states the same
discipline for both agents. Recorded because `S20_00_EPHEMERIS_ROLL` was dispatched to Claude Code against §3
(Nova's error, caught by the executor).

## §4. Open questions

- **OQ-20-1** — Joint return objective (asteroid-departure burn vs Earth-arrival v∞). DEC-20-2 ranks by the burn and
  reports the rest. Revisit with K2's needs.
- **OQ-20-2** — S_max. 730.5 d is unsourced. Find a sourced robotic sample-return stay precedent (verify-before-lock),
  or keep it as a disclosed screening choice.
- **OQ-20-3** — How far Slice 21 extends the Earth span: 2044-12-31, 2049-12-31 or 2052-01-01 (S20_01 R1), at daily
  cadence.
- **OQ-20-4** — MCP: use the last tool slot (INV-029) for a return tool, or extend `porkchop_scan` / `explain_cell`.
  Default: no new MCP tool in Slice 20.
- **OQ-20-5** — A catalog-wide return screening cache. Default: Slice 21, with the supported-window cache.
- **OQ-20-6** — Arrival declination sign: declination of the v∞,E vector (velocity direction) vs of the incoming
  radiant (−v∞,E). |dec| is the same; the sign flips. Default: the v∞,E vector, labelled.
- **OQ-20-7** — Use Keck's 2008 HU4 arrival C3 = 1.8 km²/s² (partially verified) as a non-blocking sanity check?
  Default: no; mission values come from a different architecture (SEP, lunar capture).
- **OQ-20-8** — GM_EARTH value and source (verify-before-lock at Front B's entry gate).
- **OQ-20-9** — Stardust 12.9 vs 12.8 km/s: unresolved convention difference (S20_03 #4). Logged; not used.
- **OQ-20-10** — DEC-18-7 vs a default-on filter (DEC-20-6). Hudson rules the amendment.

## §5. Cut rule

Cut in this order if hours run out, recording each cut in §9:
1. K4 (Front F) → Slice 21 QOL slot.
2. R14 (Front F) → Slice 21, with its audit.
3. Front E (sample-return switch) → Slice 21. The quantified disclosure from Front A stays.
4. Front D polish (beyond the minimal panel).

Not cuttable: Front A; Front B (K1 core, oracle, audit); Front C (DEC-20-6); the Front D minimal panel.

## §6. Fronts

Gate types: [V] visual (Hudson + Clome) · [C] copy (Hudson approves wording first) · [M] math (four-lens audit
before deploy) · [P] protected path (unstaged; Hudson hand-commits).

**Phase 0 — lock**
- Merge PR #1 (K2 prototype) as a research artifact.
- Commit this draft [P]; Hudson rules DEC-20-1…13 and OQ-20-10; lock line in §9.

**Front A — Carried: tests that can fail, and the 19.5 residuals (first; not cuttable)**
- **E1:** `v2-architecture.test.mjs` enforces AGENTS §1's wall, including non-relative and `@` alias specifiers.
- **E2:** Slice 9 tier distribution asserted against an independent count of the records.
- **E3:** the L1-boundary "independent re-implementation" made independent, or relabelled self-consistency in
  STATUS and the test.
- **E4:** orbit-sampling tests gain orientation (vector) assertions.
- **E5:** colormap tests assert against production `colormap.ts`.
- **E6:** the eight FIX2 G4 source-text guards converted to render or import-based tests, or recorded as
  architecture guards with a reason.
- **A-F2:** the F2 remainder.
  - Adopt `EvidenceBadge`, `FeasibilityBadge`, `StatusBadge` and `NearZeroC3Badge` on catalog, compare and porkchop
    (including the porkchop validation card's STRICT/OBSERVED badges).
  - Make `C3Value`'s `grid` a typed descriptor.
  - Widen the architecture guard beyond `formatC3`.
  - Characterization fixture unchanged.
- **A-copy [C]:**
  - compare's breadth qualifier states the 14-day minimum;
  - "cached grids" vs "recomputes live";
  - the em dash in the coverage notice;
  - STATUS's stale bundle line;
  - the quantified symmetric-return disclosure (DEC-20-7 interim).
- **A-control [P]:** AGENTS §3 (DEC-20-13).

Any strengthened test that FAILS against production is a defect finding: STOP, report and rule. Never weaken the test.

**Front B — K1 math [M][P] (riskiest; audit before deploy)**
- **Entry gate:** GM_EARTH verify-before-lock (OQ-20-8); core constant [P].
- **Engine:** provider injection for the return direction (DEC-20-1); the indexed Earth lookup (DEC-20-4); the
  Earth-span refusal (DEC-20-3) with the SLICE_17 §9 amendment [P].
- **Contract:** the vector output and worker (DEC-20-10).
- **Selection:** the return selection objective and pairing (DEC-20-2); support at departure (DEC-20-5).
- **Entry-speed screen:** DEC-20-8.
- **Oracle:** (a)–(c) committed (DEC-20-9).
- **Audit:** four-lens audit with mutation check.

**Front C — OQ-19-4 filter [M][V] (not cuttable)**
- The supported-windows filter, default on, on compare and porkchop, with the hidden count and the no-supported
  refusal (DEC-20-6).
- The SLICE_18 §9 amendment if Hudson rules it (OQ-20-10).
- Audited with Front B.

**Front D — K1 surface [V][C]**
- A Return-leg panel on the porkchop page beside the sample-return stack. It shows:
  - the paired return for the selected window;
  - the standalone return grid link;
  - every DEC-20-1 field;
  - the "not evaluated" set.
- Built on the shared components. A new `VInfValue` component requires value, unit, epoch, grid and refusal at the
  type level (DEC-19.5-5 pattern).

**Front E — Sample-return totals [M] (cuttable to Slice 21)**
- Switch the totals to the computed paired return after Front B's audit passes (DEC-20-7). Before/after table for
  the S20_01 R3 bodies recorded in §9.

**Front F — QOL and carried ruling (cuttable)**
- K4 (DEC-20-11).
- R14 (DEC-20-12).

Deploy points: (1) Front A; (2) Fronts B+C+D together after the audit; (3) Fronts E–F.

## §7. Acceptance

- `npm run verify` N/N green; MCP test and eval green; CI green on every pushed commit **before** merge. Pages deploys
  from `main` the moment a PR merges, so a merge before CI finishes is a deploy before CI.
- K1 oracle (a)–(c) committed and passing; the four-lens audit's findings closed or ruled.
- Every return result shows its tier and support status, the Earth-span refusals with a count, the entry-speed screen
  labelled with its profile and convention, and the "not evaluated" set.
- Compare and porkchop default to supported windows only, always show the hidden count, and never show an empty
  table.
- A Clome cold read of the porkchop page and compare finds no two shipped strings in contradiction, and no number
  without unit, fidelity, grid/provenance and refusal state.
- Live bundle hashes browser-verified.

## §8. Entry / exit

- **ENTRY:** `674b5b9`, CI green, Slice 19.5 CLOSED (`SLICE_19_5_FOUNDING.md` §9.3).
- **EXIT:** Fronts A–D shipped; E–F shipped or cut per §5 with §9 entries; founding doc LOCKED with the exit record.
- **Size** [Speculative, ±30%]: about 40–48 h.
  - Front A: ~12–14 h.
  - Front B: ~12–16 h, including oracle and audit.
  - Front C: ~3–4 h.
  - Front D: ~5–6 h.
  - Front E: ~3–4 h.
  - Front F: ~5 h.

  At 8 h/week that is 5–6 weeks: about mid-December, or into January if finals cut hours. The order holds; the dates
  move.

## §9. Amendments and corrections
(Append only. Never edit above this line.)

### §9.1 Lock record — 2026-11-04 (Hudson)
- Rulings: Hudson, 2026-11-04, "all as recommended". DEC-20-1, -2, -3, -4, -5, -7, -8, -9, -10, -12 and -13
  LOCKED as drafted in §3. DEC-20-6 was RULED by Hudson on 2026-11-03; its implementation rules are LOCKED as
  drafted. DEC-20-11 (K4) LOCKED as restated.
- OQ-20-10 RULED: a one-click, user-reversible filter that always shows how many windows it hides satisfies
  DEC-18-7's "de-emphasized, never suppressed". Front C appends this as an additive amendment to
  `src/v2/SLICE_18_FOUNDING.md` §9 [P].
- Open questions OQ-20-1 … OQ-20-9 keep the defaults written in §4 until a front needs them ruled.
- Verification record: the S20_03 prompt was run twice in fresh threads.
  - Run 1: `tools/slice20-research/literature/S20_03_verify_return_leg_results.md`.
  - Run 2: `tools/slice20-research/literature/S20_03b_verify_return_leg_results_run2.md`.
  - They disagree on 2 of 16 items:
    - #10 Hayabusa2: run 2 found 11.8 km/s inertial, Prabhu et al. 2022.
    - #14 Keck 2012 Earth-arrival C3: run 1 UNVERIFIABLE, run 2 CONFIRMED from the KISS presentation to ESA
      ESTEC, slide 31.
  - On 2026-11-04 Hudson opened slide 31 directly and confirmed run 2's values: 2008 HU4 1.8 / 1.7 / 1.6 / 1.6 /
    1.6 km²/s² (250 / 400 / 650 / 950 / 1300 t); 1998 KY26 2.0 / 2.0 (30 / 60 t); 2000 SG344 2.0 / 2.1
    (1800 / 3600 t); 0.0 for the direct Sun–Earth L2 stable-manifold cases (2008 HU4 200 t, 2000 SG344 100 t).
    The slide's KY26 trajectory shows Earth-arrival v∞ 1.41 km/s, consistent with C3 2.0.
  - Every case on slide 31 uses solar-electric propulsion with lunar or Sun–Earth L2 capture, so OQ-20-7's default
    stands: context only, not a Lambert test anchor.
  - The values this document's DECs rest on were CONFIRMED by both runs from different primary sources (the CNEOS
    NHATS caveats page and Barbee et al. 2013): NHATS ≤ 12 km/s at 125 km (#11); NHATS minimum stay 8 days (#12);
    NHATS separate outbound and return Lambert legs (#13).
- Rule going forward: an external number a DEC rests on needs two agreeing verification runs, or its primary source
  opened directly by Hudson or Clome.
- OQ-20-11 (new): NHATS's worked 2000 SG344 example (346-day round trip; NEA arrival Δv 0.128 km/s, departure Δv
  0.217 km/s; Barbee et al. 2013, slide 16) as a non-blocking sanity check for K1. It needs that trajectory's epochs
  from slide 16, and NHATS's Δv bookkeeping may differ from Aster's. Default: attempt it in Front B after the oracle
  passes; a mismatch is a finding, not a gate.
- STATUS: this founding document is LOCKED as of 2026-11-04. This line supersedes the DRAFT header, which stays
  unedited under the additive rule.

### §9.2 Front A record — 2026-11-16 (Hudson)
- Deploy point 1 shipped:
  - PR #12 (`s20-a-salvage`, merged at `0d31cda`).
  - PR #15 (`s20-text-sweep`, merged at `f066cc1`): the text sweep, the CK-13 fix and six protected hand-commits (`b00b7c0` physical.ts, `7b495e6` keplerian.ts, `86806f8` INVARIANTS.md, `a3b2b57` SLICE_17, `287add6` SLICE_13, `bbff552` SLICE_18), every one additive.
  - The tail, merged at `ebc045a`: B1 `e4e007f` (compare's live-computation claim narrowed), B3 `46c715b`, B4 `9e86384` (rounded-lines disclosure), B6 `ed5727b` ("Solver status"), B7 `f2fb69a` (transfer family beside every best-C3 value), docs `1bb7f21`. B5 needed no change.
- CK-13 string amended by Hudson's ruling (tail dispatch, 2026-11-14): "below" → "at or below". The screening predicate is `minC3 <= FEASIBLE_C3_MAX` (`tools/build/precompute-lambert-screen.mjs:300`), so the boundary is inclusive. The CK-13 test pins the new word; nothing else in it changed.
- B2 (a refusal state for a bare `/v2/porkchop/`) was reverted at `8b3f7e5`. A bare address is a designed entry point: `resolveRequestedBodyId()` returns `params.get('body') || DEFAULT_BODY_ID` (2020 FK3, `src/v2/app/porkchop/main.ts:261-262`). `tests/v2-dla-render.test.mjs` encodes that design (`location.search = ''`) and caught the change.
- Front-door render question CLOSED. A laptop recon reported both front-door pages failing 70 of 70 loads; Hudson confirmed on 2026-11-16 that both render in an ordinary browser. The recon had no positive control and measured its own harness. Its commit (`59151d9`) stays local and is not evidence.
- Front A's close line is appended after the live bundle-hash check and the Clome re-gate of the tail.

### §9.3 Nova reversals (Slice 20, to 2026-11-16)
Recorded per the DEC-19.5-8 model. Each was caught before it shipped.
1. Tail B2 asserted that a bare `/v2/porkchop/` had no refusal branch, from a grep of the loading string, without reading the resolver. Caught by the executor's verify tripwire; reverted (§9.2).
2. Front A Clome check A3 graded the porkchop readout's six-decimal C3 as an inconsistency. Readout surfaces keep six decimals by Hudson's ruling S-S17-B0A (`src/v2/porkchop/format-c3.ts` header). Withdrawn before any fix.
3. Front A Clome check A2 graded the CK-13 string against a provenance requirement nobody had set. Withdrawn.
4. The front-door recon's rev 2 sent it to a cloud host; cloud egress refuses `*.github.io` (403 to CONNECT, verified 2026-11-15). Withdrawn in rev 3.
5. S20_NHATS_CROSSCHECK's N0 gate quoted 1.5065 as a four-significant-figure pass value; it is an exact tie at four figures. The run reproduced the pilot bit for bit instead (§9.5).

### §9.4 Long-run rulings — Hudson, 2026-11-16, "all as recommended"
Evidence: `tools/slice20-research/longrun/` (LR1–LR4, PR #13) and `tools/slice20-research/longrun2/` (XR0–XR3, PR #14). Leads-grade except where a ruling below validates it.
1. **Validation status.** LR2's primary column (the compare-path best window) is VALIDATED for the 540 bodies XR0 re-derived by an independent code path, bit-identical. The rest of LR2, and its secondary (best sample-return stack) column, remain leads and are not cited by any DEC or UI string until re-derived the same way.
2. **DEC-20-9(c) closure tolerance.** 1e-3 km where the transfer perihelion is at least 0.1 AU (LR1 measured a maximum of 1.055e-4 km there). Below 0.1 AU, closure is checked by energy and angular-momentum consistency between Aster's endpoint states, because the two reference propagators disagree with each other by up to 32.4 km there.
3. **DEC-20-9(b) vallado setting.** numiter 200, rtol 1e-12. Cells where vallado does not converge are excluded and counted.
4. **DEC-20-9 evidence.** LR1 ran in a cloud container on Node 22 and is a lead. Front B re-runs the oracle on its own code, including M = 2, on the laptop or in CI.
5. **M = 1 returns.** DEC-20-2 stands as written: M = 0 and M = 1 on the porkchop page, M = 0 only where compare is involved. Every surface that searches M = 0 only states it, with the measured size: an M = 1 return is cheaper for 51.1% of bodies at compare's window, by a median 0.402 km/s (XR3), so the shown return burn is an upper bound there. DEC-20-14 applies to M = 1 branches first (XR2: every M = 1 branch with a perihelion inside the Sun flies through it).
6. **Truncated pairing windows.** DEC-20-3's refused-cell count is confirmed as the disclosure. LR2 measured 26.5% of paired-return cells refused by the 2040-12-31 fixture end; that is Slice 21 H0 evidence.
7. **No supported return cell.** 7,796 of 9,875 measured L1 bodies have no supported converged return cell at compare's window (LR2). Fronts C and D render DEC-20-6's no-supported-window refusal for the return leg as well. DEC-20-6 stands.
8. **The interim symmetric-return sentence** (live, quoted by Clome 2026-11-14: "An exploratory check of six windows … found this assumption off by 0.08-5.1 km/s …") is superseded by evidence. It is rewritten [C] by mechanism, citing only the validated column, in the Front D/E copy pass; if Front E ships, the sentence retires with the assumption. The data file behind it is regenerated from a run on `main`, never edited by hand.
9. **Mutation survivors (LR3).** Front A-mut: one tests-only dispatch of about 15 tests for the honesty and math gaps listed in `tools/slice20-research/longrun/lr3-mutation/REPORT.md`. Each new test must kill its named mutant. Kills by the compile step count as killed and are reported separately. The 560 `porkchop/porkchop-view.ts` survivors go to Slice 22. A test that fails against production is a finding: STOP and rule.
10. **Build reproducibility (LR4).** 55 of 55 committed `docs/` files rebuild byte-identical from a fresh clone. Recorded: four `vite.config.ts` plugins write into `docs/` regardless of `--outDir`.
11. **Cut order, amended.** K4 shipped in Front A (`74813a0`). If hours run out, cut in this order and record each cut here: R14 → A-mut → A-cache (DEC-20-15) → Front E → Front D polish. Front A, Front B, Front C and the Front D minimal panel stay uncuttable.

### DEC-20-14 — Arcs through the Sun. RULED (Hudson, 2026-11-16).
- A converged branch whose transfer perihelion is below one solar radius (695,700 km) and whose flown arc passes perihelion is physically impossible. It is refused, on both legs.
- **Mechanism:** the grid output carries a per-branch flag, so the kernel's output stays truthful. Selection and display refuse flagged branches: a flagged branch is never selected, never pinned as a valid transfer, and shows its refusal reason. A flag that requires a change under `src/v2/core/` is a [P] edit.
- **Measured impact (XR2):** 0 shown windows are affected (the cache's minC3 cells, its best windows, and every cell of compare's best practical windows). 0.31% of converged outbound screening cells and 1.64% of converged return branches (2.7% at M = 1) are flagged.
- A thermal limit (17% of converged cells have a transfer perihelion below 0.1 AU) is a separate question, with its own DEC in Slice 21 or 22. "Impossible" and "hard" do not share a threshold.
- Lands in Front B, inside its oracle and audit.

### DEC-20-15 — Screening cache: reproducibility, provenance and payload. RULED (Hudson, 2026-11-16).
- **Definition.** "The cache reproduces" means: status, isCoOrbital, the displayed C3 text and the screening colour are identical for every body, and minC3 agrees within 1e-12 relative. Byte identity is not required: ECMAScript leaves `Math.sin`, `cos`, `pow`, `exp`, `log`, `acos` and `asinh` implementation-approximated, and XR1 measured 1,787 bodies that differ only in stored digits (maximum 2.117e-13 relative, zero displayed changes).
- **Regenerate once,** dropping `bestWindows`. No non-test module reads it, and it is most of the payload every front-door page fetches: 32.9 → 7.7 MB raw, 7.87 → 1.01 MB gzipped (measured by Nova, 2026-11-14). The regeneration runs from a clean, committed tree and records commit, host, OS and Node version in the metadata. The schema version is bumped; MCP consumers are checked first (`mcp/src/tools/catalog-shared.ts` returns `minC3Date` and `minC3TofDays`, not `bestWindows`).
- **Provenance test.** A test recomputes the three recorded hashes (precompute script, catalog fixture, Horizons fixture) and compares them with the metadata, without reading git history. The script hash had been stale since 2026-08-05 (XR1).
- **Placement:** Front A-cache, deploy point 1b, before Front B. Cuttable per §9.4 item 11.

### §9.5 NHATS cross-check rulings — Hudson, 2026-11-16, "all as recommended"
Evidence: `tools/slice20-research/nhats/` (PR #17, merged at `c1d88a7`). 200 trajectories, 100 bodies, 252 JPL requests with raw responses and hashes. Leads-grade except as ruled here.
1. **N0 gate.** Bit-identity with the pilot is accepted in place of the four-significant-figure test. It is the stricter criterion, so choosing it after seeing the result cannot overfit.
2. **DEC-20-8 convention, confirmed as a lead.** "≤ 12 km/s at an altitude of 125 km" is documented (cneos.jpl.nasa.gov/nhats/caveats.html). "Inertial" is inferred, not documented: 108 of 108 uncontrolled and 92 of 92 controlled trajectories fit within rounding, the fitted altitude is 124.999–125.000 km, and every atmosphere-relative variant tested fails.
3. **DEC-20-8 display, amended.** K1 always shows the natural inertial entry speed. When it exceeds 12 km/s, K1 shows a flag against the NHATS profile and the control Δv as a separately labelled line. A controlled 12.000 is never shown as the trajectory's speed.
4. **DEC-20-8 control Δv, model B.** Δv_ctrl = v∞ − v∞*, where v∞* = sqrt(12² − 2·μ_E / r_EI), about 4.627 km/s at r_EI = R_E + 125 km. Reason: reducing v∞ on approach is a burn that can be flown. Model A (v_EI − 12) books the burn at the entry interface, where no burn is possible, and is cheaper only through the Oberth effect. Disclosed: model B was identified after the first 77 results and then passed 55 of 55 out of sample.
5. **DEC-20-9, amended to four legs:**
   - (a) poliastro `izzo.lambert` on identical inputs, vectors, M = 0, 1 and 2;
   - (b) `vallado.lambert` at M = 0 with the §9.4 item 3 setting;
   - (c) endpoint closure with the §9.4 item 2 tolerances;
   - (d) NHATS end-to-end at M = 0, with model-B control Δv, NHATS calendar dates read as 0h TDB, and Earth-return v∞ derived by inverting DEC-20-8 for uncontrolled trajectories only; agreement at NHATS's printed precision.
   NHATS checks implementation and pipeline, not physics: both sides are two-body patched conics. No run has tested M = 2; Front B's oracle must.
6. **The Bennu C3 outlier** (101955 min_dur, launch 2042-06-26, 1.8 times the rounding half-unit, 1 value of 2,000) is logged and not chased. It is outside the 2026–2040 window.
7. **Support (DEC-20-5, DEC-20-6): no new refusal in Slice 20.** Evidence:
   - error grows with time since the orbit epoch (median 8–60 thousand km within a year; millions of km after 5.5 years);
   - L2 bodies have no support boundary in production (`supportBoundaryFor` returns undefined for every tier but L1) and reach 0.81 km/s of total-Δv error within 2026–2040;
   - 2026 AM4 is 8.1 million km off 39 days inside its L1 support date.
   An epoch-age cutoff at that growth rate would refuse most of the 2026–2040 grid for every body, outbound included. The fix is better positions, not more refusals.
8. **Epoch-age line (Front D, both legs).** The pinned-cell panel states a derived fact on outbound and return cells: the asteroid position's propagation time from its orbit epoch, in years, with the epoch date. No external number. Exact copy is approved [C] in the Front D dispatch.
9. **The measured error-versus-age band** is not shown on the site until a second, independent derivation agrees; it then gets its own DEC.
10. **Slice 21 charter.**
    - "Position fidelity beyond the orbit epoch" is a headline item, with this run as its evidence.
    - The Earth extension past 2040 is cheap: N5's 366-day overlap is bit-identical to Horizons.
    - The next catalog regeneration records per-body orbit-solution IDs.
11. **OQ-20-11** is partly answered: N2 compared NHATS's best 2000 SG344 trajectories within rounding. The slide-16 trajectory check stays optional.

### §9.6 Process record — 2026-11-16
- One actor per working tree. A terminal merge ran in the canonical tree while an agent was verifying there; the agent saw the tree switch to `main` mid-run. No harm: `ebc045a` is identical to a clean merge of `35e63d6` and `1bb7f21`. Going forward, while an agent works in the canonical tree, no other git command runs there; otherwise the agent works in its own worktree.

### §9.7 Front A close and A-cache record — 2026-11-20
1. **Front A CLOSED.** Everything in §9.2 is on `main`, and so is the work after it:
   - PR #19 (`s20-a-cache`, merged at `cf94d88`, 2026-11-19): the MCP compile fix (`ca27cb7` fix(mcp), `6ace68c` CI job "mcp (build, test, eval)", merged into the branch at `87631ae`); DEC-20-15's schemaVersion 2 screening cache (`0d00b54`..`89eea53`); the run evidence (`b3b0f0e`, `tools/slice20-research/a-cache/`); the AGENTS.md §2 session-start amendment (`69eea08`); the STATUS refresh (`75867c0`).
   - Clome re-gate of the tail, 7/7 PASS, 2026-11-16 (§9.2).
   - Live check after the merge, 2026-11-19, hard reload, Clome plus Hudson's Network tab: entry bundles `solarSystemV2-DMCzKWJd.js`, `compareV2-Cdr7Y37T.js`, `porkchopV2-CU68GLWB.js`, `aboutV2-DL_Fcx9X.js`; shared chunk `store-DURZ-68X.js` replaced `store-vFFofB6N.js`; no non-200 request under `/assets/`; no console errors on the four pages. `lambert-screen-cache.json`: 8,081,586 bytes decoded, 1,167,454 bytes on the wire, schemaVersion 2, no `bestWindows`. Bennu reads "C3 0.510 km²/s²" (three significant figures through `formatC3`).
   - Not recorded here: the CI full-tests count for PR #19. MISSING: it was not read from the Actions log.
2. **Bare `/v2/porkchop/`, tour (checked 2026-11-20).** The first-visit tour starts only while `aster.fk3TourSeen` is unset (`src/v2/app/porkchop/main.ts`, `hasSeenFk3Tour`; the key is set only by `dismissTour`). A local serve of the merged `docs/` in fresh Chromium profiles started the tour in 2.4 s to 9.7 s in four cases (desktop twice, 400×757, CPU 6× slower), with no console errors. In Hudson's Chrome it did not start while the flag was `'1'`, and started after the flag was removed. Designed behaviour; no defect.
3. **DEC-20-15 evidence.** Acceptance diff PASS: maximum relative difference in `minC3` 2.1173720492082248e-13 across the cache. The cache is 8,081,586 bytes decoded; the entry in `tools/slice20-research/a-cache/REPORT.md` has the size table.
4. **Nova reversals, continued from §9.3** (each caught before it shipped, or recorded when found):
   6. §9.5 item 5 says "No run has tested M = 2". Slice 11 met its M ∈ {0,1,2} target and compared M ∈ {1,2} across full 50×50 grids on Apophis, Bennu and Itokawa (`src/v2/SLICE_11_FOUNDING.md:223`, commit `3560ff8`). The true statement: no return-leg or vector run has tested M = 2; Front B's oracle must. Item 5 stands as written; this item corrects it.
   7. The A-cache dispatch's Step 12 was written without checking that `mcp/` compiled on `main`. It had not since `4535df9` (2026-10-14, PR #2): TS2322 at `mcp/src/tools/compute-shared.ts:262`, `number | Readonly<{kind:"non-finite-c3"}>` returned as `number`. CI never built `mcp/`. Fixed by `ca27cb7` (the non-finite C3 now throws instead of returning a curve-domain null) and `6ace68c` (a fifth CI job, with `mcp/scripts/assert-eval-pass.mjs --fresh`).
   8. `STATUS.md` was not refreshed across nine merges (`0d31cda`..`da27cb5`) and a Codex session-start gate stopped on it (2026-11-18). Fixed by `75867c0` and by the match rule in item 5 below.
   9. Two dispatch wordings stopped the A-cache chain run on a rule that did not mean what it said: "never touch the canonical tree" was applied to a process listing, and ".dispatch-scope = the exact paths" was read as a create of an existing tracked file. Both were Nova's wording; neither was an agent error. The rules now say: the canonical tree is never a working directory, and `.dispatch-scope` is rewritten, not created.
   10. The Clome end-gate prompt's console line dropped `/assets/` before filtering, and expected a table on a bare `/v2/compare/` (whose designed state is the instruction text). No effect on the result.
   11. Nova stated on 2026-11-19 and 2026-11-20 that the front-door render question was open. §9.2 closed it on 2026-11-16. Corrected here.
5. **Session-start match rule, correction.** A STATUS commit cannot name its own SHA. Clause (iii) of the match rule in `STATUS.md` now reads: `origin/main` is a merge commit whose first parent is the first-row SHA and whose second parent is a commit on the branch in the second row whose subject begins `docs(status):`.
6. **Open, not a gate.** The laptop's root test count moved from 369 (baseline, 2026-11-18) to 370 after the MCP fix, with no root test changed; mechanism unknown. The Stage 0.8 per-file diagnostic was skipped at its 20-minute ceiling (27 min 26 s, sequential, Windows). Linux, Node 24: 111 files, 370 tests (`tools/slice20-research/a-cache/linux-node24-counts.tsv`). Read the CI count for PR #19 and compare.
7. **Slice 21 backlog, added (logged, not fixed):**
   - `console.debug` at `src/v2/core/lambert/lambert-multi-rev.ts:320` emits about 8,350 lines per bare porkchop load (one per M=1 no-solution cell; measured 2026-11-20, 12 s, fresh Chromium). Protected path, math layer: audit-before-deploy applies although the change is a log line.
   - Payload on a front-door load: `nea-catalog-slice9-*.json` is 8,979 kB transferred on `/v2/porkchop/` (12.4 MB transferred in all, 13 requests), and appears twice in solar-system's resource list. The lambert cache is not loaded on the porkchop page at all.
   - `/favicon.ico` returns 404 at the domain root on solar-system, porkchop and about.
   - Missing space between "About this tool →" and "Replay tour →" in the porkchop sidebar, and between the class tag and the C3 text on catalog rows ("APOC3"); a shared cause is unproven.
   - The tour start waits silently when the cost-card state never arrives (`src/v2/app/porkchop/main.ts`, the effect that follows `tourPendingStart`); no error is logged on that path.
   - `@types/node` resolves for `mcp/` from the root install; add it to `mcp/package.json`.
   - The per-file test counter (`tools/slice20-research/a-cache/`, Stage 0.8) is too slow on Windows to be a gate; a parallel runner or a runner-side per-file log is the fix.
