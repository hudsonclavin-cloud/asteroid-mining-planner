// Stumpff functions C(z) and S(z) for Lambert solver
export function stumpff(z: number): [number, number] {
  if (z > 1e-6) {
    const sq = Math.sqrt(z);
    return [(1 - Math.cos(sq)) / z, (sq - Math.sin(sq)) / (sq * sq * sq)];
  }
  if (z < -1e-6) {
    const sq = Math.sqrt(-z);
    return [(1 - Math.cosh(sq)) / z, (Math.sinh(sq) - sq) / (sq * sq * sq)];
  }
  return [0.5, 1/6];
}
