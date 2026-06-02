import { h, type VNode } from 'preact';

export type EmptyReason = 'no-data' | 'no-matches' | 'loading';

export function renderEmpty(reason: EmptyReason): VNode {
  const message =
    reason === 'loading'
      ? 'Loading screening data…'
      : reason === 'no-data'
        ? 'No catalog loaded.'
        : 'No bodies match the current filters.';

  return h(
    'div',
    {
      style: {
        padding: '40px 20px',
        color: '#888',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '13px',
      },
    },
    message,
  );
}
