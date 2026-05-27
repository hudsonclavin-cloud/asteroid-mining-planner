/**
 * Initial guess for the Householder iteration in Izzo's Lambert solver.
 *
 * Reference: Izzo (2014), "Revisiting Lambert's Problem", arXiv:1403.2705
 *   - Single revolution: Section 3, Eq. 30
 *   - Multi-revolution: Eq. 31
 *
 * The piecewise structure for M=0 reflects the three regimes of T(x):
 *   - T >= T_0:    long-flight elliptic branch (x < 0 region)
 *   - T_1 < T < T_0: intermediate, log-interpolated branch
 *   - T <= T_1:    short-flight hyperbolic branch (x > 0 region)
 *
 * For M >= 1, two branches always exist: lower (short-path) and upper
 * (long-path), reflecting the multi-rev T(x) curve's two solutions for
 * a given (T, lambda, M).
 *
 * Returns:
 *   single revolution (M=0): the scalar x_0
 *   multi-revolution (M>=1): {x_0l, x_0r} discriminated by the branch
 */

/**
 * Single-revolution initial guess. Returns x_0.
 *
 * @param T   non-dimensional time of flight (must be > 0)
 * @param lam lambda parameter
 */
export function initial_guess_single_rev(T: number, lam: number): number {
    const T_0 = Math.acos(lam) + lam * Math.sqrt(1 - lam * lam);
    const T_1 = (2 / 3) * (1 - lam * lam * lam);

    if (T >= T_0) {
        return Math.pow(T_0 / T, 2 / 3) - 1;
    } else if (T <= T_1) {
        return ((2.5 * T_1) / T) * ((T_1 - T) / (1 - Math.pow(lam, 5))) + 1;
    } else {
        return Math.pow(T_0 / T, Math.log2(T_1 / T_0)) - 1;
    }
}

/**
 * Multi-revolution initial guess. Returns both branches {x_0l, x_0r}.
 *
 * @param T   non-dimensional time of flight (must be > 0)
 * @param lam lambda parameter
 * @param M   revolution count (must be >= 1)
 */
export function initial_guess_multi_rev(
    T: number,
    lam: number,
    M: number
): { x_0l: number; x_0r: number } {
    const lowerBase = Math.pow((M * Math.PI + Math.PI) / (8 * T), 2 / 3);
    const x_0l = (lowerBase - 1) / (lowerBase + 1);

    const upperBase = Math.pow((8 * T) / (M * Math.PI), 2 / 3);
    const x_0r = (upperBase - 1) / (upperBase + 1);

    return { x_0l, x_0r };
}
