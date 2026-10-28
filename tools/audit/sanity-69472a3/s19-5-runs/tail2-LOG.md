# S19.5 tail 2 log (reconstructed from the session, 2026-10-28)

- Phase 0 attempt 1: origin/main eb8afe4 did not contain 15931e8 (restore PR not yet merged) -> GLOBAL STOP (a), nothing changed. Hudson merged PR #3; origin/main 1fce2fc contains 15931e8.
- Phase 0: pwd, remote OK; main == origin/main 1fce2fc; 15931e8 is an ancestor; tree clean; stash@{0} left alone. Tag s19-5-pre-tail2; branch s19-5-tail2.
- Baseline `npm run verify`: 351 passed / 0 failed, accounting 106 == 106 + 0 + 0, 601.8 s (baseline.txt).
- Method: one full verify takes ~10 min, so each item ran its targeted test files (node --test <files>) and `npm run typecheck:v2`; the full verify ran once on the final tip, before the build.
- F1+F2 aeef9ae: render test + display test updated; fix undone -> 2 failing ("The input did not match ... zero added" in both); fix restored -> pass. F1 and F2 shipped in one commit (shared test file) - deviation from 1 commit each.
- F3 4c79fc0: attribute-sweep test; fix undone -> "attribute leaks a storage key: Restores FK3 ... First-visit flag: aster.fk3TourSeen"; restored -> pass.
- F4 e2bca8f: new footer test; fix undone -> fail; restored -> pass.
- F5 d5d9b8d: cause = Vandenberg dlaCeilingDeg 90 (core data), by design; line reworded. fix undone -> "did not match /max direct declination \(ceiling\): none from Vandenberg SFB/".
- F6 69d6481: ephemeris-status test; fix undone -> assertion failure; restored -> 6/6.
- F7 1641ddd: about render test + compare breadth test; fix undone -> emoji regexp assertion and breadth regexp failed; restored -> pass.
- Tooling note: the shell tool decodes \uXXXX and \n in my command text, which broke two edit scripts; fixed with chr() and the Edit tool. No repo damage.
- Recons R1-R4 written to RECONS.md, read-only.
