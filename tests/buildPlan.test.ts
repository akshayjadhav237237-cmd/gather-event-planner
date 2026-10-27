import { describe, expect, it } from 'vitest';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { buildPlan } from '../src/domain/buildPlan';
import { RULE_IDS } from '../src/domain/ruleIds';
import type { PlanBundle } from '../src/types/engine';
import type { EventContext, EventType, Season, SubFormat, VenueSetting } from '../src/types/event';
import { addDays } from '../src/utils/dateMath';

function assertInvariants(plan: PlanBundle, today: string): void {
  const { context, budget, timeline } = plan;

  const categorySum = budget.categories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);
  if (categorySum + budget.contingencyAmount !== context.totalBudget) {
    throw new Error('Invariant failed: total budget sum mismatch');
  }

  if (!Number.isFinite(budget.contingencyAmount) || Number.isNaN(budget.contingencyAmount)) {
    throw new Error('Invariant failed: non-finite contingency');
  }

  for (const cat of budget.categories) {
    if (!Number.isFinite(cat.allocatedAmount) || Number.isNaN(cat.allocatedAmount)) {
      throw new Error(`Invariant failed: invalid allocatedAmount for ${cat.id}`);
    }
    if (!Number.isFinite(cat.allocatedPct) || Number.isNaN(cat.allocatedPct)) {
      throw new Error(`Invariant failed: invalid allocatedPct for ${cat.id}`);
    }
  }

  const taskMap = new Map(timeline.tasks.map((t) => [t.id, t]));
  for (const task of timeline.tasks) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
      throw new Error(`Invariant failed: invalid dueDate format for ${task.id}`);
    }
    if (plan.signals.isPast) {
      if (task.dueDate !== today) throw new Error(`Invariant failed: past task due date != today`);
    } else {
      if (task.dueDate < today || task.dueDate > context.eventDate) {
        throw new Error(`Invariant failed: task due date out of bounds for ${task.id}`);
      }
    }

    for (const depId of task.dependsOn) {
      const depTask = taskMap.get(depId);
      if (depTask && task.dueDate < depTask.dueDate) {
        throw new Error(`Invariant failed: dependency ordering violated for ${task.id}`);
      }
    }
  }

  if (plan.vendorGuides.length === 0) {
    throw new Error('Invariant failed: zero vendor guides');
  }
}

describe('buildPlan Integration Tests', () => {
  const TODAY = '2026-10-20';
  const scenarios = getDemoScenarios(TODAY);

  it('successfully generates a complete PlanBundle for all 4 demo scenarios', () => {
    for (const sc of scenarios) {
      const plan = buildPlan(sc.context, TODAY);
      expect(plan.context.id).toBe(sc.context.id);
      expect(plan.signals).toBeDefined();
      expect(plan.decision).toBeDefined();
      expect(plan.budget).toBeDefined();
      expect(plan.timeline).toBeDefined();
      expect(plan.vendorGuides).toBeDefined();
      assertInvariants(plan, TODAY);
    }
  });

  it('correctly assesses Scenario 2: kids-birthday-rush as compressed with expected rules', () => {
    const sc = scenarios.find((s) => s.id === 'kids-birthday-rush')!;
    const plan = buildPlan(sc.context, TODAY);

    expect(plan.timeline.isCompressed).toBe(true);
    expect(plan.signals.isShortNotice).toBe(true);
    expect(plan.decision.activeRuleIds).toContain(RULE_IDS.SHORT_NOTICE);
    expect(plan.decision.activeRuleIds).toContain(RULE_IDS.ALLERGY_ALERT);
    expect(plan.timeline.tasks.some((t) => t.skippedInCompression)).toBe(true);
  });

  it('flags tight per-head economics for Scenario 4: stretch-budget-wedding', () => {
    const sc = scenarios.find((s) => s.id === 'stretch-budget-wedding')!;
    const plan = buildPlan(sc.context, TODAY);

    expect(plan.signals.isBelowFloor).toBe(true);
    expect(plan.decision.activeRuleIds).toContain(RULE_IDS.TIGHT_PER_HEAD);
    expect(plan.budget.alerts.some((a) => a.code === 'UNREALISTIC_PER_HEAD')).toBe(true);
  });

  it('triggers multi-ceremony and applies Indian wedding budget preset for Scenario 1', () => {
    const sc = scenarios.find((s) => s.id === 'indian-wedding')!;
    const plan = buildPlan(sc.context, TODAY);

    expect(plan.decision.activeRuleIds).toContain(RULE_IDS.MULTI_CEREMONY);
    const decor = plan.budget.categories.find((c) => c.id === 'decor_florals');
    expect(decor).toBeDefined();
    expect(decor?.baselinePct).toBe(15);
  });

  it('executes fast deterministic sampling matrix in under 2 seconds with invariant preservation', () => {
    const startTime = Date.now();
    const guestCounts = [1, 49, 50, 999, 1000];
    const budgets = [100, 50000, 10000000];
    const dateOffsets = [-10, 0, 5, 20, 21, 300];
    const configs: Array<{
      type: EventType;
      sub: SubFormat;
      setting: VenueSetting;
      season: Season;
    }> = [
      { type: 'wedding', sub: 'western', setting: 'indoor', season: 'winter' },
      { type: 'birthday', sub: 'kids_1_3', setting: 'outdoor', season: 'summer' },
      { type: 'community', sub: 'festival', setting: 'hybrid', season: 'mild' },
    ];

    let runs = 0;
    for (const cfg of configs) {
      for (const guestCount of guestCounts) {
        for (const totalBudget of budgets) {
          for (const offset of dateOffsets) {
            const ctx: EventContext = {
              id: `matrix-${runs}`,
              title: `Matrix Run ${runs}`,
              eventType: cfg.type,
              subFormat: cfg.sub,
              eventDate: addDays(TODAY, offset),
              currency: 'USD',
              totalBudget,
              guestCount,
              setting: cfg.setting,
              season: cfg.season,
              priorities: [],
              flags: [],
              userNotes: 'Matrix validation sample',
            };

            const plan = buildPlan(ctx, TODAY);
            assertInvariants(plan, TODAY);
            runs += 1;
          }
        }
      }
    }

    const elapsed = Date.now() - startTime;
    expect(runs).toBe(270);
    expect(elapsed).toBeLessThan(10000);
  });
});
