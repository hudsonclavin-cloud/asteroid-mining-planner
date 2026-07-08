import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { makeEnvelope, quantity, type SourceRef } from '../envelope/index.js';
import { readRepoJson, readRepoText, gitCommitForPath } from '../resources/repo.js';
import { evidenceEnvelopeOutputSchema } from './envelope-schema.js';
import { CLOSED_WORLD_TOOL_ANNOTATIONS, toolResult } from './common.js';

const VALIDATION_SECTION_VALUES = [
  'lambert_m0',
  'lambert_multirev',
  'dla_vectors',
  'cost_oracle',
  'all'
] as const;

const LAMBERT_M0_PATH = 'tools/slice11-research/data/poliastro-validation.json';
const LAMBERT_MULTIREV_PATH = 'tools/slice11-research/data/multi-rev-poliastro-validation.json';
const DLA_VECTORS_PATH = 'tools/slice12-research/data/dla-oracle-m1-vectors.json';
const COST_ORACLE_PATH = 'tools/slice13-research/elvperf/oracle/oracle-report.md';

export const getValidationReportInputSchema = z.object({
  section: z.enum(VALIDATION_SECTION_VALUES).default('all')
});

type LambertM0Artifact = {
  generatedAt: string;
  gridSize: { departure: number; tof: number };
  summary: { maxRelErrorAcrossBodies: number; validationPasses: boolean };
};

type MultiRevArtifact = {
  generated: string;
  gridSize: string;
  overallMaxRelError: number;
  auditTargetScope: string;
  methodsNote: string;
};

type DlaVectorsArtifact = {
  generatedAt: string;
  harness: {
    gridSizePerBody: { departure: number; tof: number };
    productionPathReplica: string;
  };
  summary: {
    maxAngularSeparationDeg: number;
    maxAbsDeltaDlaDeg: number;
  };
};

export function registerGetValidationReportTool(server: McpServer): void {
  server.registerTool(
    'get_validation_report',
    {
      title: 'Read committed validation reports',
      description: 'Read the committed solver-validation artifacts without recomputing them. Figures are class-labeled so M=0, multi-rev magnitude-only, DLA vectors, and cost STRICT/OBSERVED surfaces cannot be conflated.',
      inputSchema: getValidationReportInputSchema,
      outputSchema: evidenceEnvelopeOutputSchema,
      annotations: CLOSED_WORLD_TOOL_ANNOTATIONS
    },
    async (args) => toolResult(await runGetValidationReport(args))
  );
}

export async function runGetValidationReport(args: z.output<typeof getValidationReportInputSchema>) {
  const sections = await loadValidationSections();
  const selectedEntries = args.section === 'all'
    ? Object.entries(sections)
    : Object.entries(sections).filter(([key]) => key === args.section);

  const provenance = selectedEntries.flatMap(([, section]) => section.provenance);
  const uniqueProvenance = provenance.filter(
    (candidate, index) => provenance.findIndex((ref) => ref.id === candidate.id) === index
  );

  return makeEnvelope({
    tool: 'get_validation_report',
    value: {
      sections: Object.fromEntries(selectedEntries.map(([key, section]) => [key, section.value]))
    },
    provenance: uniqueProvenance,
    assumptions: selectedEntries.flatMap(([, section]) => section.assumptions),
    validity_envelope: 'Committed validation artifacts only; this tool reads recorded measurements and does not recompute them.'
  });
}

async function loadValidationSections() {
  const [lambertM0, multiRev, dlaVectors, costOracleText] = await Promise.all([
    readRepoJson<LambertM0Artifact>(LAMBERT_M0_PATH),
    readRepoJson<MultiRevArtifact>(LAMBERT_MULTIREV_PATH),
    readRepoJson<DlaVectorsArtifact>(DLA_VECTORS_PATH),
    readRepoText(COST_ORACLE_PATH)
  ]);

  const costOracle = parseCostOracleReport(costOracleText);

  return {
    lambert_m0: {
      provenance: [artifactRef('lambert-m0-artifact', LAMBERT_M0_PATH, 'M=0 poliastro validation artifact.')],
      assumptions: [
        `Grid size ${lambertM0.gridSize.departure}x${lambertM0.gridSize.tof}; committed artifact generated ${lambertM0.generatedAt}.`
      ],
      value: {
        label: 'M=0 vs poliastro',
        maxRelError: quantity(lambertM0.summary.maxRelErrorAcrossBodies, 'relative error', {
          confidence: 'measured',
          sourceIds: ['lambert-m0-artifact']
        }),
        validationPasses: lambertM0.summary.validationPasses
      }
    },
    lambert_multirev: {
      provenance: [artifactRef('lambert-multirev-artifact', LAMBERT_MULTIREV_PATH, 'Multi-revolution magnitude-only validation artifact.')],
      assumptions: [
        `Grid size ${multiRev.gridSize}; committed artifact generated ${multiRev.generated}.`,
        multiRev.auditTargetScope,
        multiRev.methodsNote
      ],
      value: {
        label: 'multi-rev magnitude-only',
        maxRelError: quantity(multiRev.overallMaxRelError, 'relative error', {
          confidence: 'measured',
          sourceIds: ['lambert-multirev-artifact']
        })
      }
    },
    dla_vectors: {
      provenance: [artifactRef('dla-vectors-artifact', DLA_VECTORS_PATH, 'M=1 DLA vector-level validation artifact.')],
      assumptions: [
        `Grid size ${dlaVectors.harness.gridSizePerBody.departure}x${dlaVectors.harness.gridSizePerBody.tof}; committed artifact generated ${dlaVectors.generatedAt}.`,
        dlaVectors.harness.productionPathReplica
      ],
      value: {
        label: 'vector-level DLA (M=1)',
        maxAngularSeparationDeg: quantity(dlaVectors.summary.maxAngularSeparationDeg, 'deg', {
          confidence: 'measured',
          sourceIds: ['dla-vectors-artifact']
        }),
        maxAbsDeltaDlaDeg: quantity(dlaVectors.summary.maxAbsDeltaDlaDeg, 'deg', {
          confidence: 'measured',
          sourceIds: ['dla-vectors-artifact']
        })
      }
    },
    cost_oracle: {
      provenance: [artifactRef('cost-oracle-artifact', COST_ORACLE_PATH, 'Held-out elvperf oracle report with STRICT and OBSERVED classes.')],
      assumptions: [
        'STRICT and OBSERVED are distinct classes and are reported separately by design.',
        costOracle.strict.line,
        costOracle.observed.line
      ],
      value: {
        label: 'cost oracle',
        strict: {
          label: 'STRICT',
          maxErrorPct: quantity(costOracle.strict.maxPct, '%', {
            confidence: 'measured',
            sourceIds: ['cost-oracle-artifact']
          }),
          rmsErrorPct: quantity(costOracle.strict.rmsPct, '%', {
            confidence: 'measured',
            sourceIds: ['cost-oracle-artifact']
          })
        },
        observed: {
          label: 'OBSERVED',
          maxErrorPct: quantity(costOracle.observed.maxPct, '%', {
            confidence: 'measured',
            sourceIds: ['cost-oracle-artifact']
          }),
          rmsErrorPct: quantity(costOracle.observed.rmsPct, '%', {
            confidence: 'measured',
            sourceIds: ['cost-oracle-artifact']
          })
        }
      }
    }
  };
}

function artifactRef(id: string, path: string, note: string): SourceRef {
  return {
    id,
    kind: 'repo',
    path,
    commit: gitCommitForPath(path),
    confidence: 'measured',
    note
  };
}

function parseCostOracleReport(text: string) {
  const strictMax = text.match(/\*\*Max \|error\|:\*\* ([0-9.]+)% \(New Glenn @ C3=15\)/);
  const strictRms = text.match(/## STRICT verdict: PASS[\s\S]*?\*\*RMS \|error\|:\*\* ([0-9.]+)%/);
  const observedMax = text.match(/\*\*Max \|error\|:\*\* ([0-9.]+)% \(New Glenn @ C3=25\)/);
  const observedRms = text.match(/## OBSERVED summary[\s\S]*?\*\*RMS \|error\|:\*\* ([0-9.]+)%/);
  const strictLine = text.match(/- \*\*Max \|error\|:\*\* 1\.18% \(New Glenn @ C3=15\)/);
  const observedLine = text.match(/- \*\*Max \|error\|:\*\* 3\.11% \(New Glenn @ C3=25\)/);

  if (!strictMax || !strictRms || !observedMax || !observedRms || !strictLine || !observedLine) {
    throw new Error('Cost oracle report no longer matches the committed STRICT/OBSERVED summary format');
  }

  return {
    strict: {
      maxPct: Number(strictMax[1]),
      rmsPct: Number(strictRms[1]),
      line: strictLine[0]
    },
    observed: {
      maxPct: Number(observedMax[1]),
      rmsPct: Number(observedRms[1]),
      line: observedLine[0]
    }
  };
}
