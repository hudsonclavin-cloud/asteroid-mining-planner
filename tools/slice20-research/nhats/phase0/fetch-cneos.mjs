import { get } from '../lib/jpl.mjs';
for (const [label, url] of [['doc-cneos-nhats', 'https://cneos.jpl.nasa.gov/nhats/'], ['doc-cneos-nhats-intro', 'https://cneos.jpl.nasa.gov/nhats/intro.html']]) {
  try { const r = await get(url, { label }); console.log(r.status, label, Buffer.byteLength(r.body)); } catch (e) { console.log('FAIL', label, e.message); }
}
