import type { EventContext } from '../types/event';
import { addDays } from '../utils/dateMath';

export interface DemoScenario {
  id: string;
  label: string;
  blurb: string;
  context: EventContext;
}

/** Generates pre-configured realistic celebration planning scenarios relative to a reference date. */
export function getDemoScenarios(today: string): DemoScenario[] {
  return [
    {
      id: 'indian-wedding',
      label: 'Multiday Traditional Wedding',
      blurb:
        '3-day celebration with multi-ceremony coordination, seasonal monsoon adaptations, and large guest catering.',
      context: {
        id: 'indian-wedding',
        title: 'Multiday Traditional Wedding',
        eventType: 'wedding',
        subFormat: 'indian_multiday',
        guestCount: 300,
        totalBudget: 3500000,
        currency: 'INR',
        setting: 'outdoor',
        season: 'monsoon',
        eventDate: addDays(today, 300),
        flags: ['multi_ceremony', 'vegetarian', 'elderly_guests'],
        priorities: ['catering', 'decor_florals'],
        userNotes:
          'Multi-generational family celebration requiring vegetarian catering and accessible ground arrangements.',
      },
    },
    {
      id: 'kids-birthday-rush',
      label: 'Short-Notice Kids Birthday',
      blurb:
        'High-urgency outdoor birthday party planned on compressed 16-day notice with allergy alerts.',
      context: {
        id: 'kids-birthday-rush',
        title: 'Short-Notice Kids Birthday',
        eventType: 'birthday',
        subFormat: 'kids_4_12',
        guestCount: 20,
        totalBudget: 850,
        currency: 'USD',
        setting: 'outdoor',
        season: 'summer',
        eventDate: addDays(today, 16),
        flags: ['nut_allergy'],
        priorities: ['entertainment_activities'],
        userNotes:
          'Energetic outdoor park birthday with strict nut-free requirements and compressed timeline.',
      },
    },
    {
      id: 'community-festival',
      label: 'Neighborhood Community Festival',
      blurb:
        'Large-scale outdoor civic gathering requiring sponsorship tracking, crowd safety, and accessibility logistics.',
      context: {
        id: 'community-festival',
        title: 'Neighborhood Community Festival',
        eventType: 'community',
        subFormat: 'festival',
        guestCount: 2500,
        totalBudget: 40000,
        currency: 'USD',
        setting: 'outdoor',
        season: 'mild',
        eventDate: addDays(today, 140),
        flags: ['sponsorship_needed', 'wheelchair_access'],
        priorities: ['production_av', 'safety_security'],
        userNotes: 'Public community fair celebrating local art and music with volunteer marshals.',
      },
    },
    {
      id: 'stretch-budget-wedding',
      label: 'High-Capacity Budget Wedding',
      blurb:
        'Indoor reception with tight per-head economics requiring constructive trade-off recommendations.',
      context: {
        id: 'stretch-budget-wedding',
        title: 'High-Capacity Budget Wedding',
        eventType: 'wedding',
        subFormat: 'western',
        guestCount: 400,
        totalBudget: 300000,
        currency: 'INR',
        setting: 'indoor',
        season: 'winter',
        eventDate: addDays(today, 200),
        flags: ['open_bar'],
        priorities: ['venue', 'catering'],
        userNotes:
          'Large indoor wedding celebration balancing venue capacity with tight per-guest catering budget.',
      },
    },
  ];
}
