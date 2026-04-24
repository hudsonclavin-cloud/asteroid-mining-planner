import { R_earth } from '../../../physics/constants/index.js';
import { propagatePlanet, propagateAsteroid, propagateElements } from '../../../physics/propagation/planets.js';
import { solveLambertWithOrbitGuard } from '../../../physics/orbital/lambert/solver.js';
import { patchedConic } from '../../../physics/orbital/patched-conic/index.js';

export function handlePorkchop(msg: any): void {
  const ast = msg.ast;
  const { jd_start, jd_end, tof_min, tof_max, nx, ny } = msg;
  const burnEl = msg.burn_elements || null;

  const grid = new Float32Array(nx * ny);

  for (let i = 0; i < nx; i++) {
    const t1 = jd_start + i / (nx - 1) * (jd_end - jd_start);
    let earth1: any;
    try {
      earth1 = propagatePlanet(2, t1);
    } catch(_) {
      for (let j = 0; j < ny; j++) grid[i*ny+j] = 20;
      continue;
    }
    const r1 = [earth1.x, earth1.y, earth1.z];
    const v_earth1 = [earth1.vx, earth1.vy, earth1.vz];

    for (let j = 0; j < ny; j++) {
      const tof = tof_min + j / (ny - 1) * (tof_max - tof_min);
      const t2 = t1 + tof;
      try {
        const ast2 = burnEl ? propagateElements(burnEl, t2) : propagateAsteroid(ast, t2);
        const r2 = [ast2.x, ast2.y, ast2.z];
        const v_ast2 = [ast2.vx, ast2.vy, ast2.vz];
        const solve = solveLambertWithOrbitGuard(r1, r2, tof, { x: earth1.x, y: earth1.y, z: earth1.z }, t1);
        const lam = solve.lam;
        if (!lam) { grid[i*ny+j] = 20; continue; }
        const pc = patchedConic(v_earth1, lam.v1, v_ast2, lam.v2, R_earth / 1000 + 400);
        if (!pc || !Number.isFinite(pc.dv_dep) || !Number.isFinite(pc.dv_arr)) { grid[i*ny+j] = 20; continue; }
        grid[i*ny+j] = Math.min(20, pc.dv_dep + pc.dv_arr);
      } catch(_) {
        grid[i*ny+j] = 20;
      }
    }
  }

  (self as any).postMessage({ type: 'porkchop', grid, nx, ny, jd_start, jd_end, tof_min, tof_max }, [grid.buffer]);
}
