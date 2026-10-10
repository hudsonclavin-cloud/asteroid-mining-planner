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

export interface C3GridStepSizes {
  readonly departureStepDays: number;
  readonly tofStepDays: number;
}

export const C3_GRID_SAMPLING_DISCLOSURE =
  'Each C3 value is the lowest sampled point on its own grid; grids sample different points, so minima differ; the true minimum is at or below each of them.';

function formatStepDays(days: number): string {
  if (!Number.isFinite(days)) {
    return String(days);
  }
  return Number.isInteger(days) ? String(days) : days.toFixed(1);
}

export function formatC3GridSteps(grid: C3GridStepSizes): string {
  return `${formatStepDays(grid.departureStepDays)} d \u00D7 ${formatStepDays(grid.tofStepDays)} d steps`;
}

export function formatC3GridLabel(
  grid: { readonly nDep: number; readonly nTof: number } & C3GridStepSizes,
): string {
  return `${formatGridDimensions(grid)} \u00B7 ${formatC3GridSteps(grid)}`;
}

export function formatRequestedC3GridLabel(grid: RequestedC3Grid): string {
  const departureSpanDays = (Date.parse(grid.departureEndUtc) - Date.parse(grid.departureStartUtc)) / 86_400_000;
  return formatC3GridLabel({
    nDep: grid.nDep,
    nTof: grid.nTof,
    departureStepDays: departureSpanDays / (grid.nDep - 1),
    tofStepDays: (grid.tofMaxDays - grid.tofMinDays) / (grid.nTof - 1),
  });
}

export function formatJdC3GridLabel(grid: {
  readonly depStartJD: number;
  readonly depEndJD: number;
  readonly tofMinDays: number;
  readonly tofMaxDays: number;
  readonly nDep: number;
  readonly nTof: number;
}): string {
  return formatC3GridLabel({
    nDep: grid.nDep,
    nTof: grid.nTof,
    departureStepDays: (grid.depEndJD - grid.depStartJD) / (grid.nDep - 1),
    tofStepDays: (grid.tofMaxDays - grid.tofMinDays) / (grid.nTof - 1),
  });
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
  return `cached screen: ${formatC3GridSteps(grid)}`;
}

export function formatCachedC3GridDetails(grid: CachedC3Grid): string {
  return (
    `Cached screening grid: ${formatC3GridSteps(grid)}; departures every ${grid.departureStepDays} d; ` +
    `TOF every ${grid.tofStepDays} d; ` +
    `departure span ${grid.departureSpan.startUtc} through ${grid.departureSpan.endUtc}; ` +
    `TOF ${grid.tofMinDays}\u2013${grid.tofMaxDays} d. ${C3_GRID_SAMPLING_DISCLOSURE}`
  );
}

export function formatGridDimensions(grid: { readonly nDep: number; readonly nTof: number }): string {
  return `${grid.nDep}×${grid.nTof} grid`;
}
