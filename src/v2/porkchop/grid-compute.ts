import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type { CanonicalState } from '../core/types.js';
import { GM_SUN_M3_S2 } from '../core/propagators/keplerian.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../core/units.js';
import { lambertMultiRev, type MultiRevResult } from '../core/lambert/lambert-multi-rev.js';

const METERS_PER_KILOMETER = 1000;
const MU_SUN_KM3_S2 = GM_SUN_M3_S2 / (METERS_PER_KILOMETER ** 3);

type Vec3Km = readonly [number, number, number];
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

function vectorKmFromMeters(positionM: CanonicalState['positionM']): Vec3Km {
  return [positionM.x / METERS_PER_KILOMETER, positionM.y / METERS_PER_KILOMETER, positionM.z / METERS_PER_KILOMETER];
}

function vectorKmpsFromMps(velocityMps: CanonicalState['velocityMps']): Vec3Km {
  return [
    velocityMps.x / METERS_PER_KILOMETER,
    velocityMps.y / METERS_PER_KILOMETER,
    velocityMps.z / METERS_PER_KILOMETER,
  ];
}

function subtract3(left: Vec3Km, right: Vec3Km): Vec3Km {
  return [left[0] - right[0], left[1] - right[1], left[2] - right[2]];
}

function magnitude3(vector: Vec3Km): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function mapBranches(
  result: MultiRevResult,
  earthVelocityKmps: Vec3Km,
  asteroidVelocityKmps: Vec3Km,
): readonly PorkchopBranch[] {
  return result.branches.map((branch) => {
    const vInfDepVector = subtract3(branch.v1, earthVelocityKmps);
    const vInfArrVector = subtract3(branch.v2, asteroidVelocityKmps);
    const vInfDep = magnitude3(vInfDepVector);
    const vInfArr = magnitude3(vInfArrVector);

    return {
      branch: branch.branch,
      converged: branch.converged,
      c3: vInfDep * vInfDep,
      vInfDep,
      vInfArr,
      x: branch.x,
      v1: [branch.v1[0], branch.v1[1], branch.v1[2]],
      v2: [branch.v2[0], branch.v2[1], branch.v2[2]],
    };
  });
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
  const cells: PorkchopCell[] = [];

  for (const depJD of depGridJd) {
    const departureTdbSeconds = jdTdbToSecondsSinceJ2000(depJD);
    const earthState = deps.getEarthStateAtTdbSeconds(departureTdbSeconds);
    const earthPositionKm = vectorKmFromMeters(earthState.positionM);
    const earthVelocityKmps = vectorKmpsFromMps(earthState.velocityMps);

    for (const tofDays of tofGridDays) {
      const tofSeconds = tofDays * SECONDS_PER_DAY;
      const arrivalTdbSeconds = departureTdbSeconds + tofSeconds;
      const asteroidState = deps.propagateTargetStateAtTdbSeconds(bodyElements, arrivalTdbSeconds);
      const asteroidPositionKm = vectorKmFromMeters(asteroidState.positionM);
      const asteroidVelocityKmps = vectorKmpsFromMps(asteroidState.velocityMps);
      const lambertResult = solveLambert(
        earthPositionKm,
        asteroidPositionKm,
        tofSeconds,
        MU_SUN_KM3_S2,
        M,
        true,
      );

      if (lambertResult === null) {
        cells.push({
          depJD,
          tofDays,
          status: 'no_solution',
          M,
          branches: [],
          selectedBranch: null,
        });
        continue;
      }

      const branches = mapBranches(lambertResult, earthVelocityKmps, asteroidVelocityKmps);
      const selectedBranch = resolveSelectedBranch(branches);
      cells.push({
        depJD,
        tofDays,
        status: selectedBranch === null ? 'stall' : 'ok',
        M,
        branches,
        selectedBranch,
      });
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
