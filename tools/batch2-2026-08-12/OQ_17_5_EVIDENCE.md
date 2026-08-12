# OQ-17-5 EVIDENCE — halo rim-decay shortfall (S-S17-BATCH2-2026-08-12-A)

OQ-17-5 (SLICE_17_FOUNDING.md:387-389): does the marker rim-decay shortfall
(~7-7.5 CSS px effective vs the 8 px floor) warrant a halo-texture fix, or
does the chip state the floor and the finding stand? "OPEN → decide at B2."
This file is the B2 evidence; Hudson rules. No texture change was made in
this batch.

## The measurement, and its standing at this HEAD

- **C1's measurement** (strategy/SLICE21_QOL_BACKLOG_TRIAGED.md:12-19,
  browser, 2026-08-03): 14-15 device px at DPR 2 = **7-7.5 CSS px rendered**
  against the 8 px nominal floor.
- **Still current at 0feffb4.** The halo file's last commit is `5c9451e`
  (2026-07-01); `git log --since=2026-08-03 -- src/v2/render/halos.ts` is
  empty. The 2026-08-11/12 shader work touched `asteroid-points-shader.ts`
  and `star-renderer.ts` only — a different mark system. The measurement
  predates no halo change; it stands.

## The cause (halos.ts:146-149, verbatim)

```ts
const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
grad.addColorStop(0, 'rgba(255,255,255,1)');
grad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
grad.addColorStop(1, 'rgba(255,255,255,0)');
```

The sprite is sized to a full 8 px footprint (halos.ts:112-116), but the
radial texture's alpha decays to 0 at the rim, so the outer ~0.5 px of
radius is sub-perceptual — the disc *reads* ~7-7.5 CSS px. Compounded by
`HALO_BASE_OPACITY = 0.85` (halos.ts:6) and distance fade (halos.ts:104).
This is a texture property, not a sizing bug: the geometry honors the floor;
the perceived edge does not.

## The two options

**(a) Halo-texture fix.** Move the last gradient stop inward (e.g. alpha
reaches 0 at ~90% radius, or hold ≥0.5 alpha to ~80% then fall), so the
perceived edge lands at the nominal diameter. One-file change, visually
gated (affects all 21 named-body markers at every zoom where halos are
active). Risk: the soft rim is also what keeps markers from reading as hard
UI dots on a starfield; a harder edge changes the scene's character —
that judgement needs eyes, which is why it is not made in a batch.

**(b) Chip states the floor; the shortfall stays a logged finding.** The B2
chip (landed this batch, 325c115) states the 8 px floor — per DEC-17-9 C1
this is the required copy either way, since the chip cites the repo
constant. The ~0.5-1 px perceptual shortfall remains documented here and in
the QOL backlog, and OQ-17-5 closes as "accepted rendering property."

## RECOMMENDATION: (b) — accept and log; no texture change

Reasoning: the shortfall is ~6-12% of an 8 px mark, uniform across all
bodies, and BELOW the floor only in perceived edge, not geometry. The chip's
honest claim is about the floor the code enforces, which is true as stated;
adding "(reads ~7.5 px due to soft rim)" to a user-facing chip would be
precision theater on a decorative rim treatment. Meanwhile option (a)'s
cost is not the one-line gradient edit but the re-gating of every marker's
appearance — the soft rim was chosen for legibility against the starfield,
and hardening it to recover half a pixel inverts a deliberate visual choice
for a sub-perceptual gain. If a future slice retunes halo appearance anyway,
fold the stop-position fix in then, with its own visual gate.

Hudson rules; (a) remains a one-file dispatch if chosen.
