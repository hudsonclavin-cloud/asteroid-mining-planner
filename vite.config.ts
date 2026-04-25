import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Entry is index.html at repo root (Vite default).
  // During the staged refactor, index.html still loads its own inline script;
  // once Stage 9 wires up src/main.ts, this entry remains valid.
  root: '.',
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
