// Illustrative planning heuristic cost-saving swap recommendations by category.
// Note: These recommendations represent illustrative planning heuristics for budget optimization.
const COST_SAVING_SWAPS: Record<string, string> = {
  venue: 'Consider off-peak booking days or civic venues with flexible catering policies.',
  catering: 'Opt for family-style or buffet service instead of individual plated multi-course dining.',
  decor_florals: 'Repurpose ceremony focal florals into reception backdrop arrangements.',
  photo_video: 'Book single-lead coverage for essential ceremony hours rather than full-day dual shooters.',
  entertainment: 'Hire a curated live duo for ceremony moments and transition to a professional DJ for dancing.',
  attire_beauty: 'Explore boutique rental options, sample sales, or mix-and-match attire for the party.',
  ceremony_rituals: 'Source ritual elements locally or repurpose heirloom decorative vessels from family members.',
  stationery_invites: 'Transition to digital invitations and online RSVPs, keeping physical prints for keepsakes only.',
  transport_stay: 'Coordinate a group shuttle charter rather than booking multiple separate private transfers.',
  planner_misc: 'Engage a dedicated month-of coordinator rather than comprehensive full-scope event design.',
  catering_cake: 'Order a decorative single-tier ceremonial cake complemented by sheet cakes for guest portions.',
  decor_balloons: 'Concentrate balloon arches and feature styling around a single focal photo backdrop.',
  entertainment_activities:
    'Select versatile interactive activity hosts or lawn games instead of multiple specialized acts.',
  favors_gifts: 'Provide a simple edible treat or potted succulent favor instead of packaged trinkets.',
  invitations: 'Distribute animated digital invitations with automated RSVP management to eliminate printing costs.',
  misc_supplies: 'Source paper goods and event disposables in bulk from wholesale hospitality suppliers.',
  venue_permits:
    'Collaborate with municipal community spaces or public parks that offer fee concessions for civic events.',
  production_av: 'Rent a modular sound and lighting package sized specifically to expected crowd zones.',
  food_beverage: 'Invite certified local food trucks or vendor stalls operating on a revenue-share model.',
  marketing_promo: 'Utilize digital community groups, public notice boards, and volunteer flyer distribution.',
  programming_entertainment:
    'Feature local talent showcases, school performance troupes, and community cultural groups.',
  safety_security:
    'Pair licensed security supervisors with trained community volunteers for checkpoint hospitality.',
  sanitation_logistics: 'Cluster paired waste and recycling bins near food areas to streamline collection rounds.',
  volunteer_support: 'Seek meal or refreshment donations from neighborhood businesses to care for volunteer crews.',
  insurance_admin: 'Secure event liability policies through community organization affinity programs.',
};

/** Retrieves an illustrative cost-saving swap recommendation for a budget category. */
export function getCostSavingSwap(categoryId: string): string | null {
  return COST_SAVING_SWAPS[categoryId] ?? null;
}
