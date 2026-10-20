import { readFileSync } from 'node:fs';

export function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function parseHexColor(hex: string): { r: number; g: number; b: number } {
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  if (clean.length !== 6) {
    throw new Error(`Unsupported hex color format: ${hex}`);
  }

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  return { r, g, b };
}

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = parseHexColor(hex);
  const rLin = srgbToLinear(r);
  const gLin = srgbToLinear(g);
  const bLin = srgbToLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const max = Math.max(lum1, lum2);
  const min = Math.min(lum1, lum2);
  return (max + 0.05) / (min + 0.05);
}

export function extractColorTokens(cssFilePath: string): Record<string, string> {
  const content = readFileSync(cssFilePath, 'utf-8');
  const tokens: Record<string, string> = {};
  const regex = /--(color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;

  let match: RegExpExecArray | null = regex.exec(content);
  while (match !== null) {
    const rawKey = match[1]; // e.g. color-bg
    const hex = match[2];
    const shortKey = rawKey.replace(/^color-/, ''); // e.g. bg
    tokens[shortKey] = hex;
    tokens[rawKey] = hex;
    match = regex.exec(content);
  }

  return tokens;
}
