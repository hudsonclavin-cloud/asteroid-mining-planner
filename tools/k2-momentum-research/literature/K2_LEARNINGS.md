# K2 pre-research triage — Perplexity result 2026-10-06

Source: `PERPLEXITY_RESULT_2026-10-06.pdf` (19 pp, sha256 `101d2784…`), the answer to `../PERPLEXITY_PROMPT.md`.
Triage follows the recursive-research-elicitation rules. **Everything below is a lead.** Nothing enters a DEC, an
invariant or Skyhook `rev_a.json` until the verification pass (`VERIFY_PROMPT.md`) confirms it against the primary source.

## 1. What it confirmed

| Item | Our model | Perplexity (independent recomputation) | Status |
|---|---|---|---|
| Matching burn, v∞ = 1/2/3/4/5 km/s | 0.4409 / 0.5828 / 0.8152 / 1.1325 / 1.5278 | 0.441 / 0.583 / 0.815 / 1.133 / 1.528 | Agrees to rounding; now gate D in `verify.mjs` |
| Escape speed at upper tip | 10.4494 km/s | 10.449 | Agrees |
| Parabolic-arrival matching burn | 0.3931 km/s | 0.393 | Agrees. No arrival matches the tip without braking. |
| Carry-and-drop energy | 43.027 MJ/kg | 43.03 | Agrees |
| Drop-mode entry speed | 5.357 km/s at 120 km | 5.336 at r = 6,503.142 km (132 km) | Consistent; different interface altitude |

This is arithmetic agreement from a second tool working from the same inputs. It is not a physics validation.

## 2. What changes our conclusions

1. **Facility-mass framing was wrong. [Likely, needs verification]** Published MXER point designs ran a facility
   about 9.3–10.5× payload (23,358 kg for a 2,500 kg payload; Hoyt NIAC 2001; cislunar 26,250 kg). Rev A fiber
   alone is ~122× payload, so "more facility mass" does not explain the 440 km perigee result. The difference is
   orbit shape. MXER flew elliptical orbits and caught and threw near perigee, where recoil lowers the APOGEE. Rev A's
   circular orbit turns the same recoil into a perigee drop on the opposite side. This is our derivation, not a
   published statement; verify it before it becomes a Skyhook Rev B candidate.
2. **Unbalanced throws are an accepted operating mode, bounded by schedule.** MXER LEO–GTO lists a 15-day
   operational-orbit lifetime requirement and a 30-day turnaround. The cislunar study restores the orbit in about 85
   days at 11 kW. A Skyhook planner needs a per-event recoil limit plus a reboost schedule, not just an annual balance.
3. **Real return v∞ exists for a few targets.** Keck 2012 (slide 31) gives Earth-arrival C3 of 1.6–2.1 km²/s², so
   v∞ ≈ 1.27–1.45 km/s, for 2008 HU4, 1998 KY26 and 2000 SG344. Those trajectories target lunar-assisted capture,
   not LEO. NHATS caps entry at 12 km/s at 125 km, which implies unbraked v∞ ≲ 4.63 km/s (Perplexity's estimate).
   Both now appear on the sim's histogram as labeled leads.
4. **Declination alone cannot screen a catch.** A catch needs the full v∞ vector, the encounter epoch and a B-plane
   target. NHATS publishes a per-solution "Return Declination", tied to each trajectory, not to the asteroid. The
   sim's plane penalty is now labeled screening-only.
5. **No operational catch tolerance exists in the literature retrieved.** Quadtrap gives mechanism numbers: closure
   in 5 s or less, a 10:1 error-ellipse ratio, and a 1:10 ground prototype. HASTOL gives a capture window under 10 s.
   None of these is a ±m, ±m/s, ±s spec. The tolerance slider stays labeled "not in Rev A". Its default of 0 is correct.
6. **A missed catch must be shown to be safe.** Added: after the matching burn, a miss leaves the payload on a bound
   ellipse with perigee 930 km and apogee ~85,000 km. It does not impact under two-body assumptions. [Certain two-body]
7. **Energy is not the whole momentum budget.** Report energy and angular momentum and spin separately. Report
   "nominally feasible" separately from "robustly feasible" (Monte Carlo). Both are now named as unmodeled in the sim.
8. **Heat-shield context.** TPS fractions are Stardust 22%, Genesis 18% and Apollo 14% of entry mass. The OSIRIS-REx
   survivability limit is 40 g. NASA's TPS correlations cover 10–16 km/s, so the 5.4 km/s drop entry is outside them.
   Our ~19 g ballistic estimate sits under the 40 g OSIRIS-REx limit, but that comparison is a lead, not a design check.

## 3. Strongest counterargument it raised

The Keck study chose high lunar orbit over LEO because moving mass deeper into Earth's gravity well costs propulsion
and raises safety risk. For asteroid material, a LEO rotovator competes with lunar-orbit storage, not only with
aerocapture. The K2 decision is "LEO tether vs. lunar-distance storage vs. aerocapture vs. direct entry", compared
destination by destination.

## 4. Citation hygiene

The reference list mixes primary sources (NTRS, NIAC, KISS) with junk: a casino site, Reddit, a KSP forum, a CAD
forum, and an internal-looking `work.projects.aster_mission_mcp`. Only claims tied to refs 1–17 were triaged.
Everything else is ignored.

## 5. Open questions after this pass

- OQ-a (return v∞ distribution): partly answered for 3 targets; still needs K1 for the catalog.
- OQ-b (catch tolerance): NOT answered in the literature retrieved. Treat it as a Skyhook research gap.
- OQ-c (facility mass): answered for MXER (~10× payload). New question: Rev A circular vs elliptical facility orbit.
- OQ-d (aerocapture): partly answered (TPS fractions). No verified Earth-aerocapture aeroshell fraction yet.
- OQ-e (steep drop entry): not addressed.
- NEW OQ-f: should the K2 decision include lunar-distance storage as a destination option (Keck precedent)?
