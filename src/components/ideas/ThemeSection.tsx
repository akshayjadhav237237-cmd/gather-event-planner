import type { FC } from 'react';
import type { ThemeConcept } from '../../types/event';
import { SECTION_LABELS } from '../../ui/ideasView';
import { IdeaSectionLayout } from './IdeaSectionLayout';
import { ThemeCard } from './ThemeCard';

export interface ThemeSectionProps {
  themes: ThemeConcept[];
  onRegenerate: () => void;
  isLoading?: boolean;
}

export const ThemeSection: FC<ThemeSectionProps> = ({
  themes,
  onRegenerate,
  isLoading = false,
}) => (
  <IdeaSectionLayout
    headingId="ideas-theme-heading"
    label={SECTION_LABELS.themeConcepts}
    onRegenerate={onRegenerate}
    isLoading={isLoading}
  >
    {themes.map((theme) => (
      <ThemeCard key={theme.id} theme={theme} />
    ))}
  </IdeaSectionLayout>
);
