/**
 * Mission plan and mission report export utilities.
 *
 * Source: index.html lines 4181–4253 (exportMissionReport)
 *         index.html lines 6150–6162 (exportMissionPlan)
 *
 * exportMissionPlan() — downloads the full computed mission profile as a .txt file
 *   using the currently selected trajectory (missionResults[selectedTrajIdx]) and
 *   asteroid (asteroidData[selectedId]).
 *
 * exportMissionReport() — downloads a standalone text report for the selected asteroid
 *   including orbital elements, ΔV budget, planned gizmo burns, and economics.
 */

// @ts-ignore — runtime global during transition
declare let selectedTrajIdx: number;
// @ts-ignore — runtime global during transition
declare let missionResults: Array<unknown> & { source?: string };
// @ts-ignore — runtime global during transition
declare let selectedId: number;
// @ts-ignore — runtime global during transition
declare const asteroidData: Array<Record<string, unknown>>;
// @ts-ignore — runtime global during transition
declare const burns: Array<{ dv_p: number; dv_n: number; dv_r: number; jd: number }>;
// @ts-ignore — runtime global during transition
declare const currentJD: number;
// @ts-ignore — runtime global during transition
declare function computeMissionProfile(traj: unknown): { text: string };
// @ts-ignore — runtime global during transition
declare function computeFeasibilityMetrics(ast: Record<string, unknown>): {
  deltaV: { value: number; source: string };
};
// @ts-ignore — runtime global during transition
declare function resolveAsteroidMassModel(ast: Record<string, unknown>): {
  diameterM: number;
  massKg: number;
} | null;
// @ts-ignore — runtime global during transition
declare function resolveAsteroidEconomics(ast: Record<string, unknown>): {
  extractableValueUsd: number;
  wholeBodyPriceUsd: number;
  rawProfitUsd: number;
};
// @ts-ignore — runtime global during transition
declare function computeEconomicsSummary(
  ast: Record<string, unknown>,
  opts: {
    dryMass: number;
    isp: number;
    dv: number;
    launchCostPerKg: number;
    totalCostMultiplier: number;
    payloadKg: number;
  }
): {
  paperValueUsd: number;
  realizableNpvUsd: number;
};
// @ts-ignore — runtime global during transition
declare function jdToDate(jd: number): string;
// @ts-ignore — runtime global during transition
declare function formatValueDisplay(v: number): string;
// @ts-ignore — runtime global during transition
declare function fmtUSD(v: number): string;
// @ts-ignore — runtime global during transition
declare function setStatus(msg: string, warn?: boolean): void;

// ─── exportMissionPlan ────────────────────────────────────────────────────────

/**
 * Downloads the full mission profile text for the currently selected trajectory.
 * Source: index.html lines 6150–6162
 */
export function exportMissionPlan(): void {
  // @ts-ignore — runtime global during transition
  if (selectedTrajIdx < 0 || !missionResults[selectedTrajIdx]) return;
  // @ts-ignore — runtime global during transition
  const profile = computeMissionProfile(missionResults[selectedTrajIdx]);
  // @ts-ignore — runtime global during transition
  const ast = asteroidData[selectedId] as Record<string, unknown>;
  const blob = new Blob([profile.text], { type:'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `aster-mission-${((ast.designation || ast.full_name || 'asteroid') as string).replace(/[\s/]/g,'-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  setStatus(`Mission plan exported: ${(ast.full_name || ast.pdes || 'asteroid') as string}`, true);
}

// ─── exportMissionReport ──────────────────────────────────────────────────────

/**
 * Downloads a standalone asteroid mission report as a .txt file.
 * Includes orbital elements, ΔV budget, planned gizmo burns, and economics.
 * Source: index.html lines 4181–4253
 */
export function exportMissionReport(): void {
  // @ts-ignore — runtime global during transition
  if (selectedId < 0) { setStatus('Select an asteroid first', true); return; }
  // @ts-ignore — runtime global during transition
  const ast = asteroidData[selectedId] as Record<string, unknown>;
  const name = (ast.full_name || ast.pdes || 'unknown') as string;
  const fi = computeFeasibilityMetrics(ast);
  const dv = fi.deltaV.value;
  const dvSuffix = fi.deltaV.source === 'NHATS' ? ' (NHATS)' : fi.deltaV.source === 'Asterank' ? '' : ' (estimated)';
  const massModel = resolveAsteroidMassModel(ast);
  const econ = resolveAsteroidEconomics(ast);
  const econSummary = computeEconomicsSummary(ast, { dryMass: 1000, isp: 450, dv, launchCostPerKg: 2700, totalCostMultiplier: 1.8, payloadKg: 1000 });
  const D_m = massModel ? massModel.diameterM : null;
  const mass_kg = massModel ? massModel.massKg : null;
  const g0 = 0.00980665;
  const m_prop = 1000 * (Math.exp(dv / (g0 * 450)) - 1);
  const launchCost = (1000 + m_prop) * 2700 * 1.8;
  // @ts-ignore — runtime global during transition
  const burnLines = burns.map((b: { dv_p: number; dv_n: number; dv_r: number }, i: number) =>
    `  Burn ${i+1}: prograde ${b.dv_p.toFixed(3)} km/s, radial ${b.dv_r.toFixed(3)} km/s, normal ${b.dv_n.toFixed(3)} km/s`
  );
  const nhatsAst = ast.nhats as { accessible?: boolean } | undefined;
  const _nhats = ast._nhats;
  const lines = [
    '═══════════════════════════════════════════════════════════',
    '  ASTER MISSION REPORT',
    `  Target: ${name}`,
    `  Generated: ${new Date().toISOString()}`,
    `  Simulation Date: ${jdToDate(currentJD)}`,
    '═══════════════════════════════════════════════════════════',
    '',
    '── TARGET PROFILE ──────────────────────────────────────────',
    `  Spectral Type:     ${(ast.spec || ast.spec_T || '—') as string}`,
    `  Diameter:          ${D_m !== null ? (D_m!/1000).toFixed(3) + ' km' : 'unknown'}`,
    `  Est. Mass:         ${mass_kg !== null ? mass_kg!.toExponential(2) + ' kg' : 'unknown'}`,
    `  ΔV:                ${dv.toFixed(2)} km/s [${fi.deltaV.source}]`,
    `  NHATS Status:      ${nhatsAst?.accessible ? 'VERIFIED (JPL)' : _nhats ? 'ESTIMATED' : 'NO'}`,
    '',
    '── ORBITAL ELEMENTS ────────────────────────────────────────',
    `  Semi-major axis:   ${Number(ast.a).toFixed(6)} AU`,
    `  Eccentricity:      ${Number(ast.e).toFixed(6)}`,
    `  Inclination:       ${Number(ast.i).toFixed(4)}°`,
    `  RAAN (Ω):          ${Number(ast.om).toFixed(4)}°`,
    `  Arg. of Periapsis: ${Number(ast.w).toFixed(4)}°`,
    `  Mean Anomaly:      ${Number(ast.ma).toFixed(4)}°`,
    `  MOID (Earth):      ${Number.isFinite(Number(ast.moid)) ? Number(ast.moid).toFixed(6) + ' AU' : 'unknown'}`,
    '',
    '── MISSION ΔV BUDGET ───────────────────────────────────────',
    `  Min. Rendezvous ΔV: ${dv.toFixed(3)} km/s${dvSuffix}`,
    `  Propellant mass:    ${m_prop.toFixed(0)} kg (Isp=450s, m_dry=1000kg)`,
    // @ts-ignore — runtime global during transition
    ...(burns.length > 0 ? ['', '  Planned Burns:', ...burnLines] : []),
    '',
    '── ECONOMICS ───────────────────────────────────────────────',
    `  Extractable Value: ${formatValueDisplay(econ.extractableValueUsd)}`,
    `  Whole-body Price:  ${formatValueDisplay(econ.wholeBodyPriceUsd)}`,
    `  Raw Profit:        ${formatValueDisplay(econ.rawProfitUsd)}`,
    `  Paper Value:       ${formatValueDisplay(econSummary.paperValueUsd)}`,
    `  Realizable NPV:    ${formatValueDisplay(econSummary.realizableNpvUsd)}`,
    `  Est. Launch Cost:  ${fmtUSD(launchCost)} (Falcon 9 rate × 1.8 overhead)`,
    '',
    '── CAVEATS ─────────────────────────────────────────────────',
    '  ΔV from Keplerian propagation only (no perturbations)',
    '  Economics are order-of-magnitude estimates',
    '  Verify launch windows with JPL Horizons before mission design',
    '',
    '═══════════════════════════════════════════════════════════',
    '  Generated by ASTER — asteroid-mining-planner',
    '═══════════════════════════════════════════════════════════',
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `aster_report_${name.replace(/[^a-z0-9]/gi, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus(`✓ Report exported: ${name}`);
}
