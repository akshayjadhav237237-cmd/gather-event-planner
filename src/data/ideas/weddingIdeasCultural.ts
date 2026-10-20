import type { ActivitySeed, BespokeSeed, CateringSeed, ThemeSeed } from '../../ai/ideaSeedTypes';

/** Cultural and contextual wedding theme seeds honoring varied rituals and formats. */
export const CULTURAL_WEDDING_THEMES: ThemeSeed[] = [
  {
    id: 'theme-haldi-mehendi',
    title: 'Sunlit Marigold Celebration',
    summary: 'Marigold garlands, saffron drapery, and brass urlis for joyful pre-wedding rituals.',
    why: 'Enlivens cherished family pre-wedding traditions for {guests} guests in {season}.',
    colorPalette: ['#ffb703', '#fb8500', '#fff3b0'],
    tags: { subFormats: ['indian_multiday'] },
  },
  {
    id: 'theme-mandap-sanctuary',
    title: 'Sculpted Mandap Floral Pavilion',
    summary: 'Four-pillar ceremonial sanctuary framed with tubular blossoms and warm uplighting.',
    why: 'Anchors sacred vows in a graceful {setting} sanctuary for {guests} guests in {season}.',
    colorPalette: ['#9d0208', '#d00000', '#ffba08'],
    tags: { subFormats: ['indian_multiday'] },
  },
  {
    id: 'theme-interfaith-harmony',
    title: 'Dual-Heritage Ceremonial Synthesis',
    summary: 'Balanced ceremonial styling honoring two traditions with harmonious symbolic motifs.',
    why: 'Respectfully weaves blended family rituals together for {guests} guests in {season}.',
    colorPalette: ['#3d5a80', '#98c1d9', '#e0fbfc'],
    tags: { subFormats: ['interfaith'] },
  },
  {
    id: 'theme-micro-feasting-table',
    title: 'Intimate Shared Feasting Haven',
    summary: 'Continuous banquet table with personalized place settings and shared floral runners.',
    why: 'Fosters deep connection for an intimate gathering of {guests} guests in {setting}.',
    colorPalette: ['#582f0e', '#7f4f24', '#ede0d4'],
    tags: { subFormats: ['micro_wedding'] },
  },
  {
    id: 'theme-weather-resilient-canopy',
    title: 'All-Weather Clear-Span Pavilion',
    summary:
      'Clear-span pavilion with climate ventilation, integrated gutters, and ceiling greens.',
    why: 'Guarantees comfort for {guests} guests across {season} weather in an {setting} venue.',
    colorPalette: ['#2b2d42', '#8d99ae', '#edf2f4'],
    tags: { settings: ['outdoor'], seasons: ['monsoon', 'summer'] },
  },
];

/** Cultural and contextual catering seeds supporting diverse culinary traditions and diets. */
export const CULTURAL_WEDDING_CATERING: CateringSeed[] = [
  {
    id: 'catering-festive-regional-thali',
    title: 'Festive Regional Heritage Banquet',
    summary: 'Multi-course regional banquet showcasing slow-cooked curries, breads, and sweets.',
    why: 'Honors celebratory communal dining traditions for {guests} guests in {season}.',
    allergySafetyNote: 'Separate vegetarian lines with distinct ladles and colored tableware.',
    budgetSwapIdea: 'Highlight seasonal lentils and local cheese over rare imported produce.',
    tags: { subFormats: ['indian_multiday'] },
  },
  {
    id: 'catering-dual-heritage-fusion',
    title: 'Cross-Cultural Fusion Tasting Bar',
    summary: 'Paired food stations uniting signature flavors and recipes from both backgrounds.',
    why: 'Celebrates the union of culinary traditions for {guests} guests in {setting}.',
    allergySafetyNote: 'Heritage ingredient cards clearly detail all spices and allergen notices.',
    budgetSwapIdea: 'Offer customizable grain bowls with shared bases and heritage sauces.',
    tags: { subFormats: ['interfaith'] },
  },
  {
    id: 'catering-dedicated-certified-prep',
    title: 'Certified Dietary Prep & Service Line',
    summary: 'Dedicated kitchen line maintaining strict segregation and certified protocols.',
    why: 'Provides complete peace of mind for {guests} guests with dietary commitments.',
    allergySafetyNote:
      'Certified separate cookware, isolated prep tables, and sealed warming bins.',
    budgetSwapIdea: 'Partner with specialized local community kitchens for curated portions.',
    tags: { requiresFlags: ['vegan', 'vegetarian', 'jain', 'halal'] },
  },
  {
    id: 'catering-allergen-safe-line',
    title: 'Dedicated Allergen-Isolated Service',
    summary: 'Individually sealed meals prepared in an isolated kitchen free from cross-contact.',
    why: 'Guarantees safe, dignified dining for {guests} guests with severe sensitivities.',
    allergySafetyNote: 'Zero common allergens in prep zone; sealed cloches opened tableside.',
    budgetSwapIdea: 'Standardize gluten-free grains across sides to avoid dual cooking batches.',
    tags: { requiresFlags: ['nut_allergy', 'gluten_free'] },
  },
  {
    id: 'catering-hydration-cooling-oasis',
    title: 'Shaded Hydration & Spritzer Station',
    summary: 'Chilled herb-infused waters, citrus spritzers, iced tisanes, and fruit skewers.',
    why: 'Ensures refreshing comfort for {guests} guests at an {setting} ceremony in {season}.',
    allergySafetyNote: 'Clear signage listing unsweetened vs sweetened and herbal ingredients.',
    budgetSwapIdea: 'Use large glass dispensers with fresh citrus rather than bottled drinks.',
    tags: { settings: ['outdoor'], seasons: ['summer'] },
  },
];

/** Cultural and contextual activity seeds for multiday, destination, and accessible weddings. */
export const CULTURAL_WEDDING_ACTIVITIES: ActivitySeed[] = [
  {
    id: 'activity-family-sangeet',
    title: 'Choreographed Family Sangeet Showcase',
    summary: 'Spirited evening of musical performances, group dances, and family storytelling.',
    why: 'Brings families together in vibrant celebration for {guests} guests in {season}.',
    audienceFit: 'Celebrates multi-generational participation across relatives and friends.',
    safetyNote: 'Stage flooring must have non-slip surfaces and clear edge illumination.',
    tags: { subFormats: ['indian_multiday'] },
  },
  {
    id: 'activity-destination-trail',
    title: 'Curated Regional Discovery Trail',
    summary: 'Self-paced exploration guide with local cafes, scenic viewpoints, and craft stops.',
    why: 'Enriches the destination journey for {guests} guests traveling for the {event}.',
    audienceFit: 'Ideal for traveling guests seeking relaxed downtime between scheduled events.',
    safetyNote: 'Include walking difficulty notes, shade rest stops, and emergency contacts.',
    tags: { subFormats: ['destination'] },
  },
  {
    id: 'activity-micro-handwritten-notes',
    title: 'Handwritten Personal Seat Messages',
    summary: 'Individual envelopes at each seat containing personal memories and thank-you notes.',
    why: 'Deepens emotional connection for an intimate group of {guests} guests.',
    audienceFit: 'Deeply meaningful for close family members and lifelong friends.',
    safetyNote: 'Coordinate seating charts with venue team to verify accurate placement.',
    tags: { subFormats: ['micro_wedding'] },
  },
  {
    id: 'activity-accessible-greeting-circle',
    title: 'Step-Free Receiving Lounge',
    summary: 'Spacious seated greeting lounge allowing conversations without standing queues.',
    why: 'Ensures dignified greetings for {guests} guests of all mobilities in {setting}.',
    audienceFit: 'Thoughtful for senior family members and mobility-impaired attendees.',
    safetyNote: 'Maintain minimum 1.2-meter wide clear walkways free of cords or loose rugs.',
    tags: { requiresFlags: ['elderly_guests', 'wheelchair_access'] },
  },
  {
    id: 'activity-destination-welcome-lounge',
    title: 'Arrival Welcome Hospitality Lounge',
    summary: 'Drop-in hospitality suite with drinks, event schedules, and local advice.',
    why: 'Provides a calming greeting for {guests} guests arriving for {days} days of events.',
    audienceFit: 'Welcoming for weary travelers, families with kids, and visiting elders.',
    safetyNote: 'Ensure luggage assistance and quiet seating zones are clearly marked.',
    tags: { subFormats: ['destination'] },
  },
];

/** Cultural and contextual bespoke timeline tasks for specialized workflows. */
export const CULTURAL_WEDDING_BESPOKE: BespokeSeed[] = [
  {
    id: 'bespoke-mandap-structural-check',
    title: 'Verify Mandap Weight Bearing & Anchor Points',
    phase: 'Details',
    rationale: 'Confirm structural anchor safety and fire clearance for floral mandap with venue.',
    tags: { subFormats: ['indian_multiday'] },
  },
  {
    id: 'bespoke-interfaith-ritual-balance',
    title: 'Map Interfaith Ritual Sequence & Roles',
    phase: 'Foundations',
    rationale: 'Collaborate with ceremony officiants to ensure balanced representation of rituals.',
    tags: { subFormats: ['interfaith'] },
  },
  {
    id: 'bespoke-accessible-seating-audit',
    title: 'Audit Step-Free Routes & Priority Seating',
    phase: 'Booking',
    rationale:
      'Verify step-free pathing from arrival to ceremony and reserve accessible front seats.',
    tags: { requiresFlags: ['elderly_guests', 'wheelchair_access'] },
  },
  {
    id: 'bespoke-weather-contingency-signoff',
    title: 'Finalize Rain and Wind Contingency Triggers',
    phase: 'Booking',
    rationale: 'Define weather decision cut-offs and sidewall readiness criteria with the venue.',
    tags: { settings: ['outdoor'], seasons: ['monsoon', 'summer'] },
  },
  {
    id: 'bespoke-destination-welcome-kits',
    title: 'Assemble Arrival Welcome Packets',
    phase: 'Final Week',
    rationale:
      'Coordinate with hotel desks to distribute regional treats and schedules on check-in.',
    tags: { subFormats: ['destination'] },
  },
];
