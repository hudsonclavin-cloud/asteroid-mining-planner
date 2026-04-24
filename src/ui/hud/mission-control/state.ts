// TODO: import THREE from 'three' (for Vector3 usage in missionAnim)

// ─── Burn Mode State ──────────────────────────────────────────────────────────
export let burnModeActive = false;
export let burnDV = { p: 0, n: 0, r: 0 };
export let currentBurnElements: any = null;  // post-burn elements (radians/epoch_JD form)
export let lastBurnResult: any = null;       // latest apply_burn response
export let dragAxis: string | null = null;
export let dragStartScreen: { x: number; y: number } | null = null;
export let dragStartDV = 0;
export let ghostTime = 0;

// Multi-burn sequence
export const MAX_BURNS = 5;
export let burns: Array<{ dv_p: number; dv_n: number; dv_r: number; jd: number }> = [];          // [{dv_p, dv_n, dv_r, jd}, ...]
export let activeBurnIdx = -1;  // -1 = no saved burns yet

// ─── Mission Planner State ────────────────────────────────────────────────────
export let missionConfig = {
  destination: 'leo',
  launchYearStart: 2026,
  launchYearEnd: 2035,
  spacecraft: 'medium',
  launchVehicle: 'f9',
  redirectPropulsion: 'chemical_300',
  redirectTarget: 'lunar_orbit',
};
export let missionResults: any[]    = [];
export let selectedTrajIdx   = -1;
export let optimalTrajectory: any = null;
export let trajectoryLine: any    = null;
export let trajectoryArrows: any[]  = [];
export let returnArcLine: any     = null;
export let _redirectArcLine: any  = null;
export let _lunarOrbitRing: any   = null;
export let _cargoPodArcs: any[]   = [];
export let activeRedirectVisual: any = null;
export let _redirectRequestSeq = 0;
export let _activeRedirectRequestId = 0;
export let _extractRequestSeq = 0;
export let _activeExtractRequestId = 0;
export let mpBurns: any[]           = [];

// ── Phase 7F: Mission Visualization ──────────────────────────────────────────
export let burnVectorArrows: any[]       = [];
export let missionReturnTargetPos: { x: number; y: number; z: number } | null = null;
export let _activeReturnQueryId   = 0;

// TODO: import THREE.Vector3 from 'three'
export const missionAnim = {
  active: false, playing: false, speed: 86400,
  animJD: 0, phase: 'idle' as string,
  outboundPts: [] as any[], returnPts: [] as any[],
  targetPts: [] as any[],
  mode: 'extract' as string,
  jdStart: 0, jdEnd: 0,
  attachEndJD: 0,
  captureEndJD: 0,
  captureRadiusAU: 0,
  redirectVisual: null as any,
  spacecraft: null as any, engineLight: null as any,
  asteroidBody: null as any,
  trailLine: null as any, trailPts: [] as any[],
  thrusterPlumes: [] as any[],
  autoFollow: false,
  manualOverride: false,
  spacecraftVisible: false,
  // TODO: replace any[] with THREE.Vector3 once THREE is imported
  spacecraftDirection: [0, 0, 1] as any, // new THREE.Vector3(0, 0, 1)
  sampledPosition: [0, 0, 0] as any,     // new THREE.Vector3()
  sampledNext: [0, 0, 0] as any,         // new THREE.Vector3()
  sampledAsteroid: [0, 0, 0] as any,     // new THREE.Vector3()
  sampledAsteroidNext: [0, 0, 0] as any, // new THREE.Vector3()
  followOffset: [0.3, 0.15, 0.3] as any, // new THREE.Vector3(0.3, 0.15, 0.3)
  followTarget: [0, 0, 0] as any,        // new THREE.Vector3()
  plumeDirection: [0, 0, -1] as any,     // new THREE.Vector3(0, 0, -1)
  attachmentOffset: [0, 0, 0] as any,    // new THREE.Vector3()
  captureCenter: [0, 0, 0] as any,       // new THREE.Vector3()
};

export let playbackModeBeforeScrub: string = 'none';
export let playbackMissionRefBeforeScrub: any = null;
export let playbackMissionModeBeforeScrub: any = null;

// ─── Setters ──────────────────────────────────────────────────────────────────

export function setBurnModeActive(val: boolean): void { burnModeActive = val; }
export function setBurnDV(val: { p: number; n: number; r: number }): void { burnDV = val; }
export function setCurrentBurnElements(val: any): void { currentBurnElements = val; }
export function setLastBurnResult(val: any): void { lastBurnResult = val; }
export function setDragAxis(val: string | null): void { dragAxis = val; }
export function setDragStartScreen(val: { x: number; y: number } | null): void { dragStartScreen = val; }
export function setDragStartDV(val: number): void { dragStartDV = val; }
export function setGhostTime(val: number): void { ghostTime = val; }
export function setBurns(val: Array<{ dv_p: number; dv_n: number; dv_r: number; jd: number }>): void { burns = val; }
export function setActiveBurnIdx(val: number): void { activeBurnIdx = val; }
export function setMissionConfig(val: typeof missionConfig): void { missionConfig = val; }
export function setMissionResults(val: any[]): void { missionResults = val; }
export function setSelectedTrajIdx(val: number): void { selectedTrajIdx = val; }
export function setOptimalTrajectory(val: any): void { optimalTrajectory = val; }
export function setTrajectoryLine(val: any): void { trajectoryLine = val; }
export function setTrajectoryArrows(val: any[]): void { trajectoryArrows = val; }
export function setReturnArcLine(val: any): void { returnArcLine = val; }
export function setMissionReturnTargetPos(val: { x: number; y: number; z: number } | null): void { missionReturnTargetPos = val; }
export function setActiveReturnQueryId(val: number): void { _activeReturnQueryId = val; }
export function setActiveRedirectRequestId(val: number): void { _activeRedirectRequestId = val; }
export function setActiveExtractRequestId(val: number): void { _activeExtractRequestId = val; }
export function setRedirectRequestSeq(val: number): void { _redirectRequestSeq = val; }
export function setExtractRequestSeq(val: number): void { _extractRequestSeq = val; }
export function setActiveRedirectVisual(val: any): void { activeRedirectVisual = val; }
export function setMpBurns(val: any[]): void { mpBurns = val; }
export function setBurnVectorArrows(val: any[]): void { burnVectorArrows = val; }
export function setPlaybackModeBeforeScrub(val: string): void { playbackModeBeforeScrub = val; }
export function setPlaybackMissionRefBeforeScrub(val: any): void { playbackMissionRefBeforeScrub = val; }
export function setPlaybackMissionModeBeforeScrub(val: any): void { playbackMissionModeBeforeScrub = val; }
