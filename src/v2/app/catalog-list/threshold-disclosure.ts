import { h, type VNode } from 'preact';
import { C3Value, type GridDescriptor } from '../design/components/C3Value.js';

const LOW_C3_GRID: GridDescriptor = {
  spanStartUtc: null,
  spanEndUtc: null,
  nDep: null,
  nTof: null,
  departureStepLabel: 'not displayed',
  tofStepLabel: 'not displayed',
};

export function lowC3ThresholdText(feasibleC3MaxKm2S2: number): string {
  const formattedThreshold = C3Value({
    value: feasibleC3MaxKm2S2,
    unit: 'km²/s²',
    grid: LOW_C3_GRID,
    refusal: '—',
    includeGrid: false,
  });
  return `LOW C3: below ${formattedThreshold} (the screening threshold)`;
}

export function renderLowC3ThresholdLegend(feasibleC3MaxKm2S2: number | null): VNode | null {
  if (feasibleC3MaxKm2S2 === null) {
    return null;
  }
  const text = lowC3ThresholdText(feasibleC3MaxKm2S2);
  return h('div', { title: text, style: { lineHeight: 1.6 } }, text);
}
