import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { LAUNCH_SITES } from '../../../src/v2/core/lambert/feasibility.js';
import {
  EARTH_MU_KM3_PER_S2,
  LEO_PARKING_RADIUS_KM,
  STATIONKEEPING_DV_KMPS,
  DV_MARGIN_FRACTION
} from '../../../src/v2/porkchop/delta-v.js';
import {
  DETERMINISTIC_MARGIN_FRACTION,
  G0_MPS2,
  LAUNCH_VEHICLES,
  SCREENING_ISP_S,
  SPACECRAFT_STATIONKEEPING_MPS
} from '../../../src/v2/porkchop/launch-vehicles.js';
import { gitCommitForPath } from './repo.js';

const RESOURCE_MIME = 'application/json';

export const REFERENCE_RESOURCE_URIS = [
  'aster://reference/launch-vehicles',
  'aster://reference/dla-site-bands',
  'aster://reference/catalog-schema',
  'aster://reference/dv-stack-model'
] as const;

export function registerReferenceResources(server: McpServer): void {
  registerJsonResource(
    server,
    'launch-vehicles',
    'aster://reference/launch-vehicles',
    'Launch vehicle C3 payload curves and provenance.',
    () => ({
      provenance: provenanceNote('src/v2/porkchop/launch-vehicles.ts', 'Vehicle payload curves from NASA LSP elvperf.'),
      asOf: '2024-02-29',
      vehicles: LAUNCH_VEHICLES
    })
  );

  registerJsonResource(
    server,
    'dla-site-bands',
    'aster://reference/dla-site-bands',
    'Launch-site DLA screening bands.',
    () => ({
      provenance: provenanceNote('src/v2/core/lambert/feasibility.ts', 'Launch-site DLA bands and classification semantics.'),
      sites: LAUNCH_SITES,
      classes: {
        GREEN: '|DLA| <= iMinDeg',
        AMBER: 'iMinDeg < |DLA| <= dlaCeilingDeg',
        RED: '|DLA| > dlaCeilingDeg',
        null: 'DLA unavailable or non-finite'
      }
    })
  );

  registerJsonResource(
    server,
    'catalog-schema',
    'aster://reference/catalog-schema',
    'Slice 9 catalog and screening-cache field schema.',
    () => ({
      provenance: [
        provenanceNote('src/v2/boundary/slice9-nea-catalog.ts', 'Catalog fixture ingestion and canonical record shape.'),
        provenanceNote('src/v2/boundary/lambert-screen-cache.ts', 'Lambert screening-cache validation and lookup indexes.')
      ],
      catalogFixture: 'tests/fixtures/v2/nea-catalog-slice9.json',
      screeningFixture: 'tests/fixtures/v2/lambert-screen-cache.json',
      queryableFields: {
        designation: 'Slice9NeaBody.designation',
        name: 'Slice9NeaBody.name',
        orbitClass: 'Slice9NeaBody.orbitClass',
        screeningStatus: 'LambertScreenResult.status joined by bodyId'
      },
      bodyRecordFields: [
        'bodyId',
        'bodyClass',
        'designation',
        'spkId',
        'name',
        'class',
        'orbitClass',
        'isCuratedNea',
        'neo',
        'pha',
        'H',
        'G',
        'estimatedRadiusM',
        'elementsFrame',
        'eccentricityBand',
        'conditionCode',
        'dataArcDays',
        'nObsUsed',
        'sigmaA',
        'sigmaE',
        'inv014Tier',
        'qualityRank',
        'anchorSource',
        'reanchorEpochTdbJd',
        'anchorState',
        'elements'
      ],
      screeningStatusValues: [
        'low_departure_c3',
        'high_departure_c3',
        'lambert_unconvergeable',
        'propagator_failed'
      ],
      units: {
        H: 'mag',
        G: 'unitless',
        estimatedRadiusM: 'm',
        dataArcDays: 'days',
        sigmaA: 'au',
        sigmaE: 'unitless',
        elementAngles: 'rad',
        semiMajorAxis: 'm'
      }
    })
  );

  registerJsonResource(
    server,
    'dv-stack-model',
    'aster://reference/dv-stack-model',
    'Delta-v and delivered-mass screening model constants.',
    () => ({
      provenance: [
        provenanceNote('src/v2/porkchop/delta-v.ts', 'Patched-conic delta-v stack helper constants.'),
        provenanceNote('src/v2/porkchop/launch-vehicles.ts', 'Delivered-mass screening constants used by the cost card.')
      ],
      deltaVStack: {
        earthMuKm3PerS2: EARTH_MU_KM3_PER_S2,
        leoParkingRadiusKm: LEO_PARKING_RADIUS_KM,
        stationkeepingDvKmps: STATIONKEEPING_DV_KMPS,
        dvMarginFraction: DV_MARGIN_FRACTION
      },
      deliveredMassScreening: {
        screeningIspS: SCREENING_ISP_S,
        deterministicMarginFraction: DETERMINISTIC_MARGIN_FRACTION,
        spacecraftStationkeepingMps: SPACECRAFT_STATIONKEEPING_MPS,
        g0Mps2: G0_MPS2
      },
      note: 'The app cost card uses deliveredMassScreening constants; deltaVStack records the older patched-conic stack helper still present in src/v2/porkchop/delta-v.ts.'
    })
  );
}

function registerJsonResource(
  server: McpServer,
  name: string,
  uri: string,
  description: string,
  read: () => unknown
): void {
  server.registerResource(
    name,
    uri,
    {
      title: name,
      description,
      mimeType: RESOURCE_MIME
    },
    (resourceUri) => ({
      contents: [
        {
          uri: resourceUri.href,
          mimeType: RESOURCE_MIME,
          text: JSON.stringify(read(), null, 2)
        }
      ]
    })
  );
}

function provenanceNote(path: string, note: string): { kind: 'repo'; path: string; commit: string; note: string } {
  return {
    kind: 'repo',
    path,
    commit: gitCommitForPath(path),
    note
  };
}
