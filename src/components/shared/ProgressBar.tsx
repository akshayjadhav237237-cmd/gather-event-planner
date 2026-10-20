import { type FC } from 'react';

export interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  tone?: 'accent' | 'success' | 'critical';
}

const FILL_CLASSES: Record<'accent' | 'success' | 'critical', string> = {
  accent: 'fill-accent',
  success: 'fill-success',
  critical: 'fill-critical',
};

export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  max,
  label,
  tone = 'accent',
}) => {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeVal = Number.isFinite(value) && value >= 0 ? value : 0;
  const clampedVal = Math.min(safeVal, safeMax);
  const pct = Math.round((clampedVal / safeMax) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clampedVal)}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
      aria-label={label}
      className="w-full"
    >
      <svg
        className="w-full h-2 rounded-full overflow-hidden bg-sunken border border-line"
        aria-hidden="true"
      >
        <rect
          x="0"
          y="0"
          width={`${pct}%`}
          height="100%"
          className={FILL_CLASSES[tone]}
          rx="4"
        />
      </svg>
    </div>
  );
};
