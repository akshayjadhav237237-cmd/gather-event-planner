import { RULE_IDS } from '../domain/ruleIds';
import { formatCurrency } from '../utils/currency';
import type { DecisionRule } from './decisionRulesCore';

export const DECISION_RULES_CONTEXT: readonly DecisionRule[] = [
  {
    id: RULE_IDS.ALLERGY_ALERT,
    severity: 'warning',
    targetModule: 'safety',
    signalLabel: 'Allergen cross-contamination risk',
    trigger: (ctx) =>
      ctx.flags.includes('nut_allergy') ||
      ctx.flags.includes('latex_allergy') ||
      ctx.flags.includes('gluten_free'),
    explain: (ctx) =>
      `An allergen briefing slot, catering review milestone, and vendor verification checks were added due to declared allergies across ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.DIETARY_CULTURAL,
    severity: 'info',
    targetModule: 'vendor',
    signalLabel: 'Specialized dietary or cultural catering',
    trigger: (ctx) =>
      ctx.flags.includes('vegan') ||
      ctx.flags.includes('vegetarian') ||
      ctx.flags.includes('jain') ||
      ctx.flags.includes('halal'),
    explain: (ctx) =>
      `A dietary preparation milestone and catering guide checks were added to safeguard menu standards for ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.ACCESSIBILITY,
    severity: 'info',
    targetModule: 'safety',
    signalLabel: 'Guest accessibility and inclusion needs',
    trigger: (ctx) =>
      ctx.flags.includes('wheelchair_access') ||
      ctx.flags.includes('elderly_guests') ||
      ctx.flags.includes('sensory_friendly'),
    explain: (ctx) =>
      `A step-free access milestone, vendor checks, and 10-minute transition buffers on all day-of schedule slots were added for ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.MULTI_CEREMONY,
    severity: 'info',
    targetModule: 'timeline',
    signalLabel: 'Multi-ceremony wedding timeline',
    trigger: (ctx) =>
      ctx.eventType === 'wedding' &&
      (ctx.subFormat === 'indian_multiday' || ctx.flags.includes('multi_ceremony')),
    explain: (ctx) =>
      `A transition logistics milestone was added to the timeline to coordinate ritual staging across multiple ceremonies for ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.SURPRISE_PARTY,
    severity: 'info',
    targetModule: 'timeline',
    signalLabel: 'Surprise event logistics and secrecy',
    trigger: (ctx) => ctx.subFormat === 'surprise',
    explain: (ctx) =>
      `Secret arrival, hiding, and reveal slots were added to the day-of schedule alongside a covert coordination milestone for ${ctx.guestCount} attendees.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.COMMUNITY_PUBLIC_EVENT,
    severity: 'info',
    targetModule: 'safety',
    signalLabel: 'Public community event management',
    trigger: (ctx) => ctx.eventType === 'community',
    explain: (ctx) =>
      `A municipal permits milestone and a pre-opening safety briefing slot were added to coordinate logistics for ${ctx.guestCount} attendees.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.SPONSORSHIP,
    severity: 'info',
    targetModule: 'budget',
    signalLabel: 'Sponsorship deliverables and offset',
    trigger: (ctx) => ctx.flags.includes('sponsorship_needed'),
    explain: (ctx) =>
      `A sponsor banner placement and booth setup milestone was added to the timeline supporting ${formatCurrency(ctx.totalBudget, ctx.currency)} in overall planned commitments.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.OPEN_BAR,
    severity: 'info',
    targetModule: 'vendor',
    signalLabel: 'Open bar liquor service and liability',
    trigger: (ctx) => ctx.flags.includes('open_bar') && ctx.guestCount >= 50,
    explain: (ctx) =>
      `Vendor liquor liability checks, a safe transit planning milestone, and a day-of bar last-call slot were added for ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.AMPLIFIED_MUSIC_RESIDENTIAL,
    severity: 'warning',
    targetModule: 'timeline',
    signalLabel: 'Residential amplified sound and quiet hours',
    trigger: (ctx) =>
      ctx.flags.includes('amplified_music') && ctx.flags.includes('residential_venue'),
    explain: (ctx) =>
      `A volume curfew planning milestone and a 21:30 acoustic wind-down were scheduled into the timeline and run-of-show for ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
];
