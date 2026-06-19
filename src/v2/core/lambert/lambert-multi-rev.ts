import type { Vec3 } from './vec3.js';
import { add, cross, norm, scale, sub } from './vec3.js';
import { initial_guess_single_rev } from './initial-guess.js';
import { householder } from './householder.js';
import { compute_y, tof_equation, tof_equation_p, tof_equation_pp, tof_equation_ppp } from './tof.js';

const RTOL = 1e-8;
const MAX_ITER = 50;
const EPSILON = 1e-12;
// Dispatch 37.5 measured hyp2f1b relative error <= 1e-9 through x^2 = 0.95.
// We fail closed above x^2 = 0.90 to leave margin below the unmeasured 0.95->0.99 region.
const MULTI_REV_X_SQUARED_LIMIT = 0.90;

type BranchName = 'left' | 'right';

type Geometry = {
    lambda: number;
    iR1: Vec3;
    iR2: Vec3;
    iT1: Vec3;
    iT2: Vec3;
    r1Mag: number;
    r2Mag: number;
    cMag: number;
    s: number;
};

type BranchSolveResult = {
    x: number;
    converged: boolean;
};

export interface MultiRevBranch {
    v1: Vec3;
    v2: Vec3;
    converged: boolean;
    branch: 'single' | 'left' | 'right';
    x: number;
}

export interface MultiRevResult {
    branches: MultiRevBranch[];
    M: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function buildGeometry(r1: Vec3, r2: Vec3, prograde: boolean): Geometry | null {
    const c = sub(r2, r1);
    const cMag = norm(c);
    const r1Mag = norm(r1);
    const r2Mag = norm(r2);
    const s = 0.5 * (r1Mag + r2Mag + cMag);

    if (r1Mag === 0 || r2Mag === 0 || cMag === 0) {
        return null;
    }

    const iR1: Vec3 = scale(r1, 1 / r1Mag);
    const iR2: Vec3 = scale(r2, 1 / r2Mag);
    let iH = cross(iR1, iR2);
    const iHMag = norm(iH);
    if (iHMag === 0) {
        return null;
    }
    iH = scale(iH, 1 / iHMag);

    let lambda = Math.sqrt(1 - Math.min(1, cMag / s));
    let iT1: Vec3;
    let iT2: Vec3;

    if (iH[2] < 0) {
        lambda = -lambda;
        iT1 = cross(iR1, iH);
        iT2 = cross(iR2, iH);
    } else {
        iT1 = cross(iH, iR1);
        iT2 = cross(iH, iR2);
    }

    if (!prograde) {
        lambda = -lambda;
        iT1 = scale(iT1, -1);
        iT2 = scale(iT2, -1);
    }

    return { lambda, iR1, iR2, iT1, iT2, r1Mag, r2Mag, cMag, s };
}

function normalizedTof(mu: number, s: number, tof: number): number {
    return Math.sqrt((2 * mu) / (s * s * s)) * tof;
}

function initialGuessMultiRev(T: number, M: number, branch: BranchName): number {
    const leftBase = Math.pow(((M + 1) * Math.PI) / (8 * T), 2 / 3);
    const rightBase = Math.pow((8 * T) / (M * Math.PI), 2 / 3);
    const x0Left = (leftBase - 1) / (leftBase + 1);
    const x0Right = (rightBase - 1) / (rightBase + 1);

    if (branch === 'left') {
        return clamp(x0Left, -1 + EPSILON, -EPSILON);
    }
    return clamp(x0Right, EPSILON, 1 - EPSILON);
}

function halleyForTMin(lambda: number, M: number): number | null {
    let x = 0.1;

    for (let iter = 0; iter < MAX_ITER; iter += 1) {
        const y = compute_y(x, lambda);
        if (!Number.isFinite(y) || y === 0) {
            return null;
        }

        const TAtX = tof_equation(x, y, 0, lambda, M);
        const fPrime = tof_equation_p(x, y, TAtX, lambda);
        const fDoublePrime = tof_equation_pp(x, y, TAtX, fPrime, lambda);
        if (!Number.isFinite(fPrime) || !Number.isFinite(fDoublePrime) || fDoublePrime === 0) {
            return null;
        }
        const fTriplePrime = tof_equation_ppp(x, y, TAtX, fPrime, fDoublePrime, lambda);
        const denominator = 2 * fDoublePrime * fDoublePrime - fPrime * fTriplePrime;
        if (!Number.isFinite(fTriplePrime) || !Number.isFinite(denominator) || denominator === 0) {
            return null;
        }

        const next = clamp(x - (2 * fPrime * fDoublePrime) / denominator, -1 + EPSILON, 1 - EPSILON);
        if (Math.abs(next - x) < RTOL) {
            return next;
        }
        x = next;
    }

    return null;
}

export function tMinForM(lambda: number, M: number): number | null {
    if (M === 0) {
        return 0;
    }

    const xAtMinimum = halleyForTMin(lambda, M);
    if (xAtMinimum === null) {
        return null;
    }

    const yAtMinimum = compute_y(xAtMinimum, lambda);
    if (!Number.isFinite(yAtMinimum)) {
        return null;
    }

    return tof_equation(xAtMinimum, yAtMinimum, 0, lambda, M);
}

function solveOneBranch(lambda: number, T: number, M: number, branch: BranchName): BranchSolveResult {
    let x = initialGuessMultiRev(T, M, branch);

    for (let iter = 0; iter < MAX_ITER; iter += 1) {
        if (x * x > MULTI_REV_X_SQUARED_LIMIT) {
            return { x, converged: false };
        }

        const y = compute_y(x, lambda);
        if (!Number.isFinite(y) || y === 0) {
            return { x, converged: false };
        }

        const fValue = tof_equation(x, y, T, lambda, M);
        const TAtX = T + fValue;
        const fPrime = tof_equation_p(x, y, TAtX, lambda);
        const fDoublePrime = tof_equation_pp(x, y, TAtX, fPrime, lambda);
        const fTriplePrime = tof_equation_ppp(x, y, TAtX, fPrime, fDoublePrime, lambda);
        const numerator = fValue * (fPrime * fPrime - (fValue * fDoublePrime) / 2);
        const denominator =
            fPrime * (fPrime * fPrime - fValue * fDoublePrime) + (fTriplePrime * fValue * fValue) / 6;

        if (
            !Number.isFinite(fValue) ||
            !Number.isFinite(fPrime) ||
            !Number.isFinite(fDoublePrime) ||
            !Number.isFinite(fTriplePrime) ||
            !Number.isFinite(numerator) ||
            !Number.isFinite(denominator) ||
            denominator === 0
        ) {
            return { x, converged: false };
        }

        const next = clamp(x - numerator / denominator, -1 + EPSILON, 1 - EPSILON);
        if (!Number.isFinite(next)) {
            return { x, converged: false };
        }
        if (next * next > MULTI_REV_X_SQUARED_LIMIT) {
            return { x: next, converged: false };
        }
        if (Math.abs(next - x) < RTOL) {
            return { x: next, converged: true };
        }

        x = next;
    }

    return { x, converged: false };
}

function velocityFromX(
    x: number,
    lambda: number,
    r1Mag: number,
    r2Mag: number,
    cMag: number,
    s: number,
    iR1: Vec3,
    iR2: Vec3,
    iT1: Vec3,
    iT2: Vec3,
    mu: number
): { v1: Vec3; v2: Vec3 } | null {
    const y = compute_y(x, lambda);
    if (!Number.isFinite(y)) {
        return null;
    }

    const gamma = Math.sqrt((mu * s) / 2);
    const rho = (r1Mag - r2Mag) / cMag;
    const sigmaSq = 1 - rho * rho;
    if (sigmaSq < 0) {
        return null;
    }
    const sigma = Math.sqrt(sigmaSq);

    const radial1 = (gamma * ((lambda * y - x) - rho * (lambda * y + x))) / r1Mag;
    const radial2 = (-gamma * ((lambda * y - x) + rho * (lambda * y + x))) / r2Mag;
    const tangential1 = (gamma * sigma * (y + lambda * x)) / r1Mag;
    const tangential2 = (gamma * sigma * (y + lambda * x)) / r2Mag;

    const v1 = add(scale(iR1, radial1), scale(iT1, tangential1));
    const v2 = add(scale(iR2, radial2), scale(iT2, tangential2));
    return { v1, v2 };
}

function makeBranch(
    x: number,
    converged: boolean,
    branch: 'single' | BranchName,
    geometry: Geometry,
    mu: number
): MultiRevBranch | null {
    const velocities = velocityFromX(
        x,
        geometry.lambda,
        geometry.r1Mag,
        geometry.r2Mag,
        geometry.cMag,
        geometry.s,
        geometry.iR1,
        geometry.iR2,
        geometry.iT1,
        geometry.iT2,
        mu
    );
    if (velocities === null) {
        return null;
    }

    return {
        ...velocities,
        converged,
        branch,
        x,
    };
}

export function lambertMultiRev(
    r1: Vec3,
    r2: Vec3,
    tof: number,
    mu: number,
    M: number,
    lw: boolean
): MultiRevResult | null {
    if (!Number.isInteger(M) || M < 0 || M > 2) {
        throw new RangeError('lambertMultiRev expects integer M in {0, 1, 2}');
    }
    if (!(tof > 0) || !(mu > 0)) {
        return null;
    }

    const geometry = buildGeometry(r1, r2, lw);
    if (geometry === null) {
        return null;
    }

    const T = normalizedTof(mu, geometry.s, tof);

    if (M === 0) {
        const x0 = initial_guess_single_rev(T, geometry.lambda);
        const solved = householder(x0, T, geometry.lambda, 0, RTOL, MAX_ITER);
        if (!solved.ok) {
            return null;
        }

        const branch = makeBranch(solved.x, true, 'single', geometry, mu);
        if (branch === null) {
            return null;
        }
        return {
            branches: [branch],
            M,
        };
    }

    const TMin = tMinForM(geometry.lambda, M);
    if (TMin === null) {
        return null;
    }
    if (T < TMin) {
        console.debug(`lambertMultiRev: no solution for M=${M}; T=${T} < T_min=${TMin}`);
        return null;
    }

    const left = solveOneBranch(geometry.lambda, T, M, 'left');
    const right = solveOneBranch(geometry.lambda, T, M, 'right');

    const branches = [
        makeBranch(left.x, left.converged, 'left', geometry, mu),
        makeBranch(right.x, right.converged, 'right', geometry, mu),
    ].filter((branch): branch is MultiRevBranch => branch !== null);

    if (branches.length === 0) {
        return null;
    }
    return { branches, M };
}
