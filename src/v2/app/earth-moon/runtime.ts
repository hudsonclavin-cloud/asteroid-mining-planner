import * as THREE from 'three';
import {
  FRAME_GCRS_EARTH,
  FRAME_HELIO_J2000_ICRF,
  assertCanonicalState,
  assertFrameRoundTrip,
  configureFrameTransformHooks,
  resetFrameTransformHooks,
  transformCanonicalState,
  type CanonicalState,
} from '../../core/index.js';
import {
  projectCanonicalPositionToRenderF32,
  type CameraPositionF64,
} from '../../render/index.js';
import { loadSlice1EarthMoonFixture } from '../../boundary/slice1-earth-moon.js';

const EARTH_RADIUS_M = 6_371_010;
const MOON_RADIUS_M = 1_737_400;
const MIN_CAMERA_DISTANCE_M = EARTH_RADIUS_M + 400_000;
const MAX_CAMERA_DISTANCE_M = 149_597_870_700;
const CAMERA_FAR_M = MAX_CAMERA_DISTANCE_M * 2.5;
const ORBIT_SENSITIVITY = 0.006;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const TIME_SCRUB_STEP = 1;
const TIME_SCRUB_FAST_STEP = 4;

interface RenderSample {
  readonly earthHelio: CanonicalState;
  readonly moonHelio: CanonicalState;
  readonly earthGcrs: CanonicalState;
  readonly moonGcrs: CanonicalState;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sphericalToCartesian(radius: number, polar: number, azimuth: number): CameraPositionF64 {
  const sinPolar = Math.sin(polar);
  return {
    x: radius * sinPolar * Math.cos(azimuth),
    y: radius * Math.cos(polar),
    z: radius * sinPolar * Math.sin(azimuth),
  };
}

function applyProjectedPosition(
  object: THREE.Object3D,
  canonicalPosition: CanonicalState['positionM'],
  cameraPosition: CameraPositionF64,
): THREE.Vector3 {
  const projection = projectCanonicalPositionToRenderF32(canonicalPosition, cameraPosition);
  object.position.set(
    projection.renderF32.x,
    projection.renderF32.y,
    projection.renderF32.z,
  );
  return object.position;
}

function createBodyMesh(radiusM: number, color: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(radiusM, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.0,
  });
  return new THREE.Mesh(geometry, material);
}

function createViewportRenderer(mount: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    CAMERA_FAR_M,
  );
  camera.position.set(0, 0, 0);

  mount.replaceChildren(renderer.domElement);
  return { renderer, scene, camera };
}

export async function mountEarthMoonHonestMode(mount: HTMLElement): Promise<() => void> {
  const slice = await loadSlice1EarthMoonFixture();
  const earthByTime = new Map(slice.earth.map((sample) => [sample.state.tdbSeconds, sample.state]));

  configureFrameTransformHooks({
    earthHeliocentricStateProvider(tdbSeconds) {
      const earthState = earthByTime.get(tdbSeconds);
      if (!earthState) {
        throw new Error(`Missing Earth anchor for tdbSeconds=${tdbSeconds}`);
      }
      return earthState;
    },
  });

  const { renderer, scene, camera } = createViewportRenderer(mount);

  const earthMesh = createBodyMesh(EARTH_RADIUS_M, 0x3f7fff);
  const moonMesh = createBodyMesh(MOON_RADIUS_M, 0xb5b5b5);
  scene.add(earthMesh, moonMesh);

  const ambientLight = new THREE.AmbientLight(0x404060, 2.0);
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
  const sunTarget = new THREE.Object3D();
  scene.add(ambientLight, sunLight, sunTarget);
  sunLight.target = sunTarget;

  let currentSampleIndex = 0;
  let orbitRadius = 2e9;
  let orbitAzimuth = 0;
  let orbitPolar = Math.PI / 2;
  let disposed = false;
  let pointerActive = false;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let animationHandle = 0;

  function getCurrentRenderSample(): RenderSample {
    const earthHelio = slice.earth[currentSampleIndex].state;
    const moonHelio = slice.moon[currentSampleIndex].state;

    assertCanonicalState(earthHelio);
    assertCanonicalState(moonHelio);

    const earthGcrs = transformCanonicalState(
      earthHelio,
      FRAME_HELIO_J2000_ICRF,
      FRAME_GCRS_EARTH,
      earthHelio.tdbSeconds,
    );
    const moonGcrs = transformCanonicalState(
      moonHelio,
      FRAME_HELIO_J2000_ICRF,
      FRAME_GCRS_EARTH,
      moonHelio.tdbSeconds,
    );

    assertCanonicalState(earthGcrs);
    assertCanonicalState(moonGcrs);

    // INV-004: verify helio↔GCRS round-trip bound on every sample change
    assertFrameRoundTrip(earthHelio, FRAME_HELIO_J2000_ICRF, FRAME_GCRS_EARTH, earthHelio.tdbSeconds);

    return { earthHelio, moonHelio, earthGcrs, moonGcrs };
  }

  function updateVisibleState(): void {
    const sample = getCurrentRenderSample();
    const cameraPosition = sphericalToCartesian(orbitRadius, orbitPolar, orbitAzimuth);

    // Dynamic frustum: keeps near/far ratio ≤ 1e5 across the full zoom range so the
    // 24-bit depth buffer can distinguish objects at any scale.
    // far must cover at least the Moon's max Earth distance (~4.1e8 m) plus margin.
    const dynamicNear = Math.max(1, orbitRadius * 1e-4);
    const dynamicFar = Math.max(orbitRadius * 10, 5e8);
    if (camera.near !== dynamicNear || camera.far !== dynamicFar) {
      camera.near = dynamicNear;
      camera.far = dynamicFar;
      camera.updateProjectionMatrix();
    }

    const earthView = applyProjectedPosition(earthMesh, sample.earthGcrs.positionM, cameraPosition);
    applyProjectedPosition(moonMesh, sample.moonGcrs.positionM, cameraPosition);

    const sunDirection = new THREE.Vector3(
      -sample.earthHelio.positionM.x,
      -sample.earthHelio.positionM.y,
      -sample.earthHelio.positionM.z,
    ).normalize();

    sunTarget.position.copy(earthView);
    sunLight.position.copy(earthView).addScaledVector(sunDirection, 10_000_000_000);

    camera.lookAt(earthView);
    camera.updateMatrixWorld();
    document.title = `Aster V2 — Earth + Moon — ${currentSampleIndex + 1}/${slice.earth.length}`;
  }

  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function scrubSamples(delta: number): void {
    const maxIndex = slice.earth.length - 1;
    currentSampleIndex = clamp(currentSampleIndex + delta, 0, maxIndex);
    updateVisibleState();
  }

  function onPointerDown(event: PointerEvent): void {
    pointerActive = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    renderer.domElement.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent): void {
    if (!pointerActive) return;
    const dx = event.clientX - lastPointerX;
    const dy = event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    orbitAzimuth -= dx * ORBIT_SENSITIVITY;
    orbitPolar = clamp(
      orbitPolar + dy * ORBIT_SENSITIVITY,
      0.001,
      Math.PI - 0.001,
    );
    updateVisibleState();
  }

  function onPointerUp(event: PointerEvent): void {
    pointerActive = false;
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }
  }

  function onWheel(event: WheelEvent): void {
    event.preventDefault();
    orbitRadius = clamp(
      orbitRadius * Math.exp(event.deltaY * WHEEL_ZOOM_SENSITIVITY),
      MIN_CAMERA_DISTANCE_M,
      MAX_CAMERA_DISTANCE_M,
    );
    updateVisibleState();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      scrubSamples(event.shiftKey ? TIME_SCRUB_FAST_STEP : TIME_SCRUB_STEP);
      return;
    }
    if (event.key === 'ArrowLeft') {
      scrubSamples(event.shiftKey ? -TIME_SCRUB_FAST_STEP : -TIME_SCRUB_STEP);
      return;
    }
    if (event.key === 'Home') {
      currentSampleIndex = 0;
      updateVisibleState();
      return;
    }
    if (event.key === 'End') {
      currentSampleIndex = slice.earth.length - 1;
      updateVisibleState();
      return;
    }
    if (event.key === '0') {
      orbitRadius = MAX_CAMERA_DISTANCE_M;
      updateVisibleState();
    }
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointerleave', onPointerUp);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);

  updateVisibleState();

  const renderFrame = (): void => {
    if (disposed) return;
    renderer.render(scene, camera);
    animationHandle = window.requestAnimationFrame(renderFrame);
  };
  renderFrame();

  return () => {
    disposed = true;
    resetFrameTransformHooks();
    window.cancelAnimationFrame(animationHandle);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    renderer.domElement.removeEventListener('pointerleave', onPointerUp);
    renderer.domElement.removeEventListener('wheel', onWheel);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    renderer.dispose();
    renderer.domElement.remove();
    earthMesh.geometry.dispose();
    moonMesh.geometry.dispose();
    (earthMesh.material as THREE.Material).dispose();
    (moonMesh.material as THREE.Material).dispose();
  };
}
