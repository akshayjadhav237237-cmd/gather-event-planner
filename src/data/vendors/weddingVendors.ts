import type { RuleId } from '../../domain/ruleIds';

export interface VendorGuideTemplate {
  id: string;
  name: string;
  scope: string;
  questions: string[];
  requiredChecks: string[];
  contractWatchouts: string[];
  conditional?: Array<{
    ruleId: RuleId;
    questions?: string[];
    requiredChecks?: string[];
    contractWatchouts?: string[];
  }>;
}

const COND_OUTDOOR = {
  ruleId: 'OUTDOOR' as const,
  questions: ['What covered backup facility is reserved if weather prevents outdoor use?'],
  requiredChecks: ['Confirm weather backup plan and outdoor electrical safety checks'],
};

const COND_OPEN_BAR = {
  ruleId: 'OPEN_BAR' as const,
  requiredChecks: ['Verify liquor liability and local server permit verification'],
};

const COND_ACCESSIBILITY = {
  ruleId: 'ACCESSIBILITY' as const,
  questions: ['Are all guest pathways, ceremony spaces, and restrooms step-free?'],
  requiredChecks: ['Confirm step-free guest access and accessible restroom confirmation'],
};

const COND_DIETARY = {
  ruleId: 'DIETARY_CULTURAL' as const,
  questions: ['How are separate preparation areas maintained for cultural dietary meals?'],
  requiredChecks: ['Verify separate-preparation and cross-contamination check'],
};

const COND_ALLERGY = {
  ruleId: 'ALLERGY_ALERT' as const,
  questions: ['What written protocol prevents allergen cross-contact in kitchen prep?'],
  requiredChecks: ['Verify allergen labeling protocol and written allergy policy check'],
};

export const WEDDING_VENDOR_GUIDES: readonly VendorGuideTemplate[] = [
  {
    id: 'venue',
    name: 'Venue',
    scope: 'Site rental period, capacity limits, setup access, and basic facility amenities.',
    questions: [
      'What is the exact access schedule for vendor setup and post-event teardown?',
      'What is the payment milestone schedule, deposit requirement, and refund policy?',
      'What are the overtime fees per hour if the celebration runs past scheduled time?',
      'Are outside caterers and decorators allowed without supplemental venue fees?',
      'What is the contingency plan for extreme weather or unexpected power disruption?',
    ],
    requiredChecks: ['Confirm public liability insurance and noise curfew permissions'],
    contractWatchouts: ['Strict teardown deadlines with punitive hourly financial penalties'],
    conditional: [COND_OUTDOOR, COND_OPEN_BAR, COND_ACCESSIBILITY],
  },
  {
    id: 'catering',
    name: 'Catering',
    scope: 'Menu planning, food preparation, dining service, bar staff, and tableware.',
    questions: [
      'What is the per-person pricing structure and what items are included or excluded?',
      'When is the final guest headcount guarantee required before the celebration date?',
      'What is the server-to-guest ratio for plated and buffet meal services?',
      'What provisions and safe packing are made for leftover food after service?',
      'What are the cancellation, date-rescheduling, and deposit refund terms?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally'],
    contractWatchouts: ['Hidden service fees, cake-cutting surcharges, or gratuity add-ons'],
    conditional: [COND_DIETARY, COND_ALLERGY, COND_OPEN_BAR],
  },
  {
    id: 'decor_florals',
    name: 'Decor & Florals',
    scope: 'Floral arrangements, ceremony backdrop, table centerpieces, and styling hardware.',
    questions: [
      'Does the quote include delivery, complete on-site assembly, and midnight teardown?',
      'What seasonal substitutions will be made if primary flower varieties are unavailable?',
      'Are rental containers, pedestals, and arches included or billed separately?',
      'How much installation time does the floral and decor team require on-site?',
      'What is the cancellation policy and timeline for purchasing wholesale stems?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally'],
    contractWatchouts: ['Damage deposit clauses with unclear return timelines for hardware'],
    conditional: [COND_OUTDOOR],
  },
  {
    id: 'photo_video',
    name: 'Photography & Videography',
    scope: 'Ceremony and reception coverage, portraits, edited galleries, and video deliverables.',
    questions: [
      'How many total hours of coverage and how many shooters are included in the quote?',
      'What is the guaranteed turnaround timeline for preview images and full gallery delivery?',
      'Who is the designated primary photographer and what is the emergency backup plan?',
      'Are high-resolution digital image files and personal print releases included?',
      'What are the hourly overtime rates if formalities run past the contracted window?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally'],
    contractWatchouts: [
      'Image delivery timelines exceeding ninety days without milestone remedies',
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Music',
    scope: 'Musical accompaniment, DJ services, sound amplification, and MC hosting duties.',
    questions: [
      'What sound equipment, microphones, and lighting packages are included in base fee?',
      'Does the performer provide backup audio equipment on-site in case of failure?',
      'How are song playlists, do-not-play lists, and ceremony audio cues coordinated?',
      'What are the overtime fees if guests wish the music to continue past schedule?',
      'What are the electrical power, stage space, and shelter requirements?',
    ],
    requiredChecks: ['Ask for proof of any licences or insurance required locally'],
    contractWatchouts: ['Vague performer substitution clauses permitting unvetted replacements'],
    conditional: [COND_OUTDOOR],
  },
  {
    id: 'attire_beauty',
    name: 'Attire & Beauty',
    scope: 'Wedding outfits, tailoring, hair styling, makeup artistry, and trial sessions.',
    questions: [
      'Does the beauty quote include hair and makeup trials prior to wedding day?',
      'How many stylists will be dispatched on the morning to ensure on-time completion?',
      'What is the expected timeline for dress or suit tailoring and final fittings?',
      'What are the travel, early morning arrival, or on-location touch-up fees?',
      'What is the backup artist procedure if the primary stylist falls ill?',
    ],
    requiredChecks: ['Confirm sanitation protocols and clean tool practices for cosmetic tools'],
    contractWatchouts: ['Non-refundable alteration fees when fittings require multiple rounds'],
  },
  {
    id: 'ceremony_rituals',
    name: 'Ceremony & Rituals',
    scope: 'Officiant fees, ritual facilitators, cultural items, and ceremony coordination.',
    questions: [
      'Will the officiant or celebrant lead a full rehearsal before the ceremony date?',
      'How much customization is permitted for vows, cultural rituals, and guest readings?',
      'What specific ritual materials or ceremonial supplies must the couple provide?',
      'What is the required arrival time for the celebrant on the ceremony morning?',
      'What is the backup plan if the primary officiant encounters an emergency?',
    ],
    requiredChecks: ['Confirm official authority and local filing requirements in writing'],
    contractWatchouts: ['Rehearsal session fees billed separately from primary ceremony contract'],
  },
  {
    id: 'stationery_invites',
    name: 'Stationery & Invitations',
    scope: 'Save-the-dates, invitation suites, ceremony programs, menus, and place cards.',
    questions: [
      'How many rounds of digital proofs and design revisions are included?',
      'What is the production turnaround time from final proof approval to delivery?',
      'Are envelopes, envelope addressing, and assembly services included in quote?',
      'What is the minimum reorder quantity and unit cost if extra invites are needed?',
      'Can on-the-day paper goods (programs, menus) be matched to the suite design?',
    ],
    requiredChecks: [
      'Confirm physical sample proof or printed color proof approval before full run',
    ],
    contractWatchouts: ['High minimum reprint quantities and rush delivery markups for additions'],
  },
  {
    id: 'transport_stay',
    name: 'Transportation & Lodging',
    scope: 'Guest shuttles, bridal car, airport transfers, and hotel block arrangements.',
    questions: [
      'What is the minimum vehicle hire duration and what are hourly overtime rates?',
      'Are fuel surcharges, highway tolls, parking fees, and driver gratuities included?',
      'What is the contingency plan if a shuttle vehicle breaks down on route?',
      'What is the cutoff date for guests to book rooms within the discounted block?',
      'What is the financial liability or attrition penalty if the room block is unfilled?',
    ],
    requiredChecks: ['Confirm passenger transport operating licences and vehicle insurance'],
    contractWatchouts: ['Hotel attrition clauses requiring payment for unsold rooms in blocks'],
    conditional: [COND_ACCESSIBILITY],
  },
];
