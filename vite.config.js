import { defineConfig } from 'vite';

// Single static page. Vite fingerprints CSS/JS into /assets so cache-busting
// (the old ?v=N trick) is handled automatically.
export default defineConfig({
  base: './',                          // relative asset paths — works at any subpath (GitHub Pages)
  server: { port: 5173, open: false },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
