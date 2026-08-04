---
VERIFICATION PASS RESULT (added 2026-08-04 — not part of the Perplexity answer)
Pass: [V7 — MPC orbit condition code U: definition, band table, warning text]
Prompt source: [tools/slice17-research/literature/PERPLEXITY_V7_CONDITION_CODE_VERIFY.md]
Fired: [2026-08-04] · standard Perplexity · verification form (one-line
  verdicts + primary-source citations; NOT the recursive exploratory form)
Gates: SLICE_17_FOUNDING.md DEC-17-4 quality-column copy (U bands, label,
  warning line).
Status: VERIFIED-WITH-CITATIONS. Distinct from LEADS: every item carries a
  named primary source. Distinct from LOCKED: retrieval and assertion came
  from the same actor (INV-033), so a Hudson-side spot check of items 2 and
  3 against https://www.minorplanetcenter.net/iau/info/UValue.html is
  recommended before UI copy quotes them — both are short and directly
  readable on one page.
Three consequences recorded at ingest (analysis, not part of the answer):
  (a) The MPC caveat is NEA-SPECIFIC — it names NEAs explicitly. Aster's
      catalog is 41,906 NEAs, so the primary source's warning is about
      precisely our population, and it independently corroborates
      DEC-17-4's "never a derived future-uncertainty number."
  (b) JPL's Small-Body Mission Design API publishes an official threshold,
      condition_code >= 7 → "orbit solution is highly uncertain." DEC-17-4's
      top qualitative tier should anchor there rather than invent a cutoff;
      any lower boundary remains ours and must be labeled as ours.
  (c) E / D / F are substitute flags occupying the U field in MPCORB
      (E = eccentricity assumed; D / F = double-designation variants), NOT
      extra bands. Aster types conditionCode as number | null (recon Q7), so
      a letter would silently become null — rendering "unknown quality"
      where the truth is "eccentricity was assumed," a WORSE signal than a
      missing one. Opens a repo-side check (see founding §9 / OQ), and
      sharpens recon CANNOT-DETERMINE #3 (conditionCode ingest source
      untraced) from curiosity into a data-integrity question.
--- RAW PERPLEXITY ANSWER BELOW ---

1. U is an MPC-assigned integer 0–9 encoding RUNOFF — "the in-orbit longitude runoff in seconds of arc per decade" — on a logarithmic scale defined by `CONS = ln(648000)/9` (`CONS ~ 1.49`) and `U = INT(ln(RUNOFF)/CONS)+1  (0 <= U <= 9)`, where "0 indicates a very small uncertainty and 9 an extremely large uncertainty. In practice, U is rarely larger than 6"; RUNOFF itself is computed as `RUNOFF = (dT * e + 10 / P * dP) * ko / P * 3600 * 3`, the trailing `3` being "a empirical factor to make the formal errors more closely model reality" — [IAU Minor Planet Center, "Uncertainty Parameter U and Orbit Quality Codes"](https://www.minorplanetcenter.net/iau/info/UValue.html); mirrored by JPL as `condition_code` — "MPC "U" parameter: orbit uncertainty estimate 0-9, with 0 being good, and 9 being highly uncertain" ([JPL SSD/CNEOS SBDB Query API doc, v1.0 (2021 August)](https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html)).

2. Verbatim from [MPC, "Uncertainty Parameter U and Orbit Quality Codes"](https://www.minorplanetcenter.net/iau/info/UValue.html) (lead-in sentence included because it is the only place the unit is stated):

As a guide, the values of U correspond to the following values of RUNOFF (in seconds of arc per decade):

```
   U      RUNOFF              U      RUNOFF

   0      < 1.0               5      < 1692
   1      < 4.4               6      < 7488
   2      < 19.6              7      < 33121
   3      < 86.5              8      < 146502
   4      < 382               9      > 146502

```

3. MPC's caveat, verbatim and in full (it is a single sentence, the entire warning language on the page) — [MPC, "Uncertainty Parameter U and Orbit Quality Codes"](https://www.minorplanetcenter.net/iau/info/UValue.html):

The U value should not be used as a predictor for the uncertainty in the future motion of NEAs.

JPL carries no caveat in the SBDB API or SBDB Query API documentation (both define `condition_code` with no qualifying language); the one distinct JPL-issued warning found is machine-emitted by the Small-Body Mission Design API, verbatim — [JPL SSD Small-Body Mission Design API doc, v1.2 (2025 July)](https://ssd-api.jpl.nasa.gov/doc/mdesign.html):
`{ "warning" : "orbit solution is highly uncertain (condition_code >= 7)" }` - based on its condition code, the current orbit solution is highly uncertain. All data will still be provided.

4. E/D/F do not appear on the MPC U-parameter page at all — they are defined in a different primary MPC document, the MPCORB export format spec, where column 106 is `i1` for U "or a1 — If this column contains `E' it indicates that the orbital eccentricity was assumed. For one-opposition orbits this column can also contain `D' if a double (or multiple) designation is involved or `F' if an e-assumed double (or multiple) designation is involved" (i.e. they are substitute flags occupying the U field, not extra bands on the 0–9 scale) — [MPC, "Export Format for Minor-Planet Orbits"](https://www.minorplanetcenter.net/iau/info/MPOrbitFormat.html).

5. NONE STATED for the MPC page — no last-updated line, no version string, and the server returns no `Last-Modified` header (retrieved 2026-08-04 18:25 UTC); the JPL pages cited above do carry version stamps: SBDB Query API "Version: 1.0 (2021 August)" and Small-Body Mission Design API "Version: 1.2 (2025 July)" — [MPC UValue](https://www.minorplanetcenter.net/iau/info/UValue.html), [JPL SBDB Query API](https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html), [JPL mdesign API](https://ssd-api.jpl.nasa.gov/doc/mdesign.html).
