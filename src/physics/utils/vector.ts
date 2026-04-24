// ─── Vector helpers ──────────────────────────────────────────────────────────
export function mag(v: number[]): number { return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); }
export function dot(a: number[], b: number[]): number { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
export function cross(a: number[], b: number[]): number[] { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
export function vscale(v: number[], s: number): number[] { return [v[0]*s, v[1]*s, v[2]*s]; }
export function vsub(a: number[], b: number[]): number[] { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
