import { type FC, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { type AlertTone, TONE_PREFIX } from '../../ui/severityStyle';
import { VisuallyHidden } from '../ui/VisuallyHidden';

export interface AlertCardProps {
  tone: AlertTone;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

const TONE_CONTAINER_CLASSES: Record<AlertTone, string> = {
  info: 'bg-info-soft border border-line text-ink',
  warning: 'bg-warning-soft border border-line text-ink',
  critical: 'bg-critical-soft border border-line text-ink',
  success: 'bg-success-soft border border-line text-ink',
};

const TONE_ICON_CLASSES: Record<AlertTone, string> = {
  info: 'text-info',
  warning: 'text-warning',
  critical: 'text-critical',
  success: 'text-success',
};

function renderToneIcon(tone: AlertTone): ReactNode {
  switch (tone) {
    case 'critical':
      return <AlertCircle size={18} strokeWidth={1.5} aria-hidden="true" />;
    case 'warning':
      return <AlertTriangle size={18} strokeWidth={1.5} aria-hidden="true" />;
    case 'success':
      return <CheckCircle2 size={18} strokeWidth={1.5} aria-hidden="true" />;
    case 'info':
    default:
      return <Info size={18} strokeWidth={1.5} aria-hidden="true" />;
  }
}

export const AlertCard: FC<AlertCardProps> = ({ tone, title, children, actions }) => {
  return (
    <aside
      className={`rounded-card p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5 ${TONE_CONTAINER_CLASSES[tone]}`}
    >
      <span className={`shrink-0 mt-0.5 ${TONE_ICON_CLASSES[tone]}`}>
        {renderToneIcon(tone)}
      </span>
      <div className="flex-1 space-y-1.5">
        <h3 className="text-sm font-semibold text-ink leading-snug">
          <VisuallyHidden>{TONE_PREFIX[tone]} </VisuallyHidden>
          {title}
        </h3>
        {children && <div className="text-sm text-ink-soft leading-relaxed">{children}</div>}
        {actions && <div className="pt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </aside>
  );
};
