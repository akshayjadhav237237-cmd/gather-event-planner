import type { EventContext, SubFormat } from '../types/event';

// Planning heuristics: baseline runway horizon in days across wedding sub-formats.
export const WEDDING_HORIZON_DAYS: Record<
  Extract<SubFormat, 'western' | 'interfaith' | 'indian_multiday' | 'destination' | 'micro_wedding'>,
  number
> = {
  western: 390,
  interfaith: 390,
  indian_multiday: 450,
  destination: 450,
  micro_wedding: 180,
};

// Planning heuristics: baseline runway horizon in days across birthday sub-formats.
export const BIRTHDAY_HORIZON_DAYS: Record<
  Extract<SubFormat, 'kids_1_3' | 'kids_4_12' | 'teen' | 'adult_milestone' | 'surprise'>,
  number
> = {
  kids_1_3: 56,
  kids_4_12: 56,
  teen: 56,
  adult_milestone: 56,
  surprise: 42,
};

// Planning heuristics: threshold for mega-scale community events requiring multi-year runway.
export const COMMUNITY_HORIZON_MEGA_GUEST_THRESHOLD = 5000;

// Planning heuristics: baseline horizon days for mega-scale community events.
export const COMMUNITY_HORIZON_MEGA_DAYS = 540;

// Planning heuristics: threshold for large-scale community events requiring extended runway.
export const COMMUNITY_HORIZON_LARGE_GUEST_THRESHOLD = 1000;

// Planning heuristics: baseline horizon days for large-scale community events.
export const COMMUNITY_HORIZON_LARGE_DAYS = 270;

// Planning heuristics: baseline horizon days for standard local community events.
export const COMMUNITY_HORIZON_STANDARD_DAYS = 120;

/** Calculates the baseline planning runway horizon in days for backward task scheduling. */
export function getPlanningHorizonDays(ctx: EventContext): number {
  if (ctx.eventType === 'wedding') {
    return WEDDING_HORIZON_DAYS[ctx.subFormat as keyof typeof WEDDING_HORIZON_DAYS] ?? 390;
  }
  if (ctx.eventType === 'birthday') {
    return BIRTHDAY_HORIZON_DAYS[ctx.subFormat as keyof typeof BIRTHDAY_HORIZON_DAYS] ?? 56;
  }
  if (ctx.guestCount >= COMMUNITY_HORIZON_MEGA_GUEST_THRESHOLD) {
    return COMMUNITY_HORIZON_MEGA_DAYS;
  }
  if (ctx.guestCount >= COMMUNITY_HORIZON_LARGE_GUEST_THRESHOLD) {
    return COMMUNITY_HORIZON_LARGE_DAYS;
  }
  return COMMUNITY_HORIZON_STANDARD_DAYS;
}
