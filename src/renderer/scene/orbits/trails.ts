/**
 * Orbital trail BufferGeometry system — selected-asteroid ellipse, future-arc
 * dashed line, and hover ellipse overlay.
 * Extracted verbatim from index.html lines 2317–2371.
 *
 * Cross-module deps stubbed with @ts-ignore:
 *   - isMobile         (not defined in any src/ util)
 *   - buildOrbitPoints (not defined in any src/ module)
 */

import * as THREE from 'three';
import { scene } from '../index';
import { isMobile } from '../../../../utils/config';
import { buildOrbitPoints } from './index';

// Phase 5: trails + labels + UI
export let trailsEnabled = true;
export let trailLine: THREE.Line | null = null;
export let futureLine: THREE.Line | null = null;
export let hoverEllipseLine: THREE.Line | null = null;
export let lastTrailJD: number | null = null;

// ─── Phase 5: Orbital Trails ──────────────────────────────────────────────────
trailLine = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ color: 0x4af7c4, transparent: true, opacity: 0.55 })
);
trailLine.visible = false;
scene.add(trailLine);

futureLine = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineDashedMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.35, dashSize: 0.01, gapSize: 0.015 })
);
futureLine.visible = false;
scene.add(futureLine);

export function clearTrail(): void {
  trailLine!.geometry.setFromPoints([]);
  futureLine!.geometry.setFromPoints([]);
  trailLine!.visible = false;
  futureLine!.visible = false;
  lastTrailJD = null;
}

export function updateOrbitEllipse(ast: { e: number; a: number; i: number; om: number; w: number } | null): void {
  if (!trailsEnabled || !ast) return;
  const pts = buildOrbitPoints(ast, isMobile ? 60 : 100);
  trailLine!.geometry.setFromPoints(pts);
  trailLine!.visible = true;
  futureLine!.visible = false;
}

export function showHoverEllipse(ast: { e: number; a: number; i: number; om: number; w: number } | null): void {
  if (!ast || !(ast as any).a || !(ast as any).e) return;
  if (!hoverEllipseLine) {
    hoverEllipseLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.25 })
    );
    scene.add(hoverEllipseLine);
  }
  hoverEllipseLine.geometry.setFromPoints(buildOrbitPoints(ast, isMobile ? 60 : 100));
  hoverEllipseLine.visible = true;
}

export function hideHoverEllipse(): void {
  if (hoverEllipseLine) hoverEllipseLine.visible = false;
}
