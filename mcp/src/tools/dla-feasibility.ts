import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { dlaDegFromVInf } from '../../../src/v2/core/lambert/dla.js';
import { makeEnvelope, quantity, refuse } from '../envelope/index.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';
import { CLOSED_WORLD_TOOL_ANNOTATIONS, toolResult } from './common.js';
import {
  LAUNCH_SITES,
  SITE_ID_VALUES,
  baseComputeProvenance,
  computeGridForBody,
  earthSpanHelp,
  findSiteById,
  loadComputeContext,
  resolveBodyByDesignation,
  siteVerdictRows,
  utcDateSchemaPattern,
  utcMidnightToJdTdb,
  withinEarthSpan
} from './compute-shared.js';

export const dlaFeasibilityInputSchema = z.object({
  designation: z.string().trim().min(1),
  departureDate: z.string().regex(utcDateSchemaPattern()),
  tofDays: z.number().positive(),
  M: z.union([z.literal(0), z.literal(1), z.literal(2)]).default(0),
  siteId: z.enum(SITE_ID_VALUES).optional()
});

export function registerDlaFeasibilityTool(server: McpServer): void {
  server.registerTool(
    'dla_feasibility',
    {
      title: 'Assess DLA launch-site feasibility',
      description: 'Return DLA and launch-site screening verdicts for one Lambert cell. Unknown bodies return not_found; departure dates outside the committed Earth ephemeris span return out_of_envelope.',
      inputSchema: dlaFeasibilityInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: CLOSED_WORLD_TOOL_ANNOTATIONS
    },
    async (args) => toolResult(await runDlaFeasibility(args))
  );
}

export async function runDlaFeasibility(args: z.output<typeof dlaFeasibilityInputSchema>) {
  const [body, computeContext] = await Promise.all([
    resolveBodyByDesignation(args.designation),
    loadComputeContext()
  ]);

  if (!body) {
    return refuse(
      'dla_feasibility',
      'not_found',
      `${args.designation} is not in the catalog`,
      'check the designation format, or call search_bodies',
      {
        provenance: baseComputeProvenance(),
        validity_envelope: 'Closed-world Slice 9 NEA fixture.'
      }
    );
  }

  const departureJd = utcMidnightToJdTdb(args.departureDate);
  if (!withinEarthSpan(computeContext.earthSpan, departureJd, departureJd)) {
    return refuse(
      'dla_feasibility',
      'out_of_envelope',
      `Departure date ${args.departureDate} is outside the committed Earth ephemeris span ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`,
      earthSpanHelp(computeContext.earthSpan),
      {
        provenance: baseComputeProvenance(),
        validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`
      }
    );
  }

  const grid = await computeGridForBody(
    body,
    {
      depStartJD: departureJd,
      depEndJD: departureJd,
      tofMinDays: args.tofDays,
      tofMaxDays: args.tofDays,
      nDep: 1,
      nTof: 1
    },
    args.M
  );
  const cell = grid.cells[0];
  if (!cell) {
    throw new Error('Single-cell DLA feasibility compute returned no cell');
  }

  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return makeEnvelope({
      tool: 'dla_feasibility',
      value: {
        feasible: false,
        reason: 'Lambert solver returned no converged branch for the requested cell.',
        departureDate: args.departureDate,
        tofDays: quantity(args.tofDays, 'days', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        M: args.M
      },
      provenance: baseComputeProvenance(),
      assumptions: ['Known-negative transfer outcomes are returned as values, not refusals.'],
      validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`
    });
  }

  const selectedBranch = cell.branches[cell.selectedBranch];
  const departureTdbSeconds = (cell.depJD - 2451545.0) * 86400;
  const earthState = computeContext.porkchopDeps.getEarthStateAtTdbSeconds(departureTdbSeconds);
  const vInfComponents = {
    x: selectedBranch.v1[0] - earthState.velocityMps.x / 1000,
    y: selectedBranch.v1[1] - earthState.velocityMps.y / 1000,
    z: selectedBranch.v1[2] - earthState.velocityMps.z / 1000
  };
  const dlaDeg = dlaDegFromVInf(vInfComponents.x, vInfComponents.y, vInfComponents.z);
  const requestedSites = args.siteId ? [findSiteById(args.siteId)!] : LAUNCH_SITES;

  return makeEnvelope({
    tool: 'dla_feasibility',
    value: {
      feasible: true,
      bodyId: body.bodyId,
      designation: body.designation,
      departureDate: args.departureDate,
      tofDays: quantity(args.tofDays, 'days', {
        confidence: 'derived',
        sourceIds: ['grid-compute']
      }),
      M: args.M,
      dla: dlaDeg === null
        ? null
        : quantity(dlaDeg, 'deg', {
            frame: 'ICRF/equatorial',
            confidence: 'derived',
            sourceIds: ['grid-compute']
          }),
      vInfDep: quantity(selectedBranch.vInfDep, 'km/s', {
        confidence: 'derived',
        sourceIds: ['grid-compute']
      }),
      sites: siteVerdictRows(dlaDeg, requestedSites)
    },
    provenance: baseComputeProvenance(),
    assumptions: [
      'DLA is computed from departure v-infinity components in the ICRF/equatorial frame.',
      args.siteId ? `Only siteId=${args.siteId} was evaluated.` : 'All committed launch-site screening bands were evaluated.',
      'feasible:false site rows are known-negative values, not refusals.'
    ],
    validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}; site verdicts are screening-level only, not day-specific launch geometry.`
  });
}
