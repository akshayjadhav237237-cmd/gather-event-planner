import { describe, expect, it } from 'vitest';
import { BUDGET_PRESETS, getBudgetPreset } from '../src/data/budgetPresets';
import { CATEGORY_SETS } from '../src/data/categories';
import { buildBudget, evaluateActuals } from '../src/domain/budgetEngine';
import type { ContextSignals, DecisionResult } from '../types/engine';
import type { CurrencyCode, EventContext, EventType, SubFormat } from '../types/event';

function makeCtx(overrides?: Partial<EventContext>): EventContext {
  return {
    id: 'test-event-1',
    title: 'Test Celebration',
    eventType: 'wedding',
    subFormat: 'western',
    eventDate: '2027-06-15',
    currency: 'USD',
    totalBudget: 20000,
    guestCount: 100,
    setting: 'indoor',
    season: 'summer',
    priorities: [],
    flags: [],
    userNotes: '',
    ...overrides,
  };
}

function makeSignals(overrides?: Partial<ContextSignals>): ContextSignals {
  return {
    daysUntilEvent: 200,
    isPast: false,
    isShortNotice: false,
    perGuestBudget: 200,
    floorPerGuest: 40,
    isBelowFloor: false,
    budgetTier: 'generous',
    isMicroEvent: false,
    isLargeCrowd: false,
    isOutdoorExposed: false,
    hasYoungKids: false,
    hasSchoolKids: false,
    ...overrides,
  };
}

function makeDecision(overrides?: Partial<DecisionResult>): DecisionResult {
  return {
    adaptations: [],
    activeRuleIds: [],
    contingencyDelta: 0,
    ...overrides,
  };
}

describe('budgetEngine', () => {
  it('all presets sum to 100 and category IDs match definitions', () => {
    for (const preset of Object.values(BUDGET_PRESETS)) {
      const sum = Object.values(preset).reduce((s, v) => s + v, 0);
      expect(sum).toBe(100);
    }

    const types: EventType[] = ['wedding', 'birthday', 'community'];
    for (const type of types) {
      const preset = getBudgetPreset(type, 'western' as SubFormat);
      const expectedCatIds = CATEGORY_SETS[type].map((c) => c.id);
      expect(Object.keys(preset).sort()).toEqual([...expectedCatIds].sort());
    }
  });

  it('maintains strict sum(categories) + contingency === totalBudget across 35 diverse inputs', () => {
    const eventTypes: EventType[] = ['wedding', 'birthday', 'community'];
    const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR'];
    const budgets = [1, 2, 7, 50, 100, 999, 5000, 25000, 100000, 10000000];
    const guests = [1, 10, 45, 120, 500, 5000];

    for (let i = 0; i < 35; i += 1) {
      const eventType = eventTypes[i % eventTypes.length] ?? 'wedding';
      const currency = currencies[i % currencies.length] ?? 'USD';
      const totalBudget = budgets[i % budgets.length] ?? 20000;
      const guestCount = guests[i % guests.length] ?? 100;
      const isMicro = guestCount < 50;
      const delta = ((i % 5) - 2) * 0.02;

      const ctx = makeCtx({ eventType, currency, totalBudget, guestCount, priorities: ['venue'] });
      const signals = makeSignals({
        isMicroEvent: isMicro,
        perGuestBudget: Math.floor(totalBudget / guestCount),
      });
      const decision = makeDecision({ contingencyDelta: delta });

      const breakdown = buildBudget(ctx, signals, decision);
      const catSum = breakdown.categories.reduce((s, c) => s + c.allocatedAmount, 0);

      expect(catSum + breakdown.contingencyAmount).toBe(totalBudget);
    }
  });

  it('prioritizing categories increases their allocated amount', () => {
    const standard = buildBudget(
      makeCtx({ totalBudget: 50000, priorities: [] }),
      makeSignals(),
      makeDecision(),
    );
    const prioritized = buildBudget(
      makeCtx({ totalBudget: 50000, priorities: ['venue', 'catering'] }),
      makeSignals(),
      makeDecision(),
    );

    const stdVenue = standard.categories.find((c) => c.id === 'venue');
    const prioVenue = prioritized.categories.find((c) => c.id === 'venue');
    expect(prioVenue?.allocatedAmount).toBeGreaterThan(stdVenue?.allocatedAmount ?? 0);
    expect(prioVenue?.isPriority).toBe(true);
  });

  it('increases fixed cost allocation weighting for micro-events', () => {
    const ctx = makeCtx({ totalBudget: 30000, guestCount: 20 });
    const nonMicro = buildBudget(ctx, makeSignals({ isMicroEvent: false }), makeDecision());
    const micro = buildBudget(ctx, makeSignals({ isMicroEvent: true }), makeDecision());

    const nonMicroVenue = nonMicro.categories.find((c) => c.id === 'venue');
    const microVenue = micro.categories.find((c) => c.id === 'venue');
    expect(microVenue?.allocatedAmount).toBeGreaterThan(nonMicroVenue?.allocatedAmount ?? 0);
  });

  it('generates DATE_IN_PAST alert when event date is in the past', () => {
    const breakdown = buildBudget(makeCtx(), makeSignals({ isPast: true }), makeDecision());
    const alert = breakdown.alerts.find((a) => a.code === 'DATE_IN_PAST');
    expect(alert).toBeDefined();
    expect(alert?.severity).toBe('warning');
    expect(alert?.remedies.length).toBeGreaterThanOrEqual(2);
  });

  it('generates UNREALISTIC_PER_HEAD warning when budget is moderately low', () => {
    const ctx = makeCtx({ totalBudget: 3000, guestCount: 100, currency: 'USD' });
    const signals = makeSignals({ perGuestBudget: 30, floorPerGuest: 40, isBelowFloor: true });
    const breakdown = buildBudget(ctx, signals, makeDecision());

    const alert = breakdown.alerts.find((a) => a.code === 'UNREALISTIC_PER_HEAD');
    expect(alert?.severity).toBe('warning');
    expect(alert?.message).toContain('$30');
    expect(alert?.message).toContain('$40');
    expect(alert?.remedies[0]).toContain('supports about 75 guests');
  });

  it('generates UNREALISTIC_PER_HEAD critical when budget is below half of floor', () => {
    const ctx = makeCtx({ totalBudget: 1500, guestCount: 100, currency: 'USD' });
    const signals = makeSignals({ perGuestBudget: 15, floorPerGuest: 40, isBelowFloor: true });
    const breakdown = buildBudget(ctx, signals, makeDecision());

    const alert = breakdown.alerts.find((a) => a.code === 'UNREALISTIC_PER_HEAD');
    expect(alert?.severity).toBe('critical');
    expect(alert?.remedies[0]).toContain('supports about 37 guests');
  });

  it('generates MICRO_EVENT_FIXED_COSTS and always includes HIDDEN_COST_EXPOSURE', () => {
    const ctx = makeCtx({ totalBudget: 20000, currency: 'USD' });
    const breakdown = buildBudget(ctx, makeSignals({ isMicroEvent: true }), makeDecision());

    const microAlert = breakdown.alerts.find((a) => a.code === 'MICRO_EVENT_FIXED_COSTS');
    expect(microAlert?.severity).toBe('info');

    const hiddenAlert = breakdown.alerts.find((a) => a.code === 'HIDDEN_COST_EXPOSURE');
    expect(hiddenAlert?.severity).toBe('info');
    expect(breakdown.allInExposureNote).toContain('20%');
    expect(breakdown.allInExposureNote).toContain('Always ask vendors for all-in quotes.');
  });

  it('evaluateActuals detects category and total overages with appropriate severities', () => {
    const ctx = makeCtx({ totalBudget: 10000 });
    const breakdown = buildBudget(ctx, makeSignals(), makeDecision());
    const venueCat = breakdown.categories.find((c) => c.id === 'venue');
    const venueAllocated = venueCat?.allocatedAmount ?? 0;

    const catOverageAlerts = evaluateActuals(breakdown, { venue: venueAllocated + 500 });
    expect(catOverageAlerts).toHaveLength(1);
    expect(catOverageAlerts[0]?.severity).toBe('warning');
    expect(catOverageAlerts[0]?.code).toBe('OVER_CAP');

    const totalOverageAlerts = evaluateActuals(breakdown, {
      venue: venueAllocated + 1000,
      catering: 10000,
    });
    const critical = totalOverageAlerts.find((a) => a.severity === 'critical');
    expect(critical).toBeDefined();
    expect(critical?.code).toBe('OVER_CAP');
    expect(critical?.message).toContain('Total actual expenditure');
  });
});
