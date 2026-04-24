import { asteroids } from '../../../physics/constants/index.js';
import { propagatePlanet, propagateAsteroid } from '../../../physics/propagation/planets.js';

export function handlePropagate(msg: any): void {
  const jd = msg.jd;
  const N = asteroids.length;
  const total = (8 + N) * 3;
  const buf = new Float32Array(total);

  for (let i = 0; i < 8; i++) {
    const pos = propagatePlanet(i, jd);
    buf[i*3]   = pos.x;
    buf[i*3+1] = pos.y;
    buf[i*3+2] = pos.z;
  }

  const base = 24;
  for (let i = 0; i < N; i++) {
    try {
      const pos = propagateAsteroid(asteroids[i], jd);
      buf[base+i*3]   = pos.x;
      buf[base+i*3+1] = pos.y;
      buf[base+i*3+2] = pos.z;
    } catch(_) {
      buf[base+i*3]   = 0;
      buf[base+i*3+1] = 0;
      buf[base+i*3+2] = 0;
    }
  }

  (self as any).postMessage({ type: 'positions', jd, buffer: buf }, [buf.buffer]);
}
