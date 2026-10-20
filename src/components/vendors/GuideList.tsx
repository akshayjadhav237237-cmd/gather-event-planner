import type { FC } from 'react';
import type { VendorCategoryGuide } from '../../types/event';
import { GuideCard } from './GuideCard';

export interface GuideListProps {
  guides: readonly VendorCategoryGuide[];
}

export const GuideList: FC<GuideListProps> = ({ guides }) => {
  if (guides.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" aria-labelledby="vendor-guides-heading">
      <div className="space-y-1">
        <h3 id="vendor-guides-heading" className="text-lg font-serif text-ink font-normal">
          Vendor Category Guides
        </h3>
        <p className="text-sm text-ink-soft">
          Practical vetting checklists. Ask vendors these questions before booking.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </section>
  );
};
