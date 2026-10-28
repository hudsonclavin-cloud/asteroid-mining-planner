import { h, type VNode } from 'preact';
import { A11Y_OVERRIDES } from '../a11y-overrides.js';

const labels: Record<string, string> = {
  low_departure_c3: 'low C3',
  high_departure_c3: 'high C3',
  lambert_unconvergeable: 'unconv.',
  propagator_failed: 'prop fail',
};

export function StatusBadge(status: string): VNode {
  const color = status === 'low_departure_c3'
    ? A11Y_OVERRIDES.statusLowC3.value
    : status === 'high_departure_c3' ? '#666' : status === 'lambert_unconvergeable' ? '#9a4a4a' : '#7a3a7a';
  return h('span', {
    style: { fontSize: '10px', padding: '2px 6px', borderRadius: '3px', background: color, color: '#fff' },
  }, labels[status] ?? status);
}
