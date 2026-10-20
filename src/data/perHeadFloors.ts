import type { CurrencyCode, EventType } from '../types/event';

// Baseline planning heuristic minimums per guest by event type and currency.
// Note: These figures represent illustrative planning heuristics for feasibility estimation.
const PER_HEAD_FLOOR_HEURISTICS: Record<EventType, Record<CurrencyCode, number>> = {
  wedding: {
    INR: 1500,
    USD: 40,
    EUR: 40,
    GBP: 35,
  },
  birthday: {
    INR: 500,
    USD: 15,
    EUR: 15,
    GBP: 12,
  },
  community: {
    INR: 150,
    USD: 5,
    EUR: 5,
    GBP: 4,
  },
};

/** Retrieves the baseline planning heuristic minimum spend floor per guest for an event type. */
export function getPerHeadFloor(eventType: EventType, currency: CurrencyCode): number {
  const eventFloors = PER_HEAD_FLOOR_HEURISTICS[eventType];
  return eventFloors[currency];
}
