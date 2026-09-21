// Propagation guard (Slice 18 close-out, Item 1).
//
// A NON-SOLVER predicate that answers one question before any grid is
// requested: would the Kepler propagator accept these elements at all? It
// mirrors — check for check, in the same order — the precondition the
// propagator enforces in src/v2/core/propagators/keplerian.ts
// (validateKeplerianElements): every element finite, aM > 0, 0 <= e < 1.
// The propagator THROWS RangeError on a violation; that throw took the whole
// compare page down and left the porkchop surfaces with a raw error for
// 2015 D1 (e = 1.0035, the catalog's one hyperbolic body — the L0
// `cannot-propagate-hyperbolic-orbit` tier). The surfaces need a VALUE to
// render, not an exception to catch, so they ask here first.
//
// This module must stay in lock-step with the propagator's precondition. The
// colocated test proves agreement by a different method: it propagates every
// catalog body and asserts "propagator threw" ⇔ "guard refused".
//
// Pure module: no app/ or view imports.

import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';

export type PropagationRefusalReason =
  | 'non-finite-element'
  | 'non-positive-semi-major-axis'
  | 'eccentricity-not-elliptical';

export type PropagationVerdict =
  | { readonly propagatable: true }
  | {
      readonly propagatable: false;
      readonly reason: PropagationRefusalReason;
      /** The catalog eccentricity, unrounded. */
      readonly eccentricity: number;
      /** User-facing sentence. Surfaces render THIS, verbatim. */
      readonly message: string;
    };

/** Decimal places shown for the eccentricity in the refusal message. Matches
 * the rounding the S18 tier artifact records for the same value (1.0035). */
const ECCENTRICITY_DISPLAY_DECIMALS = 4;

export function formatEccentricityForRefusal(e: number): string {
  return Number.isFinite(e) ? e.toFixed(ECCENTRICITY_DISPLAY_DECIMALS) : String(e);
}

/**
 * The refusal sentence, verbatim per the S18 close-out dispatch. The
 * eccentricity is the physically meaningful fact for a hyperbolic body, so it
 * is the one the sentence names even when an earlier check (aM <= 0) is what
 * the propagator itself would trip on — for a hyperbolic orbit both hold.
 */
export function propagationRefusalMessage(e: number): string {
  return (
    `Aster cannot propagate this object. Its eccentricity is ${formatEccentricityForRefusal(e)}, ` +
    'which is not an elliptical orbit. No transfer windows are computed.'
  );
}

const FINITE_CHECK_ORDER: readonly (keyof AsteroidOrbitalElements)[] = [
  'aM',
  'e',
  'iRad',
  'omRad',
  'wRad',
  'maRad',
  'epochTdbSeconds',
];

/**
 * Same checks, same order, as keplerian.ts validateKeplerianElements. Returns
 * a verdict instead of throwing.
 */
export function assessPropagation(elements: AsteroidOrbitalElements): PropagationVerdict {
  for (const key of FINITE_CHECK_ORDER) {
    if (!Number.isFinite(elements[key])) {
      return refuse('non-finite-element', elements.e);
    }
  }
  if (elements.aM <= 0) {
    return refuse('non-positive-semi-major-axis', elements.e);
  }
  if (elements.e < 0 || elements.e >= 1) {
    return refuse('eccentricity-not-elliptical', elements.e);
  }
  return { propagatable: true };
}

function refuse(reason: PropagationRefusalReason, eccentricity: number): PropagationVerdict {
  return {
    propagatable: false,
    reason,
    eccentricity,
    message: propagationRefusalMessage(eccentricity),
  };
}
