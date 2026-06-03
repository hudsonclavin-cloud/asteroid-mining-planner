import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadLambertMultiRev(tempOutDir) {
  const { add, sub, scale, cross, norm } = await import(
    pathToFileURL(path.join(tempOutDir, 'core/lambert/vec3.js')).href
  );
  const { compute_y } = await import(pathToFileURL(path.join(tempOutDir, 'core/lambert/tof.js')).href);
  const { initial_guess_multi_rev } = await import(
    pathToFileURL(path.join(tempOutDir, 'core/lambert/initial-guess.js')).href
  );
  const { householder } = await import(
    pathToFileURL(path.join(tempOutDir, 'core/lambert/householder.js')).href
  );

  function solveBranch({ k, r1, r2, tof, M, prograde, rtol, maxIter, branch }) {
    const c = sub(r2, r1);
    const cNorm = norm(c);
    const r1Norm = norm(r1);
    const r2Norm = norm(r2);
    const s = 0.5 * (r1Norm + r2Norm + cNorm);

    if (r1Norm === 0 || r2Norm === 0 || cNorm === 0) {
      return { ok: false, reason: 'invalid_geometry', branch };
    }

    const iR1 = scale(r1, 1 / r1Norm);
    const iR2 = scale(r2, 1 / r2Norm);
    let iH = cross(iR1, iR2);
    const iHNorm = norm(iH);
    if (iHNorm === 0) {
      return { ok: false, reason: 'invalid_geometry', branch };
    }
    iH = scale(iH, 1 / iHNorm);

    let lam = Math.sqrt(1 - Math.min(1, cNorm / s));
    let iT1;
    let iT2;

    if (iH[2] < 0) {
      lam = -lam;
      iT1 = cross(iR1, iH);
      iT2 = cross(iR2, iH);
    } else {
      iT1 = cross(iH, iR1);
      iT2 = cross(iH, iR2);
    }

    if (!prograde) {
      lam = -lam;
      iT1 = scale(iT1, -1);
      iT2 = scale(iT2, -1);
    }

    const tStar = Math.sqrt((2 * k) / (s * s * s)) * tof;
    const guess = initial_guess_multi_rev(tStar, lam, M);
    const x0 = branch === 'left' ? guess.x_0l : guess.x_0r;
    const result = householder(x0, tStar, lam, M, rtol, maxIter);
    if (!result.ok) {
      return { ok: false, reason: result.reason ?? 'no_convergence', branch };
    }

    const x = result.x;
    const y = compute_y(x, lam);
    if (!Number.isFinite(y)) {
      return { ok: false, reason: 'invalid_geometry', branch };
    }

    const gamma = Math.sqrt((k * s) / 2);
    const rho = (r1Norm - r2Norm) / cNorm;
    const sigma = Math.sqrt(1 - rho * rho);

    const vr1 = (gamma * ((lam * y - x) - rho * (lam * y + x))) / r1Norm;
    const vr2 = (-gamma * ((lam * y - x) + rho * (lam * y + x))) / r2Norm;
    const vt1 = (gamma * sigma * (y + lam * x)) / r1Norm;
    const vt2 = (gamma * sigma * (y + lam * x)) / r2Norm;

    const v1 = add(scale(iR1, vr1), scale(iT1, vt1));
    const v2 = add(scale(iR2, vr2), scale(iT2, vt2));

    return {
      ok: true,
      branch,
      v1,
      v2,
      iterations: result.iterations,
      x,
    };
  }

  return function lambertMultiRev(
    k,
    r1,
    r2,
    tof,
    options = {},
  ) {
    const M = options.M ?? 1;
    const prograde = options.prograde ?? true;
    const rtol = options.rtol ?? 1e-8;
    const maxIter = options.max_iter ?? 35;

    if (M < 1) {
      throw new RangeError('lambertMultiRev expects M >= 1');
    }

    const left = solveBranch({ k, r1, r2, tof, M, prograde, rtol, maxIter, branch: 'left' });
    const right = solveBranch({ k, r1, r2, tof, M, prograde, rtol, maxIter, branch: 'right' });
    return { left, right };
  };
}
