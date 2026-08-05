import { h, render, type ComponentChildren, type VNode } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { SLICE9_NEA_CATALOG_TOTAL_BODIES } from '../../boundary/slice9-nea-catalog.js';

const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 About mount point "#app" was not found');
}

const PROVENANCE_URL = new URL('../../data/validation-provenance.json', import.meta.url);
const ROUTES = {
  '/v2/porkchop/': '../porkchop/',
  '/v2/solar-system/': '../solar-system/',
} as const;

interface ProvenanceRow {
  readonly id: string;
  readonly value: string;
  readonly note: string;
}

interface ProvenanceDoc {
  readonly rows: readonly ProvenanceRow[];
}

interface ArtifactLink {
  readonly label: string;
  readonly commit: string;
  readonly path: string;
  readonly anchor?: string;
}

const REPO_ROOT_URL = 'https://github.com/hudsonclavin-cloud/asteroid-mining-planner';

const ARTIFACTS = {
  slice12: {
    label: 'SLICE_12_FOUNDING.md',
    commit: '946afed',
    path: 'src/v2/SLICE_12_FOUNDING.md',
  },
  slice13: {
    label: 'SLICE_13_FOUNDING.md',
    commit: '8fc6f32',
    path: 'src/v2/SLICE_13_FOUNDING.md',
  },
  slice10: {
    label: 'SLICE_10_FOUNDING.md',
    commit: '3d5f1cd',
    path: 'src/v2/SLICE_10_FOUNDING.md',
  },
  slice14: {
    label: 'SLICE_14_FOUNDING.md',
    commit: '8fcddb6',
    path: 'src/v2/SLICE_14_FOUNDING.md',
  },
  slice10Audit: {
    label: 'SLICE_10_FOUNDING.md §OQ-8',
    commit: '3d5f1cd',
    path: 'src/v2/SLICE_10_FOUNDING.md',
    // L3-4 fix: fragment regenerated from the document's actual heading,
    // "OQ-8 — Multi-agent audit cycle (engineering record)". The old fragment
    // pointed at a heading that no longer exists, so the evidence jump 404'd
    // to the top of the file.
    anchor: 'oq-8--multi-agent-audit-cycle-engineering-record',
  },
  slice13Audit: {
    label: 'SLICE_13_FOUNDING.md §8',
    commit: '8fc6f32',
    path: 'src/v2/SLICE_13_FOUNDING.md',
    anchor: '8-engineering-record',
  },
  oracle: {
    label: 'oracle-report.md',
    commit: '808e709',
    path: 'tools/slice13-research/elvperf/oracle/oracle-report.md',
  },
  verification: {
    label: '3d-verification-record.md',
    commit: 'f455489',
    path: 'tools/slice13-research/literature/3d-verification-record.md',
  },
  invariants: {
    label: 'INVARIANTS.md',
    commit: 'b651519',
    path: 'INVARIANTS.md',
  },
  agents: {
    label: 'AGENTS.md',
    commit: '78a1dcb',
    path: 'AGENTS.md',
  },
  devlog: {
    label: 'DEVLOG.md',
    commit: '946afed',
    path: 'DEVLOG.md',
  },
} satisfies Record<string, ArtifactLink>;

const PAGE_STYLE = [
  'min-height:100vh',
  'background:#03050b',
  'color:#eef2ff',
  'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  'line-height:1.6',
].join(';');

const SHELL_STYLE = [
  'width:min(1120px,calc(100% - 32px))',
  'margin:0 auto',
  'padding:28px 0 56px',
].join(';');

const TOPBAR_STYLE = [
  'display:flex',
  'justify-content:space-between',
  'align-items:center',
  'gap:16px',
  'margin-bottom:34px',
  'font-size:13px',
  'color:#93a4bf',
].join(';');

const HERO_STYLE = [
  'padding:28px 0 26px',
  'border-bottom:1px solid rgba(255,255,255,0.12)',
  'margin-bottom:30px',
].join(';');

const H1_STYLE = [
  'font-size:clamp(34px,6vw,64px)',
  'line-height:1',
  'margin:0 0 20px',
  'font-weight:750',
  'letter-spacing:0',
].join(';');

const SECTION_STYLE = 'padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.08);';
const SECTION_TITLE_STYLE = 'font-size:22px;line-height:1.25;margin:0 0 12px;font-weight:700;color:#fff;';
const SUBTITLE_STYLE = 'font-size:17px;line-height:1.35;margin:28px 0 12px;font-weight:700;color:#e5edfb;';
const BODY_STYLE = 'max-width:850px;font-size:15px;color:#cbd5e1;margin:0 0 16px;';
const BUTTON_ROW_STYLE = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;';
const BUTTON_STYLE = [
  'display:inline-flex',
  'align-items:center',
  'gap:8px',
  'border:1px solid rgba(125,211,252,0.45)',
  'background:rgba(125,211,252,0.12)',
  'color:#e0f2fe',
  'padding:9px 12px',
  'border-radius:6px',
  'font-size:13px',
  'font-weight:650',
  'text-decoration:none',
].join(';');
const INLINE_LINK_STYLE = 'color:#7dd3fc;text-decoration:none;';
const LIST_STYLE = 'display:flex;flex-direction:column;gap:12px;margin:12px 0 0;padding:0;list-style:none;';
const EXHIBIT_STYLE = [
  'border:1px solid rgba(255,255,255,0.11)',
  'background:rgba(255,255,255,0.035)',
  'border-radius:8px',
  'padding:13px 14px',
].join(';');
const EXHIBIT_TITLE_STYLE = 'font-size:14px;font-weight:700;color:#fff;margin-bottom:3px;';
const EXHIBIT_BODY_STYLE = 'font-size:13px;color:#b8c4d8;margin-bottom:8px;';
const ARTIFACT_LINK_STYLE = [
  'font-family:ui-monospace,SFMono-Regular,Menlo,monospace',
  'font-size:12px',
  'color:#7dd3fc',
  'text-decoration:none',
  'word-break:break-word',
].join(';');

function route(path: string): string {
  return ROUTES[path as keyof typeof ROUTES] ?? path;
}

function artifactUrl(artifact: ArtifactLink): string {
  const base = `${REPO_ROOT_URL}/blob/${artifact.commit}/${artifact.path}`;
  return artifact.anchor ? `${base}#${artifact.anchor}` : base;
}

function artifactLink(artifact: ArtifactLink): VNode {
  return h(
    'a',
    {
      href: artifactUrl(artifact),
      target: '_blank',
      rel: 'noopener noreferrer',
      style: ARTIFACT_LINK_STYLE,
    },
    `${artifact.label} @ ${artifact.commit}`,
  );
}

function section(title: string, ...children: ComponentChildren[]): VNode {
  return h(
    'section',
    { style: SECTION_STYLE },
    h('h2', { style: SECTION_TITLE_STYLE }, title),
    ...children,
  );
}

function paragraph(...children: ComponentChildren[]): VNode {
  return h('p', { style: BODY_STYLE }, ...children);
}

function exhibit(title: string, body: string, artifact: ArtifactLink): VNode {
  return h(
    'li',
    { style: EXHIBIT_STYLE },
    h('div', { style: EXHIBIT_TITLE_STYLE }, title),
    h('div', { style: EXHIBIT_BODY_STYLE }, body),
    artifactLink(artifact),
  );
}

function valueById(doc: ProvenanceDoc | null, id: string): string {
  return doc?.rows.find((row) => row.id === id)?.value ?? '';
}

function noteById(doc: ProvenanceDoc | null, id: string): string {
  return doc?.rows.find((row) => row.id === id)?.note ?? '';
}

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/**
 * Compact plain scientific notation ("3.60e-12") into "3.6×10⁻¹²".
 * Trailing zeros in a fractional mantissa are trimmed; the exponent renders
 * from its own captured digits, negative or positive (positive exponents
 * render unsigned). Anything that is not plain scientific notation passes
 * through unchanged — this function claims no handling beyond that form.
 */
function compactScientific(value: string): string {
  const match = value.match(/^(\d+(?:\.\d+)?)e([+-]?)(\d+)$/i);
  if (!match) {
    return value;
  }
  const mantissa = match[1].includes('.')
    ? match[1].replace(/0+$/, '').replace(/\.$/, '')
    : match[1];
  const sign = match[2] === '-' ? '⁻' : '';
  const exponent = [...match[3]]
    .map((digit) => SUPERSCRIPT_DIGITS[digit] ?? digit)
    .join('');
  return `${mantissa}×10${sign}${exponent}`;
}

function firstPercent(value: string): string {
  return value.split(' ')[0] ?? value;
}

function ValidationSection({ doc }: { readonly doc: ProvenanceDoc | null }): VNode {
  const singleRevPrecision = noteById(doc, 'lambert-m0').split(' — ')[0].toLowerCase();
  const multiRevMagnitude = compactScientific(valueById(doc, 'lambert-multirev-magnitude'));
  const strictMax = firstPercent(valueById(doc, 'cost-oracle-strict'));
  const observedMax = firstPercent(valueById(doc, 'cost-oracle-observed'));

  return section(
    'Validation',
    paragraph(
      'The trajectory solver is validated against poliastro, an independent open-source astrodynamics library used strictly as a reference — never imported into Aster\'s math layer. Single-revolution transfers agree to ',
      singleRevPrecision || 'machine precision',
      '; multi-revolution magnitudes agree to within ',
      multiRevMagnitude || 'the measured bound',
      ', with the vector directions the feasibility overlay depends on validated separately. Delivered-mass pricing is within ',
      strictMax || 'the strict measured bound',
      ' of published values on the curve segments the tool screens on, and up to ',
      observedMax || 'the observed measured bound',
      ' in the one steep segment where it is knowingly optimistic — a figure the tool discloses rather than hides.',
    ),
    paragraph(
      'Every number here carries its source file and commit in the validation panel beside the porkchop, and in the held-out validation report.',
    ),
    h(
      'ul',
      { style: LIST_STYLE },
      // L3-3 fix: this artifact is the launch-vehicle cost-interpolation oracle
      // ONLY. It was labelled "Full validation report", which falsely implied it
      // covered the Lambert/multi-rev/DLA validation described above — those
      // live in separate oracle artifacts surfaced by the validation panel.
      exhibit(
        'Launch-vehicle cost oracle report',
        'delivered-mass interpolation vs published performance — one validation of several; the panel above links the rest.',
        ARTIFACTS.oracle,
      ),
    ),
    h(
      'div',
      { style: BUTTON_ROW_STYLE },
      h('a', { href: route('/v2/porkchop/'), style: BUTTON_STYLE }, 'See the live validation panel →'),
    ),
  );
}

function AboutPage(): VNode {
  const [doc, setDoc] = useState<ProvenanceDoc | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(PROVENANCE_URL.href)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`validation provenance fetch failed: ${response.status}`);
        }
        return response.json();
      })
      .then((json: ProvenanceDoc) => {
        if (!cancelled) {
          setDoc(json);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const decisionRecord = useMemo(
    () => [
      exhibit(
        'Launch-feasibility overlay — founding document ⭐',
        'its own header records that Nova drafted it for human review and lock.',
        ARTIFACTS.slice12,
      ),
      exhibit(
        'Mission cost card — founding document ⭐',
        'drafted by Nova and locked by the human engineer after independent re-verification of every launch-vehicle anchor.',
        ARTIFACTS.slice13,
      ),
      exhibit(
        'Lambert solver & departure screening — founding document',
        'the decision/open-question structure the process runs on, with its audit record inline.',
        ARTIFACTS.slice10,
      ),
      exhibit(
        'This packaging slice — founding document',
        'the locked plan for the page you are reading.',
        ARTIFACTS.slice14,
      ),
    ],
    [],
  );

  return h(
    'div',
    { style: PAGE_STYLE },
    h(
      'div',
      { style: SHELL_STYLE },
      h(
        'nav',
        { style: TOPBAR_STYLE },
        h('a', { href: route('/v2/solar-system/'), style: INLINE_LINK_STYLE }, 'Aster'),
        h('a', { href: route('/v2/porkchop/'), style: INLINE_LINK_STYLE }, 'Open the porkchop tool'),
      ),
      h(
        'header',
        { style: HERO_STYLE },
        h('h1', { style: H1_STYLE }, 'About Aster'),
      ),
      section(
        'What this is',
        paragraph(
          'Aster is a browser-based asteroid mission-planning tool. It computes Earth-departure launch windows as porkchop plots from a re-derived Lambert solver, screens each window against launch-site geometry (the declination of the launch asymptote), and prices delivered mass against published launch-vehicle performance curves — across a catalog of ',
          SLICE9_NEA_CATALOG_TOTAL_BODIES.toLocaleString(),
          ' near-Earth objects. Where a result depends on an assumption, or falls outside a validated range, the tool states that rather than showing a confident number.',
        ),
        h(
          'div',
          { style: BUTTON_ROW_STYLE },
          h('a', { href: route('/v2/porkchop/'), style: BUTTON_STYLE }, 'Open the porkchop tool →'),
        ),
      ),
      section(
        'How it was built',
        paragraph(
          'Aster is built with an AI-directed engineering process held to a fixed discipline. For each unit of work — a "slice" — an AI advisor named Nova drafts the founding document, the research, and the execution dispatches; a human reviews every decision, independently verifies external numbers against their sources, and locks each decision before execution. The order is fixed — pre-research, decisions, founding document, execution, multi-agent audit, deploy — and skipping a step is treated as a defect to be caught and corrected.',
        ),
        paragraph(
          'Everything below links the actual working documents that process produced — pinned to the commit they existed at. They were not written for this page.',
        ),
        h('h3', { style: SUBTITLE_STYLE }, 'The decision record'),
        paragraph(
          'Each slice opens with a founding document that fixes its decisions, open questions, and invariants before code is written, and is locked by a human before execution. The documents record their own authorship.',
        ),
        h('ul', { style: LIST_STYLE }, decisionRecord),
        h('h3', { style: SUBTITLE_STYLE }, 'Adversarial audit before deploy'),
        paragraph(
          'Math-layer work is reviewed by three independent AI lenses — a mathematician, an adversary, and an architect — reconciled into severity-ranked findings, each resolved before deploy.',
        ),
        h(
          'ul',
          { style: LIST_STYLE },
          exhibit(
            'Slice 10 audit cycle',
            'nine findings across high/medium/low severity, each resolved, with honest reconciliation where the audit\'s own numbers differed from measurement.',
            ARTIFACTS.slice10Audit,
          ),
          exhibit(
            'Slice 13 audit',
            'findings, severities, and the specific commits that closed them.',
            ARTIFACTS.slice13Audit,
          ),
        ),
        h('h3', { style: SUBTITLE_STYLE }, 'Verify before lock'),
        paragraph(
          'No external number enters a decision until it is independently checked against a reference.',
        ),
        h(
          'ul',
          { style: LIST_STYLE },
          exhibit(
            'Held-out validation against NASA launch-services data',
            'the STRICT and OBSERVED error classes behind the validation panel.',
            ARTIFACTS.oracle,
          ),
          exhibit(
            'Three merged verification passes',
            'the record of the verify-before-lock step for the cost model.',
            ARTIFACTS.verification,
          ),
        ),
        h('h3', { style: SUBTITLE_STYLE }, 'The operating system'),
        paragraph(
          'The repository carries the rules the AI agents run under — the reason the process is repeatable rather than ad hoc.',
        ),
        h(
          'ul',
          { style: LIST_STYLE },
          exhibit(
            'Invariants the agents must not violate',
            'the technical constraints, index-current.',
            ARTIFACTS.invariants,
          ),
          exhibit(
            'The multi-agent operating manual',
            'how each agent is routed to what it needs.',
            ARTIFACTS.agents,
          ),
          exhibit(
            'Per-slice engineering log',
            // L3-4 fix: the old caption claimed "every shipped physics
            // approximation, recorded" — the canonical approximation record for
            // Slices 10-13 lives in the per-slice founding documents, not the
            // DEVLOG, so the universal claim was false on a trust surface.
            'decisions and corrections, slice by slice.',
            ARTIFACTS.devlog,
          ),
        ),
        h(
          'p',
          { style: BODY_STYLE },
          h('a', { href: REPO_ROOT_URL, style: INLINE_LINK_STYLE }, 'Browse the full repository →'),
        ),
      ),
      h(ValidationSection, { doc }),
    ),
  );
}

render(h(AboutPage, {}), mount);
