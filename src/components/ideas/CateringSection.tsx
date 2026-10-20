import type { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import type { CateringIdea } from '../../types/event';
import { SECTION_LABELS } from '../../ui/ideasView';
import { Button } from '../ui/Button';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { CateringCard } from './CateringCard';

export interface CateringSectionProps {
  catering: CateringIdea[];
  onRegenerate: () => void;
  isLoading?: boolean;
}

export const CateringSection: FC<CateringSectionProps> = ({
  catering,
  onRegenerate,
  isLoading = false,
}) => {
  const label = SECTION_LABELS.cateringIdeas;

  return (
    <section className="space-y-4" aria-labelledby="ideas-catering-heading">
      <div className="flex items-center justify-between">
        <h3 id="ideas-catering-heading" className="font-serif text-xl text-ink font-normal">
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
        {catering.map((item) => (
          <CateringCard key={item.id} catering={item} />
        ))}
      </div>
      <VisuallyHidden role="status">{label} updated</VisuallyHidden>
    </section>
  );
};
