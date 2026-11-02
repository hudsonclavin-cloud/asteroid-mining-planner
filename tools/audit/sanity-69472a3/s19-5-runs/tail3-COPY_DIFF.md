# S19.5 Tail 3 copy diff

## G1 — margin-base explanation

Before: no explanatory sentence was rendered after the cost-card injection disclosure.

After: `Margin here is 5% of rendezvous and departure ΔV; the ΔV stack below applies 10% to the full stack.`

Before: no explanatory sentence was rendered after the ΔV-stack assumptions line.

After: `Margin here is 10% of the full stack; the cost card applies 5% to rendezvous and departure ΔV only.`

The displayed percentages are derived from `DETERMINISTIC_MARGIN_FRACTION` and `DV_MARGIN_FRACTION` in the production source and are tested through the compiled modules.

## G2 — RED payload-at-C3 caption

Before: the RED card showed the payload-at-C3 figure without a figure-specific caption.

After on RED only: `Vehicle payload at this C3, before any dogleg or launch-site penalty. Not a delivered-mass estimate.`

AMBER and GREEN remain without that caption. The existing RED verdict remains: `no delivered-mass number is honest at screening fidelity.`

## G3 — outside-coverage scrubbed status

Before outside coverage: `SCRUBBED — press Shift+N for now`

After outside coverage: `SCRUBBED — live time is outside this view's ephemeris coverage; Shift+N will jump to the end of coverage (live time is outside it)` for past coverage, or the corresponding start-of-coverage text before coverage.

Inside coverage remains: `SCRUBBED — press Shift+N for now`.
