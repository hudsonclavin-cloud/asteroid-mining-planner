import { h, render } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { ingestSlice2Fixture, type HorizonsFixture } from '../../boundary/horizons.js';
import type { AsteroidOrbitalElements } from '../../core/constants/asteroids.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../../core/units.js';
import { createPorkchopClient, type PorkchopClient } from '../../porkchop/porkchop-client.js';
import { PorkchopView } from '../../porkchop/porkchop-view.js';
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

  useEffect(() => {
    let cancelled = false;
    let activeClient: PorkchopClient | null = null;

    setLoading(true);
    setError(null);
    setPageState(null);

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
      h('div', { style: 'font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8da2c0;margin-bottom:10px;' }, 'Dedicated Porkchop'),
      h('div', { style: 'font-size:24px;font-weight:700;color:#fff;margin-bottom:8px;' }, pageState.bodyLabel),
      h('div', { style: 'font-size:13px;color:#93a4bf;margin-bottom:20px;' }, pageState.bodyId),
      h(
        'div',
        { style: 'font-size:13px;line-height:1.6;color:#cbd5e1;margin-bottom:20px;' },
        'M = 1 default. Dedicated route resolves the body from the URL and reuses the validated Earth-departure porkchop pipeline.',
      ),
      h(
        'section',
        {
          style: 'border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px;background:rgba(255,255,255,0.03);margin-bottom:16px;',
        },
        h('div', { style: 'font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;' }, 'Route state'),
        h('div', { style: 'font-size:12px;color:#cbd5e1;line-height:1.6;' }, `URL body param: ${requestedBodyId}`),
        h('div', { style: 'font-size:12px;color:#cbd5e1;line-height:1.6;' }, `Grid: ${GRID_PARAMS.nDep}×${GRID_PARAMS.nTof}`),
      ),
      h(
        'section',
        {
          style: 'border:1px dashed rgba(255,255,255,0.18);border-radius:12px;padding:14px;background:rgba(255,255,255,0.02);',
        },
        h('div', { style: 'font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;' }, 'ΔV stack'),
        h('div', { style: 'font-size:12px;color:#93a4bf;line-height:1.6;' }, 'Phase D2'),
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
      }),
    ),
  );
}

render(h(PorkchopDedicatedPage, {}), mount);
