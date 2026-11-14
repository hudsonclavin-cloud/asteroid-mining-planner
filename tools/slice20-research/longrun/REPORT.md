LONGRUN: PARTIAL (LR0, LR1 done; LR2, LR3, LR4 pending)
COMMITS: 0 before this commit on s20-longrun-research (a file cannot contain the hash of the commit that adds it; see git log)
LR1 ORACLE: 14,124 converged branches (6,000 M=0 cells; 4,062 M=1 cells x 2 branches) | max |Δv∞| izzo 1.614e-12 km/s · vallado(M=0) 1.875e-10 km/s tight, 3.420e-7 km/s at poliastro defaults · closure 1.399 km worst (1.055e-4 km where the transfer perihelion is >= 0.1 AU) | no threshold set; the closure tail is propagator-limited on Sun-grazing transfer orbits
LR2 SYMMETRIC: pending
LR3 MUTATION: pending

# S20_LONGRUN report (in progress)

CLOUD RUN. The dispatch names Hudson's Windows laptop; this ran in a cloud Linux container. Hudson waived
tripwire (a) in-session on 2026-11-14, authorized creating the poliastro venv, and chose git-bundle delivery
(no push). One agent, zero sub-agents, zero workflows. Everything here is LEADS-grade.

## LR0
See LOG.md. Baseline `npm run verify`: 109/109 files, 363 tests, 0 failed.

## LR1
See lr1-oracle/REPORT.md and lr1-oracle/README.md.
