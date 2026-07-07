export type Confidence = 'measured' | 'derived' | 'assumed';

export type SourceRef =
  | {
      id?: string;
      kind: 'repo';
      path: string;
      commit: string;
      confidence: Confidence;
      note?: string;
    }
  | {
      id?: string;
      kind: 'external';
      name: string;
      url?: string;
      retrieved: string;
      confidence: Confidence;
      note?: string;
    }
  | {
      id?: string;
      kind: 'computation';
      method: string;
      code: { path: string; commit: string };
      confidence: 'derived';
      note?: string;
    };

export interface Quantity {
  value: number;
  units: string;
  frame?: string;
  confidence?: Confidence;
  sourceIds?: string[];
}

export interface Coverage {
  returned: number;
  total: number;
  selection_rule: string;
}

export type RefusalCode = 'insufficient_data' | 'out_of_envelope' | 'not_found';

export interface Refusal {
  code: RefusalCode;
  reason: string;
  what_would_help: string;
}

export interface EvidenceEnvelope<T> {
  envelope_version: '1';
  tool: string;
  as_of?: string;
  value: T | null;
  confidence: Confidence;
  provenance: SourceRef[];
  assumptions: string[];
  validity_envelope: string;
  coverage?: Coverage;
  refusal?: Refusal;
}

export interface QuantityOptions {
  frame?: string;
  confidence?: Confidence;
  sourceIds?: string[];
}

export interface EnvelopeInput<T> {
  tool: string;
  as_of?: string;
  value: T;
  confidence?: Confidence;
  provenance: SourceRef[];
  assumptions?: string[];
  validity_envelope: string;
  coverage?: Coverage;
}

export interface RefusalInput {
  as_of?: string;
  provenance?: SourceRef[];
  assumptions?: string[];
  validity_envelope?: string;
  coverage?: Coverage;
}

const CONFIDENCE_RANK: Record<Confidence, number> = {
  assumed: 0,
  derived: 1,
  measured: 2
};

const REFUSAL_CODES = new Set<RefusalCode>([
  'insufficient_data',
  'out_of_envelope',
  'not_found'
]);

export function quantity(
  value: number,
  units: string,
  options: QuantityOptions = {}
): Quantity {
  if (!Number.isFinite(value)) {
    throw new TypeError('Quantity value must be finite');
  }
  if (units.trim().length === 0) {
    throw new TypeError('Quantity units must be non-empty');
  }

  return {
    value,
    units,
    ...(options.frame !== undefined ? { frame: options.frame } : {}),
    ...(options.confidence !== undefined ? { confidence: options.confidence } : {}),
    ...(options.sourceIds !== undefined ? { sourceIds: [...options.sourceIds] } : {})
  };
}

export function confidenceMin(provenance: SourceRef[]): Confidence {
  if (provenance.length === 0) {
    throw new TypeError('Cannot compute confidence for empty provenance');
  }

  return provenance.reduce<Confidence>((weakest, source) => {
    return CONFIDENCE_RANK[source.confidence] < CONFIDENCE_RANK[weakest]
      ? source.confidence
      : weakest;
  }, 'measured');
}

export function makeEnvelope<T>(input: EnvelopeInput<T>): EvidenceEnvelope<T> {
  assertNonEmpty(input.tool, 'tool');
  assertNonEmpty(input.validity_envelope, 'validity_envelope');

  if (input.value === null || input.value === undefined) {
    throw new TypeError('makeEnvelope requires a non-null value; use refuse() for refusals');
  }
  if (input.provenance.length === 0) {
    throw new TypeError('Value envelopes require non-empty provenance');
  }

  assertFiniteDeep(input.value, 'value');
  assertMixedProvenanceLeaves(input.value, input.provenance);

  const envelope: EvidenceEnvelope<T> = {
    envelope_version: '1',
    tool: input.tool,
    ...(input.as_of !== undefined ? { as_of: input.as_of } : {}),
    value: input.value,
    confidence: confidenceMin(input.provenance),
    provenance: [...input.provenance],
    assumptions: [...(input.assumptions ?? [])],
    validity_envelope: input.validity_envelope,
    ...(input.coverage !== undefined ? { coverage: input.coverage } : {})
  };

  const dangling = validateLeafRefs(envelope);
  if (dangling.length > 0) {
    throw new TypeError(`Quantity sourceIds not found in provenance: ${dangling.join(', ')}`);
  }

  return envelope;
}

export function refuse(
  tool: string,
  code: RefusalCode,
  reason: string,
  what_would_help: string,
  extras: RefusalInput = {}
): EvidenceEnvelope<null> {
  assertNonEmpty(tool, 'tool');
  assertNonEmpty(reason, 'reason');
  assertNonEmpty(what_would_help, 'what_would_help');

  if (!REFUSAL_CODES.has(code)) {
    throw new TypeError(`Unknown refusal code: ${code}`);
  }

  const provenance = [...(extras.provenance ?? [])];

  return {
    envelope_version: '1',
    tool,
    ...(extras.as_of !== undefined ? { as_of: extras.as_of } : {}),
    value: null,
    confidence: provenance.length > 0 ? confidenceMin(provenance) : 'assumed',
    provenance,
    assumptions: [...(extras.assumptions ?? [])],
    validity_envelope: extras.validity_envelope ?? 'not evaluated',
    ...(extras.coverage !== undefined ? { coverage: extras.coverage } : {}),
    refusal: {
      code,
      reason,
      what_would_help
    }
  };
}

export function validateLeafRefs(envelope: EvidenceEnvelope<unknown>): string[] {
  const available = new Set(
    envelope.provenance
      .map((source) => source.id)
      .filter((id): id is string => id !== undefined)
  );
  const dangling = new Set<string>();

  walk(envelope.value, (candidate) => {
    if (!isQuantity(candidate)) {
      return;
    }

    for (const sourceId of candidate.sourceIds ?? []) {
      if (!available.has(sourceId)) {
        dangling.add(sourceId);
      }
    }
  });

  return [...dangling].sort();
}

function assertMixedProvenanceLeaves(value: unknown, provenance: SourceRef[]): void {
  const uniqueConfidences = new Set(provenance.map((source) => source.confidence));
  const leafBindingRequired = provenance.length > 1 || uniqueConfidences.size > 1;

  if (!leafBindingRequired) {
    return;
  }

  walk(value, (candidate) => {
    if (!isQuantity(candidate)) {
      return;
    }

    if (candidate.confidence === undefined) {
      throw new TypeError('Mixed-provenance Quantity leaves require confidence');
    }
    if (candidate.sourceIds === undefined || candidate.sourceIds.length === 0) {
      throw new TypeError('Mixed-provenance Quantity leaves require sourceIds');
    }
  });
}

function assertFiniteDeep(value: unknown, path: string): void {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Non-finite number at ${path}`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteDeep(item, `${path}[${index}]`));
    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      assertFiniteDeep(child, `${path}.${key}`);
    }
  }
}

function walk(value: unknown, visit: (value: unknown) => void): void {
  visit(value);

  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, visit));
    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) {
      walk(child, visit);
    }
  }
}

function isQuantity(value: unknown): value is Quantity {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as Quantity).value === 'number' &&
    typeof (value as Quantity).units === 'string'
  );
}

function assertNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new TypeError(`${field} must be non-empty`);
  }
}
