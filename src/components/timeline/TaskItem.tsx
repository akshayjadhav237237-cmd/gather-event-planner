import type { FC } from 'react';
import type { TimelineTask } from '../../types/event';
import { formatDateShort } from '../../ui/formatDate';
import type { TaskStatus } from '../../ui/timelineView';
import { Badge } from '../ui/Badge';

export interface TaskItemProps {
  task: TimelineTask;
  done: boolean;
  status: TaskStatus;
  waitingOn: string[];
  locale: string;
  showReasons: boolean;
  onToggle: (taskId: string) => void;
}

export const TaskItem: FC<TaskItemProps> = ({
  task,
  done,
  status,
  waitingOn,
  locale,
  showReasons,
  onToggle,
}) => {
  const inputId = `task-${task.id}`;
  const titleClass = done
    ? 'text-sm line-through text-muted cursor-pointer select-none block'
    : 'text-sm font-medium text-ink cursor-pointer select-none block';

  return (
    <div className="flex items-start gap-3 py-3 px-2 rounded-control hover:bg-sunken transition-colors duration-150">
      <input
        type="checkbox"
        id={inputId}
        checked={done}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 mt-0.5 rounded border-line-control text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus cursor-pointer shrink-0"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <label htmlFor={inputId} className={titleClass}>
          {task.title}
        </label>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>Due {formatDateShort(task.dueDate, locale)}</span>
          {status === 'overdue' && <Badge tone="critical">Overdue</Badge>}
          {status === 'dueSoon' && <Badge tone="warning">Due soon</Badge>}
          {task.priority === 'critical' && <Badge tone="critical">Critical</Badge>}
          {task.priority === 'high' && <Badge tone="warning">High</Badge>}
        </div>
        {waitingOn.length > 0 && (
          <p className="text-xs text-muted">Waiting on: {waitingOn.join(', ')}</p>
        )}
        {showReasons && Boolean(task.rationale) && (
          <p className="text-xs text-ink-soft leading-relaxed pt-0.5">{task.rationale}</p>
        )}
      </div>
    </div>
  );
};
