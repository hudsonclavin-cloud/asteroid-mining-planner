import type { LambertScreenCacheMetadata } from './lambert-screen-cache.js';

export interface CachedC3Grid {
  readonly kind: 'screen-cache';
  readonly departureStepDays: number;
  readonly tofStepDays: number;
  readonly tofMinDays: number;
  readonly tofMaxDays: number;
  readonly departureSpan: {
    readonly startUtc: string;
    readonly endUtc: string;
  };
}

export interface RequestedC3Grid {
  readonly kind: 'requested-grid';
  readonly departureStartUtc: string;
  readonly departureEndUtc: string;
  readonly tofMinDays: number;
  readonly tofMaxDays: number;
  readonly nDep: number;
  readonly nTof: number;
  readonly M: 0 | 1 | 2;
}

export function cachedC3GridFromMetadata(metadata: LambertScreenCacheMetadata): CachedC3Grid {
  return {
    kind: 'screen-cache',
    departureStepDays: metadata.departureGridSpacingDays,
    tofStepDays: metadata.tofGridSpacingDays,
    tofMinDays: metadata.tofMinDays,
    tofMaxDays: metadata.tofMaxDays,
    departureSpan: {
      startUtc: metadata.screeningWindow.startUtc,
      endUtc: metadata.screeningWindow.endUtc,
    },
  };
}

export function requestedC3GridFromArgs(args: {
  departureStartUtc: string;
  departureEndUtc: string;
  tofMinDays: number;
  tofMaxDays: number;
  nDep: number;
  nTof: number;
  M: 0 | 1 | 2;
}): RequestedC3Grid {
  return {
    kind: 'requested-grid',
    departureStartUtc: args.departureStartUtc,
    departureEndUtc: args.departureEndUtc,
    tofMinDays: args.tofMinDays,
    tofMaxDays: args.tofMaxDays,
    nDep: args.nDep,
    nTof: args.nTof,
    M: args.M,
  };
}

export function formatCachedC3GridShort(grid: CachedC3Grid): string {
  return `cached screen: ${grid.departureStepDays} d × ${grid.tofStepDays} d grid`;
}

export function formatCachedC3GridDetails(grid: CachedC3Grid): string {
  return (
    `Cached screening grid: departures every ${grid.departureStepDays} d; ` +
    `TOF every ${grid.tofStepDays} d; ` +
    `departure span ${grid.departureSpan.startUtc} through ${grid.departureSpan.endUtc}; ` +
    `TOF ${grid.tofMinDays}–${grid.tofMaxDays} d.`
  );
}

export function formatGridDimensions(grid: { readonly nDep: number; readonly nTof: number }): string {
  return `${grid.nDep}×${grid.nTof} grid`;
}
