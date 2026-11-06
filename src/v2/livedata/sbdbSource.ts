/**
 * OrbitSource against JPL SBDB, scaffold only. NOT called anywhere in the app.
 *
 * Honesty layer — what this is and is not:
 *   - Flag-gated OFF (src/v2/flags.ts LIVE_DATA_ENABLED). No page imports it.
 *   - The request/response shape targets the SBDB **Query API**
 *     (https://ssd-api.jpl.nasa.gov/sbdb_query.api, `{fields: string[], data: unknown[][]}`),
 *     because that is the shape this repository has already parsed in production
 *     tooling (tools/slice7-research/fetch-sbdb.mjs). The dispatch named the
 *     single-object endpoint sbdb.api; its response shape has no committed capture,
 *     so it is NOT assumed here. The base URL is a constructor option so a slice
 *     can retarget it once a live capture is committed as a fixture (OQ-21-4).
 *   - Units as SBDB publishes them: a in AU, angles in degrees, epoch as JD (TDB).
 *     Converted to the repo's AsteroidOrbitalElements (metres, radians, seconds
 *     since J2000) with the repo's own unit helpers. The AU value is IAU 2012
 *     (149 597 870 700 m) and is stated here because src/v2/core does not export one.
 *   - `asOf` is the element epoch SBDB reports, rendered as a TDB calendar date.
 *   - Timeout 10 s via AbortController; every failure is an OrbitSourceError (the fetch
 *     response, the JSON, each row and each cell are validated; any other throw inside the
 *     parser is re-wrapped as 'malformed').
 *   - The row whose `pdes` equals the requested designation is used; a payload with rows for
 *     other bodies only is 'not-found', never silently another body's elements.
 *   - Tests use an injected fetch; no network is touched in tests.
 */
import { jdTdbToSecondsSinceJ2000, SECONDS_PER_DAY } from '../core/units.js';
import { OrbitSourceError, type OrbitSource, type SourcedOrbitalElements } from './adapter.js';

export const SBDB_QUERY_API_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';
export const SBDB_ORBIT_SOURCE_ID = 'jpl-sbdb-query';
export const SBDB_DEFAULT_TIMEOUT_MS = 10_000;
/** IAU 2012 astronomical unit, metres. */
export const ASTRONOMICAL_UNIT_M = 149_597_870_700;
const DEGREES_TO_RADIANS = Math.PI / 180;
const SBDB_FIELDS = ['pdes', 'full_name', 'epoch', 'e', 'a', 'i', 'om', 'w', 'ma'] as const;

type FetchLike = (input: string, init?: { signal?: AbortSignal }) => Promise<{
  readonly ok: boolean;
  readonly status: number;
  json(): Promise<unknown>;
}>;

export interface SbdbOrbitSourceOptions {
  readonly fetchImpl?: FetchLike;
  readonly timeoutMs?: number;
  readonly baseUrl?: string;
}

/** The subset of an SBDB Query API payload this source reads. */
export interface SbdbQueryPayload {
  readonly fields: readonly string[];
  readonly data: readonly (readonly (string | number | null)[])[];
}

export function buildSbdbQueryUrl(designation: string, baseUrl: string = SBDB_QUERY_API_URL): string {
  const params = new URLSearchParams({
    fields: SBDB_FIELDS.join(','),
    'sb-cdata': JSON.stringify({ AND: [`pdes|EQ|${designation}`] }),
    'full-prec': 'true',
  });
  return `${baseUrl}?${params.toString()}`;
}

function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  // SBDB delivers numbers as strings; an empty or whitespace cell is a missing value, not 0
  // (Number('') === 0). Same guard as tools/slice7-research/fetch-sbdb.mjs.
  const text = String(value).trim();
  if (text === '') return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Epochs outside this JD window (years ~763 to ~3501) cannot be a real SBDB osculating epoch. */
const EPOCH_JD_MIN = 2_000_000;
const EPOCH_JD_MAX = 3_000_000;

function tdbJdToIsoDate(jdTdb: number): string {
  // Calendar date of a TDB Julian Date; TDB−UTC (~69 s) is ignored for a date label.
  const unixMillis = (jdTdb - 2_440_587.5) * SECONDS_PER_DAY * 1000;
  return new Date(unixMillis).toISOString().slice(0, 10);
}

/** Pure parser from a Query API payload row to SourcedOrbitalElements. Exported for tests. */
export function parseSbdbQueryPayload(payload: unknown, designation: string): SourcedOrbitalElements {
  if (!payload || typeof payload !== 'object') {
    throw new OrbitSourceError('malformed', SBDB_ORBIT_SOURCE_ID, designation, 'payload is not an object');
  }
  const { fields, data } = payload as Partial<SbdbQueryPayload>;
  if (!Array.isArray(fields) || !Array.isArray(data)) {
    throw new OrbitSourceError('malformed', SBDB_ORBIT_SOURCE_ID, designation, 'payload lacks fields/data arrays');
  }
  if (data.length === 0) {
    throw new OrbitSourceError('not-found', SBDB_ORBIT_SOURCE_ID, designation, 'no matching body');
  }
  const pdesIndex = fields.indexOf('pdes');
  if (pdesIndex < 0) {
    throw new OrbitSourceError('malformed', SBDB_ORBIT_SOURCE_ID, designation, 'payload lacks a pdes column');
  }
  const wanted = designation.trim();
  let row: readonly (string | number | null)[] | undefined;
  for (const candidate of data) {
    if (!Array.isArray(candidate)) {
      throw new OrbitSourceError('malformed', SBDB_ORBIT_SOURCE_ID, designation, 'a data row is not an array');
    }
    const pdes = candidate[pdesIndex];
    if (pdes !== null && pdes !== undefined && String(pdes).trim() === wanted) {
      row = candidate;
      break;
    }
  }
  if (row === undefined) {
    throw new OrbitSourceError('not-found', SBDB_ORBIT_SOURCE_ID, designation, `no row with pdes = ${wanted}`);
  }
  const selected = row;
  const column = (name: (typeof SBDB_FIELDS)[number]): number | null => {
    const index = fields.indexOf(name);
    return index < 0 ? null : parseNumber(selected[index] ?? null);
  };
  const aAu = column('a');
  const e = column('e');
  const iDeg = column('i');
  const omDeg = column('om');
  const wDeg = column('w');
  const maDeg = column('ma');
  const epochJd = column('epoch');
  const values = { aAu, e, iDeg, omDeg, wDeg, maDeg, epochJd };
  for (const [key, value] of Object.entries(values)) {
    if (value === null) {
      throw new OrbitSourceError('malformed', SBDB_ORBIT_SOURCE_ID, designation, `missing or non-numeric ${key}`);
    }
  }
  if ((epochJd as number) < EPOCH_JD_MIN || (epochJd as number) > EPOCH_JD_MAX) {
    throw new OrbitSourceError('malformed', SBDB_ORBIT_SOURCE_ID, designation, `epoch JD ${epochJd} is outside ${EPOCH_JD_MIN}..${EPOCH_JD_MAX}`);
  }
  return {
    aM: (aAu as number) * ASTRONOMICAL_UNIT_M,
    e: e as number,
    iRad: (iDeg as number) * DEGREES_TO_RADIANS,
    omRad: (omDeg as number) * DEGREES_TO_RADIANS,
    wRad: (wDeg as number) * DEGREES_TO_RADIANS,
    maRad: (maDeg as number) * DEGREES_TO_RADIANS,
    epochTdbSeconds: jdTdbToSecondsSinceJ2000(epochJd as number),
    asOf: tdbJdToIsoDate(epochJd as number),
    source: 'JPL SBDB Query API',
    // SBDB osculating elements are heliocentric ecliptic J2000, the frame the catalog records as
    // FRAME_HELIO_J2000_ECLIPTIC (tests/fixtures/v2/nea-catalog-slice9.json elementsFrame).
    elementsFrame: 'FRAME_HELIO_J2000_ECLIPTIC',
  };
}

export class SbdbOrbitSource implements OrbitSource {
  readonly id = SBDB_ORBIT_SOURCE_ID;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private readonly baseUrl: string;

  constructor(options: SbdbOrbitSourceOptions = {}) {
    const fallback = (globalThis as { fetch?: FetchLike }).fetch;
    const fetchImpl = options.fetchImpl ?? fallback;
    if (typeof fetchImpl !== 'function') {
      throw new TypeError('SbdbOrbitSource needs a fetch implementation');
    }
    this.fetchImpl = fetchImpl;
    this.timeoutMs = options.timeoutMs ?? SBDB_DEFAULT_TIMEOUT_MS;
    this.baseUrl = options.baseUrl ?? SBDB_QUERY_API_URL;
  }

  async fetchElements(designation: string): Promise<SourcedOrbitalElements> {
    if (typeof designation !== 'string' || designation.trim() === '') {
      throw new OrbitSourceError('malformed', this.id, designation, 'designation must be a non-empty string');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      let response;
      try {
        response = await this.fetchImpl(buildSbdbQueryUrl(designation, this.baseUrl), { signal: controller.signal });
      } catch (error) {
        const aborted = controller.signal.aborted;
        throw new OrbitSourceError(aborted ? 'timeout' : 'network', this.id, designation,
          aborted ? `no response within ${this.timeoutMs} ms` : `fetch failed: ${describe(error)}`);
      }
      if (!response || typeof response !== 'object') {
        throw new OrbitSourceError('network', this.id, designation, 'fetch resolved without a response object');
      }
      if (!response.ok) {
        throw new OrbitSourceError('network', this.id, designation, `HTTP ${response.status}`);
      }
      let payload: unknown;
      try {
        payload = await response.json();
      } catch (error) {
        throw new OrbitSourceError('malformed', this.id, designation, `invalid JSON: ${describe(error)}`);
      }
      try {
        return parseSbdbQueryPayload(payload, designation);
      } catch (error) {
        if (error instanceof OrbitSourceError) throw error;
        throw new OrbitSourceError('malformed', this.id, designation, `unparseable payload: ${describe(error)}`);
      }
    } finally {
      clearTimeout(timer);
    }
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

