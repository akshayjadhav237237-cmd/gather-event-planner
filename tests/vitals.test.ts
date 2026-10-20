import { describe, expect, it } from 'vitest';
import { buildPlan } from '../src/domain/buildPlan';
import type { PlanBundle } from '../src/types/engine';
import type { EventContext, TimelineTask } from '../src/types/event';
import { computeVitals } from '../src/ui/vitals';

function createMockBundle(overrides: {
  daysUntilEvent?: number;
  eventDate?: string;
  totalBudget?: number;
  perGuestBudget?: number;
  tasks?: TimelineTask[];
}): PlanBundle {
  const baseContext: EventContext = {
    id: 'test-event',
    title: 'Test Event',
    eventType: 'birthday',
    subFormat: 'kids_4_12',
    eventDate: overrides.eventDate ?? '2026-06-20',
    currency: 'USD',
    totalBudget: overrides.totalBudget ?? 1000,
    guestCount: 20,
    setting: 'indoor',
    season: 'summer',
    priorities: [],
    flags: [],
    userNotes: '',
  };

  const bundle = buildPlan(baseContext, '2026-06-01');

  if (overrides.daysUntilEvent !== undefined) {
    bundle.signals.daysUntilEvent = overrides.daysUntilEvent;
  }
  if (overrides.perGuestBudget !== undefined) {
    bundle.signals.perGuestBudget = overrides.perGuestBudget;
  }
  if (overrides.tasks !== undefined) {
    bundle.timeline.tasks = overrides.tasks;
  }

  return bundle;
}

describe('computeVitals', () => {
  it('formats daysLabel for all temporal variations', () => {
    const bundleFuture = createMockBundle({ daysUntilEvent: 5 });
    expect(computeVitals(bundleFuture, {}).daysLabel).toBe('5 days to go');

    const bundleTomorrow = createMockBundle({ daysUntilEvent: 1 });
    expect(computeVitals(bundleTomorrow, {}).daysLabel).toBe('1 day to go');

    const bundleToday = createMockBundle({ daysUntilEvent: 0 });
    expect(computeVitals(bundleToday, {}).daysLabel).toBe('Today');

    const bundlePast = createMockBundle({ daysUntilEvent: -3 });
    expect(computeVitals(bundlePast, {}).daysLabel).toBe('Date has passed');
  });

  it('formats dateLabel and budget labels with currency symbols', () => {
    const bundle = createMockBundle({
      eventDate: '2026-08-15',
      totalBudget: 5000,
      perGuestBudget: 250,
    });
    const vitals = computeVitals(bundle, {});
    expect(vitals.dateLabel).toBe('August 15, 2026');
    expect(vitals.totalBudgetLabel).toBe('$5,000');
    expect(vitals.perGuestLabel).toBe('$250 / guest');
  });

  it('excludes skipped tasks and computes completion percentage accurately', () => {
    const tasks: TimelineTask[] = [
      {
        id: 't1',
        title: 'Task 1',
        phase: 'Booking',
        dueDate: '2026-06-05',
        priority: 'critical',
        dependsOn: [],
        optional: false,
        skippedInCompression: false,
        rationale: 'R1',
      },
      {
        id: 't2',
        title: 'Task 2',
        phase: 'Booking',
        dueDate: '2026-06-08',
        priority: 'high',
        dependsOn: [],
        optional: false,
        skippedInCompression: false,
        rationale: 'R2',
      },
      {
        id: 't3',
        title: 'Task 3 (Skipped)',
        phase: 'Details',
        dueDate: '2026-06-04',
        priority: 'low',
        dependsOn: [],
        optional: true,
        skippedInCompression: true,
        rationale: 'R3',
      },
      {
        id: 't4',
        title: 'Task 4',
        phase: 'Details',
        dueDate: '2026-06-12',
        priority: 'medium',
        dependsOn: [],
        optional: false,
        skippedInCompression: false,
        rationale: 'R4',
      },
    ];

    const bundle = createMockBundle({ tasks });

    // Only t1 is completed among 3 unskipped tasks (t1, t2, t4)
    const taskCompletion = { t1: true, t3: true }; // t3 is skipped so shouldn't affect counts
    const vitals = computeVitals(bundle, taskCompletion);

    expect(vitals.tasksTotal).toBe(3);
    expect(vitals.tasksDone).toBe(1);
    expect(vitals.completionPct).toBe(33); // 1/3 = 33%
    expect(vitals.nextTask).toEqual({
      title: 'Task 2',
      dueLabel: 'June 8, 2026',
    });
  });

  it('handles all-done and empty task states gracefully', () => {
    const tasks: TimelineTask[] = [
      {
        id: 't1',
        title: 'Solo Task',
        phase: 'Final',
        dueDate: '2026-06-10',
        priority: 'critical',
        dependsOn: [],
        optional: false,
        skippedInCompression: false,
        rationale: 'R1',
      },
    ];

    const bundle = createMockBundle({ tasks });
    const allDoneVitals = computeVitals(bundle, { t1: true });

    expect(allDoneVitals.tasksDone).toBe(1);
    expect(allDoneVitals.tasksTotal).toBe(1);
    expect(allDoneVitals.completionPct).toBe(100);
    expect(allDoneVitals.nextTask).toBeNull();

    const emptyBundle = createMockBundle({ tasks: [] });
    const emptyVitals = computeVitals(emptyBundle, {});
    expect(emptyVitals.tasksDone).toBe(0);
    expect(emptyVitals.tasksTotal).toBe(0);
    expect(emptyVitals.completionPct).toBe(0);
    expect(emptyVitals.nextTask).toBeNull();
  });
});
