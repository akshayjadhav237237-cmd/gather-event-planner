import type { TimelineTask } from '../types/event';
import { daysBetween } from '../utils/dateMath';

export const PHASE_ORDER = [
  'Foundations',
  'Booking',
  'Details',
  'Final Week',
  'Event Day',
] as const;

export type TaskStatus = 'done' | 'overdue' | 'dueSoon' | 'upcoming';

export function taskStatus(task: TimelineTask, done: boolean, today: string): TaskStatus {
  if (done) return 'done';
  if (task.dueDate < today) return 'overdue';
  if (daysBetween(today, task.dueDate) <= 7) return 'dueSoon';
  return 'upcoming';
}

export interface PhaseGroupView {
  phase: string;
  items: Array<{
    task: TimelineTask;
    done: boolean;
    status: TaskStatus;
    waitingOn: string[];
  }>;
  doneCount: number;
  totalCount: number;
}

export function waitingOn(
  task: TimelineTask,
  byId: Map<string, TimelineTask>,
  completion: Record<string, boolean>
): string[] {
  const titles: string[] = [];
  for (const depId of task.dependsOn) {
    if (!completion[depId]) {
      const depTask = byId.get(depId);
      if (depTask) {
        titles.push(depTask.title);
      }
    }
  }
  return titles;
}

export function skippedTasks(tasks: readonly TimelineTask[]): TimelineTask[] {
  return tasks.filter((t) => t.skippedInCompression);
}

export function overallProgress(
  tasks: readonly TimelineTask[],
  completion: Record<string, boolean>
): { done: number; total: number; pct: number } {
  const nonSkipped = tasks.filter((t) => !t.skippedInCompression);
  const total = nonSkipped.length;
  const done = nonSkipped.filter((t) => completion[t.id] === true).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

export function groupTasksByPhase(
  tasks: readonly TimelineTask[],
  completion: Record<string, boolean>,
  filter: 'all' | 'todo' | 'done',
  today: string
): PhaseGroupView[] {
  const nonSkipped = tasks.filter((t) => !t.skippedInCompression);
  const byId = new Map<string, TimelineTask>(nonSkipped.map((t) => [t.id, t]));

  const presentPhases = new Set(nonSkipped.map((t) => t.phase));
  const orderedPhases: string[] = [];

  for (const phase of PHASE_ORDER) {
    if (presentPhases.has(phase)) {
      orderedPhases.push(phase);
    }
  }

  for (const t of nonSkipped) {
    if (!orderedPhases.includes(t.phase)) {
      orderedPhases.push(t.phase);
    }
  }

  const result: PhaseGroupView[] = [];

  for (const phase of orderedPhases) {
    const phaseTasks = nonSkipped.filter((t) => t.phase === phase);
    const totalCount = phaseTasks.length;
    const doneCount = phaseTasks.filter((t) => completion[t.id] === true).length;

    const allItems = phaseTasks.map((task) => {
      const done = completion[task.id] === true;
      const status = taskStatus(task, done, today);
      const waiting = waitingOn(task, byId, completion);
      return {
        task,
        done,
        status,
        waitingOn: waiting,
      };
    });

    const filteredItems = allItems.filter((item) => {
      if (filter === 'todo') return !item.done;
      if (filter === 'done') return item.done;
      return true;
    });

    if (filteredItems.length > 0) {
      result.push({
        phase,
        items: filteredItems,
        doneCount,
        totalCount,
      });
    }
  }

  return result;
}
