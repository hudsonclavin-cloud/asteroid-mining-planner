import { h, type VNode } from 'preact';

export function FeasibilityBadge(label: string): VNode {
  return h('span', { 'aria-label': label, role: 'status' }, label);
}
