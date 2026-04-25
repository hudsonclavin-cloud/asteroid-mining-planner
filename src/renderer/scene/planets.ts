import * as THREE from 'three';

// TODO: import from src/renderer/scene/index (scene)

// ─── Planets ──────────────────────────────────────────────────────────────────
export const PLANET_CONFIGS = [
  { name: 'Mercury', color: 0xb5b5b5, displayR: 0.018, radiusKm: 2439.7 },
  { name: 'Venus',   color: 0xe8cda0, displayR: 0.022, radiusKm: 6051.8 },
  { name: 'Earth',   color: 0x1a6b9e, displayR: 0.022, radiusKm: 6371.0 },
  { name: 'Mars',    color: 0xc1440e, displayR: 0.020, radiusKm: 3389.5 },
  { name: 'Jupiter', color: 0xc88b3a, displayR: 0.040, radiusKm: 69911 },
  { name: 'Saturn',  color: 0xe4d191, displayR: 0.035, radiusKm: 58232 },
  { name: 'Uranus',  color: 0x7de8e8, displayR: 0.030, radiusKm: 25362 },
  { name: 'Neptune', color: 0x5b6fcd, displayR: 0.028, radiusKm: 24622 },
];

export const PLANET_VISUALS: Record<string, {
  color: number; specular: number; shininess: number;
  glow: number; glowOpacity: number; rotation: number;
}> = {
  Mercury: { color: 0x9a9a95, specular: 0x555555, shininess: 12, glow: 0xa0a4ab, glowOpacity: 0.05, rotation: 0.00045 },
  Venus:   { color: 0xe8cda0, specular: 0xf3dfb6, shininess: 18, glow: 0xf0d7a8, glowOpacity: 0.08, rotation: 0.00045 },
  Earth:   { color: 0x1a6b9e, specular: 0x4488bb, shininess: 40, glow: 0x4488ff, glowOpacity: 0.12, rotation: 0.00100 },
  Mars:    { color: 0xc1440e, specular: 0xe77a3c, shininess: 16, glow: 0xf08b55, glowOpacity: 0.08, rotation: 0.00055 },
  Jupiter: { color: 0xc88b3a, specular: 0xe7bc7d, shininess: 18, glow: 0xf0c98b, glowOpacity: 0.06, rotation: 0.00045 },
  Saturn:  { color: 0xe4d191, specular: 0xf7e8b6, shininess: 16, glow: 0xf5df9f, glowOpacity: 0.06, rotation: 0.00040 },
  Uranus:  { color: 0x7de8e8, specular: 0xaef5f5, shininess: 20, glow: 0x96f3ff, glowOpacity: 0.06, rotation: 0.00042 },
  Neptune: { color: 0x5b6fcd, specular: 0x90a4ff, shininess: 20, glow: 0x7da1ff, glowOpacity: 0.06, rotation: 0.00042 },
};

export function createPlanetAtmosphere(radius: number, color: number, opacity: number, scale = 1.01): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius * scale, 24, 24),
    new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
}

export function createProceduralLandOverlay(radius: number, detail = 18, opacity = 0.75): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, detail, detail);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const lat = Math.atan2(y, Math.sqrt(x*x + z*z));
    const lon = Math.atan2(z, x);
    const noise = Math.sin(lon * 3.2) * 0.55 + Math.cos(lat * 5.1) * 0.3 + Math.sin((lon + lat) * 7.5) * 0.2;
    const land = noise > 0.18;
    color.setHex(land ? 0x2d7a3a : 0x15351f);
    colors[i*3] = color.r;
    colors[i*3+1] = color.g;
    colors[i*3+2] = color.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return new THREE.Mesh(
    geo,
    new THREE.MeshPhongMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      shininess: 8,
      depthWrite: false,
    })
  );
}

// TODO: import scene from src/renderer/scene/index
export function createPlanets(scene: THREE.Scene): THREE.Mesh[] {
  return PLANET_CONFIGS.map((cfg, idx) => {
    const geo = new THREE.SphereGeometry(cfg.displayR, 12, 12);
    const visual = PLANET_VISUALS[cfg.name] || PLANET_VISUALS.Mercury;
    const mat = new THREE.MeshPhongMaterial({
      color: visual.color,
      specular: visual.specular,
      shininess: visual.shininess,
      flatShading: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = {
      name: cfg.name,
      planetIdx: idx,
      rotationSpeed: visual.rotation,
      baseRadius: cfg.displayR,
      trueRadiusKm: cfg.radiusKm,
    };
    const atmosphere = createPlanetAtmosphere(cfg.displayR, visual.glow, visual.glowOpacity, cfg.name === 'Earth' ? 1.015 : 1.01);
    mesh.add(atmosphere);
    if (cfg.name === 'Earth') {
      const land = createProceduralLandOverlay(cfg.displayR * 1.001, 20, 0.72);
      mesh.add(land);
      mesh.userData.landOverlay = land;
    }
    scene.add(mesh);
    if (cfg.name === 'Saturn') {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.018, 2, 64),
        new THREE.MeshPhongMaterial({ color: 0xd4c47a, transparent: true, opacity: 0.6, side: THREE.DoubleSide, shininess: 8 })
      );
      ring.name = 'saturn-ring';
      ring.userData.saturnRing = true;
      ring.rotation.x = Math.PI / 2.5;
      mesh.add(ring);
    }
    return mesh;
  });
}

// TODO: import scene from src/renderer/scene/index
// planets array is created at module scope in index.html; in the modular build
// call createPlanets(scene) and export the result.
export const planets = PLANET_CONFIGS.map((cfg, idx) => {
  // NOTE: this stub calls createPlanets-equivalent logic inline so the array
  // is available at module scope, matching the original structure.
  const geo = new THREE.SphereGeometry(cfg.displayR, 12, 12);
  const visual = PLANET_VISUALS[cfg.name] || PLANET_VISUALS.Mercury;
  const mat = new THREE.MeshPhongMaterial({
    color: visual.color,
    specular: visual.specular,
    shininess: visual.shininess,
    flatShading: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData = {
    name: cfg.name,
    planetIdx: idx,
    rotationSpeed: visual.rotation,
    baseRadius: cfg.displayR,
    trueRadiusKm: cfg.radiusKm,
  };
  const atmosphere = createPlanetAtmosphere(cfg.displayR, visual.glow, visual.glowOpacity, cfg.name === 'Earth' ? 1.015 : 1.01);
  mesh.add(atmosphere);
  if (cfg.name === 'Earth') {
    const land = createProceduralLandOverlay(cfg.displayR * 1.001, 20, 0.72);
    mesh.add(land);
    mesh.userData.landOverlay = land;
  }
  // TODO: scene.add(mesh) — call after scene is available
  if (cfg.name === 'Saturn') {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.07, 0.018, 2, 64),
      new THREE.MeshPhongMaterial({ color: 0xd4c47a, transparent: true, opacity: 0.6, side: THREE.DoubleSide, shininess: 8 })
    );
    ring.name = 'saturn-ring';
    ring.userData.saturnRing = true;
    ring.rotation.x = Math.PI / 2.5;
    mesh.add(ring);
  }
  return mesh;
});

export function updatePlanetSpin(dt: number): void {
  const scale = dt * 60;
  planets.forEach(planet => {
    planet.rotation.y += (planet.userData.rotationSpeed || 0.0005) * scale;
  });
}
