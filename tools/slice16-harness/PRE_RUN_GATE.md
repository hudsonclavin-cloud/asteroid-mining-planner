# PRE-RUN GATE — no paid collection until every box is checked

**Marker:** `S16-REMEDIATE-2026-08-01-A` (audit item 5.3)

This checklist exists because full-run attempt 1 started 74 seconds after a
local-only design commit, with no public seal, no runtime halts, a cost model
missing its dominant driver, six mis-instantiated scenarios, and a grader that
ignored the prose it was supposed to police. Each box below is a command with
its expected output. **A single failing box means NO `S16_LIVE_OK=1` command
may be issued.** Amending this gate is a Hudson decision, in a commit.

Run everything from the repo root. Boxes 1–2 are judgments with evidence
required; the rest are mechanical.

---

## 1. ☐ Public pre-registration seal EXISTS for the exact instrument being run

The corrected instrument is a revised pre-registration (founding §25.2).

```sh
git rev-parse HEAD
git ls-remote origin main | cut -f1
```
**Expect:** identical hashes — the instrument is on the public remote.

**And:** an external immutable seal (OSF/Zenodo or equivalent) of THAT hash,
with its **URL/DOI recorded additively in `SLICE_16_FOUNDING.md`** before the
run. A local commit is not a seal — that is the §25.1 lesson. If the founding
doc does not yet contain the registration URL/DOI for the current HEAD, this
box is UNCHECKED.

## 2. ☐ Every design-decision STOP is resolved by Hudson, in writing

`REMEDIATION_REPORT.md`'s DESIGN DECISIONS QUEUE (S-13 slot, S-30 bins,
S-15/S-18/S-20/S-24 multi-turn, control-arm grading, merged-refusal semantics,
frozen-fixture X1) must each be either resolved by a recorded Hudson ruling
(additive founding amendment) or explicitly deferred-out-of-scope for the run
being started. Scenarios still deferred stay deferred — the runner excludes
them automatically; that is fine. What is NOT fine is running with a STOP
silently unaddressed.

## 3. ☐ Local HEAD == origin/main (no unpushed instrument)

```sh
git status --porcelain   # only known-dirty user files, nothing staged
git rev-list --count origin/main..HEAD
```
**Expect:** `0` — nothing local that a reader of the public repo cannot see.

## 4. ☐ Instrument tests green — including the adversarial fixtures

```sh
node --test tools/slice16-harness/test/
```
**Expect:** all tests pass, `# fail 0`. The suite includes the frozen
negative controls, the remediation adversarial fixtures (both directions per
fix), and the runtime-guard tests. Any failure = the instrument is not the
sealed instrument.

## 5. ☐ Strict CLI refuses garbage

```sh
node tools/slice16-harness/runner.mjs --ful; echo "exit=$?"
```
**Expect:** usage error, `exit=2`. No fallback mode exists.

## 6. ☐ Spend guard verified halting (offline, synthetic)

```sh
node --test tools/slice16-harness/test/runtime-guards.test.mjs
```
**Expect:** pass — includes `L5-3` tests proving accrued and projected halts
fire, prior ledger spend seeds the meter, and every ACTIVE model is priced.
**And** provider-console hard caps are set (the guard's prices are
third-party-estimated; consoles are the backstop): OpenAI + Anthropic spend
limits confirmed by Hudson in the consoles themselves.

## 7. ☐ Same-cause halt verified (offline, synthetic)

Same test file as box 6 — the `L5-1` tests pin the registered >25% predicate
at the halted run's actual crossing point (37/147).

## 8. ☐ Transcript capture verified

```sh
node --test tools/slice16-harness/test/runtime-guards.test.mjs 2>&1 | grep "4.2"
```
**Expect:** the `4.2` tests pass — every row carries harness commit, server
build commit, system text, instantiated user turn, and the provider-native
conversation. **And** box 3 plus a clean worktree imply the recorded commits
identify the sealed instrument (a dirty harness stamps `harnessDirty: true` —
if preflight shows a dirty tree, STOP and commit first).

## 9. ☐ All ACTIVE scenarios instantiated-and-verified

```sh
node -e "
import('./tools/slice16-harness/config.mjs').then(async (c) => {
  const { buildUserTurn } = await import('./tools/slice16-harness/prompt.mjs');
  let bad = 0;
  for (const s of c.ACTIVE_SCENARIOS) for (const f of ['ORIGINAL','P1','P2']) {
    const t = buildUserTurn(s, f);
    if (/\[B\d+\]|this cell/.test(t)) { console.log('UNRESOLVED', s.id, f, JSON.stringify(t)); bad++; }
  }
  console.log(bad === 0 ? 'ALL ' + c.ACTIVE_SCENARIOS.length + ' ACTIVE SCENARIOS INSTANTIATE CLEANLY' : bad + ' PROBLEMS');
})"
```
**Expect:** `ALL <n> ACTIVE SCENARIOS INSTANTIATE CLEANLY` (build-time
fail-closed guards back this up at run time). Deferred scenarios are excluded
by status and need no check.

## 10. ☐ Control arm: only if its grading design is resolved

The control arm is currently **ungradeable by design gap** (audit L5-10;
report item 4.3). Until Hudson's ruling lands and its grading path has tests,
`--control` collects rows that cannot be graded. Either the ruling is in
place, or the control arm is explicitly out of scope for this run — recorded
in the run's authorization.

## 11. ☐ Cost model is scenario-stratified, not average-extrapolated

The §21.1 failure: a per-run average from 1–2-call scenarios missed the
~quadratic input growth of 4–5-call scenarios by ~3×. Before funding:
per-scenario cost figures across the 0–5-call range (a capped r=1 cost probe
is the cheap way), a projection built from them, and the projection + probe
evidence recorded in the run's authorization. `--preflight` counts and the
$200 ceiling are necessary, not sufficient.

## 12. ☐ Ledger state is intentional

```sh
ls -la tools/slice16-harness/runs/
```
**Expect:** you can name, for every file present, whether the coming run will
resume over it or must not touch it. `ledger-full.jsonl` (attempt 1, 275 rows)
is an INV-S16-036 evidence artifact of a superseded instrument — a corrected-
instrument run must NOT resume over it; archive per the signed recovery
dispatch (audit top-10 #1) first. Checksums must match founding §25.3 before
anything moves.
