import { defineConfig } from 'vite';

// Single static page. Vite fingerprints CSS/JS into /assets so cache-busting
// (the old ?v=N trick) is handled automatically.
export default defineConfig({
  server: { port: 5173, open: false },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
