import { h, type VNode } from 'preact';

export type EvidenceBadgeTone = 'strict' | 'observed' | undefined;

export interface EvidenceBadgeProps {
  readonly label: string;
  readonly tone?: EvidenceBadgeTone;
}

const TONE_STYLES: Record<Exclude<EvidenceBadgeTone, undefined>, string> = {
  strict: 'display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:rgba(125,211,252,0.16);color:#7dd3fc;',
  observed: 'display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:2px 7px;border-radius:999px;background:rgba(251,191,36,0.16);color:#fbbf24;',
};

export function EvidenceBadge(props: EvidenceBadgeProps | string): VNode {
  const label = typeof props === 'string' ? props : props.label;
  const tone = typeof props === 'string' ? undefined : props.tone;
  return h('span', {
    'aria-label': label,
    role: 'status',
    style: tone ? TONE_STYLES[tone] : undefined,
  }, label);
}
