import { describe, it, expect } from 'vitest';
import { CSP } from '../src/config/csp';

describe('Content Security Policy', () => {
  it("contains object-src 'none'", () => {
    expect(CSP).toContain("object-src 'none'");
  });

  it("contains frame-src 'none'", () => {
    expect(CSP).toContain("frame-src 'none'");
  });

  it("contains base-uri 'none'", () => {
    expect(CSP).toContain("base-uri 'none'");
  });

  it("contains worker-src 'none'", () => {
    expect(CSP).toContain("worker-src 'none'");
  });

  it("contains form-action 'none'", () => {
    expect(CSP).toContain("form-action 'none'");
  });

  it("does not contain 'unsafe-eval'", () => {
    expect(CSP).not.toContain("'unsafe-eval'");
  });

  it('does not contain wildcard source (*)', () => {
    // No bare wildcard as a source value (e.g. "default-src *" or "script-src *")
    expect(CSP).not.toMatch(/(?:^|;|\s)\*(?:$|;|\s)/);
  });

  it('connect-src allows only self and generativelanguage.googleapis.com', () => {
    const match = /connect-src\s+([^;]+)/.exec(CSP);
    expect(match).not.toBeNull();
    const sources = (match?.[1] ?? '').trim().split(/\s+/);
    expect(sources).toContain("'self'");
    expect(sources).toContain('https://generativelanguage.googleapis.com');
    // No other origins
    const others = sources.filter(
      (s) => s !== "'self'" && s !== 'https://generativelanguage.googleapis.com',
    );
    expect(others).toHaveLength(0);
  });

  it('default-src is none', () => {
    expect(CSP).toContain("default-src 'none'");
  });

  it('script-src does not include unsafe-eval or unsafe-inline', () => {
    const match = /script-src\s+([^;]+)/.exec(CSP);
    const scriptSrc = match?.[1] ?? '';
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it("style-src has no 'unsafe-inline'", () => {
    const match = /style-src\s+([^;]+)/.exec(CSP);
    expect(match).not.toBeNull();
    const styleSrc = match?.[1] ?? '';
    expect(styleSrc).not.toContain("'unsafe-inline'");
    expect(styleSrc.trim()).toBe("'self'");
  });

  it("style-src-attr is exactly 'unsafe-inline'", () => {
    const match = /style-src-attr\s+([^;]+)/.exec(CSP);
    expect(match).not.toBeNull();
    const styleSrcAttr = (match?.[1] ?? '').trim();
    expect(styleSrcAttr).toBe("'unsafe-inline'");
  });
});
