import type {
  ActivitySeed,
  BespokeSeed,
  CateringSeed,
  IdeaBank,
  ThemeSeed,
} from '../../ai/ideaSeedTypes';
import {
  CULTURAL_WEDDING_ACTIVITIES,
  CULTURAL_WEDDING_BESPOKE,
  CULTURAL_WEDDING_CATERING,
  CULTURAL_WEDDING_THEMES,
} from './weddingIdeasCultural';

/** Universal wedding theme seeds adaptable across diverse venue styles and settings. */
export const UNIVERSAL_WEDDING_THEMES: ThemeSeed[] = [
  {
    id: 'theme-classic-elegance',
    title: 'Timeless Botanical Elegance',
    summary:
      'Neutral linens, ambient candlelight, and organic leafy greenery for quiet sophistication.',
    why: 'Designed for a timeless {setting} celebration welcoming {guests} guests in {season}.',
    colorPalette: ['#2c3e50', '#d4af37', '#f8f9fa'],
  },
  {
    id: 'theme-modern-minimalist',
    title: 'Monochrome Architectural Romance',
    summary:
      'Clean geometric lines, sculptural arrangements, and focused spotlights for modern elegance.',
    why: 'Complements a modern {setting} space for {guests} guests with {tier} budget efficiency.',
    colorPalette: ['#1a1a1a', '#e0e0e0', '#ffffff'],
  },
  {
    id: 'theme-warm-rustic-harvest',
    title: 'Warm Earth & Wood Warmth',
    summary:
      'Reclaimed wood accents, textured stoneware, and dried botanicals for relaxed intimacy.',
    why: 'Provides a grounded atmosphere for {guests} guests during {season} in any {setting}.',
    colorPalette: ['#8b5a2b', '#d2b48c', '#fff8dc'],
  },
  {
    id: 'theme-coastal-serenade',
    title: 'Luminous Coastal Horizon',
    summary:
      'Sea-glass tones, airy linen drapery, and open layouts capturing natural ambient light.',
    why: 'Creates an uplifting environment for {guests} guests gathering in {season}.',
    colorPalette: ['#4a7c59', '#709775', '#e8f0ec'],
  },
  {
    id: 'theme-modular-repurposed-arch',
    title: 'Modular Dual-Purpose Floral Arch',
    summary:
      'Portable floral arch designed to transition smoothly from ceremony to reception backdrop.',
    why: 'Maximizes visual impact for {guests} guests while honoring a {tier} budget in {season}.',
    colorPalette: ['#606c38', '#283618', '#fefae0'],
    tags: { budgetTiers: ['tight'] },
  },
];

/** Universal wedding catering seeds adaptable across guest sizes and service styles. */
export const UNIVERSAL_WEDDING_CATERING: CateringSeed[] = [
  {
    id: 'catering-seasonal-bistro',
    title: 'Farm-to-Fork Seasonal Plated Dinner',
    summary: 'Locally sourced plated dinner highlighting produce harvested at seasonal freshness.',
    why: 'Offers polished, comforting dining for {guests} guests during {season}.',
    allergySafetyNote:
      'Accommodates common dietary needs with individual plates and dedicated prep.',
    budgetSwapIdea: 'Substitute premium cuts with braised heritage selections to optimize cost.',
  },
  {
    id: 'catering-interactive-tasting-stations',
    title: 'Artisan Small-Plate Tasting Stations',
    summary: 'Staggered culinary stations featuring artisan flatbreads, pasta, and fresh salads.',
    why: 'Encourages dynamic movement and mingling among {guests} guests in an {setting} venue.',
    allergySafetyNote: 'Ingredient cards clearly displayed at each station with chef oversight.',
    budgetSwapIdea: 'Focus on three core tasting stations rather than five to balance labor costs.',
  },
  {
    id: 'catering-family-communal-roast',
    title: 'Communal Family-Style Carving Board',
    summary: 'Platters of roasted proteins, ancient grains, and charred seasonal vegetables.',
    why: 'Promotes convivial storytelling and warmth among {guests} guests in {setting}.',
    allergySafetyNote: 'Sauces and dressings served on the side to prevent unintended contact.',
    budgetSwapIdea: 'Feature whole roast chicken and hearty legumes to balance protein expenses.',
  },
  {
    id: 'catering-late-night-comfort',
    title: 'Gourmet Midnight Comfort Bites',
    summary: 'Late-night roving service of mini toasties, warm soup shooters, and sweet beignets.',
    why: 'Energizes {guests} guests into the concluding celebration hours during {season}.',
    allergySafetyNote:
      'Dedicated allergen-free snack boxes pre-packed for specific dietary requests.',
    budgetSwapIdea: 'Switch artisan pastries to freshly baked pretzel bites with mustard dips.',
  },
  {
    id: 'catering-tight-budget-refreshment',
    title: 'Seasonal Local Harvest Refreshments',
    summary: 'Chilled local fruit coolers, iced tisanes, and house-baked seasonal savory bites.',
    why: 'Delivers vibrant hospitality for {guests} guests while respecting a {tier} budget.',
    allergySafetyNote: 'All beverages and pastries labeled with base ingredients and nut notices.',
    budgetSwapIdea: 'Feature fresh citrus infusions and sparkling water over bottled mocktails.',
    tags: { budgetTiers: ['tight'] },
  },
];

/** Universal wedding activity seeds adaptable for celebrations of all scales. */
export const UNIVERSAL_WEDDING_ACTIVITIES: ActivitySeed[] = [
  {
    id: 'activity-acoustic-cocktail-session',
    title: 'Live Acoustic Garden Interlude',
    summary: 'Acoustic duo performing gentle contemporary melodies during post-ceremony drinks.',
    why: 'Sets a relaxed cadence for {guests} guests in {setting} during {season}.',
    audienceFit: 'Welcoming for all generations from younger attendees to older relatives.',
    safetyNote: 'Ensure sound equipment cables are taped flat across pedestrian pathways.',
  },
  {
    id: 'activity-audio-guestbook-station',
    title: 'Vintage Rotary Audio Guestbook',
    summary:
      'Retro telephone station where attendees pick up the receiver to record spoken wishes.',
    why: 'Preserves intimate memories with {guests} guests over the duration of the {event}.',
    audienceFit: 'Intuitive and engaging for guests of all ages and backgrounds.',
    safetyNote: 'Place in an acoustically sheltered alcove with clear step-free access.',
  },
  {
    id: 'activity-sparkler-sendoff',
    title: 'Luminous Cold-Spark Farewell Tunnel',
    summary: 'Guests create an illuminated departure corridor with cold-spark wand fixtures.',
    why: 'Creates an uplifting finale for {guests} guests concluding their {event} celebration.',
    audienceFit: 'Exciting shared sendoff activity for all mobile attendees.',
    safetyNote: 'Verify venue approvals and keep metal disposal buckets and sand on standby.',
  },
  {
    id: 'activity-curated-lawn-games',
    title: 'Artisan Wooden Lawn Games',
    summary: 'Handcrafted lawn croquet, bocce balls, and wooden blocks on outdoor turf.',
    why: 'Fosters casual icebreakers among {guests} guests in an {setting} reception.',
    audienceFit: 'Encourages cross-generational play and conversation among all ages.',
    safetyNote: 'Position game lawns well clear of food service lines and main foot traffic.',
  },
  {
    id: 'activity-summer-cooling-retreat',
    title: 'Shaded Botanical Misting Retreat',
    summary: 'Canopied rest lounge featuring fine evaporative misting, fans, and chilled towels.',
    why: 'Maintains guest comfort for {guests} guests during peak daylight in {season}.',
    audienceFit: 'Essential comfort oasis for attendees of all ages in warmer weather.',
    safetyNote: 'Use slip-resistant floor mats around misting perimeters to avoid falls.',
    tags: { settings: ['outdoor'], seasons: ['summer'] },
  },
];

/** Universal wedding bespoke tasks across key timeline planning phases. */
export const UNIVERSAL_WEDDING_BESPOKE: BespokeSeed[] = [
  {
    id: 'bespoke-ceremony-script-alignment',
    title: 'Draft Ceremony Order and Officiant Readings',
    phase: 'Foundations',
    rationale:
      'Align on ceremony vows and reading selections early to establish event foundations.',
  },
  {
    id: 'bespoke-acoustic-site-survey',
    title: 'Review Venue Acoustics and Noise Limits',
    phase: 'Booking',
    rationale:
      'Verify venue decibel limits and speaker coverage before finalizing audio contracts.',
  },
  {
    id: 'bespoke-guest-transport-logistics',
    title: 'Finalize Guest Shuttle and Transit Schedule',
    phase: 'Details',
    rationale: 'Establish transit loops between hotels and venue to prevent arrival delays.',
  },
  {
    id: 'bespoke-rehearsal-walkthrough',
    title: 'Conduct On-Site Ceremony Walkthrough',
    phase: 'Final Week',
    rationale: 'Familiarize wedding party with walking pace, musical cues, and altar positions.',
  },
  {
    id: 'bespoke-day-flow-concierge',
    title: 'Assign Day-Of Personal Flow Concierge',
    phase: 'Event Day',
    rationale: 'Designate a coordinator to safeguard pacing, hydration, and celebrant needs.',
  },
  {
    id: 'bespoke-arch-turnover-plan',
    title: 'Coordinate Floral Arch Turnover Crew',
    phase: 'Details',
    rationale:
      'Assign staff to relocate ceremony arches to reception photo areas during cocktails.',
    tags: { budgetTiers: ['tight'] },
  },
];

/** Comprehensive idea bank containing curated themes, catering concepts, activities, and tasks for weddings. */
export const WEDDING_BANK: IdeaBank = {
  themes: [...UNIVERSAL_WEDDING_THEMES, ...CULTURAL_WEDDING_THEMES],
  catering: [...UNIVERSAL_WEDDING_CATERING, ...CULTURAL_WEDDING_CATERING],
  activities: [...UNIVERSAL_WEDDING_ACTIVITIES, ...CULTURAL_WEDDING_ACTIVITIES],
  bespoke: [...UNIVERSAL_WEDDING_BESPOKE, ...CULTURAL_WEDDING_BESPOKE],
};
