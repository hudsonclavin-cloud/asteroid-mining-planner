import { FALLBACK_CATALOG } from '../../../data/asteroids/fallback-catalog.js';
import { normalizeNhatsRow, normalizeAsterankRow, normalizeDesignation } from '../../../physics/catalog/normalizers.js';
import { propagatePlanet } from '../../../physics/propagation/planets.js';
import { propagateMoonState, propagateEarthMoonLagrangeState } from '../../../physics/propagation/moon.js';
import { buildNhatsUrl, buildAsterankUrl, getApiBaseCandidates } from '../api-client.js';

export function handleQueryPos(msg: any): void {
  const { jd, planetIdx, reqId, target } = msg;
  try {
    let s: any;
    if (target && typeof target === 'object') {
      if (target.body === 'moon') s = propagateMoonState(jd);
      else if (target.body === 'eml1') s = propagateEarthMoonLagrangeState(jd, 'l1');
      else if (target.body === 'eml2') s = propagateEarthMoonLagrangeState(jd, 'l2');
      else if (target.body === 'el4') s = propagateEarthMoonLagrangeState(jd, 'el4');
      else if (target.body === 'el5') s = propagateEarthMoonLagrangeState(jd, 'el5');
      else if (target.body === 'mars') s = propagatePlanet(3, jd);
      else s = propagatePlanet(2, jd);
    } else {
      s = propagatePlanet(planetIdx, jd);
    }
    (self as any).postMessage({ type: 'query_pos_result', reqId, ok: true,
      x: s.x, y: s.y, z: s.z, vx: s.vx, vy: s.vy, vz: s.vz });
  } catch(e) {
    (self as any).postMessage({ type: 'query_pos_result', reqId, ok: false });
  }
}

export function handleFetchNhats(): void {
  (async function() {
    for (const base of getApiBaseCandidates()) {
      const url = buildNhatsUrl(undefined, base);
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        const rows = (json.data || json.nhats || [])
          .map(normalizeNhatsRow)
          .filter((row: any) => row && row.des);
        (self as any).postMessage({ type: 'nhats_result', ok: true, data: rows, source: 'nhats', stale: !!json.stale });
        return;
      } catch(err: any) {
        console.warn('[NHATS worker] fetch error:', err.message, `(${base})`);
      }
    }
    (self as any).postMessage({ type: 'nhats_result', ok: false, error: 'All NHATS URLs failed' });
  })();
}

export function handleFetchCatalog(msg: any): void {
  (async function() {
    const requestedLimit = Math.max(10, Math.min(Number(msg.limit) || 5000, 5000));
    const fetchLimit = Math.max(250, Math.min(requestedLimit, 2000));

    async function fetchAsterankWorker() {
      for (const base of getApiBaseCandidates()) {
        try {
          const r = await fetch(buildAsterankUrl(fetchLimit, base));
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const rows = await r.json();
          if (!Array.isArray(rows) || rows.length === 0) throw new Error('empty response');
          console.log('[Catalog] Asterank:', rows.length, 'rows');
          (self as any).postMessage({ type: 'load_progress', source: 'asterank', status: 'ok', count: rows.length });
          return { rows, source: 'asterank', fallback: false, stale: false };
        } catch(err: any) {
          console.warn('[Catalog] Asterank fetch failed:', err.message, `(${base})`);
        }
      }
      {
        const rows = FALLBACK_CATALOG.slice();
        if (rows.length > 0) {
          (self as any).postMessage({ type: 'load_progress', source: 'asterank', status: 'fallback', count: rows.length });
          return { rows, source: 'fallback-static', fallback: true, stale: true };
        }
        (self as any).postMessage({ type: 'load_progress', source: 'asterank', status: 'error', error: 'offline' });
        return { rows: [], source: 'asterank', fallback: false, stale: false };
      }
    }

    async function fetchNHATSWorker() {
      for (const base of getApiBaseCandidates()) {
        try {
          const r = await fetch(buildNhatsUrl(undefined, base));
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const json = await r.json();
          const rows = (json.data || json.nhats || [])
            .map(normalizeNhatsRow)
            .filter((row: any) => row && row.des);
          console.log('[Catalog] NHATS:', rows.length, 'rows');
          (self as any).postMessage({ type: 'load_progress', source: 'nhats', status: 'ok', count: rows.length });
          return { rows, source: 'nhats', stale: !!json.stale };
        } catch(err: any) {
          console.warn('[Catalog] NHATS fetch failed:', err.message, `(${base})`);
        }
      }
      (self as any).postMessage({ type: 'load_progress', source: 'nhats', status: 'error', error: 'offline' });
      return { rows: [], source: 'nhats', stale: true };
    }

    // Fetch in parallel
    const [asterankPayload, nhatsPayload] = await Promise.all([
      fetchAsterankWorker(), fetchNHATSWorker()
    ]);

    const asterankRows = asterankPayload.rows || [];
    const nhatsRows = nhatsPayload.rows || [];
    if (asterankRows.length === 0) {
      (self as any).postMessage({ type: 'catalog_error', error: 'Catalog unavailable. Live Asterank fetch failed and no fallback catalog is available.' });
      return;
    }

    const nhatsLookup = new Map<string, any>();
    for (const row of nhatsRows) {
      if (!row?.des) continue;
      nhatsLookup.set(row.des, row);
      if (row.fullname) nhatsLookup.set(row.fullname, row);
    }

    // ── Build catalog from Asterank (primary source) ─────────────────────
    const catalog: any[] = [];
    for (const row of asterankRows) {
      const normalized = normalizeAsterankRow({
        ...row,
        data_source: asterankPayload.fallback ? 'fallback-static' : 'asterank',
      });
      if (!normalized) continue;
      const pdesKey = normalizeDesignation(normalized.pdes);
      const nhatsRow = nhatsLookup.get(pdesKey) ||
        nhatsLookup.get(normalizeDesignation(normalized.full_name || normalized.name || ''));
      const rankingValue = normalized.profit !== null
        ? normalized.profit
        : normalized.value_extractable_est !== null
          ? normalized.value_extractable_est * (normalized.diameter_source === 'catalog' ? 0.15 : 0.05)
          : null;
      normalized.screening_value_rank = rankingValue;
      normalized.nhats = nhatsRow ? {
        accessible: true,
        minDv: nhatsRow.minDv,
        minDur: nhatsRow.minDur,
        nTrajectories: nhatsRow.nTrajectories,
        stayTime: nhatsRow.stayTime,
        occ: nhatsRow.occ,
      } : { accessible: false, minDv: null, minDur: null, nTrajectories: null, stayTime: null, occ: null };
      normalized._nhats = !!nhatsRow;
      catalog.push(normalized);
    }

    // Sort by accessibility-adjusted score (profit per km/s of ΔV) so reachable NEOs rank first
    catalog.sort((a: any, b: any) => {
      const scoreA = (a.screening_value_rank || 0) / Math.max(a.delta_v || 12, 1);
      const scoreB = (b.screening_value_rank || 0) / Math.max(b.delta_v || 12, 1);
      return scoreB - scoreA;
    });
    const trimmed = catalog.slice(0, requestedLimit);

    console.log('[Catalog] Asterank →', catalog.length, 'valid, sending', trimmed.length, 'asteroids');
    (self as any).postMessage({
      type: 'catalog_ready',
      data: trimmed,
      nhatsRows,
      source: asterankPayload.source,
      fallback: !!asterankPayload.fallback,
      stale: !!asterankPayload.stale || !!nhatsPayload.stale,
      requestedLimit,
      returnedCount: trimmed.length,
    });
  })();
}
