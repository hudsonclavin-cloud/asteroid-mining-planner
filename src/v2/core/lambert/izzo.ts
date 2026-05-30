/**
 * Top-level Lambert solver — Izzo 2014.
 *
 * Computes the (v1, v2) velocity pair for a Keplerian transfer connecting
 * position r1 at the start to position r2 after time-of-flight tof,
 * under central gravity with parameter k (= GM of the central body).
 *
 * Reference: Izzo (2014), "Revisiting Lambert's Problem", arXiv:1403.2705
 * Implementation mirrors poliastro/core/iod.py:izzo()
 *
 * Returns a discriminated union:
 *   { ok: true, v1, v2, iterations, x }  on success
 *   { ok: false, reason }                on failure (no convergence)
 *
 * Slice 10 uses single-revolution only (M=0). Multi-rev support is in the
 * algorithm but not exposed at the top level for Slice 10.
 */

import type { Vec3 } from './vec3.js';
import { add, sub, scale, cross, norm } from './vec3.js';
import { compute_y } from './tof.js';
import { initial_guess_single_rev } from './initial-guess.js';
import { householder } from './householder.js';

export interface LambertSuccess {
    ok: true;
    v1: Vec3;
    v2: Vec3;
    iterations: number;
    x: number;
}

export interface LambertFailure {
    ok: false;
    reason: 'no_convergence' | 'invalid_geometry' | 'multi_rev_not_supported';
}

export type LambertResult = LambertSuccess | LambertFailure;

export interface LambertOptions {
    M?: number;
    prograde?: boolean;
    rtol?: number;
    max_iter?: number;
}

/**
 * Solve Lambert's problem.
 *
 * @param k     gravitational parameter (km^3/s^2 for Earth orbits, km^3/s^2 of Sun for heliocentric)
 * @param r1    position vector at t=0 (km)
 * @param r2    position vector at t=tof (km)
 * @param tof   time of flight (seconds)
 * @param opts  optional parameters
 */
export function lambert(
    k: number,
    r1: Vec3,
    r2: Vec3,
    tof: number,
    opts: LambertOptions = {}
): LambertResult {
    const M = opts.M ?? 0;
    const prograde = opts.prograde ?? true;
    const rtol = opts.rtol ?? 1e-8;
    const max_iter = opts.max_iter ?? 35;

    // Slice 10 supports single-revolution transfers only (DEC-2).
    // Multi-rev support (M >= 1) is deferred to Slice 11+. The lower-layer code
    // (initial-guess multi-rev branch, tof multi-rev terms, householder) is partially
    // implemented but not end-to-end validated. Rejecting M !== 0 here prevents
    // footgun usage while preserving the lower-layer code for future Slice 11 work.
    if (M !== 0) {
        return {
            ok: false,
            reason: 'multi_rev_not_supported',
        };
    }

    const c = sub(r2, r1);
    const c_norm = norm(c);
    const r1_norm = norm(r1);
    const r2_norm = norm(r2);
    const s = 0.5 * (r1_norm + r2_norm + c_norm);

    if (r1_norm === 0 || r2_norm === 0 || c_norm === 0) {
        return { ok: false, reason: 'invalid_geometry' };
    }

    const i_r1: Vec3 = scale(r1, 1 / r1_norm);
    const i_r2: Vec3 = scale(r2, 1 / r2_norm);
    let i_h = cross(i_r1, i_r2);
    const i_h_norm = norm(i_h);
    if (i_h_norm === 0) {
        return { ok: false, reason: 'invalid_geometry' };
    }
    i_h = scale(i_h, 1 / i_h_norm);

    let lam = Math.sqrt(1 - Math.min(1.0, c_norm / s));

    let i_t1: Vec3;
    let i_t2: Vec3;
    if (i_h[2] < 0) {
        lam = -lam;
        i_t1 = cross(i_r1, i_h);
        i_t2 = cross(i_r2, i_h);
    } else {
        i_t1 = cross(i_h, i_r1);
        i_t2 = cross(i_h, i_r2);
    }

    if (!prograde) {
        lam = -lam;
        i_t1 = scale(i_t1, -1);
        i_t2 = scale(i_t2, -1);
    }

    const T_star = Math.sqrt((2 * k) / (s * s * s)) * tof;

    const x_0 = initial_guess_single_rev(T_star, lam);
    const result = householder(x_0, T_star, lam, M, rtol, max_iter);
    if (!result.ok) {
        return { ok: false, reason: 'no_convergence' };
    }
    const x = result.x;

    const y = compute_y(x, lam);
    const gamma = Math.sqrt((k * s) / 2);
    const rho = (r1_norm - r2_norm) / c_norm;
    const sigma = Math.sqrt(1 - rho * rho);

    const V_r1 = (gamma * ((lam * y - x) - rho * (lam * y + x))) / r1_norm;
    const V_r2 = (-gamma * ((lam * y - x) + rho * (lam * y + x))) / r2_norm;
    const V_t1 = (gamma * sigma * (y + lam * x)) / r1_norm;
    const V_t2 = (gamma * sigma * (y + lam * x)) / r2_norm;

    const v1: Vec3 = add(scale(i_r1, V_r1), scale(i_t1, V_t1));
    const v2: Vec3 = add(scale(i_r2, V_r2), scale(i_t2, V_t2));

    return { ok: true, v1, v2, iterations: result.iterations, x };
}
