/**
 * Time state — the sim clock and playback controls.
 * Owns: currentJD, simSpeed, isPlaying, isScrubbing and their setters.
 * Source: index.html lines ~2707–2755.
 *
 * TODO: import worker, getTimelineBounds, scrubber from their src/ modules once Stage 9 wires up.
 */

/** J2000 epoch (2000-Jan-01.5) in Julian Date. */
export const J2000 = 2451545.0;

/** Julian Date of today at startup — used as the initial sim clock value. */
export const TODAY_JD = J2000 + (Date.now() / 86400000 - 10957.5);

/** Current simulation Julian Date. Advance by setCurrentJD(). */
export let currentJD: number = TODAY_JD;

/** JD value of the last propagate message actually sent; prevents flooding the worker when paused. */
export let lastPropJD: number = -Infinity;

/** Simulation speed multiplier (days/second). 0 = paused. */
export let simSpeed: number = 0;

/** Whether the sim clock is actively advancing. */
export let isPlaying: boolean = false;

/** Speed to resume when ▶ is pressed after a pause. */
export let lastSpeed: number = 1;

/** Timestamp (performance.now()) of the last propagate request — used to throttle. */
export let lastPropagateRequestMs: number = 0;

/** Whether the timeline scrubber is actively being dragged. */
export let isScrubbing: boolean = false;

/** Last JD value sent to the worker (used to skip redundant sends). */
export let lastSentJD: number | null = null;

// Setters — these maintain the mutable state across modules
export function setCurrentJD(jd: number) { currentJD = jd; }
export function setLastPropJD(jd: number) { lastPropJD = jd; }
export function setSimSpeed(s: number) { simSpeed = s; }
export function setIsPlaying(v: boolean) { isPlaying = v; }
export function setLastSpeed(s: number) { lastSpeed = s; }
export function setLastPropagateRequestMs(t: number) { lastPropagateRequestMs = t; }
export function setIsScrubbing(v: boolean) { isScrubbing = v; }
export function setLastSentJD(jd: number | null) { lastSentJD = jd; }

export const SCRUBBER_MIN = TODAY_JD - 365 * 3;
export const SCRUBBER_MAX = TODAY_JD + 365 * 5;

export function getTimelineBounds(): { min: number; max: number } {
  return { min: SCRUBBER_MIN, max: SCRUBBER_MAX };
}

export function clampJD(jd: number): number {
  return Math.max(SCRUBBER_MIN, Math.min(SCRUBBER_MAX, Number(jd)));
}
