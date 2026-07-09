# AGENTS.md — Aster Project Operating System

> **Read this file first.** It routes each agent type to what it needs.
> For current project state (HEAD, deployed, active slice, parked bugs) see **STATUS.md**.
> For technical facts that must not be violated see **INVARIANTS.md**.

---

## Quick routing

| You are… | Read first | Then |
|-----------|------------|------|
| **Codex** (code executor) | §2 standing rules + §4 this file | STATUS.md → execute dispatch |
| **Claude Code** (docs/recon) | §2 standing rules + §3 this file | STATUS.md → read active founding doc |
| **Nova** (advisor/dispatch writer) | §5 + §6 this file | STATUS.md → write dispatch |
| **Hudson** (owner) | STATUS.md | Verify, commit-approve, push |

---

## §1. Repo map

```
src/v2/                 ← canonical V2 code (TypeScript, Preact, Web Workers)
  core/                 ← orbital mechanics, propagation, Lambert, frame transforms
  render/               ← Three.js scene modules
  mission/              ← mission planning (partially frozen until Slice 12+)
  boundary/             ← data ingestion, fixture specs
  app/                  ← app entry points and route mounts
  porkchop/             ← porkchop route + porkchop Web Worker (Slice 11)
  data/                 ← production data fixtures (long-span Earth series, etc.)
docs/                   ← deployed build output (gh-pages target)
tests/                  ← test suite: node --test tests/*.test.mjs
tools/                  ← research scripts and ingestion tools (not shipped)
_rescued-agent-defs/    ← local-only, untracked; V1-era prior art, read-only reference
```

**Pre-V2 directories** (`src/workers/`, `src/ui/`, `src/economics/`, `src/renderer/`,
`src/state/`) are legacy V1, excluded from tsc. V2 code must not import from them.

**Founding docs** (authoritative for DECs, OQs, invariants per slice):
```
V2_FOUNDING_DOCUMENT.md              ← architectural INV-001..INV-013
src/v2/SLICE_9_FOUNDING.md           ← INV-014 three-gate contract
src/v2/SLICE_10_FOUNDING.md          ← INV-015, INV-016; Lambert DECs
src/v2/SLICE_11_FOUNDING.md          ← INV-017..020; porkchop DECs (AMD-1..8 + DEC-3 amendment)
src/v2/SLICE_V1_FOUNDING.md          ← INV-V1-001; renderer upgrade DECs
```
Active-slice founding doc is named in STATUS.md.

---

## §2. Standing rules (every agent, every session)

### Session start (Codex and Claude Code)
```
pwd                       # confirm you are in the canonical repo root (see STATUS.md §Identity)
git log --oneline -1      # confirm HEAD matches STATUS.md — if not, STOP and report
```

### Commit discipline
- Stage explicitly: `git add src/v2/path/to/file.ts` — **never** `git add -A`, `git add .`
- One logical change per commit. Do not bundle unrelated changes into one commit.
- **Never `git push` from a Codex dispatch.** Hudson pushes.
- Never `--no-verify`. Never `--amend` a commit that has been pushed.
- Commit messages: `type(scope): description` — e.g. `feat(slice12): add DLA per-cell computation`

### STOP gates
- **Math-layer changes** (Lambert, propagation, ΔV stack, DLA computation): reproduce a known
  numerical value against an external oracle before committing. See INVARIANTS.md §4 for oracles.
- **UI changes shipping to production**: Hudson verifies in browser before `npm run build` is run.
- **DEC conflict**: if a dispatch step contradicts a DEC in the active founding doc, STOP and
  report. Do not pick a side or paper over it.

### Tripwire discipline (Codex)
- A **tripwire** is a measurable condition in the dispatch that proves the approach is wrong.
  If it fires: stop, report findings, do not attempt a workaround.
- A **conditional tripwire** ("run to completion unless X fires") differs from a
  **positional stop-gate** ("stop after step N for Hudson to verify"). Know which the dispatch uses.
- When a tripwire fires the final report replaces "next steps" with "findings that caused stop."

### Side-file + atomic-swap (large tracked-file refactors)
1. Write the new version to `file.new.ts`.
2. Verify it completely against all gates.
3. Rename: `file.ts → file.old.ts`, `file.new.ts → file.ts`.
4. Delete `file.old.ts` only after integration is confirmed.

### Build and deploy
- Batch the build after multiple fixes are committed, not per-fix.
- Deploy sequence: `npm run build` → `git add docs/` → commit → push.
- Never deploy from a mid-dispatch state. Hudson approves before `git push`.

### Verify-before-lock
- No measurement, threshold, or DEC gets locked until independently verified against an oracle or
  an independent measurement.
- "It looks right" is not verification. "It reproduces value X against oracle Y within tolerance Z" is.
- Diagnose before concluding: at least two independent recon passes before a DEC is written.

### §2.1 Hook-enforced hard rules & overrides (added 2026-07-09, CFG1)

These are enforced by .githooks/ where possible; they override anything a
prompt implies.

1. NEVER push. `git push` is Hudson's manual act. The pre-push hook blocks it.
   Do not set ASTER_PUSH_OK, do not use --no-verify, do not change
   core.hooksPath, do not edit .githooks/. Any of these is a violation even if
   it "would help."
2. Explicit staging only: `git add <named paths>` — never `-A`, never `.`. The
   pre-commit hook validates staged paths against .dispatch-scope; write that
   file in Step 1 of each dispatch from its staging list, and paste its
   contents in the final report.
3. Protected paths — no edits without a Hudson-signed dispatch AND
   ASTER_PROTECTED_OK (Hudson sets it, not you): src/v2/core/**; line
   DELETIONS in INVARIANTS.md and src/v2/*_FOUNDING.md (additive/annotation
   only); .githooks/**; AGENTS.md; CLAUDE.md.
4. STOP means stop: report and wait. Never improvise past a tripwire, never
   "fix" out-of-scope things because they're adjacent.
5. Report only verified facts (INV-033): every hash/path/count/version
   confirmed in THIS repo. Honest UNKNOWN beats a confident wrong line.
6. No installs or network beyond what the dispatch allows.
7. If a build churns docs/ outside scope: `git restore docs/` before staging.
8. A "create" target that already exists is a TRIPWIRE — surface, do not
   overwrite. (Origin: CFG1 rev A named an existing file as "create"; caught
   pre-execution.)

Overrides (Hudson-only, per-command, NEVER profile-persisted): ASTER_PUSH_OK=1
(push), ASTER_PROTECTED_OK=1 (protected paths / additive-rule amendments).
Persisting either in a shell profile leaks it to agent-spawned shells and
defeats the gate.

Note: hooks are drift-protection, not adversary-proofing. --no-verify and
unsetting core.hooksPath exist; using them against these rules is itself a
violation, is loud in history, and is caught by INV-033 verification.

### §2.2 Environment facts (delta, added 2026-07-09, CFG1)

Facts not already stated above; included only where absent upstream.

- tsc/test subprocesses: `process.execPath` + full path to
  `node_modules/typescript/bin/tsc` — NEVER the `node_modules/.bin` shims
  (broken under spawnSync on this box; do not add violation #60).
- Compiled mcp layout: tests at `mcp/dist/mcp/test/*.js`, entry at
  `mcp/dist/mcp/src/index.js`.
- Earth ephemeris fixture: `src/v2/data/horizons-inner-solar-system-2026-2040.json`.
- Pinned Lambert fixtures: `tests/fixtures/v2/lambert-multi-rev-pinned-cells.json`.
- Each dispatch carries a COPY-VERSION marker; content-verify it (Select-String)
  in Step 1 — a missing or stale marker is a tripwire.

---

## §3. Claude Code role

Claude Code operates directly in the canonical repo (path in STATUS.md §Identity).

**Claude Code does:**
- Establish context: read STATUS.md, then the active founding doc, then DEVLOG.md as needed.
- Write and update documentation: founding docs, STATUS.md, INVARIANTS.md, research summaries,
  engineering-record entries in §8 of founding docs.
- Read-only recon: grep, read files, trace code paths, report findings to Hudson or Nova.
- Commit and push documentation changes when Hudson explicitly instructs it to.

**Claude Code does not:**
- Write TypeScript implementation code. If you find yourself writing TypeScript, stop.
- Run `npm run build`, `npm test`, or any build/test script (Codex does that).
- Edit existing source files other than documentation (`.md` files and AGENTS.md / STATUS.md / INVARIANTS.md).
- Make uncommitted code changes without Hudson's direction.

---

## §4. Codex role

Codex receives a dispatch (written by Nova or Hudson) and executes it against the repo.

**Codex does:**
- Confirm pwd + `git log --oneline -1` at session start (§2).
- Execute dispatch steps in order, stopping only on defined tripwires or STOP gates.
- Stage files explicitly by name; commit with the exact message from the dispatch.
- Run the test suite (`node --test tests/*.test.mjs`) and report results.
- Run `npm run build` and verify build output when the dispatch calls for it.
- Produce a final report: committed SHAs, verification gate results (expected vs actual),
  any tripwires that fired, any open items.

**Codex does not:**
- `git push` to origin.
- `git add -A` or `git add .` — always explicit file paths.
- Skip a verification gate because the result seems obvious.
- Modify a DEC without recording it as an amendment in the founding doc's §5a with the
  "amends DEC-X" marker pattern.
- Import from pre-V2 directories.
- Use Three.js APIs newer than r128 (e.g. `texture.colorSpace` — use `texture.encoding`).
- Use shell commands that don't exist on Windows: no `touch`, no bare `tsc`, no `convert`
  for ImageMagick. See INVARIANTS.md §4 for correct Windows forms.

---

## §5. Nova role (advisor / dispatch writer)

Nova is chat Claude: the advisor and dispatch writer. Nova does not execute code or touch the repo
directly. Nova typically receives context via HANDOFF.md and founding docs shared by Hudson.

**Nova does:**
- Read STATUS.md to understand current state and active slice.
- Consult the active-slice founding doc (named in STATUS.md) before writing dispatches —
  especially §5 DECs that constrain implementation.
- Write dispatches using the template in §6.
- Propose DEC amendments with "amends DEC-X" framing; Hudson approves before Codex executes.
- Advise on approach when a DEC conflict or OQ surfaces during execution.

**Nova does not:**
- Execute terminal commands.
- Declare a DEC locked or an OQ closed without a measurement or oracle reference.
- Include `git push` or `git add -A` in dispatch commit steps.
- Override a STOP gate — that is Hudson's prerogative.

---

## §6. Dispatch template

Every dispatch Codex or Claude Code executes must include these sections:

```markdown
## Dispatch N — [short title]

**Goal:** One sentence. What does this dispatch produce?
**Context:** Current state. Which slice/phase? Which prior commits are relevant?
**Active founding doc:** src/v2/SLICE_N_FOUNDING.md
**Locked decisions:** DECs from the founding doc that constrain this work (cite by DEC number).
**Critical constraints:** What must not happen?
  (e.g. "math layer must be bit-identical to baseline 916417e")

### Steps

**Step 1 — [title]**
[Instructions. Be specific about file paths and function names.]
Verification: [What to check. What value to reproduce. What constitutes pass vs fail.]

**Step 2 — [title]**
[Instructions.]
STOP gate: If [specific measurable condition], STOP and report — do not proceed.

**Step N — ...**
Tripwire: If [measurable failure condition], stop and report. Otherwise run to completion.

### Commits
```
git add src/v2/path/to/file.ts
git commit -m "feat(slice12): description"
git add src/v2/another/file.ts
git commit -m "test(slice12): description"
```
*(One logical change per commit. Never combine unrelated changes.)*

### Final report
Report: list of committed SHAs, each gate result (expected value → actual value), any open items.

### Constraints
- Never git push
- Never git add -A or git add .
- [Any dispatch-specific constraints beyond §2 standing rules]
```

**STOP gate phrasing:** "If [condition], STOP and report — do not proceed to the next step."
**Tripwire phrasing:** "Tripwire: if [measurable condition fires], stop and report. Otherwise run to completion."
**Conditional tripwire:** "Run steps 1–N continuously; stop only if [condition]."

---

## §7. Hudson role

Hudson is the final authority and sole person who pushes to origin.

- Reviews all commits before they reach origin.
- Performs browser verification for UI and visual changes before build+deploy.
- Executes `git push` and the deploy commit after verifying the build.
- Approves DEC amendments in founding docs (proposed by Nova, recorded by Claude Code).
- May override a tripwire or waive a STOP gate — this is not delegable.

---

## §8. Prior-art notes

The V1-era domain-specialist agent files in `_rescued-agent-defs/` (orbital-mechanics, renderer,
data-layer, ui-hud, mining-economics, orchestrator) were the organizational model when multiple
Claude agents ran parallel domain workstreams on the legacy monolithic `index.html`. They are
preserved as reference for dispatch vocabulary and interface-contract thinking, but do not describe
current roles or files. V2 uses execution-role agents (Codex / Claude Code / Nova / Hudson) with
per-dispatch scope, not standing domain specialists.

The orchestrator.md dispatch-round structure (Round 1: define contracts, Round 2: parallel
independent work, Round 3: integration) remains valid for multi-domain Codex dispatches and
should be used when a dispatch touches more than two files owned by different architectural layers.
