/**
 * src/state/index.ts — Shared mutable application state
 *
 * Centralises the ~50 globals from index.html that are read and written by
 * multiple modules. Each field is exported as a mutable let with a typed
 * setter so cross-module updates stay explicit.
 *
 * Source: index.html lines 2516–2795 (state declarations)
 */

// ── Asteroid / selection ───────────────────────────────────────────────────────

export let asteroidData: any[] = [];
export function setAsteroidData(v: any[]) { asteroidData = v; }

export let selectedId = -1;
export function setSelectedId(v: number) { selectedId = v; }
export function getSelectedAsteroid(): any | null {
  return selectedId >= 0 ? asteroidData[selectedId] ?? null : null;
}

export let flyTarget: any = null;
export function setFlyTarget(v: any) { flyTarget = v; }

export let porkchopData: any = null;
export function setPorkchopData(v: any) { porkchopData = v; }

// ── Mission planner ────────────────────────────────────────────────────────────

export let missionPlanningActive = false;
export function setMissionPlanningActive(v: boolean) { missionPlanningActive = v; }

export let missionConfig = {
  destination: 'leo',
  launchYearStart: 2026,
  launchYearEnd: 2035,
  spacecraft: 'medium',
  launchVehicle: 'f9',
  redirectPropulsion: 'chemical_300',
  redirectTarget: 'lunar_orbit',
};
export function setMissionConfig(patch: Partial<typeof missionConfig>) {
  Object.assign(missionConfig, patch);
}

export let missionResults: any[] = [];
export function setMissionResults(v: any[]) { missionResults = v; }

export let selectedTrajIdx = -1;
export function setSelectedTrajIdx(v: number) { selectedTrajIdx = v; }

export let optimalTrajectory: any = null;
export function setOptimalTrajectory(v: any) { optimalTrajectory = v; }

// ── Trajectory / orbit lines (renderer refs) ───────────────────────────────────

export let trajectoryLine: any = null;
export function setTrajectoryLine(v: any) { trajectoryLine = v; }

export let trajectoryArrows: any[] = [];
export function setTrajectoryArrows(v: any[]) { trajectoryArrows = v; }

export let returnArcLine: any = null;
export function setReturnArcLine(v: any) { returnArcLine = v; }

// ── Redirect mission state ─────────────────────────────────────────────────────

export let _redirectArcLine: any = null;
export function setRedirectArcLine(v: any) { _redirectArcLine = v; }

export let _lunarOrbitRing: any = null;
export function setLunarOrbitRing(v: any) { _lunarOrbitRing = v; }

export let _cargoPodArcs: any[] = [];
export function setCargoPodArcs(v: any[]) { _cargoPodArcs = v; }

export let activeRedirectVisual: any = null;
export function setActiveRedirectVisual(v: any) { activeRedirectVisual = v; }

export let _redirectRequestSeq = 0;
export function bumpRedirectRequestSeq() { return ++_redirectRequestSeq; }

export let _activeRedirectRequestId = 0;
export function setActiveRedirectRequestId(v: number) { _activeRedirectRequestId = v; }

// ── Extract mission planner request IDs ───────────────────────────────────────

export let _plannerTimeoutId: ReturnType<typeof setTimeout> | null = null;
export function setPlannerTimeoutId(v: ReturnType<typeof setTimeout> | null) { _plannerTimeoutId = v; }

export let _extractRequestSeq = 0;
export function bumpExtractRequestSeq() { return ++_extractRequestSeq; }

export let _activeExtractRequestId = 0;
export function setActiveExtractRequestId(v: number) { _activeExtractRequestId = v; }

export let missionReturnTargetPos: any = null;
export function setMissionReturnTargetPos(v: any) { missionReturnTargetPos = v; }

export let _activeReturnQueryId = 0;
export function setActiveReturnQueryId(v: number) { _activeReturnQueryId = v; }

// ── Burn / gizmo state ─────────────────────────────────────────────────────────

export const MAX_BURNS = 5;
export const BURN_COLORS = [0x4af7c4, 0xff7700, 0xffcc00, 0xff69b4, 0xff3344];

export let burnModeActive = false;
export function setBurnModeActive(v: boolean) { burnModeActive = v; }

export let burnDV = { p: 0, n: 0, r: 0 };
export function setBurnDV(v: { p: number; n: number; r: number }) { burnDV = v; }
export function patchBurnDV(patch: Partial<typeof burnDV>) { Object.assign(burnDV, patch); }

export let currentBurnElements: any = null;
export function setCurrentBurnElements(v: any) { currentBurnElements = v; }

export let burns: any[] = [];
export function setBurns(v: any[]) { burns = v; }

export let activeBurnIdx = -1;
export function setActiveBurnIdx(v: number) { activeBurnIdx = v; }

export let burnVectorArrows: any[] = [];
export function setBurnVectorArrows(v: any[]) { burnVectorArrows = v; }

export let mpBurns: any[] = [];
export function setMpBurns(v: any[]) { mpBurns = v; }

// ── Orbit visualization lines (gizmo mode) ────────────────────────────────────

export let burnOrbitLines: any[] = [];
export function setBurnOrbitLines(v: any[]) { burnOrbitLines = v; }

export let originalOrbitLine: any = null;
export function setOriginalOrbitLine(v: any) { originalOrbitLine = v; }

export let newOrbitLine: any = null;
export function setNewOrbitLine(v: any) { newOrbitLine = v; }

export let redirectOriginalOrbitLine: any = null;
export function setRedirectOriginalOrbitLine(v: any) { redirectOriginalOrbitLine = v; }

export let redirectAdjustedOrbitLine: any = null;
export function setRedirectAdjustedOrbitLine(v: any) { redirectAdjustedOrbitLine = v; }

// ── Selected asteroid orbit line ───────────────────────────────────────────────

export let orbitLine: any = null;
export function setOrbitLine(v: any) { orbitLine = v; }

// ── Mission type toggle ────────────────────────────────────────────────────────

export let _activeMissionType: 'extract' | 'redirect' = 'extract';
export function setActiveMissionType(v: 'extract' | 'redirect') { _activeMissionType = v; }

// ── Arc anchors (mission overlay) ─────────────────────────────────────────────

export const _arcAnchors: any[] = [null, null, null];
export function setArcAnchor(i: number, v: any) { _arcAnchors[i] = v; }
