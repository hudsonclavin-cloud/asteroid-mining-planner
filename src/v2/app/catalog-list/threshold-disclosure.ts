import { h, type VNode } from 'preact';
import { formatC3 } from '../../porkchop/format-c3.js';

export function lowC3ThresholdText(feasibleC3MaxKm2S2: number): string {
  return `LOW C3: below ${formatC3(feasibleC3MaxKm2S2)} km²/s² (the screening threshold)`;
}

export function renderLowC3ThresholdLegend(feasibleC3MaxKm2S2: number | null): VNode | null {
  if (feasibleC3MaxKm2S2 === null) {
    return null;
  }
  const text = lowC3ThresholdText(feasibleC3MaxKm2S2);
  return h('div', { title: text, style: { lineHeight: 1.6 } }, text);
}
