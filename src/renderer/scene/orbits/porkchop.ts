import * as THREE from 'three';
// TODO: import from src/utils — jdToDate, setCurrentJD, TWO_PI
// TODO: import from src/state — selectedId, asteroidData, currentJD, currentBurnElements, missionResults, selectedTrajIdx
// TODO: import from src/workers — worker

// ─── Porkchop Plot ────────────────────────────────────────────────────────────
export let porkchopData: any = null;

export function initPorkchop(deps: {
  selectedId: () => number;
  asteroidData: () => any[];
  currentJD: () => number;
  currentBurnElements: () => any;
  worker: Worker;
  jdToDate: (jd: number) => string;
}): void {
  const { selectedId, asteroidData, currentJD, currentBurnElements, worker, jdToDate } = deps;

  document.getElementById('btn-show-porkchop')!.addEventListener('click', () => {
    const id = selectedId();
    if (id < 0) return;
    document.getElementById('porkchop-panel')!.style.display = 'block';
    document.getElementById('porkchop-status')!.textContent = 'COMPUTING...';
    const jd = currentJD();
    document.getElementById('pc-x-start')!.textContent = jdToDate(jd);
    document.getElementById('pc-x-end')!.textContent = jdToDate(jd + 365 * 5);

    worker.postMessage({
      cmd: 'porkchop',
      ast: asteroidData()[id],
      burn_elements: currentBurnElements(),
      jd_start: jd,
      jd_end: jd + 365 * 5,
      tof_min: 60,
      tof_max: 450,
      nx: 50,
      ny: 40,
    });
  });

  document.getElementById('porkchop-canvas')!.addEventListener('click', (e) => {
    if (!porkchopData) return;
    const canvas = document.getElementById('porkchop-canvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const ix = Math.floor((e.clientX - rect.left) / rect.width * porkchopData.nx);
    const jd = porkchopData.jd_start + ix / (porkchopData.nx - 1) * (porkchopData.jd_end - porkchopData.jd_start);
    deps.setCurrentJD?.(jd);
  });

  document.getElementById('porkchop-canvas')!.addEventListener('mousemove', (e) => {
    if (!porkchopData) return;
    const canvas = document.getElementById('porkchop-canvas') as HTMLCanvasElement;
    const tooltip = document.getElementById('porkchop-tooltip')!;
    const rect = canvas.getBoundingClientRect();
    const ix = Math.floor((e.clientX - rect.left) / rect.width * porkchopData.nx);
    const iy = Math.floor((e.clientY - rect.top) / rect.height * porkchopData.ny);
    if (ix < 0 || ix >= porkchopData.nx || iy < 0 || iy >= porkchopData.ny) {
      tooltip.style.display = 'none'; return;
    }
    const dv = porkchopData.grid[ix * porkchopData.ny + iy];
    const tof = porkchopData.tof_min + iy / (porkchopData.ny - 1) * (porkchopData.tof_max - porkchopData.tof_min);
    const jd = porkchopData.jd_start + ix / (porkchopData.nx - 1) * (porkchopData.jd_end - porkchopData.jd_start);
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX - rect.left + 6) + 'px';
    tooltip.style.top = (e.clientY - rect.top - 18) + 'px';
    tooltip.textContent = `${jdToDate(jd)} | TOF:${tof.toFixed(0)}d | ΔV:${dv.toFixed(2)} km/s`;
  });

  document.getElementById('porkchop-canvas')!.addEventListener('mouseleave', () => {
    document.getElementById('porkchop-tooltip')!.style.display = 'none';
  });
}

export function renderPorkchop(
  data: any,
  deps: {
    missionResults: any[];
    selectedTrajIdx: number;
    TWO_PI: number;
  }
): void {
  const { missionResults, selectedTrajIdx, TWO_PI } = deps;

  porkchopData = data;
  const canvas = document.getElementById('porkchop-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const { nx, ny, grid } = data;

  // Draw at native grid resolution into offscreen canvas
  const offscreen = document.createElement('canvas');
  offscreen.width = nx;
  offscreen.height = ny;
  const octx = offscreen.getContext('2d')!;
  const imgData = octx.createImageData(nx, ny);

  let minDV = 999, minI = 0, minJ = 0;
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const dv = grid[i * ny + j];
      if (dv < minDV) { minDV = dv; minI = i; minJ = j; }
    }
  }

  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const dv = grid[i * ny + j];
      const t = Math.min(dv / 12, 1);
      let r: number, g: number, b: number;
      if (t < 0.5) {
        r = Math.round(255 * 2 * t);
        g = 255; b = 0;
      } else {
        r = 255;
        g = Math.round(255 * 2 * (1 - t));
        b = 0;
      }
      const idx = (j * nx + i) * 4;
      imgData.data[idx]   = r;
      imgData.data[idx+1] = g;
      imgData.data[idx+2] = b;
      imgData.data[idx+3] = 210;
    }
  }
  octx.putImageData(imgData, 0, 0);

  // Scale up to fill full canvas — pixelated for crisp cells
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

  // Scale marker to full canvas coords
  const markerX = (minI / (nx - 1)) * canvas.width;
  const markerY = (minJ / (ny - 1)) * canvas.height;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(markerX, markerY, 5, 0, TWO_PI);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '9px JetBrains Mono, monospace';
  ctx.fillText(`${minDV.toFixed(1)} km/s`,
    Math.min(markerX + 6, canvas.width - 55),
    Math.max(markerY - 4, 10));

  document.getElementById('porkchop-status')!.textContent =
    `MIN ΔV: ${minDV.toFixed(2)} km/s  |  CLICK TO SET DEPARTURE`;
  document.getElementById('pc-tof-min')!.textContent = `${data.tof_min}d`;
  document.getElementById('pc-tof-max')!.textContent = `${data.tof_max}d`;

  overlayMissionResultsOnPorkchop({ missionResults, selectedTrajIdx, TWO_PI });
}

// Overlay computed mission trajectory points on the porkchop canvas when available
export function overlayMissionResultsOnPorkchop(deps: {
  missionResults: any[];
  selectedTrajIdx: number;
  TWO_PI: number;
}): void {
  const { missionResults, selectedTrajIdx, TWO_PI } = deps;
  if (!porkchopData || !missionResults.length) return;
  const canvas = document.getElementById('porkchop-canvas') as HTMLCanvasElement;
  const ctx    = canvas.getContext('2d')!;
  const { jd_start, jd_end, tof_min, tof_max } = porkchopData;
  const spanJD  = jd_end - jd_start;
  const spanTOF = tof_max - tof_min;

  missionResults.forEach((t: any, i: number) => {
    const fx = (t.jd_dep - jd_start) / spanJD;
    const fy = (t.tof    - tof_min)  / spanTOF;
    if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return;
    const cx = fx * canvas.width;
    const cy = fy * canvas.height;
    const sel = (i === selectedTrajIdx);

    ctx.beginPath();
    ctx.arc(cx, cy, sel ? 6 : 3.5, 0, TWO_PI);
    ctx.fillStyle   = sel ? '#00d4ff' : 'rgba(0,212,255,0.55)';
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth   = 1;
    ctx.fill();
    ctx.stroke();

    if (i === 0) {
      ctx.fillStyle = '#00d4ff';
      ctx.font      = '8px JetBrains Mono, monospace';
      ctx.fillText(`🛰 ${t.dv_total.toFixed(1)}`, Math.min(cx + 7, canvas.width - 48), Math.max(cy - 5, 10));
    }
  });
}
