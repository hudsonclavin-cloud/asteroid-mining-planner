/**
 * Edelbaum circular-to-circular low-thrust estimate (coplanar form).
 *
 * Honesty layer — fidelity statement:
 *   Screening-grade analytic estimate. Assumes continuous tangential thrust at
 *   constant acceleration, circular coplanar orbits, no eclipses, no mass flow,
 *   no plane change. Not a trajectory: it yields a ΔV and a time of flight,
 *   never a path. Reference form: Edelbaum (1961), coplanar case Δi = 0, where
 *   ΔV = |V0 − V1| with V = sqrt(μ / r) the circular speed at each radius, and
 *   time of flight = ΔV / a for constant acceleration a.
 *   Bias of that last relation: with a taken as F / m0 (initial mass), ΔV / a is
 *   an UPPER bound on the constant-thrust time of flight; the mass-flow value is
 *   (m0 · ve / F) · (1 − exp(−ΔV / ve)), roughly 9 % lower for Isp 3000 s and
 *   ΔV ≈ 5.5 km/s. Solar-power throttling with heliocentric distance (listed in
 *   types.ts) is likewise not modelled here.
 *
 * Math-layer code: flag-gated OFF (src/v2/flags.ts LOW_THRUST_ENABLED) and must
 * pass the multi-agent audit before any slice enables it. Nothing in src/v2/app
 * imports this module.
 */

export interface EdelbaumTransferInput {
  /** Central-body gravitational parameter, m³/s². */
  readonly muM3S2: number;
  /** Initial circular orbit radius, metres. */
  readonly r0M: number;
  /** Final circular orbit radius, metres. */
  readonly r1M: number;
  /** Constant thrust acceleration, m/s². */
  readonly accelerationMps2: number;
}

export interface EdelbaumTransfer {
  readonly deltaVMps: number;
  readonly timeOfFlightSeconds: number;
  /** Circular speed at r0, m/s. */
  readonly v0Mps: number;
  /** Circular speed at r1, m/s. */
  readonly v1Mps: number;
  readonly fidelity: 'screening-analytic-edelbaum-coplanar';
}

/** Circular orbital speed sqrt(μ / r), m/s. */
export function circularSpeedMps(muM3S2: number, radiusM: number): number {
  assertFinitePositive(muM3S2, 'muM3S2');
  assertFinitePositive(radiusM, 'radiusM');
  return Math.sqrt(muM3S2 / radiusM);
}

/** Coplanar Edelbaum ΔV between two circular orbits: |sqrt(μ/r0) − sqrt(μ/r1)|, m/s. */
export function edelbaumCoplanarDeltaVMps(muM3S2: number, r0M: number, r1M: number): number {
  return Math.abs(circularSpeedMps(muM3S2, r0M) - circularSpeedMps(muM3S2, r1M));
}

/** Time of flight for constant acceleration: ΔV / a, seconds. */
export function edelbaumTimeOfFlightSeconds(deltaVMps: number, accelerationMps2: number): number {
  if (!Number.isFinite(deltaVMps) || deltaVMps < 0) {
    throw new TypeError(`deltaVMps must be a finite non-negative number, got ${String(deltaVMps)}`);
  }
  assertFinitePositive(accelerationMps2, 'accelerationMps2');
  return deltaVMps / accelerationMps2;
}

/** Full coplanar transfer summary. Pure; throws TypeError on invalid input. */
export function edelbaumCircularTransfer(input: EdelbaumTransferInput): EdelbaumTransfer {
  const v0Mps = circularSpeedMps(input.muM3S2, input.r0M);
  const v1Mps = circularSpeedMps(input.muM3S2, input.r1M);
  const deltaVMps = Math.abs(v0Mps - v1Mps);
  return {
    deltaVMps,
    timeOfFlightSeconds: edelbaumTimeOfFlightSeconds(deltaVMps, input.accelerationMps2),
    v0Mps,
    v1Mps,
    fidelity: 'screening-analytic-edelbaum-coplanar',
  };
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${label} must be a finite positive number, got ${String(value)}`);
  }
}
