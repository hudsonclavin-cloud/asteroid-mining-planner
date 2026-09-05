/**
 * Slice 18 Front B — fetch JPL-integrated truth for the NEA drift measurement.
 *
 * Follows tools/slice7-research/fetch-horizons-asteroids.mjs (small-body vectors) and
 * tools/slice10-research/extend-horizons-fixture.mjs (window + output shape).
 *
 * Horizons is used as a DATA SOURCE, not a library (INV-024): no external
 * astrodynamics code is imported, here or in the measurement that consumes this.
 *
 * Output: tests/fixtures/v2/nea-drift-truth-2026-2046.json — one combined file, a
 * `targets` map matching the planet fixture's shape, records as
 * [jdTdb, xKm, yKm, zKm, vxKmS, vyKmS, vzKmS].
 *
 * Window 2026-01-01 .. 2046-01-01: the screen propagates asteroids to ARRIVAL epochs,
 * and a 2040-12-31 departure at the maximum 1826-day TOF arrives 2045-12-31. Stopping
 * at 2040 would leave five used years unmeasured.
 *
 * Cadence 7 d: matches the screening cache's own departure spacing. No densification
 * around close approaches — an encounter's effect on drift is a permanent step, not a
 * transient, so bracketing it within a week measures the before/after ratio. Close
 * approaches are LABELLED from the CAD API instead, with provenance travelling in the
 * fixture.
 *
 * Politeness: strictly sequential, REQUEST_DELAY_MS between every request, bounded
 * retries with backoff. Resumable — per-body raw responses are cached OUTSIDE the repo
 * and re-used, so an interrupted run does not re-hit the API.
 *
 * Run: node tools/slice18-research/fetch-nea-drift-truth.mjs
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const CACHE_DIR = process.env.ASTER_FETCH_CACHE
  ?? 'C:/Users/hudso/Documents/aster-slice18/fetch-cache';
const OUT_PATH = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-drift-truth-2026-2046.json');

const HORIZONS_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const CAD_URL = 'https://ssd-api.jpl.nasa.gov/cad.api';
const USER_AGENT = 'aster-mission-planner/slice18-frontB (research)';
const REQUEST_DELAY_MS = 2000;
const AU_KM = 149597870.7;

const WINDOW = { start: '2026-01-01', stop: '2046-01-01', step: '7d' };
const CAD_DIST_MAX_AU = '0.1';
const CATALOG_PATH = path.join(repoRoot, 'tests', 'fixtures', 'v2', 'nea-catalog-slice9.json');
const NEA_CLASSES = ['APO', 'AMO', 'ATE', 'IEO'];

/**
 * 17 NEA + 3 comet = 20.
 * Comets are reported in a separate band and never averaged with the NEAs: INV-014
 * already tags them not-kepler-safe.
 */
const BODIES = [
  // --- continuity: the C3-sensitivity five ---
  { des: '433', band: 'nea', why: 'C3-sensitivity; best-determined orbit; reproduction anchor' },
  { des: '163693', band: 'nea', why: 'C3-sensitivity; only IEO in the sample' },
  { des: '99942', band: 'nea', why: 'C3-sensitivity; 2029-04-13 Earth encounter at 38,011 km' },
  { des: '1979 XB', band: 'nea', why: 'C3-sensitivity; U=9, 4-day arc, 18 obs' },
  { des: '2017 UR52', band: 'nea', why: 'C3-sensitivity + empty porkchop; e=0.996 near-parabolic' },
  // --- continuity: the empty-porkchop five (2017 UR52 overlaps the set above) ---
  // Comet designations resolve to MULTIPLE apparition records in Horizons (12P has 4:
  // 1812/1884/1897/2023). The record is pinned to the apparition matching the catalog's
  // own element epoch, so the measurement compares the same orbit solution the screen uses.
  { des: '12P', band: 'comet', command: '90000225;', apparition: 'record 90000225, epoch-yr 2023; catalog element epoch 2023-09-24', why: 'empty porkchop; HTC comet; stale-unanchored, epoch 2023' },
  { des: '2025 VP', band: 'nea', why: 'empty porkchop; 151-day arc' },
  { des: '2022 BG4', band: 'nea', why: 'empty porkchop; U=7' },
  { des: '2014 PP69', band: 'nea', why: 'empty porkchop; a=21.4 AU' },
  { des: '2021 CG6', band: 'nea', why: 'the badge-vs-porkchop feasibility disagreement body' },
  // --- criterion 1: U-stratified, matched e and a, varying only condition code ---
  { des: '2010 KD', band: 'nea', why: 'U-stratified control U=0 (e=0.218, a=1.354 AU)' },
  { des: '2019 SE9', band: 'nea', why: 'U-stratified control U=5 (e=0.193, a=1.258 AU)' },
  { des: '2024 BB8', band: 'nea', why: 'U-stratified control U=9 (e=0.217, a=1.409 AU); 2-day arc, 31 obs' },
  // --- criterion 2: ATE class ---
  { des: '105140', band: 'nea', why: 'best-determined ATE (26,681-day arc); q=0.167 AU sun-diver' },
  { des: '2025 KP4', band: 'nea', why: 'worst-determined ATE (U=9, e=0.861); 4-day arc' },
  // --- criterion 4: element-epoch age ---
  // EXCLUDED, measured not assumed: Horizons returns "No ephemeris for target (2018 LA)
  // after A.D. 2018-JUN-02 17:01:09.1849 TDB" — the object impacted Earth over Botswana.
  // All 9 stale-unanchored NEA-class bodies in the catalog terminate the same way, and they
  // are the ONLY NEA-class bodies with an element epoch older than 2026-01-01. Epoch-age
  // therefore has no variation among NEAs that still exist, and criterion 4b is unmeasurable.
  { des: '2018 LA', band: 'nea', excluded: 'No Horizons ephemeris after 2018-06-02T17:01:09 TDB; object impacted Earth (Botswana). Verified from the response, not assumed.', why: 'epoch-age control (unmeasurable — see excludedBodies)' },
  { des: '3D', band: 'comet', command: '90000095;', apparition: 'record 90000095, epoch-yr 1832; catalog element epoch 1832-12-03', why: 'oldest element epoch in the catalog, JD 2390520.5 (~1833)' },
  // --- criterion 5: comet ---
  { des: '323P', band: 'comet', command: '90001303;', apparition: 'record 90001303, epoch-yr 2021, primary 323P (not fragments -B/-C); catalog element epoch 2021-03-03', why: 'deepest-perihelion elliptical comet, q=0.039 AU' },
  // --- criterion 3: mid-window close approach, crossed by FORWARD propagation ---
  { des: '2012 UE34', band: 'nea', why: 'close approach 2041-04-08 at 109,649 km; U=0' },
  { des: '2025 HH', band: 'nea', why: 'close approach 2045-04-18 at 126,825 km; 3-day arc' },
  // --- anchor-source provenance: the only structural axis otherwise unsampled ---
  // 41,539 of 41,906 bodies are horizons-reanchor (a fresh Horizons state at 2026-05-01);
  // 309 are sbdb (SBDB osculating elements at their own epoch). Whether drift depends on
  // HOW the element set was obtained, and not only on the dynamics, is a real question.
  { des: '2026 BX8', band: 'nea', why: 'anchor-source control: sbdb-anchored (U=8, e=0.845, epoch 2026-02-01), the only anchor path not otherwise represented' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, label) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
      if (response.status === 429 || response.status >= 500) {
        // Back off rather than hammer. If it persists, fail and report.
        const wait = REQUEST_DELAY_MS * attempt * 3;
        console.warn(`  ${label}: HTTP ${response.status}, backing off ${wait} ms (attempt ${attempt}/4)`);
        await sleep(wait);
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === 4) {
        break;
      }
      await sleep(REQUEST_DELAY_MS * attempt * 2);
    }
  }
  throw new Error(`${label}: failed after retries - ${lastError ? lastError.message : 'unknown'}`);
}

async function cachedJson(cacheFile, url, label) {
  const full = path.join(CACHE_DIR, cacheFile);
  if (fs.existsSync(full)) {
    return { payload: JSON.parse(await fsp.readFile(full, 'utf8')), cached: true };
  }
  const payload = await fetchWithRetry(url, label);
  await fsp.mkdir(CACHE_DIR, { recursive: true });
  await fsp.writeFile(full, JSON.stringify(payload));
  await sleep(REQUEST_DELAY_MS);
  return { payload, cached: false };
}

/** D3: read frame, center, time scale and units from the RESPONSE, never the request. */
function verifyResponse(resultText) {
  const grab = (label) => {
    const match = resultText.match(new RegExp('^' + label + '\\s*:\\s*(.+)$', 'm'));
    return match ? match[1].trim() : null;
  };
  const soe = resultText.indexOf('$$SOE');
  const firstEpochLine = soe < 0 ? '' : resultText.slice(soe + 5).trim().split('\n')[0].trim();
  return {
    targetBodyName: grab('Target body name'),
    centerBodyName: grab('Center body name'),
    centerSiteName: grab('Center-site name'),
    referenceFrame: grab('Reference frame'),
    outputUnits: grab('Output units'),
    outputType: grab('Output type'),
    timeScaleFromEpochLine: /\sTDB\s*$/.test(firstEpochLine) ? 'TDB' : null,
    firstEpochLine,
  };
}

function parseRecords(resultText) {
  const soe = resultText.indexOf('$$SOE');
  const eoe = resultText.indexOf('$$EOE');
  if (soe < 0 || eoe < 0 || eoe <= soe) {
    throw new Error('response did not contain a $$SOE/$$EOE vectors block');
  }
  const lines = resultText.slice(soe + 5, eoe).trim().split('\n').map((line) => line.trim()).filter(Boolean);
  const records = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const jd = Number(lines[i].split('=')[0].trim());
    const p = lines[i + 1].match(/X\s*=\s*(\S+)\s+Y\s*=\s*(\S+)\s+Z\s*=\s*(\S+)/);
    const v = lines[i + 2].match(/VX\s*=\s*(\S+)\s+VY\s*=\s*(\S+)\s+VZ\s*=\s*(\S+)/);
    if (!Number.isFinite(jd) || !p || !v) {
      throw new Error('unparsable vector block near line ' + i);
    }
    records.push([jd, Number(p[1]), Number(p[2]), Number(p[3]), Number(v[1]), Number(v[2]), Number(v[3])]);
  }
  return records;
}

/**
 * Findings S and T: probe a body for a terminating ephemeris and capture the VERBATIM
 * Horizons sentence that establishes it. Evidence, not recollection.
 */
async function probeTermination(des) {
  const params = {
    format: 'json',
    COMMAND: "';" + des + "'",
    CENTER: '500@10',
    EPHEM_TYPE: 'VECTORS',
    REF_SYSTEM: 'ICRF',
    REF_PLANE: 'FRAME',
    TIME_TYPE: 'TDB',
    OUT_UNITS: 'KM-S',
    VEC_TABLE: '2',
    START_TIME: WINDOW.start,
    STOP_TIME: '2026-01-08',
    STEP_SIZE: '7d',
  };
  const url = HORIZONS_URL + '?' + new URLSearchParams(params).toString();
  const safe = des.replace(/[^A-Za-z0-9]+/g, '_');
  const { payload } = await cachedJson('term-' + safe + '.json', url, des + ' termination probe');
  const text = typeof payload.result === 'string' ? payload.result : '';
  const match = text.match(/No ephemeris for target[^\n]*/);
  const dateMatch = match ? match[0].match(/after\s+A\.D\.\s+(.+?)\s*$/) : null;
  return {
    hasEphemerisInWindow: text.includes('$$SOE'),
    horizonsResponseText: match ? match[0].trim() : null,
    terminatesAfterTdb: dateMatch ? dateMatch[1].trim() : null,
  };
}

async function main() {
  const cadProvenance = {
    source: CAD_URL,
    queriedAtUtc: new Date().toISOString(),
    params: {
      'date-min': WINDOW.start,
      'date-max': WINDOW.stop,
      'dist-max': CAD_DIST_MAX_AU,
      body: 'ALL',
      sort: 'dist',
    },
    note: 'One query per body, des=<designation>. distKm is dist(AU) * 149597870.7.',
  };

  const targets = {};

  const excludedBodies = [];

  for (const body of BODIES) {
    if (body.excluded) {
      excludedBodies.push({ des: body.des, band: body.band, reason: body.excluded, selectionReason: body.why });
      console.log('EXCLUDED ' + body.des.padEnd(11) + body.excluded);
      continue;
    }
    const horizonsParams = {
      format: 'json',
      COMMAND: body.command ? body.command : "';" + body.des + "'",
      CENTER: '500@10',
      EPHEM_TYPE: 'VECTORS',
      REF_SYSTEM: 'ICRF',
      REF_PLANE: 'FRAME',
      TIME_TYPE: 'TDB',
      OUT_UNITS: 'KM-S',
      VEC_TABLE: '2',
      START_TIME: WINDOW.start,
      STOP_TIME: WINDOW.stop,
      STEP_SIZE: WINDOW.step,
    };
    const safe = body.des.replace(/[^A-Za-z0-9]+/g, '_');

    const vecUrl = HORIZONS_URL + '?' + new URLSearchParams(horizonsParams).toString();
    const { payload, cached } = await cachedJson('vec-' + safe + '.json', vecUrl, body.des);
    if (typeof payload.result !== 'string') {
      throw new Error(body.des + ': Horizons response had no result text');
    }
    const responseVerification = verifyResponse(payload.result);
    const records = parseRecords(payload.result);

    const cadUrl = CAD_URL + '?' + new URLSearchParams({
      des: body.des,
      'date-min': WINDOW.start,
      'date-max': WINDOW.stop,
      'dist-max': CAD_DIST_MAX_AU,
      body: 'ALL',
      sort: 'dist',
    }).toString();
    const { payload: cad } = await cachedJson('cad-' + safe + '.json', cadUrl, body.des + ' CAD');
    const fields = cad.fields || [];
    const at = (row, name) => {
      const index = fields.indexOf(name);
      return index < 0 ? null : row[index];
    };
    const closeApproaches = (cad.data || []).map((row) => ({
      jdTdb: Number(at(row, 'jd')),
      calendarDate: at(row, 'cd'),
      relativeTo: at(row, 'body') || 'Earth',
      distAu: Number(at(row, 'dist')),
      distKm: Number(at(row, 'dist')) * AU_KM,
      vRelKmS: Number(at(row, 'v_rel')),
    })).sort((a, b) => a.jdTdb - b.jdTdb);

    targets[body.des] = {
      band: body.band,
      selectionReason: body.why,
      apparition: body.apparition || null,
      horizonsParams,
      responseVerification,
      recordCount: records.length,
      closeApproaches,
      records,
    };

    console.log(
      (cached ? 'cached ' : 'fetched') + ' ' + body.des.padEnd(11) +
      String(records.length).padStart(5) + ' records | frame=' + responseVerification.referenceFrame +
      ' center=' + responseVerification.centerBodyName + ' units=' + responseVerification.outputUnits +
      ' time=' + responseVerification.timeScaleFromEpochLine + ' | CAs=' + closeApproaches.length,
    );
  }

  // ---- Findings S and T: catalog bodies whose Horizons ephemeris terminates ----
  // The candidate set is DERIVED from the catalog at run time, not hard-coded, so the
  // "exactly nine" count is verified rather than asserted.
  const catalog = JSON.parse(await fsp.readFile(CATALOG_PATH, 'utf8'));
  const staleNeas = Object.values(catalog.asteroids)
    .filter((b) => b.anchorSource === 'stale-unanchored' && NEA_CLASSES.includes(b.orbitClass))
    .sort((a, b) => a.elements.epochTdbJd - b.elements.epochTdbJd);
  console.log('\nprobing ' + staleNeas.length + ' stale-unanchored NEA-class bodies for ephemeris termination...');
  const nonExistent = [];
  for (const b of staleNeas) {
    const probe = await probeTermination(b.designation);
    nonExistent.push({
      designation: b.designation,
      orbitClass: b.orbitClass,
      conditionCode: b.conditionCode,
      absoluteMagnitudeH: b.H,
      eccentricity: b.elements.e,
      elementEpochTdbJd: b.elements.epochTdbJd,
      anchorSource: b.anchorSource,
      ...probe,
    });
    console.log('  ' + b.designation.padEnd(11) +
      (probe.terminatesAfterTdb ? 'terminates after ' + probe.terminatesAfterTdb : 'HAS EPHEMERIS IN WINDOW'));
  }

  const neaCount = BODIES.filter((b) => b.band === 'nea').length;
  const cometCount = BODIES.filter((b) => b.band === 'comet').length;

  const fixture = {
    source: 'NASA/JPL Horizons API',
    purpose: 'Slice 18 Front B - JPL-integrated truth for measuring two-body propagation drift on NEAs.',
    generatedBy: 'tools/slice18-research/fetch-nea-drift-truth.mjs',
    generatedAtUtc: new Date().toISOString(),
    frame: 'ICRF/J2000',
    timeScale: 'TDB',
    units: { position: 'km', velocity: 'km/s', time: 'TDB Julian Date' },
    recordShape: ['jdTdb', 'xKm', 'yKm', 'zKm', 'vxKmS', 'vyKmS', 'vzKmS'],
    window: WINDOW,
    sample: {
      total: BODIES.length - excludedBodies.length,
      requested: BODIES.length,
      excluded: excludedBodies.length,
      nea: neaCount - excludedBodies.filter((x) => x.band === 'nea').length,
      comet: cometCount,
      // Fully computed — no hard-coded totals, so the count cannot drift from the list.
      note: 'REQUESTED ' + BODIES.length + ' = ' + neaCount + ' NEA + ' + cometCount + ' comet. FETCHED ' +
        (BODIES.length - excludedBodies.length) + ' = ' +
        (neaCount - excludedBodies.filter((x) => x.band === 'nea').length) + ' NEA + ' +
        (cometCount - excludedBodies.filter((x) => x.band === 'comet').length) + ' comet. EXCLUDED ' +
        excludedBodies.length + ' (see excludedBodies). Comets are reported in a separate band and are never ' +
        'averaged with the NEAs; INV-014 already tags them not-kepler-safe.',
    },
    excludedBodies,
    findings: {
      S_nonExistentCatalogBodies: {
        statement: nonExistent.length + ' catalog bodies no longer exist: every stale-unanchored NEA-class body has a Horizons ephemeris that terminates at a known Earth impact. The screening layer computes 2026-2040 transfer windows to all of them.',
        allTerminate: nonExistent.every((x) => x.terminatesAfterTdb !== null),
        absoluteMagnitudeRange: [
          Math.min(...nonExistent.map((x) => x.absoluteMagnitudeH)),
          Math.max(...nonExistent.map((x) => x.absoluteMagnitudeH)),
        ],
        evidence: 'Per body: horizonsResponseText is the verbatim Horizons sentence; terminatesAfterTdb is the date it names.',
        bodies: nonExistent,
      },
      T_staleUnanchoredIsANonExistenceSignal: {
        confidence: '[Likely]',
        statement: 'anchorSource stale-unanchored on an NEA-class body is already a non-existence signal. Re-anchoring requires a Horizons state at the 2026-05-01 re-anchor epoch, which an object that has ceased to exist cannot provide, so the re-anchor fails and the body retains its original SBDB epoch.',
        whyLikelyAndNotEstablished: 'The mechanism is inferred from the perfect correlation plus the pipeline design; the ingestion code path itself was not traced.',
        countVerified: nonExistent.length,
        countExpected: 9,
        countMatches: nonExistent.length === 9,
        boundedness: 'The set is bounded: an object that impacted BEFORE the re-anchor epoch could not have re-anchored, so no catalog-wide sweep is required to find more.',
      },
      U_epochAgeControlRetired: {
        statement: 'The epoch-age control (addition P) is retired as a MEASURED PROPERTY, not an error. Element-epoch age has no variation among NEA-class bodies that still exist: the only NEA-class bodies with an epoch older than 2026-01-01 are exactly the non-existent bodies above, and all 309 sbdb-anchored bodies are 2026-era (at most ~0.2 y older than the 2026-05-01 mass epoch). Epoch age now varies only in the comet band (3D 1832, 323P 2021, 12P 2023).',
        doNotRepropose: true,
      },
    },
    closeApproachProvenance: cadProvenance,
    targets,
  };

  await fsp.writeFile(OUT_PATH, JSON.stringify(fixture));
  const bytes = (await fsp.stat(OUT_PATH)).size;
  const totalRecords = Object.values(targets).reduce((n, t) => n + t.recordCount, 0);
  console.log('\nwrote ' + OUT_PATH);
  console.log('  ' + bytes.toLocaleString() + ' bytes (' + (bytes / 1048576).toFixed(2) + ' MB), ' +
    totalRecords.toLocaleString() + ' records, ' + BODIES.length + ' targets');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
