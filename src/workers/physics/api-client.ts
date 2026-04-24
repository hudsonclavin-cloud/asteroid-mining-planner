import { NHATS_DEFAULTS, DEFAULT_PROXY_BASE, API_BASE_URL, setApiBaseUrl } from '../../physics/constants/index.js';

export function buildNhatsUrl(overrides?: any, baseOverride?: string): string {
  return buildApiUrl('/api/nhats', {
    ...NHATS_DEFAULTS,
    ...(overrides || {}),
  }, baseOverride);
}

export function buildAsterankUrl(limit: number, baseOverride?: string): string {
  return buildApiUrl('/api/asterank', {
    query: JSON.stringify({ neo: 'Y' }),
    limit: String(limit),
    sort: 'delta_v',
    fields: 'pdes,full_name,a,e,i,om,w,ma,epoch,H,spec,profit,delta_v,price,closeness,neo,pha,class,diameter,albedo,moid,last_obs,condition_code',
  }, baseOverride);
}

export function sanitizeApiBase(value: any): string {
  try {
    const raw = String(value || DEFAULT_PROXY_BASE).trim();
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('invalid protocol');
    const pathname = url.pathname && url.pathname !== '/' ? url.pathname.replace(/\/+$/, '') : '';
    return `${url.origin}${pathname}`;
  } catch (_) {
    return DEFAULT_PROXY_BASE;
  }
}

export function buildApiUrl(path: string, params: Record<string, any>, baseOverride: string = API_BASE_URL): string {
  const url = new URL(`${sanitizeApiBase(baseOverride)}${path}`);
  for (const [key, value] of Object.entries(params || {})) {
    if (value === null || value === undefined || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export function applyWorkerConfig(msg: any): void {
  if (!msg || typeof msg !== 'object') return;
  if (Object.prototype.hasOwnProperty.call(msg, 'apiBase')) {
    setApiBaseUrl(sanitizeApiBase(msg.apiBase));
  }
}

export function getApiBaseCandidates(): string[] {
  const primary = sanitizeApiBase(API_BASE_URL);
  const fallback = sanitizeApiBase(DEFAULT_PROXY_BASE);
  return primary === fallback ? [primary] : [primary, fallback];
}
