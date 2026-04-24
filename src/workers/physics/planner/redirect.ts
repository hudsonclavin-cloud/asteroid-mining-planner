import { MISSION_GATE_DEP_KMS, GM_AU3_S2, R_earth, DEFAULT_REDIRECT_CAPTURE, DEFAULT_REDIRECT_DELIVERY, DEFAULT_REDIRECT_SPACECRAFT, DEFAULT_REDIRECT_LAUNCH } from '../../../physics/constants/index.js';
import { propagatePlanet, propagateAsteroid } from '../../../physics/propagation/planets.js';
import { resolveRedirectCaptureTarget } from '../../../physics/propagation/targets.js';
import { solveLambertWithOrbitGuard } from '../../../physics/orbital/lambert/solver.js';
import { patchedConic, destinationCaptureDv } from '../../../physics/orbital/patched-conic/index.js';
import { moidApprox } from '../../../physics/orbital/moid.js';

export function handlePlanRedirectMission(msg: any): void {
  const {
    ast,
    jd_start,
    jd_end,
    reqId,
    propulsionModule,
    miningFraction,
    captureTarget,
    deliveryDestination,
    spacecraft,
    launchVehicle,
  } = msg;
  const captureProfile = captureTarget && Number.isFinite(captureTarget.orbitRadiusKm)
    ? captureTarget
    : DEFAULT_REDIRECT_CAPTURE;
  const deliveryProfile = deliveryDestination && Number.isFinite(deliveryDestination.marketMultiplier)
    ? deliveryDestination
    : DEFAULT_REDIRECT_DELIVERY;
  const spacecraftProfile = spacecraft && Number.isFinite(spacecraft.dry_kg)
    ? spacecraft
    : DEFAULT_REDIRECT_SPACECRAFT;
  const launchProfile = launchVehicle && Number.isFinite(launchVehicle.max_kg)
    ? launchVehicle
    : DEFAULT_REDIRECT_LAUNCH;

  // Validate orbital elements
  if (!ast || !isFinite(ast.a) || !isFinite(ast.e) || !isFinite(ast.i)) {
    (self as any).postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: 'Invalid asteroid orbital elements' });
    return;
  }
  // Founding Doc §6.2: block redirect for any asteroid with a non-zero Sentry impact probability
  if (ast.Sentry && Number.isFinite(ast.Sentry.impact_probability) && ast.Sentry.impact_probability > 0) {
    (self as any).postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: 'RESTRICTED: Asteroid has non-zero Sentry impact probability. Redirect planning blocked for hazardous objects.' });
    return;
  }

  // A — Intercept scan: keep a pool of low-departure candidates, then score redirect feasibility per propulsion mode.
  const tof_options = [120, 180, 240, 300, 360, 420, 480, 540, 600];
  const interceptCandidates: any[] = [];
  let lambert_fallback = false;

  for (let jd_dep = jd_start; jd_dep <= jd_end; jd_dep += 30) {
    let earthDep: any;
    try { earthDep = propagatePlanet(2, jd_dep); } catch(e) { continue; }
    const r1   = [earthDep.x, earthDep.y, earthDep.z];
    const ve   = [earthDep.vx, earthDep.vy, earthDep.vz];

    for (const tof of tof_options) {
      const jd_arr = jd_dep + tof;
      let astArr: any;
      try { astArr = propagateAsteroid(ast, jd_arr); } catch(e) { continue; }
      const r2   = [astArr.x, astArr.y, astArr.z];
      const va   = [astArr.vx, astArr.vy, astArr.vz];

      const interceptSolve = solveLambertWithOrbitGuard(
        r1,
        r2,
        tof,
        { x: earthDep.x, y: earthDep.y, z: earthDep.z },
        jd_dep
      );
      const lam = interceptSolve.lam;
      if (interceptSolve.usedFallback || interceptSolve.suspiciousIzzo) lambert_fallback = true;
      if (!lam) continue;

      const pc = patchedConic(ve, lam.v1, va, lam.v2, R_earth / 1000 + 400);
      if (!pc || !isFinite(pc.dv_dep) || pc.dv_dep > MISSION_GATE_DEP_KMS) continue;

      interceptCandidates.push({
        jd_dep, jd_arr, tof,
        dv_dep: pc.dv_dep,
        earthPos: { x: earthDep.x, y: earthDep.y, z: earthDep.z },
        astPos:   { x: astArr.x,   y: astArr.y,   z: astArr.z },
        v_ast:    { vx: astArr.vx, vy: astArr.vy, vz: astArr.vz },
        orbit_el: interceptSolve.orbit_el,
        ve, va,
      });
    }
  }

  if (!interceptCandidates.length) {
    (self as any).postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: `No viable intercept found within ΔV budget (${MISSION_GATE_DEP_KMS.toFixed(0)} km/s)` });
    return;
  }

  interceptCandidates.sort((a, b) => a.dv_dep - b.dv_dep);
  const candidatePool = interceptCandidates.slice(0, 60);

  // B — Asteroid mass
  let d_m: number;
  if (isFinite(ast._diam_m) && ast._diam_m > 0) {
    d_m = ast._diam_m;
  } else if (isFinite(ast.diameter) && ast.diameter > 0) {
    d_m = ast.diameter * 1000;
  } else {
    const H = isFinite(ast.H) ? ast.H : 18;
    const albedo = isFinite(ast.albedo) ? ast.albedo : 0.15;
    d_m = (1329 / Math.sqrt(albedo)) * Math.pow(10, -H / 5) * 1000;
  }
  const mass_kg = (4 / 3) * Math.PI * Math.pow(d_m / 2, 3) * 1500; // 1500 kg/m³ rubble pile
  const spec_type = ast.spec || ast.spec_T || 'unknown';

  const mineable_kg = mass_kg * 0.05;
  const water_kg = mineable_kg * (1 - miningFraction);
  const metal_kg = mineable_kg * miningFraction;
  const whole_body_price_usd = isFinite(ast.price) && ast.price > 0 ? ast.price : null;
  const stype = spec_type.charAt(0).toUpperCase();
  let extractable_value_usd: number | null = null;
  if (stype === 'C') extractable_value_usd = water_kg * 1500 + metal_kg * 500;
  else if (stype === 'M') extractable_value_usd = water_kg * 500 + metal_kg * 15000;
  else extractable_value_usd = water_kg * 500 + metal_kg * 3000;
  if (!isFinite(extractable_value_usd) || extractable_value_usd <= 0) extractable_value_usd = null;

  function evaluateRedirectCandidate(best: any): any {
    const r_ast_AU = Math.hypot(best.astPos.x, best.astPos.y, best.astPos.z);
    const a_transfer_AU = (r_ast_AU + 1.0) / 2;
    const hohmann_s = Math.PI * Math.sqrt(Math.pow(a_transfer_AU, 3) / GM_AU3_S2);
    const hohmann_days = hohmann_s / 86400;
    const hohmann_center = Math.max(90, Math.min(960, Math.round(hohmann_days / 30) * 30));
    const redirectTofCandidates = Array.from(new Set(
      [120, 180, 240, 300, 360, 420, 480, 540, 600, 720, 840, 960]
        .concat([-180, -120, -60, 0, 60, 120, 180].map(offset => hohmann_center + offset))
        .filter(days => Number.isFinite(days) && days >= 90 && days <= 1080)
    )).sort((a, b) => a - b);

    let bestRedirectResult: any = null;
    let bestRedirectFallback: any = null;
    let bestError = 'No redirect transfer solved for this intercept.';

    for (const redirectTofDays of redirectTofCandidates) {
      const jd_capture_arr = best.jd_arr + redirectTofDays;

      let targetCapture: any;
      try { targetCapture = resolveRedirectCaptureTarget(captureProfile, jd_capture_arr); } catch(e) { continue; }

      let dv_redirect: number | null = null;
      let capture_arrival_vinf: number | null = null;
      let redirect_lam_fallback = false;
      let redirect_orbit_el: any = null;

      try {
        const astArr2 = [best.astPos.x, best.astPos.y, best.astPos.z];
        const targetArr2 = [targetCapture.state.x, targetCapture.state.y, targetCapture.state.z];
        const redirectSolve = solveLambertWithOrbitGuard(
          astArr2,
          targetArr2,
          redirectTofDays,
          { x: best.astPos.x, y: best.astPos.y, z: best.astPos.z },
          best.jd_arr
        );
        const rLam = redirectSolve.lam;
        redirect_lam_fallback = redirectSolve.usedFallback || redirectSolve.suspiciousIzzo;
        redirect_orbit_el = redirectSolve.orbit_el;
        if (!rLam) {
          bestError = 'Redirect Lambert solve failed for all tested return windows.';
          continue;
        }

        const dv_x = rLam.v1[0] - best.v_ast.vx;
        const dv_y = rLam.v1[1] - best.v_ast.vy;
        const dv_z = rLam.v1[2] - best.v_ast.vz;
        dv_redirect = Math.hypot(dv_x, dv_y, dv_z);

        const dv_arr_x = rLam.v2[0] - targetCapture.state.vx;
        const dv_arr_y = rLam.v2[1] - targetCapture.state.vy;
        const dv_arr_z = rLam.v2[2] - targetCapture.state.vz;
        capture_arrival_vinf = Math.hypot(dv_arr_x, dv_arr_y, dv_arr_z);
      } catch(e) {
        bestError = 'Redirect transfer evaluation failed during state conversion.';
        continue;
      }

      if (!isFinite(dv_redirect as number) || !redirect_orbit_el) {
        bestError = 'Redirect leg did not yield a bounded elliptic orbit. Hyperbolic/non-elliptic redirects are not supported yet.';
        continue;
      }

      const redirectSafetyMoid = moidApprox(redirect_orbit_el, best.jd_arr, 120);
      if (isFinite(redirectSafetyMoid) && redirectSafetyMoid < 0.0005) {
        bestError = 'RESTRICTED: Redirected orbit MOID < 75,000 km. Planetary defense constraint.';
        continue;
      }

      const v_e = propulsionModule.isp_s * 9.80665 / 1000;
      const mass_ratio = isFinite(dv_redirect as number) ? Math.exp((dv_redirect as number) / v_e) : null;
      const redirectedInertMassKg = mass_kg + spacecraftProfile.dry_kg + spacecraftProfile.payload_kg;
      const m_prop = isFinite(mass_ratio as number) ? redirectedInertMassKg * ((mass_ratio as number) - 1) : null;
      const m_prop_fraction = isFinite(m_prop as number) ? (m_prop as number) / redirectedInertMassKg : null;

      const tugDryKg = spacecraftProfile.dry_kg + spacecraftProfile.payload_kg;
      const outboundMassRatio = Number.isFinite(best.dv_dep) ? Math.exp(best.dv_dep / v_e) : null;
      const outboundPropKg = Number.isFinite(outboundMassRatio as number) ? tugDryKg * ((outboundMassRatio as number) - 1) : null;
      const tugLaunchMassKg = Number.isFinite(outboundPropKg as number) ? tugDryKg + (outboundPropKg as number) : null;
      const fitsLaunchVehicle = Number.isFinite(tugLaunchMassKg as number) ? (tugLaunchMassKg as number) <= launchProfile.max_kg : false;
      const launchCostUsd = Number.isFinite(tugLaunchMassKg as number) ? (tugLaunchMassKg as number) * launchProfile.cost_per_kg : null;
      const supportMissionCostUsd = Number.isFinite(launchCostUsd as number) ? (launchCostUsd as number) + (spacecraftProfile.cost_usd || 0) : null;

      const captureBaseDv = destinationCaptureDv(capture_arrival_vinf as number, targetCapture);
      const dv_capture_target = Number.isFinite(captureBaseDv as number)
        ? captureBaseDv
        : null;
      const dv_delivery = Number.isFinite(dv_capture_target as number)
        ? (deliveryProfile.deliveryExtraDv || 0)
        : null;
      const dv_total_redirect = Number.isFinite(dv_redirect as number) && Number.isFinite(dv_capture_target as number) && Number.isFinite(dv_delivery as number)
        ? best.dv_dep + (dv_redirect as number) + (dv_capture_target as number) + (dv_delivery as number)
        : null;
      const adjustedExtractableValueUsd = Number.isFinite(extractable_value_usd as number)
        ? (extractable_value_usd as number) * (deliveryProfile.marketMultiplier || 1)
        : null;
      const dv_score   = isFinite(dv_total_redirect as number) ? Math.max(0, 1 - (dv_total_redirect as number) / 18) * 45 : 0;
      const prop_score = isFinite(m_prop_fraction as number) ? Math.max(0, 1 - (m_prop_fraction as number)) * 30 : 0;
      const isru_score = isFinite(adjustedExtractableValueUsd as number) ? Math.min(20, Math.log10(Math.max(1, adjustedExtractableValueUsd as number)) / 12 * 20) : 0;
      const launch_score = fitsLaunchVehicle ? 5 : -20;
      const feasibility_score = Math.round((isFinite(dv_score) ? dv_score : 0) + prop_score + isru_score + launch_score);
      const prop_fraction_pct = isFinite(m_prop_fraction as number) ? Math.round((m_prop_fraction as number) * 100) : null;
      const redirectFeasible = Number.isFinite(best.dv_dep) &&
        Number.isFinite(dv_redirect) &&
        Number.isFinite(m_prop_fraction) &&
        fitsLaunchVehicle &&
        (m_prop_fraction as number) < 0.95 &&
        !!redirect_orbit_el;

      const result: any = {
        type: 'redirect_result',
        schema_version: 1,
        reqId,
        feasible: redirectFeasible,
        intercept: {
          jd_dep: best.jd_dep,
          jd_arr: best.jd_arr,
          tof: best.tof,
          dv_dep: best.dv_dep,
          earthPos: best.earthPos,
          astPos: best.astPos,
          orbit_el: best.orbit_el || null,
          segment_jd_start: best.jd_dep,
          segment_jd_end: best.jd_arr,
        },
        redirect: {
          dv_redirect,
          tof_redirect: redirectTofDays,
          jd_capture_arr,
          targetBody: targetCapture.body,
          targetPos: { x: targetCapture.state.x, y: targetCapture.state.y, z: targetCapture.state.z },
          propulsion: propulsionModule.name,
          isp_s: propulsionModule.isp_s,
          orbit_el: redirect_orbit_el,
          segment_jd_start: best.jd_arr,
          segment_jd_end: jd_capture_arr,
        },
        capture: {
          target_key: captureProfile.key || null,
          label: captureProfile.label,
          target_body: targetCapture.body,
          delivery_key: deliveryProfile.key || null,
          delivery_label: deliveryProfile.label,
          dv_lunar_capture: dv_capture_target,
          dv_delivery,
          r_cap_km: captureProfile.orbitRadiusKm,
          targetPos: { x: targetCapture.state.x, y: targetCapture.state.y, z: targetCapture.state.z },
          v_inf_capture_arrival: isFinite(capture_arrival_vinf as number) ? capture_arrival_vinf : null,
          capture_modeled: Number.isFinite(dv_capture_target),
          capture_basis: targetCapture.captureBasis,
        },
        asteroid: { mass_kg, d_m, spec_type },
        isru: {
          mineable_kg,
          water_kg,
          metal_kg,
          mining_frac: miningFraction,
          whole_body_price_usd,
          extractable_value_usd: adjustedExtractableValueUsd,
          extractable_value_basis: '5% extraction heuristic',
        },
        logistics: {
          spacecraft_name: spacecraftProfile.name,
          launch_vehicle_name: launchProfile.name,
          tug_dry_kg: tugDryKg,
          outbound_propellant_kg: Number.isFinite(outboundPropKg as number) ? outboundPropKg : null,
          tug_launch_mass_kg: Number.isFinite(tugLaunchMassKg as number) ? tugLaunchMassKg : null,
          launch_vehicle_max_kg: launchProfile.max_kg,
          fits_launch_vehicle: fitsLaunchVehicle,
          launch_cost_usd: launchCostUsd,
          spacecraft_cost_usd: spacecraftProfile.cost_usd || null,
          support_mission_cost_usd: supportMissionCostUsd,
        },
        flags: {
          prop_fraction_pct,
          high_prop_load: isFinite(m_prop_fraction as number) ? (m_prop_fraction as number) > 0.5 : false,
          lambert_fallback: lambert_fallback || redirect_lam_fallback,
          safety_moid_au: Number.isFinite(redirectSafetyMoid) ? redirectSafetyMoid : null,
          launch_capacity_ok: fitsLaunchVehicle,
        },
        feasibility_score,
        _rank_dv_total: dv_total_redirect,
        _rank_prop_fraction: m_prop_fraction,
      };

      if (!bestRedirectFallback) {
        bestRedirectFallback = result;
      } else {
        const currProp = Number.isFinite(result._rank_prop_fraction) ? result._rank_prop_fraction : Infinity;
        const bestProp = Number.isFinite(bestRedirectFallback._rank_prop_fraction) ? bestRedirectFallback._rank_prop_fraction : Infinity;
        const currDv = Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity;
        const bestDv = Number.isFinite(bestRedirectFallback._rank_dv_total) ? bestRedirectFallback._rank_dv_total : Infinity;
        if (currProp < bestProp || (currProp === bestProp && currDv < bestDv)) bestRedirectFallback = result;
      }

      if (!redirectFeasible) continue;
      if (!bestRedirectResult) {
        bestRedirectResult = result;
        continue;
      }
      const betterScore = result.feasibility_score > bestRedirectResult.feasibility_score;
      const tieBreakDv = result.feasibility_score === bestRedirectResult.feasibility_score &&
        (Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity) <
        (Number.isFinite(bestRedirectResult._rank_dv_total) ? bestRedirectResult._rank_dv_total : Infinity);
      if (betterScore || tieBreakDv) bestRedirectResult = result;
    }

    const chosen = bestRedirectResult || bestRedirectFallback;
    if (!chosen) {
      return {
        type: 'redirect_result',
        schema_version: 1,
        reqId,
        feasible: false,
        error: bestError,
      };
    }
    if (!chosen.feasible && !chosen.error) {
      if (chosen.flags?.launch_capacity_ok === false) {
        chosen.error = `${launchProfile.name} cannot launch the ${spacecraftProfile.name} redirect stack within capacity.`;
      } else if (Number.isFinite(chosen.flags?.prop_fraction_pct)) {
        chosen.error = `Propellant requirement exceeds ${chosen.flags.prop_fraction_pct}% of asteroid mass for ${propulsionModule.name}`;
      }
    }
    return chosen;
  }

  let bestResult: any = null;
  let bestFallback: any = null;
  for (const candidate of candidatePool) {
    const result = evaluateRedirectCandidate(candidate);
    if (!result) continue;
    if (!bestFallback) bestFallback = result;
    else {
      const currProp = Number.isFinite(result._rank_prop_fraction) ? result._rank_prop_fraction : Infinity;
      const bestProp = Number.isFinite(bestFallback._rank_prop_fraction) ? bestFallback._rank_prop_fraction : Infinity;
      const currDv = Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity;
      const bestDv = Number.isFinite(bestFallback._rank_dv_total) ? bestFallback._rank_dv_total : Infinity;
      if (currProp < bestProp || (currProp === bestProp && currDv < bestDv)) bestFallback = result;
    }
    if (!result.feasible) continue;
    if (!bestResult) {
      bestResult = result;
      continue;
    }
    const betterScore = result.feasibility_score > bestResult.feasibility_score;
    const tieBreakDv = result.feasibility_score === bestResult.feasibility_score &&
      (Number.isFinite(result._rank_dv_total) ? result._rank_dv_total : Infinity) <
      (Number.isFinite(bestResult._rank_dv_total) ? bestResult._rank_dv_total : Infinity);
    if (betterScore || tieBreakDv) bestResult = result;
  }

  const finalResult = bestResult || bestFallback;
  if (!finalResult) {
    (self as any).postMessage({ type: 'redirect_result', schema_version: 1, reqId, feasible: false, error: 'No redirect solution could be evaluated for this target and propulsion mode.' });
    return;
  }
  if (!finalResult.feasible && !finalResult.error) {
    if (finalResult.flags?.launch_capacity_ok === false) {
      finalResult.error = `${launchProfile.name} cannot launch the ${spacecraftProfile.name} redirect stack within capacity.`;
    } else if (Number.isFinite(finalResult.flags?.prop_fraction_pct)) {
      finalResult.error = `Propellant requirement exceeds ${finalResult.flags.prop_fraction_pct}% of asteroid mass for ${propulsionModule.name}`;
    }
  }
  delete finalResult._rank_dv_total;
  delete finalResult._rank_prop_fraction;
  (self as any).postMessage(finalResult);
}
