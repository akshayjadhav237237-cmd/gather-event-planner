import { type FC, memo } from 'react';
import type { TimelineTask } from '../../types/event';
import type { TaskStatus } from '../../ui/timelineView';
import { TaskItem } from './TaskItem';

export interface PhaseGroupProps {
  phase: string;
  items: Array<{
    task: TimelineTask;
    done: boolean;
    status: TaskStatus;
    waitingOn: string[];
  }>;
  doneCount: number;
  totalCount: number;
  locale: string;
  showReasons: boolean;
  onToggle: (taskId: string) => void;
}

export const PhaseGroup: FC<PhaseGroupProps> = memo(
  ({ phase, items, doneCount, totalCount, locale, showReasons, onToggle }) => {
    const headingId = `phase-heading-${phase.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return (
      <section className="space-y-2" aria-labelledby={headingId}>
        <h3
          id={headingId}
          className="text-base font-semibold text-ink flex items-center justify-between border-b border-line pb-2"
        >
          <span>{phase}</span>
          <span className="text-xs font-normal text-muted tabular-nums">
            {doneCount} of {totalCount} done
          </span>
        </h3>
        <ul className="divide-y divide-line">
          {items.map(({ task, done, status, waitingOn }) => (
            <li key={task.id}>
              <TaskItem
                task={task}
                done={done}
                status={status}
                waitingOn={waitingOn}
                locale={locale}
                showReasons={showReasons}
                onToggle={onToggle}
              />
            </li>
          ))}
        </ul>
      </section>
    );
  }
);

PhaseGroup.displayName = 'PhaseGroup';
