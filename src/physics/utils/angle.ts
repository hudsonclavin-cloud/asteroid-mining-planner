import { TWO_PI } from '../constants/index.js';

export function wrapToTwoPi(theta: number): number {
  let out = theta % TWO_PI;
  if (out < 0) out += TWO_PI;
  return out;
}
