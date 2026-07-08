import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { dlaDegFromVInf } from '../../../src/v2/core/lambert/dla.js';
import { makeEnvelope, quantity, refuse } from '../envelope/index.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';
import { gitCommitForPath } from '../resources/repo.js';
import { CLOSED_WORLD_TOOL_ANNOTATIONS, toolResult } from './common.js';
import {
  SITE_ID_VALUES,
  VEHICLE_ID_VALUES,
  baseComputeProvenance,
  buildOneWayMissionCost,
  classifyDlaForSite,
  computeGridForBody,
  curveDomainRefusal,
  earthSpanHelp,
  findSiteById,
  findVehicleById,
  loadComputeContext,
  makeSiteId,
  makeVehicleId,
  resolveBodyByDesignation,
  utcDateSchemaPattern,
  utcMidnightToJdTdb,
  vehicleCurveDomain,
  withinEarthSpan
} from './compute-shared.js';

export const estimateMissionCostInputSchema = z.object({
  designation: z.string().trim().min(1),
  departureDate: z.string().regex(utcDateSchemaPattern()),
  tofDays: z.number().positive(),
  M: z.union([z.literal(0), z.literal(1), z.literal(2)]).default(0),
  vehicleId: z.enum(VEHICLE_ID_VALUES),
  siteId: z.enum(SITE_ID_VALUES).optional()
});

export function registerEstimateMissionCostTool(server: McpServer): void {
  server.registerTool(
    'estimate_mission_cost',
    {
      title: 'Estimate mission screening cost',
      description: 'Return the Slice 13 delivered-mass screening chain for one Lambert cell and vehicle. Unknown bodies return not_found; choosing a vehicle outside its published C3 curve returns out_of_envelope instead of extrapolating.',
      inputSchema: estimateMissionCostInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: CLOSED_WORLD_TOOL_ANNOTATIONS
    },
    async (args) => toolResult(await runEstimateMissionCost(args))
  );
}

export async function runEstimateMissionCost(args: z.output<typeof estimateMissionCostInputSchema>) {
  const [body, computeContext] = await Promise.all([
    resolveBodyByDesignation(args.designation),
    loadComputeContext()
  ]);

  if (!body) {
    return refuse(
      'estimate_mission_cost',
      'not_found',
      `${args.designation} is not in the catalog`,
      'check the designation format, or call search_bodies',
      {
        provenance: baseComputeProvenance({ includeVehicle: true, includeDeltaV: true }),
        validity_envelope: 'Closed-world Slice 9 NEA fixture.'
      }
    );
  }

  const departureJd = utcMidnightToJdTdb(args.departureDate);
  if (!withinEarthSpan(computeContext.earthSpan, departureJd, departureJd)) {
    return refuse(
      'estimate_mission_cost',
      'out_of_envelope',
      `Departure date ${args.departureDate} is outside the committed Earth ephemeris span ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`,
      earthSpanHelp(computeContext.earthSpan),
      {
        provenance: baseComputeProvenance({ includeVehicle: true, includeDeltaV: true }),
        validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`
      }
    );
  }

  const vehicle = findVehicleById(args.vehicleId);
  if (!vehicle) {
    return refuse(
      'estimate_mission_cost',
      'not_found',
      `${args.vehicleId} is not a known vehicleId`,
      'choose a vehicleId from the launch-vehicles reference resource',
      {
        provenance: baseComputeProvenance({ includeVehicle: true, includeDeltaV: true }),
        validity_envelope: 'Closed-world launch-vehicle reference set.'
      }
    );
  }

  const site = args.siteId ? findSiteById(args.siteId) : undefined;
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
    throw new Error('Single-cell mission-cost compute returned no cell');
  }

  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return makeEnvelope({
      tool: 'estimate_mission_cost',
      value: {
        feasible: false,
        reason: 'Lambert solver returned no converged branch for the requested cell.',
        vehicleId: args.vehicleId,
        departureDate: args.departureDate,
        tofDays: quantity(args.tofDays, 'days', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        M: args.M
      },
      provenance: [
        ...baseComputeProvenance({ includeVehicle: true, includeDeltaV: true }),
        marginPolicyProvenance()
      ],
      assumptions: ['Known-negative transfer outcomes are returned as values, not refusals.'],
      validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`
    });
  }

  const selectedBranch = cell.branches[cell.selectedBranch];
  const missionCost = buildOneWayMissionCost(vehicle, selectedBranch.c3, selectedBranch.vInfArr);
  if (missionCost === null) {
    return curveDomainRefusal('estimate_mission_cost', vehicle, selectedBranch.c3);
  }

  const departureTdbSeconds = (cell.depJD - 2451545.0) * 86400;
  const earthState = computeContext.porkchopDeps.getEarthStateAtTdbSeconds(departureTdbSeconds);
  const vInfComponents = {
    x: selectedBranch.v1[0] - earthState.velocityMps.x / 1000,
    y: selectedBranch.v1[1] - earthState.velocityMps.y / 1000,
    z: selectedBranch.v1[2] - earthState.velocityMps.z / 1000
  };
  const dlaDeg = dlaDegFromVInf(vInfComponents.x, vInfComponents.y, vInfComponents.z);
  const siteVerdict = site ? classifyDlaForSite(dlaDeg, site) : null;
  const siteFeasible = siteVerdict === null ? null : siteVerdict === 'GREEN' || siteVerdict === 'AMBER';
  const curveDomain = vehicleCurveDomain(vehicle);

  return makeEnvelope({
    tool: 'estimate_mission_cost',
    as_of: vehicle.asOf,
    value: {
      feasible: true,
      bodyId: body.bodyId,
      designation: body.designation,
      vehicleId: makeVehicleId(vehicle),
      departureDate: args.departureDate,
      tofDays: quantity(args.tofDays, 'days', {
        confidence: 'derived',
        sourceIds: ['grid-compute']
      }),
      M: args.M,
      c3: quantity(selectedBranch.c3, 'km^2/s^2', {
        confidence: 'derived',
        sourceIds: ['grid-compute']
      }),
      payloadAtC3: quantity(missionCost.payloadKg, 'kg', {
        confidence: 'measured',
        sourceIds: ['launch-vehicles']
      }),
      publishedC3Domain: {
        min: quantity(curveDomain.minC3, 'km^2/s^2', {
          confidence: 'measured',
          sourceIds: ['launch-vehicles']
        }),
        max: quantity(curveDomain.maxC3, 'km^2/s^2', {
          confidence: 'measured',
          sourceIds: ['launch-vehicles']
        })
      },
      dvBudget: {
        missionMode: 'one-way',
        rendezvous: quantity(missionCost.rendezvousMps, 'm/s', {
          confidence: 'derived',
          sourceIds: ['delta-v-model']
        }),
        stationkeeping: quantity(missionCost.stationkeepingMps, 'm/s', {
          confidence: 'assumed',
          sourceIds: ['cost-assumptions']
        }),
        margin: quantity(missionCost.marginMps, 'm/s', {
          confidence: 'assumed',
          sourceIds: ['cost-assumptions']
        })
      },
      deliveredMass: quantity(missionCost.deliveredMassKg, 'kg', {
        confidence: 'assumed',
        sourceIds: ['launch-vehicles', 'cost-assumptions']
      }),
      ...(site
        ? {
            site: {
              siteId: makeSiteId(site),
              verdict: siteVerdict,
              siteFeasible,
              dla: dlaDeg === null
                ? null
                : quantity(dlaDeg, 'deg', {
                    frame: 'ICRF/equatorial',
                    confidence: 'derived',
                    sourceIds: ['grid-compute']
                  })
            }
          }
        : {})
    },
    provenance: [
      ...baseComputeProvenance({ includeVehicle: true, includeDeltaV: true }),
      marginPolicyProvenance()
    ],
    assumptions: [
      'Mission mode is one-way: no departure burn is included.',
      'Margin policy: deterministic 5% margin on deterministic maneuver lines only; stationkeeping is not margined.',
      'No committed cost-per-kg source exists in the Slice 13 model, so costPerKg is omitted rather than invented.',
      ...(site
        ? [
            `Site verdict evaluated for siteId=${makeSiteId(site)}.`,
            ...(siteFeasible === false
              ? ['Selected site is outside the direct-injection screening band for this cell; delivered mass is still shown, but the launch is flagged siteFeasible:false.']
              : [])
          ]
        : ['No launch site selected; site-band feasibility omitted.'])
    ],
    validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}; vehicle stage refuses beyond each published C3 curve domain.`
  });
}

function marginPolicyProvenance() {
  const path = 'src/v2/porkchop/launch-vehicles.ts';
  return {
    id: 'cost-assumptions',
    kind: 'repo' as const,
    path,
    commit: gitCommitForPath(path),
    confidence: 'assumed' as const,
    note: 'Representative screening Isp, stationkeeping allocation, and 5% deterministic margin policy.'
  };
}
