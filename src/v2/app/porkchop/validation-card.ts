import { h, type ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';

// Front 2 validation card. Renders EXCLUSIVELY from the committed provenance JSON —
// no validation number is a literal in this file (INV-026). The JSON is loaded at
// runtime with the same new URL(..., import.meta.url) + fetch pattern main.ts uses
// for the Horizons fixture (keeps tsc happy without resolveJsonModule, and lets Vite
// emit the file as an asset).
const PROVENANCE_URL = new URL('../../data/validation-provenance.json', import.meta.url);

interface ProvenanceRow {
  readonly id: string;
  readonly label: string;
  readonly measures: string;
  readonly value: string;
  readonly sourceValue: string;
  readonly format: string;
  readonly asOf?: string;
  readonly solverConfig: string;
  readonly sourceArtifact: string;
  readonly sourceCommit: string;
  readonly class: string | null;
  readonly note: string;
}

interface HeadlineSpec {
  readonly rowId: string;
  readonly label: string;
  readonly className: string;
  readonly surface: string;
  readonly framing: string;
}

interface ProvenanceDoc {
  readonly headline: HeadlineSpec;
  readonly classDefinitions: Record<string, string>;
  readonly observedDisclosure: string;
  readonly rows: readonly ProvenanceRow[];
}

const PANEL_STYLE =
  'border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px;background:rgba(255,255,255,0.03);margin-top:16px;';
const TITLE_STYLE = 'font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;';
const INTRO_STYLE = 'font-size:12px;color:#93a4bf;line-height:1.6;margin-bottom:12px;';
const HEADLINE_VALUE_STYLE = 'font-size:24px;font-weight:700;color:#fff;line-height:1.25;';
const STRICT_BADGE_STYLE =
  'display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:rgba(125,211,252,0.16);color:#7dd3fc;';
const OBSERVED_BADGE_STYLE =
  'display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:rgba(251,191,36,0.16);color:#fbbf24;';
const HEADLINE_SUB_STYLE = 'font-size:11px;color:#93a4bf;line-height:1.5;margin-top:4px;';
const FRAMING_STYLE = 'font-size:12px;color:#cbd5e1;line-height:1.5;margin-top:8px;';
const CLASSDEF_STYLE = 'font-size:11px;color:#9fb0c8;line-height:1.5;margin-top:8px;';
const ROWS_WRAP_STYLE =
  'margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;gap:12px;';
const ROW_LABEL_STYLE = 'font-size:12px;font-weight:600;color:#e5edfb;';
const ROW_VALUE_STYLE = 'font-size:13px;color:#fff;margin-top:2px;';
const ROW_MUTED_STYLE = 'font-size:11px;color:#93a4bf;line-height:1.5;margin-top:2px;';
const ROW_SOURCE_STYLE =
  'font-size:10px;color:#7f8fab;margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all;';
const DETAILS_STYLE =
  'margin-top:14px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;line-height:1.55;color:#9fb0c8;';
const OBSERVED_VALUE_STYLE = 'font-size:16px;font-weight:700;color:#fbbf24;';
const DISCLOSURE_STYLE = 'margin-top:10px;color:#cbd5e1;line-height:1.55;';

function artifactBasename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

function sourceLine(row: ProvenanceRow) {
  return h(
    'div',
    { style: ROW_SOURCE_STYLE, title: `${row.sourceArtifact} @ ${row.sourceCommit}` },
    `source: ${artifactBasename(row.sourceArtifact)} @ ${row.sourceCommit}`,
  );
}

function renderRow(row: ProvenanceRow) {
  const valueText = row.asOf ? `${row.value} · as-of ${row.asOf}` : `${row.value} — ${row.format}`;
  return h(
    'div',
    { key: row.id },
    h('div', { style: ROW_LABEL_STYLE }, row.label),
    h('div', { style: ROW_VALUE_STYLE }, valueText),
    h('div', { style: ROW_MUTED_STYLE }, row.measures),
    h('div', { style: ROW_MUTED_STYLE }, row.solverConfig),
    row.note ? h('div', { style: ROW_MUTED_STYLE }, row.note) : null,
    sourceLine(row),
  );
}

function panel(...children: ComponentChildren[]) {
  return h('section', { style: PANEL_STYLE }, h('div', { style: TITLE_STYLE }, 'Validation'), ...children);
}

export function ValidationCard() {
  const [doc, setDoc] = useState<ProvenanceDoc | null>(null);
  const [failed, setFailed] = useState(false);

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
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return panel(h('div', { style: INTRO_STYLE }, 'Validation summary is temporarily unavailable.'));
  }
  if (doc === null) {
    return panel(h('div', { style: INTRO_STYLE }, 'Loading validation summary…'));
  }

  const headlineRow = doc.rows.find((row) => row.id === doc.headline.rowId);
  const detailRows = doc.rows.filter((row) => row.class !== 'OBSERVED' && row.id !== doc.headline.rowId);
  const observedRow = doc.rows.find((row) => row.class === 'OBSERVED');
  const strictDef = doc.classDefinitions.STRICT;
  const observedDef = doc.classDefinitions.OBSERVED;

  return panel(
    h(
      'div',
      { style: INTRO_STYLE },
      'Every number here is checked against an independent reference. Each row names the exact source file and the commit it was verified against.',
    ),
    headlineRow
      ? h(
          'div',
          { key: 'headline', style: 'margin:4px 0 6px;' },
          h(
            'div',
            { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;' },
            h('span', { style: HEADLINE_VALUE_STYLE }, headlineRow.value),
            h('span', { style: STRICT_BADGE_STYLE }, doc.headline.className),
          ),
          h('div', { style: HEADLINE_SUB_STYLE }, `${doc.headline.label} · ${doc.headline.surface}`),
          h('div', { style: FRAMING_STYLE }, doc.headline.framing),
          strictDef ? h('div', { style: CLASSDEF_STYLE }, `STRICT — ${strictDef}`) : null,
          sourceLine(headlineRow),
        )
      : null,
    h('div', { key: 'rows', style: ROWS_WRAP_STYLE }, detailRows.map(renderRow)),
    h(
      'details',
      { key: 'observed', style: DETAILS_STYLE },
      h('summary', { style: 'cursor:pointer;color:#a5b4cf;' }, 'Worst case & full disclosure'),
      observedRow
        ? h(
            'div',
            { style: 'margin-top:10px;' },
            h(
              'div',
              { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;' },
              h('span', { style: OBSERVED_VALUE_STYLE }, observedRow.value),
              observedRow.class ? h('span', { style: OBSERVED_BADGE_STYLE }, observedRow.class) : null,
            ),
            h('div', { style: ROW_MUTED_STYLE }, observedRow.solverConfig),
            sourceLine(observedRow),
          )
        : null,
      observedDef ? h('div', { style: CLASSDEF_STYLE }, `OBSERVED — ${observedDef}`) : null,
      h('div', { style: DISCLOSURE_STYLE }, doc.observedDisclosure),
    ),
  );
}
