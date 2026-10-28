import { h, type VNode } from 'preact';

export type EmptyReason = 'no-matches' | 'loading' | 'tiers-not-loaded';

export type TierLoadState = 'loading' | 'loaded' | 'failed';

export function catalogEmptyReason(args: {
  readonly catalogLoaded: boolean;
  readonly screeningLoaded: boolean;
  readonly tierLoadState: TierLoadState;
}): EmptyReason {
  if (args.tierLoadState === 'failed') {
    return 'tiers-not-loaded';
  }
  if (!args.catalogLoaded || !args.screeningLoaded || args.tierLoadState === 'loading') {
    return 'loading';
  }
  return 'no-matches';
}

export function renderEmpty(reason: EmptyReason): VNode {
  const message =
    reason === 'loading'
      ? 'Loading the catalog\u2026'
      : reason === 'tiers-not-loaded'
        ? "Fidelity tiers didn't load, so tier filters are unavailable. Reload to try again."
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

export function renderCatalogHeading(reason: EmptyReason | null, count: number): VNode {
  return h(
    'span',
    {
      style: {
        color: '#fff',
        fontWeight: 600,
        fontSize: '14px',
      },
    },
    reason === 'loading' ? 'Loading the catalog\u2026' : `NEA Catalog (${count.toLocaleString()})`,
  );
}
