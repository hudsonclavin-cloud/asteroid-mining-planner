import { formatC3 } from '../../../porkchop/format-c3.js';

export interface GridDescriptor {
  /** The span that produced the displayed value; null means the source did not publish it. */
  readonly spanStartUtc: string | null;
  readonly spanEndUtc: string | null;
  /** Cell counts when the source grid publishes them; null is an honest unknown. */
  readonly nDep: number | null;
  readonly nTof: number | null;
  readonly departureStepLabel: string;
  readonly tofStepLabel: string;
}

export interface C3ValueProps {
  readonly value: number | null;
  readonly unit: string;
  readonly grid: GridDescriptor;
  readonly refusal: string;
  readonly prefix?: string;
  /** Some surrounding prose already names the source cell; keep the typed grid path without repeating it. */
  readonly includeGrid?: boolean;
}

export function formatC3ValueText(value: number | null, unit: string): string {
  if (value === null || !Number.isFinite(value)) {
    return formatC3(value);
  }
  return `${formatC3(value)} ${unit}`;
}

function formatGridDescriptor(grid: GridDescriptor): string {
  const steps = `${grid.departureStepLabel} \u00D7 ${grid.tofStepLabel} steps`;
  if (grid.nDep === null || grid.nTof === null) {
    return `cached screen: ${steps}`;
  }
  return 'requested grid';
}

export function C3Value(props: C3ValueProps): string {
  const suffix = props.includeGrid === false ? '' : ` (${formatGridDescriptor(props.grid)})`;
  if (props.value === null) {
    const prefix = props.prefix ? `${props.prefix} ` : '';
    return `${prefix}${props.refusal}${props.unit ? ` ${props.unit}` : ''}${suffix}`;
  }
  const prefix = props.prefix ? `${props.prefix} ` : '';
  return `${prefix}${formatC3ValueText(props.value, props.unit)}${suffix}`;
}
