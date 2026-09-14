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

const TIER_FILENAME = 'tier-sizing-per-body.json';

function resolveTierAssignmentsUrl(): string {
  const base = (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL) || '/';
  return base.endsWith('/') ? `${base}${TIER_FILENAME}` : `${base}/${TIER_FILENAME}`;
}

export async function loadTierAssignments(): Promise<ReadonlyMap<string, TierAssignment>> {
  const url = resolveTierAssignmentsUrl();
  const response = await fetch(url);
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
