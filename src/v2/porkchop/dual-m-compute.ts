import type { AsteroidOrbitalElements } from '../core/constants/asteroids.js';
import type { PorkchopGridParams } from './grid-compute.js';
import type { PorkchopClient } from './porkchop-client.js';
import type { PorkchopWorkerGridResultMessage } from './porkchop.worker.js';

/**
 * Dual-family (M=0 + M=1) compute path for the dedicated porkchop view.
 *
 * DEC-5 (`src/v2/SLICE_11_FOUNDING.md:105`) rules the dedicated view's "both"
 * state. AMD-1 (`:198`) rules the mechanism verbatim: "`M` is a single value per
 * message. "Both" display mode (DEC-5) issues two messages (M=0 and M=1); the
 * renderer composites."
 *
 * The two messages are issued SEQUENTIALLY, and deliberately so:
 *   - `PorkchopClient` enforces one in-flight compute per client
 *     (`porkchop-client.ts:99-101`, "Porkchop client already has a compute in
 *     flight"); that guard is left exactly as it is.
 *   - AMD-1's own budget sentence is sequential arithmetic: "The ~200 ms budget in
 *     DEC-8 already covers the two computes (~98 ms each)."
 *
 * The worker's message contract is untouched: one `M` per message, exactly as
 * AMD-1 states. This module adds no new message type and changes no existing one.
 */

/** Single-revolution family. Ruled by DEC-2 for the screening cache; here it is one of DEC-5's two display families. */
export const M_ZERO_REV = 0;

/** One-revolution family. The value the dedicated view currently ships as a fixed literal. */
export const M_ONE_REV = 1;

export interface DualFamilyGridRequest {
  readonly bodyId: string;
  readonly bodyElements: AsteroidOrbitalElements;
  readonly gridParams: PorkchopGridParams;
}

export interface DualFamilyGrids {
  readonly m0: PorkchopWorkerGridResultMessage;
  readonly m1: PorkchopWorkerGridResultMessage;
}

/**
 * Issue the two per-AMD-1 compute messages for one body/grid and hold both results.
 *
 * Order is M=0 then M=1, awaited one after the other. A failure in either compute
 * propagates to the caller unchanged — this layer adds no error policy of its own.
 */
export async function computeDualFamilyGrids(
  client: PorkchopClient,
  request: DualFamilyGridRequest,
): Promise<DualFamilyGrids> {
  const m0 = await client.computeGrid({
    bodyId: request.bodyId,
    bodyElements: request.bodyElements,
    gridParams: request.gridParams,
    M: M_ZERO_REV,
  });
  const m1 = await client.computeGrid({
    bodyId: request.bodyId,
    bodyElements: request.bodyElements,
    gridParams: request.gridParams,
    M: M_ONE_REV,
  });
  return { m0, m1 };
}
