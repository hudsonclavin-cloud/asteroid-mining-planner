import { h, render } from 'preact';
import { effect } from '@preact/signals';
import { loadSlice9NeaCatalogFixture } from '../../boundary/slice9-nea-catalog.js';
import { disposePanel, renderPanel, trackPanelSignals } from '../catalog-list/panel.js';
import {
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

let catalogLoadPromise: Promise<void> | null = null;

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

function PhaseCOverlay() {
  const selectedBody = selectedBodySignal.value;
  const focusRequestId = focusRequestIdSignal.value;

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
    renderPanel(),
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
  const disposeRenderEffect = effect(() => {
    // Re-render the Preact root when the external store slices C.1 exposes
    // change. The scene stays imperative; the DOM overlay stays declarative.
    selectedBodySignal.value;
    focusRequestIdSignal.value;
    trackPanelSignals();
    render(h(PhaseCOverlay, {}), host);
  });

  return () => {
    disposeRenderEffect();
    disposePanel();
    render(null, host);
    host.remove();
  };
}
