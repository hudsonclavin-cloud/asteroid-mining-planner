/**
 * Redirect mission optimizer — worker dispatch, result rendering, visualization helpers,
 * and scoring breakdown functions for the capture/redirect mission type.
 * Source: index.html lines 4539–4688 (runRedirectOptimizer, setMissionType, helpers),
 * lines 4690–4946 (onRedirectResult, redirect visualization), and lines 4948–5119
 * (score formatting, summarizeTrajectoryOperationalMetrics).
 *
 * Covers:
 *   - REDIRECT_PROPULSION table and helper constants
 *   - setMissionType(), getRedirectPropulsionModule()
 *   - fmtRedirectValue(), fmtRedirectSpeed(), fmtRedirectPercent()
 *   - runRedirectOptimizer() — validates inputs, dispatches plan_redirect_mission to worker
 *   - onRedirectResult()    — populates the rr-* panel, triggers 3-D visualization
 *   - clearRedirectVisualization(), drawRedirectTrajectory(), drawRedirectInterceptTrajectory()
 *   - syncActiveRedirectVisuals(), drawLunarOrbitRing(), drawCaptureRingAt(), drawRedirectCaptureMarker()
 *   - Score formatting: formatSignedScoreTerm, formatScoreBucket, scoreTermClass, scoreBucketClass
 *   - renderScoreBreakdownHtml, buildExtractScoreBreakdownHtml
 *   - summarizeRedirectScore, buildRedirectScoreBreakdownHtml
 *   - summarizeTrajectoryOperationalMetrics
 */

// ─── Redirect Propulsion Table ────────────────────────────────────────────────

export const REDIRECT_PROPULSION: Record<string, { name: string; isp_s: number }> = {
  chemical_300: { name: 'Chemical',        isp_s: 300  },
  ion_3000:     { name: 'Ion Drive',       isp_s: 3000 },
  nuclear_900:  { name: 'Nuclear Thermal', isp_s: 900  },
  sep_2500:     { name: 'Solar Electric',  isp_s: 2500 },
};

// ─── Mission Type Toggle ──────────────────────────────────────────────────────

export function setMissionType(type: string, options: any = {}) {
  const { resetVisuals = true } = options;
  // @ts-ignore — runtime global during transition
  _activeMissionType = type;
  (document.getElementById('btn-type-extract') as HTMLElement).dataset.on  = (type === 'extract').toString();
  (document.getElementById('btn-type-redirect') as HTMLElement).dataset.on = (type === 'redirect').toString();
  (document.getElementById('mp-redirect-config') as HTMLElement).style.display = type === 'redirect' ? 'block' : 'none';
  if (type === 'redirect') {
    // @ts-ignore — runtime global during transition
    optimalTrajectory = null;
    // @ts-ignore — runtime global during transition
    selectedTrajIdx = -1;
    // @ts-ignore — runtime global during transition
    missionReturnTargetPos = null;
    // @ts-ignore — runtime global during transition
    _activeExtractRequestId = 0;
    // @ts-ignore — runtime global during transition
    _activeReturnQueryId = 0;
  }
  // Hide all result panels on mode switch
  ['mp-results','mp-profile','mp-burns','mp-actions','mp-redirect-results'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // @ts-ignore — runtime global during transition
  clearPlannerError();
  if (resetVisuals) {
    // @ts-ignore — runtime global during transition
    clearTrajectoryLine();
    clearRedirectVisualization();
  }
}

export function getRedirectPropulsionModule() {
  const key = (document.getElementById('mp-redirect-propulsion') as HTMLSelectElement).value;
  return REDIRECT_PROPULSION[key] || REDIRECT_PROPULSION.chemical_300;
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────

export function fmtRedirectValue(v: number): string {
  if (!(Number.isFinite(v) && v > 0)) return 'unknown';
  if (v >= 1e12) return `$${(v/1e12).toFixed(1)}T`;
  if (v >= 1e9) return `$${(v/1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(0)}M`;
  // @ts-ignore — runtime global during transition
  return fmtUSD(v);
}

export function fmtRedirectSpeed(v: number): string {
  return Number.isFinite(v) && v >= 0 ? `${v.toFixed(2)} km/s` : 'unknown';
}

export function fmtRedirectPercent(v: number): string {
  return Number.isFinite(v) ? `${Math.round(v)}%` : 'unknown';
}

// ─── Redirect Optimizer ───────────────────────────────────────────────────────

export async function runRedirectOptimizer() {
  // @ts-ignore — runtime global during transition
  clearPlannerError();
  // @ts-ignore — runtime global during transition
  const ast = getSelectedAsteroid();
  if (!ast) {
    // @ts-ignore — runtime global during transition
    showPlannerError('No asteroid selected — click an asteroid first.');
    return;
  }
  if (!isFinite(ast.a) || !isFinite(ast.e) || !isFinite(ast.i)) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Asteroid is missing orbital elements (a/e/i). Cannot plan redirect mission.');
    return;
  }
  // Founding Doc §6.2: redirect planning is blocked for any asteroid with a non-zero Sentry impact probability
  if (ast.Sentry && Number.isFinite(ast.Sentry.impact_probability) && ast.Sentry.impact_probability > 0) {
    // @ts-ignore — runtime global during transition
    showPlannerError('RESTRICTED: This asteroid has a non-zero Sentry impact probability. Redirect planning is blocked for potentially hazardous objects.');
    return;
  }
  if (!isFinite(ast.epoch)) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Asteroid epoch is missing. Cannot propagate orbit.');
    return;
  }

  const yearStart = parseInt((document.getElementById('mp-year-start') as HTMLInputElement).value) || 2026;
  const yearEnd   = parseInt((document.getElementById('mp-year-end') as HTMLInputElement).value)   || 2035;
  const currentYear = new Date().getFullYear();
  if (yearStart < currentYear || yearEnd < currentYear) {
    // @ts-ignore — runtime global during transition
    showPlannerError(`Launch window must be ${currentYear} or later. Past years are blocked.`);
    return;
  }
  if (yearEnd < yearStart) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Launch window end year must be greater than or equal to the start year.');
    return;
  }
  const jd_start  = (yearStart - 2000) * 365.25 + 2451545.0;
  const jd_end    = (yearEnd   - 2000) * 365.25 + 2451545.0;

  const propulsionModule = getRedirectPropulsionModule();
  const miningFraction   = (parseInt((document.getElementById('mp-mining-split') as HTMLInputElement).value) || 50) / 100;
  // @ts-ignore — runtime global during transition
  const captureTarget = REDIRECT_CAPTURE_TARGETS[(document.getElementById('mp-redirect-target') as HTMLSelectElement).value] || REDIRECT_CAPTURE_TARGETS.lunar_orbit;
  // @ts-ignore — runtime global during transition
  const deliveryDestination = DELIVERY_DESTINATIONS[(document.getElementById('mp-destination') as HTMLSelectElement).value] || DELIVERY_DESTINATIONS.leo;
  const spacecraftKey = (document.querySelector('input[name="mp-craft"]:checked') as HTMLInputElement)?.value || 'medium';
  // @ts-ignore — runtime global during transition
  const spacecraft = SPACECRAFT[spacecraftKey] || SPACECRAFT.medium;
  const launchVehicleKey = (document.getElementById('mp-launch-vehicle') as HTMLSelectElement).value;
  // @ts-ignore — runtime global during transition
  const launchVehicle = LAUNCH_VEHICLES[launchVehicleKey] || LAUNCH_VEHICLES.f9;
  // @ts-ignore — runtime global during transition
  missionConfig.destination = deliveryDestination.key;
  // @ts-ignore — runtime global during transition
  missionConfig.spacecraft = spacecraftKey;
  // @ts-ignore — runtime global during transition
  missionConfig.launchVehicle = launchVehicleKey;
  // @ts-ignore — runtime global during transition
  missionConfig.launchYearStart = yearStart;
  // @ts-ignore — runtime global during transition
  missionConfig.launchYearEnd = yearEnd;
  // @ts-ignore — runtime global during transition
  missionConfig.redirectPropulsion = (document.getElementById('mp-redirect-propulsion') as HTMLSelectElement).value;
  // @ts-ignore — runtime global during transition
  missionConfig.redirectTarget = captureTarget.key;

  (document.getElementById('mp-computing') as HTMLElement).style.display = 'block';
  (document.getElementById('mp-progress-bar') as HTMLElement).style.width = '5%';
  (document.getElementById('mp-progress-label') as HTMLElement).textContent = 'Scanning redirect intercepts...';
  ['mp-results','mp-profile','mp-burns','mp-actions','mp-redirect-results'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // @ts-ignore — runtime global during transition
  stopMissionAnimation();
  // @ts-ignore — runtime global during transition
  hideMissionTimeline();
  // @ts-ignore — runtime global during transition
  clearMissionPathVisuals();
  // @ts-ignore — runtime global during transition
  clearBurnVectors();

  // @ts-ignore — runtime global during transition
  if (_plannerTimeoutId) clearTimeout(_plannerTimeoutId);
  // @ts-ignore — runtime global during transition
  const reqId = ++_redirectRequestSeq;
  // @ts-ignore — runtime global during transition
  _activeRedirectRequestId = reqId;
  // @ts-ignore — runtime global during transition
  _plannerTimeoutId = setTimeout(() => {
    // @ts-ignore — runtime global during transition
    if (_activeRedirectRequestId !== reqId) return;
    // @ts-ignore — runtime global during transition
    _activeRedirectRequestId = 0;
    // @ts-ignore — runtime global during transition
    _plannerTimeoutId = null;
    // @ts-ignore — runtime global during transition
    showPlannerError('Worker timeout (>30 s). Try a shorter launch window or a closer target.');
  }, 30000);

  try {
    // @ts-ignore — runtime global during transition
    worker.postMessage({
      cmd: 'plan_redirect_mission',
      reqId,
      ast,
      jd_start,
      jd_end,
      propulsionModule,
      miningFraction,
      captureTarget,
      deliveryDestination,
      spacecraft,
      launchVehicle,
    });
  } catch(err) {
    // @ts-ignore — runtime global during transition
    if (_activeRedirectRequestId === reqId) _activeRedirectRequestId = 0;
    // @ts-ignore — runtime global during transition
    showPlannerError(err);
  }
}

// ─── Redirect Result Rendering ────────────────────────────────────────────────

export function onRedirectResult(data: any) {
  // @ts-ignore — runtime global during transition
  if (Number.isFinite(data.reqId) && data.reqId !== _activeRedirectRequestId) return;
  // @ts-ignore — runtime global during transition
  _activeRedirectRequestId = 0;
  // @ts-ignore — runtime global during transition
  if (_plannerTimeoutId) { clearTimeout(_plannerTimeoutId); _plannerTimeoutId = null; }
  // @ts-ignore — runtime global during transition
  clearPlannerError();
  (document.getElementById('mp-computing') as HTMLElement).style.display = 'none';

  if (data.schema_version !== 1) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Redirect result schema mismatch. Refresh required before planning redirect missions.');
    return;
  }

  const panel = document.getElementById('mp-redirect-results') as HTMLElement;
  panel.style.display = 'block';
  const scoreBreakdownEl = document.getElementById('rr-score-breakdown');

  const score = Number.isFinite(data.feasibility_score) ? data.feasibility_score : 0;
  const barColor = !data.feasible || data.error
    ? '#f87171'
    : score >= 60 ? '#4af7c4' : score >= 30 ? '#fb923c' : '#f87171';
  const scoreBar = document.getElementById('rr-score-bar') as HTMLElement;
  scoreBar.style.width = Math.max(0, Math.min(100, score)) + '%';
  scoreBar.style.background = barColor;
  (document.getElementById('rr-score-val') as HTMLElement).style.color = barColor;
  (document.getElementById('rr-score-val') as HTMLElement).textContent = score + '/100';
  if (scoreBreakdownEl) scoreBreakdownEl.innerHTML = buildRedirectScoreBreakdownHtml(data);

  if (!data.feasible || data.error) {
    (document.getElementById('rr-infeasible-msg') as HTMLElement).style.display = 'block';
    const propLoad = Number.isFinite(data.flags?.prop_fraction_pct) ? `${data.flags.prop_fraction_pct}% of asteroid mass` : 'an unsupported propellant load';
    const propulsion = data.redirect?.propulsion || 'this propulsion mode';
    const detail = data.error || `${propulsion} requires ${propLoad} for the best candidate found.`;
    (document.getElementById('rr-infeasible-msg') as HTMLElement).innerHTML =
      `✗ INFEASIBLE — ${detail}<br><span style="color:#9ca3af">Try a smaller/closer target, a different launch window, or a higher-Isp propulsion mode.</span>`;
    return;
  }
  (document.getElementById('rr-infeasible-msg') as HTMLElement).style.display = 'none';

  // Intercept trajectory
  const ic = data.intercept;
  if (!ic) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Redirect result missing intercept data (internal error).');
    return;
  }
  (document.getElementById('rr-intercept-text') as HTMLElement).textContent =
    // @ts-ignore — runtime global during transition
    `Depart    ${jdToDate(ic.jd_dep)}\n` +
    // @ts-ignore — runtime global during transition
    `Arrive    ${jdToDate(ic.jd_arr)}\n` +
    `TOF       ${ic.tof} days\n` +
    `ΔV dep    ${ic.dv_dep.toFixed(2)} km/s (est.)`;

  // Asteroid mass + propellant
  const ast_d = data.asteroid;
  const rd    = data.redirect;
  const flags = data.flags;
  if (!ast_d || !rd || !flags) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Redirect result is incomplete (internal error).');
    return;
  }
  const logistics = data.logistics || {};
  const d_km  = (ast_d.d_m / 1000).toFixed(2);
  const mass_str = ast_d.mass_kg >= 1e12
    ? (ast_d.mass_kg / 1e12).toFixed(2) + ' Tt'
    : ast_d.mass_kg >= 1e9
    ? (ast_d.mass_kg / 1e9).toFixed(2) + ' Gt'
    : (ast_d.mass_kg / 1e6).toFixed(2) + ' Mt';
  (document.getElementById('rr-asteroid-text') as HTMLElement).textContent =
    `Diameter  ${d_km} km\n` +
    `Mass      ${mass_str}\n` +
    `Spec type ${ast_d.spec_type}\n` +
    `Redirect ΔV ${fmtRedirectSpeed(rd.dv_redirect)}\n` +
    `Propulsion  ${rd.propulsion} (Isp ${rd.isp_s}s)\n` +
    `Prop load   ${fmtRedirectPercent(flags.prop_fraction_pct)} of redirected stack mass\n` +
    `Spacecraft  ${logistics.spacecraft_name || 'unknown'}\n` +
    `Launch stack ${Number.isFinite(logistics.tug_launch_mass_kg) ? Math.round(logistics.tug_launch_mass_kg).toLocaleString() + ' kg' : 'unknown'} via ${logistics.launch_vehicle_name || 'unknown'}`;
  (document.getElementById('rr-prop-warn') as HTMLElement).style.display = flags.high_prop_load ? 'block' : 'none';

  // Redirect capture / delivery
  const cap = data.capture;
  if (!cap) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Redirect capture data missing (internal error).');
    return;
  }
  const captureHeader = document.getElementById('rr-capture-header');
  if (captureHeader) captureHeader.textContent = `${(cap.label || 'Destination').toUpperCase()} CAPTURE (approx)`;
  (document.getElementById('rr-capture-text') as HTMLElement).textContent =
    // @ts-ignore — runtime global during transition
    `Capture arr ${jdToDate(rd.jd_capture_arr)}\n` +
    `Transit    ${Math.round(rd.tof_redirect)} days\n` +
    `Arrival v∞ ${fmtRedirectSpeed(cap.v_inf_capture_arrival)}\n` +
    `Capture ΔV ${cap.capture_modeled ? fmtRedirectSpeed(cap.dv_lunar_capture) + ' (approx)' : 'unknown'}\n` +
    `Delivery ΔV ${fmtRedirectSpeed(cap.dv_delivery)}\n` +
    `Target orbit  ${Number.isFinite(cap.r_cap_km) ? Math.round(cap.r_cap_km).toLocaleString() + ' km radius' : 'unknown'}\n` +
    `Delivery node ${cap.delivery_label || 'unknown'}\n` +
    `Model basis  ${cap.capture_basis || 'unknown'}`;

  // ISRU yield
  const isru = data.isru;
  if (!isru) {
    // @ts-ignore — runtime global during transition
    showPlannerError('Redirect ISRU data missing (internal error).');
    return;
  }
  const fmtMass = (m: number) => m >= 1e9 ? (m/1e9).toFixed(2)+' Mt' : m >= 1e6 ? (m/1e6).toFixed(2)+' kt' : Math.round(m)+' kg';
  (document.getElementById('rr-isru-text') as HTMLElement).textContent =
    `Mineable   ${fmtMass(isru.mineable_kg)} (5% extraction)\n` +
    `  Water    ${fmtMass(isru.water_kg)}\n` +
    `  Metals   ${fmtMass(isru.metal_kg)}\n` +
    `Extractable ${fmtRedirectValue(isru.extractable_value_usd)}\n` +
    `Catalog body ${fmtRedirectValue(isru.whole_body_price_usd)}`;

  // 3D visualization
  // @ts-ignore — runtime global during transition
  clearMissionPathVisuals();
  // @ts-ignore — runtime global during transition
  clearBurnVectors();
  // @ts-ignore — runtime global during transition
  stopMissionAnimation();
  // @ts-ignore — runtime global during transition
  hideMissionTimeline();
  clearRedirectVisualization();
  // @ts-ignore — runtime global during transition
  optimalTrajectory = null;
  // @ts-ignore — runtime global during transition
  selectedTrajIdx = -1;
  // @ts-ignore — runtime global during transition
  missionPlanningActive = true;
  // @ts-ignore — runtime global during transition
  activeRedirectVisual = { asteroidId: selectedId, intercept: ic, redirect: rd, capture: cap };
  if (!drawRedirectInterceptTrajectory(ic)) {
    // @ts-ignore — runtime global during transition
    setStatus('Redirect intercept path unavailable for current solution window', true);
  }
  // @ts-ignore — runtime global during transition
  if (!drawRedirectTrajectory(getSelectedAsteroid(), ic, rd)) {
    // @ts-ignore — runtime global during transition
    setStatus('Redirect path unavailable for current solution window', true);
  }
  drawRedirectCaptureMarker(cap);
}

// ─── Redirect Visualization Helpers ──────────────────────────────────────────

export function clearRedirectVisualization(options: any = {}) {
  const { preserveState = false } = options;
  // @ts-ignore — runtime global during transition
  if (_redirectArcLine) { disposeObject3D(_redirectArcLine); _redirectArcLine = null; }
  // @ts-ignore — runtime global during transition
  if (_lunarOrbitRing)  { disposeObject3D(_lunarOrbitRing);  _lunarOrbitRing = null; }
  // @ts-ignore — runtime global during transition
  _cargoPodArcs.forEach(disposeObject3D);
  // @ts-ignore — runtime global during transition
  _cargoPodArcs = [];
  // @ts-ignore — runtime global during transition
  redirectOriginalOrbitLine.visible = false;
  // @ts-ignore — runtime global during transition
  redirectAdjustedOrbitLine.visible = false;
  // @ts-ignore — runtime global during transition
  if (!preserveState) activeRedirectVisual = null;
  // @ts-ignore — runtime global during transition
  _arcAnchors.redirectIntercept = null;
  // @ts-ignore — runtime global during transition
  _arcAnchors.redirectArc       = null;
  // @ts-ignore — runtime global during transition
  _arcAnchors.lunarOrbit        = null;
}

export function drawRedirectTrajectory(ast: any, intercept: any, redirect: any): boolean {
  // @ts-ignore — runtime global during transition
  orbitLine.visible = false;
  // @ts-ignore — runtime global during transition
  if (ast) drawOrbitFromElements(redirectOriginalOrbitLine, asteroidToOrbitElements(ast));
  if (redirect.orbit_el) {
    // @ts-ignore — runtime global during transition
    drawOrbitFromElements(redirectAdjustedOrbitLine, redirect.orbit_el);
    // @ts-ignore — runtime global during transition
    setGlowLineColor(redirectAdjustedOrbitLine, ORBIT_NEON.redirect, 0.22, 0.05);
  } else {
    // @ts-ignore — runtime global during transition
    redirectAdjustedOrbitLine.visible = false;
  }

  const segStart = Number.isFinite(redirect.segment_jd_start) ? redirect.segment_jd_start : intercept.jd_arr;
  const segEnd = Number.isFinite(redirect.segment_jd_end) ? redirect.segment_jd_end : redirect.jd_capture_arr;
  const pts = redirect.orbit_el && Number.isFinite(segStart) && Number.isFinite(segEnd)
    // @ts-ignore — runtime global during transition
    ? buildOrbitSegmentPoints(redirect.orbit_el, segStart, segEnd, 112)
    : [];
  // @ts-ignore — runtime global during transition
  if (pts.length < 2 || !validateArcPoints(pts, 'redirect')) return false;
  // @ts-ignore — runtime global during transition
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  // @ts-ignore — runtime global during transition
  _redirectArcLine = makeGlowLine(geo, ORBIT_NEON.redirect, 0.95, { haloOpacity: 0.22 });
  // @ts-ignore — runtime global during transition
  scene.add(_redirectArcLine);
  // @ts-ignore — runtime global during transition
  showGlowLine(_redirectArcLine);
  // Label anchor — dv_redirect comes from the redirect object argument
  {
    const dvText = redirect && Number.isFinite(redirect.dv_redirect)
      ? `REDIRECT  ΔV: ${redirect.dv_redirect.toFixed(3)} km/s`
      : 'REDIRECT ARC';
    // @ts-ignore — runtime global during transition
    _setArcAnchor('redirectArc', _redirectArcLine, dvText);
  }

  // Arrow at asteroid showing redirect direction toward target capture arrival
  if (pts.length >= 2) {
    // @ts-ignore — runtime global during transition
    const dir = new THREE.Vector3().subVectors(pts[1], pts[0]).normalize();
    // @ts-ignore — runtime global during transition
    const arr = new THREE.ArrowHelper(dir, pts[0].clone(), 0.12, ORBIT_NEON.redirect, 0.05, 0.025);
    // @ts-ignore — runtime global during transition
    scene.add(arr);
    // @ts-ignore — runtime global during transition
    _cargoPodArcs.push(arr);
  }
  return true;
}

export function drawRedirectInterceptTrajectory(intercept: any): boolean {
  if (!intercept) return false;
  const segStart = Number.isFinite(intercept.segment_jd_start) ? intercept.segment_jd_start : intercept.jd_dep;
  const segEnd = Number.isFinite(intercept.segment_jd_end) ? intercept.segment_jd_end : intercept.jd_arr;
  const pts = intercept.orbit_el && Number.isFinite(segStart) && Number.isFinite(segEnd)
    // @ts-ignore — runtime global during transition
    ? buildOrbitSegmentPoints(intercept.orbit_el, segStart, segEnd, 96)
    : [];
  // @ts-ignore — runtime global during transition
  if (pts.length >= 2 && validateArcPoints(pts, 'redirect-intercept')) {
    // @ts-ignore — runtime global during transition
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    // @ts-ignore — runtime global during transition
    trajectoryLine = makeDashedGlowLine(geo, ORBIT_NEON.transfer, 0.92, 0.03, 0.02, { haloOpacity: 0.2 });
    // @ts-ignore — runtime global during transition
    scene.add(trajectoryLine);
    // @ts-ignore — runtime global during transition
    showGlowLine(trajectoryLine);
    // @ts-ignore — runtime global during transition
    _setArcAnchor('redirectIntercept', trajectoryLine, 'REDIRECT INTERCEPT');
    // @ts-ignore — runtime global during transition
    const dir = new THREE.Vector3().subVectors(pts[1], pts[0]).normalize();
    // @ts-ignore — runtime global during transition
    const arr1 = new THREE.ArrowHelper(dir, pts[0].clone(), 0.12, ORBIT_NEON.transfer, 0.05, 0.025);
    // @ts-ignore — runtime global during transition
    scene.add(arr1);
    // @ts-ignore — runtime global during transition
    trajectoryArrows.push(arr1);
    // @ts-ignore — runtime global during transition
    const arr2 = new THREE.ArrowHelper(dir.clone().negate(), pts[pts.length - 1].clone(), 0.12, 0xffcf66, 0.05, 0.025);
    // @ts-ignore — runtime global during transition
    scene.add(arr2);
    // @ts-ignore — runtime global during transition
    trajectoryArrows.push(arr2);
    return true;
  }
  return false;
}

export function syncActiveRedirectVisuals() {
  // @ts-ignore — runtime global during transition
  if (!activeRedirectVisual) return;
  // @ts-ignore — runtime global during transition
  const ast = asteroidData[activeRedirectVisual.asteroidId] || getSelectedAsteroid();
  if (!ast) return;
  // @ts-ignore — runtime global during transition
  clearMissionPathVisuals();
  clearRedirectVisualization({ preserveState: true });
  // @ts-ignore — runtime global during transition
  if (!drawRedirectInterceptTrajectory(activeRedirectVisual.intercept)) {
    // @ts-ignore — runtime global during transition
    setStatus('Redirect intercept path unavailable for current solution window', true);
  }
  // @ts-ignore — runtime global during transition
  if (!drawRedirectTrajectory(ast, activeRedirectVisual.intercept, activeRedirectVisual.redirect)) {
    // @ts-ignore — runtime global during transition
    setStatus('Redirect path unavailable for current solution window', true);
  }
  // @ts-ignore — runtime global during transition
  drawRedirectCaptureMarker(activeRedirectVisual.capture);
}

export function drawLunarOrbitRing() {
  // @ts-ignore — runtime global during transition
  if (!moonMesh) return;
  const pts: any[] = [];
  // @ts-ignore — runtime global during transition
  const capture = activeRedirectVisual?.capture;
  // @ts-ignore — runtime global during transition
  const center = getCaptureTargetPosition(capture);
  if (!center) return;
  // @ts-ignore — runtime global during transition
  const r = Number.isFinite(capture?.r_cap_km) ? (capture.r_cap_km * 1000) / AU_m : (6737 * 1000) / AU_m;
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    // @ts-ignore — runtime global during transition
    pts.push(new THREE.Vector3(
      center.x + r * Math.cos(theta),
      center.y,
      center.z + r * Math.sin(theta),
    ));
  }
  // @ts-ignore — runtime global during transition
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  // @ts-ignore — runtime global during transition
  _lunarOrbitRing = makeGlowLine(geo, ORBIT_NEON.redirect, 0.68, { haloOpacity: 0.16 });
  // @ts-ignore — runtime global during transition
  scene.add(_lunarOrbitRing);
  // @ts-ignore — runtime global during transition
  showGlowLine(_lunarOrbitRing);
  // Label anchor: top of ring (quarter-point in the pts array ≈ 90° position)
  // @ts-ignore — runtime global during transition
  _setArcAnchor('lunarOrbit', _lunarOrbitRing, 'NRHO TARGET ORBIT', 0.25);
}

export function drawCaptureRingAt(center: any, radiusKm: number, color?: number) {
  // @ts-ignore — runtime global during transition
  if (!center || !Number.isFinite(radiusKm) || radiusKm <= 0) return;
  // @ts-ignore — runtime global during transition
  const _color = color ?? ORBIT_NEON.redirect;
  // @ts-ignore — runtime global during transition
  const radiusAU = (radiusKm * 1000) / AU_m;
  const pts: any[] = [];
  for (let i = 0; i <= 96; i++) {
    const theta = (i / 96) * Math.PI * 2;
    // @ts-ignore — runtime global during transition
    pts.push(new THREE.Vector3(
      center.x + radiusAU * Math.cos(theta),
      center.y,
      center.z + radiusAU * Math.sin(theta),
    ));
  }
  // @ts-ignore — runtime global during transition
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  // @ts-ignore — runtime global during transition
  _lunarOrbitRing = makeGlowLine(geo, _color, 0.52, { haloOpacity: 0.12 });
  // @ts-ignore — runtime global during transition
  scene.add(_lunarOrbitRing);
  // @ts-ignore — runtime global during transition
  showGlowLine(_lunarOrbitRing);
}

export function drawRedirectCaptureMarker(capture: any) {
  if (!capture) return;
  if (capture.target_body === 'moon' || capture.target_key === 'lunar_orbit') {
    drawLunarOrbitRing();
    return;
  }
  // @ts-ignore — runtime global during transition
  const center = getCaptureTargetPosition(capture);
  // @ts-ignore — runtime global during transition
  if (center && Number.isFinite(capture.r_cap_km)) drawCaptureRingAt(center, capture.r_cap_km, ORBIT_NEON.redirect);
}

// ─── Score Formatting ─────────────────────────────────────────────────────────

export function formatSignedScoreTerm(value: number): string {
  if (!Number.isFinite(value)) return 'unknown';
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}`;
}

export function formatScoreBucket(value: number, maxValue: number): string {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) return 'unknown';
  return `${Math.round(value)}/${Math.round(maxValue)}`;
}

export function scoreTermClass(value: number): string {
  if (!Number.isFinite(value)) return 'score-neutral';
  if (value > 0.1) return 'score-pos';
  if (value < -20) return 'score-bad';
  if (value < -0.1) return 'score-neg';
  return 'score-neutral';
}

export function scoreBucketClass(value: number, maxValue: number): string {
  if (!Number.isFinite(value) || !Number.isFinite(maxValue) || maxValue <= 0) return 'score-neutral';
  const ratio = value / maxValue;
  if (ratio >= 0.66) return 'score-pos';
  if (ratio >= 0.33) return 'score-neg';
  return 'score-bad';
}

export function renderScoreBreakdownHtml({ title, formula, chips, note }: { title: string; formula?: string; chips?: any[]; note?: string }): string {
  const chipHtml = (chips || []).map((chip: any) => `
    <div class="score-chip">
      <span class="score-chip-label">${chip.label}</span>
      <span class="score-chip-value ${chip.valueClass || 'score-neutral'}">${chip.value}</span>
      ${chip.note ? `<span class="score-chip-note">${chip.note}</span>` : ''}
    </div>`).join('');
  return `<div class="score-explain">
    <div class="score-explain-header">
      <span class="score-explain-title">${title}</span>
      ${formula ? `<span class="score-explain-formula">${formula}</span>` : ''}
    </div>
    <div class="score-chip-row">${chipHtml}</div>
    ${note ? `<div class="score-mini-note">${note}</div>` : ''}
  </div>`;
}

export function buildExtractScoreBreakdownHtml(traj: any, ops: any): string {
  if (!traj || !ops) return '';
  const chips = [
    {
      label: 'Base',
      value: '100',
      valueClass: 'score-neutral',
      note: 'starting ceiling',
    },
    {
      label: 'Delta-V',
      value: formatSignedScoreTerm(ops.dvPenalty),
      valueClass: scoreTermClass(ops.dvPenalty),
      note: `${traj.dv_total.toFixed(2)} km/s total`,
    },
    {
      label: 'Launcher',
      value: formatSignedScoreTerm(ops.launchPenalty),
      valueClass: scoreTermClass(ops.launchPenalty),
      note: ops.fitsLaunchVehicle ? 'fits selected vehicle' : 'wet mass exceeds launcher',
    },
    {
      label: 'Est. ROI',
      value: formatSignedScoreTerm(ops.roiTerm),
      valueClass: scoreTermClass(ops.roiTerm),
      note: Number.isFinite(ops.roi) ? `${ops.roi.toFixed(2)}x realized NPV / total cost` : 'unknown stays neutral',
    },
  ];
  const note = Number.isFinite(ops.roi)
    ? 'Perfect scores need low total ΔV, launcher fit, and strong realized NPV against mission cost.'
    : 'ROI is neutral here because the realized-return side is unknown or not finite.';
  return renderScoreBreakdownHtml({
    title: 'Score Breakdown',
    formula: '100 - 3×ΔV - launcher penalty + screening ROI term',
    chips,
    note,
  });
}

export function summarizeRedirectScore(data: any) {
  if (!data) return null;
  const dvTotal = Number.isFinite(data._rank_dv_total) ? data._rank_dv_total : null;
  const propFraction = Number.isFinite(data._rank_prop_fraction) ? data._rank_prop_fraction : null;
  const extractableValueUsd = Number.isFinite(data.isru?.extractable_value_usd) ? data.isru.extractable_value_usd : null;
  const fitsLaunchVehicle = data.logistics?.fits_launch_vehicle === true;
  const dvScore = Number.isFinite(dvTotal) ? Math.max(0, 1 - dvTotal! / 18) * 45 : null;
  const propScore = Number.isFinite(propFraction) ? Math.max(0, 1 - propFraction!) * 30 : null;
  const valueScore = Number.isFinite(extractableValueUsd)
    ? Math.min(20, Math.log10(Math.max(1, extractableValueUsd!)) / 12 * 20)
    : null;
  const launchScore = data.logistics?.fits_launch_vehicle === false ? -20 : (fitsLaunchVehicle ? 5 : null);
  return { dvTotal, propFraction, extractableValueUsd, fitsLaunchVehicle, dvScore, propScore, valueScore, launchScore };
}

export function buildRedirectScoreBreakdownHtml(data: any): string {
  const summary = summarizeRedirectScore(data);
  if (!summary) return '';
  const launchFitKnown = data.logistics?.fits_launch_vehicle === true || data.logistics?.fits_launch_vehicle === false;
  const launchNote = launchFitKnown
    ? (summary.fitsLaunchVehicle ? 'vehicle fit confirmed' : 'vehicle fit failed')
    : 'vehicle fit unknown';
  const chips = [
    {
      label: 'Delta-V',
      value: formatScoreBucket(summary.dvScore, 45),
      valueClass: scoreBucketClass(summary.dvScore, 45),
      note: Number.isFinite(summary.dvTotal) ? `${summary.dvTotal.toFixed(2)} km/s total redirect budget` : 'unknown total redirect ΔV',
    },
    {
      label: 'Propellant',
      value: formatScoreBucket(summary.propScore, 30),
      valueClass: scoreBucketClass(summary.propScore, 30),
      note: Number.isFinite(summary.propFraction) ? `${Math.round(summary.propFraction * 100)}% asteroid mass` : 'unknown propellant fraction',
    },
    {
      label: 'Value',
      value: formatScoreBucket(summary.valueScore, 20),
      valueClass: scoreBucketClass(summary.valueScore, 20),
      note: Number.isFinite(summary.extractableValueUsd)
        // @ts-ignore — runtime global during transition
        ? fmtUSD(summary.extractableValueUsd)
        : 'unknown extractable value',
    },
    {
      label: 'Launcher',
      value: formatSignedScoreTerm(summary.launchScore),
      valueClass: scoreTermClass(summary.launchScore),
      note: launchNote,
    },
  ];
  const note = data.feasible
    ? 'Redirect scores are weighted from ΔV, propellant fraction, adjusted extractable value, and launcher fit.'
    : 'This is still the best screened candidate found; hard feasibility gates prevented it from becoming a valid redirect mission.';
  return renderScoreBreakdownHtml({
    title: 'Score Breakdown',
    formula: 'ΔV /45 + propellant /30 + value /20 + launcher',
    chips,
    note,
  });
}

// ─── Trajectory Operational Metrics ──────────────────────────────────────────

/**
 * Derives the key operational and economics metrics for a single extract trajectory,
 * used both for trajectory card scoring and for mission profile cost/ROI display.
 */
export function summarizeTrajectoryOperationalMetrics(traj: any) {
  // @ts-ignore — runtime global during transition
  const ast = asteroidData[selectedId];
  if (!ast || !traj) return null;
  // @ts-ignore — runtime global during transition
  const sc = SPACECRAFT[missionConfig.spacecraft] || SPACECRAFT.medium;
  // @ts-ignore — runtime global during transition
  const lv = LAUNCH_VEHICLES[missionConfig.launchVehicle] || LAUNCH_VEHICLES.f9;
  const g0 = 0.00980665;
  const propKg = sc.dry_kg * (Math.exp(traj.dv_total / (g0 * sc.isp)) - 1);
  const wetKg = sc.dry_kg + propKg;
  const fitsLaunchVehicle = wetKg <= lv.max_kg;
  const opsDays = Math.round(traj.tof + (traj.tof_return || 0) + (traj.stay_days || 0));
  const launchCost = wetKg * lv.cost_per_kg;
  const totalCost = launchCost + sc.cost_usd + (opsDays / 30) * 8e6;
  // @ts-ignore — runtime global during transition
  const econSummary = computeEconomicsSummary(ast, {
    dryMass: sc.dry_kg,
    isp: sc.isp,
    dv: traj.dv_total,
    launchCostPerKg: lv.cost_per_kg,
    totalCostMultiplier: 1,
    payloadKg: sc.payload_kg,
  });
  const realizedNpv = econSummary.realizableNpvUsd;
  const roi = Number.isFinite(realizedNpv) && totalCost > 0 ? realizedNpv / totalCost : null;
  const dvPenalty = -traj.dv_total * 3;
  const launchPenalty = fitsLaunchVehicle ? 0 : -40;
  const roiTerm = Number.isFinite(roi) ? Math.max(-15, Math.min(20, Math.log10(Math.max(1e-6, roi! + 1)) * 10)) : 0;
  const score = Math.round(
    Math.max(0, 100 + dvPenalty + launchPenalty + roiTerm)
  );
  return { wetKg, fitsLaunchVehicle, launchCost, totalCost, realizedNpv, roi, score, dvPenalty, launchPenalty, roiTerm };
}
