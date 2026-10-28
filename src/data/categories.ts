import type { EventType } from '../types/event';

export interface CategoryDef {
  id: string;
  name: string;
  isFixedCost: boolean;
  bookable: boolean;
}

export const CATEGORY_SETS: Record<EventType, readonly CategoryDef[]> = {
  wedding: [
    { id: 'venue', name: 'Venue', isFixedCost: true, bookable: true },
    { id: 'catering', name: 'Catering', isFixedCost: false, bookable: true },
    { id: 'decor_florals', name: 'Decor & Florals', isFixedCost: false, bookable: true },
    { id: 'photo_video', name: 'Photography & Videography', isFixedCost: true, bookable: true },
    { id: 'entertainment', name: 'Entertainment & Music', isFixedCost: false, bookable: true },
    { id: 'attire_beauty', name: 'Attire & Beauty', isFixedCost: false, bookable: true },
    { id: 'ceremony_rituals', name: 'Ceremony & Rituals', isFixedCost: true, bookable: true },
    {
      id: 'stationery_invites',
      name: 'Stationery & Invitations',
      isFixedCost: false,
      bookable: true,
    },
    { id: 'transport_stay', name: 'Transportation & Lodging', isFixedCost: false, bookable: true },
    {
      id: 'planner_misc',
      name: 'Coordination & Miscellaneous',
      isFixedCost: true,
      bookable: false,
    },
  ],
  birthday: [
    { id: 'venue', name: 'Venue & Space', isFixedCost: true, bookable: true },
    { id: 'catering_cake', name: 'Catering & Cake', isFixedCost: false, bookable: true },
    { id: 'decor_balloons', name: 'Decor & Balloons', isFixedCost: false, bookable: true },
    {
      id: 'entertainment_activities',
      name: 'Entertainment & Activities',
      isFixedCost: true,
      bookable: true,
    },
    { id: 'favors_gifts', name: 'Party Favors & Gifts', isFixedCost: false, bookable: false },
    { id: 'photo_video', name: 'Photography & Videography', isFixedCost: true, bookable: true },
    { id: 'invitations', name: 'Invitations & Paper Goods', isFixedCost: false, bookable: false },
    { id: 'misc_supplies', name: 'Supplies & Extras', isFixedCost: false, bookable: false },
  ],
  community: [
    { id: 'venue_permits', name: 'Venue & Local Permits', isFixedCost: true, bookable: true },
    {
      id: 'production_av',
      name: 'Stage, Sound & AV Production',
      isFixedCost: true,
      bookable: true,
    },
    { id: 'food_beverage', name: 'Food & Beverage Operations', isFixedCost: false, bookable: true },
    {
      id: 'marketing_promo',
      name: 'Marketing & Community Outreach',
      isFixedCost: false,
      bookable: false,
    },
    {
      id: 'programming_entertainment',
      name: 'Programming & Entertainment',
      isFixedCost: false,
      bookable: true,
    },
    {
      id: 'safety_security',
      name: 'Safety, Medical & Security',
      isFixedCost: false,
      bookable: true,
    },
    {
      id: 'sanitation_logistics',
      name: 'Sanitation & Site Logistics',
      isFixedCost: false,
      bookable: true,
    },
    {
      id: 'volunteer_support',
      name: 'Volunteer Coordination & Care',
      isFixedCost: false,
      bookable: false,
    },
    {
      id: 'insurance_admin',
      name: 'Insurance & Event Administration',
      isFixedCost: true,
      bookable: true,
    },
    {
      id: 'misc_supplies',
      name: 'Signage & Operational Supplies',
      isFixedCost: false,
      bookable: false,
    },
  ],
};

/** Validates whether a category identifier belongs to the designated event type set. */
export function isValidCategoryId(eventType: EventType, id: string): boolean {
  const set = CATEGORY_SETS[eventType];
  return set.some((cat) => cat.id === id);
}
