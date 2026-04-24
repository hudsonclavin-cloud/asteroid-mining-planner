import * as THREE from 'three';
// TODO: import from src/renderer/scene — scene, dummy, visibleScale, positionCache
// TODO: import from src/renderer/scene/asteroids — asteroidData, asteroidCount, asteroidMesh
// TODO: import from src/utils — keplerPosAU, spectralTypeColor, getAsteroidDV, getDisplayValueUsd
// TODO: import from src/workers — worker

// State (module-level mirrors of index.html globals)
let dustMesh: THREE.Points | null = null;
let dustCount = 0;

export const INTERACTIVE_LIMIT = 3000; // max asteroids in animated InstancedMesh

export function buildAsteroidMesh(
  data: any[],
  // injected globals (provided by caller during modular wiring)
  deps: {
    scene: THREE.Scene;
    dummy: THREE.Object3D;
    currentJD: number;
    worker: Worker;
    asteroidData: any[];
    asteroidCount: number;
    asteroidMesh: THREE.InstancedMesh | null;
    positionCache: Float32Array;
    visibleScale: Float32Array;
    keplerPosAU: (ast: any, jd: number) => { x: number; y: number; z: number };
    spectralTypeColor: (ast: any) => THREE.Color;
    getAsteroidDV: (ast: any) => number;
    getDisplayValueUsd: (ast: any) => number;
    applyFilters: () => void;
    setAsteroidData: (d: any[]) => void;
    setAsteroidCount: (n: number) => void;
    setAsteroidMesh: (m: THREE.InstancedMesh) => void;
    setPositionCache: (f: Float32Array) => void;
    setVisibleScale: (f: Float32Array) => void;
    setDustMesh: (m: THREE.Points | null) => void;
    setDustCount: (n: number) => void;
    WORKER_URL: string;
  }
): void {
  const {
    scene, dummy, currentJD, worker, keplerPosAU, spectralTypeColor,
    getAsteroidDV, getDisplayValueUsd, applyFilters,
    setAsteroidData, setAsteroidCount, setAsteroidMesh,
    setPositionCache, setVisibleScale, setDustMesh, setDustCount, WORKER_URL,
  } = deps;

  const allValid = data.filter(a => a.a > 0 && a.e >= 0 && a.e < 1 && a.epoch);

  // Split: interactive (propagated by worker) vs dust cloud (static)
  const interactiveData = allValid.slice(0, INTERACTIVE_LIMIT);
  const overflowData = allValid.slice(INTERACTIVE_LIMIT);

  setAsteroidData(interactiveData);
  setAsteroidCount(interactiveData.length);
  if (interactiveData.length === 0) return;

  // Build dust cloud from overflow asteroids
  if (dustMesh) { scene.remove(dustMesh); dustMesh = null; dustCount = 0; }
  if (overflowData.length > 0) {
    dustCount = overflowData.length;
    const dustPositions = new Float32Array(dustCount * 3);
    const jd = currentJD;
    for (let i = 0; i < dustCount; i++) {
      try {
        const p = keplerPosAU(overflowData[i], jd);
        dustPositions[i * 3]     = p.x;
        dustPositions[i * 3 + 1] = p.y;
        dustPositions[i * 3 + 2] = p.z;
      } catch(_) {}
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x1a2a3a, size: 0.002, sizeAttenuation: true, transparent: true, opacity: 0.35 });
    dustMesh = new THREE.Points(dustGeo, dustMat);
    scene.add(dustMesh);
    setDustMesh(dustMesh);
    setDustCount(dustCount);
  }

  // Compute scores + derived fields
  const asteroidCount = interactiveData.length;
  for (let i = 0; i < asteroidCount; i++) {
    const ast = interactiveData[i];
    const H = Number(ast.H);
    const _albedo = Number(ast.albedo) || 0.15;
    const _diamKm = Number(ast.diameter) > 0
      ? Math.min(35, Number(ast.diameter))
      : (Number.isFinite(H) && H > 0 ? Math.min(35, (1329 / Math.sqrt(_albedo)) * Math.pow(10, -H / 5)) : null);
    ast._diam_m = _diamKm ? _diamKm * 1000 : null;
    ast._nhats = getAsteroidDV(ast) <= 12;
  }

  const positionCache = new Float32Array(asteroidCount * 3);
  const visibleScale  = new Float32Array(asteroidCount).fill(1.0);
  setPositionCache(positionCache);
  setVisibleScale(visibleScale);

  const geo = new THREE.SphereGeometry(0.003, 4, 4);
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const asteroidMesh = new THREE.InstancedMesh(geo, mat, asteroidCount);
  asteroidMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  for (let i = 0; i < asteroidCount; i++) {
    const ast = interactiveData[i];
    asteroidMesh.setColorAt(i, spectralTypeColor(ast));
    dummy.position.set(0, 0, 0);
    const price = getDisplayValueUsd(ast);
    const logScale = price > 0 ? Math.min(2.0, 0.6 + (Math.log10(Math.max(1, price)) / 14) * 1.4) : 0.6;
    dummy.scale.setScalar(logScale);
    dummy.updateMatrix();
    asteroidMesh.setMatrixAt(i, dummy.matrix);
  }

  asteroidMesh.instanceColor!.needsUpdate = true;
  scene.add(asteroidMesh);
  setAsteroidMesh(asteroidMesh);
  document.getElementById('asteroid-count')!.textContent = `▲ ${asteroidCount} ASTEROIDS`;
  document.getElementById('panel-idle')!.innerHTML =
    `CLICK ANY ASTEROID<br>TO SELECT TARGET<br><br>— SOLAR SYSTEM —<br>8 PLANETS ACTIVE<br>${asteroidCount} ASTEROIDS LOADED`;

  worker.postMessage({ cmd: 'init', asteroids: interactiveData, apiBase: WORKER_URL });
  worker.postMessage({ cmd: 'propagate', jd: currentJD });

  // Initial filter pass to populate leaderboard
  applyFilters();
}

export function updateAsteroidPositions(
  buf: Float32Array,
  deps: {
    asteroidMesh: THREE.InstancedMesh | null;
    asteroidCount: number;
    positionCache: Float32Array;
    visibleScale: Float32Array;
    dummy: THREE.Object3D;
  }
): void {
  const { asteroidMesh, asteroidCount, positionCache, visibleScale, dummy } = deps;
  if (!asteroidMesh || asteroidCount === 0) return;

  const base = 24; // first 8 planets × 3 floats each
  for (let i = 0; i < asteroidCount; i++) {
    const x = buf[base + i * 3], y = buf[base + i * 3 + 1], z = buf[base + i * 3 + 2];
    positionCache[i * 3]     = x;
    positionCache[i * 3 + 1] = y;
    positionCache[i * 3 + 2] = z;
    dummy.position.set(x, y, z);
    dummy.scale.setScalar(visibleScale.length > i ? visibleScale[i] : 1.0);
    (dummy as THREE.Object3D & { updateMatrix(): void }).updateMatrix();
    asteroidMesh.setMatrixAt(i, (dummy as any).matrix);
  }
  asteroidMesh.instanceMatrix.needsUpdate = true;
}
