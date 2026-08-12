// B2 T2-2 axis triad (S-S17-BATCH2-2026-08-12-A).
//
// A corner orientation gizmo: three arrows in a private mini-scene, rendered
// after the main pass into a scissored viewport, counter-rotated by the main
// camera's quaternion so they always show where the SCENE axes point.
//
// The axis meanings are the C2-verified render frame
// (tools/frontb-2026-08-11/C2_FRAME_VERDICT.md, verdict (i)) — heliocentric
// J2000 equatorial (ICRF), positions passed through unrotated:
//   +X (red)   -> ICRF +X, the vernal equinox direction
//   +Y (green) -> completes the right-handed set
//   +Z (blue)  -> ICRF +Z, CELESTIAL (equatorial) north — deliberately NOT
//                 labeled "up" and NOT the ecliptic pole; the top-down preset
//                 looks down the ECLIPTIC pole while these axes stay
//                 equatorial, and conflating the two is the exact dishonesty
//                 the C2 caveat warns against.
// The sprite labels are the bare axis names; the meaning line lives in the
// scale/frame chips, which cite the verdict.

import * as THREE from 'three';

export const AXIS_TRIAD_SIZE_PX = 88;
export const AXIS_TRIAD_MARGIN_PX = 16;

const AXIS_LENGTH = 1;
const AXIS_COLOR_X = 0xff6b6b;
const AXIS_COLOR_Y = 0x74d99f;
const AXIS_COLOR_Z = 0x6baaff;

function makeLabelSprite(text: string, colorCss: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.font = '600 40px "SF Mono", "Roboto Mono", monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = colorCss;
    context.fillText(text, 32, 34);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.setScalar(0.42);
  return sprite;
}

export class AxisTriad {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.OrthographicCamera;
  private readonly group = new THREE.Group();
  private readonly disposables: Array<{ dispose(): void }> = [];

  constructor() {
    // A little wider than the 1.4-unit label orbit so arrowheads never clip.
    this.camera = new THREE.OrthographicCamera(-1.7, 1.7, 1.7, -1.7, 0.1, 10);
    this.camera.position.set(0, 0, 4);
    this.camera.lookAt(0, 0, 0);

    const axes: ReadonlyArray<{ dir: THREE.Vector3; color: number; css: string; label: string }> = [
      { dir: new THREE.Vector3(1, 0, 0), color: AXIS_COLOR_X, css: '#ff6b6b', label: 'X' },
      { dir: new THREE.Vector3(0, 1, 0), color: AXIS_COLOR_Y, css: '#74d99f', label: 'Y' },
      { dir: new THREE.Vector3(0, 0, 1), color: AXIS_COLOR_Z, css: '#6baaff', label: 'Z' },
    ];
    for (const axis of axes) {
      const arrow = new THREE.ArrowHelper(axis.dir, new THREE.Vector3(0, 0, 0), AXIS_LENGTH, axis.color, 0.28, 0.14);
      this.group.add(arrow);
      this.disposables.push(arrow.line.geometry, arrow.cone.geometry);
      this.disposables.push(arrow.line.material as THREE.Material, arrow.cone.material as THREE.Material);
      const label = makeLabelSprite(axis.label, axis.css);
      label.position.copy(axis.dir).multiplyScalar(1.4);
      this.group.add(label);
      this.disposables.push(label.material);
      if (label.material.map) {
        this.disposables.push(label.material.map);
      }
    }
    this.scene.add(this.group);
  }

  /**
   * Draw the triad into the bottom-right corner. Call AFTER the main render.
   * `cameraQuaternion` is the main camera's world quaternion; the group takes
   * its inverse so the gizmo shows the scene axes' directions in view space.
   * Restores the full-canvas viewport before returning, so later passes (and
   * the next frame) are unaffected.
   */
  render(renderer: THREE.WebGLRenderer, cameraQuaternion: THREE.Quaternion): void {
    this.group.quaternion.copy(cameraQuaternion).invert();
    const size = renderer.getSize(new THREE.Vector2());
    const x = size.x - AXIS_TRIAD_SIZE_PX - AXIS_TRIAD_MARGIN_PX;
    const y = AXIS_TRIAD_MARGIN_PX;
    renderer.setScissorTest(true);
    renderer.setViewport(x, y, AXIS_TRIAD_SIZE_PX, AXIS_TRIAD_SIZE_PX);
    renderer.setScissor(x, y, AXIS_TRIAD_SIZE_PX, AXIS_TRIAD_SIZE_PX);
    renderer.clearDepth();
    renderer.render(this.scene, this.camera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, size.x, size.y);
  }

  dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
}
