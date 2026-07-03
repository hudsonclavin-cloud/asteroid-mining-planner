import { h, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { ingestSlice2Fixture, type HorizonsFixture } from '../../boundary/horizons.js';
import type { AsteroidOrbitalElements } from '../../core/constants/asteroids.js';
import {
  CAPE_CANAVERAL,
  LAUNCH_SITES,
  type LaunchSite,
} from '../../core/lambert/feasibility.js';
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
                `Launch-feasibility bands are a screening estimate against ${selectedLaunchSite.name}'s azimuth corridor (sourced NASA limits). Day-specific launch geometry can bind tighter — e.g. MGS launched from Cape with DLA 36.5 deg (nominally AMBER) yet required a dogleg because its daily window forced the southerly azimuth side, where the effective ceiling is only ~34-39 deg. Dogleg costs are advisory and NOT included in the ΔV stack.`,
              ),
            ]
          : null,
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
