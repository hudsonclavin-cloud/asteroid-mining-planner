import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SLICE9_PERF_CAMERA_STATES,
  SLICE9_PERF_PARTITION_MODES,
  createSlice9PerfSessionRow,
  formatSlice9PerfSessionRow,
  getSlice9PerfCameraState,
  getSlice9PerfPartitionMode,
} from '../tools/slice9-perf/config.mjs';

test('Slice 9 perf config exposes the committed four partition modes and four camera states', () => {
  assert.equal(SLICE9_PERF_PARTITION_MODES.length, 4);
  assert.equal(new Set(SLICE9_PERF_PARTITION_MODES.map((mode) => mode.id)).size, 4);
  assert.equal(SLICE9_PERF_CAMERA_STATES.length, 4);
  assert.equal(new Set(SLICE9_PERF_CAMERA_STATES.map((state) => state.id)).size, 4);

  assert.equal(getSlice9PerfPartitionMode('uniform-0.5')?.strategy, 'uniform');
  assert.equal(getSlice9PerfPartitionMode('hybrid-d500')?.densityTrigger, 500);
  assert.equal(getSlice9PerfCameraState('mid-zoom-transit')?.label, 'Mid-Zoom Transit');
});

test('Slice 9 perf session rows format the observable measurement contract cleanly', () => {
  const row = createSlice9PerfSessionRow({
    partitionModeId: 'uniform-0.5',
    partitionModeLabel: 'Uniform 0.5 AU',
    cameraStateId: 'overview',
    cameraStateLabel: 'Full-System Overview',
    workerEnabled: false,
    medianFrameMs: 15.25,
    p95FrameMs: 17.5,
    fps: 65.57,
    visibleCells: 2060,
    visibleBodies: 41906,
    timestampIso: '2026-05-20T21:30:00.000Z',
  });

  const formatted = formatSlice9PerfSessionRow(row);
  assert.match(formatted, /Uniform 0.5 AU/);
  assert.match(formatted, /Full-System Overview/);
  assert.match(formatted, /main/);
  assert.match(formatted, /median=15\.250ms/);
  assert.match(formatted, /visibleBodies=41906/);
});
