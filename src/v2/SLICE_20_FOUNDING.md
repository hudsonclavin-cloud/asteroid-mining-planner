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
