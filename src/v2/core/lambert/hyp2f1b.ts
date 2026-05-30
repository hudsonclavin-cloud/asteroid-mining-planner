/**
 * Compute the Gauss hypergeometric function 2F1(3, 1; 5/2; x) via series expansion.
 *
 * DOMAIN: x ∈ [0, 0.5]. The function 2F1(3, 1; 5/2; x) is mathematically defined
 * for x ∈ [0, 1), but this implementation uses a raw truncated series (MAX_ITER = 1000)
 * with no near-1 transformation. The series converges slowly as x → 1, and outside
 * the documented domain its precision degrades materially before becoming severe near 1.
 *
 * USAGE: This helper is called by the Izzo Lambert iteration (src/v2/core/lambert/tof.ts)
 * with arguments in the range x ≈ S_1 ∈ [0, ~0.4], well within the safe domain.
 *
 * If a future caller needs accurate evaluation near x → 1, this helper will need to
 * be extended with a Pfaff or Euler transformation. Do not use this helper outside
 * the documented [0, 0.5] domain without that work.
 *
 * Reference: NIST DLMF §15.2.1 for the series definition.
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
