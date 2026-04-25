// TODO: import from src/utils/url.ts (resolveWorkerUrl, WORKER_URL)
// TODO: import from src/ui/hud/mission-control/state.ts (missionResults, selectedTrajIdx, _activeExtractRequestId, _activeRedirectRequestId, _activeReturnQueryId, missionReturnTargetPos, optimalTrajectory, _activeMissionType, _plannerTimeoutId)
// TODO: import from src/ui/hud/mission-control/burn-mode.ts (onBurnResult)
// TODO: import from src/data/nhats.ts (applyNHATSData)
// TODO: import from src/ui/hud/mission-control/index.ts (onPlanResult, onRedirectResult, showPlannerError, syncActiveMissionVisuals)
// TODO: import from src/ui/overlays/loading.ts (loadSourceStatus)
// TODO: import from src/data/catalog.ts (saveToIndexedDB, buildAsteroidMesh, asteroidData, selectedAsteroidKey, selectedId)
// TODO: import from src/utils/url.ts (loadStateFromURL)
// TODO: import from src/ui/modals/tour.ts (showTour)
// TODO: import from src/physics/porkchop.ts (renderPorkchop)

import { setPendingPositions } from '../../state/index';
import { lastPropJD, setLastPropJD, lastPropagateRequestMs, setLastPropagateRequestMs, currentJD } from '../../utils/time-state';
import { WORKER_URL } from '../../utils/config';

const PROPAGATE_INTERVAL_MS = 75;

let _worker: Worker | null = null;

export function initWorker(): Worker {
  const workerUrl = `${import.meta.env.BASE_URL}physics.worker.js?v=10k`;
  _worker = new Worker(workerUrl);
  (window as any).worker = _worker;

  _worker.onmessage = ({ data }: MessageEvent) => {
    if (data.type === 'positions') {
      if (data.jd !== lastPropJD) return;
      setPendingPositions(data.buffer);
      return;
    }
    if (data.type === 'burn_result') {
      if (data.error) { console.warn('[burn]', data.error); return; }
      onBurnResult(data); // TODO: import from src/ui/hud/mission-control/burn-mode.ts
      return;
    }
    if (data.type === 'close_approaches') {
      onCloseApproaches(data.results); // TODO: import from src/ui/hud/mission-control/burn-mode.ts
      return;
    }
    if (data.type === 'porkchop') {
      renderPorkchop(data); // mission-result overlay is drawn at end of renderPorkchop
      // TODO: import from src/physics/porkchop.ts
      return;
    }
    if (data.type === 'nhats_result') {
      if (!data.ok) {
        console.warn('[NHATS] failed:', data.error);
        const nEl = document.getElementById('hud-nhats');
        if (nEl) nEl.textContent = `NHATS: ${data.error || 'JPL API unavailable'}`;
        // Single retry after 60s — do not loop indefinitely
        setTimeout(() => _worker!.postMessage({ cmd: 'fetch_nhats', apiBase: WORKER_URL }), 60000);
        return;
      }
      try {
        localStorage.setItem('aster_nhats_v2', JSON.stringify({ data: data.data, timestamp: Date.now() }));
      } catch(_) {}
      applyNHATSData(data.data); // TODO: import from src/data/nhats.ts
      return;
    }

    if (data.type === 'load_progress') {
      const icon = data.status === 'ok' ? '✓' : data.status === 'fallback' ? '⚠' : '✗';
      const label = data.source.toUpperCase();
      const detail = data.status === 'ok' || data.status === 'fallback' ? `${data.count}` : 'offline';
      loadSourceStatus[data.source] = `${label} ${icon} ${detail}`; // TODO: import loadSourceStatus from src/ui/overlays/loading.ts
      if (data.source === 'nhats') {
        const nEl = document.getElementById('hud-nhats');
        if (nEl) {
          nEl.textContent = (data.status === 'ok' || data.status === 'fallback')
            ? `NHATS: ${data.count} TARGETS`
            : 'NHATS offline';
        }
      }
      const sub = document.getElementById('loading-sub');
      if (sub) sub.textContent = Object.values(loadSourceStatus).join('  ·  ');
      return;
    }

    if (data.type === 'catalog_error') {
      const loading = document.getElementById('loading');
      const sub = document.getElementById('loading-sub');
      if (sub) sub.textContent = data.error || 'Catalog unavailable';
      if (loading) loading.style.opacity = '1';
      return;
    }

    if (data.type === 'catalog_ready') {
      // Cache to IndexedDB; fall back to localStorage (top 2000 only)
      const payload = {
        schema_version: 7,
        data: data.data,
        timestamp: Date.now(),
        meta: {
          source: data.source || 'asterank',
          fallback: !!data.fallback,
          stale: !!data.stale,
          requestedLimit: data.requestedLimit || data.data.length,
          returnedCount: data.returnedCount || data.data.length,
        },
      };
      if (Array.isArray(data.data) && data.data.length > 0) {
        saveToIndexedDB('aster_catalog_v7', payload).catch(() => { // TODO: import from src/data/catalog.ts
          try { localStorage.setItem('aster_catalog_v7', JSON.stringify({ ...payload, data: data.data.slice(0, 2000) })); } catch(_) {}
        });
      }
      // Cache NHATS rows alongside
      if (data.nhatsRows && data.nhatsRows.length > 0) {
        try { localStorage.setItem('aster_nhats_v2', JSON.stringify({ data: data.nhatsRows, timestamp: Date.now(), meta: { stale: !!data.stale, source: 'nhats' } })); } catch(_) {}
      }
      const prevAsteroidKey = selectedAsteroidKey || // TODO: import from src/data/catalog.ts
        (selectedId >= 0 ? ((asteroidData[selectedId]?.pdes || asteroidData[selectedId]?.full_name || '').trim()) : null);
      buildAsteroidMesh(data.data); // TODO: import from src/data/catalog.ts
      if (prevAsteroidKey) {
        const newIdx = asteroidData.findIndex((a: any) =>
          (a.pdes || '').trim() === prevAsteroidKey ||
          (a.full_name || '').trim() === prevAsteroidKey
        );
        selectedAsteroidKey = prevAsteroidKey;
        selectedId = newIdx >= 0 ? newIdx : -1;
      }
      const loading = document.getElementById('loading');
      loading!.style.transition = 'opacity 0.6s';
      loading!.style.opacity = '0';
      setTimeout(() => (loading!.style.display = 'none'), 700);
      fetchNHATSData(); // TODO: import from src/data/nhats.ts
      loadStateFromURL(); // TODO: import from src/utils/url.ts
      if (!localStorage.getItem('aster_toured')) showTour(); // TODO: import from src/ui/modals/tour.ts
      return;
    }

    if (data.type === 'plan_progress') {
      const bar = document.getElementById('mp-progress-bar');
      const lbl = document.getElementById('mp-progress-label');
      if (bar) bar.style.width = (data.pct * 100) + '%';
      if (lbl) lbl.textContent = data.label;
      return;
    }
    if (data.type === 'plan_result') {
      if (_activeMissionType !== 'extract') return; // TODO: import from src/ui/hud/mission-control/state.ts
      if (Number.isFinite(data.reqId) && Number.isFinite(_activeExtractRequestId) && data.reqId !== _activeExtractRequestId) {
        return;
      }
      if (typeof _plannerTimeoutId !== 'undefined' && _plannerTimeoutId) {
        clearTimeout(_plannerTimeoutId);
        _plannerTimeoutId = null;
      }
      onPlanResult(data.results, data.noFeasibleWindow, data.dbg, 'lambert'); // TODO: import from src/ui/hud/mission-control/index.ts
      return;
    }
    if (data.type === 'redirect_result') {
      if (Number.isFinite(data.reqId) && Number.isFinite(_activeRedirectRequestId) && data.reqId !== _activeRedirectRequestId) {
        return;
      }
      if (typeof _plannerTimeoutId !== 'undefined' && _plannerTimeoutId) {
        clearTimeout(_plannerTimeoutId); _plannerTimeoutId = null;
      }
      onRedirectResult(data); // TODO: import from src/ui/hud/mission-control/index.ts
      return;
    }
    if (data.type === 'error') {
      if (typeof _plannerTimeoutId !== 'undefined' && _plannerTimeoutId) {
        clearTimeout(_plannerTimeoutId);
        _plannerTimeoutId = null;
      }
      showPlannerError(data.message || 'Worker error'); // TODO: import from src/ui/hud/mission-control/index.ts
      return;
    }
    if (data.type === 'query_pos_result' && Number.isFinite(data.reqId) && data.reqId === _activeReturnQueryId && data.ok) {
      missionReturnTargetPos = { x: data.x, y: data.y, z: data.z }; // TODO: import from src/ui/hud/mission-control/state.ts
      if (optimalTrajectory) {
        syncActiveMissionVisuals(); // TODO: import from src/ui/hud/mission-control/index.ts
      }
      return;
    }
  };

  _worker.onerror = (err: ErrorEvent) => console.error('[Worker error]', err);

  return _worker;
}

export function getWorker(): Worker {
  if (!_worker) throw new Error('Worker not initialised — call initWorker() first');
  return _worker;
}

// ─── Typed command wrappers ───────────────────────────────────────────────────

export function postPropagate(jd: number): void {
  // TODO: import lastPropJD, lastPropagateRequestMs from src/workers/physics/client.ts (or time-state module)
  getWorker().postMessage({ cmd: 'propagate', jd });
}

export function postInit(asteroids: any[], apiBase: string): void {
  getWorker().postMessage({ cmd: 'init', asteroids, apiBase });
}

export function postFetchCatalog(limit: number, apiBase: string): void {
  getWorker().postMessage({ cmd: 'fetch_catalog', limit, apiBase });
}

export function postFetchNHATS(apiBase: string): void {
  getWorker().postMessage({ cmd: 'fetch_nhats', apiBase });
}

export function postPlanMission(params: {
  ast: any;
  jd_start: number;
  jd_end: number;
  reqId: number;
  destination: string;
  parkingAlt_km: number;
  spacecraft: string;
  stayDays: number;
}): void {
  getWorker().postMessage({ cmd: 'plan_mission', ...params });
}

export function postPlanRedirectMission(params: {
  reqId: number;
  ast: any;
  jd_start: number;
  jd_end: number;
  propulsionModule: any;
  miningFraction: number;
  captureTarget: string;
  deliveryDestination: string;
  spacecraft: string;
  launchVehicle: string;
}): void {
  getWorker().postMessage({ cmd: 'plan_redirect_mission', ...params });
}

export function postApplyBurn(params: {
  elements: any;
  jd: number;
  dv_p: number;
  dv_n: number;
  dv_r: number;
  preview?: boolean;
}): void {
  getWorker().postMessage({ cmd: 'apply_burn', ...params });
}

export function postCloseApproachScan(params: {
  elements: any;
  jd_start: number;
  years: number;
}): void {
  getWorker().postMessage({ cmd: 'close_approach_scan', ...params });
}

export function postQueryPos(params: { jd: number; reqId: number; target: string }): void {
  getWorker().postMessage({ cmd: 'query_pos', ...params });
}

// ─── Propagation throttle ─────────────────────────────────────────────────────

export function maybePropagateCurrentJD(force = false): void {
  if (currentJD === lastPropJD) return;
  const now = performance.now();
  if (!force && (now - lastPropagateRequestMs) < PROPAGATE_INTERVAL_MS) return;
  getWorker().postMessage({ cmd: 'propagate', jd: currentJD });
  setLastPropJD(currentJD);
  setLastPropagateRequestMs(now);
}

// ─── Module-level mutable state referenced in the onmessage handler ──────────
// TODO: lift these into their canonical modules and import them here
declare let loadSourceStatus: Record<string, string>;
declare let selectedAsteroidKey: string | null;
declare let selectedId: number;
declare let asteroidData: any[];
declare function fetchNHATSData(): void;
declare function onCloseApproaches(results: any[]): void;
declare function applyNHATSData(data: any): void;
declare function saveToIndexedDB(key: string, payload: any): Promise<void>;
declare function buildAsteroidMesh(data: any[]): void;
declare function loadStateFromURL(): void;
declare function showTour(): void;
declare function renderPorkchop(data: any): void;
declare function onPlanResult(results: any[], noFeasibleWindow: boolean, dbg: any, source: string): void;
declare function onRedirectResult(data: any): void;
declare function showPlannerError(err: string): void;
declare function syncActiveMissionVisuals(): void;
declare let _activeMissionType: string;
declare let _activeExtractRequestId: number;
declare let _activeRedirectRequestId: number;
declare let _activeReturnQueryId: number;
declare let _plannerTimeoutId: ReturnType<typeof setTimeout> | null;
declare let missionReturnTargetPos: { x: number; y: number; z: number } | null;
declare let optimalTrajectory: any;
