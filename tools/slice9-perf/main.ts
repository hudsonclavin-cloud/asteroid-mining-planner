import * as THREE from 'three';

import { loadSlice9NeaCatalogFixture } from '../../src/v2/boundary/slice9-nea-catalog.js';
import {
  partitionSlice9HybridPositions,
  partitionSlice9UniformPositions,
  type Slice9HybridPartitionResult,
  type Slice9UniformPartitionResult,
} from '../../src/v2/render/slice9-spatial-partition.js';
import {
  SLICE9_PERF_CAMERA_STATES,
  SLICE9_PERF_FRAME_WINDOW,
  SLICE9_PERF_PARTITION_MODES,
  createSlice9PerfSessionRow,
  formatSlice9PerfSessionRow,
  getSlice9PerfCameraState,
  getSlice9PerfPartitionMode,
} from './config.mjs';
import { Slice9PerfCellRenderer, type Slice9PerfPartitionLeafCell } from './renderer.js';
import {
  propagateSlice9PerfBodies,
  resolveSlice9PerfRenderRadiusM,
  type Slice9PerfBody,
} from './shared.js';

const AU_M = 149_597_870_700;
const J2000_TDB_JULIAN_DAY = 2451545;
const DEFAULT_PARTITION_MODE_ID = 'uniform-0.5';
const DEFAULT_CAMERA_STATE_ID = 'overview';
const CLOSE_FOCUS_BODY_ID = 'asteroid-433';
const STATIC_PARTITION_REBUILD_INTERVAL_MS = 15_000;
const TRANSIT_PARTITION_REBUILD_INTERVAL_MS = 2_500;
const TIME_SCRUB_SECONDS_PER_REAL_SECOND = 21_600;

interface PerfBodyRuntime extends Slice9PerfBody {
  readonly anchorTdbSeconds: number;
}

interface CameraRigSnapshot {
  readonly anchorPositionM: { readonly x: number; readonly y: number; readonly z: number };
  readonly cameraPositionM: { readonly x: number; readonly y: number; readonly z: number };
}

class RollingFrameStats {
  private readonly windowSize: number;
  private readonly values: number[];
  private pointer = 0;
  private count = 0;

  constructor(windowSize: number) {
    this.windowSize = windowSize;
    this.values = new Array(windowSize).fill(0);
  }

  push(value: number): void {
    this.values[this.pointer] = value;
    this.pointer = (this.pointer + 1) % this.windowSize;
    this.count = Math.min(this.count + 1, this.windowSize);
  }

  snapshot(): { medianMs: number; p95Ms: number; fps: number } | null {
    if (this.count === 0) {
      return null;
    }
    const sample = this.values.slice(0, this.count).sort((left, right) => left - right);
    const mid = Math.floor(sample.length / 2);
    const medianMs = sample.length % 2 === 0 ? (sample[mid - 1] + sample[mid]) / 2 : sample[mid];
    const p95Index = Math.min(sample.length - 1, Math.ceil(sample.length * 0.95) - 1);
    const p95Ms = sample[p95Index];
    const fps = medianMs > 0 ? 1000 / medianMs : 0;
    return { medianMs, p95Ms, fps };
  }
}

function vectorToObject(vector: THREE.Vector3): { x: number; y: number; z: number } {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function formatMs(value: number): string {
  return `${value.toFixed(3)} ms`;
}

function formatFps(value: number): string {
  return `${value.toFixed(2)} fps`;
}

function formatWorkerLabel(enabled: boolean, inFlight: boolean): string {
  if (!enabled) {
    return 'main thread';
  }
  return inFlight ? 'worker active' : 'worker idle';
}

function createCamera(canvas: HTMLCanvasElement): THREE.PerspectiveCamera {
  return new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 10, 50 * AU_M);
}

function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  return renderer;
}

function normalizeBodies(catalog: Awaited<ReturnType<typeof loadSlice9NeaCatalogFixture>>): PerfBodyRuntime[] {
  return Object.values(catalog.asteroids)
    .sort((left, right) => left.bodyId.localeCompare(right.bodyId, 'en', { numeric: true }))
    .map((body) => ({
      bodyId: body.bodyId,
      designation: body.designation,
      orbitClass: body.orbitClass,
      anchorSource: body.anchorSource,
      inv014Tier: body.inv014Tier,
      renderRadiusM: resolveSlice9PerfRenderRadiusM(body.estimatedRadiusM, body.H),
      anchorPositionM: [
        body.anchorState.positionM.x,
        body.anchorState.positionM.y,
        body.anchorState.positionM.z,
      ] as const,
      anchorTdbSeconds: body.anchorState.tdbSeconds,
      elements: body.elements,
    }));
}

function float64PositionsToKmPoints(
  positionsM: Float64Array,
  target: Array<{ x: number; y: number; z: number }>,
): Array<{ x: number; y: number; z: number }> {
  const neededLength = positionsM.length / 3;
  while (target.length < neededLength) {
    target.push({ x: 0, y: 0, z: 0 });
  }

  for (let index = 0; index < neededLength; index += 1) {
    const offset = index * 3;
    target[index].x = positionsM[offset] / 1000;
    target[index].y = positionsM[offset + 1] / 1000;
    target[index].z = positionsM[offset + 2] / 1000;
  }
  target.length = neededLength;
  return target;
}

function determineDenseClusterAnchor(positionsM: Float64Array): THREE.Vector3 {
  const pointsKm = float64PositionsToKmPoints(positionsM, []);
  const uniform = partitionSlice9UniformPositions(pointsKm, 0.5);
  const densest = [...uniform.cells].sort(
    (left, right) => right.bodyIndices.length - left.bodyIndices.length,
  )[0];
  const centroid = new THREE.Vector3();
  for (const bodyIndex of densest.bodyIndices) {
    const offset = bodyIndex * 3;
    centroid.x += positionsM[offset];
    centroid.y += positionsM[offset + 1];
    centroid.z += positionsM[offset + 2];
  }
  centroid.divideScalar(densest.bodyIndices.length);
  return centroid;
}

function determineCloseFocusAnchor(
  bodies: readonly PerfBodyRuntime[],
  positionsM: Float64Array,
): { anchor: THREE.Vector3; radiusM: number } {
  const bodyIndex = Math.max(
    0,
    bodies.findIndex((body) => body.bodyId === CLOSE_FOCUS_BODY_ID),
  );
  const offset = bodyIndex * 3;
  return {
    anchor: new THREE.Vector3(
      positionsM[offset],
      positionsM[offset + 1],
      positionsM[offset + 2],
    ),
    radiusM: bodies[bodyIndex].renderRadiusM,
  };
}

function cameraSnapshotForState(
  stateId: string,
  elapsedSeconds: number,
  denseClusterAnchor: THREE.Vector3,
  closeFocus: { anchor: THREE.Vector3; radiusM: number },
): CameraRigSnapshot {
  if (stateId === 'near-earth-focus') {
    return {
      anchorPositionM: vectorToObject(denseClusterAnchor),
      cameraPositionM: {
        x: denseClusterAnchor.x + 0.18 * AU_M,
        y: denseClusterAnchor.y + 0.05 * AU_M,
        z: denseClusterAnchor.z + 0.12 * AU_M,
      },
    };
  }

  if (stateId === 'single-asteroid-close') {
    const distance = Math.max(closeFocus.radiusM * 900, 2_000_000);
    return {
      anchorPositionM: vectorToObject(closeFocus.anchor),
      cameraPositionM: {
        x: closeFocus.anchor.x + distance,
        y: closeFocus.anchor.y + distance * 0.28,
        z: closeFocus.anchor.z + distance * 0.78,
      },
    };
  }

  if (stateId === 'mid-zoom-transit') {
    const orbitAngle = elapsedSeconds * 0.12;
    const transitRadius = 0.24 * AU_M;
    return {
      anchorPositionM: vectorToObject(denseClusterAnchor),
      cameraPositionM: {
        x: denseClusterAnchor.x + Math.cos(orbitAngle) * transitRadius,
        y: denseClusterAnchor.y + Math.sin(orbitAngle * 0.4) * 0.08 * AU_M,
        z: denseClusterAnchor.z + Math.sin(orbitAngle) * transitRadius * 0.7,
      },
    };
  }

  return {
    anchorPositionM: { x: 0, y: 0, z: 0 },
    cameraPositionM: {
      x: 0,
      y: 3 * AU_M,
      z: 9 * AU_M,
    },
  };
}

function describePartition(
  result: Slice9UniformPartitionResult | Slice9HybridPartitionResult,
): string {
  if (result.strategy === 'uniform') {
    return `uniform 0.5 AU | occupied=${result.summary.occupiedCellCount} | maxLeaf=${result.summary.maxBodiesPerCell}`;
  }
  return `hybrid D=${result.densityTrigger} | coarse=${result.summary.coarseCellCount} | subCells=${result.summary.subCellCount} | maxLeaf=${result.summary.maxLeafBodiesPerCell}`;
}

function extractLeafCells(
  result: Slice9UniformPartitionResult | Slice9HybridPartitionResult,
): Slice9PerfPartitionLeafCell[] {
  if (result.strategy === 'uniform') {
    return result.cells.map((cell) => ({
      key: cell.key,
      boundsKm: cell.boundsKm,
      bodyIndices: cell.bodyIndices.slice(),
    }));
  }

  return result.leafCells.map((cell) => ({
    key: cell.key,
    boundsKm: cell.boundsKm,
    bodyIndices: cell.bodyIndices.slice(),
  }));
}

async function main() {
  const canvas = document.querySelector<HTMLCanvasElement>('#perf-canvas');
  if (!canvas) {
    throw new Error('Missing #perf-canvas');
  }

  const partitionContainer = document.querySelector<HTMLDivElement>('#partition-modes');
  const cameraContainer = document.querySelector<HTMLDivElement>('#camera-states');
  const workerToggle = document.querySelector<HTMLInputElement>('#worker-toggle');
  const logResultButton = document.querySelector<HTMLButtonElement>('#log-result-button');
  const copyLogButton = document.querySelector<HTMLButtonElement>('#copy-log-button');
  const sessionLog = document.querySelector<HTMLPreElement>('#session-log');
  const copyStatus = document.querySelector<HTMLDivElement>('#log-copy-status');
  if (
    !partitionContainer ||
    !cameraContainer ||
    !workerToggle ||
    !logResultButton ||
    !copyLogButton ||
    !sessionLog ||
    !copyStatus
  ) {
    throw new Error('Slice 9 perf page is missing required controls');
  }

  const metricCurrent = document.querySelector<HTMLElement>('#metric-current')!;
  const metricMedian = document.querySelector<HTMLElement>('#metric-median')!;
  const metricP95 = document.querySelector<HTMLElement>('#metric-p95')!;
  const metricFps = document.querySelector<HTMLElement>('#metric-fps')!;
  const targetIndicator = document.querySelector<HTMLElement>('#target-indicator')!;
  const statusVisibleCells = document.querySelector<HTMLElement>('#status-visible-cells')!;
  const statusVisibleBodies = document.querySelector<HTMLElement>('#status-visible-bodies')!;
  const statusPartitionSummary = document.querySelector<HTMLElement>('#status-partition-summary')!;
  const statusWorker = document.querySelector<HTMLElement>('#status-worker')!;
  const statusFallback = document.querySelector<HTMLElement>('#status-fallback')!;

  const renderer = createRenderer(canvas);
  const camera = createCamera(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030913);
  scene.add(new THREE.AmbientLight(0x4a6178, 1.4));
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.65);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const catalog = await loadSlice9NeaCatalogFixture();
  const bodies = normalizeBodies(catalog);
  const initialBatch = propagateSlice9PerfBodies(
    bodies,
    bodies[0]?.anchorTdbSeconds ?? 0,
  );
  const denseClusterAnchor = determineDenseClusterAnchor(initialBatch.positionsM);
  const closeFocus = determineCloseFocusAnchor(bodies, initialBatch.positionsM);

  const perfRenderer = new Slice9PerfCellRenderer(
    bodies.map((body) => ({
      bodyId: body.bodyId,
      renderRadiusM: body.renderRadiusM,
    })),
  );
  scene.add(perfRenderer.root);

  let activePartitionModeId = DEFAULT_PARTITION_MODE_ID;
  let activeCameraStateId = DEFAULT_CAMERA_STATE_ID;
  let workerEnabled = false;
  let lastFrameAtMs = performance.now();
  let elapsedSeconds = 0;
  let currentPositionsM = initialBatch.positionsM;
  let fallbackBodyCount = initialBatch.fallbackBodyCount;
  let lastPartitionBuildAtMs = Number.NEGATIVE_INFINITY;
  let partitionDescription = '';
  const rollingStats = new RollingFrameStats(SLICE9_PERF_FRAME_WINDOW);
  const sessionRows: string[] = [];

  let worker: Worker | null = null;
  let workerReady = false;
  let workerRequestId = 0;
  let workerInFlight = false;
  let latestWorkerPositionsM: Float64Array | null = null;
  let latestWorkerFallbackCount = 0;

  const reusableKmPoints: Array<{ x: number; y: number; z: number }> = [];

  function rebuildPartition(nowMs: number) {
    const mode = getSlice9PerfPartitionMode(activePartitionModeId);
    if (!mode) {
      throw new Error(`Unknown partition mode ${activePartitionModeId}`);
    }
    const positionsKm = float64PositionsToKmPoints(currentPositionsM, reusableKmPoints);
    const partition =
      mode.strategy === 'uniform'
        ? partitionSlice9UniformPositions(positionsKm, mode.cellSizeAu)
        : partitionSlice9HybridPositions(positionsKm, {
            coarseCellSizeAu: mode.coarseCellSizeAu,
            fineCellSizeAu: mode.fineCellSizeAu,
            densityTrigger: mode.densityTrigger,
          });
    perfRenderer.rebuild(extractLeafCells(partition));
    partitionDescription = describePartition(partition);
    lastPartitionBuildAtMs = nowMs;
  }

  async function ensureWorker(): Promise<void> {
    if (worker) {
      return;
    }
    worker = new Worker(new URL('./propagation-worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      const message = event.data;
      if (message?.type === 'ready') {
        workerReady = true;
        return;
      }
      if (message?.type === 'propagate-result') {
        latestWorkerPositionsM = new Float64Array(message.positionsM);
        latestWorkerFallbackCount = message.fallbackBodyCount;
        workerInFlight = false;
      }
    };
    worker.postMessage({
      type: 'init',
      bodies,
    });
  }

  async function setWorkerEnabled(nextEnabled: boolean) {
    workerEnabled = nextEnabled;
    if (workerEnabled) {
      await ensureWorker();
    }
    workerInFlight = false;
    latestWorkerPositionsM = null;
  }

  function maybeDispatchWorker(targetTdbSeconds: number) {
    if (!workerEnabled || !worker || !workerReady || workerInFlight) {
      return;
    }
    workerRequestId += 1;
    workerInFlight = true;
    worker.postMessage({
      type: 'propagate',
      requestId: workerRequestId,
      targetTdbSeconds,
    });
  }

  function renderLoop(nowMs: number) {
    const deltaMs = nowMs - lastFrameAtMs;
    lastFrameAtMs = nowMs;
    elapsedSeconds += deltaMs / 1000;
    const targetTdbSeconds = (bodies[0]?.anchorTdbSeconds ?? 0) + elapsedSeconds * TIME_SCRUB_SECONDS_PER_REAL_SECOND;

    if (workerEnabled) {
      maybeDispatchWorker(targetTdbSeconds);
      if (latestWorkerPositionsM) {
        currentPositionsM = latestWorkerPositionsM;
        fallbackBodyCount = latestWorkerFallbackCount;
        latestWorkerPositionsM = null;
      }
    } else {
      const batch = propagateSlice9PerfBodies(bodies, targetTdbSeconds);
      currentPositionsM = batch.positionsM;
      fallbackBodyCount = batch.fallbackBodyCount;
    }

    const rebuildIntervalMs =
      activeCameraStateId === 'mid-zoom-transit'
        ? TRANSIT_PARTITION_REBUILD_INTERVAL_MS
        : STATIC_PARTITION_REBUILD_INTERVAL_MS;
    if (nowMs - lastPartitionBuildAtMs >= rebuildIntervalMs) {
      rebuildPartition(nowMs);
    }

    const snapshot = cameraSnapshotForState(
      activeCameraStateId,
      elapsedSeconds,
      denseClusterAnchor,
      closeFocus,
    );
    camera.position.set(
      snapshot.cameraPositionM.x - snapshot.anchorPositionM.x,
      snapshot.cameraPositionM.y - snapshot.anchorPositionM.y,
      snapshot.cameraPositionM.z - snapshot.anchorPositionM.z,
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    perfRenderer.update(currentPositionsM, snapshot.anchorPositionM, camera);
    renderer.render(scene, camera);

    rollingStats.push(deltaMs);
    const stats = rollingStats.snapshot();
    const rendererStats = perfRenderer.getStats();

    metricCurrent.textContent = formatMs(deltaMs);
    statusVisibleCells.textContent = String(rendererStats.visibleLeafCells);
    statusVisibleBodies.textContent = String(rendererStats.visibleBodies);
    statusPartitionSummary.textContent = partitionDescription;
    statusWorker.textContent = formatWorkerLabel(workerEnabled, workerInFlight);
    statusFallback.textContent = String(fallbackBodyCount);

    if (stats) {
      metricMedian.textContent = formatMs(stats.medianMs);
      metricP95.textContent = formatMs(stats.p95Ms);
      metricFps.textContent = formatFps(stats.fps);

      targetIndicator.className = 'target-indicator';
      if (stats.medianMs < 16.67) {
        targetIndicator.classList.add('target-green');
        targetIndicator.textContent = '60 fps target cleared';
      } else if (stats.medianMs <= 25) {
        targetIndicator.classList.add('target-yellow');
        targetIndicator.textContent = 'Below 60 fps, still interactive';
      } else {
        targetIndicator.classList.add('target-red');
        targetIndicator.textContent = 'Frame time above 25 ms';
      }
    }

    requestAnimationFrame(renderLoop);
  }

  function renderPartitionControls() {
    partitionContainer.innerHTML = '';
    for (const mode of SLICE9_PERF_PARTITION_MODES) {
      const label = document.createElement('label');
      label.className = `option-card${mode.id === activePartitionModeId ? ' active' : ''}`;
      label.innerHTML = `
        <input type="radio" name="partition-mode" value="${mode.id}" ${mode.id === activePartitionModeId ? 'checked' : ''} />
        <span class="option-card-title">${mode.label}</span>
        <span class="option-card-meta">${
          mode.strategy === 'uniform'
            ? 'occupied cells measured in Node harness'
            : `coarse 1 AU / fine 0.25 AU / trigger ${mode.densityTrigger}`
        }</span>
      `;
      label.addEventListener('click', () => {
        activePartitionModeId = mode.id;
        renderPartitionControls();
        rebuildPartition(performance.now());
      });
      partitionContainer.appendChild(label);
    }
  }

  function renderCameraControls() {
    cameraContainer.innerHTML = '';
    for (const state of SLICE9_PERF_CAMERA_STATES) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `camera-button${state.id === activeCameraStateId ? ' active' : ''}`;
      button.innerHTML = `<strong>${state.label}</strong><small>${state.description}</small>`;
      button.addEventListener('click', () => {
        activeCameraStateId = state.id;
        renderCameraControls();
      });
      cameraContainer.appendChild(button);
    }
  }

  function refreshSessionLog() {
    sessionLog.textContent = sessionRows.length > 0 ? sessionRows.join('\n') : 'No results logged yet.';
  }

  workerToggle.addEventListener('change', async () => {
    await setWorkerEnabled(workerToggle.checked);
  });

  logResultButton.addEventListener('click', () => {
    const partitionMode = getSlice9PerfPartitionMode(activePartitionModeId);
    const cameraState = getSlice9PerfCameraState(activeCameraStateId);
    const stats = rollingStats.snapshot();
    const rendererStats = perfRenderer.getStats();
    if (!partitionMode || !cameraState || !stats) {
      return;
    }
    const row = createSlice9PerfSessionRow({
      partitionModeId: partitionMode.id,
      partitionModeLabel: partitionMode.label,
      cameraStateId: cameraState.id,
      cameraStateLabel: cameraState.label,
      workerEnabled,
      medianFrameMs: stats.medianMs,
      p95FrameMs: stats.p95Ms,
      fps: stats.fps,
      visibleCells: rendererStats.visibleLeafCells,
      visibleBodies: rendererStats.visibleBodies,
      timestampIso: new Date().toISOString(),
    });
    sessionRows.push(formatSlice9PerfSessionRow(row));
    refreshSessionLog();
  });

  copyLogButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(sessionRows.join('\n'));
      copyStatus.textContent = 'Session log copied to clipboard.';
    } catch (error) {
      copyStatus.textContent = `Clipboard copy failed: ${String(error)}`;
    }
  });

  function handleResize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', handleResize);

  renderPartitionControls();
  renderCameraControls();
  rebuildPartition(performance.now());
  requestAnimationFrame(renderLoop);
}

void main();
