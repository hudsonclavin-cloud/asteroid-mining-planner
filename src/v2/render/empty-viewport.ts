import * as THREE from 'three';

export interface EmptyViewportHandle {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  dispose(): void;
}

export interface EmptyViewportOptions {
  mount: HTMLElement;
}

export function mountEmptyViewportCanvas(
  options: EmptyViewportOptions,
): EmptyViewportHandle {
  const { mount } = options;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 5);

  mount.appendChild(renderer.domElement);

  let disposed = false;

  const renderFrame = (): void => {
    if (disposed) return;
    renderer.render(scene, camera);
    requestAnimationFrame(renderFrame);
  };

  const onResize = (): void => {
    if (disposed) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener('resize', onResize);
  renderFrame();

  return {
    renderer,
    scene,
    camera,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
