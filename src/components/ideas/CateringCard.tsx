import type { FC } from 'react';
import { AlertCircle, ArrowRightLeft } from 'lucide-react';
import type { CateringIdea } from '../../types/event';
import { Card } from '../ui/Card';

export interface CateringCardProps {
  catering: CateringIdea;
}

export const CateringCard: FC<CateringCardProps> = ({ catering }) => {
  return (
    <Card as="article" padding="md" className="flex flex-col justify-between h-full">
      <div className="space-y-2">
        <h4 className="font-serif text-lg text-ink font-normal">{catering.title}</h4>
        <p className="text-sm text-ink-soft leading-relaxed">{catering.summary}</p>
        <div className="pt-1 text-xs text-muted leading-relaxed">
          <span className="font-medium text-ink-soft">Why it fits: </span>
          {catering.whyItFits}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-line space-y-2">
        {catering.allergySafetyNote ? (
          <div className="flex items-start gap-1.5 text-xs text-ink-soft">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-warning" aria-hidden="true" />
            <span>{catering.allergySafetyNote}</span>
          </div>
        ) : null}
        {catering.budgetSwapIdea ? (
          <div className="flex items-start gap-1.5 text-xs text-muted">
            <ArrowRightLeft size={14} className="shrink-0 mt-0.5 text-muted" aria-hidden="true" />
            <span>{catering.budgetSwapIdea}</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
};
