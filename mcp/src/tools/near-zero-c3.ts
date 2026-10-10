import {
  isNearZeroC3Degenerate,
  NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2,
} from '../../../src/v2/core/constants/near-zero-c3.js';

/** Structured MCP contract for every C3-bearing output. */
export interface NearZeroC3EnvelopeField {
  readonly degenerate: boolean;
  readonly thresholdKm2S2: number;
}

export function nearZeroC3EnvelopeField(c3: number | null): NearZeroC3EnvelopeField {
  return {
    degenerate: isNearZeroC3Degenerate(c3),
    thresholdKm2S2: NEAR_ZERO_C3_DEGENERACY_THRESHOLD_KM2_S2,
  };
}
