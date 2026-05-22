import {
  ASTEROID_DEFAULT_ALBEDO,
  deriveAsteroidRadiusMFromAbsoluteMagnitude,
  hasOrbitLineForBody,
  type AsteroidBody,
  type AsteroidBodyId,
} from '../../core/constants/asteroids.js';
import type { Slice9NeaBody } from '../../boundary/slice9-nea-catalog.js';

const RUNTIME_RADIUS_FALLBACK_M = 250;
const RUNTIME_ABSOLUTE_MAGNITUDE_FALLBACK = 99;

function invertRadiusToAbsoluteMagnitude(radiusM: number, albedo = ASTEROID_DEFAULT_ALBEDO): number {
  const diameterKm = (radiusM * 2) / 1000;
  if (!Number.isFinite(diameterKm) || diameterKm <= 0) {
    return RUNTIME_ABSOLUTE_MAGNITUDE_FALLBACK;
  }
  return 5 * Math.log10(1329 / (diameterKm * Math.sqrt(albedo)));
}

export function resolveSlice9RuntimeRadiusM(body: Pick<Slice9NeaBody, 'estimatedRadiusM' | 'H'>): number {
  if (
    typeof body.estimatedRadiusM === 'number' &&
    Number.isFinite(body.estimatedRadiusM) &&
    body.estimatedRadiusM > 0
  ) {
    return body.estimatedRadiusM;
  }
  if (typeof body.H === 'number' && Number.isFinite(body.H)) {
    return deriveAsteroidRadiusMFromAbsoluteMagnitude(body.H);
  }
  return RUNTIME_RADIUS_FALLBACK_M;
}

export function resolveSlice9RuntimeAbsoluteMagnitudeH(body: Pick<Slice9NeaBody, 'estimatedRadiusM' | 'H'>): number {
  if (typeof body.H === 'number' && Number.isFinite(body.H)) {
    return body.H;
  }
  if (
    typeof body.estimatedRadiusM === 'number' &&
    Number.isFinite(body.estimatedRadiusM) &&
    body.estimatedRadiusM > 0
  ) {
    return invertRadiusToAbsoluteMagnitude(body.estimatedRadiusM);
  }
  return RUNTIME_ABSOLUTE_MAGNITUDE_FALLBACK;
}

export function normalizeSlice9BodyForRuntime(body: Slice9NeaBody): AsteroidBody {
  const estimatedRadiusM = resolveSlice9RuntimeRadiusM(body);
  const H = resolveSlice9RuntimeAbsoluteMagnitudeH(body);
  return {
    bodyId: body.bodyId,
    bodyClass: 'asteroid',
    designation: body.designation,
    spkId: body.spkId,
    name: body.name,
    class: body.class,
    isCuratedNea: body.isCuratedNea,
    neo: body.neo,
    pha: body.pha,
    H,
    G: body.G,
    estimatedRadiusM,
    elementsFrame: body.elementsFrame,
    eccentricityBand: body.eccentricityBand,
    hasOrbitLine: hasOrbitLineForBody(H),
    anchorState: body.anchorState,
    elements: body.elements,
  };
}

export interface Slice9RuntimePropagationBody {
  readonly bodyId: AsteroidBodyId;
  readonly renderRadiusM: number;
  readonly anchorPositionM: readonly [number, number, number];
  readonly elements: AsteroidBody['elements'];
}

export function isSlice9RuntimeEllipticBody(
  body: Pick<Slice9RuntimePropagationBody, 'elements'>,
): boolean {
  return (
    Number.isFinite(body.elements.aM) &&
    body.elements.aM > 0 &&
    Number.isFinite(body.elements.e) &&
    body.elements.e >= 0 &&
    body.elements.e < 1
  );
}

export function buildSlice9RuntimePropagationBodies(
  asteroidBodies: readonly AsteroidBody[],
): Slice9RuntimePropagationBody[] {
  return asteroidBodies.map((body) => ({
    bodyId: body.bodyId,
    renderRadiusM: body.estimatedRadiusM,
    anchorPositionM: [
      body.anchorState.positionM.x,
      body.anchorState.positionM.y,
      body.anchorState.positionM.z,
    ] as const,
    elements: body.elements,
  }));
}
