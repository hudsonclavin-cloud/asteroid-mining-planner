import * as THREE from 'three';
// TODO: import from src/renderer/scene — scene, dummy
// TODO: import from src/utils — dateToJD, AU_m
// TODO: import from src/renderer/scene/moon — makeOrbitLine, drawISSOrbit, issOrbitLine
// TODO: import from src/utils — setStatus, disposeObject3D

// ─── Phase 4: Satellite Propagation + CelesTrak ──────────────────────────────

export let satelliteData: any[] = [];
export let satelliteMesh: THREE.InstancedMesh | null = null;
export let satellitesEnabled = false;
export let selectedSatId = -1;
export let issIndex = -1;

const CELESTRAK_GROUPS = [
  { name: 'stations', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json' },
  { name: 'active',   url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json' },
  { name: 'starlink', url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json' },
];

export function propagateSatellite(
  omm: any,
  jd: number,
  deps: {
    dateToJD: (y: number, m: number, d: number) => number;
    AU_m: number;
  }
): { x: number; y: number; z: number } {
  const { dateToJD, AU_m } = deps;
  const n = omm.MEAN_MOTION * 2 * Math.PI / 86400;
  const e = omm.ECCENTRICITY || 0;
  const i = omm.INCLINATION * Math.PI / 180;
  const Om = omm.RA_OF_ASC_NODE * Math.PI / 180;
  const w  = omm.ARG_OF_PERICENTER * Math.PI / 180;
  const M0 = omm.MEAN_ANOMALY * Math.PI / 180;
  const epochDate = new Date(omm.EPOCH);
  const epochJD = dateToJD(
    epochDate.getUTCFullYear(), epochDate.getUTCMonth() + 1, epochDate.getUTCDate()
  ) + (epochDate.getUTCHours()*3600 + epochDate.getUTCMinutes()*60 + epochDate.getUTCSeconds()) / 86400;
  const dt = (jd - epochJD) * 86400;
  let M = M0 + n * dt;
  M = M - 2*Math.PI * Math.floor((M + Math.PI) / (2*Math.PI));
  let E = M;
  for (let k = 0; k < 8; k++) E = E - (E - e*Math.sin(E) - M) / (1 - e*Math.cos(E));
  const nu = 2 * Math.atan2(Math.sqrt(1+e)*Math.sin(E/2), Math.sqrt(1-e)*Math.cos(E/2));
  const GM_earth = 3.986e14;
  const a_m = Math.pow(GM_earth / (n*n), 1/3);
  const r_m = a_m * (1 - e*Math.cos(E));
  const xo = r_m * Math.cos(nu), yo = r_m * Math.sin(nu);
  const cosOm = Math.cos(Om), sinOm = Math.sin(Om);
  const cosI  = Math.cos(i),  sinI  = Math.sin(i);
  const cosW  = Math.cos(w),  sinW  = Math.sin(w);
  return {
    x: (xo*(cosOm*cosW - sinOm*sinW*cosI) - yo*(cosOm*sinW + sinOm*cosW*cosI)) / AU_m,
    y: (xo*(sinOm*cosW + cosOm*sinW*cosI) - yo*(sinOm*sinW - cosOm*cosW*cosI)) / AU_m,
    z: (xo*sinW*sinI + yo*cosW*sinI) / AU_m
  };
}

export function toggleSatellites(deps: {
  fetchSatellites: () => void;
}): void {
  const { fetchSatellites } = deps;
  satellitesEnabled = !satellitesEnabled;
  const btn = document.getElementById('btn-sat-toggle');
  if (btn) btn.textContent = satellitesEnabled ? 'SAT: ON' : 'SAT: OFF';
  if (satellitesEnabled && satelliteData.length === 0) fetchSatellites();
  if (!satellitesEnabled && satelliteMesh) satelliteMesh.visible = false;
}

export async function fetchSatellites(deps: {
  setStatus: (msg: string, warn?: boolean) => void;
  buildSatelliteMesh: (data: any[]) => void;
}): Promise<void> {
  const { setStatus, buildSatelliteMesh } = deps;
  setStatus('Fetching satellite catalog...');
  const cacheKey = 'aster_satellites_v1';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 6 * 3600 * 1000) {
        buildSatelliteMesh(data); return;
      }
    } catch(_) {}
  }
  let allSats: any[] = [];
  for (const group of CELESTRAK_GROUPS) {
    try {
      const r = await fetch(group.url);
      if (!r.ok) continue;
      const gdata = await r.json();
      if (Array.isArray(gdata)) {
        allSats = allSats.concat(gdata);
      }
    } catch(err: any) { console.warn(`[CelesTrak] ${group.name}:`, err.message); }
  }
  const seen = new Set<string>();
  const unique = allSats.filter(s => {
    if (seen.has(s.NORAD_CAT_ID)) return false;
    seen.add(s.NORAD_CAT_ID); return true;
  });
  if (unique.length > 0) {
    try { localStorage.setItem(cacheKey, JSON.stringify({ data: unique, timestamp: Date.now() })); } catch(_) {}
    buildSatelliteMesh(unique);
  } else {
    setStatus('Satellite data unavailable (CORS)', true);
  }
}

export function buildSatelliteMesh(
  data: any[],
  deps: {
    scene: THREE.Scene;
    dummy: THREE.Object3D;
    disposeObject3D: (obj: THREE.Object3D | null) => void;
    findISS: () => void;
  }
): void {
  const { scene, dummy, disposeObject3D, findISS } = deps;

  satelliteData = data.filter(s => s.MEAN_MOTION && s.INCLINATION !== undefined);
  const count = Math.min(satelliteData.length, (window as any).SAT_LIMIT || 8000);
  if (satelliteMesh) { disposeObject3D(satelliteMesh); satelliteMesh = null; }
  const leoColor   = new THREE.Color(0x3b82f6);
  const meoColor   = new THREE.Color(0x10b981);
  const geoColor   = new THREE.Color(0xfbbf24);
  const otherColor = new THREE.Color(0x6b7280);
  satelliteMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.0003, 4, 4),
    new THREE.MeshBasicMaterial(),
    count
  );
  satelliteMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  for (let i = 0; i < count; i++) {
    const s = satelliteData[i];
    const n_rs = s.MEAN_MOTION * 2 * Math.PI / 86400;
    const a_m  = Math.pow(3.986e14 / (n_rs*n_rs), 1/3);
    const alt_km = (a_m - 6371000) / 1000;
    let col = alt_km < 2000 ? leoColor : alt_km < 35000 ? meoColor : alt_km < 36500 ? geoColor : otherColor;
    if (s.OBJECT_NAME && s.OBJECT_NAME.includes('ISS')) col = new THREE.Color(0xff4af7);
    satelliteMesh.setColorAt(i, col);
    dummy.position.set(0,0,0); dummy.scale.setScalar(0); (dummy as any).updateMatrix();
    satelliteMesh.setMatrixAt(i, (dummy as any).matrix);
  }
  satelliteMesh.instanceColor!.needsUpdate = true;
  satelliteMesh.visible = false;
  scene.add(satelliteMesh);
  const countEl = document.getElementById('sat-count');
  if (countEl) countEl.textContent = `${count} SATELLITES LOADED`;
  findISS();
}

export function updateSatellitePositions(deps: {
  satelliteMesh: THREE.InstancedMesh | null;
  satelliteData: any[];
  satellitesEnabled: boolean;
  currentJD: number;
  earthPos: THREE.Vector3;
  dummy: THREE.Object3D;
  propagateSatellite: (omm: any, jd: number) => { x: number; y: number; z: number };
}): void {
  const {
    satelliteMesh: mesh, satelliteData: satData, satellitesEnabled: enabled,
    currentJD, earthPos, dummy, propagateSatellite: propagate,
  } = deps;

  if (!enabled || !mesh || satData.length === 0) return;
  const satCount = Math.min(satData.length, 8000);
  for (let i = 0; i < satCount; i++) {
    try {
      const pos = propagate(satData[i], currentJD);
      dummy.position.set(earthPos.x+pos.x, earthPos.y+pos.y, earthPos.z+pos.z);
      dummy.scale.setScalar(1);
    } catch(_) {
      dummy.position.set(earthPos.x, earthPos.y, earthPos.z);
      dummy.scale.setScalar(0);
    }
    (dummy as any).updateMatrix();
    mesh.setMatrixAt(i, (dummy as any).matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}
