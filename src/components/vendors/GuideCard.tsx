import type { FC } from 'react';
import type { VendorCategoryGuide } from '../../types/event';
import { Disclosure } from '../ui/Disclosure';

export interface GuideCardProps {
  guide: VendorCategoryGuide;
}

export const GuideCard: FC<GuideCardProps> = ({ guide }) => {
  return (
    <Disclosure
      id={`guide-${guide.id}`}
      title={guide.name}
      summary={`${guide.questions.length} questions, ${guide.requiredChecks.length} checks`}
    >
      <div className="space-y-4 pt-2">
        <p className="text-sm text-ink-soft leading-relaxed">{guide.scope}</p>

        {guide.questions.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Questions to ask
            </h4>
            <ul className="list-disc pl-5 text-sm text-ink-soft space-y-1">
              {guide.questions.map((question, idx) => (
                <li key={idx}>{question}</li>
              ))}
            </ul>
          </div>
        )}

        {guide.requiredChecks.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Check before you book
            </h4>
            <ul className="list-disc pl-5 text-sm text-ink-soft space-y-1">
              {guide.requiredChecks.map((check, idx) => (
                <li key={idx}>{check}</li>
              ))}
            </ul>
          </div>
        )}

        {guide.contractWatchouts.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Contract watch-outs
            </h4>
            <ul className="list-disc pl-5 text-sm text-ink-soft space-y-1">
              {guide.contractWatchouts.map((watchout, idx) => (
                <li key={idx}>{watchout}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Disclosure>
  );
};
