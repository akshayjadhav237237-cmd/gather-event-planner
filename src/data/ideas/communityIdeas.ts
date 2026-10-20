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
  'comm-th-civic | Civic Unity Heritage Pavilion | Dignified civic banners, modular staging, and community pride heraldry | Welcomes {guests} community members in {setting} during {season} | #1d3557,#457b9d,#f1faee',
  'comm-th-green | Sustainable Green Commons | Living potted foliage, upcycled timber furniture, and solar lanterns | Fosters eco-conscious fellowship for {guests} guests in {setting} | #2d6a4f,#52b788,#d8f3dc',
  'comm-th-canopy | Open-Air Community Fair Canopy | Clean canvas pavilions, warm festoon lighting, and festive pennants | Invites widespread attendance across {season} for {guests} guests | #e07a5f,#3d405b,#81b29a',
  'comm-th-carnival | Vibrant Street Arts Carnival | Dynamic carnival drapery, street performer hubs, and bold color flags | Energizes {guests} visitors during festive community {event} | #d90429,#ef233c,#ffb703 | subFormats:festival',
  'comm-th-gala | Benevolent Horizon Charity Gala | Elegant midnight drapery, golden donor pillars, and spotlight accents | Inspires generosity among {guests} patrons with {tier} budget dignity | #14213d,#fca311,#e5e5e5 | subFormats:fundraiser',
  'comm-th-block | Welcoming Neighborhood Commons | Cheerful bunting, communal picnic benches, and lawn game stations | Fosters friendly neighbor bonds for {guests} residents in {setting} | #3a86ff,#ff006e,#ffbe0b | subFormats:neighborhood',
  'comm-th-heritage | Global Heritage Discovery Commons | Multi-nation flags, cultural display booths, and interactive map boards | Celebrates diverse cultural roots for {guests} students and families | #0077b6,#00b4d8,#90e0ef | subFormats:school_cultural',
  'comm-th-accessible | Inclusive Step-Free Gathering Hub | Wide paved walkways, sensory-calm rest lounges, and high-contrast signage | Ensures complete accessibility for {guests} attendees in {setting} | #495057,#6c757d,#ced4da | requiresFlags:wheelchair_access,sensory_friendly',
  'comm-th-sponsor | Civic Sponsor & Partner Promenade | Integrated corporate sponsor display towers and hospitality marquees | Promotes valued civic partnerships for {guests} guests in {setting} | #003049,#d62828,#fdf0d5 | requiresFlags:sponsorship_needed',
  'comm-th-grassroots | Community Grassroots Pavilion | Volunteer-crafted fabric banners and shared community picnic layout | Delivers high communal spirit for {guests} attendees within {tier} budget | #588157,#a3b18a,#dad7cd | budgetTiers:tight',
];

const CATERING_ROWS = [
  'comm-cat-potluck | Coordinated Community Potluck Hub | Covered communal serving stations with temperature-controlled warming trays | Feeds {guests} attendees through shared neighborhood contributions | Maintain strict dietary ingredient index cards with allergen stickers | Encourage family dish contributions to stretch event hospitality budget',
  'comm-cat-produce | Local Harvest Farm Tasting Table | Seasonal farmer produce tasting platters, fresh stone fruit, and sourdough | Showcases regional growers for {guests} visitors in {season} | Individual labeling for dairy-free and gluten-free bread options | Partner with local farmer cooperatives for wholesale seasonal rates',
  'comm-cat-bakery | Communal Tea & Heritage Bakery Bar | Freshly baked breads, regional tea selections, and baked pastries | Offers warm hospitality for {guests} guests during morning hours | Clearly separate nut-free baked goods in sealed display domes | Source morning pastries from neighborhood bakeries in bulk batches',
  'comm-cat-trucks | Curated Food Truck Food Court | Diverse licensed mobile food trucks offering global culinary options | Satisfies diverse culinary tastes for {guests} festival attendees | Require each food truck to display audited allergen safety certificates | Establish concession revenue-share model to eliminate upfront catering outlay | subFormats:festival',
  "comm-cat-reception | Philanthropic Reception Canapé Service | Sophisticated hors d'oeuvres passed by professional banquet staff | Impresses distinguished donors supporting the community {event} | Pre-package certified allergen-safe tasting plates for guests | Select high-impact seasonal ingredients rather than exotic imports | subFormats:fundraiser",
  'comm-cat-cookout | Neighborhood Community Cookout | Grilled farm sausages, roasted sweet corn, and crisp vegetable slaws | Brings {guests} neighbors together for satisfying outdoor dining | Designate separate dedicated grill for vegetarian and halal items | Encourage neighborhood potluck sides to complement core grilled meats | subFormats:neighborhood',
  'comm-cat-global | Heritage International Food Pavilions | Parent and student culinary stalls featuring regional heritage delicacies | Educates and delights {guests} attendees through authentic cuisines | Label every home-style dish with complete written allergen manifests | Volunteer family food contributions provide authentic culinary variety | subFormats:school_cultural',
  'comm-cat-hydration | Free Potable Water & Hydration Stations | Filtered water refill kiosks with fresh lemon and electrolyte options | Keeps {guests} attendees safely hydrated throughout {season} outdoors | Dedicated allergen-free fruit garnish prep to prevent contamination | Partner with municipal water utility for mobile refill tanker | settings:outdoor',
  'comm-cat-seated | Step-Free Seated Hospitality Lounge | Dedicated low-counter refreshment service with direct table delivery | Ensures dignified dining access for {guests} guests in {setting} | Dedicated gluten-free and diabetic-friendly snacks readily available | Bulk-sourced healthy dried fruits and whole grain crackers | requiresFlags:elderly_guests,wheelchair_access',
  'comm-cat-beans | Hearty Community Bean & Rice Banquet | Large-batch slow-simmered three-bean chili with cornbread muffins | Heartily nourishes {guests} community members on {tier} budget | Naturally gluten-free and vegan recipe cards posted clearly | Sourcing dry beans and rice in bulk yields lowest per-head cost | budgetTiers:tight',
];

const ACTIVITY_ROWS = [
  'comm-act-stage | Civic Talent & Cultural Open Stage | Community stage hosting neighborhood musicians, choirs, and speakers | Entertains {guests} attendees during festive community gathering | Broad multi-generational appeal for families and neighbors | Secure electrical cables with rubber ramps and cap stage volume',
  'comm-act-mural | Neighborhood Story Canvas & Mural | Shared community canvas where participants paint local history motifs | Unites {guests} participants in collaborative creative expression | Open for children, teens, and adults of all skill levels | Provide non-toxic washable acrylics and protective smocks',
  'comm-act-swap | Seed & Paperback Community Exchange | Community swap circle for garden seeds, saplings, and favorite books | Engages {guests} neighbors in eco-friendly community sharing | Suitable for all generations from avid gardeners to book lovers | Keep table aisles wide to ensure smooth wheelchair passage',
  'comm-act-troubadours | Roving Street Troubadours & Puppeteers | Street jugglers, stilt artists, and interactive cultural brass ensemble | Captivates {guests} visitors along festival pedestrian avenues | Delightful family entertainment across children and adults | Maintain designated performer clearance circles among moving crowds | subFormats:festival',
  'comm-act-auction | Silent Auction & Beneficiary Impact Tour | Curated charity auction displays and video presentation of mission | Inspires philanthropic support among {guests} patrons | Tailored for donors, civic leaders, and corporate sponsors | Keep bid display corridors well lit and step-free | subFormats:fundraiser',
  'comm-act-games | Inter-Street Friendly Field Games | Classic sack races, trivia quiz stations, and street chalk art | Builds neighborhood camaraderie for {guests} local residents | Welcoming team games for kids, parents, and older neighbors | Designate game zones away from moving vehicles and paved curbs | subFormats:neighborhood',
  'comm-act-parade | Student Heritage Costume & Flag Pageant | Vibrant parade celebrating ancestral folklore, costumes, and music | Celebrates multi-cultural heritage among {guests} attendees | Engaging school showcase for students, parents, and educators | Stage parade along level, well-marshaled pedestrian pathways | subFormats:school_cultural',
  'comm-act-viewing | Step-Free Priority Viewing Pavilion | Reserved shaded front seating pavilion with audio loop and clear stage sightlines | Guarantees accessible enjoyment for {guests} community members | Welcoming space for mobility-challenged guests and older adults | Keep clear 1.5-meter step-free access paths and stable ground | requiresFlags:elderly_guests,wheelchair_access',
  'comm-act-volunteer | Volunteer Appreciation & Civic Awards | Public ceremony honoring dedicated community volunteers and leaders | Honors civic contributions in front of {guests} attendees | Heartwarming moment for civic volunteers, sponsors, and citizens | Keep presentation concise and provide comfortable seating',
  'comm-act-scavenger | Community Historical Walking Quest | Self-guided heritage walking tour with historical trivia questions | Educates {guests} participants about local neighborhood landmarks | Fun self-paced discovery for families and walking groups | Route follows public footpaths with safe street crossings | budgetTiers:tight',
];

const BESPOKE_ROWS = [
  'comm-bes-permits | Secure Municipal Park & Public Space Permits | Foundations | Submits civic event notifications and venue permits to municipal authorities.',
  'comm-bes-waste | Establish Paired Waste & Recycling Stations | Booking | Arranges color-coded recycling, compost, and landfill receptacles near food areas.',
  'comm-bes-signage | Install Clear Wayfinding & Program Timetables | Final Week | Positions high-contrast signage for entrances, restrooms, and schedule highlights.',
  'comm-bes-curfew | Review Decibel Limits & Sound Curfew Timelines | Booking | Verifies sound compliance and microphone distribution with civic acoustic guidelines. | subFormats:festival',
  'comm-bes-sponsors | Fabricate Sponsor Recognition Displays & Banners | Booking | Verifies corporate logo placements and VIP reception hospitality details. | subFormats:fundraiser',
  'comm-bes-closure | Distribute Street Closure Notices to Neighbors | Foundations | Delivers printed flyers and traffic detour advisories to neighboring households. | subFormats:neighborhood',
  'comm-bes-roster | Draft Volunteer Logistics & Shift Handover Rosters | Details | Assigns volunteer team leaders to greeting, registration, and hospitality stations. | subFormats:school_cultural',
  'comm-bes-audit | Audit Step-Free Pathways & Restroom Clearances | Details | Inspects wheelchair ramps, step-free routes, and accessible restroom facilities. | requiresFlags:elderly_guests,wheelchair_access',
  'comm-bes-water | Position Potable Water Refill Stations & Signage | Details | Confirms municipal water connection points and stocks disposable compostable cups. | settings:outdoor',
  'comm-bes-briefing | Conduct Event-Day Volunteer Logistics Briefing | Event Day | Holds early morning huddle to review radio channels, safety guidelines, and rosters.',
];

/** Curated community celebration idea bank containing themes, catering, activities, and bespoke tasks. */
export const COMMUNITY_BANK: IdeaBank = {
  themes: THEME_ROWS.map(parseTheme),
  catering: CATERING_ROWS.map(parseCatering),
  activities: ACTIVITY_ROWS.map(parseActivity),
  bespoke: BESPOKE_ROWS.map(parseBespoke),
};
