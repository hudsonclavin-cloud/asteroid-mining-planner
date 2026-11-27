import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type { CanonicalState } from '../core/types.js';
import { GM_SUN_M3_S2 } from '../core/propagators/keplerian.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../core/units.js';
import { dlaDegFromVInf } from '../core/lambert/dla.js';
import { lambertMultiRev, type MultiRevResult } from '../core/lambert/lambert-multi-rev.js';
import { assessSunArc, type SunArcAssessment } from './sun-arc.js';

const METERS_PER_KILOMETER = 1000;
const MU_SUN_KM3_S2 = GM_SUN_M3_S2 / (METERS_PER_KILOMETER ** 3);

type Vec3Km = readonly [number, number, number];
type MutableVec3Km = [number, number, number];
type LambertSolver = (
  r1: Vec3Km,
  r2: Vec3Km,
  tofSeconds: number,
  mu: number,
  M: number,
  lw: boolean,
) => MultiRevResult | null;

export interface PorkchopGridParams {
  readonly depStartJD: number;
  readonly depEndJD: number;
  readonly tofMinDays: number;
  readonly tofMaxDays: number;
  readonly nDep: number;
  readonly nTof: number;
}

export interface PorkchopBranch {
  readonly branch: 'single' | 'left' | 'right';
  readonly converged: boolean;
  readonly c3: number;
  readonly vInfDep: number;
  readonly vInfArr: number;
  readonly dlaDeg?: number | null;
  readonly x: number;
  readonly v1: Vec3Km;
  readonly v2: Vec3Km;
  readonly refusalReason?: SunArcAssessment['refusalReason'];
}

export interface PorkchopCell {
  readonly depJD: number;
  readonly tofDays: number;
  readonly status: 'ok' | 'no_solution' | 'stall';
  readonly M: number;
  readonly branches: readonly PorkchopBranch[];
  readonly selectedBranch: number | null;
}

export interface PorkchopGridResult {
  readonly cells: readonly PorkchopCell[];
  readonly compute_ms: number;
}

export interface PorkchopReturnGridParams extends PorkchopGridParams {
  /** Runtime Earth span in TDB seconds; return cells after this epoch refuse. */
  readonly earthMaxTdbSeconds?: number;
}

export type PorkchopReturnCellStatus = 'ok' | 'no_solution' | 'stall' | 'earth-span';

export interface PorkchopReturnBranch {
  readonly branch: 'single' | 'left' | 'right';
  readonly converged: boolean;
  readonly asteroidDepartureTdbSeconds: number;
  readonly earthArrivalTdbSeconds: number;
  readonly vInfE: Vec3Km;
  readonly vInfEKmps: number;
  readonly arrivalC3: number;
  readonly vInfAsteroidDeparture: Vec3Km;
  readonly vInfAsteroidDepartureKmps: number;
  readonly v1: Vec3Km;
  readonly v2: Vec3Km;
  readonly M: number;
  readonly muKm3S2: number;
  readonly arrivalDeclinationDeg: number | null;
  readonly refusalReason?: SunArcAssessment['refusalReason'];
  readonly elementProvenance: string | null;
  readonly tier: string | null;
  readonly support: boolean | null;
  readonly notEvaluated: {
    readonly bPlane: null;
    readonly entryFlightPathAngle: null;
    readonly entryLocation: null;
    readonly atmosphereRelativeEntrySpeed: null;
    readonly earthMoonCapture: null;
    readonly catchFeasibility: null;
  };
}

export interface PorkchopReturnCell {
  readonly depJD: number;
  readonly tofDays: number;
  readonly status: PorkchopReturnCellStatus;
  readonly M: number;
  readonly asteroidDepartureTdbSeconds: number;
  readonly earthArrivalTdbSeconds: number;
  readonly earthLastSampleTdbSeconds?: number;
  readonly branches: readonly PorkchopReturnBranch[];
  readonly selectedBranch: number | null;
}

export interface PorkchopReturnGridResult {
  readonly cells: readonly PorkchopReturnCell[];
  readonly earthSpanRefusedCount: number;
  readonly compute_ms: number;
}

export interface PorkchopEphemerisDependencies {
  readonly getEarthStateAtTdbSeconds: (tdbSeconds: number) => CanonicalState;
  readonly propagateTargetStateAtTdbSeconds: (
    bodyElements: AsteroidOrbitalElements,
    tdbSeconds: number,
  ) => Pick<CanonicalState, 'positionM' | 'velocityMps'>;
  readonly solveLambert?: LambertSolver;
  readonly nowMs?: () => number;
}

function buildLinspace(start: number, end: number, count: number): number[] {
  if (count <= 1) {
    return [start];
  }

  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + step * index);
}

function jdTdbToSecondsSinceJ2000(jdTdb: number): number {
  return (jdTdb - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
}

function writeKmFromMeters(
  target: MutableVec3Km,
  positionM: CanonicalState['positionM'],
): Vec3Km {
  target[0] = positionM.x / METERS_PER_KILOMETER;
  target[1] = positionM.y / METERS_PER_KILOMETER;
  target[2] = positionM.z / METERS_PER_KILOMETER;
  return target;
}

function writeKmpsFromMps(
  target: MutableVec3Km,
  velocityMps: CanonicalState['velocityMps'],
): Vec3Km {
  target[0] = velocityMps.x / METERS_PER_KILOMETER;
  target[1] = velocityMps.y / METERS_PER_KILOMETER;
  target[2] = velocityMps.z / METERS_PER_KILOMETER;
  return target;
}

function magnitude3(x: number, y: number, z: number): number {
  return Math.hypot(x, y, z);
}

function mapBranches(
  result: MultiRevResult,
  earthPositionKm: Vec3Km,
  earthVelocityKmps: Vec3Km,
  asteroidPositionKm: Vec3Km,
  asteroidVelocityKmps: Vec3Km,
  muKm3S2: number,
  M: number,
): readonly PorkchopBranch[] {
  const branches = new Array<PorkchopBranch>(result.branches.length);

  for (let index = 0; index < result.branches.length; index += 1) {
    const branch = result.branches[index];
    const vInfDepX = branch.v1[0] - earthVelocityKmps[0];
    const vInfDepY = branch.v1[1] - earthVelocityKmps[1];
    const vInfDepZ = branch.v1[2] - earthVelocityKmps[2];
    const vInfArrX = branch.v2[0] - asteroidVelocityKmps[0];
    const vInfArrY = branch.v2[1] - asteroidVelocityKmps[1];
    const vInfArrZ = branch.v2[2] - asteroidVelocityKmps[2];
    const vInfDep = magnitude3(vInfDepX, vInfDepY, vInfDepZ);
    const vInfArr = magnitude3(vInfArrX, vInfArrY, vInfArrZ);
    const dlaDeg = branch.converged ? dlaDegFromVInf(vInfDepX, vInfDepY, vInfDepZ) : null;
    const sunArc = branch.converged
      ? assessSunArc(earthPositionKm, branch.v1, asteroidPositionKm, muKm3S2, M)
      : undefined;

    branches[index] = {
      branch: branch.branch,
      converged: branch.converged,
      c3: vInfDep * vInfDep,
      vInfDep,
      vInfArr,
      dlaDeg,
      x: branch.x,
      v1: branch.v1,
      v2: branch.v2,
      ...(sunArc?.refusalReason === undefined ? {} : { refusalReason: sunArc.refusalReason }),
    };
  }

  return branches;
}

function resolveSelectedBranch(branches: readonly PorkchopBranch[]): number | null {
  let selectedIndex: number | null = null;
  let selectedC3 = Number.POSITIVE_INFINITY;

  for (let index = 0; index < branches.length; index += 1) {
    const branch = branches[index];
    if (!branch.converged || branch.refusalReason !== undefined) {
      continue;
    }
    if (branch.c3 < selectedC3) {
      selectedC3 = branch.c3;
      selectedIndex = index;
    }
  }

  return selectedIndex;
}

function arrivalDeclinationDeg(vector: Vec3Km): number | null {
  const magnitude = magnitude3(vector[0], vector[1], vector[2]);
  return magnitude > 0 && Number.isFinite(magnitude)
    ? Math.atan2(vector[2], Math.hypot(vector[0], vector[1])) * 180 / Math.PI
    : null;
}

function notEvaluatedReturnFields(): PorkchopReturnBranch['notEvaluated'] {
  return {
    bPlane: null,
    entryFlightPathAngle: null,
    entryLocation: null,
    atmosphereRelativeEntrySpeed: null,
    earthMoonCapture: null,
    catchFeasibility: null,
  };
}

function mapReturnBranches(
  result: MultiRevResult,
  asteroidPositionKm: Vec3Km,
  asteroidVelocityKmps: Vec3Km,
  earthPositionKm: Vec3Km,
  earthVelocityKmps: Vec3Km,
  asteroidDepartureTdbSeconds: number,
  earthArrivalTdbSeconds: number,
  muKm3S2: number,
  M: number,
): readonly PorkchopReturnBranch[] {
  return result.branches.map((branch) => {
    const vInfEX = branch.v2[0] - earthVelocityKmps[0];
    const vInfEY = branch.v2[1] - earthVelocityKmps[1];
    const vInfEZ = branch.v2[2] - earthVelocityKmps[2];
    const vInfAsteroidDepartureX = branch.v1[0] - asteroidVelocityKmps[0];
    const vInfAsteroidDepartureY = branch.v1[1] - asteroidVelocityKmps[1];
    const vInfAsteroidDepartureZ = branch.v1[2] - asteroidVelocityKmps[2];
    const vInfE: Vec3Km = [vInfEX, vInfEY, vInfEZ];
    const vInfAsteroidDeparture: Vec3Km = [
      vInfAsteroidDepartureX,
      vInfAsteroidDepartureY,
      vInfAsteroidDepartureZ,
    ];
    const sunArc = branch.converged
      ? assessSunArc(asteroidPositionKm, branch.v1, earthPositionKm, muKm3S2, M)
      : undefined;
    return {
      branch: branch.branch,
      converged: branch.converged,
      asteroidDepartureTdbSeconds,
      earthArrivalTdbSeconds,
      vInfE,
      vInfEKmps: magnitude3(vInfEX, vInfEY, vInfEZ),
      arrivalC3: vInfEX * vInfEX + vInfEY * vInfEY + vInfEZ * vInfEZ,
      vInfAsteroidDeparture,
      vInfAsteroidDepartureKmps: magnitude3(
        vInfAsteroidDepartureX,
        vInfAsteroidDepartureY,
        vInfAsteroidDepartureZ,
      ),
      v1: branch.v1,
      v2: branch.v2,
      M,
      muKm3S2,
      arrivalDeclinationDeg: arrivalDeclinationDeg(vInfE),
      ...(sunArc?.refusalReason === undefined ? {} : { refusalReason: sunArc.refusalReason }),
      elementProvenance: null,
      tier: null,
      support: null,
      notEvaluated: notEvaluatedReturnFields(),
    };
  });
}

export function computePorkchopGrid(
  bodyElements: AsteroidOrbitalElements,
  gridParams: PorkchopGridParams,
  M: number,
  deps: PorkchopEphemerisDependencies,
): PorkchopGridResult {
  const solveLambert = deps.solveLambert ?? lambertMultiRev;
  const depGridJd = buildLinspace(gridParams.depStartJD, gridParams.depEndJD, gridParams.nDep);
  const tofGridDays = buildLinspace(gridParams.tofMinDays, gridParams.tofMaxDays, gridParams.nTof);
  const startedAtMs = deps.nowMs?.();
  const totalCellCount = depGridJd.length * tofGridDays.length;
  const cells = new Array<PorkchopCell>(totalCellCount);
  const earthPositionKm: MutableVec3Km = [0, 0, 0];
  const earthVelocityKmps: MutableVec3Km = [0, 0, 0];
  const asteroidPositionKm: MutableVec3Km = [0, 0, 0];
  const asteroidVelocityKmps: MutableVec3Km = [0, 0, 0];
  let cellIndex = 0;

  for (const depJD of depGridJd) {
    const departureTdbSeconds = jdTdbToSecondsSinceJ2000(depJD);
    const earthState = deps.getEarthStateAtTdbSeconds(departureTdbSeconds);
    writeKmFromMeters(earthPositionKm, earthState.positionM);
    writeKmpsFromMps(earthVelocityKmps, earthState.velocityMps);

    for (const tofDays of tofGridDays) {
      const tofSeconds = tofDays * SECONDS_PER_DAY;
      const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
      const asteroidState = deps.propagateTargetStateAtTdbSeconds(bodyElements, arrivalTdbSeconds);
      writeKmFromMeters(asteroidPositionKm, asteroidState.positionM);
      writeKmpsFromMps(asteroidVelocityKmps, asteroidState.velocityMps);
      const lambertResult = solveLambert(
        earthPositionKm,
        asteroidPositionKm,
        tofSeconds,
        MU_SUN_KM3_S2,
        M,
        true,
      );

      if (lambertResult === null) {
        cells[cellIndex] = {
          depJD,
          tofDays,
          status: 'no_solution',
          M,
          branches: [],
          selectedBranch: null,
        };
        cellIndex += 1;
        continue;
      }

      const branches = mapBranches(
        lambertResult,
        earthPositionKm,
        earthVelocityKmps,
        asteroidPositionKm,
        asteroidVelocityKmps,
        MU_SUN_KM3_S2,
        M,
      );
      const selectedBranch = resolveSelectedBranch(branches);
      cells[cellIndex] = {
        depJD,
        tofDays,
        status: selectedBranch === null ? 'stall' : 'ok',
        M,
        branches,
        selectedBranch,
      };
      cellIndex += 1;
    }
  }

  const endedAtMs = deps.nowMs?.();
  return {
    cells,
    compute_ms:
      typeof startedAtMs === 'number' && typeof endedAtMs === 'number'
        ? endedAtMs - startedAtMs
        : 0,
  };
}

/**
 * Sibling K1 return kernel (DEC-20-1/3). The endpoint roles are deliberately
 * explicit: r1 is the asteroid at departure and r2 is Earth at arrival. The
 * Lambert call uses the same injected solver and arguments as outbound:
 * (r1, r2, tofSeconds, MU_SUN_KM3_S2, M, true).
 */
export function computeReturnPorkchopGrid(
  bodyElements: AsteroidOrbitalElements,
  gridParams: PorkchopReturnGridParams,
  M: number,
  deps: PorkchopEphemerisDependencies,
): PorkchopReturnGridResult {
  const solveLambert = deps.solveLambert ?? lambertMultiRev;
  const depGridJd = buildLinspace(gridParams.depStartJD, gridParams.depEndJD, gridParams.nDep);
  const tofGridDays = buildLinspace(gridParams.tofMinDays, gridParams.tofMaxDays, gridParams.nTof);
  const startedAtMs = deps.nowMs?.();
  const totalCellCount = depGridJd.length * tofGridDays.length;
  const cells = new Array<PorkchopReturnCell>(totalCellCount);
  const asteroidPositionKm: MutableVec3Km = [0, 0, 0];
  const asteroidVelocityKmps: MutableVec3Km = [0, 0, 0];
  const earthPositionKm: MutableVec3Km = [0, 0, 0];
  const earthVelocityKmps: MutableVec3Km = [0, 0, 0];
  let earthSpanRefusedCount = 0;
  let cellIndex = 0;

  for (const depJD of depGridJd) {
    const asteroidDepartureTdbSeconds = jdTdbToSecondsSinceJ2000(depJD);
    const asteroidState = deps.propagateTargetStateAtTdbSeconds(bodyElements, asteroidDepartureTdbSeconds);
    writeKmFromMeters(asteroidPositionKm, asteroidState.positionM);
    writeKmpsFromMps(asteroidVelocityKmps, asteroidState.velocityMps);

    for (const tofDays of tofGridDays) {
      const tofSeconds = tofDays * SECONDS_PER_DAY;
      const earthArrivalTdbSeconds = asteroidDepartureTdbSeconds + tofSeconds;
      if (
        typeof gridParams.earthMaxTdbSeconds === 'number' &&
        earthArrivalTdbSeconds > gridParams.earthMaxTdbSeconds
      ) {
        earthSpanRefusedCount += 1;
        cells[cellIndex] = {
          depJD,
          tofDays,
          status: 'earth-span',
          M,
          asteroidDepartureTdbSeconds,
          earthArrivalTdbSeconds,
          earthLastSampleTdbSeconds: gridParams.earthMaxTdbSeconds,
          branches: [],
          selectedBranch: null,
        };
        cellIndex += 1;
        continue;
      }

      const earthState = deps.getEarthStateAtTdbSeconds(earthArrivalTdbSeconds);
      writeKmFromMeters(earthPositionKm, earthState.positionM);
      writeKmpsFromMps(earthVelocityKmps, earthState.velocityMps);
      const lambertResult = solveLambert(
        asteroidPositionKm,
        earthPositionKm,
        tofSeconds,
        MU_SUN_KM3_S2,
        M,
        true,
      );
      if (lambertResult === null) {
        cells[cellIndex] = {
          depJD,
          tofDays,
          status: 'no_solution',
          M,
          asteroidDepartureTdbSeconds,
          earthArrivalTdbSeconds,
          branches: [],
          selectedBranch: null,
        };
        cellIndex += 1;
        continue;
      }

      const branches = mapReturnBranches(
        lambertResult,
        asteroidPositionKm,
        asteroidVelocityKmps,
        earthPositionKm,
        earthVelocityKmps,
        asteroidDepartureTdbSeconds,
        earthArrivalTdbSeconds,
        MU_SUN_KM3_S2,
        M,
      );
      cells[cellIndex] = {
        depJD,
        tofDays,
        status: branches.some((branch) => branch.converged) ? 'ok' : 'stall',
        M,
        asteroidDepartureTdbSeconds,
        earthArrivalTdbSeconds,
        branches,
        selectedBranch: null,
      };
      cellIndex += 1;
    }
  }

  const endedAtMs = deps.nowMs?.();
  return {
    cells,
    earthSpanRefusedCount,
    compute_ms:
      typeof startedAtMs === 'number' && typeof endedAtMs === 'number'
        ? endedAtMs - startedAtMs
        : 0,
  };
}
