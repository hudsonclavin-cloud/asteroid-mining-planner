import { h, render } from 'preact';
import { effect } from '@preact/signals';
import { focusRequestIdSignal, selectedBodySignal } from '../ui-store/index.js';

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
  'visibility:hidden',
  'pointer-events:none',
  'overflow:hidden',
].join(';');

function PhaseCOverlay() {
  const selectedBody = selectedBodySignal.value;
  const focusRequestId = focusRequestIdSignal.value;

  return h(
    'div',
    {
      'data-testid': PHASE_C_OVERLAY_ROOT_TEST_ID,
      'data-selected-body-state': selectedBody === null ? 'none' : 'selected',
      'data-focus-request-id': String(focusRequestId),
      'aria-hidden': 'true',
      style: OVERLAY_ROOT_STYLE,
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
  );
}

export function mountPhaseCOverlay(mount: HTMLElement): () => void {
  const host = document.createElement('div');
  host.setAttribute('data-testid', PHASE_C_OVERLAY_HOST_TEST_ID);
  // Phase C keeps the UI tree declarative but outside the Three.js renderer.
  // C.1 mounts it as an absolute sibling over the canvas with pointer events
  // disabled and visibility hidden so the stack is real but still non-visible.
  host.style.cssText = OVERLAY_HOST_STYLE;
  mount.appendChild(host);
  const disposeRenderEffect = effect(() => {
    // Re-render the Preact root when the external store slices C.1 exposes
    // change. The scene stays imperative; the DOM overlay stays declarative.
    selectedBodySignal.value;
    focusRequestIdSignal.value;
    render(h(PhaseCOverlay, {}), host);
  });

  return () => {
    disposeRenderEffect();
    render(null, host);
    host.remove();
  };
}
