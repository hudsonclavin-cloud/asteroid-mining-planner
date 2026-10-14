import { h, type VNode } from 'preact';

export type EmptyReason = 'no-data' | 'no-matches' | 'loading' | 'tiers-not-loaded';

export type TierLoadState = 'loading' | 'loaded' | 'failed';

export function catalogEmptyReason(args: {
  readonly catalogLoaded: boolean;
  readonly screeningLoaded: boolean;
  readonly tierLoadState: TierLoadState;
}): EmptyReason {
  if (args.tierLoadState !== 'loaded') {
    return 'tiers-not-loaded';
  }
  if (!args.screeningLoaded) {
    return 'loading';
  }
  return args.catalogLoaded ? 'no-matches' : 'no-data';
}

export function renderEmpty(reason: EmptyReason): VNode {
  const message =
    reason === 'loading'
      ? 'Loading screening data…'
      : reason === 'tiers-not-loaded'
        ? "Fidelity tiers didn't load, so tier filters are unavailable. Reload to try again."
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
