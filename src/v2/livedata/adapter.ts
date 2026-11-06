/**
 * Live-data adapter interface: a source of orbital elements by designation.
 *
 * Honesty layer: every result carries `asOf` (the epoch or fetch date the
 * elements are good for) and `source` (where they came from), so a consumer
 * can never show an element set without saying how old it is and whose it is.
 * Flag-gated OFF (src/v2/flags.ts LIVE_DATA_ENABLED); nothing in src/v2/app
 * imports this module. The element type is the repo's existing
 * AsteroidOrbitalElements — not redefined here.
 */
import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';

export type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';

/** Orbital elements plus the provenance the honesty layer requires. */
export interface SourcedOrbitalElements extends AsteroidOrbitalElements {
  /** ISO-8601 date the elements are good for (element epoch or fetch date), stated by the source. */
  readonly asOf: string;
  /** Human-readable origin, e.g. "committed fixture" or "JPL SBDB Query API". */
  readonly source: string;
  /** Frame id the angular elements are expressed in, as the source states it. */
  readonly elementsFrame: string;
}

export interface OrbitSource {
  readonly id: string;
  fetchElements(designation: string): Promise<SourcedOrbitalElements>;
}

export type OrbitSourceErrorKind = 'not-found' | 'timeout' | 'network' | 'malformed';

/** Typed failure: refusal-as-result at the adapter boundary, never a bare rejection. */
export class OrbitSourceError extends Error {
  readonly kind: OrbitSourceErrorKind;
  readonly sourceId: string;
  readonly designation: string;

  constructor(kind: OrbitSourceErrorKind, sourceId: string, designation: string, message: string) {
    super(`${sourceId}: ${message} (designation ${designation})`);
    this.name = 'OrbitSourceError';
    this.kind = kind;
    this.sourceId = sourceId;
    this.designation = designation;
  }
}
