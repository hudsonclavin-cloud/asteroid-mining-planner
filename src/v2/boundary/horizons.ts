import {
  FRAME_HELIO_J2000_ECLIPTIC,
  FRAME_HELIO_J2000_ICRF,
  FRAME_GCRS_EARTH,
  FRAME_JUPITER_J2000_ICRF,
  FRAME_MARS_J2000_ICRF,
  FRAME_SATURN_J2000_ICRF,
  J2000_ECLIPTIC_OBLIQUITY_RAD,
  assertCanonicalState,
  createCanonicalState,
  jdTdbToSecondsSinceJ2000,
  kilometersPerSecondToMetersPerSecond,
  kilometersToMeters,
  type AsteroidBody,
  type AsteroidBodyId,
  type CanonicalState,
  type FrameId,
} from '../core/index.js';

export type HorizonsTupleRecord = [
  jdTdb: number,
  xKm: number,
  yKm: number,
  zKm: number,
  vxKmS: number,
  vyKmS: number,
  vzKmS: number,
];

export type HorizonsObjectRecord = {
  jdTdb?: number;
  jd?: number;
  tdbJulianDate?: number;
  xKm?: number;
  yKm?: number;
  zKm?: number;
  vxKmS?: number;
  vyKmS?: number;
  vzKmS?: number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
};

export type HorizonsRecord = HorizonsTupleRecord | HorizonsObjectRecord;

export interface HorizonsTargetFixture {
  targetId?: string;
  targetName?: string;
  center?: string;
  frame?: string;
  origin?: string;
  records: HorizonsRecord[];
}

export interface HorizonsFixture {
  source?: string;
  frame?: string;
  origin?: string;
  timeScale?: string;
  units?: {
    position?: string;
    velocity?: string;
    time?: string;
  };
  targets: Record<string, HorizonsTargetFixture>;
}

export interface Slice7AsteroidAnchorFixture {
  epochTdbJd: number;
  positionKm: [number, number, number];
  velocityKmPerS: [number, number, number];
}

export interface Slice7AsteroidElementsFixture {
  aKm: number;
  e: number;
  iRad: number;
  omRad: number;
  wRad: number;
  maRad: number;
  epochTdbJd: number;
}

export interface Slice7AsteroidFixtureRecord {
  designation: string;
  spkId: number;
  name?: string | null;
  class: string;
  isCuratedNea: boolean;
  neo: boolean;
  pha: boolean;
  H: number;
  G: number | null;
  estimatedRadiusM: number;
  anchor: Slice7AsteroidAnchorFixture;
  elements: Slice7AsteroidElementsFixture;
  elementsFrame: string;
}

export interface Slice7CatalogSummaryFixture {
  totalBodies: number;
  mainBeltCount: number;
  curatedNeaCount: number;
  mainBeltCutoffH: number;
}

export interface Slice7PropagationFixture {
  method: string;
  anchorEpochTdbJd: number;
}

export interface Slice7Fixture {
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
  };
  propagation: Slice7PropagationFixture;
  catalog: Slice7CatalogSummaryFixture;
  asteroids: Record<string, Slice7AsteroidFixtureRecord>;
}

export type Slice7BodyId = AsteroidBodyId;

export interface Slice7CanonicalFixture {
  selectionSource: string | null;
  anchorSource: string | null;
  frame: FrameId;
  timeScale: string | null;
  propagation: {
    method: string;
    anchorEpochTdbSeconds: number;
  };
  catalog: Slice7CatalogSummaryFixture;
  asteroids: Record<Slice7BodyId, AsteroidBody>;
}

export interface CanonicalVector3 {
  x: number;
  y: number;
  z: number;
}

export interface CanonicalStateSample {
  targetKey: string;
  targetId: string | null;
  targetName: string | null;
  sourceFrame: string | null;
  sourceOrigin: string | null;
  state: CanonicalState;
}

export interface Slice1EarthMoonCanonicalFixture {
  source: string | null;
  frame: FrameId;
  earth: CanonicalStateSample[];
  moon: CanonicalStateSample[];
}

function assertFiniteNumber(value: unknown, label: string): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Horizons ingress expected finite ${label}`);
  }
  return numeric;
}

function assertBoolean(value: unknown, label: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`Horizons ingress expected boolean ${label}`);
  }
  return value;
}

function assertNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Horizons ingress expected non-empty ${label}`);
  }
  return value;
}

function assertNumberTuple3(value: unknown, label: string): [number, number, number] {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new Error(`Horizons ingress expected ${label} tuple of length 3`);
  }

  return [
    assertFiniteNumber(value[0], `${label}[0]`),
    assertFiniteNumber(value[1], `${label}[1]`),
    assertFiniteNumber(value[2], `${label}[2]`),
  ];
}

function normalizeObjectRecord(record: HorizonsObjectRecord): HorizonsTupleRecord {
  return [
    assertFiniteNumber(record.jdTdb ?? record.jd ?? record.tdbJulianDate, 'jdTdb'),
    assertFiniteNumber(record.xKm ?? record.x, 'xKm'),
    assertFiniteNumber(record.yKm ?? record.y, 'yKm'),
    assertFiniteNumber(record.zKm ?? record.z, 'zKm'),
    assertFiniteNumber(record.vxKmS ?? record.vx, 'vxKmS'),
    assertFiniteNumber(record.vyKmS ?? record.vy, 'vyKmS'),
    assertFiniteNumber(record.vzKmS ?? record.vz, 'vzKmS'),
  ];
}

function normalizeRecord(record: HorizonsRecord): HorizonsTupleRecord {
  if (Array.isArray(record)) {
    if (record.length !== 7) {
      throw new Error(`Horizons tuple record must have 7 entries; received ${record.length}`);
    }
    return [
      assertFiniteNumber(record[0], 'jdTdb'),
      assertFiniteNumber(record[1], 'xKm'),
      assertFiniteNumber(record[2], 'yKm'),
      assertFiniteNumber(record[3], 'zKm'),
      assertFiniteNumber(record[4], 'vxKmS'),
      assertFiniteNumber(record[5], 'vyKmS'),
      assertFiniteNumber(record[6], 'vzKmS'),
    ];
  }
  return normalizeObjectRecord(record);
}

export function inferCanonicalFrame(frameHint?: string, originHint?: string): FrameId {
  const frame = String(frameHint || '').toUpperCase();
  const origin = String(originHint || '').toUpperCase();

  if (origin.includes('JUPITER-CENTERED')) {
    return FRAME_JUPITER_J2000_ICRF;
  }

  if (origin.includes('SATURN-CENTERED')) {
    return FRAME_SATURN_J2000_ICRF;
  }

  if (origin.includes('MARS-CENTERED')) {
    return FRAME_MARS_J2000_ICRF;
  }

  if (frame.includes('GCRS') || origin.includes('EARTH-CENTERED') || origin.includes('GEOCENTRIC')) {
    return FRAME_GCRS_EARTH;
  }

  return FRAME_HELIO_J2000_ICRF;
}

function isEclipticJ2000Frame(frameHint?: string): boolean {
  const frame = String(frameHint || '').toUpperCase();
  return frame.includes('ECLIPTIC');
}

function rotateEclipticJ2000ToIcrf(vector: CanonicalVector3): CanonicalVector3 {
  const cosObliquity = Math.cos(J2000_ECLIPTIC_OBLIQUITY_RAD);
  const sinObliquity = Math.sin(J2000_ECLIPTIC_OBLIQUITY_RAD);

  return {
    x: vector.x,
    y: vector.y * cosObliquity - vector.z * sinObliquity,
    z: vector.y * sinObliquity + vector.z * cosObliquity,
  };
}

export function convertHorizonsRecord(
  targetKey: string,
  record: HorizonsRecord,
  options?: {
    targetId?: string;
    targetName?: string;
    frame?: string;
    origin?: string;
  },
): CanonicalStateSample {
  const [jdTdb, xKm, yKm, zKm, vxKmS, vyKmS, vzKmS] = normalizeRecord(record);
  const canonicalFrame = inferCanonicalFrame(options?.frame, options?.origin);
  const positionM = {
    x: kilometersToMeters(xKm),
    y: kilometersToMeters(yKm),
    z: kilometersToMeters(zKm),
  };
  const velocityMps = {
    x: kilometersPerSecondToMetersPerSecond(vxKmS),
    y: kilometersPerSecondToMetersPerSecond(vyKmS),
    z: kilometersPerSecondToMetersPerSecond(vzKmS),
  };

  const rotatedPositionM =
    canonicalFrame === FRAME_HELIO_J2000_ICRF && isEclipticJ2000Frame(options?.frame)
      ? rotateEclipticJ2000ToIcrf(positionM)
      : positionM;
  const rotatedVelocityMps =
    canonicalFrame === FRAME_HELIO_J2000_ICRF && isEclipticJ2000Frame(options?.frame)
      ? rotateEclipticJ2000ToIcrf(velocityMps)
      : velocityMps;

  const state = createCanonicalState({
    frame: canonicalFrame,
    tdbSeconds: jdTdbToSecondsSinceJ2000(assertFiniteNumber(jdTdb, 'jdTdb')),
    positionM: rotatedPositionM,
    velocityMps: rotatedVelocityMps,
  });
  assertCanonicalState(state);

  return {
    targetKey,
    targetId: options?.targetId ?? null,
    targetName: options?.targetName ?? null,
    sourceFrame: options?.frame ?? null,
    sourceOrigin: options?.origin ?? null,
    state,
  };
}

export function ingestHorizonsTarget(
  targetKey: string,
  target: HorizonsTargetFixture,
  inherited?: { frame?: string; origin?: string },
): CanonicalStateSample[] {
  if (!target || !Array.isArray(target.records) || target.records.length === 0) {
    throw new Error(`Horizons target "${targetKey}" is missing records`);
  }

  return target.records.map((record) =>
    convertHorizonsRecord(targetKey, record, {
      targetId: target.targetId,
      targetName: target.targetName,
      frame: target.frame ?? inherited?.frame,
      origin: target.origin ?? inherited?.origin,
    }),
  );
}

export function ingestHorizonsFixture(fixture: HorizonsFixture): Record<string, CanonicalStateSample[]> {
  if (!fixture || typeof fixture !== 'object') {
    throw new Error('Horizons fixture must be an object');
  }
  if (!fixture.targets || typeof fixture.targets !== 'object') {
    throw new Error('Horizons fixture must define targets');
  }

  const result: Record<string, CanonicalStateSample[]> = {};
  for (const [targetKey, target] of Object.entries(fixture.targets)) {
    result[targetKey] = ingestHorizonsTarget(targetKey, target, {
      frame: fixture.frame,
      origin: fixture.origin,
    });
  }
  return result;
}

export function ingestSlice2Fixture(fixture: HorizonsFixture): Record<string, CanonicalStateSample[]> {
  const required = ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'];
  for (const key of required) {
    if (!fixture.targets[key]) throw new Error(`Slice 2 fixture missing required body: ${key}`);
  }
  return ingestHorizonsFixture(fixture);
}

export function ingestSlice3Fixture(fixture: HorizonsFixture): Record<string, CanonicalStateSample[]> {
  const required = ['jupiter', 'io', 'europa', 'ganymede', 'callisto'];
  for (const key of required) {
    if (!fixture.targets[key]) throw new Error(`Slice 3 fixture missing required body: ${key}`);
  }
  return ingestHorizonsFixture(fixture);
}

export function ingestSlice4Fixture(fixture: HorizonsFixture): Record<string, CanonicalStateSample[]> {
  const required = ['saturn', 'titan', 'rhea', 'iapetus', 'tethys', 'dione', 'mimas', 'enceladus'];
  for (const key of required) {
    if (!fixture.targets[key]) throw new Error(`Slice 4 fixture missing required body: ${key}`);
  }
  return ingestHorizonsFixture(fixture);
}

export function ingestSlice6Fixture(fixture: HorizonsFixture): Record<string, CanonicalStateSample[]> {
  const required = ['mars', 'phobos', 'deimos'];
  for (const key of required) {
    if (!fixture.targets[key]) throw new Error(`Slice 6 fixture missing required body: ${key}`);
  }
  return ingestHorizonsFixture(fixture);
}

function assertSlice7FixtureShape(fixture: Slice7Fixture): void {
  if (!fixture || typeof fixture !== 'object') {
    throw new Error('Slice 7 fixture must be an object');
  }
  if (!fixture.catalog || typeof fixture.catalog !== 'object') {
    throw new Error('Slice 7 fixture must define catalog summary');
  }
  if (!fixture.propagation || typeof fixture.propagation !== 'object') {
    throw new Error('Slice 7 fixture must define propagation metadata');
  }
  if (!fixture.asteroids || typeof fixture.asteroids !== 'object') {
    throw new Error('Slice 7 fixture must define asteroids');
  }

  const asteroidCount = Object.keys(fixture.asteroids).length;
  if (asteroidCount !== 1008) {
    throw new Error(`Slice 7 fixture must define exactly 1008 asteroids; received ${asteroidCount}`);
  }
  if (fixture.catalog.totalBodies !== 1008) {
    throw new Error(`Slice 7 catalog.totalBodies must equal 1008; received ${fixture.catalog.totalBodies}`);
  }
  if (fixture.catalog.mainBeltCount !== 1000) {
    throw new Error(`Slice 7 catalog.mainBeltCount must equal 1000; received ${fixture.catalog.mainBeltCount}`);
  }
  if (fixture.catalog.curatedNeaCount !== 8) {
    throw new Error(`Slice 7 catalog.curatedNeaCount must equal 8; received ${fixture.catalog.curatedNeaCount}`);
  }
}

function ingestSlice7Asteroid(
  bodyIdKey: string,
  asteroid: Slice7AsteroidFixtureRecord,
  anchorEpochTdbJd: number,
): AsteroidBody {
  const designation = assertNonEmptyString(asteroid.designation, `${bodyIdKey}.designation`);
  const expectedBodyId = `asteroid-${designation}`;
  if (bodyIdKey !== expectedBodyId) {
    throw new Error(`Slice 7 body id mismatch: expected "${expectedBodyId}" but received "${bodyIdKey}"`);
  }

  const estimatedRadiusM = assertFiniteNumber(
    asteroid.estimatedRadiusM,
    `${bodyIdKey}.estimatedRadiusM`,
  );
  const anchorEpoch = assertFiniteNumber(asteroid.anchor?.epochTdbJd, `${bodyIdKey}.anchor.epochTdbJd`);
  const elementsEpoch = assertFiniteNumber(
    asteroid.elements?.epochTdbJd,
    `${bodyIdKey}.elements.epochTdbJd`,
  );

  if (anchorEpoch !== anchorEpochTdbJd) {
    throw new Error(
      `Slice 7 anchor epoch mismatch for "${bodyIdKey}": expected ${anchorEpochTdbJd}, received ${anchorEpoch}`,
    );
  }
  if (elementsEpoch !== anchorEpochTdbJd) {
    throw new Error(
      `Slice 7 elements epoch mismatch for "${bodyIdKey}": expected ${anchorEpochTdbJd}, received ${elementsEpoch}`,
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
      `Slice 7 elementsFrame for "${bodyIdKey}" must be ${FRAME_HELIO_J2000_ECLIPTIC}; received ${elementsFrame}`,
    );
  }

  const anchorState = createCanonicalState({
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
    radiusM: estimatedRadiusM,
  });
  assertCanonicalState(anchorState);

  return {
    bodyId: expectedBodyId as Slice7BodyId,
    bodyClass: 'asteroid',
    designation,
    spkId: assertFiniteNumber(asteroid.spkId, `${bodyIdKey}.spkId`),
    name: asteroid.name ?? null,
    class: assertNonEmptyString(asteroid.class, `${bodyIdKey}.class`),
    isCuratedNea: assertBoolean(asteroid.isCuratedNea, `${bodyIdKey}.isCuratedNea`),
    neo: assertBoolean(asteroid.neo, `${bodyIdKey}.neo`),
    pha: assertBoolean(asteroid.pha, `${bodyIdKey}.pha`),
    H: assertFiniteNumber(asteroid.H, `${bodyIdKey}.H`),
    G:
      asteroid.G === null || typeof asteroid.G === 'undefined'
        ? null
        : assertFiniteNumber(asteroid.G, `${bodyIdKey}.G`),
    estimatedRadiusM,
    anchorState,
    elements: {
      aM: kilometersToMeters(assertFiniteNumber(asteroid.elements?.aKm, `${bodyIdKey}.elements.aKm`)),
      e: assertFiniteNumber(asteroid.elements?.e, `${bodyIdKey}.elements.e`),
      iRad: assertFiniteNumber(asteroid.elements?.iRad, `${bodyIdKey}.elements.iRad`),
      omRad: assertFiniteNumber(asteroid.elements?.omRad, `${bodyIdKey}.elements.omRad`),
      wRad: assertFiniteNumber(asteroid.elements?.wRad, `${bodyIdKey}.elements.wRad`),
      maRad: assertFiniteNumber(asteroid.elements?.maRad, `${bodyIdKey}.elements.maRad`),
      epochTdbSeconds: jdTdbToSecondsSinceJ2000(elementsEpoch),
    },
    elementsFrame: FRAME_HELIO_J2000_ECLIPTIC,
  };
}

export function ingestSlice7Fixture(fixture: Slice7Fixture): Slice7CanonicalFixture {
  assertSlice7FixtureShape(fixture);

  const anchorEpochTdbJd = assertFiniteNumber(
    fixture.propagation.anchorEpochTdbJd,
    'slice7.propagation.anchorEpochTdbJd',
  );
  const asteroids = Object.fromEntries(
    Object.entries(fixture.asteroids).map(([bodyId, asteroid]) => [
      bodyId,
      ingestSlice7Asteroid(bodyId, asteroid, anchorEpochTdbJd),
    ]),
  ) as Record<Slice7BodyId, AsteroidBody>;

  return {
    selectionSource: fixture.selectionSource ?? null,
    anchorSource: fixture.anchorSource ?? null,
    frame: FRAME_HELIO_J2000_ICRF,
    timeScale: fixture.timeScale ?? null,
    propagation: {
      method: assertNonEmptyString(fixture.propagation.method, 'slice7.propagation.method'),
      anchorEpochTdbSeconds: jdTdbToSecondsSinceJ2000(anchorEpochTdbJd),
    },
    catalog: {
      totalBodies: assertFiniteNumber(fixture.catalog.totalBodies, 'slice7.catalog.totalBodies'),
      mainBeltCount: assertFiniteNumber(fixture.catalog.mainBeltCount, 'slice7.catalog.mainBeltCount'),
      curatedNeaCount: assertFiniteNumber(
        fixture.catalog.curatedNeaCount,
        'slice7.catalog.curatedNeaCount',
      ),
      mainBeltCutoffH: assertFiniteNumber(
        fixture.catalog.mainBeltCutoffH,
        'slice7.catalog.mainBeltCutoffH',
      ),
    },
    asteroids,
  };
}

function assertAlignedTimesteps(earth: CanonicalStateSample[], moon: CanonicalStateSample[]): void {
  if (earth.length !== moon.length) {
    throw new Error(`Slice 1 Earth/Moon fixtures must have matching sample counts (${earth.length} vs ${moon.length})`);
  }

  for (let i = 0; i < earth.length; i++) {
    if (earth[i].state.tdbSeconds !== moon[i].state.tdbSeconds) {
      throw new Error(`Slice 1 Earth/Moon fixture timestep mismatch at index ${i}`);
    }
  }
}

export function ingestSlice1EarthMoonFixture(fixture: HorizonsFixture): Slice1EarthMoonCanonicalFixture {
  const allTargets = ingestHorizonsFixture(fixture);
  const earth = allTargets.earth;
  const moon = allTargets.moon;

  if (!earth || !moon) {
    throw new Error('Slice 1 Earth/Moon fixture must define both "earth" and "moon" targets');
  }

  assertAlignedTimesteps(earth, moon);

  for (const sample of [...earth, ...moon]) {
    if (sample.state.frame !== FRAME_HELIO_J2000_ICRF) {
      throw new Error(`Slice 1 expects heliocentric Horizons vectors; received ${sample.state.frame} for ${sample.targetKey}`);
    }
  }

  return {
    source: fixture.source ?? null,
    frame: FRAME_HELIO_J2000_ICRF,
    earth,
    moon,
  };
}
