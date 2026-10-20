import type { Severity } from '../types/event';
import type { BadgeProps } from '../components/ui/Badge';

export type AlertTone = 'info' | 'warning' | 'critical' | 'success';

export const SEVERITY_BADGE_TONES: Record<Severity, BadgeProps['tone']> = {
  critical: 'critical',
  warning: 'warning',
  info: 'neutral',
};

export const SEVERITY_TO_ALERT_TONE: Record<Severity, AlertTone> = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
};

export const TONE_PREFIX: Record<AlertTone, string> = {
  critical: 'Critical:',
  warning: 'Warning:',
  info: 'Information:',
  success: 'Success:',
};
