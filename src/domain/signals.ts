import { COMPRESSED_THRESHOLD_DAYS } from '../config/constants';
import { getPerHeadFloor } from '../data/perHeadFloors';
import type { ContextSignals } from '../types/engine';
import type { EventContext } from '../types/event';
import { daysBetween } from '../utils/dateMath';

/** Computes contextual planning signals and feasibility classifications from event inputs. */
export function deriveSignals(ctx: EventContext, today: string): ContextSignals {
  const daysUntilEvent = daysBetween(today, ctx.eventDate);
  const isPast = daysUntilEvent < 0;
  const isShortNotice = daysUntilEvent >= 0 && daysUntilEvent < COMPRESSED_THRESHOLD_DAYS;
  const safeGuestCount = ctx.guestCount > 0 ? ctx.guestCount : 1;
  const perGuestBudget = Math.floor(ctx.totalBudget / safeGuestCount);
  const floorPerGuest = getPerHeadFloor(ctx.eventType, ctx.currency);
  const isBelowFloor = perGuestBudget < floorPerGuest;
  const budgetTier = isBelowFloor
    ? 'tight'
    : perGuestBudget < floorPerGuest * 2
      ? 'moderate'
      : 'generous';
  const isMicroEvent = ctx.guestCount < 50;
  const isLargeCrowd = ctx.guestCount >= 1000;
  const isOutdoorExposed = ctx.setting === 'outdoor' || ctx.setting === 'hybrid';
  const hasYoungKids = ctx.subFormat === 'kids_1_3';
  const hasSchoolKids = ctx.subFormat === 'kids_4_12';

  return {
    daysUntilEvent,
    isPast,
    isShortNotice,
    perGuestBudget,
    floorPerGuest,
    isBelowFloor,
    budgetTier,
    isMicroEvent,
    isLargeCrowd,
    isOutdoorExposed,
    hasYoungKids,
    hasSchoolKids,
  };
}
