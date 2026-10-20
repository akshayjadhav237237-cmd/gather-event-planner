/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const cspPlugin: Plugin = {
  name: 'html-csp-transform',
  apply: 'build',
  transformIndexHtml(html) {
    const cspMeta =
      '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; connect-src \'self\' https://generativelanguage.googleapis.com; base-uri \'self\'; form-action \'self\'" />';
    return html.replace('</head>', `    ${cspMeta}\n  </head>`);
  },
};

export default defineConfig({
  plugins: [react(), cspPlugin],
  test: {
    globals: true,
    environment: 'node',
  },
});
