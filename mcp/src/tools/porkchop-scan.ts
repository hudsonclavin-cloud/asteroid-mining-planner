import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { makeEnvelope, quantity, refuse } from '../envelope/index.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';
import { CLOSED_WORLD_TOOL_ANNOTATIONS, toolResult } from './common.js';
import {
  DEFAULT_GRID_DEPARTURE,
  DEFAULT_GRID_TOF,
  DEFAULT_TOP_N,
  MAX_GRID_CELLS,
  baseComputeProvenance,
  computeGridForBody,
  earthSpanHelp,
  jdTdbToUtcDateString,
  loadComputeContext,
  resolveBodyByDesignation,
  utcDateSchemaPattern,
  utcMidnightToJdTdb,
  withinEarthSpan
} from './compute-shared.js';

export const porkchopScanInputSchema = z.object({
  designation: z.string().trim().min(1),
  departureStart: z.string().regex(utcDateSchemaPattern()),
  departureEnd: z.string().regex(utcDateSchemaPattern()),
  tofMinDays: z.number().positive(),
  tofMaxDays: z.number().positive(),
  M: z.union([z.literal(0), z.literal(1), z.literal(2)]).default(0),
  gridDeparture: z.number().int().positive().default(DEFAULT_GRID_DEPARTURE),
  gridTof: z.number().int().positive().default(DEFAULT_GRID_TOF),
  topN: z.number().int().min(1).max(50).default(DEFAULT_TOP_N)
}).superRefine((value, ctx) => {
  if (value.departureStart >= value.departureEnd) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'departureStart must be earlier than departureEnd',
      path: ['departureEnd']
    });
  }
  if (value.tofMinDays >= value.tofMaxDays) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'tofMinDays must be less than tofMaxDays',
      path: ['tofMaxDays']
    });
  }
  if (value.gridDeparture * value.gridTof > MAX_GRID_CELLS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `gridDeparture*gridTof must be <= ${MAX_GRID_CELLS}`,
      path: ['gridTof']
    });
  }
});

export function registerPorkchopScanTool(server: McpServer): void {
  server.registerTool(
    'porkchop_scan',
    {
      title: 'Scan porkchop grid',
      description: 'Run a bounded Lambert grid and return the lowest-C3 feasible cells. Unknown bodies return not_found; departure dates outside the committed Earth ephemeris span return out_of_envelope.',
      inputSchema: porkchopScanInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: CLOSED_WORLD_TOOL_ANNOTATIONS
    },
    async (args) => toolResult(await runPorkchopScan(args))
  );
}

export async function runPorkchopScan(args: z.output<typeof porkchopScanInputSchema>) {
  const [body, computeContext] = await Promise.all([
    resolveBodyByDesignation(args.designation),
    loadComputeContext()
  ]);

  if (!body) {
    return refuse(
      'porkchop_scan',
      'not_found',
      `${args.designation} is not in the catalog`,
      'check the designation format, or call search_bodies',
      {
        provenance: baseComputeProvenance({ includeScreenCache: true }),
        validity_envelope: 'Closed-world Slice 9 NEA fixture.'
      }
    );
  }

  const departureStartJd = utcMidnightToJdTdb(args.departureStart);
  const departureEndJd = utcMidnightToJdTdb(args.departureEnd);
  if (!withinEarthSpan(computeContext.earthSpan, departureStartJd, departureEndJd)) {
    return refuse(
      'porkchop_scan',
      'out_of_envelope',
      `Departure window ${args.departureStart} through ${args.departureEnd} is outside the committed Earth ephemeris span ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`,
      earthSpanHelp(computeContext.earthSpan),
      {
        provenance: baseComputeProvenance({ includeScreenCache: true }),
        validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`
      }
    );
  }

  const result = await computeGridForBody(
    body,
    {
      depStartJD: departureStartJd,
      depEndJD: departureEndJd,
      tofMinDays: args.tofMinDays,
      tofMaxDays: args.tofMaxDays,
      nDep: args.gridDeparture,
      nTof: args.gridTof
    },
    args.M
  );

  const feasible = result.cells
    .filter((cell) => cell.status === 'ok' && cell.selectedBranch !== null)
    .map((cell) => {
      const branch = cell.branches[cell.selectedBranch!];
      return {
        departureDate: jdTdbToUtcDateString(cell.depJD),
        tofDays: quantity(cell.tofDays, 'days', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        c3: quantity(branch.c3, 'km^2/s^2', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        vInfDep: quantity(branch.vInfDep, 'km/s', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        vInfArr: quantity(branch.vInfArr, 'km/s', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        feasible: true
      };
    })
    .sort((left, right) => left.c3.value - right.c3.value);

  const coverage = {
    returned: Math.min(args.topN, feasible.length),
    total: result.cells.length,
    selection_rule: 'lowest departure C3 among feasible cells'
  };

  return makeEnvelope({
    tool: 'porkchop_scan',
    value: {
      summary: {
        feasibleCells: quantity(feasible.length, 'cells', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        infeasibleCells: quantity(result.cells.length - feasible.length, 'cells', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        bestCell: feasible[0] ?? null
      },
      bestCells: feasible.slice(0, args.topN)
    },
    provenance: baseComputeProvenance({ includeScreenCache: true }),
    assumptions: [
      `Selected Lambert branch per cell is the lowest departure C3 among converged branches for M=${args.M}.`,
      'Cells with no converged Lambert branch are counted as feasible:false outcomes in summary, never dropped silently.'
    ],
    validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}; grid bounded to ${MAX_GRID_CELLS} cells.`,
    coverage
  });
}
