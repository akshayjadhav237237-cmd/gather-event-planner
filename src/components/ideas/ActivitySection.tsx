import type { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import type { ActivityIdea } from '../../types/event';
import { SECTION_LABELS } from '../../ui/ideasView';
import { Button } from '../ui/Button';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { ActivityCard } from './ActivityCard';

export interface ActivitySectionProps {
  activities: ActivityIdea[];
  onRegenerate: () => void;
  isLoading?: boolean;
}

export const ActivitySection: FC<ActivitySectionProps> = ({
  activities,
  onRegenerate,
  isLoading = false,
}) => {
  const label = SECTION_LABELS.activityIdeas;

  return (
    <section className="space-y-4" aria-labelledby="ideas-activity-heading">
      <div className="flex items-center justify-between">
        <h3 id="ideas-activity-heading" className="font-serif text-xl text-ink font-normal">
          {label}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          aria-label={`Regenerate ${label}`}
          icon={
            <RefreshCw
              size={14}
              className={isLoading ? 'animate-spin' : ''}
              aria-hidden="true"
            />
          }
        >
          Regenerate
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activities.map((item) => (
          <ActivityCard key={item.id} activity={item} />
        ))}
      </div>
      <VisuallyHidden role="status">{label} updated</VisuallyHidden>
    </section>
  );
};
