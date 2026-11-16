# K2 Momentum Bank — research prototype

**Status:** research prototype under `tools/`. It is NOT a slice, NOT in `src/v2/`, NOT deployed in `docs/`.
Kernel K2 is still CONCEPT in `strategy/IDEA_KERNELS_2026-09.md`, and its prerequisite K1 (return-leg porkchop)
does not exist. Nothing here authorizes implementation. Promotion follows slice-discipline: pre-research →
founding doc → multi-agent audit for any math that moves into `src/v2/core/`.

## What it answers

This is the Aster → Skyhook interface named in K2. Aster supplies one number per body, the **Earth-arrival v∞**.
Skyhook supplies the **Rev A tether**. The sim answers three questions:

1. **Payload side.** What Δv does a returning payload need to be caught at the upper tip, and how does that
   compare with capturing by rocket alone, or with entering directly?
2. **Tether side.** How much orbital energy does each inbound kg put back, against what each outbound throw
   withdraws? This is the momentum-bank thesis.
3. **Facility side.** How far does one unbalanced 5 t event move the facility's orbit?

## Run it

- Open `index.html` in a browser. It works from `file://`, with no server and no build step.
- `node tools/k2-momentum-research/verify.mjs --skyhook <path-to-skyhook>` runs the oracle gate. It must print `ALL PASS`.
- `node tools/k2-momentum-research/build-snapshots.mjs --skyhook <path-to-skyhook>` regenerates both snapshots
  after `rev_a.json` or the screening cache changes. Re-run `verify.mjs` afterwards.

## Files

| File | Role |
|---|---|
| `k2-model.js` | Pure model: machine derivation, catch ledger, entry, energy bank, facility perturbation, RK4 for the plot |
| `rev-a-snapshot.js` | GENERATED. Skyhook `params/rev_a.json`, copied verbatim, with its sha256 and Skyhook commit |
| `vinf-proxy.js` | GENERATED. Per-body minimum OUTBOUND Earth-departure v∞ from `docs/lambert-screen-cache.json` |
| `verify.mjs` | Oracle gate (see below) |
| `build-snapshots.mjs` | Regenerates the two snapshots |
| `index.html` | The simulation |
| `PERPLEXITY_PROMPT.md` | Pre-research prompt for the open questions below |
| `literature/` | Perplexity result (PDF), triage (`K2_LEARNINGS.md`), verification prompt (`VERIFY_PROMPT.md`) |

## Verification (2026-10-06, Skyhook @ `34935cb`, rev_a sha256 `d0828c1e…`)

- **A.** Reproduces the derived values Rev A records: v_upper 10.0563 (10.06), C3 −8.0611 (−8.06), apogee
  85,222.33 km (85,222), tip 1.9916 g (1.99), spin period 13.404 min (13.4), lower tip ground-relative 4.591 (4.59),
  cislunar 2.8 km/s C3 and apogee, and Phase 3 3.5 km/s C3. All within 0.5% (1% for cislunar C3). The tolerance
  covers Rev A's own rounding only.
- **Cross-check.** Skyhook's own `physics/skyhook_physics.py` gives the same v_upper, C3 and apogee to every printed digit.
- **B.** Closed-form spot checks of catch Δv, rocket-only Δv, the drop-mode bank-ratio symmetry, entry-interface speed
  and RK4 energy drift (9e-11 over 1200 s). The closed forms restate the model's own formulas, so they guard against
  regressions; they are not an independent oracle. The independent oracle is section A plus the Python cross-check.
- **C.** Snapshot hash matches the live `rev_a.json`.
- **D.** Second oracle: Perplexity's independent recomputation (matching burns at v∞ 1–5, parabolic burn, escape speed,
  carry-and-drop energy) agrees to its published rounding. It checks arithmetic only, from the same inputs.
- **Caught by the gate.** A first oracle draft used the IAU μ (398,600.4418). Rev A pins 3.986e14 m³/s² to four
  significant figures. That gives a ~1e-6 relative difference. The oracle now uses Rev A's μ.

## Findings so far (leads, not locks)

1. **[Likely] The catch saves the payload a lot of Δv for a captured-to-orbit end state.** At v∞ = 1 / 3 / 5 km/s,
   the matching burn is 0.44 / 0.82 / 1.53 km/s. Rocket-only capture into the same 610 km circular orbit costs
   3.18 / 3.54 / 4.24 km/s. Aerocapture is the real competitor and is not modeled.
2. **[Certain] Drop mode is exactly momentum-neutral against an outbound throw.** One inbound kg dropped from the lower
   tip repays one outbound kg thrown (43.03 MJ/kg each at 2.5 km/s). Hold mode repays 0.57 of that.
3. **[Likely, first-order] One unbalanced 5 t throw from Rev A's circular orbit is dangerous.** CoM perigee drops from
   610 to ~440 km on the opposite side, and the lower tip reaches ~119 km, inside the atmosphere. *Corrected
   2026-10-06 after the Perplexity pass:* this is not a missing-mass problem. Rev A fiber alone is ~122× payload,
   and published MXER designs ran ~10×. MXER flew elliptical orbits and caught near perigee, where recoil lowers the
   apogee instead (our derivation, pending verification). Orbit shape is a Rev B candidate question. See
   `literature/K2_LEARNINGS.md`.
4. **[Likely] Drop-mode entry is slow but steep.** Entry speed is 5.36 km/s against 11.1–12.2 km/s for direct entry,
   but the entry angle is fixed by geometry at ~14°, which gives a ballistic peak near 19 g.
5. **[Likely] Plane alignment can cost as much as the catch itself.** An equatorial facility with a 15° asymptote
   declination adds 0.78 km/s at v∞ = 3. Facility inclination is not in Rev A.

## Discrepancies found in the source repos (not fixed here)

- **Skyhook R⊕:** `physics/skyhook_physics.py` uses 6371.0 km (mean radius). `rev_a.json` `com_radius_km: 6988`
  implies 6378 km. The rotovator-rev-a skill quotes 6378.137 km and a ~7,308 km release radius. The derived values
  (7301 km, C3 −8.06, apogee 85,222) follow the 6371 convention. This model follows the physics module.
- **The v∞ proxy is outbound only.** Time-reversing an outbound Lambert arc does NOT give the return-leg Earth-arrival
  v∞, because the bodies' own velocities do not reverse. The histogram gives population scale only, until K1 exists.

## Open questions (feed K2 pre-research)

- OQ-a: The Earth-arrival v∞ and declination distribution for return legs from Aster's L0/L1 bodies. This needs K1.
- OQ-b: A defensible catch relative-velocity tolerance and timing window (MXER/HASTOL literature).
- OQ-c: Facility total mass (station + ballast + climber) in MXER-class studies, and the payload-to-facility ratio they assumed.
- OQ-d: Aerocapture comparison: aeroshell mass fraction vs propellant fraction at these v∞.
- OQ-e: Steep tether-drop entry: whether the ~14° entry angle can be shallowed by off-nadir release.

## Role note

AGENTS.md §3 says Claude Code does not write TypeScript implementation code. This prototype is plain JS research
tooling under `tools/`. It touches no `src/`, no `docs/` and no protected path, and it was written at Hudson's direct
request. Before any of it moves into `src/v2/`, Codex owns that work under a founding doc, and the math goes through
`multi-agent-audit`.
