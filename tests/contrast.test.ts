import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { extractColorTokens, getContrastRatio } from './helpers/contrast';

const cssPath = resolve(__dirname, '../src/index.css');
const tokens = extractColorTokens(cssPath);

const REQUIRED_TOKENS = [
  'bg',
  'surface',
  'sunken',
  'ink',
  'ink-soft',
  'muted',
  'line',
  'line-control',
  'accent',
  'accent-ink',
  'accent-soft',
  'accent-deep',
  'focus',
  'critical',
  'critical-soft',
  'warning',
  'warning-soft',
  'info',
  'info-soft',
  'success',
  'success-soft',
] as const;

describe('Design Tokens & Contrast', () => {
  it('defines all required design tokens in src/index.css', () => {
    for (const token of REQUIRED_TOKENS) {
      expect(tokens[token], `Expected token ${token} to be defined`).toBeDefined();
    }
  });

  it('meets high-contrast requirements for primary ink on background (>= 7.0)', () => {
    expect(getContrastRatio(tokens.ink, tokens.bg)).toBeGreaterThanOrEqual(7);
    expect(getContrastRatio(tokens['ink-soft'], tokens.bg)).toBeGreaterThanOrEqual(7);
  });

  it('meets minimum text contrast for muted on various backgrounds (>= 4.5)', () => {
    expect(getContrastRatio(tokens.muted, tokens.bg)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.muted, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.muted, tokens.sunken)).toBeGreaterThanOrEqual(4.5);
  });

  it('meets minimum contrast for accent colors (>= 4.5)', () => {
    expect(getContrastRatio(tokens.accent, tokens.bg)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.accent, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens['accent-ink'], tokens.accent)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens['accent-deep'], tokens['accent-soft'])).toBeGreaterThanOrEqual(4.5);
  });

  it('meets minimum contrast for semantic tones on soft backgrounds (>= 4.5)', () => {
    expect(getContrastRatio(tokens.critical, tokens['critical-soft'])).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.warning, tokens['warning-soft'])).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.info, tokens['info-soft'])).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.success, tokens['success-soft'])).toBeGreaterThanOrEqual(4.5);
  });

  it('meets minimum contrast for semantic tones on surface (>= 4.5)', () => {
    expect(getContrastRatio(tokens.critical, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.warning, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.info, tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(tokens.success, tokens.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('meets minimum UI component contrast for borders and focus states (>= 3.0)', () => {
    expect(getContrastRatio(tokens['line-control'], tokens.surface)).toBeGreaterThanOrEqual(3);
    expect(getContrastRatio(tokens['line-control'], tokens.bg)).toBeGreaterThanOrEqual(3);
    expect(getContrastRatio(tokens.focus, tokens.bg)).toBeGreaterThanOrEqual(3);
    expect(getContrastRatio(tokens.focus, tokens.surface)).toBeGreaterThanOrEqual(3);
  });
});
