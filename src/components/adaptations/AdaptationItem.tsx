import { type FC, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { ContextAdaptation, Severity } from '../../types/event';
import { MODULE_LABELS, SEVERITY_LABELS } from '../../ui/adaptationView';
import { Badge, type BadgeProps } from '../ui/Badge';

export interface AdaptationItemProps {
  adaptation: ContextAdaptation;
}

const SEVERITY_ICONS: Record<Severity, ReactNode> = {
  critical: <AlertCircle size={14} strokeWidth={1.5} aria-hidden="true" />,
  warning: <AlertTriangle size={14} strokeWidth={1.5} aria-hidden="true" />,
  info: <Info size={14} strokeWidth={1.5} aria-hidden="true" />,
};

const SEVERITY_TONES: Record<Severity, BadgeProps['tone']> = {
  critical: 'critical',
  warning: 'warning',
  info: 'neutral',
};

export const AdaptationItem: FC<AdaptationItemProps> = ({ adaptation }) => {
  const tone = SEVERITY_TONES[adaptation.severity];
  const icon = SEVERITY_ICONS[adaptation.severity];
  const severityLabel = SEVERITY_LABELS[adaptation.severity];
  const moduleLabel = MODULE_LABELS[adaptation.targetModule];

  return (
    <article className="flex flex-col gap-1.5 py-3 border-b border-line last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tone} icon={icon}>
          {severityLabel}
        </Badge>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {moduleLabel}
        </span>
      </div>
      <p className="text-sm text-ink-soft leading-relaxed">{adaptation.explanation}</p>
    </article>
  );
};
