import { h, type VNode } from 'preact';

export type FeasibilityBadgeTone = 'GREEN' | 'AMBER' | 'RED' | undefined;

export interface FeasibilityBadgeProps {
  readonly label: string;
  readonly tone?: FeasibilityBadgeTone;
}

const TONE_STYLES: Record<Exclude<FeasibilityBadgeTone, undefined>, string> = {
  GREEN: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#22c55e;color:#04130a;font-size:11px;font-weight:700;',
  AMBER: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#f59e0b;color:#170f02;font-size:11px;font-weight:700;',
  RED: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#ef4444;color:#1f0505;font-size:11px;font-weight:700;',
};

export function FeasibilityBadge(props: FeasibilityBadgeProps | string): VNode {
  const label = typeof props === 'string' ? props : props.label;
  const tone = typeof props === 'string' ? undefined : props.tone;
  return h('span', {
    'aria-label': label,
    role: 'status',
    style: tone ? TONE_STYLES[tone] : undefined,
  }, label);
}
