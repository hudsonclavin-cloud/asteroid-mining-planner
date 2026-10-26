import { C3Value } from '../src/v2/app/design/components/C3Value.js';

C3Value({ value: 1, unit: 'km²/s²', grid: 'cached grid', refusal: '—' });
// @ts-expect-error C3Value must receive the derived grid descriptor.
C3Value({ value: 1, unit: 'km²/s²', refusal: '—' });
