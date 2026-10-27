import type { FC } from 'react';
import type { CateringIdea } from '../../types/event';
import { SECTION_LABELS } from '../../ui/ideasView';
import { CateringCard } from './CateringCard';
import { IdeaSectionLayout } from './IdeaSectionLayout';

export interface CateringSectionProps {
  catering: CateringIdea[];
  onRegenerate: () => void;
  isLoading?: boolean;
}

export const CateringSection: FC<CateringSectionProps> = ({
  catering,
  onRegenerate,
  isLoading = false,
}) => (
  <IdeaSectionLayout
    headingId="ideas-catering-heading"
    label={SECTION_LABELS.cateringIdeas}
    onRegenerate={onRegenerate}
    isLoading={isLoading}
  >
    {catering.map((item) => (
      <CateringCard key={item.id} catering={item} />
    ))}
  </IdeaSectionLayout>
);
