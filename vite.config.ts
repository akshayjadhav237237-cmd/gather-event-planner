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
    let cssPreload = '';
    for (const fileName of Object.keys(ctx.bundle).sort()) {
      if (fileName.endsWith('.css')) {
        cssPreload = `<link rel="preload" href="./${fileName}" as="style" />`;
      }
      if (fileName.endsWith('.woff2') && !fileName.includes('latin-ext')) {
        fontLinks.push(
          `<link rel="preload" href="./${fileName}" as="font" type="font/woff2" crossorigin="anonymous" />`
        );
      }
    }
    let transformed = html;
    if (cssPreload) {
      transformed = transformed.replace('<meta name="viewport"', `${cssPreload}\n    <meta name="viewport"`);
    }
    if (fontLinks.length > 0) {
      transformed = transformed.replace('</head>', `  ${fontLinks.join('\n    ')}\n  </head>`);
    }
    return transformed;
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
            id.includes('/src/config/constants') ||
            id.includes('/src/types/schemas') ||
            id.includes('/src/utils/dateMath') ||
            id.includes('/src/utils/currency') ||
            id.includes('/src/data/categories') ||
            id.includes('/src/data/perHeadFloors') ||
            id.includes('/src/data/demoScenarios') ||
            id.includes('/src/ui/labels') ||
            id.includes('/src/ai/apiKeyStorage') ||
            id.includes('/src/domain/quoteMath')
          ) {
            return 'planner-common';
          }
          if (
            id.includes('/src/data/ideas/') ||
            id.includes('/src/data/tasks/') ||
            id.includes('/src/data/vendors/') ||
            id.includes('/src/data/runOfShow') ||
            id.includes('/src/data/decisionRules') ||
            id.includes('/src/data/budgetPresets') ||
            id.includes('/src/data/budgetSwaps') ||
            id.includes('/src/domain/timelineEngine') ||
            id.includes('/src/domain/budgetEngine') ||
            id.includes('/src/domain/vendorEngine') ||
            id.includes('/src/domain/signals') ||
            id.includes('/src/domain/decisionMatrix') ||
            id.includes('/src/domain/buildPlan') ||
            id.includes('/src/domain/runOfShow') ||
            id.includes('/src/domain/whatIf') ||
            id.includes('/src/domain/communityTools') ||
            id.includes('/src/ai/aiService') ||
            id.includes('/src/ai/geminiClient') ||
            id.includes('/src/ai/localIdeaGenerator') ||
            id.includes('/src/ai/promptBuilder') ||
            id.includes('/src/ai/responseCache') ||
            id.includes('/src/ai/securityGuard')
          ) {
            return 'planner-core';
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
