import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const LEGACY_ORIGIN = process.env.LEGACY_ORIGIN ?? 'http://localhost:4200';

const legacyTarget = { target: LEGACY_ORIGIN, changeOrigin: false };

/**
 * The Angular application is proxied through the React dev server so the legacy shell
 * runs same-origin: it then shares `localStorage` — and so the mocked `rr_portal_auth`
 * session — with React while routes are handed over one at a time.
 *
 * `/legacy/<route>` serves the Angular route; the remaining entries cover the assets the
 * Angular dev server emits at the origin root (including lazy route chunks).
 */
const proxy = {
  '^/legacy(/.*)?$': { ...legacyTarget, rewrite: (url: string) => url.replace(/^\/legacy/, '') || '/' },
  '/runtime.js': legacyTarget,
  '/polyfills.js': legacyTarget,
  '/vendor.js': legacyTarget,
  '/main.js': legacyTarget,
  '/styles.css': legacyTarget,
  '/favicon.ico': legacyTarget,
  '^/.*_module_ts\\.js$': legacyTarget,
  '/ng-cli-ws': { ...legacyTarget, ws: true }
};

export default defineConfig({
  plugins: [react()],
  server: { port: 4300, strictPort: true, proxy },
  preview: { port: 4300, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true
  }
});
