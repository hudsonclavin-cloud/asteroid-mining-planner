LONGRUN: PARTIAL (LR0, LR1, LR2, LR4 done; LR3 running)
COMMITS: 2 before this commit on s20-longrun-research, tip 44bce62 before this commit (a file cannot contain the hash of the commit that adds it)
LR1 ORACLE: 14,124 converged branches (6,000 M=0 cells; 4,062 M=1 cells x 2 branches) | max |Δv∞| izzo 1.614e-12 km/s · vallado(M=0) 1.875e-10 km/s tight, 3.420e-7 km/s at poliastro defaults · closure 1.399 km worst (1.055e-4 km where the transfer perihelion is >= 0.1 AU) | no threshold set; the closure tail is propagator-limited on Sun-grazing transfer orbits
LR2 SYMMETRIC: 41,906/41,906 bodies (39,993 measured; 1,451 all return cells refused; 461 no practical window; 1 not propagatable) | median |error| 8.972 km/s · p90 17.838 km/s · overcharge share 97.3% (compare-path best window; UNVALIDATED until LR1 passes review)
LR3 MUTATION: running (2,364 mutants enumerated)

# S20_LONGRUN report (in progress)

CLOUD RUN. The dispatch names Hudson's Windows laptop; this ran in a cloud Linux container. Hudson waived
tripwire (a) in-session on 2026-11-14, authorized creating the poliastro venv, and chose git-bundle delivery
(no push). One agent, zero sub-agents, zero workflows. Everything here is LEADS-grade.

- LR0: see LOG.md. Baseline `npm run verify`: 109/109 files, 363 tests, 0 failed.
- LR1: lr1-oracle/REPORT.md.
- LR2: lr2-symmetric/REPORT.md. UNVALIDATED until LR1 passes review.
- LR4: lr4-repro/REPORT.md. 55/55 docs files byte-identical.
- LR3: in progress.
