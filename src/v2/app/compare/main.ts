// A4 compare page — /v2/compare/ (S-S17-A4-2026-08-09-A).
//
// RENDERING LAYER ONLY. This page computes nothing: it calls
// computeCompareData() (src/v2/porkchop/compare-data.ts, committed 873e7ef)
// and displays the per-body results honestly. If a number is needed that the
// contract does not expose, the answer is to extend the contract, not to
// compute it here.
//
// Two inherited facts that must not be rediscovered:
//
//  1. AXIS ORDER IS ALREADY HANDLED. grid-compute is TOF-fastest
//     (index = depIdx * nTof + tofIdx); segmentWindows is departure-fastest
//     (index = depIdx + nDep * tofIdx). They are transposes, and
//     compare-data.ts:toSegmentGrid() performs the remap. The thumbnail below
//     reads result.grid.cells, which is the RAW grid-compute layout, and uses
//     that layout's own indexing. It never touches segmentation indices.
//
//  2. SHARED SCALE IS FREE, AND MUST NOT BE BROKEN. colorForPorkchopCell has
//     fixed global bounds (C3_COLOR_MIN 1 / C3_COLOR_MAX 1000, log viridis)
//     and takes no domain argument, so every thumbnail shares one C3 scale by
//     construction. Dep/TOF extents are shared because one CompareDataParams
//     drives every body. Do NOT introduce per-thumbnail autoscaling — that is
//     the only way to make the comparison lie.
//
// Copy rules in force: INV-026 (every displayed number derives from the
// computation, never a literal), INV-025 (no bare internal identifiers in
// user-facing copy), SLICE_17_FOUNDING.md §8 AMENDMENT A2 (a breadth day-span
// is NEVER displayed alone — always with the cell count and the sampling
// interval, day values at 3 significant figures).

import { h, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { ingestSlice2Fixture, type HorizonsFixture } from '../../boundary/horizons.js';
import { loadLambertScreenCacheAsync } from '../../boundary/lambert-screen-cache.js';
import { interpolateBodyStateSeries } from '../../core/interpolators/hermite.js';
import { propagateKeplerianStateVectors } from '../../core/propagators/keplerian.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../../core/units.js';
import type { CanonicalState } from '../../core/types.js';
import { colorForPorkchopCell } from '../../porkchop/colormap.js';
import {
  computeCompareData,
  type CompareBodyInput,
  type CompareBodyOk,
  type CompareBodyRefusal,
  type CompareBodyResult,
  type CompareEcho,
} from '../../porkchop/compare-data.js';
import { COMPARE_BODIES_CAP, parseCompareBodies } from '../../porkchop/compare-url.js';
import { formatC3 } from '../../porkchop/format-c3.js';
import type { PorkchopCell } from '../../porkchop/grid-compute.js';
import {
  deterministicMarginMps,
  isBeyondCurve,
  isInvalidInput,
  LAUNCH_VEHICLES,
  SPACECRAFT_STATIONKEEPING_MPS,
  type DeliveredMassResult,
} from '../../porkchop/launch-vehicles.js';
import type { WindowComponent } from '../../porkchop/segment-windows.js';
import { setSelectedBodySet } from '../ui-store/store.js';
import { loadSlice9NeaCatalogFixture } from '../solar-system/loader.js';

const HORIZONS_FIXTURE_URL = new URL(
  '../../data/horizons-inner-solar-system-2026-2040.json',
  import.meta.url,
);

/** UTC calendar midnight -> JD (TDB). Derived, never a literal: this is the
 * D-02-required `span.requested.start` anchor. Feeding the fixture's first
 * SAMPLE instead (69.184 s earlier) shifts departure dates by a day at the
 * span edges. */
function utcMidnightToJdTdb(utcDate: string): number {
  const utcMillis = Date.parse(`${utcDate}T00:00:00Z`);
  if (!Number.isFinite(utcMillis)) {
    throw new Error(`Invalid UTC date '${utcDate}'`);
  }
  const unixToJ2000Seconds = 946_728_000;
  const tdbMinusUtcSeconds = 69.184;
  const tdbSecondsSinceJ2000 =
    utcMillis / 1000 - unixToJ2000Seconds + tdbMinusUtcSeconds;
  return J2000_TDB_JULIAN_DATE + tdbSecondsSinceJ2000 / SECONDS_PER_DAY;
}

function tdbSecondsToJd(tdbSeconds: number): number {
  return J2000_TDB_JULIAN_DATE + tdbSeconds / SECONDS_PER_DAY;
}

const DEPARTURE_WINDOW_START_UTC = '2026-01-01';
const DEPARTURE_WINDOW_END_UTC = '2040-01-01';

/** Locked compare resolution. */
const N_DEP = 731;
const N_TOF = 100;
const TOF_MIN_DAYS = 182.5;
const TOF_MAX_DAYS = 1826.25;
const DELTA_KM2S2 = 5;
const B_MIN_CELLS = 2;

/**
 * FIXED REFERENCE rendezvous budget. Rendezvous ΔV is physically per-body — it
 * follows from the arrival v-infinity of each body's own best window — but the
 * data contract takes ONE budget for the whole comparison and the best-window
 * summary does not carry v-infinity. Rather than silently apply one body's ΔV
 * to all five, the page computes every mass against this stated reference
 * budget and says so on the surface. Per-body budgets are a contract change.
 */
const REFERENCE_RENDEZVOUS_MPS = 1000;

interface PageData {
  readonly results: readonly CompareBodyResult[];
  readonly labels: ReadonlyMap<string, string>;
  readonly vehicleName: string;
  readonly ephemerisSpan: { readonly firstJd: number; readonly lastJd: number };
  readonly totalComputeMs: number;
}

// ---------------------------------------------------------------------------
// Formatting — all inputs come from the computation
// ---------------------------------------------------------------------------

/** Day values at 3 significant figures (AMENDMENT A2). */
function formatDays(days: number): string {
  return days.toPrecision(3);
}

const C3_UNITS = 'km²/s²';

/** formatC3 emits a bare number at the shared 3-sig-fig precision; energies in
 * running prose need their unit or the sentence is ambiguous. Non-finite and
 * null pass through unadorned — "— km²/s²" reads as a broken value. */
function formatC3WithUnits(c3: number | null): string {
  if (c3 === null || !Number.isFinite(c3)) {
    return formatC3(c3);
  }
  return `${formatC3(c3)} ${C3_UNITS}`;
}

/**
 * AMENDMENT A2 breadth copy rule, verbatim shape: a day-span is NEVER shown
 * alone. `samplingDays` MUST come from echo.depCellDays — it is NOT recoverable
 * from the component, because breadthDays / (breadthCells - 1) divides by zero
 * for every single-cell window, and single-cell windows are the common case.
 */
function formatBreadth(component: WindowComponent, samplingDays: number): string {
  const departures = component.breadthCells === 1 ? 'departure' : 'departures';
  return (
    `${formatDays(component.breadthDays)} d window — ` +
    `${component.breadthCells} ${departures} in this window, ` +
    `${formatDays(samplingDays)} d sampling`
  );
}

function formatComputeTime(totalComputeMs: number): string {
  const roundedMs = Math.round(totalComputeMs);
  return roundedMs < 1 ? '< 1 ms (cached grids)' : `${roundedMs} ms`;
}

function formatMassKg(massKg: number): string {
  // A confident "0 kg" overstates precision when exp() underflows; the porkchop
  // page floors the same way.
  if (massKg < 0.5) {
    return '< 1 kg';
  }
  return `${Math.round(massKg).toLocaleString('en-US')} kg`;
}

interface MassCell {
  readonly text: string;
  readonly tone: 'value' | 'negative' | 'error';
  readonly note: string | null;
}

/**
 * Delivered-mass rendering across every reachable outcome.
 *
 * `null` occurs if and only if there is no practical window: compare-data
 * assigns it only in that branch, and deliveredMassKg itself never returns
 * null — it reports failure through the beyond-curve / invalid-input
 * sentinels. So a null mass is the no-window row's mass cell, while a SENTINEL
 * is a genuinely different state: the window is real and good, and only the
 * mass could not be produced. Those must not look alike, or a reviewer reads a
 * vehicle limitation as a bad window.
 */
function describeMass(mass: DeliveredMassResult | null, vehicleName: string): MassCell {
  if (mass === null) {
    return { text: '—', tone: 'negative', note: 'no practical window' };
  }
  if (isBeyondCurve(mass)) {
    return {
      text: 'beyond curve',
      tone: 'negative',
      note: `departure energy is past the published performance curve for ${vehicleName}; the window itself is unaffected`,
    };
  }
  if (isInvalidInput(mass)) {
    return {
      text: 'unavailable',
      tone: 'error',
      note: 'delivered mass could not be computed from the configured ΔV budget',
    };
  }
  return { text: formatMassKg(mass), tone: 'value', note: null };
}

// ---------------------------------------------------------------------------
// Porkchop thumbnail — lazy, shared scale, raw grid-compute layout
// ---------------------------------------------------------------------------

function drawThumbnail(canvas: HTMLCanvasElement, cells: readonly PorkchopCell[]): void {
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }
  const offscreen = document.createElement('canvas');
  offscreen.width = N_DEP;
  offscreen.height = N_TOF;
  const offscreenContext = offscreen.getContext('2d');
  if (!offscreenContext) {
    return;
  }
  const image = offscreenContext.createImageData(N_DEP, N_TOF);

  for (let depIdx = 0; depIdx < N_DEP; depIdx += 1) {
    for (let tofIdx = 0; tofIdx < N_TOF; tofIdx += 1) {
      // grid-compute layout: TOF varies fastest.
      const cell = cells[depIdx * N_TOF + tofIdx];
      const branch = cell && cell.selectedBranch !== null
        ? cell.branches[cell.selectedBranch]
        : undefined;
      const rgb = colorForPorkchopCell(cell?.status ?? 'no_solution', branch?.c3 ?? null);
      // Low TOF at the bottom, matching the dedicated porkchop view.
      const rowFromTop = N_TOF - 1 - tofIdx;
      const base = (rowFromTop * N_DEP + depIdx) * 4;
      image.data[base] = rgb[0];
      image.data[base + 1] = rgb[1];
      image.data[base + 2] = rgb[2];
      image.data[base + 3] = 255;
    }
  }

  offscreenContext.putImageData(image, 0, 0);
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
}

function PorkchopThumbnail(props: { readonly cells: readonly PorkchopCell[] }) {
  return h('canvas', {
    width: 731,
    height: 100,
    style: 'width:100%;max-width:731px;height:120px;display:block;image-rendering:pixelated;border:1px solid rgba(255,255,255,0.12);border-radius:4px;',
    ref: (canvas: HTMLCanvasElement | null) => {
      if (canvas) {
        drawThumbnail(canvas, props.cells);
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

const CELL_STYLE = 'padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;font-size:13px;';
const NOTE_STYLE = 'display:block;margin-top:4px;font-size:11px;color:#94a3b8;line-height:1.5;';

function refusalCopy(reason: string, detail: string): { title: string; body: string } {
  if (reason === 'out-of-bounds') {
    return {
      title: 'outside ephemeris coverage',
      body: `The requested departure window is not fully covered by the loaded Earth ephemeris, so no grid was computed. ${detail}`,
    };
  }
  if (reason === 'no-convergence') {
    // Deliberately different in kind from the no-practical-window row above:
    // there is no floor here, so there is nothing to loosen toward.
    return {
      title: 'No viable transfer in span',
      body: `No departure in the window produced a converged transfer, so there is no departure-energy floor to report. ${detail}`,
    };
  }
  return {
    title: 'not compared',
    body: `This body was not included in the comparison. ${detail}`,
  };
}

/**
 * A convergent body with no practical window is NOT the same answer as a body
 * with no viable transfer, and the two must never render as matching empty
 * cells: one says "loosen something", the other says "impossible". This row
 * names the floor that was found and, crucially, WHICH constraint is actually
 * binding — because those are two different levers:
 *
 *   - no components at all  -> the THRESHOLD is binding. Loosening it admits
 *     windows.
 *   - components exist but none is wide enough -> the BREADTH qualifier is
 *     binding. Loosening the threshold does nothing; the opportunities are
 *     real but too narrow to qualify.
 *
 * 163693 is the second case, not the first: at Δ=5 it has five windows under
 * the threshold and every one of them is a single departure. Telling a
 * reviewer "no window at or below T" there would be false — there are five —
 * and would point them at the one lever that cannot help.
 */
function describeNoPracticalWindow(
  segmentation: CompareBodyOk['segmentation'],
  echo: CompareEcho,
  bMinCells: number,
): { headline: string; note: string } {
  const thresholdText = formatC3WithUnits(segmentation.threshold.valueKm2S2);
  const floorText = formatC3WithUnits(echo.liveMin ?? Number.NaN);

  if (segmentation.components.length === 0) {
    return {
      headline: `No window at or below ${thresholdText}`,
      note:
        `Best departure energy found anywhere in the grid: ${floorText}. ` +
        `The threshold is the binding constraint here.`,
    };
  }

  const widestCells = segmentation.components.reduce(
    (widest, component) => Math.max(widest, component.breadthCells),
    0,
  );
  const count = segmentation.components.length;
  return {
    headline: `${count} window${count === 1 ? '' : 's'} found, ${count === 1 ? 'it is' : 'none'} wide enough`,
    note:
      `Every window at or below ${thresholdText} is too narrow to qualify — the widest spans ` +
      `${widestCells} departure${widestCells === 1 ? '' : 's'}, and ${bMinCells} are required. ` +
      `Best departure energy ${floorText}. The breadth qualifier is binding, not the threshold.`,
  };
}

/** Explicit predicate rather than `!result.ok`: this project compiles with
 * `strict: false`, under which truthiness narrowing to the false-discriminant
 * member of a union is unreliable. */
function isRefusal(result: CompareBodyResult): result is CompareBodyRefusal {
  return result.ok === false;
}

function renderRefusalRow(result: CompareBodyRefusal, label: string) {
  const copy = refusalCopy(result.reason, result.detail);
  return h('tr', { key: result.bodyId, style: 'background:rgba(148,163,184,0.05);' }, [
    h('td', { style: CELL_STYLE }, [
      h('strong', null, label),
      h('span', { style: NOTE_STYLE }, result.bodyId),
    ]),
    h('td', { style: CELL_STYLE, colSpan: 5 }, [
      h('span', { style: 'color:#cbd5e1;' }, copy.title),
      h('span', { style: NOTE_STYLE }, copy.body),
    ]),
  ]);
}

function renderOkRow(
  result: CompareBodyOk,
  label: string,
  vehicleName: string,
  expanded: boolean,
  onToggle: () => void,
) {
  const { segmentation, echo } = result;
  const best = segmentation.bestPractical;
  const mass = describeMass(result.deliveredMass, vehicleName);
  const massColor =
    mass.tone === 'value' ? '#eef2ff' : mass.tone === 'error' ? '#fca5a5' : '#cbd5e1';

  // Widest window by departure breadth — the A2 triple renders it.
  const widest = segmentation.components.reduce<WindowComponent | null>(
    (widestSoFar, component) =>
      widestSoFar === null || component.breadthCells > widestSoFar.breadthCells
        ? component
        : widestSoFar,
    null,
  );

  const globalMinLine = `global minimum ${formatC3WithUnits(echo.liveMin ?? Number.NaN)} (${echo.nDep}×${echo.nTof} grid)`;

  return h('tr', { key: result.bodyId }, [
    h('td', { style: CELL_STYLE }, [
      h('strong', null, label),
      h('span', { style: NOTE_STYLE }, result.bodyId),
      h(
        'button',
        {
          onClick: onToggle,
          style: 'margin-top:8px;font-size:11px;padding:4px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#cbd5e1;cursor:pointer;',
        },
        expanded ? 'hide porkchop' : 'show porkchop',
      ),
    ]),

    // Best practical window — or the honest negative, which names its own
    // binding constraint (see describeNoPracticalWindow).
    h('td', { style: CELL_STYLE }, best === null
      ? (() => {
          const copy = describeNoPracticalWindow(segmentation, echo, B_MIN_CELLS);
          return [
            h('span', { style: 'color:#cbd5e1;' }, copy.headline),
            h('span', { style: NOTE_STYLE }, copy.note),
            h('span', { style: NOTE_STYLE }, globalMinLine),
          ];
        })()
      : [
          h('span', { style: 'color:#eef2ff;font-weight:600;' }, formatC3WithUnits(best.c3)),
          h('span', { style: NOTE_STYLE }, `departs ${best.argmin.dateIso} · ${formatDays(best.argmin.tofDays)} d transfer`),
          h('span', { style: NOTE_STYLE }, globalMinLine),
        ]),

    // Distinct opportunities at the active threshold.
    h('td', { style: CELL_STYLE }, [
      h('span', null, String(segmentation.components.length)),
      h('span', { style: NOTE_STYLE }, `${segmentation.practical.length} meet the breadth qualifier`),
    ]),

    // Widest window — A2 triple, sampling interval from the echo.
    h('td', { style: CELL_STYLE }, widest === null
      ? h('span', { style: 'color:#94a3b8;' }, '—')
      : h('span', null, formatBreadth(widest, echo.depCellDays))),

    // Delivered mass.
    h('td', { style: CELL_STYLE }, [
      h('span', { style: `color:${massColor};` }, mass.text),
      mass.note ? h('span', { style: NOTE_STYLE }, mass.note) : null,
    ]),

    h('td', { style: CELL_STYLE }, [
      h('span', null, formatC3WithUnits(segmentation.threshold.valueKm2S2)),
      h('span', { style: NOTE_STYLE }, segmentation.threshold.mode === 'relative'
        ? `${echo.deltaKm2S2} ${C3_UNITS} above this body's own floor of ${formatC3WithUnits(echo.liveMin ?? Number.NaN)}`
        : `disclosed screening boundary, ${formatC3WithUnits(echo.absoluteKm2S2)}`),
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// Method badge (provenance)
// ---------------------------------------------------------------------------

function MethodBadge(props: {
  readonly echo: CompareEcho | null;
  readonly ephemerisSpan: { readonly firstJd: number; readonly lastJd: number };
  readonly vehicleName: string;
  readonly totalComputeMs: number;
}) {
  const { echo } = props;
  const lines: string[] = [
    'Method — Lambert patched-conic screen, the same solver the porkchop view uses.',
  ];
  if (echo) {
    lines.push(
      `Grid — ${echo.nDep} departures × ${echo.nTof} transfer times, sampled every ${formatDays(echo.depCellDays)} d.`,
    );
  }
  lines.push(
    `Departure window — ${DEPARTURE_WINDOW_START_UTC} to ${DEPARTURE_WINDOW_END_UTC} (UTC).`,
    `Ephemeris — Horizons inner-solar-system series, covering JD ${props.ephemerisSpan.firstJd.toFixed(1)} to ${props.ephemerisSpan.lastJd.toFixed(1)} (TDB).`,
    'Status — screening-grade. These are first-cut transfer energies, not refined mission designs.',
  );
  if (echo) {
    lines.push(
      `Feasibility boundary — ${formatC3WithUnits(echo.absoluteKm2S2)}, read from the screening cache rather than assumed.`,
    );
  }
  lines.push(
    `Delivered mass — interpolated from the published performance curve for ${props.vehicleName}, against a fixed reference rendezvous budget of ${REFERENCE_RENDEZVOUS_MPS} m/s plus ${SPACECRAFT_STATIONKEEPING_MPS} m/s stationkeeping. Rendezvous ΔV varies by target; a single reference budget is used here so the mass column is comparable across bodies, which means it is not a per-target mission estimate.`,
    'Launch-vehicle performance figures are the operator-published curves and carry their contract context; quoted interior points on those curves are interpolations between published anchors, not independently verified performance.',
    `Computed live in this browser — ${formatComputeTime(props.totalComputeMs)} of solver time for this comparison.`,
  );

  return h(
    'div',
    { style: 'margin:20px 0;padding:14px 16px;border:1px solid rgba(255,255,255,0.12);border-radius:6px;background:rgba(255,255,255,0.03);' },
    lines.map((line) =>
      h('div', { style: 'font-size:11px;color:#94a3b8;line-height:1.7;' }, line),
    ),
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function ComparePage() {
  const [data, setData] = useState<PageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  const requestedBodyIds = useMemo(() => parseCompareBodies(window.location.search), []);

  useEffect(() => {
    let cancelled = false;
    if (requestedBodyIds.length === 0) {
      return () => { cancelled = true; };
    }
    setSelectedBodySet(requestedBodyIds);

    void Promise.all([
      fetch(HORIZONS_FIXTURE_URL).then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ephemeris fixture: ${response.status}`);
        }
        return ingestSlice2Fixture((await response.json()) as HorizonsFixture);
      }),
      loadSlice9NeaCatalogFixture(),
      loadLambertScreenCacheAsync(),
    ])
      .then(([horizonsStates, catalog, screenCache]) => {
        if (cancelled) {
          return;
        }
        const earthSamples = horizonsStates.earth;
        const earthStateSeries: readonly CanonicalState[] = earthSamples.map((s) => s.state);
        const firstJd = tdbSecondsToJd(earthSamples[0].state.tdbSeconds);
        const lastJd = tdbSecondsToJd(earthSamples[earthSamples.length - 1].state.tdbSeconds);

        const labels = new Map<string, string>();
        const bodies: CompareBodyInput[] = [];
        const missing: string[] = [];
        for (const bodyId of requestedBodyIds) {
          const body = catalog.asteroids[bodyId];
          if (!body) {
            missing.push(bodyId);
            continue;
          }
          labels.set(body.bodyId, body.name || body.designation || body.bodyId);
          bodies.push({ bodyId: body.bodyId, bodyElements: body.elements });
        }
        if (bodies.length === 0) {
          throw new Error(
            `None of the requested bodies are in the catalog: ${missing.join(', ')}`,
          );
        }

        const vehicle = LAUNCH_VEHICLES[0];
        const results = computeCompareData(
          bodies,
          {
            depStartJdTdb: utcMidnightToJdTdb(DEPARTURE_WINDOW_START_UTC),
            depEndJdTdb: utcMidnightToJdTdb(DEPARTURE_WINDOW_END_UTC),
            nDep: N_DEP,
            nTof: N_TOF,
            tofMinDays: TOF_MIN_DAYS,
            tofMaxDays: TOF_MAX_DAYS,
            M: 0,
            thresholdMode: 'relative',
            deltaKm2S2: DELTA_KM2S2,
            absoluteKm2S2: screenCache.metadata.feasibleC3MaxKm2S2,
            bMinCells: B_MIN_CELLS,
            earthSpanJdTdb: { firstSample: firstJd, lastSample: lastJd },
            vehicle,
            dvBudget: {
              rendezvousMps: REFERENCE_RENDEZVOUS_MPS,
              stationkeepingMps: SPACECRAFT_STATIONKEEPING_MPS,
              marginMps: deterministicMarginMps(REFERENCE_RENDEZVOUS_MPS),
            },
          },
          {
            getEarthStateAtTdbSeconds: (tdbSeconds) =>
              interpolateBodyStateSeries('earth', earthStateSeries, tdbSeconds),
            propagateTargetStateAtTdbSeconds: (bodyElements, tdbSeconds) =>
              propagateKeplerianStateVectors(bodyElements, tdbSeconds),
          },
        );

        const totalComputeMs = results.reduce(
          (sum, result) => sum + (result.ok ? result.grid.computeMs : 0),
          0,
        );
        setData({
          results,
          labels,
          vehicleName: `${vehicle.name} — ${vehicle.config}`,
          ephemerisSpan: { firstJd, lastJd },
          totalComputeMs,
        });
      })
      .catch((nextError: Error) => {
        if (!cancelled) {
          setError(nextError.message);
        }
      });

    return () => { cancelled = true; };
  }, [requestedBodyIds]);

  const pageStyle = 'max-width:1200px;margin:0 auto;padding:32px 24px 64px;color:#eef2ff;font-family:system-ui,-apple-system,sans-serif;';

  if (requestedBodyIds.length === 0) {
    return h('div', { style: pageStyle }, [
      h('h1', { style: 'font-size:22px;margin:0 0 12px;' }, 'Compare departure targets'),
      h('p', { style: 'color:#94a3b8;font-size:14px;line-height:1.7;max-width:60ch;' },
        `Add up to ${COMPARE_BODIES_CAP} bodies to the address bar to compare them, for example ?bodies=433,163693,99942`),
    ]);
  }

  if (error !== null) {
    return h('div', { style: pageStyle }, [
      h('h1', { style: 'font-size:22px;margin:0 0 12px;' }, 'Compare departure targets'),
      h('p', { style: 'color:#fca5a5;font-size:14px;line-height:1.7;' }, error),
    ]);
  }

  if (data === null) {
    return h('div', { style: pageStyle }, [
      h('h1', { style: 'font-size:22px;margin:0 0 12px;' }, 'Compare departure targets'),
      h('p', { style: 'color:#94a3b8;font-size:14px;' },
        `Computing ${requestedBodyIds.length} departure grids…`),
    ]);
  }

  // A body with no practical window sorts last and is never ranked by its
  // global minimum; refusals sort after that.
  const ordered = [...data.results].sort((a, b) => {
    const rank = (r: CompareBodyResult): number =>
      !r.ok ? 2 : r.segmentation.bestPractical === null ? 1 : 0;
    const rankDelta = rank(a) - rank(b);
    if (rankDelta !== 0) {
      return rankDelta;
    }
    if (a.ok && b.ok && a.segmentation.bestPractical && b.segmentation.bestPractical) {
      return a.segmentation.bestPractical.c3 - b.segmentation.bestPractical.c3;
    }
    return 0;
  });

  const firstOk = data.results.find((result) => result.ok);
  const echo = firstOk && firstOk.ok ? firstOk.echo : null;

  const headers = [
    'Target',
    'Best practical window',
    'Distinct windows',
    'Widest window',
    `Delivered mass — ${data.vehicleName}`,
    'Threshold',
  ];

  return h('div', { style: pageStyle }, [
    h('h1', { style: 'font-size:22px;margin:0 0 6px;' }, 'Compare departure targets'),
    h('p', { style: 'color:#94a3b8;font-size:13px;line-height:1.7;margin:0 0 18px;max-width:70ch;' },
      'Every figure below is computed from the grids shown — nothing is quoted from a stored table. A target with no practical window is a real answer, not a missing one.'),

    h('table', { style: 'width:100%;border-collapse:collapse;' }, [
      h('thead', null, h('tr', null, headers.map((header) =>
        h('th', {
          style: 'text-align:left;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.2);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#94a3b8;font-weight:600;',
        }, header)))),
      h('tbody', null, ordered.flatMap((result) => {
        const label = data.labels.get(result.bodyId) ?? result.bodyId;
        const isExpanded = expanded.has(result.bodyId);
        const onToggle = () => {
          const next = new Set(expanded);
          if (next.has(result.bodyId)) {
            next.delete(result.bodyId);
          } else {
            next.add(result.bodyId);
          }
          setExpanded(next);
        };
        const rows = [
          isRefusal(result)
            ? renderRefusalRow(result, label)
            : renderOkRow(result, label, data.vehicleName, isExpanded, onToggle),
        ];
        if (isExpanded && result.ok) {
          rows.push(h('tr', { key: `${result.bodyId}-grid` },
            h('td', { colSpan: 6, style: 'padding:4px 12px 18px;border-bottom:1px solid rgba(255,255,255,0.08);' }, [
              h(PorkchopThumbnail, { cells: result.grid.cells }),
              h('span', { style: NOTE_STYLE },
                `Departure date left to right, transfer time bottom to top. Colour is departure energy on one scale shared by every target on this page, so panels are directly comparable.`),
            ])));
        }
        return rows;
      })),
    ]),

    h(MethodBadge, {
      echo,
      ephemerisSpan: data.ephemerisSpan,
      vehicleName: data.vehicleName,
      totalComputeMs: data.totalComputeMs,
    }),
  ]);
}

const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 Compare mount point "#app" was not found');
}

render(h(ComparePage, null), mount);
