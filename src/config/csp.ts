/**
 * Content Security Policy string applied at build time via the cspPlugin in vite.config.ts.
 *
 * Directive rationale:
 *   default-src 'none'       – deny all unlisted resource types by default
 *   script-src 'self'        – only scripts from the same origin
 *   style-src 'self'         – only external/embedded stylesheets from the same origin (no unsafe-inline)
 *   font-src 'self'          – only fonts from the same origin (bundled via Vite)
 *   img-src 'self' data:     – SVG favicon and any base64 images
 *   connect-src 'self' https://generativelanguage.googleapis.com – optional live Gemini API calls
 *   object-src 'none'        – no plugins
 *   frame-src 'none'         – no iframes
 *   worker-src 'none'        – no service workers or shared workers
 *   media-src 'none'         – no audio or video
 *   manifest-src 'self'      – allows a web app manifest if added later
 *   base-uri 'none'          – block <base> tag injection
 *   form-action 'none'       – no form submissions (app has no HTML forms)
 *
 * Note: frame-ancestors and HSTS cannot be set via meta tag and are not configurable from a
 * static GitHub Pages deployment. They require HTTP response headers.
 */
export const CSP =
  "default-src 'none'; " +
  "script-src 'self'; " +
  "style-src 'self'; " +
  "font-src 'self'; " +
  "img-src 'self' data:; " +
  "connect-src 'self' https://generativelanguage.googleapis.com; " +
  "object-src 'none'; " +
  "frame-src 'none'; " +
  "worker-src 'none'; " +
  "media-src 'none'; " +
  "manifest-src 'self'; " +
  "base-uri 'none'; " +
  "form-action 'none'";
