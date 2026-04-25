/**
 * Commodity price fetch and sessionStorage cache.
 * Source: index.html lines ~1325–1351.
 *
 * Fetches live prices from the Cloudflare Worker (/api/prices),
 * caches in sessionStorage as 'aster_prices_v1', falls back to STATIC_PRICES_EARTH.
 */

import { WORKER_URL } from '../../utils/config';
import { STATIC_PRICES_EARTH } from './active';

/** Raw price payload from the worker or static fallback. Module-level singleton. */
export let cachedPriceData: any = null;

/** Price display mode: 'earth' (spot price) or 'space' (in-situ value). */
export let matPriceMode: 'earth' | 'space' = 'earth';

export let matSortKey = 'totalValue';
export let matSortAsc = false;
export let activePresetKey = '';
export let priceSource = 'loading';
export let priceAt = 0;

export function setMatPriceMode(mode: 'earth' | 'space') { matPriceMode = mode; }
export function setCachedPriceData(data: any) { cachedPriceData = data; priceSource = data?.source || 'unknown'; priceAt = data?.timestamp || 0; }

/**
 * Fetch commodity prices from the Cloudflare Worker with a sessionStorage cache.
 * Falls back silently to STATIC_PRICES_EARTH if the worker is unreachable.
 */
export async function fetchPrices(forceRefresh = false): Promise<void> {
  const CACHE_KEY = 'aster_prices_v1';
  if (!forceRefresh) {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        cachedPriceData = JSON.parse(raw);
        priceSource = cachedPriceData?.source || 'cached';
        priceAt = cachedPriceData?.timestamp || 0;
        return;
      }
    } catch(_) {}
  }
  try {
    const res = await fetch(`${WORKER_URL}/api/prices`);
    if (res.ok) {
      cachedPriceData = await res.json();
      priceSource = cachedPriceData?.source || 'live';
      priceAt = cachedPriceData?.timestamp || 0;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cachedPriceData));
      return;
    }
  } catch(_) {}
  cachedPriceData = { prices: STATIC_PRICES_EARTH, source: 'static', timestamp: Date.now() };
  priceSource = cachedPriceData.source;
  priceAt = cachedPriceData.timestamp;
}
