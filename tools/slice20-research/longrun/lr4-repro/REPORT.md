# LR4 — fresh-clone build reproducibility

**Result: 55 of 55 files tracked under `docs/` at `0d31cda` are byte-identical (sha256) to a fresh-clone
build. 0 differing, 0 missing from the build, 0 extra files in the build.**

Where it ran: a cloud Linux container (linux x64, Node v22.23.4, vite 5.4.21 from the lockfile), not the
laptop the dispatch names (Windows, Node 24). So this shows the committed `docs/` reproduces on a
different OS and Node major from the one that built it; it does not re-test the laptop itself.

## What ran

1. `git clone --branch main --single-branch https://github.com/hudsonclavin-cloud/asteroid-mining-planner`
   into a scratch directory (full history, not shallow). HEAD `0d31cda3d1dca81d29f45092be26b94bb44294c1`.
2. `npm ci` (exit 0). `git status --porcelain` empty afterwards.
3. `npm run build -- --outDir <scratch>/lr4/out --emptyOutDir` (exit 0, vite reported 4.87 s).
4. `compare-build.mjs`: for every file `git ls-tree` lists under `docs/` at HEAD, sha256 of the committed
   blob against sha256 of the built file. Full table in `lr4-repro.json`.

## Numbers

| Measure | Count |
|---|---:|
| Files tracked under `docs/` at HEAD | 55 |
| Emitted into the scratch outDir | 51 |
| ... of those identical to the committed blob | 51 |
| Written by a plugin straight into the clone's `docs/` (see below) | 4 |
| ... of those identical to the committed blob | 4 |
| Differing | 0 |
| In the build but not tracked | 0 |
| `git status --porcelain -- docs/` in the clone after the build | empty |

All hashed bundle names came out the same as the committed ones (for example `compareV2-F3OpNprt.js`,
`porkchopV2-V_mxVt_g.js`, `solarSystemV2-C6dR6zLr.js`).

## One thing the dispatch's "scratch outDir" does not cover

`vite.config.ts` has four `writeBundle` plugins that write to a hard-coded `resolve(__dirname, 'docs/...')`
path, so they ignore `--outDir`:

| File | Plugin | Source it copies |
|---|---|---|
| `docs/legacy/physics.worker.js` | `copy-physics-worker` | `legacy/physics.worker.js` |
| `docs/lambert-screen-cache.json` | `copy-lambert-screen-cache` | `tests/fixtures/v2/lambert-screen-cache.json` |
| `docs/tier-sizing-per-body.json` | `copy-fidelity-tier-assignments` | `tools/slice18-research/tier-sizing-per-body.json` |
| `docs/.nojekyll` | `copy-nojekyll` | (empty file) |

Checked for these four: each was rewritten by the build (mtime 01:40:21 against 01:40:14 for the
checked-out `docs/index.html`), each source file's sha256 equals the committed `docs/` blob, and the
clone's `docs/` shows no change in `git status`. So they reproduce too.

Consequence for anyone running a build "into a scratch directory" in a tree they care about: these four
files are written into that tree's `docs/` regardless. Here it happened in a throwaway clone.

## Files

- `compare-build.mjs` — the comparison.
- `lr4-repro.json` — per-file sha256 and byte counts, both sides.
