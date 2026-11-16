import { get } from '../lib/jpl.mjs';
const q = new URLSearchParams({ format: 'json', COMMAND: "'399'", OBJ_DATA: "'NO'", MAKE_EPHEM: "'YES'", EPHEM_TYPE: "'VECTORS'", CENTER: "'500@10'", START_TIME: "'2030-01-01'", STOP_TIME: "'2030-01-02'", STEP_SIZE: "'1 d'", VEC_TABLE: "'2'" });
for (const [label, url] of [['phase0-nhats-99942', 'https://ssd-api.jpl.nasa.gov/nhats.api?des=99942'], ['phase0-horizons-earth', `https://ssd.jpl.nasa.gov/api/horizons.api?${q}`]]) {
  try {
    const r = await get(url, { label });
    console.log(`${r.status} ${Buffer.byteLength(r.body)} bytes sha256 ${r.sha256} ${label}\n  ${url}\n  ${r.body.slice(0, 160).replace(/\s+/g, ' ')}`);
  } catch (e) { console.log(`FAIL ${label}: ${e.message}`); process.exitCode = 1; }
}
