import { describe, expect, it } from 'vitest';
import { createResponseCache } from '../src/ai/responseCache';
import type { PersonalizedIdeas } from '../src/types/event';

function createMockIdeas(title: string): PersonalizedIdeas {
  return {
    themes: [
      {
        id: `theme-${title}`,
        title: `Theme ${title}`,
        summary: 'Summary text',
        colorPalette: ['#111111', '#222222', '#333333'],
        whyItFits: 'Fits the occasion',
      },
    ],
    activities: [
      {
        id: `act-${title}`,
        title: `Activity ${title}`,
        description: 'Activity description',
        durationMinutes: 45,
        targetGroup: 'all',
        estimatedCost: 'low',
        notes: 'Activity note',
      },
    ],
    courtesies: [
      {
        id: `court-${title}`,
        title: `Courtesy ${title}`,
        description: 'Courtesy description',
        category: 'comfort',
        isCritical: false,
      },
    ],
  };
}

describe('createResponseCache', () => {
  it('stores and retrieves cached items', () => {
    const cache = createResponseCache(5);
    const ideasA = createMockIdeas('A');

    cache.set('key-a', ideasA);
    expect(cache.size()).toBe(1);
    expect(cache.get('key-a')).toBe(ideasA);
  });

  it('returns null on cache miss', () => {
    const cache = createResponseCache(5);
    expect(cache.get('non-existent')).toBeNull();
  });

  it('overwrites existing keys and updates LRU order', () => {
    const cache = createResponseCache(3);
    const ideasA1 = createMockIdeas('A1');
    const ideasA2 = createMockIdeas('A2');

    cache.set('key-a', ideasA1);
    cache.set('key-a', ideasA2);
    expect(cache.size()).toBe(1);
    expect(cache.get('key-a')).toBe(ideasA2);
  });

  it('evicts least recently used item when capacity is exceeded', () => {
    const cache = createResponseCache(3);
    const a = createMockIdeas('A');
    const b = createMockIdeas('B');
    const c = createMockIdeas('C');
    const d = createMockIdeas('D');

    cache.set('k-a', a);
    cache.set('k-b', b);
    cache.set('k-c', c);

    // Access k-a so k-b becomes the least recently used
    expect(cache.get('k-a')).toBe(a);

    // Insert d, which should evict k-b
    cache.set('k-d', d);
    expect(cache.size()).toBe(3);
    expect(cache.get('k-b')).toBeNull();
    expect(cache.get('k-a')).toBe(a);
    expect(cache.get('k-c')).toBe(c);
    expect(cache.get('k-d')).toBe(d);
  });

  it('clears all cached entries on clear', () => {
    const cache = createResponseCache(5);
    cache.set('k-1', createMockIdeas('1'));
    cache.set('k-2', createMockIdeas('2'));
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('k-1')).toBeNull();
  });

  it('enforces a minimum capacity of 1 when maxEntries is zero or negative', () => {
    const cache = createResponseCache(0);
    const a = createMockIdeas('A');
    const b = createMockIdeas('B');

    cache.set('k-a', a);
    expect(cache.size()).toBe(1);
    expect(cache.get('k-a')).toBe(a);

    cache.set('k-b', b);
    expect(cache.size()).toBe(1);
    expect(cache.get('k-a')).toBeNull();
    expect(cache.get('k-b')).toBe(b);
  });
});
