import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import {
  createLambertScreenIndex,
  validateLambertScreenCache,
  type LambertScreenCache,
  type LambertScreenResult,
  type LambertScreenStatus
} from '../../../src/v2/boundary/lambert-screen-cache.js';
import {
  ingestSlice9Fixture,
  type Slice9CanonicalFixture,
  type Slice9Fixture,
  type Slice9NeaBody
} from '../../../src/v2/boundary/slice9-nea-catalog.js';
import { makeEnvelope, quantity, refuse, type SourceRef } from '../envelope/index.js';
import { gitCommitForPath, readRepoJson } from '../resources/repo.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';

const CATALOG_FIXTURE_PATH = 'tests/fixtures/v2/nea-catalog-slice9.json';
const CATALOG_BOUNDARY_PATH = 'src/v2/boundary/slice9-nea-catalog.ts';
const SCREEN_CACHE_PATH = 'tests/fixtures/v2/lambert-screen-cache.json';
const SCREEN_BOUNDARY_PATH = 'src/v2/boundary/lambert-screen-cache.ts';

const SCREENING_STATUS_VALUES = [
  'low_departure_c3',
  'high_departure_c3',
  'lambert_unconvergeable',
  'propagator_failed'
] as const satisfies readonly LambertScreenStatus[];

const toolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
} as const;

const searchBodiesInputSchema = z.object({
  query: z.string().trim().min(1).optional(),
  orbitClass: z.string().trim().min(1).optional(),
  screeningColor: z.enum(SCREENING_STATUS_VALUES).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.string().regex(/^\d+$/).optional()
});

const getBodyInputSchema = z.object({
  designation: z.string().trim().min(1)
});

interface CatalogContext {
  catalog: Slice9CanonicalFixture;
  screenByBodyId: Map<string, LambertScreenResult>;
  provenance: SourceRef[];
}

interface BodySummary {
  bodyId: string;
  spkId: string;
  designation: string;
  name: string | null;
  orbitClass: string;
  screeningColor: LambertScreenStatus;
  inv014Tier: string;
  minC3: ReturnType<typeof quantity> | null;
}

let contextPromise: Promise<CatalogContext> | null = null;

export function registerCatalogTools(server: McpServer): void {
  server.registerTool(
    'search_bodies',
    {
      title: 'Search asteroid catalog',
      description: 'Search the closed-world Slice 9 NEA catalog by designation, name, orbit class, and screening status.',
      inputSchema: searchBodiesInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: toolAnnotations
    },
    async ({ query, orbitClass, screeningColor, limit, cursor }) => {
      const context = await loadCatalogContext();
      const offset = cursor === undefined ? 0 : Number(cursor);
      const normalizedQuery = query?.toLowerCase();

      const allMatches = Object.values(context.catalog.asteroids)
        .map((body) => ({ body, screen: context.screenByBodyId.get(body.bodyId) ?? null }))
        .filter((row): row is { body: Slice9NeaBody; screen: LambertScreenResult } => row.screen !== null)
        .filter(({ body, screen }) => {
          if (orbitClass !== undefined && body.orbitClass !== orbitClass) {
            return false;
          }
          if (screeningColor !== undefined && screen.status !== screeningColor) {
            return false;
          }
          if (
            normalizedQuery !== undefined &&
            !body.designation.toLowerCase().includes(normalizedQuery) &&
            !(body.name ?? '').toLowerCase().includes(normalizedQuery)
          ) {
            return false;
          }
          return true;
        })
        .sort((left, right) => left.body.designation.localeCompare(right.body.designation));

      const page = allMatches.slice(offset, offset + limit);
      const summaries = page.map(({ body, screen }) => bodySummary(body, screen));
      const selectionRule = [
        normalizedQuery ? `query contains "${query}"` : null,
        orbitClass ? `orbitClass == ${orbitClass}` : null,
        screeningColor ? `screeningColor == ${screeningColor}` : null,
        `offset ${offset}`,
        `limit ${limit}`
      ].filter((part): part is string => part !== null).join('; ');

      const coverage = {
        returned: summaries.length,
        total: allMatches.length,
        selection_rule: selectionRule
      };

      const envelope = makeEnvelope({
        tool: 'search_bodies',
        value: {
          results: summaries,
          coverage,
          nextCursor: offset + summaries.length < allMatches.length ? String(offset + summaries.length) : null
        },
        provenance: context.provenance,
        assumptions: [
          'screeningColor is the existing Lambert screen-cache status joined by bodyId; the Slice 9 catalog record itself stores inv014Tier, not a color field.'
        ],
        validity_envelope: 'Closed-world Slice 9 NEA fixture joined to the committed Lambert screening cache.',
        coverage
      });

      return toolResult(envelope);
    }
  );

  server.registerTool(
    'get_body',
    {
      title: 'Get catalog body',
      description: 'Return one full Slice 9 catalog body record with screening status and quantity leaves.',
      inputSchema: getBodyInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: toolAnnotations
    },
    async ({ designation }) => {
      const context = await loadCatalogContext();
      const body = Object.values(context.catalog.asteroids).find(
        (candidate) => candidate.designation === designation
      );

      if (body === undefined) {
        return toolResult(refuse(
          'get_body',
          'not_found',
          `${designation} is not in the catalog`,
          'check the designation format, or call search_bodies',
          {
            provenance: context.provenance,
            validity_envelope: 'Closed-world Slice 9 NEA fixture.'
          }
        ));
      }

      const screen = context.screenByBodyId.get(body.bodyId);
      const envelope = makeEnvelope({
        tool: 'get_body',
        value: fullBodyRecord(body, screen ?? null),
        provenance: context.provenance,
        assumptions: [
          'Physical-parameter confidence is assumed because the Slice 9 catalog boundary does not distinguish measured/derived/assumed per field.',
          'screeningColor is the existing Lambert screen-cache status joined by bodyId; missing screen rows are returned as null rather than inferred.'
        ],
        validity_envelope: 'Closed-world Slice 9 NEA fixture joined to the committed Lambert screening cache when present.'
      });

      return toolResult(envelope);
    }
  );
}

async function loadCatalogContext(): Promise<CatalogContext> {
  if (contextPromise !== null) {
    return contextPromise;
  }

  contextPromise = (async () => {
    const [catalogRaw, screenRaw] = await Promise.all([
      readRepoJson<Slice9Fixture>(CATALOG_FIXTURE_PATH),
      readRepoJson<LambertScreenCache>(SCREEN_CACHE_PATH)
    ]);
    const catalog = ingestSlice9Fixture(catalogRaw);
    const screenCache = validateLambertScreenCache(screenRaw);
    const screenIndex = createLambertScreenIndex(screenCache);

    return {
      catalog,
      screenByBodyId: screenIndex.byBodyId,
      provenance: [
        {
          id: 'catalog-boundary',
          kind: 'repo',
          path: CATALOG_BOUNDARY_PATH,
          commit: gitCommitForPath(CATALOG_BOUNDARY_PATH),
          confidence: 'derived',
          note: `Runtime validation of ${CATALOG_FIXTURE_PATH}`
        },
        {
          id: 'screen-cache-boundary',
          kind: 'repo',
          path: SCREEN_BOUNDARY_PATH,
          commit: gitCommitForPath(SCREEN_BOUNDARY_PATH),
          confidence: 'derived',
          note: `Runtime validation of ${SCREEN_CACHE_PATH}`
        }
      ]
    };
  })();

  return contextPromise;
}

function bodySummary(body: Slice9NeaBody, screen: LambertScreenResult): BodySummary {
  return {
    bodyId: body.bodyId,
    spkId: String(body.spkId),
    designation: body.designation,
    name: body.name,
    orbitClass: body.orbitClass,
    screeningColor: screen.status,
    inv014Tier: body.inv014Tier,
    minC3: screen.minC3 === null
      ? null
      : quantity(screen.minC3, 'km^2/s^2', {
          confidence: 'derived',
          sourceIds: ['screen-cache-boundary']
        })
  };
}

function fullBodyRecord(body: Slice9NeaBody, screen: LambertScreenResult | null): Record<string, unknown> {
  return {
    bodyId: body.bodyId,
    bodyClass: body.bodyClass,
    designation: body.designation,
    spkId: String(body.spkId),
    name: body.name,
    class: body.class,
    orbitClass: body.orbitClass,
    flags: {
      isCuratedNea: body.isCuratedNea,
      neo: body.neo,
      pha: body.pha,
      anchorSource: body.anchorSource
    },
    physical: {
      absoluteMagnitudeH: nullableQuantity(body.H, 'mag'),
      slopeParameterG: nullableQuantity(body.G, 'unitless'),
      estimatedRadius: nullableQuantity(body.estimatedRadiusM, 'm')
    },
    orbitQuality: {
      conditionCode: nullableQuantity(body.conditionCode, 'unitless'),
      dataArc: nullableQuantity(body.dataArcDays, 'days'),
      observationsUsed: nullableQuantity(body.nObsUsed, 'count'),
      sigmaA: nullableQuantity(body.sigmaA, 'au'),
      sigmaE: nullableQuantity(body.sigmaE, 'unitless'),
      qualityRank: quantity(body.qualityRank, 'unitless', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      inv014Tier: body.inv014Tier
    },
    elements: {
      frame: body.elementsFrame,
      eccentricityBand: body.eccentricityBand,
      semiMajorAxis: quantity(body.elements.aM, 'm', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      eccentricity: quantity(body.elements.e, 'unitless', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      inclination: quantity(body.elements.iRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      longitudeAscendingNode: quantity(body.elements.omRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      argumentOfPeriapsis: quantity(body.elements.wRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      meanAnomaly: quantity(body.elements.maRad, 'rad', {
        frame: body.elementsFrame,
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      }),
      epochTdb: quantity(body.elements.epochTdbSeconds, 's since J2000 TDB', {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      })
    },
    screening: screen === null ? null : {
      screeningColor: screen.status,
      minC3: screen.minC3 === null
        ? null
        : quantity(screen.minC3, 'km^2/s^2', {
            confidence: 'derived',
            sourceIds: ['screen-cache-boundary']
          }),
      minC3Date: screen.minC3Date,
      minC3TofDays: screen.minC3TofDays === null
        ? null
        : quantity(screen.minC3TofDays, 'days', {
            confidence: 'derived',
            sourceIds: ['screen-cache-boundary']
          }),
      isCoOrbital: screen.isCoOrbital
    }
  };
}

function nullableQuantity(value: number | null, units: string): ReturnType<typeof quantity> | null {
  return value === null
    ? null
    : quantity(value, units, {
        confidence: 'assumed',
        sourceIds: ['catalog-boundary']
      });
}

function toolResult(envelope: object): {
  structuredContent: Record<string, unknown>;
  content: Array<{ type: 'text'; text: string }>;
} {
  return {
    structuredContent: envelope as Record<string, unknown>,
    content: [
      {
        type: 'text',
        text: JSON.stringify(envelope, null, 2)
      }
    ]
  };
}
