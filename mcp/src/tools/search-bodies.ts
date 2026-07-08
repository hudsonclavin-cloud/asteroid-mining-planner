import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { makeEnvelope } from '../envelope/index.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';
import { CLOSED_WORLD_TOOL_ANNOTATIONS, toolResult } from './common.js';
import {
  SCREENING_STATUS_VALUES,
  bodySummary,
  loadCatalogContext
} from './catalog-shared.js';

const searchBodiesInputSchema = z.object({
  query: z.string().trim().min(1).optional(),
  orbitClass: z.string().trim().min(1).optional(),
  screeningStatus: z.enum(SCREENING_STATUS_VALUES).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.string().regex(/^\d+$/).optional()
});

export function registerSearchBodiesTool(server: McpServer): void {
  server.registerTool(
    'search_bodies',
    {
      title: 'Search asteroid catalog',
      description: 'Search the closed-world Slice 9 NEA catalog by designation, name, orbit class, and Lambert screening status.',
      inputSchema: searchBodiesInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: CLOSED_WORLD_TOOL_ANNOTATIONS
    },
    async ({ query, orbitClass, screeningStatus, limit, cursor }) => {
      const context = await loadCatalogContext();
      const offset = cursor === undefined ? 0 : Number(cursor);
      const normalizedQuery = query?.toLowerCase();

      const allMatches = Object.values(context.catalog.asteroids)
        .map((body) => ({ body, screen: context.screenByBodyId.get(body.bodyId) ?? null }))
        .filter((row): row is { body: (typeof row)['body']; screen: NonNullable<(typeof row)['screen']> } => row.screen !== null)
        .filter(({ body, screen }) => {
          if (orbitClass !== undefined && body.orbitClass !== orbitClass) {
            return false;
          }
          if (screeningStatus !== undefined && screen.status !== screeningStatus) {
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
      const results = page.map(({ body, screen }) => bodySummary(body, screen));
      const coverage = {
        returned: results.length,
        total: allMatches.length,
        selection_rule: [
          normalizedQuery ? `query contains "${query}"` : null,
          orbitClass ? `orbitClass == ${orbitClass}` : null,
          screeningStatus ? `screeningStatus == ${screeningStatus}` : null,
          `offset ${offset}`,
          `limit ${limit}`
        ].filter((part): part is string => part !== null).join('; ')
      };

      return toolResult(makeEnvelope({
        tool: 'search_bodies',
        value: {
          results,
          coverage,
          nextCursor: offset + results.length < allMatches.length ? String(offset + results.length) : null
        },
        provenance: context.provenance,
        assumptions: [
          'screeningStatus is the existing Lambert screen-cache status joined by bodyId; the Slice 9 catalog record itself stores inv014Tier, not a traffic-light color field.'
        ],
        validity_envelope: 'Closed-world Slice 9 NEA fixture joined to the committed Lambert screening cache.',
        coverage
      }));
    }
  );
}
