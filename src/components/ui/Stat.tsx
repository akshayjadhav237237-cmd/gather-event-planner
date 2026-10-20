import { type HTMLAttributes, type ReactNode } from 'react';

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}

export function Stat({
  label,
  value,
  sub,
  className = '',
  ...props
}: StatProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()} {...props}>
      <span className="text-xs uppercase tracking-wider text-muted font-semibold">
        {label}
      </span>
      <span className="font-serif text-2xl tabular-nums text-ink font-normal">
        {value}
      </span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}
