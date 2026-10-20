import { type FC, type ReactNode } from 'react';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  headingId?: string;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  action,
  headingId,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-line">
      <div className="space-y-1">
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-muted font-semibold">
            {eyebrow}
          </p>
        )}
        <h2
          id={headingId}
          className="font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal"
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
};
