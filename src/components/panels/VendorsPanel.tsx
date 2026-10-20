import type { PlanBundle } from '../../types/engine';
import { Card } from '../ui/Card';

export interface VendorsPanelProps {
  bundle: PlanBundle;
  className?: string;
}

export function VendorsPanel({ bundle, className = '' }: VendorsPanelProps) {
  return (
    <Card padding="lg" className={className} aria-labelledby="vendors-panel-title">
      <div className="space-y-4">
        <h2 id="vendors-panel-title" className="font-serif text-2xl text-ink">
          Vendor Sourcing & Guides ({bundle.vendorGuides.length} categories)
        </h2>
        <p className="text-sm text-muted">
          This section is being built.
        </p>
      </div>
    </Card>
  );
}
