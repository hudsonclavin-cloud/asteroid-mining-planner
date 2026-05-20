export const SLICE9_PERF_PARTITION_MODES = Object.freeze([
  Object.freeze({
    id: 'uniform-0.5',
    label: 'Uniform 0.5 AU',
    strategy: 'uniform',
    cellSizeAu: 0.5,
  }),
  Object.freeze({
    id: 'hybrid-d200',
    label: 'Hybrid D=200',
    strategy: 'hybrid',
    coarseCellSizeAu: 1,
    fineCellSizeAu: 0.25,
    densityTrigger: 200,
  }),
  Object.freeze({
    id: 'hybrid-d500',
    label: 'Hybrid D=500',
    strategy: 'hybrid',
    coarseCellSizeAu: 1,
    fineCellSizeAu: 0.25,
    densityTrigger: 500,
  }),
  Object.freeze({
    id: 'hybrid-d1000',
    label: 'Hybrid D=1000',
    strategy: 'hybrid',
    coarseCellSizeAu: 1,
    fineCellSizeAu: 0.25,
    densityTrigger: 1000,
  }),
]);

export const SLICE9_PERF_CAMERA_STATES = Object.freeze([
  Object.freeze({
    id: 'overview',
    label: 'Full-System Overview',
    description: 'All 42k bodies in frustum, max draw.',
  }),
  Object.freeze({
    id: 'near-earth-focus',
    label: 'Near-Earth Focus',
    description: 'Dense clump hot zone; decisive state.',
  }),
  Object.freeze({
    id: 'single-asteroid-close',
    label: 'Single-Asteroid Close',
    description: 'Most cells culled; local detail state.',
  }),
  Object.freeze({
    id: 'mid-zoom-transit',
    label: 'Mid-Zoom Transit',
    description: 'Animated camera + time scrub through the clump.',
  }),
]);

export const SLICE9_PERF_RESIDUAL_ALERT_RATE = 0.05;
export const SLICE9_PERF_FRAME_WINDOW = 120;

export function getSlice9PerfPartitionMode(modeId) {
  return SLICE9_PERF_PARTITION_MODES.find((mode) => mode.id === modeId) ?? null;
}

export function getSlice9PerfCameraState(stateId) {
  return SLICE9_PERF_CAMERA_STATES.find((state) => state.id === stateId) ?? null;
}

export function createSlice9PerfSessionRow({
  partitionModeId,
  partitionModeLabel,
  cameraStateId,
  cameraStateLabel,
  workerEnabled,
  medianFrameMs,
  p95FrameMs,
  fps,
  visibleCells,
  visibleBodies,
  timestampIso,
}) {
  return Object.freeze({
    partitionModeId,
    partitionModeLabel,
    cameraStateId,
    cameraStateLabel,
    workerEnabled,
    medianFrameMs,
    p95FrameMs,
    fps,
    visibleCells,
    visibleBodies,
    timestampIso,
  });
}

export function formatSlice9PerfSessionRow(row) {
  return [
    row.timestampIso,
    row.partitionModeLabel,
    row.cameraStateLabel,
    row.workerEnabled ? 'worker' : 'main',
    `median=${row.medianFrameMs.toFixed(3)}ms`,
    `p95=${row.p95FrameMs.toFixed(3)}ms`,
    `fps=${row.fps.toFixed(2)}`,
    `visibleCells=${row.visibleCells}`,
    `visibleBodies=${row.visibleBodies}`,
  ].join(' | ');
}
