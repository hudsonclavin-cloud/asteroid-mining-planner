/// <reference lib="webworker" />

import { setAsteroids } from '../../physics/constants/index.js';
import { applyWorkerConfig } from './api-client.js';
import { handlePropagate } from './handlers/propagate.js';
import { handleGetState, handleApplyBurn, handleCloseApproachScan } from './handlers/state.js';
import { handlePorkchop } from './handlers/porkchop.js';
import { handlePlanMission } from './planner/extract.js';
import { handlePlanRedirectMission } from './planner/redirect.js';
import { handleQueryPos, handleFetchNhats, handleFetchCatalog } from './handlers/catalog.js';

// ─── Message handler ─────────────────────────────────────────────────────────
self.onmessage = function(e: MessageEvent) {
  const msg = e.data || {};
  applyWorkerConfig(msg);

  if (msg.cmd === 'configure') {
    return;
  }

  if (msg.cmd === 'init') {
    setAsteroids(
      Array.isArray(msg.asteroids) ? msg.asteroids.filter((ast: any) =>
        ast && Number.isFinite(ast.a) && Number.isFinite(ast.e) && Number.isFinite(ast.epoch)
      ) : []
    );
    return;
  }

  if (msg.cmd === 'propagate') {
    handlePropagate(msg);
    return;
  }

  if (msg.cmd === 'get_state') {
    handleGetState(msg);
    return;
  }

  if (msg.cmd === 'apply_burn') {
    handleApplyBurn(msg);
    return;
  }

  if (msg.cmd === 'close_approach_scan') {
    handleCloseApproachScan(msg);
    return;
  }

  if (msg.cmd === 'porkchop') {
    handlePorkchop(msg);
    return;
  }

  if (msg.cmd === 'plan_mission') {
    handlePlanMission(msg);
    return;
  }

  if (msg.cmd === 'plan_redirect_mission') {
    handlePlanRedirectMission(msg);
    return;
  }

  if (msg.cmd === 'query_pos') {
    handleQueryPos(msg);
    return;
  }

  if (msg.cmd === 'fetch_nhats') {
    handleFetchNhats();
    return;
  }

  if (msg.cmd === 'fetch_catalog') {
    handleFetchCatalog(msg);
    return;
  }
};
