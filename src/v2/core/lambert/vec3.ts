/**
 * 3-vector math for the Lambert solver.
 *
 * Aster v2 Lambert solver uses standalone scalar/3-vector operations
 * rather than depending on a matrix library. All operations are pure
 * functions on tuple types.
 */

export type Vec3 = readonly [number, number, number];

export function add(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function scale(a: Vec3, k: number): Vec3 {
    return [a[0] * k, a[1] * k, a[2] * k];
}

export function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a: Vec3, b: Vec3): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

export function norm(a: Vec3): number {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}

export function normalize(a: Vec3): Vec3 {
    const n = norm(a);
    if (n === 0) {
        throw new Error("Cannot normalize zero vector");
    }
    return [a[0] / n, a[1] / n, a[2] / n];
}
