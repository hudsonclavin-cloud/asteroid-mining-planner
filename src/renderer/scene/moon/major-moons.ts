/**
 * Major moon meshes, orbit geometry, and per-frame position update.
 * Extracted verbatim from index.html lines 1935–2005.
 *
 * Cross-module deps stubbed with @ts-ignore:
 *   - THREE          (global via script tag)
 *   - scene          (runtime global — THREE.Scene)
 *   - planets        (runtime global — THREE.Mesh[])
 *   - TWO_PI         (runtime global constant)
 *   - J2000          (runtime global constant)
 *   - makeGlowLine   (runtime global from orbits module)
 *   - moonOrbitVisualsEnabled (runtime global state flag)
 */

// @ts-ignore — runtime global during transition
declare const THREE: typeof import('three');
// @ts-ignore — runtime global during transition
declare const scene: import('three').Scene;
// @ts-ignore — runtime global during transition
declare const planets: import('three').Mesh[];
// @ts-ignore — runtime global during transition
declare const TWO_PI: number;
// @ts-ignore — runtime global during transition
declare const J2000: number;
// @ts-ignore — runtime global during transition
declare function makeGlowLine(
  geometry: import('three').BufferGeometry,
  color: number,
  opacity: number,
  options: { haloOpacity: number }
): import('three').Group;
// @ts-ignore — runtime global during transition
declare let moonOrbitVisualsEnabled: boolean;

// ─── Major Moons ──────────────────────────────────────────────────────────────
export const _AU_KM = 149597870.7;

export interface MoonDef {
  name: string;
  parent: number;
  displayR: number;
  radiusKm: number;
  a_km: number;
  T_d: number;
  color: number;
  retro?: boolean;
}

export const MOONS: MoonDef[] = [
  { name:'Io',        parent:4, displayR:0.0009, radiusKm:1821.6, a_km:421700,   T_d:1.769138,  color:0xd4a017 },
  { name:'Europa',    parent:4, displayR:0.0008, radiusKm:1560.8, a_km:671100,   T_d:3.551181,  color:0xd0ccc0 },
  { name:'Ganymede',  parent:4, displayR:0.0012, radiusKm:2634.1, a_km:1070400,  T_d:7.154553,  color:0x8c7b6b },
  { name:'Callisto',  parent:4, displayR:0.0011, radiusKm:2410.3, a_km:1882700,  T_d:16.68902,  color:0x5a5550 },
  { name:'Titan',     parent:5, displayR:0.0012, radiusKm:2574.7, a_km:1221870,  T_d:15.94542,  color:0xc87941 },
  { name:'Rhea',      parent:5, displayR:0.0006, radiusKm:763.8,  a_km:527040,   T_d:4.517500,  color:0xb8b0a8 },
  { name:'Dione',     parent:5, displayR:0.0005, radiusKm:561.4,  a_km:377400,   T_d:2.736915,  color:0xc8c0b8 },
  { name:'Tethys',    parent:5, displayR:0.0005, radiusKm:531.1,  a_km:294660,   T_d:1.887802,  color:0xd0ccc0 },
  { name:'Enceladus', parent:5, displayR:0.0004, radiusKm:252.1,  a_km:238020,   T_d:1.370218,  color:0xf0f0f0 },
  { name:'Mimas',     parent:5, displayR:0.0003, radiusKm:198.2,  a_km:185520,   T_d:0.942422,  color:0xb0a898 },
  { name:'Triton',    parent:7, displayR:0.0007, radiusKm:1353.4, a_km:354759,   T_d:5.876854,  color:0xd0b8b0, retro:true },
];

// @ts-ignore — runtime global during transition
export const majorMoonMeshes: import('three').Mesh[] = [];
// @ts-ignore — runtime global during transition
export const majorMoonOrbitLines: import('three').Group[] = [];

(function() {
  MOONS.forEach(m => {
    // @ts-ignore — runtime global during transition
    const mesh = new THREE.Mesh(
      // @ts-ignore — runtime global during transition
      new THREE.SphereGeometry(m.displayR, 8, 8),
      // @ts-ignore — runtime global during transition
      new THREE.MeshPhongMaterial({ color: m.color, shininess: 8 })
    );
    mesh.userData.moonData = m;
    mesh.userData.baseRadius = m.displayR;
    mesh.userData.trueRadiusKm = m.radiusKm;
    // @ts-ignore — runtime global during transition
    scene.add(mesh);
    majorMoonMeshes.push(mesh);

    const a = m.a_km / _AU_KM;
    // @ts-ignore — runtime global during transition
    const pts: import('three').Vector3[] = [];
    for (let j = 0; j <= 64; j++) {
      // @ts-ignore — runtime global during transition
      const ang = (j / 64) * TWO_PI;
      // @ts-ignore — runtime global during transition
      pts.push(new THREE.Vector3(Math.cos(ang) * a, 0, Math.sin(ang) * a));
    }
    // @ts-ignore — runtime global during transition
    const line = makeGlowLine(new THREE.BufferGeometry().setFromPoints(pts), 0x2a3a4a, 0.3, { haloOpacity: 0 });
    // @ts-ignore — runtime global during transition
    scene.add(line);
    // @ts-ignore — runtime global during transition
    line.visible = moonOrbitVisualsEnabled;
    majorMoonOrbitLines.push(line);
  });
})();

export function updateMajorMoons(jd: number): void {
  MOONS.forEach((m, i) => {
    const dir = m.retro ? -1 : 1;
    // @ts-ignore — runtime global during transition
    const nu = (TWO_PI / m.T_d) * (jd - J2000) * dir;
    const a = m.a_km / _AU_KM;
    // @ts-ignore — runtime global during transition
    const pPos = planets[m.parent].position;
    majorMoonMeshes[i].position.set(pPos.x + a * Math.cos(nu), pPos.y, pPos.z + a * Math.sin(nu));
    majorMoonOrbitLines[i].position.copy(pPos);
  });
}
