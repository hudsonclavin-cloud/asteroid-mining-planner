// Front C full disclosure strings (Slice 18 close-out, Item 5; DEC-18-8).
//
// The sentences are VERBATIM from the close-out dispatch. Every bracketed
// value is filled from the committed tier artifact
// (tools/slice18-research/tier-sizing-per-body.json, served as
// tier-sizing-per-body.json) and from nothing else. Where a value is absent
// the builder returns null and the caller falls back to the tier's legend
// line — a missing number is omitted, never invented (hard stop 6).
//
// Pure module: no app/ or view imports. The L0 hyperbolic sentence is the
// Item 1 propagation-guard sentence, reused rather than retyped.

import type { FidelityTier, TierAssignment } from '../boundary/tier-assignments.js';
import { propagationRefusalMessage } from './propagation-guard.js';

/** Verbatim. Must accompany every place 10^6 km is named. */
export const THRESHOLD_PROVENANCE =
  '10^6 km is the drift at which the optimal transfer window was measured to move (3 of 15 tested cells); ' +
  'at 10^5 km, none moved. The number of objects above this threshold depends on the close-approach data ' +
  'snapshot and is not fixed.';

/** What makes a body L1, in one sentence — names 10^6 km, so the provenance rides with it. */
export const L1_CRITERION =
  "Tier L1 is assigned when the encounter's estimated deflection, carried to the end of the screening " +
  `window, adds at least 10^6 km of drift. ${THRESHOLD_PROVENANCE}`;

export const L2_UNMEASURED_DISCLOSURE =
  'Aster has not measured the screening error for this object. Two-body propagation over the screening ' +
  'window drifted 0.46 to 330 million km across the 17 asteroids that were measured. This object was not among them.';

const MONTHS: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
  JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

/**
 * 'YYYY-MON-DD …' (Horizons TDB termination, e.g. '2018-JUN-02 17:01:09.1849 TDB')
 * or 'YYYY-Mon-DD hh:mm' (CAD `cd`) → 'YYYY-MM-DD'. Null when the text is not that shape.
 */
export function formatDisclosureDate(text: string): string | null {
  const match = /^(\d{4})-([A-Za-z]{3})-(\d{2})\b/.exec(text.trim());
  if (match === null) {
    return null;
  }
  const month = MONTHS[match[2].toUpperCase()];
  return month === undefined ? null : `${match[1]}-${month}-${match[3]}`;
}

/** 253342299.89 → '253 million' (3 significant figures). */
export function formatMillionKm(km: number): string | null {
  if (!Number.isFinite(km) || km <= 0) {
    return null;
  }
  const millions = Number((km / 1e6).toPrecision(3));
  return `${millions} million`;
}

/** 2.7757 km/s → '2,776'; 0.0065 km/s → '6.5'. Integer with grouping at ≥ 100 m/s, else 1 decimal. */
export function formatMetersPerSecond(dvKmS: number): string | null {
  if (!Number.isFinite(dvKmS) || dvKmS < 0) {
    return null;
  }
  const mps = dvKmS * 1000;
  if (mps >= 100) {
    return Math.round(mps).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return mps.toFixed(1);
}

export function formatAu(au: number): string | null {
  return Number.isFinite(au) ? au.toFixed(2) : null;
}

/**
 * The full disclosure sentence for one body, verbatim, or null when the value
 * it needs is not in the committed record.
 */
export function fullTierDisclosure(tier: TierAssignment): string | null {
  switch (tier.subReason) {
    case 'verified-destroyed-ephemeris-termination': {
      const date = tier.terminationTdb === undefined ? null : formatDisclosureDate(tier.terminationTdb);
      return date === null
        ? null
        : `This object no longer exists. Its JPL ephemeris terminates ${date} at a verified Earth impact. ` +
            'The transfer windows below are computed from its last known orbit and describe a mission to nothing.';
    }
    case 'historically-destroyed-disintegration': {
      const drift = tier.firstDayDriftKm === undefined ? null : formatMillionKm(tier.firstDayDriftKm);
      return drift === null
        ? null
        : 'This object no longer exists. Comet 3D/Biela disintegrated in the 1840s-50s. That is historical record, ' +
            `not ephemeris-verified. The transfer windows below are computed from 1832 elements and are ${drift} km ` +
            "wrong on the window's first day.";
    }
    case 'cannot-propagate-hyperbolic-orbit':
      return tier.e === undefined ? null : propagationRefusalMessage(tier.e);
    case 'materially-degraded-delta-v': {
      const encounter = tier.encounter;
      if (encounter === undefined) {
        return null;
      }
      const date = formatDisclosureDate(encounter.cd);
      const dv = formatMetersPerSecond(encounter.dvKmS);
      return date === null || dv === null
        ? null
        : `Screening for this object is supported through ${date}. A close approach to ${encounter.body} on that ` +
            `date changes its orbit by an estimated ${dv} m/s. Arrivals after it are computed from an orbit the ` +
            'encounter invalidates.';
    }
    case 'structurally-blind-comet':
    case 'structurally-blind-jupiter-crossing': {
      const reach = tier.Q === undefined ? null : formatAu(tier.Q);
      return reach === null
        ? null
        : `Aster cannot bound the screening error for this object. Its orbit reaches ${reach} AU, and the ` +
            'close-approach data Aster uses does not cover encounters beyond 0.28 AU from Jupiter.';
    }
    case 'unmeasured':
      return L2_UNMEASURED_DISCLOSURE;
    default:
      return null;
  }
}

/** Short visible label for a compact cell; the full sentence goes on hover. */
export function shortTierLabel(tier: TierAssignment): string {
  switch (tier.subReason) {
    case 'verified-destroyed-ephemeris-termination':
    case 'historically-destroyed-disintegration':
      return 'no longer exists';
    case 'cannot-propagate-hyperbolic-orbit':
      return 'cannot propagate';
    case 'materially-degraded-delta-v': {
      const date = tier.encounter === undefined ? null : formatDisclosureDate(tier.encounter.cd);
      return date === null ? 'supported until a dated encounter' : `supported through ${date}`;
    }
    case 'structurally-blind-comet':
    case 'structurally-blind-jupiter-crossing':
      return 'error cannot be bounded';
    case 'unmeasured':
      return 'error not measured';
    default:
      return 'unclassified';
  }
}

export type TierLegendKey = FidelityTier | 'PROP FAIL';

export interface TierLegendEntry {
  readonly key: TierLegendKey;
  /** One line, short enough for a 320 px sidebar. */
  readonly line: string;
  /** The long form, for hover. */
  readonly title: string;
}

export const TIER_LEGEND: readonly TierLegendEntry[] = [
  {
    key: 'L0',
    line: 'no longer exists or cannot be propagated',
    title:
      'L0 — the object does not exist (verified Earth impact or historical disintegration) or its orbit ' +
      'cannot be propagated (hyperbolic). Any transfer window shown describes a mission to nothing.',
  },
  {
    key: 'L1',
    line: 'supported only until a dated close approach',
    title:
      'L1 — a dated close approach changes the orbit enough that arrivals after it are computed from an ' +
      `orbit the encounter invalidates. ${L1_CRITERION}`,
  },
  {
    key: 'L2',
    line: 'screening error unbounded or unmeasured',
    title:
      'L2 — Aster cannot bound the screening error (comets, and orbits reaching beyond the 0.28 AU from ' +
      'Jupiter that the close-approach data covers) or has not measured it (two-body propagation drifted ' +
      '0.46 to 330 million km across the 17 asteroids that were measured).',
  },
  {
    key: 'PROP FAIL',
    line: 'propagator rejected the orbit; nothing computed',
    title:
      'PROP FAIL — the Kepler propagator refuses this orbit (it is not elliptical), so no Lambert screen ' +
      'was computed and no departure C3 exists.',
  },
];

export function legendLineFor(tier: FidelityTier): string {
  const entry = TIER_LEGEND.find((candidate) => candidate.key === tier);
  return entry === undefined ? tier : `${entry.key} — ${entry.line}`;
}
