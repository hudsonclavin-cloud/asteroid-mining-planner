// The exact JPL queries this run uses, and their parsers. Every request goes through lib/jpl.mjs.
//
// NHATS (docs: https://ssd-api.jpl.nasa.gov/doc/nhats.html, API version 1.3):
//   object detail, default constraints:  https://ssd-api.jpl.nasa.gov/nhats.api?des=<designation>
//   summary, default constraints:        https://ssd-api.jpl.nasa.gov/nhats.api
//   Each object record carries min_dv_traj and min_dur_traj (launch YYYY-MM-DD, dur_out / dur_at / dur_ret
//   in days, c3, v_dep_earth, dv_dep_park, vrel_arr_neo, vrel_dep_neo, vrel_arr_earth, v_arr_earth,
//   dv_total, dec_dep, dec_arr) plus orbit_id and computed (the analysis date).
// Horizons (docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html):
//   heliocentric (Sun body centre, 500@10) geometric state vectors, ICRF, reference plane FRAME (equatorial),
//   km and km/s, TDB, at discrete Julian dates (TLIST): the frame, centre, units and time scale of
//   src/v2/data/horizons-inner-solar-system-2026-2040.json (frame ICRF/J2000, targets.earth.center '@sun').
import { get } from './jpl.mjs';

export const nhatsObjectUrl = (des) => `https://ssd-api.jpl.nasa.gov/nhats.api?des=${encodeURIComponent(des)}`;
export const NHATS_SUMMARY_URL = 'https://ssd-api.jpl.nasa.gov/nhats.api';

export function horizonsVectorsUrl(command, jdList) {
  const q = new URLSearchParams({
    format: 'json', COMMAND: `'${command}'`, OBJ_DATA: "'YES'", MAKE_EPHEM: "'YES'", EPHEM_TYPE: "'VECTORS'",
    CENTER: "'500@10'", REF_SYSTEM: "'ICRF'", REF_PLANE: "'FRAME'", VEC_TABLE: "'2'", VEC_CORR: "'NONE'",
    OUT_UNITS: "'KM-S'", TIME_TYPE: "'TDB'", CSV_FORMAT: "'YES'", TLIST_TYPE: "'JD'",
    TLIST: jdList.map((j) => `'${j}'`).join(' '),
  });
  return `https://ssd.jpl.nasa.gov/api/horizons.api?${q}`;
}
export function horizonsSpanUrl(command, startIso, stopIso, step) {
  const q = new URLSearchParams({
    format: 'json', COMMAND: `'${command}'`, OBJ_DATA: "'NO'", MAKE_EPHEM: "'YES'", EPHEM_TYPE: "'VECTORS'",
    CENTER: "'500@10'", REF_SYSTEM: "'ICRF'", REF_PLANE: "'FRAME'", VEC_TABLE: "'2'", VEC_CORR: "'NONE'",
    OUT_UNITS: "'KM-S'", TIME_TYPE: "'TDB'", CSV_FORMAT: "'YES'", START_TIME: `'${startIso}'`, STOP_TIME: `'${stopIso}'`, STEP_SIZE: `'${step}'`,
  });
  return `https://ssd.jpl.nasa.gov/api/horizons.api?${q}`;
}
/** Parse a Horizons VECTORS CSV result. Returns { rows: [{ jd, r:[km], v:[km/s] }], header text, target name, solution }. */
export function parseHorizonsVectors(body) {
  const j = JSON.parse(body);
  if (j.error) throw new Error(`Horizons error: ${j.error}`);
  const text = j.result;
  const soe = text.indexOf('$$SOE');
  const eoe = text.indexOf('$$EOE');
  if (soe < 0 || eoe < 0) throw new Error(`Horizons result has no $$SOE/$$EOE block: ${text.slice(0, 400)}`);
  const rows = text.slice(soe + 5, eoe).trim().split('\n').filter(Boolean).map((line) => {
    const c = line.split(',').map((s) => s.trim());
    const v = c.slice(2, 8).map(Number);
    return { jd: Number(c[0]), calendar: c[1], r: v.slice(0, 3), v: v.slice(3, 6) };
  });
  const header = text.slice(0, soe);
  const target = (header.match(/Target body name:\s*([^\n{]+?)\s{2,}/) ?? header.match(/Target body name:\s*([^\n]+)/) ?? [])[1]?.trim() ?? null;
  const center = (header.match(/Center body name:\s*([^\n]+)/) ?? [])[1]?.trim() ?? null;
  const soln = (header.match(/(JPL#\s*\d+|soln ref\.\s*=\s*[^,\n]+|Soln\.date:\s*[^\n_]+)/g) ?? []).map((s) => s.trim());
  const frame = (header.match(/Reference frame\s*:\s*([^\n]+)/) ?? [])[1]?.trim() ?? null;
  const timeScale = (header.match(/Output time\s*[^:]*:\s*([^\n]*)/) ?? [])[0] ?? null;
  return { rows, target, center, frame, soln, timeScale, header };
}
export async function fetchNhatsObject(des) {
  const r = await get(nhatsObjectUrl(des), { label: `nhats-${des}` });
  return { ...r, json: JSON.parse(r.body) };
}
export async function fetchHorizonsVectors(command, jdList, label) {
  const r = await get(horizonsVectorsUrl(command, jdList), { label });
  return { ...r, parsed: parseHorizonsVectors(r.body) };
}
/**
 * Horizons small-body COMMAND for an Aster/NHATS designation (Horizons API doc, "COMMAND"): a numbered asteroid
 * is its IAU number followed by a semicolon ('99942;'); an unnumbered one is DES=<designation>; ('DES=2000 SG344;').
 * 'DES=99942;' does not match (it was tried once in N0; the 'No matches found' response is kept in the manifest).
 */
export const horizonsCommand = (des) => (/^\d+$/.test(des) ? `${des};` : `DES=${des};`);
