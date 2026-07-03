# Slice 13 Phase B - Oracle Report (DEC-13-7)

**Date:** 2026-07-03
**Source:** NASA LSP elvperf held-out queries at C3 = 15, 25, 35, 50 km^2/s^2
**Transcription:** values read from oracle screenshots by Nova (chat) directly from uploaded images
**Method:** piecewise-linear payloadAtC3() vs actual elvperf output
**Tool version:** launch-vehicles.ts at commit 7180593
**Tolerance:** STRICT points <= 5% (pass/fail); OBSERVED points measured, not gated

---

## Per-point error table

| C3 | Vehicle | Actual (kg) | Interpolated (kg) | Error % | Class | Notes |
|----|---------|-------------|-------------------|---------|-------|-------|
| 15 | Falcon Heavy Expendable | 11190 | 11230.0 | +0.36% | STRICT | |
| 15 | Falcon Heavy Recovery | 4465 | 4487.5 | +0.50% | STRICT | |
| 15 | Vulcan VC2 | 4210 | 4230.0 | +0.48% | STRICT | |
| 15 | Vulcan VC4 | 6490 | 6510.0 | +0.31% | STRICT | |
| 15 | Vulcan VC6 | 8340 | 8380.0 | +0.48% | STRICT | |
| 15 | New Glenn | 3605 | 3647.5 | +1.18% | STRICT | Interior segment, not steep |
| 15 | Falcon 9 FT ASDS | - | BEYOND_CURVE | - | - | Confirmed absent from table |
| 15 | Falcon 9 FT RTLS | - | BEYOND_CURVE | - | - | Confirmed absent from table |
| 25 | Falcon Heavy Expendable | 9130 | 9170.0 | +0.44% | STRICT | |
| 25 | Falcon Heavy Recovery | 3270 | 3292.5 | +0.69% | STRICT | |
| 25 | Vulcan VC2 | 3230 | 3250.0 | +0.62% | STRICT | |
| 25 | Vulcan VC4 | 5320 | 5330.0 | +0.19% | STRICT | |
| 25 | Vulcan VC6 | 6950 | 6970.0 | +0.29% | STRICT | |
| 25 | New Glenn | 1205 | 1242.5 | +3.11% | OBSERVED | Steep final segment (2365->120); disclosed optimism |
| 25 | Falcon 9 FT ASDS | - | BEYOND_CURVE | - | - | Confirmed absent |
| 25 | Falcon 9 FT RTLS | - | BEYOND_CURVE | - | - | Confirmed absent |
| 35 | Falcon Heavy Expendable | 7400 | 7432.5 | +0.44% | STRICT | |
| 35 | Falcon Heavy Recovery | 2255 | 2272.5 | +0.78% | STRICT | |
| 35 | Vulcan VC2 | 2370 | 2380.0 | +0.42% | STRICT | |
| 35 | Vulcan VC4 | 4270 | 4290.0 | +0.47% | STRICT | |
| 35 | Vulcan VC6 | 5710 | 5730.0 | +0.35% | STRICT | |
| 35 | New Glenn | - | BEYOND_CURVE | - | - | Confirmed absent; INV-023 past C3=30 OK |
| 35 | Falcon 9 FT ASDS | - | BEYOND_CURVE | - | - | Confirmed absent |
| 35 | Falcon 9 FT RTLS | - | BEYOND_CURVE | - | - | Confirmed absent |
| 50 | Falcon Heavy Expendable | 5280 | 5326.7 | +0.88% | OBSERVED | Final anchor segment (40->55) |
| 50 | Falcon Heavy Recovery | 1005 | 1035.0 | +2.99% | OBSERVED | Final anchor segment (40->55) |
| 50 | Vulcan VC2 | 1260 | 1286.7 | +2.12% | OBSERVED | Final anchor segment (40->55) |
| 50 | Vulcan VC4 | 2940 | 2970.0 | +1.02% | OBSERVED | Final anchor segment (40->55) |
| 50 | Vulcan VC6 | 4120 | 4173.3 | +1.29% | OBSERVED | Final anchor segment (40->55) |
| 50 | New Glenn | - | BEYOND_CURVE | - | - | Confirmed absent |
| 50 | Falcon 9 FT ASDS | - | BEYOND_CURVE | - | - | Confirmed absent |
| 50 | Falcon 9 FT RTLS | - | BEYOND_CURVE | - | - | Confirmed absent |

---

## STRICT verdict: PASS

- **Max |error|:** 1.18% (New Glenn @ C3=15)
- **RMS |error|:** 0.55%
- **Threshold:** 5.0%
- **Result: PASS** - interpolation math is correct across all well-behaved segments

---

## OBSERVED summary (disclosed optimism, not gated)

- **Max |error|:** 3.11% (New Glenn @ C3=25)
- **RMS |error|:** 2.10% (across all observed points)
- **New Glenn C3=25 specifically:** interpolator returns 1242.5 kg; actual tool value 1205 kg; overestimates by 3.11%

**Honesty-layer disclosure text (for Phase C/D INV-016e):**
> "New Glenn payload between C3=20 and C3=30 is linearly interpolated across a steep final segment and may overestimate actual capability by up to ~3%. All other vehicles interpolate within 3% of NASA LSP published values."

---

## BeyondCurve / absent findings: all CORRECT

All vehicles absent from a screenshot also return BEYOND_CURVE from the interpolator. No mismatches:
- F9 ASDS/RTLS absent at C3=15 - correct; curves end at C3=10
- New Glenn absent at C3=35 and C3=50 - correct; INV-023 applies past C3=30 OK
- All short-curve vehicles absent at C3=50 - correct

No case of interpolator returning a value when the tool showed nothing, or vice versa.

---

## Systematic error sign

All 22 non-absent comparisons are positive (interpolated > actual). This is the expected direction for piecewise-linear interpolation on convex payload-vs-C3 curves - the straight line between two anchors sits above the true convex curve interior. Not a defect; the known systematic bias of the method, disclosed per INV-016e.

---

## Curve-end behavior confirmed

| Vehicle | Last anchor C3 | Absent from C3= | Consistent? |
|---------|---------------|-----------------|-------------|
| Falcon 9 FT ASDS | 10 | 15, 25, 35, 50 | yes |
| Falcon 9 FT RTLS | 10 | 15, 25, 35, 50 | yes |
| New Glenn | 30 | 35, 50 | yes |
| All Vulcan/FH | 55 | none in oracle range | yes |
