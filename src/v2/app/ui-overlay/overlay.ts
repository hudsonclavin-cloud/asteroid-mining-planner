import { h, render } from 'preact';
import { useEffect } from 'preact/hooks';
import { effect, signal } from '@preact/signals';
import { ingestSlice2Fixture } from '../../boundary/horizons.js';
import type { CanonicalStateSample, HorizonsFixture } from '../../boundary/horizons.js';
import { loadSlice9NeaCatalogFixture } from '../../boundary/slice9-nea-catalog.js';
import { J2000_TDB_JULIAN_DATE, SECONDS_PER_DAY } from '../../core/units.js';
import { createPorkchopClient } from '../../porkchop/porkchop-client.js';
import type { PorkchopClient } from '../../porkchop/porkchop-client.js';
import { PorkchopView } from '../../porkchop/porkchop-view.js';
import { disposePanel, renderPanel, trackPanelSignals } from '../catalog-list/panel.js';
import {
  catalogSignal,
  focusRequestIdSignal,
  readCatalog,
  selectedBodySignal,
  setCatalog,
} from '../ui-store/index.js';

export const PHASE_C_OVERLAY_HOST_TEST_ID = 'phase-c-overlay-host';
export const PHASE_C_OVERLAY_ROOT_TEST_ID = 'phase-c-overlay-root';
export const PHASE_C_OVERLAY_SELECTION_TEST_ID = 'phase-c-overlay-selection-state';
export const PHASE_C_OVERLAY_FOCUS_REQUEST_TEST_ID = 'phase-c-overlay-focus-request-id';

const OVERLAY_HOST_STYLE = [
  'position:absolute',
  'inset:0',
  'pointer-events:none',
  'z-index:20',
].join(';');

const OVERLAY_ROOT_STYLE = [
  'position:absolute',
  'inset:0',
  'pointer-events:none',
  'overflow:hidden',
].join(';');

const OVERLAY_TELEMETRY_STYLE = [
  'position:absolute',
  'inset:0',
  'visibility:hidden',
  'pointer-events:none',
].join(';');

const PORKCHOP_MODAL_BACKDROP_STYLE = [
  'position:fixed',
  'inset:0',
  'display:flex',
  'align-items:center',
  'justify-content:center',
  'background:rgba(0,0,0,0.72)',
  'pointer-events:auto',
  'z-index:120',
].join(';');

const PORKCHOP_MODAL_PANEL_STYLE = [
  'width:min(1360px, calc(100vw - 64px))',
  'height:min(920px, calc(100vh - 64px))',
  'display:flex',
  'flex-direction:column',
  'background:rgba(8,10,16,0.98)',
  'border:1px solid rgba(255,255,255,0.14)',
  'border-radius:18px',
  'box-shadow:0 18px 48px rgba(0,0,0,0.45)',
  'overflow:hidden',
].join(';');

const PORKCHOP_MODAL_HEADER_STYLE = [
  'display:flex',
  'align-items:center',
  'justify-content:space-between',
  'gap:16px',
  'padding:16px 20px',
  'border-bottom:1px solid rgba(255,255,255,0.1)',
  'background:rgba(255,255,255,0.03)',
  'font-family:system-ui,-apple-system,sans-serif',
].join(';');

const PORKCHOP_MODAL_TITLE_STYLE = [
  'display:flex',
  'flex-direction:column',
  'gap:4px',
].join(';');

const PORKCHOP_MODAL_ACTIONS_STYLE = [
  'display:flex',
  'align-items:center',
  'gap:10px',
].join(';');

const PORKCHOP_MODAL_BODY_STYLE = [
  'flex:1',
  'min-height:0',
  'overflow:auto',
  'pointer-events:auto',
].join(';');

const PORKCHOP_EARTH_FIXTURE_URL = new URL(
  '../../data/horizons-inner-solar-system-2026-2040.json',
  import.meta.url,
);

let catalogLoadPromise: Promise<void> | null = null;
const porkchopClientSignal = signal<PorkchopClient | null>(null);
const porkchopComputeBusySignal = signal(false);
const porkchopModalBodyIdSignal = signal<string | null>(null);

function ensureCatalogLoaded(): void {
  if (readCatalog() !== null || catalogLoadPromise !== null) {
    return;
  }
  if (
    typeof window === 'undefined' ||
    typeof window.fetch !== 'function' ||
    typeof window.location === 'undefined'
  ) {
    return;
  }

  catalogLoadPromise = loadSlice9NeaCatalogFixture()
    .then((catalog) => {
      setCatalog(catalog);
    })
    .catch((error) => {
      console.error('Phase C.2 failed to load Slice 9 catalog fixture for overlay list', error);
    })
    .finally(() => {
      catalogLoadPromise = null;
    });
}

async function loadPorkchopEarthStateSeries(): Promise<readonly CanonicalStateSample['state'][]> {
  const response = await fetch(PORKCHOP_EARTH_FIXTURE_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to load porkchop Earth fixture: ${response.status} ${response.statusText}`,
    );
  }

  const fixture = (await response.json()) as HorizonsFixture;
  const states = ingestSlice2Fixture(fixture);
  return states.earth.map((sample) => sample.state);
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

function buildPorkchopGridParams() {
  return {
    depStartJD: utcMidnightToJdTdb('2026-01-01'),
    depEndJD: utcMidnightToJdTdb('2040-01-01'),
    tofMinDays: 182.5,
    tofMaxDays: 1826.25,
    nDep: 200,
    nTof: 100,
  } as const;
}

const PHASE_C_PORKCHOP_GRID_PARAMS = buildPorkchopGridParams();

function createTrackedPorkchopClient(baseClient: PorkchopClient): PorkchopClient {
  return {
    async computeGrid(args) {
      porkchopComputeBusySignal.value = true;
      try {
        return await baseClient.computeGrid(args);
      } finally {
        porkchopComputeBusySignal.value = false;
      }
    },
    dispose() {
      porkchopComputeBusySignal.value = false;
      baseClient.dispose();
    },
  };
}

function closePorkchopModal(): void {
  porkchopModalBodyIdSignal.value = null;
}

function openPorkchopModal(bodyId: string): void {
  if (porkchopClientSignal.value === null || porkchopComputeBusySignal.value || porkchopModalBodyIdSignal.value !== null) {
    return;
  }
  porkchopModalBodyIdSignal.value = bodyId;
}

function renderPorkchopModal(): ReturnType<typeof h> | null {
  const openBodyId = porkchopModalBodyIdSignal.value;
  if (openBodyId === null) {
    return null;
  }

  const catalog = catalogSignal.value;
  const client = porkchopClientSignal.value;
  const body = catalog?.asteroids[openBodyId] ?? null;
  if (body === null) {
    return h(
      'div',
      {
        style: PORKCHOP_MODAL_BACKDROP_STYLE,
        onClick: (event: MouseEvent) => {
          if (event.target === event.currentTarget) {
            closePorkchopModal();
          }
        },
      },
      h(
        'div',
        {
          style: `${PORKCHOP_MODAL_PANEL_STYLE};width:min(560px, calc(100vw - 64px));height:auto;pointer-events:auto;`,
        },
        h(
          'div',
          { style: PORKCHOP_MODAL_HEADER_STYLE },
          h('div', { style: PORKCHOP_MODAL_TITLE_STYLE }, h('div', { style: 'font-size:18px;font-weight:700;color:#fff;' }, 'Porkchop view unavailable')),
          h(
            'button',
            {
              type: 'button',
              onClick: () => closePorkchopModal(),
              style: 'background:transparent;border:none;color:#9aa4ba;font-size:24px;cursor:pointer;line-height:1;',
              title: 'Close',
            },
            '×',
          ),
        ),
        h(
          'div',
          {
            style: 'padding:20px;color:#cbd5e1;font-family:system-ui,-apple-system,sans-serif;',
          },
          'The selected body is not available in the current catalog snapshot.',
        ),
      ),
    );
  }

  const bodyLabel = body.name || body.designation;
  return h(
    'div',
    {
      style: PORKCHOP_MODAL_BACKDROP_STYLE,
      onClick: (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
          closePorkchopModal();
        }
      },
    },
    h(
      'div',
      {
        style: PORKCHOP_MODAL_PANEL_STYLE,
        onClick: (event: MouseEvent) => {
          event.stopPropagation();
        },
      },
      h(
        'div',
        { style: PORKCHOP_MODAL_HEADER_STYLE },
        h(
          'div',
          { style: PORKCHOP_MODAL_TITLE_STYLE },
          h('div', { style: 'font-size:18px;font-weight:700;color:#fff;' }, `${bodyLabel} — M=1 porkchop`),
          h(
            'div',
            { style: 'font-size:12px;color:#94a3b8;' },
            'Earth-departure C3 heatmap with hover, pin, and iso-C3 contours.',
          ),
        ),
        h(
          'div',
          { style: PORKCHOP_MODAL_ACTIONS_STYLE },
          h(
            'button',
            {
              type: 'button',
              onClick: () => {
                // Guarded for non-Vite runtimes (node --test); statically replaced by Vite — see RR1E.
                const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
                const url = `${base}v2/porkchop/?body=${encodeURIComponent(body.bodyId)}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              },
              style: 'background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.22);color:#e5e7eb;padding:8px 12px;border-radius:8px;font-size:12px;cursor:pointer;',
            },
            'Open detailed view',
          ),
          h(
            'button',
            {
              type: 'button',
              onClick: () => closePorkchopModal(),
              style: 'background:transparent;border:none;color:#9aa4ba;font-size:24px;cursor:pointer;line-height:1;',
              title: 'Close',
            },
            '×',
          ),
        ),
      ),
      h(
        'div',
        { style: PORKCHOP_MODAL_BODY_STYLE },
        client === null
          ? h(
              'div',
              {
                style: 'display:flex;align-items:center;justify-content:center;height:100%;min-height:280px;color:#cbd5e1;font-family:system-ui,-apple-system,sans-serif;',
              },
              'Initializing porkchop client…',
            )
          : h(PorkchopView, {
              client,
              bodyId: body.bodyId,
              bodyLabel,
              bodyElements: body.elements,
              gridParams: PHASE_C_PORKCHOP_GRID_PARAMS,
              M: 1,
            }),
      ),
    ),
  );
}

function PhaseCOverlay() {
  const selectedBody = selectedBodySignal.value;
  const focusRequestId = focusRequestIdSignal.value;
  const clientReady = porkchopClientSignal.value !== null;
  const porkchopBusy = porkchopComputeBusySignal.value;
  const porkchopOpenBodyId = porkchopModalBodyIdSignal.value;

  useEffect(() => {
    if (porkchopOpenBodyId === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePorkchopModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [porkchopOpenBodyId]);

  return h(
    'div',
    {
      'data-testid': PHASE_C_OVERLAY_ROOT_TEST_ID,
      'data-selected-body-state': selectedBody === null ? 'none' : 'selected',
      'data-focus-request-id': String(focusRequestId),
      style: OVERLAY_ROOT_STYLE,
    },
    h(
      'div',
      {
        'aria-hidden': 'true',
        style: OVERLAY_TELEMETRY_STYLE,
      },
      h(
        'span',
        { 'data-testid': PHASE_C_OVERLAY_SELECTION_TEST_ID },
        selectedBody === null ? 'none' : selectedBody,
      ),
      h(
        'span',
        { 'data-testid': PHASE_C_OVERLAY_FOCUS_REQUEST_TEST_ID },
        String(focusRequestId),
      ),
    ),
    renderPanel({
      onOpenPorkchop: openPorkchopModal,
      porkchopDisabled: !clientReady || porkchopBusy || porkchopOpenBodyId !== null,
    }),
    renderPorkchopModal(),
  );
}

export function mountPhaseCOverlay(mount: HTMLElement): () => void {
  const host = document.createElement('div');
  host.setAttribute('data-testid', PHASE_C_OVERLAY_HOST_TEST_ID);
  // Phase C keeps the UI tree declarative but outside the Three.js renderer.
  // C.2 mounts the panel into the existing absolute overlay host so the scene
  // stays imperative while the catalog list stays signal-driven and interactive.
  host.style.cssText = OVERLAY_HOST_STYLE;
  mount.appendChild(host);
  ensureCatalogLoaded();
  porkchopClientSignal.value = null;
  porkchopComputeBusySignal.value = false;
  porkchopModalBodyIdSignal.value = null;
  let porkchopClient: PorkchopClient | null = null;
  let porkchopClientDisposed = false;
  const porkchopClientPromise = loadPorkchopEarthStateSeries()
    .then((earthStateSeries) => createPorkchopClient(earthStateSeries))
    .then((client) => {
      const trackedClient = createTrackedPorkchopClient(client);
      if (porkchopClientDisposed) {
        trackedClient.dispose();
        return null;
      }
      porkchopClient = trackedClient;
      porkchopClientSignal.value = trackedClient;
      return trackedClient;
    })
    .catch((error) => {
      console.error('Phase C failed to initialize porkchop client for overlay', error);
      return null;
    });
  const disposeRenderEffect = effect(() => {
    // Re-render the Preact root when the external store slices C.1 exposes
    // change. The scene stays imperative; the DOM overlay stays declarative.
    catalogSignal.value;
    selectedBodySignal.value;
    focusRequestIdSignal.value;
    porkchopClientSignal.value;
    porkchopComputeBusySignal.value;
    porkchopModalBodyIdSignal.value;
    trackPanelSignals();
    render(h(PhaseCOverlay, {}), host);
  });

  return () => {
    porkchopClientDisposed = true;
    closePorkchopModal();
    disposeRenderEffect();
    disposePanel();
    if (porkchopClient !== null) {
      porkchopClient.dispose();
      porkchopClient = null;
      porkchopClientSignal.value = null;
    } else {
      void porkchopClientPromise;
    }
    render(null, host);
    host.remove();
  };
}
