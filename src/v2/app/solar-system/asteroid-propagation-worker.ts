import { propagateKeplerianStateVectors } from '../../core/propagators/keplerian.js';
import type { Slice9RuntimePropagationBody } from './slice9-runtime-asteroids.js';

let bodies: readonly Slice9RuntimePropagationBody[] = [];

function isEllipticBody(body: Slice9RuntimePropagationBody): boolean {
  return (
    Number.isFinite(body.elements.aM) &&
    body.elements.aM > 0 &&
    Number.isFinite(body.elements.e) &&
    body.elements.e >= 0 &&
    body.elements.e < 1
  );
}

self.addEventListener('message', (event) => {
  const message = event.data;
  if (!message || typeof message !== 'object') {
    return;
  }

  if (message.type === 'init') {
    bodies = message.bodies as readonly Slice9RuntimePropagationBody[];
    self.postMessage({ type: 'ready', bodyCount: bodies.length });
    return;
  }

  if (message.type === 'propagate') {
    const targetTdbSeconds = Number(message.targetTdbSeconds);
    const positionsM = new Float64Array(bodies.length * 3);

    for (let bodyIndex = 0; bodyIndex < bodies.length; bodyIndex += 1) {
      const body = bodies[bodyIndex];
      const offset = bodyIndex * 3;
      if (isEllipticBody(body)) {
        const propagated = propagateKeplerianStateVectors(body.elements, targetTdbSeconds, {
          radiusM: body.renderRadiusM,
        });
        positionsM[offset] = propagated.positionM.x;
        positionsM[offset + 1] = propagated.positionM.y;
        positionsM[offset + 2] = propagated.positionM.z;
      } else {
        positionsM[offset] = body.anchorPositionM[0];
        positionsM[offset + 1] = body.anchorPositionM[1];
        positionsM[offset + 2] = body.anchorPositionM[2];
      }
    }

    self.postMessage(
      {
        type: 'propagate-result',
        requestId: message.requestId,
        targetTdbSeconds,
        positionsM: positionsM.buffer,
      },
      [positionsM.buffer],
    );
  }
});
