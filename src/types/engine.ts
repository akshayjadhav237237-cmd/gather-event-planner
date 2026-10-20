import type {
  BudgetBreakdown,
  ContextAdaptation,
  EventContext,
  EventType,
  SubFormat,
  TaskPriority,
  TimelinePlan,
  VendorCategoryGuide,
} from './event';

export type BudgetTier = 'tight' | 'moderate' | 'generous';

export interface ContextSignals {
  daysUntilEvent: number; // signed: daysBetween(today, eventDate)
  isPast: boolean; // daysUntilEvent < 0
  isShortNotice: boolean; // 0 <= daysUntilEvent < COMPRESSED_THRESHOLD_DAYS
  perGuestBudget: number; // Math.floor(totalBudget / guestCount)
  floorPerGuest: number; // getPerHeadFloor(eventType, currency)
  isBelowFloor: boolean; // perGuestBudget < floorPerGuest
  budgetTier: BudgetTier; // below floor = tight; below 2x floor = moderate; else generous
  isMicroEvent: boolean; // guestCount < 50
  isLargeCrowd: boolean; // guestCount >= 1000
  isOutdoorExposed: boolean; // setting is 'outdoor' or 'hybrid'
  hasYoungKids: boolean; // subFormat === 'kids_1_3'
  hasSchoolKids: boolean; // subFormat === 'kids_4_12'
}

export interface DecisionResult {
  adaptations: ContextAdaptation[]; // ordered critical, warning, info; ties by rule order
  activeRuleIds: string[]; // same order as adaptations
  contingencyDelta: number; // sum of active rule deltas, as a fraction
}

export interface TaskTemplate {
  id: string;
  title: string;
  phase: string;
  daysBefore: number; // ideal offset before event date, integer >= 0
  priority: TaskPriority;
  dependsOn: string[];
  optional: boolean;
  rationale: string;
  eventTypes: EventType[]; // which event types include it
  subFormats?: SubFormat[]; // if present, restrict to these sub-formats
  injectedBy?: string; // if present, only included when this rule id is active
}

export interface PlanBundle {
  context: EventContext;
  signals: ContextSignals;
  decision: DecisionResult;
  budget: BudgetBreakdown;
  timeline: TimelinePlan;
  vendorGuides: VendorCategoryGuide[];
}
