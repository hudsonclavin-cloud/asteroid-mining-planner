import * as THREE from 'three';
import { BODY_CONSTANTS } from '../core/constants/bodies.js';
import type { BodyId } from '../core/constants/bodies.js';

export let HALOS_ENABLED = true;
export const HALO_BASE_OPACITY = 0.85;
export const HALO_FULL_VISIBILITY_MAX_DIAMETER_PX = 1.5;
export const HALO_INVISIBLE_MIN_DIAMETER_PX = 4;
export const DEFAULT_MIN_HALO_DIAMETER_PX = 8;
export const SATURN_MOON_MIN_HALO_BASE_PX = 6;

const SATURN_MOON_IDS: BodyId[] = ['titan', 'rhea', 'iapetus', 'tethys', 'dione', 'mimas', 'enceladus'];
const SMALLEST_SATURN_MOON_RADIUS_M = Math.min(
  ...SATURN_MOON_IDS.map((bodyId) => BODY_CONSTANTS[bodyId].radiusM),
);

interface HaloEntry {
  bodyId: BodyId;
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
}

export function getHaloOpacityForApparentDiameterPx(apparentDiameterPx: number): number {
  if (apparentDiameterPx <= HALO_FULL_VISIBILITY_MAX_DIAMETER_PX) {
    return HALO_BASE_OPACITY;
  }

  if (apparentDiameterPx >= HALO_INVISIBLE_MIN_DIAMETER_PX) {
    return 0;
  }

  const fadeProgress =
    (HALO_INVISIBLE_MIN_DIAMETER_PX - apparentDiameterPx) /
    (HALO_INVISIBLE_MIN_DIAMETER_PX - HALO_FULL_VISIBILITY_MAX_DIAMETER_PX);
  return fadeProgress * HALO_BASE_OPACITY;
}

export function getMinimumHaloDiameterPx(bodyId: BodyId): number {
  if (!SATURN_MOON_IDS.includes(bodyId)) {
    return DEFAULT_MIN_HALO_DIAMETER_PX;
  }

  const radiusRatio = BODY_CONSTANTS[bodyId].radiusM / SMALLEST_SATURN_MOON_RADIUS_M;
  return SATURN_MOON_MIN_HALO_BASE_PX * Math.sqrt(radiusRatio);
}

export class HaloSystem {
  private entries: Map<BodyId, HaloEntry> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    const bodyIds = Object.keys(BODY_CONSTANTS) as BodyId[];
    for (const bodyId of bodyIds) {
      const color = BODY_CONSTANTS[bodyId].vizColor;
      const material = new THREE.SpriteMaterial({
        color,
        transparent: true,
        opacity: HALO_BASE_OPACITY,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.visible = false;
      // Sprites default to scale 1×1; we set scale each frame based on pixel size.
      // Use a unit canvas texture for a round disc appearance.
      material.map = buildCircleTexture();
      scene.add(sprite);
      this.entries.set(bodyId, { bodyId, sprite, material });
    }
  }

  update(
    bodies: Array<{ bodyId: BodyId; positionRelCam: THREE.Vector3; radiusM: number }>,
    camera: THREE.Camera,
    viewport: { width: number; height: number },
  ): void {
    const perspCamera = camera as THREE.PerspectiveCamera;
    const fovRad = perspCamera.fov ? (perspCamera.fov * Math.PI) / 180 : Math.PI / 4;

    for (const { bodyId, positionRelCam, radiusM } of bodies) {
      const entry = this.entries.get(bodyId);
      if (!entry) continue;

      if (!HALOS_ENABLED) {
        entry.sprite.visible = false;
        continue;
      }

      const distM = positionRelCam.length();
      if (distM <= 0) {
        entry.sprite.visible = false;
        continue;
      }

      const apparentDiameterPx =
        2 * Math.atan(radiusM / distM) * (viewport.height / fovRad);
      const haloOpacity = getHaloOpacityForApparentDiameterPx(apparentDiameterPx);

      if (haloOpacity > 0) {
        // Show halo: position it at the body's camera-relative location
        entry.sprite.position.copy(positionRelCam);
        entry.material.opacity = haloOpacity;

        // Size the sprite to a minimum visible size (8 px diameter), projected back to world units
        const haloPixels = Math.max(getMinimumHaloDiameterPx(bodyId), apparentDiameterPx);
        // world units per pixel at that distance (pinhole approximation)
        const worldUnitsPerPixel = (2 * distM * Math.tan(fovRad / 2)) / viewport.height;
        const haloWorldSize = haloPixels * worldUnitsPerPixel;
        entry.sprite.scale.set(haloWorldSize, haloWorldSize, 1);
        entry.sprite.visible = true;
      } else {
        entry.material.opacity = 0;
        entry.sprite.visible = false;
      }
    }
  }

  dispose(): void {
    for (const entry of this.entries.values()) {
      this.scene.remove(entry.sprite);
      entry.material.map?.dispose();
      entry.material.dispose();
    }
    this.entries.clear();
  }
}

// Build a single shared canvas texture for all sprites (round disc)
let _circleTexture: THREE.CanvasTexture | null = null;
function buildCircleTexture(): THREE.CanvasTexture {
  if (_circleTexture) return _circleTexture;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const half = size / 2;
  ctx.clearRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();
  _circleTexture = new THREE.CanvasTexture(canvas);
  return _circleTexture;
}
