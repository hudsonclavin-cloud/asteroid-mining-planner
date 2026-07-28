// Slice 16 harness — offline mock adapter.
// MARKER: S16-LOCK-AND-HARNESS-2026-07-27-A
//
// Replays canned model replies from fixture files so the full pipeline
// (scenario -> reply -> answer-block extraction -> grader) runs end-to-end with
// no keys, no network, and no spend. This is the "dummy policy with known
// performance" sanity check that answers the "harness bug" rebuttal (§9.4).
//
// It deliberately does NOT call assertLiveAllowed: it never reaches the network,
// so gating it would only make the offline gate impossible to run.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { PATHS } from './config.mjs';

export const PROVIDER = 'mock';

/**
 * Loads a canned transcript set.
 * Shape: { name, replies: { "<scenarioId>": { "<form>": "<reply text>" } | "<reply text>" } }
 */
export function loadCannedSet(fileName) {
  const path = resolve(PATHS.fixturesDir, fileName);
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Builds an adapter with the same `complete()` signature as the live adapters.
 * Missing entries throw rather than returning empty text — a silent empty reply
 * would score as a (spurious) refusal and quietly corrupt the gate.
 */
export function createMockAdapter(cannedSet) {
  return {
    PROVIDER,
    async complete({ model, scenario, form }) {
      const perScenario = cannedSet?.replies?.[scenario.id];
      if (perScenario === undefined) {
        throw new Error(`mock-adapter: no canned reply for scenario ${scenario.id} in set "${cannedSet?.name}"`);
      }
      const text = typeof perScenario === 'string' ? perScenario : perScenario[form];
      if (typeof text !== 'string') {
        throw new Error(`mock-adapter: no canned reply for ${scenario.id}/${form} in set "${cannedSet?.name}"`);
      }
      return {
        text,
        usage: { reported: false, mock: true },
        raw: { mock: true, model: model?.id ?? 'mock-model', scenario: scenario.id, form }
      };
    }
  };
}
