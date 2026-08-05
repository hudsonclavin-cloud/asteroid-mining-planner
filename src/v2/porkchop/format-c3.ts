/**
 * Shared C3 display formatter — 3 significant figures at every display
 * site (Hudson-locked 2026-08-04, S-S17-B0A). One rule replaces the five
 * per-site precisions the B0 recon found; the compare view consumes this
 * module too. Pure function, no app/ or view imports.
 *
 * Plain (non-exponential) notation for 1e-4 <= |c3| < 1e5 — the range a
 * reader expects to see unexponentiated; outside it, 3-sig-fig
 * exponential. Readout surfaces (hover, pinned, ΔV stack) are precision
 * instruments, keep their 6-decimal formatting, and must NOT adopt this.
 */
export function formatC3(c3: number | null): string {
  if (c3 === null) {
    return '—';
  }
  if (!Number.isFinite(c3)) {
    return String(c3);
  }
  const magnitude = Math.abs(c3);
  if (magnitude !== 0 && (magnitude < 1e-4 || magnitude >= 1e5)) {
    return c3.toExponential(2);
  }
  const precise = c3.toPrecision(3);
  // toPrecision goes exponential once the integer part exceeds the
  // precision (>= 1000); round-trip through Number to render it plain.
  return precise.includes('e') ? String(Number(precise)) : precise;
}
