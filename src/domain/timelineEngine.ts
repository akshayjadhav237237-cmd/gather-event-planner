import { COMPRESSED_THRESHOLD_DAYS } from '../config/constants';
import { getPlanningHorizonDays } from '../data/horizons';
import { getTaskTemplates } from '../data/tasks';
import type { ContextSignals, DecisionResult } from '../types/engine';
import type { EventContext, TimelinePlan, TimelineTask } from '../types/event';
import { addDays } from '../utils/dateMath';
import { buildRunOfShow } from './runOfShow';

// Planning heuristics: explanation suffix appended when available runway compresses schedule.
export const COMPRESSED_RATIONALE_SUFFIX = ' (Compressed to fit your timeline.)';

function computeTopologicalOrder(tasks: TimelineTask[]): string[] {
  const taskIds = new Set(tasks.map((t) => t.id));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const task of tasks) {
    let validDeps = 0;
    for (const depId of task.dependsOn) {
      if (taskIds.has(depId)) {
        validDeps++;
        const list = dependents.get(depId) ?? [];
        list.push(task.id);
        dependents.set(depId, list);
      }
    }
    inDegree.set(task.id, validDeps);
  }

  const queue: string[] = [];
  for (const task of tasks) {
    if (inDegree.get(task.id) === 0) {
      queue.push(task.id);
    }
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    const children = dependents.get(id) ?? [];
    for (const childId of children) {
      const deg = (inDegree.get(childId) ?? 1) - 1;
      inDegree.set(childId, deg);
      if (deg === 0) {
        queue.push(childId);
      }
    }
  }

  if (order.length < tasks.length) {
    for (const task of tasks) {
      if (!order.includes(task.id)) {
        order.push(task.id);
      }
    }
  }

  return order;
}

/** Generates a backward-planned, dependency-ordered timeline and day-of run-of-show schedule. */
export function buildTimeline(
  ctx: EventContext,
  signals: ContextSignals,
  decision: DecisionResult,
  today: string,
): TimelinePlan {
  const eligibleTemplates = getTaskTemplates().filter((template) => {
    if (!template.eventTypes.includes(ctx.eventType)) {
      return false;
    }
    if (template.subFormats && !template.subFormats.includes(ctx.subFormat)) {
      return false;
    }
    if (template.injectedBy && !decision.activeRuleIds.includes(template.injectedBy)) {
      return false;
    }
    return true;
  });

  const daysAvailable = Math.max(0, signals.daysUntilEvent);
  const isCompressed = signals.isPast || daysAvailable < COMPRESSED_THRESHOLD_DAYS;
  const horizon = getPlanningHorizonDays(ctx);
  const factor = horizon > 0 ? Math.min(1, daysAvailable / horizon) : 1;

  const catalogIndexMap = new Map<string, number>();
  eligibleTemplates.forEach((t, idx) => catalogIndexMap.set(t.id, idx));

  const tasks: TimelineTask[] = eligibleTemplates.map((template) => {
    const scaledOffset = Math.round(template.daysBefore * factor);
    const rationale =
      factor < 1 ? `${template.rationale}${COMPRESSED_RATIONALE_SUFFIX}` : template.rationale;

    let dueDate = addDays(ctx.eventDate, -scaledOffset);
    if (signals.isPast) {
      dueDate = today;
    } else {
      if (dueDate < today) {
        dueDate = today;
      }
      if (dueDate > ctx.eventDate) {
        dueDate = ctx.eventDate;
      }
    }

    const skippedInCompression = isCompressed && template.optional;

    return {
      id: template.id,
      title: template.title,
      phase: template.phase,
      dueDate,
      priority: template.priority,
      dependsOn: [...template.dependsOn],
      optional: template.optional,
      skippedInCompression,
      rationale,
    };
  });

  const taskMap = new Map<string, TimelineTask>(tasks.map((t) => [t.id, t]));
  const topoOrder = computeTopologicalOrder(tasks);

  for (const taskId of topoOrder) {
    const task = taskMap.get(taskId)!;
    const depDueDates: string[] = [];
    for (const depId of task.dependsOn) {
      const depTask = taskMap.get(depId);
      if (depTask) {
        depDueDates.push(depTask.dueDate);
      }
    }

    if (depDueDates.length > 0) {
      const maxDepDate = depDueDates.reduce((latest, current) =>
        current > latest ? current : latest,
      );
      if (maxDepDate > task.dueDate) {
        task.dueDate = maxDepDate;
      }
    }

    if (!signals.isPast && task.dueDate > ctx.eventDate) {
      task.dueDate = ctx.eventDate;
    }
  }

  tasks.sort((a, b) => {
    if (a.dueDate < b.dueDate) return -1;
    if (a.dueDate > b.dueDate) return 1;
    return (catalogIndexMap.get(a.id) ?? 0) - (catalogIndexMap.get(b.id) ?? 0);
  });

  const runOfShow = buildRunOfShow(ctx, decision);

  return {
    daysAvailable,
    isCompressed,
    tasks,
    runOfShow,
  };
}
