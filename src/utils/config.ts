/**
 * Runtime configuration: Cloudflare Worker URL resolution.
 * Source: index.html lines ~3121–3136.
 */

/**
 * Resolve the Cloudflare Worker base URL at startup.
 * Reads ?apiBase= or ?workerUrl= from the query string so dev/staging
 * environments can point at a local wrangler dev instance without a rebuild.
 * Falls back to the production Workers URL.
 */
export function resolveWorkerUrl(): string {
  const fallback = 'https://aster-proxy.hudsonclavin.workers.dev';
  try {
    const params = new URLSearchParams(location.search);
    const explicit = params.get('apiBase') || params.get('workerUrl') || fallback;
    const url = new URL(explicit, location.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('invalid protocol');
    const pathname = url.pathname && url.pathname !== '/' ? url.pathname.replace(/\/+$/, '') : '';
    return `${url.origin}${pathname}`;
  } catch (_) {
    return fallback;
  }
}

/** Resolved Worker URL — singleton, safe to import from anywhere. */
export const WORKER_URL = resolveWorkerUrl();
(window as any).WORKER_URL = WORKER_URL;

/** True on phones/tablets — used to reduce geometry resolution. */
export const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 1;
