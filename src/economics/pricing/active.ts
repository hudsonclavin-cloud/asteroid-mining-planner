/**
 * Active commodity prices, material composition constants, and asteroid value functions.
 * Source: index.html lines 2123–2230 (headers/constants) and lines 946–1078 (functions).
 *
 * Functions here resolve which prices are "active" based on matPriceMode (earth vs space),
 * map asteroid spectral types to composition buckets, and compute whole-body and
 * per-mission returned-mass value summaries. These are screening-grade estimates only.
 */

import {
  cachedPriceData,
  matPriceMode,
  matSortKey,
  matSortAsc,
  priceSource,
  priceAt,
} from './index';

import { formatIsoDateShort } from '../../utils/dates';
import { MAT_DIFFICULTY } from '../scoring';
import { getNhatsMetricValue } from '../../physics/catalog/normalizers';

// ─── Material Composition Constants ───────────────────────────────────────────

export const MAT_KEYS = ['water','iron','nickel','cobalt','carbon','silicates','pgm','gold','silver','copper','rareEarth'];

export const MAT_NAMES: Record<string, string> = {
  water:'Water', iron:'Iron', nickel:'Nickel', cobalt:'Cobalt', carbon:'Carbon',
  silicates:'Silicates', pgm:'PGMs', gold:'Gold', silver:'Silver', copper:'Copper', rareEarth:'Rare Earth',
};

export const MAT_COLORS_HEX: Record<string, string> = {
  water:'#4488ff', iron:'#cc6633', nickel:'#aaaaaa', cobalt:'#6699cc',
  carbon:'#555566', silicates:'#8B7355', pgm:'#00d4ff', gold:'#ffcc00',
  silver:'#cccccc', copper:'#cc8833', rareEarth:'#aa44cc',
};

/** Weight-percent composition by spectral type (C, S, M, X).
 *  Each value is a percentage of bulk mass. */
export const MAT_COMP: Record<string, Record<string, number>> = {
  C: { water:10,  carbon:3,    silicates:65, iron:15,  nickel:2,   cobalt:0.05,  pgm:0.003,  gold:0.0001,  silver:0.001,  copper:0.001,  rareEarth:0.01  },
  S: { water:0.5, carbon:0.2,  silicates:68, iron:22,  nickel:3,   cobalt:0.10,  pgm:0.005,  gold:0.0002,  silver:0.002,  copper:0.002,  rareEarth:0.02  },
  M: { water:0.1, carbon:0.05, silicates:4.8,iron:88,  nickel:7,   cobalt:0.10,  pgm:0.010,  gold:0.001,   silver:0.005,  copper:0.010,  rareEarth:0.005 },
  X: { water:5,   carbon:2,    silicates:67, iron:18,  nickel:2.5, cobalt:0.08,  pgm:0.004,  gold:0.00015, silver:0.0015, copper:0.0015, rareEarth:0.015 },
};

export const MAT_DENSITY_KGM3: Record<string, number> = { C:1300, S:2700, M:5300, X:2000 };

export const STATIC_PRICES_EARTH: Record<string, number> = {
  water:0, iron:0.12, nickel:16, cobalt:28, pgm:31000,
  gold:92000, silver:1050, copper:9.50, carbon:0.50, silicates:0.01, rareEarth:250,
};

export const STATIC_PRICES_SPACE: Record<string, number> = {
  water:50000, iron:0.12, nickel:16, cobalt:28, pgm:31000,
  gold:92000, silver:1050, copper:9.50, carbon:10000, silicates:5000, rareEarth:250,
};

// ─── Active Price Resolution ──────────────────────────────────────────────────

/**
 * Returns the currently-active price map, blending live/cached prices with
 * STATIC_PRICES_SPACE overrides when matPriceMode is 'space'.
 */
export function getActivePrices(): Record<string, number> {
  const base = cachedPriceData?.prices || STATIC_PRICES_EARTH;
  return matPriceMode === 'space' ? { ...base, ...STATIC_PRICES_SPACE } : base;
}

// ─── Asteroid Spec + Price Labels ─────────────────────────────────────────────

/**
 * Returns the display ΔV for an asteroid.
 * Preference: NHATS verified → Asterank field → Aster Hohmann estimate.
 */
export function getDisplayDeltaV(ast: any): number {
  const nhatsDv = ast.nhats?.accessible ? getNhatsMetricValue(ast.nhats.minDv, 'dv') : 0;
  if (nhatsDv > 0) return nhatsDv;
  if (Number(ast.delta_v) > 0) return Number(ast.delta_v);
  return getAsteroidDV(ast);
}

/**
 * Returns a short human-readable label for the catalog(s) that provided this asteroid's data.
 */
export function getCatalogSourceLabel(ast: any): string {
  if (ast?.source_label) return ast.source_label;
  const parts = ['Asterank'];
  if (ast?.nhats?.accessible) parts.push('NHATS');
  if (ast?.jpl_source || ast?.orbit_source === 'JPL') parts.push('JPL');
  return parts.join(' + ');
}

/**
 * Returns a human-readable label describing the current commodity price source.
 * References module-level priceSource / priceAt from pricing/index.ts via runtime globals.
 */
export function getPriceSourceLabel(): string {
  if (priceSource === 'loading') return 'prices loading';
  if (priceSource === 'live') return `live spot prices (${formatIsoDateShort(priceAt)})`;
  if (priceSource === 'cached') return `cached spot prices (${formatIsoDateShort(priceAt)})`;
  if (priceSource === 'static') return 'static fallback prices';
  return String(priceSource || 'unknown');
}

// ─── Spectral Type → Composition Key Mapping ──────────────────────────────────

/**
 * Maps an asteroid's spectral type string to one of the four MAT_COMP keys
 * (C, S, M, X) used for composition and value calculations. Returns null for unknown types.
 */
export function getMatSpec(ast: any): string | null {
  const s = (ast.spec || ast.spec_T || '').trim().charAt(0).toUpperCase();
  if ('CBP D'.includes(s) && s) return 'C';
  if ('SQA'.includes(s) && s) return 'S';
  if ('ME'.includes(s) && s) return 'M';
  if ('XKLVT'.includes(s) && s) return 'X';
  return null;
}

/**
 * Returns the primary export commodity for a spectral type.
 * Used to select the market elasticity model for NPV discounting.
 */
export function primaryCommodityForSpec(spec: string | null): string | null {
  const s = (spec || '').charAt(0).toUpperCase();
  if (s === 'M') return 'platinum';
  if (s === 'S') return 'nickel';
  if (s === 'C') return 'water';
  return null;
}

// ─── Returned Mass Model ──────────────────────────────────────────────────────

/**
 * Computes the mass of ore that can realistically be returned from a mission,
 * bounded by asteroid extraction capacity and spacecraft payload limit.
 *
 * @param ast     - Asteroid data object
 * @param options - { extractionFraction (default 0.05), payloadKg }
 */
export function computeReturnedMassModel(ast: any, options: any = {}): any {
  const extractionFraction = Number.isFinite(options.extractionFraction) ? options.extractionFraction : 0.05;
  const payloadKg = Number.isFinite(options.payloadKg) ? Math.max(0, options.payloadKg) : null;
  const massModel = resolveAsteroidMassModel(ast);
  const extractableKg = massModel ? massModel.massKg * extractionFraction : null;
  const returnedKg = Number.isFinite(extractableKg)
    ? (Number.isFinite(payloadKg) ? Math.min(extractableKg!, payloadKg!) : extractableKg)
    : null;
  let limit = 'unknown';
  if (Number.isFinite(extractableKg) && Number.isFinite(payloadKg)) {
    limit = extractableKg! > payloadKg! ? 'payload-capped' : 'extraction-capped';
  } else if (Number.isFinite(payloadKg)) {
    limit = 'payload-only';
  } else if (Number.isFinite(extractableKg)) {
    limit = 'extraction-only';
  }
  const source = massModel
    ? `${(extractionFraction * 100).toFixed(0)}% extraction, payload-capped by spacecraft throughput`
    : 'unknown asteroid mass or spectral model';
  return { extractableKg, returnedKg, limit, source, massModel };
}

// ─── Whole-Body Value Summary ─────────────────────────────────────────────────

/**
 * Computes the total in-situ resource value of the entire asteroid body
 * broken down by water, metals, and total. Uses MAT_COMP + active prices.
 */
export function computeWholeBodyValueSummary(ast: any): any {
  const matData = computeMaterialRows(ast);
  if (!matData?.rows?.length) {
    return {
      waterValueUsd: null,
      metalValueUsd: null,
      totalValueUsd: null,
      source: 'unknown composition or size',
    };
  }
  const waterKeys = new Set(['water']);
  const metalKeys = new Set(['iron', 'nickel', 'cobalt', 'pgm', 'gold', 'silver', 'copper', 'rareEarth']);
  let waterValueUsd = 0;
  let metalValueUsd = 0;
  let totalValueUsd = 0;
  matData.rows.forEach((row: any) => {
    totalValueUsd += row.totalValue;
    if (waterKeys.has(row.key)) waterValueUsd += row.totalValue;
    if (metalKeys.has(row.key)) metalValueUsd += row.totalValue;
  });
  return {
    waterValueUsd,
    metalValueUsd,
    totalValueUsd,
    source: `whole-body composition estimate (${matData.spec}-type, ${getPriceSourceLabel()})`,
  };
}

// Re-export matSortKey and matSortAsc so callers that import from this module
// can read them without a separate import from pricing/index.
export { matSortKey, matSortAsc };

export function getAsteroidDV(ast: any): number {
  if (ast.delta_v && Number(ast.delta_v) > 0) return Number(ast.delta_v);
  if (ast.dv && Number(ast.dv) > 0) return Number(ast.dv);
  if (ast.min_dv && Number(ast.min_dv) > 0) return Number(ast.min_dv);
  const a = Number(ast.a) || 1.5;
  const e = Number(ast.e) || 0;
  const i_rad = (Number(ast.i) || 0) * Math.PI / 180;
  const mu = 1.0;
  const v_earth = Math.sqrt(mu / 1.0);
  const v_ast = Math.sqrt(mu * (1 + e) / (a * (1 - e)));
  const dv_transfer = Math.abs(v_ast - v_earth);
  const dv_inc = 2 * v_earth * Math.sin(i_rad / 2);
  const dv_au_yr = dv_transfer + dv_inc * 0.5;
  const LEO_DEPART = 3.2;
  return Math.min(15.0, dv_au_yr * 4.740 + LEO_DEPART);
}

export function getDisplayDuration(ast: any): number {
  const nhatsDur = ast.nhats?.accessible ? getNhatsMetricValue(ast.nhats.minDur, 'dur') : 0;
  if (nhatsDur > 0) return nhatsDur;
  return Math.round(180 + (getDisplayDeltaV(ast) - 3) * 20);
}

export function getAsteroidDiameterMeters(ast: any): number | null {
  const direct = Number(ast?._diam_m);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const diamKm = Number(ast?.diameter);
  if (Number.isFinite(diamKm) && diamKm > 0) return diamKm * 1000;
  const hVal = Number(ast?.H);
  if (!(Number.isFinite(hVal) && hVal > 0)) return null;
  const albedo = Number(ast?.albedo);
  const safeAlbedo = Number.isFinite(albedo) && albedo > 0 ? albedo : 0.15;
  return (1329 / Math.sqrt(safeAlbedo)) * Math.pow(10, -hVal / 5) * 1000;
}

export function resolveAsteroidMassModel(ast: any): any {
  const diameterM = getAsteroidDiameterMeters(ast);
  if (!(Number.isFinite(diameterM) && diameterM > 0)) return null;
  const spec = getMatSpec(ast);
  const densityKgM3 = MAT_DENSITY_KGM3[spec || 'X'] || 2000;
  const radiusM = diameterM / 2;
  const massKg = (4 / 3) * Math.PI * radiusM * radiusM * radiusM * densityKgM3;
  return { diameterM, radiusM, densityKgM3, massKg, spec };
}

export function computeMaterialRows(ast: any): any {
  const massModel = resolveAsteroidMassModel(ast);
  if (!massModel || !massModel.spec) return null;
  const spec = massModel.spec;
  const comp = MAT_COMP[spec];
  const massKg = massModel.massKg;
  const prices = getActivePrices();
  const rows = MAT_KEYS.map((k) => {
    const pct = comp[k] || 0;
    const kg = massKg * (pct / 100);
    const priceKg = prices[k] || 0;
    return {
      key: k,
      name: MAT_NAMES[k],
      pct,
      kg,
      priceKg,
      totalValue: kg * priceKg,
      difficulty: MAT_DIFFICULTY[k],
    };
  });
  rows.sort((a, b) => {
    const dir = matSortAsc ? 1 : -1;
    if (matSortKey === 'name') return a.name.localeCompare(b.name) * dir;
    return ((a as any)[matSortKey] - (b as any)[matSortKey]) * dir;
  });
  return { rows, massKg, spec, massModel };
}

export function resolveAsteroidEconomics(ast: any): any {
  const massModel = resolveAsteroidMassModel(ast);
  const wholeBodyPriceUsd = Number.isFinite(ast?.price) && ast.price > 0 ? ast.price : null;
  const rawProfitUsd = Number.isFinite(ast?.profit) && ast.profit > 0 ? ast.profit : null;
  let extractableValueUsd = Number.isFinite(ast?.value_extractable_est) && ast.value_extractable_est > 0
    ? ast.value_extractable_est
    : null;
  if (extractableValueUsd === null) {
    const matData = computeMaterialRows(ast);
    if (matData?.rows?.length) {
      extractableValueUsd = matData.rows.reduce((sum: number, row: any) => sum + row.totalValue, 0);
    }
  }
  return {
    diameterKm: massModel ? massModel.diameterM / 1000 : null,
    diameterSource: ast?.diameter_source || (massModel ? 'estimated' : 'unknown'),
    wholeBodyPriceUsd,
    rawProfitUsd,
    extractableValueUsd,
    extractableValueSource: extractableValueUsd !== null ? (ast?.value_extractable_source || 'heuristic') : 'unknown',
    hasKnownSize: !!massModel,
    massModel,
  };
}

export function computeFeasibilityMetrics(ast: any): any {
  let dvVal = null;
  let dvUnc: number | string = '?';
  let dvSrc = 'Unknown';
  let dvMethod = 'unknown';
  const nhatsDv = ast.nhats?.accessible ? getNhatsMetricValue(ast.nhats.minDv, 'dv') : 0;
  if (nhatsDv > 0) {
    dvVal = nhatsDv; dvUnc = 0.3; dvSrc = 'NHATS'; dvMethod = 'JPL NHATS';
  } else if (Number(ast.delta_v) > 0) {
    dvVal = Number(ast.delta_v); dvUnc = 1.0; dvSrc = 'Asterank'; dvMethod = 'catalog';
  } else {
    dvVal = getAsteroidDV(ast); dvUnc = 3.0; dvSrc = 'Aster est.'; dvMethod = 'hohmann-visviva';
  }
  const nhatsDur = ast.nhats?.accessible ? getNhatsMetricValue(ast.nhats.minDur, 'dur') : 0;
  const durationVal = nhatsDur > 0 ? nhatsDur : Math.round(180 + (dvVal - 3) * 20);
  const econ = resolveAsteroidEconomics(ast);
  return {
    deltaV: { value: dvVal, uncertainty: dvUnc, source: dvSrc, method: dvMethod },
    duration: { value: durationVal, source: nhatsDur > 0 ? 'NHATS' : 'heuristic' },
    valueRange: { optimistic: econ.extractableValueUsd, conservative: econ.rawProfitUsd ?? econ.extractableValueUsd },
    accessibility: { nhatsVerified: !!ast.nhats?.accessible },
    hazard: { riskLevel: ast.pha ? 'PHA' : 'nominal' },
  };
}
