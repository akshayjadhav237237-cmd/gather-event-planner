import { RESPONSE_CACHE_MAX_ENTRIES } from '../config/constants';
import type { PersonalizedIdeas } from '../types/event';

export interface ResponseCache {
  get(key: string): PersonalizedIdeas | null;
  set(key: string, value: PersonalizedIdeas): void;
  clear(): void;
  size(): number;
}

/** Creates an in-memory LRU response cache storing up to 20 validated idea bundles. */
export function createResponseCache(
  maxEntries: number = RESPONSE_CACHE_MAX_ENTRIES
): ResponseCache {
  const capacity = Math.max(1, maxEntries);
  const cache = new Map<string, PersonalizedIdeas>();

  return {
    get(key: string): PersonalizedIdeas | null {
      const entry = cache.get(key);
      if (entry === undefined) {
        return null;
      }
      cache.delete(key);
      cache.set(key, entry);
      return entry;
    },

    set(key: string, value: PersonalizedIdeas): void {
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= capacity) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }
      cache.set(key, value);
    },

    clear(): void {
      cache.clear();
    },

    size(): number {
      return cache.size;
    },
  };
}
