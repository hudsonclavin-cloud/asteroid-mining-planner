import { h, type VNode } from 'preact';
import { A11Y_OVERRIDES } from '../a11y-overrides.js';

const labels: Record<string, string> = {
  low_departure_c3: 'low C3',
  high_departure_c3: 'high C3',
  lambert_unconvergeable: 'unconv.',
  propagator_failed: 'prop fail',
};

const colors: Record<string, string> = {
  low_departure_c3: A11Y_OVERRIDES.statusLowC3.value,
  high_departure_c3: '#666',
  lambert_unconvergeable: '#9a4a4a',
  propagator_failed: '#7a3a7a',
  L0: '#9a4a4a',
  L1: A11Y_OVERRIDES.tierL1.value,
  L2: '#4f6680',
};

export interface StatusBadgeProps {
  readonly status: string;
  readonly label?: string;
  readonly title?: string;
  readonly compact?: boolean;
}

export function StatusBadge(props: StatusBadgeProps | string): VNode {
  const status = typeof props === 'string' ? props : props.status;
  const label = typeof props === 'string' ? labels[status] ?? status : props.label ?? labels[status] ?? status;
  const compact = typeof props === 'string' ? false : props.compact === true;
  const color = colors[status] ?? '#555';
  return h('span', {
    title: typeof props === 'string' ? undefined : props.title,
    style: {
      fontSize: compact ? '9px' : '10px',
      padding: compact ? '1px 5px' : '2px 6px',
      borderRadius: '3px',
      background: color,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      flexShrink: 0,
    },
  }, label);
}
