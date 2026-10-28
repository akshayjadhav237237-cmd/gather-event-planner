import { EVENT_SUBFORMATS, MAX_PRIORITIES } from '../config/constants';
import { isValidCategoryId } from '../data/categories';
import { getPerHeadFloor } from '../data/perHeadFloors';
import type {
  ContextFlag,
  CurrencyCode,
  EventContext,
  EventType,
  Season,
  SubFormat,
  VenueSetting,
} from '../types/event';
import { EventContextSchema } from '../types/schemas';
import { formatCurrency } from '../utils/currency';
import { addDays } from '../utils/dateMath';
import { isFlagRelevant } from './labels';

export interface FormDraft {
  title: string;
  eventType: EventType;
  subFormat: SubFormat;
  eventDate: string;
  currency: CurrencyCode;
  totalBudget: string;
  guestCount: string;
  setting: VenueSetting;
  season: Season;
  priorities: string[];
  flags: ContextFlag[];
  userNotes: string;
}

export type FieldKey = keyof FormDraft;
export type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_KEYS = new Set<string>([
  'title',
  'eventType',
  'subFormat',
  'eventDate',
  'currency',
  'totalBudget',
  'guestCount',
  'setting',
  'season',
  'priorities',
  'flags',
  'userNotes',
]);

function isFieldKey(key: string): key is FieldKey {
  return FIELD_KEYS.has(key);
}

/** Parses a string into a non-negative safe whole number or returns NaN. */
export function parseWholeNumber(raw: string): number {
  if (typeof raw !== 'string') return NaN;
  const sanitized = raw.replace(/[\s,_]/g, '');
  if (sanitized.length === 0 || !/^\d+$/.test(sanitized)) return NaN;
  const parsed = Number(sanitized);
  return Number.isSafeInteger(parsed) ? parsed : NaN;
}

function roundToTwoSignificantDigits(value: number): number {
  if (value <= 0 || !Number.isFinite(value)) return 0;
  const order = Math.floor(Math.log10(value));
  const factor = Math.pow(10, order - 1);
  return Math.round(value / factor) * factor;
}

const DEFAULT_GUESTS: Record<EventType, string> = {
  wedding: '150',
  birthday: '25',
  community: '300',
};
const DEFAULT_DAYS: Record<EventType, number> = { wedding: 300, birthday: 30, community: 120 };
const DEFAULT_TITLES: Record<EventType, string> = {
  wedding: 'Our wedding',
  birthday: 'Birthday celebration',
  community: 'Community event',
};

function getInitialSubFormat(eventType: EventType): SubFormat {
  return EVENT_SUBFORMATS[eventType][0] ?? 'western';
}

/** Creates a new default form draft for the specified event type and date. */
export function createDraft(
  eventType: EventType,
  today: string,
  currency: CurrencyCode = 'INR'
): FormDraft {
  const guestCount = DEFAULT_GUESTS[eventType];
  const guests = parseWholeNumber(guestCount);
  const floor = getPerHeadFloor(eventType, currency);
  const roundedBudget = roundToTwoSignificantDigits(guests * floor * 3);

  return {
    title: DEFAULT_TITLES[eventType],
    eventType,
    subFormat: getInitialSubFormat(eventType),
    eventDate: addDays(today, DEFAULT_DAYS[eventType]),
    currency,
    totalBudget: String(roundedBudget),
    guestCount,
    setting: 'indoor',
    season: 'mild',
    priorities: [],
    flags: [],
    userNotes: '',
  };
}

/** Converts a persisted event context into editable form draft state. */
export function draftFromContext(ctx: EventContext): FormDraft {
  return {
    title: ctx.title,
    eventType: ctx.eventType,
    subFormat: ctx.subFormat,
    eventDate: ctx.eventDate,
    currency: ctx.currency,
    totalBudget: String(ctx.totalBudget),
    guestCount: String(ctx.guestCount),
    setting: ctx.setting,
    season: ctx.season,
    priorities: [...ctx.priorities],
    flags: [...ctx.flags],
    userNotes: ctx.userNotes,
  };
}

const ERROR_MESSAGES: Partial<Record<FieldKey, string>> = {
  title: 'Enter a title for your event.',
  eventDate: 'Select a valid calendar date.',
  totalBudget: 'Enter a budget greater than zero.',
  guestCount: 'Enter a guest count between 1 and 10,000.',
  subFormat: 'Select a valid celebration format.',
  priorities: 'Select up to 3 priorities.',
  userNotes: 'Notes cannot exceed 300 characters.',
};

/** Validates a form draft and returns either the event context or field errors. */
export function parseDraft(
  draft: FormDraft,
  id: string
): { ok: true; value: EventContext } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const totalBudget = parseWholeNumber(draft.totalBudget);
  if (!Number.isFinite(totalBudget) || totalBudget <= 0) {
    errors.totalBudget = 'Enter a budget greater than zero.';
  }

  const guestCount = parseWholeNumber(draft.guestCount);
  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 10000) {
    errors.guestCount = 'Enter a guest count between 1 and 10,000.';
  }

  const rawCandidate = {
    ...draft,
    id,
    totalBudget: Number.isFinite(totalBudget) ? totalBudget : 0,
    guestCount: Number.isFinite(guestCount) ? guestCount : 0,
  };

  const parsed = EventContextSchema.safeParse(rawCandidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const seg = issue.path[0];
      const field = typeof seg === 'string' && isFieldKey(seg) ? seg : undefined;
      if (!field || errors[field]) continue;
      errors[field] = ERROR_MESSAGES[field] ?? issue.message;
    }
    return { ok: false, errors };
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: parsed.data };
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
