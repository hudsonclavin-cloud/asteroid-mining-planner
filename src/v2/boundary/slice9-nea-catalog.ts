import {
  FRAME_HELIO_J2000_ECLIPTIC,
  FRAME_HELIO_J2000_ICRF,
  createCanonicalState,
  eccentricityBandForBody,
  jdTdbToSecondsSinceJ2000,
  kilometersPerSecondToMetersPerSecond,
  kilometersToMeters,
  toAsteroidBodyId,
  type AsteroidBodyId,
  type AsteroidEccentricityBand,
  type AsteroidOrbitClass,
  type CanonicalState,
  type FrameId,
} from '../core/index.js';

export type Slice9Inv014Tier = 'visualization-tier' | 'planning-tier' | 'not-kepler-safe';
export type Slice9AnchorSource = 'sbdb' | 'horizons-reanchor' | 'stale-unanchored';

export interface Slice9AsteroidAnchorFixture {
  epochTdbJd: number;
  positionKm: [number, number, number];
  velocityKmPerS: [number, number, number];
}

export interface Slice9AsteroidElementsFixture {
  aKm: number;
  e: number;
  iRad: number;
  omRad: number;
  wRad: number;
  maRad: number;
  epochTdbJd: number;
}

export interface Slice9AsteroidFixtureRecord {
  designation: string;
  spkId: number;
  name?: string | null;
  class: string;
  isCuratedNea: boolean;
  neo: boolean;
  pha: boolean;
  H: number | null;
  G: number | null;
  estimatedRadiusM: number | null;
  anchor: Slice9AsteroidAnchorFixture;
  elements: Slice9AsteroidElementsFixture;
  elementsFrame: string;
  eccentricityBand: AsteroidEccentricityBand;
  orbitClass: string;
  conditionCode: number | null;
  dataArcDays: number | null;
  nObsUsed: number | null;
  sigmaA: number | null;
  sigmaE: number | null;
  inv014Tier: Slice9Inv014Tier;
  qualityRank: number;
  anchorSource?: Slice9AnchorSource;
  reanchorEpochTdbJd?: number | null;
}

export interface Slice9CatalogSummaryFixture {
  totalBodies: number;
  includedClasses: string[];
  classDistribution: Record<string, number>;
  inv014TierDistribution: Record<Slice9Inv014Tier, number>;
  missingAbsoluteMagnitudeCount: number;
  anomalyTailCount: number;
  qualityRankFormula: string;
}

export interface Slice9PropagationFixture {
  method: string;
  epochPolicy: string;
}

export interface Slice9CloseApproachWindowFixture {
  start: string;
  stop: string;
  distMaxAu: string;
  bodies: string[];
}

export interface Slice9Fixture {
  selectionSource?: string;
  anchorSource?: string;
  frame?: string;
  timeScale?: string;
  units?: {
    anchorPosition?: string;
    anchorVelocity?: string;
    anchorTime?: string;
    semiMajorAxis?: string;
    estimatedRadius?: string;
    angles?: string;
    dataArc?: string;
    sigmaA?: string;
    sigmaE?: string;
  };
  propagation: Slice9PropagationFixture;
  closeApproachWindow: Slice9CloseApproachWindowFixture;
  catalog: Slice9CatalogSummaryFixture;
  asteroids: Record<string, Slice9AsteroidFixtureRecord>;
}

export interface Slice9NeaBody {
  readonly bodyId: AsteroidBodyId;
  readonly bodyClass: 'asteroid';
  readonly designation: string;
  readonly spkId: number;
  readonly name: string | null;
  readonly class: AsteroidOrbitClass;
  readonly orbitClass: AsteroidOrbitClass;
  readonly isCuratedNea: boolean;
  readonly neo: boolean;
  readonly pha: boolean;
  readonly H: number | null;
  readonly G: number | null;
  readonly estimatedRadiusM: number | null;
  readonly elementsFrame: FrameId;
  readonly eccentricityBand: AsteroidEccentricityBand;
  readonly conditionCode: number | null;
  readonly dataArcDays: number | null;
  readonly nObsUsed: number | null;
  readonly sigmaA: number | null;
  readonly sigmaE: number | null;
  readonly inv014Tier: Slice9Inv014Tier;
  readonly qualityRank: number;
  readonly anchorSource: Slice9AnchorSource;
  readonly reanchorEpochTdbJd: number | null;
  readonly anchorState: CanonicalState;
  readonly elements: {
    readonly aM: number;
    readonly e: number;
    readonly iRad: number;
    readonly omRad: number;
    readonly wRad: number;
    readonly maRad: number;
    readonly epochTdbSeconds: number;
  };
}

export interface Slice9CanonicalFixture {
  selectionSource: string | null;
  anchorSource: string | null;
  frame: FrameId;
  timeScale: string | null;
  propagation: {
    method: string;
    epochPolicy: string;
  };
  closeApproachWindow: Slice9CloseApproachWindowFixture;
  catalog: Slice9CatalogSummaryFixture;
  asteroids: Record<AsteroidBodyId, Slice9NeaBody>;
}

const slice9NeaCatalogFixtureUrl = new URL(
  '../../../tests/fixtures/v2/nea-catalog-slice9.json',
  import.meta.url,
);
const SLICE9_ANOMALY_TAIL_CLASSES = new Set(['ETC', 'HTC', 'JFC']);

function assertFiniteNumber(value: unknown, label: string): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Slice 9 ingestion expected finite ${label}`);
  }
  return numeric;
}

function assertFiniteNullableNumber(value: unknown, label: string): number | null {
  if (value === null || typeof value === 'undefined') {
    return null;
  }
  return assertFiniteNumber(value, label);
}

function assertBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Slice 9 ingestion expected boolean ${label}`);
  }
  return value;
}

function assertNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Slice 9 ingestion expected non-empty ${label}`);
  }
  return value;
}

function assertNumberTuple3(value: unknown, label: string): [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new Error(`Slice 9 ingestion expected ${label} tuple of length 3`);
  }
  return [
    assertFiniteNumber(value[0], `${label}[0]`),
    assertFiniteNumber(value[1], `${label}[1]`),
    assertFiniteNumber(value[2], `${label}[2]`),
  ];
}

function assertInv014Tier(value: unknown, label: string): Slice9Inv014Tier {
  if (
    value !== 'visualization-tier' &&
    value !== 'planning-tier' &&
    value !== 'not-kepler-safe'
  ) {
    throw new Error(`Slice 9 ingestion expected valid ${label}; received ${String(value)}`);
  }
  return value;
}

function assertAnchorSource(value: unknown, label: string): Slice9AnchorSource {
  if (value !== 'sbdb' && value !== 'horizons-reanchor' && value !== 'stale-unanchored') {
    throw new Error(`Slice 9 ingestion expected valid ${label}; received ${String(value)}`);
  }
  return value;
}

function assertDistributionSum(
  distribution: Record<string, number>,
  expectedTotal: number,
  label: string,
): void {
  const total = Object.values(distribution).reduce(
    (sum, count) => sum + assertFiniteNumber(count, `${label}.${String(count)}`),
    0,
  );
  if (total !== expectedTotal) {
    throw new Error(`${label} must sum to ${expectedTotal}; received ${total}`);
  }
}

function assertSlice9FixtureShape(fixture: Slice9Fixture): void {
  if (!fixture || typeof fixture !== 'object') {
    throw new Error('Slice 9 fixture must be an object');
  }
  if (!fixture.catalog || typeof fixture.catalog !== 'object') {
    throw new Error('Slice 9 fixture must define catalog summary');
  }
  if (!fixture.propagation || typeof fixture.propagation !== 'object') {
    throw new Error('Slice 9 fixture must define propagation metadata');
  }
  if (!fixture.closeApproachWindow || typeof fixture.closeApproachWindow !== 'object') {
    throw new Error('Slice 9 fixture must define close-approach metadata');
  }
  if (!fixture.asteroids || typeof fixture.asteroids !== 'object') {
    throw new Error('Slice 9 fixture must define asteroids');
  }

  const asteroidCount = Object.keys(fixture.asteroids).length;
  if (asteroidCount <= 0) {
    throw new Error('Slice 9 fixture must define at least one asteroid');
  }
  if (fixture.catalog.totalBodies !== asteroidCount) {
    throw new Error(
      `Slice 9 catalog.totalBodies must equal the asteroid record count (${asteroidCount}); received ${fixture.catalog.totalBodies}`,
    );
  }
  assertDistributionSum(
    fixture.catalog.classDistribution,
    asteroidCount,
    'slice9.catalog.classDistribution',
  );
  assertDistributionSum(
    fixture.catalog.inv014TierDistribution,
    asteroidCount,
    'slice9.catalog.inv014TierDistribution',
  );
}

function ingestSlice9Asteroid(bodyIdKey: string, asteroid: Slice9AsteroidFixtureRecord): Slice9NeaBody {
  const designation = assertNonEmptyString(asteroid.designation, `${bodyIdKey}.designation`);
  const expectedBodyId = toAsteroidBodyId(designation);
  if (bodyIdKey !== expectedBodyId) {
    throw new Error(`Slice 9 body id mismatch: expected "${expectedBodyId}" but received "${bodyIdKey}"`);
  }

  const anchorEpoch = assertFiniteNumber(asteroid.anchor?.epochTdbJd, `${bodyIdKey}.anchor.epochTdbJd`);
  const elementsEpoch = assertFiniteNumber(asteroid.elements?.epochTdbJd, `${bodyIdKey}.elements.epochTdbJd`);
  if (anchorEpoch !== elementsEpoch) {
    throw new Error(
      `Slice 9 anchor/elements epoch mismatch for "${bodyIdKey}": anchor ${anchorEpoch}, elements ${elementsEpoch}`,
    );
  }

  const positionKm = assertNumberTuple3(asteroid.anchor?.positionKm, `${bodyIdKey}.anchor.positionKm`);
  const velocityKmPerS = assertNumberTuple3(
    asteroid.anchor?.velocityKmPerS,
    `${bodyIdKey}.anchor.velocityKmPerS`,
  );
  const elementsFrame = assertNonEmptyString(asteroid.elementsFrame, `${bodyIdKey}.elementsFrame`);
  if (elementsFrame !== FRAME_HELIO_J2000_ECLIPTIC) {
    throw new Error(
      `Slice 9 elementsFrame for "${bodyIdKey}" must be ${FRAME_HELIO_J2000_ECLIPTIC}; received ${elementsFrame}`,
    );
  }

  const eccentricity = assertFiniteNumber(asteroid.elements?.e, `${bodyIdKey}.elements.e`);
  const expectedBand = eccentricityBandForBody(eccentricity);
  if (asteroid.eccentricityBand !== expectedBand) {
    throw new Error(
      `Slice 9 eccentricityBand mismatch for "${bodyIdKey}": expected ${expectedBand}, received ${asteroid.eccentricityBand}`,
    );
  }

  const qualityRank = assertFiniteNumber(asteroid.qualityRank, `${bodyIdKey}.qualityRank`);
  if (qualityRank < 0 || qualityRank > 1) {
    throw new Error(`Slice 9 qualityRank for "${bodyIdKey}" must be within [0, 1]`);
  }
  const anchorSource = assertAnchorSource(
    asteroid.anchorSource ?? 'sbdb',
    `${bodyIdKey}.anchorSource`,
  );
  const reanchorEpochTdbJd = assertFiniteNullableNumber(
    asteroid.reanchorEpochTdbJd ?? null,
    `${bodyIdKey}.reanchorEpochTdbJd`,
  );
  if (anchorSource === 'horizons-reanchor' && reanchorEpochTdbJd === null) {
    throw new Error(`Slice 9 re-anchored body "${bodyIdKey}" must define reanchorEpochTdbJd`);
  }
  if (anchorSource !== 'horizons-reanchor' && reanchorEpochTdbJd !== null) {
    throw new Error(
      `Slice 9 body "${bodyIdKey}" must not define reanchorEpochTdbJd unless anchorSource is horizons-reanchor`,
    );
  }

  const estimatedRadiusM = assertFiniteNullableNumber(
    asteroid.estimatedRadiusM,
    `${bodyIdKey}.estimatedRadiusM`,
  );
  if (estimatedRadiusM !== null && estimatedRadiusM <= 0) {
    throw new Error(`Slice 9 estimatedRadiusM for "${bodyIdKey}" must be positive when present`);
  }

  const hAbsMag = assertFiniteNullableNumber(asteroid.H, `${bodyIdKey}.H`);
  const gSlope = assertFiniteNullableNumber(asteroid.G, `${bodyIdKey}.G`);

  const orbitClass = assertNonEmptyString(asteroid.orbitClass, `${bodyIdKey}.orbitClass`) as AsteroidOrbitClass;
  const inv014Tier = assertInv014Tier(asteroid.inv014Tier, `${bodyIdKey}.inv014Tier`);
  if (SLICE9_ANOMALY_TAIL_CLASSES.has(orbitClass) && inv014Tier !== 'not-kepler-safe') {
    throw new Error(
      `Slice 9 anomaly-tail body "${bodyIdKey}" must be tagged not-kepler-safe; received ${inv014Tier}`,
    );
  }

  return {
    bodyId: expectedBodyId,
    bodyClass: 'asteroid',
    designation,
    spkId: assertFiniteNumber(asteroid.spkId, `${bodyIdKey}.spkId`),
    name: asteroid.name ?? null,
    class: assertNonEmptyString(asteroid.class, `${bodyIdKey}.class`) as AsteroidOrbitClass,
    orbitClass,
    isCuratedNea: assertBoolean(asteroid.isCuratedNea, `${bodyIdKey}.isCuratedNea`),
    neo: assertBoolean(asteroid.neo, `${bodyIdKey}.neo`),
    pha: assertBoolean(asteroid.pha, `${bodyIdKey}.pha`),
    H: hAbsMag,
    G: gSlope,
    estimatedRadiusM,
    elementsFrame: FRAME_HELIO_J2000_ECLIPTIC,
    eccentricityBand: asteroid.eccentricityBand,
    conditionCode: assertFiniteNullableNumber(asteroid.conditionCode, `${bodyIdKey}.conditionCode`),
    dataArcDays: assertFiniteNullableNumber(asteroid.dataArcDays, `${bodyIdKey}.dataArcDays`),
    nObsUsed: assertFiniteNullableNumber(asteroid.nObsUsed, `${bodyIdKey}.nObsUsed`),
    sigmaA: assertFiniteNullableNumber(asteroid.sigmaA, `${bodyIdKey}.sigmaA`),
    sigmaE: assertFiniteNullableNumber(asteroid.sigmaE, `${bodyIdKey}.sigmaE`),
    inv014Tier,
    qualityRank,
    anchorSource,
    reanchorEpochTdbJd,
    anchorState: createCanonicalState({
      frame: FRAME_HELIO_J2000_ICRF,
      tdbSeconds: jdTdbToSecondsSinceJ2000(anchorEpoch),
      positionM: {
        x: kilometersToMeters(positionKm[0]),
        y: kilometersToMeters(positionKm[1]),
        z: kilometersToMeters(positionKm[2]),
      },
      velocityMps: {
        x: kilometersPerSecondToMetersPerSecond(velocityKmPerS[0]),
        y: kilometersPerSecondToMetersPerSecond(velocityKmPerS[1]),
        z: kilometersPerSecondToMetersPerSecond(velocityKmPerS[2]),
      },
      ...(estimatedRadiusM !== null ? { radiusM: estimatedRadiusM } : {}),
    }),
    elements: {
      aM: kilometersToMeters(assertFiniteNumber(asteroid.elements?.aKm, `${bodyIdKey}.elements.aKm`)),
      e: eccentricity,
      iRad: assertFiniteNumber(asteroid.elements?.iRad, `${bodyIdKey}.elements.iRad`),
      omRad: assertFiniteNumber(asteroid.elements?.omRad, `${bodyIdKey}.elements.omRad`),
      wRad: assertFiniteNumber(asteroid.elements?.wRad, `${bodyIdKey}.elements.wRad`),
      maRad: assertFiniteNumber(asteroid.elements?.maRad, `${bodyIdKey}.elements.maRad`),
      epochTdbSeconds: jdTdbToSecondsSinceJ2000(elementsEpoch),
    },
  };
}

export function ingestSlice9Fixture(fixture: Slice9Fixture): Slice9CanonicalFixture {
  assertSlice9FixtureShape(fixture);

  const asteroids = Object.fromEntries(
    Object.entries(fixture.asteroids).map(([bodyId, asteroid]) => [
      bodyId,
      ingestSlice9Asteroid(bodyId, asteroid),
    ]),
  ) as Record<AsteroidBodyId, Slice9NeaBody>;

  return {
    selectionSource: fixture.selectionSource ?? null,
    anchorSource: fixture.anchorSource ?? null,
    frame: FRAME_HELIO_J2000_ICRF,
    timeScale: fixture.timeScale ?? null,
    propagation: {
      method: assertNonEmptyString(fixture.propagation.method, 'slice9.propagation.method'),
      epochPolicy: assertNonEmptyString(fixture.propagation.epochPolicy, 'slice9.propagation.epochPolicy'),
    },
    closeApproachWindow: {
      start: assertNonEmptyString(fixture.closeApproachWindow.start, 'slice9.closeApproachWindow.start'),
      stop: assertNonEmptyString(fixture.closeApproachWindow.stop, 'slice9.closeApproachWindow.stop'),
      distMaxAu: assertNonEmptyString(
        fixture.closeApproachWindow.distMaxAu,
        'slice9.closeApproachWindow.distMaxAu',
      ),
      bodies: Array.isArray(fixture.closeApproachWindow.bodies)
        ? fixture.closeApproachWindow.bodies.map((body, index) =>
            assertNonEmptyString(body, `slice9.closeApproachWindow.bodies[${index}]`),
          )
        : (() => {
            throw new Error('slice9.closeApproachWindow.bodies must be an array');
          })(),
    },
    catalog: {
      totalBodies: assertFiniteNumber(fixture.catalog.totalBodies, 'slice9.catalog.totalBodies'),
      includedClasses: Array.isArray(fixture.catalog.includedClasses)
        ? fixture.catalog.includedClasses.map((value, index) =>
            assertNonEmptyString(value, `slice9.catalog.includedClasses[${index}]`),
          )
        : (() => {
            throw new Error('slice9.catalog.includedClasses must be an array');
          })(),
      classDistribution: Object.fromEntries(
        Object.entries(fixture.catalog.classDistribution).map(([orbitClass, count]) => [
          orbitClass,
          assertFiniteNumber(count, `slice9.catalog.classDistribution.${orbitClass}`),
        ]),
      ),
      inv014TierDistribution: {
        'visualization-tier': assertFiniteNumber(
          fixture.catalog.inv014TierDistribution['visualization-tier'],
          'slice9.catalog.inv014TierDistribution.visualization-tier',
        ),
        'planning-tier': assertFiniteNumber(
          fixture.catalog.inv014TierDistribution['planning-tier'],
          'slice9.catalog.inv014TierDistribution.planning-tier',
        ),
        'not-kepler-safe': assertFiniteNumber(
          fixture.catalog.inv014TierDistribution['not-kepler-safe'],
          'slice9.catalog.inv014TierDistribution.not-kepler-safe',
        ),
      },
      missingAbsoluteMagnitudeCount: assertFiniteNumber(
        fixture.catalog.missingAbsoluteMagnitudeCount,
        'slice9.catalog.missingAbsoluteMagnitudeCount',
      ),
      anomalyTailCount: assertFiniteNumber(
        fixture.catalog.anomalyTailCount,
        'slice9.catalog.anomalyTailCount',
      ),
      qualityRankFormula: assertNonEmptyString(
        fixture.catalog.qualityRankFormula,
        'slice9.catalog.qualityRankFormula',
      ),
    },
    asteroids,
  };
}

export async function loadSlice9NeaCatalogFixture(): Promise<Slice9CanonicalFixture> {
  const response = await fetch(slice9NeaCatalogFixtureUrl);
  if (!response.ok) {
    throw new Error(`Failed to load Slice 9 NEA catalog fixture: ${response.status} ${response.statusText}`);
  }

  const fixture = await response.json() as Slice9Fixture;
  return ingestSlice9Fixture(fixture);
}
