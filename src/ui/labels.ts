import type {
  ContextFlag,
  CurrencyCode,
  EventType,
  Season,
  SubFormat,
  VenueSetting,
} from '../types/event';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  community: 'Community Event',
};

export const EVENT_TYPE_BLURBS: Record<EventType, string> = {
  wedding: 'Multi-day or single-day ceremonies, guest management, and cultural ritual schedules.',
  birthday: "Milestone birthdays, children's parties, surprises, and celebratory entertainment.",
  community: 'Festivals, neighborhood gatherings, volunteer rosters, and crowd logistics.',
};

export const SUBFORMAT_LABELS: Record<SubFormat, string> = {
  western: 'Traditional / Classic',
  indian_multiday: 'Multi-Day Traditional',
  interfaith: 'Interfaith / Fusion',
  destination: 'Destination Wedding',
  micro_wedding: 'Micro Wedding',
  kids_1_3: 'Toddler (Ages 1–3)',
  kids_4_12: 'Kids (Ages 4–12)',
  teen: 'Teen Celebration',
  adult_milestone: 'Adult Milestone',
  surprise: 'Surprise Party',
  festival: 'Community Festival',
  fundraiser: 'Fundraiser / Gala',
  neighborhood: 'Neighborhood Block Party',
  school_cultural: 'School / Cultural Fair',
};

export const SEASON_LABELS: Record<Season, string> = {
  summer: 'Summer',
  monsoon: 'Monsoon / Wet Season',
  winter: 'Winter',
  mild: 'Spring / Autumn / Mild',
};

export const SETTING_LABELS: Record<VenueSetting, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  hybrid: 'Indoor / Outdoor Hybrid',
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  INR: 'INR (₹)',
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  GBP: 'GBP (£)',
};

export const FLAG_LABELS: Record<ContextFlag, string> = {
  nut_allergy: 'Nut allergy alert (strict nut-free catering)',
  latex_allergy: 'Latex allergy (latex-free decor & balloons)',
  gluten_free: 'Gluten-free catering required',
  vegan: 'Vegan catering options',
  vegetarian: 'Vegetarian catering',
  jain: 'Jain dietary catering',
  halal: 'Halal-certified catering',
  wheelchair_access: 'Step-free wheelchair accessibility',
  elderly_guests: 'Comfort seating & rest areas for older guests',
  sensory_friendly: 'Sensory-friendly / quiet retreat space',
  multi_ceremony: 'Multiple ceremonies across multiple days',
  sponsorship_needed: 'Sponsorship revenue & grant tracking needed',
  amplified_music: 'Amplified outdoor sound & local noise permits',
  open_bar: 'Open bar / alcohol service coordination',
  residential_venue: 'Residential venue with neighborhood curfew',
};

export interface FlagGroup {
  title: string;
  flags: ContextFlag[];
}

export const FLAG_GROUPS: FlagGroup[] = [
  {
    title: 'Dietary and allergies',
    flags: ['nut_allergy', 'latex_allergy', 'gluten_free', 'vegan', 'vegetarian', 'jain', 'halal'],
  },
  {
    title: 'Access and comfort',
    flags: ['wheelchair_access', 'elderly_guests', 'sensory_friendly'],
  },
  {
    title: 'Format and logistics',
    flags: [
      'multi_ceremony',
      'sponsorship_needed',
      'amplified_music',
      'open_bar',
      'residential_venue',
    ],
  },
];

export function isFlagRelevant(flag: ContextFlag, eventType: EventType): boolean {
  if (flag === 'multi_ceremony') {
    return eventType === 'wedding';
  }
  if (flag === 'sponsorship_needed') {
    return eventType === 'community';
  }
  if (flag === 'open_bar') {
    return eventType === 'wedding' || eventType === 'birthday';
  }
  if (flag === 'latex_allergy') {
    return eventType === 'birthday' || eventType === 'community';
  }
  return true;
}
