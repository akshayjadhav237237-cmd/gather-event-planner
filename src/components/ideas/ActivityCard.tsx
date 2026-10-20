import type { FC } from 'react';
import { Shield } from 'lucide-react';
import type { ActivityIdea } from '../../types/event';
import { Card } from '../ui/Card';

export interface ActivityCardProps {
  activity: ActivityIdea;
}

export const ActivityCard: FC<ActivityCardProps> = ({ activity }) => {
  return (
    <Card as="article" padding="md" className="flex flex-col justify-between h-full">
      <div className="space-y-2">
        <h4 className="font-serif text-lg text-ink font-normal">{activity.title}</h4>
        <p className="text-sm text-ink-soft leading-relaxed">{activity.summary}</p>
        <div className="pt-1 text-xs text-muted leading-relaxed">
          <span className="font-medium text-ink-soft">Why it fits: </span>
          {activity.whyItFits}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-line space-y-2">
        {activity.audienceFit ? (
          <div className="text-xs text-muted leading-relaxed">
            <span className="font-medium text-ink-soft">Audience: </span>
            {activity.audienceFit}
          </div>
        ) : null}
        {activity.safetyNote ? (
          <div className="flex items-start gap-1.5 text-xs text-ink-soft">
            <Shield size={14} className="shrink-0 mt-0.5 text-info" aria-hidden="true" />
            <span>{activity.safetyNote}</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
};
