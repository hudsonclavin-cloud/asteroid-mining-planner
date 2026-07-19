<!-- DRAFT — NOT LOCKED. Authored 2026-07-07 (Fable session,
pre-Slice-15-publish). Ingested 2026-07-18 per S16-PRE-INGEST
dispatch; body text byte-preserved from the authored draft.
Slice NUMBERING in this file may be stale — reconciled at
design-lock, not here. Additive-only rules apply AFTER lock; until
lock this file is a working draft. -->

# Founding SEEDS — Slice 18 (Live Ephemeris & Freshness) · Slice 19 (Transfer Cinematics)

**Status:** SEEDS — deliberately NOT founding documents. Each is §1-intent + OQ skeleton + skill routing, written so a future session starts from framed questions instead of a blank page. Nothing here is a DEC; no numbers are locked; pre-research has NOT run. Per DECISIONS_2026-07-07 D6. Anything beyond S19 stays unnumbered.

---

## SEED — Slice 18: Live Ephemeris & Data Freshness

**§1 Intent (2 paragraphs).** Today Aster's world is a dated snapshot: catalog 41,906 (snapshot), ephemeris 2026–2040 (committed file), vehicle curves as-of 2024-02-29. S18 connects live sources — JPL Horizons/SBDB queries for bodies and states — WITHOUT breaking the honesty model. The envelope was built for this day: `as_of` becomes dynamic, `SourceRef.retrieved` becomes real fetch timestamps, and freshness becomes a first-class rendered property instead of an implicit assumption. The product claim: an answer that knows *how old its own inputs are* and says so.

The hard part is not fetching — it's that live data multiplies provenance complexity: cache honesty (a cached fetch is not a fresh fetch), snapshot-vs-live divergence (what happens when live SBDB disagrees with the committed catalog?), and reproducibility (INV-039-class: an answer from live data must pin what it saw). S18 sequences AFTER the envelope has proven itself on static data (Slices 15–16) precisely because of this.

**OQ skeleton (open, unresearched):**
- OQ-18-a: Which sources, which endpoints, what terms? (SBDB/Horizons APIs; NASA AI-attribution rule V-12 applies to copy.)
- OQ-18-b: Cache policy that stays honest — TTLs, `retrieved` stamping, and how a cached answer discloses its cache age.
- OQ-18-c: Live-vs-snapshot conflict semantics — which wins, and how the envelope represents the disagreement (a confidence downgrade? a dual-source note?).
- OQ-18-d: Reproducibility of live answers — pin-what-you-saw (store the fetched payload hash?) vs accept irreproducibility with disclosure.
- OQ-18-e: Where fetching runs — client, Worker (consumes Slice 17), or generation-time only.
- OQ-18-f: Rate limits / courtesy on NASA endpoints.

**Skill routing at promotion:** mcp-server-discipline (tool/envelope changes are DEC-governed), slice-discipline, recursive-research-elicitation for the pre-research pass; the F2 census (nea_census_research.pdf) is the source-landscape prior.

**Entry gate (proposed, not locked):** Slice 16 study complete (the honesty layer validated on static data first) + Slice 17 if server-side fetching is the chosen shape.

---

## SEED — Slice 19: Transfer Cinematics ("click a cell, fly the transfer")

**§1 Intent (2 paragraphs).** Hudson's vision: watch the probe leave Earth, cruise, and arrive at the asteroid. The load-bearing product decision (D6): fuse that with the interpretability thesis — **the animation renders a computed solution, never invents physics.** Click a porkchop cell → the exact Lambert arc for that cell (the same r1/r2/v1/v2 the validated solver produced, the same numbers explain_cell narrates) plays as a cinematic: departure, transfer arc, arrival geometry, DLA visualized as the actual departure asymptote. The rotovator sim's rule inherits verbatim: never bend the physics for the shot; change the camera. This makes the honesty layer *visible* — the flown path IS the evidence — and it's the professor-demo artifact.

Scope instinct (unlocked): v1 is one body, one cell, one camera choreography, driven entirely by existing computed state (Lambert velocities + Kepler propagation of the transfer orbit between endpoints). Asteroid-approach/mining visualization is a later phase or a Momentum-adjacent effort — explicitly not v1.

**OQ skeleton (open, unresearched):**
- OQ-19-a: Trajectory sampling — propagate the transfer conic between r1/r2 (existing Kepler machinery? new math? if ANY new propagation is needed it's math-layer → multi-agent audit — flag early).
- OQ-19-b: Scene scale/units strategy (AU-scale scenes are float-precision traps — realtime-3d-performance's origin-jitter guidance).
- OQ-19-c: Where it lives — a v2 route? embedded in the porkchop view? standalone showcase page?
- OQ-19-d: Camera language — choreographed cinematic vs free orbit; what the FK3 tour teaches about guided attention.
- OQ-19-e: Time compression + honest labeling (a 180-day transfer in 20 seconds must SAY so).
- OQ-19-f: Performance budget for the deployed page (mobile?).

**Skill routing at promotion (the point of this seed):** threejs-animation-craft (render loop, damped follow, orbit choreography), threejs-scene-craft (the look — lighting/tone-mapping for space scenes), procedural-animation (camera springs, ambient motion), procedural-geometry (orbit ribbons/trajectory tubes), realtime-3d-performance (scale + budget), animation-motion-language (timing/easing), rotovator-rev-a (the physics-vs-camera rule, stated there). Any new propagation math → multi-agent-audit before it renders.

**Entry gate (proposed, not locked):** explain_cell stable (it is the data contract for "this cell's transfer") — effectively satisfied at S15 close; sequencing vs S18 is Hudson's call (cinematics need no live data).

---

*Seeds end. Promotion path for each: pre-research → charter-grade review → full founding doc per slice-discipline. Neither seed authorizes implementation.*
