/**
 * src/data/nhats/index.ts
 *
 * NHATS (Near-Earth Object Human Space Flight Accessible Targets Study) data
 * fetch and localStorage cache logic.
 * Owns: fetchNHATSData() — index.html lines ~3663–3676.
 *
 * Cache key: aster_nhats_v2  (localStorage, 24-hour TTL)
 * On a cache hit the parsed rows are forwarded to applyNHATSData().
 * On a cache miss a 'fetch_nhats' command is posted to the physics worker.
 *
 * The nhats_result worker message handler (index.html lines ~2573–2586)
 * writes the fresh payload back to localStorage under the same key.
 *
 * NOTE: References worker (postMessage), WORKER_URL, and applyNHATSData
 * which are runtime globals.
 * TODO: import from src/... once Stage 9 wiring is complete.
 */

export async function fetchNHATSData(): Promise<void> {
  const cacheKey = 'aster_nhats_v2'; // bumped to force fresh fetch after URL change
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 3600 * 1000) {
        // TODO: import applyNHATSData from src/...
        (window as any).applyNHATSData(data);
        return;
      }
    } catch (_) {}
  }
  // TODO: import worker and WORKER_URL from src/...
  (window as any).worker.postMessage({ cmd: 'fetch_nhats', apiBase: (window as any).WORKER_URL });
}
