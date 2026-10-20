import type { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import type { BespokeTask } from '../../types/event';
import { SECTION_LABELS } from '../../ui/ideasView';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { VisuallyHidden } from '../ui/VisuallyHidden';

export interface BespokeSectionProps {
  tasks: BespokeTask[];
  onRegenerate: () => void;
  isLoading?: boolean;
}

export const BespokeSection: FC<BespokeSectionProps> = ({
  tasks,
  onRegenerate,
  isLoading = false,
}) => {
  const label = SECTION_LABELS.bespokeTasks;

  return (
    <section className="space-y-4" aria-labelledby="ideas-bespoke-heading">
      <div className="flex items-center justify-between">
        <h3 id="ideas-bespoke-heading" className="font-serif text-xl text-ink font-normal">
          Bespoke Tasks
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task, idx) => (
          <Card key={idx} as="article" padding="sm" className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-ink leading-snug">{task.title}</h4>
              <Badge tone="neutral" className="shrink-0">
                {task.phase}
              </Badge>
            </div>
            <p className="text-xs text-muted leading-relaxed">{task.rationale}</p>
          </Card>
        ))}
      </div>
      <VisuallyHidden role="status">{label} updated</VisuallyHidden>
    </section>
  );
};
