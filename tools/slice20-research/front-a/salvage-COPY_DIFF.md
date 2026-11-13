# Slice 20 Front A salvage COPY_DIFF

## CS-1 — AMBER copy

```text
- the launch-site payload penalty is NOT modelled
+ the launch-site payload penalty is not modelled
- Aster does not model that penalty yet.
+ Aster does not model that penalty.
```

Commit `9ebe7a3`.

## CT-1 — compare mass cell

The compare mass cell is now data-owned and renders the selected delivered
mass, its ΔV budget, and the selected-C3 payload lookup with its interpolation
bracket:

```text
800 kg delivered after 1.20 km/s ΔV budget
launch payload at C3 5.00 km²/s²: 750 kg, interpolated between C3 0.00 km²/s² at 1,000 kg and C3 10.0 km²/s² at 500 kg (official-published curve)
```

The result supplies `payloadAtC3`, and the compare echo supplies
`dvBudgetMps`; the UI does not calculate payload or mass. Commit `d451db3`.

## CT-5 — visible slugs

Visible asteroid IDs were removed from the porkchop and compare copy. Internal
IDs remain available for URLs and React keys, and render tests assert that
visible text does not match `/asteroid-[0-9A-Z]/`. Commit `15d89e0`.

## CT-7 — live timing

The compare method badge now reports measured solver time from the existing
injected clock path, with the existing refusal copy when timing is unavailable.
The injected-clock proof measured 30 ms and the rendered badge reported it.
Commit `b1a2a2a`.

## Mutation summary

All four requested changes have mutation proofs: forbidden AMBER copy failed
the focused DLA test; null payload data failed compare-data assertions; the
timing refusal formatter failed W3b and T7; and restored visible slugs failed
W3a and DLA render assertions.
