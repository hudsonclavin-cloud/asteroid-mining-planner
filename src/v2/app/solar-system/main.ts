const mount = document.getElementById('app');

if (!(mount instanceof HTMLElement)) {
  throw new Error('V2 Solar System mount point "#app" was not found');
}

const canvas = document.createElement('canvas');

function resizeCanvas(): void {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);

  canvas.width = Math.round(width * devicePixelRatio);
  canvas.height = Math.round(height * devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
mount.replaceChildren(canvas);
