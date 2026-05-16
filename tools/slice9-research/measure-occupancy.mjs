import path from 'node:path';

import {
  AU_KM,
  COMMON_EPOCH_LABEL,
  COMMON_EPOCH_TDB_JD,
  DATA_DIR,
  kmVectorMagnitude,
  normalizeSbdbRows,
  quantile,
  readJson,
  summarizeNumeric,
  writeJsonAtomic,
} from './common.mjs';
import { propagateKeplerian } from './keplerian-offline.mjs';

const inputRawPath = path.join(DATA_DIR, 'sbdb-nea-raw.json');
const outputPath = path.join(DATA_DIR, 'occupancy-summary.json');

const CELL_SIZES_AU = [0.25, 0.5, 1.0, 2.0];

function cellKeyForPosition(positionKm, cellSizeKm) {
  const x = Math.floor(positionKm.x / cellSizeKm);
  const y = Math.floor(positionKm.y / cellSizeKm);
  const z = Math.floor(positionKm.z / cellSizeKm);
  return `${x}_${y}_${z}`;
}

function analyzeCellSize(positions, cellSizeAu) {
  const cellSizeKm = cellSizeAu * AU_KM;
  const counts = new Map();

  for (const positionKm of positions) {
    const key = cellKeyForPosition(positionKm, cellSizeKm);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const occupancies = [...counts.values()].sort((left, right) => left - right);
  const densest = [...counts.values()].sort((left, right) => right - left).slice(0, 10);
  const bodiesInDensestTen = densest.reduce((sum, value) => sum + value, 0);

  return {
    cellSizeAu,
    occupiedCellCount: counts.size,
    maxBodiesPerCell: occupancies.at(-1) ?? 0,
    medianBodiesPerCell: quantile(occupancies, 0.5),
    p90BodiesPerCell: quantile(occupancies, 0.9),
    fractionOfBodiesInDensestTenCells: positions.length === 0 ? 0 : bodiesInDensestTen / positions.length,
  };
}

async function main() {
  const payload = await readJson(inputRawPath);
  const rows = normalizeSbdbRows(payload);
  const propagatable = rows.filter((row) => !row.hasDegenerateElements);

  const positions = [];
  const heliocentricDistancesKm = [];
  let minXKm = Number.POSITIVE_INFINITY;
  let maxXKm = Number.NEGATIVE_INFINITY;
  let minYKm = Number.POSITIVE_INFINITY;
  let maxYKm = Number.NEGATIVE_INFINITY;
  let minZKm = Number.POSITIVE_INFINITY;
  let maxZKm = Number.NEGATIVE_INFINITY;

  for (const row of propagatable) {
    const propagated = propagateKeplerian(
      {
        a: row.aAu,
        e: row.e,
        i: row.iDeg,
        om: row.omDeg,
        w: row.wDeg,
        ma: row.maDeg,
        epoch_tdb: row.epochTdbJd,
      },
      COMMON_EPOCH_TDB_JD,
    );

    const positionKm = propagated.position_km;
    positions.push(positionKm);
    heliocentricDistancesKm.push(kmVectorMagnitude(positionKm));

    minXKm = Math.min(minXKm, positionKm.x);
    maxXKm = Math.max(maxXKm, positionKm.x);
    minYKm = Math.min(minYKm, positionKm.y);
    maxYKm = Math.max(maxYKm, positionKm.y);
    minZKm = Math.min(minZKm, positionKm.z);
    maxZKm = Math.max(maxZKm, positionKm.z);
  }

  const occupancyTable = CELL_SIZES_AU.map((cellSizeAu) => analyzeCellSize(positions, cellSizeAu));
  const distanceSummaryKm = summarizeNumeric(heliocentricDistancesKm);

  await writeJsonAtomic(outputPath, {
    generatedAtUtc: new Date().toISOString(),
    commonEpochTdbJd: COMMON_EPOCH_TDB_JD,
    commonEpochLabel: COMMON_EPOCH_LABEL,
    totalRows: rows.length,
    propagatableRowCount: propagatable.length,
    excludedRowCount: rows.length - propagatable.length,
    occupancyTable,
    heliocentricDistanceKm: distanceSummaryKm,
    axisExtentKm: {
      minXKm,
      maxXKm,
      minYKm,
      maxYKm,
      minZKm,
      maxZKm,
    },
  });

  console.log(`wrote ${outputPath}`);
  console.log(`propagatable=${propagatable.length}`);
  console.log(`occupancy=${JSON.stringify(occupancyTable)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});

