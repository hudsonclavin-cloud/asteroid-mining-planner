import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type { CanonicalState } from '../core/types.js';
import { GM_SUN_M3_S2 } from '../core/propagators/keplerian.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../core/units.js';
import { dlaDegFromVInf } from '../core/lambert/dla.js';
import { lambertMultiRev, type MultiRevResult } from '../core/lambert/lambert-multi-rev.js';

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
  earthVelocityKmps: Vec3Km,
  asteroidVelocityKmps: Vec3Km,
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
    };
  }

  return branches;
}

function resolveSelectedBranch(branches: readonly PorkchopBranch[]): number | null {
  let selectedIndex: number | null = null;
  let selectedC3 = Number.POSITIVE_INFINITY;

  for (let index = 0; index < branches.length; index += 1) {
    const branch = branches[index];
    if (!branch.converged) {
      continue;
    }
    if (branch.c3 < selectedC3) {
      selectedC3 = branch.c3;
      selectedIndex = index;
    }
  }

  return selectedIndex;
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

      const branches = mapBranches(lambertResult, earthVelocityKmps, asteroidVelocityKmps);
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
