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

export function C3Value(props: C3ValueProps): string {
  if (props.value === null) {
    const prefix = props.prefix ? `${props.prefix} ` : '';
    return `${prefix}${props.refusal} ${props.unit} (${props.grid})`;
  }
  const prefix = props.prefix ? `${props.prefix} ` : '';
  return `${prefix}${formatC3ValueText(props.value, props.unit)} (${props.grid})`;
}
