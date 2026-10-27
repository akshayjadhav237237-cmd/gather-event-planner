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

const fontPreloadPlugin: Plugin = {
  name: 'font-preload-transform',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml(html, ctx) {
    if (!ctx.bundle) return html;
    const fontLinks: string[] = [];
    for (const fileName of Object.keys(ctx.bundle).sort()) {
      if (fileName.endsWith('.woff2')) {
        fontLinks.push(
          `<link rel="preload" href="./${fileName}" as="font" type="font/woff2" crossorigin="anonymous" />`
        );
      }
    }
    if (fontLinks.length > 0) {
      return html.replace('</head>', `  ${fontLinks.join('\n    ')}\n  </head>`);
    }
    return html;
  },
};

export default defineConfig({
  base: './',
  plugins: [react(), cspPlugin, fontPreloadPlugin],
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
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (
            id.includes('/src/data/') ||
            id.includes('/src/domain/') ||
            id.includes('/src/export/')
          ) {
            return 'planner-core';
          }
          if (
            id.includes('/src/components/budget/') ||
            id.includes('/src/components/timeline/') ||
            id.includes('/src/components/vendors/') ||
            id.includes('/src/components/ideas/') ||
            id.includes('/src/components/print/') ||
            id.includes('/src/components/panels/') ||
            id.includes('/src/components/layout/Workspace')
          ) {
            return 'workspace-ui';
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
