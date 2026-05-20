# Slice 9 Phase B Browser Perf Page

Dev-only observational WebGL measurement page for the Slice 9 Phase B contract.

Run:

```bash
npm run dev
```

Open:

```text
/tools/slice9-perf/
```

What it measures:
- Uniform `0.5 AU` vs hybrid `D=200 / 500 / 1000`
- Four committed camera states:
  - full-system overview
  - near-Earth focus
  - single-asteroid close focus
  - mid-zoom transit
- Main-thread propagation vs browser Worker propagation
- Rolling frame-time median / p95 / FPS on real hardware

What it does not do:
- no autonomous pass/fail
- no frame-budget assertions in tests
- no uniform-vs-hybrid decision
- no main-vs-worker decision

Suggested measurement protocol:
1. Run the 4 x 4 main-thread matrix first.
2. Repeat the same matrix with Worker propagation enabled.
3. Use `Log Result` after the rolling window stabilizes.
4. Use `Copy Session Log` to paste the full set of observational numbers back into chat.

Notes:
- The page reuses the committed Slice 9 partition implementations.
- The live production fixture remains read-only.
- The page is not part of the production bundle; it is served by Vite in development only.
