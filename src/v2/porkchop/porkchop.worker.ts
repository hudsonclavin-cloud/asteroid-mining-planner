import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type { CanonicalState } from '../core/types.js';
import { propagateKeplerianStateVectors } from '../core/propagators/keplerian.js';
import { interpolateIndexedBodyStateSeries } from './earth-index.js';
import {
  computePorkchopGrid,
  computeReturnPorkchopGrid,
  type PorkchopBranch,
  type PorkchopCell,
  type PorkchopEphemerisDependencies,
  type PorkchopGridParams,
  type PorkchopReturnBranch,
  type PorkchopReturnCell,
  type PorkchopReturnGridParams,
} from './grid-compute.js';

export type PorkchopWorkerDirection = 'outbound' | 'return';

export interface PorkchopWorkerInitMessage {
  readonly type: 'init';
  readonly earthStateSeries: readonly CanonicalState[];
}

interface PorkchopWorkerOutboundComputeMessage {
  readonly type: 'compute-grid';
  readonly direction: 'outbound';
  readonly bodyId: string;
  readonly bodyElements: AsteroidOrbitalElements;
  readonly gridParams: PorkchopGridParams;
  readonly M: number;
}

interface PorkchopWorkerReturnComputeMessage {
  readonly type: 'compute-grid';
  readonly direction: 'return';
  readonly bodyId: string;
  readonly bodyElements: AsteroidOrbitalElements;
  readonly gridParams: PorkchopReturnGridParams;
  readonly M: number;
}

export type PorkchopWorkerComputeMessage =
  | PorkchopWorkerOutboundComputeMessage
  | PorkchopWorkerReturnComputeMessage;

export type PorkchopWorkerInboundMessage =
  | PorkchopWorkerInitMessage
  | PorkchopWorkerComputeMessage;

export interface PorkchopWorkerReadyMessage {
  readonly type: 'ready';
  readonly earthSampleCount: number;
}

export interface PorkchopWorkerErrorMessage {
  readonly type: 'error';
  readonly reason: string;
}

export type PorkchopWorkerBranch = Omit<PorkchopBranch, 'v1' | 'v2' | 'dlaDeg'> & {
  readonly dlaDeg?: number | null;
};
export type PorkchopWorkerCell = Omit<PorkchopCell, 'branches'> & {
  readonly branches: readonly PorkchopWorkerBranch[];
};

export type PorkchopWorkerReturnBranch = PorkchopReturnBranch;
export type PorkchopWorkerReturnCell = Omit<PorkchopReturnCell, 'branches'> & {
  readonly branches: readonly PorkchopWorkerReturnBranch[];
};

export interface PorkchopWorkerOutboundGridResultMessage {
  readonly type: 'grid-result';
  readonly direction: 'outbound';
  readonly bodyId: string;
  readonly M: number;
  readonly cells: readonly PorkchopWorkerCell[];
  readonly compute_ms: number;
}

export interface PorkchopWorkerReturnGridResultMessage {
  readonly type: 'grid-result';
  readonly direction: 'return';
  readonly bodyId: string;
  readonly M: number;
  readonly cells: readonly PorkchopWorkerReturnCell[];
  readonly earthSpanRefusedCount: number;
  readonly compute_ms: number;
}

export type PorkchopWorkerGridResultMessage =
  | PorkchopWorkerOutboundGridResultMessage
  | PorkchopWorkerReturnGridResultMessage;

export type PorkchopWorkerOutboundMessage =
  | PorkchopWorkerReadyMessage
  | PorkchopWorkerErrorMessage
  | PorkchopWorkerGridResultMessage;

export interface PorkchopWorkerScope {
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent<PorkchopWorkerInboundMessage>) => void,
  ): void;
  postMessage(message: PorkchopWorkerOutboundMessage): void;
}

export interface PorkchopWorkerDependencies {
  readonly computeGrid?: typeof computePorkchopGrid;
  readonly computeReturnGrid?: typeof computeReturnPorkchopGrid;
  readonly nowMs?: PorkchopEphemerisDependencies['nowMs'];
}

function stripBranch(branch: PorkchopBranch): PorkchopWorkerBranch {
  return {
    branch: branch.branch,
    converged: branch.converged,
    c3: branch.c3,
    vInfDep: branch.vInfDep,
    vInfArr: branch.vInfArr,
    // Non-finite dlaDeg is normalized to null at the message boundary — mirrors
    // classifyFeasibility's guard (Slice 12 audit M-A residual; `??` alone is
    // NaN-transparent).
    dlaDeg: typeof branch.dlaDeg === 'number' && Number.isFinite(branch.dlaDeg) ? branch.dlaDeg : null,
    x: branch.x,
    ...(branch.refusalReason === undefined ? {} : { refusalReason: branch.refusalReason }),
  };
}

function stripCell(cell: PorkchopCell): PorkchopWorkerCell {
  return {
    depJD: cell.depJD,
    tofDays: cell.tofDays,
    status: cell.status,
    M: cell.M,
    branches: cell.branches.map(stripBranch),
    selectedBranch: cell.selectedBranch,
  };
}

function stripReturnBranch(branch: PorkchopReturnBranch): PorkchopWorkerReturnBranch {
  return {
    branch: branch.branch,
    converged: branch.converged,
    asteroidDepartureTdbSeconds: branch.asteroidDepartureTdbSeconds,
    earthArrivalTdbSeconds: branch.earthArrivalTdbSeconds,
    vInfE: branch.vInfE,
    vInfEKmps: branch.vInfEKmps,
    arrivalC3: branch.arrivalC3,
    vInfAsteroidDeparture: branch.vInfAsteroidDeparture,
    vInfAsteroidDepartureKmps: branch.vInfAsteroidDepartureKmps,
    v1: branch.v1,
    v2: branch.v2,
    M: branch.M,
    muKm3S2: branch.muKm3S2,
    arrivalDeclinationDeg: branch.arrivalDeclinationDeg,
    ...(branch.refusalReason === undefined ? {} : { refusalReason: branch.refusalReason }),
    elementProvenance: branch.elementProvenance,
    tier: branch.tier,
    support: branch.support,
    notEvaluated: branch.notEvaluated,
  };
}

function stripReturnCell(cell: PorkchopReturnCell): PorkchopWorkerReturnCell {
  return {
    depJD: cell.depJD,
    tofDays: cell.tofDays,
    status: cell.status,
    M: cell.M,
    asteroidDepartureTdbSeconds: cell.asteroidDepartureTdbSeconds,
    earthArrivalTdbSeconds: cell.earthArrivalTdbSeconds,
    ...(cell.earthLastSampleTdbSeconds === undefined
      ? {}
      : { earthLastSampleTdbSeconds: cell.earthLastSampleTdbSeconds }),
    branches: cell.branches.map(stripReturnBranch),
    selectedBranch: cell.selectedBranch,
  };
}

function isWorkerDirection(value: unknown): value is PorkchopWorkerDirection {
  return value === 'outbound' || value === 'return';
}

export function installPorkchopWorker(
  scope: PorkchopWorkerScope,
  deps: PorkchopWorkerDependencies = {},
): void {
  let earthStateSeries: readonly CanonicalState[] = [];

  scope.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || typeof message !== 'object') {
      return;
    }

    if (message.type === 'init') {
      earthStateSeries = message.earthStateSeries;
      scope.postMessage({
        type: 'ready',
        earthSampleCount: earthStateSeries.length,
      });
      return;
    }

    if (message.type !== 'compute-grid') {
      return;
    }

    if (!isWorkerDirection(message.direction)) {
      scope.postMessage({
        type: 'error',
        reason: 'Porkchop worker requires an explicit compute direction',
      });
      return;
    }

    if (earthStateSeries.length === 0) {
      scope.postMessage({
        type: 'error',
        reason: 'Porkchop worker received compute-grid before init',
      });
      return;
    }

    const depsForGrid: PorkchopEphemerisDependencies = {
      nowMs: deps.nowMs,
      getEarthStateAtTdbSeconds: (tdbSeconds) =>
        interpolateIndexedBodyStateSeries('earth', earthStateSeries, tdbSeconds),
      propagateTargetStateAtTdbSeconds: (bodyElements, tdbSeconds) =>
        propagateKeplerianStateVectors(bodyElements, tdbSeconds),
    };

    if (message.direction === 'outbound') {
      const result = (deps.computeGrid ?? computePorkchopGrid)(
        message.bodyElements,
        message.gridParams,
        message.M,
        depsForGrid,
      );
      scope.postMessage({
        type: 'grid-result',
        direction: 'outbound',
        bodyId: message.bodyId,
        M: message.M,
        cells: result.cells.map(stripCell),
        compute_ms: result.compute_ms,
      });
      return;
    }

    const result = (deps.computeReturnGrid ?? computeReturnPorkchopGrid)(
      message.bodyElements,
      message.gridParams,
      message.M,
      depsForGrid,
    );
    scope.postMessage({
      type: 'grid-result',
      direction: 'return',
      bodyId: message.bodyId,
      M: message.M,
      cells: result.cells.map(stripReturnCell),
      earthSpanRefusedCount: result.earthSpanRefusedCount,
      compute_ms: result.compute_ms,
    });
  });
}

if (typeof self !== 'undefined' && 'addEventListener' in self && 'postMessage' in self) {
  installPorkchopWorker(self as unknown as PorkchopWorkerScope, {
    nowMs: () => Date.now(),
  });
}
