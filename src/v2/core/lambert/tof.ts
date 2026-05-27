/**
 * Time-of-flight equation and derivatives for Izzo's Lambert solver.
 *
 * Reference: Izzo (2014), "Revisiting Lambert's Problem", arXiv:1403.2705
 * Equations 18, 20, 22.
 *
 * The non-dimensional time of flight is expressed as T(x) where x is the
 * Izzo new-variable. The Householder iteration solves T(x) - T* = 0 by
 * evaluating T(x) and its first, second, and third derivatives at each step.
 *
 * Two regimes for T(x):
 *   - General (psi-based): uses arccos or arcsinh depending on sign of (1-x²)
 *   - Near-parabolic (M=0, sqrt(0.6) < x < sqrt(1.4)): uses Gauss hypergeometric
 *     series to avoid catastrophic cancellation as x approaches 1.
 *
 * Derivatives follow Izzo Equation 22 verbatim.
 */

import { hyp2f1b } from './hyp2f1b.js';

const SQRT_0_6 = Math.sqrt(0.6);
const SQRT_1_4 = Math.sqrt(1.4);

/**
 * y = sqrt(1 - lambda² · (1 - x²))
 *
 * Returns NaN if the argument under the sqrt is negative (infeasible geometry).
 */
export function compute_y(x: number, lam: number): number {
    const arg = 1 - lam * lam * (1 - x * x);
    if (arg < 0) return NaN;
    return Math.sqrt(arg);
}

/**
 * Auxiliary psi angle used in the general T(x) formulation.
 *   For -1 <= x < 1 (elliptic): psi = acos(x*y + lambda*(1-x²))
 *   For x > 1 (hyperbolic):     psi = asinh((y - x*lambda) * sqrt(x²-1))
 *   At x = 1 exactly (parabolic): undefined — use the hypergeometric branch.
 */
function compute_psi(x: number, y: number, lam: number): number {
    if (x >= -1 && x < 1) {
        return Math.acos(x * y + lam * (1 - x * x));
    }
    if (x > 1) {
        return Math.asinh((y - x * lam) * Math.sqrt(x * x - 1));
    }
    return 0;
}

/**
 * T(x) - T0 in the Izzo non-dimensional formulation.
 *
 * Two branches:
 *   - M=0 and x in (sqrt(0.6), sqrt(1.4)): hypergeometric near-parabolic form
 *   - Otherwise: general psi-based form
 *
 * @param x        Izzo new-variable
 * @param y        precomputed compute_y(x, lambda)
 * @param T0       reference time (set to 0 to get raw T(x))
 * @param lam      lambda parameter (geometric ratio)
 * @param M        revolution count (M=0 is single-rev; M>=1 is multi-rev)
 */
export function tof_equation(x: number, y: number, T0: number, lam: number, M: number): number {
    let T: number;
    if (M === 0 && x > SQRT_0_6 && x < SQRT_1_4) {
        const eta = y - lam * x;
        const S_1 = (1 - lam - x * eta) * 0.5;
        const Q = (4 / 3) * hyp2f1b(S_1);
        T = (eta * eta * eta * Q + 4 * lam * eta) * 0.5;
    } else {
        const psi = compute_psi(x, y, lam);
        T = ((psi + M * Math.PI) / Math.sqrt(Math.abs(1 - x * x)) - x + lam * y) / (1 - x * x);
    }
    return T - T0;
}

/**
 * First derivative T'(x). Izzo Eq. 22a.
 */
export function tof_equation_p(x: number, y: number, T: number, lam: number): number {
    return (3 * T * x - 2 + (2 * lam * lam * lam * x) / y) / (1 - x * x);
}

/**
 * Second derivative T''(x). Izzo Eq. 22b.
 */
export function tof_equation_pp(x: number, y: number, T: number, dT: number, lam: number): number {
    return (3 * T + 5 * x * dT + (2 * (1 - lam * lam) * lam * lam * lam) / (y * y * y)) / (1 - x * x);
}

/**
 * Third derivative T'''(x). Izzo Eq. 22c.
 */
export function tof_equation_ppp(
    x: number,
    y: number,
    T: number,
    dT: number,
    ddT: number,
    lam: number
): number {
    return (
        (7 * x * ddT + 8 * dT - (6 * (1 - lam * lam) * lam ** 5 * x) / y ** 5) /
        (1 - x * x)
    );
}
