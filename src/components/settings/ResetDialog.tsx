import { useEffect, useRef, type FC } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

export interface ResetDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetDialog: FC<ResetDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Delay slightly or next microtask to let dialog showModal mount
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <div className="flex items-center gap-2 justify-end w-full">
      <Button ref={cancelBtnRef} variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleConfirm}
        className="bg-critical hover:bg-critical text-surface border-transparent"
      >
        Clear everything
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Clear everything on this device?"
      footer={footer}
    >
      <div className="flex flex-col gap-3 text-sm text-ink-soft">
        <p>This will reset all data stored in your browser:</p>
        <ul className="list-disc pl-5 space-y-1.5 text-ink-soft">
          <li>Your event configuration and guest parameters</li>
          <li>Task checklist progress and day-of schedules</li>
          <li>Entered vendor quotes and tracked actual spending</li>
          <li>Generated personalized ideas</li>
          <li>Any saved Gemini API key</li>
        </ul>
      </div>
    </Dialog>
  );
};
