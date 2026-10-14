# Recon A - legacy move

## Current root entry dependencies

- HTML/style: root index.html loads Google Fonts, ./src/styles/main.css, inline Three.js imports from unpkg, and the inline favicon.
- V2 link: the visible v2 simulator link is /asteroid-mining-planner/v2/solar-system/.
- Textures: 2k_sun.jpg, 2k_mercury.jpg, 2k_venus_surface.jpg, 2k_earth_daymap.jpg, 2k_mars.jpg, 2k_jupiter.jpg, 2k_saturn.jpg, 2k_uranus.jpg, 2k_neptune.jpg, 2k_saturn_ring_alpha.png, and 2k_moon.jpg are loaded through import.meta.env.BASE_URL from the Vite public textures/ directory at the docs root.
- Worker: new Worker(./physics.worker.js?v=10k) is the local worker dependency. The copy-physics-worker plugin currently copies root physics.worker.js to docs/physics.worker.js.
- Proxy/worker URLs: apiBase or workerUrl query parameters override https://aster-proxy.hudsonclavin.workers.dev; the root page calls /api/prices and /api/research and posts /api/asterank and /api/nhats through the worker.
- External fetches: CelesTrak URLs are the stations, active, and starlink gp.php JSON endpoints. JPL Horizons/NHATS/Asterank links are external anchors or proxy paths, not local build inputs.

## Exact move changes

The coherent dry-build variant moved both legacy runtime files under legacy/: index.html -> legacy/index.html and physics.worker.js -> legacy/physics.worker.js. It then changed:
1. legacy/index.html: ./src/styles/main.css -> ../src/styles/main.css; the worker stays ./physics.worker.js because it moved beside the entry.
2. vite.config.ts: the legacy Rollup input becomes legacy/index.html.
3. copy-physics-worker: source becomes legacy/physics.worker.js and output becomes docs/legacy/physics.worker.js.
4. The root Vite output becomes a new v2-owned index.html; the moved legacy entry builds as docs/legacy/index.html, where the banner and noindex must be added.
5. Tests that currently read root index.html or root physics.worker.js must be pointed at legacy/index.html and legacy/physics.worker.js, or retain an explicitly tested compatibility fixture.

Dry build result in TEMP\s19-5-p0\recon-a: npm ci --include=dev then npm run build exited 0; docs/legacy/index.html and docs/legacy/physics.worker.js both existed.

## Root/v2 reference check

rg over src/v2, tests, vite.config.ts, package.json, README.md, AGENTS.md, and STATUS.md found no v2 production import of the root entry or legacy input key. It did find tests/phase6-contract-smoke.test.mjs:18-19,77 reading root index.html and root worker; those are the explicit references that must move with the legacy entry.
