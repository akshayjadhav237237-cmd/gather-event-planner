import { RULE_IDS, type RuleId } from '../domain/ruleIds';
import type { ContextSignals } from '../types/engine';
import type { EventContext, Severity, TargetModule } from '../types/event';
import { formatCurrency } from '../utils/currency';

export interface DecisionRule {
  id: RuleId;
  severity: Severity | ((ctx: EventContext, s: ContextSignals) => Severity);
  targetModule: TargetModule;
  signalLabel: string;
  trigger: (ctx: EventContext, s: ContextSignals) => boolean;
  explain: (ctx: EventContext, s: ContextSignals) => string;
  contingencyDelta?: number;
}

export const DECISION_RULES_CORE: readonly DecisionRule[] = [
  {
    id: RULE_IDS.PAST_DATE,
    severity: 'critical',
    targetModule: 'timeline',
    signalLabel: 'Event date is in the past',
    trigger: (_ctx, s) => s.isPast,
    explain: (ctx, s) =>
      `Schedule milestones were locked as overdue because scheduled date ${ctx.eventDate} was ${Math.abs(s.daysUntilEvent)} day(s) ago.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.SHORT_NOTICE,
    severity: 'warning',
    targetModule: 'timeline',
    signalLabel: 'Short planning window',
    trigger: (_ctx, s) => s.isShortNotice,
    explain: (_ctx, s) =>
      `Timeline was compressed into fast-track booking milestones with an added 2% contingency buffer because only ${s.daysUntilEvent} day(s) remain before the event.`,
    contingencyDelta: 0.02,
  },
  {
    id: RULE_IDS.TIGHT_PER_HEAD,
    severity: (_ctx, s) => (s.perGuestBudget < s.floorPerGuest / 2 ? 'critical' : 'warning'),
    targetModule: 'budget',
    signalLabel: 'Per-guest budget below floor',
    trigger: (_ctx, s) => s.isBelowFloor,
    explain: (ctx, s) =>
      `Budget allocations prioritized core hospitality items because estimated ${formatCurrency(s.perGuestBudget, ctx.currency)} per head is below the heuristic floor of ${formatCurrency(s.floorPerGuest, ctx.currency)} across ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.MICRO_EVENT,
    severity: 'info',
    targetModule: 'budget',
    signalLabel: 'Micro-event guest count',
    trigger: (_ctx, s) => s.isMicroEvent,
    explain: (ctx) =>
      `Budget category weightings shifted to absorb fixed vendor minimums because an intimate group of ${ctx.guestCount} guests carries higher fixed overhead per attendee.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.LARGE_CROWD,
    severity: 'warning',
    targetModule: 'safety',
    signalLabel: 'Large crowd attendance',
    trigger: (_ctx, s) => s.isLargeCrowd,
    explain: (ctx) =>
      `Crowd management checklists and safety exit protocols were added with a 2% contingency buffer because managing ${ctx.guestCount} guests requires structured ingress and egress controls.`,
    contingencyDelta: 0.02,
  },
  {
    id: RULE_IDS.YOUNG_KIDS,
    severity: 'warning',
    targetModule: 'safety',
    signalLabel: 'Toddlers and young children present',
    trigger: (_ctx, s) => s.hasYoungKids,
    explain: (ctx) =>
      `Childproofing safety checkpoints and quiet rest zones were introduced because this event for ${ctx.guestCount} guests accommodates young children aged 1-3.`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.SCHOOL_KIDS,
    severity: 'info',
    targetModule: 'safety',
    signalLabel: 'School-age children present',
    trigger: (_ctx, s) => s.hasSchoolKids,
    explain: (ctx) =>
      `Structured activity rotations and adult supervision checkpoints were established because entertaining ${ctx.guestCount} guests includes active school-age children (4-12).`,
    contingencyDelta: 0,
  },
  {
    id: RULE_IDS.OUTDOOR,
    severity: 'warning',
    targetModule: 'safety',
    signalLabel: 'Outdoor venue exposure',
    trigger: (_ctx, s) => s.isOutdoorExposed,
    explain: (ctx) =>
      `Weather contingency plans and shelter backup provisions were activated with a 3% reserve delta because this ${ctx.setting} venue setup exposes ${ctx.guestCount} guests to outdoor elements.`,
    contingencyDelta: 0.03,
  },
  {
    id: RULE_IDS.HOT_OR_WET_SEASON,
    severity: 'warning',
    targetModule: 'safety',
    signalLabel: 'Extreme seasonal weather risk',
    trigger: (ctx, s) =>
      s.isOutdoorExposed && (ctx.season === 'summer' || ctx.season === 'monsoon'),
    explain: (ctx) =>
      `Hydration stations and rapid rain shelter measures were scheduled because an exposed outdoor or hybrid setting during ${ctx.season} poses climate risks for ${ctx.guestCount} guests.`,
    contingencyDelta: 0,
  },
];
