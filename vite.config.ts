/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { CSP } from './src/config/csp';

const cspPlugin: Plugin = {
  name: 'html-csp-transform',
  apply: 'build',
  transformIndexHtml(html) {
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`;
    if (html.includes('http-equiv="Content-Security-Policy"')) {
      return html.replace(/<meta[\s\S]*?http-equiv=["']Content-Security-Policy["'][^>]*>/, cspMeta);
    }
    return html.replace('<head>', `<head>\n    ${cspMeta}`);
  },
};

export default defineConfig({
  base: './',
  plugins: [react(), cspPlugin],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          if (id.includes('node_modules/zod')) {
            return 'vendor-zod';
          }
          if (id.includes('/src/data/')) {
            return 'data-catalogs';
          }
          if (id.includes('/src/domain/')) {
            return 'domain-engines';
          }
          if (id.includes('/src/export/')) {
            return 'export-formatters';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
  },
});
