import { useState } from 'react';
import type { PanelProps } from './types';
import type { VendorQuote } from '../../types/event';
import { usePlanStore } from '../../store/planStore';
import { SectionHeader } from '../shared/SectionHeader';
import {
  CommitmentSummary,
  GuideList,
  QuoteForm,
  QuoteList,
  RemoveQuoteDialog,
} from '../vendors';

export function VendorsPanel({ bundle }: PanelProps) {
  const vendorQuotes = usePlanStore((s) => s.vendorQuotes);
  const upsertQuote = usePlanStore((s) => s.upsertQuote);
  const removeQuote = usePlanStore((s) => s.removeQuote);

  const [editingQuote, setEditingQuote] = useState<VendorQuote | null>(null);
  const [quoteToRemove, setQuoteToRemove] = useState<VendorQuote | null>(null);

  const handleSave = (quote: VendorQuote) => {
    upsertQuote(quote);
    setEditingQuote(null);
  };

  const handleCancelEdit = () => {
    setEditingQuote(null);
  };

  const handleConfirmRemove = () => {
    if (quoteToRemove) {
      removeQuote(quoteToRemove.id);
      setQuoteToRemove(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Vendors"
        title="Choose with confidence"
        description="Guidance is generic. Gather never invents vendors, prices or contact details. Add the quotes you collect."
        headingId="vendors-panel-heading"
      />

      <CommitmentSummary
        quotes={vendorQuotes}
        currency={bundle.context.currency}
      />

      <GuideList guides={bundle.vendorGuides} />

      <QuoteForm
        guides={bundle.vendorGuides}
        editingQuote={editingQuote}
        onSave={handleSave}
        onCancel={editingQuote ? handleCancelEdit : undefined}
      />

      <QuoteList
        quotes={vendorQuotes}
        guides={bundle.vendorGuides}
        breakdown={bundle.budget}
        onEditQuote={setEditingQuote}
        onRemoveQuote={setQuoteToRemove}
      />

      <RemoveQuoteDialog
        quote={quoteToRemove}
        onConfirm={handleConfirmRemove}
        onCancel={() => setQuoteToRemove(null)}
      />
    </div>
  );
}
