# S20_03 — verify-before-lock: return-leg numbers and claims

Verification pass for the S20_02 leads. NO follow-up chain (verification prompts are exempt: expansion buries the verdicts). Paste the fence into a FRESH Perplexity thread (not the S20_02 one), or ChatGPT with browsing. Save the answer next to S20_02.

```
You are verifying specific claims for an engineering design document. For EACH numbered
item, reply with exactly one line:
  <n> · CONFIRMED | REFUTED | UNVERIFIABLE · <the value as the primary source states it,
  with its convention/units> · <primary source: title, author/agency, year, page or
  section, URL>
Rules: primary sources only (mission papers, NASA/JAXA/ESA technical reports, AIAA/AAS
papers, official mission pages). Secondary articles do not count. If the value exists but
under a different convention (inertial vs atmosphere-relative, altitude vs geocentric
radius, nominal vs reconstructed), mark REFUTED and give the correct convention. Do not
add commentary, follow-ups or summaries.

1. Stardust sample-return capsule: nominal inertial entry speed at the entry interface
   = 12.9 km/s.
2. Stardust: entry interface defined at geocentric radius 6503.14 km.
3. Stardust: nominal inertial entry flight-path angle = -8.2 deg.
4. The OSIRIS-REx entry/descent/landing paper quotes Stardust's entry speed as 12.8 km/s
   (state which paper and exactly what convention it uses).
5. OSIRIS-REx sample return capsule: requirement that atmosphere-relative entry speed be
   no greater than 12.4 km/s.
6. OSIRIS-REx: pre-entry compliance value of atmosphere-relative entry speed = 12.38 km/s.
7. OSIRIS-REx: targeted entry interface at geocentric radius 6503.142 km (~133 km above
   mean sea level).
8. OSIRIS-REx: nominal inertial entry flight-path angle = -8.2 deg, with an overall
   allowance of +-0.08 deg.
9. Hayabusa (2010 return): nominal inertial entry speed 12.2 km/s and flight-path angle
   -12.3 deg, and the altitude at which those values are defined (200 km? 202.03 km?
   121.9 km?).
10. Hayabusa2 capsule (2020 return): entry speed ~12 km/s, and the official
   interface-specific entry flight-path angle if published.
11. NASA NHATS (Near-Earth Object Human Space Flight Accessible Targets Study): the
   atmospheric entry-speed constraint is 12 km/s; state the altitude at which it applies
   (is it 125 km?).
12. NHATS: total round-trip mission duration bound of 450 days (state whether this is
   the only duration bound NHATS uses).
13. NHATS computes the outbound (Earth->asteroid) and return (asteroid->Earth) legs as
   separate Lambert solutions using JPL Horizons ephemerides, and does NOT assume the
   asteroid departure dV equals the outbound arrival v-infinity.
14. Keck Institute for Space Studies 2012 Asteroid Retrieval Feasibility Study: reported
   Earth-arrival C3 of about 1.6-2.1 km^2/s^2 for asteroids 2008 HU4, 1998 KY26 and
   2000 SG344 (give the table/slide and the exact values per asteroid).
15. poliastro (any released version): provides a Lambert solver based on a formulation
   other than Izzo's (e.g. Vallado's universal-variable method); name the function and
   the version.
16. Is there any published, literature-standard low hyperbolic-excess-speed threshold
   (for example 1.5 km/s) below which patched-conic Earth-arrival estimates are considered
   invalid? CONFIRMED only if a primary source states a specific number.
```

## Triage (Nova)
- CONFIRMED values may enter the Slice 20 founding doc with their source and convention.
- REFUTED and UNVERIFIABLE values do not enter a DEC; they are listed in the founding doc's engineering record.
- Items 11 and 14 settle conflicts already on file: the K2 prototype's learnings say "NHATS caps entry at 12 km/s at 125 km", and S20_02 flags 125 km as unverified. Item 15 decides whether the oracle can be formulation-independent (poliastro's Lambert is Izzo, the same algorithm Aster uses).
