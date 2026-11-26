# S20 overnight research log

- 2026-11-26T07:05:45.128Z — dispatch received; timestamps below are recorded in UTC by the execution commands.
- 2026-11-26T07:05:45.128Z — Phase 0.1 COPY-VERSION matched once at line 3: `S20-OVERNIGHT-2026-11-25-A`.
- 2026-11-26T07:05:45.128Z — Phase 0.2 canonical identity, origin, source existence, fetch, and clean-status gates passed; `origin/main` = `b25a37b`.
- 2026-11-26T07:05:45.128Z — Phase 0.3 session-start match gate passed: `b25a37b` is the PR #20 merge with first parent `cf94d88` and a second-parent `docs(status):` commit.
- 2026-11-26T07:05:45.128Z — Phase 0.4 Windows x64 host: 16 cores, 33,713,885,184 bytes RAM, 465,922,088,960 bytes free on C:, Node v26.7.0, npm 11.19.0, Python 3.14.2; Windows canonical path exists.
- 2026-11-26T07:05:45.128Z — Phase 0.5 fresh `s20-overnight-research` worktree created at `C:\Users\hudso\s20-overnight-store\aster-overnight`; `npm ci` succeeded; `npm run verify` passed 112/112 files, 371/371 tests, 0 failures, 0 load timeouts.
- 2026-11-26T07:05:45.128Z — Phase 0.7 store venv created with Python 3.12.10 and installed poliastro 0.17.0, numpy 1.26.4, astropy 5.3.4, scipy 1.17.1, numba 0.68.1 via uv.
- 2026-11-26T07:05:45.128Z — ON1, ON2, and ON3 evidence files were generated and committed; ON1 control B produced the required suite-observability HOLD; ON2 oracle self-tests passed and LR1 was measured as DIFFERS; ON3 identity differences were zero.
- 2026-11-26T07:05:45.128Z — ON4 coarse census launched from the recorded 41,906-body order with 15 workers; the live checkpoint remains outside the repo at `C:\Users\hudso\s20-overnight-store\on4`.
- 2026-11-26T07:24:40.835Z — The first ON4 attempt was stopped after diagnosis found two harness defects: Lambert debug restoration flooded inherited stderr, and the worker indexed the parsed order object instead of its `.order` array. No result rows from that attempt were retained; the seeded order and checkpoint location were preserved.
- 2026-11-26T07:24:40.835Z — ON4 rerun with both corrections completed `41906/41906` coarse bodies and the required `500/500` full-resolution control bodies. The Earth-GM recount changed zero screen cells.
- 2026-11-26T07:24:40.835Z — ON4 summary and three gzip body-table parts were generated; each part is below 10 MB. The full report remains to be committed last with this log.
- 2026-11-26T07:24:40.835Z — ON4 validation found one explicit catalog propagation refusal, `2015 D1` (`bodyIndex=7092`): `RangeError: aM must be > 0 for elliptical Kepler propagation`; all 41,906 body rows remain present.
