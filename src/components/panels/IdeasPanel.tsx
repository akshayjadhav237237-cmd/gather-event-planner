import type { IdeasPanelProps } from './types';
import { Card } from '../ui/Card';

export function IdeasPanel({ bundle }: IdeasPanelProps) {
  return (
    <Card padding="lg" aria-labelledby="ideas-panel-title">
      <div className="space-y-4">
        <h2 id="ideas-panel-title" className="font-serif text-2xl text-ink">
          Personalized Creative Concepts
        </h2>
        <p className="text-sm text-muted">
          This section is being built ({bundle.context.title}).
        </p>
      </div>
    </Card>
  );
}
