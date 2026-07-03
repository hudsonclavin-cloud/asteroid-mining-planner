import { h, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { ingestSlice2Fixture, type HorizonsFixture } from '../../boundary/horizons.js';
import type { AsteroidOrbitalElements } from '../../core/constants/asteroids.js';
import {
  CAPE_CANAVERAL,
  LAUNCH_SITES,
  type FeasibilityClass,
  type LaunchSite,
} from '../../core/lambert/feasibility.js';
import {
  deliveredMassKg,
  deterministicMarginMps,
  isBeyondCurve,
  LAUNCH_VEHICLES,
  payloadAtC3,
  SCREENING_ISP_S,
  type LaunchVehicle,
  type MissionMode,
  type SpacecraftDvBudget,
} from '../../porkchop/launch-vehicles.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../../core/units.js';
import { createPorkchopClient, type PorkchopClient } from '../../porkchop/porkchop-client.js';
import {
  buildDeltaVStack,
  DV_MARGIN_FRACTION,
  LEO_PARKING_RADIUS_KM,
  STATIONKEEPING_DV_KMPS,
  type DeltaVStackBreakdown,
} from '../../porkchop/delta-v.js';
import { PorkchopView, type PorkchopPinnedReadout } from '../../porkchop/porkchop-view.js';
import { loadSlice9NeaCatalogFixture } from '../solar-system/loader.js';

const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 Porkchop mount point "#app" was not found');
}

const DEFAULT_BODY_ID = 'asteroid-99942';
const HORIZONS_FIXTURE_URL = new URL(
  '../../data/horizons-inner-solar-system-2026-2040.json',
  import.meta.url,
);

const PAGE_STYLE = [
  'width:100%',
  'height:100%',
  'display:flex',
  'background:#03050b',
  'color:#eef2ff',
  'font-family:system-ui,-apple-system,sans-serif',
].join(';');

const SIDEBAR_STYLE = [
  'width:320px',
  'flex-shrink:0',
  'border-right:1px solid rgba(255,255,255,0.1)',
  'background:rgba(255,255,255,0.03)',
  'padding:24px 20px',
  'box-sizing:border-box',
  'overflow:auto',
].join(';');

const MAIN_STYLE = [
  'flex:1',
  'min-width:0',
  'height:100%',
  'overflow:auto',
].join(';');

interface PageState {
  readonly bodyId: string;
  readonly bodyLabel: string;
  readonly bodyElements: AsteroidOrbitalElements;
  readonly client: PorkchopClient;
}

interface StackState {
  readonly readout: PorkchopPinnedReadout;
  readonly breakdown: DeltaVStackBreakdown;
}

// Mission cost card state (Slice 13 DEC-13-4). No injection field by construction:
// injection is embodied in payload-at-C3 (the launch vehicle already did it).
interface CostCardState {
  readonly readout: PorkchopPinnedReadout;
  readonly band: FeasibilityClass;
  readonly payloadKg: number | null; // null = beyond published curve (INV-023)
  readonly rendezvousMps: number;
  readonly stationkeepingMps: number;
  readonly departureMps: number; // 0 in one-way mode
  readonly marginMps: number; // DEC-13-6: 5% of deterministic maneuver lines only
  readonly deliveredKg: number | null; // null = beyond published curve
}

const MISSION_MODE_LABELS: Record<MissionMode, string> = {
  'one-way': 'One-way rendezvous',
  'sample-return': 'Sample return',
};

const CARD_BADGE_STYLE: Record<Exclude<FeasibilityClass, null>, string> = {
  GREEN: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#22c55e;color:#04130a;font-size:11px;font-weight:700;',
  AMBER: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#f59e0b;color:#170f02;font-size:11px;font-weight:700;',
  RED: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;background:#ef4444;color:#1f0505;font-size:11px;font-weight:700;',
};

const CARD_PICKER_SELECT_STYLE =
  'width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,0.18);border-radius:6px;background:#0b1220;color:#eef2ff;padding:7px 8px;font:inherit;';
const CARD_PICKER_LABEL_STYLE =
  'font-size:11px;color:#93a4bf;text-transform:uppercase;letter-spacing:0.08em;';
const CARD_DISCLOSURE_STYLE =
  'margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;line-height:1.55;color:#9fb0c8;';

const vehicleKey = (vehicle: LaunchVehicle): string => `${vehicle.name} — ${vehicle.config}`;

function jdTdbToUtcDateString(jdTdb: number): string {
  const tdbSecondsSinceJ2000 = (jdTdb - J2000_TDB_JULIAN_DATE) * SECONDS_PER_DAY;
  const utcMillis = (tdbSecondsSinceJ2000 - 69.184 + 946_728_000) * 1000;
  return new Date(utcMillis).toISOString().slice(0, 10);
}

function formatKg(valueKg: number): string {
  return `${Math.round(valueKg).toLocaleString('en-US')} kg`;
}

function utcMidnightToJdTdb(utcDate: string): number {
  const utcMillis = Date.parse(`${utcDate}T00:00:00Z`);
  if (!Number.isFinite(utcMillis)) {
    throw new Error(`Invalid UTC date '${utcDate}'`);
  }
  const utcSecondsSinceUnix = utcMillis / 1000;
  const unixToJ2000Seconds = 946_728_000;
  const tdbMinusUtcSeconds = 69.184;
  const tdbSecondsSinceJ2000 = utcSecondsSinceUnix - unixToJ2000Seconds + tdbMinusUtcSeconds;
  return J2000_TDB_JULIAN_DATE + tdbSecondsSinceJ2000 / SECONDS_PER_DAY;
}

const GRID_PARAMS = {
  depStartJD: utcMidnightToJdTdb('2026-01-01'),
  depEndJD: utcMidnightToJdTdb('2040-01-01'),
  tofMinDays: 182.5,
  tofMaxDays: 1826.25,
  nDep: 200,
  nTof: 100,
} as const;

function resolveRequestedBodyId(): string {
  const params = new URLSearchParams(location.search);
  return params.get('body') || DEFAULT_BODY_ID;
}

async function loadLongWindowEarthSeries() {
  const response = await fetch(HORIZONS_FIXTURE_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to load long-window Horizons fixture: ${response.status} ${response.statusText}`,
    );
  }

  const fixture = (await response.json()) as HorizonsFixture;
  const horizonsStates = ingestSlice2Fixture(fixture);
  return horizonsStates.earth.map((sample) => sample.state);
}

function PorkchopDedicatedPage() {
  const requestedBodyId = useMemo(() => resolveRequestedBodyId(), []);
  const [pageState, setPageState] = useState<PageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedReadout, setPinnedReadout] = useState<PorkchopPinnedReadout | null>(null);
  const [showDlaContours, setShowDlaContours] = useState(false);
  const [selectedLaunchSite, setSelectedLaunchSite] = useState<LaunchSite>(CAPE_CANAVERAL);
  const [selectedVehicle, setSelectedVehicle] = useState<LaunchVehicle>(LAUNCH_VEHICLES[0]);
  const [selectedMode, setSelectedMode] = useState<MissionMode>('one-way');

  useEffect(() => {
    let cancelled = false;
    let activeClient: PorkchopClient | null = null;

    setLoading(true);
    setError(null);
    setPageState(null);
    setPinnedReadout(null);

    void Promise.all([
      loadLongWindowEarthSeries(),
      loadSlice9NeaCatalogFixture(),
    ]).then(async ([earthStateSeries, catalog]) => {
      const body = catalog.asteroids[requestedBodyId];
      if (!body) {
        throw new Error(`Body not found for ?body=${requestedBodyId}`);
      }

      const client = await createPorkchopClient(earthStateSeries);
      activeClient = client;
      if (cancelled) {
        client.dispose();
        return;
      }

      setPageState({
        bodyId: body.bodyId,
        bodyLabel: body.name || body.designation,
        bodyElements: body.elements,
        client,
      });
      setLoading(false);
    }).catch((nextError: Error) => {
      if (activeClient !== null) {
        activeClient.dispose();
        activeClient = null;
      }
      if (cancelled) {
        return;
      }
      setError(nextError.message);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      if (activeClient !== null) {
        activeClient.dispose();
        activeClient = null;
      }
    };
  }, [requestedBodyId]);

  const stackState: StackState | null = useMemo(() => {
    if (
      pinnedReadout === null ||
      pinnedReadout.status !== 'ok' ||
      pinnedReadout.c3 === null ||
      pinnedReadout.vInfArr === null
    ) {
      return null;
    }

    return {
      readout: pinnedReadout,
      breakdown: buildDeltaVStack(pinnedReadout.c3, pinnedReadout.vInfArr),
    };
  }, [pinnedReadout]);

  const costCardState: CostCardState | null = useMemo(() => {
    if (
      pinnedReadout === null ||
      pinnedReadout.status !== 'ok' ||
      pinnedReadout.c3 === null ||
      pinnedReadout.vInfArr === null
    ) {
      return null;
    }

    // Spacecraft ΔV budget in m/s (DEC-13-4). Injection is ABSENT by construction —
    // payload-at-C3 embodies it. Dogleg adds zero in GREEN/AMBER (DEC-13-3 / OQ-13-2
    // option (a): zero-with-disclosure); RED cells never price (infeasible panel).
    const rendezvousMps = pinnedReadout.vInfArr * 1000;
    const departureMps = selectedMode === 'sample-return' ? rendezvousMps : 0;
    const stationkeepingMps = STATIONKEEPING_DV_KMPS * 1000;
    // DEC-13-6: 5% margin on deterministic maneuver lines only; the 150 m/s
    // stationkeeping line is the generic allocation and is not margined.
    const marginMps =
      selectedMode === 'sample-return'
        ? deterministicMarginMps(rendezvousMps, departureMps)
        : deterministicMarginMps(rendezvousMps);
    const budget: SpacecraftDvBudget =
      selectedMode === 'sample-return'
        ? { rendezvousMps, stationkeepingMps, marginMps, departureMps }
        : { rendezvousMps, stationkeepingMps, marginMps };

    const payload = payloadAtC3(selectedVehicle, pinnedReadout.c3);
    const delivered = deliveredMassKg(selectedVehicle, pinnedReadout.c3, budget, selectedMode);

    return {
      readout: pinnedReadout,
      band: pinnedReadout.feasibility,
      payloadKg: isBeyondCurve(payload) ? null : payload,
      rendezvousMps,
      stationkeepingMps,
      departureMps,
      marginMps,
      deliveredKg: isBeyondCurve(delivered) ? null : delivered,
    };
  }, [pinnedReadout, selectedMode, selectedVehicle]);

  if (loading) {
    return h(
      'div',
      { style: PAGE_STYLE },
      h(
        'div',
        { style: 'margin:auto;font-size:18px;opacity:0.88;' },
        'Loading dedicated porkchop view…',
      ),
    );
  }

  if (error !== null || pageState === null) {
    return h(
      'div',
      { style: PAGE_STYLE },
      h(
        'div',
        {
          style: 'margin:auto;max-width:640px;padding:24px;border:1px solid rgba(255,255,255,0.12);border-radius:16px;background:rgba(255,255,255,0.03);',
        },
        h('div', { style: 'font-size:24px;font-weight:700;margin-bottom:12px;' }, 'Porkchop page unavailable'),
        h('div', { style: 'font-size:15px;line-height:1.6;color:#cbd5e1;' }, error ?? 'Failed to initialize porkchop page.'),
      ),
    );
  }

  return h(
    'div',
    { style: PAGE_STYLE },
    h(
      'aside',
      { style: SIDEBAR_STYLE },
      h('div', { style: 'font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8da2c0;margin-bottom:10px;' }, 'Porkchop Analysis'),
      h('div', { style: 'font-size:24px;font-weight:700;color:#fff;margin-bottom:8px;' }, pageState.bodyLabel),
      h('div', { style: 'font-size:13px;color:#93a4bf;margin-bottom:20px;' }, pageState.bodyId),
      h(
        'div',
        { style: 'font-size:13px;line-height:1.6;color:#cbd5e1;margin-bottom:20px;' },
        `M=1 transfer search from Earth departure to ${pageState.bodyLabel}. Grid spans 2026–2040 departures and 182.5–1826.25 day flight times. Click a cell to inspect its branch and ΔV stack.`,
      ),
      h(
        'section',
        {
          style: 'border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px;background:rgba(255,255,255,0.03);margin-bottom:16px;',
        },
        h('div', { style: 'font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;' }, 'Grid'),
        h('div', { style: 'font-size:12px;color:#cbd5e1;line-height:1.6;' }, `Target: ${pageState.bodyLabel} (${pageState.bodyId})`),
        h('div', { style: 'font-size:12px;color:#cbd5e1;line-height:1.6;' }, `Grid: ${GRID_PARAMS.nDep}×${GRID_PARAMS.nTof}`),
        h(
          'label',
          {
            style: 'display:flex;align-items:flex-start;gap:8px;margin-top:14px;font-size:12px;color:#d8e1f1;cursor:pointer;',
            title: 'Screening estimate only; day-specific geometry may differ.',
          },
          h('input', {
            type: 'checkbox',
            checked: showDlaContours,
            onInput: () => setShowDlaContours((current) => !current),
          }),
          h(
            'span',
            { style: 'display:flex;flex-direction:column;gap:2px;' },
            h('span', null, 'DLA feasibility'),
            h(
              'span',
              { style: 'font-size:10px;line-height:1.35;color:#93a4bf;font-style:italic;' },
              'Screening estimate only; day-specific geometry may differ.',
            ),
          ),
        ),
        showDlaContours
          ? [
              h(
                'label',
                {
                  key: 'dla-site-picker',
                  style: 'display:flex;flex-direction:column;gap:6px;margin-top:10px;font-size:12px;color:#cbd5e1;',
                },
                h('span', { style: 'font-size:11px;color:#93a4bf;text-transform:uppercase;letter-spacing:0.08em;' }, 'Launch site'),
                h(
                  'select',
                  {
                    value: selectedLaunchSite.name,
                    style: 'width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,0.18);border-radius:6px;background:#0b1220;color:#eef2ff;padding:7px 8px;font:inherit;',
                    onInput: (event: Event) => {
                      const select = event.currentTarget as HTMLSelectElement;
                      const nextSite = LAUNCH_SITES.find((site) => site.name === select.value);
                      if (nextSite !== undefined) {
                        setSelectedLaunchSite(nextSite);
                      }
                    },
                  },
                  LAUNCH_SITES.map((site) => h('option', { key: site.name, value: site.name }, site.name)),
                ),
              ),
              h(
                'div',
                {
                  key: 'dla-016d-disclosure',
                  style: 'margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;line-height:1.55;color:#9fb0c8;',
                },
                `Launch-feasibility bands are a screening estimate against ${selectedLaunchSite.name}'s azimuth corridor (sourced NASA limits). Day-specific launch geometry can bind tighter — e.g. MGS launched from Cape with DLA 36.5 deg (nominally AMBER) yet required a dogleg because its daily window forced the southerly azimuth side, where the effective ceiling is only ~34-39 deg. Dogleg cost is priced in the mission cost card per the two-regime screening model (INV-016d as amended by Slice 13): zero-with-disclosure for AMBER, not-feasible verdict for RED.`,
              ),
            ]
          : null,
      ),
      h(
        'section',
        {
          style: 'border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px;background:rgba(255,255,255,0.03);margin-bottom:16px;',
        },
        h('div', { style: 'font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;' }, 'Mission cost'),
        h(
          'label',
          { key: 'vehicle-picker', style: 'display:flex;flex-direction:column;gap:6px;margin-bottom:10px;font-size:12px;color:#cbd5e1;' },
          h('span', { style: CARD_PICKER_LABEL_STYLE }, 'Launch vehicle'),
          h(
            'select',
            {
              value: vehicleKey(selectedVehicle),
              style: CARD_PICKER_SELECT_STYLE,
              onInput: (event: Event) => {
                const select = event.currentTarget as HTMLSelectElement;
                const nextVehicle = LAUNCH_VEHICLES.find((vehicle) => vehicleKey(vehicle) === select.value);
                if (nextVehicle !== undefined) {
                  setSelectedVehicle(nextVehicle);
                }
              },
            },
            LAUNCH_VEHICLES.map((vehicle) =>
              h('option', { key: vehicleKey(vehicle), value: vehicleKey(vehicle) }, `${vehicle.name} — ${vehicle.config} (${vehicle.site})`),
            ),
          ),
        ),
        h(
          'label',
          { key: 'mode-picker', style: 'display:flex;flex-direction:column;gap:6px;margin-bottom:10px;font-size:12px;color:#cbd5e1;' },
          h('span', { style: CARD_PICKER_LABEL_STYLE }, 'Mission mode'),
          h(
            'select',
            {
              value: selectedMode,
              style: CARD_PICKER_SELECT_STYLE,
              onInput: (event: Event) => {
                const select = event.currentTarget as HTMLSelectElement;
                setSelectedMode(select.value === 'sample-return' ? 'sample-return' : 'one-way');
              },
            },
            h('option', { key: 'one-way', value: 'one-way' }, MISSION_MODE_LABELS['one-way']),
            h('option', { key: 'sample-return', value: 'sample-return' }, MISSION_MODE_LABELS['sample-return']),
          ),
        ),
        costCardState === null
          ? h('div', { style: 'font-size:12px;color:#93a4bf;line-height:1.6;' }, 'Pin a cell to price the mission.')
          : [
              // Headline: delivered mass for GREEN/AMBER; verdict panel for RED (DEC-13-3 / D3 —
              // layout stays stable, only headline + dogleg line change).
              costCardState.band === 'RED'
                ? h(
                    'div',
                    { key: 'card-headline', style: 'margin:6px 0 10px;' },
                    h('div', { style: 'font-size:22px;font-weight:700;color:#fca5a5;line-height:1.3;' }, 'Not feasible at screening fidelity'),
                    h(
                      'div',
                      { style: 'font-size:12px;color:#cbd5e1;line-height:1.5;margin-top:6px;' },
                      `DLA ${costCardState.readout.dlaDeg === null ? '—' : costCardState.readout.dlaDeg.toFixed(1)}° exceeds ${costCardState.readout.siteName}'s direct-injection capability; a plane change of this class consumes most of the vehicle's payload (IXPE-class), so no delivered-mass number is honest at screening fidelity.`,
                    ),
                  )
                : h(
                    'div',
                    { key: 'card-headline', style: 'margin:6px 0 10px;' },
                    h(
                      'div',
                      { style: costCardState.deliveredKg === null ? 'font-size:22px;font-weight:700;color:#fbbf24;line-height:1.3;' : 'font-size:30px;font-weight:700;color:#fff;line-height:1.2;' },
                      costCardState.deliveredKg === null ? 'Beyond published curve' : formatKg(costCardState.deliveredKg),
                    ),
                    h(
                      'div',
                      { style: 'display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;margin-top:4px;' },
                      `delivered to ${pageState.bodyLabel}`,
                      costCardState.band === null
                        ? null
                        : h('span', { style: CARD_BADGE_STYLE[costCardState.band] }, costCardState.band),
                    ),
                  ),
              h(
                'div',
                { key: 'card-subline', style: 'font-size:11px;color:#93a4bf;margin-bottom:10px;' },
                `${vehicleKey(selectedVehicle)} · ${MISSION_MODE_LABELS[selectedMode]} · ${jdTdbToUtcDateString(costCardState.readout.depJD)} + ${costCardState.readout.tofDays.toFixed(0)} d`,
              ),
              h(
                'div',
                {
                  key: 'card-stack',
                  style: `display:grid;grid-template-columns:max-content 1fr;gap:7px 14px;font-size:12px;line-height:1.6;color:#d8e1f1;${costCardState.band === 'RED' ? 'opacity:0.55;' : ''}`,
                },
                h('span', null, `Payload at C3 = ${costCardState.readout.c3!.toFixed(1)}`),
                h('span', null, costCardState.payloadKg === null ? 'beyond published curve' : formatKg(costCardState.payloadKg)),
                h('span', null, 'Rendezvous burn'),
                h('span', null, `${costCardState.rendezvousMps.toFixed(0)} m/s`),
                selectedMode === 'sample-return'
                  ? [
                      h('span', { key: 'dep-label' }, 'Departure burn (sample return)'),
                      h('span', { key: 'dep-value' }, `${costCardState.departureMps.toFixed(0)} m/s`),
                    ]
                  : null,
                h('span', null, 'Stationkeeping'),
                h('span', null, `${costCardState.stationkeepingMps.toFixed(0)} m/s`),
                h('span', null, 'Dogleg penalty'),
                h(
                  'span',
                  null,
                  costCardState.band === 'GREEN'
                    ? 'none (GREEN)'
                    : costCardState.band === 'AMBER'
                      ? '~0 (launch-geometry, AMBER)'
                      : costCardState.band === 'RED'
                        ? 'exceeds site capability'
                        : '— (no DLA for this cell)',
                ),
                h('span', null, 'Margin (5%)'),
                h('span', null, `${costCardState.marginMps.toFixed(0)} m/s (deterministic lines)`),
                h('span', { style: 'font-weight:700;color:#fff;' }, 'Delivered mass'),
                h(
                  'span',
                  { style: 'font-weight:700;color:#fff;' },
                  costCardState.band === 'RED' || costCardState.deliveredKg === null ? '—' : formatKg(costCardState.deliveredKg),
                ),
              ),
              h(
                'div',
                { key: 'card-injection-split', style: 'font-size:10px;color:#93a4bf;font-style:italic;margin-top:8px;line-height:1.4;' },
                `Launch vehicle provides injection to C3 = ${costCardState.readout.c3!.toFixed(1)} — embodied in payload-at-C3, not a spacecraft ΔV line.`,
              ),
              h(
                'details',
                { key: 'card-016e-disclosure', style: CARD_DISCLOSURE_STYLE },
                h('summary', { style: 'cursor:pointer;color:#a5b4cf;' }, 'Assumptions & sources'),
                h(
                  'div',
                  { style: 'margin-top:8px;display:flex;flex-direction:column;gap:6px;' },
                  h('div', null, `Vehicle curve: ${selectedVehicle.source}, as-of ${selectedVehicle.asOf} (queried 2026-07-02); official anchors only.`),
                  h('div', null, 'Interpolation: piecewise-linear between published anchors; no extrapolation — beyond the last anchor the card reads "beyond published curve".'),
                  h('div', null, `Spacecraft propulsion: screening Isp ${SCREENING_ISP_S} s (representative of the 300–350 s storable-bipropellant class). Mission mode: ${MISSION_MODE_LABELS[selectedMode]}. Delivered mass is arrival wet mass (no dry-mass modeling).`),
                  h('div', null, 'Margin policy: 5% on deterministic maneuver lines (ECSS-anchored); the 150 m/s stationkeeping line is a generic allocation and is not margined.'),
                  h(
                    'div',
                    null,
                    costCardState.band === 'GREEN'
                      ? "Dogleg regime (this cell): GREEN — DLA within the site's direct-injection band; no plane-change cost."
                      : costCardState.band === 'AMBER'
                        ? 'Dogleg regime (this cell): AMBER — plane-matching is handled by launch geometry at ~1 m/s-per-degree class cost (JPL DESCANSO Vol. 12 evidence), below screening error bars; zero added ΔV, disclosed rather than fabricated.'
                        : costCardState.band === 'RED'
                          ? 'Dogleg regime (this cell): RED — beyond the site corridor; the honest cost is IXPE-class capacity destruction, so the card shows a verdict, not a number.'
                          : 'Dogleg regime (this cell): unavailable — the cell has no DLA value.',
                  ),
                  selectedVehicle.name === 'New Glenn'
                    ? h('div', null, 'New Glenn: interpolation across the steep C3 20–30 segment overestimates payload by up to ~3% (measured, Phase B oracle).')
                    : null,
                ),
              ),
            ],
      ),
      h(
        'section',
        {
          style: 'border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px;background:rgba(255,255,255,0.03);',
        },
        h('div', { style: 'font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;' }, 'ΔV stack'),
        pinnedReadout === null
          ? h('div', { style: 'font-size:12px;color:#93a4bf;line-height:1.6;' }, 'Pin a cell to see the ΔV stack.')
          : stackState === null
            ? h(
                'div',
                { style: 'font-size:12px;color:#93a4bf;line-height:1.6;' },
                'Pinned cell has no converged branch, so the ΔV stack is unavailable.',
              )
            : [
                h(
                  'div',
                  {
                    key: 'stack-total',
                    style: 'display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.08);',
                  },
                  h('span', { style: 'font-size:13px;color:#a5b4cf;text-transform:uppercase;letter-spacing:0.08em;' }, 'Total ΔV'),
                  h('span', { style: 'font-size:26px;font-weight:700;color:#fff;' }, `${stackState.breakdown.totalKmps.toFixed(3)} km/s`),
                ),
                h(
                  'div',
                  {
                    key: 'stack-lines',
                    style: 'display:grid;grid-template-columns:max-content 1fr;gap:8px 14px;font-size:12px;line-height:1.6;color:#d8e1f1;',
                  },
                  h('span', null, 'Injection'),
                  h('span', null, `${stackState.breakdown.injectionKmps.toFixed(3)} km/s`),
                  h('span', null, 'Rendezvous'),
                  h('span', null, `${stackState.breakdown.rendezvousKmps.toFixed(3)} km/s`),
                  h('span', null, 'Departure'),
                  h('span', null, `${stackState.breakdown.departureKmps.toFixed(3)} km/s`),
                  h('span', null, 'Stationkeeping'),
                  h('span', null, `${stackState.breakdown.stationkeepingKmps.toFixed(3)} km/s`),
                  h('span', null, 'Subtotal'),
                  h('span', null, `${stackState.breakdown.subtotalKmps.toFixed(3)} km/s`),
                  h('span', null, 'Margin'),
                  h('span', null, `${stackState.breakdown.marginKmps.toFixed(3)} km/s (${(DV_MARGIN_FRACTION * 100).toFixed(0)}%)`),
                  h('span', null, 'Pinned C3'),
                  h('span', null, `${stackState.readout.c3.toFixed(6)} km²/s²`),
                  h('span', null, 'Pinned v∞ arr'),
                  h('span', null, `${stackState.readout.vInfArr!.toFixed(6)} km/s`),
                ),
                h(
                  'div',
                  {
                    key: 'stack-assumptions',
                    style: 'margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;line-height:1.55;color:#9fb0c8;',
                  },
                  `Assumptions: 200 km circular LEO (r = ${LEO_PARKING_RADIUS_KM.toFixed(3)} km); stationkeeping ${STATIONKEEPING_DV_KMPS.toFixed(3)} km/s (150 m/s); ${(DV_MARGIN_FRACTION * 100).toFixed(0)}% margin.`,
                ),
              ],
      ),
    ),
    h(
      'main',
      { style: MAIN_STYLE },
      h(PorkchopView, {
        client: pageState.client,
        bodyId: pageState.bodyId,
        bodyLabel: pageState.bodyLabel,
        bodyElements: pageState.bodyElements,
        gridParams: GRID_PARAMS,
        M: 1,
        onPinnedCellChange: setPinnedReadout,
        showDlaOverlayControl: true,
        showDlaContours,
        launchSite: selectedLaunchSite,
      }),
    ),
  );
}

render(h(PorkchopDedicatedPage, {}), mount);
