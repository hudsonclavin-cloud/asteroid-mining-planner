import { SPEED_OF_LIGHT_M_PER_S } from '../../core/constants/physical.js';

const ASTRONOMICAL_UNIT_M = 149_597_870_700;

export type LightTimeStatus = 'ok' | 'prop-fail' | 'no-selection';
export type LightTimeTier = 'L0' | 'L1' | 'L2' | null;

export interface LightTimeValue {
  readonly kind: 'value';
  readonly seconds: number;
  readonly distanceAu: number;
  readonly caveat: string | null;
  readonly text: string;
}

export interface LightTimeRefusal {
  readonly kind: 'refusal';
  readonly reason: 'L0' | 'PROP FAIL' | 'non-finite distance' | 'no selection' | 'invalid distance';
  readonly text: string;
}

export type LightTimeReadout = LightTimeValue | LightTimeRefusal;

function formatTwoSignificantFigures(value: number): string {
  return value.toPrecision(2);
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${Number(formatTwoSignificantFigures(seconds))} s`;
  }
  return `${formatTwoSignificantFigures(seconds / 60)} min`;
}

function inheritedTierCaveat(tier: Exclude<LightTimeTier, 'L0' | null>): string {
  return tier === 'L1'
    ? 'Fidelity tier L1 applies; a close-approach support boundary may invalidate later positions.'
    : 'Fidelity tier L2 applies; screening error is not measured or certified.';
}

function refusal(reason: LightTimeRefusal['reason']): LightTimeRefusal {
  return { kind: 'refusal', reason, text: `Light time: — (${reason})` };
}

export function buildLightTimeReadout(
  distanceM: number | null,
  tier: LightTimeTier,
  status: LightTimeStatus,
): LightTimeReadout {
  if (status === 'no-selection') {
    return refusal('no selection');
  }
  if (status === 'prop-fail') {
    return refusal('PROP FAIL');
  }
  if (tier === 'L0') {
    return refusal('L0');
  }
  if (distanceM === null || !Number.isFinite(distanceM)) {
    return refusal('non-finite distance');
  }
  if (distanceM < 0) {
    return refusal('invalid distance');
  }

  const seconds = distanceM / SPEED_OF_LIGHT_M_PER_S;
  const distanceAu = distanceM / ASTRONOMICAL_UNIT_M;
  const caveat = tier === null ? null : inheritedTierCaveat(tier);
  const caveatText = caveat === null ? '' : ` — ${caveat}`;
  return {
    kind: 'value',
    seconds,
    distanceAu,
    caveat,
    text: `Light time from Earth: ${formatSeconds(seconds)} (${formatTwoSignificantFigures(distanceAu)} AU ÷ c)${caveatText}`,
  };
}
