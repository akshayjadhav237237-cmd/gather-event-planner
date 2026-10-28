import { type FC } from 'react';
import type { ContextAdaptation } from '../../types/event';
import { summarizeAdaptations } from '../../ui/adaptationView';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Disclosure } from '../ui/Disclosure';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { AdaptationItem } from './AdaptationItem';

export interface AdaptationBannerProps {
  adaptations: ContextAdaptation[];
}

export const AdaptationBanner: FC<AdaptationBannerProps> = ({ adaptations }) => {
  const { counts, prominent, notes, announcement } = summarizeAdaptations(adaptations);

  return (
    <Card as="section" aria-labelledby="adaptations-heading" padding="md" className="space-y-4">
      <VisuallyHidden>
        <div role="status">{announcement}</div>
      </VisuallyHidden>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <h2 id="adaptations-heading" className="text-xl font-serif text-ink">
          Why your plan looks like this
        </h2>

        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Adaptation severity breakdown"
        >
          {counts.critical > 0 && <Badge tone="critical">{counts.critical} Critical</Badge>}
          {counts.warning > 0 && (
            <Badge tone="warning">
              {counts.warning} {counts.warning === 1 ? 'Warning' : 'Warnings'}
            </Badge>
          )}
          {counts.info > 0 && (
            <Badge tone="neutral">
              {counts.info} {counts.info === 1 ? 'Note' : 'Notes'}
            </Badge>
          )}
        </div>
      </div>

      {adaptations.length === 0 ? (
        <p className="text-sm text-ink-soft py-2">
          No special adaptations needed. Your plan uses the standard setup.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {prominent.length > 0 && (
            <div className="flex flex-col">
              {prominent.map((item) => (
                <AdaptationItem key={item.id} adaptation={item} />
              ))}
            </div>
          )}

          {notes.length > 0 && (
            <Disclosure
              id="adaptation-notes"
              title={`${notes.length} ${notes.length === 1 ? 'more note' : 'more notes'}`}
              defaultOpen={false}
            >
              <div className="flex flex-col">
                {notes.map((item) => (
                  <AdaptationItem key={item.id} adaptation={item} />
                ))}
              </div>
            </Disclosure>
          )}
        </div>
      )}
    </Card>
  );
};
