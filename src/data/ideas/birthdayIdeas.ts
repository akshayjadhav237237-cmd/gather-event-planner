import type {
  ActivitySeed,
  BespokeSeed,
  CateringSeed,
  IdeaBank,
  SeedTags,
  ThemeSeed,
} from '../../ai/ideaSeedTypes';
import type { BudgetTier } from '../../types/engine';
import type { ContextFlag, Season, SubFormat, VenueSetting } from '../../types/event';

function parseTags(tagStr?: string): SeedTags | undefined {
  if (!tagStr || !tagStr.trim()) return undefined;
  const tags: SeedTags = {};
  for (const part of tagStr.split(';')) {
    const [k, v] = part.split(':').map((s) => s.trim());
    if (!k || !v) continue;
    const vals = v.split(',').map((s) => s.trim());
    if (k === 'subFormats') tags.subFormats = vals as SubFormat[];
    if (k === 'settings') tags.settings = vals as VenueSetting[];
    if (k === 'seasons') tags.seasons = vals as Season[];
    if (k === 'budgetTiers') tags.budgetTiers = vals as BudgetTier[];
    if (k === 'requiresFlags') tags.requiresFlags = vals as ContextFlag[];
    if (k === 'excludesFlags') tags.excludesFlags = vals as ContextFlag[];
  }
  return tags;
}

function parseTheme(row: string): ThemeSeed {
  const [id, title, summary, why, colors, tagStr] = row.split('|').map((s) => s.trim());
  const [c1, c2, c3] = (colors ?? '').split(',').map((s) => s.trim());
  const tags = parseTags(tagStr);
  return tags
    ? {
        id: id ?? '',
        title: title ?? '',
        summary: summary ?? '',
        why: why ?? '',
        colorPalette: [c1 ?? '#000000', c2 ?? '#000000', c3 ?? '#000000'],
        tags,
      }
    : {
        id: id ?? '',
        title: title ?? '',
        summary: summary ?? '',
        why: why ?? '',
        colorPalette: [c1 ?? '#000000', c2 ?? '#000000', c3 ?? '#000000'],
      };
}

function parseCatering(row: string): CateringSeed {
  const [id, title, summary, why, note, swap, tagStr] = row.split('|').map((s) => s.trim());
  const tags = parseTags(tagStr);
  return tags
    ? {
        id: id ?? '',
        title: title ?? '',
        summary: summary ?? '',
        why: why ?? '',
        allergySafetyNote: note ?? '',
        budgetSwapIdea: swap ?? '',
        tags,
      }
    : {
        id: id ?? '',
        title: title ?? '',
        summary: summary ?? '',
        why: why ?? '',
        allergySafetyNote: note ?? '',
        budgetSwapIdea: swap ?? '',
      };
}

function parseActivity(row: string): ActivitySeed {
  const [id, title, summary, why, fit, safety, tagStr] = row.split('|').map((s) => s.trim());
  const tags = parseTags(tagStr);
  return tags
    ? {
        id: id ?? '',
        title: title ?? '',
        summary: summary ?? '',
        why: why ?? '',
        audienceFit: fit ?? '',
        safetyNote: safety ?? '',
        tags,
      }
    : {
        id: id ?? '',
        title: title ?? '',
        summary: summary ?? '',
        why: why ?? '',
        audienceFit: fit ?? '',
        safetyNote: safety ?? '',
      };
}

function parseBespoke(row: string): BespokeSeed {
  const [id, title, phase, rationale, tagStr] = row.split('|').map((s) => s.trim());
  const tags = parseTags(tagStr);
  return tags
    ? { id: id ?? '', title: title ?? '', phase: phase ?? '', rationale: rationale ?? '', tags }
    : { id: id ?? '', title: title ?? '', phase: phase ?? '', rationale: rationale ?? '' };
}

const THEME_ROWS = [
  'bday-th-bright | Vibrant Confetti Festivity | Cheerful colorful accents and joyful celebration lighting | Enlivens {setting} celebration for {guests} guests across {season} | #ff595e,#ffca3a,#8ac926',
  'bday-th-picnic | Sunlit Garden Gathering | Natural timber textures, fresh floral arrangements, and warm lights | Complements relaxing {setting} birthday party for {guests} guests | #2a9d8f,#e76f51,#264653',
  'bday-th-monochrome | Contemporary Chic Minimalist | Crisp monochrome styling with brushed metallic accents | Offers sleek aesthetics for {guests} guests with {tier} efficiency | #212529,#6c757d,#f8f9fa',
  'bday-th-toddler | Gentle Pastel Animal Safari | Soft plush textures and pastel latex-free balloon alternatives | Creates calming wonderland for {guests} guests in {setting} | #b8e0d2,#d6eadf,#eac4d5 | subFormats:kids_1_3',
  'bday-th-kids-quest | Adventure Explorer Expedition | Compass motifs, explorer maps, and treasure hunt decor | Delights energetic {guests} guests during {season} celebration | #1d3557,#457b9d,#a8dadc | subFormats:kids_4_12',
  'bday-th-teen-lounge | Neon Twilight Social Lounge | Ambient LED uplighting, modular lounge seating, and photo backdrops | Sets immersive backdrop for {guests} guests in {setting} | #7209b7,#3a0ca3,#4cc9f0 | subFormats:teen',
  'bday-th-adult-gold | Milestone Golden Radiance | Refined warm metallic palette with elegant ambient candlelight | Elevates milestone celebration for {guests} guests in {setting} | #d4af37,#1b1b1e,#f5f3e9 | subFormats:adult_milestone',
  'bday-th-surprise | Secret Midnight Masquerade | Dramatic concealed entrance drapery and shimmering silver accents | Heightens anticipation for {guests} guests at surprise {event} | #0d1b2a,#415a77,#e0e1dd | subFormats:surprise',
  'bday-th-streamers | Pastel Paper Honeycomb Haven | Eco-friendly honeycomb paper globes and colorful streamers | Maximizes visual impact for {guests} guests with {tier} budget | #f4a261,#e76f51,#e9c46a | budgetTiers:tight',
  'bday-th-meadow | Open-Air Meadow Festivity | Flowing linen canopies and wildflower arrangements | Optimizes comfort for {guests} guests in an {setting} space | #588157,#3a5a40,#dad7cd | settings:outdoor',
];

const CATERING_ROWS = [
  'bday-cat-grazing | Artisan Grazing & Tapas Station | Multi-level platters of cured meats, artisanal cheeses, and fruits | Offers flexible grazing for {guests} guests in {setting} | Provide clearly marked gluten-free and dairy-free platters | Swap specialty imported items for seasonal domestic produce',
  'bday-cat-sliders | Gourmet Mini Sliders & Flatbreads | Freshly grilled petite burgers, herb flatbreads, and crisp fries | Provides crowd-pleasing dining for {guests} guests in {season} | Maintain designated vegetarian and nut-free prep surface | Feature plant-based patties alongside beef to manage costs',
  'bday-cat-dessert | Sweet Celebration Dessert Bar | Assortment of petite pastries, fruit tarts, and dessert bites | Delights {guests} guests concluding their {event} celebration | Individual allergen ingredient markers displayed at each tray | Replace multi-tier custom treats with assorted sheet-baked bites',
  'bday-cat-toddler | Toddler Finger Foods & Parent Corner | Choking-safe soft fruit slices and parent refreshment espresso bar | Nourishes {guests} guests while parents enjoy relaxing coffee | Ensure all toddler items are cut to choking-safe dimensions | Offer self-serve parent coffee and batch-steamed finger foods | subFormats:kids_1_3',
  'bday-cat-cupcakes | DIY Cupcake & Cookie Workshop Bar | Nut-free vanilla cupcakes with frosting tubes and topping sprinkles | Engages {guests} guests in hands-on culinary fun in {setting} | Strict nut-free facility guarantee with allergy labels | Bake single-flavor cupcake bases and purchase bulk fruit toppings | subFormats:kids_4_12',
  'bday-cat-mocktails | Handcrafted Botanical Mocktail Bar | Sparkling fruit fusions, herb-infused syrups, and garnish station | Keeps {guests} guests refreshed with trendy drinks in {setting} | Post full ingredient cards for fresh fruit purées and syrups | Use house-infused club soda bases instead of specialty imports | subFormats:teen',
  'bday-cat-pairing | Sommelier Craft Beverage Flight | Curated craft beverage tastings paired with gourmet small bites | Elevates adult milestone celebration for {guests} guests | Clearly label vegetarian and seafood allergen components | Feature regional craft breweries and boutique vineyards | subFormats:adult_milestone',
  'bday-cat-canapes | Stealth Quiet-Service Canapés | Silent finger food service requiring no loud dishware clatter | Enables seamless secret staging for {guests} guests | Keep sealed allergen-specific appetizer boxes ready for guests | Serve chilled gourmet skewers to avoid hot chafing equipment | subFormats:surprise',
  'bday-cat-pasta | Family-Style Baked Pasta & Crisp Salad | Oven-baked artisanal pasta pans, garlic focaccia, and garden salad | Generously feeds {guests} guests while honoring {tier} budget | Prepare separate gluten-free pasta tray in dedicated cookware | Bulk dry pasta and seasonal garden greens offer top efficiency | budgetTiers:tight',
  'bday-cat-allergen | Certified Allergen-Free Platter Suite | Dedicated peanut-free, tree-nut-free, and gluten-free banquet buffet | Guarantees complete peace of mind for {guests} guests | Separate prep zone with sealed lids and dedicated server tongs | Utilize naturally allergen-free grains such as rice and quinoa | requiresFlags:nut_allergy,gluten_free',
];

const ACTIVITY_ROWS = [
  'bday-act-booth | Memory Keepsake Portrait Booth | Open-air photo station with festive props and instant prints | Creates lasting keepsakes for {guests} guests in {setting} | Multi-generational fun suited for friends and extended family | Tape power cables securely away from walking paths',
  'bday-act-trivia | Celebratory Decades Music Trivia | Hosted interactive music trivia covering favorite family anthems | Sparks enthusiastic participation for {guests} guests | Welcoming team play format for mixed-age friend groups | Ensure audio volume permits comfortable conversation',
  'bday-act-mural | Group Birthday Wish Wall & Mural | Large canvas where attendees sign messages and contribute artwork | Deepens personal connection for {guests} guests at {event} | Accessible and intuitive for attendees of every generation | Use non-toxic washable ink markers and stable easel stands',
  'bday-act-toddler | Choking-Safe Sensory Play Meadow | Water bubble mats, soft stacking foam cubes, and plush play areas | Captivates young toddlers among {guests} guests safely | Specially scaled for toddlers aged 1 to 3 and caregivers | All sensory items certified choking-safe with adult oversight | subFormats:kids_1_3',
  'bday-act-quest | Interactive Treasure Clue Trail | Themed treasure hunt with rhyming clues and activity game stations | Keeps {guests} guests actively engaged throughout the {event} | Ideal for school-age children working in small teams | Keep search paths within fenced perimeter away from steps | subFormats:kids_4_12',
  'bday-act-social | Social Media Video & Portrait Corner | Ring-light portrait station with dynamic backdrops and fun lenses | Empowers {guests} guests to capture social media memories | Tailored for teenagers and tech-savvy young partygoers | Secure light stands with sandbags to prevent tipping | subFormats:teen',
  'bday-act-retro | Curated Life Retrospective Projection | Chronological photo projection and heartfelt family tributes | Honors lifetime milestones surrounded by {guests} guests | Moving storytelling format for lifelong friends and family | Dim room lighting safely while keeping emergency exits lit | subFormats:adult_milestone',
  'bday-act-reveal | Synchronized Surprise Reveal & Confetti | Coordinated countdown cue with confetti cannon and celebration song | Delivers unforgettable surprise moment for {guests} guests | Thrilling experience for celebrant and all assembled guests | Ensure celebrant path is clear of tripping hazards before cue | subFormats:surprise',
  'bday-act-diy | DIY Honoree Trivia & Lawn Games | Customized friend trivia quiz paired with casual lawn games | Entertains {guests} guests with zero equipment rental costs | Great for casual peer groups and multi-age gatherings | Keep lawn game tossing zones distanced from dining tables | budgetTiers:tight',
  'bday-act-lawn | Giant Lawn Games & Garden Relay | Oversized wooden stacking blocks, cornhole boards, and croquet | Fosters friendly play among {guests} guests in {setting} | Engaging for mixed adult and family groups outdoors | Position playing zones on level, dry grass lawns | settings:outdoor',
];

const BESPOKE_ROWS = [
  'bday-bes-rsvp | Audit Guest RSVPs and Dietary Preferences | Details | Reviews confirmed dietary requirements to align menu portions for {guests} guests.',
  'bday-bes-cake | Confirm Bakery Cake Schedule & Cold Storage | Booking | Verifies arrival window and on-site refrigeration capacity for celebratory cake.',
  'bday-bes-toasts | Sequence Toast Cues & Background Playlist | Final Week | Coordinates microphone schedule and background playlist transitions with the host.',
  'bday-bes-nap | Align Party Timeline with Toddler Nap Windows | Foundations | Ensures party hours avoid toddler meltdown windows and designates quiet nursing rest area. | subFormats:kids_1_3',
  'bday-bes-hunt | Assemble Treasure Clue Kits & Station Props | Details | Pre-prints clue envelopes and prepares game station prize bags ahead of party day. | subFormats:kids_4_12',
  'bday-bes-lights | Test Lounge Uplighting & Audio Playlist | Final Week | Programs ambient LED wash fixtures and collaborative teen music queue before guests arrive. | subFormats:teen',
  'bday-bes-album | Compile Milestone Photo Retrospective & Album | Details | Collects archival family photographs and video messages for milestone honoree tribute. | subFormats:adult_milestone',
  'bday-bes-brief | Dispatch Staggered Arrival & Secret Staging Brief | Final Week | Briefs attendees on arrival cut-off times, parking locations, and quiet staging room protocols. | subFormats:surprise',
  'bday-bes-weather | Sign Off on Outdoor Canopy & Weather Contingency | Booking | Confirms canopy shelter reserves, rain backup layout, and sun protection for open-air venue. | settings:outdoor',
  'bday-bes-allergy | Inspect Allergen Manifests & Prep Separation | Details | Verifies caterer protocols for strict cross-contact prevention across nut and gluten allergens. | requiresFlags:nut_allergy,gluten_free',
];

/** Curated birthday celebration idea bank containing themes, catering, activities, and bespoke tasks. */
export const BIRTHDAY_BANK: IdeaBank = {
  themes: THEME_ROWS.map(parseTheme),
  catering: CATERING_ROWS.map(parseCatering),
  activities: ACTIVITY_ROWS.map(parseActivity),
  bespoke: BESPOKE_ROWS.map(parseBespoke),
};
