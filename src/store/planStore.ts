import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { STORAGE_KEY } from '../config/constants';
import type { BackupPayload } from '../export/backupTypes';
import type { EventContext, PersonalizedIdeas, VendorQuote } from '../types/event';
import { EventContextSchema, PersonalizedIdeasSchema, VendorQuoteSchema } from '../types/schemas';
import { ignoreExpectedError } from '../utils/errors';

export interface PlanPersistedState {
  context: EventContext | null;
  taskCompletion: Record<string, boolean>;
  actualSpend: Record<string, number>;
  vendorQuotes: VendorQuote[];
  ideas: PersonalizedIdeas | null;
}

export interface PlanState extends PlanPersistedState {
  setContext: (context: EventContext | null) => void;
  toggleTask: (taskId: string) => void;
  setActualSpend: (categoryId: string, amount: number) => void;
  upsertQuote: (quote: VendorQuote) => void;
  removeQuote: (quoteId: string) => void;
  setIdeas: (ideas: PersonalizedIdeas | null) => void;
  loadScenario: (context: EventContext) => void;
  restoreBackup: (payload: BackupPayload) => void;
  clearAll: () => void;
}

const INITIAL_DATA: PlanPersistedState = {
  context: null,
  taskCompletion: {},
  actualSpend: {},
  vendorQuotes: [],
  ideas: null,
};

const memoryFallback = new Map<string, string>();

export const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
    } catch (_err) {
      ignoreExpectedError(_err, 'localStorage getItem access denied');
    }
    return memoryFallback.get(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
        return;
      }
    } catch (_err) {
      ignoreExpectedError(_err, 'localStorage setItem access denied or quota exceeded');
    }
    memoryFallback.set(name, value);
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
        return;
      }
    } catch (_err) {
      ignoreExpectedError(_err, 'localStorage removeItem access denied');
    }
    memoryFallback.delete(name);
  },
};

const wrapSafeStorage = (storage: StateStorage): StateStorage => ({
  getItem: (name) => {
    try {
      return storage.getItem(name);
    } catch (_err) {
      ignoreExpectedError(_err, 'wrapped storage getItem failure');
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      storage.setItem(name, value);
    } catch (_err) {
      ignoreExpectedError(_err, 'wrapped storage setItem failure');
    }
  },
  removeItem: (name) => {
    try {
      storage.removeItem(name);
    } catch (_err) {
      ignoreExpectedError(_err, 'wrapped storage removeItem failure');
    }
  },
});

export const createPlanStore = (customStorage?: StateStorage) => {
  const activeStorage = wrapSafeStorage(customStorage ?? safeLocalStorage);

  return create<PlanState>()(
    persist(
      (set) => ({
        ...INITIAL_DATA,
        setContext: (context) => set({ context }),
        toggleTask: (taskId) =>
          set((s) => ({
            taskCompletion: { ...s.taskCompletion, [taskId]: !s.taskCompletion[taskId] },
          })),
        setActualSpend: (categoryId, amount) =>
          set((s) => ({
            actualSpend: { ...s.actualSpend, [categoryId]: amount },
          })),
        upsertQuote: (quote) =>
          set((s) => {
            const idx = s.vendorQuotes.findIndex((q) => q.id === quote.id);
            const vendorQuotes =
              idx >= 0
                ? s.vendorQuotes.map((q, i) => (i === idx ? quote : q))
                : [...s.vendorQuotes, quote];
            return { vendorQuotes };
          }),
        removeQuote: (quoteId) =>
          set((s) => ({
            vendorQuotes: s.vendorQuotes.filter((q) => q.id !== quoteId),
          })),
        setIdeas: (ideas) => set({ ideas }),
        loadScenario: (context) =>
          set({ context, taskCompletion: {}, actualSpend: {}, vendorQuotes: [], ideas: null }),
        restoreBackup: (payload) =>
          set({
            context: payload.context,
            taskCompletion: payload.taskCompletion,
            actualSpend: payload.actualSpend,
            vendorQuotes: payload.vendorQuotes,
            ideas: payload.ideas,
          }),
        clearAll: () => set({ ...INITIAL_DATA }),
      }),
      {
        name: STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => activeStorage),
        partialize: (state): PlanPersistedState => ({
          context: state.context,
          taskCompletion: state.taskCompletion,
          actualSpend: state.actualSpend,
          vendorQuotes: state.vendorQuotes,
          ideas: state.ideas,
        }),
        migrate: (): PlanPersistedState => ({ ...INITIAL_DATA }),
        merge: (persistedState, currentState): PlanState => {
          try {
            if (typeof persistedState !== 'object' || persistedState === null) {
              return { ...currentState, ...INITIAL_DATA };
            }
            const raw = persistedState as Record<string, unknown>;
            const parsedContext = raw.context ? EventContextSchema.safeParse(raw.context) : null;
            const parsedTasks = raw.taskCompletion
              ? z.record(z.string(), z.boolean()).safeParse(raw.taskCompletion)
              : null;
            const parsedSpend = raw.actualSpend
              ? z.record(z.string(), z.number()).safeParse(raw.actualSpend)
              : null;
            const parsedIdeas = raw.ideas
              ? PersonalizedIdeasSchema.safeParse(raw.ideas)
              : null;
            const vendorQuotes = Array.isArray(raw.vendorQuotes)
              ? raw.vendorQuotes
                  .map((q) => VendorQuoteSchema.safeParse(q))
                  .filter((r): r is z.SafeParseSuccess<VendorQuote> => r.success)
                  .map((r) => r.data)
              : [];

            return {
              ...currentState,
              context: parsedContext?.success ? parsedContext.data : null,
              taskCompletion: parsedTasks?.success ? parsedTasks.data : {},
              actualSpend: parsedSpend?.success ? parsedSpend.data : {},
              vendorQuotes,
              ideas: parsedIdeas?.success ? parsedIdeas.data : null,
            };
          } catch {
            return { ...currentState, ...INITIAL_DATA };
          }
        },
      }
    )
  );
};

export const usePlanStore = createPlanStore();
