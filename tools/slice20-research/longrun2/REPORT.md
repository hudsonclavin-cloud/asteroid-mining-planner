LONGRUN2: PARTIAL (XR0 done; XR1 recompute running; XR2 census running; XR3 not started)
HOST: Linux x86_64 node v22.23.4 | 4 cores | COMMITS: 0 on s20-longrun2-research before this commit, tip 75606da (origin/main)
XR0 LR2 CROSS-CHECK: 540 bodies | agree 540 | differ 0 | max |Δerror| 0 km/s | VALIDATES LR2
XR1 CACHE: provenance DRIFT: precomputeScriptSha256 (catalog and horizons fixture hashes MATCH; docs = tests copy MATCH) | recompute running
XR2 VALIDITY: running
XR3 M=1 RETURNS: not started

# S20_LONGRUN2 report (in progress)

XR1 provenance check shows DRIFT on the precompute script hash: the script was edited twice (2026-08-05) after the cache was built; both input fixtures still match. See LOG.md; the full report follows when the run ends.
