import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type { CanonicalState } from '../core/types.js';
import { interpolateBodyStateSeries } from '../core/interpolators/hermite.js';
import { propagateKeplerianStateVectors } from '../core/propagators/keplerian.js';
import {
  computePorkchopGrid,
  type PorkchopBranch,
  type PorkchopCell,
  type PorkchopEphemerisDependencies,
  type PorkchopGridParams,
} from './grid-compute.js';

export interface PorkchopWorkerInitMessage {
  readonly type: 'init';
  readonly earthStateSeries: readonly CanonicalState[];
}

export interface PorkchopWorkerComputeMessage {
  readonly type: 'compute-grid';
  readonly bodyId: string;
  readonly bodyElements: AsteroidOrbitalElements;
  readonly gridParams: PorkchopGridParams;
  readonly M: number;
}

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

export interface PorkchopWorkerGridResultMessage {
  readonly type: 'grid-result';
  readonly bodyId: string;
  readonly M: number;
  readonly cells: readonly PorkchopWorkerCell[];
  readonly compute_ms: number;
}

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
  readonly nowMs?: PorkchopEphemerisDependencies['nowMs'];
}

function stripBranch(branch: PorkchopBranch): PorkchopWorkerBranch {
  return {
    branch: branch.branch,
    converged: branch.converged,
    c3: branch.c3,
    vInfDep: branch.vInfDep,
    vInfArr: branch.vInfArr,
    dlaDeg: branch.dlaDeg ?? null,
    x: branch.x,
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

    if (earthStateSeries.length === 0) {
      scope.postMessage({
        type: 'error',
        reason: 'Porkchop worker received compute-grid before init',
      });
      return;
    }

    const result = (deps.computeGrid ?? computePorkchopGrid)(
      message.bodyElements,
      message.gridParams,
      message.M,
      {
        nowMs: deps.nowMs,
        getEarthStateAtTdbSeconds: (tdbSeconds) =>
          interpolateBodyStateSeries('earth', earthStateSeries, tdbSeconds),
        propagateTargetStateAtTdbSeconds: (bodyElements, tdbSeconds) =>
          propagateKeplerianStateVectors(bodyElements, tdbSeconds),
      },
    );

    scope.postMessage({
      type: 'grid-result',
      bodyId: message.bodyId,
      M: message.M,
      cells: result.cells.map(stripCell),
      compute_ms: result.compute_ms,
    });
  });
}

if (typeof self !== 'undefined' && 'addEventListener' in self && 'postMessage' in self) {
  installPorkchopWorker(self as unknown as PorkchopWorkerScope, {
    nowMs: () => Date.now(),
  });
}
