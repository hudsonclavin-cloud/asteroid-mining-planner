# Slice 8.5 — UX Polish

**Status:** SCOPED 2026-05-15, implementation pending
**Predecessor:** Slice 8 (shipped 2026-05-15) — 10,008-body cell-as-mesh architecture
**Successor:** Slice 9 — full 32k NEA catalog + ui-hud unfreeze for search/filter

## §1 Thesis

Slice 8 shipped working architecture. Phase D round 1 visual inspection (Claude in Chrome, 2026-05-15) surfaced that Aster's deployed URL has known first-impression UX issues latent since Slices 4-6. Slice 8 cutover deferred them. Slice 8.5 closes them before Slice 9's larger work. The discipline pattern: polish slices follow architectural slices, fix what's visible to users rather than what's architecturally novel.

## §2 Scope (7 items)

**A. First-impression UX (highest leverage):**

1. **Star background** — Tycho-2 source catalog (~2.5M stars), preprocessed offline into a magnitude-limited binary subset (~6,000-10,000 stars to magnitude ~7.5). Rendered as 2-3 THREE.Points layers (bright/medium/faint tiers) with custom shader. Camera-relative vertex transform so stars stay at infinity. B-V → RGB color conversion baked offline. NO proper motion in v1 (J2000 frozen positions).

2. **Top-down ecliptic preset** — new keyboard shortcut (key: `t`) that animates camera from current position to ~8 AU above ecliptic north pole, looking down. Smooth tween ~1s ease-out. The canonical "show me the solar system as a disk" view.

3. **Planet hover tooltips** — minimal HTML overlay tooltip on planet hover showing body name (e.g., "Earth"). Resolves "which dot is which" problem without committing to 3D-billboard label architecture (Slice 9 territory). Pattern: raycast on pointermove against planet meshes only, vector.project(camera) for screen position.

**B. Body-level visual fixes:**

4. **Moon visibility from Earth focus** — Earth's default focus radius adjusted so Moon is visible. Current `5 × r_earth ≈ 32,000 km` puts Moon at 384,000 km out of frame. Increase focus radius to ~400,000-500,000 km (~62-78× r_earth) or implement smart-fit-with-largest-satellite logic.

5. **Asteroid focus radius adjustment** — change `getDefaultAsteroidFocusRadius` multiplier from `max(5r, r+1000m)` to `max(20r, r+5000m)` so focused asteroids fill ~15-25% of screen instead of 50-60%.

6. **Saturn moons distinguishability** — adjust per-moon halo size or color so all 7 rendered Saturn moons are visible as distinct dots (currently 3-4 visible).

**C. Time/UI affordances:**

7. **Date/epoch HUD text** — minimal HTML overlay in screen corner showing current simulated TDB date (e.g., "2026 May 15"), updates on time scrub. Replaces invisible page-title-only feedback.

## §3 Deferred to Slice 9

- Full ui-hud unfreeze (search, filter, sort, panels)
- 3D-anchored billboard labels for planets
- Asteroid hover labels (requires hover-on-instanced-mesh pattern)
- Full timeline scrub bar UI with click-to-jump
- Lighting overhaul (PBR or improved Lambertian)
- Residual frustum-edge flicker fine-tuning (revisit at 32k scale)

## §4 Architectural impact

**ui-hud freeze policy:** Slice 8 cracked the freeze minimally for focused-body text. Slice 8.5 expands the crack for:
- Date/epoch text (new corner overlay, opposite side from focused-body HUD)
- Planet hover tooltips (new transient HTML overlay)

Both are HTML-overlay positioned absolutely, NOT Three.js Sprite or 3D billboard. That architectural decision (HTML vs 3D labels) defers to Slice 9.

**New render layer:** Star background introduces a static render layer below all body rendering. Camera-relative pass so stars stay at infinity. No per-frame propagation. Integrates with existing floating origin pipeline by subtracting camera position in vertex shader.

**No changes to Slice 1-8 core:** No propagator changes, no spatial grid changes, no cell-as-mesh changes, no fixture changes. Slice 8.5 is purely additive in the render and ui-hud layers.

## §5 Invariants

INV-014 (new): "Star background renders at honest celestial position." Tycho-2 J2000 positions converted to unit-sphere directions. Test gate: synthetic check that Polaris renders at correct declination (RA ≈ 2.53h, Dec ≈ +89.26°).

INV-008 (existing) still applies: Slice 1-8 visible behaviors must not regress. Belt visual preserved, focused-body HUD preserved, click-to-focus preserved.

## §6 Phase structure

**Phase A: Star background + top-down preset (architecturally new)**
- A.0 Tycho-2 catalog acquisition + offline preprocessing
- A.1 Star renderer module + integration
- A.2 Top-down camera preset key + animation

**Phase B: Body-level visual fixes (small, parallel-friendly)**
- B.1 Moon visibility (Earth focus radius)
- B.2 Asteroid focus radius
- B.3 Saturn moons

**Phase C: ui-hud additions**
- C.1 Date/epoch corner overlay
- C.2 Planet hover tooltips with raycast

**Phase D: Manual verification by Hudson**

**Phase E: Cutover + deploy**

## §7 Test gates per phase

Phase A:
- A.0: Tycho-2 binary asset loads, contains ~6,000-10,000 stars after filter, file size <500 KB
- A.1: star renderer produces expected point count in geometry, Polaris renders at correct unit-direction
- A.2: top-down preset animation completes, final orbitPolar ≈ 0

Phase B:
- B.1: Moon visible in default Earth focus view (synthetic camera position test)
- B.2: asteroid focus radius produces expected sphere-to-screen ratio
- B.3: 7 distinct Saturn moon dots in default Saturn focus view

Phase C:
- C.1: date overlay text updates on time scrub
- C.2: hover tooltip appears/hides correctly, text matches body name

## §8 Tripwire

Slice 8.5 cutover by 2026-05-17 (Sunday evening). If implementation exceeds 16 hours focused effort, decompose: keep Phase A + B in Slice 8.5, push Phase C to Slice 8.6 or merge into Slice 9 ui-hud work.

## §9 Open questions resolved during scoping

- ✓ Catalog choice → Tycho-2, magnitude-limited to ~7.5
- ✓ Render pattern → THREE.Points + BufferGeometry + custom shader
- ✓ Infinity handling → camera-relative vertex transform
- ✓ Stellar color → B-V index → RGB, baked offline
- ✓ Proper motion → not in v1, J2000 frozen
- ✓ Hover tooltip pattern → raycast on pointermove + vector.project(camera)
- ✓ Top-down animation → smooth tween ~1s ease-out

## §10 Research dependencies — COMPLETE

Perplexity research completed 2026-05-15. Findings:
- Tycho-2 correct catalog choice (better than Yale BSC, smaller than Hipparcos full)
- THREE.Points + BufferGeometry + custom shader is correct pattern
- Camera-relative vertex transform handles infinity at solar-system scale
- Standard raycast-on-pointermove + vector.project(camera) handles hover tooltips
- No Three.js r128 limitations affect chosen patterns
