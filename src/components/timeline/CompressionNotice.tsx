import type { FC } from 'react';
import type { ContextSignals } from '../../types/engine';
import type { TimelinePlan } from '../../types/event';
import { AlertCard } from '../shared/AlertCard';

export interface CompressionNoticeProps {
  timeline: TimelinePlan;
  signals: ContextSignals;
}

export const CompressionNotice: FC<CompressionNoticeProps> = ({ timeline, signals }) => {
  if (!timeline.isCompressed) {
    return null;
  }

  if (signals.isPast) {
    return (
      <AlertCard tone="critical" title="Event date has passed">
        <p>
          The selected event date is in the past. Please update the celebration date to receive an
          active planning timeline and milestone schedule.
        </p>
      </AlertCard>
    );
  }

  const dayWord = timeline.daysAvailable === 1 ? 'day' : 'days';

  return (
    <AlertCard tone="warning" title="Compressed planning timeline">
      <p>
        Your celebration is {timeline.daysAvailable} {dayWord} away. Optional tasks have
        been skipped and scheduling has been compressed so you can focus on the critical essentials.
      </p>
    </AlertCard>
  );
};
