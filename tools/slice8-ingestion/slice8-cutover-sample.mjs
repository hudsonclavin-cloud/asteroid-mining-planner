export const SLICE8_CUTOVER_SAMPLE_SEED = 8;
export const SLICE8_CUTOVER_PER_BAND_COUNT = 50;

export const INV013_BARS_KM = Object.freeze({
  A: 35612.87232627181,
  B: 52970.09174157583,
  C: 37688.07611042476,
  D: 43757.549716072484,
});

function designationSort(a, b) {
  const aNumber = Number(a.designation);
  const bNumber = Number(b.designation);
  const aNumeric = Number.isFinite(aNumber);
  const bNumeric = Number.isFinite(bNumber);
  if (aNumeric && bNumeric && aNumber !== bNumber) {
    return aNumber - bNumber;
  }
  return String(a.designation).localeCompare(String(b.designation), 'en', { numeric: true });
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(values, seed) {
  const rng = mulberry32(seed);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

function cloneBody(body) {
  return {
    designation: String(body.designation),
    bodyId: body.bodyId ?? `asteroid-${body.designation}`,
    name: body.name,
    class: body.class,
    H: body.H,
    eccentricityBand: body.eccentricityBand,
  };
}

export function buildSlice8CutoverSample(asteroidMap) {
  const bands = { A: [], B: [], C: [], D: [] };
  const asteroids = Array.isArray(asteroidMap) ? asteroidMap : Object.values(asteroidMap);

  for (const asteroid of asteroids) {
    const band = asteroid.eccentricityBand;
    if (!bands[band]) {
      continue;
    }
    bands[band].push(cloneBody(asteroid));
  }

  const sampledBands = {};
  for (const [band, bodies] of Object.entries(bands)) {
    if (bodies.length < SLICE8_CUTOVER_PER_BAND_COUNT) {
      throw new Error(
        `Slice 8 cutover requires ${SLICE8_CUTOVER_PER_BAND_COUNT} bodies in band ${band}, got ${bodies.length}`,
      );
    }
    const sorted = [...bodies].sort(designationSort);
    const shuffled = shuffleInPlace(sorted, SLICE8_CUTOVER_SAMPLE_SEED + band.charCodeAt(0));
    sampledBands[band] = shuffled.slice(0, SLICE8_CUTOVER_PER_BAND_COUNT);
  }

  return {
    seed: SLICE8_CUTOVER_SAMPLE_SEED,
    perBandCount: SLICE8_CUTOVER_PER_BAND_COUNT,
    bands: sampledBands,
    flat: ['A', 'B', 'C', 'D'].flatMap((band) => sampledBands[band]),
  };
}
