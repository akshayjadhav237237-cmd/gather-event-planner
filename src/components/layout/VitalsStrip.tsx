import type { PlanBundle } from '../../types/engine';
import { computeVitals } from '../../ui/vitals';
import { Card } from '../ui/Card';
import { Stat } from '../ui/Stat';

export interface VitalsStripProps {
  bundle: PlanBundle;
  taskCompletion: Record<string, boolean>;
  className?: string;
}

export function VitalsStrip({
  bundle,
  taskCompletion,
  className = '',
}: VitalsStripProps) {
  const {
    daysLabel,
    dateLabel,
    totalBudgetLabel,
    perGuestLabel,
    tasksDone,
    tasksTotal,
    completionPct,
    nextTask,
  } = computeVitals(bundle, taskCompletion);

  return (
    <Card padding="md" className={className} aria-labelledby="vitals-heading">
      <h2 id="vitals-heading" className="sr-only">
        Event Vitals
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line">
        <Stat
          label="Countdown"
          value={daysLabel}
          sub={dateLabel}
          className="lg:pr-6"
        />
        <Stat
          label="Budget"
          value={totalBudgetLabel}
          sub={perGuestLabel}
          className="lg:px-6"
        />
        <Stat
          label="Tasks"
          value={`${tasksDone}/${tasksTotal}`}
          sub={`${completionPct}% completed`}
          className="lg:px-6"
        />
        <Stat
          label="Next up"
          value={
            <span className="truncate block" title={nextTask ? nextTask.title : 'All caught up'}>
              {nextTask ? nextTask.title : 'All caught up'}
            </span>
          }
          sub={nextTask ? `Due ${nextTask.dueLabel}` : 'No pending tasks'}
          className="lg:pl-6"
        />
      </div>
    </Card>
  );
}
