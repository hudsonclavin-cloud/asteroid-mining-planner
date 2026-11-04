# S20_02 — Perplexity pre-research prompt: the asteroid → Earth return leg

Paste everything inside the fence into Perplexity (Research mode). Save the full answer, chain included, to `tools/slice20-research/literature/S20_02_return_leg_perplexity.md` via an agent commit. Nothing from it enters a DEC until the verification pass (S20_03, written from the LOAD-BEARING NUMBERS list) confirms it.

```
I am building an open-source, browser-based asteroid mission-planning tool that screens
near-Earth asteroids with patched-conic, impulsive Lambert transfers (single- and
multi-revolution, Izzo solver, heliocentric ICRF frame, JPL Horizons ephemerides). It
already computes outbound Earth -> asteroid porkchop grids (C3, departure declination,
arrival v-infinity). I am adding the RETURN leg: asteroid -> Earth, outputting the
Earth-arrival hyperbolic excess velocity as a full VECTOR plus its epoch, for every
asteroid in a ~42,000-object NEA catalog, at screening fidelity (no gravity assists,
no low-thrust). Downstream consumers include a sample-return capsule-entry check and a
rotating-tether (skyhook) catch-envelope study, which need the vector, not the magnitude.

Answer these, with primary sources (mission papers, NASA/ESA/JAXA technical reports,
AIAA/AAS papers, textbooks), and flag every number as official-published vs
third-party-estimated:

1. CONVENTIONS. How do mission designers define and report the Earth-arrival state of a
   return trajectory: v-infinity vector frame (ICRF/EME2000 vs ecliptic), the B-plane
   (B·R, B·T) definition and reference direction, entry interface altitude (e.g. 121.9 km
   / 125 km), and the conversion from v-infinity to entry speed. Which of these must a
   screening tool output so a later, higher-fidelity tool can consume it?

2. REAL RETURN-LEG NUMBERS. For flown or designed small-body sample returns (Stardust,
   Hayabusa, Hayabusa2, OSIRIS-REx, and any designed NEA return such as NASA's NHATS
   studies or the 2012 Keck asteroid-retrieval study), give: Earth-arrival v-infinity
   and/or C3, atmospheric entry speed, and entry flight-path angle. State the entry-speed
   ceiling programmes treat as acceptable for a capsule, with its source.

3. WHAT A SCREENING TOOL SHOULD REFUSE. Where do patched-conic, impulsive return-leg
   estimates become misleading: Earth-arrival declination and lighting/landing-site
   constraints, Earth-Moon system capture, very low v-infinity (< ~1.5 km/s) arrivals,
   long-duration multi-rev returns, and arrival epochs far from the asteroid's orbit
   determination epoch. What does the literature say a screening tool must disclose or
   decline to compute?

4. SYMMETRIC-RETURN ASSUMPTION. Some screening models assume the return departure dV
   from the asteroid equals the outbound arrival v-infinity. Is this assumption used in
   the literature (e.g. NHATS or Benner-style accessibility screens)? How large is its
   error, and in which direction, for typical NEAs?

5. VALIDATION. What independent tools or published cases are used to validate a return-leg
   Lambert screen (e.g. poliastro, GMAT, pykep/pagmo, NASA NHATS trajectory tables,
   published porkchop plots for a named return)? Name specific cases with published numbers
   that a test could compare against.

FOLLOW-UP CHAIN DIRECTIVE:
After answering the question above in full, continue as follows:

LEVEL 1 - State the 3 most decision-relevant follow-up questions your answer raises for an
asteroid-return-leg screening tool, and answer each with sources.

LEVEL 2 - For each Level-1 answer that materially affects a design decision, pose and
answer the single most important follow-up it raises, with sources.

LEVEL 3 - Repeat once more for any Level-2 answer that still carries open decision weight.

BUDGET: no more than 10 follow-up answers total across all levels. Prune by
decision-relevance, not curiosity - drop branches that only add color.

For EVERY follow-up answer:
(a) open with one line stating why this follow-up matters for the tool,
(b) cite primary sources,
(c) flag each number as official-published vs third-party-estimated.

END with a section titled LOAD-BEARING NUMBERS: a flat list of every number in this entire
response that a design decision might rest on - one line per number, with its source. This
list feeds an independent verification pass.
```

## Triage (Nova, after it returns)
- Root and chain answers are leads. The LOAD-BEARING NUMBERS list becomes the S20_03 verification prompt (confirm / refute / unverifiable, one line each; no chain directive there).
- Contradictions between the root and a follow-up get logged in the Slice 20 founding doc's engineering record, not silently resolved.
