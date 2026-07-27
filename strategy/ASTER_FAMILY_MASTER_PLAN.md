# Aster Family Master Plan — The Conglomerate Blueprint

**Status:** STRATEGY DOCUMENT (leads-grade; nothing here locks a DEC). Drafted 2026-07-06 from the complements analysis, corrected against Aster's actual state, extended to full decision-chain coverage.
**Supersedes:** the product list in the `aster-complements-strategy` skill (its corrections and warnings remain operative).
**Repo home when committed:** `strategy/` at repo root. NEVER `docs/` — that directory deploys.

---

## §1. The conglomerate thesis

Space operations run on decisions made under uncertainty with fragmented evidence. Aster is the **evidence-first decision layer** for asteroid and cislunar operations: a family of products ("Lenses"), each answering exactly one operational question, all sharing one substrate — one evidence language, one data spine, one agent interface, one validation discipline.

**How a solo founder permeates a domain:** not by building every product, but by owning the layer every product needs and holding the rest as chartered optionality. The conglomerate is the substrate plus a portfolio of lenses in defined maturity states. A lens in CONCEPT state is a real asset — it's a named claim on the territory with a charter, entry gate, and kill criteria — and it costs nothing to hold.

Closing principle (kept from the source analysis, now the house line): *if the system cannot explain why it ranked, screened, or recommended something, it does not present the output as strong.*

## §2. The substrate (what the conglomerate actually owns)

- **S1 — Evidence Core.** The machine contract (EvidenceEnvelope v1, Slice 15 DEC-15-4: Quantity leaves, weakest-link confidence, structured refusal) + the human contract (badge/card/disclosure design system already seeded in Aster's UI). Same semantics for confidence, freshness, observed-vs-derived-vs-assumed everywhere. **Every lens is a renderer of envelopes.** No lens re-derives evidence semantics.
- **S2 — Data Spine.** The 41,906-body NEA catalog (three-gate ingestion, Horizons re-anchor), ephemeris/propagation core, and per-domain adapters added lens-by-lens. External libraries remain validation oracles only — the anti-porting principle is a conglomerate-level invariant.
- **S3 — Agent Interface.** aster-mcp (Slice 15). One MCP surface; future lens tools join under the same envelope contract (per-lens server vs one-server-with-namespaces is an open design question, decided when lens #2 needs tools — not before).
- **S4 — Validation identity.** Multi-agent audits, dual-oracle validation, STRICT/OBSERVED oracle classes, golden-numbers CI, pre-registered evals. This process IS the brand. Every lens inherits it or doesn't ship.

The substrate is why lens N+1 is cheaper than lens N. That compounding is the conglomerate's economic engine — not any single product's revenue.

## §3. The full family map (decision-chain order)

Maturity states: **SHIPPED · BUILDING · FOUNDED (doc locked) · CHARTERED (brief exists) · CONCEPT · BACKLOG**. Every non-shipped lens has an entry gate and kill criteria in `ASTER_FAMILY_CHARTERS.md`.

| # | Lens | Decision question | State | Substrate reuse | New-domain import (priced honestly) |
|---|---|---|---|---|---|
| P0 | **aster-mcp** | Can an agent use Aster honestly? | FOUNDED (Slice 15) | all of it | MCP transport only |
| L1 | **Aster Transit** | When and how do we go? | **SHIPPED** — this is Aster today (porkchop, Lambert, DLA, cost card) | — | — |
| L2 | **Aster Prospect** | What body should we care about? | SHIPPED-IN-CORE (catalog + screening + honesty + Slice-13 ranking); productization CHARTERED | ~80% | spectral/taxonomy/albedo provenance enrichment (SBDB, SMASS/Bus-DeMeo, NEOWISE — leads, verify per charter) |
| L3 | **Aster Dossier** (née Claims) | Can we hand this analysis to a skeptic? | CHARTERED — **priority upgraded** (see §5 insight) | ~90% — envelopes → evidence packet is nearly free | document generation only |
| L4 | **Aster Ledger** | Does the business case close? | CHARTERED (gap in source doc — added) | Slice-13 cost model, ΔV-as-price framing | campaign economics, price-regime sensitivity; must inherit honest-numbers rules or it becomes a fake pro-forma machine |
| L5 | **Aster Survey** | What observation most improves confidence? | CONCEPT (gap in source doc — added; closes the evidence loop: Prospect's `what_would_help` → an observing plan) | ephemeris/observability math largely exists | facility capability data, observation-type value model |
| L6 | **Aster Traffic** | What conjunction risk are we carrying? | CONCEPT | envelope, propagation | covariance/CDM semantics (TraCSS/CCSDS refs) — HIGH import cost, real adjacent market |
| L7 | **Aster Risk** | What is our exposure posture? | CONCEPT | envelope, Traffic outputs | hazard modeling for insurers — HIGH; carries the "fake actuarial engine" trap named by the source doc itself |
| L8 | **Aster Depot** | Does this depot pencil? | CONCEPT (2027 lead) | ΔV ledger, Ledger econ | cryo/boiloff physics, demand-cadence modeling — HIGH |
| L9 | **Aster Momentum** | Does momentum-exchange infrastructure close? | CONCEPT (2027 lead; connects the rotovator program — Rev A constants locked in its own skill, never quoted from memory) | propagation, Ledger, ΔV-as-price | tether dynamics — HIGH, but it is the house's own infrastructure thesis made into a planning tool |
| L10 | **Aster Ops** | Is the system ready and fresh? | BACKLOG (becomes real only when the family has operators as users) | envelope freshness fields | — |
| L11 | **Aster Flow** | Where are the logistics bottlenecks? | BACKLOG (merge candidate with Depot — note and revisit) | Depot models | — |
| L12 | **Aster Atlas** | What does the ecosystem look like? | BACKLOG (Aster's 3D view + About page already satisfy ~half of this) | 3D renderer | — |

Coverage check: choose (L2, L5) → move (L1, L9) → risk (L6, L7) → build (L8) → operate (L10, L11) → explain & monetize (L3, L4, L12) → agents (P0). That is the full decision chain. "Permeate all of the space" = this map, held in maturity states — not twelve simultaneous builds.

## §4. Market honesty (space-venture-econ discipline, per lens)

Every lens declares its market class and whether a buyer exists **today**:

| Lens | Market class (F2) | Incumbent reference points (leads) | Buyer today? | Credibility value |
|---|---|---|---|---|
| Transit/Prospect | credibility artifact → prospector tooling | JPL small-body tools, ADAM | No [Certain, ~] | **HIGH** — the flagship |
| aster-mcp + study | credibility artifact → agent-tooling audience | few/none in domain (Query B verifies) | No, but the *audience* is real now | **HIGH** (Fellows-shaped) |
| Dossier | diligence/underwriting support | none direct | [Speculative] near-adjacent | MED-HIGH |
| Ledger | investor/BD analysis | bespoke spreadsheets | [Speculative] | MED |
| Traffic | SSA/STM services | TraCSS (gov), LeoLabs, COMSPOC, Slingshot | **YES — the nearest real market** | MED (off-asteroid-brand) |
| Risk | space insurance analytics | LeoLabs insurer products | **YES** (small, real) | MED |
| Survey | survey programs, academia | telescope TAC processes | grant-shaped [Speculative] | MED-HIGH (on-brand) |
| Depot/Momentum/Ops/Flow/Atlas | strategic/thesis | NASA studies | No | thesis-support |

**The inversion to hold in mind:** the asteroid-branded flagship has the least commercial market and the most credibility value; the LEO-adjacent lenses (Traffic, Risk) have real buyers but stray from the brand. A conglomerate with a shared substrate can hold both — that is precisely what the substrate is *for*. No TAM numbers appear here by design: market sizing is a per-charter pre-research query with the recursive directive, verified before it ever enters a founding doc.

## §5. Three strategic catches (what the source analysis missed)

1. **Dossier is nearly free once envelopes exist.** The source doc ranked Claims last. Wrong pricing: with EvidenceEnvelope shipped, "export a defensible evidence packet of this analysis — every number with provenance, every assumption disclosed, every refusal shown" is a document renderer over existing structure. It monetizes the honesty layer directly and serves diligence, applications, and underwriting. Promoted to Wave 1.
2. **The economics lens was missing.** Ledger formalizes the house economic discipline (market declaration, launch-price sensitivity, kill criteria surfaced as UI) on top of the Slice-13 cost model. Second-cheapest real product after Dossier.
3. **The evidence loop was open.** Prospect says "confidence low; here's what would help" — and then nothing catches that output. Survey closes the loop: it turns `what_would_help` into observation campaign plans. No competitor thinks in this loop because no competitor has the refusal layer. This is the most *defensible* concept in the family.

## §6. Build order — waves, all gated

- **Wave 0 (now → Sep 2026, unchanged from the portfolio projection):** Slice 14 close → Slice 15 aster-mcp → Slice 16 honesty study. The substrate and the credibility spine. **Nothing in this master plan reorders Wave 0.**
- **Wave 1 (post-envelope, ≥80% reuse each, pick by audience signal):** Prospect productization (naming + provenance skin on the existing site), Dossier v0 (envelope→packet export), Ledger v0 (Slice-13 extension). Each is a normal slice with the full lifecycle. Realistic: 1–2 of the three by end of 2026.
- **Wave 2 (new-domain, entry gate = a named user, data partner, or application deadline that wants it):** Survey (cheaper, on-brand) vs Traffic (real buyers, expensive import) — chosen by which gate fires first. Risk only behind an actual insurer conversation.
- **Wave 3 (2027, thesis-driven):** Depot, Momentum — each its own pre-research campaign.
- **Backlog held, not built:** Ops, Flow, Atlas.

P(3+ credible family products shipped by mid-2027 | gated waves) ≈ 0.5–0.6. P(same | attempting the map in parallel) ≈ 0.05. The gates are the conglomerate.

## §7. Conglomerate mechanics

- **Chartering process:** CONCEPT → CHARTERED (brief in `ASTER_FAMILY_CHARTERS.md`, template §0) → FOUNDED (its own founding doc, full lifecycle, usually its own Claude Project) → BUILDING → SHIPPED → SUNSET. Promotion CONCEPT→CHARTERED costs a page; CHARTERED→FOUNDED costs pre-research and is the real commitment gate. Demotion is free and logged.
- **Brand architecture:** Aster is the house brand; lenses are `Aster <one noun>` with the decision question as subtitle. One sentence per product, no exceptions — if the sentence takes two clauses, the lens is two lenses.
- **Positioning lines (house-approved, from the source analysis):** suite — "Aster is a decision-support suite for asteroid and cislunar operations." Shorthand — "choose targets, screen risk, explain confidence, plan movement." Pitch — "Aster turns fragmented space data into explainable decisions."
- **Entity form:** none yet, deliberately. Today this is a sole-founder product portfolio. Incorporation is its own decision with explicit triggers: first paying customer, first contract, or first collaborator-equity question — whichever fires first. Forming a holding company before any of those is theater [Likely]. Logged as a standing decision, not taken.
- **Repo policy:** substrate and Waves 0–1 live in `asteroid-mining-planner` (DEC-15-1 logic: one provenance chain). A lens earns its own repo at FOUNDED state **if and only if** it has its own deploy target and does not import `src/v2/core` directly (it consumes the substrate via the published package/MCP instead). That rule is what keeps the conglomerate from becoming a monorepo of half-products.
- **Slice 14 tie-in (Hudson's call):** the About page may carry one family line ("Aster is the first lens of an evidence-first decision suite") — helps the investor read, mildly dilutes the Fellows read. Optional flag, not a default.

## §8. Standing risks (named at draft time)

- **Sprawl** is the death mode — mitigated structurally by maturity states, entry gates, and the one-empty-slot habit.
- **Brand split** (asteroid credibility vs LEO revenue) — mitigated by the substrate story; revisit if Traffic/Risk ever lead.
- **Fake-precision creep** in Ledger/Risk — the honest-numbers rules are inherited invariants, not vibes; a lens that can't refuse doesn't ship.
- **Opportunity cost** — every charter hour this week competes with Slice 15's lock. This document is the map; the queue is unchanged.
