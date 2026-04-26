import type { InvariantId } from '../types.js';

export interface InvariantViolation {
  readonly invariantId: InvariantId;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly fatal: boolean;
}

export type InvariantViolationHandler = (violation: InvariantViolation) => void;

export interface InvariantRuntimeOptions {
  readonly mode?: 'throw' | 'report';
  readonly onViolation?: InvariantViolationHandler;
}

const defaultViolationHandler: InvariantViolationHandler = (violation) => {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('[v2-core invariant]', violation);
  }
};

let invariantRuntimeMode: 'throw' | 'report' = 'throw';
let invariantViolationHandler: InvariantViolationHandler = defaultViolationHandler;

export class AssertError extends Error {
  readonly invariantId: InvariantId;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    invariantId: InvariantId,
    message: string,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(`${invariantId}: ${message}`);
    this.name = 'AssertError';
    this.invariantId = invariantId;
    this.details = details;
  }
}

export function configureInvariantRuntime(
  options: InvariantRuntimeOptions = {}
): void {
  if (options.mode) {
    invariantRuntimeMode = options.mode;
  }
  if (options.onViolation) {
    invariantViolationHandler = options.onViolation;
  }
}

export function resetInvariantRuntime(): void {
  invariantRuntimeMode = 'throw';
  invariantViolationHandler = defaultViolationHandler;
}

export function failInvariant(
  invariantId: InvariantId,
  message: string,
  details?: Readonly<Record<string, unknown>>,
  fatal = true
): never | void {
  const violation: InvariantViolation = {
    invariantId,
    message,
    details,
    fatal,
  };

  if (invariantRuntimeMode === 'throw' || fatal) {
    throw new AssertError(invariantId, message, details);
  }

  invariantViolationHandler(violation);
}
