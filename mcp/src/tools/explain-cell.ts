import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { Slice9NeaBody } from '../../../src/v2/boundary/slice9-nea-catalog.js';
import { dlaDegFromVInf } from '../../../src/v2/core/lambert/dla.js';
import { type CanonicalState } from '../../../src/v2/core/types.js';
import { departureDvFromVInf, rendezvousDvFromVInf } from '../../../src/v2/porkchop/delta-v.js';
import { deliveredMassKg, isBeyondCurve, payloadAtC3 } from '../../../src/v2/porkchop/launch-vehicles.js';
import { makeEnvelope, quantity, refuse } from '../envelope/index.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';
import { CLOSED_WORLD_TOOL_ANNOTATIONS, toolResult } from './common.js';
import {
  MAX_GRID_CELLS,
  baseComputeProvenance,
  classifyDlaForSite,
  computeGridForBody,
  earthSpanHelp,
  findSiteById,
  findVehicleById,
  jdTdbToUtcDateString,
  loadComputeContext,
  makeSiteId,
  makeVehicleId,
  resolveBodyByDesignation,
  utcDateSchemaPattern,
  utcMidnightToJdTdb,
  vehicleCurveDomain,
  withinEarthSpan
} from './compute-shared.js';

export const explainCellInputSchema = z.object({
  designation: z.string().trim().min(1),
  departureDate: z.string().regex(utcDateSchemaPattern()),
  tofDays: z.number().positive(),
  M: z.union([z.literal(0), z.literal(1), z.literal(2)]).default(0),
  vehicleId: z.string().trim().min(1).optional(),
  siteId: z.string().trim().min(1).optional()
});

export function registerExplainCellTool(server: McpServer): void {
  server.registerTool(
    'explain_cell',
    {
      title: 'Explain one Lambert cell',
      description: 'Return the ordered derivation trail for one departure/TOF cell. Unknown bodies return not_found; selecting a vehicle outside its published C3 curve returns out_of_envelope instead of extrapolating.',
      inputSchema: explainCellInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: CLOSED_WORLD_TOOL_ANNOTATIONS
    },
    async (args) => toolResult(await runExplainCell(args))
  );
}

export async function runExplainCell(args: z.output<typeof explainCellInputSchema>) {
  const [body, computeContext] = await Promise.all([
    resolveBodyByDesignation(args.designation),
    loadComputeContext()
  ]);

  if (!body) {
    return refuse(
      'explain_cell',
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
      'explain_cell',
      'out_of_envelope',
      `Departure date ${args.departureDate} is outside the committed Earth ephemeris span ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`,
      earthSpanHelp(computeContext.earthSpan),
      {
        provenance: baseComputeProvenance(),
        validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`
      }
    );
  }

  const vehicle = args.vehicleId ? findVehicleById(args.vehicleId) : undefined;
  if (args.vehicleId && !vehicle) {
    return refuse(
      'explain_cell',
      'not_found',
      `${args.vehicleId} is not a known vehicleId`,
      'choose a vehicleId from the launch-vehicles reference resource',
      {
        provenance: baseComputeProvenance({ includeVehicle: true }),
        validity_envelope: 'Closed-world launch-vehicle reference set.'
      }
    );
  }

  const site = args.siteId ? findSiteById(args.siteId) : undefined;
  if (args.siteId && !site) {
    return refuse(
      'explain_cell',
      'not_found',
      `${args.siteId} is not a known siteId`,
      'choose a siteId from the dla-site-bands reference resource',
      {
        provenance: baseComputeProvenance(),
        validity_envelope: 'Closed-world launch-site reference set.'
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
    throw new Error('Single-cell porkchop compute returned no cell');
  }

  const departureTdbSeconds = (cell.depJD - 2451545.0) * 86400;
  const arrivalTdbSeconds = departureTdbSeconds + cell.tofDays * 86400;
  const earthState = computeContext.porkchopDeps.getEarthStateAtTdbSeconds(departureTdbSeconds);
  const targetState = (computeContext.porkchopDeps.propagateTargetStateAtTdbSeconds as (bodyElements: Slice9NeaBody['elements'], tdbSeconds: number) => Pick<CanonicalState, 'positionM' | 'velocityMps'>)(
    body.elements,
    arrivalTdbSeconds
  );

  if (cell.status !== 'ok' || cell.selectedBranch === null) {
    return makeEnvelope({
      tool: 'explain_cell',
      value: {
        feasible: false,
        reason: 'Lambert solver returned no converged branch for the requested cell.',
        departureDate: args.departureDate,
        tofDays: quantity(args.tofDays, 'days', {
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        M: args.M,
        stages: [
          {
            stage: 'geometry',
            earthDepartureState: canonicalStateToKm(earthState, 'earth-ephemeris'),
            targetArrivalState: canonicalStateToKm(targetState, 'catalog-boundary')
          }
        ]
      },
      provenance: baseComputeProvenance(),
      assumptions: [
        'Known-negative cells are returned as feasible:false values, not refusals.',
        args.vehicleId ? `Vehicle stage omitted because the Lambert cell itself is infeasible for vehicleId=${args.vehicleId}.` : 'No vehicle selected; payload/cost stages omitted.'
      ],
      validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}.`
    });
  }

  const selectedBranch = cell.branches[cell.selectedBranch];
  const vInfComponents = {
    x: selectedBranch.v1[0] - earthState.velocityMps.x / 1000,
    y: selectedBranch.v1[1] - earthState.velocityMps.y / 1000,
    z: selectedBranch.v1[2] - earthState.velocityMps.z / 1000
  };
  const dlaDeg = dlaDegFromVInf(vInfComponents.x, vInfComponents.y, vInfComponents.z);

  if (vehicle) {
    const payload = payloadAtC3(vehicle, selectedBranch.c3);
    if (isBeyondCurve(payload)) {
      const domain = vehicleCurveDomain(vehicle);
      return refuse(
        'explain_cell',
        'out_of_envelope',
        `${makeVehicleId(vehicle)} publishes payload anchors only for C3 ${domain.minC3} through ${domain.maxC3} km^2/s^2; requested cell is C3=${selectedBranch.c3.toFixed(3)} km^2/s^2.`,
        `choose a vehicle whose curve covers C3=${selectedBranch.c3.toFixed(3)}, or a cell with lower C3`,
        {
          provenance: baseComputeProvenance({ includeVehicle: true }),
          validity_envelope: `Published launch-vehicle C3 domain only; ${MAX_GRID_CELLS} applies to porkchop_scan, not this single-cell call.`
        }
      );
    }
  }

  const provenance = baseComputeProvenance({
    includeVehicle: vehicle !== undefined,
    includeDeltaV: vehicle !== undefined
  });
  const stages: Array<Record<string, unknown>> = [
    {
      stage: 'geometry',
      departureDate: args.departureDate,
      arrivalDate: jdTdbToUtcDateString(cell.depJD + cell.tofDays),
      earthDepartureState: canonicalStateToKm(earthState, 'earth-ephemeris'),
      targetArrivalState: canonicalStateToKm(targetState, 'catalog-boundary')
    },
    {
      stage: 'lambert',
      selectedBranch: selectedBranch.branch,
      selectedBranchReason: 'lowest departure C3 among converged branches',
      M: args.M,
      c3: quantity(selectedBranch.c3, 'km^2/s^2', {
        confidence: 'derived',
        sourceIds: ['grid-compute']
      }),
      vInfDep: quantity(selectedBranch.vInfDep, 'km/s', {
        confidence: 'derived',
        sourceIds: ['grid-compute']
      }),
      vInfArr: quantity(selectedBranch.vInfArr, 'km/s', {
        confidence: 'derived',
        sourceIds: ['grid-compute']
      })
    },
    {
      stage: 'dla',
      frame: 'ICRF/equatorial',
      vInfComponents: {
        x: quantity(vInfComponents.x, 'km/s', {
          frame: 'ICRF/equatorial',
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        y: quantity(vInfComponents.y, 'km/s', {
          frame: 'ICRF/equatorial',
          confidence: 'derived',
          sourceIds: ['grid-compute']
        }),
        z: quantity(vInfComponents.z, 'km/s', {
          frame: 'ICRF/equatorial',
          confidence: 'derived',
          sourceIds: ['grid-compute']
        })
      },
      dla: dlaDeg === null
        ? null
        : quantity(dlaDeg, 'deg', {
            frame: 'ICRF/equatorial',
            confidence: 'derived',
            sourceIds: ['grid-compute']
          }),
      site: site
        ? {
            siteId: makeSiteId(site),
            name: site.name,
            verdict: classifyDlaForSite(dlaDeg, site),
            iMinDeg: quantity(site.iMinDeg, 'deg', {
              confidence: 'derived',
              sourceIds: ['dla-feasibility']
            }),
            dlaCeilingDeg: quantity(site.dlaCeilingDeg, 'deg', {
              confidence: 'derived',
              sourceIds: ['dla-feasibility']
            })
          }
        : null
    }
  ];

  const assumptions = [
    'Selected Lambert branch is the lowest departure C3 among converged branches for the requested M.',
    site ? `Site verdict evaluated for siteId=${makeSiteId(site)}.` : 'No launch site selected; site-band verdict omitted.'
  ];

  if (vehicle) {
    const domain = vehicleCurveDomain(vehicle);
    const payload = payloadAtC3(vehicle, selectedBranch.c3);
    const rendezvousMps = rendezvousDvFromVInf(selectedBranch.vInfArr) * 1000;
    const stationkeepingMps = 150;
    const marginMps = rendezvousMps * 0.05;
    const delivered = deliveredMassKg(vehicle, selectedBranch.c3, {
      rendezvousMps,
      stationkeepingMps,
      marginMps
    }, 'one-way');

    stages.push({
      stage: 'vehicle',
      vehicleId: makeVehicleId(vehicle),
      vehicle: {
        name: vehicle.name,
        config: vehicle.config,
        site: vehicle.site,
        asOf: vehicle.asOf
      },
      publishedC3Domain: {
        min: quantity(domain.minC3, 'km^2/s^2', {
          confidence: 'measured',
          sourceIds: ['launch-vehicles']
        }),
        max: quantity(domain.maxC3, 'km^2/s^2', {
          confidence: 'measured',
          sourceIds: ['launch-vehicles']
        })
      },
      payloadAtC3: quantity(payload as number, 'kg', {
        confidence: 'measured',
        sourceIds: ['launch-vehicles']
      })
    });

    stages.push({
      stage: 'screening-dv-and-delivered-mass',
      missionMode: 'one-way',
      budget: {
        rendezvous: quantity(rendezvousMps, 'm/s', {
          confidence: 'derived',
          sourceIds: ['delta-v-model']
        }),
        stationkeeping: quantity(stationkeepingMps, 'm/s', {
          confidence: 'assumed',
          sourceIds: ['delta-v-model']
        }),
        margin: quantity(marginMps, 'm/s', {
          confidence: 'derived',
          sourceIds: ['delta-v-model']
        })
      },
      deliveredMass: quantity(delivered as number, 'kg', {
        confidence: 'derived',
        sourceIds: ['launch-vehicles', 'delta-v-model']
      })
    });
  } else {
    assumptions.push('No vehicle selected; payload/cost stages omitted.');
  }

  return makeEnvelope({
    tool: 'explain_cell',
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
      stages
    },
    provenance,
    assumptions,
    validity_envelope: `Departure dates limited to ${computeContext.earthSpan.startDate} through ${computeContext.earthSpan.endDate}; vehicle stage refuses beyond each published C3 curve domain.`
  });
}

function canonicalStateToKm(
  state: Pick<CanonicalState, 'positionM' | 'velocityMps'>,
  sourceId: string
): Record<string, unknown> {
  return {
    position: {
      x: quantity(state.positionM.x / 1000, 'km', { confidence: 'derived', sourceIds: [sourceId] }),
      y: quantity(state.positionM.y / 1000, 'km', { confidence: 'derived', sourceIds: [sourceId] }),
      z: quantity(state.positionM.z / 1000, 'km', { confidence: 'derived', sourceIds: [sourceId] })
    },
    velocity: {
      x: quantity(state.velocityMps.x / 1000, 'km/s', { confidence: 'derived', sourceIds: [sourceId] }),
      y: quantity(state.velocityMps.y / 1000, 'km/s', { confidence: 'derived', sourceIds: [sourceId] }),
      z: quantity(state.velocityMps.z / 1000, 'km/s', { confidence: 'derived', sourceIds: [sourceId] })
    }
  };
}
