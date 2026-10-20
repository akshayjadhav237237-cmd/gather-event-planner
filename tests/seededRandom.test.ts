import { describe, expect, it } from 'vitest';
import { createSeededRandom, hashString } from '../src/ai/seededRandom';

describe('seededRandom', () => {
  describe('hashString (FNV-1a 32-bit)', () => {
    it('returns standard offset basis for empty string', () => {
      expect(hashString('')).toBe(2166136261);
    });

    it('returns consistent hash for identical strings', () => {
      const text = 'birthday-party-summer-outdoor';
      const hash1 = hashString(text);
      const hash2 = hashString(text);
      expect(hash1).toBe(hash2);
    });

    it('returns unsigned 32-bit integers within [0, 2^32 - 1]', () => {
      const samples = ['wedding', 'kids_1_3', 'tight', '2026-10-20', 'variant-12'];
      for (const sample of samples) {
        const h = hashString(sample);
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThanOrEqual(4294967295);
        expect(Number.isInteger(h)).toBe(true);
      }
    });

    it('produces distinct hashes for distinct strings', () => {
      const h1 = hashString('wedding');
      const h2 = hashString('birthday');
      const h3 = hashString('community');
      expect(h1).not.toBe(h2);
      expect(h2).not.toBe(h3);
      expect(h1).not.toBe(h3);
    });

    it('is sensitive to single character permutations and casing', () => {
      const hLower = hashString('indian_multiday');
      const hUpper = hashString('Indian_multiday');
      const hSwapped = hashString('indian_multidya');
      expect(hLower).not.toBe(hUpper);
      expect(hLower).not.toBe(hSwapped);
    });

    it('exhibits reasonable avalanche distribution across bit positions', () => {
      const base = 'seed-prefix-';
      const hashes = Array.from({ length: 64 }, (_, i) => hashString(`${base}${i}`));
      const unique = new Set(hashes);
      expect(unique.size).toBe(64);
    });
  });

  describe('createSeededRandom (mulberry32)', () => {
    it('generates identical sequence given identical seed', () => {
      const rng1 = createSeededRandom(123456789);
      const rng2 = createSeededRandom(123456789);

      const seq1 = Array.from({ length: 10 }, () => rng1());
      const seq2 = Array.from({ length: 10 }, () => rng2());

      expect(seq1).toEqual(seq2);
    });

    it('generates different sequence for different seed', () => {
      const rngA = createSeededRandom(1111);
      const rngB = createSeededRandom(2222);

      const valA = rngA();
      const valB = rngB();

      expect(valA).not.toBe(valB);
    });

    it('strictly outputs values in [0, 1) across a large sample', () => {
      const rng = createSeededRandom(987654321);
      const samples = Array.from({ length: 1000 }, () => rng());

      for (const val of samples) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('handles seed 0 and edge integer seeds properly', () => {
      const rngZero = createSeededRandom(0);
      const first = rngZero();
      expect(first).toBeGreaterThanOrEqual(0);
      expect(first).toBeLessThan(1);

      const rngMax = createSeededRandom(4294967295);
      const maxFirst = rngMax();
      expect(maxFirst).toBeGreaterThanOrEqual(0);
      expect(maxFirst).toBeLessThan(1);
    });

    it('has roughly uniform distribution across unit intervals', () => {
      const rng = createSeededRandom(42);
      const buckets = [0, 0, 0, 0];
      const count = 4000;

      for (let i = 0; i < count; i += 1) {
        const val = rng();
        const bucketIndex = Math.min(3, Math.floor(val * 4));
        buckets[bucketIndex] += 1;
      }

      // Each quarter interval should receive roughly 25% (between 15% and 35%)
      for (const bucketCount of buckets) {
        expect(bucketCount).toBeGreaterThan(count * 0.15);
        expect(bucketCount).toBeLessThan(count * 0.35);
      }
    });
  });
});
