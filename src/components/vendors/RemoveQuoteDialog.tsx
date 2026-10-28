import { useEffect, useRef, type FC } from 'react';
import type { VendorQuote } from '../../types/event';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

export interface RemoveQuoteDialogProps {
  quote: VendorQuote | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RemoveQuoteDialog: FC<RemoveQuoteDialogProps> = ({ quote, onConfirm, onCancel }) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (quote) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [quote]);

  return (
    <Dialog
      open={Boolean(quote)}
      onClose={onCancel}
      title="Remove this quote?"
      description={
        quote ? `Are you sure you want to remove the quote for ${quote.vendorName}?` : undefined
      }
      footer={
        <>
          <Button ref={cancelBtnRef} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Remove quote
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-soft">
        This quote will be removed from your shortlisted vendor comparisons and any committed
        totals.
      </p>
    </Dialog>
  );
};
