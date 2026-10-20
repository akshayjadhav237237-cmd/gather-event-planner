import { describe, expect, it } from 'vitest';
import { getDemoScenarios } from '../src/data/demoScenarios';
import { buildPlan } from '../src/domain/buildPlan';
import type { TimelineTask } from '../src/types/event';
import {
  groupTasksByPhase,
  overallProgress,
  PHASE_ORDER,
  skippedTasks,
  taskStatus,
  waitingOn,
} from '../src/ui/timelineView';

function makeTask(partial: Partial<TimelineTask> & { id: string; dueDate: string }): TimelineTask {
  return {
    id: partial.id,
    title: partial.title ?? `Task ${partial.id}`,
    phase: partial.phase ?? 'Foundations',
    dueDate: partial.dueDate,
    priority: partial.priority ?? 'medium',
    dependsOn: partial.dependsOn ?? [],
    optional: partial.optional ?? false,
    skippedInCompression: partial.skippedInCompression ?? false,
    rationale: partial.rationale ?? 'Planning rationale',
  };
}

describe('timelineView', () => {
  const today = '2026-06-15';

  describe('taskStatus', () => {
    it('returns done when completed regardless of due date', () => {
      const pastTask = makeTask({ id: 't1', dueDate: '2026-06-01' });
      expect(taskStatus(pastTask, true, today)).toBe('done');
      const futureTask = makeTask({ id: 't2', dueDate: '2026-07-01' });
      expect(taskStatus(futureTask, true, today)).toBe('done');
    });

    it('returns overdue when task due date is strictly before today', () => {
      const yesterdayTask = makeTask({ id: 't1', dueDate: '2026-06-14' });
      expect(taskStatus(yesterdayTask, false, today)).toBe('overdue');
    });

    it('returns dueSoon when due today', () => {
      const todayTask = makeTask({ id: 't1', dueDate: '2026-06-15' });
      expect(taskStatus(todayTask, false, today)).toBe('dueSoon');
    });

    it('returns dueSoon when due within 7 days', () => {
      const in7Days = makeTask({ id: 't1', dueDate: '2026-06-22' });
      expect(taskStatus(in7Days, false, today)).toBe('dueSoon');
    });

    it('returns upcoming when due more than 7 days ahead', () => {
      const in8Days = makeTask({ id: 't1', dueDate: '2026-06-23' });
      expect(taskStatus(in8Days, false, today)).toBe('upcoming');
    });
  });

  describe('waitingOn', () => {
    it('returns empty array when task has no dependencies', () => {
      const t = makeTask({ id: 't1', dueDate: '2026-07-01', dependsOn: [] });
      const byId = new Map([[t.id, t]]);
      expect(waitingOn(t, byId, {})).toEqual([]);
    });

    it('returns titles of incomplete dependencies', () => {
      const dep1 = makeTask({ id: 'd1', title: 'Lock Venue', dueDate: '2026-06-20' });
      const dep2 = makeTask({ id: 'd2', title: 'Sign Catering', dueDate: '2026-06-22' });
      const task = makeTask({
        id: 't1',
        title: 'Send Invites',
        dueDate: '2026-06-25',
        dependsOn: ['d1', 'd2', 'unknown_id'],
      });
      const byId = new Map([
        [dep1.id, dep1],
        [dep2.id, dep2],
        [task.id, task],
      ]);

      const waiting = waitingOn(task, byId, { d1: true });
      expect(waiting).toEqual(['Sign Catering']);
    });
  });

  describe('skippedTasks and overallProgress', () => {
    it('separates skipped tasks from active tasks', () => {
      const tasks = [
        makeTask({ id: 't1', dueDate: '2026-06-20', skippedInCompression: false }),
        makeTask({ id: 't2', dueDate: '2026-06-21', skippedInCompression: true }),
        makeTask({ id: 't3', dueDate: '2026-06-22', skippedInCompression: false }),
      ];
      expect(skippedTasks(tasks).map((t) => t.id)).toEqual(['t2']);
    });

    it('calculates overallProgress ignoring skipped tasks', () => {
      const tasks = [
        makeTask({ id: 't1', dueDate: '2026-06-20' }),
        makeTask({ id: 't2', dueDate: '2026-06-21' }),
        makeTask({ id: 't3', dueDate: '2026-06-22', skippedInCompression: true }),
      ];
      const prog = overallProgress(tasks, { t1: true });
      expect(prog).toEqual({ done: 1, total: 2, pct: 50 });
    });

    it('returns 0% when no non-skipped tasks exist', () => {
      const prog = overallProgress([], {});
      expect(prog).toEqual({ done: 0, total: 0, pct: 0 });
    });
  });

  describe('groupTasksByPhase', () => {
    const tasks = [
      makeTask({ id: 'b1', phase: 'Booking', dueDate: '2026-06-18' }),
      makeTask({ id: 'f1', phase: 'Foundations', dueDate: '2026-06-14' }),
      makeTask({ id: 'f2', phase: 'Foundations', dueDate: '2026-06-16' }),
      makeTask({ id: 'c1', phase: 'Custom Phase', dueDate: '2026-06-20' }),
      makeTask({ id: 's1', phase: 'Booking', dueDate: '2026-06-19', skippedInCompression: true }),
    ];

    it('preserves PHASE_ORDER and appends unseen phases', () => {
      const groups = groupTasksByPhase(tasks, {}, 'all', today);
      const phases = groups.map((g) => g.phase);
      expect(phases).toEqual(['Foundations', 'Booking', 'Custom Phase']);
      expect(PHASE_ORDER[0]).toBe('Foundations');
    });

    it('counts totalCount and doneCount across phase before filtering', () => {
      const completion = { f1: true };
      const todoGroups = groupTasksByPhase(tasks, completion, 'todo', today);
      const fGroup = todoGroups.find((g) => g.phase === 'Foundations');
      expect(fGroup).toBeDefined();
      expect(fGroup?.totalCount).toBe(2);
      expect(fGroup?.doneCount).toBe(1);
      expect(fGroup?.items.length).toBe(1);
      expect(fGroup?.items[0]?.task.id).toBe('f2');
    });

    it('omits groups that have 0 items after filtering', () => {
      const completion = { f1: true, f2: true };
      const todoGroups = groupTasksByPhase(tasks, completion, 'todo', today);
      expect(todoGroups.some((g) => g.phase === 'Foundations')).toBe(false);

      const doneGroups = groupTasksByPhase(tasks, completion, 'done', today);
      expect(doneGroups.some((g) => g.phase === 'Foundations')).toBe(true);
      expect(doneGroups.some((g) => g.phase === 'Booking')).toBe(false);
    });
  });

  describe('demo scenarios progress and grouping', () => {
    it('accurately computes progress across all demo scenarios', () => {
      const scenarios = getDemoScenarios(today);
      for (const scenario of scenarios) {
        const bundle = buildPlan(scenario.context, today);
        const { tasks } = bundle.timeline;
        const nonSkipped = tasks.filter((t) => !t.skippedInCompression);

        const initialProg = overallProgress(tasks, {});
        expect(initialProg.total).toBe(nonSkipped.length);
        expect(initialProg.done).toBe(0);
        expect(initialProg.pct).toBe(0);

        if (nonSkipped.length > 0) {
          const half = Math.floor(nonSkipped.length / 2);
          const completion: Record<string, boolean> = {};
          for (let i = 0; i < half; i++) {
            const t = nonSkipped[i];
            if (t) completion[t.id] = true;
          }
          const halfProg = overallProgress(tasks, completion);
          expect(halfProg.done).toBe(half);
          expect(halfProg.pct).toBe(Math.round((half / nonSkipped.length) * 100));

          const groups = groupTasksByPhase(tasks, completion, 'all', today);
          const totalGroupedTasks = groups.reduce((acc, g) => acc + g.items.length, 0);
          expect(totalGroupedTasks).toBe(nonSkipped.length);
        }
      }
    });
  });
});
