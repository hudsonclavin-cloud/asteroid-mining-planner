/**
 * Slice 13 launch-vehicle screening data and pure math.
 *
 * Vehicle payload curves are NASA LSP elvperf primary-source anchors (as-of 2024-02-29,
 * queried 2026-07-02). Curves interpolate only between sourced anchors; no extrapolation.
 * New Glenn keeps all five sourced anchors, including 120 kg at C3=30 km^2/s^2.
 * NG C3=21-29 interior optimistic (linear across steep segment); densification anchors
 * at C3=25/35 pending, oracle to quantify.
 *
 * DEC-13-4 double-count guard: deliveredMassKg intentionally has no injection field in
 * its input budget. Payload-at-C3 already includes the launch vehicle injection to C3.
 */

export interface LaunchVehicle {
  readonly name: string;
  readonly config: string;
  readonly site: string;
  readonly fairingM: number;
  readonly curve: ReadonlyArray<{ readonly c3: number; readonly payloadKg: number }>;
  readonly source: string;
  readonly asOf: string;
}

export type MissionMode = 'one-way' | 'sample-return';

export interface SpacecraftDvBudget {
  /** Rendezvous maneuver, m/s. For one-way missions this is |vInf_arr|. */
  readonly rendezvousMps: number;
  /** Generic stationkeeping allocation, m/s. Slice 13 uses 150 m/s. */
  readonly stationkeepingMps: number;
  /** ECSS-anchored deterministic margin, m/s. */
  readonly marginMps: number;
  /** Departure maneuver, m/s. Used only in sample-return mode. */
  readonly departureMps?: number;
}

export const BEYOND_CURVE = Object.freeze({ kind: 'beyond-curve' } as const);
export type BeyondCurve = typeof BEYOND_CURVE;
export type PayloadAtC3Result = number | BeyondCurve;

// Phase F audit MED-2: a corrupted ΔV budget is NOT a curve statement — returning
// BEYOND_CURVE for it would assert a falsehood under INV-023. Distinct sentinel,
// same frozen-singleton construction so arithmetic on it is a compile error.
export const INVALID_INPUT = Object.freeze({ kind: 'invalid-input' } as const);
export type InvalidInput = typeof INVALID_INPUT;
export type DeliveredMassResult = number | BeyondCurve | InvalidInput;

// DEC-13-5: representative of 300-350 s storable bipropellant class; disclosed per INV-016e.
export const SCREENING_ISP_S = 320;
// Exact standard gravity, m/s^2.
export const G0_MPS2 = 9.80665;

const ELVPERF_SOURCE = 'NASA LSP elvperf';
const ELVPERF_AS_OF = '2024-02-29';

export const LAUNCH_VEHICLES: ReadonlyArray<LaunchVehicle> = [
  {
    name: 'Falcon Heavy',
    config: 'Expendable',
    site: 'KSC',
    fairingM: 5.2,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 15010 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 10, payloadKg: 12345 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 20, payloadKg: 10115 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 30, payloadKg: 8225 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 40, payloadKg: 6640 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 55, payloadKg: 4670 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
  {
    name: 'Falcon Heavy',
    config: 'Recovery',
    site: 'KSC',
    fairingM: 5.2,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 6690 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 10, payloadKg: 5130 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 20, payloadKg: 3845 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 30, payloadKg: 2740 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 40, payloadKg: 1805 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 55, payloadKg: 650 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
  {
    name: 'Vulcan',
    config: 'VC2',
    site: 'CCSFS',
    fairingM: 5.4,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 5920 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 10, payloadKg: 4750 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 20, payloadKg: 3710 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 30, payloadKg: 2790 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 40, payloadKg: 1970 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 55, payloadKg: 945 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
  {
    name: 'Vulcan',
    config: 'VC4',
    site: 'CCSFS',
    fairingM: 5.4,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 8550 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 10, payloadKg: 7140 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 20, payloadKg: 5880 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 30, payloadKg: 4780 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 40, payloadKg: 3800 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 55, payloadKg: 2555 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
  {
    name: 'Vulcan',
    config: 'VC6',
    site: 'CCSFS',
    fairingM: 5.4,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 10850 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 10, payloadKg: 9130 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 20, payloadKg: 7630 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 30, payloadKg: 6310 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 40, payloadKg: 5150 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 55, payloadKg: 3685 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
  {
    name: 'New Glenn',
    config: 'Standard',
    site: 'CCSFS',
    fairingM: 7,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 7180 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 5, payloadKg: 6360 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-03 (Perplexity Computer, oracle-verified)
      { c3: 10, payloadKg: 4930 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 20, payloadKg: 2365 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 30, payloadKg: 120 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
  {
    name: 'Falcon 9 FT',
    config: 'ASDS',
    site: 'CCSFS',
    fairingM: 5.2,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 3310 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 10, payloadKg: 2220 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
  {
    name: 'Falcon 9 FT',
    config: 'RTLS',
    site: 'CCSFS',
    fairingM: 5.2,
    source: ELVPERF_SOURCE,
    asOf: ELVPERF_AS_OF,
    curve: [
      { c3: 0, payloadKg: 1770 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
      { c3: 10, payloadKg: 875 }, // NASA LSP elvperf, as-of 2024-02-29, queried 2026-07-02
    ],
  },
];

export function isBeyondCurve(value: PayloadAtC3Result | DeliveredMassResult): value is BeyondCurve {
  return value === BEYOND_CURVE;
}

export function isInvalidInput(value: DeliveredMassResult): value is InvalidInput {
  return value === INVALID_INPUT;
}

const isNonNegativeFinite = (value: number): boolean => Number.isFinite(value) && value >= 0;

export function deterministicMarginMps(...deterministicManeuversMps: readonly number[]): number {
  return deterministicManeuversMps.reduce((sum, maneuverMps) => sum + maneuverMps, 0) * 0.05;
}

export function payloadAtC3(vehicle: LaunchVehicle, c3: number): PayloadAtC3Result {
  if (!Number.isFinite(c3)) {
    return BEYOND_CURVE;
  }

  const first = vehicle.curve[0];
  const last = vehicle.curve[vehicle.curve.length - 1];
  if (!first || !last || c3 < first.c3 || c3 > last.c3) {
    // C3 < 0 is impossible in the grid; treat it as outside the published curve
    // instead of inventing an extrapolated payload below the first anchor.
    return BEYOND_CURVE;
  }

  for (const point of vehicle.curve) {
    if (c3 === point.c3) {
      return point.payloadKg;
    }
  }

  for (let index = 0; index < vehicle.curve.length - 1; index += 1) {
    const left = vehicle.curve[index];
    const right = vehicle.curve[index + 1];
    if (left.c3 < c3 && c3 < right.c3) {
      const t = (c3 - left.c3) / (right.c3 - left.c3);
      return left.payloadKg + t * (right.payloadKg - left.payloadKg);
    }
  }

  return BEYOND_CURVE;
}

export function deliveredMassKg(
  vehicle: LaunchVehicle,
  c3: number,
  budget: SpacecraftDvBudget,
  mode: MissionMode = 'one-way',
): DeliveredMassResult {
  // Curve check stays FIRST: the beyond-curve short-circuit reads zero budget
  // properties (audit-verified order; a beyond-curve verdict is true regardless
  // of budget validity).
  const payloadKg = payloadAtC3(vehicle, c3);
  if (isBeyondCurve(payloadKg)) {
    return BEYOND_CURVE;
  }

  // Input hardening (Phase F audit MED-2): reject unknown modes, sample-return
  // without a departure line, and any NaN/±Infinity/negative budget component —
  // INVALID_INPUT, never BEYOND_CURVE (INV-023) and never a fabricated number
  // (a negative Δv would silently AMPLIFY mass through exp()).
  // NOTE: marginMps must be assembled for the same mode passed here (see
  // deterministicMarginMps) — a mismatched margin base is arithmetically
  // undetectable at this boundary and remains the caller's contract.
  if (mode !== 'one-way' && mode !== 'sample-return') {
    return INVALID_INPUT;
  }
  if (mode === 'sample-return' && budget.departureMps === undefined) {
    return INVALID_INPUT;
  }
  if (
    !isNonNegativeFinite(budget.rendezvousMps) ||
    !isNonNegativeFinite(budget.stationkeepingMps) ||
    !isNonNegativeFinite(budget.marginMps) ||
    (budget.departureMps !== undefined && !isNonNegativeFinite(budget.departureMps))
  ) {
    return INVALID_INPUT;
  }

  const departureMps = mode === 'sample-return' ? (budget.departureMps ?? 0) : 0;
  const dvSpacecraftMps =
    budget.rendezvousMps + budget.stationkeepingMps + budget.marginMps + departureMps;

  if (!Number.isFinite(dvSpacecraftMps)) {
    return INVALID_INPUT;
  }

  return payloadKg * Math.exp(-dvSpacecraftMps / (G0_MPS2 * SCREENING_ISP_S));
}
