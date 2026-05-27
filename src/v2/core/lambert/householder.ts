/**
 * Householder iteration (third-order) for solving T(x) - T_star = 0.
 *
 * Reference: Izzo (2014), "Revisiting Lambert's Problem", arXiv:1403.2705 Eq. (24)
 * Mirrors: poliastro/core/iod.py householder()
 *
 * The iteration formula:
 *   delta = f * (f'^2 - f * f'' / 2) / (f' * (f'^2 - f * f'') + f''' * f^2 / 6)
 *   x_{n+1} = x_n - delta
 *
 * Where f = T(x) - T_star, and f', f'', f''' are derivatives of T (NOT of f).
 * The derivative functions defined in tof.ts take T(x) — not f(x) — as input,
 * so at each iteration we compute T_at_x = T_star + fval and pass that.
 *
 * Converges in ~2-5 iterations for the single-rev case from a good initial guess.
 */

import { compute_y, tof_equation, tof_equation_p, tof_equation_pp, tof_equation_ppp } from './tof.js';

export interface HouseholderResult {
    ok: boolean;
    x: number;
    iterations: number;
    reason?: 'no_convergence';
}

/**
 * Iterate to find x such that T(x) = T_star.
 *
 * @param x_0       starting guess for x (typically from initial_guess_single_rev or _multi_rev)
 * @param T_star    target non-dimensional time of flight
 * @param lam       lambda parameter
 * @param M         revolution count (0 for single-rev)
 * @param rtol      convergence tolerance on |delta|
 * @param max_iter  maximum iterations before giving up
 */
export function householder(
    x_0: number,
    T_star: number,
    lam: number,
    M: number,
    rtol: number,
    max_iter: number
): HouseholderResult {
    let x = x_0;
    for (let iter = 1; iter <= max_iter; iter++) {
        const y = compute_y(x, lam);
        const fval = tof_equation(x, y, T_star, lam, M);
        const T_at_x = T_star + fval;
        const fder = tof_equation_p(x, y, T_at_x, lam);
        const fder2 = tof_equation_pp(x, y, T_at_x, fder, lam);
        const fder3 = tof_equation_ppp(x, y, T_at_x, fder, fder2, lam);

        const numerator = fval * (fder * fder - (fval * fder2) / 2);
        const denominator = fder * (fder * fder - fval * fder2) + (fder3 * fval * fval) / 6;
        const delta = numerator / denominator;
        x = x - delta;

        if (Math.abs(delta) < rtol) {
            return { ok: true, x, iterations: iter };
        }
    }
    return { ok: false, x, iterations: max_iter, reason: 'no_convergence' };
}
