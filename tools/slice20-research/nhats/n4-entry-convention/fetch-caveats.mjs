#!/usr/bin/env node
// N4: the CNEOS NHATS "Assumptions-Caveats" page (linked from https://cneos.jpl.nasa.gov/nhats/), fetched once
// to look for a documented entry-speed convention. Writes caveats.json: the plain text and every sentence that
// mentions entry, altitude, atmosphere, 125 km, 12 km/s or parking orbit.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from '../lib/jpl.mjs';
import { writeJsonAtomic } from '../lib/aster.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const url = 'https://cneos.jpl.nasa.gov/nhats/caveats.html';
const r = await get(url, { label: 'n4-doc-cneos-nhats-caveats' });
const text = r.body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&rsquo;/g, "'").replace(/&ldquo;|&rdquo;|&quot;/g, '"').replace(/\s+/g, ' ').trim();
const start = text.search(/Assumptions|Caveats/);
const sentences = text.slice(Math.max(0, start)).split(/(?<=[.!?])\s+/);
const hits = sentences.filter((s) => /entry|altitude|atmospher|125|12 km|interface|parking|inertial|re-?entry|speed/i.test(s));
writeJsonAtomic(path.join(here, 'caveats.json'), { url, file: r.file, sha256: r.sha256, bytes: Buffer.byteLength(r.body), hits, plainText: text.slice(Math.max(0, start), start + 20000) });
console.log(JSON.stringify({ file: r.file, hits }, null, 1));
