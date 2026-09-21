/** Front C fidelity-tier assignments, loaded from the committed per-body artifact. */
export type FidelityTier = 'L0' | 'L1' | 'L2';

/** S18 Item 5/6: the CAD close approach that makes an L1 body's tier material. */
export interface TierEncounter {
  /** Close-approach epoch, Julian date (TDB), as CAD reports it. */
  readonly jd: number;
  /** CAD calendar date string, e.g. '2029-Apr-13 21:46'. */
  readonly cd: string;
  /** Perturbing body, e.g. 'Earth'. */
  readonly body: string;
  /** Estimated deflection δv = 2·v·sin(θ/2), km/s. */
  readonly dvKmS: number;
}

export interface TierAssignment {
  readonly des: string;
  readonly tier: FidelityTier;
  readonly subReason: string;
  readonly classification: string;
  /** Aphelion, AU (3 dp), as the artifact records it. */
  readonly Q?: number;
  /** Eccentricity (4 dp), as the artifact records it. */
  readonly e?: number;
  /** L0 impactors only: the Horizons termination epoch, verbatim TDB string. */
  readonly terminationTdb?: string;
  /** L0 3D/Biela only: two-body drift on the screening window's first day, km. */
  readonly firstDayDriftKm?: number;
  /** L1 only: the encounter behind the tier. */
  readonly encounter?: TierEncounter;
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
