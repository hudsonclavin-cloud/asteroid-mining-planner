# S20_03b — Verification results, second run

- **Source:** Perplexity, a second fresh thread on the same prompt (`S20_03_VERIFY_RETURN_LEG.md`), run by Hudson on 2026-11-04. Transcribed by Nova the same day; item 6's broken math rendering is reconstructed.
- **Why it exists:** a second run of the same verification prompt. It disagrees with the first run (`S20_03_verify_return_leg_results.md`) on two of sixteen items and adds primary sources the first run did not find. Both runs are kept; neither overwrites the other.

## Verdicts, with the difference from run 1

| # | Run 2 verdict | Run 2 value as the source states it | Run 2 primary source | Same as run 1? |
|---|---|---|---|---|
| 1 | CONFIRMED | 12.9 km/s, nominal design inertial entry velocity at entry-interface radius 6503.14 km | Desai, Lyons, Tooley, Kangas, *Entry, Descent, and Landing Operations Analysis for the Stardust Entry Capsule*, 2008, §III, p. 3. https://ntrs.nasa.gov/api/citations/20090004445/downloads/20090004445.pdf | Yes |
| 2 | CONFIRMED | Radius 6503.14 km from Earth's centre, not altitude | Desai et al., 2008, §III, p. 3 | Yes |
| 3 | CONFIRMED | −8.2°, nominal design inertial EFPA; final pre-entry orbit-determination value −8.21° | Desai et al., 2008, §III, p. 3 and §V.B.1, p. 7 | Yes, plus the −8.21° OD value |
| 4 | CONFIRMED (quote only) | Stardust 12.8 km/s, quoted simply as entry "velocity"; convention not stated | Francis, Johnson, Queen, Williams, *Entry, Descent, and Landing Analysis for the OSIRIS-REx Sample Return Capsule*, 2024, AAS 24-188, "Entry Overview", p. 5. https://ntrs.nasa.gov/api/citations/20240000629/downloads/OREX_EDL_paper_011124_afternoon.pdf | Yes |
| 5 | CONFIRMED | Atmosphere-relative re-entry speed no greater than 12.4 km/s, FDS-F-163 / MRD-163 | Getzandanner et al., *OSIRIS-REx Earth Return & Entry: Navigation Operations & Lessons-Learned*, 2024, AAS 24-151, Table 1, p. 4. https://ntrs.nasa.gov/api/citations/20240000800/downloads/O_REx_Earth_Return_Entry_Nav_Ops_LL_v4.pdf | Yes |
| 6 | CONFIRMED | V_entry = 12.38 km/s, pre-entry compliance value for the atmosphere-relative requirement; expected velocity dispersions "well below 0.02 km/s" | Getzandanner et al., 2024, Table 1, FDS-F-163, p. 4 | Yes, plus the dispersion note |
| 7 | CONFIRMED | Targeted entry interface 6503.142 km radius, approximately 133 km above mean sea level | Getzandanner et al., 2024, "Earth Return Targeting Strategy", p. 3 | Yes |
| 8 | CONFIRMED | Nominal inertial EFPA −8.20°; overall allowance ±0.08° (3σ), ±0.07° (3σ) allocated to FDS excluding SRC release error | Getzandanner et al., 2024, Table 1, FDS-F-34, p. 4 | Yes |
| 9 | CONFIRMED | 12.2 km/s and −12.3° at the initial entry-state datum, nominally 200 km and specifically 202.03 km at 13:51:12 UTC; separate entry interface 121.9 km (400 kft), predicted at 13:51:46 UTC | Grinstead et al., *Airborne Observation of the Hayabusa Sample Return Capsule Re-entry*, NASA Ames/SETI, 2011, §III.A, pp. 3–4. https://ntrs.nasa.gov/api/citations/20160000307/downloads/20160000307.pdf | Yes |
| 10 | **UNVERIFIABLE** | "~12 km/s" is supported by a published inertial entry value of **11.8 km/s**; an inertial EFPA of **−11.67°** is published, but the table does not give its interface altitude/radius, so it can't be verified as interface-specific | Prabhu, Saunders, Cruden, Grinstead, *Simulations of Hayabusa2 Atmospheric Entry and Comparisons with Data from the Imaging Campaign*, NASA Ames, 2022, Table 1, p. 2. https://ntrs.nasa.gov/api/citations/20220006454/downloads/AIAA-Aviation2022_v5.pdf | **No.** Run 1: CONFIRMED (speed only) from JAXA's rounded "~12 km/s" |
| 11 | CONFIRMED | Entry speed ≤ 12 km/s at 125 km altitude; the slide does not label the velocity reference frame | Barbee et al., *The Near-Earth Object Human Space Flight Accessible Targets Study: An Ongoing Effort…*, NASA, 2013 (IAA PDC 2013), "NHATS Analysis Constraints", slide 6. https://iaaspace.org/wp-content/uploads/iaa/Scientific%20Activity/conf/pdc2013/IAA-PDC13-04-13pr.pdf | Yes, from a **different** primary source (run 1: the CNEOS caveats page) |
| 12 | CONFIRMED | Round trip ≤ 450 days; also NEA stay ≥ 8 days; round-trip duration thresholds reported from ≤ 30 to ≤ 450 days in 30-day steps | Barbee et al., 2013, slides 6 and 14–15 | Yes, different primary source; run 1 said the API filters span 60–450 d |
| 13 | CONFIRMED | Outbound and inbound are patched-conic Lambert solutions with full-precision Horizons ephemerides; arrival and departure manoeuvres are distinct. For the 346-day **2000 SG344** example: NEA arrival Δv = **0.128 km/s**, departure Δv = **0.217 km/s**, not an imposed equality | Barbee et al., 2013, slides 5–6 and 16 | Yes, plus a worked NHATS example |
| 14 | **CONFIRMED** | Earth-arrival C3 (km²/s²): 2008 HU4 = 1.8, 1.7, 1.6, 1.6, 1.6 for returned masses 250, 400, 650, 950, 1300 t; 1998 KY26 = 2.0 for 30 and 60 t; 2000 SG344 = 2.0 and 2.1 for 1800 and 3600 t. Separate direct Sun–Earth L2 stable-manifold cases list 0.0 for HU4 at 200 t and SG344 at 100 t | Friedman and Tantardini, *Asteroid Retrieval Feasibility*, KISS presentation to ESA ESTEC, 2012, slide 31. https://www.kiss.caltech.edu/papers/asteroid/papers/20120314_ESA_ESTEC.pdf | **No.** Run 1: UNVERIFIABLE (it read the final report, not the slides) |
| 15 | CONFIRMED | `poliastro.iod.vallado.lambert`, released 0.17.0 (introduced in 0.3.0); universal-variable approach (Battin, Mueller & White) with Vallado's bisection; multiple revolutions unsupported | poliastro 0.17.0 documentation, 2022, API reference `poliastro.iod.vallado`. https://docs.poliastro.space/en/stable/autoapi/poliastro/iod/vallado/index.html | Yes |
| 16 | UNVERIFIABLE | No literature-standard low Earth-arrival v∞ invalidity threshold located, including 1.5 km/s | None located; NHATS (Barbee et al., 2013, slide 6) specifies patched-conic calculations with no such cutoff | Yes |

## What changes (Nova's triage)

- **Process finding:** two runs of one verification prompt disagreed on 2 of 16 items. Run 2 found primary sources run 1 missed (the KISS slide deck, the Prabhu 2022 Hayabusa2 paper, Barbee 2013). One verification pass is not enough for a number a DEC rests on. A DEC-bound number needs two agreeing runs, or the primary source opened directly by Hudson or Clome.
- **DEC-bound values, both runs agree:**
  - NHATS ≤ 12 km/s at 125 km (#11);
  - NHATS minimum stay 8 days (#12);
  - NHATS separate legs (#13).

  These came from two different primary sources (the CNEOS caveats page and Barbee 2013). They stand.
- **#14 Keck return C3:** now has a primary source (slide 31), matching what the K2 prototype cited. Run 1 and run 2 disagree, so open slide 31 directly before using it. Even then it is architecture-specific (solar-electric, Earth–Moon delivery): a context value, not a Lambert test anchor (OQ-20-7 stands).
- **#13 NHATS 2000 SG344 example:** a possible sanity check for K1. Arrival 0.128 km/s and departure 0.217 km/s for a 346-day round trip. It needs the trajectory's epochs (slide 16) before anything can be compared, and NHATS's Δv bookkeeping may differ from Aster's. New OQ for the founding doc's lock record.
- **#10 Hayabusa2:** 11.8 km/s inertial (Prabhu 2022) is consistent with JAXA's rounded "~12 km/s". Not load-bearing.
