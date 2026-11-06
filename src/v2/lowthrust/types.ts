/**
 * Low-thrust data shapes (ion engines only; no solar sails — Hudson, Sep 2026).
 *
 * Honesty layer: these are DATA SHAPES, not a propagator. Nothing here computes
 * a trajectory. A LowThrustLeg is the record a future colour-coded thrust/coast
 * arc renderer will consume; until a slice wires it, no page reads this module.
 * Not modelled anywhere in this module: eclipses, power throttling with
 * heliocentric distance, mass flow, plane change, gravity assists.
 */

/** An electric engine described by its steady-state performance. */
export interface LowThrustEngine {
  readonly name: string;
  /** Thrust, newtons. */
  readonly thrustN: number;
  /** Specific impulse, seconds. */
  readonly ispS: number;
  /** Input power, watts. */
  readonly powerW: number;
}

/** Direction law for a thrust segment. */
export type ThrustDirection = 'tangential' | 'custom';

/** One continuous thrust (throttle > 0) or coast (throttle = 0) interval. */
export interface ThrustSegment {
  /** Segment start, Julian Date (TDB). */
  readonly startJD: number;
  /** Segment end, Julian Date (TDB). */
  readonly endJD: number;
  /** Throttle fraction in [0, 1]; 0 is a coast arc. */
  readonly throttle: number;
  readonly direction: ThrustDirection;
  /**
   * Unit thrust direction when direction === 'custom', in the leg's frame.
   * Undefined for 'tangential'.
   */
  readonly vector?: readonly [number, number, number];
}

/** A low-thrust leg from departure to arrival as a sequence of segments. */
export interface LowThrustLeg {
  /** Departure epoch, Julian Date (TDB). */
  readonly departJD: number;
  /** Arrival epoch, Julian Date (TDB). */
  readonly arriveJD: number;
  readonly segments: readonly ThrustSegment[];
}

/** Standard gravity used for Isp ↔ exhaust-velocity conversion, m/s². */
export const STANDARD_GRAVITY_MPS2 = 9.80665;

/** Exhaust velocity for an engine, m/s: Isp × g0. */
export function exhaustVelocityMps(engine: LowThrustEngine): number {
  assertFinitePositive(engine.ispS, 'engine.ispS');
  return engine.ispS * STANDARD_GRAVITY_MPS2;
}

/** Thrust acceleration at a given total mass, m/s². */
export function thrustAccelerationMps2(engine: LowThrustEngine, massKg: number): number {
  assertFinitePositive(engine.thrustN, 'engine.thrustN');
  assertFinitePositive(massKg, 'massKg');
  return engine.thrustN / massKg;
}

/**
 * Structural validity of a leg: finite, ordered epochs; every segment inside
 * the leg, ordered, with throttle in [0, 1]; a 'custom' segment carries a
 * finite vector. Returns the first violation as text, or null when valid.
 */
export function validateLowThrustLeg(leg: LowThrustLeg): string | null {
  if (!Number.isFinite(leg.departJD) || !Number.isFinite(leg.arriveJD)) {
    return 'departJD and arriveJD must be finite';
  }
  if (!(leg.departJD < leg.arriveJD)) {
    return 'departJD must precede arriveJD';
  }
  let previousEnd = leg.departJD;
  for (let index = 0; index < leg.segments.length; index += 1) {
    const segment = leg.segments[index];
    if (!Number.isFinite(segment.startJD) || !Number.isFinite(segment.endJD)) {
      return `segment ${index}: startJD and endJD must be finite`;
    }
    if (segment.startJD < previousEnd) {
      return `segment ${index}: starts before the previous segment ends`;
    }
    if (!(segment.startJD < segment.endJD)) {
      return `segment ${index}: startJD must precede endJD`;
    }
    if (segment.endJD > leg.arriveJD) {
      return `segment ${index}: ends after the leg arrives`;
    }
    if (!Number.isFinite(segment.throttle) || segment.throttle < 0 || segment.throttle > 1) {
      return `segment ${index}: throttle must be within [0, 1]`;
    }
    if (segment.direction === 'custom') {
      const vector = segment.vector;
      if (!vector || vector.length !== 3 || !vector.every((component) => Number.isFinite(component))) {
        return `segment ${index}: a custom direction needs a finite 3-vector`;
      }
    }
    previousEnd = segment.endJD;
  }
  return null;
}

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${label} must be a finite positive number, got ${String(value)}`);
  }
}
