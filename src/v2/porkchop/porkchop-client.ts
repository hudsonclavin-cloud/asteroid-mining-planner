import type { CanonicalState } from '../core/types.js';
import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type {
  PorkchopGridParams,
} from './grid-compute.js';
import type {
  PorkchopWorkerGridResultMessage,
  PorkchopWorkerInboundMessage,
  PorkchopWorkerOutboundMessage,
} from './porkchop.worker.js';

export interface PorkchopClient {
  computeGrid(args: {
    readonly bodyId: string;
    readonly bodyElements: AsteroidOrbitalElements;
    readonly gridParams: PorkchopGridParams;
    readonly M: number;
  }): Promise<PorkchopWorkerGridResultMessage>;
  dispose(): void;
}

interface PendingRequest {
  resolve: (message: PorkchopWorkerGridResultMessage) => void;
  reject: (error: Error) => void;
}

export async function createPorkchopClient(
  earthStateSeries: readonly CanonicalState[],
): Promise<PorkchopClient> {
  const worker = new Worker(new URL('./porkchop.worker.ts', import.meta.url), { type: 'module' });
  let pendingRequest: PendingRequest | null = null;
  let readyResolve: (() => void) | null = null;
  let readyReject: ((error: Error) => void) | null = null;
  let isReady = false;
  let disposed = false;

  const readyPromise = new Promise<void>((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
  });

  worker.addEventListener('message', (event: MessageEvent<PorkchopWorkerOutboundMessage>) => {
    const message = event.data;
    if (!message || typeof message !== 'object') {
      return;
    }

    if (message.type === 'ready') {
      isReady = true;
      readyResolve?.();
      readyResolve = null;
      readyReject = null;
      return;
    }

    if (message.type === 'error') {
      const error = new Error(message.reason);
      if (!isReady) {
        readyReject?.(error);
        readyResolve = null;
        readyReject = null;
        return;
      }
      pendingRequest?.reject(error);
      pendingRequest = null;
      return;
    }

    if (message.type === 'grid-result') {
      pendingRequest?.resolve(message);
      pendingRequest = null;
    }
  });

  worker.addEventListener('error', (event) => {
    const error = event.error instanceof Error ? event.error : new Error(String(event.message || 'Worker error'));
    if (!isReady) {
      readyReject?.(error);
      readyResolve = null;
      readyReject = null;
      return;
    }
    pendingRequest?.reject(error);
    pendingRequest = null;
  });

  const initMessage: PorkchopWorkerInboundMessage = {
    type: 'init',
    earthStateSeries,
  };
  worker.postMessage(initMessage);
  await readyPromise;

  return {
    async computeGrid({ bodyId, bodyElements, gridParams, M }) {
      if (disposed) {
        throw new Error('Porkchop client has been disposed');
      }
      if (pendingRequest !== null) {
        throw new Error('Porkchop client already has a compute in flight');
      }

      return new Promise<PorkchopWorkerGridResultMessage>((resolve, reject) => {
        pendingRequest = { resolve, reject };
        const message: PorkchopWorkerInboundMessage = {
          type: 'compute-grid',
          bodyId,
          bodyElements,
          gridParams,
          M,
        };
        worker.postMessage(message);
      });
    },
    dispose() {
      disposed = true;
      if (pendingRequest !== null) {
        pendingRequest.reject(new Error('Porkchop client disposed while compute was in flight'));
        pendingRequest = null;
      }
      worker.terminate();
    },
  };
}
