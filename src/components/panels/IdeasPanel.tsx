import type { PlanBundle } from '../../types/engine';
import { Card } from '../ui/Card';

export interface IdeasPanelProps {
  bundle: PlanBundle;
  className?: string;
}

export function IdeasPanel({ bundle, className = '' }: IdeasPanelProps) {
  return (
    <Card padding="lg" className={className} aria-labelledby="ideas-panel-title">
      <div className="space-y-4">
        <h2 id="ideas-panel-title" className="font-serif text-2xl text-ink">
          Personalized Creative Concepts ({bundle.context.title})
        </h2>
        <p className="text-sm text-muted">
          This section is being built.
        </p>
      </div>
    </Card>
  );
}
