import { propagateKeplerian } from './keplerian-offline.mjs';

function isOfflinePropagatable(entry) {
  return (
    Number.isFinite(entry.elements?.a) &&
    entry.elements.a > 0 &&
    Number.isFinite(entry.elements?.e) &&
    entry.elements.e >= 0 &&
    entry.elements.e < 1
  );
}

export function propagateSlice9Batch(bodies, targetJdTdb) {
  let checksumX = 0;
  let checksumY = 0;
  let checksumZ = 0;
  let fallbackBodyCount = 0;

  for (const body of bodies) {
    if (isOfflinePropagatable(body)) {
      const propagated = propagateKeplerian(body.elements, targetJdTdb);
      checksumX += propagated.position_km.x;
      checksumY += propagated.position_km.y;
      checksumZ += propagated.position_km.z;
      continue;
    }

    fallbackBodyCount += 1;
    checksumX += body.anchorPositionKm.x;
    checksumY += body.anchorPositionKm.y;
    checksumZ += body.anchorPositionKm.z;
  }

  return {
    totalBodies: bodies.length,
    fallbackBodyCount,
    checksumKm: {
      x: checksumX,
      y: checksumY,
      z: checksumZ,
    },
  };
}
