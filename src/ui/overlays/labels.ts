// src/ui/overlays/labels.ts
// Stage 8b extraction — CSS label pool management and 3D projection helpers
// TODO: import from src/scene or src/physics — camera, planets, positionCache, filteredIds, selectedId, asteroidData
// TODO: import from src/ui/overlays/arcs — ARC_LABEL_DEFS, _arcLabelEls, _arcAnchors, nhatsRing

// ─── Phase 5: CSS Label Pool ──────────────────────────────────────────────────

let labelPool: Array<{ el: HTMLDivElement; active: boolean }> = [];
const _labelVec = { x: 0, y: 0, z: 0 }; // replaced by THREE.Vector3 at runtime
// TODO: import THREE.Vector3 — const _labelVec = new THREE.Vector3();

/**
 * initLabels — allocates the CSS label pool (20 elements) and appends them to
 * document.body. Must be called once during scene setup.
 */
export function initLabels(): void {
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;pointer-events:none;font-family:"JetBrains Mono","Courier New",monospace;' +
      'font-size:10px;color:#60a5fa;letter-spacing:0.05em;white-space:nowrap;display:none;' +
      'text-shadow:0 0 4px rgba(0,0,0,0.8)';
    document.body.appendChild(el);
    labelPool.push({ el, active: false });
  }
}

/**
 * getLabelPool — returns the current label pool array (read-only reference).
 */
export function getLabelPool(): Array<{ el: HTMLDivElement; active: boolean }> {
  return labelPool;
}

/**
 * project3D — projects a 3D world-space point onto the screen and assigns the
 * next available label pool element. The inner `li` counter is managed by
 * updateLabelPositions (placeLabels) and this function is called from within
 * that closure; it is also exported so callers can use it outside the main loop.
 *
 * @param x      World-space X coordinate
 * @param y      World-space Y coordinate
 * @param z      World-space Z coordinate
 * @param text   Label text
 * @param color  CSS colour string (default '#60a5fa')
 * @param li     Current label-pool index (mutated by reference via wrapper object)
 * @param camera THREE.Camera instance
 * @param W      Viewport width
 * @param H      Viewport height
 */
export function project3D(
  x: number,
  y: number,
  z: number,
  text: string,
  color: string,
  // The following args are passed by the outer placeLabels closure at runtime;
  // the standalone signature is provided for external callers.
  // TODO: replace `any` types with proper THREE.js types once the module is wired
  li: { value: number },
  camera: any,
  W: number,
  H: number,
): void {
  if (li.value >= labelPool.length) return;
  // TODO: use THREE.Vector3 — _labelVec.set(x, y, z)
  const vec = { x, y, z } as any;
  const p = vec.clone ? vec.clone().project(camera) : camera.project(vec);
  if (p.z > 1 || p.z < -1) return;
  const sx = (p.x * 0.5 + 0.5) * W;
  const sy = (-p.y * 0.5 + 0.5) * H;
  if (sx < 0 || sx > W || sy < 0 || sy > H) return;
  const lbl = labelPool[li.value++];
  lbl.el.style.left = (sx + 6) + 'px';
  lbl.el.style.top = (sy - 6) + 'px';
  lbl.el.style.color = color || '#60a5fa';
  lbl.el.style.display = 'block';
  lbl.el.textContent = text;
  lbl.active = true;
}

/**
 * updateLabelPositions — hides all pooled labels, then re-projects:
 *   1. Planet name labels (8 planets)
 *   2. Selected asteroid label (cyan)
 *   3. Top-5 filtered asteroid labels (amber)
 *   4. Arc / ring contextual labels (from _arcAnchors)
 *
 * Must be called every animation frame after scene positions are updated.
 * TODO: import camera, planets, positionCache, filteredIds, selectedId,
 *        asteroidData, nhatsRing, ARC_LABEL_DEFS, _arcLabelEls, _arcAnchors,
 *        and THREE from their respective source modules.
 */
export function updateLabelPositions(
  // TODO: replace `any` with proper typed imports
  camera: any,
  planets: any[],
  positionCache: Float32Array,
  filteredIds: Array<{ i: number }>,
  selectedId: number,
  asteroidData: any[],
  nhatsRing: any,
  ARC_LABEL_DEFS: Array<{ key: string; text: string }>,
  _arcLabelEls: Record<string, HTMLElement>,
  _arcAnchors: Record<string, { pos: any; text: string } | null>,
  THREE: any,
): void {
  // Hide all pooled labels
  for (const lbl of labelPool) { lbl.el.style.display = 'none'; lbl.active = false; }
  let li = 0;
  const W = window.innerWidth, H = window.innerHeight;

  // Inline project3D closure used by the original placeLabels function
  function _project(x: number, y: number, z: number, text: string, color: string): void {
    if (li >= labelPool.length) return;
    const vec = new THREE.Vector3(x, y, z);
    const p = vec.clone().project(camera);
    if (p.z > 1 || p.z < -1) return;
    const sx = (p.x * 0.5 + 0.5) * W;
    const sy = (-p.y * 0.5 + 0.5) * H;
    if (sx < 0 || sx > W || sy < 0 || sy > H) return;
    const lbl = labelPool[li++];
    lbl.el.style.left = (sx + 6) + 'px';
    lbl.el.style.top = (sy - 6) + 'px';
    lbl.el.style.color = color || '#60a5fa';
    lbl.el.style.display = 'block';
    lbl.el.textContent = text;
    lbl.active = true;
  }

  // 1. Planet labels
  const PLANET_NAMES = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  for (let i = 0; i < planets.length; i++) {
    const pl = planets[i];
    if (!pl) continue;
    _project(pl.position.x, pl.position.y, pl.position.z, PLANET_NAMES[i], '#60a5fa');
  }

  // 2. Selected asteroid label
  if (selectedId >= 0 && positionCache.length > selectedId * 3) {
    const x = positionCache[selectedId * 3], y = positionCache[selectedId * 3 + 1], z = positionCache[selectedId * 3 + 2];
    const name = (asteroidData[selectedId]?.full_name || asteroidData[selectedId]?.pdes || '?').trim();
    _project(x, y, z, name, '#00d4ff');
  }

  // 3. Top-5 filtered asteroid labels
  const top5 = filteredIds.slice(0, 5);
  for (const id of top5) {
    const idx = (id as any).i !== undefined ? (id as any).i : id;
    if (idx === selectedId) continue;
    if (positionCache.length <= idx * 3) continue;
    const x = positionCache[idx * 3], y = positionCache[idx * 3 + 1], z = positionCache[idx * 3 + 2];
    const name = (asteroidData[idx]?.full_name || asteroidData[idx]?.pdes || '?').trim().split(' ')[0];
    _project(x, y, z, name, '#92400e');
  }

  // 4. Arc / ring contextual labels
  const _lv = new THREE.Vector3();
  for (const def of ARC_LABEL_DEFS) {
    const el = _arcLabelEls[def.key];
    if (!el) continue;
    // Special case: NHATS ring reads position from nhatsRing mesh directly
    let anchor = _arcAnchors[def.key];
    if (def.key === 'nhatsRing') {
      if (nhatsRing?.visible) {
        anchor = { pos: nhatsRing.position.clone().add(new THREE.Vector3(0, 0.015, 0)), text: def.text };
      } else {
        anchor = null;
      }
    }
    if (!anchor || !anchor.pos) { el.style.display = 'none'; continue; }
    _lv.copy(anchor.pos);
    const p = _lv.clone().project(camera);
    if (p.z > 1 || p.z < -1) { el.style.display = 'none'; continue; }
    const sx = (p.x * 0.5 + 0.5) * W;
    const sy = (-p.y * 0.5 + 0.5) * H;
    if (sx < 0 || sx > W || sy < 0 || sy > H) { el.style.display = 'none'; continue; }
    el.style.left = (sx + 8) + 'px';
    el.style.top = (sy - 8) + 'px';
    el.textContent = anchor.text || def.text;
    el.style.display = 'block';
  }
}
