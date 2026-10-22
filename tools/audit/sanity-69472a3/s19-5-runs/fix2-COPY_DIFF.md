# G0 AMBER copy diff

Before:

```text
Dogleg regime (this cell): AMBER — plane-matching from ${siteName} is handled by launch geometry (launch-geometry class; below screening error bars); zero added ΔV, disclosed rather than fabricated.
```

After:

```text
Dogleg regime (this cell): AMBER — plane-matching from ${siteName} is absorbed by launch geometry, below screening error bars; zero added ΔV, disclosed rather than fabricated.
```

Proof: with the expected text updated and the source still at the Before wording,
`node --test --test-timeout=120000 tests/v2-dla-display.test.mjs` failed at
`tests/v2-dla-display.test.mjs:23:10` (`G0_PREFIX_EXIT=1`). After the source fix,
the same test passed 2/2 (`G0_POSTFIX_EXIT=0`).
