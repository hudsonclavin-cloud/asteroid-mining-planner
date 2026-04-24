import { GM_moon, GM_mars, R_cap, R_mars } from '../../constants/index.js';

// ─── Patched-conic helpers ────────────────────────────────────────────────────

// Compute patched-conic departure + arrival burns from a Lambert solution.
// v_earth, v_ast: heliocentric velocity vectors [km/s]
// v_t1, v_t2:    Lambert transfer velocities [km/s] at Earth and asteroid ends
// r_park_km:     parking orbit radius (km) from Earth centre
// Returns { dv_dep, dv_arr, C3, vinf_dep_mag, vinf_arr_mag }
export function patchedConic(v_earth: number[], v_t1: number[], v_ast: number[], v_t2: number[], r_park_km: number) {
  const mu_e = 398600.4418; // km³/s²
  const rp   = r_park_km;

  const vinf_dep = [v_t1[0]-v_earth[0], v_t1[1]-v_earth[1], v_t1[2]-v_earth[2]];
  const vinf_dep_mag = Math.hypot(vinf_dep[0], vinf_dep[1], vinf_dep[2]);
  const C3 = vinf_dep_mag * vinf_dep_mag;

  const v_park = Math.sqrt(mu_e / rp);
  const v_hyp  = Math.sqrt(C3 + 2 * mu_e / rp);
  const dv_dep = v_hyp - v_park;

  const vinf_arr = [v_t2[0]-v_ast[0], v_t2[1]-v_ast[1], v_t2[2]-v_ast[2]];
  const dv_arr   = Math.hypot(vinf_arr[0], vinf_arr[1], vinf_arr[2]);

  return { dv_dep, dv_arr, C3, vinf_dep_mag, vinf_arr_mag: dv_arr };
}

// Compute destination-capture ΔV using the actual target body/state when available.
export function destinationCaptureDv(v_inf_mag: number, targetProfile: any): number | null {
  if (!Number.isFinite(v_inf_mag) || !targetProfile) return null;
  const extra = targetProfile.captureExtraDv || 0;
  if (targetProfile.body === 'earth') {
    const rp = targetProfile.orbitRadiusKm;
    const v_circ = Math.sqrt(398600.4418 / rp);
    const v_hyp = Math.sqrt(v_inf_mag * v_inf_mag + 2 * 398600.4418 / rp);
    return v_hyp - v_circ + extra;
  }
  if (targetProfile.body === 'moon') {
    const rp = targetProfile.orbitRadiusKm || R_cap;
    const v_circ = Math.sqrt(GM_moon / rp);
    const v_hyp = Math.sqrt(v_inf_mag * v_inf_mag + 2 * GM_moon / rp);
    return Math.max(0, v_hyp - v_circ) + extra;
  }
  if (targetProfile.body === 'mars') {
    const rp = targetProfile.orbitRadiusKm || (R_mars + 400);
    const v_circ = Math.sqrt(GM_mars / rp);
    const v_hyp = Math.sqrt(v_inf_mag * v_inf_mag + 2 * GM_mars / rp);
    return Math.max(0, v_hyp - v_circ) + extra;
  }
  return Math.max(0.15, v_inf_mag * 0.25) + extra;
}

// Heuristic: flag low-C3 departures as lunar-assist candidates (v_inf < 3.2 km/s → C3 < ~10)
export function checkLunarAssist(vinf_dep_mag: number): boolean {
  return vinf_dep_mag < 3.2;
}
