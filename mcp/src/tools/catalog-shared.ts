import {
  createLambertScreenIndex,
  validateLambertScreenCache,
  type LambertScreenCache,
  type LambertScreenResult,
  type LambertScreenStatus
} from '../../../src/v2/boundary/lambert-screen-cache.js';
import {
  ingestSlice9Fixture,
  type Slice9CanonicalFixture,
  type Slice9Fixture,
  type Slice9NeaBody
} from '../../../src/v2/boundary/slice9-nea-catalog.js';
import { quantity, type SourceRef } from '../envelope/index.js';
import { gitCommitForPath, readRepoJson } from '../resources/repo.js';

export const CATALOG_FIXTURE_PATH = 'tests/fixtures/v2/nea-catalog-slice9.json';
export const CATALOG_BOUNDARY_PATH = 'src/v2/boundary/slice9-nea-catalog.ts';
export const SCREEN_CACHE_PATH = 'tests/fixtures/v2/lambert-screen-cache.json';
export const SCREEN_BOUNDARY_PATH = 'src/v2/boundary/lambert-screen-cache.ts';

export const SCREENING_STATUS_VALUES = [
  'low_departure_c3',
  'high_departure_c3',
  'lambert_unconvergeable',
  'propagator_failed'
] as const satisfies readonly LambertScreenStatus[];

export interface CatalogContext {
  catalog: Slice9CanonicalFixture;
  screenByBodyId: Map<string, LambertScreenResult>;
  provenance: SourceRef[];
}

export interface BodySummary {
  bodyId: string;
  spkId: string;
  designation: string;
  name: string | null;
  orbitClass: string;
  screeningStatus: LambertScreenStatus;
  inv014Tier: string;
  minC3: ReturnType<typeof quantity> | null;
}

let contextPromise: Promise<CatalogContext> | null = null;

export async function loadCatalogContext(): Promise<CatalogContext> {
  if (contextPromise !== null) {
    return contextPromise;
  }

  contextPromise = (async () => {
    const [catalogRaw, screenRaw] = await Promise.all([
      readRepoJson<Slice9Fixture>(CATALOG_FIXTURE_PATH),
      readRepoJson<LambertScreenCache>(SCREEN_CACHE_PATH)
    ]);
    const catalog = ingestSlice9Fixture(catalogRaw);
    const screenCache = validateLambertScreenCache(screenRaw);
    const screenIndex = createLambertScreenIndex(screenCache);

    return {
      catalog,
      screenByBodyId: screenIndex.byBodyId,
      provenance: [
        {
          id: 'catalog-boundary',
          kind: 'repo',
          path: CATALOG_BOUNDARY_PATH,
          commit: gitCommitForPath(CATALOG_BOUNDARY_PATH),
          confidence: 'derived',
          note: `Runtime validation of ${CATALOG_FIXTURE_PATH}`
        },
        {
          id: 'screen-cache-boundary',
          kind: 'repo',
          path: SCREEN_BOUNDARY_PATH,
          commit: gitCommitForPath(SCREEN_BOUNDARY_PATH),
          confidence: 'derived',
          note: `Runtime validation of ${SCREEN_CACHE_PATH}`
        }
      ]
    };
  })();

  return contextPromise;
}

export function bodySummary(body: Slice9NeaBody, screen: LambertScreenResult): BodySummary {
  return {
    bodyId: body.bodyId,
    spkId: String(body.spkId),
    designation: body.designation,
    name: body.name,
    orbitClass: body.orbitClass,
    screeningStatus: screen.status,
    inv014Tier: body.inv014Tier,
    minC3: screen.minC3 === null
      ? null
      : quantity(screen.minC3, 'km^2/s^2', {
          confidence: 'derived',
          sourceIds: ['screen-cache-boundary']
        })
  };
}

export function fullBodyRecord(body: Slice9NeaBody, screen: LambertScreenResult | null): Record<string, unknown> {
  return {
    bodyId: body.bodyId,
    bodyClass: body.bodyClass,
    designation: body.designation,
    spkId: String(body.spkId),
    name: body.name,
    class: body.class,
    orbitClass: body.orbitClass,
    flags: {
      isCuratedNea: body.isCuratedNea,
      neo: body.neo,
      pha: body.pha,
      anchorSource: body.anchorSource
    },
    physical: {
      absoluteMagnitudeH: nullableQuantity(body.H, 'mag'),
      slopeParameterG: nullableQuantity(body.G, 'unitless'),
      estimatedRadius: nullableQuantity(body.estimatedRadiusM, 'm')
    },
    orbitQuality: {
      conditionCode: nullableQuantity(body.conditionCode, 'unitless'),
      dataArc: nullableQuantity(body.dataArcDays, 'days'),
      observationsUsed: nullableQuantity(body.nObsUsed, 'count'),
      sigmaA: nullableQuantity(body.sigmaA, 'au'),
      sigmaE: nullableQuantity(body.sigmaE, 'unitless'),
      qualityRank: quantity(body.qualityRank, 'unitless', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      inv014Tier: body.inv014Tier
    },
    elements: {
      frame: body.elementsFrame,
      eccentricityBand: body.eccentricityBand,
      semiMajorAxis: quantity(body.elements.aM, 'm', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      eccentricity: quantity(body.elements.e, 'unitless', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      inclination: quantity(body.elements.iRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      longitudeAscendingNode: quantity(body.elements.omRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      argumentOfPeriapsis: quantity(body.elements.wRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      meanAnomaly: quantity(body.elements.maRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      epochTdb: quantity(body.elements.epochTdbSeconds, 's since J2000 TDB', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      })
    },
    screening: screen === null ? null : {
      screeningStatus: screen.status,
      minC3: screen.minC3 === null
        ? null
        : quantity(screen.minC3, 'km^2/s^2', {
            confidence: 'derived',
            sourceIds: ['screen-cache-boundary']
          }),
      minC3Date: screen.minC3Date,
      minC3TofDays: screen.minC3TofDays === null
        ? null
        : quantity(screen.minC3TofDays, 'days', {
            confidence: 'derived',
            sourceIds: ['screen-cache-boundary']
          }),
      isCoOrbital: screen.isCoOrbital
    }
  };
}

function nullableQuantity(value: number | null, units: string): ReturnType<typeof quantity> | null {
  return value === null
    ? null
    : quantity(value, units, {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      });
}
