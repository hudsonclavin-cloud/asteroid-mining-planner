import { h, type VNode } from 'preact';
import {
  isNearZeroC3Degenerate,
  NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2,
} from '../core/constants/near-zero-c3.js';

export const NEAR_ZERO_C3_BADGE_TEXT = 'near-zero C3';

export function nearZeroC3HiddenNotice(count: number): string {
  return `near-zero-C3 window hidden (${count})`;
}

export function nearZeroC3Tooltip(): string {
  return (
    `This flag is triggered because this value is below ${NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2} km\u00B2/s\u00B2. ` +
    'Values like this typically indicate close-approach co-location of Earth and the body; ' +
    'the value is mathematically valid but operationally meaningless. It is a flag to inspect ' +
    'the geometry, not a planning number.'
  );
}

export function renderNearZeroC3Badge(flagged: boolean): VNode | null {
  if (!flagged) {
    return null;
  }

  const tooltip = nearZeroC3Tooltip();
  return h(
    'span',
    {
      title: tooltip,
      'aria-label': NEAR_ZERO_C3_BADGE_TEXT,
      style: {
        fontSize: '10px',
        padding: '2px 6px',
        borderRadius: '3px',
        background: '#9a6b2f',
        color: '#fff',
        letterSpacing: '0.5px',
        flexShrink: 0,
      },
    },
    NEAR_ZERO_C3_BADGE_TEXT,
  );
}

export { isNearZeroC3Degenerate };
