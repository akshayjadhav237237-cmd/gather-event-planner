import type { VendorGuideTemplate } from './weddingVendors';

const COND_OUTDOOR = {
  ruleId: 'OUTDOOR' as const,
  questions: ['What indoor or covered shelter is reserved in case of sudden rain?'],
  requiredChecks: ['Confirm weather backup plan and outdoor electrical safety checks'],
};

const COND_OPEN_BAR = {
  ruleId: 'OPEN_BAR' as const,
  requiredChecks: ['Verify liquor liability and local server permit verification'],
};

const COND_ACCESSIBILITY = {
  ruleId: 'ACCESSIBILITY' as const,
  questions: ['Are party areas, entrances, and restrooms step-free and accessible?'],
  requiredChecks: ['Confirm step-free guest access and accessible restroom confirmation'],
};

const COND_DIETARY = {
  ruleId: 'DIETARY_CULTURAL' as const,
  questions: ['How are separate preparation areas maintained for cultural dietary requirements?'],
  requiredChecks: ['Verify separate-preparation and cross-contamination check'],
};

const COND_ALLERGY = {
  ruleId: 'ALLERGY_ALERT' as const,
  questions: ['What written protocol prevents allergen cross-contact in party food and cake?'],
  requiredChecks: ['Verify allergen labeling protocol and written allergy policy check'],
};

export const BIRTHDAY_VENDOR_GUIDES: readonly VendorGuideTemplate[] = [
  {
    id: 'venue',
    name: 'Venue & Space',
    scope: 'Party room, activity space, private dining room, or outdoor pavilion rental.',
    questions: [
      'What is the total rental duration, including setup and cleanup buffers?',
      'Are outside food, celebration cakes, and private entertainment allowed?',
      'What is the maximum guest capacity for seated guests and chaperones?',
      'What cleaning obligations must the host perform before departure?',
      'What deposit is required to hold the date, and what is the refund schedule?',
    ],
    requiredChecks: ['Confirm public liability insurance meets venue coverage requirements'],
    contractWatchouts: [
      'Strict departure penalties billed in full-hour increments for minor overruns',
    ],
    conditional: [COND_OUTDOOR, COND_OPEN_BAR, COND_ACCESSIBILITY],
  },
  {
    id: 'catering_cake',
    name: 'Catering & Cake',
    scope: 'Party meals, finger foods, beverages, dessert bars, and custom birthday cake.',
    questions: [
      'What menu packages and dietary alternatives are offered within the base price?',
      'How is the custom cake transported, assembled, and chilled at the venue?',
      'Does the cake quote include cutting service, plates, napkins, and utensils?',
      'What is the final deadline to adjust guest count and dietary orders?',
      'What are the deposit, cancellation, and date-rescheduling policies?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally'],
    contractWatchouts: ['Separate cake-cutting fees or outside dessert plating surcharges'],
    conditional: [COND_DIETARY, COND_ALLERGY, COND_OPEN_BAR],
  },
  {
    id: 'decor_balloons',
    name: 'Decor & Balloons',
    scope: 'Balloon arches, themed backdrops, table styling, party banners, and photo spots.',
    questions: [
      'Does the quote include delivery, on-site inflation, installation, and post-party removal?',
      'How long are balloon installations guaranteed to remain inflated and upright?',
      'What eco-friendly or non-toxic materials are used for celebration decor?',
      'How much setup time does the decorator require inside the party room?',
      'What backdrop frames or hardware items are rentals that must be returned?',
    ],
    requiredChecks: [
      'Confirm venue policies regarding tape, adhesives, helium, and wall fastenings',
    ],
    contractWatchouts: [
      'Unreturned frame or rental hardware replacement fees exceeding market rates',
    ],
    conditional: [COND_OUTDOOR],
  },
  {
    id: 'entertainment_activities',
    name: 'Entertainment & Activities',
    scope: 'Performers, animators, face painters, games coordinators, or music hosts.',
    questions: [
      'What age range is the performance or activity specifically tailored for?',
      'What is the performer-to-guest ratio to keep all participants engaged?',
      'Does the entertainer provide all game supplies, props, prizes, and sound gear?',
      'What is the backup plan if the scheduled entertainer encounters travel delay?',
      'What space, electrical outlets, or table setups does the performer require?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally'],
    contractWatchouts: ['Performer substitute clauses with no guarantee of equivalent skill'],
  },
  {
    id: 'photo_video',
    name: 'Photography & Videography',
    scope:
      'Candid celebration photography, family portraits, cake-cutting shots, and digital albums.',
    questions: [
      'How many hours of active party coverage are included in the package?',
      'What is the turnaround time for receiving the digital image gallery?',
      'Are candid guest interactions and cake-cutting moments specifically prioritized?',
      'Are high-resolution download rights and sharing permissions included without watermark?',
      'What are the hourly overtime rates if party activities run past schedule?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally'],
    contractWatchouts: [
      'Copyright clauses that prevent families from printing or sharing party photos',
    ],
  },
];
