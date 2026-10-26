import type { VNode } from 'preact';

export interface ArtifactLink {
  readonly label: string;
  readonly commit: string;
  readonly path: string;
  readonly anchor?: string;
}

interface AuditItem {
  readonly title: string;
  readonly body: string;
  readonly artifact: ArtifactLink;
}

const AUDIT_ITEMS: readonly AuditItem[] = [
  {
    title: 'Lambert solver audit cycle',
    body:
      "nine findings across high/medium/low severity, each resolved, with honest reconciliation where the audit's own numbers differed from measurement.",
    artifact: {
      label: 'Multi-agent audit engineering record',
      commit: '3d5f1cd',
      path: 'src/v2/SLICE_10_FOUNDING.md',
      anchor: 'oq-8--multi-agent-audit-cycle-engineering-record',
    },
  },
  {
    title: 'Mission-cost audit',
    body: 'findings, severities, and the specific commits that closed them.',
    artifact: {
      label: 'Mission-cost engineering record',
      commit: '8fc6f32',
      path: 'src/v2/SLICE_13_FOUNDING.md',
      anchor: '8-engineering-record-running-log',
    },
  },
];

export function renderAboutAuditItems(
  renderExhibit: (title: string, body: string, artifact: ArtifactLink) => VNode,
): readonly VNode[] {
  return AUDIT_ITEMS.map((item) => renderExhibit(item.title, item.body, item.artifact));
}
