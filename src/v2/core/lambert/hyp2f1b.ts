/**
 * Gauss hypergeometric function 2F1(3, 1; 5/2; x).
 *
 * Used by Izzo's Lambert solver in the M=0 single-revolution case for
 * x in the range (sqrt(0.6), sqrt(1.4)) — see poliastro reference and
 * Izzo 2014 paper section 3.
 *
 * Computed by direct power series:
 *   2F1(a, b; c; x) = sum_{n=0}^{inf} ((a)_n * (b)_n / (c)_n) * x^n / n!
 *
 * For our specialized case 2F1(3, 1; 5/2; x):
 *   term_0 = 1
 *   term_{n+1} = term_n * (n + 3)(n + 1) / ((n + 5/2)(n + 1)) * x
 *             = term_n * (n + 3) / (n + 5/2) * x
 *
 * Series diverges for |x| >= 1. We require x < 1 (caller's responsibility).
 * For x close to 1, convergence is slow; we cap iterations at 1000 with
 * a relative-tolerance break.
 */

const MAX_ITER = 1000;
const RTOL = 1e-15;

export function hyp2f1b(x: number): number {
    if (x >= 1) {
        return Infinity;
    }
    let result = 1.0;
    let term = 1.0;
    for (let n = 0; n < MAX_ITER; n++) {
        term = term * ((n + 3) / (n + 2.5)) * x;
        const newResult = result + term;
        if (Math.abs(newResult - result) < RTOL * Math.abs(newResult)) {
            return newResult;
        }
        result = newResult;
    }
    return result;
}
