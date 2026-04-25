/**
 * Orbital trail BufferGeometry system — selected-asteroid ellipse, future-arc
 * dashed line, and hover ellipse overlay.
 * Extracted verbatim from index.html lines 2317–2371.
 *
 * Cross-module deps stubbed with @ts-ignore:
 *   - THREE            (global via script tag)
 *   - scene            (runtime global — THREE.Scene)
 *   - isMobile         (runtime global boolean)
 *   - buildOrbitPoints (runtime global function)
 */

// @ts-ignore — runtime global during transition
declare const THREE: typeof import('three');
// @ts-ignore — runtime global during transition
declare const scene: import('three').Scene;
// @ts-ignore — runtime global during transition
declare const isMobile: boolean;
// @ts-ignore — runtime global during transition
declare function buildOrbitPoints(
  ast: { e: number; a: number; i: number; om: number; w: number },
  steps: number
): import('three').Vector3[];

// Phase 5: trails + labels + UI
export let trailsEnabled = true;
// @ts-ignore — runtime global during transition
export let trailLine: import('three').Line | null = null;
// @ts-ignore — runtime global during transition
export let futureLine: import('three').Line | null = null;
// @ts-ignore — runtime global during transition
export let hoverEllipseLine: import('three').Line | null = null;
export let lastTrailJD: number | null = null;

// ─── Phase 5: Orbital Trails ──────────────────────────────────────────────────
// @ts-ignore — runtime global during transition
trailLine = new THREE.Line(
  // @ts-ignore — runtime global during transition
  new THREE.BufferGeometry(),
  // @ts-ignore — runtime global during transition
  new THREE.LineBasicMaterial({ color: 0x4af7c4, transparent: true, opacity: 0.55 })
);
// @ts-ignore — runtime global during transition
trailLine.visible = false;
// @ts-ignore — runtime global during transition
scene.add(trailLine);

// @ts-ignore — runtime global during transition
futureLine = new THREE.Line(
  // @ts-ignore — runtime global during transition
  new THREE.BufferGeometry(),
  // @ts-ignore — runtime global during transition
  new THREE.LineDashedMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35, dashSize: 0.01, gapSize: 0.015 })
);
// @ts-ignore — runtime global during transition
futureLine.visible = false;
// @ts-ignore — runtime global during transition
scene.add(futureLine);

export function clearTrail(): void {
  // @ts-ignore — runtime global during transition
  trailLine.geometry.setFromPoints([]);
  // @ts-ignore — runtime global during transition
  futureLine.geometry.setFromPoints([]);
  // @ts-ignore — runtime global during transition
  trailLine.visible = false;
  // @ts-ignore — runtime global during transition
  futureLine.visible = false;
  lastTrailJD = null;
}

export function updateOrbitEllipse(ast: { e: number; a: number; i: number; om: number; w: number } | null): void {
  // @ts-ignore — runtime global during transition
  if (!trailsEnabled || !ast) return;
  // @ts-ignore — runtime global during transition
  const pts = buildOrbitPoints(ast, isMobile ? 60 : 100);
  // @ts-ignore — runtime global during transition
  trailLine.geometry.setFromPoints(pts);
  // @ts-ignore — runtime global during transition
  trailLine.visible = true;
  // @ts-ignore — runtime global during transition
  futureLine.visible = false;
}

export function showHoverEllipse(ast: { e: number; a: number; i: number; om: number; w: number } | null): void {
  if (!ast || !(ast as any).a || !(ast as any).e) return;
  if (!hoverEllipseLine) {
    // @ts-ignore — runtime global during transition
    hoverEllipseLine = new THREE.Line(
      // @ts-ignore — runtime global during transition
      new THREE.BufferGeometry(),
      // @ts-ignore — runtime global during transition
      new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.25 })
    );
    // @ts-ignore — runtime global during transition
    scene.add(hoverEllipseLine);
  }
  // @ts-ignore — runtime global during transition
  hoverEllipseLine.geometry.setFromPoints(buildOrbitPoints(ast, isMobile ? 60 : 100));
  // @ts-ignore — runtime global during transition
  hoverEllipseLine.visible = true;
}

export function hideHoverEllipse(): void {
  if (hoverEllipseLine) hoverEllipseLine.visible = false;
}
