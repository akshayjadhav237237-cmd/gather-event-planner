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
      `Catering protocols were updated to enforce dedicated prep areas and allergen ingredient labeling for ${ctx.guestCount} guests due to declared food or environmental allergies.`,
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
      `Catering vendor requirements were adapted to mandate certified dietary preparation procedures for the menu served to ${ctx.guestCount} guests.`,
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
      `Venue layout reviews were modified to include step-free access routes, priority seating, and accessible facilities for ${ctx.guestCount} guests.`,
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
      `Timeline schedules were expanded into segmented ceremonial sub-runs and stage turnaround buffers across ${ctx.guestCount} guests over multiple event segments.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.SURPRISE_PARTY,
    severity: 'info',
    targetModule: 'timeline',
    signalLabel: 'Surprise event logistics and secrecy',
    trigger: (ctx) => ctx.subFormat === 'surprise',
    explain: (ctx) =>
      `Guest arrival timelines and guest-of-honor diversion schedules were synchronized 30 minutes before reveal time for ${ctx.guestCount} attendees.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.COMMUNITY_PUBLIC_EVENT,
    severity: 'info',
    targetModule: 'safety',
    signalLabel: 'Public community event management',
    trigger: (ctx) => ctx.eventType === 'community',
    explain: (ctx) =>
      `Municipal liaison checkpoints, volunteer marshalling, and general public safety protocols were scheduled to coordinate ${ctx.guestCount} attendees.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.SPONSORSHIP,
    severity: 'info',
    targetModule: 'budget',
    signalLabel: 'Sponsorship deliverables and offset',
    trigger: (ctx) => ctx.flags.includes('sponsorship_needed'),
    explain: (ctx) =>
      `Revenue milestones and sponsor deliverable tracking were added to the budget framework supporting ${formatCurrency(ctx.totalBudget, ctx.currency)} in overall planned commitments.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.OPEN_BAR,
    severity: 'info',
    targetModule: 'vendor',
    signalLabel: 'Open bar liquor service and liability',
    trigger: (ctx) => ctx.flags.includes('open_bar') && ctx.guestCount >= 50,
    explain: (ctx) =>
      `Licensed bartending vendor verifications, liquor liability insurance reviews, and safe transit provisions were added for ${ctx.guestCount} guests.`,
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
      `Sound curfew cutoffs and neighbor notification milestones were scheduled into the timeline for ${ctx.guestCount} guests to comply with local residential noise standards.`,
    contingencyDelta: 0,
  },
];
