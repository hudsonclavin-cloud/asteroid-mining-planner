/**
 * Feature flags for scaffolded, not-yet-shipped capabilities.
 *
 * Honesty layer: every flag here defaults to OFF. A flag that is off means the
 * capability contributes nothing to any rendered page; nothing in src/v2/app
 * reads these flags yet, so turning one on here changes nothing until a slice
 * wires it. Each flag names the founding-doc decision that may turn it on.
 */
export interface FeatureFlags {
  /** Low-thrust (ion-only) propagation scaffold — src/v2/lowthrust. Slice 21 DRAFT, OQ-21-2. */
  readonly LOW_THRUST_ENABLED: boolean;
  /** Live orbital-element sources — src/v2/livedata. Slice 21 DRAFT, OQ-21-4. */
  readonly LIVE_DATA_ENABLED: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = Object.freeze({
  LOW_THRUST_ENABLED: false,
  LIVE_DATA_ENABLED: false,
});

export type FeatureFlagName = keyof FeatureFlags;

export function isFlagEnabled(flag: FeatureFlagName): boolean {
  return FEATURE_FLAGS[flag] === true;
}

export function listFlags(): ReadonlyArray<{ readonly name: FeatureFlagName; readonly enabled: boolean }> {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).map((name) => ({
    name,
    enabled: FEATURE_FLAGS[name],
  }));
}
