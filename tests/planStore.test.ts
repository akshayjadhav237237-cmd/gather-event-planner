import { describe, expect, it } from 'vitest';
import type { StateStorage } from 'zustand/middleware';
import { STORAGE_KEY } from '../src/config/constants';
import { createPlanStore } from '../src/store/planStore';
import type { EventContext, VendorQuote } from '../src/types/event';

const createMemoryStorage = (initialEntries: Record<string, string> = {}): StateStorage => {
  const data = new Map<string, string>(Object.entries(initialEntries));
  return {
    getItem: (key: string): string | null => data.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      data.set(key, value);
    },
    removeItem: (key: string): void => {
      data.delete(key);
    },
  };
};

const sampleContext: EventContext = {
  id: 'evt-101',
  title: 'Annual Gala Night',
  eventType: 'community',
  subFormat: 'fundraiser',
  eventDate: '2026-11-25',
  currency: 'USD',
  totalBudget: 50000,
  guestCount: 200,
  setting: 'indoor',
  season: 'winter',
  priorities: ['catering', 'venue'],
  flags: ['wheelchair_access'],
  userNotes: 'Formal evening fundraiser event',
};

const sampleQuote: VendorQuote = {
  id: 'vq-1',
  categoryId: 'catering',
  vendorName: 'Grand Banquet Services',
  baseQuote: 12000,
  serviceAndTaxPct: 18,
  depositPaid: 2500,
  contractSigned: true,
  insuranceVerified: true,
  backupPlan: 'Secondary caterer on retainer',
};

describe('planStore action behavior', () => {
  it('manages context, tasks, and actual spend', () => {
    const store = createPlanStore(createMemoryStorage());
    expect(store.getState().context).toBeNull();

    store.getState().setContext(sampleContext);
    expect(store.getState().context?.title).toBe('Annual Gala Night');

    store.getState().toggleTask('task-1');
    expect(store.getState().taskCompletion['task-1']).toBe(true);
    store.getState().toggleTask('task-1');
    expect(store.getState().taskCompletion['task-1']).toBe(false);

    store.getState().setActualSpend('venue', 15000);
    expect(store.getState().actualSpend['venue']).toBe(15000);
  });

  it('handles upsertQuote and removeQuote correctly', () => {
    const store = createPlanStore(createMemoryStorage());

    store.getState().upsertQuote(sampleQuote);
    expect(store.getState().vendorQuotes).toHaveLength(1);
    expect(store.getState().vendorQuotes[0]?.vendorName).toBe('Grand Banquet Services');

    const updatedQuote: VendorQuote = {
      ...sampleQuote,
      baseQuote: 14000,
    };
    store.getState().upsertQuote(updatedQuote);
    expect(store.getState().vendorQuotes).toHaveLength(1);
    expect(store.getState().vendorQuotes[0]?.baseQuote).toBe(14000);

    store.getState().removeQuote(sampleQuote.id);
    expect(store.getState().vendorQuotes).toHaveLength(0);
  });

  it('resets state on loadScenario and clearAll', () => {
    const store = createPlanStore(createMemoryStorage());

    store.getState().setContext(sampleContext);
    store.getState().toggleTask('task-a');
    store.getState().upsertQuote(sampleQuote);

    const nextContext: EventContext = {
      ...sampleContext,
      id: 'evt-202',
      title: 'Spring Festival',
    };
    store.getState().loadScenario(nextContext);
    expect(store.getState().context?.id).toBe('evt-202');
    expect(store.getState().taskCompletion).toEqual({});
    expect(store.getState().vendorQuotes).toHaveLength(0);

    store.getState().clearAll();
    expect(store.getState().context).toBeNull();
    expect(store.getState().actualSpend).toEqual({});
  });
});

describe('planStore storage rehydration and safety', () => {
  it('discards invalid and corrupted context data on rehydration', () => {
    const corruptedPayload = JSON.stringify({
      state: {
        context: {
          id: 'bad-id',
          totalBudget: -500, // Invalid: budget must be positive
          guestCount: 0, // Invalid: guest count must be >= 1
        },
        taskCompletion: { 't-1': true },
      },
      version: 1,
    });

    const storage = createMemoryStorage({ [STORAGE_KEY]: corruptedPayload });
    const store = createPlanStore(storage);

    // Corrupted context must be discarded to null, while valid task completion is retained
    expect(store.getState().context).toBeNull();
    expect(store.getState().taskCompletion['t-1']).toBe(true);
  });

  it('discards invalid vendor quotes while keeping store stable', () => {
    const corruptedPayload = JSON.stringify({
      state: {
        vendorQuotes: [
          { ...sampleQuote, id: 'valid-q' },
          { id: 'broken-q', baseQuote: -100 }, // Invalid: negative quote
        ],
      },
      version: 1,
    });

    const storage = createMemoryStorage({ [STORAGE_KEY]: corruptedPayload });
    const store = createPlanStore(storage);

    // Only the valid quote is kept, broken quote is discarded
    expect(store.getState().vendorQuotes).toHaveLength(1);
    expect(store.getState().vendorQuotes[0]?.id).toBe('valid-q');
  });

  it('rehydrates valid persisted state accurately', () => {
    const validPayload = JSON.stringify({
      state: {
        context: sampleContext,
        vendorQuotes: [sampleQuote],
        taskCompletion: { 'task-ok': true },
        actualSpend: { catering: 12000 },
      },
      version: 1,
    });

    const storage = createMemoryStorage({ [STORAGE_KEY]: validPayload });
    const store = createPlanStore(storage);

    expect(store.getState().context?.title).toBe('Annual Gala Night');
    expect(store.getState().vendorQuotes).toHaveLength(1);
    expect(store.getState().taskCompletion['task-ok']).toBe(true);
    expect(store.getState().actualSpend['catering']).toBe(12000);
  });

  it('recovers gracefully from non-JSON corrupted storage entries', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: 'MALFORMED-NOT-JSON{{{{' });
    const store = createPlanStore(storage);

    expect(store.getState().context).toBeNull();
    expect(store.getState().vendorQuotes).toEqual([]);
    expect(store.getState().taskCompletion).toEqual({});
  });
});
