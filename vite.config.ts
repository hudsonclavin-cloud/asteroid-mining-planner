import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, createReadStream, mkdirSync, writeFileSync } from 'fs';

export default defineConfig({
  root: '.',
  base: '/asteroid-mining-planner/',
  publicDir: 'textures',   // serves textures/ as static assets
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        legacy: resolve(__dirname, 'index.html'),
        earthMoonV2: resolve(__dirname, 'v2/earth-moon/index.html'),
        innerSolarSystemV2: resolve(__dirname, 'v2/inner-solar-system/index.html'),
        aboutV2: resolve(__dirname, 'v2/about/index.html'),
        porkchopV2: resolve(__dirname, 'v2/porkchop/index.html'),
        solarSystemV2: resolve(__dirname, 'v2/solar-system/index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Allow JS files during incremental TS migration (Stage 4+)
  esbuild: {
    target: 'es2020',
  },
  plugins: [
    {
      name: 'copy-physics-worker',
      writeBundle() {
        mkdirSync(resolve(__dirname, 'docs'), { recursive: true });
        copyFileSync(
          resolve(__dirname, 'physics.worker.js'),
          resolve(__dirname, 'docs/physics.worker.js')
        );
      },
    },
    {
      name: 'copy-lambert-screen-cache',
      writeBundle() {
        mkdirSync(resolve(__dirname, 'docs'), { recursive: true });
        copyFileSync(
          resolve(__dirname, 'tests/fixtures/v2/lambert-screen-cache.json'),
          resolve(__dirname, 'docs/lambert-screen-cache.json')
        );
      },
      configureServer(server) {
        server.middlewares.use('/asteroid-mining-planner/lambert-screen-cache.json', (_req, res) => {
          createReadStream(resolve(__dirname, 'tests/fixtures/v2/lambert-screen-cache.json'))
            .on('error', () => {
              res.statusCode = 404;
              res.end('cache not found');
            })
            .on('open', () => {
              res.setHeader('Content-Type', 'application/json');
            })
            .pipe(res);
        });
      },
    },
    {
      name: 'copy-nojekyll',
      writeBundle() {
        mkdirSync(resolve(__dirname, 'docs'), { recursive: true });
        // Create an empty .nojekyll file in docs/ so GitHub Pages does not
        // apply Jekyll processing to the published static asset tree.
        writeFileSync(resolve(__dirname, 'docs/.nojekyll'), '');
      },
    },
  ],
});
