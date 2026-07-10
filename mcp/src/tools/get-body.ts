import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { makeEnvelope, refuse } from '../envelope/index.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';
import { CLOSED_WORLD_TOOL_ANNOTATIONS, toolResult } from './common.js';
import { fullBodyRecord, loadCatalogContext } from './catalog-shared.js';

const getBodyInputSchema = z.object({
  designation: z.string().trim().min(1)
});

export function registerGetBodyTool(server: McpServer): void {
  server.registerTool(
    'get_body',
    {
      title: 'Get catalog body',
      description: 'Return one full Slice 9 catalog body record with Lambert screening status and quantity leaves. Unknown bodies return not_found.',
      inputSchema: getBodyInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: CLOSED_WORLD_TOOL_ANNOTATIONS
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
      return toolResult(makeEnvelope({
        tool: 'get_body',
        value: fullBodyRecord(body, screen ?? null),
        provenance: context.provenance,
        assumptions: [
          'Physical-parameter confidence is assumed because the Slice 9 catalog boundary does not distinguish measured/derived/assumed per field.',
          'screeningStatus is the existing Lambert screen-cache status joined by bodyId; missing screen rows are returned as null rather than inferred.'
        ],
        validity_envelope: 'Closed-world Slice 9 NEA fixture joined to the committed Lambert screening cache when present.'
      }));
    }
  );
}
