import { parentPort, workerData } from 'node:worker_threads';

import { propagateSlice9Batch } from './slice9-node-propagation-batch.mjs';

const { bodies } = workerData;

if (!parentPort) {
  throw new Error('slice9-node-propagation-worker requires parentPort');
}

parentPort.on('message', (message) => {
  if (!message || typeof message !== 'object') {
    return;
  }

  if (message.type === 'measure') {
    const start = process.hrtime.bigint();
    const summary = propagateSlice9Batch(bodies, message.targetJdTdb);
    const end = process.hrtime.bigint();
    parentPort.postMessage({
      type: 'measure-result',
      runLabel: message.runLabel ?? null,
      computeDurationMs: Number(end - start) / 1e6,
      ...summary,
    });
    return;
  }

  if (message.type === 'shutdown') {
    process.exit(0);
  }
});
