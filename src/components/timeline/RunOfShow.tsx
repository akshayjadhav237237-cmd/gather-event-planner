import type { FC } from 'react';
import type { RunOfShowSlot } from '../../types/event';
import { formatSlotRange } from '../../ui/runOfShowView';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

export interface RunOfShowProps {
  slots: readonly RunOfShowSlot[];
}

export const RunOfShow: FC<RunOfShowProps> = ({ slots }) => {
  if (slots.length === 0) {
    return null;
  }

  return (
    <Card padding="md">
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-ink">Day-of schedule</h3>
          <p className="text-xs text-muted">
            Multi-day events reflect the primary celebration day schedule.
          </p>
        </div>
        <ol className="divide-y divide-line">
          {slots.map((slot, index) => {
            const key = `${slot.startTime}-${slot.activity}-${index}`;
            return (
              <li
                key={key}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm tabular-nums font-medium text-ink min-w-[100px] shrink-0">
                    {formatSlotRange(slot.startTime, slot.durationMin)}
                  </span>
                  <span className="text-sm text-ink truncate">{slot.activity}</span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <Badge tone="neutral">{slot.owner}</Badge>
                  {slot.bufferMin > 0 && (
                    <span className="text-xs text-muted tabular-nums">
                      +{slot.bufferMin} min buffer
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
};
