import { describe, expect, it } from 'vitest';
import { createId } from '../src/utils/id';

describe('createId utility', () => {
  it('generates non-empty string identifiers', () => {
    const id = createId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates 1,000 unique identifiers with zero collisions', () => {
    const count = 1000;
    const ids = new Set<string>();
    for (let i = 0; i < count; i += 1) {
      ids.add(createId());
    }
    expect(ids.size).toBe(count);
  });

  it('executes fallback generation when crypto APIs are unavailable', () => {
    const originalCrypto = globalThis.crypto;
    try {
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        configurable: true,
      });

      const fallbackIds = new Set<string>();
      for (let i = 0; i < 50; i += 1) {
        const id = createId();
        expect(id).toMatch(/^id-[a-z0-9]+-[a-z0-9]+$/);
        fallbackIds.add(id);
      }
      expect(fallbackIds.size).toBe(50);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        configurable: true,
      });
    }
  });

  it('falls back to getRandomValues when randomUUID is absent', () => {
    const originalCrypto = globalThis.crypto;
    try {
      const mockCrypto = {
        getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
          if (array && 'byteLength' in array) {
            const u8 = array as unknown as Uint8Array;
            for (let i = 0; i < u8.length; i += 1) {
              u8[i] = (i * 17 + 1) % 256;
            }
          }
          return array;
        },
      } as unknown as Crypto;

      Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        configurable: true,
      });

      const id = createId();
      expect(typeof id).toBe('string');
      expect(id).toHaveLength(32);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        configurable: true,
      });
    }
  });
});
