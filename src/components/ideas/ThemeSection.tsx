import type { FC } from 'react';
import { RefreshCw } from 'lucide-react';
import type { ThemeConcept } from '../../types/event';
import { SECTION_LABELS } from '../../ui/ideasView';
import { Button } from '../ui/Button';
import { VisuallyHidden } from '../ui/VisuallyHidden';
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
}) => {
  const label = SECTION_LABELS.themeConcepts;

  return (
    <section className="space-y-4" aria-labelledby="ideas-theme-heading">
      <div className="flex items-center justify-between">
        <h3 id="ideas-theme-heading" className="font-serif text-xl text-ink font-normal">
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
        {themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>
      <VisuallyHidden role="status">{label} updated</VisuallyHidden>
    </section>
  );
};
