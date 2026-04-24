export function isPlausiblePlannerOrbit(el: any, maxApoAu: number = 5.5): boolean {
  if (!el || !Number.isFinite(el.a) || !Number.isFinite(el.e)) return false;
  if (el.a <= 0 || el.e < 0 || el.e >= 1) return false;
  const peri = el.a * (1 - el.e);
  const apo = el.a * (1 + el.e);
  return Number.isFinite(peri) &&
    Number.isFinite(apo) &&
    peri > 0 &&
    apo <= maxApoAu;
}
