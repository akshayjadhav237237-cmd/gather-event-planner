import type { FC, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { VisuallyHidden } from '../ui/VisuallyHidden';

export interface IdeaSectionLayoutProps {
  headingId: string;
  label: string;
  onRegenerate: () => void;
  isLoading?: boolean;
  children: ReactNode;
}

export const IdeaSectionLayout: FC<IdeaSectionLayoutProps> = ({
  headingId,
  label,
  onRegenerate,
  isLoading = false,
  children,
}) => {
  return (
    <section className="space-y-4" aria-labelledby={headingId}>
      <div className="flex items-center justify-between">
        <h3 id={headingId} className="font-serif text-xl text-ink font-normal">
          {label}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          aria-label={`Regenerate ${label}`}
          icon={
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          }
        >
          Regenerate
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
      <VisuallyHidden role="status">{label} updated</VisuallyHidden>
    </section>
  );
};
