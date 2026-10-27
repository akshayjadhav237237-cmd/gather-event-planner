import type { FC } from 'react';
import type { ActivityIdea } from '../../types/event';
import { SECTION_LABELS } from '../../ui/ideasView';
import { ActivityCard } from './ActivityCard';
import { IdeaSectionLayout } from './IdeaSectionLayout';

export interface ActivitySectionProps {
  activities: ActivityIdea[];
  onRegenerate: () => void;
  isLoading?: boolean;
}

export const ActivitySection: FC<ActivitySectionProps> = ({
  activities,
  onRegenerate,
  isLoading = false,
}) => (
  <IdeaSectionLayout
    headingId="ideas-activity-heading"
    label={SECTION_LABELS.activityIdeas}
    onRegenerate={onRegenerate}
    isLoading={isLoading}
  >
    {activities.map((item) => (
      <ActivityCard key={item.id} activity={item} />
    ))}
  </IdeaSectionLayout>
);
