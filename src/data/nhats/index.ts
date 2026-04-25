/**
 * src/data/nhats/index.ts
 *
 * NHATS data fetch, cache, and application logic.
 * Cache key: aster_nhats_v2 (localStorage, 24-hour TTL)
 */

import { WORKER_URL } from '../../utils/config';
import { getWorker } from '../../workers/physics/client';
import { asteroidData } from '../../state/index';
import { getNhatsMetricValue } from '../../physics/catalog/normalizers';
import { setStatus } from '../../utils/status';

// Callbacks for UI side-effects wired in main.ts
let _onNhatsApplied: (() => void) | null = null;
export function registerNhatsAppliedCallback(fn: () => void) { _onNhatsApplied = fn; }

const nhatsMap = new Map<string, any>();

function normalizeDesignation(raw: any): string {
  return String(raw || '').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
}

export function applyNHATSData(rows: any[]): void {
  if (!asteroidData || asteroidData.length === 0) return;
  const isArr = rows.length > 0 && Array.isArray(rows[0]);
  const normalizeRow = (row: any) => ({
    des: normalizeDesignation(isArr ? row[0] : (row.des ?? row.pdes)),
    fullname: normalizeDesignation(isArr ? row[1] : (row.fullname ?? row.full_name)),
    minDv: getNhatsMetricValue(isArr ? row[4] : (row.min_dv ?? row.minDv), 'dv'),
    minDur: getNhatsMetricValue(isArr ? row[5] : (row.min_dur ?? row.minDur), 'dur'),
    nTrajectories: Number(isArr ? row[6] : (row.n_via_traj || row.n_via_points || row.nTrajectories || 0)) || 0,
    occ: isArr ? (row[9] ?? null) : (row.occ ?? row.obs_flag ?? null),
  });
  nhatsMap.clear();
  rows.forEach(row => {
    const normalized = normalizeRow(row);
    if (normalized.des) nhatsMap.set(normalized.des, normalized);
    if (normalized.fullname) nhatsMap.set(normalized.fullname, normalized);
  });
  let matchCount = 0;
  for (let i = 0; i < asteroidData.length; i++) {
    const ast = asteroidData[i];
    const des = normalizeDesignation(ast.pdes || '');
    const row = nhatsMap.get(des) || nhatsMap.get(normalizeDesignation(ast.full_name || ast.name || ''));
    if (row) {
      ast.nhats = { accessible: true, minDv: row.minDv, minDur: row.minDur, nTrajectories: row.nTrajectories, stayTime: null, occ: row.occ };
      ast._nhats = true;
      matchCount++;
    } else {
      ast.nhats = { accessible: false };
    }
  }
  setStatus(`NHATS: ${matchCount} targets loaded`, false);
  const nEl = document.getElementById('hud-nhats');
  if (nEl) nEl.textContent = `NHATS: ${matchCount} TARGETS`;
  if (_onNhatsApplied) _onNhatsApplied();
}

export async function fetchNHATSData(): Promise<void> {
  const cacheKey = 'aster_nhats_v2';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 3600 * 1000) {
        applyNHATSData(data);
        return;
      }
    } catch (_) {}
  }
  getWorker().postMessage({ cmd: 'fetch_nhats', apiBase: WORKER_URL });
}
