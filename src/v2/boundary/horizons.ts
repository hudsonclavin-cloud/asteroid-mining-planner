import {
  FRAME_HELIO_J2000_ICRF,
  FRAME_GCRS_EARTH,
  J2000_ECLIPTIC_OBLIQUITY_RAD,
  assertCanonicalState,
  createCanonicalState,
  jdTdbToSecondsSinceJ2000,
  kilometersPerSecondToMetersPerSecond,
  kilometersToMeters,
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
