import { get } from '../lib/jpl.mjs';
for (const [label, url] of [['doc-nhats-api', 'https://ssd-api.jpl.nasa.gov/doc/nhats.html'], ['doc-horizons-api', 'https://ssd-api.jpl.nasa.gov/doc/horizons.html']]) {
  try { const r = await get(url, { label }); console.log(r.status, label, Buffer.byteLength(r.body), r.sha256.slice(0, 16), r.fromCache ? '(cache)' : ''); } catch (e) { console.log('FAIL', label, e.message); }
}
