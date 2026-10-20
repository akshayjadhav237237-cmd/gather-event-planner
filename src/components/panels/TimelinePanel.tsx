import type { PanelProps } from './types';
import { Card } from '../ui/Card';

export function TimelinePanel({ bundle }: PanelProps) {
  return (
    <Card padding="lg" aria-labelledby="timeline-panel-title">
      <div className="space-y-4">
        <h2 id="timeline-panel-title" className="font-serif text-2xl text-ink">
          Timeline & Checklist ({bundle.timeline.tasks.length} tasks)
        </h2>
        <p className="text-sm text-muted">
          This section is being built.
        </p>
      </div>
    </Card>
  );
}
