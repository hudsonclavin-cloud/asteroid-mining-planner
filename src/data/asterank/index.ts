/**
 * src/data/asterank/index.ts
 *
 * Asterank catalog fetch wiring on the main thread.
 * Owns:
 *   - triggerCatalogFetch()  — posts 'fetch_catalog' to the physics worker
 *     (index.html lines ~7779–7784)
 *   - onCatalogReady(data)   — handles the 'catalog_ready' worker message:
 *     persists to IndexedDB/localStorage, calls buildAsteroidMesh, caches
 *     NHATS rows, hides the loading overlay (index.html lines ~2615–2656)
 *
 * The cache boot sequence (stale-key eviction, IndexedDB hit check,
 * localStorage fallback) lives in index.html's async init() and is NOT
 * duplicated here — it will be migrated in a later stage.
 *
 * NOTE: References worker, WORKER_URL, saveToIndexedDB, buildAsteroidMesh,
 * fetchNHATSData, loadStateFromURL, showTour, selectedAsteroidKey,
 * selectedId, asteroidData, and loadSourceStatus — all runtime globals.
 * TODO: import from src/... once Stage 9 wiring is complete.
 */

// TODO: import saveToIndexedDB from src/data/cache/indexeddb
// TODO: import fetchNHATSData from src/data/nhats

/**
 * Post a fetch_catalog command to the physics worker.
 * Called from init() after cache misses.  Extracted from index.html ~7779–7783.
 */
export function triggerCatalogFetch(): void {
  const sub = document.getElementById('loading-sub');
  if (sub) sub.textContent = 'Connecting to NASA databases...';
  (window as any).loadSourceStatus = {};
  (window as any).worker.postMessage({
    cmd: 'fetch_catalog',
    limit: (window as any).ASTEROID_LIMIT || 5000,
    apiBase: (window as any).WORKER_URL,
  });
  // loadStateFromURL and showTour are called from catalog_ready handler
}

/**
 * Handle the 'catalog_ready' message from the physics worker.
 * Persists the payload to IndexedDB (with localStorage fallback),
 * caches any embedded NHATS rows, builds the asteroid mesh, then
 * hands off to post-load helpers.  Extracted from index.html ~2615–2656.
 */
export function onCatalogReady(data: any): void {
  // Cache to IndexedDB; fall back to localStorage (top 2000 only)
  const payload = {
    schema_version: 7,
    data: data.data,
    timestamp: Date.now(),
    meta: {
      source: data.source || 'asterank',
      fallback: !!data.fallback,
      stale: !!data.stale,
      requestedLimit: data.requestedLimit || data.data.length,
      returnedCount: data.returnedCount || data.data.length,
    },
  };
  if (Array.isArray(data.data) && data.data.length > 0) {
    // TODO: import saveToIndexedDB from src/data/cache/indexeddb
    (window as any).saveToIndexedDB('aster_catalog_v7', payload).catch(() => {
      try {
        localStorage.setItem(
          'aster_catalog_v7',
          JSON.stringify({ ...payload, data: data.data.slice(0, 2000) })
        );
      } catch (_) {}
    });
  }
  // Cache NHATS rows alongside
  if (data.nhatsRows && data.nhatsRows.length > 0) {
    try {
      localStorage.setItem(
        'aster_nhats_v2',
        JSON.stringify({
          data: data.nhatsRows,
          timestamp: Date.now(),
          meta: { stale: !!data.stale, source: 'nhats' },
        })
      );
    } catch (_) {}
  }
  const prevAsteroidKey =
    (window as any).selectedAsteroidKey ||
    ((window as any).selectedId >= 0
      ? (
          ((window as any).asteroidData[(window as any).selectedId]?.pdes ||
            (window as any).asteroidData[(window as any).selectedId]?.full_name ||
            ''
          ).trim()
        )
      : null);
  // TODO: import buildAsteroidMesh from src/renderer
  (window as any).buildAsteroidMesh(data.data);
  if (prevAsteroidKey) {
    const newIdx = (window as any).asteroidData.findIndex(
      (a: any) =>
        (a.pdes || '').trim() === prevAsteroidKey ||
        (a.full_name || '').trim() === prevAsteroidKey
    );
    (window as any).selectedAsteroidKey = prevAsteroidKey;
    (window as any).selectedId = newIdx >= 0 ? newIdx : -1;
  }
  const loading = document.getElementById('loading')!;
  loading.style.transition = 'opacity 0.6s';
  loading.style.opacity = '0';
  setTimeout(() => (loading.style.display = 'none'), 700);
  // TODO: import fetchNHATSData from src/data/nhats
  (window as any).fetchNHATSData(); // apply NHATS data after catalog is built
  // TODO: import loadStateFromURL from src/ui
  (window as any).loadStateFromURL();
  if (!localStorage.getItem('aster_toured')) (window as any).showTour();
}
