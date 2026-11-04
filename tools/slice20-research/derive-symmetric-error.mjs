import fs from 'node:fs';

const artifactPath = process.argv[2] ?? new URL('../../src/v2/data/symmetric-return-error.json', import.meta.url);
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

const errors = artifact.rows.flatMap((row) =>
  Object.values(row.computedAsteroidDepartureVInfKmS).map((computed) =>
    Math.abs(Number(row.assumed) - Number(computed)),
  ),
);

// The display keeps two decimal places below 1 km/s and one above it. This
// gives the compact range used by the copy while retaining the scale of both
// extrema (0.077 -> 0.08 and 5.110 -> 5.1).
const displayBound = (value) => (value < 1 ? Math.round(value * 100) / 100 : Math.round(value * 10) / 10);
const derived = {
  minAbsErrorKmS: displayBound(Math.min(...errors)),
  maxAbsErrorKmS: displayBound(Math.max(...errors)),
};

process.stdout.write(`${JSON.stringify(derived)}\n`);

export { derived };
