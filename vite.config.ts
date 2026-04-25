import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/asteroid-mining-planner/',
  publicDir: 'textures',   // serves textures/ as static assets
  build: {
    outDir: 'docs',
    emptyOutDir: true,
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
});
