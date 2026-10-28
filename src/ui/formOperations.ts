import { EVENT_SUBFORMATS, MAX_PRIORITIES } from '../config/constants';
import { isValidCategoryId } from '../data/categories';
import type { ContextFlag, EventType, SubFormat } from '../types/event';
import { formatCurrency } from '../utils/currency';
import type { FormDraft } from './formModel';
import { parseWholeNumber } from './formModel';
import { isFlagRelevant } from './labels';

export function getInitialSubFormat(eventType: EventType): SubFormat {
  return EVENT_SUBFORMATS[eventType][0] ?? 'western';
}

/** Adapts subformat, priorities, and flags when switching event types. */
export function applyEventTypeChange(draft: FormDraft, eventType: EventType): FormDraft {
  const nextSubFormat = getInitialSubFormat(eventType);
  const validPriorities = draft.priorities.filter((catId) => isValidCategoryId(eventType, catId));
  const validFlags = draft.flags.filter((flag) => isFlagRelevant(flag, eventType));

  return {
    ...draft,
    eventType,
    subFormat: nextSubFormat,
    priorities: validPriorities,
    flags: validFlags,
  };
}

/** Toggles selection of a category priority up to the maximum allowance. */
export function togglePriority(draft: FormDraft, categoryId: string): FormDraft {
  if (!isValidCategoryId(draft.eventType, categoryId)) return draft;
  const exists = draft.priorities.includes(categoryId);
  if (exists) {
    return { ...draft, priorities: draft.priorities.filter((id) => id !== categoryId) };
  }
  if (draft.priorities.length >= MAX_PRIORITIES) return draft;
  return { ...draft, priorities: [...draft.priorities, categoryId] };
}

/** Toggles an event context flag on or off. */
export function toggleFlag(draft: FormDraft, flag: ContextFlag): FormDraft {
  const exists = draft.flags.includes(flag);
  return {
    ...draft,
    flags: exists ? draft.flags.filter((f) => f !== flag) : [...draft.flags, flag],
  };
}

/** Generates an illustrative per-guest budget estimate string. */
export function describeBudgetHint(draft: FormDraft): string {
  const budget = parseWholeNumber(draft.totalBudget);
  const guests = parseWholeNumber(draft.guestCount);
  if (!Number.isFinite(budget) || !Number.isFinite(guests) || guests <= 0 || budget <= 0) {
    return '';
  }
  const perGuest = Math.floor(budget / guests);
  return `About ${formatCurrency(perGuest, draft.currency)} per guest`;
}
