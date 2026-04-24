/**
 * Date and Julian Date conversion utilities.
 * All date math in the app goes through these helpers.
 * Source: index.html lines ~845–913 (post CSS-extraction numbering).
 */

/** Convert a Julian Date to a human-readable calendar string (e.g. "2026-APR-23"). */
export function jdToDate(jd: number): string {
  const l = Math.floor(jd + 0.5) + 68569;
  const n = Math.floor((4 * l) / 146097);
  const ll = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (ll + 1)) / 1461001);
  const lll = ll - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * lll) / 2447);
  const day = lll - Math.floor((2447 * j) / 80);
  const lll2 = Math.floor(j / 11);
  const month = j + 2 - 12 * lll2;
  const year = 100 * (n - 49) + i + lll2;
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${year}-${MONTHS[month - 1]}-${String(day).padStart(2, '0')}`;
}

/** Format a USD value with K/M/B/T/Q suffix. Returns '—' for null/undefined. */
export function fmtUSD(v: number | null | undefined): string {
  if (!v && v !== 0) return '—';
  const n = Number(v);
  if (isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e15) return `$${(n / 1e15).toFixed(1)}Q`;
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (abs >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3)  return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** Format a value for display with optional extraction label. */
export function formatValueDisplay(value: number, options: { unknownLabel?: string; extractionLabel?: boolean } = {}): string {
  const { unknownLabel = 'unknown', extractionLabel = false } = options;
  if (!(Number.isFinite(value) && value > 0)) return unknownLabel;
  const base = fmtUSD(value);
  return extractionLabel ? `${base} (5% extraction est.)` : base;
}

/** Format a mass in kg to a human-readable string with unit suffix. */
export function formatMassDisplay(kg: number, unknownLabel = 'unknown'): string {
  if (!(Number.isFinite(kg) && kg >= 0)) return unknownLabel;
  if (kg >= 1e9) return `${(kg / 1e9).toFixed(2)}B kg`;
  if (kg >= 1e6) return `${(kg / 1e6).toFixed(2)}M kg`;
  if (kg >= 1e3) return `${(kg / 1e3).toFixed(1)} t`;
  return `${Math.round(kg)} kg`;
}

/** Shorten an ISO timestamp to a YYYY-MM-DD string. */
export function formatIsoDateShort(ts: string | number | null | undefined): string {
  if (!ts) return 'unknown';
  const d = new Date(ts as string);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toISOString().slice(0, 10);
}

/** Format a tonnage value with k/M/B/T suffix. */
export function fmtTons(t: number | null | undefined): string {
  if (!t && t !== 0) return '—';
  const n = Number(t);
  if (n >= 1e12) return `${(n/1e12).toFixed(2)}T t`;
  if (n >= 1e9)  return `${(n/1e9).toFixed(2)}B t`;
  if (n >= 1e6)  return `${(n/1e6).toFixed(2)}M t`;
  if (n >= 1e3)  return `${(n/1e3).toFixed(1)}k t`;
  return `${n.toFixed(1)} t`;
}
