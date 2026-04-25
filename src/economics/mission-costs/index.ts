/**
 * Mission cost modeling — Tsiolkovsky propellant equation, launch cost, overhead multiplier.
 * Source: index.html lines ~1097–1152 (computeEconomicsSummary) and ~4365–4370 (propellantKgNum).
 *
 * Baseline assumptions:
 *   - Launch cost: $2,700/kg (Falcon 9 rate)
 *   - Overhead multiplier: 1.8× (ops, integration, contingency)
 *   - Default Isp: 450 s (chemical, LH2/LOX class)
 *   - Default dry mass: 1,000 kg
 */

import {
  getDisplayDeltaV,
  getActivePrices,
  MAT_COMP,
  MAT_KEYS,
  computeReturnedMassModel,
  computeWholeBodyValueSummary,
  primaryCommodityForSpec,
  getMatSpec,
  getPriceSourceLabel,
  getCatalogSourceLabel,
} from '../pricing/active';

import { computeRealizableNPV } from '../npv/index';

/**
 * Numeric Tsiolkovsky rocket equation (returns propellant kg, not a string).
 * Capped at 95% propellant fraction (mass ratio 20) to gate against
 * unphysical high-ΔV trajectories that would produce infinite wet mass.
 *
 * @param dv_kms - Required ΔV in km/s
 * @param isp    - Specific impulse in seconds
 * @param m_dry  - Dry mass in kg
 */
export function propellantKgNum(dv_kms: number, isp: number, m_dry: number): number {
  const g0 = 0.00980665; // km/s²
  const raw = m_dry * (Math.exp(dv_kms / (g0 * isp)) - 1);
  return Math.min(raw, m_dry * 19); // 95% propellant fraction cap
}

/**
 * Compute a screening-grade economics summary for a target asteroid.
 * All outputs are order-of-magnitude estimates — not mission-grade.
 */
export function computeEconomicsSummary(ast: any, options: any = {}): any {
  const dryMass = Number.isFinite(options.dryMass) ? options.dryMass : 1000;
  const isp = Number.isFinite(options.isp) ? options.isp : 450;
  const dv = Number.isFinite(options.dv) ? options.dv : getDisplayDeltaV(ast);
  const launchCostPerKg = Number.isFinite(options.launchCostPerKg) ? options.launchCostPerKg : 2700;
  const totalCostMultiplier = Number.isFinite(options.totalCostMultiplier) ? options.totalCostMultiplier : 1.8;
  const payloadKg = Number.isFinite(options.payloadKg) ? options.payloadKg : dryMass * 0.05;
  const extractionFraction = Number.isFinite(options.extractionFraction) ? options.extractionFraction : 0.05;
  const g0 = 9.80665; // m/s²

  // Tsiolkovsky: propellant mass from ΔV (converted to m/s for g0 in m/s²)
  const propellantKg = Number.isFinite(dv) && Number.isFinite(isp) && isp > 0
    ? dryMass * (Math.exp(dv * 1000 / (g0 * isp)) - 1)
    : null;
  const launchMassKg = Number.isFinite(propellantKg) ? dryMass + propellantKg! : null;
  const launchCostUsd = Number.isFinite(launchMassKg) ? launchMassKg! * launchCostPerKg : null;
  const totalCostUsd = Number.isFinite(launchCostUsd) ? launchCostUsd! * totalCostMultiplier : null;

  const spec = getMatSpec(ast);
  const prices = getActivePrices();
  const comp = spec ? MAT_COMP[spec] : null;
  let revenuePerKg: number | null = null;
  if (comp) {
    revenuePerKg = 0;
    MAT_KEYS.forEach((k: string) => { revenuePerKg! += (comp[k] / 100) * (prices[k] || 0); });
  }
  const returnModel = computeReturnedMassModel(ast, { payloadKg, extractionFraction });
  const wholeBodyValue = computeWholeBodyValueSummary(ast);
  const returnedKg = returnModel.returnedKg;
  const paperValueUsd = Number.isFinite(returnedKg) && Number.isFinite(revenuePerKg) ? returnedKg * revenuePerKg! : null;
  const npvUsd = computeRealizableNPV(primaryCommodityForSpec(spec) ?? '', returnedKg, revenuePerKg ?? 0);
  const roiMultiple = Number.isFinite(totalCostUsd) && totalCostUsd! > 0 && Number.isFinite(npvUsd)
    ? npvUsd! / totalCostUsd!
    : null;

  return {
    spec, revenuePerKg, propellantKg, launchMassKg, launchCostUsd, totalCostUsd,
    extractableKg: returnModel.extractableKg, returnedKg,
    returnModelLimit: returnModel.limit, returnModelSource: returnModel.source,
    paperValueUsd, realizableNpvUsd: npvUsd, roiMultiple,
    priceSourceLabel: getPriceSourceLabel(),
    economicsSourceLabel: `screening-grade composition economics (${getCatalogSourceLabel(ast)})`,
    wholeBodyWaterValueUsd: wholeBodyValue.waterValueUsd,
    wholeBodyMetalValueUsd: wholeBodyValue.metalValueUsd,
    wholeBodyTotalValueUsd: wholeBodyValue.totalValueUsd,
    wholeBodyValueSource: wholeBodyValue.source,
  };
}
