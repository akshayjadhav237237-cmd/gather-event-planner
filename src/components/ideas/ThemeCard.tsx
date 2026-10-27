import type { FC } from 'react';
import type { ThemeConcept } from '../../types/event';
import { Card } from '../ui/Card';

export interface ThemeCardProps {
  theme: ThemeConcept;
}

export const ThemeCard: FC<ThemeCardProps> = ({ theme }) => {
  return (
    <Card as="article" padding="md" className="flex flex-col justify-between h-full">
      <div className="space-y-2">
        <h4 className="font-serif text-lg text-ink font-normal">{theme.title}</h4>
        <p className="text-sm text-ink-soft leading-relaxed">{theme.summary}</p>
        <div className="pt-1 text-xs text-muted leading-relaxed">
          <span className="font-medium text-ink-soft">Why it fits: </span>
          {theme.whyItFits}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center gap-3">
        {theme.colorPalette.map((hex, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <svg
              className="w-6 h-6 shrink-0 rounded-full"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="11"
                fill={hex}
                stroke="currentColor"
                className="text-line"
                strokeWidth="1"
              />
            </svg>
            <span className="tabular-nums font-mono text-xs text-muted">{hex}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
