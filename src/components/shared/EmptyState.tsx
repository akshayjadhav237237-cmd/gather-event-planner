import { type FC, type ReactNode } from 'react';
import { Card } from '../ui/Card';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <Card padding="lg" className="text-center flex flex-col items-center justify-center gap-3">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="text-sm text-muted max-w-md leading-relaxed">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </Card>
  );
};
