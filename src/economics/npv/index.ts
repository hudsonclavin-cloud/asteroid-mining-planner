/**
 * Realizable NPV model — demand-adjusted net present value for returned materials.
 * Source: index.html lines ~1080–1095.
 *
 * Uses price elasticity and annual market caps per commodity to model
 * how much the market price drops when a large asteroid return floods supply.
 * Discounts cash flows at 8% annually over a 10-year sell-down period.
 */

/**
 * Compute the demand-adjusted NPV for selling returnedKg of a commodity.
 *
 * @param commodity  - Key from elasticity/annualMarketKg tables
 * @param returnedKg - Total kg returned from the asteroid
 * @param spotPricePerKg - Current spot price in USD/kg
 * @param yearsToSell - Sell-down horizon in years (default 10)
 * @param discountRate - Annual discount rate (default 0.08 = 8%)
 * @returns Discounted NPV in USD, or null if inputs are invalid
 */
export function computeRealizableNPV(
  commodity: string,
  returnedKg: number,
  spotPricePerKg: number,
  yearsToSell = 10,
  discountRate = 0.08
): number | null {
  // Price elasticity of demand per commodity (negative = normal good)
  const elasticity: Record<string, number> = { platinum: -0.4, palladium: -0.5, nickel: -0.3, iron: -0.2, water: -0.8 };
  // Annual terrestrial market size in kg (null = market too large to move the price)
  const annualMarketKg: Record<string, number | null> = {
    platinum: 170000, palladium: 190000, nickel: 2500000000, iron: 2000000000000, water: null
  };

  if (!(Number.isFinite(returnedKg) && returnedKg > 0 && Number.isFinite(spotPricePerKg) && spotPricePerKg > 0)) return null;

  const annualMarket = annualMarketKg[commodity];
  // For commodities with negligible market impact, skip elasticity correction
  if (!annualMarket) return returnedKg * spotPricePerKg;

  const epsilon = elasticity[commodity] || -0.3;
  const annualSale = returnedKg / yearsToSell;
  let npv = 0;
  for (let year = 1; year <= yearsToSell; year++) {
    // Price ratio: adding annualSale to the market reduces price per elasticity law
    const priceRatio = Math.pow((annualMarket + annualSale) / annualMarket, 1 / epsilon);
    const realizedPrice = spotPricePerKg * priceRatio;
    npv += (annualSale * realizedPrice) / Math.pow(1 + discountRate, year);
  }
  return npv;
}
