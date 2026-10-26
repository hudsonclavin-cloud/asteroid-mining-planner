#!/usr/bin/env node
// family-index.mjs — generate the Aster family's fact files from commands, never from memory.
//
// Writes, under strategy/family/:
//   MANIFEST.json      facts per member repo (GitHub API + local clones) and the Proof Sheet rows
//   PROOF_SHEET.md     one claim per member; each row is ANSWERED or a structured refusal
//   site/index.html    the data block between the family:data markers is replaced
//
// Facts come from `gh api` (repo metadata, HEAD of the default branch, last Actions run) and,
// when --siblings <dir> points at local clones, from git. Opinions (role, one-liner, completion
// estimates) come from MEMBERS_EDITORIAL.json and are passed through unchanged, labelled as such.
// Any API read that fails aborts the run (exit 1) so a stale value is never carried forward.
//
// Usage:  node tools/family/family-index.mjs [--siblings /path/to/clones] [--date YYYY-MM-DD] [--dry-run]
// Needs:  Node >= 18, `gh` authenticated for hudsonclavin-cloud (read scope), optional local clones.
//
// Plain JS research tooling under tools/, like tools/k2-momentum-research/. Not shipped, not src/v2.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const OUT_DIR = join(REPO_ROOT, 'strategy', 'family');
const OWNER = 'hudsonclavin-cloud';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const SIBLINGS = opt('--siblings', null);
const DATE = opt('--date', new Date().toISOString().slice(0, 10));
const DRY = args.includes('--dry-run');

const MEMBERS = [
  { id: 'aster',      repo: 'asteroid-mining-planner',     local: 'asteroid-mining-planner' },
  { id: 'skyhook',    repo: 'skyhook',                     local: 'skyhook' },
  { id: 'partforge',  repo: 'Partforge',                   local: 'Partforge' },
  { id: 'ideabank',   repo: 'Idea-Bank',                   local: 'Idea-Bank' },
  { id: 'suborbital', repo: 'suborbital-leg-cost-model',   local: 'suborbital-leg-cost-model' },
];

function sh(cmd, cmdArgs, opts = {}) {
  return execFileSync(cmd, cmdArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024, ...opts }).trim();
}
function gh(path, jq) {
  try { return JSON.parse(sh('gh', jq ? ['api', path, '--jq', jq] : ['api', path])); }
  catch (e) { throw new Error(`gh api ${path} failed: ${String(e.stderr || e.message).split('\n')[0]}`); }
}
function ghExists(repo, path, ref) {
  // true / false for a path in the repo; throws on any other failure
  try { sh('gh', ['api', `repos/${OWNER}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`]); return true; }
  catch (e) { const s = String(e.stderr || e.message); if (/404|Not Found/.test(s)) return false; throw new Error(`contents check ${repo}:${path} failed: ${s.split('\n')[0]}`); }
}
function localPath(m) { if (!SIBLINGS) return null; const p = join(SIBLINGS, m.local); return existsSync(join(p, '.git')) ? p : null; }
function git(p, a) { return sh('git', ['-C', p, ...a]); }

function repoFacts(m) {
  const r = gh(`repos/${OWNER}/${m.repo}`);
  const head = gh(`repos/${OWNER}/${m.repo}/commits/${r.default_branch}`, '{sha: .sha, date: .commit.committer.date}');
  const runs = gh(`repos/${OWNER}/${m.repo}/actions/runs?per_page=5&branch=${r.default_branch}`, '{workflow_runs: [.workflow_runs[] | {name, path, conclusion, head_sha, created_at}]}');
  const lastRun = (runs.workflow_runs || [])[0] || null;
  const ciRun = (runs.workflow_runs || []).find(x => x.path && !x.path.startsWith('dynamic/')) || null;
  const pagesRun = (runs.workflow_runs || []).find(x => x.path && x.path.startsWith('dynamic/pages')) || null;
  const workflows = gh(`repos/${OWNER}/${m.repo}/actions/workflows`);
  const pulls = gh(`repos/${OWNER}/${m.repo}/pulls?state=open&per_page=100`, '[.[] | .number]');
  const branches = gh(`repos/${OWNER}/${m.repo}/branches?per_page=100`, '[.[] | .name]');
  const facts = {
    id: m.id, repo: `${OWNER}/${m.repo}`, url: r.html_url,
    private: r.private, archived: r.archived, has_pages: r.has_pages,
    license: r.license ? r.license.spdx_id : null,
    default_branch: r.default_branch,
    head: head.sha.slice(0, 7), head_date: head.date.slice(0, 10),
    pushed_at: r.pushed_at, created_at: r.created_at,
    open_pulls: pulls.length, remote_branches: branches.length,
    ci_workflows: (workflows.workflows || []).filter(w => !w.path.startsWith('dynamic/')).map(w => w.path),
    last_ci_run: ciRun ? { name: ciRun.name, conclusion: ciRun.conclusion, head: ciRun.head_sha.slice(0, 7), date: ciRun.created_at.slice(0, 10) } : null,
    last_pages_deploy: pagesRun ? { conclusion: pagesRun.conclusion, head: pagesRun.head_sha.slice(0, 7), date: pagesRun.created_at.slice(0, 10) } : null,
    last_run_any: lastRun ? { name: lastRun.name, conclusion: lastRun.conclusion, date: lastRun.created_at.slice(0, 10) } : null,
  };
  const lp = localPath(m);
  if (lp) {
    facts.local = {
      path: lp, head: git(lp, ['rev-parse', '--short', 'HEAD']), branch: git(lp, ['branch', '--show-current']),
      commits_on_branch: Number(git(lp, ['rev-list', '--count', 'HEAD'])),
      tracked_files: git(lp, ['ls-files']).split('\n').filter(Boolean).length,
      first_commit: git(lp, ['log', '--reverse', '--format=%ad', '--date=short']).split('\n')[0],
      dirty: git(lp, ['status', '--short']).split('\n').filter(Boolean).length,
    };
  }
  return facts;
}

// ---- Proof Sheet rows. Each check is cheap (file existence, API metadata, a 3 s typecheck). ----
function refusal(code, reason, what_would_help) { return { status: 'REFUSED', refusal: { code, reason, what_would_help } }; }
function answered(evidence) { return { status: 'ANSWERED', evidence }; }

const ROWS = [
  {
    id: 1, member: 'aster', kind: 'software / agents',
    claim: 'The browser app and the published aster-mission-mcp package share one core AND one set of disclosures; CI compiles and tests mcp/ on every push.',
    command: 'grep -c mcp .github/workflows/ci.yml && (cd mcp && npx tsc -p . --noEmit) && npm view aster-mission-mcp version',
    check: (f) => {
      const ci = readFileSync(join(REPO_ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
      const hasJob = /mcp/.test(ci);
      let tsc = 'not checked (mcp/node_modules absent)';
      if (existsSync(join(REPO_ROOT, 'mcp', 'node_modules'))) {
        try { sh('npx', ['tsc', '-p', '.', '--noEmit'], { cwd: join(REPO_ROOT, 'mcp') }); tsc = 'compiles'; }
        catch (e) { tsc = 'FAILS: ' + String(e.stdout || e.stderr).split('\n').find(l => /error TS/.test(l)); }
      }
      const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'mcp', 'package.json'), 'utf8')).version;
      const published = sh('npm', ['view', 'aster-mission-mcp', 'version']);
      const ok = hasJob && tsc === 'compiles' && published === pkg;
      const ev = `ci.yml mentions mcp: ${hasJob}; mcp tsc: ${tsc}; published ${published} vs mcp/package.json ${pkg}`;
      return ok ? answered(ev) : refusal('not_yet_true', ev, 'route the NonFiniteC3 union at mcp/src/tools/compute-shared.ts into an out_of_envelope refusal, add a `cd mcp && npm ci && npm test` job to ci.yml, carry the fidelity tier into the envelope, publish 0.2.0');
    },
  },
  {
    id: 2, member: 'partforge', kind: 'hardware',
    claim: 'One flight-grade part was cut or printed from a PartForge sheet and calipered; the committed record states N of M declared tolerances met and how many were tool defaults.',
    command: 'ls docs/runs/ | grep first-article',
    check: (f) => {
      const lp = localPath(MEMBERS[2]);
      const names = lp ? readdirSync(join(lp, 'docs', 'runs')) : [];
      const hit = names.find(n => /first-article/.test(n));
      return hit ? answered(`docs/runs/${hit} exists`) : refusal('no_physical_datum', `no docs/runs/*first-article* directory (${lp ? names.length + ' run dirs' : 'local clone not available'}); every measurement in the app is of the mesh`, 'one shop or printer afternoon: cut or print the centering-ring template, caliper every declared row, commit photos and a measured-vs-declared table');
    },
  },
  {
    id: 3, member: 'skyhook', kind: 'physics / experiment',
    claim: 'ST-001 ran (n ≥ 8 pulls per configuration in 1.75 mm HMPE); splice retention is recorded against the ≥ 85% requirement with CSV and video; the repo is public under a LICENSE.',
    command: 'gh api repos/hudsonclavin-cloud/skyhook --jq "{private,license}" && ls docs/research/ | grep -i rn002',
    check: (f) => {
      const lp = localPath(MEMBERS[1]);
      const names = lp && existsSync(join(lp, 'docs', 'research')) ? readdirSync(join(lp, 'docs', 'research')) : [];
      const data = names.find(n => /rn002|st001.*result/i.test(n));
      const parts = [`private: ${f.private}`, `license: ${f.license}`, `ST-001 results file: ${data || 'none'}`];
      const ok = !f.private && !!f.license && !!data;
      return ok ? answered(parts.join('; ')) : refusal('no_physical_datum', parts.join('; ') + '; the protocol (docs/st001_splice_test.md) is complete and unexecuted', 'buy the ~$110-190 kit (≥ 500 kg peak-hold scale, or pre-register a saturation rule), pull n ≥ 8 per configuration over one weekend, commit RN-002; add a LICENSE and flip public after the branch reconcile');
    },
  },
  {
    id: 4, member: 'ideabank', kind: 'method',
    claim: '75 deposits pass one CI job on every push; PROCESS.md states the build → hostile review → verify loop and says every Made-by name is an agent persona; a LICENSE is present.',
    command: 'gh api repos/hudsonclavin-cloud/Idea-Bank --jq .license && ls .github/workflows PROCESS.md',
    check: (f) => {
      const hasCi = f.ci_workflows.length > 0;
      const hasProcess = ghExists('Idea-Bank', 'PROCESS.md');
      const parts = [`license: ${f.license}`, `CI workflows: ${f.ci_workflows.length}`, `PROCESS.md: ${hasProcess}`];
      const ok = !!f.license && hasCi && hasProcess;
      return ok ? answered(parts.join('; ')) : refusal('not_yet_true', parts.join('; '), 'LICENSE + package.json/lockfile + a check.yml running `node tools/check.mjs --no-smoke` on push (fix the load-sensitive idea-63 test first) + PROCESS.md with the reviewed/unreviewed list and the persona disclosure');
    },
  },
  {
    id: 5, member: 'aster', kind: 'research',
    claim: 'The pre-registered, DOI-sealed Slice 16 agent-honesty study has its promised report: evals/honesty-study/REPORT.md, limits stated first, every figure pinned to the grades file by a test.',
    command: 'ls evals/honesty-study/REPORT.md',
    check: () => existsSync(join(REPO_ROOT, 'evals', 'honesty-study', 'REPORT.md')) ? answered('evals/honesty-study/REPORT.md exists') : refusal('owed_deliverable', 'evals/honesty-study/REPORT.md does not exist; the data is on disk under tools/slice16-harness/runs/ and README says the DEC-16-8 contrast is uncomputed', 'one weekend: write the domain-1 report with "what the data does not support" first, the DEC-16-8 contrast, and a words-test asserting every figure equals the grades JSON'),
  },
  {
    id: 6, member: 'aster', kind: 'cross-repo mechanism', optional: true,
    claim: 'The Aster → Skyhook interface prototype (K2) is on main and its gate passes: `node tools/k2-momentum-research/verify.mjs --skyhook ../skyhook` prints ALL PASS against the live rev_a.json.',
    command: 'node tools/k2-momentum-research/verify.mjs --skyhook ../skyhook',
    check: (f) => {
      const onMain = ghExists('asteroid-mining-planner', 'tools/k2-momentum-research/verify.mjs', 'main');
      if (!onMain) { const prs = gh('repos/' + OWNER + '/asteroid-mining-planner/pulls?state=open&head=' + OWNER + ':claude/k2-momentum-bank', '[.[] | {number, created_at}]'); const pr = prs[0]; return refusal('not_on_main', 'tools/k2-momentum-research/ exists only on branch claude/k2-momentum-bank (commits f90bbba, 8cb8d54)' + (pr ? `; PR #${pr.number} open since ${pr.created_at.slice(0, 10)}` : '; no open PR'), pr ? `review and merge PR #${pr.number} (tooling only, no protected paths); label research-not-slice; no promotion toward src/v2 before K1` : 'open an ordinary PR for the branch (merge base exists); label research-not-slice; no promotion toward src/v2 before K1'); }
      const sky = localPath(MEMBERS[1]);
      if (!sky) return refusal('cannot_check', 'K2 is on main but no local skyhook clone was given (--siblings)', 'run with --siblings pointing at a directory holding a skyhook clone');
      try { const out = sh('node', [join(REPO_ROOT, 'tools', 'k2-momentum-research', 'verify.mjs'), '--skyhook', sky]); return /ALL PASS/.test(out) ? answered('verify.mjs printed ALL PASS') : refusal('gate_failed', out.split('\n').slice(-3).join(' | '), 'rebuild the snapshots and re-run'); }
      catch (e) { return refusal('gate_failed', String(e.stderr || e.message).split('\n')[0], 'rebuild the snapshots and re-run'); }
    },
  },
];

// ---- run ----
const editorial = JSON.parse(readFileSync(join(OUT_DIR, 'MEMBERS_EDITORIAL.json'), 'utf8'));
const facts = {};
for (const m of MEMBERS) { process.stderr.write(`reading ${m.repo} ... `); facts[m.id] = repoFacts(m); process.stderr.write('ok\n'); }
const rows = ROWS.map(r => { const f = facts[r.member]; let res; try { res = r.check(f); } catch (e) { res = refusal('check_error', String(e.message).split('\n')[0], 'fix the check or run with the required local clones'); } return { id: r.id, member: r.member, kind: r.kind, optional: !!r.optional, claim: r.claim, command: r.command, checked_at: DATE, head: f.head, ...res }; });
const required = rows.filter(r => !r.optional);
const nAnswered = required.filter(r => r.status === 'ANSWERED').length;

const manifest = {
  family: 'Aster', schema_version: '0.2.0', generated: DATE,
  generated_by: 'tools/family/family-index.mjs (GitHub API via gh + local git); opinions from MEMBERS_EDITORIAL.json',
  status: 'PROPOSAL — leads-grade. Facts are read by command at generation time; nothing here locks a DEC or changes a member repo.',
  hub: { repo: `${OWNER}/asteroid-mining-planner`, branch: 'aster-family', home: 'strategy/family/' },
  proof_sheet: { answered: nAnswered, required: required.length, optional_rows: rows.filter(r => r.optional).length },
  members: MEMBERS.map(m => ({ ...facts[m.id], editorial: editorial.members[m.id] })),
  edges: editorial.edges,
  rows,
};

function mdRows() {
  return rows.map(r => {
    const st = r.status === 'ANSWERED' ? `**ANSWERED** — ${r.evidence}` : `**REFUSED** \`${r.refusal.code}\` — ${r.refusal.reason}<br>*what would help:* ${r.refusal.what_would_help}`;
    return `| ${r.id}${r.optional ? ' (opt.)' : ''} | ${editorial.members[r.member].name} · ${r.kind} | ${r.claim} | \`${r.command}\` | ${st} | ${r.checked_at} @ ${r.head} |`;
  }).join('\n');
}
const sheet = `# Aster family — Proof Sheet

**${nAnswered} of ${required.length} answered** · generated ${DATE} by \`node tools/family/family-index.mjs\` · a row is ANSWERED only when its check passed today; otherwise it is a structured refusal with what would help. Rows are never softened or deleted.

Credibility artifacts; no product on this sheet has a paying user. [Certain]

| # | Member · kind | Claim | Re-run | Status today | Checked |
|---|---|---|---|---|---|
${mdRows()}

## Member facts (read by command, ${DATE})

| Member | Repo | Default HEAD | Private | Licence | Pages | CI workflows | Last CI run | Open PRs | Branches |
|---|---|---|---|---|---|---|---|---|---|
${MEMBERS.map(m => { const f = facts[m.id]; return `| ${editorial.members[m.id].name} | [${f.repo}](${f.url}) | ${f.head} (${f.head_date}) | ${f.private} | ${f.license || 'none'} | ${f.has_pages} | ${f.ci_workflows.length ? f.ci_workflows.join(', ') : 'none'} | ${f.last_ci_run ? `${f.last_ci_run.conclusion} @ ${f.last_ci_run.head} ${f.last_ci_run.date}` : '—'} | ${f.open_pulls} | ${f.remote_branches} |`; }).join('\n')}

Opinions (role, completion estimate, verdict) live in \`MEMBERS_EDITORIAL.json\` and the review; they are not on this sheet by design.
`;

// ---- landing page injection ----
const pagePath = join(OUT_DIR, 'site', 'index.html');
let page = readFileSync(pagePath, 'utf8');
const START = '// family:data:start', END = '// family:data:end';
const a = page.indexOf(START), b = page.indexOf(END);
if (a < 0 || b < 0) throw new Error('site/index.html lacks the family:data markers');
const pageMembers = MEMBERS.map(m => { const f = facts[m.id], e = editorial.members[m.id]; return {
  id: m.id, name: e.name, role: e.role.split(' (')[0], one: e.one_liner, completion: e.completion.percent, label: e.completion.label, verdict: e.verdict,
  repo: f.url, private: f.private, license: f.license, has_pages: f.has_pages, head: f.head, head_date: f.head_date,
  ci: f.last_ci_run ? `${f.last_ci_run.name}: ${f.last_ci_run.conclusion} @ ${f.last_ci_run.head} (${f.last_ci_run.date})` : (f.ci_workflows.length ? 'no runs' : 'no CI workflow'),
  pages: f.last_pages_deploy ? `${f.last_pages_deploy.conclusion} @ ${f.last_pages_deploy.head} (${f.last_pages_deploy.date})` : (f.has_pages ? 'enabled, no deploy run found' : 'off'),
  proves: e.proves, since: e.since, note: e.note,
  live: m.id === 'aster' ? [['Solar system + catalog', 'https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/solar-system/'], ['Porkchop planner', 'https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/porkchop/'], ['About / validation', 'https://hudsonclavin-cloud.github.io/asteroid-mining-planner/v2/about/'], ['npm aster-mission-mcp', 'https://www.npmjs.com/package/aster-mission-mcp']]
      : m.id === 'partforge' ? [['App', 'https://hudsonclavin-cloud.github.io/Partforge/'], ['Engine Design Study (concept, not a plan)', 'https://hudsonclavin-cloud.github.io/Partforge/engine-study.html']]
      : m.id === 'ideabank' ? [['Gallery', 'https://hudsonclavin-cloud.github.io/Idea-Bank/']] : [],
}; });
const block = `${START}\n  // GENERATED by tools/family/family-index.mjs on ${DATE} — do not edit by hand; edit MEMBERS_EDITORIAL.json and regenerate.\n  const GENERATED = ${JSON.stringify({ date: DATE, answered: nAnswered, required: required.length })};\n  const MEMBERS = ${JSON.stringify(pageMembers, null, 2)};\n  const EDGES = ${JSON.stringify(editorial.edges, null, 2)};\n  const ROWS = ${JSON.stringify(rows.map(r => ({ id: r.id, member: editorial.members[r.member].name, optional: r.optional, claim: r.claim, status: r.status, text: r.status === 'ANSWERED' ? r.evidence : `${r.refusal.code}: ${r.refusal.reason}. What would help: ${r.refusal.what_would_help}`, checked: `${r.checked_at} @ ${r.head}` })), null, 2)};\n  `;
page = page.slice(0, a) + block + page.slice(b);

if (DRY) { console.log(sheet); process.exit(0); }
writeFileSync(join(OUT_DIR, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(join(OUT_DIR, 'PROOF_SHEET.md'), sheet);
writeFileSync(pagePath, page);
console.log(`wrote MANIFEST.json, PROOF_SHEET.md, site/index.html — proof sheet ${nAnswered} of ${required.length} answered (${DATE})`);
