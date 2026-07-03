# Slice 13 — 3d Verification Record (verify-before-lock)

Date: 2026-07-02
Passes merged: (1) Perplexity 3d run (strict-format, corrective-line rule); (2) chat direct pass against primary sources (elvperf, Spaceflight Now, JPL DESCANSO, ULA published table via prior session); (3) computation where the claim is arithmetic.
Status: research phase CLOSED except items 1–4, 6, 7, which convert to a manual elvperf.ksc.nasa.gov browser query (primary source; public, interactive-only). Query results to be committed as their own measurement artifact.

## Meta-finding

The Perplexity pass returned UNVERIFIABLE on 12 of 14 items and claimed the NASA LSP query tool is not publicly accessible. That claim is REFUTED: https://elvperf.ksc.nasa.gov is public and maintained (page updated 10 Feb 2026) with a Performance Query page; it requires an interactive browser session, which is why search-based tools cannot read it. Lesson recorded: search-based verification bottoms out at interactive tools and paywalled/offline documents; the residue converts to manual primary-source queries, not more search passes.

## Per-item outcomes

1. FH Expendable anchors (15,010 / 12,345 / 10,115 / 6,640 / 4,690 kg at C3 = 0/10/20/40/55) — OPEN → elvperf manual query. Supporting cross-check: Europa Clipper flew FH-Expendable at C3 ≈ 41 with ~6,065 kg vs the claimed 6,640 @ C3=40 (consistent).
2. FH ASDS-Recovery anchors — OPEN → elvperf manual query.
3. Vulcan VC2 anchors — C3=20 point (~3,600–3,700 kg) CONFIRMED against ULA's published TMI figure (TMI defined as C3 = +20 km²/s²; Cutaway Poster / 2023 User's Guide). Remaining points OPEN → elvperf.
4. Vulcan VC6 anchors — C3=20 → 7,600 kg CONFIRMED (same ULA source, exact match). Remaining points OPEN → elvperf.
   3/4 note: an earlier verification attempt reported VC2 8,300 / VC4 11,600 / VC6 14,400 kg "at ≈C3=20" — REFUTED: those are ULA's GTO column values (GTO is a bound orbit, C3 ≈ −16), mislabeled as C3=+20. Recorded as this slice's canonical example of orbit-regime mislabeling.
5. Vulcan provenance (RL10C vs RL10E Centaur) — OPEN → note the config labels the elvperf query offers.
6. New Glenn anchors (7,100 / 4,900 / 2,300 at C3 = 0/10/20; →0 near C3 ≈ 25–30; claimed LSP late-2022 estimate) — OPEN → elvperf manual query.
7. Falcon 9 payload-vs-C3, any official public source — OPEN → check whether F9 appears in the elvperf query vehicle list. The current SpaceX Falcon User's Guide (falcon-users-guide-2025-05-09.pdf) is public but is not known to publish C3 anchor tables.
8. IXPE dogleg — CONFIRMED WITH CORRECTION (Spaceflight Now, Dec 2021, Tim Dunn interview): due-east Cape ascent = 28° inclination, removed by second-stage dogleg; >14 t capacity to similar altitude without the plane change; capacity WITH the dogleg and ASDS-recovery propellant reserve ≈ "a little more than a ton." The 330 kg figure is IXPE's spacecraft mass, NOT the post-dogleg capacity — the 3a research PDF conflated them. Corrected anchor: 28° ascent dogleg + recovery reserve ≈ 14 t → ~1 t (≈93% capacity loss).
9. JPL per-degree figure — CONFIRMED, SOURCE IDENTIFIED: JPL DESCANSO Book Series Vol. 12, Low-Energy Lunar Trajectory Design (Parker & Anderson), Ch. 6 (Operations): per-degree-of-inclination-change transfer ΔV cost; establishing a 21-day launch period from a 28.5° LEO parking orbit costs ≈ 71.7 ± 29.7 m/s (1σ) total. The figure is transfer ΔV accommodated via launch/trajectory geometry — NOT an impulsive plane change at LEO speed. Applicability caveat: derived for low-energy lunar transfers; treat as evidence for the two-regime cost structure, not as a liftable formula for interplanetary DLA pricing.
10. Impulsive formula Δv = 2v·sin(Δi/2), costed at the injection burn — CONFIRMED (Perplexity pass; standard astrodynamics texts, Vallado/SMAD class).
11. AIAA S-120 / GSFC gold rules margin clauses — UNVERIFIED at clause level (documents not publicly searchable). Disposition: margin DEC anchors to the confirmed ECSS convention (item 12) instead; S-120/GSFC cited only qualitatively if at all.
12. ECSS margin convention (5% on analytically-derived trajectory maneuvers; 100% on generic stationkeeping/attitude ΔV) — CONFIRMED (Perplexity pass, ECSS margin/contingency guidance).
13. Screening Isp classes (300–350 s storable bipropellant; 2,000–3,000 s SEP) — UNVERIFIED at table level; [Likely] correct as textbook-standard. Disposition: the DEC that fixes the screening Isp discloses it as an assumption; SMAD-class citation attached at commit time or the disclosure says "representative class."
14. LEO 200 km → C3=0 injection ΔV ≈ 3.2 km/s — CONFIRMED BY COMPUTATION: v_circ = √(398600.4418/6578.137) = 7.784 km/s; v_esc = √2·v_circ = 11.008 km/s; Δv = 3.224 km/s. Matches the shipped vis-viva injection line at C3=0. No external source required; the constant is GM_Earth.

## Two-regime dogleg synthesis (input to the pricing DEC)

- Regime 1 (plane-matching, |DLA| within site azimuth capability — AMBER): cost is launch-geometry accommodation, ~1 m/s-per-degree class per DESCANSO evidence; screening model = small disclosed derate, possibly calibrated against elvperf's own declination handling if the query tool exposes a DLA input (check during the manual query).
- Regime 2 (brute-force ascent dogleg — RED): IXPE anchor ≈ 93% capacity loss at 28°; screening-honest treatment is "infeasible at screening fidelity" rather than a precise-looking 2v·sin(Δi/2) charge at LEO speed, which would misprice Regime 1 by ~3 orders of magnitude.
- Exact formulation: PROPOSED DEC in the Slice 13 founding doc; Hudson locks.
