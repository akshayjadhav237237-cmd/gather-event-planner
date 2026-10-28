import { useMemo, useState } from 'react';
import { CURRENCY_LOCALE } from '../../config/constants';
import { usePlanStore } from '../../store/planStore';
import { groupTasksByPhase, overallProgress } from '../../ui/timelineView';
import { VolunteerPlanner } from '../calculators/VolunteerPlanner';
import { EmptyState } from '../shared/EmptyState';
import { ProgressBar } from '../shared/ProgressBar';
import { SectionHeader } from '../shared/SectionHeader';
import { CompressionNotice } from '../timeline/CompressionNotice';
import { PhaseGroup } from '../timeline/PhaseGroup';
import { RunOfShow } from '../timeline/RunOfShow';
import { SkippedTasks } from '../timeline/SkippedTasks';
import { ChipCheckbox } from '../ui/ChipCheckbox';
import { SegmentedControl, type SegmentedControlOption } from '../ui/SegmentedControl';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import type { PanelProps } from './types';

const FILTER_OPTIONS: ReadonlyArray<SegmentedControlOption<'all' | 'todo' | 'done'>> = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'done', label: 'Done' },
];

export function TimelinePanel({ bundle, today }: PanelProps) {
  const taskCompletion = usePlanStore((s) => s.taskCompletion);
  const toggleTask = usePlanStore((s) => s.toggleTask);

  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [showReasons, setShowReasons] = useState<boolean>(false);

  const locale = CURRENCY_LOCALE[bundle.context.currency] ?? 'en-US';
  const progress = useMemo(
    () => overallProgress(bundle.timeline.tasks, taskCompletion),
    [bundle.timeline.tasks, taskCompletion]
  );
  const progressTone = progress.pct === 100 ? 'success' : 'accent';
  const progressLabel = `${progress.done} of ${progress.total} tasks completed (${progress.pct}%)`;

  const groups = useMemo(
    () => groupTasksByPhase(bundle.timeline.tasks, taskCompletion, filter, today),
    [bundle.timeline.tasks, taskCompletion, filter, today]
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Timeline"
        title="What to do, and when"
        description="Every milestone is anchored to your celebration date. Check off items as you complete them."
        headingId="timeline-panel-heading"
      />

      <CompressionNotice timeline={bundle.timeline} signals={bundle.signals} />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Checklist progress</span>
          <span className="tabular-nums font-medium text-ink">
            {progress.done} of {progress.total} ({progress.pct}%)
          </span>
        </div>
        <ProgressBar
          value={progress.done}
          max={Math.max(1, progress.total)}
          tone={progressTone}
          label={progressLabel}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <SegmentedControl
          name="timeline-task-filter"
          legend="Task filter"
          hideLegend
          value={filter}
          options={FILTER_OPTIONS}
          onChange={(val) => setFilter(val)}
        />
        <ChipCheckbox
          id="toggle-show-reasons"
          label="Show reasons"
          checked={showReasons}
          onChange={setShowReasons}
        />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="No tasks to display"
          description={
            filter === 'todo'
              ? 'All tasks in this view are completed! Great job.'
              : filter === 'done'
                ? 'No completed tasks yet. Check off items as you finish them.'
                : 'No tasks scheduled for this celebration.'
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <PhaseGroup
              key={group.phase}
              phase={group.phase}
              items={group.items}
              doneCount={group.doneCount}
              totalCount={group.totalCount}
              locale={locale}
              showReasons={showReasons}
              onToggle={toggleTask}
            />
          ))}
        </div>
      )}

      <SkippedTasks tasks={bundle.timeline.tasks} />

      <RunOfShow slots={bundle.timeline.runOfShow} />

      {bundle.context.eventType === 'community' && (
        <VolunteerPlanner guestCount={bundle.context.guestCount} />
      )}

      <VisuallyHidden role="status">
        {progress.done} of {progress.total} tasks done
      </VisuallyHidden>
    </div>
  );
}
