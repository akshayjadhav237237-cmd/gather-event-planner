import { describe, expect, it } from 'vitest';
import { COMPRESSED_THRESHOLD_DAYS } from '../src/config/constants';
import { getTaskTemplates } from '../src/data/tasks';
import { RULE_IDS } from '../src/domain/ruleIds';
import { buildTimeline } from '../src/domain/timelineEngine';
import type { ContextSignals, DecisionResult } from '../src/types/engine';
import type { EventContext } from '../src/types/event';
import { addDays, daysBetween } from '../src/utils/dateMath';

function makeContext(overrides: Partial<EventContext> = {}): EventContext {
  return {
    id: 'evt-test-1',
    title: 'Test Event',
    eventType: 'wedding',
    subFormat: 'western',
    eventDate: '2027-11-20',
    currency: 'USD',
    totalBudget: 30000,
    guestCount: 120,
    setting: 'indoor',
    season: 'mild',
    priorities: [],
    flags: [],
    userNotes: '',
    ...overrides,
  };
}

function makeSignals(
  ctx: EventContext,
  today: string,
  overrides: Partial<ContextSignals> = {}
): ContextSignals {
  const days = daysBetween(today, ctx.eventDate);
  return {
    daysUntilEvent: days,
    isPast: days < 0,
    isShortNotice: days >= 0 && days < COMPRESSED_THRESHOLD_DAYS,
    perGuestBudget: Math.floor(ctx.totalBudget / ctx.guestCount),
    floorPerGuest: 100,
    isBelowFloor: false,
    budgetTier: 'moderate',
    isMicroEvent: ctx.guestCount < 50,
    isLargeCrowd: ctx.guestCount >= 1000,
    isOutdoorExposed: ctx.setting === 'outdoor' || ctx.setting === 'hybrid',
    hasYoungKids: ctx.subFormat === 'kids_1_3',
    hasSchoolKids: ctx.subFormat === 'kids_4_12',
    ...overrides,
  };
}

function makeDecision(activeRuleIds: string[] = []): DecisionResult {
  return {
    adaptations: [],
    activeRuleIds,
    contingencyDelta: 0,
  };
}

describe('Timeline Engine and Task Scheduling', () => {
  const today = '2026-10-20';
  const templates = getTaskTemplates();
  const templateMap = new Map(templates.map((t) => [t.id, t]));

  it('preserves ideal backward offsets on a 13-month runway for western wedding', () => {
    const eventDate = addDays(today, 400);
    const ctx = makeContext({ eventType: 'wedding', subFormat: 'western', eventDate });
    const signals = makeSignals(ctx, today);
    const decision = makeDecision();

    const plan = buildTimeline(ctx, signals, decision, today);

    expect(plan.daysAvailable).toBe(400);
    expect(plan.isCompressed).toBe(false);
    expect(plan.tasks.length).toBeGreaterThan(0);

    for (const task of plan.tasks) {
      const template = templateMap.get(task.id)!;
      const expectedDueDate = addDays(eventDate, -template.daysBefore);
      expect(task.dueDate).toBe(expectedDueDate);
      expect(task.skippedInCompression).toBe(false);
      expect(task.rationale).toBe(template.rationale);
    }
  });

  it('scales backward offsets proportionally on a 6-week birthday runway', () => {
    const eventDate = addDays(today, 42);
    const ctx = makeContext({ eventType: 'birthday', subFormat: 'kids_4_12', eventDate });
    const signals = makeSignals(ctx, today);
    const decision = makeDecision();

    const plan = buildTimeline(ctx, signals, decision, today);

    expect(plan.daysAvailable).toBe(42);
    expect(plan.isCompressed).toBe(false);

    for (const task of plan.tasks) {
      expect(task.rationale).toContain('(Compressed to fit your timeline.)');
      expect(task.skippedInCompression).toBe(false);
      expect(task.dueDate >= today).toBe(true);
      expect(task.dueDate <= eventDate).toBe(true);
    }
  });

  it('compresses timelines on 3-week, 5-day, and past dates while respecting constraints', () => {
    // Scenario 1: 3-week compression
    const ctx3w = makeContext({ eventDate: addDays(today, 20) });
    const plan3w = buildTimeline(ctx3w, makeSignals(ctx3w, today), makeDecision(), today);
    expect(plan3w.isCompressed).toBe(true);

    const taskMap3w = new Map(plan3w.tasks.map((t) => [t.id, t]));
    for (const task of plan3w.tasks) {
      if (task.optional) {
        expect(task.skippedInCompression).toBe(true);
      }
      expect(task.dueDate >= today).toBe(true);
      expect(task.dueDate <= ctx3w.eventDate).toBe(true);
      for (const depId of task.dependsOn) {
        const dep = taskMap3w.get(depId);
        if (dep) {
          expect(dep.dueDate <= task.dueDate).toBe(true);
        }
      }
    }

    // Scenario 2: 5-day extreme compression
    const ctx5d = makeContext({ eventDate: addDays(today, 5) });
    const plan5d = buildTimeline(ctx5d, makeSignals(ctx5d, today), makeDecision(), today);
    expect(plan5d.isCompressed).toBe(true);
    for (const task of plan5d.tasks) {
      expect(task.dueDate >= today).toBe(true);
      expect(task.dueDate <= ctx5d.eventDate).toBe(true);
    }

    // Scenario 3: Past date
    const ctxPast = makeContext({ eventDate: addDays(today, -10) });
    const planPast = buildTimeline(ctxPast, makeSignals(ctxPast, today), makeDecision(), today);
    expect(planPast.isCompressed).toBe(true);
    expect(planPast.daysAvailable).toBe(0);
    for (const task of planPast.tasks) {
      expect(task.dueDate).toBe(today);
      if (task.optional) {
        expect(task.skippedInCompression).toBe(true);
      }
    }
  });

  it('preserves chronological task order and phase sequences under uniform scaling', () => {
    const ctx = makeContext({ eventDate: addDays(today, 60) });
    const plan = buildTimeline(ctx, makeSignals(ctx, today), makeDecision(), today);

    for (let i = 1; i < plan.tasks.length; i++) {
      expect(plan.tasks[i - 1].dueDate <= plan.tasks[i].dueDate).toBe(true);
    }

    const taskMap = new Map(plan.tasks.map((t) => [t.id, t]));
    for (const task of plan.tasks) {
      for (const depId of task.dependsOn) {
        const dep = taskMap.get(depId);
        if (dep) {
          expect(dep.dueDate <= task.dueDate).toBe(true);
        }
      }
    }
  });

  it('guarantees pure determinism for identical input parameters', () => {
    const ctx = makeContext({ eventDate: addDays(today, 90) });
    const signals = makeSignals(ctx, today);
    const decision = makeDecision([RULE_IDS.OUTDOOR, RULE_IDS.ALLERGY_ALERT]);

    const plan1 = buildTimeline(ctx, signals, decision, today);
    const plan2 = buildTimeline(ctx, signals, decision, today);

    expect(plan1).toEqual(plan2);
  });

  it('injects conditional tasks strictly when corresponding decision rules are active', () => {
    const ctx = makeContext({ eventDate: addDays(today, 180) });
    const signals = makeSignals(ctx, today);

    const inactivePlan = buildTimeline(ctx, signals, makeDecision([]), today);
    const activePlan = buildTimeline(
      ctx,
      signals,
      makeDecision([RULE_IDS.OUTDOOR, RULE_IDS.ALLERGY_ALERT]),
      today
    );

    expect(inactivePlan.tasks.some((t) => t.id === 'inj-outdoor')).toBe(false);
    expect(inactivePlan.tasks.some((t) => t.id === 'inj-allergy')).toBe(false);

    expect(activePlan.tasks.some((t) => t.id === 'inj-outdoor')).toBe(true);
    expect(activePlan.tasks.some((t) => t.id === 'inj-allergy')).toBe(true);
    expect(activePlan.tasks.some((t) => t.id === 'inj-sponsorship')).toBe(false);
  });
});
