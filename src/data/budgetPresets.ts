import type { EventType, SubFormat } from '../types/event';

export type PresetKey =
  'wedding_western' | 'wedding_indian' | 'birthday_kids' | 'birthday_adult' | 'community';

// Baseline planning heuristic category percentage allocations by archetype.
// Note: These figures represent illustrative planning heuristics for initial budget distribution.
export const BUDGET_PRESETS: Record<PresetKey, Record<string, number>> = {
  wedding_western: {
    venue: 20,
    catering: 25,
    decor_florals: 10,
    photo_video: 10,
    entertainment: 7,
    attire_beauty: 8,
    ceremony_rituals: 3,
    stationery_invites: 2,
    transport_stay: 8,
    planner_misc: 7,
  },
  wedding_indian: {
    venue: 22,
    catering: 27,
    decor_florals: 15,
    photo_video: 10,
    entertainment: 8,
    attire_beauty: 8,
    ceremony_rituals: 3,
    stationery_invites: 2,
    transport_stay: 3,
    planner_misc: 2,
  },
  birthday_kids: {
    venue: 20,
    catering_cake: 30,
    decor_balloons: 12,
    entertainment_activities: 20,
    favors_gifts: 10,
    photo_video: 3,
    invitations: 2,
    misc_supplies: 3,
  },
  birthday_adult: {
    venue: 30,
    catering_cake: 30,
    decor_balloons: 10,
    entertainment_activities: 12,
    favors_gifts: 3,
    photo_video: 8,
    invitations: 2,
    misc_supplies: 5,
  },
  community: {
    venue_permits: 10,
    production_av: 15,
    food_beverage: 15,
    marketing_promo: 8,
    programming_entertainment: 20,
    safety_security: 10,
    sanitation_logistics: 10,
    volunteer_support: 5,
    insurance_admin: 5,
    misc_supplies: 2,
  },
};

/** Retrieves baseline planning heuristic category percentage weights for an event configuration. */
export function getBudgetPreset(
  eventType: EventType,
  subFormat: SubFormat
): Record<string, number> {
  if (eventType === 'wedding') {
    return subFormat === 'indian_multiday'
      ? BUDGET_PRESETS.wedding_indian
      : BUDGET_PRESETS.wedding_western;
  }

  if (eventType === 'birthday') {
    return subFormat === 'kids_1_3' || subFormat === 'kids_4_12'
      ? BUDGET_PRESETS.birthday_kids
      : BUDGET_PRESETS.birthday_adult;
  }

  return BUDGET_PRESETS.community;
}
