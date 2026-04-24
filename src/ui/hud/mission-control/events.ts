// src/ui/hud/mission-control/events.ts
// Stage 8b extraction — mission planner and playback event wiring
// TODO: import from src/ui/hud/mission-control/state —
//   openMissionPlanner, closeMissionPlanner, runMissionOptimizer, runRedirectOptimizer,
//   exportMissionPlan, shareMissionPlan, selectTrajectory,
//   optimalTrajectory, missionResults, mpBurns, renderBurnEditTable,
//   getPlayableMissionContext, missionContextMatches, activatePlayableMission,
//   stopMissionAnimation, setMissionAnimationPlaying, missionAnim,
//   syncMissionSpeedButtons, missionSpeedFromUi
// TODO: import from src/ui/hud/mission-control/burn-mode —
//   toggleBurnMode, burns, MAX_BURNS, burnDV, activeBurnIdx, currentBurnElements,
//   computeMultiBurnElements, renderBurnList, recomputeAllBurnOrbits, updateBurnUI
// TODO: import from src/ui/hud/playback —
//   togglePrimaryPlayback, toggleBodyScaleMode, toggleMoonOrbitVisuals,
//   isPlaying, lastSpeed, setPlayState, syncSpeedButtons,
//   syncMissionPlaybackButtons, syncFollowButton
// TODO: import from src/data — selectedId, currentJD
// TODO: import from src/scene — missionConfig, SPACECRAFT, propellantKgNum
// TODO: import from src/utils/time — jdToDate
// TODO: import THREE, raycaster, burnVectorArrows, camera

// ── Mission Planner event wiring ──────────────────────────────────────────────

/**
 * initMissionEvents — wires all mission-planner button and input listeners:
 *   - btn-plan-mission: open the mission planner for the selected asteroid
 *   - btn-planner-back: close mission planner
 *   - btn-find-route: run optimizer (redirect or extract depending on mission type)
 *   - btn-mp-export: export mission plan
 *   - btn-mp-share: share mission plan URL
 *   - btn-mp-reset-optimal: revert to optimal trajectory
 *   - btn-mp-add-burn: append a new MCC burn
 *   - btn-mp-play + btn-anim-playpause: play/pause mission animation
 *   - btn-anim-stop: stop mission animation
 *   - .anim-speed-btn: set animation speed
 *   - Burn vector hover tooltip (renderer.domElement mousemove)
 *   - .mp-craft-card: spacecraft card selection
 *   - mp-year-start: launch year validation
 *   - btn-add-burn / btn-clear-burns: manual burn sequence management
 *   - Multi-burn mode (btn-burn-mode)
 *   - Porkchop tooltip (porkchop-canvas mousemove / mouseleave)
 *   - btn-play-pause (primary playback)
 *   - btn-scale-mode, btn-moon-orbits, btn-follow-spacecraft
 *   - .speed-btn[data-speed]: global time speed buttons
 *
 * Must be called once after the DOM and Three.js scene are ready.
 */
export function initMissionEvents(
  // TODO: replace all `any` parameters with proper typed imports
  selectedIdRef: { value: number },
  currentJDRef: { value: number },
  openMissionPlanner: (id: number) => void,
  closeMissionPlanner: () => void,
  runMissionOptimizer: () => void,
  runRedirectOptimizer: () => void,
  exportMissionPlan: () => void,
  shareMissionPlan: () => void,
  selectTrajectory: (idx: number) => void,
  optimalTrajectoryRef: { value: any },
  missionResultsRef: { value: any[] },
  mpBurnsRef: { value: any[] },
  renderBurnEditTable: () => void,
  getPlayableMissionContext: () => any,
  missionContextMatches: (ctx: any) => boolean,
  activatePlayableMission: (ctx: any) => boolean,
  stopMissionAnimation: () => void,
  setMissionAnimationPlaying: (playing: boolean) => void,
  missionAnimRef: { value: any },
  syncMissionSpeedButtons: () => void,
  missionSpeedFromUi: (speed: number) => number,
  activeMissionTypeRef: { value: string },
  burnsRef: { value: any[] },
  MAX_BURNS: number,
  burnDVRef: { value: { p: number; n: number; r: number } },
  activeBurnIdxRef: { value: number },
  computeMultiBurnElements: (idx: number) => any,
  renderBurnList: () => void,
  recomputeAllBurnOrbits: () => void,
  updateBurnUI: () => void,
  burnOrbitLines: any[],
  newOrbitLine: any,
  originalOrbitLine: any,
  toggleBurnMode: () => void,
  rendererDomElement: HTMLElement,
  burnVectorArrows: any[],
  raycaster: any,
  camera: any,
  SPACECRAFT: Record<string, any>,
  missionConfig: { spacecraft: string },
  propellantKgNum: (dv: number, isp: number, dryKg: number) => number,
  jdToDate: (jd: number) => string,
  THREE: any,
  porkchopDataRef: { value: any },
  jdToDateFn: (jd: number) => string,
  togglePrimaryPlayback: () => void,
  toggleBodyScaleMode: () => void,
  toggleMoonOrbitVisuals: () => void,
  missionAnimFollowRef: any,
  syncFollowButton: () => void,
  lastSpeedRef: { value: number },
  setPlayState: (playing: boolean) => void,
  syncSpeedButtons: () => void,
): void {
  // ── Phase 7F: Animation + burn vector event wiring ───────────────────────────
  document.getElementById('btn-mp-play')!.addEventListener('click', () => {
    const playable = getPlayableMissionContext();
    if (!missionAnimRef.value.active || !missionContextMatches(playable)) {
      if (missionAnimRef.value.active) stopMissionAnimation();
      if (!activatePlayableMission(playable)) return;
      setMissionAnimationPlaying(true);
    } else {
      setMissionAnimationPlaying(!missionAnimRef.value.playing);
    }
  });

  document.getElementById('btn-anim-playpause')!.addEventListener('click', () => {
    const playable = getPlayableMissionContext();
    if (!missionAnimRef.value.active || !missionContextMatches(playable)) {
      if (missionAnimRef.value.active) stopMissionAnimation();
      if (!activatePlayableMission(playable)) return;
      setMissionAnimationPlaying(true);
      return;
    }
    setMissionAnimationPlaying(!missionAnimRef.value.playing);
  });

  document.getElementById('btn-anim-stop')!.addEventListener('click', stopMissionAnimation);

  document.querySelectorAll('.anim-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      missionAnimRef.value.speed = parseInt((btn as HTMLElement).dataset.aspeed!);
      syncMissionSpeedButtons();
      syncSpeedButtons();
    });
  });

  // ── Mission Planner event wiring ──────────────────────────────────────────────
  document.getElementById('btn-plan-mission')!.addEventListener('click', () => {
    if (selectedIdRef.value >= 0) openMissionPlanner(selectedIdRef.value);
  });
  document.getElementById('btn-planner-back')!.addEventListener('click', closeMissionPlanner);
  document.getElementById('btn-find-route')!.addEventListener('click', () => {
    activeMissionTypeRef.value === 'redirect' ? runRedirectOptimizer() : runMissionOptimizer();
  });
  document.getElementById('btn-mp-export')!.addEventListener('click', exportMissionPlan);
  document.getElementById('btn-mp-share')!.addEventListener('click', shareMissionPlan);
  document.getElementById('btn-mp-reset-optimal')!.addEventListener('click', () => {
    if (optimalTrajectoryRef.value && missionResultsRef.value.length) selectTrajectory(0);
  });
  document.getElementById('btn-mp-add-burn')!.addEventListener('click', () => {
    const lastJD = mpBurnsRef.value.length
      ? mpBurnsRef.value[mpBurnsRef.value.length - 1].jd + 15
      : currentJDRef.value;
    mpBurnsRef.value.push({ label: `${mpBurnsRef.value.length + 1} · MCC`, jd: lastJD, dv_kms: 0.050 });
    renderBurnEditTable();
  });

  // ─── Multi-Burn Sequence ──────────────────────────────────────────────────────
  document.getElementById('btn-burn-mode')!.addEventListener('click', () => toggleBurnMode());

  // Burn vector hover tooltip
  rendererDomElement.addEventListener('mousemove', (e: MouseEvent) => {
    const tooltip = document.getElementById('burn-tooltip')!;
    if (!burnVectorArrows.length) { tooltip.style.display = 'none'; return; }
    const rect  = rendererDomElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(burnVectorArrows, true);
    if (hits.length) {
      let obj = hits[0].object;
      while (obj && !obj.userData.burnLabel) obj = obj.parent;
      if (obj?.userData.burnLabel) {
        const sc     = SPACECRAFT[missionConfig.spacecraft] || SPACECRAFT.medium;
        const fuelKg = propellantKgNum(obj.userData.dv, sc.isp, sc.dry_kg);
        tooltip.style.display = 'block';
        tooltip.style.left    = (e.clientX + 14) + 'px';
        tooltip.style.top     = (e.clientY - 12) + 'px';
        tooltip.innerHTML     = `<b>${obj.userData.burnLabel}</b><br>` +
          `ΔV: ${obj.userData.dv.toFixed(3)} km/s<br>` +
          `Date: ${obj.userData.jd ? jdToDate(obj.userData.jd) : '—'}<br>` +
          `Fuel: ~${Math.round(fuelKg).toLocaleString()} kg`;
        return;
      }
    }
    tooltip.style.display = 'none';
  });

  // Spacecraft card selection
  document.querySelectorAll('.mp-craft-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mp-craft-card').forEach(c => c.classList.remove('mp-craft-selected'));
      card.classList.add('mp-craft-selected');
      (card.querySelector('input[type=radio]') as HTMLInputElement).checked = true;
    });
  });

  // Launch year validation
  document.getElementById('mp-year-start')!.addEventListener('change', function(this: HTMLInputElement) {
    const ys = parseInt(this.value);
    const yeEl = document.getElementById('mp-year-end') as HTMLInputElement;
    if (parseInt(yeEl.value) <= ys) yeEl.value = String(ys + 1);
  });

  document.getElementById('btn-add-burn')!.addEventListener('click', () => {
    if (burnsRef.value.length >= MAX_BURNS) return;
    if (selectedIdRef.value < 0) return;
    const total = Math.sqrt(burnDVRef.value.p ** 2 + burnDVRef.value.n ** 2 + burnDVRef.value.r ** 2);
    if (total < 0.001) return;
    burnsRef.value.push({ dv_p: burnDVRef.value.p, dv_n: burnDVRef.value.n, dv_r: burnDVRef.value.r, jd: currentJDRef.value });
    activeBurnIdxRef.value = burnsRef.value.length - 1;
    burnDVRef.value = { p: 0, n: 0, r: 0 };
    (computeMultiBurnElements as any)(activeBurnIdxRef.value); // assigns to currentBurnElements externally
    renderBurnList();
    recomputeAllBurnOrbits();
    updateBurnUI();
  });

  document.getElementById('btn-clear-burns')!.addEventListener('click', () => {
    burnsRef.value = [];
    activeBurnIdxRef.value = -1;
    burnOrbitLines.forEach(l => { l.visible = false; });
    newOrbitLine.visible = false;
    originalOrbitLine.visible = false;
    renderBurnList();
  });
}

// ── Phase: Primary Playback event wiring ─────────────────────────────────────

/**
 * initPlaybackEvents — wires the primary time-control bar events:
 *   - btn-play-pause: toggle primary playback (or mission animation)
 *   - btn-scale-mode: toggle body scale mode
 *   - btn-moon-orbits: toggle moon orbit visuals
 *   - btn-follow-spacecraft: re-enable auto-follow on mission spacecraft
 *   - .speed-btn[data-speed]: set sim speed / mission animation speed
 */
export function initPlaybackEvents(
  togglePrimaryPlayback: () => void,
  toggleBodyScaleMode: () => void,
  toggleMoonOrbitVisuals: () => void,
  missionAnimRef: { value: any },
  syncFollowButton: () => void,
  lastSpeedRef: { value: number },
  setPlayState: (playing: boolean) => void,
  syncSpeedButtons: () => void,
  setMissionAnimationPlaying: (playing: boolean) => void,
  missionSpeedFromUi: (speed: number) => number,
): void {
  document.getElementById('btn-play-pause')!.addEventListener('click', () => {
    togglePrimaryPlayback();
  });

  document.getElementById('btn-scale-mode')!.addEventListener('click', toggleBodyScaleMode);
  document.getElementById('btn-moon-orbits')!.addEventListener('click', toggleMoonOrbitVisuals);

  document.getElementById('btn-follow-spacecraft')!.addEventListener('click', () => {
    missionAnimRef.value.autoFollow = true;
    missionAnimRef.value.manualOverride = false;
    if (missionAnimRef.value.spacecraft) {
      missionAnimRef.value.followTarget.copy(missionAnimRef.value.spacecraft.position)
        .add(missionAnimRef.value.followOffset);
      // camera.position.copy and controls.target.copy happen in scene module
    }
    syncFollowButton();
  });

  document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (missionAnimRef.value.active) {
        missionAnimRef.value.speed = missionSpeedFromUi(parseInt((btn as HTMLElement).dataset.speed!, 10));
        setMissionAnimationPlaying(true);
      } else {
        lastSpeedRef.value = parseInt((btn as HTMLElement).dataset.speed!, 10);
        setPlayState(true);
      }
    });
  });
}
