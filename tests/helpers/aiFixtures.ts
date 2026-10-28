import type { AiPlanInput, LlmClient } from '../../src/ai/aiTypes';
import type { ContextSignals, DecisionResult } from '../../src/types/engine';
import type { EventContext } from '../../src/types/event';

export function makeInput(overrides: Partial<EventContext> = {}): AiPlanInput {
  const context: EventContext = {
    id: 'evt-test-1',
    title: 'Silver Anniversary Dinner',
    eventType: 'wedding',
    subFormat: 'western',
    eventDate: '2026-11-20',
    currency: 'USD',
    totalBudget: 20000,
    guestCount: 60,
    venueSetting: 'indoor',
    season: 'winter',
    priorities: ['catering'],
    flags: [],
    userNotes: '',
    ...overrides,
  };
  const signals: ContextSignals = {
    budgetTier: 'standard',
    perGuestBudget: 333,
    daysUntilEvent: 30,
    isPast: false,
    isCompressed: false,
    hasTightTurnaround: false,
    hasSubstantialBudget: false,
    hasCelebratoryAtmosphere: true,
  };
  const decision: DecisionResult = {
    budgetMultiplier: 1.0,
    timelinePaddingDays: 0,
    activeRuleIds: ['R_STD'],
    adaptations: [],
    tags: [],
  };
  return { context, signals, decision };
}

export function makePayload(): string {
  const t = (id: string) => ({
    id,
    title: 'Concept',
    summary: 'Summary',
    whyItFits: 'Fits',
    colorPalette: ['#111111', '#222222', '#333333'] as [string, string, string],
  });
  const c = (id: string) => ({
    id,
    title: 'Catering',
    summary: 'Summary',
    whyItFits: 'Fits',
    allergySafetyNote: 'Safe',
    budgetSwapIdea: 'Swap',
  });
  const a = (id: string) => ({
    id,
    title: 'Activity',
    summary: 'Summary',
    whyItFits: 'Fits',
    audienceFit: 'All',
    safetyNote: 'Safe',
  });
  const b = (i: number) => ({ title: `Task ${i}`, phase: 'Booking', rationale: 'Reason' });
  return JSON.stringify({
    source: 'live',
    themeConcepts: [t('1'), t('2'), t('3')],
    cateringIdeas: [c('1'), c('2'), c('3')],
    activityIdeas: [a('1'), a('2'), a('3')],
    bespokeTasks: [b(1), b(2), b(3), b(4)],
    contradictionAdvisory: null,
  });
}

export const mockClient = (fn: (u: string) => Promise<string>): LlmClient => ({
  generate: async (_s, u) => fn(u),
});
