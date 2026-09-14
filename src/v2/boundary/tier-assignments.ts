/** Front C fidelity-tier assignments, loaded from the committed per-body artifact. */
export type FidelityTier = 'L0' | 'L1' | 'L2';

export interface TierAssignment {
  readonly des: string;
  readonly tier: FidelityTier;
  readonly subReason: string;
  readonly classification: string;
}

interface TierArtifact {
  readonly records: Record<string, TierAssignment>;
}

export const TIER_ASSIGNMENTS_URL = '/tier-sizing-per-body.json';

export async function loadTierAssignments(): Promise<ReadonlyMap<string, TierAssignment>> {
  const response = await fetch(TIER_ASSIGNMENTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to load fidelity tier assignments: ${response.status} ${response.statusText}`);
  }
  const artifact = (await response.json()) as TierArtifact;
  const entries = Object.entries(artifact.records ?? {});
  if (entries.length !== 41_906) {
    throw new Error(`Fidelity tier artifact count mismatch: expected 41906, got ${entries.length}`);
  }
  return new Map(entries);
}
