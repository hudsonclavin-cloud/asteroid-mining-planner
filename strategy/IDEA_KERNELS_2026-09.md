# IDEA KERNELS 2026-09 — What Survives the External-AI Brainstorm

Status: STRATEGY DOCUMENT · LEADS-GRADE. Nothing here locks a DEC. Every external number or citation is a **LEAD**
until verified per verify-before-lock. Additive-only by convention: amendments and state changes append in §6.
Provenance: triage of the 25 "grand vision" items plus the main technical threads from the 2026-09-11 external-AI
session (audit in `strategy/INTAKE_2026-09-11_EXTERNAL_AI_SESSION.md`). Triaged by Nova on 2026-09-11.
Family placement follows `ASTER_FAMILY_MASTER_PLAN.md` §3. Maturity states follow §7.

## §0. Method

An idea survives only as a **kernel**: an engineering question Aster can answer with an EvidenceEnvelope, meaning
values with provenance, a confidence class, and a structured refusal when data is absent. If the only way to answer
an idea is to invent numbers, it is killed. Killing is free and logged. The house line applies: *if the system cannot
explain why it ranked, screened, or recommended something, it does not present the output as strong.*

## §1. Triage of all 25

| # | Original | Verdict | Kernel (the real question) | Lens · State |
|---|---|---|---|---|
| 1 | Shatter-cones demolition sim | KILL | None. A kinetic impact disperses a rubble pile; it does not produce a steerable "debris river." Deliberately fragmenting an NEA is a planetary-defense hazard. | — |
| 2 | Planetary Dismantling Ledger | KILL | None. This is the "fake pro-forma machine" named in master plan §8. There are no inputs that could be sourced. | — |
| 3 | Mass-driver cargo bullets | **KERNEL K1** | Arbitrary-origin / **return-leg porkchop** (NEA → Earth): arrival v∞ and declination at Earth. Mining is a round trip, and Aster only plans the outbound leg today. | L1 Transit · CONCEPT |
| 4 | Slingshot pinball wizard | **KERNEL K6** | Multiple-gravity-assist (MGA) sequence search (E-V-E-M-…). The ESA GTOP benchmark set can serve as a validation oracle. [LEAD] | L1 Transit · CONCEPT (2027) |
| 5 | Megawatt laser-sail beam | KILL | None at the needed scale. Diffraction makes beamed power over AU distances impractical at any buildable aperture. [Likely] | — |
| 6 | Einstein toggle | **KERNEL K4** | **One-way light-time / comms-latency chip** per body (distance ÷ c, derived). Drop the time dilation, which is negligible for display. | L1/L12 · CONCEPT (QOL-sized) |
| 7 | Orbital sonifier | BACKLOG | Outreach toy. No decision question. | L12 Atlas · BACKLOG |
| 8 | VR god-mode cockpit | BACKLOG | WebXR view of the existing scene. No decision question; high cost. | L12 Atlas · BACKLOG |
| 9 | GA "ghost ship" breeding | **KERNEL → K5** | Global-search stage of low-thrust optimization. Honesty rule: a GA returns "best found," never "optimal," and must be labeled that way. | folded into K5 |
| 10 | Gravitational anomaly detector | **KERNEL K8** | **Measured bulk density where it exists** (binary-system or spacecraft mass determinations), each with its confidence class. Small N. The rest of the catalog gets a structured refusal. | L2 Prospect · CONCEPT |
| 11 | Yarkovsky paint-sail | **KERNEL K7** | **Non-gravitational-parameter disclosure**: whether SBDB carries A1/A2 for the body [LEAD: field availability], surfaced in provenance. "Steering by paint" itself is thesis. | L2 Prospect · CONCEPT |
| 12 | Von Neumann swarm tracker | KILL | None. No sourced inputs. | — |
| 13 | EDT harvester at Psyche | KILL | None. It needs an ambient field and plasma that a metallic asteroid does not reliably provide. | — |
| 14 | Pony-express relay | **KERNEL K9** | **Solar-conjunction flag** on a mission timeline (Sun–Earth–probe angle below a stated threshold). The relay routing part is killed. | L1 / L10 Ops · CONCEPT |
| 15 | CME surfing | KILL | None. CMEs are unpredictable and destructive; this is not a planning input. | — |
| 16 | Cislunar whiplash trampoline | **KERNEL K2** | The **Aster → Skyhook interface**: is an inbound payload's Earth-arrival v∞ inside the tether's catch envelope? K1 is the prerequisite. Tether constants come ONLY from Skyhook `params/rev_a.json`, never from memory. | L9 Momentum · CONCEPT (2027 lead) |
| 17 | Bag-and-boil distiller | **KERNEL K10** | External reference only. This concept already exists (TransAstra "optical mining" [LEAD]). Aster's kernel is a volatile-candidate flag (C-complex where taxonomy is known) feeding Ledger/Depot. | L2 → L4/L8 · reference |
| 18 | Spun-shell habitat mapper | **KERNEL K3** | **Spin-barrier structure hint.** A body larger than ~150–300 m rotating faster than the ~2.2 h barrier cannot be a cohesionless rubble pile [LEAD: Pravec & Harris 2000]. This directly answers "is it solid rock or packed gravel," partially, and with disclosure. | L2 Prospect · CONCEPT |
| 19 | Kessler deflection shield | KILL | None. Deliberate debris generation. Traffic (L6) would flag it as a hazard, not use it as a tool. | — |
| 20 | Quantum gravitational choreographer | **KERNEL K11** (rewritten) | Drop the "quantum/gravitational-wave" framing, which is not physics that affects navigation. The real thing is **low-energy invariant-manifold transfers** (the Interplanetary Transport Network, CR3BP). | L9/L1 · CONCEPT (research-grade) |
| 21 | Dark-matter lens overlay | KILL | None. Solar-system dark-matter density has no navigational effect [Likely]. Shipping this would damage the honesty brand. | — |
| 22 | Hive-mind drone economy | KILL | None. | — |
| 23 | Spectral archaeology scanner | **KERNEL K12** | **NEO source-region probabilities** (debiased NEO model, e.g. Granvik et al. 2018 [LEAD]) plus taxonomy provenance. "Rewind to the protoplanet" is killed. | L2 Prospect · CONCEPT |
| 24 | Magnetic braking sail | THESIS | Magsails are a real research concept, but there is no Aster decision question today. | essay only |
| 25 | Planetary ring synthesizer | KILL | None. | — |

Tally: 12 kernels · 2 backlog · 1 thesis · 10 killed.

## §2. Kernels from the main technical threads (not in the 25)

| ID | Kernel | Source thread | Lens · State | Gate |
|---|---|---|---|---|
| H0 | **Horizon extension past 2040** | "It breaks down after 2040" | L1 + S2 · candidate | Front B NEA drift result + `RECON-HORIZON-2060` |
| C0 | **Chebyshev fixture-format experiment**: accuracy per byte vs daily Hermite, on real Horizons vectors, including velocity | Chebyshev compression | S2 · candidate research | Only if H0's recon shows fixture size or accuracy actually binds |
| K5 | **Low-thrust (ion) screening** | Ion-engine model | L1 + S2 · CONCEPT | Pre-research: method choice (shape-based vs Sims–Flanagan vs indirect [LEADS]), 3D from day one, dry-mass floor, oracle choice (pykep / GMAT [LEADS; license check]) |
| K13 | **Retrieval-ΔV screen**: which catalog bodies could be moved to a usable orbit (e.g., Sun–Earth L2 / cislunar) for less than X m/s ("easily retrievable objects" [LEAD: García Yárnoz, Sanchez & McInnes 2013]) | Life goal: "redirect the orbit" | L1/L2 · CONCEPT | Pre-research; this is the honest form of the redirect thesis (see §4) |

## §3. Near-term shortlist (value to the mining thesis × brand fit ÷ cost)

1. **H0 Horizon extension.** This is Hudson's top stated ask. Cheap on planets, expensive on cache regeneration, and
   gated on honesty (NEA drift). Run the recon now and decide after Front B lands. [Likely the right Slice 19
   candidate if Front B's drift curve supports it]
2. **K1 Return-leg porkchop.** Highest thesis value per unit cost: Lambert, the grid, and `vInfArr` all exist already;
   the change is swapping endpoints (body → Earth). Launch-vehicle curves don't apply, so any delivered-mass cell
   must be a **structured refusal**, not a number. It is also the prerequisite to K2 (Skyhook), so building it links
   Hudson's two flagship projects through one well-defined interface: Earth-arrival v∞. [Likely]
3. **K3 Spin-barrier structure hint.** On-brand: it turns "we don't know if it's rubble" into disclosed partial
   knowledge. It depends on rotation-period coverage in the catalog source [Speculative: a small fraction of 41,906;
   the recon or pre-research measures it].
4. **K4 Light-time chip.** Tiny. It can ride the QOL slot of any UI slice.
5. **K5 Low-thrust.** The biggest item. It needs its own pre-research campaign and slice lifecycle, and it is math
   layer, so the multi-agent audit applies. The visual language Hudson wants (color-coded thrust/coast arcs,
   toggleable thrust vectors) belongs to its Mission View surface.

Everything else holds at CONCEPT or BACKLOG. That costs nothing (master plan §7).

## §4. Physics note: move the product, not the body

The session endorsed moving whole large bodies (16 Psyche → Mercury orbit). Order of magnitude, measured 2026-09-11:

- Coplanar Hohmann from 2.92 au to 0.387 au ≈ 9.0 + 15.7 = **24.7 km/s** (computed; ignores inclination).
- With Psyche's mass ~2–3 × 10¹⁹ kg [LEAD], ½·m·Δv² ≈ **7–8 × 10²⁷ J**, which is about **10⁷ years** of present
  global primary energy use (~620 EJ/yr [LEAD]). This is an order-of-magnitude floor, not a propulsion design.
- Studied redirect missions have been ~500 t class (the Keck Institute 2012 asteroid-retrieval study [LEAD]), about
  14 orders of magnitude smaller.

Conclusion [Likely]: whole-body redirection is a small-NEA activity (K13). For large bodies the unit of transport is
refined product, which is K1 (return legs), K2 (tether catch), and eventually Ledger economics. Aster's value is in
telling those cases apart honestly.

## §5. Rules that carry forward to any kernel promoted to CHARTERED

- Math-layer code goes through the multi-agent audit before deploy. `src/v2/core/` is protected surface and ships
  inside `aster-mission-mcp`.
- External libraries (pykep, GMAT, poliastro) are validation oracles only; no porting.
- 3D, heliocentric J2000 equatorial ICRF, and frame established by measurement, not label (DEC-12-2, INV-021).
- Constants are imported from the core, never re-typed.
- Every surfaced number traces to a repo constant, a committed measurement, or a verified primary source
  (INV-025/026).
- A kernel that cannot refuse does not ship.

## §6. Appended amendments

(Append below. Never edit above.)
