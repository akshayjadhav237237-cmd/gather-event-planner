import type { FC } from 'react';
import type { TimelineTask } from '../../types/event';
import { skippedTasks } from '../../ui/timelineView';
import { Disclosure } from '../ui/Disclosure';

export interface SkippedTasksProps {
  tasks: readonly TimelineTask[];
}

export const SkippedTasks: FC<SkippedTasksProps> = ({ tasks }) => {
  const skipped = skippedTasks(tasks);

  if (skipped.length === 0) {
    return null;
  }

  return (
    <Disclosure
      id="skipped-tasks"
      title={`Skipped to fit your timeline (${skipped.length})`}
      summary="Optional long-lead tasks omitted to fit the compressed schedule"
    >
      <ul className="divide-y divide-line pt-1">
        {skipped.map((task) => (
          <li key={task.id} className="py-2.5 space-y-0.5">
            <p className="text-sm font-medium text-ink-soft">{task.title}</p>
            {task.rationale && (
              <p className="text-xs text-muted leading-relaxed">{task.rationale}</p>
            )}
          </li>
        ))}
      </ul>
    </Disclosure>
  );
};
