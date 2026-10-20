import type { PlanBundle } from '../types/engine';
import { formatCurrency } from '../utils/currency';
import { formatDateLong } from './formatDate';

export interface NextTaskVitals {
  title: string;
  dueLabel: string;
}

export interface VitalsResult {
  daysLabel: string;
  dateLabel: string;
  totalBudgetLabel: string;
  perGuestLabel: string;
  tasksDone: number;
  tasksTotal: number;
  completionPct: number;
  nextTask: NextTaskVitals | null;
}

function getDaysLabel(daysUntilEvent: number): string {
  if (daysUntilEvent > 1) {
    return `${daysUntilEvent} days to go`;
  }
  if (daysUntilEvent === 1) {
    return '1 day to go';
  }
  if (daysUntilEvent === 0) {
    return 'Today';
  }
  return 'Date has passed';
}

/** Computes high-level vitals from plan bundle and completion status. */
export function computeVitals(
  bundle: PlanBundle,
  taskCompletion: Record<string, boolean>,
  locale: string = 'en-US'
): VitalsResult {
  const { daysUntilEvent, perGuestBudget } = bundle.signals;
  const { eventDate, totalBudget, currency } = bundle.context;

  const daysLabel = getDaysLabel(daysUntilEvent);
  const dateLabel = formatDateLong(eventDate, locale);
  const totalBudgetLabel = formatCurrency(totalBudget, currency);
  const perGuestLabel = `${formatCurrency(perGuestBudget, currency)} / guest`;

  const unskipped = bundle.timeline.tasks.filter((t) => !t.skippedInCompression);
  const tasksTotal = unskipped.length;
  const tasksDone = unskipped.filter((t) => taskCompletion[t.id] === true).length;
  const completionPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  const uncompleted = unskipped.filter((t) => !taskCompletion[t.id]);
  const sortedUncompleted = [...uncompleted].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const earliest = sortedUncompleted[0];

  const nextTask = earliest
    ? {
        title: earliest.title,
        dueLabel: formatDateLong(earliest.dueDate, locale),
      }
    : null;

  return {
    daysLabel,
    dateLabel,
    totalBudgetLabel,
    perGuestLabel,
    tasksDone,
    tasksTotal,
    completionPct,
    nextTask,
  };
}
