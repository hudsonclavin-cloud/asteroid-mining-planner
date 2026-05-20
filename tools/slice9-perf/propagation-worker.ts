import { propagateSlice9PerfBodies, type Slice9PerfBody } from './shared.js';

let bodies: readonly Slice9PerfBody[] = [];

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message !== 'object') {
    return;
  }

  if (message.type === 'init') {
    bodies = message.bodies;
    self.postMessage({
      type: 'ready',
      bodyCount: bodies.length,
    });
    return;
  }

  if (message.type === 'propagate') {
    const startedAt = performance.now();
    const batch = propagateSlice9PerfBodies(bodies, message.targetTdbSeconds);
    const finishedAt = performance.now();
    self.postMessage(
      {
        type: 'propagate-result',
        requestId: message.requestId,
        targetTdbSeconds: message.targetTdbSeconds,
        fallbackBodyCount: batch.fallbackBodyCount,
        computeDurationMs: finishedAt - startedAt,
        positionsM: batch.positionsM.buffer,
      },
      [batch.positionsM.buffer],
    );
  }
});
