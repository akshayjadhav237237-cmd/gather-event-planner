import { type HTMLAttributes, type ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'info' | 'warning' | 'critical' | 'success';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, className = '', ...props }: BadgeProps) {
  const toneStyles = {
    neutral: 'bg-sunken text-ink-soft',
    accent: 'bg-accent-soft text-accent-deep',
    info: 'bg-info-soft text-info',
    warning: 'bg-warning-soft text-warning',
    critical: 'bg-critical-soft text-critical',
    success: 'bg-success-soft text-success',
  }[tone];

  const badgeClass = [
    'rounded-full text-xs font-medium px-2.5 py-1 inline-flex items-center gap-1.5',
    toneStyles,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClass} {...props}>
      {icon}
      {children}
    </span>
  );
}
