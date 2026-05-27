/**
 * Stumpff functions c2(psi) and c3(psi) used by Izzo's Lambert solver.
 *
 * For psi > 0 (elliptic case):
 *   c2(psi) = (1 - cos(sqrt(psi))) / psi
 *   c3(psi) = (sqrt(psi) - sin(sqrt(psi))) / psi^(3/2)
 *
 * For psi < 0 (hyperbolic case):
 *   c2(psi) = (1 - cosh(sqrt(-psi))) / psi
 *   c3(psi) = (sinh(sqrt(-psi)) - sqrt(-psi)) / (-psi)^(3/2)
 *
 * Near psi = 0, both formulas suffer catastrophic cancellation. We use
 * the Maclaurin series expansion in that regime:
 *   c2(psi) = 1/2 - psi/24 + psi^2/720 - psi^3/40320 + ...
 *   c3(psi) = 1/6 - psi/120 + psi^2/5040 - psi^3/362880 + ...
 *
 * The cutoff |psi| < 1e-6 is conservative; the series converges within
 * a few terms in that regime to better than 1e-16 relative error.
 */

const SERIES_CUTOFF = 1e-6;

export function stumpff_c2(psi: number): number {
    if (psi > SERIES_CUTOFF) {
        const sq = Math.sqrt(psi);
        return (1 - Math.cos(sq)) / psi;
    }
    if (psi < -SERIES_CUTOFF) {
        const sq = Math.sqrt(-psi);
        return (1 - Math.cosh(sq)) / psi;
    }
    return 0.5 - psi / 24 + (psi * psi) / 720 - (psi * psi * psi) / 40320;
}

export function stumpff_c3(psi: number): number {
    if (psi > SERIES_CUTOFF) {
        const sq = Math.sqrt(psi);
        return (sq - Math.sin(sq)) / (psi * sq);
    }
    if (psi < -SERIES_CUTOFF) {
        const sq = Math.sqrt(-psi);
        return (Math.sinh(sq) - sq) / (-psi * sq);
    }
    return 1 / 6 - psi / 120 + (psi * psi) / 5040 - (psi * psi * psi) / 362880;
}
