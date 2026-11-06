/**
 * OrbitSource backed by a committed JSON fixture (three bodies copied verbatim
 * from the Slice 9 NEA catalog).
 *
 * Honesty layer: `asOf` is the element EPOCH recorded in the fixture (the
 * catalog carries no fetch date), and the module says so rather than inventing
 * one. The fixture is passed in already parsed, as every boundary ingester in
 * this repo does, so this module performs no I/O. Unit conversion reuses
 * src/v2/core/units (km → m, JD TDB → seconds since J2000).
 */
import { jdTdbToSecondsSinceJ2000, kilometersToMeters } from '../core/units.js';
import { OrbitSourceError, type OrbitSource, type SourcedOrbitalElements } from './adapter.js';

export interface FixtureOrbitRecord {
  readonly designation: string;
  readonly name: string | null;
  readonly spkId: number;
  readonly elementsFrame: string;
  readonly anchorSource: string;
  readonly elements: {
    readonly aKm: number;
    readonly e: number;
    readonly iRad: number;
    readonly omRad: number;
    readonly wRad: number;
    readonly maRad: number;
    readonly epochTdbJd: number;
  };
}

export interface FixtureOrbitFile {
  readonly source: string;
  readonly note: string;
  /** ISO-8601 date; the element epoch, as the note states. */
  readonly asOf: string;
  readonly frame: string;
  readonly timeScale: string;
  readonly bodies: Readonly<Record<string, FixtureOrbitRecord>>;
}

export const FIXTURE_ORBIT_SOURCE_ID = 'fixture-orbits';

export function fixtureRecordToElements(record: FixtureOrbitRecord, asOf: string, source: string): SourcedOrbitalElements {
  const elements = record.elements;
  for (const [key, value] of Object.entries(elements)) {
    if (!Number.isFinite(value)) {
      throw new OrbitSourceError('malformed', FIXTURE_ORBIT_SOURCE_ID, record.designation, `non-finite element ${key}`);
    }
  }
  return {
    aM: kilometersToMeters(elements.aKm),
    e: elements.e,
    iRad: elements.iRad,
    omRad: elements.omRad,
    wRad: elements.wRad,
    maRad: elements.maRad,
    epochTdbSeconds: jdTdbToSecondsSinceJ2000(elements.epochTdbJd),
    asOf,
    source,
    elementsFrame: record.elementsFrame,
  };
}

export class FixtureOrbitSource implements OrbitSource {
  readonly id = FIXTURE_ORBIT_SOURCE_ID;
  private readonly file: FixtureOrbitFile;

  constructor(file: FixtureOrbitFile) {
    if (!file || typeof file !== 'object' || !file.bodies || typeof file.asOf !== 'string') {
      throw new TypeError('FixtureOrbitSource needs a parsed fixture with asOf and bodies');
    }
    this.file = file;
  }

  designations(): readonly string[] {
    return Object.keys(this.file.bodies);
  }

  async fetchElements(designation: string): Promise<SourcedOrbitalElements> {
    const record = this.file.bodies[designation];
    if (!record) {
      throw new OrbitSourceError('not-found', this.id, designation, 'not in the committed fixture');
    }
    return fixtureRecordToElements(record, this.file.asOf, `committed fixture: ${this.file.source}`);
  }
}
