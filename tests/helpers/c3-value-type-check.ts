import { C3Value, type GridDescriptor } from '../../src/v2/app/design/components/C3Value.js';

const grid: GridDescriptor = {
  spanStartUtc: '2026-01-01',
  spanEndUtc: '2040-01-01',
  nDep: 200,
  nTof: 100,
  departureStepLabel: '25.7 d',
  tofStepLabel: '16.6 d',
};

C3Value({ value: 4.21, unit: 'km²/s²', grid, refusal: '—' });

// @ts-expect-error C3Value must carry the descriptor for the grid that produced the value.
C3Value({ value: 4.21, unit: 'km²/s²', refusal: '—' });
