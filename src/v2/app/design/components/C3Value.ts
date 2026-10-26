import { h, type VNode } from 'preact';
import { formatC3 } from '../../../porkchop/format-c3.js';

export interface C3ValueProps {
  readonly value: number | null;
  readonly unit: string;
  readonly grid: string;
  readonly refusal: string;
  readonly prefix?: string;
}

export function formatC3ValueText(value: number | null, unit: string): string {
  if (value === null || !Number.isFinite(value)) {
    return formatC3(value);
  }
  return `${formatC3(value)} ${unit}`;
}

export function C3Value(props: C3ValueProps): VNode {
  if (props.value === null) {
    return h('span', null, props.refusal);
  }
  const prefix = props.prefix ? `${props.prefix} ` : '';
  return h('span', { title: props.grid }, `${prefix}${formatC3ValueText(props.value, props.unit)} (${props.grid})`);
}
