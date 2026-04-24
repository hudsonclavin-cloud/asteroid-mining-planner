/**
 * Reference mission cost anchors — real NASA/JPL missions used to calibrate
 * the planner's cost estimates and give users a grounding in real numbers.
 * Source: index.html lines ~5388–5390 (DART, OSIRIS-REx, KISS).
 */

export interface ReferenceMission {
  name: string;
  cost: string;
  url?: string;
}

/**
 * Publicly known mission costs used as anchors in the economics panel.
 * All figures are approximate total mission costs (development + operations).
 */
export const REFERENCE_MISSIONS: ReferenceMission[] = [
  { name: 'DART (kinetic impactor)',      cost: '$324M',  url: 'https://dart.jhuapl.edu/' },
  { name: 'OSIRIS-REx (sample return)',   cost: '$1.16B', url: 'https://www.asteroidmission.org/' },
  { name: 'KISS asteroid capture study',  cost: '$2.6B',  url: 'https://kiss.caltech.edu/' },
];
