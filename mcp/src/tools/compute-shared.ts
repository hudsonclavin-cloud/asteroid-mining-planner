import {
  type CanonicalStateSample,
  ingestSlice2Fixture,
  type HorizonsFixture
} from '../../../src/v2/boundary/horizons.js';
import { type Slice9NeaBody } from '../../../src/v2/boundary/slice9-nea-catalog.js';
import { type LaunchSite, LAUNCH_SITES, classifyFeasibility } from '../../../src/v2/core/lambert/feasibility.js';
import { interpolateBodyStateSeries } from '../../../src/v2/core/interpolators/hermite.js';
import { propagateKeplerianStateVectors } from '../../../src/v2/core/propagators/keplerian.js';
import { type CanonicalState } from '../../../src/v2/core/types.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../../../src/v2/core/units.js';
import {
  type LaunchVehicle,
  LAUNCH_VEHICLES,
} from '../../../src/v2/porkchop/launch-vehicles.js';
import {
  computePorkchopGrid,
  type PorkchopCell,
  type PorkchopEphemerisDependencies,
  type PorkchopGridParams
} from '../../../src/v2/porkchop/grid-compute.js';
import { type SourceRef } from '../envelope/index.js';
import { gitCommitForPath, readRepoJson } from '../resources/repo.js';
import { loadCatalogContext } from './catalog-shared.js';

export const HORIZONS_EARTH_FIXTURE_PATH = 'src/v2/data/horizons-inner-solar-system-2026-2040.json';
const HORIZONS_BOUNDARY_PATH = 'src/v2/boundary/horizons.ts';
const GRID_COMPUTE_PATH = 'src/v2/porkchop/grid-compute.ts';
const FEASIBILITY_PATH = 'src/v2/core/lambert/feasibility.ts';
const LAUNCH_VEHICLES_PATH = 'src/v2/porkchop/launch-vehicles.ts';
const DELTA_V_PATH = 'src/v2/porkchop/delta-v.ts';

export const MAX_GRID_CELLS = 20_000;
export const DEFAULT_GRID_DEPARTURE = 80;
export const DEFAULT_GRID_TOF = 50;
export const DEFAULT_TOP_N = 10;

interface ComputeContext {
  earthSeries: readonly CanonicalState[];
  earthSpan: { minJd: number; maxJd: number; startDate: string; endDate: string };
  porkchopDeps: PorkchopEphemerisDependencies;
}

let computeContextPromise: Promise<ComputeContext> | null = null;

export async function loadComputeContext(): Promise<ComputeContext> {
  if (computeContextPromise !== null) {
    return computeContextPromise;
  }

  computeContextPromise = (async () => {
    const fixture = await readRepoJson<HorizonsFixture>(HORIZONS_EARTH_FIXTURE_PATH);
    const states = ingestSlice2Fixture(fixture);
    const earthSeries = states.earth.map((sample) => sample.state);
    const first = earthSeries[0];
    const last = earthSeries[earthSeries.length - 1];
    if (!first || !last) {
      throw new Error('Earth Horizons fixture did not produce a usable state series');
    }

    return {
      earthSeries,
      earthSpan: {
        minJd: jdFromTdbSeconds(first.tdbSeconds),
        maxJd: jdFromTdbSeconds(last.tdbSeconds),
        startDate: jdTdbToUtcDateString(jdFromTdbSeconds(first.tdbSeconds)),
        endDate: jdTdbToUtcDateString(jdFromTdbSeconds(last.tdbSeconds))
      },
      porkchopDeps: {
        nowMs: () => performance.now(),
        getEarthStateAtTdbSeconds: (tdbSeconds) =>
          interpolateBodyStateSeries('earth', earthSeries, tdbSeconds),
        propagateTargetStateAtTdbSeconds: (bodyElements, tdbSeconds) =>
          propagateKeplerianStateVectors(bodyElements, tdbSeconds)
      }
    };
  })();

  return computeContextPromise;
}

const syncPorkchopDeps: PorkchopEphemerisDependencies = {
  nowMs: () => performance.now(),
  getEarthStateAtTdbSeconds: () => {
    throw new Error('loadComputeContext must provide getEarthStateAtTdbSeconds');
  },
  propagateTargetStateAtTdbSeconds: () => {
    throw new Error('loadComputeContext must provide propagateTargetStateAtTdbSeconds');
  }
};

export async function computeGridForBody(
  body: Slice9NeaBody,
  gridParams: PorkchopGridParams,
  M: 0 | 1 | 2
) {
  const context = await loadComputeContextWithSyncDeps();
  return computePorkchopGrid(body.elements, gridParams, M, context.porkchopDeps);
}

export async function resolveBodyByDesignation(designation: string): Promise<Slice9NeaBody | undefined> {
  const catalogContext = await loadCatalogContext();
  return Object.values(catalogContext.catalog.asteroids).find((body) => body.designation === designation);
}

export function utcDateSchemaPattern(): RegExp {
  return /^\d{4}-\d{2}-\d{2}$/;
}

export function utcMidnightToJdTdb(utcDate: string): number {
  const utcMillis = Date.parse(`${utcDate}T00:00:00Z`);
  if (!Number.isFinite(utcMillis)) {
    throw new Error(`Invalid UTC date '${utcDate}'`);
  }
  const utcSecondsSinceUnix = utcMillis / 1000;
  const unixToJ2000Seconds = 946_728_000;
  const tdbMinusUtcSeconds = 69.184;
  const tdbSecondsSinceJ2000 = utcSecondsSinceUnix - unixToJ2000Seconds + tdbMinusUtcSeconds;
  return J2000_TDB_JULIAN_DATE + tdbSecondsSinceJ2000 / SECONDS_PER_DAY;
}

export function jdTdbToUtcDateString(jdTdb: number): string {
  const tdbSecondsSinceJ2000 = (jdTdb - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
  const unixToJ2000Seconds = 946_728_000;
  const tdbMinusUtcSeconds = 69.184;
  const utcMillis = (tdbSecondsSinceJ2000 - tdbMinusUtcSeconds + unixToJ2000Seconds) * 1000;
  return new Date(utcMillis).toISOString().slice(0, 10);
}

export function withinEarthSpan(
  span: { minJd: number; maxJd: number; startDate: string; endDate: string },
  departureStartJd: number,
  departureEndJd: number
): boolean {
  return departureStartJd >= span.minJd && departureEndJd <= span.maxJd;
}

export function earthSpanHelp(span: { startDate: string; endDate: string }): string {
  return `choose departure dates inside ${span.startDate} through ${span.endDate}`;
}

export function makeVehicleId(vehicle: LaunchVehicle): string {
  return `${slug(vehicle.name)}-${slug(vehicle.config)}`;
}

export function findVehicleById(vehicleId: string): LaunchVehicle | undefined {
  return LAUNCH_VEHICLES.find((vehicle) => makeVehicleId(vehicle) === vehicleId);
}

export function makeSiteId(site: LaunchSite): string {
  return slug(site.name);
}

export function findSiteById(siteId: string): LaunchSite | undefined {
  return LAUNCH_SITES.find((site) => makeSiteId(site) === siteId);
}

export function vehicleCurveDomain(vehicle: LaunchVehicle): { minC3: number; maxC3: number } {
  const first = vehicle.curve[0];
  const last = vehicle.curve[vehicle.curve.length - 1];
  if (!first || !last) {
    throw new Error(`Vehicle ${vehicle.name}/${vehicle.config} has no curve anchors`);
  }
  return { minC3: first.c3, maxC3: last.c3 };
}

export function classifyDlaForSite(dlaDeg: number | null, site: LaunchSite | undefined): string | null {
  if (!site) {
    return null;
  }
  return classifyFeasibility(dlaDeg, site);
}

export function baseComputeProvenance(options: {
  includeVehicle?: boolean;
  includeDeltaV?: boolean;
  includeScreenCache?: boolean;
} = {}): SourceRef[] {
  const refs: SourceRef[] = [
    {
      id: 'catalog-boundary',
      kind: 'repo',
      path: 'src/v2/boundary/slice9-nea-catalog.ts',
      commit: gitCommitForPath('src/v2/boundary/slice9-nea-catalog.ts'),
      confidence: 'derived',
      note: 'Catalog fixture ingestion and canonical body records.'
    },
    ...(options.includeScreenCache
      ? [{
          id: 'screen-cache-boundary',
          kind: 'repo' as const,
          path: 'src/v2/boundary/lambert-screen-cache.ts',
          commit: gitCommitForPath('src/v2/boundary/lambert-screen-cache.ts'),
          confidence: 'derived' as const,
          note: 'Lambert screening-cache validation and lookup indexes.'
        }]
      : []),
    {
      id: 'horizons-boundary',
      kind: 'repo',
      path: HORIZONS_BOUNDARY_PATH,
      commit: gitCommitForPath(HORIZONS_BOUNDARY_PATH),
      confidence: 'derived',
      note: `Runtime ingestion of ${HORIZONS_EARTH_FIXTURE_PATH}.`
    },
    {
      id: 'earth-ephemeris',
      kind: 'repo',
      path: HORIZONS_EARTH_FIXTURE_PATH,
      commit: gitCommitForPath(HORIZONS_EARTH_FIXTURE_PATH),
      confidence: 'derived',
      note: 'Committed Earth Horizons state series for porkchop departures.'
    },
    {
      id: 'grid-compute',
      kind: 'repo',
      path: GRID_COMPUTE_PATH,
      commit: gitCommitForPath(GRID_COMPUTE_PATH),
      confidence: 'derived',
      note: 'Selected-branch Lambert screening via computePorkchopGrid.'
    },
    {
      id: 'dla-feasibility',
      kind: 'repo',
      path: FEASIBILITY_PATH,
      commit: gitCommitForPath(FEASIBILITY_PATH),
      confidence: 'derived',
      note: 'Launch-site DLA band semantics.'
    }
  ];

  if (options.includeVehicle) {
    refs.push({
      id: 'launch-vehicles',
      kind: 'repo',
      path: LAUNCH_VEHICLES_PATH,
      commit: gitCommitForPath(LAUNCH_VEHICLES_PATH),
      confidence: 'measured',
      note: 'NASA LSP elvperf payload anchors, as-of 2024-02-29.'
    });
  }

  if (options.includeDeltaV) {
    refs.push({
      id: 'delta-v-model',
      kind: 'repo',
      path: DELTA_V_PATH,
      commit: gitCommitForPath(DELTA_V_PATH),
      confidence: 'derived',
      note: 'Patched-conic delta-v stack helper constants.'
    });
  }

  return refs;
}

async function loadComputeContextWithSyncDeps(): Promise<ComputeContext> {
  const context = await loadComputeContext();
  if (context.porkchopDeps.propagateTargetStateAtTdbSeconds !== syncPorkchopDeps.propagateTargetStateAtTdbSeconds) {
    return context;
  }
  return context;
}

function jdFromTdbSeconds(tdbSeconds: number): number {
  return J2000_TDB_JULIAN_DATE + tdbSeconds / SECONDS_PER_DAY;
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
