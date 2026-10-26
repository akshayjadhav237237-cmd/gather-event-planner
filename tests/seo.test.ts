import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const INDEX = resolve(ROOT, 'index.html');
const PUBLIC = resolve(ROOT, 'public');

const LIVE_URL = 'https://akshayjadhav237237-cmd.github.io/gather-event-planner/';
const OG_IMAGE_URL = `${LIVE_URL}og-image.png`;

function readIndex(): string {
  return readFileSync(INDEX, 'utf-8');
}

describe('SEO metadata in index.html', () => {
  it('title is under 60 characters and includes Gather and Event Planner', () => {
    const html = readIndex();
    const m = /<title>([^<]+)<\/title>/.exec(html);
    expect(m).not.toBeNull();
    const title = (m?.[1] ?? '').replace(/&amp;/g, '&');
    expect(title.length).toBeLessThan(60);
    expect(title).toMatch(/Gather/i);
    expect(title).toMatch(/Event Planner/i);
  });

  it('meta description is 120 to 165 characters', () => {
    const html = readIndex();
    const m = /<meta\s+name="description"\s+content="([^"]+)"/.exec(html);
    expect(m).not.toBeNull();
    const desc = m?.[1] ?? '';
    expect(desc.length).toBeGreaterThanOrEqual(120);
    expect(desc.length).toBeLessThanOrEqual(165);
  });

  it('canonical link equals live URL', () => {
    const html = readIndex();
    expect(html).toContain('rel="canonical"');
    expect(html).toContain(`href="${LIVE_URL}"`);
  });

  it('og:image is absolute and references og-image.png', () => {
    const html = readIndex();
    expect(html).toContain(`content="${OG_IMAGE_URL}"`);
  });

  it('og-image.png exists in public/', () => {
    expect(existsSync(resolve(PUBLIC, 'og-image.png'))).toBe(true);
  });

  it('og-image.png is a PNG of 1200x630 (read header bytes)', () => {
    const p = resolve(PUBLIC, 'og-image.png');
    expect(existsSync(p)).toBe(true);
    const buf = readFileSync(p);
    // PNG signature: 137, 80, 78, 71, 13, 10, 26, 10
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50); // P
    expect(buf[2]).toBe(0x4e); // N
    expect(buf[3]).toBe(0x47); // G
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(1200);
    expect(height).toBe(630);
  });

  it('JSON-LD parses and has @type WebApplication', () => {
    const html = readIndex();
    const m = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
    expect(m).not.toBeNull();
    const obj = JSON.parse(m?.[1] ?? '{}') as Record<string, unknown>;
    expect(obj['@type']).toBe('WebApplication');
    expect(obj['name']).toBe('Gather');
  });

  it('robots.txt contains the Sitemap line with live URL', () => {
    const p = resolve(PUBLIC, 'robots.txt');
    expect(existsSync(p)).toBe(true);
    const content = readFileSync(p, 'utf-8');
    expect(content).toContain('Sitemap:');
    expect(content).toContain(LIVE_URL);
  });

  it('sitemap.xml is well-formed and contains live URL', () => {
    const p = resolve(PUBLIC, 'sitemap.xml');
    expect(existsSync(p)).toBe(true);
    const content = readFileSync(p, 'utf-8');
    expect(content).toContain('<?xml');
    expect(content).toContain('<urlset');
    expect(content).toContain(LIVE_URL);
  });

  it('CSP meta is the first child of head in index.html', () => {
    const html = readIndex();
    const headMatch = /<head>([\s\S]*?)<\/head>/.exec(html);
    expect(headMatch).not.toBeNull();
    const headInner = (headMatch?.[1] ?? '').trim();
    expect(headInner).toMatch(/^<meta[\s\S]*?http-equiv=["']Content-Security-Policy["']/i);
  });
});

describe('Agentic Discoverability & Machine-Readable Assets', () => {
  it('llms.txt exists, contains an H1 title, and includes markdown links', () => {
    const p = resolve(PUBLIC, 'llms.txt');
    expect(existsSync(p)).toBe(true);
    const text = readFileSync(p, 'utf-8');
    expect(text).toMatch(/^#\s+[^\n]+/m);
    expect(text).toMatch(/\[.+?\]\(https?:\/\/.+?\)/);
    expect(text).toContain('Gather: Celebration & Event Planner');
  });

  it('ai-catalog.json exists and is valid ARD spec format', () => {
    const p = resolve(PUBLIC, 'ai-catalog.json');
    expect(existsSync(p)).toBe(true);
    const data = JSON.parse(readFileSync(p, 'utf-8')) as {
      specVersion?: string;
      host?: { identifier?: string };
      entries?: Array<{ identifier: string; url: string }>;
    };
    expect(data.specVersion).toBe('1.0');
    expect(data.host?.identifier).toBe(LIVE_URL);
    expect(Array.isArray(data.entries)).toBe(true);
    expect((data.entries?.length ?? 0)).toBeGreaterThan(0);
  });

  it('.well-known/ai-catalog.json exists and matches ai-catalog.json', () => {
    const wellKnown = resolve(PUBLIC, '.well-known', 'ai-catalog.json');
    const rootCatalog = resolve(PUBLIC, 'ai-catalog.json');
    expect(existsSync(wellKnown)).toBe(true);
    expect(readFileSync(wellKnown, 'utf-8')).toBe(readFileSync(rootCatalog, 'utf-8'));
  });
});
