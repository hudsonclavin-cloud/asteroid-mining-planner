import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

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
  ],
});
